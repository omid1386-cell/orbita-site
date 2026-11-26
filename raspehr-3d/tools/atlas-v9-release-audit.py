#!/usr/bin/env python3
"""RASPEHR V9 offline release audit; cannot certify a live site or real user devices."""
import argparse
from pathlib import Path
import json, hashlib, re, sys

ROOT = Path(__file__).resolve().parent.parent.parent
IMAGE_EXT={'.jpg','.jpeg','.png','.webp','.svg','.gif','.avif','.tif','.tiff','.bmp'}

def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1048576),b''): h.update(block)
    return h.hexdigest()

def check(checks,key,condition,detail=None):
    checks.append({'id':key,'status':'PASS' if condition else 'FAIL', **({'detail':detail} if detail else {})})

def main():
    parser=argparse.ArgumentParser(description='RASPEHR V9 offline release audit, no deployment')
    parser.add_argument('--output',type=Path,help='write JSON results')
    args=parser.parse_args()
    checks=[]
    lock=json.loads((ROOT/'raspehr-3d/RELEASE_V9_PROTECTED_SHA256.json').read_text(encoding='utf8'))
    bad=[k for k,v in lock['sha256'].items() if not (ROOT/k).is_file() or sha(ROOT/k)!=v]
    check(checks,'protected_files_unchanged',not bad,f'{len(lock["sha256"])} protected files; discrepancies: {bad[:5]}')
    check(checks,'exactly_48_existing_site_photos',len([k for k in lock['sha256'] if k.startswith('raspehr-3d/assets/site-views/photos/')])==48)
    try:
        companies=json.loads((ROOT/'data/companies.json').read_text(encoding='utf8'))
        sites=json.loads((ROOT/'data/sites.json').read_text(encoding='utf8'))
        recovery=json.loads((ROOT/'data/recovery_sites.json').read_text(encoding='utf8'))['sites']
        combined=companies+sites+recovery
        check(checks,'dossiers_420_unique',len(combined)==420 and len({r['id'] for r in combined})==420)
        check(checks,'site_records_79',len(sites)==79)
        check(checks,'recovery_records_20',len(recovery)==20)
    except Exception as ex: check(checks,'data_parse',False,str(ex))
    for pageid,htmlpath in [('2d','index.html'),('3d','raspehr-3d/index.html')]:
        html=(ROOT/htmlpath).read_text(encoding='utf8')
        hrefs=re.findall(r'<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*["\']([^"\']+)',html,re.I)
        missing=[]
        for href in hrefs:
            local=href.split('?')[0].split('#')[0]
            if re.match(r'^(?:[a-z]+:|//)',local,re.I):continue
            if not (ROOT/htmlpath).parent.joinpath(local).resolve().is_file():missing.append(href)
        check(checks,f'{pageid}_static_references_exist',not missing,f'{len(hrefs)} references, missing: {missing[:8]}')
        ids=re.findall(r'\bid\s*=\s*["\']([^"\']+)',html,re.I)
        from collections import Counter
        duplicates=[k for k,v in Counter(ids).items() if v>1]
        check(checks,f'{pageid}_no_duplicate_ids',not duplicates,f'{len(ids)} ids, duplicates: {duplicates[:8]}')
    check(checks,'no_unintended_deploy_artifact',not (ROOT/'.env').exists() and not (ROOT/'report-api/.env').exists())
    check(checks,'preserved_pragmatic_external_service_disclosure', 'https://' in (ROOT/'raspehr-3d/assets/js/local-facility-view.js').read_text(encoding='utf8') and True)
    fails=[r for r in checks if r['status']!='PASS']
    result={
       'project':'RASPEHR','stage':'V9',
       'offline_checks':checks,'offline_passed':len(checks)-len(fails),'offline_failed':len(fails),
       'test_status':{'3d_all_node':'see QA report; run node --test raspehr-3d/tests/*.test.cjs',
                      '2d_all_node':'47 existing failing tests in V8 baseline; not presumed resolved'},
       'blocked_release_gates':['47 unresolved 2D tests require owner assessment or verified fixes',
           'WebGL not validated against this build in a real browser',
           'mobile touch/performance not validated on physical devices',
           'no staging/production deployment or smoke test'],
       'release_approved':False,'offline_audit_passed':not fails,
       'warning':'PASS means offline structural integrity only, not permission to publish.'}
    rendered=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(rendered,encoding='utf8')
    print(rendered)
    return 1 if fails else 0
if __name__=='__main__':sys.exit(main())
