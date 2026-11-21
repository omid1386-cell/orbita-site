#!/usr/bin/env python3
"""Verify installed cumulative ORBITA media overlay against SHA256 manifest."""
import hashlib,json,pathlib,sys
root=pathlib.Path(__file__).resolve().parents[1]
man=json.loads((root/'RELEASE_DOCS/ORBITA_MEDIA_CUMULATIVE_MANIFEST.json').read_text('utf8'))
errors=[]
for rel,expected in man['sha256_by_file'].items():
    path=root/rel
    if not path.is_file(): errors.append('MISSING '+rel); continue
    actual=hashlib.sha256(path.read_bytes()).hexdigest()
    if actual!=expected: errors.append('MISMATCH '+rel)
if errors:
    print('INTEGRITY FAIL',len(errors));print('\n'.join(errors));sys.exit(1)
print('INTEGRITY OK',len(man['sha256_by_file']),'payload files')
