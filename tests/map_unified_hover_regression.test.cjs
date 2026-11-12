'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');
function section(begin,end) {
 const a=src.indexOf('  '+begin); const b=src.indexOf('  '+end,a+4);
 assert.ok(a!==-1 && b>a, `extract ${begin} to ${end}`);
 return src.slice(a,b);
}
const code=[
 section('function ensureMapHoverTooltip() {','function addMarkerLayerIfMissing(layer) {'),
 section('function syncMapCursor() {','function countryLayerMouseEnter() {'),
 section('function unbindCountryInteractionEvents() {','function handleCountryMapClick(e) {')
].join('\n');
function setup() {
 let container, canvas;
 const events=[], state={hover:'',country:''};
 container={clientWidth:650,clientHeight:450,appendChild(el){el.parentNode=this;this.lastChild=el;}};
 canvas={style:{cursor:''},title:'SUPARCO previously shown',removeAttribute(k){if(k==='title')this.title='';}};
 const map={getCanvas:()=>canvas,getContainer:()=>container,getZoom:()=>2,on(...a){events.push(a);},getLayer:()=>({})};
 const ctx={map,LANG:'fa',COUNTRY_HOVER_MAX_ZOOM:4.001,
   markerHoverKey:'',markerHoverKind:'',pendingMarkerHoverKey:'',pendingMarkerHoverKind:'',markerHoverFrame:0,
   hoveredCountryName:'Iran',pendingHoveredCountryName:'',countryHoverFrame:0,
   selectedCountryName:'',countryInteractionEventLayer:'country-hit',markerHoverEventsBound:false,
   markerPointsByKey:Object.create(null),markerClustersByKey:Object.create(null),mapHoverTooltip:null,
   setMarkerHoverFilters:()=>{},
   clearCountryHoverState:()=>{ctx.hoveredCountryName='';ctx.pendingHoveredCountryName='';},
   setHoveredCountry:(name)=>{ctx.hoveredCountryName=name;state.country=name;},
   markerFeatureNearPoint:()=>null,
   interactionFeaturesAtPoint:(point)=>point.hits||[],
   markerFeatureFromHits:(hits)=>hits.find(f=>f.properties?.markerKey)||null,
   markerClusterTitle:(n)=>`View ${n}`,
   name:o=>o.fa||o.en||o.id,
   cancelAnimationFrame:()=>{},
   document:{createElement:()=>({style:{display:'none'},textContent:'',offsetWidth:245,offsetHeight:32,attrs:{},setAttribute(k,v){this.attrs[k]=v;}})},
   window:{},console
 };
 vm.createContext(ctx);vm.runInContext(code,ctx);
 return {ctx,events,container,canvas,state};
}
function marker(key,type='point') {return {layer:{id:'pin'},properties:{markerKey:key,markerType:type}};}
function country(name='Iran'){return {layer:{id:'country-hit'},properties:{NAME:name}};}
function move(hits,x=100,y=120){return {point:{x,y,hits}};}
test('screenshot regression: Tehran marker does not show previously hovered Pakistan SUPARCO tooltip',()=>{
 const {ctx,canvas,container}=setup();
 ctx.markerPointsByKey.tehran={cat:'agency',o:{fa:'سازمان فضایی ایران'}};
 ctx.handleUnifiedMapMouseMove(move([marker('tehran'),country()]));
 assert.equal(ctx.markerHoverKey,'tehran');
 assert.equal(ctx.hoveredCountryName,'');
 assert.equal(container.lastChild.textContent,'سازمان فضایی ایران');
 assert.equal(container.lastChild.attrs['aria-hidden'],'false');
 assert.equal(canvas.title,'');
 assert.equal(canvas.style.cursor,'pointer');
});
test('moving from Pakistan to Iran swaps both key and tooltip with no stale label',()=>{
 const {ctx,container}=setup();
 ctx.markerPointsByKey.pakistan={cat:'agency',o:{en:'SUPARCO'}};
 ctx.markerPointsByKey.iran={cat:'agency',o:{fa:'سازمان فضایی ایران'}};
 ctx.handleUnifiedMapMouseMove(move([marker('pakistan')]));
 assert.equal(container.lastChild.textContent,'SUPARCO');
 ctx.handleUnifiedMapMouseMove(move([marker('iran'),country()],190,230));
 assert.equal(container.lastChild.textContent,'سازمان فضایی ایران');
 assert.equal(ctx.hoveredCountryName,'');
 assert.equal(container.lastChild.style.left,'190px');
});
test('moving on same icon updates tooltip position, without stale native title',()=>{
 const {ctx,container}=setup();
 ctx.markerPointsByKey.iran={cat:'agency',o:{en:'Iran Space Agency'}};
 ctx.handleUnifiedMapMouseMove(move([marker('iran')],120,200));
 ctx.handleUnifiedMapMouseMove(move([marker('iran')],290,150));
 assert.equal(container.lastChild.style.left,'290px');
 assert.equal(container.lastChild.style.top,'137px');
 assert.equal(container.lastChild.textContent,'Iran Space Agency');
});
test('stale feature blocks the underlying country but never shows another entity title',()=>{
 const {ctx,container}=setup();
 ctx.markerPointsByKey.pakistan={cat:'agency',o:{en:'SUPARCO'}};
 ctx.handleUnifiedMapMouseMove(move([marker('pakistan')]));
 ctx.handleUnifiedMapMouseMove(move([marker('stale-iran'),country()]));
 assert.equal(ctx.markerHoverKey,'');
 assert.equal(ctx.hoveredCountryName,'');
 assert.equal(container.lastChild.style.display,'none');
 assert.equal(container.lastChild.textContent,'');
});
test('country hover resumes when mouse leaves marker and enters empty country area',()=>{
 const {ctx,container}=setup();
 ctx.markerPointsByKey.iran={cat:'agency',o:{en:'Iran Space Agency'}};
 ctx.handleUnifiedMapMouseMove(move([marker('iran'),country()]));
 ctx.handleUnifiedMapMouseMove(move([country()]));
 assert.equal(ctx.markerHoverKey,'');
 assert.equal(ctx.hoveredCountryName,'Iran');
 assert.equal(container.lastChild.style.display,'none');
});
test('moving into open water clears all hover state and native title',()=>{
 const {ctx,container,canvas}=setup();
 ctx.markerPointsByKey.iran={cat:'agency',o:{en:'Iran Space Agency'}};
 ctx.handleUnifiedMapMouseMove(move([marker('iran')]));
 ctx.handleUnifiedMapMouseMove(move([]));
 assert.equal(ctx.markerHoverKey,'');assert.equal(ctx.hoveredCountryName,'');
 assert.equal(canvas.style.cursor,'');assert.equal(container.lastChild.style.display,'none');
});
test('cluster tooltip comes from current member list, not a reused cluster number',()=>{
 const {ctx,container}=setup();
 ctx.markerClustersByKey['cluster|iran']=[{},{},{}];
 ctx.handleUnifiedMapMouseMove(move([marker('cluster|iran','cluster'),country()]));
 assert.equal(container.lastChild.textContent,'View 3');
 ctx.markerClustersByKey=Object.create(null);
 ctx.handleUnifiedMapMouseMove(move([marker('cluster|iran','cluster'),country()]));
 assert.equal(container.lastChild.style.display,'none');
 assert.equal(ctx.hoveredCountryName,'');
});
test('one map-wide mousemove listener only; no per-country or per-marker listeners',()=>{
 const {ctx,events}=setup();
 ctx.bindCountryInteractionEvents('country-hit');
 ctx.bindMarkerHoverEvents();ctx.bindMarkerHoverEvents();
 assert.deepEqual(events.map(e=>e[0]),['mousemove']);
 assert.equal(events[0].length,2);
 assert.match(src,/map\.on\("mousemove", handleUnifiedMapMouseMove\)/);
 assert.doesNotMatch(src,/map\.on\("mousemove",\s*MARKER_POINT_LAYER/);
 assert.doesNotMatch(src,/map\.on\("mousemove",\s*layerId/);
});
test('tooltip text is inserted as textContent, not executable HTML',()=>{
 const {ctx,container}=setup();
 ctx.markerPointsByKey.x={cat:'agency',o:{en:'<img src=x onerror=alert(1)>'}};
 ctx.handleUnifiedMapMouseMove(move([marker('x')]));
 assert.equal(container.lastChild.textContent,'<img src=x onerror=alert(1)>');
 assert.match(src,/tip\.textContent = label/);
 assert.doesNotMatch(src,/tip\.innerHTML\s*=\s*label/);
});
test('marker hover preserves original CSS/map-data version while only script version changes',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.match(html,/ORBITA_APP_V = "20261112twostylefixv1"/);
 assert.match(html,/ORBITA_CSS_V = "20261111identitywhite105v2"/);
 assert.match(html,/ORBITA_V = "20261023mapuk2"/);
});
