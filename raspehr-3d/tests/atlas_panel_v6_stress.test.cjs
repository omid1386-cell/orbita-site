'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const T=require(path.join(root,'..','assets/vendor/three.min.js'));
const context={window:{THREE:T},console};
for(const file of ['entity-data.js','entity-markers.js','globe-engine.js','entity-stage3-ui.js']){
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js',file),'utf8'),context,{filename:file});
}
const scene=new T.Scene(),group=new T.Group();scene.add(group);
const camera=new T.PerspectiveCamera(42,1280/720,0.025,180);
camera.position.set(0,0,5.55);camera.lookAt(0,0,0);
const rect={left:0,top:0,width:1280,height:720};
const listeners=new Map();
const canvas={addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name){listeners.delete(name);},getBoundingClientRect(){return rect;}};
const engine={renderer:{domElement:canvas},globeGroup:group,scene,camera,
  target:{rx:0,ry:0,distance:5.55},controls:new Map(),dragVelocity:{x:0,y:0}};
const keys=Object.keys(context.window.RaspehrEntityData.CATEGORIES);
const rows=Array.from({length:420},(_,i)=>({key:'stress-'+i,lat:-75+(i*37)%150,lon:-179+(i*83)%358,category:keys[i%keys.length]}));
const Marker=context.window.RaspehrEntityMarkers.EntityMarkers;
const markers=new Marker(engine,{markers:rows},()=>{});
const upfront=markers.meshPool.size;
assert.ok(upfront>0&&upfront<=keys.length);
scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
const front={key:'front',lat:0,lon:-90,category:keys[0]};
const back={key:'back',lat:0,lon:90,category:keys[0]};
const projection=markers.createProjectionContext(rect);
assert.ok(markers.projectAnchor(front,rect,0,projection),'front pin visible');
assert.equal(markers.projectAnchor(back,rect,0,projection),null,'occluded pin stays hidden');
markers.setDisplay([...rows,front],[]); // Warm capacity for the largest expected view.
const existing=new Map([...markers.meshPool].map(([key,entry])=>[key,entry.mesh]));
const longRunStart=process.hrtime.bigint();
for(let turn=0;turn<1400;turn++){
 const subset=turn%3===0?rows.slice():turn%3===1?rows.filter((_,i)=>i%3===0):rows.filter((_,i)=>i%4===0);
 if(turn%11===0)subset.push(front);
 markers.setDisplay(subset,[]);
 assert.equal(markers.meshes.reduce((n,m)=>n+m.count,0),subset.length);
 assert.ok(markers.meshPool.size<=keys.length,'pool is bounded to category count');
 for(const mesh of markers.meshes){
   assert.ok(mesh.count<=mesh.instanceMatrix.count,'instance buffer cannot overflow');
   assert.equal(mesh.userData.records.length,mesh.count,'raycast lookup has no stale indices');
 }
}
const elapsedMs=Number(process.hrtime.bigint()-longRunStart)/1e6;
for(const [key,mesh] of existing)assert.strictEqual(markers.meshPool.get(key).mesh,mesh,'stable category mesh reused: '+key);
assert.ok(elapsedMs<15000,'synthetic stress should not hang: '+elapsedMs.toFixed(1)+'ms');
markers.setDisplay([],[]);
assert.equal(markers.meshes.length,0);
markers.setDisplay(rows,[]);
assert.equal(markers.meshes.reduce((n,m)=>n+m.count,0),420);
// Rapid camera moves must keep geography anchored and must not leak the far hemisphere.
for(let i=0;i<160;i++){
  group.rotation.y=i*0.14;
  camera.position.z=2.1+(i%20)*0.35;
  scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  const shared=markers.createProjectionContext(rect);
  for(const item of [front,back]){
    const fast=markers.projectAnchor(item,rect,3,shared);
    const normal=markers.projectAnchor(item,rect,3);
    assert.equal(!!fast,!!normal,'shared projection preserves visibility');
    if(fast)assert.ok(Math.abs(fast.x-normal.x)<1e-8&&Math.abs(fast.y-normal.y)<1e-8,'shared projection preserves coordinates');
  }
}
markers.dispose();
assert.equal(markers.meshPool.size,0,'dispose releases pooled mesh refs');
assert.equal(listeners.size,0,'interaction listeners released');
assert.equal(group.children.length,0,'visual artifacts removed on cleanup');
console.log(`PASS Atlas V6: 1400 rapid recluster passes on 420 synthetic records, ${elapsedMs.toFixed(1)}ms CPU, 160 camera moves, reuse, projection and disposal`);
