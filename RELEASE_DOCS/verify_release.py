#!/usr/bin/env python3
"""Read-only integrity and compatibility checker for ORBITA RC1."""
import hashlib, json, sys, argparse
from pathlib import Path
HERE=Path(__file__).resolve().parent
PARENT=HERE.parent
manifest=json.loads((HERE/'ORBITA_STEP9_MANIFEST.json').read_text(encoding='utf-8'))
def sh(p): return hashlib.sha256(p.read_bytes()).hexdigest()
p=argparse.ArgumentParser()
p.add_argument('--target',help='Existing ORBITA code repository path (do not change automatically)')
p.add_argument('--mode',choices=['before','after'],default='before')
a=p.parse_args()
errors=[]
for name,info in manifest['files'].items():
    f=PARENT/name
    if not f.is_file() or sh(f)!=info['sha256']: errors.append('Package corrupt: '+name)
if a.target:
    t=Path(a.target)
    if not t.is_dir(): errors.append('Target folder not found')
    else:
        for name,info in manifest['files'].items():
            dest=t/name
            if a.mode=='after':
                if not dest.is_file() or sh(dest)!=info['sha256']: errors.append('Post-install mismatch: '+name)
            else:
                old=info.get('original_sha256')
                if old and dest.is_file() and sh(dest) not in (old,info['sha256']):errors.append('Target existing file differs from supplied baseline: '+name)
                if old and not dest.exists():errors.append('Target required file missing: '+name)
                if info['action']=='add' and dest.exists() and sh(dest)!=info['sha256']:errors.append('Target has different file at new path: '+name)
print('Checked %d release files; %d problem(s); mode=%s' %(len(manifest['files']),len(errors),a.mode))
for err in errors: print('ERROR:',err)
sys.exit(1 if errors else 0)
