#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Read-only verification of LL2 global launch and landing collection.
Run inside complete ORBITA repository, with outbound HTTPS available:
    python tools/validate_live_global_sources.py --report live_validation.json
Does not modify the snapshots, Git repository, or UI.
"""
from __future__ import annotations
import argparse, datetime as dt, json
from pathlib import Path
from refresh_global_launches import collect as collect_launches
from refresh_global_landings import collect as collect_landings

def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--report',default='')
    phases=p.add_mutually_exclusive_group(required=True)
    phases.add_argument('--launch-only',action='store_true',help='Validate launch source only (quota-safe phase 1)')
    phases.add_argument('--landing-only',action='store_true',help='Validate landing source only (run in a separate UTC hour)')
    a=p.parse_args(argv)
    report={'checked_utc':dt.datetime.now(dt.timezone.utc).isoformat(),
            'method':'direct source API validation; no publishing',
            'launches':{'status':'not_attempted'},'landings':{'status':'not_attempted'}}
    if a.launch_only:
        try:
            data=collect_launches()
            report['launches']={'status':'verified_full_source_window','records':data['count'],
                    'pages':data['pages_fetched'],'coverage':data['coverage_status'],
                    'window_start':data['window_start_utc'],'window_end_exclusive':data['window_end_utc_exclusive'],
                    'country_quality':data['country_quality']}
        except Exception as ex:
            report['launches']={'status':'FAILED','error':str(ex)}
    if a.landing_only:
        try:
            root=Path(__file__).resolve().parents[1]
            has_legacy=all((root / rel).exists() for rel in (
                'data/upcoming_landings.json','data/recovery_sites.json','data/upcoming_global.json'))
            # Source-only probe can run from the standalone patch archive,
            # but that is NOT validation of the curated merge.
            inputs={} if has_legacy else {'curated': {'landings': []},
                'sites': {'sites': []}, 'global_launches': {'launches': []}}
            data=collect_landings(**inputs)
            report['landings']={'status':('verified_partial_only' if has_legacy else 'source_only_probe_no_curated_merge'),
                    'curated_merge_checked':has_legacy, 'records':data['count'],
                    'scanned':data['records_scanned'],'pages':data['pages_fetched'],
                    'supplementary_pages':data['upcoming_pages_fetched'],
                    'supplementary_error':data.get('upcoming_detail_error'),
                    'coverage':data['coverage_status']}
        except Exception as ex:
            report['landings']={'status':'FAILED','error':str(ex)}
    content=json.dumps(report,ensure_ascii=False,indent=2)
    if a.report:
        Path(a.report).write_text(content+'\n',encoding='utf-8')
    print(content)
    return 0 if all(report[name]['status'] in ('not_attempted','verified_full_source_window','verified_partial_only','source_only_probe_no_curated_merge') for name in ('launches','landings')) else 2
if __name__=='__main__':raise SystemExit(main())
