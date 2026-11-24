#!/usr/bin/env python3
"""RASPEHR Stage 8 offline release audit. No network or deployment side effects."""
from __future__ import annotations
import argparse
import csv
import hashlib
import json
import math
from pathlib import Path
import re
import sys
from collections import Counter

ROOT = Path(__file__).resolve().parents[2]

def load(rel: str):
    return json.loads((ROOT / rel).read_text(encoding='utf-8'))

def sha256(path: Path):
    digest = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024*1024), b''):
            digest.update(chunk)
    return digest.hexdigest()

def check_html_refs(rel: str):
    s=(ROOT / rel).read_text(encoding='utf-8')
    refs=re.findall(r'(?:src|href)\s*=\s*["\']([^"\']+)',s)
    misses=[]
    for ref in refs:
        if ref.startswith(('http:','https:','data:','#','mailto:','tel:','javascript:','//','blob:')):continue
        local=ref.split('?',1)[0].split('#',1)[0]
        if local and not (ROOT / rel).parent.joinpath(local).is_file():
            misses.append(ref)
    return {'total_references':len(refs),'missing_local_references':misses}

def run():
    companies=load('data/companies.json')
    sites=load('data/sites.json')
    recovery=load('data/recovery_sites.json')['sites']
    all_entries=companies+sites+recovery
    ids=[r['id'] for r in all_entries]
    old=load('data/raspehr_coordinates_stage7_provenance.json')['entries']
    approx_ids={r['id'] for r in old}
    media=load('data/media/catalog.v1.json')['entities']
    app=(ROOT/'assets/js/app.js').read_text(encoding='utf-8')
    checks={
       'company_count_321':len(companies)==321,
       'site_count_79':len(sites)==79,
       'recovery_count_20':len(recovery)==20,
       'unique_420_entities':len(all_entries)==len(set(ids))==420,
       'valid_geographical_coordinates':all(isinstance(x.get('lat'),(float,int)) and isinstance(x.get('lon'),(float,int)) and math.isfinite(x['lat']) and math.isfinite(x['lon']) and -90<=x['lat']<=90 and -180<=x['lon']<=180 and (x['lat'],x['lon'])!=(0,0) for x in all_entries),
       '23_disclosed_approximate_references':len(old)==23 and len(approx_ids)==23 and all(x.get('coordinates_precision','').startswith('approximate_') for x in all_entries if x['id'] in approx_ids),
       'no_approximate_point_mislabelled_exact':all(x.get('verification')=='representative_only' for x in old),
       'catalog_has_420_entities':len(media)==420,
       'stage5_toggle_is_lazy_loaded':"if(!loaded){loaded=true;frame.src='raspehr-3d/index.html?raspehr_3d_embedded=1'" in (ROOT/'assets/js/raspehr-stage5-switch.js').read_text(),
       'default_layers_agency_and_site_only':bool(re.search(r'launch:\s*false,\s*propulsion:\s*false,\s*agency:\s*true,\s*satmaker:\s*false,\s*site:\s*true',app)),
       'antarctica_country_dossier_suppressed':'record.iso === "AQ" || record.en === "Antarctica"' in app,
       'updated_app_cache_token_matches':'20261123-stage8-app-final-v1' in (ROOT/'index.html').read_text() and (ROOT/'index.html').read_text().count('20261123-stage8-app-final-v1')==1,
    }
    reference_check={f:check_html_refs(f) for f in ('index.html','raspehr-3d/index.html')}
    checks['all_static_html_dependencies_present']=all(not x['missing_local_references'] for x in reference_check.values())
    media_status=Counter(m.get('verification',{}).get('status','unknown') for x in media for m in x.get('media',[]))
    stage5=ROOT/'assets/js/raspehr-stage5-switch.js'
    tiles=ROOT/'raspehr-3d/assets/dem/terrarium/2'
    dem_files=list(tiles.glob('*/*.png')) if tiles.exists() else []
    dem_info={'local_tiles':len(dem_files),'required_tiles':16,'locally_complete':len(dem_files)==16,'remote_source_configured':'s3.amazonaws.com' in (ROOT/'raspehr-3d/assets/js/terrain-source.js').read_text()}
    data_info={'companies':len(companies),'sites':len(sites),'recovery_sites':len(recovery),'all':len(all_entries),'unique_ids':len(set(ids)),'representative_coordinate_records':len(old),'catalog_entities':len(media),'media_verification_statuses':dict(media_status)}
    result={
      'schema':'raspehr-stage8-audit-v1',
      'scope':'offline static/data checks only; does not claim live browser, live URLs or physical device QA',
      'checks':checks,'data':data_info,'html_local_asset_checks':reference_check,'dem':dem_info,
      'passed':sum(checks.values()),'failed':[k for k,v in checks.items() if not v],
      'release_ready':False,
      'release_blockers':['49 legacy Node tests remain failing','No real deployment and physical-device end-to-end test','16 locally cached real DEM tiles unavailable','23 geographic points are representative, not independently surveyed exact coordinates']
    }
    if len(dem_files)!=16:
      result['release_blockers'].append('DEM will require remote connectivity; offline terrain not proven')
    return result

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',default='qa/stage8/STAGE8_AUDIT.json')
    opts=parser.parse_args()
    result=run()
    out=ROOT / opts.output
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps({'passed':result['passed'],'failed':result['failed'],'release_ready':result['release_ready'],'data':result['data'],'dem':result['dem']},ensure_ascii=False,indent=2))
    sys.exit(0 if not result['failed'] else 1)
