'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const vendor=process.env.RASPEHR_STAGE2_THREE || path.resolve(root,'../assets/vendor/three.min.js');
if(!fs.existsSync(vendor)){console.error('Set RASPEHR_STAGE2_THREE to vendor three.min.js');process.exit(2);}
const THREE=require(vendor);
const context={window:{THREE},console};
const load=file=>vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js',file),'utf8'),context);
load('entity-data.js');load('entity-markers.js');
const {EntityMarkers,geo,MARKER_RADIUS}=context.window.RaspehrEntityMarkers;
const data=context.window.RaspehrEntityData;
function near(a,b,epsilon=1e-7){assert.ok(Math.abs(a-b)<epsilon,a+' != '+b);}
near(geo(0,0,2).x,2);near(geo(0,90,2).z,-2);near(geo(0,-90,2).z,2);near(geo(90,0,2).y,2);
assert.throws(()=>geo(null,0,2));assert.throws(()=>geo(91,0,2));
const group=new THREE.Group();
const scene=new THREE.Scene();scene.add(group);
const camera=new THREE.PerspectiveCamera(42,800/600,0.025,180);camera.position.set(0,0,5.55);camera.lookAt(0,0,0);
const listeners=[];
const canvas={addEventListener:(name,handler)=>listeners.push([name,handler]),removeEventListener:()=>{},getBoundingClientRect:()=>({left:0,top:0,width:800,height:600})};
const engine={renderer:{domElement:canvas},globeGroup:group,scene,camera,target:{rx:0,ry:0,distance:5.55},controls:new Map(),dragVelocity:{x:0,y:0}};
const samples=[
 {key:'company:front',id:'front',lat:0,lon:-90,kind:'company',category:'agency',categories:['agency']},
 {key:'company:back',id:'back',lat:0,lon:90,kind:'company',category:'launch',categories:['launch']},
 {key:'site:mid',id:'mid',lat:22,lon:-80,kind:'site',category:'site',categories:['site']}
];
let latest=null;
const markers=new EntityMarkers(engine,{markers:samples},row=>{latest=row;});
assert.equal(markers.meshes.length,3);
assert.equal(markers.meshes.reduce((sum,m)=>sum+m.count,0),3);
assert.equal(markers.group.children.filter(x=>x.isInstancedMesh).length,3);
const hit=markers.pick(400,300);
assert.equal(hit.id,'front','front-facing marker must be ray-pickable');
markers.select(hit,true);
assert.equal(latest.id,'front');near(engine.target.ry,0);assert.equal(engine.target.distance,3.35);
assert.equal(markers.selectionRing.visible,true);
markers.setVisible(false);assert.equal(markers.pick(400,300),null);assert.equal(markers.selectionRing.visible,false);
markers.setVisible(true);assert.equal(markers.pick(400,300).id,'front');
markers.select(samples[2],true);near(engine.target.rx,22*Math.PI/180);
markers.dispose();assert.equal(group.children.includes(markers.group),false);assert.equal(markers.meshes.length,0);
console.log('PASS Stage2 marker engine: geographic vectors, 3 categories, instancing, visible-side ray picking, selection and cleanup');
