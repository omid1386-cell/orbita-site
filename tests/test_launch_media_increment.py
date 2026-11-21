"""Regression suite for launch-only ORBITA media expansion."""
import hashlib,json,pathlib,sys,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tools'))
from media_bank import validate_catalog,validate_media

class LaunchMediaIncrement(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.cat=json.loads((ROOT/'data/media/catalog.v1.json').read_text(encoding='utf-8'))
  cls.mf=json.loads((ROOT/'docs/LAUNCH_MEDIA_INCREMENT_MANIFEST.json').read_text(encoding='utf-8'))
  cls.current_mf=json.loads((ROOT/'docs/ORBITA_LAUNCH_MEDIA_DEEP_RESEARCH_MANIFEST.json').read_text(encoding='utf-8'))
  cls.final_mf=json.loads((ROOT/'RELEASE_DOCS/PROPULSION_STAGE5_FINAL/MANIFEST.json').read_text(encoding='utf-8'))
  cls.byid={e['entity_id']:e for e in cls.cat['entities'] if e['category']=='launch'}
 def test_counts_and_scope(self):
  self.assertEqual(len(self.cat['entities']),420)
  self.assertEqual(len(self.byid),68)
  for catg,expected in [('launch',47),('agency',51),('propulsion',61)]:
   covered=sum(any(m['verification']['status']=='verified' for m in e['media']) for e in self.cat['entities'] if e['category']==catg)
   self.assertEqual(covered,expected)
 def test_protected_categories_byte_equivalent(self):
  for catg in ('agency',):
   arr=[e for e in self.cat['entities'] if e['category']==catg]
   digest=hashlib.sha256(json.dumps(arr,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
   self.assertEqual(digest,self.mf[catg+'_projection_sha256'])
 def test_registered_new_media_verified(self):
  mids=[]
  for e in self.byid.values():
   for m in e['media']:
    if m['media_id'].endswith('-launch-media-audit-20261121'):
     mids.append(m['media_id'])
     self.assertEqual(validate_media(m,m['media_id']),[])
     self.assertEqual(m['verification']['status'],'verified')
     self.assertEqual(set(m['caption']),{'fa','en','ar'})
     self.assertTrue(m['source']['url'].startswith('https://commons.wikimedia.org/wiki/File:'))
     self.assertTrue(m['rights']['proof_url'])
  self.assertEqual(len(mids),self.mf['added_media'])
  self.assertEqual(len(mids),len(set(mids)))
 def test_deep_research_media_and_prefix_integrity(self):
  deep=[]
  for e in self.byid.values():
   for m in e['media']:
    if m['media_id'].startswith('med-20261121-deep-'):
     deep.append(m)
     self.assertEqual(validate_media(m,m['media_id']),[])
     self.assertEqual(m['verification']['status'],'verified')
     self.assertEqual(m['verification']['identity_match'],'confirmed')
     self.assertTrue(m['rights']['proof_url'])
  self.assertEqual(len(deep),self.current_mf['added_media'])
  self.assertEqual(len({m['media_id'] for m in deep}),len(deep))
 def test_entire_catalog_validator(self):
  self.assertEqual(validate_catalog(self.cat,expected_total=420),[])
 def test_sha256_artifact(self):
  digest=hashlib.sha256((ROOT/'data/media/catalog.v1.json').read_bytes()).hexdigest()
  self.assertEqual(digest,self.final_mf['current_catalog_sha256'])

if __name__=='__main__': unittest.main()
