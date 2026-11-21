#!/usr/bin/env python3
import copy
import datetime as dt
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
import sys
sys.path.insert(0, str(ROOT / 'tools'))
from refresh_global_landings import (API, UPCOMING_API, collect, parse_landing, curated_record,
    from_upcoming_detailed, EventContractError)

NOW = dt.datetime(2026, 11, 21, 12, tzinfo=dt.timezone.utc)
END = NOW + dt.timedelta(days=120)
UUID = 'ab123456-1111-2222-3333-444455556666'


def stub_landing(n=500, with_link=True, complete=False):
    return {
        'id': n, 'attempt': True, 'success': None,
        'type': {'name': 'Drone ship landing', 'abbrev': 'ASDS'},
        'landing_location': {'name': 'Ocean vessel', 'abbrev': 'OCISLY', 'location': None},
        'description': 'Planned booster landing',
        'firststage': {'rocket': {'launch': {'id': UUID, 'net': '2026-11-23T12:30:00Z',
                    'launch_service_provider': {'name': 'SpaceX', 'country_code': 'USA'}}}} if with_link else {'launcher': {'serial_number': 'B1000'}},
        'spacecraftflight': None,
    }


def fake_landings(url):
    return {'count': 1, 'results': [stub_landing()], 'next': None}


def fake_upcoming(url):
    return {'count': 1, 'results': [{'id': UUID, 'net': '2026-11-23T12:30:00Z',
        'launch_service_provider': {'name': 'SpaceX', 'country_code': 'USA'},
        'rocket': {'configuration': {'full_name': 'Falcon 9'},
                   'launcher_stage': [{'landing': {'id': 500, 'attempt': True,
                       'success': None, 'type': {'abbrev': 'ASDS', 'name': 'ASDS'},
                       'landing_location': {'name': 'OCISLY', 'abbrev': 'OCISLY'}}}]} }],
        'next': None}


class GlobalLandingsTests(unittest.TestCase):
    def setUp(self):
        self.curated={'landings':[{'id':'old-one','mission':'Test return','date':'2026-12-05',
                                   'operator_en':'SpaceX','site_id':'recovery-ocisly'}]}
        self.sites={'sites':[{'id':'recovery-ocisly','en':'OCISLY',
                              'country':'United States','recovery_type':'droneship'}]}
        self.launches={'launches':[]}

    def collect(self, **kwargs):
        return collect(now=NOW, fetcher=fake_landings, upcoming_fetcher=fake_upcoming,
                       curated=self.curated, sites=self.sites, global_launches=self.launches,
                       max_pages=1, max_upcoming_pages=1, **kwargs)

    def test_api_paths_are_distinct_real_endpoints(self):
        self.assertEqual(API, 'https://ll.thespacedevs.com/2.3.0/landings/')
        self.assertEqual(UPCOMING_API, 'https://ll.thespacedevs.com/2.3.0/launches/upcoming/')

    def test_collect_and_partial_label(self):
        out=self.collect()
        self.assertEqual(out['coverage_status'],'partial_source_coverage')
        self.assertEqual(out['count'],2)
        self.assertEqual(out['records_scanned'],1)
        self.assertEqual(out['upcoming_pages_fetched'],1)
        self.assertEqual(out['landings'][0]['date_basis'], 'associated_launch_date_not_landing_time')

    def test_legacy_never_assumes_ship_country(self):
        row=curated_record(self.curated['landings'][0], {'recovery-ocisly':self.sites['sites'][0]}, NOW, END)
        self.assertEqual(row['operator_country_code'],'USA')
        self.assertIsNone(row['recovery_country_code'])
        self.assertEqual(row['date_basis'],'curated_schedule_date_unverified')

    def test_land_only_site_country(self):
        r=copy.deepcopy(self.curated['landings'][0]);r['site_id']='recovery-lz4'
        site={'recovery-lz4': {'id':'recovery-lz4','en':'Landing Zone 4',
                                 'country':'United States','recovery_type':'booster'}}
        self.assertEqual(curated_record(r,site,NOW,END)['recovery_country_code'],'USA')

    def test_no_stage_data_no_fake_scheduled_landing(self):
        self.assertIsNone(parse_landing(stub_landing(with_link=False), {}, NOW, END))

    def test_completed_attempt_is_excluded(self):
        old=stub_landing(); old['success']=True
        self.assertIsNone(parse_landing(old, {}, NOW, END))

    def test_bad_and_duplicate_page_rejected(self):
        def bad(url): return {'count':2,'results':[stub_landing(n=1)],'next':None}
        with self.assertRaises(EventContractError):
            collect(now=NOW, fetcher=bad, curated=self.curated, sites=self.sites,
                    global_launches=self.launches, max_pages=1,max_upcoming_pages=0)

    def test_horizon_excludes_old(self):
        rec=stub_landing();rec['firststage']['rocket']['launch']['net']='2026-10-20T00:00:00Z'
        self.assertIsNone(parse_landing(rec, {}, NOW, END))

    def test_missing_upcoming_optional(self):
        def bad(url): raise ConnectionError('offline')
        result=collect(now=NOW, fetcher=fake_landings, upcoming_fetcher=bad,
          curated=self.curated, sites=self.sites, global_launches=self.launches,
          max_pages=1,max_upcoming_pages=1)
        self.assertIn('offline',result['upcoming_detail_error'])
        self.assertEqual(result['count'],2) # landing list + curated

    def test_unsupported_destruction_excluded(self):
        rec=stub_landing();rec['type']['abbrev']='ATM'
        self.assertIsNone(parse_landing(rec, {}, NOW, END))

    def test_stage_without_explicit_attempt_excluded(self):
        up=fake_upcoming('')['results'][0]
        up['rocket']['launcher_stage'][0]['landing']['attempt']=None
        self.assertEqual(from_upcoming_detailed(up,NOW,END),[])

    def test_stage_and_capsule_can_coexist(self):
        up=fake_upcoming('')['results'][0]
        up['rocket']['spacecraft_stage']=[{'landing':{'id':501,'attempt':True,
            'success':None, 'type':{'name':'Parachute'},
            'landing_location':{'name':'Recovery zone'}}}]
        self.assertEqual(len(from_upcoming_detailed(up,NOW,END)),2)

    def test_no_mutation_of_curated(self):
        before=copy.deepcopy(self.curated)
        self.collect()
        self.assertEqual(self.curated,before)

if __name__=='__main__': unittest.main()
