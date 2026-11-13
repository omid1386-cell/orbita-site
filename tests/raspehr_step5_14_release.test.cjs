'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const load = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const all = load('data/companies.json');
const added = all.filter(x => x.orbita_release_note?.batch === 'RASPEHR_14_STEP5');
const ref11 = all.filter(x => x.orbita_verified_profile && !x.orbita_release_note);
const prior33 = all.filter(x => x.orbita_release_note && x.orbita_release_note.batch !== 'RASPEHR_14_STEP5');
const catfiles = {
 components:'companies_components.json', payloads:'companies_payloads.json',
 ground_services:'companies_ground_services.json', inspace_services:'companies_inspace_services.json',
 test_facility:'companies_test_facility.json', ground_station:'companies_ground_station.json',
 mission_control:'companies_mission_control.json',university_space:'companies_university_space.json'
};
test('record invariants and protected data', () => {
  assert.equal(all.length, 321);
  assert.equal(new Set(all.map(x => x.id)).size,321);
  assert.equal(ref11.length, 11);
  assert.equal(prior33.length, 33);
  assert.equal(added.length, 14);
});
test('all added entities use five native localized tabs', () => {
 for(const x of added){
  const p=x.orbita_verified_profile;
  assert.equal(p.profile_type,x.cat);
  assert.equal(p.sections.length,5);
  assert(!p.review_scope);
  assert(p.hide_evidence_scope_in_ui);
  assert(Number.isFinite(x.lat) && Number.isFinite(x.lon));
  assert(x.coordinate_precision);
  assert(x.address_evidence_url.startsWith('https://'));
  const refs=new Set(p.sources.map(s=>s.id));
  for(const s of p.sections){
   assert(s.items.length);
   for(const it of s.items){
    for(const lang of ['fa','en','ar']) assert(it[lang]?.trim(), `${x.id}:${s.id}:${lang}`);
    for(const ref of it.source_ids||[]) assert(refs.has(ref), `${x.id}:${s.id}:${ref}`);
   }
  }
  if(x.logo){
   assert(fs.existsSync(path.join(root,x.logo)),`Missing official parent emblem: ${x.id}`);
   assert(x.logo_kind==='official_parent_organization_logo');
  } else {
   assert(x.brand_text_identifier?.length);
   assert.equal(x.logo_kind,'no_verified_official_logo');
  }
 }
});
test('category files contain exactly one row of each new entity', () => {
 for(const x of added){
  const arr=load('data/'+catfiles[x.cat]);
  assert.equal(arr.filter(r=>r.id===x.id).length,1,`${x.id} ${x.cat}`);
 }
});
test('branded first-generation loading screen is unchanged while new JS and data are cache-busted', () => {
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert(html.includes('assets/js/raspehr-splash.js?v=20261113-speed-v1'));
 assert(html.includes('assets/js/app.js?_t=20261113-raspehr-14-step5-v1'));
 assert(html.includes('window.ORBITA_COMPANIES_V = "20261113-raspehr-14-step5-v1"'));
 assert(!html.includes('raspehr-fast-splash-v2'));
});
test('new records never display the research evidence scope panel', () => {
 const code=fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
 assert(code.includes('!o.orbita_release_note && !pf.hide_evidence_scope_in_ui'));
 assert(code.includes('brand_text_identifier'));
});
