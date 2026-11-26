'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const html=read('index.html'),proto=read('assets/js/prototype.js');
const journey=require('../assets/js/place-journey-v4.js');
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'no duplicate DOM IDs');
for(const id of ['atlasRecentLocations','atlasRecentList','atlasRecentClear','atlasLocationPosition','atlasLocationPositionNote','atlasCopyCoordinates','atlasBackToExplore','atlasPlaceActionStatus']){
  assert.equal(ids.filter(x=>x===id).length,1,`missing or duplicate ID ${id}`);
}
assert.ok(html.includes('assets/css/place-journey-v4.css'));
assert.ok(html.includes('assets/js/place-journey-v4.js'));
assert.ok(proto.includes('RaspehrPlaceJourney.select(row)'));
assert.ok(proto.includes('RaspehrPlaceJourney.select(null)'));
assert.ok(proto.includes('RaspehrPlaceJourney.connect(catalog'));
const precise={lat:34.12345678,lon:52.12345678,precision:'surveyed'};
const approx={lat:34.12345678,lon:52.12345678,precision:'representative_city_reference'};
assert.equal(journey.formatCoords(precise),'34.123457, 52.123457');
assert.equal(journey.formatCoords(approx),'34.12, 52.12');
assert.equal(journey.positionStatus(approx).approximate,true);
assert.equal(journey.positionStatus(precise).label,'مختصات ثبت‌شده');
assert.equal(journey.positionStatus({lat:null,lon:null}).label,'مختصات ثبت نشده');
assert.equal(journey.formatCoords({lat:'34',lon:50}),'' );
const imageCode=read('assets/js/site-views.js');
assert.ok(imageCode.includes('siteViewPreview'),'local view remains integrated');
console.log('PASS panel V4: navigation, precision, local-only recent history, stable markup');
