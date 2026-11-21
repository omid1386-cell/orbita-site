/* Step 8 — deterministic integration regressions for the rolling time-window,
 * multi-country filters and snapshot freshness. Uses no external network.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const Filter = require('../assets/js/upcoming-launch-filters.js');
const Display = require('../assets/js/upcoming-event-display.js');
const NOW = Date.parse('2026-11-21T12:00:00Z');

test('Day precision NET at midnight stays visible until its UTC calendar day ends', () => {
  const today = {event_kind:'launch', ll2_id:'one', net:'2026-11-21T00:00:00Z', net_precision:'Day'};
  const past = {event_kind:'launch', ll2_id:'past', net:'2026-11-20T00:00:00Z', net_precision:'Day'};
  const future = {event_kind:'launch', ll2_id:'future', net:'2026-11-29T00:00:00Z', net_precision:'Day'};
  assert.deepEqual(Filter.filterLaunches([today,past,future],{days:7,now:NOW}).map(x=>x.ll2_id),['one']);
});

test('Minute-precision past NET must not survive merely because it is on the same day', () => {
  const rows = Filter.filterLaunches([
    {ll2_id:'past',net:'2026-11-21T11:59:00Z',net_precision:'Minute'},
    {ll2_id:'future',net:'2026-11-21T12:01:00Z',net_precision:'Minute'}
  ],{days:7,now:NOW});
  assert.deepEqual(rows.map(x=>x.ll2_id),['future']);
});

test('Operator and site country filters keep multi-selection disjoint', () => {
 const rows=[
  {ll2_id:'ch',net:'2026-11-23T09:00:00Z',operator_country_code:'CHN',launch_country_code:'USA'},
  {ll2_id:'us',net:'2026-11-24T09:00:00Z',operator_country_code:'USA',launch_country_code:'USA'},
  {ll2_id:'ru',net:'2026-11-25T09:00:00Z',operator_country_code:'RUS',launch_country_code:'CHN'}
 ];
 assert.deepEqual(Filter.filterLaunches(rows,{now:NOW,days:7,countryBasis:'operator',countryCodes:['CHN','USA']}).map(x=>x.ll2_id),['ch','us']);
 assert.deepEqual(Filter.filterLaunches(rows,{now:NOW,days:7,countryBasis:'site',countryCodes:['CHN']}).map(x=>x.ll2_id),['ru']);
});

test('Landing date-only today remains eligible; landing hour is never fabricated', () => {
 const row={event_kind:'landing',event_id:'landing1',date_utc:'2026-11-21',date_basis:'associated_launch_date_not_landing_time'};
 assert.equal(Filter.filterEvents([row],{days:7,now:NOW}).length,1);
 const shown=Display.landingDate(row,'fa','—');
 assert.equal(shown.timeKnown,false);
 assert.doesNotMatch(shown.text,/UTC|[0-9]{2}:[0-9]{2}/);
});

test('Missing, stale, future, and fresh update timestamps are distinct', () => {
 assert.equal(Display.freshness(null,NOW),'missing');
 assert.equal(Display.freshness('2026-11-19T10:00:00Z',NOW),'stale');
 assert.equal(Display.freshness('2026-11-22T10:00:00Z',NOW),'invalid');
 assert.equal(Display.freshness('2026-11-21T10:00:00Z',NOW),'fresh');
});
