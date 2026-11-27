#!/usr/bin/env python3
"""Deterministically rebuild the V19 country-card index from the canonical data.
Usage: python3 qa/build_country_fast_index_v19.py
Run after future edits to any of the 14 source data files. Never hand-edit fast JSON.
"""
from pathlib import Path
import json,base64,hashlib
root=Path(__file__).resolve().parents[1]
categories='launch propulsion agency satmaker components payloads ground_services inspace_services university_space test_facility ground_station mission_control'.split()
source_files=['data/companies_'+k+'.json' for k in categories]+['data/sites.json','data/recovery_sites.json']
hash_sources=hashlib.sha256()
for source in source_files:
    hash_sources.update(source.encode('utf-8')+b'\0')
    hash_sources.update((root/source).read_bytes())
merged={}
for category in categories:
    rows=json.loads((root/f'data/companies_{category}.json').read_text(encoding='utf-8'))
    for row in rows:
        if not row or row.get('id') is None:continue
        id=str(row['id'])
        if id not in merged or merged[id].get('__orbita_fast_summary') and not row.get('__orbita_fast_summary'):
            merged[id]=row
companies=[r for r in merged.values() if r.get('id') and not r.get('alias_of_id')]
sites=json.loads((root/'data/sites.json').read_text(encoding='utf-8'))
recoveries=json.loads((root/'data/recovery_sites.json').read_text(encoding='utf-8'))['sites']
# Keep precisely the source fields referenced by country renderEntityCard(),
# country matching, category membership, logo and link selectors.
fields='id cat secondary_categories country country_fa country_ar en fa ar en_d fa_d ar_d city city_fa city_ar location location_fa location_ar loc loc_fa loc_ar lat lon org_type_en org_type_fa org_type_ar maker_class_fa maker_class_en maker_class_ar specialty_fa specialty_en specialty_ar propulsion_category_fa propulsion_category_en propulsion_category_ar recovery_type_fa recovery_type_en recovery_type_ar status logo logo_bg logo_data website website_url site official_website contacts linkedin linkedin_url orbita_verified_profile'.split()
logo_dir=root/'assets/img/country-profile-fast';logo_dir.mkdir(parents=True,exist_ok=True)
expected=set()
def compact(row):
    out={k:row[k] for k in fields if k in row}
    if 'orbita_verified_profile' in out:
        pf=out['orbita_verified_profile']
        if isinstance(pf,dict) and pf.get('summary'):
            out['orbita_verified_profile']={'summary':pf['summary']}
        else:
            out.pop('orbita_verified_profile')
    image=out.get('logo_data')
    if isinstance(image,str) and image.startswith('data:image/'):
        blob=base64.b64decode(image.split(',',1)[1],validate=True)
        ext='.png' if blob.startswith(b'\x89PNG') else '.jpg' if blob.startswith(b'\xff\xd8') else None
        if not ext:raise RuntimeError(f'Unsupported logo format for {row.get("id")}')
        filename=hashlib.sha256(blob).hexdigest()[:20]+ext
        filepath=logo_dir/filename; filepath.write_bytes(blob)
        expected.add(filename)
        out['logo_data']='assets/img/country-profile-fast/'+filename
    return out
payload={'schema_version':1,'source':'canonical dossiers in current ORBITA categories; do not edit independently',
         'sources_sha256':hash_sources.hexdigest(),
         'companies':[compact(x) for x in companies],
         'sites':[compact(x) for x in sites],
         'recoveries':[compact(x) for x in recoveries]}
assert len(payload['companies'])==320 and len(payload['sites'])==79 and len(payload['recoveries'])==20, 'Unexpected source counts; review and update expected validation'
for path in logo_dir.iterdir():
    if path.is_file() and path.name not in expected:raise RuntimeError(f'Orphan projected logo; review before deleting: {path}')
filename=root/'data/country_profile_fast_v1.json'
filename.write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('Wrote',filename.relative_to(root),filename.stat().st_size,'bytes,',len(expected),'exact-logo copies, source SHA-256:',hash_sources.hexdigest())
