"""Hermetic regression checks for the LL2 v2.3 refresh scripts.

No network, no edits to live ORBITA files; mocks use the real site's mapping
and a private copy of the original JSON for integration tests.
"""
import contextlib
import copy
import datetime
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import ll2_compat
import refresh_landings
import refresh_upcoming


def page_item(item_id, *, name='Long March 4B | Test Mission',
              net='2026-11-24T12:35:00Z', lsp='Other Operator',
              loc='Jiuquan Satellite Launch Center, People\'s Republic of China',
              pad='Launch Complex 5'):
    return {'id': item_id, 'net': net, 'name': name,
            'status': {'abbrev': 'Go'},
            'net_precision': {'name': 'Minute'},
            'launch_service_provider': {'name': lsp},
            'mission': {'name': name.split(' | ')[-1],
                        'type': 'Communications',
                        'orbit': {'name': 'Low Earth Orbit'}},
            'pad': {'name': pad, 'location': {'name': loc}},
            'rocket': {'configuration': {'full_name': name.split(' | ')[0]}}}


class LL2Compatibility(unittest.TestCase):
    def test_v23_normal_shape(self):
        raw = page_item('abc')
        result = ll2_compat.normalize_launch(raw)
        self.assertEqual(result['location'], raw['pad']['location']['name'])
        self.assertEqual(result['mission'], 'Test Mission')
        self.assertEqual(result['lsp_name'], 'Other Operator')
        self.assertEqual(result['pad'], 'Launch Complex 5')
        self.assertEqual(result['rocket_name'], 'Long March 4B')
        self.assertIsInstance(raw['mission'], dict, 'no mutation')

    def test_bad_payload_blocked(self):
        with self.assertRaises(ValueError):
            ll2_compat.normalize_page({'results': None})
        with self.assertRaises(ValueError):
            ll2_compat.normalize_page({'results': [{'name': 'bad'}]})

    def test_precision_second(self):
        x = refresh_upcoming.fmt_timing('2026-11-24T12:35:00Z', 'Second')
        self.assertEqual(x['precision'], 'day')
        self.assertIn('12:35', x['time_en'])

    def test_landing_detail_structure(self):
        landing = {'attempt': True, 'landing_location': {'abbrev': 'OCISLY'},
                   'type': {'abbrev': 'ASDS'}}
        data = {'rocket': {'launcher_stage': [{'landing': landing,
                                              'launcher': {'serial_number': 'B1234'}}]}}
        result, booster = refresh_landings.landing_of(data)
        self.assertEqual(result['landing_location']['abbrev'], 'OCISLY')
        self.assertEqual(booster['serial_number'], 'B1234')

    def test_launch_refresh_apply_with_mocked_v23(self):
        # Ensure the guard sees an authentic set of existing IDs. Add one new
        # valid mission and 199 simulated normal-mode records in two pages.
        source = json.loads((ROOT / 'data/upcoming.json').read_text(encoding='utf-8'))
        rows = source['launches']
        feed = []
        for row in rows:
            if str(row.get('ll2_id', '')).startswith('manual-'):
                continue
            feed.append(page_item(row['ll2_id'], name=row['rocket_en'] + ' | ' + row['payload_en'],
                                  net=row['net']))
        new_id = 'eeeeeeee-1111-2222-3333-444444444444'
        future = (datetime.date.today() + datetime.timedelta(days=6)).isoformat() + 'T12:35:00Z'
        feed.append(page_item(new_id, net=future))
        while len(feed) < 200:
            feed.append(page_item('unused-%03d' % len(feed),
                                  net='2028-12-01T12:35:00Z'))
        with tempfile.TemporaryDirectory() as tmp:
            data = Path(tmp) / 'upcoming.json'
            data.write_text(json.dumps(source, ensure_ascii=False), encoding='utf-8')
            with patch.object(refresh_upcoming, 'DATA', str(data)), \
                 patch.object(refresh_upcoming, 'fetch', side_effect=[
                     {'results': feed[:100]}, {'results': feed[100:200]}]), \
                 patch.object(sys, 'argv', ['refresh_upcoming.py', '--apply']), \
                 contextlib.redirect_stdout(io.StringIO()):
                refresh_upcoming.main()
            result = json.loads(data.read_text(encoding='utf-8'))
            self.assertTrue(any(x['ll2_id'] == new_id for x in result['launches']))
            self.assertTrue(any(str(x.get('ll2_id', '')).startswith('manual-') for x in result['launches']))
            self.assertEqual(len(result['site_notes']), len(source['site_notes']))
            self.assertGreaterEqual(result['window_end'], source['window_end'])

    def test_launch_network_error_never_writes(self):
        source = (ROOT / 'data/upcoming.json').read_bytes()
        with tempfile.TemporaryDirectory() as tmp:
            data = Path(tmp) / 'upcoming.json'
            data.write_bytes(source)
            with patch.object(refresh_upcoming, 'DATA', str(data)), \
                 patch.object(refresh_upcoming, 'fetch', side_effect=OSError('offline')), \
                 patch.object(sys, 'argv', ['refresh_upcoming.py', '--apply']), \
                 contextlib.redirect_stdout(io.StringIO()):
                with self.assertRaises(SystemExit) as ctx:
                    refresh_upcoming.main()
            self.assertNotEqual(ctx.exception.code, 0)
            self.assertEqual(data.read_bytes(), source)

    def test_landing_refresh_apply_with_mocked_v23(self):
        source = json.loads((ROOT / 'data/upcoming_landings.json').read_text(encoding='utf-8'))
        future = (datetime.date.today() + datetime.timedelta(days=6)).isoformat() + 'T12:35:00Z'
        mission_id = 'eeeeeeee-aaaa-bbbb-cccc-dddddddddddd'
        up = [page_item(mission_id, name='Falcon 9 | ORBITA Test 888', net=future, lsp='SpaceX')]
        while len(up) < 100:
            up.append(page_item('other-%03d' % len(up), net=future))
        prev = [page_item('prev-%03d' % i, name='Random | Old %d' % i) for i in range(40)]
        detail = {'pad': {'name': 'Space Launch Complex 40',
                          'location': {'name': 'Cape Canaveral SFS, FL, USA'}},
                  'rocket': {'launcher_stage': [{'launcher': {'serial_number': 'B1234', 'flights': 3},
                    'landing': {'attempt': True, 'type': {'abbrev': 'ASDS'},
                                'landing_location': {'abbrev': 'OCISLY'}}}]}}
        def mock_fetch(url):
            if 'upcoming/' in url: return {'results': up}
            if 'previous/' in url: return {'results': prev}
            if mission_id in url: return detail
            raise AssertionError('unexpected fetch URL: ' + url)
        with tempfile.TemporaryDirectory() as tmp:
            data = Path(tmp) / 'upcoming_landings.json'
            data.write_text(json.dumps(source, ensure_ascii=False), encoding='utf-8')
            with patch.object(refresh_landings, 'DATA', str(data)), \
                 patch.object(refresh_landings, 'fetch', side_effect=mock_fetch), \
                 patch.object(sys, 'argv', ['refresh_landings.py', '--apply', '--max-detail=4']), \
                 contextlib.redirect_stdout(io.StringIO()):
                refresh_landings.main()
            result = json.loads(data.read_text(encoding='utf-8'))
            found = [x for x in result['landings'] if x.get('mission') == 'ORBITA Test 888']
            self.assertEqual(len(found), 1)
            self.assertEqual(found[0]['site_id'], 'recovery-ocisly')
            self.assertEqual(found[0]['ltype'], 'asds')
            self.assertGreaterEqual(result['window_end'], source['window_end'])

    def test_curated_landing_not_deleted_by_similar_past_mission(self):
        source = json.loads((ROOT / 'data/upcoming_landings.json').read_text(encoding='utf-8'))
        original = source['landings'][0]
        up = [page_item('other-%03d' % i) for i in range(100)]
        prev = [page_item('past-%03d' % i, name='Random | Other %d' % i) for i in range(39)]
        prev.append(page_item('similar-but-different-id', name='Falcon 9 | ' + original['mission']))
        with tempfile.TemporaryDirectory() as tmp:
            data = Path(tmp) / 'upcoming_landings.json'
            data.write_text(json.dumps(source, ensure_ascii=False), encoding='utf-8')
            def mocked(url):
                return {'results': up if 'upcoming/' in url else prev}
            with patch.object(refresh_landings, 'DATA', str(data)), \
                 patch.object(refresh_landings, 'fetch', side_effect=mocked), \
                 patch.object(sys, 'argv', ['refresh_landings.py', '--apply']), \
                 contextlib.redirect_stdout(io.StringIO()):
                refresh_landings.main()
            result = json.loads(data.read_text(encoding='utf-8'))
            self.assertTrue(any(r['id'] == original['id'] for r in result['landings']))

    def test_production_endpoints_are_supported(self):
        self.assertIn('/2.3.0/launches/', ll2_compat.API_ROOT)
        self.assertIn('mode=normal', refresh_upcoming.API)
        self.assertIn('format=json', refresh_upcoming.API)
        self.assertNotIn('/2.2.0/', refresh_landings.API)

    def test_landing_bad_feed_never_writes(self):
        source = (ROOT / 'data/upcoming_landings.json').read_bytes()
        with tempfile.TemporaryDirectory() as tmp:
            data = Path(tmp) / 'upcoming_landings.json'
            data.write_bytes(source)
            with patch.object(refresh_landings, 'DATA', str(data)), \
                 patch.object(refresh_landings, 'fetch', return_value={'results': []}), \
                 patch.object(sys, 'argv', ['refresh_landings.py', '--apply']), \
                 contextlib.redirect_stdout(io.StringIO()):
                with self.assertRaises(SystemExit) as ctx:
                    refresh_landings.main()
            self.assertNotEqual(ctx.exception.code, 0)
            self.assertEqual(data.read_bytes(), source)


if __name__ == '__main__':
    unittest.main()
