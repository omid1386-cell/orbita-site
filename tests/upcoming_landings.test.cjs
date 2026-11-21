'use strict';
// Guard required by refresh-global-landings.yml. Does not claim full worldwide
// landing coverage or perform live network checks.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const x=JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','upcoming_global_landings.json'),'utf8'));
assert.equal(x.schema_version,1);
assert.equal(x.horizon_days,120);
assert.ok(Array.isArray(x.landings));
assert.equal(x.count,x.landings.length);
assert.ok(['awaiting_first_successful_sync','partial_source_coverage'].includes(x.coverage_status));
assert.ok(typeof x.coverage_note==='string' && x.coverage_note.length>0);
if(x.coverage_status==='awaiting_first_successful_sync'){
 assert.equal(x.count,0);
 assert.equal(x.updated_utc,null);
}else{
 assert.ok(x.updated_utc && x.window_start_utc && x.window_end_utc_exclusive);
 const begin=Date.parse(x.window_start_utc), end=Date.parse(x.window_end_utc_exclusive);
 assert.ok(Number.isFinite(begin)&&Number.isFinite(end)&&end>begin);
 assert.equal(Math.round((end-begin)/86400000),120);
 assert.equal(new Set(x.landings.map(m=>m.event_id)).size,x.landings.length);
 assert.ok(x.landings.every(m=>m.event_kind==='landing' && m.event_id && m.date_utc));
 assert.ok(x.landings.every(m=>m.date_basis));
}
console.log('PASS: best-effort landing snapshot format valid; no worldwide completeness claimed');
