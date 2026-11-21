#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Offline Step-1/2 tests: no external API access required."""
import copy
import datetime as dt
import json
import pathlib
import sys
import tempfile
import unittest
from urllib.parse import parse_qs, urlparse

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import refresh_global_launches as global_launches
from upcoming_event_contract import EventContractError, build_catalog, utc_datetime

NOW = dt.datetime(2026, 11, 21, 12, 30, tzinfo=dt.timezone.utc)


def item(number, offset_days=10, pad_country='CHN'):
    net = (NOW + dt.timedelta(days=offset_days, minutes=number)).isoformat().replace('+00:00', 'Z')
    return {'id': 'test-id-%d' % number, 'net': net, 'name': 'Example launch %d' % number,
            'status': {'abbrev': 'TBC', 'name': 'To Be Confirmed'},
            'net_precision': {'name': 'Day'},
            'pad': {'id': 7, 'name': 'Example Pad',
                    'location': {'id': 12, 'name': 'Example Location', 'country': {'alpha_3_code': pad_country}},
                    'country': {'alpha_3_code': pad_country}},
            'launch_service_provider': {'id': 14, 'name': 'Example Co.', 'country': [{'alpha_3_code': 'USA'}]},
            'rocket': {'configuration': {'full_name': 'Example Rocket'}},
            'mission': {'name': 'Payload %d' % number, 'type': 'Earth Science'}}


def fake_feed(events):
    def fetcher(url):
        query = parse_qs(urlparse(url).query)
        assert query['net__lt'] and query['net__gte']
        assert query['mode'] == ['detailed']
        assert query['include_suborbital'] == ['true']
        offset = int(query['offset'][0])
        size = int(query['limit'][0])
        return {'count': len(events), 'next': 'https://example.test/next' if offset+size < len(events) else None,
                'results': events[offset:offset+size]}
    return fetcher


class GlobalLaunchTests(unittest.TestCase):
    def test_common_contract_preserves_source_and_date_semantics(self):
        launches = json.loads((ROOT / 'data/upcoming.json').read_text(encoding='utf8'))['launches']
        landings = json.loads((ROOT / 'data/upcoming_landings.json').read_text(encoding='utf8'))['landings']
        sites = json.loads((ROOT / 'data/sites.json').read_text(encoding='utf8'))
        recovery = json.loads((ROOT / 'data/recovery_sites.json').read_text(encoding='utf8'))['sites']
        baseline = copy.deepcopy((launches[0], landings[0]))
        catalog = build_catalog(launches, landings, sites, recovery)
        self.assertEqual(len(catalog), len(launches) + len(landings))
        self.assertEqual(catalog[0]['kind'], 'launch')
        landing_events = [x for x in catalog if x['kind'] == 'landing']
        self.assertEqual(len(landing_events), len(landings))
        self.assertIn(catalog[0]['status'], {'confirmed','tentative','unscheduled','on_hold','unknown'})
        self.assertIn(landing_events[0]['status'], {'confirmed','tentative','unscheduled','unknown'})
        self.assertTrue(all(x['net_utc'] is None for x in landing_events))
        self.assertTrue(all(x['country_basis'] == 'recovery_site_not_operator' for x in landing_events))
        self.assertEqual(baseline, (launches[0], landings[0]))

    def test_timezone_required(self):
        with self.assertRaises(EventContractError):
            utc_datetime('2027-01-01T00:00:00')

    def test_fetch_all_pages_and_unmapped_foreign_launches(self):
        raw = [item(i, offset_days=(i % 110) + 1) for i in range(215)]
        result = global_launches.collect(now=NOW, fetcher=fake_feed(raw))
        self.assertEqual(result['pages_fetched'], 3)
        self.assertEqual(result['count'], 215)
        self.assertEqual(result['launches'][0]['launch_country_code'], 'CHN')
        self.assertEqual(result['launches'][0]['operator_country_code'], 'USA')
        self.assertEqual(result['launches'][0]['net_precision'], 'Day')
        self.assertEqual(result['coverage_status'], 'complete_from_source_at_fetch_time')
        self.assertEqual((utc_datetime(result['window_end_utc_exclusive']) - utc_datetime(result['window_start_utc'])).days, 120)

    def test_today_day_precision_is_retained_from_utc_midnight(self):
        raw = item(501)
        raw['net'] = '2026-11-21T00:00:00Z'
        raw['net_precision'] = {'name': 'Day'}
        observed_urls = []
        def source(url):
            observed_urls.append(url)
            return fake_feed([raw])(url)
        result = global_launches.collect(now=NOW, fetcher=source)
        self.assertEqual(result['count'], 1)
        query = parse_qs(urlparse(observed_urls[0]).query)
        self.assertEqual(query['net__gte'], ['2026-11-21T00:00:00Z'])

    def test_already_past_timed_launch_today_is_not_published(self):
        past = item(502)
        past['net'] = '2026-11-21T08:00:00Z'
        past['net_precision'] = {'name': 'Minute'}
        future = item(503)
        future['net'] = '2026-11-23T08:00:00Z'
        future['net_precision'] = {'name': 'Minute'}
        result = global_launches.collect(now=NOW, fetcher=fake_feed([past, future]))
        self.assertEqual(result['count'], 1)
        self.assertEqual(result['launches'][0]['ll2_id'], future['id'])

    def test_preserves_unknown_pad_and_operator_without_guessing(self):
        raw = item(7)
        raw['pad'] = None
        raw['launch_service_provider'] = None
        result = global_launches.collect(now=NOW, fetcher=fake_feed([raw]))
        event = result['launches'][0]
        self.assertIsNone(event['launch_country_code'])
        self.assertIsNone(event['operator_country_code'])
        self.assertIsNone(event['pad_name'])

    def test_duplicate_id_aborts(self):
        raw = [item(0), item(0)]
        with self.assertRaises(EventContractError):
            global_launches.collect(now=NOW, fetcher=fake_feed(raw))

    def test_invalid_date_aborts(self):
        raw = item(1)
        raw['net'] = 'not-a-date'
        with self.assertRaises(EventContractError):
            global_launches.collect(now=NOW, fetcher=fake_feed([raw]))

    def test_outside_window_aborts(self):
        with self.assertRaises(EventContractError):
            global_launches.collect(now=NOW, fetcher=fake_feed([item(1, 121)]))

    def test_page_budget_aborts_without_partial_data(self):
        raw = [item(i) for i in range(201)]
        with self.assertRaises(EventContractError):
            global_launches.collect(now=NOW, fetcher=fake_feed(raw), max_pages=2)

    def test_incomplete_page_aborts(self):
        def broken(url):
            return {'count': 200, 'results': [item(1)], 'next': None}
        with self.assertRaises(EventContractError):
            global_launches.collect(now=NOW, fetcher=broken)

    def test_inconsistent_page_count_aborts(self):
        def inconsistent(url):
            q = parse_qs(urlparse(url).query)
            offset = int(q['offset'][0])
            return {'count': 125 if offset == 0 else 126,
                    'results': [item(i) for i in range(offset, min(offset+100, 125))],
                    'next': 'next' if offset == 0 else None}
        with self.assertRaises(EventContractError):
            global_launches.collect(now=NOW, fetcher=inconsistent)

    def test_atomic_write_preserves_previous_on_collection_error(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = pathlib.Path(tmp) / 'upcoming_global.json'
            target.write_text('original', encoding='utf8')
            with self.assertRaises(EventContractError):
                global_launches.collect(now=NOW, fetcher=lambda _: {'results': None})
            self.assertEqual(target.read_text(encoding='utf8'), 'original')
            doc = global_launches.collect(now=NOW, fetcher=fake_feed([item(3)]))
            global_launches.write_atomic(target, doc)
            self.assertEqual(json.loads(target.read_text(encoding='utf8'))['count'], 1)


if __name__ == '__main__':
    unittest.main()
