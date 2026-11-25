'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const THREE=require(path.resolve(root,'../assets/vendor/three.min.js'));
let label=null,frameCallback=null,removed=false;
const doc={createElement(tag){
  assert.equal(tag,'div');
  label={hidden:true,className:'',style:{},attributes:{},textContent:'',
    setAttribute(k,v){this.attributes[k]=v;},remove(){removed=true;}};
  return label;
}};
const context={window:{THREE,matchMedia:()=>({matches:false})},document:doc,console};
for(const file of ['entity-data.js','entity-markers.js'])
  vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js',file),'utf8'),context,{filename:file});
const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
const camera=new THREE.PerspectiveCamera(42,800/600,.02,100);
camera.position.set(0,0,5.55);camera.lookAt(0,0,0);
const canvas={addEventListener(){},removeEventListener(){},getBoundingClientRect(){return {left:0,top:0,width:800,height:600}}};
const host={appendChild(el){assert.equal(el,label);}};
const engine={host,scene,globeGroup:group,camera,renderer:{domElement:canvas},
 target:{rx:0,ry:0,distance:5.55},controls:new Map(),dragVelocity:{x:0,y:0},
 addFrameObserver(cb){frameCallback=cb;return ()=>{frameCallback=null;}}};
const row={id:'test',key:'company:test',fa:'مکان آزمایشی',lat:0,lon:-90,
 category:'agency',categories:['agency'],precision:'approximate_city_pin'};
const Markers=context.window.RaspehrEntityMarkers.EntityMarkers;
const markers=new Markers(engine,{markers:[row]},()=>{});
assert.ok(label && frameCallback && label.hidden);
assert.equal(markers.select(row,false),true);
assert.ok(label.textContent.includes('مکان آزمایشی'));
assert.ok(label.textContent.includes('نقطه مرجع'));
scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
frameCallback(1000);
assert.equal(label.hidden,false);
assert.ok(Math.abs(parseFloat(label.style.left)-400)<2,'selected label anchored to location');
assert.ok(Math.abs(parseFloat(label.style.top)-284)<2,'selected label offset above location');
const opacity1=markers.haloMaterial.opacity;
const farScale=markers.selectionRing.scale.x;
frameCallback(1600);
assert.notEqual(markers.haloMaterial.opacity,opacity1,'halo gently animates');
camera.position.z=2.2;camera.updateMatrixWorld(true);
frameCallback(1700);
assert.ok(markers.selectionRing.scale.x<farScale,'selection ring shrinks at close zoom instead of becoming oversized');
camera.position.z=5.55;camera.updateMatrixWorld(true);
group.rotation.y=Math.PI;
scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
frameCallback(2000);
assert.equal(label.hidden,true,'never reveal marker behind globe');
group.rotation.y=0;
scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
markers.setVisible(false);
assert.equal(label.hidden,true);
markers.setVisible(true);frameCallback(2400);
assert.equal(label.hidden,false);
markers.clearSelection();
assert.equal(label.hidden,true);
markers.dispose();
assert.equal(removed,true);
assert.equal(frameCallback,null,'visual observer cleaned up');
console.log('PASS Priority5: one globe-anchored selected label, hidden hemisphere, approximate notice, halo pulse, cleanup');
