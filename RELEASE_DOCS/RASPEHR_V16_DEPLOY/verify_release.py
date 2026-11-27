#!/usr/bin/env python3
"""RASPEHR V16 release candidate: offline source and direct-link preflight.
Run: python RELEASE_DOCS/RASPEHR_V16_DEPLOY/verify_release.py
No network, repo edits or deployment. Exits nonzero on any failed gate.
"""
import hashlib
import html.parser
import json
from pathlib import Path
import re
import sys
from urllib.parse import quote, urlparse, parse_qs
from collections import Counter

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / 'RELEASE_DOCS/RASPEHR_V16_DEPLOY/PREFLIGHT_RESULTS.json'
APP = ROOT / 'raspehr-3d'
checks = []

def chk(name, ok, detail=''):
    checks.append(dict(name=name, passed=bool(ok), detail=str(detail)))
    print(('PASS' if ok else 'FAIL'), name, str(detail)[:180])

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

for p in ['index.html','assets/js/raspehr-stage5-switch.js','raspehr-3d/index.html',
          'raspehr-3d/assets/js/external-map-links-v1.js',
          'raspehr-3d/assets/css/external-map-links-v1.css',
          'raspehr-3d/data/external-links-v1.json',
          'data/companies.json','data/sites.json','data/recovery_sites.json','render.yaml']:
    chk('file:'+p,(ROOT/p).is_file())

protected=json.loads((APP/'RELEASE_V9_PROTECTED_SHA256.json').read_text())['sha256']
wrong=[k for k,v in protected.items() if not (ROOT/k).is_file() or sha(ROOT/k)!=v]
chk('protected_sha256',len(protected)==887 and not wrong, f'{len(protected)} files, {len(wrong)} mismatches: {wrong[:3]}')
site_photos=[k for k in protected if 'site-views/photos/' in k]
chk('protected_site_photos',len(site_photos)==48,f'{len(site_photos)} photos')

companies=json.loads((ROOT/'data/companies.json').read_text())
sites=json.loads((ROOT/'data/sites.json').read_text())
recovery=json.loads((ROOT/'data/recovery_sites.json').read_text())
recovery_list=recovery['sites'] if isinstance(recovery,dict) else recovery
canonical={(kind,str(x['id'])):x for kind,rows in [('company',companies),('site',sites),('recovery',recovery_list)] for x in rows}
chk('canonical_counts',len(companies)==321 and len(sites)==79 and len(recovery_list)==20 and len(canonical)==420,
    f'companies {len(companies)}, sites {len(sites)}, recovery {len(recovery_list)}, keys {len(canonical)}')

registry=json.loads((APP/'data/external-links-v1.json').read_text())
records=registry['records']
keys=[(x['kind'],str(x['id'])) for x in records]
chk('registry_coverage',len(records)==420 and len(set(keys))==420 and set(keys)==set(canonical),
    f'records={len(records)}, keys={len(set(keys))}, unmatched={len(set(keys)^set(canonical))}')
status=Counter(x.get('google_earth_direct_status') for x in records)
chk('direct_earth_status',status=={'generated_pattern_unverified':415,'pilot_user_confirmed':5},repr(status))
chk('no_false_verified_earth_share',not any(x.get('google_earth_live_checked') is True for x in records))

mapfail=[];earthfail=[];coordfail=[]
for x in records:
    key=x['kind'],str(x['id']); src=canonical.get(key)
    if not src: continue
    lat,lon=x['lat'],x['lon']
    if any((abs(float(src[a])-x[a])>1e-7) for a in ('lat','lon')):coordfail.append(key)
    js_num=lambda n: str(int(n)) if isinstance(n,(float,int)) and float(n).is_integer() else str(n)
    coords=js_num(lat)+','+js_num(lon)
    m='https://www.google.com/maps/search/?api=1&query='+quote(coords,safe='')
    zoom={'company':16,'site':15,'recovery':11}[x['kind']]
    sat='https://www.google.com/maps/@?api=1&map_action=map&center='+quote(coords,safe='')+f'&zoom={zoom}&basemap=satellite'
    if x.get('google_maps_url')!=m or x.get('google_maps_satellite_url')!=sat:mapfail.append(key)
    u=x.get('google_earth_direct_url',''); p=urlparse(u)
    camera=x.get('google_earth_direct_camera') or {}
    frag=re.fullmatch(r'/web/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),0a,(\d+)d,35y,0h,(\d+)t,0r',p.path)
    if not(p.scheme=='https' and p.netloc=='earth.google.com' and frag
       and abs(float(frag.group(1))-lat)<1e-7 and abs(float(frag.group(2))-lon)<1e-7
       and 500 <=int(frag.group(3)) <=100000 and 0<=int(frag.group(4))<=80
       and int(frag.group(3))==camera.get('range_m') and int(frag.group(4))==camera.get('tilt_deg')
       and not p.query and not p.fragment): earthfail.append(key)
chk('coordinates_identical_to_source',not coordfail,str(coordfail[:6]))
chk('google_maps_urls',not mapfail,f'840 links, mismatched={mapfail[:6]}')
chk('direct_earth_urls',not earthfail,f'420 links, malformed={earthfail[:6]}')

class LocalRefs(html.parser.HTMLParser):
    def __init__(self):super().__init__();self.items=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='script' and a.get('src'):self.items.append(('script',a['src']))
        if tag=='link' and a.get('href') and a.get('rel') not in ('canonical',):self.items.append(('link',a['href']))
        if tag in ('img','source') and a.get('src'):self.items.append((tag,a['src']))

missing=[];ref_count=0
for html in [ROOT/'index.html',APP/'index.html']:
    parser=LocalRefs();parser.feed(html.read_text(encoding='utf-8'))
    for tag,ref in parser.items:
        if re.match(r'^(https?:|data:|//|#|mailto:)',ref):continue
        if not ref or ref.startswith('{'):continue
        target=(html.parent/ref.split('?',1)[0].split('#',1)[0]).resolve()
        ref_count+=1
        if not target.is_relative_to(ROOT) or not target.is_file():missing.append((html.relative_to(ROOT).as_posix(),tag,ref))
chk('html_static_assets',not missing,f'{ref_count} local references, missing={missing[:8]}')

html3=(APP/'index.html').read_text()
roothtml=(ROOT/'index.html').read_text()
chk('cache_version_for_external_links',
    html3.count('?v=20261126-v16-final-release')==2,
    'CSS and JS both contain final-release cache token')
chk('root_loads_3d_switch',
    'raspehr-stage5-switch.js' in roothtml and 'raspehr-3d/index.html' in (ROOT/'assets/js/raspehr-stage5-switch.js').read_text())
chk('earth_external_navigation_secure',
    'id="atlasGoogleEarthLink"' in html3 and 'rel="noopener noreferrer"' in html3 and
    'safeDirectEarthLink' in (APP/'assets/js/external-map-links-v1.js').read_text() )
chk('render_service_is_report_api',
    'rootDir: report-api' in (ROOT/'render.yaml').read_text() and 'orbita-report-api' in (ROOT/'render.yaml').read_text(),
    'render.yaml contains report API; static frontend deploy must be configured separately')

results={'project':'RASPEHR','release':'V16-RC1','offline_only':True,'tests':checks,'passed':sum(x['passed'] for x in checks),'failed':sum(not x['passed'] for x in checks)}
REPORT.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('TOTAL',results['passed'], 'passed;',results['failed'],'failed')
sys.exit(0 if results['failed']==0 else 1)
