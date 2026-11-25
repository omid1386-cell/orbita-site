#!/usr/bin/env python3
"""Priority 4 mobile integration with real Three.js/WebGL and deterministic fixtures.
Run: xvfb-run -a python raspehr-3d/tests/priority3_webgl_browser.py
Network is stubbed only for OAM/Overpass so the visual/geometry path is reproducible offline.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, re, base64, io
from PIL import Image, ImageDraw

app=Path(__file__).resolve().parents[1]
root=app.parent
html=(app/'index.html').read_text('utf-8')
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
html=re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+"\s*>','',html)

data={
 '../data/companies.json':json.loads((root/'data/companies.json').read_text('utf-8')),
 '../data/sites.json':json.loads((root/'data/sites.json').read_text('utf-8')),
 '../data/recovery_sites.json':json.loads((root/'data/recovery_sites.json').read_text('utf-8')),
}
images={}
for item in (app/'assets/tex-tiles').rglob('*.jpg'):
    rel=item.relative_to(app).as_posix()
    images[rel]='data:image/jpeg;base64,'+base64.b64encode(item.read_bytes()).decode('ascii')
for item in (root/'assets/tex').glob('earth_*.jpg'):
    rel='../assets/tex/'+item.name
    images[rel]='data:image/jpeg;base64,'+base64.b64encode(item.read_bytes()).decode('ascii')

# A small but non-empty 256px raster proves that actual texture decoding and GPU upload work.
image=Image.new('RGB',(256,256),(48,82,72))
draw=ImageDraw.Draw(image)
draw.rectangle((12,12,244,244),outline=(235,191,106),width=5)
draw.line((0,0,255,255),fill=(235,191,106),width=3)
draw.line((255,0,0,255),fill=(95,200,225),width=3)
buf=io.BytesIO();image.save(buf,format='PNG');tile_b64=base64.b64encode(buf.getvalue()).decode('ascii')

site_lat,site_lon=28.6084,-80.6043
ring=[[-80.615,28.600],[-80.590,28.600],[-80.590,28.620],[-80.615,28.620],[-80.615,28.600]]
oam={
 'type':'FeatureCollection','features':[{
  'type':'Feature','stac_version':'1.0.0','id':'priority3-ksc-open-imagery','collection':'openaerialmap',
  'geometry':{'type':'Polygon','coordinates':[ring]},'bbox':[-80.615,28.600,-80.590,28.620],
  'properties':{'datetime':'2026-10-12T10:00:00Z','license':'CC-BY-4.0','gsd':0.5,
    'oam:platform_type':'satellite','oam:product_type':'visual','oam:producer_name':'Priority 3 Test Imagery Contributor'},
  'providers':[{'name':'Priority 3 Test Imagery Contributor','roles':['producer','licensor']}],
  'assets':{'visual':{'href':'https://example.test/ksc-visual.tif','type':'image/tiff; application=geotiff; profile=cloud-optimized'}}
 }]
}
osm={
 'version':0.6,'generator':'Overpass API test fixture','osm3s':{'timestamp_osm_base':'2026-11-24T12:00:00Z'},
 'elements':[
  {'type':'way','id':90001,'tags':{'building':'industrial','height':'18 m','name':'Hangar A'},'geometry':[
   {'lat':28.6080,'lon':-80.6045},{'lat':28.6080,'lon':-80.6040},{'lat':28.6084,'lon':-80.6040},{'lat':28.6084,'lon':-80.6045},{'lat':28.6080,'lon':-80.6045}]},
  {'type':'way','id':90002,'tags':{'building':'warehouse','building:levels':'3','name':'Assembly Hall'},'geometry':[
   {'lat':28.6086,'lon':-80.6046},{'lat':28.6086,'lon':-80.6040},{'lat':28.6090,'lon':-80.6040},{'lat':28.6090,'lon':-80.6046},{'lat':28.6086,'lon':-80.6046}]},
  {'type':'way','id':90003,'tags':{'building':'yes','name':'Unmeasured footprint'},'geometry':[
   {'lat':28.6075,'lon':-80.6047},{'lat':28.6075,'lon':-80.6042},{'lat':28.6078,'lon':-80.6042},{'lat':28.6078,'lon':-80.6047},{'lat':28.6075,'lon':-80.6047}]}
 ]
}

engine=(app/'assets/js/globe-engine.js').read_text('utf-8')
engine=engine.replace('image.src = url;','image.src = window.__raspehrImageMap[url] || url;')
engine=engine.replace('terrain:true, terrainExaggeration:1','terrain:false, terrainExaggeration:1')

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=False,args=[
        '--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist','--disable-dev-shm-usage'
    ])
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content(html,wait_until='domcontentloaded',timeout=30000)
    page.add_style_tag(content=(app/'assets/css/prototype.css').read_text('utf-8'))
    page.evaluate('(assets)=>{window.__raspehrImageMap=assets;}',images)
    page.evaluate('''(fixtures)=>{
      window.__raspehrRecords=fixtures.records;
      window.RASPEHR_OVERPASS_URL='https://overpass.private.coffee/api/interpreter';
      const tileBytes=Uint8Array.from(atob(fixtures.tile),c=>c.charCodeAt(0));
      window.fetch=async (url,options={})=>{
        const value=String(url),key=value.split('?')[0];
        if(Object.prototype.hasOwnProperty.call(fixtures.records,key))
          return {ok:true,status:200,json:async()=>fixtures.records[key]};
        if(key==='https://api.imagery.hotosm.org/stac/search')
          return {ok:true,status:200,json:async()=>fixtures.oam};
        if(value.startsWith('https://tiles.imagery.hotosm.org/'))
          return new Response(new Blob([tileBytes],{type:'image/png'}),{status:200,headers:{'Content-Type':'image/png','Access-Control-Allow-Origin':'*'}});
        if(key==='https://overpass.private.coffee/api/interpreter')
          return {ok:true,status:200,json:async()=>fixtures.osm};
        return {ok:false,status:404,json:async()=>({})};
      };
    }''',{'records':data,'tile':tile_b64,'oam':oam,'osm':osm})
    page.add_script_tag(content=(root/'assets/vendor/three.min.js').read_text('utf-8'))
    for rel in ['terrain-source.js','terrain-dem.js','stage6-performance.js']:
        page.add_script_tag(content=(app/'assets/js'/rel).read_text('utf-8'))
    page.add_script_tag(content=engine)
    for rel in ['entity-data.js','entity-markers.js','entity-explore.js','entity-stage3-ui.js','entity-stage4-dossier.js','local-facility-view.js']:
        page.add_script_tag(content=(app/'assets/js'/rel).read_text('utf-8'))
    page.add_script_tag(content=(root/'assets/js/raspehr-stage5-state.js').read_text('utf-8'))
    page.add_script_tag(content=(app/'assets/js/stage5-integration.js').read_text('utf-8'))
    prototype=(app/'assets/js/prototype.js').read_text('utf-8')
    prototype=prototype.replace('engine = new window.RaspehrGlobe.GlobeEngine(','engine = window.__p3Engine = new window.RaspehrGlobe.GlobeEngine(')
    prototype=prototype.replace('markers = new window.RaspehrEntityMarkers.EntityMarkers(','markers = window.__p3Markers = new window.RaspehrEntityMarkers.EntityMarkers(')
    prototype=prototype.replace('stage3 = new window.RaspehrStage3.Controller(','stage3 = window.__p3Stage3 = new window.RaspehrStage3.Controller(')
    page.add_script_tag(content=prototype)
    page.add_script_tag(content=(app/'assets/js/mobile-bottom-sheet.js').read_text('utf-8'))

    page.wait_for_function('''()=>window.__p3Engine && window.__p3Stage3 &&
      window.__p3Stage3.catalog.counts.markers===420 && window.__p3Engine.activeLevel==='z0' ''',timeout=90000)
    assert page.evaluate("!!document.createElement('canvas').getContext('webgl')")
    assert page.locator('#selectedLocationFacility').count()==1


    # Real WebGL + mobile sheet + selected-location workflow.
    assert page.evaluate('document.body.classList.contains("mobile-sheet-ready")')
    assert page.evaluate('document.getElementById("selectedLocationCard").parentElement.id')=='mobileSelectedSlot'
    assert page.evaluate('window.__p3Stage3.catalog.counts.total')==420
    page.locator('#entitySearch').fill('ksc39a')
    page.wait_for_function("()=>window.__p3Stage3.filtered.length===1 && window.__p3Stage3.filtered[0].id==='ksc39a'",timeout=10000)
    page.locator('#entityResults .entity-result').first.click()
    page.wait_for_function("()=>document.getElementById('mobileMainSheet').dataset.mobileTab==='place' && !document.getElementById('selectedLocationCard').hidden",timeout=10000)
    assert page.locator('#selectedLocationTitle').inner_text()=='مرکز فضایی کندی، سکوی ۳۹A'
    assert page.locator('#selectedLocationFacility').is_visible()
    assert page.evaluate("document.getElementById('mobileMainSheet').dataset.mobileSnap")=='half'
    assert page.evaluate('window.__p3Stage3.pinnedKey')=='site:ksc39a'
    assert page.evaluate('!!document.createElement("canvas").getContext("webgl")')
    # Open facility mode from relocated, original quick card: no cloned event handlers.
    page.locator('#selectedLocationFacility').click()
    page.wait_for_function("()=>window.RaspehrLocalFacilityView.active",timeout=15000)
    page.wait_for_function("()=>window.__p3Engine.camera.position.z<1.73",timeout=15000)
    page.wait_for_function("()=>window.__p3Engine.globeGroup.getObjectByName('raspehr-local-imagery').children.length===9",timeout=15000)
    assert page.evaluate("window.__p3Engine.globeGroup.getObjectByName('raspehr-osm-facility-buildings').children.length") == 6
    page.locator('#selectedLocationFacilityExit').click()
    page.wait_for_function("()=>!window.RaspehrLocalFacilityView.active",timeout=15000)
    assert page.evaluate('window.__p3Markers.enabled') is True
    # Open canonical dossier and confirm full/half sizing.
    page.locator('#selectedLocationProfile').click()
    page.wait_for_function("()=>!document.getElementById('dossierOverlay').hidden",timeout=5000)
    assert page.evaluate('document.getElementById("dossierOverlay").dataset.mobileSnap')=='full'
    page.locator('button[data-dossier-snap="half"]').click()
    assert page.evaluate('document.getElementById("dossierOverlay").dataset.mobileSnap')=='half'
    page.locator('button[data-dossier-snap="full"]').click()
    assert page.evaluate('document.getElementById("dossierOverlay").dataset.mobileSnap')=='full'
    page.locator('#dossierClose').click()
    assert page.locator('#dossierOverlay').is_hidden()
    assert not page.locator('#selectedLocationCard').is_hidden()
    assert not errors,errors
    page.screenshot(path='/mnt/data/raspehr_priority4_real_webgl_mobile.png',full_page=False)
    print('PASS PRIORITY4 REAL WEBGL MOBILE',json.dumps({'records':420,'categoryCount':14,'selected':'ksc39a','facility_tiles':9,'buildings':3,'mobile_snap':'half','errors':len(errors)},ensure_ascii=False))
    browser.close()
