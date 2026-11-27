#!/usr/bin/env python3
"""V23 offline release verify, invoke from ANY cwd; no network requests."""
import hashlib,json,pathlib,sys
root=pathlib.Path(__file__).resolve().parents[2]
manifest=json.loads((pathlib.Path(__file__).parent/'CHANGE_MANIFEST.json').read_text(encoding='utf-8'))
errors=[]
for rel,item in manifest['files'].items():
    path=root/rel
    if not path.is_file():errors.append('missing '+rel);continue
    if hashlib.sha256(path.read_bytes()).hexdigest()!=item['sha256']:errors.append('hash mismatch '+rel)
html=(root/'index.html').read_text(encoding='utf-8')
css=(root/'assets/css/launch-mission-ui.css').read_text(encoding='utf-8')
if 'launch-mission-ui.css?v=20261127-ux-v23-launch-card-fix' not in html:errors.append('cache token absent')
if '#globalLaunchDialog .global-launch-results > .global-launch-card' not in css:errors.append('launch-only flex guard absent')
print('RASPEHR V23 release verification:', 'PASS' if not errors else 'FAIL')
print('Files tested:',len(manifest['files']))
for e in errors:print('ERROR',e)
sys.exit(bool(errors))
