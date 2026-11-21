#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Step 1 read-only audit of current curated upcoming launch/landing data."""
import collections
import datetime as dt
import json
from pathlib import Path
from upcoming_event_contract import build_catalog

BASE = Path(__file__).resolve().parents[1]


def read(name):
    return json.loads((BASE / name).read_text(encoding='utf-8'))


def audit(today=None):
    today = today or dt.datetime.now(dt.timezone.utc).date()
    end = today + dt.timedelta(days=120)
    launch_doc = read('data/upcoming.json')
    landing_doc = read('data/upcoming_landings.json')
    launches = launch_doc['launches']
    landings = landing_doc['landings']
    site_rows = read('data/sites.json')
    recovery_rows = read('data/recovery_sites.json')['sites']
    catalog = build_catalog(launches, landings, site_rows, recovery_rows)
    site_index = {s['id']: s for s in site_rows}
    return {
        'audit_utc_date': today.isoformat(),
        'planned_four_month_end_exclusive': end.isoformat(),
        'legacy_curated_launches': len(launches),
        'legacy_curated_landings': len(landings),
        'launches_within_next_120_days_by_NET_not_guaranteed': sum(today.isoformat() <= r['net'][:10] < end.isoformat() for r in launches),
        'launches_outside_next_120_days': sum(not (today.isoformat() <= r['net'][:10] < end.isoformat()) for r in launches),
        'launches_with_past_NET': sum(r['net'][:10] < today.isoformat() for r in launches),
        'manual_launches_preserved': sum(str(r['ll2_id']).startswith('manual-') for r in launches),
        'launches_by_site_country_top10': dict(collections.Counter(site_index[r['site']].get('country') or 'Unknown' for r in launches).most_common(10)),
        'launch_snapshot_updated': launch_doc.get('updated'),
        'launch_snapshot_window_end': launch_doc.get('window_end'),
        'landing_snapshot_updated': landing_doc.get('updated'),
        'landing_snapshot_window_end': landing_doc.get('window_end'),
        'landings_without_credible_date': sum(r['date'] is None for r in landings),
        'landing_dates_in_past': sum(r['date'] is not None and r['date'] < today.isoformat() for r in landings),
        'contract_events_validated': len(catalog),
        'global_feed': read('data/upcoming_global.json')['coverage_status'],
    }


if __name__ == '__main__':
    print(json.dumps(audit(), ensure_ascii=False, indent=2))
