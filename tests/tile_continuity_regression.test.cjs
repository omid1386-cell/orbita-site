'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(base,'assets/js/app.js'),'utf8');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const css=fs.readFileSync(path.join(base,'assets/css/app.css'),'utf8');
const sunny=JSON.parse(fs.readFileSync(path.join(base,'assets/geo/jawg_sunny.json'),'utf8'));
function slice(a,b){
 const i=app.indexOf('  '+a),j=app.indexOf('  '+b,i+1);
 assert.ok(i>=0&&j>i,`${a} -> ${b}`);return app.slice(i,j);
}
function runWorldCoverage(ctx){
 const x={Math,Number,isFinite,...ctx};vm.createContext(x);
 vm.runInContext(slice('function minimumZoomForWorldCoverage(viewportWidth) {','function syncTouchGestures() {'),x);
 return x;
}
test('viewport minimum zoom prevents white strips on large screens, without restricting phones',()=>{
 const x=runWorldCoverage({});
 assert.equal(x.minimumZoomForWorldCoverage(360),1);
 assert.equal(x.minimumZoomForWorldCoverage(0),1);
 assert.equal(x.minimumZoomForWorldCoverage(NaN),1);
 assert.ok(Math.abs(x.minimumZoomForWorldCoverage(1440)-Math.log2(1442/512))<1e-7);
 assert.ok(Math.abs(x.minimumZoomForWorldCoverage(1920)-Math.log2(1922/512))<1e-7);
 assert.equal(x.minimumZoomForWorldCoverage(1e6),4);
});
test('only applies min zoom when viewport width changes meaningfully',()=>{
 const calls=[];let minZoom=1;
 const map={getContainer:()=>({clientWidth:1440}),getMinZoom:()=>minZoom,
  setMinZoom:z=>{minZoom=z;calls.push(z)}};
 const x=runWorldCoverage({map});
 x.maintainWorldCoverage();x.maintainWorldCoverage();
 assert.equal(calls.length,1);
 assert.ok(calls[0]>1.4 && calls[0]<1.6);
});
test('resize observer and initial map load both resync viewport coverage',()=>{
 const code=slice('function createMap(style, styleMode) {','on("#citiesBtn", "click", function () {');
 assert.match(code,/mapResizeObserver = new window\.ResizeObserver\(function \(\) \{[\s\S]*map\.resize\(\); maintainWorldCoverage\(\);/);
 assert.match(code,/requestAnimationFrame\(function \(\) \{[\s\S]*maintainWorldCoverage\(\)/);
 assert.match(code,/map\.on\("load", function \(\) \{[\s\S]*map\.resize\(\); maintainWorldCoverage\(\);/);
});
test('early connections cover both original providers; no altered tile URL/style data',()=>{
 for(const host of ['https://basemaps.cartocdn.com','https://tile.jawg.io','https://api.jawg.io'])
   assert.ok(html.includes(`<link rel="preconnect" href="${host}" crossorigin />`));
 assert.match(app,/var ONLINE_SUNNY_URL = "assets\/geo\/jawg_sunny\.json";/);
 assert.match(app,/var ONLINE_DARK_URL = "https:\/\/basemaps\.cartocdn\.com\/gl\/dark-matter-gl-style\/style\.json";/);
 assert.ok(sunny.sources['streets-v2'].tiles[0].startsWith('https://tile.jawg.io/'));
});
test('visual fallback uses the exact sunny background and keeps existing color theme',()=>{
 const background=sunny.layers.find(l=>l.type==='background').paint['background-color'];
 assert.ok(css.includes(`:root[data-theme="light"] #map{background:${background}}`));
 assert.match(css,/:root\[data-theme="navy"\] #map\{background:#08131f\}/);
 assert.match(css,/#map\{position:absolute;inset:0;background:var\(--bg\)\}/);
});
test('cache-busting changes only application assets; scientific sources remain stable',()=>{
 assert.match(html,/window\.ORBITA_APP_V = "20261112tilecontinuityv1"/);
 assert.match(html,/window\.ORBITA_CSS_V = "20261112tilecontinuitycssv1"/);
 assert.match(html,/window\.ORBITA_V = "20261023mapuk2"/);
 assert.match(html,/window\.ORBITA_COMPANIES_V = "20261111launch68deepv3"/);
});
test('smooth zoom settings and both original style choices remain unchanged',()=>{
 assert.match(app,/maxTileCacheSize: 256/);
 assert.match(app,/setWheelZoomRate\(1 \/ 370\)/);
 assert.match(app,/setZoomRate\(1 \/ 85\)/);
 assert.match(app,/renderWorldCopies: false/);
 assert.match(app,/MAP_STYLE = MAP_STYLE === "dark" \? "sunny" : "dark"/);
 assert.doesNotMatch(app,/cancelPendingTileRequestsWhileZooming/);
});
