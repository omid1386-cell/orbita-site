import copy
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'tools'))
import media_bank as mb

CATALOG = ROOT/'data/media/catalog.v1.json'


def demo_media(media_id='med-test-video-01', kind='video', usage='link_only'):
    return {
        'media_id':media_id,
        'kind':kind,
        'role':'operations',
        'external_url':'https://www.youtube.com/watch?v=TEST123',
        'caption':{'fa':'نمونه آزمایشی','en':'Demo'},
        'source':{'url':'https://www.nasa.gov/','publisher':'NASA'},
        'rights':{'usage':usage,'checked_on':'2026-11-21'},
        'verification':{'status':'verified','identity_match':'confirmed','source_verified':True,'reviewed_on':'2026-11-21','reviewer':'Stage 2 test reviewer'},
        'added_on':'2026-11-21'
    }


class MediaBankTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = mb.read_catalog(CATALOG)

    def test_inventory_exact_420(self):
        self.assertEqual(len(self.catalog['entities']), 420)
        self.assertEqual(mb.validate_catalog(self.catalog,expected_total=420),[])

    def test_category_counts(self):
        from collections import Counter
        ct=Counter(x['category'] for x in self.catalog['entities'])
        self.assertEqual(ct['agency'],96)
        self.assertEqual(ct['launch_site'],79)
        self.assertEqual(ct['recovery_site'],20)
        self.assertEqual(sum(ct.values()),420)

    def test_original_source_preserved(self):
        self.assertTrue(next(x for x in self.catalog['entities'] if x['entity_id']=='ksc39a')['preserve_current_hero_photo'])
        self.assertEqual(next(x for x in self.catalog['entities'] if x['entity_id']=='nasa')['legacy_media']['gallery_count'],3)
        self.assertTrue(all(e['preserve_current_hero_photo'] for e in self.catalog['entities'] if e['category']=='launch_site'))
        self.assertEqual(133, sum(x['category'] in ('launch','propulsion') for x in self.catalog['entities']))
        self.assertGreaterEqual(sum(len(x['media']) for x in self.catalog['entities']),61)

    def test_valid_unverified_candidate(self):
        item=demo_media()
        item['verification']={'status':'candidate','identity_match':'unverified','source_verified':False,'reviewed_on':None}
        item['rights']={'usage':'undetermined','checked_on':None}
        self.assertEqual(mb.validate_media(item,'sample'),[])

    def test_valid_verified_video_link_only(self):
        self.assertEqual(mb.validate_media(demo_media(),'sample'),[])

    def test_valid_verified_local_image(self):
        item=demo_media(kind='image',usage='attribution_required')
        item.pop('external_url')
        item['file_path']='assets/media/test1.webp'
        item['rights']['credit']='NASA Example'
        item['rights']['license']='CC BY 4.0 (test only)'
        self.assertEqual(mb.validate_media(item,'sample'),[])

    def test_reject_publish_unverified(self):
        item=demo_media()
        item['verification']['source_verified']=False
        self.assertTrue(mb.validate_media(item,'sample'))

    def test_reject_publish_no_license(self):
        item=demo_media(usage='undetermined')
        self.assertTrue(mb.validate_media(item,'sample'))

    def test_reject_link_only_image(self):
        self.assertTrue(mb.validate_media(demo_media(kind='image'),'sample'))

    def test_reject_path_traversal(self):
        for bad in ['assets/media/../app.js','assets/media//bad.jpg','assets/media/../../secret',
                    '/assets/media/p.jpg','assets\\media\\bad.jpg']:
            self.assertFalse(mb.safe_media_path(bad),bad)

    def test_reject_malformed_external_urls(self):
        for bad in ['javascript:alert(1)','http://example.com','https://user:pw@site.com/x',
                    'https://example.com/a b', 'data:image/svg+xml,hi']:
            self.assertFalse(mb.safe_https(bad),bad)

    def test_global_media_id_unique(self):
        cat=copy.deepcopy(self.catalog)
        mb.add_media(cat,'company_or_organization:agency:nasa',demo_media())
        with self.assertRaises(mb.ValidationError):
            mb.add_media(cat,'company_or_organization:agency:esa',demo_media())
        self.assertEqual(sum(len(e['media']) for e in cat['entities']),sum(len(e['media']) for e in self.catalog['entities'])+1)

    def test_reject_unknown_entity_without_mutation(self):
        cat=copy.deepcopy(self.catalog)
        with self.assertRaises(mb.ValidationError):
            mb.add_media(cat,'company_or_organization:agency:made-up-entity',demo_media())
        self.assertEqual(cat,self.catalog)

    def test_reject_bad_entry_and_restore(self):
        cat=copy.deepcopy(self.catalog)
        item=demo_media()
        item['external_url']='javascript:alert(1)'
        with self.assertRaises(mb.ValidationError):
            mb.add_media(cat,'company_or_organization:agency:nasa',item)
        self.assertEqual(cat,self.catalog)

    def test_round_trip_atomic_and_export_csv(self):
        with tempfile.TemporaryDirectory() as td:
            out=Path(td)/'catalog.json'; csv=Path(td)/'coverage.csv'
            cat=copy.deepcopy(self.catalog)
            mb.add_media(cat,'company_or_organization:agency:nasa',demo_media())
            mb.atomic_write(out,cat)
            self.assertEqual(mb.read_catalog(out),cat)
            mb.export_coverage(cat,csv)
            self.assertEqual(len(csv.read_text(encoding='utf-8-sig').splitlines()),421)

    def test_date_validation(self):
        item=demo_media()
        item['verification']['reviewed_on']='2026-02-30'
        self.assertTrue(mb.validate_media(item,'sample'))

    def test_replace_and_remove_workflow(self):
        cat=copy.deepcopy(self.catalog)
        key='company_or_organization:agency:nasa'
        mb.add_media(cat,key,demo_media())
        item=demo_media()
        item['caption']['en']='Changed after review'
        mb.replace_media(cat,'med-test-video-01',item)
        self.assertEqual(next(m for m in next(e for e in cat['entities'] if e['entity_key']==key)['media'] if m['media_id']=='med-test-video-01')['caption']['en'], 'Changed after review')
        with self.assertRaises(mb.ValidationError):
            mb.replace_media(cat,'med-test-video-01',demo_media(media_id='med-other-01'))
        mb.remove_media(cat,'med-test-video-01')
        self.assertEqual(cat,self.catalog)

    def test_verified_local_file_check(self):
        cat=copy.deepcopy(self.catalog)
        local=demo_media(kind='image',usage='public_domain')
        local.pop('external_url')
        local['file_path']='assets/media/not_uploaded_yet.webp'
        local['rights']['license']='Public Domain (test only)'
        mb.add_media(cat,'company_or_organization:agency:nasa',local)
        self.assertTrue(mb.verify_local_files(cat,ROOT))

    def test_stable_keys(self):
        keys={e['entity_key'] for e in self.catalog['entities']}
        self.assertEqual(len(keys),420)
        self.assertIn('launch_site:launch_site:ksc39a',keys)
        self.assertIn('recovery_site:recovery_site:recovery-lz4',keys)
        self.assertIn('company_or_organization:agency:nasa',keys)

if __name__=='__main__':
    unittest.main()
