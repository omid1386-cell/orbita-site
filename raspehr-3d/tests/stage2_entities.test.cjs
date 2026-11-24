'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const main=path.resolve(root,'..');
const sourceDir=process.env.RASPEHR_STAGE2_DATA || path.join(main,'data');
const files=['companies.json','sites.json','recovery_sites.json'];
if(!files.every(file=>fs.existsSync(path.join(sourceDir,file)))) {
 console.error('Provide canonical source files at data/ or RASPEHR_STAGE2_DATA=path'); process.exit(2);
}
const code=fs.readFileSync(path.join(root,'assets/js/entity-data.js'),'utf8');
const context={window:{},console};
vm.runInNewContext(code,context);
const api=context.window.RaspehrEntityData;
const groups={company:JSON.parse(fs.readFileSync(path.join(sourceDir,files[0]))),site:JSON.parse(fs.readFileSync(path.join(sourceDir,files[1]))),recovery:JSON.parse(fs.readFileSync(path.join(sourceDir,files[2]))).sites};
const result=api.buildRecords(groups);
const c=result.counts;
assert.equal(c.total,420);assert.equal(c.company,321);assert.equal(c.site,79);assert.equal(c.recovery,20);
assert.equal(c.markers,420);assert.equal(c.missing,0);
assert.equal(new Set(result.all.map(x=>x.key)).size,420);
assert.deepEqual([...new Set(result.markers.map(x=>x.kind))].sort(),['company','recovery','site']);
assert.equal(Object.keys(result.roles).length,14);
assert.equal(result.errors.length,0);
const expectedRoles={launch:68,propulsion:68,agency:96,satmaker:37,components:19,payloads:3,ground_services:3,inspace_services:4,university_space:5,test_facility:4,ground_station:16,mission_control:4,site:79,recovery:20};
for(const [cat,count] of Object.entries(expectedRoles))assert.equal(result.roles[cat],count,'category '+cat);
for(const m of result.markers){assert.ok(Number.isFinite(m.lat)&&Math.abs(m.lat)<=90);assert.ok(Number.isFinite(m.lon)&&Math.abs(m.lon)<=180);}
for(const m of result.missing){assert.ok(!result.markers.some(x=>x.key===m.key));}
assert.ok(result.markers.some(x=>x.id==='nasa'&&x.categories.includes('agency')));
assert.ok(result.markers.some(x=>x.id==='ksc39a'&&x.kind==='site'));
assert.ok(result.markers.some(x=>x.id==='recovery-lz4'&&x.kind==='recovery'));
assert.ok(result.markers.some(x=>x.id==='cubespace'&&x.categories.includes('satmaker')&&x.categories.includes('components')));
assert.ok(result.markers.every(x=>!('profile' in x)&&!('gallery' in x)&&!('fa_d' in x)));

// Verify the actual loader reads exactly these sources (without hardcoding content).
const mockFetch=async url=>({ok:true,json:async()=>{const src=api.SOURCES.find(s=>s.url===url);if(!src)throw new Error('Unexpected source: '+url);return src.kind==='recovery'?{sites:groups.recovery}:groups[src.kind];}});
api.load({fetch:mockFetch}).then(res=>{
 assert.equal(res.counts.total,420);
 // Reject partial catalog rather than deceptively declaring 420 valid when a source fails.
 return api.load({fetch:async url=>url.includes('recovery_sites')?{ok:false,status:503}:mockFetch(url)}).then(()=>{throw new Error('failed source unexpectedly accepted');},err=>assert.match(err.message,/دریافت همه منابع/));
}).then(()=>{
 console.log('PASS Stage2 adapter: 420 canonical entities, 420 representative or site markers, 0 missing; exact 14 memberships and safe partial-source failure');
}).catch(err=>{console.error(err);process.exitCode=1;});
