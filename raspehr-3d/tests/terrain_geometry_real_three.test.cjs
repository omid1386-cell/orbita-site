'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
let THREE;
try {THREE=require('three');} catch (_) {
  try {THREE=require(path.resolve(__dirname, '../../assets/vendor/three.min.js'));}
  catch(err){console.error('Three.js local runtime required for geometry QA');process.exit(2);}
}
const root={THREE};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../assets/js/globe-engine.js'),'utf8'),{window:root,Math,Date,console});
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../assets/js/terrain-dem.js'),'utf8'),{window:root,Math,Date,console});
const DEM=root.RaspehrTerrainDEM;
const m={meters(lat,lon){return lat>=-85&&lat<=85 ? 2500 : 0;}};
const earth=new THREE.Mesh(new THREE.SphereGeometry(1.72,64,32),new THREE.MeshBasicMaterial());
const group=new THREE.Group();
const mesh=new THREE.Mesh(new THREE.SphereGeometry(1.72*1.0014,24,24,0,Math.PI/2,0,Math.PI/2),new THREE.MeshBasicMaterial());
group.add(mesh);
const before=earth.geometry.attributes.position.array.slice();
const fake={earth,levelGroups:{z0:group},terrainData:m,options:{terrainExaggeration:4},terrainLoaded:false};
const result=root.RaspehrGlobe.GlobeEngine.prototype.applyTerrainGeometry.call(fake,true);
assert.ok(result.vertices>=earth.geometry.attributes.position.count);
assert.ok(result.displaced>0);
assert.equal(fake.terrainLoaded,true);
assert.ok(earth.geometry.attributes.position.array.some((x,i)=>Math.abs(x-before[i])>0.0001));
root.RaspehrGlobe.GlobeEngine.prototype.applyTerrainGeometry.call(fake,false);
assert.equal(fake.terrainLoaded,false);
for(let i=0;i<before.length;i++)assert.ok(Math.abs(earth.geometry.attributes.position.array[i]-before[i])<1e-6);
// Coordinate-to-texture orientation: uv=0.25 at equator must be ~90° W, not 90° E.
const full=new THREE.SphereGeometry(1,8,4);
let check=false;
for(let i=0;i<full.attributes.uv.count;i++){
 const uv=full.attributes.uv,x=full.attributes.position.getX(i),y=full.attributes.position.getY(i),z=full.attributes.position.getZ(i);
 if(Math.abs(uv.getX(i)-0.25)<0.0001&&Math.abs(y)<1e-5){
   const lon=Math.atan2(-z,x)*180/Math.PI;
   assert.ok(Math.abs(lon+90)<1e-5, 'texture/DEM longitude sign mismatch');check=true;
 }
}
assert.ok(check);
console.log('PASS terrain R6 actual Three.js CPU geometry: displacement, restoration, texture/DEM longitude alignment');
