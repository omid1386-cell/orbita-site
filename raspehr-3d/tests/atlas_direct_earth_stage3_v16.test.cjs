'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=path.resolve(__dirname,'..'),root=path.resolve(app,'..');
const reg=JSON.parse(fs.readFileSync(path.join(app,'data/external-links-v1.json'),'utf8'));
const api=require('../assets/js/external-map-links-v1.js');
const pilot=JSON.parse(fs.readFileSync(path.join(app,'qa/RASPEHR_DIRECT_EARTH_LINK_PILOT_5.json'),'utf8')).records;
const pilotMap=new Map(pilot.map(r=>[r.kind+':'+r.id,r]));
function keys(items){return new Set(items.map(x=>x.kind+':'+x.id));}
test('420 location candidates are complete, unique and match canonical coordinates',()=>{
 assert.equal(reg.records.length,420);assert.equal(keys(reg.records).size,420);
 const types={company:0,site:0,recovery:0};
 for(const r of reg.records){types[r.kind]++;
  assert.equal(api.safeDirectEarthLink(r),r.google_earth_direct_url,r.id);
  assert.equal(r.google_earth_direct_url,api.earthDirectUrl(r.lat,r.lon,r.google_earth_direct_camera.range_m,r.google_earth_direct_camera.tilt_deg));
  assert.equal(r.google_earth_live_checked,false);assert.equal(r.google_earth_share_url,null);
 }
 assert.deepEqual(types,{company:321,site:79,recovery:20});
});
test('all 5 previously supplied pilot links stay byte-identical',()=>{
 for(const p of pilot){const r=reg.records.find(r=>r.kind===p.kind&&r.id===p.id);assert(r);
  assert.equal(r.google_earth_direct_url,p.earth_candidate_url);
  assert.equal(r.google_earth_direct_status,'pilot_user_confirmed');
  assert.equal(r.google_earth_direct_user_reported_open,true);
  assert.equal(r.google_earth_direct_independently_checked,false);
 }
});
test('415 generated links remain individually unverified, never assert 3D coverage',()=>{
 assert.equal(reg.records.filter(r=>r.google_earth_direct_status==='generated_pattern_unverified').length,415);
 assert.equal(reg.records.filter(r=>r.google_earth_direct_independently_checked).length,0);
 assert.equal(reg.records.filter(r=>r.google_earth_live_checked).length,0);
 assert.equal(reg.direct_earth_rollout_stage3.independent_live_checks,0);
});
test('direct link rejects forged host, switched center, invalid tilt/range and mismatched status',()=>{
 const r=reg.records[0];
 for(const changed of [
  {...r,google_earth_direct_url:'https://earth.google.com.evil.test/web/@1,2,0a,1000d,35y,0h,50t,0r'},
  {...r,google_earth_direct_url:'javascript:alert(1)'},
  {...r,google_earth_direct_url:r.google_earth_direct_url.replace('/@','/@0,')},
  {...r,google_earth_direct_camera:{...r.google_earth_direct_camera,range_m:0}},
  {...r,google_earth_direct_camera:{...r.google_earth_direct_camera,tilt_deg:180}},
  {...r,google_earth_direct_status:'verified'},
 ])assert.equal(api.safeDirectEarthLink(changed),'');
 assert.equal(api.earthDirectUrl(91,0,7000,50),'');
 assert.equal(api.earthDirectUrl(0,181,7000,50),'');
 assert.equal(api.earthDirectUrl(38,-77,NaN,50),'');
});
test('row mismatch suppresses all three outbound links before rendering',()=>{
 const r=reg.records[0];const ok={id:r.id,kind:r.kind,lat:r.lat,lon:r.lon};
 assert.equal(api.validateRowAgainstRegistry(ok,r),true);
 assert.equal(api.validateRowAgainstRegistry({...ok,lat:ok.lat+0.001},r),false);
 assert.equal(api.validateRowAgainstRegistry({...ok,kind:'site'},r),false);
});
test('stored coordinates still exactly equal original canonical datasets',()=>{
 const m=new Map();
 for(const [file,kind] of [['data/companies.json','company'],['data/sites.json','site'],['data/recovery_sites.json','recovery']]){
  const d=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  for(const x of kind==='recovery'?d.sites:d)m.set(kind+':'+x.id,x);
 }
 assert.equal(m.size,420);
 for(const r of reg.records){const o=m.get(r.kind+':'+r.id);assert(o);
  assert.equal(r.lat,o.lat);assert.equal(r.lon,o.lon);
 }
});
test('Earth link UI explicitly warns it is experimental, no verified 3D claim',()=>{
 const s=fs.readFileSync(path.join(app,'assets/js/external-map-links-v1.js'),'utf8');
 const h=fs.readFileSync(path.join(app,'index.html'),'utf8');
 assert.match(s,/لینک مستقیم آزمایشی/);
 assert.match(s,/کیفیت تصاویر\/سه‌بعدی تأیید نشده/);
 assert.match(s,/const verifiedEarth=safeEarthLink\(rec\)/);
 assert.match(h,/id="atlasGoogleEarthLinkLabel"/);
 assert.match(h,/target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"/);
});
