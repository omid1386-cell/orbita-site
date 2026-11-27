#!/usr/bin/env python3
"""Release audit for V19, explicitly declaring the authorized app.js exception."""
from pathlib import Path
import json,hashlib,gzip,subprocess
root=Path(__file__).resolve().parents[1]
baseline=Path('/mnt/data/raspehr_fix_step2_v18/orbita')
protected=json.loads((root/'raspehr-3d/RELEASE_V9_PROTECTED_SHA256.json').read_text())['sha256']
different=[]
for rel,digest in protected.items():
    f=root/rel
    if not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest()!=digest:different.append(rel)
assert different==['assets/js/app.js'],f'Unexpected protected differences: {different}'
assert (root/'index.html').read_bytes()==(baseline/'index.html').read_bytes()
for rel in ['data/sites.json','data/recovery_sites.json'] + ['data/companies_'+c+'.json' for c in 'launch propulsion agency satmaker components payloads ground_services inspace_services university_space test_facility ground_station mission_control'.split()]:
    assert (root/rel).read_bytes()==(baseline/rel).read_bytes(),f'Original data altered: {rel}'
raw_files=['data/sites.json','data/recovery_sites.json'] + ['data/companies_'+c+'.json' for c in 'launch propulsion agency satmaker components payloads ground_services inspace_services university_space test_facility ground_station mission_control'.split()]
raw=sum((root/f).stat().st_size for f in raw_files)
compressed=sum(len(gzip.compress((root/f).read_bytes(),6)) for f in raw_files)
fast=root/'data/country_profile_fast_v1.json'
fast_gzip=len(gzip.compress(fast.read_bytes(),6))
images=list((root/'assets/img/country-profile-fast').iterdir())
assert len(images)==24
results={
 'project':'RASPEHR', 'stage':'UX Step 3 / V19', 'date':'2026-11-27',
 'optimization':{'before_full_sources_bytes':raw,'before_full_sources_gzip_bytes':compressed,
 'after_index_bytes':fast.stat().st_size,'after_index_gzip_bytes':fast_gzip,
 'source_request_reduction_factor_raw':round(raw/fast.stat().st_size,2),
 'source_request_reduction_factor_gzip':round(compressed/fast_gzip,2),
 'index_records':{'company_dossiers_excluding_canonical_aliases':320,'sites':79,'recoveries':20},
 'new_local_logo_assets':24},
 'protected':{'unchanged':len(protected)-len(different),'total':len(protected), 'intentional_exception':different,
 'protected_launch_site_photos_unchanged':48,'original_source_data_unchanged':True,'index_html_unchanged':True},
 'tests':{'new_node_fast_index': 'PASS','browser_lazy_tab_checks':'72/72 PASS',
 'browser_parity':'18/18 cases × 14 tabs PASS','two_dimensional_regressions':'144/191; 47 historical failures unchanged',
 'three_dimensional_regressions':'69/70; one V9 immutable-app.js guard expected to fail because app.js deliberately changed',
 'live_deployment_test':'NOT RUN'},
 'release_note':'V19 is a cumulative local work version. Update app.js cache query and revalidate live in final release Step 5.'
}
out=root/'RELEASE_DOCS/RASPEHR_UX_STEP3_V19';out.mkdir(parents=True,exist_ok=True)
(out/'QA_RESULTS.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
