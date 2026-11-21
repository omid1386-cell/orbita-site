#!/usr/bin/env python3
"""Realistic LL2 v2.3 structural fixtures, based on API response shapes.
These are contract tests, NOT proof that a live server was fetched.
"""
import datetime as dt
import pathlib
import sys
import unittest
from urllib.parse import parse_qs, urlparse
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
import refresh_global_launches as launches
import refresh_global_landings as landings
from ll2_country import country_code
from upcoming_event_contract import EventContractError
NOW = dt.datetime(2026,11,21,12,0,tzinfo=dt.timezone.utc)


def api_launch(id='CN-001',country='CHN',provider_country='CHN',operator=True):
    provider={'response_mode':'normal','id':88,'name':'CASC'} if operator else None
    if provider and provider_country:
        provider['country']=[{'alpha_3_code':provider_country}]
    return {'id':id, 'name':'Long March 8A | SatNet', 'net':'2026-12-05T00:00:00Z',
            'net_precision':{'name':'Day'},'last_updated':'2026-11-21T06:00:00Z',
            'status':{'name':'To be confirmed','abbrev':'TBC'},
            'launch_service_provider':provider,
            'pad':{'id':218,'name':'Commercial LC-1','country':{'name':'China','alpha_3_code':country},
                   'location':{'id':8,'name':'Wenchang','country':{'alpha_3_code':country}}},
            'rocket':{'configuration':{'full_name':'Long March 8A'}},
            'mission':{'name':'SatNet'}}


def paged(events):
    def get(url):
        qs=parse_qs(urlparse(url).query)
        assert qs['mode']==['detailed'], 'Detailed mode required for agency affiliation'
        limit=int(qs['limit'][0]); offset=int(qs['offset'][0]); results=events[offset:offset+limit]
        return {'count':len(events),'results':results,'next':'next' if offset+len(results)<len(events) else None}
    return get

class LiveSchemaTests(unittest.TestCase):
    def test_real_pad_country_path(self):
        r,_=launches._event(api_launch())
        self.assertEqual(r['launch_country_code'],'CHN')
        self.assertEqual(r['operator_country_code'],'CHN')
    def test_real_provider_normal_missing_country_is_not_faked(self):
        raw=api_launch(provider_country=None)
        r,_=launches._event(raw)
        self.assertIsNone(r['operator_country_code'])
        self.assertEqual(r['launch_country_code'],'CHN')
        with self.assertRaisesRegex(EventContractError,'provider country'):
            launches.collect(now=NOW,fetcher=paged([raw]))
    def test_country_filters_multinational_provider_unattributed(self):
        self.assertIsNone(country_code({'country':[{'alpha_3_code':'USA'},{'alpha_3_code':'FRA'}]}))
    def test_eight_launches_two_countries(self):
        raw=[api_launch('CN-%d'%i,'CHN','CHN') for i in range(4)] + [api_launch('US-%d'%i,'USA','USA') for i in range(4)]
        data=launches.collect(now=NOW,fetcher=paged(raw))
        self.assertEqual(data['count'],8)
        self.assertEqual(data['country_quality']['operator_covered'],8)
        self.assertEqual(data['country_quality']['site_covered'],8)
        self.assertEqual(data['coverage_status'],'complete_from_source_at_fetch_time')
    def test_empty_response_preserves_old_snapshot(self):
        with self.assertRaises(EventContractError): launches.collect(now=NOW,fetcher=paged([]))
    def test_landing_normal_shape_does_not_invent_date(self):
        source={'id':1981,'attempt':True,'success':None,'type':{'abbrev':'RTLS'},
                'landing_location':{'name':'Landing Zone 4','location':{'country':{'alpha_3_code':'USA'}}},
                'firststage':{'id':1047,'launcher':{'serial_number':'B1097'}},
                'spacecraftflight':None}
        self.assertEqual(landings.country_of(source['landing_location']['location']),'USA')
        self.assertIsNone(landings.parse_landing(source,{},NOW,NOW+dt.timedelta(days=120)))
    def test_landings_do_not_confuse_launch_with_return_time(self):
        source={'id':1981,'attempt':True,'success':None,'type':{'abbrev':'RTLS'},
                'landing_location':{'name':'Landing Zone 4','location':{'country':{'alpha_3_code':'USA'}}},
                'firststage':{'rocket':{'launch':{'id':'uuid','net':'2026-11-24T05:00:00Z',
                                 'launch_service_provider':{'name':'SpaceX','country':[{'alpha_3_code':'USA'}]}}}}}
        item=landings.parse_landing(source,{},NOW,NOW+dt.timedelta(days=120))
        self.assertEqual(item['date_basis'],'associated_launch_date_not_landing_time')
        self.assertEqual(item['recovery_country_code'],'USA')
        self.assertEqual(item['operator_country_code'],'USA')
        self.assertEqual(item['date_utc'],'2026-11-24')

if __name__ == '__main__':unittest.main()
