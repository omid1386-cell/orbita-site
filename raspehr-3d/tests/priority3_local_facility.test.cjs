'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const THREE=require(path.resolve(root,'../assets/vendor/three.min.js'));
const context={window:{THREE},THREE,URL,console,Map,Set,Math,Number,String,Array,Object,Date,JSON};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/local-facility-view.js'),'utf8'),context,{filename:'local-facility-view.js'});
const api=context.window.RaspehrLocalFacility;

// The close facility view is deliberately unavailable for approximate/reference coordinates.
assert.equal(api.facilityEligibility({kind:'site',lat:28.6084,lon:-80.6043,precision:'',categories:[]}).allowed,true);
assert.equal(api.facilityEligibility({kind:'site',lat:30,lon:40,precision:'approximate_pad_center',categories:[]}).allowed,false);
assert.equal(api.facilityEligibility({kind:'recovery',lat:34,lon:-120,precision:'representative',categories:['recovery']}).allowed,false);
assert.equal(api.facilityEligibility({kind:'company',lat:40,lon:-70,precision:'mapped_address_building_point',categories:['test_facility']}).allowed,true);
assert.equal(api.facilityEligibility({kind:'company',lat:40,lon:-70,precision:'mapped_address_building_point',categories:['agency']}).allowed,false);
assert.equal(api.facilityEligibility({kind:'company',lat:40,lon:-70,precision:'approximate_city_pin',categories:['test_facility']}).allowed,false);

// WebMercator tile indices and geographic bounds are internally consistent.
const ksc=api.mercatorTile(28.6084,-80.6043,17);
assert.ok(ksc.x>=0 && ksc.x<2**17 && ksc.y>=0 && ksc.y<2**17);
const bounds=api.tileBounds(17,ksc.x,ksc.y);
assert.ok(28.6084<=bounds.north && 28.6084>=bounds.south);
assert.ok(-80.6043>=bounds.west && -80.6043<=bounds.east);
assert.equal(api.zoomForGsd(0.5,28),18);
assert.ok(api.zoomForGsd(10,28)>=14 && api.zoomForGsd(10,28)<=15);

// Only point-covering, visual imagery with an allowed license and documented GSD is eligible.
const polygon=(west,south,east,north)=>({type:'Polygon',coordinates:[[[west,south],[east,south],[east,north],[west,north],[west,south]]]});
const item=(id,gsd,license,date,geom=polygon(-81,28,-80,29),product='visual')=>({
  id,geometry:geom,properties:{gsd,license,datetime:date,'oam:product_type':product,'oam:producer_name':'Test producer'},
  assets:{visual:{href:'https://example.test/visual.tif'}}
});
const center={lat:28.6084,lon:-80.6043};
const chosen=api.chooseBestImageryItem([
  item('low-res',5,'CC-BY-4.0','2026-10-01'),
  item('best',0.5,'CC-BY-SA-4.0','2025-01-01'),
  item('nc',0.1,'CC-BY-NC-4.0','2026-11-01'),
  item('too-coarse',15,'CC-BY-4.0','2026-11-01'),
  item('outside',0.2,'CC-BY-4.0','2026-11-01',polygon(10,10,11,11)),
  item('non-visual',0.2,'CC-BY-4.0','2026-11-01',polygon(-81,28,-80,29),'sar')
],center);
assert.equal(chosen.id,'best');
assert.equal(api.chooseBestImageryItem([item('nc',0.2,'CC-BY-NC-4.0','2026-11-01')],center),null);

// OSM height is only treated as authoritative when an explicit height tag exists;
// level-derived values remain marked approximate; absent values remain footprint-only.
assert.deepEqual(JSON.parse(JSON.stringify(api.parseHeight({height:'24 m'}))),{meters:24,approximate:false,source:'height'});
assert.equal(api.parseHeight({height:'100 ft'}).meters,30.48);
assert.deepEqual(JSON.parse(JSON.stringify(api.parseHeight({'building:levels':'3'}))),{meters:9.600000000000001,approximate:true,source:'building:levels'});
assert.equal(api.parseHeight({building:'industrial'}).meters,0);

const query=api.makeOverpassQuery(center,500);
assert.match(query,/way\["building"\]/);
assert.match(query,/out geom/);
assert.match(api.imagerySearchUrl(center),/collections=openaerialmap/);

// A real Three.js tile patch must contain a non-degenerate mesh and UVs.
const geometry=api.buildTileGeometry(17,ksc.x,ksc.y,8);
assert.equal(geometry.attributes.position.count,81);
assert.equal(geometry.attributes.uv.count,81);
assert.ok(geometry.index.count>300);
assert.ok(geometry.boundingSphere && geometry.boundingSphere.radius>0);
geometry.dispose();

// OSM building parsing preserves footprint, height provenance and excludes malformed ways.
const building=api.parseOsmBuilding({type:'way',id:123,tags:{building:'industrial',height:'18 m'},geometry:[
  {lat:28.6080,lon:-80.6045},{lat:28.6080,lon:-80.6040},{lat:28.6084,lon:-80.6040},{lat:28.6084,lon:-80.6045},{lat:28.6080,lon:-80.6045}
]});
assert.ok(building && building.areaM2>100 && building.areaM2<5000);
assert.equal(building.height.meters,18);
assert.equal(building.height.approximate,false);
assert.equal(api.parseOsmBuilding({type:'node',id:1,tags:{building:'yes'},geometry:[]}),null);

// Audit every canonical record: any record explicitly marked approximate/reference
// must be blocked from a facility-level close-up, not only the synthetic examples above.
let approximateCount=0;
for(const [file,kind] of [['companies.json','company'],['sites.json','site'],['recovery_sites.json','recovery']]){
  const raw=JSON.parse(fs.readFileSync(path.join(root,'../data',file),'utf8'));
  const rows=Array.isArray(raw)?raw:(raw.sites||[]);
  for(const row of rows){
    const adapted={kind,lat:row.lat,lon:row.lon,precision:row.coordinates_precision||row.coordinate_precision||'',
      coordinateNote:row.coordinate_note_fa||'',categories:row.categories||[]};
    if(api.isApproximate(adapted)){
      approximateCount++;
      assert.equal(api.facilityEligibility(adapted).allowed,false,`${file}:${row.id} must not enter facility view`);
    }
  }
}
assert.ok(approximateCount>=23,`expected all approximate/reference records to be guarded; found ${approximateCount}`);

console.log('PASS Priority 3: OAM license/GSD/coverage filtering, local tile geometry, precision gating and OSM building provenance; guarded '+approximateCount+' approximate/reference records');
