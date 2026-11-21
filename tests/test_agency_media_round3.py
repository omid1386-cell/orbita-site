import unittest, json, csv, pathlib, collections, hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
C=json.loads((ROOT/'data/media/catalog.v1.json').read_text('utf-8'))
M=json.loads((ROOT/'docs/AGENCY_MEDIA_ROUND3_MANIFEST.json').read_text('utf-8'))
AG=[x for x in C['entities'] if x['category']=='agency']
ALL={m['media_id']:m for e in AG for m in e['media']}
class MediaRound3(unittest.TestCase):
 def test_new_media(self):
  self.assertEqual(15,len(M['new_media_ids']))
  self.assertTrue(all(i in ALL for i in M['new_media_ids']))
  self.assertEqual(collections.Counter(ALL[i]['kind'] for i in M['new_media_ids']),{'image':10,'video':5})
 def test_rights_and_origins(self):
  for i in M['new_media_ids']:
   m=ALL[i]
   self.assertEqual('verified',m['verification']['status'])
   self.assertEqual('confirmed',m['verification']['identity_match'])
   self.assertTrue(m['source']['url'].startswith('https://'))
   self.assertTrue(m['rights']['proof_url'].startswith('https://'))
   self.assertTrue(m['rights']['credit'])
   if m['kind']=='image':
    self.assertEqual('attribution_required',m['rights']['usage'])
    self.assertTrue(m['rights']['license'])
   else:
    self.assertEqual('link_only',m['rights']['usage'])
 def test_original_media_preserved(self):
  for mid,h in M['previous_media_sha256'].items():
   actual=hashlib.sha256(json.dumps(ALL[mid],sort_keys=True,ensure_ascii=False).encode('utf-8')).hexdigest()
   self.assertEqual(h,actual,mid)
 def test_37_agencies(self):
  self.assertEqual(96,len(AG))
  self.assertGreaterEqual(sum(any(m['verification']['status']=='verified' for m in x['media']) for x in AG),37)
  self.assertGreaterEqual(sum(sum(m['verification']['status']=='verified' for m in x['media']) for x in AG),58)
 def test_current_queue(self):
  with (ROOT/'docs/AGENCY_MEDIA_REMAINING_59_QUEUE.csv').open(encoding='utf-8-sig') as f:
   rows=list(csv.DictReader(f))
  self.assertEqual(59,len(rows))
  missing={x['entity_id'] for x in AG if not any(m['verification']['status']=='verified' for m in x['media'])}
  self.assertTrue(missing.issubset({x['entity_id'] for x in rows}))
  with (ROOT/'docs/AGENCY_MEDIA_REMAINING_CURRENT.csv').open(encoding='utf-8-sig') as f:
   self.assertEqual(missing,{x['entity_id'] for x in csv.DictReader(f)})
 def test_candidates_still_held(self):
  self.assertGreaterEqual(sum(sum(m['verification']['status']=='candidate' for m in e['media']) for e in AG),3)
if __name__=='__main__':unittest.main()
