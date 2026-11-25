#!/usr/bin/env python3
"""Priority 3 real Three.js/WebGL integration test with deterministic open-data fixtures.
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
# Test-only explicit pad precision: production coordinates/data remain unchanged.
for record in data['../data/sites.json']:
    if record.get('id')=='ksc39a':
        record['coordinates_precision']='operator_published_pad_coordinates'
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
    page=browser.new_page(viewport={'width':1360,'height':900},device_scale_factor=1)
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

    page.wait_for_function('''()=>window.__p3Engine && window.__p3Stage3 &&
      window.__p3Stage3.catalog.counts.markers===420 && window.__p3Engine.activeLevel==='z0' ''',timeout=90000)
    assert page.evaluate("!!document.createElement('canvas').getContext('webgl')")
    assert page.locator('#selectedLocationFacility').count()==1

    # Select a precise launch-pad record and open the facility view.
    page.locator('#entitySearch').fill('ksc39a')
    page.wait_for_function("()=>window.__p3Stage3.filtered.length===1 && window.__p3Stage3.filtered[0].id==='ksc39a'",timeout=10000)
    page.locator('#entityResults .entity-result').first.click()
    assert not page.locator('#selectedLocationFacility').is_hidden()
    page.locator('#selectedLocationFacility').click()
    page.wait_for_function("()=>!document.getElementById('selectedLocationFacilityExit').hidden",timeout=5000)
    page.wait_for_function("()=>window.__p3Engine.camera.position.z<1.73",timeout=15000)
    page.wait_for_function("()=>window.__p3Engine.cameraFlight===null",timeout=15000)
    page.wait_for_function("()=>window.__p3Engine.globeGroup.getObjectByName('raspehr-local-imagery').children.length===9",timeout=15000)
    page.wait_for_function("()=>window.__p3Engine.globeGroup.getObjectByName('raspehr-osm-facility-buildings').children.length===6",timeout=15000)

    result=page.evaluate('''()=>{
      const e=window.__p3Engine,v=window.RaspehrLocalFacilityView,m=window.__p3Markers;
      const ig=e.globeGroup.getObjectByName('raspehr-local-imagery');
      const bg=e.globeGroup.getObjectByName('raspehr-osm-facility-buildings');
      const meshes=bg.children.filter(o=>o.isMesh);
      return {
        webgl:!!document.createElement('canvas').getContext('webgl'),
        selected:document.getElementById('selectedLocationTitle').textContent,
        active:v.active,
        cameraDistance:e.camera.position.z,
        minDistance:e.minDistance,
        near:e.camera.near,far:e.camera.far,
        markerEnabled:m.enabled,
        cloudVisible:e.clouds.visible,
        imageryTiles:ig.children.length,
        buildingObjects:bg.children.length,
        buildingMeshes:meshes.length,
        buildingHeights:meshes.map(x=>x.userData.heightMeters),
        imageryMeta:v.imageryMeta,
        buildingSummary:v.buildingSummary,
        sourceLink:document.getElementById('selectedLocationFacilitySource').href,
        sourceText:document.getElementById('selectedLocationFacilityMeta').textContent
      };
    }''')
    assert result['active'] and result['cameraDistance']<1.73,result
    assert abs(result['cameraDistance']-1.72012)<0.0002,result
    assert abs(result['near']-0.00001)<1e-9 and result['far']==12,result
    assert result['markerEnabled'] is False and result['cloudVisible'] is False,result
    assert result['imageryTiles']==9 and result['buildingObjects']==6 and result['buildingMeshes']==3,result
    assert result['buildingHeights'][0]==18 and result['buildingHeights'][1]>9 and result['buildingHeights'][2]==0,result
    assert result['imageryMeta']['license']=='CC-BY-4.0' and result['imageryMeta']['gsd']==0.5,result
    assert 'priority3-ksc-open-imagery' in result['sourceLink'],result
    page.screenshot(path='/mnt/data/raspehr_priority3_facility_webgl.png',full_page=False)

    # Exit must restore the ordinary globe, marker interaction and camera clipping planes.
    page.locator('#selectedLocationFacilityExit').click()
    page.wait_for_function("()=>window.__p3Engine.cameraFlight===null",timeout=15000)
    restored=page.evaluate('''()=>({active:window.RaspehrLocalFacilityView.active,
      distance:window.__p3Engine.camera.position.z,minDistance:window.__p3Engine.minDistance,
      near:window.__p3Engine.camera.near,far:window.__p3Engine.camera.far,
      markerEnabled:window.__p3Markers.enabled,
      imagery:window.__p3Engine.globeGroup.getObjectByName('raspehr-local-imagery').children.length,
      buildings:window.__p3Engine.globeGroup.getObjectByName('raspehr-osm-facility-buildings').children.length})''')
    assert restored['active'] is False and restored['markerEnabled'] is True,result
    assert restored['minDistance']==2.02 and restored['near']==0.025 and restored['far']==180,restored
    assert restored['imagery']==0 and restored['buildings']==0,restored

    # Closing the selected-location card during facility mode also exits cleanly.
    page.locator('#selectedLocationFacility').click()
    page.wait_for_function("()=>!document.getElementById('selectedLocationFacilityExit').hidden",timeout=5000)
    page.locator('#selectedLocationClose').click()
    page.wait_for_function("()=>window.__p3Engine.cameraFlight===null",timeout=15000)
    closed=page.evaluate('''()=>({cardHidden:document.getElementById('selectedLocationCard').hidden,
      active:window.RaspehrLocalFacilityView.active,minDistance:window.__p3Engine.minDistance,
      near:window.__p3Engine.camera.near,markerEnabled:window.__p3Markers.enabled,
      distance:window.__p3Engine.camera.position.z})''')
    assert closed['cardHidden'] and not closed['active'] and closed['markerEnabled'],closed
    assert closed['minDistance']==2.02 and closed['near']==0.025 and closed['distance']>2.02,closed

    # Approximate coordinates are blocked even if the user calls the module directly.
    blocked=page.evaluate('''()=>window.RaspehrLocalFacility.facilityEligibility({
      key:'recovery:sample',kind:'recovery',lat:34.633,lon:-120.613,
      precision:'representative',coordinateNote:'نقطه مرجع تقریبی',categories:['recovery']})''')
    assert blocked['allowed'] is False and 'تقریبی' in blocked['reason'],blocked
    assert not errors,errors
    print('PASS PRIORITY3 REAL WEBGL',json.dumps({'facility':result,'restored':restored,'closed':closed,'approximate_gate':blocked,'js_errors':len(errors)},ensure_ascii=False))
    browser.close()
