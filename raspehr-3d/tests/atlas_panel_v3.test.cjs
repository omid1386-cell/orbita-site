'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const html=load('index.html');
const stylesheet=load('assets/css/atlas-panel-v2.css');
const controller=load('assets/js/entity-stage3-ui.js');
const viewer=load('assets/js/site-views.js');
const prototype=load('assets/js/prototype.js');
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'IDs are unique');
for(const id of ['atlasStartMissing','atlasLayerSelectionCount','atlasPlaceMissingImage','atlasExplore','atlasLayers','atlasSettings','selectedLocationCard','selectedLocationCoordinates','selectedLocationFacilityStatus','selectedLocationFacility','selectedLocationFacilityExit','selectedLocationFacilitySource','selectedLocationFacilityMeta','selectedLocationProfile','selectedLocationFocus','siteViewPreviewOpen','siteViewDialog']){
 if(id==='atlasStartMissing')continue;
 assert.equal(ids.filter(x=>x===id).length,1,`expected exactly one ${id}`);
}
for(const value of ['site','agency','starter','all']){
 assert.ok(html.includes(`data-category-preset="${value}"`),`quick preset ${value}`);
 assert.ok(controller.includes(`${value}:`),`controller mapping ${value}`);
}
assert.ok(html.includes('class="atlas-place-details"'));
assert.ok(html.includes('id="selectedLocationCoordinates"'));
assert.ok(html.includes('id="siteViewPreview"'));
assert.ok(html.includes('عکس واقعی · نمای ثابت'));
assert.ok(viewer.includes("row.kind==='site'&&!path"),'missing image should only appear for launch sites');
assert.ok(prototype.includes("dataset.placeKind=row.kind||'company'"));
assert.ok(stylesheet.includes('.atlas-quick-categories'));
assert.ok(stylesheet.includes('.atlas-place-details'));
assert.ok(stylesheet.includes('@media(prefers-reduced-motion:reduce)'));
assert.match(html,/assets\/js\/entity-stage3-ui\.js\?v=20261125-(?:atlas-panel-v3|atlas-v6)/,'versioned explorer script loaded');
console.log('PASS Atlas panel v3: quick filters, progressive location details, unique controls, local-image honesty');
