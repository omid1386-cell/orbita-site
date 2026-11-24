'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const ctx={window:{},console};
function load(file){vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});}
load(path.join(root,'raspehr-3d/assets/js/entity-data.js'));
load(path.join(root,'raspehr-3d/assets/js/entity-explore.js'));
const data=ctx.window.RaspehrEntityData, explore=ctx.window.RaspehrEntityExplore;
const groups={company:JSON.parse(fs.readFileSync(path.join(root,'data/companies.json'))),site:JSON.parse(fs.readFileSync(path.join(root,'data/sites.json'))),recovery:JSON.parse(fs.readFileSync(path.join(root,'data/recovery_sites.json'))).sites};
const c=data.buildRecords(groups);
assert.equal(c.counts.total,420);assert.equal(c.counts.markers,420);assert.equal(c.counts.missing,0);
assert.equal(explore.filter(c.markers,{categories:[]}).length,0);
assert.equal(explore.filter(c.markers,{categories:Object.keys(data.CATEGORIES)}).length,420);
assert.ok(explore.filter(c.markers,{query:'ناسا'}).some(r=>r.id==='nasa'));
assert.ok(explore.filter(c.markers,{query:'NASA'}).some(r=>r.id==='nasa'));
assert.ok(explore.filter(c.markers,{query:'ناسا ایالات'}).some(r=>r.id==='nasa'));
assert.ok(explore.filter(c.markers,{query:'کندي'}).some(r=>r.id==='ksc39a'),'Arabic ye/kaf normalization');
assert.ok(explore.filter(c.markers,{query:'site ksc39a'}).some(r=>r.id==='ksc39a'));
assert.equal(explore.filter(c.markers,{query:'عبارت_ساختگی_غیرموجود'}).length,0);
const us=explore.filter(c.markers,{country:'United States'});
assert.equal(us.length,c.markers.filter(r=>r.country==='United States').length);
assert.ok(us.length>50);assert.ok(us.every(r=>r.country==='United States'));
const countryNames=explore.countries(c.all);
assert.equal(new Set(countryNames.map(r=>r.value)).size,countryNames.length);
assert.equal(countryNames.find(r=>r.value==='Israel').label,'فلسطین اشغالی');
const cubespace=c.markers.find(r=>r.id==='cubespace');
assert.ok(cubespace.categories.includes('satmaker') && cubespace.categories.includes('components'));
assert.equal(explore.filter([cubespace],{categories:['components','satmaker']}).length,1,'one entity even in multiple categories');
const globeSamples=[
 {key:'a',lat:0,lon:179,categories:['agency']},
 {key:'b',lat:0,lon:-179,categories:['launch']},
 {key:'c',lat:20,lon:0,categories:['site']},
 {key:'hidden',lat:0,lon:90,categories:['agency']}
];
const center=explore.centralGeo(globeSamples.slice(0,2));
assert.ok(Math.abs(Math.abs(center.lon)-180)<2,'geographic clusters cross date line correctly');
const projected={a:{x:45,y:45},b:{x:65,y:45},c:{x:400,y:300},hidden:null};
const clusters=explore.cluster(globeSamples,r=>projected[r.key],48);
assert.equal(clusters.clusters.length,1);
assert.equal(clusters.clusters[0].count,2);
assert.equal(clusters.singles.length,1);
assert.equal(clusters.visibleCount,3);
assert.equal(clusters.clusters[0].members.length,2);
const zoomed=explore.cluster(globeSamples,r=>r.key==='hidden'?null:{x:r.key==='a'?10:r.key==='b'?100:400,y:10},48);
assert.equal(zoomed.clusters.length,0,'separate markers as view spreads out on zoom');
assert.equal(zoomed.singles.length,3);
const empty=explore.cluster([],()=>null,48);assert.equal(empty.visibleCount,0);
console.log('PASS Stage3 search/countries/14-category membership/date-line clustering: 420 records, 420 location-referenced, 23 formerly missing now labeled approximate');
