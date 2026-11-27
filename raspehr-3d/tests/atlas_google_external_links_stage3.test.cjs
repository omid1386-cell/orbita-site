'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const app=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(app,f),'utf8');
const registry=JSON.parse(read('data/external-links-v1.json'));
const api=require('../assets/js/external-map-links-v1.js');
const html=read('index.html');
const prototype=read('assets/js/prototype.js');

test('external map registry has 420 unique IDs and structurally valid Google Maps links',()=>{
 assert.equal(registry.records.length,420);
 const keys=new Set();
 const count={company:0,site:0,recovery:0};
 for(const rec of registry.records){
  const key=rec.kind+':'+rec.id;
  assert.ok(!keys.has(key),'duplicate '+key);keys.add(key);
  assert.ok(rec.kind in count);count[rec.kind]++;
  assert.equal(rec.google_maps_url,api.mapsUrl(rec.lat,rec.lon));
  assert.equal(rec.google_maps_live_checked,false);
  assert.equal(rec.google_earth_share_url,null);
  assert.equal(rec.google_earth_live_checked,false);
  assert.equal(rec.street_view_url,null);
 }
 assert.deepEqual(count,{company:321,site:79,recovery:20});
});

test('canonical records join by ID/kind and coordinate exactly; mismatch blocks wrong location',()=>{
 const sources=[['data/companies.json','company'],['data/sites.json','site'],['data/recovery_sites.json','recovery']];
 const sourceMap=new Map();
 for(const [file,kind] of sources){
  const data=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  for(const item of (kind==='recovery'?data.sites:data))sourceMap.set(kind+':'+item.id,item);
 }
 assert.equal(sourceMap.size,420);
 for(const rec of registry.records){
  const original=sourceMap.get(rec.kind+':'+rec.id);
  assert.ok(original,'missing canonical record '+rec.id);
  assert.equal(api.validateRowAgainstRegistry({id:rec.id,kind:rec.kind,lat:original.lat,lon:original.lon},rec),true);
  assert.equal(api.validateRowAgainstRegistry({id:rec.id,kind:rec.kind,lat:original.lat+0.001,lon:original.lon},rec),false);
 }
 assert.equal(api.mapsUrl(91,0),'');
 assert.equal(api.mapsUrl(NaN,0),'');
 assert.equal(api.mapsUrl('38',-77),'');
});

test('Earth link only active after explicit verified, live-checked and trusted host',()=>{
 const url='https://earth.google.com/web/search/Kennedy+Space+Center/';
 assert.equal(api.safeEarthLink({google_earth_share_url:url,google_earth_status:'not_collected',google_earth_live_checked:true}),'');
 assert.equal(api.safeEarthLink({google_earth_share_url:url,google_earth_status:'verified',google_earth_live_checked:false}),'');
 assert.equal(api.safeEarthLink({google_earth_share_url:'javascript:alert(1)',google_earth_status:'verified',google_earth_live_checked:true}),'');
 assert.equal(api.safeEarthLink({google_earth_share_url:'https://earth.google.com.malicious.tld/web',google_earth_status:'verified',google_earth_live_checked:true}),'');
 assert.equal(api.safeEarthLink({google_earth_share_url:url,google_earth_status:'verified',google_earth_live_checked:true}),url);
});

test('compact UI has unique hooks, no inline third-party embeds, canonical selection/clear',()=>{
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size);
 for(const id of ['atlasExternalMaps','atlasGoogleMapsLink','atlasGoogleEarthLink','atlasGoogleEarthUnavailable','atlasExternalMapsPrecision','atlasExternalMapsStatus'])assert.equal(ids.filter(x=>x===id).length,1);
 assert.ok(html.includes('assets/js/external-map-links-v1.js'));
 assert.ok(html.includes('assets/css/external-map-links-v1.css'));
 assert.match(html,/<details class="atlas-external-maps" id="atlasExternalMaps" hidden>/);
 assert.match(prototype,/RaspehrExternalMaps\.select\(row\)/);
 assert.match(prototype,/RaspehrExternalMaps\.select\(null\)/);
 assert.ok(!html.includes('iframe src="https://www.google.com/maps'));
 assert.match(html,/target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"/);
});

test('48 site photos and main content catalogs match the bundled V9 locked SHA-256 manifest',()=>{
 const lock=JSON.parse(read('RELEASE_V9_PROTECTED_SHA256.json')).sha256;
 const list=['data/companies.json','data/sites.json','data/recovery_sites.json',
   'raspehr-3d/assets/js/site-views.js','raspehr-3d/assets/js/globe-engine.js',
   'raspehr-3d/assets/js/entity-data.js'];
 const additionalV9Hashes={
   'raspehr-3d/assets/js/globe-engine.js':'5f26caa34be369a6854153b91f257cb83313128e11a734220a14199dd7274bd6'
 };
 for(const file of list){
   const expected=lock[file]||additionalV9Hashes[file];
   assert.ok(expected,'missing V9 reference SHA-256 '+file);
   assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),expected,'changed '+file);
 }
 const photos=Object.keys(lock).filter(f=>f.startsWith('raspehr-3d/assets/site-views/photos/'));
 assert.equal(photos.length,48);
 for(const rel of photos){
   assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex'),lock[rel],'modified image '+rel);
 }
});
