'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const APP=path.resolve(__dirname,'..'), ROOT=path.resolve(APP,'..');
const data=JSON.parse(fs.readFileSync(path.join(APP,'data/external-links-v1.json'),'utf8'));
const api=require('../assets/js/external-map-links-v1.js');
const sourceByKind={company:JSON.parse(fs.readFileSync(path.join(ROOT,'data/companies.json'))),
  site:JSON.parse(fs.readFileSync(path.join(ROOT,'data/sites.json'))),
  recovery:JSON.parse(fs.readFileSync(path.join(ROOT,'data/recovery_sites.json'))).sites};
test('all 420 public Google Maps pin URLs match canonical catalog records (no substitutions)',()=>{
 let n=0;
 for(const kind of Object.keys(sourceByKind)){
  const source=new Map(sourceByKind[kind].map(e=>[e.id,e]));
  for(const r of data.records.filter(x=>x.kind===kind)){
   const p=source.get(r.id);assert(p,kind+':'+r.id);
   assert.equal(r.lat,p.lat);assert.equal(r.lon,p.lon);
   assert.equal(r.google_maps_url,api.mapsUrl(p.lat,p.lon));n++;
  }
 }
 assert.equal(n,420);
});
test('all 420 satellite URLs have no markers, correct center and category zoom',()=>{
 for(const r of data.records){
  assert.equal(r.google_maps_satellite_url,api.satelliteUrl(r.lat,r.lon,r.kind));
  const u=new URL(r.google_maps_satellite_url);
  assert.equal(u.searchParams.get('map_action'),'map');
  assert.equal(u.searchParams.get('center'),`${r.lat},${r.lon}`);
  assert.equal(u.searchParams.get('basemap'),'satellite');
 }
});
test('Sea Launch moving historic site is explicitly marked approximate, not current building',()=>{
 const r=data.records.find(r=>r.kind==='site'&&r.id==='sea-launch');
 assert.match(r.coordinate_accuracy_label_fa,/تاریخی/);
 assert.match(r.geo_review_note_fa,/شناور/);
});
test('no Earth link, Street View or Google imagery coverage is promoted without live review',()=>{
 for(const r of data.records){
  assert.equal(r.google_maps_live_checked,false);
  assert.equal(r.google_maps_satellite_live_checked,false);
  assert.equal(r.google_earth_share_url,null);
  assert.equal(r.google_earth_live_checked,false);
  assert.equal(r.street_view_url,null);
 }
});
test('independent stage-1 audit is relocatable and covers exact 420x2 link inventory',()=>{
 const script=path.join(APP,'tools/atlas-stage1-external-links-audit.py');
 const run=spawnSync('python',[script],{cwd:ROOT,encoding:'utf8',timeout:30000});
 assert.equal(run.status,0,run.stderr||run.stdout.slice(0,1500));
 const r=JSON.parse(run.stdout);
 assert.equal(r.offline_structural_pass,true);
 assert.equal(r.location_count,420);
 assert.equal(r.maps_position_urls,420);
 assert.equal(r.maps_satellite_urls,420);
 assert.equal(r.google_earth_live_verified,0);
 assert.ok(r.shared_coordinate_groups>0);
 assert.equal(r.release_approved,false);
});
