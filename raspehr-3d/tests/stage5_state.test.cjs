'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const State=require('../../assets/js/raspehr-stage5-state.js');
const root=path.resolve(__dirname,'../..');
assert.equal(State.categories.length,14);
const source={camera:{lat:35.8,lon:51.4,zoom:5},categories:['agency','site'],query:'ناسا',country:'Iran',profile:{kind:'company',id:'nasa',category:'agency'}};
const s=State.normalize(source);
assert.deepEqual(s.categories,['agency','site']);
assert.equal(s.camera.lat,35.8);
assert.equal(s.profile.id,'nasa');
assert.equal(s.query,'ناسا');
assert.deepEqual(State.normalize({categories:[]}).categories,[]);
assert.equal(State.normalize({categories:['unknown','launch','launch','site']}).categories.join(','),'launch,site');
assert.equal(State.normalize({camera:{lat:300,lon:-1000,zoom:900}}).camera.lat,85);
assert.equal(State.normalize({profile:{kind:'company',id:'nasa',category:'fake'}}).profile,null);
assert.equal(State.normalize({profile:{kind:'site',id:'ksc39a'}}).profile.id,'ksc39a');
assert.equal(State.normalize({profile:{kind:'country',id:'United States'}}).profile.id,'United States');
for(let zoom of [1.9,2,3,5,8,14]){
 const distance=State.zoomToDistance(zoom);
 assert.ok(distance>=2.08 && distance<=9.5);
 if(zoom>=2 && zoom<=5)assert.ok(Math.abs(State.distanceToZoom(distance)-zoom)<0.05);
}
for(let lon of [-540,-180,-90,0,20,180,360])assert.ok(State.wrapLon(lon)>=-180&&State.wrapLon(lon)<180);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const embedded=fs.readFileSync(path.join(root,'raspehr-3d/index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
assert.match(html,/raspehrStage5Toggle/);
assert.match(html,/raspehr-stage5-switch.js/);
assert.match(embedded,/stage5-integration.js/);
assert.match(embedded,/stage5BackToMap/);
assert.match(app,/window.RaspehrStage5MapAdapter/);
assert.match(app,/if \(!window.RASPEHR_PROFILE_EMBEDDED\)/);
const tests=['stage1_smoke.cjs','stage1_imagery_r7.test.cjs','terrain_dem.test.cjs','terrain_r6.integration.test.cjs','terrain_geometry_real_three.test.cjs','stage2_entities.test.cjs','stage2_markers.test.cjs','stage3_explore.test.cjs','stage3_markers.test.cjs','stage4_bridge.test.cjs'];
for(const test of tests){assert.ok(fs.existsSync(path.join(__dirname,test)),test);}
console.log('stage5 state and structural checks: PASS (14 categories; filters, camera, dossier, HTML and bridge)');
