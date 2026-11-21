#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ORBITA event contract v1 (Step 1).

Keep the human-curated launch and landing snapshots intact.  Normalize their
identities/time/country *semantics* for upcoming shared filters (Step 3); do
not pretend a landing's launch date or the flag of a recovery vessel is its
actual landing location or the operator's nationality.
"""
from __future__ import annotations

import datetime as dt
import re

ISO_DATE = re.compile(r'^\d{4}-\d\d-\d\d$')

LAUNCH_STATUS = {'Go': 'confirmed', 'TBC': 'tentative', 'TBD': 'unscheduled', 'Hold': 'on_hold'}
LANDING_STATUS = {'go': 'confirmed', 'tbc': 'tentative', 'queued': 'unscheduled'}


class EventContractError(ValueError):
    pass


def utc_datetime(value):
    if not isinstance(value, str) or not value:
        raise EventContractError('Missing UTC datetime')
    try:
        parsed = dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError as exc:
        raise EventContractError('Invalid datetime: %r' % value) from exc
    if parsed.tzinfo is None:
        raise EventContractError('Timezone required for: %r' % value)
    return parsed.astimezone(dt.timezone.utc)


def utc_date(value):
    if not ISO_DATE.fullmatch(str(value or '')):
        raise EventContractError('Invalid date: %r' % value)
    try:
        return dt.date.fromisoformat(value)
    except ValueError as exc:
        raise EventContractError('Invalid calendar date: %r' % value) from exc


def build_catalog(launches, landings, launch_sites, recovery_sites):
    """Return shared event projections, never modify the input snapshots.

    For legacy landings, `date` is a date at the precision of the record, not
    a verified landing instant; it often tracks the associated launch.
    """
    launch_site_by_id = {s['id']: s for s in launch_sites}
    recovery_site_by_id = {s['id']: s for s in recovery_sites}
    events, seen = [], set()

    for item in launches:
        lid = item.get('ll2_id')
        if not lid or lid in seen:
            raise EventContractError('Missing/duplicate launch ID: %r' % lid)
        seen.add(lid)
        site_id = item.get('site')
        if site_id not in launch_site_by_id:
            raise EventContractError('Unknown launch site: %r' % site_id)
        when = utc_datetime(item.get('net'))
        events.append({
            'event_id': 'launch:' + str(lid), 'kind': 'launch',
            'source_id': str(lid), 'net_utc': when.isoformat().replace('+00:00', 'Z'),
            'date_utc': when.date().isoformat(), 'time_basis': 'NET (not actual liftoff)',
            'precision': item.get('precision') or 'tbd',
            'site_id': site_id, 'site_country': launch_site_by_id[site_id].get('country') or None,
            'country_basis': 'launch_site',
            'status': LAUNCH_STATUS.get(item.get('status'), 'unknown'),
            'raw_status': item.get('status') or None,
        })

    for item in landings:
        landing_id = item.get('id')
        if not landing_id or landing_id in seen:
            raise EventContractError('Missing/duplicate landing ID: %r' % landing_id)
        seen.add(landing_id)
        site_id = item.get('site_id')
        if site_id not in recovery_site_by_id:
            raise EventContractError('Unknown recovery site: %r' % site_id)
        date = item.get('date')
        if date is not None:
            utc_date(date)
        events.append({
            'event_id': 'landing:' + str(landing_id), 'kind': 'landing',
            'source_id': str(item.get('ll2_id') or landing_id),
            # Do not invent a time-of-day from a launch-related date.
            'net_utc': None, 'date_utc': date,
            'time_basis': 'landing schedule date (exact landing time not verified)',
            'precision': 'date_only' if date else 'tbd',
            'site_id': site_id,
            'site_country': recovery_site_by_id[site_id].get('country') or None,
            'country_basis': 'recovery_site_not_operator',
            'status': LANDING_STATUS.get(item.get('status'), 'unknown'),
            'raw_status': item.get('status') or None,
        })
    return events
