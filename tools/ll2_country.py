#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Read explicit country affiliations from LL2 v2.3 structures.

LL2 frequently represents a country as a nested object or, for agencies,
as a list of countries. Do not infer service-provider nationality from the
location of the launch pad or the mission payload operator.
"""
from __future__ import annotations


def country_code(value):
    if isinstance(value, str):
        code = value.strip().upper()
        return code if code and len(code) in (2, 3) and code.isalpha() else None
    if isinstance(value, list):
        codes = set(filter(None, (country_code(v) for v in value)))
        # A multi-national agency has no unique country code; retain as unknown.
        return next(iter(codes)) if len(codes) == 1 else None
    if not isinstance(value, dict):
        return None
    for key in ('alpha_3_code', 'alpha_2_code', 'country_code'):
        code = country_code(value.get(key))
        if code: return code
    return country_code(value.get('country'))
