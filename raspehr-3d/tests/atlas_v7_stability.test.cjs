'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const win={THREE:{Vector3:class Vector3{constructor(x,y,z){Object.assign(this,{x,y,z});}normalize(){return this;}}}};
let cancelled=0,scheduled=0;
const ctx={window:win,console,performance:{now:()=>1000},document:{hidden:false},
 requestAnimationFrame:()=>++scheduled,cancelAnimationFrame:()=>++cancelled};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/globe-engine.js'),'utf8'),ctx);
const Engine=win.RaspehrGlobe.GlobeEngine;
const e=Object.create(Engine.prototype);
const classes=new Set(['is-dragging']);
e.controls=new Map([[11,{x:20,y:20}],[12,{x:30,y:30}]]);
e.host={classList:{remove:k=>classes.delete(k)}};
e.dragVelocity={x:13,y:-9};e.pinchDistance=50;
e.target={rx:0,ry:0,distance:5};e.globeGroup={rotation:{x:.3,y:.2}};
e.camera={position:{z:4.1}};
e.cameraFlight={startedAt:0,duration:1500};
e.stopped=false;e.active=true;e.raf=2;e.resize=()=>{};
e.clearPointerGestures();
assert.equal(e.controls.size,0);assert.equal(e.dragVelocity.x,0);
assert.equal(e.dragVelocity.y,0);assert.equal(e.pinchDistance,0);
assert.equal(classes.has('is-dragging'),false,'pointer drag CSS state must clear');
// Deactivating while a flight is running freezes at the actual camera pose.
e.controls.set(19,{x:100,y:150});e.dragVelocity.x=4;
e.setActive(false);
assert.equal(e.cameraFlight,null);
assert.equal(e.raf,0);assert.equal(e.active,false);
assert.equal(e.controls.size,0);assert.equal(e.dragVelocity.x,0);
assert.equal(e.target.rx,.3);assert.equal(e.target.ry,.2);
assert.equal(e.target.distance,4.1);
e.setActive(true);
assert.equal(e.active,true);assert.ok(e.raf,'resume schedules a new frame');
assert.equal(e.cameraFlight,null,'background flights never restart after reactivation');

// Child snapshot picks actually displayed pose during in-progress flight.
const model=require('../../assets/js/raspehr-stage5-state.js');
const events={},out=[];const parent={postMessage:p=>out.push(p)};
const back={hidden:true,addEventListener(k,fn){events['back.'+k]=fn;}};
const child={parent,document:{getElementById:()=>back},
 location:{origin:'https://raspehr.test',search:'?raspehr_3d_embedded=1'},
 addEventListener(k,fn){events[k]=fn;},RaspehrStage5State:model};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/stage5-integration.js'),'utf8'),
 {window:child,URLSearchParams,console});
const moving={target:{rx:40*Math.PI/180,ry:-1,distance:2.8},
 globeGroup:{rotation:{x:10*Math.PI/180,y:-.5}},camera:{position:{z:5.7}},cameraFlight:{duration:1500}};
child.RaspehrStage5Child.mount(moving,{getState:()=>({query:'test',categories:['site']})},{markers:[]});
events.message({origin:'https://raspehr.test',source:parent,
 data:{channel:'RASPEHR_STAGE5',type:'snapshot',requestId:7}});
const snapshot=out.at(-1);
assert.equal(snapshot.type,'snapshot');
assert.ok(Math.abs(snapshot.state.camera.lat-10)<.0001,'actual latitude transferred');
assert.ok(Math.abs(snapshot.state.camera.lon-model.wrapLon(-90+0.5*180/Math.PI))<.001,'actual longitude transferred');
assert.ok(Math.abs(snapshot.state.camera.zoom-model.distanceToZoom(5.7))<.001,'actual zoom transferred');
moving.cameraFlight=null;
events.message({origin:'https://raspehr.test',source:parent,
 data:{channel:'RASPEHR_STAGE5',type:'snapshot',requestId:8}});
assert.ok(Math.abs(out.at(-1).state.camera.lat-40)<.0001,
 'a normal idle snapshot still follows canonical target');
console.log('PASS V7: interrupted gestures, background flight freeze, midflight 3D-to-2D camera snapshot');
