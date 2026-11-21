import json, pathlib, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Stage5Round2(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.d=json.loads((ROOT/'data/media/catalog.v1.json').read_text('utf8'))
  cls.manifest=json.loads((ROOT/'docs/STAGE5_ROUND2_MANIFEST.json').read_text('utf8'))
  cls.entities={(x['category'],x['entity_id']):x for x in cls.d['entities']}
 def test_420_entities(self):self.assertEqual(420,len(self.d['entities']))
 def test_133_scope(self):self.assertEqual(133,sum(x['category'] in ('launch','propulsion') for x in self.d['entities']))
 def test_round2_coverage_preserved(self):
  baseline=self.manifest['now_covered_entities']
  covered=sum(bool(x['media']) for x in self.d['entities'] if x['category'] in ('launch','propulsion'))
  self.assertGreaterEqual(covered,baseline)
 def test_new_ids(self):
  ids={m['media_id'] for x in self.d['entities'] for m in x['media']}
  self.assertTrue(set(self.manifest['new_media_ids']).issubset(ids))
  self.assertEqual(22,len(self.manifest['new_media_ids']))
 def test_new_source_license(self):
  ids=set(self.manifest['new_media_ids'])
  for e in self.d['entities']:
   for m in e['media']:
    if m['media_id'] in ids:
     self.assertEqual('verified',m['verification']['status'])
     self.assertTrue(m['rights']['proof_url'].startswith('https://'))
     self.assertTrue(m['source']['url'].startswith('https://'))
     self.assertTrue(m['verification']['source_verified'])
     self.assertEqual({'fa','en','ar'},set(m['caption']))
     if m['kind']=='video':self.assertEqual('link_only',m['rights']['usage'])
     else:self.assertNotEqual('link_only',m['rights']['usage'])
 def test_unique_media(self):
  ids=[m['media_id'] for e in self.d['entities'] for m in e['media']]
  self.assertEqual(len(ids),len(set(ids)))
if __name__=='__main__':unittest.main()
