'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/globe-engine.js'), 'utf8');
const fakeWindow = {THREE:{Vector3:class Vector3{constructor(x,y,z){Object.assign(this,{x,y,z});} normalize(){return this;}}}};
vm.runInNewContext(source, {window:fakeWindow,Math,Date,console,Uint8Array});
const {GlobeEngine:Engine,QUALITY,TILE_LEVELS,getTileLevelForDistance} = fakeWindow.RaspehrGlobe;

function newEngine(){
  const e=Object.create(Engine.prototype);
  e.textureToken=1; e.stopped=false; e.options={quality:'balanced'};
  e.levelCache={}; e.levelPromises={}; e.retiredLevelEntries=[];
  e.disposed=[];
  e.disposeTexture=t=>{t.disposed=true;e.disposed.push(t);};
  e.target={distance:5.55};
  return e;
}
function defer(){let resolve,reject;const promise=new Promise((res,rej)=>{resolve=res;reject=rej;});return {promise,resolve,reject};}
const wait=()=>new Promise(r=>setTimeout(r,0));
(async()=>{
  assert.equal(TILE_LEVELS.length,3);
  assert.equal(getTileLevelForDistance(5.5).id,'z0');
  assert.equal(getTileLevelForDistance(3.8).id,'z1');
  assert.equal(getTileLevelForDistance(2.5).id,'z2');
  assert.equal(getTileLevelForDistance(4.80,'z0').id,'z0','hysteresis level z0');
  assert.equal(getTileLevelForDistance(4.80,'z1').id,'z1','hysteresis level z1');
  assert.equal(getTileLevelForDistance(3.35,'z2').id,'z2','hysteresis level z2');

  // Verify every real browser-relative URL resolves to a file shipped inside the module.
  const v=newEngine();
  for(const level of TILE_LEVELS){
    const descriptors=v.buildLevelDescriptors(level,QUALITY.balanced);
    assert.equal(descriptors.length,level.rows*level.cols);
    for(const d of descriptors){
      for(const side of ['day','night']){
        const url=d[side];
        assert.ok(url.startsWith('assets/tex-tiles/'), 'tile URL outside module: '+url);
        assert.ok(fs.existsSync(path.join(root,url)), 'missing browser asset: '+url);
      }
    }
  }

  // One failed texture in a day/night pair cannot leak its successful partner.
  const failing=newEngine();
  failing.buildLevelDescriptors=()=>[{row:0,col:0,size:512,day:'d0',night:'n0'}, {row:0,col:1,size:512,day:'d1',night:'n1'}];
  failing.loadOneTexture=async(kind,url)=>{if(url==='n1') throw Error('simulated night failure');return {url};};
  await assert.rejects(failing.ensureLevelLoaded('z0',QUALITY.balanced,'balanced'),/simulated night failure/);
  assert.equal(failing.disposed.length,3,'successful textures must all be disposed on pair failure');
  assert.equal(Object.keys(failing.levelCache).length,0,'failed level must not be cached');

  // Old resolution finishing after a quality change must be discarded.
  const obsolete=newEngine(), delay=defer();
  obsolete.buildLevelDescriptors=()=>[{row:0,col:0,size:512,day:'d0',night:'n0'}];
  obsolete.loadOneTexture=async(kind,url)=>{await delay.promise;return {url};};
  const old=obsolete.ensureLevelLoaded('z0',QUALITY.balanced,'balanced');
  obsolete.textureToken++;
  delay.resolve();
  await assert.rejects(old,/superseded/);
  assert.equal(obsolete.disposed.length,2);
  assert.equal(Object.keys(obsolete.levelCache).length,0);

  // Asynchronous completion of a zoomed-in level may not override a later zoom-out.
  const racing=newEngine();
  racing.lastLevelCheck=0;racing.textureQuality='balanced';racing.surfaceMode='multilevel';
  racing.activeLevel='z0';racing.target.distance=3.8;
  racing.quality='balanced';
  const pending=defer();let displayed=[];
  racing.ensureLevelLoaded=()=>pending.promise;
  racing.applyLevel=id=>displayed.push(id);
  racing.onStatus=()=>{};
  racing.updateImageryLevel(500);
  racing.target.distance=5.5;
  pending.resolve({quality:'balanced',entries:[]});
  await wait();
  assert.deepEqual(displayed,[], 'late zoom should not override updated view');

  // A future upgrade must not discard active GPU textures before the new level is applied.
  const safe=newEngine();
  const previous={entries:[{day:{url:'old-day'},night:{url:'old-night'}}],quality:'low'};
  safe.levelCache.z0=previous;
  safe.levelGroups={z0:{visible:true},z1:{visible:false},z2:{visible:false}};
  safe.levelMaterials={z0:[{uniforms:{uDayTile:{},uNightTile:{}}}]};
  safe.earth={visible:false};safe.activeLevel='z0';safe.surfaceMode='multilevel';
  safe.buildLevelDescriptors=()=>[{row:0,col:0,size:512,day:'new-day',night:'new-night'}];
  safe.loadOneTexture=async(kind,url)=>({url});
  await safe.ensureLevelLoaded('z0',QUALITY.balanced,'balanced');
  assert.equal(safe.disposed.length,0,'previous visible textures freed too early');
  // fake group/one descriptor does not match true z0 count; unit-test the swap primitive directly.
  safe.applyLevel('z0');
  assert.equal(safe.disposed.length,2,'retired textures must be freed after swap');
  console.log('PASS RASPEHR R7 imagery: paths, hysteresis, partial failure cleanup, stale generations, zoom races and safe texture swap');
})().catch(e=>{console.error(e);process.exitCode=1;});
