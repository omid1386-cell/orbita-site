'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/css/app.css'),'utf8');
const ver='20261113-r5-integrated';
test('final release cache-busts all four JS/CSS/data asset domains exactly once',()=>{
  for(const key of ['ORBITA_V','ORBITA_APP_V','ORBITA_CSS_V','ORBITA_COMPANIES_V']){
    const match=html.match(new RegExp('window\\.'+key+' = "([^"]+)"','g'))||[];
    assert.equal(match.length,1,key);assert.ok(match[0].includes(ver),key);
  }
});
test('current guide explicitly distinguishes 14 selectable categories from global coverage in FA, EN, AR',()=>{
  assert.match(app,/۱۴ دسته قابل انتخاب/);
  assert.match(app,/14 selectable categories/);
  assert.match(app,/14 فئة قابلة للاختيار/);
  assert.match(app,/نقشه جای تقریبی رکوردهایی/);
});
test('image fallback never embeds raw HTML SVG in a handler or refers to unreachable closure locals',()=>{
  assert.match(app,/function fallbackLogoDataUri\(glyph, color\)/);
  assert.match(app,/function fallbackImageErrorAttribute\(url\)/);
  assert.doesNotMatch(app,/onerror="this\.onerror=null; this\.src=defaultLogoSvg;"/);
  assert.doesNotMatch(app,/onerror="this\.src=defaultLogo;"/);
  const start=app.indexOf('  function fallbackLogoDataUri(glyph, color)');
  const end=app.indexOf('  function renderList()',start);
  assert.ok(start>=0&&end>start);
  const context={encodeURIComponent};
  vm.createContext(context);
  vm.runInContext('function esc(s){return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;")}\n'+app.slice(start,end),context);
  const url=context.fallbackLogoDataUri('🚀','#38bdf8');
  assert.ok(url.startsWith('data:image/svg+xml;charset=utf-8,'));
  assert.doesNotMatch(url,/["'<>\s]/);
  const attr=context.fallbackImageErrorAttribute(url);
  assert.match(attr,/this\.onerror=null;this\.src='/);
  assert.doesNotMatch(attr,/xmlns='http:/);
});
test('no returned missions view or third Voyager style; approved basemaps preserved',()=>{
  assert.ok(!html.includes('id="view-missions"'));
  assert.ok(!app.includes('voyager-gl-style'));
  assert.match(app,/ONLINE_SUNNY_URL = "assets\/geo\/jawg_sunny\.json"/);
  assert.match(app,/ONLINE_DARK_URL = "https:\/\/basemaps\.cartocdn\.com\/gl\/dark-matter-gl-style\/style\.json"/);
});
test('mobile and desktop layer selectors remain present',()=>{
  assert.match(css,/\.layer-panel\[data-mode="peek"\]/);
  assert.match(css,/\.layer-panel\[data-mode="expanded"\]/);
  for(const id of ['layerPanel','layerGroups','layerSearch','layerSelectAll','layerSelectNone','layerReset'])assert.ok(html.includes('id="'+id+'"'),id);
});
test('new verified relationships and specialist SVGs coexist with all eight optional category feeds',()=>{
  assert.ok(fs.existsSync(path.join(root,'data/verified_relations.json')));
  const files=['components','payloads','ground_services','inspace_services','test_facility','ground_station','mission_control','university_space'];
  for(const k of files)assert.ok(fs.existsSync(path.join(root,`data/companies_${k}.json`)),k);
  assert.equal(fs.readdirSync(path.join(root,'assets/logos/orbita')).filter(x=>x.endsWith('.svg')).length,11);
});
