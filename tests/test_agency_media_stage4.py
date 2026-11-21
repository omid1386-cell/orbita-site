"""Run after Stage 4 checkpoint has been merged into the Stage 2-3 codebase.
Python stdlib-only; never touches the network. Source permission is editorial, not a web test.
"""
import json, unittest
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]
CODE = ROOT / 'tools' / 'media_bank.py'
if not CODE.exists():
    CODE = Path('/mnt/data/ORBITA_MEDIA_STAGE3_WORK/tools/media_bank.py')
sys.path.insert(0, str(CODE.parent))
from media_bank import validate_catalog

class TestStage4AgencyMedia(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog=json.loads((ROOT/'data/media/catalog.v1.json').read_text('utf-8'))
        cls.agencies=[x for x in cls.catalog['entities'] if x['category']=='agency']
        cls.all_media=[m for x in cls.catalog['entities'] for m in x['media']]
        cls.approved=[m for e in cls.agencies for m in e['media'] if m['verification']['status']=='verified']
        cls.candidates=[m for e in cls.agencies for m in e['media'] if m['verification']['status']=='candidate']

    def test_syntax_and_schema(self):
        self.assertEqual([],validate_catalog(self.catalog,expected_total=420))
    def test_all_categories_stable(self):
        self.assertEqual(96,len(self.agencies))
        self.assertEqual(420,len(self.catalog['entities']))
    def test_only_agencies_modified(self):
        self.assertEqual(133,sum(x['category'] in ('launch','propulsion') for x in self.catalog['entities']))
    def test_exact_media_counts(self):
        manifest=json.loads((ROOT/'docs/AGENCY_MEDIA_ROUND4_MANIFEST.json').read_text('utf-8'))
        self.assertEqual(manifest['approved_total']+manifest['candidate_total'],sum(len(e['media']) for e in self.agencies))
        self.assertEqual(manifest['approved_total'],len(self.approved))
        self.assertEqual(manifest['candidate_total'],len(self.candidates))
    def test_candidate_items_remain_hidden_even_when_agency_has_approved_videos(self):
        ids={x['entity_id']:x for x in self.agencies}
        hold_ids={
            'csa-canada': 'med-csa-headquarters-image',
            'dlr-germany': 'med-dlr-headquarters-image',
            'rosa': 'med-rosa-hyperspectral-webinar',
        }
        # Media review is asset-scoped; verified videos on the same agency may be published.
        for key in hold_ids:
            candidates=[m for m in ids[key]['media'] if m['verification']['status']=='candidate']
            self.assertGreaterEqual(len(candidates),1)
            self.assertTrue(all(m['rights']['usage'] not in ('public_domain','attribution_required','permission_granted','link_only') for m in candidates))
    def test_video_link_only_policy(self):
        for asset in self.approved:
            if asset['kind']=='video':
                self.assertEqual('link_only',asset['rights']['usage'])
                self.assertTrue(asset['external_url'].startswith('https://'))
            else:
                self.assertEqual('image',asset['kind'])
                self.assertTrue(asset['rights'].get('license'))
                self.assertTrue(asset['rights'].get('credit'))
    def test_no_unlicensed_video_embedding(self):
        self.assertTrue(all(m['kind']=='image' or m['rights']['usage']=='link_only' for m in self.approved))
    def test_approved_agency_coverage(self):
        manifest=json.loads((ROOT/'docs/AGENCY_MEDIA_ROUND4_MANIFEST.json').read_text('utf-8'))
        self.assertEqual(manifest['covered_agencies'],sum(any(m['verification']['status']=='verified' for m in row['media']) for row in self.agencies))
    def test_source_links_and_credits_present(self):
        for m in self.approved:
            self.assertTrue(m['source']['url'].startswith('https://'))
            self.assertTrue(m['source']['publisher'])
            self.assertTrue(m['rights']['credit'])
            self.assertEqual('confirmed',m['verification']['identity_match'])
    def test_96_agency_report(self):
        rows=json.loads((ROOT/'docs/AGENCY_MEDIA_COVERAGE_96.json').read_text('utf-8'))
        self.assertEqual(96,len(rows))
        self.assertEqual({x['entity_key'] for x in self.agencies},{x['entity_key'] for x in rows})
        manifest=json.loads((ROOT/'docs/AGENCY_MEDIA_ROUND4_MANIFEST.json').read_text('utf-8'))
        self.assertEqual(manifest['approved_total'],sum(row['approved_media'] for row in rows))
        self.assertEqual(manifest['candidate_total'],sum(row['blocked_candidate_media'] for row in rows))
    def test_no_fake_images_or_example_media(self):
        self.assertTrue(all('example' not in m['external_url'] and 'placeholder' not in m['external_url'] for m in self.all_media))
    def test_unique_media_urls(self):
        links=[m['external_url'] for e in self.agencies for m in e['media']]
        self.assertEqual(len(links),len(set(links)))

if __name__=='__main__':unittest.main()
