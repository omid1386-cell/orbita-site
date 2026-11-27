'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const qa=require('../qa/validate-direct-earth-pilot.cjs');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../qa/RASPEHR_DIRECT_EARTH_LINK_PILOT_5.json'),'utf8'));
test('pilot has five canonical targets across site, company, recovery',()=>{
 assert.equal(data.records.length,5);assert.deepEqual([...new Set(data.records.map(x=>x.kind))].sort(),['company','recovery','site']);
});
test('all direct Earth candidate URLs use the observed HTTPS Earth Web camera path',()=>{
 for(const r of data.records){const p=qa.parse(r.earth_candidate_url);assert.equal(p.ok,true,r.id);assert.equal(p.lat,r.lat);assert.equal(p.lon,r.lon);}
});
test('all links center on exact canonical registry coordinates',()=>{
 const app=path.resolve(__dirname,'..');const reg=JSON.parse(fs.readFileSync(path.join(app,'data/external-links-v1.json'),'utf8'));
 for(const r of data.records){const canonical=reg.records.find(x=>x.id===r.id&&x.kind===r.kind);assert(canonical);assert.equal(r.lat,canonical.lat);assert.equal(r.lon,canonical.lon);}
});
test('malicious hosts, schemes, and invalid camera values are rejected',()=>{
 for(const u of ['http://earth.google.com/web/@1,2,0a,1000d,35y,0h,50t,0r','https://earth.google.com.evil.test/web/@1,2,0a,1000d,35y,0h,50t,0r','javascript:alert(1)','https://earth.google.com:8443/web/@1,2,0a,1000d,35y,0h,50t,0r','https://earth.google.com/web/@91,2,0a,1000d,35y,0h,50t,0r','https://earth.google.com/web/@1,2,0a,0d,35y,0h,50t,0r'])assert.equal(qa.parse(u).ok,false,u);
});
test('pilot labels are taken from the canonical Persian catalog',()=>{
 assert.ok(data.records.every(x=>x.name_fa && x.name_fa!==x.id));
});
test('existing Earth review parser reads the same candidate centers',()=>{
 const helper=require('../qa/earth-stage5-review-import.cjs');
 for(const r of data.records){assert.equal(helper.checkEarthURL(r.earth_candidate_url).ok,true);assert.deepEqual(helper.earthViewCenter(r.earth_candidate_url),[r.lat,r.lon]);}
});
test('pilot validator never promotes candidates to live-verified status',()=>{
 const result=qa.validate(data);assert.equal(result.records,5);assert.equal(result.valid_urls,5);assert.equal(result.coordinate_matches,5);assert.equal(result.live_open_verified,0);assert.ok(data.records.every(x=>x.live_open_verified===false));
});
