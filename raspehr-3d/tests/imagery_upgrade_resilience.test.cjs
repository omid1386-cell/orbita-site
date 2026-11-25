'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const THREE=require(path.resolve(root,'../assets/vendor/three.min.js'));
const context={window:{THREE},THREE,URL,console,Map,Set,Math,Number,String,Array,Object,Date,JSON,AbortController,setTimeout,clearTimeout};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/local-facility-view.js'),'utf8'),context);
const api=context.window.RaspehrLocalFacility;
function compact(x){return JSON.parse(JSON.stringify(x));}
const ksc={key:'site:ksc39a',kind:'site',lat:28.6084,lon:-80.6043,precision:'',categories:['site']};
assert.deepEqual(compact(api.facilityEligibility(ksc)),{allowed:true,tier:'regional',confidence:'unverified',reason:'مبنای دقیق مختصات ثبت نشده؛ فقط نمای منطقه‌ای، نه ساختمان دقیق، مجاز است.'});
assert.equal(api.facilityEligibility({...ksc,precision:'representative'}).allowed,false);
assert.equal(api.facilityEligibility({...ksc,precision:'official_site_coordinates'}).tier,'facility');
assert.equal(api.isConusPoint(ksc),true);
assert.equal(api.isConusPoint({lat:57.44,lon:-152.34}),false);
assert.equal(api.isConusPoint({lat:36.201,lon:55.33}),false);
assert.equal(api.rasterProviders(ksc,null)[0].type,'usgs');
assert.equal(api.rasterProviders({lat:36.2,lon:55.33},null)[0].type,'global');
const center=api.mercatorTile(ksc.lat,ksc.lon,16);
assert.match(api.rasterTileUrl({type:'usgs'}, {...center,z:16}),/MapServer\/tile\/16\/\d+\/\d+$/);
assert.match(api.rasterTileUrl({type:'global'}, {...center,z:16}),/global\.imagery\.hotosm\.org\/16\/\d+\/\d+\.png$/);
assert.match(api.rasterTileUrl({type:'stac',item:{id:'a b'}},{...center,z:16}),/items\/a%20b\/tiles\/WebMercatorQuad/);
const ring=[[-81,28],[-80,28],[-80,29],[-81,29],[-81,28]];
const hole=[[-80.7,28.3],[-80.5,28.3],[-80.5,28.8],[-80.7,28.8],[-80.7,28.3]];
assert.equal(api.geometryContainsPoint({geometry:{type:'Polygon',coordinates:[ring,hole]}},{lat:28.5,lon:-80.6}),false);
assert.equal(api.geometryContainsPoint({geometry:{type:'Polygon',coordinates:[ring,hole]}},{lat:28.6084,lon:-80.6043}),false);
assert.equal(api.geometryContainsPoint({geometry:{type:'Polygon',coordinates:[ring,hole]}},{lat:28.1,lon:-80.6}),true);
// OSM building relations can consist of multiple outer way segments.
const poly=[{lat:28.6080,lon:-80.6045},{lat:28.6080,lon:-80.6040},{lat:28.6084,lon:-80.6040},{lat:28.6084,lon:-80.6045},{lat:28.6080,lon:-80.6045}];
const relation={type:'relation',id:77,tags:{building:'warehouse',height:'12m'},members:[
 {type:'way',role:'outer',ref:13,geometry:poly.slice(0,3)},
 {type:'way',role:'outer',ref:14,geometry:poly.slice(2)}
]};
const parsed=api.parseOsmBuildings(relation);
assert.equal(parsed.length,1);
assert.equal(parsed[0].osmType,'relation');
assert.equal(parsed[0].height.meters,12);
assert.equal(api.parseOsmBuildings({type:'node',id:5,tags:{building:'yes'},lat:28,lon:-80}).length,0);
assert.equal(api.buildingNodeCount([{type:'node',tags:{building:'yes'}},{type:'way',tags:{building:'yes'}}]),1);
assert.match(api.makeOverpassQuery(ksc,500),/node\["building"\]/);
assert.match(api.makeOverpassQuery(ksc,500),/relation\["building"\]/);
assert.match(api.makeOverpassQuery(ksc,500),/around:500/);
assert.equal(api.inspectRasterImage({width:0,height:0}).valid,false);
const evidence=JSON.parse(fs.readFileSync(path.join(root,'data/site-imagery-evidence-63.json'),'utf8'));
assert.equal(evidence.sites.length,63);
assert.equal(evidence.sites.filter(x=>x.deployable_georeferenced_tile).length,0);
assert.equal(evidence.sites.filter(x=>x.license_for_republication_verified).length,0);
assert.equal(evidence.sites.filter(x=>x.published_scene_reference.url).length,29);
const names=new Set(evidence.sites.map(x=>x.site_id));assert.equal(names.size,63);

function engineFake(){
 const globeGroup=new THREE.Group();
 return {globeGroup,minDistance:2.02,options:{terrain:false},terrainData:null,
  camera:{near:.025,far:180,updateProjectionMatrix(){}},
  clouds:{visible:true},atmosphere:{visible:true},starField:{visible:true},gridGroup:{visible:true},
  flights:[],flyToGeo(lat,lon,distance,opts){this.flights.push({lat,lon,distance,opts});},
  renderer:{capabilities:{getMaxAnisotropy(){return 4;}}}
 };
}
async function useCase({site,stac,blocked,sourceExpected,qualityExpected,expectBuildings}){
 const engine=engineFake();const states=[];
 const view=new api.LocalFacilityView(engine,state=>states.push(state));
 const markers={enabled:true,setVisible(v){this.enabled=v;}};view.setMarkers(markers);
 view.fetchJson=async url=>{
  if(String(url).includes('/stac/search')){
    if(stac==='fail')throw new Error('STAC inaccessible');
    return {features:stac||[]};
  }
  return {elements:expectBuildings?[
    {type:'way',id:13,tags:{building:'warehouse',height:'9m'},geometry:poly},
    relation
  ]:[]};
 };
 const sources=[];
 view.loadTexture=async (url)=>{
  sources.push(String(url));
  if(blocked && blocked.some(a=>String(url).includes(a)))throw new Error('missing tile');
  return new THREE.Texture();
 };
 const result=await view.enter(site);
 assert.equal(result,true);
 assert.equal(states.at(-1).quality,qualityExpected);
 assert.equal(view.imageryMeta && view.imageryMeta.sourceType,sourceExpected);
 assert.ok(engine.flights.length>0);
 if(qualityExpected==='facility')assert.ok(engine.flights.at(-1).distance<1.721);
 else assert.ok(engine.flights.at(-1).distance>1.722);
 if(expectBuildings) assert.ok(view.buildingSummary.total>=1);
 else assert.equal(view.buildingSummary.total,0);
 const ok=sourceExpected==='global'?'global.imagery.hotosm.org':sourceExpected==='usgs'?'USGSImageryOnly':null;
 if(ok)assert.ok(sources.some(x=>x.includes(ok)));
 view.exit({restoreCamera:false});
 assert.equal(markers.enabled,true);
 assert.equal(view.imageryGroup.children.length,0);
 assert.equal(engine.minDistance,2.02);
 assert.equal(engine.camera.near,.025);
 view.dispose();
}
(async()=>{
  const item={id:'a-valid-stac',geometry:{type:'Polygon',coordinates:[ring]},
   properties:{gsd:0.5,license:'CC-BY-4.0','oam:product_type':'visual'},assets:{visual:{href:'https://example.com/visual'}}};
  await useCase({site:{...ksc,precision:'official_pad_center'},stac:[item],sourceExpected:'stac',qualityExpected:'facility',expectBuildings:true});
  await useCase({site:ksc,stac:[],sourceExpected:'usgs',qualityExpected:'regional',expectBuildings:false});
  await useCase({site:{...ksc,lat:36.201,lon:55.33},stac:'fail',sourceExpected:'global',qualityExpected:'regional',expectBuildings:false});
  await useCase({site:{...ksc,lat:36.201,lon:55.33},stac:[],blocked:['global.imagery.hotosm.org'],sourceExpected:null,qualityExpected:'unavailable',expectBuildings:false});
  // Failed center tile must not be counted as point coverage merely because adjacent tiles exist.
  const v=new api.LocalFacilityView(engineFake());v.token=5;
  v.loadTexture=async url=>{throw new Error('blocked center');};
  const tested=await v.loadRasterProvider(ksc,api.rasterProviders(ksc,null)[0],5,new AbortController().signal);
  assert.equal(tested.centerLoaded,false);
  v.dispose();
  console.log('PASS imagery upgrade: 63-record integrity, coordinate safety, STAC, USGS, OAM fallback, nodata failure, OSM relations, camera guards');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
