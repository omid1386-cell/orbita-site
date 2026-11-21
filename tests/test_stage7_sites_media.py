# ORBITA Stage 7 media contract tests. Run: python -m unittest discover -s tests -p 'test_stage7_sites_media.py'
import hashlib, json, os, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CAT=Path(os.environ.get('ORBITA_STAGE7_CATALOG',str(ROOT/'data/media/catalog.v1.json')))
class Stage7Contract(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.catalog=json.loads(CAT.read_text(encoding='utf-8'))
  cls.rows=cls.catalog['entities']
  cls.sites=[x for x in cls.rows if x['entity_type']=='launch_site']
  cls.recovery=[x for x in cls.rows if x['entity_type']=='recovery_site']
  cls.stage7=[m for x in cls.sites+cls.recovery for m in x['media'] if m['media_id'].startswith('med-stage7-')]
 def test_entity_inventory(self):
  self.assertEqual(len(self.rows),420); self.assertEqual(len(self.sites),79); self.assertEqual(len(self.recovery),20)
 def test_stage7_round3_totals(self):
  self.assertEqual(len(self.stage7),102)
  self.assertEqual(sum(m['verification']['status']=='verified' for m in self.stage7),92)
  self.assertEqual(sum(m['verification']['status']=='candidate' for m in self.stage7),10)
  self.assertEqual(sum(m['kind']=='image' for m in self.stage7),58)
  self.assertEqual(sum(m['kind']=='video' for m in self.stage7),44)
 def test_site_coverage(self):
  self.assertEqual(sum(any(m['verification']['status']=='verified' for m in e['media']) for e in self.sites),48)
  self.assertEqual(sum(any(m['verification']['status']=='verified' for m in e['media']) for e in self.recovery),20)
 def test_unique_ids(self):
  ids=[m['media_id'] for e in self.rows for m in e['media']]
  self.assertEqual(len(ids),len(set(ids)))
 def test_source_and_rights_fields(self):
  for m in self.stage7:
   self.assertTrue(m['source']['url'].startswith('https://'))
   self.assertTrue(m['external_url'].startswith('https://'))
   self.assertTrue(m['rights'].get('proof_url','').startswith('https://'))
   if m['kind']=='video': self.assertEqual(m['rights']['usage'],'link_only')
   if m['verification']['status']=='verified':
    self.assertTrue(m['verification']['source_verified'])
    self.assertEqual(m['verification']['identity_match'],'confirmed')
 def test_candidate_quarantine(self):
  cand=[m for m in self.stage7 if m['verification']['status']=='candidate']
  self.assertEqual(len(cand),10)
  self.assertTrue(all(m['kind']=='image' for m in cand))
  self.assertTrue(all(m['rights']['usage'] in ('undetermined','restricted') for m in cand))
  bank=(ROOT/'assets/js/media-bank.js').read_text(encoding='utf-8')
  self.assertIn("asset.verification.status !== 'verified'",bank)
 def test_unchanged_hero_data_files(self):
  expected={'data/sites.json':'ea9f5a7edd20932574e9c5001131355cd55faa4f0e576ef75242e116ec45b639',
            'data/recovery_sites.json':'a22a2de67a679d89f33fc046890a5ee3d7794bbb3b36d05eb2f72f4ee8d4995d'}
  for rel,digest in expected.items():
   p=ROOT/rel
   if p.exists(): self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(),digest)
 def test_recovery_video_links(self):
  links=[m for e in self.recovery for m in e['media'] if m['kind']=='video' and m['verification']['status']=='verified']
  self.assertGreaterEqual(len(links),32)
  self.assertTrue(all(m['rights']['usage']=='link_only' for m in links))
if __name__=='__main__': unittest.main()
