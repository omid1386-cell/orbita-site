'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),THREE=require(path.resolve(root,'../assets/vendor/three.min.js'));
const ctx={window:{THREE},console};
for(const file of ['entity-data.js','entity-explore.js','entity-markers.js'])vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js',file),'utf8'),ctx);
const scene=new THREE.Scene(),globeGroup=new THREE.Group();scene.add(globeGroup);
const camera=new THREE.PerspectiveCamera(42,800/600,0.025,180);camera.position.set(0,0,5.55);camera.lookAt(0,0,0);
const canvas={addEventListener(){},removeEventListener(){},getBoundingClientRect(){return {left:0,top:0,width:800,height:600}}};
const engine={renderer:{domElement:canvas},globeGroup,scene,camera,target:{rx:0,ry:0,distance:5.55},controls:new Map(),dragVelocity:{x:0,y:0}};
const rows=[{key:'front',lat:0,lon:-90,category:'agency',categories:['agency']},{key:'back',lat:0,lon:90,category:'launch',categories:['launch']}];
const markers=new ctx.window.RaspehrEntityMarkers.EntityMarkers(engine,{markers:rows},()=>{});
function project(row,pad=0){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);return markers.projectAnchor(row,null,pad);}
const front=project(rows[0],21);assert.ok(front,'front-side entity visible');
assert.ok(!project(rows[1],21),'backside entity must never show through earth');
assert.ok(Math.abs(front.x-400)<1&&Math.abs(front.y-300)<1,'front marker centered');
// Simulate rotating the actual Earth: the pin is stored as a globe-local coordinate;
// it must move with the sphere and become invisible when rotated behind it.
globeGroup.rotation.y=0.42;const moved=project(rows[0],21);
assert.ok(moved&&Math.abs(moved.x-front.x)>20,'pin tracks geographic rotation');
globeGroup.rotation.y=Math.PI;assert.equal(project(rows[0],21),null,'pin hidden at back after turn');
globeGroup.rotation.y=2*Math.PI;const backAtFront=project(rows[0],21);
assert.ok(backAtFront&&Math.abs(backAtFront.x-front.x)<0.01,'return to original location after full revolution');
// Markers at/over the horizon should not spawn badges outside the Earth.
for(let angle=-Math.PI;angle<=Math.PI;angle+=0.07){
  globeGroup.rotation.y=angle;
  const at=project(rows[0],21);
  if(at){assert.ok(at.x>=0&&at.x<=800&&at.y>=0&&at.y<=600,'visible pin must lie within viewport');}
}
markers.setDisplay([rows[0]],[{key:'cluster:front|back',isCluster:true,lat:0,lon:-90,count:2}]);
assert.equal(markers.meshes.reduce((count,mesh)=>count+mesh.count,0),1,'a cluster is not a second large 3D sphere');
const grouped=ctx.window.RaspehrEntityExplore.cluster([
 {key:'a',lat:0,lon:-90},{key:'b',lat:1,lon:-90},{key:'c',lat:50,lon:25}
],r=>r.key==='a'?{x:80,y:90}:r.key==='b'?{x:85,y:90}:{x:700,y:500},50);
assert.equal(grouped.clusters.length,1);
assert.ok(['a','b'].includes(grouped.clusters[0].anchor.key),'cluster anchor must be an actual member');
const medoid=grouped.clusters[0].members.find(r=>r.key===grouped.clusters[0].anchor.key);
assert.equal(grouped.clusters[0].anchor.lat,medoid.lat);assert.equal(grouped.clusters[0].anchor.lon,medoid.lon);
markers.dispose();
console.log('PASS Priority1: stable world anchoring, hidden hemisphere, globe silhouette, one symbol per cluster, actual geo anchors');
