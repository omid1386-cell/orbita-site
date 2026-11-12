'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const app = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
function extract(begin,end) {
  const i=app.indexOf('  '+begin), j=app.indexOf('  '+end,i+1);
  assert.ok(i>=0 && j>i,`Missing ${begin}`);
  return app.slice(i,j);
}
function virtualClock() {
 let nextId=0; const clock=new Map();
 return {clock, setTimeout(fn,ms){const id=++nextId;clock.set(id,{fn,ms});return id;},
  clearTimeout(id){clock.delete(id);}, runAll(){let pending=[...clock.values()];clock.clear();pending.forEach(x=>x.fn());}};
}
function makeContext(extra={}) {
 const time=virtualClock();const ctx={console, ...time, window:{}, Math, ...extra};
 vm.createContext(ctx);return {ctx,...time};
}

test('wheel and trackpad zoom are responsive but below former 2x speed; both original themes remain intact',()=>{
 assert.match(app,/setWheelZoomRate\(1 \/ 370\)/);
 assert.match(app,/setZoomRate\(1 \/ 85\)/);
 assert.match(app,/if \(MAP_STYLE === "sunny"\) return ONLINE_SUNNY_URL;/);
 assert.match(app,/return ONLINE_DARK_URL;/);
 assert.match(app,/else if \(MAP_STYLE === "sunny"\) MAP_STYLE = "osm";/);
 assert.match(html,/window\.ORBITA_APP_V = "20261112maponlyv1";/);
});

test('during rapid zoom only the latest debounced cluster refresh runs',()=>{
 const ops=[];
 const {ctx,clock,runAll}=makeContext({map:{},markerZoomRefreshTimer:0,markerZoomRefreshInterval:220,renderMarkers(){ops.push('render');}});
 vm.runInContext(extract('function scheduleMarkerZoomRefresh(finalUpdate) {','function publishMarkerFeatureCollection() {'),ctx);
 ctx.scheduleMarkerZoomRefresh(false);
 ctx.scheduleMarkerZoomRefresh(false);
 ctx.scheduleMarkerZoomRefresh(false);
 assert.equal(clock.size,1);assert.equal(ops.length,0);
 runAll();assert.equal(ops.length,1);
});

test('zoomend cancels pending work and publishes exactly one final snapshot',()=>{
 const ops=[];
 const {ctx,clock,runAll}=makeContext({map:{},markerZoomRefreshTimer:0,markerZoomRefreshInterval:220,renderMarkers(){ops.push('render');}});
 vm.runInContext(extract('function scheduleMarkerZoomRefresh(finalUpdate) {','function publishMarkerFeatureCollection() {'),ctx);
 ctx.scheduleMarkerZoomRefresh(false);ctx.scheduleMarkerZoomRefresh(true);
 assert.equal(clock.size,0);assert.deepEqual(ops,['render']);
 runAll();assert.deepEqual(ops,['render']);
});

test('source updates are suppressed only for the style transition, never permanently',()=>{
 const updated=[];
 const ctx=makeContext({map:{getSource:()=>({setData:(d)=>updated.push(d)}),getStyle:()=>({})},
   mapStyleTransitionPending:true,MARKER_SOURCE:'markers',markerFeatureCollection:{features:[{id:'x'}]},
   ensureCurrentClusterLabelImages(){},ensureMarkerLayers:()=>Promise.resolve(true),
  }).ctx;
 vm.runInContext(extract('function publishMarkerFeatureCollection() {','function renderMarkers(force) {'),ctx);
 ctx.publishMarkerFeatureCollection();assert.equal(updated.length,0);
 ctx.mapStyleTransitionPending=false;ctx.publishMarkerFeatureCollection();assert.equal(updated.length,1);
});

test('style changes invalidate old generations and preserve the selected camera & style',()=>{
 const installed=[],calls=[];
 const map={setStyle(x,opt){installed.push([x,opt]);},getStyle:()=>({layers:[{id:'base'}]}),resize(){},triggerRepaint(){}};
 const x=makeContext({map, mapStyleGeneration:0,mapStyleTransitionPending:false,mapStyleWatchdogTimer:0,
   mapOverlayRepairTimer:0,markerLayerEnsurePromise:Promise.resolve(true),countryFeatureStateNeedsSync:false,
   activeMapStyleMode:'online',activeOfflineTheme:'',THEME:'navy',
   resetCountryInteractionStyleState(){calls.push('reset');},
   ensureCountryInteractionLayers(){calls.push('country');},ensureMarkerLayers(){calls.push('markers');},
   afterStyleApply(){calls.push('after');},
   BASEMODE:'online',useOfflineStyleFallback(){calls.push('fallback');}
 });
 vm.runInContext(extract('function scheduleMapOverlayRepair(delay) {','function useOfflineStyleFallback() {'),x.ctx);
 x.ctx.installMapStyle({name:'dark'},'online');
 assert.equal(x.ctx.mapStyleGeneration,1);
 assert.equal(x.ctx.mapStyleTransitionPending,true);
 assert.equal(x.ctx.markerLayerEnsurePromise,null);
 assert.equal(x.clock.size,1);
 x.ctx.installMapStyle({name:'sunny'},'online');
 assert.equal(x.ctx.mapStyleGeneration,2);
 assert.equal(x.clock.size,1,'old style watchdog was cancelled');
 assert.deepEqual(installed.map(x=>x[0].name),['dark','sunny']);
 assert.deepEqual(calls,['reset','reset']);
});

test('late first-style JSON fetch cannot overwrite the most recent requested theme',async()=>{
 let doneA,doneB;let calls=[];
 const map={setStyle(style){calls.push(style)},getStyle:()=>({layers:[{id:'base'}]}),resize(){},triggerRepaint(){}};
 const ctx=makeContext({map,BASEMODE:'online',LANG:'fa',MAP_STYLE:'dark',
   mapStyleRequestId:0,mapStyleGeneration:0,mapStyleTransitionPending:false,
   mapStyleWatchdogTimer:0,mapOverlayRepairTimer:0,markerLayerEnsurePromise:null,
   activeMapStyleMode:'',activeOfflineTheme:'',THEME:'navy',
   onlineStyleUrl(){return this.MAP_STYLE},
   fetchOnlineStyle(){return new Promise(resolve=>{if (this.MAP_STYLE==='dark') doneA=resolve;else doneB=resolve;});},
   withCountryInteractionSource:s=>s,
   resetCountryInteractionStyleState(){},
   useOfflineStyleFallback(){throw new Error('unexpected fallback')},
   ensureCountryInteractionLayers(){},ensureMarkerLayers(){},afterStyleApply(){}
 });
 // Real callback doesn't rely on `this`, so mock style helpers use closures instead.
 ctx.ctx.onlineStyleUrl=()=>ctx.ctx.MAP_STYLE;
 ctx.ctx.fetchOnlineStyle=()=>new Promise(resolve=>{if(ctx.ctx.MAP_STYLE==='dark')doneA=resolve;else doneB=resolve;});
 vm.runInContext(extract('function scheduleMapOverlayRepair(delay) {','/* country name labels rendered as DOM markers'),ctx.ctx);
 ctx.ctx.applyMapStyle();ctx.ctx.MAP_STYLE='sunny';ctx.ctx.applyMapStyle();
 doneB({name:'sunny'});await Promise.resolve();
 doneA({name:'dark'});await Promise.resolve();
 assert.equal(calls.length,1);
 assert.equal(calls[0].name,'sunny');
});

test('async marker-image completion for stale style cannot install source/layers',async()=>{
 let resumeA,resumeB;const added=[];
 const map={getStyle:()=>({}),getSource:()=>null,addSource(id){added.push(id);},getLayer:()=>null};
 const ctx=makeContext({map,mapStyleGeneration:1,mapStyleTransitionPending:false,
  markerLayerEnsurePromise:null,MARKER_SOURCE:'source',
  MARKER_CLUSTER_SHADOW_LAYER:'shadow',MARKER_CLUSTER_HALO_LAYER:'halo',
  MARKER_CLUSTER_CIRCLE_LAYER:'circle',MARKER_CLUSTER_LABEL_LAYER:'label',
  MARKER_POINT_LAYER:'point',MARKER_POINT_HOVER_LAYER:'pointhover',
  MARKER_CLUSTER_HOVER_LAYER:'clusterhover',MARKER_CLUSTER_HOVER_LABEL_LAYER:'clusterlabelhover',
  ensureMarkerImages:(generation)=>new Promise(resolve=>{if(generation===1)resumeA=resolve;else resumeB=resolve;}),
  markerClusterFilter:()=>[],markerPointFilter:()=>[],markerNeverFilter:()=>[],
  addMarkerLayerIfMissing(){added.push('layer');},markerFeatureCollection:{features:[]},bindMarkerHoverEvents(){},console
 }).ctx;
 vm.runInContext(extract('function ensureMarkerLayers(force) {','function markerFeature(p, sc) {'),ctx);
 const oldJob=ctx.ensureMarkerLayers(true);
 ctx.mapStyleGeneration=2;ctx.markerLayerEnsurePromise=null;
 const newJob=ctx.ensureMarkerLayers(true);
 resumeA(true);assert.equal(await oldJob,false);
 assert.equal(added.length,0);assert.equal(ctx.markerLayerEnsurePromise,newJob,'old job does not clear new promise');
 resumeB(true);assert.equal(await newJob,true);
 assert.equal(added.filter(x=>x==='source').length,1);
 assert.equal(ctx.markerLayerEnsurePromise,null);
});

test('style.load is recovery authority; styledata cannot rebuild markers prematurely',()=>{
 const block=extract('function createMap(style, styleMode) {','on("#citiesBtn", "click", function () {');
 assert.match(block,/map\.on\("style\.load", function \(\) \{[\s\S]*ensureMarkerLayers\(true\);[\s\S]*afterStyleApply\(\);/);
 assert.doesNotMatch(block,/map\.on\("styledata"/);
 assert.match(block,/map\.on\("idle", function \(\)/);
 assert.match(block,/webglcontextrestored/);
 assert.match(block,/map\.on\("error", function \(e\)/);
});

test('single failing online tile does not switch theme; repeated failures trigger existing offline fallback',()=>{
 const listeners={},rates=[],calls=[];
 const fakeMap={on(name,fn){listeners[name]=fn;},resize(){},getContainer(){return {};},
  getCanvas(){return {addEventListener(){}};},addControl(){},
  scrollZoom:{setWheelZoomRate(v){rates.push(v)},setZoomRate(v){rates.push(v)}}};
 const noop=()=>{};
 const maplibregl={Map:function(){return fakeMap;},NavigationControl:function(){},FullscreenControl:function(){},ScaleControl:function(){}};
 const ctx=makeContext({map:null,maplibregl,mapResizeObserver:null,window:{},
   requestAnimationFrame:fn=>fn(),syncTouchGestures:noop,
   setTimeout:()=>17,clearTimeout:noop,
   activeMapStyleMode:'online',activeOfflineTheme:'',BASEMODE:'online',mapStyleTransitionPending:false,
   ensureCountryInteractionLayers:noop,bindCountryCanvasExit:noop,bindMarkerHoverEvents:noop,
   renderMarkers:noop,loadCountryLabels:()=>Promise.resolve(null),
   fetch:()=>Promise.resolve({json:()=>({})}),buildCityLabels:noop,
   buildLabels:noop,ensureMarkerLayers:noop,afterStyleApply:noop,
   syncCountryFeatureStates:noop,handleCountryMapClick:noop,
   clearMapInteractionHover:noop,zoomLabels:noop,zoomCityLabels:noop,
   $:()=>({style:{},textContent:''}),
   COUNTRY_OVERLAY_SOURCE:'country',COUNTRY_HIT_LAYER:'hit',MARKER_SOURCE:'markers',MARKER_POINT_LAYER:'point',
   document:{getElementById:()=>null},
   scheduleMapOverlayRepair:()=>calls.push('repair'),
   useOfflineStyleFallback:()=>calls.push('offline')
 }).ctx;
 vm.runInContext(extract('function createMap(style, styleMode) {','on("#citiesBtn", "click", function () {'),ctx);
 ctx.createMap({version:8},'online');
 for(let i=0;i<9;i++)listeners.error({error:{message:'tile failed to fetch (503)'}});
 assert.equal(calls.includes('offline'),false);
 listeners.error({error:{message:'tile failed to fetch (503)'}});
 assert.equal(calls.filter(x=>x==='offline').length,1);
 assert.equal(rates.length,2);
});
