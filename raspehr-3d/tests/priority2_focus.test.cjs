'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const THREE=require(path.resolve(root,'../assets/vendor/three.min.js'));
const ctx={window:{THREE},console,performance:{now:()=>1000}};
function load(file){vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js',file),'utf8'),ctx,{filename:file});}
load('globe-engine.js');
load('entity-markers.js');
load('entity-stage3-ui.js');

const globe=ctx.window.RaspehrGlobe;
const markers=ctx.window.RaspehrEntityMarkers;
const stage3=ctx.window.RaspehrStage3;

// Geographic focus must rotate any valid coordinate to the camera-facing +Z axis.
for(const [lat,lon] of [[0,0],[30,0],[30,45],[-20,120],[45,-75],[82,179]]){
  const t=globe.geoFocusTarget(lat,lon,3.05);
  const point=new THREE.Vector3(
    Math.cos(lat*Math.PI/180)*Math.cos(lon*Math.PI/180),
    Math.sin(lat*Math.PI/180),
    -Math.cos(lat*Math.PI/180)*Math.sin(lon*Math.PI/180)
  ).applyEuler(new THREE.Euler(t.rx,t.ry,0,'XYZ'));
  assert.ok(Math.abs(point.x)<1e-8 && Math.abs(point.y)<1e-8 && Math.abs(point.z-1)<1e-8,
    `focus must center ${lat},${lon}: ${point.toArray()}`);
}
assert.throws(()=>globe.geoFocusTarget(91,0,3),'reject invalid latitude');
assert.throws(()=>globe.geoFocusTarget(0,181,3),'reject invalid longitude');

// Flight interpolation follows the shortest longitude rotation and reaches its exact endpoint.
const flight={from:{rx:0,ry:179*Math.PI/180,distance:5.5},
  to:{rx:0.4,ry:-179*Math.PI/180,distance:3.05},startedAt:1000,duration:1000};
const start=globe.sampleCameraFlight(flight,1000);
const middle=globe.sampleCameraFlight(flight,1500);
const end=globe.sampleCameraFlight(flight,2000);
assert.equal(start.progress,0);
assert.ok(Math.abs(middle.ry-Math.PI)<0.03,'date-line transition should use the short angular path');
assert.equal(end.done,true);
assert.ok(Math.abs(end.rx-0.4)<1e-9 && Math.abs(end.distance-3.05)<1e-9);

// Precision-aware camera distances never imply building-level certainty for approximate pins.
assert.equal(markers.focusDistanceFor({precision:'representative'}),4.05);
assert.equal(markers.focusDistanceFor({precision:'approximate_city_pin'}),4.05);
assert.equal(markers.focusDistanceFor({precision:'official_site_coordinates'}),2.72);
assert.equal(markers.focusDistanceFor({precision:''}),3.05);

// Screen-space hit testing selects the closest visible candidate within a bounded radius.
const rows=[{id:'a'},{id:'b'},{id:'c'}];
const projected={a:{x:100,y:100},b:{x:114,y:106},c:{x:180,y:180},hidden:null};
const project=row=>projected[row.id];
assert.equal(markers.nearestProjectedMarker(rows,project,110,103,18).id,'b');
assert.equal(markers.nearestProjectedMarker(rows,project,130,130,10),null);
assert.equal(markers.nearestProjectedMarker(rows,project,100,100,18).id,'a');

// Cluster focus distance grows with cluster extent and remains inside camera limits.
const engine={camera:{fov:42,aspect:1.6}};
const small={lat:0,lon:0,members:[{lat:0,lon:0},{lat:0.2,lon:0.2}]};
const wide={lat:0,lon:0,members:[{lat:0,lon:0},{lat:12,lon:10},{lat:-8,lon:14}]};
const smallDistance=stage3.clusterFitDistance(small,engine);
const wideDistance=stage3.clusterFitDistance(wide,engine);
assert.ok(smallDistance>=2.15 && smallDistance<=6.8);
assert.ok(wideDistance>smallDistance,`${wideDistance} should exceed ${smallDistance}`);
assert.ok(wideDistance<=6.8);

// Engine flight is cancellable by manual user input.
const mock=Object.create(globe.GlobeEngine.prototype);
mock.globeGroup={rotation:{x:0.1,y:0.2}};
mock.camera={position:{z:5.2}};
mock.target={rx:0.1,ry:0.2,distance:5.2};
mock.dragVelocity={x:1,y:-1};
assert.equal(mock.flyToGeo(28.6,-80.6,3.05,{duration:1200}),true);
assert.ok(mock.cameraFlight);
assert.equal(mock.target.distance,3.05);
mock.globeGroup.rotation.x=0.3;mock.globeGroup.rotation.y=0.4;mock.camera.position.z=4.4;
assert.equal(mock.cancelCameraFlight(),true);
assert.equal(mock.cameraFlight,null);
assert.equal(mock.target.rx,0.3);
assert.equal(mock.target.ry,0.4);
assert.equal(mock.target.distance,4.4);

console.log('PASS Priority 2: geographic focus, camera flight, precision-aware zoom, screen hit testing and cluster framing');
