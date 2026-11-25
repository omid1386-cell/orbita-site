"""Data and source-image audit for static offline launch-site views."""
from pathlib import Path
from PIL import Image
import json,hashlib,collections,re
APP=Path(__file__).resolve().parents[1]
ROOT=APP.parent
j=json.loads((APP/'data/site-views-local.v1.json').read_text('utf-8'))
sites=json.loads((ROOT/'data/sites.json').read_text('utf-8'))
assert len(sites)==79 and len(j['sites'])==79
assert len(set(x['id'] for x in j['sites']))==79
assert set(x['id'] for x in sites)==set(x['id'] for x in j['sites'])
counts=collections.Counter(x['status'] for x in j['sites'])
assert counts==j['counts'],(counts,j['counts'])
assert counts['unavailable']==31 and sum(c for k,c in counts.items() if k!='unavailable')==48
valid=0
for rec in j['sites']:
 if rec['status']=='unavailable':assert not rec['files'];continue
 assert len(rec['files'])==1
 f=rec['files'][0]
 assert re.fullmatch('assets/site-views/photos/[a-z0-9-]+\\.jpg',f['src'])
 img=APP/f['src']
 assert img.is_file(),img
 assert hashlib.sha256(img.read_bytes()).hexdigest()==f['sha256'],img
 assert f['source_url'].startswith('https://'),rec['id']
 assert f['license'].strip() and f['credit'].strip(),rec['id']
 with Image.open(img) as im:assert im.width>=500 and im.height>=300
 valid+=1
assert valid==48
for path in [APP/'assets/js/site-views.js',APP/'assets/css/site-views.css',APP/'index.html']:
 assert path.is_file()
print('PASS 79 unique records, 48 local JPEG assets with SHA/source/rights/size, 31 honest gaps, local-only paths')
print('BREAKDOWN',dict(counts))
