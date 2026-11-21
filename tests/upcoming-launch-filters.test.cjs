'use strict';
const assert = require('node:assert/strict');
const F = require('../assets/js/upcoming-launch-filters.js');
const countryMap = require('../data/country_codes.json');

const now = Date.parse('2026-11-21T12:00:00Z');
const rows = [
  { ll2_id: 'a', net: '2026-11-22T12:00:00Z', operator_country_code: 'CHN', launch_country_code: 'CHN', launch_name: 'China launch' },
  { ll2_id: 'b', net: '2026-11-28T12:00:00Z', operator_country_code: 'USA', launch_country_code: 'NZL', launch_name: 'US provider from NZ' },
  { ll2_id: 'c', net: '2026-12-10T12:00:00Z', operator_country_code: 'RUS', launch_country_code: 'RUS', launch_name: 'Russian launch' },
  { ll2_id: 'd', net: '2027-03-20T12:00:00Z', operator_country_code: 'IND', launch_country_code: 'IND', launch_name: 'India launch' },
  { ll2_id: 'e', net: '2027-03-22T12:00:00Z', operator_country_code: 'USA', launch_country_code: 'USA', launch_name: 'Outside 120-day window' },
  { ll2_id: 'f', net: '2026-11-21T11:59:59Z', operator_country_code: 'CHN', launch_country_code: 'CHN', launch_name: 'Already passed' },
  { ll2_id: 'g', net: 'not-a-date', operator_country_code: 'CHN', launch_country_code: 'CHN', launch_name: 'Invalid time' },
  { ll2_id: 'h', net: '2026-11-25T12:00:00Z', operator_country_code: null, launch_country_code: 'CHN', launch_name: 'Unknown provider country' }
];

assert.deepEqual(F.PRESETS.map(x => x.days), [7, 14, 30, 120]);
assert.equal(F.normalizeCountryCode('us', countryMap.aliases), 'USA');
assert.equal(F.normalizeCountryCode('CHN', countryMap.aliases), 'CHN');
assert.deepEqual(F.filterLaunches(rows, { now, days: 7, aliases: countryMap.aliases }).map(x => x.ll2_id), ['a', 'h']);
assert.deepEqual(F.filterLaunches(rows, { now, days: 30, aliases: countryMap.aliases }).map(x => x.ll2_id), ['a', 'h', 'b', 'c']);
assert.deepEqual(F.filterLaunches(rows, { now, days: 120, aliases: countryMap.aliases }).map(x => x.ll2_id), ['a', 'h', 'b', 'c', 'd']);
assert.deepEqual(F.filterLaunches(rows, { now, days: 30, countryCodes: ['CHN', 'USA'], aliases: countryMap.aliases }).map(x => x.ll2_id), ['a', 'b']);
assert.deepEqual(F.filterLaunches(rows, { now, days: 30, countryCodes: ['USA'], countryBasis: 'operator', aliases: countryMap.aliases }).map(x => x.ll2_id), ['b']);
assert.deepEqual(F.filterLaunches(rows, { now, days: 30, countryCodes: ['USA'], countryBasis: 'site', aliases: countryMap.aliases }).map(x => x.ll2_id), []);
assert.deepEqual(F.filterLaunches(rows, { now, days: 30, countryCodes: ['NZ'], countryBasis: 'site', aliases: countryMap.aliases }).map(x => x.ll2_id), ['b']);
assert.deepEqual(F.filterLaunches(rows, { now, days: 30, countryCodes: [], aliases: countryMap.aliases, query: 'russian' }).map(x => x.ll2_id), ['c']);
assert.deepEqual(F.availableCountryCodes(rows, 'operator', countryMap.aliases), ['CHN', 'IND', 'RUS', 'USA']);
assert.deepEqual(F.availableCountryCodes(rows, 'site', countryMap.aliases), ['CHN', 'IND', 'NZL', 'RUS', 'USA']);
assert.deepEqual(F.filterLaunches(rows, { now, days: 30, countryCodes: ['CHN'], aliases: countryMap.aliases, countryBasis: 'site' }).map(x => x.ll2_id), ['a', 'h']);
console.log('PASS: 13 worldwide launch-filter assertions');

// The same Step-3 engine is ready for the landing dataset planned for Step 6.
const landings = [
  { event_id: 'landing:today', kind: 'landing', date_utc: '2026-11-21', site_country: 'USA' },
  { event_id: 'landing:tomorrow', kind: 'landing', date_utc: '2026-11-22', site_country: 'CHN' },
  { event_id: 'landing:later', kind: 'landing', date_utc: '2026-12-12', site_country: 'KAZ' },
  { event_id: 'landing:unknown-country', kind: 'landing', date_utc: '2026-11-23', site_country: null }
];
assert.deepEqual(F.filterEvents(landings, { now, days: 7, countryBasis: 'site', countryCodes: ['USA', 'CHN'], aliases: countryMap.aliases }).map(x => x.event_id), ['landing:today', 'landing:tomorrow']);
assert.deepEqual(F.filterEvents(landings, { now, days: 30, countryBasis: 'site', countryCodes: ['KAZ'], aliases: countryMap.aliases }).map(x => x.event_id), ['landing:later']);
assert.deepEqual(F.filterEvents(landings, { now, days: 7, countryBasis: 'operator', countryCodes: ['USA'], aliases: countryMap.aliases }), []);
assert.equal(F.countryCodeFor(landings[0], 'site', countryMap.aliases), 'USA');
console.log('PASS: shared date-only landing and site-country filter assertions');
assert.equal(F.normalizeCountryCode('United States of America', countryMap.aliases), 'USA');
assert.equal(F.normalizeCountryCode('ایران', countryMap.aliases), 'IRN');
assert.deepEqual(F.filterLaunches(landings, { now, days: 7, countryBasis: 'site', aliases: countryMap.aliases }), []);
console.log('PASS: country-name normalization and launch/landing type separation');
