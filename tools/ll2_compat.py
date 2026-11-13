#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Minimal, lossless adapter for Launch Library 2 v2.3 normal responses.

Older ORBITA refresh scripts expect text fields produced by v2.2 ``mode=list``.
The supported v2.3 ``mode=normal`` response instead supplies structured
mission, pad and launch service provider objects. Convert only the needed
fields; retain id/net/status/net_precision and never fabricate missing data.
"""

API_ROOT = 'https://ll.thespacedevs.com/2.3.0/launches/'


def _name(value):
    if isinstance(value, dict):
        return value.get('name') or ''
    return value if isinstance(value, str) else ''


def normalize_launch(item):
    """Convert a 2.3 normal launch to legacy flat keys without modifying input."""
    if not isinstance(item, dict) or not item.get('id') or not item.get('net'):
        raise ValueError('Invalid Launch Library 2 launch payload')
    pad = item.get('pad') or {}
    mission = item.get('mission') or {}
    lsp = item.get('launch_service_provider') or {}
    rocket = item.get('rocket') or {}
    if not isinstance(pad, dict):
        pad = {'name': pad}
    if not isinstance(mission, dict):
        mission = {'name': mission}
    if not isinstance(lsp, dict):
        lsp = {'name': lsp}
    if not isinstance(rocket, dict):
        rocket = {}
    config = rocket.get('configuration') or {}
    if not isinstance(config, dict):
        config = {}
    result = dict(item)
    result['location'] = _name(pad.get('location')) or _name(item.get('location'))
    result['pad'] = _name(pad)
    result['mission'] = _name(mission)
    result['mission_type'] = mission.get('type') or ''
    result['orbit'] = _name(mission.get('orbit'))
    result['lsp_name'] = _name(lsp) or _name(item.get('lsp_name'))
    result['rocket_name'] = config.get('full_name') or config.get('name') or ''
    return result


def normalize_page(page):
    if not isinstance(page, dict) or not isinstance(page.get('results'), list):
        raise ValueError('Invalid Launch Library 2 page (missing results)')
    return [normalize_launch(item) for item in page['results']]
