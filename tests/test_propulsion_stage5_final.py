import unittest,json,pathlib,hashlib,csv
ROOT=pathlib.Path(__file__).resolve().parents[1]
CAT=ROOT/'data/media/catalog.v1.json'
DOC=ROOT/'RELEASE_DOCS/PROPULSION_STAGE5_FINAL'
class Stage5Final(unittest.TestCase):
 def setUp(self):
  self.d=json.loads(CAT.read_text('utf-8'))
  self.p=[x for x in self.d['entities'] if x['category']=='propulsion']
  self.new=[m for x in self.p for m in x['media'] if m['media_id'].startswith('med-prop5final')]
 def test_total(self):
  self.assertEqual(len(self.d['entities']),420);self.assertEqual(len(self.p),65)
 def test_verified_coverage(self):
  self.assertEqual(sum(any(m['verification']['status']=='verified' for m in e['media']) for e in self.p),61)
  self.assertEqual(sum(not e['media'] for e in self.p),4)
 def test_added_count(self):
  self.assertEqual(len(self.new),25)
  self.assertEqual(len({m['media_id'] for m in self.new}),25)
  self.assertEqual(len({e['entity_id'] for e in self.p for m in e['media'] if m in self.new}),24)
 def test_sources_and_rights(self):
  for m in self.new:
   self.assertTrue(m['source']['url'].startswith('https://'))
   self.assertTrue(m['rights']['proof_url'].startswith('https://'))
   self.assertEqual(m['verification']['status'],'verified')
   if m['kind']=='video':self.assertEqual(m['rights']['usage'],'link_only')
  self.assertEqual(sum(m['kind']=='video' for m in self.new),24)
 def test_new_review_status(self):
  for e in self.p:
   if any(m in self.new for m in e['media']):
    self.assertEqual(e['review_status'],'in_progress')
 def test_legacy_preserved(self):
  self.assertEqual(sum(any(m['verification']['status']=='verified' for m in e['media']) for e in self.d['entities'] if e['category']=='launch'),47)
  self.assertEqual(sum(any(m['verification']['status']=='verified' for m in e['media']) for e in self.d['entities'] if e['category']=='agency'),51)
  self.assertEqual(len(set(m['media_id'] for e in self.d['entities'] for m in e['media'])),sum(len(e['media']) for e in self.d['entities']))
 def test_artifact_digest(self):
  mf=json.loads((DOC/'MANIFEST.json').read_text('utf-8'))
  self.assertEqual(hashlib.sha256(CAT.read_bytes()).hexdigest(),mf['current_catalog_sha256'])
 def test_remaining_register(self):
  with open(DOC/'UNRESOLVED_4_RESEARCH.csv',encoding='utf-8-sig') as f: rows=list(csv.DictReader(f))
  self.assertEqual(len(rows),4)
  missing={e['entity_id'] for e in self.p if not e['media']}
  self.assertEqual(set(r['entity_id'] for r in rows),missing)
