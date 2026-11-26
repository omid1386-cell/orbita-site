'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const T=require(path.join(root,'..','assets/vendor/three.min.js'));
const window={THREE:T};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/globe-engine.js'),'utf8'),{window,console},{filename:'globe-engine.js'});
const {GlobeEngine,getVisualEnvelope,QUALITY}=window.RaspehrGlobe;
assert.deepEqual(Object.keys(QUALITY).sort(),['balanced','high','low']);
for(const quality of Object.keys(QUALITY)){
  const near=getVisualEnvelope(2.02,quality,true);
  const far=getVisualEnvelope(5.55,quality,true);
  assert.ok(near.atmosphere<far.atmosphere,'near-surface halo must fade: '+quality);
  assert.ok(near.cloud<far.cloud,'near-surface cloud opacity must fade: '+quality);
  assert.ok(near.atmosphere>=0&&far.atmosphere<=1);
  assert.ok(far.cloud>=0&&far.cloud<0.4);
  assert.equal(getVisualEnvelope(5.55,quality,false).twilight,0,'lighting-off removes twilight tint');
  assert.ok(Number.isFinite(getVisualEnvelope(100,quality,true).atmosphere));
}
assert.ok(getVisualEnvelope(5.55,'low',true).atmosphere < getVisualEnvelope(5.55,'high',true).atmosphere);
assert.equal(getVisualEnvelope(5.55,'unknown',true).atmosphere,getVisualEnvelope(5.55,'balanced',true).atmosphere);
const e=Object.create(GlobeEngine.prototype);
e.options={quality:'balanced',lighting:true};
e.target={distance:5.55};e.camera={position:{z:5.55}};
e.atmosphereMaterial={uniforms:{uAtmosphereIntensity:{value:0}}};
e.cloudMaterial={uniforms:{uCloudOpacity:{value:0}}};
e.uniforms={uTwilightStrength:{value:0},uSun:{value:new T.Vector3(1,0,0)},uLighting:{value:1},uReliefStrength:{value:0},uSpecularStrength:{value:.22},uReliefTexel:{value:new T.Vector2(.01,.01)},uRelief:{value:{}},uSpecular:{value:{}}};
e.starField={material:{opacity:0}};
e.updateVisualLayers(0,true);
assert.ok(e.atmosphereMaterial.uniforms.uAtmosphereIntensity.value > .8);
const prev=e.atmosphereMaterial.uniforms.uAtmosphereIntensity.value;
e.camera.position.z=2.02;e.updateVisualLayers(1/60,false);
assert.ok(e.atmosphereMaterial.uniforms.uAtmosphereIntensity.value<prev,'transition animates in correct direction');
assert.ok(e.atmosphereMaterial.uniforms.uAtmosphereIntensity.value>getVisualEnvelope(2.02,'balanced',true).atmosphere,'transition is not abrupt');
for(let i=0;i<180;i++)e.updateVisualLayers(1/60,false);
assert.ok(Math.abs(e.atmosphereMaterial.uniforms.uAtmosphereIntensity.value-getVisualEnvelope(2.02,'balanced',true).atmosphere)<0.0015,'converges smoothly');
e.options.lighting=false;e.updateVisualLayers(0,true);
assert.equal(e.uniforms.uTwilightStrength.value,0);
// Shared uniform ensures tiles and fallback are visually consistent.
e.fallbackTextures=[{},{}];
const tile=e.createEarthTileMaterial();const single=e.createSingleEarthMaterial();
assert.strictEqual(tile.uniforms.uTwilightStrength,e.uniforms.uTwilightStrength);
for(const material of [tile,single]){
  assert.ok(material.fragmentShader.includes('float dusk='),'both surface paths use dusk enhancement');
  assert.ok(material.fragmentShader.includes('uTwilightStrength'),'both surface paths use twilight control');
}
tile.dispose();single.dispose();
e.globeGroup=new T.Group();
e.createCloudLayer();e.createAtmosphere();
assert.ok(e.cloudMaterial.fragmentShader.includes('uCloudOpacity'));
assert.ok(e.atmosphereMaterial.fragmentShader.includes('uAtmosphereIntensity'));
assert.equal(e.globeGroup.children.length,2,'same two visual shells, no additional draw passes');
e.clouds.geometry.dispose();e.cloudMaterial.dispose();e.atmosphere.geometry.dispose();e.atmosphereMaterial.dispose();
console.log('PASS Atlas V8: zoom envelope, adaptive quality, smooth optical transitions, shared shading, no extra scene shell');
