import unittest,json,csv,re,hashlib,collections
from pathlib import Path
P=Path('/mnt/data/ORBITA_Language_Step2_Work'); B=P/'base/data'; U=P/'updated/data'
BASE={p.name:json.loads(p.read_text()) for p in B.glob('*.json')}
OUT={p.name:json.loads(p.read_text()) for p in U.glob('*.json')}
GAPS=list(csv.DictReader(open('/mnt/data/orbita_i18n_audit/unresolved_language_gaps.csv',encoding='utf-8-sig')))
IDX={f:{x['id']:x for x in arr} for f,arr in OUT.items()}
ALLOWED_EN={'customers_en','partners_en','location_en','founder_en'}
def exact_unchanged(a,b,path='root'):
 if isinstance(a,dict):
  assert isinstance(b,dict),path
  for k in a:
   if k.endswith('_ar') or k in ALLOWED_EN:continue
   assert k in b,(path,k)
   exact_unchanged(a[k],b[k],path+'.'+k)
  for k in b:
   if k not in a:assert k.endswith('_ar') or k=='location_en',(path,k)
 elif isinstance(a,list):
  assert isinstance(b,list) and len(a)==len(b),path
  for i,(x,y) in enumerate(zip(a,b)):exact_unchanged(x,y,path+f'[{i}]')
 else:assert a==b,(path,a,b)

class TestRelease(unittest.TestCase):
 def test_schema_and_baselines(self):
  self.assertEqual(set(BASE),set(OUT))
  for f in BASE:
   exact_unchanged(BASE[f],OUT[f],f)
 def test_existing_506_missing_ar_completed(self):
  self.assertEqual(len(GAPS),506)
  for x in GAPS:
   obj=IDX[x['file']][x['id']]
   v=obj.get(x['missing_field'])
   self.assertTrue(v,f"{x['file']} {x['id']} {x['missing_field']}")
   if isinstance(obj[x['persian_field']],list):
    self.assertEqual(len(v),len(obj[x['persian_field']]))
 def test_all_155_additional_ar(self):
  f=OUT['companies_launch.json']
  for x in f:
   for fa,ar in [('org_type_fa','org_type_ar'),('ceo_fa','ceo_ar'),('founder_fa','founder_ar')]:
    if x.get(fa):self.assertTrue(x.get(ar),(x['id'],ar))
  f=OUT['companies_agency.json']
  for x in f:
   if x.get('timeline_fa'):
    self.assertEqual(len(x['timeline_fa']),len(x.get('timeline_ar') or []))
  f=OUT['companies_satmaker.json']
  for x in f:
   for fa,ar in [('verified_role_fa','verified_role_ar'),('record_location_role_fa','record_location_role_ar')]:
    if x.get(fa): self.assertTrue(x.get(ar),(x['id'],ar))
  self.assertTrue(IDX['sites.json']['sutherland']['coordinate_note_ar'])
 def test_satmaker_milestones_renderer_expected_keys(self):
  for x in OUT['companies_satmaker.json']:
   if x.get('milestones_ar'):
    for item in x['milestones_ar']:
     self.assertTrue(item.get('title_ar'),x['id'])
     # Pre-existing milestones_ar can be title-only; newly completed milestones require description.
     if x['id'] in [r['id'] for r in GAPS if r['persian_field']=='milestones_fa']:
      self.assertTrue(item.get('desc_ar'),x['id'])
 def test_english_customer_partners_equivalent_length(self):
  for x in OUT['companies_launch.json']:
   for lang in ['en','ar']:
    for group in ['customers','partners']:
     if x.get(group+'_fa'):
      self.assertEqual(len(x[group+'_fa']),len(x.get(group+'_'+lang) or []),(x['id'],group,lang))
 def test_aggregate_specialized_consistency(self):
  agg=IDX['companies.json']
  for f in ['companies_launch.json','companies_agency.json','companies_propulsion.json','companies_satmaker.json']:
   for x in OUT[f]:
    if x['id'] not in agg: continue
    a=agg[x['id']]
    if a.get('cat')!=x.get('cat'):continue
    for k,v in x.items():
     if k.endswith('_ar') or k in ALLOWED_EN:
      if k in a:self.assertEqual(v,a[k],(x['id'],k))
 def test_valid_english_location_additions(self):
  for x in OUT['companies_satmaker.json']:
   if x.get('location_fa'):self.assertTrue(x.get('location_en'),x['id'])
  for x in OUT['companies_propulsion.json']:
   if x.get('location_fa'):self.assertTrue(x.get('location_en'),x['id'])
 def test_no_generic_english_placeholder_in_new_ar(self):
  for r in GAPS:
   v=IDX[r['file']][r['id']][r['missing_field']]
   txt=json.dumps(v,ensure_ascii=False).lower()
   self.assertNotIn('details available in english',txt)
   self.assertNotIn('التفاصيل متاحة باللغة الإنجليزية',txt)
 def test_no_record_count_changes(self):
  for f in BASE:
   self.assertEqual([x['id'] for x in BASE[f]],[x['id'] for x in OUT[f]],f)

if __name__=='__main__':unittest.main(verbosity=2)
