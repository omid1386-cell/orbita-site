"""Deterministic scientific-data preservation and release-integrity validation.
Does not claim independent historical fact checking or internet verification.
"""
import json,hashlib,re,sys,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(__file__).resolve().parent.parent
with (root/'data/companies.json').open() as f: master=json.load(f)
assert len(master)==274 and len({r['id'] for r in master})==274
allids={x['id']:x for x in master}
slices={}
for p in (root/'data').glob('companies_*.json'):
 rows=json.loads(p.read_text(encoding='utf-8'));slices[p.stem]=len(rows)
 for row in rows:
  assert row['id'] in allids,(p,row['id'])
  assert row==allids[row['id']],(p,row['id'],'differs from canonical')
expected={'components':3,'payloads':1,'ground_services':1,'inspace_services':1,
  'test_facility':1,'ground_station':1,'mission_control':1,'university_space':2}
for category,n in expected.items():
 assert slices['companies_'+category]==n,(category,slices['companies_'+category])
pilots=[r for r in master if r.get('orbita_verified_profile')]
assert len(pilots)==11,len(pilots)
for r in pilots:
 assert (root/r['logo']).is_file(),r['id']
 assert r['logo_kind']=='orbita_editorial_nonofficial',r['id']
 assert len(r['orbita_verified_profile']['sections'])==5,r['id']
 sources={s['id']:s['url'] for s in r['orbita_verified_profile']['sources']}
 for section in r['orbita_verified_profile']['sections']:
  assert all(section.get(l) for l in ['fa','en','ar']),(r['id'],section['id'])
  for item in section['items']:
   assert all(item.get(l) for l in ['fa','en','ar']),(r['id'],section['id'],item)
   assert all(sources.get(sid,'').startswith('https://') for sid in item['source_ids']),(r['id'],item)
 for k in ('lat','lon'):
  assert isinstance(r[k],(float,int)),(r['id'],k)
 assert (-90<=r['lat']<=90 and -180<=r['lon']<=180),r['id']
for f in (root/'assets/logos/orbita').glob('*.svg'):
 x=ET.parse(f);assert x.getroot().tag.endswith('svg'),f
assert len(list((root/'assets/logos/orbita').glob('*.svg')))==11
graph=json.loads((root/'data/verified_relations.json').read_text())
assert len(graph['nodes'])==27 and len(graph['edges'])==24
nodes={n['id']:n for n in graph['nodes']}
assert len(nodes)==27
for n in nodes.values():
 if n['kind']=='map_entity':assert n['id'] in allids,n['id']
for e in graph['edges']:
 assert e['from_id'] in nodes and e['to_id'] in nodes,e['id']
 assert all(e.get(l) for l in ('fa','en','ar')),e['id']
 assert e['source_url'].startswith('https://'),e['id']
# Protected scientific descriptions: the pre-pilot 266 records from stage 2
# are preserved exactly except the 3 known, documented multi-role enrichments.
import zipfile
baseline=Path('/mnt/data/ORBITA_Language_Verification_Complete_2026-11-12.zip')
if baseline.is_file():
 with zipfile.ZipFile(baseline) as z: old=json.loads(z.read('data/companies.json'))
 assert len(old)==266
 changed={}
 for r in old:
  now=allids[r['id']]
  fields=[k for k in set(r)|set(now) if r.get(k)!=now.get(k)]
  if fields:changed[r['id']]=fields
 assert set(changed).issubset({'cubespace','blue-canyon','dragonfly-space'}),changed
 allowed={'logo','logo_kind','secondary_categories','orbita_verified_profile','orbita_marker_code','coordinate_precision'}
 for id,cols in changed.items():assert set(cols).issubset(allowed),(id,cols)
print(json.dumps({'canonical_entities':len(master),'verified_pilot_profiles':len(pilots),
 'original_entities_preserved':266,'relations':len(graph['edges']),
 'map_related_nodes':sum(n['kind']=='map_entity' for n in nodes.values()),
 'nongeo_nodes':sum(n['kind']!='map_entity' for n in nodes.values()),
 'new_logo_svgs':11,'new_category_counts':expected,'historical_baseline_compared':baseline.is_file()},ensure_ascii=False,indent=2))
