#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Step 2: complete, worldwide, 120-day LL2 upcoming launch collection.

Separate from the reviewed/translated data/upcoming.json. Unknown launch
pads, missions and untranslated names are NOT silently dropped. All pages
must pass the validation gate, or the last successful snapshot is preserved.

Dry run (no writes): python tools/refresh_global_launches.py
Apply via CI/manual: python tools/refresh_global_launches.py --apply
Free, unauthenticated LL2 limit: 15 requests/hour. This independent job is
scheduled in hours separate from the legacy refresh and caps at 12 pages.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
import tempfile
import urllib.parse
import urllib.request

from ll2_compat import API_ROOT
from upcoming_event_contract import EventContractError, utc_datetime

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / 'data' / 'upcoming_global.json'
API = API_ROOT + 'upcoming/'
UA = 'ORBITA/1.0 (https://orbita-site.onrender.com)'
PAGE_SIZE = 100
MAX_PAGES = 12
HORIZON_DAYS = 120


def utcnow():
    return dt.datetime.now(dt.timezone.utc)


def fetch(url):
    req = urllib.request.Request(url, headers={'Accept': 'application/json', 'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=35) as response:
        return json.load(response)


def _obj(value):
    return value if isinstance(value, dict) else {}


def _text(value):
    return value.strip() if isinstance(value, str) else None


def _event(item):
    if not isinstance(item, dict):
        raise EventContractError('Non-object event in LL2 page')
    event_id = _text(item.get('id'))
    net = _text(item.get('net'))
    if not event_id or not net:
        raise EventContractError('LL2 event missing id or net')
    when = utc_datetime(net)
    pad = _obj(item.get('pad'))
    loc = _obj(pad.get('location'))
    provider = _obj(item.get('launch_service_provider'))
    rocket = _obj(item.get('rocket'))
    config = _obj(rocket.get('configuration'))
    mission = _obj(item.get('mission'))
    prec = _obj(item.get('net_precision'))
    status = _obj(item.get('status'))
    return {
        'll2_id': event_id,
        'event_kind': 'launch',
        'net': net,
        # An uncertain/approximate NET must NOT be displayed as confirmed time.
        'net_precision': _text(prec.get('name')),
        'status': _text(status.get('abbrev')),
        'status_name': _text(status.get('name')),
        'launch_name': _text(item.get('name')),
        'rocket_name': _text(config.get('full_name')) or _text(config.get('name')),
        'mission_name': _text(mission.get('name')),
        'mission_type': _text(mission.get('type')),
        'operator_id': provider.get('id'),
        'operator_name': _text(provider.get('name')),
        'operator_country_code': _text(provider.get('country_code')),
        'pad_id': pad.get('id'),
        'pad_name': _text(pad.get('name')),
        'location_id': loc.get('id'),
        'location_name': _text(loc.get('name')),
        'launch_country_code': _text(loc.get('country_code')),
        'last_updated': _text(item.get('last_updated')),
    }, when


def collect(*, now=None, fetcher=None, max_pages=MAX_PAGES):
    now = (now or utcnow()).astimezone(dt.timezone.utc)
    end = now + dt.timedelta(days=HORIZON_DAYS)
    fetcher = fetcher or fetch
    if not 1 <= max_pages <= 12:
        raise ValueError('max_pages must be between 1 and 12')
    since = now.isoformat(timespec='seconds').replace('+00:00', 'Z')
    until = end.isoformat(timespec='seconds').replace('+00:00', 'Z')
    params = {'mode': 'normal', 'format': 'json', 'limit': PAGE_SIZE,
              'ordering': 'net', 'hide_recent_previous': 'true',
              'include_suborbital': 'true',
              'net__gte': since, 'net__lt': until}
    items = []
    seen = set()
    count = None
    offset = 0
    pages = 0
    while True:
        if pages >= max_pages:
            raise EventContractError('LL2 response exceeds page budget; no partial snapshot published')
        url = API + '?' + urllib.parse.urlencode({**params, 'offset': offset})
        page = fetcher(url)
        pages += 1
        if not isinstance(page, dict) or not isinstance(page.get('results'), list):
            raise EventContractError('LL2 page missing results')
        try:
            page_count = int(page['count'])
        except (ValueError, TypeError, KeyError) as exc:
            raise EventContractError('LL2 page has no reliable count') from exc
        if page_count < 1:
            raise EventContractError('No launch results; protect previous snapshot')
        if count is None:
            count = page_count
            if count > max_pages * PAGE_SIZE:
                raise EventContractError('LL2 launch count exceeds request budget')
        elif count != page_count:
            raise EventContractError('LL2 count changed during pagination; retry later')
        results = page['results']
        if not results or len(results) > PAGE_SIZE or offset + len(results) > count:
            raise EventContractError('Invalid or incomplete LL2 page')
        for raw in results:
            event, when = _event(raw)
            if not now <= when < end:
                raise EventContractError('LL2 returned launch outside requested four-month window')
            lid = event['ll2_id']
            if lid in seen:
                raise EventContractError('Duplicate LL2 ID across pages: ' + lid)
            seen.add(lid)
            items.append(event)
        offset += len(results)
        if offset == count:
            if page.get('next'):
                raise EventContractError('LL2 pagination still reports more pages')
            break
        if not page.get('next'):
            raise EventContractError('LL2 stopped before all results were delivered')

    items.sort(key=lambda e: (e['net'], e['ll2_id']))
    return {
        'schema_version': 1,
        'source': 'Launch Library 2 (The Space Devs), v2.3.0',
        'scope': 'all_upcoming_launches_reported_by_source',
        'coverage_status': 'complete_from_source_at_fetch_time',
        'updated_utc': since,
        'window_start_utc': since,
        'window_end_utc_exclusive': until,
        'horizon_days': HORIZON_DAYS,
        'count': len(items),
        'pages_fetched': pages,
        'launches': items,
    }


def write_atomic(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    handle, tmp = tempfile.mkstemp(prefix='.upcoming_global-', suffix='.tmp', dir=path.parent)
    try:
        with os.fdopen(handle, 'w', encoding='utf-8') as fp:
            json.dump(data, fp, ensure_ascii=False, indent=2)
            fp.write('\n')
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Save only after all pages validate')
    args = parser.parse_args(argv)
    try:
        result = collect()
    except Exception as exc:
        print('ERROR — no data changed: %s' % exc)
        return 2
    print('LL2 worldwide upcoming launches, %d days: %d launches / %d pages' % (
        result['horizon_days'], result['count'], result['pages_fetched']))
    print('UTC window: %s — %s' % (result['window_start_utc'], result['window_end_utc_exclusive']))
    if args.apply:
        write_atomic(DATA, result)
        print('Saved validated snapshot:', DATA)
    else:
        print('Dry run: no files written. Use --apply to publish.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
