'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const Display=require('../assets/js/upcoming-event-display.js');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const launch=fs.readFileSync(path.join(root,'assets/js/upcoming-launch-browser.js'),'utf8');
const land=fs.readFileSync(path.join(root,'assets/js/upcoming-landing-browser.js'),'utf8');

test('source event data remains untouched',()=>{
 const a=JSON.parse(fs.readFileSync(path.join(root,'data/upcoming_global.json'),'utf8'));
 const b=JSON.parse(fs.readFileSync(path.join(root,'data/upcoming_global_landings.json'),'utf8'));
 assert.equal(a.coverage_status,'awaiting_first_successful_sync');
 assert.equal(b.coverage_status,'awaiting_first_successful_sync');
});
test('launch time respects source precision, including unknown and approximate dates',()=>{
 const instant='2026-12-01T13:45:29Z';
 assert.match(Display.launchTime({net:instant,net_precision:'minute'},'en','Unknown').text,/13:45.*UTC/);
 assert.doesNotMatch(Display.launchTime({net:instant,net_precision:'day'},'en','Unknown').text,/13:45|UTC/);
 assert.doesNotMatch(Display.launchTime({net:instant,net_precision:'month'},'en','Unknown').text,/\b1\b|13:45/);
 assert.equal(Display.launchTime({net:'invalid',net_precision:'minute'},'fa','نامشخص').text,'نامشخص');
 assert.equal(Display.launchTime({net:instant,net_precision:'quarter'},'en','Unknown').text,'Q4 2026');
});
test('landing displays day only, never launch time as a landing hour',()=>{
 const d=Display.landingDate({date_utc:'2026-12-11',net:'2026-12-11T14:32:00Z'},'en','Unknown');
 assert.equal(d.timeKnown,false);
 assert.doesNotMatch(d.text,/UTC|14:32/);
 assert.equal(Display.landingDate({date_utc:'2026-02-30'},'fa','نامعتبر').text,'نامعتبر');
});
test('freshness never claims freshness with invalid or missing timestamps',()=>{
 const now=Date.parse('2026-11-21T10:00:00Z');
 assert.equal(Display.freshness(null,now),'missing');
 assert.equal(Display.freshness('not-a-date',now),'missing');
 assert.equal(Display.freshness('2026-11-21T09:00:00Z',now),'fresh');
 assert.equal(Display.freshness('2026-11-19T09:00:00Z',now),'stale');
 assert.equal(Display.freshness('2026-11-22T09:00:00Z',now),'invalid');
});
test('event metadata and reset controls are present in both dialogs',()=>{
 for (const k of ['Launch','Landing']) {
  for (const id of [`global${k}Freshness`,`global${k}CoverageNote`,`global${k}ClockNote`,`global${k}Updated`,`global${k}ResultCount`]) assert.match(html,new RegExp('id="'+id+'"'));
 }
 const scripts=['upcoming-launch-filters.js','upcoming-event-display.js','upcoming-launch-browser.js','upcoming-landing-browser.js'];
 let prev=-1;
 for(const name of scripts){const index=html.indexOf('src="assets/js/'+name);assert(index>prev,'script order: '+name);prev=index;}
 assert.match(html,/assets\/css\/upcoming-event-display.css/);
 for(const js of [launch,land]) {
  assert.match(js,/function updateFeedMeta/);
  assert.match(js,/data-step7-reset/);
  assert.match(js,/Display\.freshness/);
  assert.doesNotMatch(js,/\brender\(\);/);
 }
});
