#!/usr/bin/env python3
# RASPEHR V21-RC1 preflight: run from repository root after applying overlay.
import json,hashlib,sys,re
from pathlib import Path
root=Path(__file__).resolve().parents[2]
manifest=json.loads((Path(__file__).parent/'RELEASE_MANIFEST.json').read_text(encoding='utf-8'))
fail=[]
for rel, expected in manifest['sha256'].items():
    p=root/rel
    if not p.is_file():fail.append('MISSING '+rel)
    elif hashlib.sha256(p.read_bytes()).hexdigest()!=expected:fail.append('HASH '+rel)
html=(root/'index.html').read_text(encoding='utf-8')
for item in ['raspehr-event-parity-v21.css?v=20261127-ux-v21',
             'assets/js/app.js?_t=20261127-ux-v21',
             'upcoming-launch-browser.js?v=20261127-ux-v21',
             'upcoming-landing-browser.js?v=20261127-ux-v21',
             'raspehr-landing-parity']:
    if item not in html:fail.append('HTML_MISSING '+item)
registry=json.loads((root/'raspehr-3d/data/external-links-v1.json').read_text(encoding='utf-8'))['records']
if len(registry)!=420 or len({x['id'] for x in registry})!=420:fail.append('REGISTRY_COUNT_OR_DUPLICATE')
if sum(bool(x.get('google_maps_url')) for x in registry)!=420:fail.append('GOOGLE_MAPS_COUNT')
if sum(bool(x.get('google_maps_satellite_url')) for x in registry)!=420:fail.append('SATELLITE_COUNT')
if sum(bool(x.get('google_earth_direct_url')) for x in registry)!=420:fail.append('EARTH_CANDIDATE_COUNT')
if fail:
    print('FAIL:',len(fail),'release preflight mismatches')
    for item in fail[:25]: print(' -',item)
    sys.exit(1)
print('PASS:',len(manifest['sha256']),'release files SHA-256; 420 unique places; 1260 structurally present links; cache/theme wiring')
