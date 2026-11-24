#!/usr/bin/env python3
"""Extract unresolved legacy tests and missing local logos into non-destructive CSVs."""
from pathlib import Path
import csv
import json
import re
import sys
from collections import Counter
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).parent

def classify(name,filename):
 text=(name+' '+filename).lower()
 if any(x in text for x in ('arabic','_ar.test','i18n','language')):
  return 'localization_or_profile_renderer'
 if any(x in text for x in ('cache','version','token','asset','stylesheet','css','theme')):
  return 'version_or_static_asset_assertion'
 if any(x in text for x in ('country','map','pin','overlay','zoom','hover','splash','marker','cluster','style')):
  return 'map_interaction_or_UI'
 if any(x in text for x in ('count','category','role','propulsion','launch','africa','candidate','source','recovery')):
  return 'dataset_or_schema_expectation'
 return 'needs_manual_diagnosis'

def run(logfile):
 text=Path(logfile).read_text(encoding='utf-8',errors='replace')
 parts=re.findall(r'(?ms)^not ok (\d+) - (.+?)(?=^\s*\.\.\.\s*$)',text)
 results=[]
 for number,body in parts:
  lines=body.splitlines();name=lines[0].strip()
  src=re.search(r"location: '([^']+)'",body)
  err=re.search(r'\n\s+error: (.*)',body)
  filename=(src.group(1).split('/tests/')[-1] if src else 'unknown')
  results.append({'failure_number':number,'test_title':name,'file_and_line':filename,
       'indicative_error':(err.group(1) if err else 'not available')[:500],
       'triage_category':classify(name,filename),'disposition':'unresolved: verify test intent vs current product before changing code'})
 with (OUT/'STAGE8_49_LEGACY_FAILURES.csv').open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(results[0]));w.writeheader();w.writerows(results)
 logos=[]
 for fp in sorted((ROOT/'data').glob('companies_*.json')):
  try:records=json.loads(fp.read_text())
  except Exception:continue
  if not isinstance(records,list):continue
  for o in records:
   for key in ('logo','logo_local','logo_path','logo_data'):
    val=o.get(key)
    if isinstance(val,str) and val.startswith(('assets/','/assets/')) and not (ROOT/val.lstrip('/')).is_file():
     logos.append({'category_file':fp.name,'entity_id':str(o.get('id')),'field':key,'missing_local_path':val,
                   'resolution':'Find authentic logo or retain documented fallback; do not invent logo'})
 with (OUT/'STAGE8_MISSING_LOCAL_LOGOS.csv').open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(logos[0]));w.writeheader();w.writerows(logos)
 overview={'legacy_failure_count':len(results),'failure_group_counts':dict(Counter(x['triage_category'] for x in results)),
           'missing_local_logo_references':len(logos),'unique_missing_logo_paths':len(set(x['missing_local_path'] for x in logos)),
           'important':'classification is indicative, not proof of test obsolescence or operational defect'}
 (OUT/'STAGE8_DIAGNOSTICS_SUMMARY.json').write_text(json.dumps(overview,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(overview,ensure_ascii=False,indent=2))

if __name__=='__main__':
 if len(sys.argv)!=2:raise SystemExit('Usage: generate_diagnostics.py /path/to/node-test.log')
 run(sys.argv[1])
