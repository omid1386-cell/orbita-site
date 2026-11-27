'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const qa=require('../qa/earth-stage5-review-import.cjs');
const app=path.resolve(__dirname,'..');
const registry=JSON.parse(fs.readFileSync(path.join(app,'data/external-links-v1.json'),'utf8'));
const records=JSON.parse(fs.readFileSync(path.join(app,'qa/RASPEHR_GOOGLE_EARTH_STAGE5_ALL_420_FOR_REVIEW.json'),'utf8')).records;
const html=fs.readFileSync(path.join(app,'qa/RASPEHR_GOOGLE_EARTH_STAGE5_REVIEW_420.html'),'utf8');
const kml=fs.readFileSync(path.join(app,'qa/RASPEHR_GOOGLE_EARTH_STAGE5_REVIEW_420.kml'),'utf8');
const r=registry.records.find(x=>x.kind==='site'&&x.id==='ksc39a');
const eurl='https://earth.google.com/web/@28.6084,-80.6043,0a,7000d,35y,0h,50t,0r';
const acceptable={...r,earth_url:eurl,earth_result:'correct',approved:true,reviewer:'Test reviewer',evidence:'Local Earth screenshot with current view',reviewed_at:'2026-11-26T10:30:00.000Z'};
test('420 reviewed catalog entries are canonical, named, and contain 15 priority targets',()=>{
 assert.equal(records.length,420);assert.equal(records.filter(x=>x.priority).length,15);
 assert.equal(records.filter(x=>x.kind==='company').length,321);assert.equal(records.filter(x=>x.kind==='site').length,79);assert.equal(records.filter(x=>x.kind==='recovery').length,20);
 const source=new Map(registry.records.map(x=>[x.kind+':'+x.id,x]));
 for(const rec of records){const original=source.get(rec.kind+':'+rec.id);assert(original);assert.equal(original.lat,rec.lat);assert.equal(original.lon,rec.lon);assert(rec.fa&&rec.en);}
});
test('earth review HTML is a standalone 420-place offline tool; experimental links are not product links',()=>{
 assert.match(html,/const RECORDS=/);assert.match(html,/آزمودن پیوند مختصاتی ارث \(غیررسمی\)/);
 assert.match(html,/نامزدهای تأیید/);assert.match(html,/RASPEHR_EARTH_STAGE5_REVIEWS.json/);
 const product=fs.readFileSync(path.join(app,'index.html'),'utf8');assert.match(product,/id="atlasGoogleEarthLink"[^>]+hidden/);
 assert.equal(registry.records.filter(x=>x.google_earth_live_checked).length,0);
});
test('earth view URL validation rejects lookalike domains and dangerous protocols',()=>{
 for(const u of ['https://earth.google.com.evil.example/web/@28,80','http://earth.google.com/web/@28,80','javascript:alert(1)','https://earth.google.com:8443/web/@28,80','https://earth.google.com@evil.example/web/'])assert.equal(qa.checkEarthURL(u).ok,false,u);
 assert.equal(qa.checkEarthURL(eurl).ok,true);
});
test('known camera center is parsed and checked against site position',()=>{
 assert.deepEqual(qa.earthViewCenter(eurl),[28.6084,-80.6043]);
 assert(qa.distanceKM(28.6084,-80.6043,28.6084,-80.6043)<.01);
 assert.equal(qa.evaluate(r,acceptable).eligible,true);
 assert.equal(qa.evaluate(r,{...acceptable,earth_url:'https://earth.google.com/web/@40,-70,0a,7000d,35y,0h,50t,0r'}).reason,'view_center_too_far');
});
test('unreadable center is never auto-promoted even after manual tick',()=>{
 assert.equal(qa.evaluate(r,{...acceptable,earth_url:'https://earth.google.com/web/data=sample'}).reason,'view_center_unreadable_requires_independent_geographic_validation');
});
test('no approval without live correct, reviewer, evidence, date, and independent confirmation',()=>{
 assert.equal(qa.evaluate(r,{...acceptable,earth_result:'untested'}).eligible,false);
 assert.equal(qa.evaluate(r,{...acceptable,approved:false}).eligible,false);
 assert.equal(qa.evaluate(r,{...acceptable,evidence:''}).eligible,false);
 assert.equal(qa.evaluate(r,{...acceptable,reviewer:''}).eligible,false);
 const reviews=registry.records.map(x=>({...x,earth_url:'',earth_result:'untested',approved:false}));
 const sample=reviews.find(x=>x.kind===r.kind&&x.id===r.id);Object.assign(sample,acceptable);
 const inp={format:'raspehr-earth-stage5-review-v1',records:reviews};
 const unapproved=qa.merge(registry,inp,false),approved=qa.merge(registry,inp,true);
 assert.equal(unapproved.accepted.length,1);assert.equal(unapproved.approved_count,0);
 assert.equal(approved.approved_count,1);
 assert.equal(unapproved.proposed.records.find(x=>x.id==='ksc39a'&&x.kind==='site').google_earth_live_checked,false);
 assert.equal(approved.proposed.records.find(x=>x.id==='ksc39a'&&x.kind==='site').google_earth_live_checked,true);
 assert.equal(registry.records.find(x=>x.id==='ksc39a'&&x.kind==='site').google_earth_live_checked,false);
});
test('review KML contains 420 placemarks and location cameras',()=>{
 assert.equal((kml.match(/<Placemark>/g)||[]).length,420);
 assert.equal((kml.match(/<LookAt>/g)||[]).length,420);
 assert.match(kml,/<range>24000<\/range>/);
});
