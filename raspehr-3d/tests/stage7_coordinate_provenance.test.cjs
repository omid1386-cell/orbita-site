'use strict';
/* Stage 7: 23 disclosed representative locations, never silently labelled exact. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
function read(rel){return JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));}
const provenance=read('data/raspehr_coordinates_stage7_provenance.json');
const cases=provenance.entries;
const companies=read('data/companies.json');
const sites=read('data/sites.json');
const recovery=read('data/recovery_sites.json').sites;
const originals=companies.concat(sites,recovery);
const categoryFiles=['companies_agency.json','companies_agency_map.json','companies_propulsion.json','companies_launch.json','companies_launch_map.json'];
const categories=categoryFiles.map(p=>[p,read('data/'+p)]);
const map=new Map(originals.map(o=>[o.id,o]));
test('all 420 unique dossiers have valid geographic points, no spurious zero point',()=>{
 assert.equal(originals.length,420);assert.equal(map.size,420);
 for(const o of originals){assert.equal(typeof o.lat,'number',o.id);assert.equal(typeof o.lon,'number',o.id);
  assert.ok(o.lat>=-90&&o.lat<=90,`${o.id}: lat`);assert.ok(o.lon>=-180&&o.lon<=180,`${o.id}: lon`);
  assert.ok(!(o.lat===0&&o.lon===0),o.id);
 }
});
test('all 23 former blanks have sources and explicit uncertainty labels',()=>{
 assert.equal(cases.length,23);assert.equal(new Set(cases.map(x=>x.id)).size,23);
 assert.equal(cases.filter(x=>x.group==='company').length,18);
 assert.equal(cases.filter(x=>x.group==='site').length,5);
 for(const p of cases){const o=map.get(p.id);assert.ok(o,p.id);
  assert.equal(o.lat,p.lat);assert.equal(o.lon,p.lon);
  assert.match(o.coordinates_precision,/^approximate_/);
  assert.equal(p.verification,'representative_only');
  assert.ok(p.uncertainty_km_estimate>0);
  assert.match(p.official_or_institutional_evidence_url,/^https:\/\//);
  assert.match(p.geographic_reference_url,/^https:\/\//);
  assert.ok(o.coordinate_note_fa.length>25);
  assert.ok(o.coordinate_note_en.length>25);
  assert.ok(o.coordinate_note_ar.length>25);
  for(const [f,arr] of categories){
    for(const copy of arr.filter(x=>x.id===p.id)){
       assert.equal(copy.lat,p.lat,`${f}: ${p.id}`);
       assert.equal(copy.lon,p.lon,`${f}: ${p.id}`);
       assert.equal(copy.coordinates_precision,p.precision,`${f}: ${p.id}`);
    }
  }
 }
});
test('Biak proposed site and generalized test range markers explicitly disclose precision',()=>{
 const biak=map.get('biak');assert.match(biak.coordinate_note_fa,/سکو|ساخت|تأیید نشده/);
 assert.match(biak.coordinates_precision,/proposed/);
 for(const id of ['sonmiani','jiupeng'])assert.match(map.get(id).coordinates_precision,/approximate_region_pin/);
 assert.equal(map.get('bahrain-space-agency').city,'Hidd');
});
