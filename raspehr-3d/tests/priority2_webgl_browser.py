#!/usr/bin/env python3
"""Priority 2 real Three.js/WebGL integration test.
Run: xvfb-run -a python raspehr-3d/tests/priority2_webgl_browser.py
Uses canonical JSON and local texture assets; DEM network is disabled for this test.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, re, base64, sys

app=Path(__file__).resolve().parents[1]
root=app.parent
html=(app/'index.html').read_text('utf-8')
html=re.sub(r'<script\\s+src=\"[^\"]+\"\\s*></script>','',html)
html=re.sub(r'<link\\s+rel=\"stylesheet\"\\s+href=\"[^\"]+\"\\s*>','',html)

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

engine=(app/'assets/js/globe-engine.js').read_text('utf-8')
engine=engine.replace('image.src = url;','image.src = window.__raspehrImageMap[url] || url;')
engine=engine.replace('terrain:true, terrainExaggeration:1','terrain:false, terrainExaggeration:1')

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=False,args=[
        '--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist','--disable-dev-shm-usage'
    ])
    page=browser.new_page(viewport={'width':1280,'height':820},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content(html,wait_until='domcontentloaded',timeout=30000)
    page.add_style_tag(content=(app/'assets/css/prototype.css').read_text('utf-8'))
    page.evaluate('(assets)=>{window.__raspehrImageMap=assets;}',images)
    page.evaluate('''(records)=>{
      window.__raspehrRecords=records;
      window.fetch=async (url)=>{
        const key=String(url).split('?')[0];
        if(Object.prototype.hasOwnProperty.call(records,key))
          return {ok:true,status:200,json:async()=>records[key]};
        return {ok:false,status:404,json:async()=>null};
      };
    }''',data)
    page.add_script_tag(content=(root/'assets/vendor/three.min.js').read_text('utf-8'))
    for rel in ['terrain-source.js','terrain-dem.js','stage6-performance.js']:
        page.add_script_tag(content=(app/'assets/js'/rel).read_text('utf-8'))
    page.add_script_tag(content=engine)
    for rel in ['entity-data.js','entity-markers.js','entity-explore.js','entity-stage3-ui.js','entity-stage4-dossier.js','local-facility-view.js']:
        page.add_script_tag(content=(app/'assets/js'/rel).read_text('utf-8'))
    page.add_script_tag(content=(root/'assets/js/raspehr-stage5-state.js').read_text('utf-8'))
    page.add_script_tag(content=(app/'assets/js/stage5-integration.js').read_text('utf-8'))
    prototype=(app/'assets/js/prototype.js').read_text('utf-8')
    prototype=prototype.replace('engine = new window.RaspehrGlobe.GlobeEngine(','engine = window.__p2Engine = new window.RaspehrGlobe.GlobeEngine(')
    prototype=prototype.replace('markers = new window.RaspehrEntityMarkers.EntityMarkers(','markers = window.__p2Markers = new window.RaspehrEntityMarkers.EntityMarkers(')
    prototype=prototype.replace('stage3 = new window.RaspehrStage3.Controller(','stage3 = window.__p2Stage3 = new window.RaspehrStage3.Controller(')
    page.add_script_tag(content=prototype)

    page.wait_for_function('''()=>window.__p2Engine && window.__p2Stage3 &&
      window.__p2Stage3.catalog.counts.markers===420 && window.__p2Engine.activeLevel==='z0' ''',timeout=90000)
    gl=page.evaluate('''()=>({webgl:!!document.createElement('canvas').getContext('webgl'),
      webgl2:!!document.createElement('canvas').getContext('webgl2'),
      markers:window.__p2Stage3.catalog.counts.markers,
      categories:document.querySelectorAll('.category-checkbox').length,
      card:!!document.getElementById('selectedLocationCard')})''')
    assert gl['webgl'] and gl['markers']==420 and gl['categories']==14,gl

    page.locator('#entitySearch').fill('ksc39a')
    page.wait_for_function("()=>window.__p2Stage3.filtered.length===1 && window.__p2Stage3.filtered[0].id==='ksc39a'",timeout=10000)
    row=page.evaluate("()=>window.__p2Stage3.filtered[0]")
    page.evaluate('''r=>window.__p2Engine.flyToGeo(r.lat,r.lon,5.55,{duration:350})''',row)
    page.wait_for_timeout(500)
    tap=page.evaluate('''()=>{
      const e=window.__p2Engine,m=window.__p2Markers,r=window.__p2Stage3.filtered[0];
      e.scene.updateMatrixWorld(true);e.camera.updateMatrixWorld(true);
      const rect=e.renderer.domElement.getBoundingClientRect();
      const at=m.projectAnchor(r,rect,0);
      if(!at)throw Error('target marker is not projectable');
      const x=rect.left+at.x,y=rect.top+at.y,canvas=e.renderer.domElement;
      canvas.dispatchEvent(new PointerEvent('pointerdown',{pointerId:31,pointerType:'mouse',button:0,clientX:x,clientY:y,bubbles:true}));
      canvas.dispatchEvent(new PointerEvent('pointerup',{pointerId:31,pointerType:'mouse',button:0,clientX:x,clientY:y,bubbles:true}));
      return {x,y,projected:at};
    }''')
    page.wait_for_timeout(300)
    page.wait_for_function("()=>window.__p2Markers.selected && window.__p2Markers.selected.id==='ksc39a'",timeout=10000)
    page.wait_for_function("()=>!document.getElementById('selectedLocationCard').hidden",timeout=5000)
    page.wait_for_timeout(250)
    mid_flight_distance=page.evaluate('window.__p2Engine.camera.position.z')
    assert 3.05<mid_flight_distance<5.55,mid_flight_distance
    page.wait_for_function('()=>!window.__p2Engine.cameraFlight',timeout=12000)
    selection=page.evaluate('''()=>{
      const e=window.__p2Engine,m=window.__p2Markers,s=window.__p2Stage3;
      const row=m.selected;
      const expected=window.RaspehrEntityMarkers.focusDistanceFor(row);
      const local=window.RaspehrEntityMarkers.geo(row.lat,row.lon,1).applyEuler(e.globeGroup.rotation);
      return {selected:row.id,card:document.getElementById('selectedLocationTitle').textContent,
        pinned:s.pinnedKey,displayed:m.displayRows.some(r=>r.key===row.key),
        ring:m.selectionRing.visible,expectedDistance:expected,actualDistance:e.camera.position.z,
        centerDot:[local.x,local.y,local.z],flightActive:!!e.cameraFlight};
    }''')
    assert selection['selected']=='ksc39a' and selection['card']=='مرکز فضایی کندی، سکوی ۳۹A',selection
    assert selection['pinned']=='site:ksc39a' and selection['displayed'] and selection['ring'],selection
    assert abs(selection['actualDistance']-selection['expectedDistance'])<0.05,selection
    assert abs(selection['centerDot'][0])<0.02 and abs(selection['centerDot'][1])<0.02 and selection['centerDot'][2]>0.99,selection
    page.screenshot(path='/mnt/data/raspehr_priority2_selected_location_webgl.png',full_page=False)
    page.locator('#selectedLocationProfile').click()
    assert not page.locator('#dossierOverlay').is_hidden()
    page.locator('#dossierClose').click()
    assert page.locator('#dossierOverlay').is_hidden()

    page.locator('#entityClear').click()
    page.wait_for_timeout(600)
    bubble=page.locator('.cluster-bubble:not([hidden])').first
    bubble.wait_for(state='visible',timeout=10000)
    before=page.evaluate('window.__p2Engine.camera.position.z')
    bubble.click()
    page.wait_for_function("()=>!document.getElementById('clusterCard').hidden",timeout=5000)
    page.wait_for_function('()=>!window.__p2Engine.cameraFlight',timeout=12000)
    cluster=page.evaluate('''()=>({count:window.__p2Stage3.activeCluster.count,
      distance:window.__p2Engine.camera.position.z,
      members:document.querySelectorAll('#clusterMembers .entity-result').length})''')
    assert cluster['count']>=2 and cluster['members']>=2 and cluster['distance']<before,cluster
    assert not errors,errors
    print('PASS PRIORITY2 REAL WEBGL',json.dumps({'gl':gl,'tap':tap,'selection':selection,'mid_flight_distance':mid_flight_distance,'cluster':cluster,'errors':len(errors)},ensure_ascii=False))
    browser.close()
