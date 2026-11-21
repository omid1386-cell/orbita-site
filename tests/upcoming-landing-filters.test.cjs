'use strict';
const assert = require('node:assert/strict');
const filters = require('../assets/js/upcoming-launch-filters.js');
const countries = require('../data/country_codes.json');
const now=Date.parse('2026-11-21T12:00:00Z');
const rows=[
  { event_id:'landing:a', event_kind:'landing', date_utc:'2026-11-22', operator_country_code:'USA', recovery_country_code:null },
  { event_id:'landing:b', event_kind:'landing', date_utc:'2026-11-28', operator_country_code:'CHN', recovery_country_code:'CHN' },
  { event_id:'landing:c', event_kind:'landing', date_utc:'2026-12-10', operator_country_code:'USA', recovery_country_code:'AUS' },
  { event_id:'landing:d', event_kind:'landing', date_utc:'2027-03-18', operator_country_code:'RUS', recovery_country_code:'KAZ' },
  { event_id:'landing:old',event_kind:'landing',date_utc:'2026-11-19',operator_country_code:'USA'},
  { event_id:'launch:x',event_kind:'launch',date_utc:'2026-11-23',operator_country_code:'CHN'}
];
function run(days,codes=[],basis='operator') {return filters.filterEvents(rows.filter(r=>r.event_kind==='landing'), {now,days,countryCodes:codes,countryBasis:basis,aliases:countries.aliases}).map(r=>r.event_id);}
assert.deepEqual(filters.PRESETS.map(x=>x.days),[7,14,30,120]);
// Date-only events include the *whole* overlapping UTC day at the boundary.
assert.deepEqual(run(7),['landing:a','landing:b']);
assert.deepEqual(run(14),['landing:a','landing:b']);
assert.deepEqual(run(30),['landing:a','landing:b','landing:c']);
assert.deepEqual(run(120),['landing:a','landing:b','landing:c','landing:d']);
assert.deepEqual(run(30,['USA','CHN']),['landing:a','landing:b','landing:c']);
assert.deepEqual(run(30,['CHN'], 'site'),['landing:b']);
assert.deepEqual(run(30,['USA'], 'site'),[]);
assert.deepEqual(run(120,['KAZ'], 'site'),['landing:d']);
assert.equal(filters.countryCodeFor(rows[0],'site',countries.aliases),'');
assert.equal(filters.countryCodeFor(rows[1],'operator',countries.aliases),'CHN');
console.log('PASS: 10 landing date + multi-country filter checks');
