'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const code=fs.readFileSync(path.resolve(__dirname,'../assets/js/terrain-dem.js'),'utf8');
const env={window:{},AbortController,setTimeout,clearTimeout,console,Uint8ClampedArray,Float32Array,Map};
vm.runInNewContext(code,env);
const {TerrariumElevation,mercatorPoint,terrariumMeters,applyHeightToGeometry}=env.window.RaspehrTerrainDEM;
function fill(meters){const code=meters+32768;const r=Math.floor(code/256),g=Math.floor(code)%256,b=Math.round((code-Math.floor(code))*256);const data=new Uint8ClampedArray(256*256*4);for(let i=0;i<data.length;i+=4){data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=255;}return data;}
async function main(){
  assert.equal(terrariumMeters(128,0,0),0);
  assert.equal(terrariumMeters(135,208,0),2000);
  for(const lon of [-720,-180,0,180,360,540]){const p=mercatorPoint(0,lon,2);assert.ok(p.tx>=0&&p.tx<4);}
  const dem=new TerrariumElevation(2,{baseUrl:'/local-dem/',timeoutMs:800});
  assert.equal(dem.url(3,2),'/local-dem/2/3/2.png');
  let count=0;
  dem.fetchTile=async(x,y)=>{count++;return fill(1000+x*1000+y*100);};
  const progress=[];
  await dem.load({concurrency:3,onProgress:(a,b)=>progress.push([a,b])});
  assert.equal(count,16);
  assert.equal(dem.tiles.size,16);
  assert.deepEqual(progress.at(-1),[16,16]);
  assert.equal(dem.meters(0,0.001)>0,true);
  // Between neighboring tiles the surface should be continuous rather than abruptly jump.
  const lhs=dem.meters(0,-0.0001),rhs=dem.meters(0,0.0001);
  assert.ok(Math.abs(lhs-rhs)<1,'inter-tile seam not continuous: '+lhs+', '+rhs);
  assert.equal(dem.meters(90,0),0,'Mercator polar gap is not invented');
  const geo={attributes:{position:{array:Float32Array.from([1.72,0,0,0,1.72,0,0,0,1.72]),count:3,needsUpdate:false}},userData:{},computeVertexNormals(){},computeBoundingSphere(){}};
  const s=applyHeightToGeometry(geo,dem,1.72,4);
  assert.ok(s.displaced>=2);
  assert.ok(geo.attributes.position.array[0]>1.72);
  applyHeightToGeometry(geo,null,1.72,1);
  assert.ok(Math.abs(geo.attributes.position.array[0]-1.72)<1e-5,'restores original radius');
  // Failure during a multi-worker load must not publish partially collected tiles.
  const failed=new TerrariumElevation(2,{baseUrl:'/local-dem/'});
  failed.fetchTile=async(x,y,signal)=>{
    if(x===1&&y===0)throw Error('simulated network failure');
    await new Promise(resolve=>setTimeout(resolve,20));
    return fill(2000);
  };
  await assert.rejects(failed.load({concurrency:4}),/simulated network failure/);
  assert.equal(failed.tiles.size,0,'partial data leaked on failure');
  await new Promise(resolve=>setTimeout(resolve,45));
  assert.equal(failed.tiles.size,0,'late worker committed after error');
  failed.fetchTile=async()=>fill(1500);
  await failed.load({concurrency:4});
  assert.equal(failed.tiles.size,16,'retry did not repopulate all tiles');
  // Hanging requests must fail with a bounded timeout, not wait forever.
  env.fetch=async(_url,opts)=>new Promise((_resolve,reject)=>{
    opts.signal.addEventListener('abort',()=>reject(new Error('AbortError')), {once:true});
  });
  const hanging=new TerrariumElevation(0,{timeoutMs:65});
  await assert.rejects(hanging.fetchTile(0,0),/exceeded 65 ms timeout/);
  console.log('PASS terrain R6 integration: Mercator wrap, seam continuity, 16-tile atomic load, failure cleanup, retry, geometry toggle');
}
main().catch(err=>{console.error(err);process.exitCode=1;});
