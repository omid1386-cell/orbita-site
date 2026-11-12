'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(base,'assets/js/app.js'),'utf8');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
function extract(a,b){const i=app.indexOf('  '+a),j=app.indexOf('  '+b,i+1);assert.ok(i>=0&&j>i,`Missing ${a} -> ${b}`);return app.slice(i,j);}
function ctx(extra){const context={console,Math,Promise,...extra};vm.createContext(context);return context;}
const iconNames={launch:'orbita-pin-launch',propulsion:'orbita-pin-propulsion'};
const layers=['p','ph','cs','ch','cc','cl','cHover','cHoverLabel'];
function markerState(extra={}){
 const present=new Set([...Object.values(iconNames),'orbita-cluster-label-fa-2']);
 const available=new Set(layers);
 const map={getStyle:()=>({version:8}),getSource:()=>({setData(){}}),getLayer:id=>available.has(id)?{id}:null,hasImage:id=>present.has(id),triggerRepaint(){}};
 return {present,available,map,...extra};
}
function overlayCtx(ms){
 const vars={map:ms.map,MARKER_SOURCE:'marker',MARKER_POINT_LAYER:'p',MARKER_POINT_HOVER_LAYER:'ph',
 MARKER_CLUSTER_SHADOW_LAYER:'cs',MARKER_CLUSTER_HALO_LAYER:'ch',MARKER_CLUSTER_CIRCLE_LAYER:'cc',
 MARKER_CLUSTER_LABEL_LAYER:'cl',MARKER_CLUSTER_HOVER_LAYER:'cHover',MARKER_CLUSTER_HOVER_LABEL_LAYER:'cHoverLabel',
 MARKER_IMAGES:iconNames,markerFeatureCollection:{features:[{properties:{markerType:'cluster',clusterLabelImage:'orbita-cluster-label-fa-2'}}]},
 mapStyleGeneration:1,mapStyleTransitionPending:false,mapOverlayRepairTimer:0,overlayRepairAttempts:0,
 COUNTRY_HIT_LAYER:'country-hit',COUNTRY_OVERLAY_SOURCE:'country',syncCountryFeatureStates(){},
 publishMarkerFeatureCollection(){},ensureCountryInteractionLayers(){},ensureMarkerLayers(){return Promise.resolve(true)},
 setTimeout(){return 1},clearTimeout(){}};
 return ctx(vars);
}
test('only first and second basemap URLs survive byte-for-byte; no third Voyager style remains',()=>{
 for(const line of [
 'var ONLINE_DARK_URL = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";',
 'var ONLINE_SUNNY_URL = "assets/geo/jawg_sunny.json";']){
  assert.ok(app.includes(line));
 }
 assert.doesNotMatch(app,/ONLINE_OSM_URL|voyager-gl-style|style_osm:\s*"|MAP_STYLE\s*=\s*"osm"/);
 assert.match(app,/MAP_STYLE = MAP_STYLE === "dark" \? "sunny" : "dark";/);
 assert.match(html,/ORBITA_APP_V = "20261112tilecontinuityv1"/);
});
test('saved third style is migrated to the original second style without altering the theme',()=>{
 const store={orbita_map_style:'osm'}, writes=[];
 const c=ctx({THEME:'light',localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;writes.push([k,v])}}});
 vm.runInContext(extract('var savedMapStyle =','function bindReportForm() {'),c);
 assert.equal(c.MAP_STYLE,'sunny');assert.equal(store.orbita_map_style,'sunny');
 assert.deepEqual(writes,[['orbita_map_style','sunny']]);
});
test('style switch cycles dark and sunny only, retains original theme names',()=>{
 const store={},labels=[], calls=[];
 const c=ctx({MAP_STYLE:'dark',THEME:'navy',map:{},localStorage:{setItem:(k,v)=>store[k]=v},
  document:{documentElement:{setAttribute:(k,v)=>labels.push([k,v])}},$:(id)=>({querySelector:()=>({set textContent(v){labels.push(['label',v])}})}),
  t:()=>'',applyMapStyle:()=>calls.push('style')});
 vm.runInContext(extract('function cycleMapStyle() {','on("#themeBtn", "click", cycleMapStyle);'),c);
 for(let i=0;i<9;i++){c.cycleMapStyle();assert.ok(['sunny','dark'].includes(c.MAP_STYLE));}
 assert.equal(c.MAP_STYLE,'sunny');assert.equal(c.THEME,'light');assert.equal(store.orbita_map_style,'sunny');assert.equal(calls.length,9);
 assert.ok(labels.some(x=>x[0]==='data-theme'&&x[1]==='navy'));
});
test('overlay completeness detects missing ANY layer, static pin, or dynamic cluster label',()=>{
 const m=markerState();const c=overlayCtx(m);
 vm.runInContext(extract('var overlayRepairAttempts = 0;','function scheduleMapOverlayRepair(delay) {'),c);
 assert.equal(c.markerOverlayIsComplete(),true);
 m.available.delete('cHoverLabel');assert.equal(c.markerOverlayIsComplete(),false);
 m.available.add('cHoverLabel');m.present.delete('orbita-pin-launch');assert.equal(c.markerOverlayIsComplete(),false);
 m.present.add('orbita-pin-launch');m.present.delete('orbita-cluster-label-fa-2');assert.equal(c.markerOverlayIsComplete(),false);
 m.present.add('orbita-cluster-label-fa-2');assert.equal(c.markerOverlayIsComplete(),true);
});
test('repair runs only against matching generation and acknowledges complete markers',async()=>{
 const m=markerState(),timers=new Map();let next=0,repairs=0,publishes=0;
 m.present.delete('orbita-pin-launch');
 const c=overlayCtx(m);
 c.setTimeout=(fn,ms)=>{timers.set(++next,{fn,ms});return next;};c.clearTimeout=id=>timers.delete(id);
 c.ensureMarkerLayers=()=>{repairs++;m.present.add('orbita-pin-launch');return Promise.resolve(true)};
 c.publishMarkerFeatureCollection=()=>{publishes++};
 vm.runInContext(extract('var overlayRepairAttempts = 0;','function afterStyleApply() {'),c);
 c.scheduleMapOverlayRepair(20);assert.equal(timers.size,1);
 let t=[...timers.values()][0];timers.clear();t.fn();await Promise.resolve();await Promise.resolve();
 assert.equal(repairs,1);assert.equal(publishes,1);assert.equal(c.markerOverlayIsComplete(),true);
 c.scheduleMapOverlayRepair(10);c.mapStyleGeneration=2;
 t=[...timers.values()][0];timers.clear();t.fn();assert.equal(repairs,1,'obsolete timer must not mutate next style');
});
test('image decoder does not declare ready if an SVG is missing from the map image registry',async()=>{
 const ms=markerState();ms.present.delete('orbita-pin-launch');
 const c=ctx({map:ms.map,mapStyleGeneration:1,mapStyleTransitionPending:false,MARKER_IMAGES:iconNames,
   markerImageSvgSpecs:()=>[['a','svg'],['b','svg']],markerSvgWithShadow:x=>x,addMarkerImage:()=>Promise.resolve(),ensureCurrentClusterLabelImages(){}});
 vm.runInContext(extract('function ensureMarkerImages(generation) {','function markerClusterFilter() {'),c);
 assert.equal(await c.ensureMarkerImages(1),false);
 ms.present.add('orbita-pin-launch');assert.equal(await c.ensureMarkerImages(1),true);
});
test('style watchdog never treats a mere non-empty style JSON as fully ready',()=>{
 let fn, offline=0, markers=0;const c=ctx({map:{getStyle:()=>({layers:[{id:'basemap'}]}),resize(){},triggerRepaint(){}},
 mapStyleWatchdogTimer:0,mapStyleGeneration:1,mapStyleTransitionPending:true,BASEMODE:'online',
 setTimeout:f=>{fn=f;return 1},clearTimeout(){},useOfflineStyleFallback:()=>offline++,
 ensureMarkerLayers:()=>markers++,ensureCountryInteractionLayers(){},afterStyleApply(){}});
 vm.runInContext(extract('function startMapStyleWatchdog(generation) {','function installMapStyle(style, mode) {'),c);
 c.startMapStyleWatchdog(1);fn();
 assert.equal(offline,1);assert.equal(markers,0);assert.equal(c.mapStyleTransitionPending,true);
});
test('style change uses full swap for clean overlays while keeping original style object',()=>{
 const slice=extract('function installMapStyle(style, mode) {','function useOfflineStyleFallback() {');
 assert.match(slice,/map\.setStyle\(style, \{ diff: false \}\)/);
 assert.doesNotMatch(slice,/style\.layers\s*=|style\.sources\s*=/);
});
test('map reacts to its own missing style images and ignores basemap sprite ids',()=>{
 const block=extract('function createMap(style, styleMode) {','on("#citiesBtn", "click", function () {');
 assert.match(block,/map\.on\("styleimagemissing", function \(e\)/);
 assert.match(block,/\^\(orbita-pin-\|orbita-cluster-label-\)/);
 assert.match(block,/scheduleMapOverlayRepair\(120\)/);
});
