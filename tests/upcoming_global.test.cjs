'use strict';
// Global LL2 feed: empty placeholder is explicit until a complete sync succeeds.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const x = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'upcoming_global.json'), 'utf8'));
assert.equal(x.schema_version, 1);
assert.equal(x.horizon_days, 120);
assert(Array.isArray(x.launches));
assert.equal(x.count, x.launches.length);
assert(['awaiting_first_successful_sync','complete_from_source_at_fetch_time'].includes(x.coverage_status));
if (x.coverage_status === 'awaiting_first_successful_sync') {
  assert.equal(x.count, 0);
  assert.equal(x.window_start_utc, null);
} else {
  assert(x.updated_utc && x.window_start_utc && x.window_end_utc_exclusive);
  assert.equal((Date.parse(x.window_end_utc_exclusive) - Date.parse(x.window_start_utc))/86400000, 120);
  assert.equal(new Set(x.launches.map(a => a.ll2_id)).size, x.launches.length);
  assert(x.launches.every(a => a.event_kind === 'launch' && a.net && a.ll2_id));
  assert(x.launches.every(a => Date.parse(a.net) >= Date.parse(x.window_start_utc) && Date.parse(a.net) < Date.parse(x.window_end_utc_exclusive)));
}
console.log('PASS: 120-day global snapshot is complete or explicitly pending first sync');
