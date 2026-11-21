import json, pathlib, unittest, csv
ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'data/media/catalog.v1.json').read_text('utf-8'))
E=DATA['entities']; P=[e for e in E if e['category']=='propulsion']; add=[m for e in P for m in e['media'] if m['media_id'].startswith('med-prop20261121-')]
class PropulsionStage5(unittest.TestCase):
 def test_preserve_total_entities(self):
  self.assertEqual(len(E),420);self.assertEqual(len(P),65)
 def test_exact_new_records(self): self.assertEqual(len(add),34)
 def test_final_covered_propulsion(self):
  self.assertEqual(sum(any(m['verification']['status']=='verified' for m in e['media']) for e in P),61)
 def test_newly_covered_entities(self):
  self.assertEqual(len({e['entity_id'] for e in P for m in e['media'] if m['media_id'].startswith('med-prop20261121-')}),23)
 def test_link_only_videos(self):
  for m in add:
   if m['kind']=='video': self.assertEqual(m['rights']['usage'],'link_only')
 def test_media_has_attribution_and_proof(self):
  for m in add:
   self.assertTrue(m['source']['url'].startswith('https://'))
   self.assertTrue(m['rights']['proof_url'].startswith('https://'))
   self.assertTrue(m['rights']['credit'])
   self.assertEqual(m['verification']['status'],'verified')
 def test_media_identity_unique(self):
  mids=[m['media_id'] for e in E for m in e['media']]
  self.assertEqual(len(mids),len(set(mids)))
 def test_images_are_commons_and_video_link_only(self):
  for m in add:
   if m['kind']=='image':
    self.assertTrue(m['external_url'].startswith('https://upload.wikimedia.org/wikipedia/commons/'))
    self.assertIn('commons.wikimedia.org/wiki/File:',m['rights']['proof_url'])
   else: self.assertEqual(m['rights']['usage'],'link_only')
 def test_agency_launch_counts_unchanged(self):
  for category,expected in [('agency',51),('launch',47)]:
   arr=[e for e in E if e['category']==category]
   self.assertEqual(sum(any(m['verification']['status']=='verified' for m in e['media']) for e in arr),expected)
if __name__=='__main__':unittest.main()
