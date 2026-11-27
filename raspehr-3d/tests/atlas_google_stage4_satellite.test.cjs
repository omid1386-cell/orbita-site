"use strict";
const test=require("node:test"), assert=require("node:assert/strict"), fs=require("node:fs"), path=require("node:path");
const app=path.join(__dirname,"..");
const records=JSON.parse(fs.readFileSync(path.join(app,"data/external-links-v1.json"),"utf8")).records;
const api=require("../assets/js/external-map-links-v1.js");
const html=fs.readFileSync(path.join(app,"index.html"),"utf8");

test("420 distinct official Google Maps satellite basemap URLs use canonical coordinates",()=>{
 const ids=new Set();let count={company:0,site:0,recovery:0};
 for(const r of records){
  const key=r.kind+":"+r.id;assert(!ids.has(key));ids.add(key);count[r.kind]++;
  const parsed=new URL(r.google_maps_satellite_url);
  assert.equal(parsed.origin,"https://www.google.com");assert.equal(parsed.pathname,"/maps/@");
  assert.equal(parsed.searchParams.get("api"),"1");assert.equal(parsed.searchParams.get("map_action"),"map");
  assert.equal(parsed.searchParams.get("basemap"),"satellite");
  assert.equal(parsed.searchParams.get("center"),r.lat+","+r.lon);
  assert.equal(parsed.searchParams.get("zoom"),String(r.kind==="company"?16:r.kind==="site"?15:11));
  assert.equal(r.google_maps_satellite_url,api.satelliteUrl(r.lat,r.lon,r.kind));
  assert.equal(r.google_maps_satellite_live_checked,false);
  assert.equal(r.google_earth_live_checked,false);
  assert.equal(r.google_earth_share_url,null);
  assert.equal(api.validateRowAgainstRegistry(r,r),true);
 }
 assert.deepEqual(count,{company:321,site:79,recovery:20});
});
test("GPS mismatch and compromised satellite URL disable all external navigation",()=>{
 const entry=records[0];
 assert.equal(api.validateRowAgainstRegistry({...entry,lat:entry.lat+.01},entry),false);
 assert.equal(api.validateRowAgainstRegistry(entry,{...entry,google_maps_satellite_url:"https://evil.example/"}),false);
 assert.equal(api.satelliteUrl(91,0,"company"),"");
 assert.equal(api.satelliteUrl(28,-80,"unknown"),"");
});
test("new satellite control remains local to the collapsed external-link menu",()=>{
 assert.match(html,/<details class="atlas-external-maps" id="atlasExternalMaps" hidden>/);
 assert.match(html,/id="atlasGoogleSatelliteLink"[^>]+hidden target="_blank" rel="noopener noreferrer"/);
 assert.match(html,/نمای ماهواره‌ای بدون نشانگر/);
 const ids=[...html.matchAll(/\sid="([^"\n]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size);
});
test("review notes explain geographic ambiguity without touching canonical content",()=>{
 const m=new Map(records.map(r=>[r.kind+":"+r.id,r]));
 for(const key of ["company:blueorigin","company:isar","company:esa","recovery:recovery-dongfeng","recovery:recovery-starship-indian"])
   assert.ok(m.get(key)?.geo_review_note_fa?.length>20,key);
});
