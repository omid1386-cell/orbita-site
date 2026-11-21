#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ORBITA steps 5/6: evidence-aware, 120-day *best-effort* landing index.

The LL2 /landings/ endpoint supports ID ordering but does NOT offer a landing
schedule date filter. Consequently this index is intentionally NOT advertised
as an exhaustive worldwide landing schedule. We scan the recent landing IDs
and augment with existing manually curated upcoming landings, without touching
that curated snapshot. A first-stage launch NET is only an associated launch
DATE, never an asserted landing instant; spacecraft mission_end is likewise
an approximate landing-date proxy when a landing is explicitly recorded.

API calls: <= 8 list requests per scheduled run, in its own LL2 hourly slot.
No user-visible estimates or sample entries are published on network failure.
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
from ll2_country import country_code
from upcoming_event_contract import utc_datetime, utc_date, EventContractError

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'data' / 'upcoming_global_landings.json'
LEGACY = ROOT / 'data' / 'upcoming_landings.json'
GLOBAL_LAUNCHES = ROOT / 'data' / 'upcoming_global.json'
API = API_ROOT.rsplit('launches/', 1)[0] + 'landings/'
UPCOMING_API = API_ROOT + 'upcoming/'
PAGE_SIZE = 100
MAX_PAGES = 8
MAX_UPCOMING_PAGES = 4
DAYS = 120
UA = 'ORBITA/1.0 (https://orbita-site.onrender.com)'

# Fixed, unambiguous operator affiliations; not derived from vessel registration.
CURATED_OPERATOR_COUNTRY = {
    'SpaceX': 'USA', 'Blue Origin': 'USA', 'Sierra Space': 'USA',
    'NASA / Boeing': 'USA',
}
CURATED_LAND_COUNTRY = {'United States': 'USA', 'China': 'CHN',
                        'Australia': 'AUS', 'Kazakhstan': 'KAZ'}



def utcnow():
    return dt.datetime.now(dt.timezone.utc)


def fetch(url):
    req = urllib.request.Request(url, headers={'Accept':'application/json', 'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=40) as response:
        return json.load(response)


def obj(value):
    return value if isinstance(value, dict) else {}


def txt(value):
    return str(value).strip() if isinstance(value, (str, int)) and str(value).strip() else None


def from_source_date(value):
    if not value:
        return None
    try:
        return utc_datetime(value).date() if 'T' in str(value) else utc_date(str(value))
    except (EventContractError, TypeError):
        return None


def country_of(location):
    return country_code(location)


def associated_launch(record):
    fs = obj(record.get('firststage'))
    space = obj(record.get('spacecraftflight'))
    payload = obj(record.get('payloadflight'))
    for linked in (obj(obj(fs.get('rocket')).get('launch')), obj(obj(space.get('rocket')).get('launch')),
                   obj(obj(payload.get('rocket')).get('launch'))):
        if linked:
            return linked
    return {}


def parse_landing(record, launch_by_id, now, end):
    if not isinstance(record, dict) or record.get('attempt') is not True or record.get('success') is not None:
        return None
    landing_id = txt(record.get('id'))
    if not landing_id:
        raise EventContractError('landing has missing ID')
    landing_type = obj(record.get('type'))
    if str(landing_type.get('abbrev', '')).upper() in {'ATM', 'DEO'}:
        return None  # destructive re-entry is not a future landing attempt

    firststage = obj(record.get('firststage'))
    spacecraft = obj(record.get('spacecraftflight'))
    launch = associated_launch(record)
    lid = txt(launch.get('id'))
    cached_launch = launch_by_id.get(lid) if lid else None
    # spacecraft mission-end is a *date proxy*, not a confirmed recovery time
    mission_end = from_source_date(spacecraft.get('mission_end'))
    launch_net = txt(launch.get('net')) or (cached_launch or {}).get('net')
    launch_date = from_source_date(launch_net)
    if mission_end:
        date, basis = mission_end, 'spacecraft_mission_end_estimate'
    elif firststage and launch_date:
        date, basis = launch_date, 'associated_launch_date_not_landing_time'
    else:
        return None  # no defensible future calendar day
    if not now.date() <= date < end.date() + dt.timedelta(days=1):
        return None

    location = obj(record.get('landing_location'))
    site = obj(location.get('location'))
    provider = obj(launch.get('launch_service_provider'))
    if not provider and cached_launch:
        provider = {'name': cached_launch.get('operator_name'), 'country_code': cached_launch.get('operator_country_code')}
    launcher = obj(firststage.get('launcher'))
    config = obj(launcher.get('launcher_config'))
    craft = obj(spacecraft.get('spacecraft'))
    craft_cfg = obj(craft.get('spacecraft_config'))
    mission = obj(launch.get('mission'))
    return {
        'event_id': 'landing:ll2:' + landing_id,
        'event_kind': 'landing',
        'll2_landing_id': landing_id,
        'll2_id': lid,
        'date_utc': date.isoformat(),
        # All new landing records use a date-only basis; NEVER expose a fictitious landing HH:mm.
        'date_basis': basis,
        'net_precision': 'Day (estimated)',
        'status': 'planned',
        'mission_name': txt(mission.get('name')) or txt(launch.get('name')) or txt(craft.get('name')) or 'Landing attempt',
        'vehicle_name': txt(config.get('full_name') or config.get('name')) or txt(craft_cfg.get('name')),
        'landing_type': txt(landing_type.get('name')),
        'landing_type_code': txt(landing_type.get('abbrev')),
        'operator_name': txt(provider.get('name')),
        'operator_country_code': country_code(provider),
        # Offshore vessels/ocean have NO country just because the operator is from one.
        'recovery_country_code': country_of(site),
        'recovery_location_name': txt(location.get('name')),
        'landing_location_abbrev': txt(location.get('abbrev')),
        'description': txt(record.get('description')),
        'related_launch_id': lid,
        'source': 'LL2 landing record',
    }


def curated_record(row, sites, now, end):
    if not isinstance(row, dict) or not row.get('date'):
        return None
    date = from_source_date(row.get('date'))
    if not date or not now.date() <= date < end.date() + dt.timedelta(days=1):
        return None
    # Do not pretend operator nationality is known from a ship's flag or name.
    site = sites.get(row.get('site_id'), {})
    return {
        'event_id': 'landing:curated:' + str(row['id']),
        'event_kind': 'landing',
        'll2_landing_id': None,
        'll2_id': txt(row.get('ll2_id')),
        'date_utc': date.isoformat(),
        'date_basis': 'curated_schedule_date_unverified',
        'net_precision': 'Day (curated; recheck schedule)',
        'status': txt(row.get('status')) or 'tbc',
        'mission_name': txt(row.get('mission')) or txt(row.get('mission_fa')),
        'vehicle_name': txt(row.get('vehicle_en')),
        'landing_type': txt(row.get('mtype_en')) or txt(row.get('ltype')),
        'landing_type_code': txt(row.get('ltype')),
        'operator_name': txt(row.get('operator_en')),
        'operator_country_code': CURATED_OPERATOR_COUNTRY.get(row.get('operator_en')),
        'recovery_country_code': (CURATED_LAND_COUNTRY.get(site.get('country'))
                                  if site.get('recovery_type') not in ('droneship', 'splashdown_zone') else None),
        'recovery_location_name': txt(site.get('en')) or txt(row.get('site_id')),
        'landing_location_abbrev': None,
        'description': txt(row.get('note_en')),
        'related_launch_id': txt(row.get('ll2_id')),
        'source': 'ORBITA legacy landing schedule (requires verification)',
    }



def from_upcoming_detailed(item, now, end):
    """Only stage/spacecraft landing objects that explicitly say attempt=true."""
    if not isinstance(item, dict):
        return []
    launch_id = txt(item.get('id'))
    net = from_source_date(item.get('net'))
    if not launch_id or not net or not now.date() <= net < end.date() + dt.timedelta(days=1):
        return []
    provider = obj(item.get('launch_service_provider'))
    mission = obj(item.get('mission'))
    rocket = obj(item.get('rocket'))
    config = obj(rocket.get('configuration'))
    out = []
    # A detailed upcoming launch may embed multiple independently planned
    # landing attempts (boosters + spacecraft). Do not merge their identities.
    for stage_kind, key in (('booster', 'launcher_stage'), ('spacecraft', 'spacecraft_stage')):
        for i, stage in enumerate(rocket.get(key) or []):
            if not isinstance(stage, dict): continue
            landing = obj(stage.get('landing'))
            if landing.get('attempt') is not True or landing.get('success') is not None:
                continue
            loc = obj(landing.get('landing_location') or landing.get('location'))
            landing_type = obj(landing.get('type'))
            # Stage landing date is NOT reliably present. For spacecraft a
            # mission_end can be used *as a proxy*; for booster use launch day.
            spacecraftflight = obj(stage.get('spacecraftflight'))
            mission_end = from_source_date(spacecraftflight.get('mission_end'))
            date = mission_end if mission_end else net
            if not now.date() <= date < end.date() + dt.timedelta(days=1): continue
            place = obj(loc.get('location'))
            landing_id = txt(landing.get('id'))
            record_id = 'landing:ll2:' + landing_id if landing_id else 'landing:upcoming:' + launch_id + ':' + key + ':' + str(i)
            out.append({
                'event_id': record_id,
                'event_kind': 'landing',
                'll2_landing_id': landing_id,
                'll2_id': launch_id,
                'date_utc': date.isoformat(),
                'date_basis': 'spacecraft_mission_end_estimate' if mission_end else 'associated_launch_date_not_landing_time',
                'net_precision': 'Day (estimated)',
                'status': 'planned',
                'mission_name': txt(mission.get('name')) or txt(item.get('name')),
                'vehicle_name': txt(config.get('full_name') or config.get('name')),
                'landing_type': txt(landing_type.get('name')) or stage_kind,
                'landing_type_code': txt(landing_type.get('abbrev')),
                'operator_name': txt(provider.get('name')),
                'operator_country_code': country_code(provider),
                'recovery_country_code': country_of(place),
                'recovery_location_name': txt(loc.get('name')),
                'landing_location_abbrev': txt(loc.get('abbrev')),
                'description': txt(landing.get('description')),
                'related_launch_id': launch_id,
                'source': 'LL2 upcoming detailed stage',
            })
    return out


def collect(*, now=None, fetcher=None, max_pages=MAX_PAGES, curated=None, sites=None, global_launches=None, upcoming_fetcher=None, max_upcoming_pages=MAX_UPCOMING_PAGES):
    now = (now or utcnow()).astimezone(dt.timezone.utc)
    end = now + dt.timedelta(days=DAYS)
    fetcher = fetcher or fetch
    if not 1 <= max_pages <= MAX_PAGES or not 0 <= max_upcoming_pages <= MAX_UPCOMING_PAGES:
        raise ValueError('Invalid API request budget')
    curated = curated if curated is not None else json.loads(LEGACY.read_text(encoding='utf-8'))
    sites = sites if sites is not None else json.loads((ROOT / 'data/recovery_sites.json').read_text(encoding='utf-8'))
    global_launches = global_launches if global_launches is not None else json.loads(GLOBAL_LAUNCHES.read_text(encoding='utf-8'))
    rows = curated.get('landings', [])
    sites_by_id = {s.get('id'): s for s in sites.get('sites', [])}
    launch_by_id = {l.get('ll2_id'): l for l in global_launches.get('launches', [])}
    if not isinstance(rows, list):
        raise EventContractError('Invalid legacy landing data')

    seen = set()
    matched = {}
    pages = 0
    count = None
    for offset in range(0, max_pages * PAGE_SIZE, PAGE_SIZE):
        params = {'format': 'json', 'mode': 'normal', 'limit': PAGE_SIZE, 'ordering': '-id', 'offset': offset}
        response = fetcher(API + '?' + urllib.parse.urlencode(params))
        pages += 1
        if not isinstance(response, dict) or not isinstance(response.get('results'), list):
            raise EventContractError('Malformed landing page')
        try:
            n = int(response['count'])
        except (ValueError, TypeError, KeyError) as exc:
            raise EventContractError('Landing page lacks valid total count') from exc
        if count is None:
            count = n
            if not count:
                raise EventContractError('Empty landing index; protect last good snapshot')
        elif n != count:
            raise EventContractError('Landing total changed during paging; retry')
        page_rows = response['results']
        if not page_rows or len(page_rows) > PAGE_SIZE or offset + len(page_rows) > count:
            raise EventContractError('Truncated landing page')
        for item in page_rows:
            if not isinstance(item, dict) or item.get('id') is None or str(item['id']) in seen:
                raise EventContractError('Invalid or duplicate landing ID')
            seen.add(str(item['id']))
            parsed = parse_landing(item, launch_by_id, now, end)
            if parsed:
                matched[parsed['event_id']] = parsed
        if offset + len(page_rows) == count:
            if response.get('next'):
                raise EventContractError('Landing index next-page pointer is inconsistent')
            break
        if not response.get('next'):
            raise EventContractError('Landing index stopped before the expected page')

    # Supplementary source: future launches with explicitly declared stage
    # landing attempts. The list may not cover the full 120 days within its
    # request budget. Failures must never turn into false coverage guarantees.
    upcoming_pages = 0
    upcoming_error = None
    upcoming_fetcher = upcoming_fetcher or fetcher
    for offset in range(0, max_upcoming_pages * PAGE_SIZE, PAGE_SIZE):
        params = {'format': 'json', 'mode': 'detailed', 'limit': PAGE_SIZE,
                  'ordering': 'net', 'hide_recent_previous': 'true',
                  'net__gte': now.isoformat(timespec='seconds').replace('+00:00','Z'),
                  'net__lt': end.isoformat(timespec='seconds').replace('+00:00','Z'),
                  'offset': offset}
        try:
            raw = upcoming_fetcher(UPCOMING_API + '?' + urllib.parse.urlencode(params))
            if not isinstance(raw, dict) or not isinstance(raw.get('results'), list) or not isinstance(raw.get('count'), int):
                raise EventContractError('Invalid detailed upcoming page')
            if not raw['results'] and raw['count'] > offset:
                raise EventContractError('Truncated detailed upcoming page')
            upcoming_pages += 1
            for item in raw['results']:
                for entry in from_upcoming_detailed(item, now, end):
                    matched[entry['event_id']] = entry
            if offset + len(raw['results']) >= raw['count']:
                break
            if not raw.get('next'):
                raise EventContractError('Unexpected end to detailed upcoming pagination')
        except Exception as exc:
            upcoming_error = str(exc)
            break

    # Keep curated records independent; collapse records for the same LL2-linked
    # *mission* only when the LL2 landing entry supports that same date/event.
    # Multiple stage + capsule landings from one launch must NOT be collapsed.
    for row in rows:
        entry = curated_record(row, sites_by_id, now, end)
        if not entry: continue
        # Retain distinct payload/capsule returns linked to one launch. Only
        # de-duplicate explicit matching landing identity where possible.
        matched[entry['event_id']] = entry
    result = sorted(matched.values(), key=lambda r: (r['date_utc'], r['event_id']))
    stamp = now.isoformat(timespec='seconds').replace('+00:00', 'Z')
    return {
        'schema_version': 1,
        'source': 'Launch Library 2 /landings/ v2.3.0 + ORBITA curated schedule',
        'scope': 'best_effort_recent_LL2_landing_records_and_legacy_schedule',
        'coverage_status': 'partial_source_coverage',
        'coverage_note': 'Landing API has no future-date filter; recent IDs only plus curated records. Not a complete worldwide landing schedule.',
        'updated_utc': stamp,
        'window_start_utc': stamp,
        'window_end_utc_exclusive': end.isoformat(timespec='seconds').replace('+00:00', 'Z'),
        'horizon_days': DAYS,
        'pages_fetched': pages,
        'upcoming_pages_fetched': upcoming_pages,
        'upcoming_detail_error': upcoming_error,
        'records_scanned': len(seen),
        'count': len(result),
        'landings': result,
    }


def write_atomic(path, payload):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(prefix='.upcoming-global-landings-', suffix='.tmp', dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
            f.write('\n')
        os.replace(temp, path)
    finally:
        if os.path.exists(temp): os.unlink(temp)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args(argv)
    try:
        result = collect()
    except Exception as exc:
        print('Global landings refresh blocked; last good snapshot unchanged:', exc)
        return 2
    print('Evidence-aware future landings: %d, scanned: %d, pages: %d' %
          (result['count'], result['records_scanned'], result['pages_fetched']))
    print('Coverage: PARTIAL; records may omit future landings unknown to the source.')
    if args.apply:
        write_atomic(OUTPUT, result)
        print('Wrote validated snapshot:', OUTPUT)
    else:
        print('Dry run only; use --apply to publish')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
