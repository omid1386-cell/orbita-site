#!/usr/bin/env python3
"""Verify and apply incremental RASPEHR GitHub patches onto the Stage 8 ZIP.
Does NOT deploy, alter the live website, or copy full-source ZIPs to GitHub.
Usage: python raspehr_priority6_verify_chain.py STAGE8_FULL.zip P1.zip ... P6.zip --destination /tmp/raspehr-verified
"""
import argparse,hashlib,json,sys,zipfile,shutil
from pathlib import Path

UP='UPLOAD_TO_GITHUB/'
def digest(data): return hashlib.sha256(data).hexdigest()
def file_sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
 return h.hexdigest()
def ensure_safe(root,rel):
 p=root/rel
 if not rel or rel.startswith('/') or '..' in Path(rel).parts or not p.resolve().is_relative_to(root.resolve()):
  raise ValueError('unsafe path: '+rel)
 return p

def apply_one(root,archive,expected_number,base_zip_sha):
 with zipfile.ZipFile(archive) as z:
  assert z.testzip() is None, 'ZIP integrity failed: '+str(archive)
  names=set(z.namelist())
  assert 'MANIFEST.json' in names
  m=json.loads(z.read('MANIFEST.json'))
  priority=m.get('priority',m.get('counts',{}).get('priority'))
  if priority is not None: assert int(priority)==expected_number,(archive.name,priority,expected_number)
  inputs={n[len(UP):]:n for n in names if n.startswith(UP) and not n.endswith('/')}
  assert inputs,archive
  # The prior version's bytes are retained with each delta package.
  rollbacks={n.split('/',1)[1]:n for n in names if n.startswith('ROLLBACK_PRIORITY') and '/' in n and not n.endswith('/') and n.endswith(('.js','.css','.html','.py','.cjs','.json','.md'))}
  verified_preimages=0
  if expected_number==1:
   assert m['baseline_zip_sha256']==base_zip_sha,'P1 base SHA mismatch'
   for row in m['files']:
    dst=ensure_safe(root,row['path'])
    if row['action']=='modified':
     assert dst.is_file() and file_sha(dst)==row['old_sha256'],f'P1 preimage mismatch: {row["path"]}'
     verified_preimages+=1
    elif row['action']=='added':
     assert not dst.exists(),f'P1 new file unexpectedly exists: {row["path"]}'
  else:
   for rel,name in rollbacks.items():
    if rel in inputs:
     dst=ensure_safe(root,rel)
     assert dst.is_file() and file_sha(dst)==digest(z.read(name)),f'Preimage mismatch in P{expected_number}: {rel}'
     verified_preimages+=1
  # Write only files from the specifically designated upload subdirectory.
  for rel,n in sorted(inputs.items()):
   dst=ensure_safe(root,rel);dst.parent.mkdir(parents=True,exist_ok=True)
   dst.write_bytes(z.read(n))
   assert file_sha(dst)==digest(z.read(n))
  return {'priority':expected_number,'zip':archive.name,'files_applied':len(inputs),'preimages_verified':verified_preimages}

def extract_stage8(zippath,folder):
 with zipfile.ZipFile(zippath) as z:
  assert z.testzip() is None
  for name in z.namelist():
   if name.endswith('/'):continue
   assert name.startswith('orbitaa/'),name
   rel=name.removeprefix('orbitaa/')
   path=ensure_safe(folder,rel);path.parent.mkdir(parents=True,exist_ok=True)
   path.write_bytes(z.read(name))

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('stage8_zip',type=Path)
 parser.add_argument('patches',nargs='+',type=Path)
 parser.add_argument('--destination',required=True,type=Path)
 args=parser.parse_args()
 assert len(args.patches)<=6
 if args.destination.exists():
  raise RuntimeError('destination already exists; choose a new empty path')
 args.destination.mkdir(parents=True)
 extract_stage8(args.stage8_zip,args.destination)
 results=[]
 for i,p in enumerate(args.patches,1):results.append(apply_one(args.destination,p,i,file_sha(args.stage8_zip)))
 print(json.dumps({'status':'PASS','applied':results,'destination':str(args.destination)},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
