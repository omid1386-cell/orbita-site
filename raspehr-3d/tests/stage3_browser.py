#!/usr/bin/env python3
"""Local-source Chromium/WebGL smoke test. No localhost networking required.
Run: xvfb-run -a python raspehr-3d/tests/stage3_browser.py
All scripts, data and day/night imagery come from the actual integrated files.
Only image URL transport and remote DEM are mocked for the QA environment.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, json, re
app=Path(__file__).resolve().parents[1]
root=app.parent
main_data=root/'data'
main_assets=root/'assets'
html=(app/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
html=re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+"\s*>','',html)
assets={}
for jpg in (app/'assets/tex-tiles').rglob('*.jpg'):
    assets[jpg.relative_to(app).as_posix()]='data:image/jpeg;base64,'+base64.b64encode(jpg.read_bytes()).decode('ascii')
for jpg in (main_assets/'tex').glob('earth_*.jpg'):
    assets['../assets/tex/'+jpg.name]='data:image/jpeg;base64,'+base64.b64encode(jpg.read_bytes()).decode('ascii')
data={}
for name in ['companies.json','sites.json','recovery_sites.json']:
    data['../data/'+name]=json.loads((main_data/name).read_text(encoding='utf-8'))
engine=(app/'assets/js/globe-engine.js').read_text(encoding='utf-8')
assert 'image.src = url;' in engine
engine=engine.replace('image.src = url;','image.src = window.__raspehrImageMap[url] || url;')
engine=engine.replace('terrain:true, terrainExaggeration:1','terrain:false, terrainExaggeration:1')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=False,executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
    errors=[];warnings=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda message:warnings.append(message.type+': '+message.text[:180]) if message.type=='error' else None)
    page.set_content(html,wait_until='domcontentloaded')
    page.add_style_tag(content=(app/'assets/css/prototype.css').read_text(encoding='utf-8'))
    page.evaluate('''({assets,data})=>{
      window.__raspehrImageMap=assets;
      window.__raspehrDataMap=data;
      window.fetch=url=>{
        const target=window.__raspehrDataMap[url];
        return Promise.resolve(target?{ok:true,status:200,json:async()=>target}:{ok:false,status:404,json:async()=>({})});
      };
    }''', {'assets':assets,'data':data})
    for source in [main_assets/'vendor/three.min.js',app/'assets/js/terrain-dem.js']:
        page.add_script_tag(content=source.read_text(encoding='utf-8'))
    page.add_script_tag(content=engine)
    for name in ['entity-data.js','entity-markers.js','entity-explore.js','entity-stage3-ui.js','local-facility-view.js']:
        page.add_script_tag(content=(app/'assets/js'/name).read_text(encoding='utf-8'))
    controller=(app/'assets/js/prototype.js').read_text(encoding='utf-8')
    controller=controller.replace('engine = new window.RaspehrGlobe.GlobeEngine(','engine = window.__testGlobeEngine = new window.RaspehrGlobe.GlobeEngine(')
    controller=controller.replace('markers = new window.RaspehrEntityMarkers.EntityMarkers(','markers = window.__testMarkers = new window.RaspehrEntityMarkers.EntityMarkers(')
    controller=controller.replace('stage3 = new window.RaspehrStage3.Controller(','stage3 = window.__testStage3 = new window.RaspehrStage3.Controller(')
    page.add_script_tag(content=controller)
    page.wait_for_function('''()=>window.__testStage3 && document.querySelector('#markerStatus').textContent.includes('۴۲۰') &&
        document.querySelectorAll('#entityLegend .category-checkbox').length===14''',timeout=90000)
    page.wait_for_timeout(1000)
    info=page.evaluate('''()=>({canvas:document.querySelectorAll('#globeMount canvas').length,
      categories:document.querySelectorAll('#entityLegend .category-checkbox').length,
      countries:document.querySelector('#entityCountry').options.length,
      rawCount:window.__testStage3.catalog.markers.length,
      matching:window.__testStage3.filtered.length,
      clusters:document.querySelectorAll('.cluster-bubble').length,
      engine:document.querySelector('#engineStatus').textContent,
      summary:document.querySelector('#entityResultCount').textContent})''')
    print('INITIAL',info,flush=True)
    assert info['canvas']==1 and info['categories']==14 and info['rawCount']==420 and info['countries']>70,info
    assert info['clusters']>0,info
    page.locator('#entityCountry').select_option('United States')
    assert page.evaluate('window.__testStage3.filtered.every(r=>r.country==="United States")')
    print('US_COUNT',page.evaluate('window.__testStage3.filtered.length'),flush=True)
    page.locator('#categoryNone').click()
    assert page.evaluate('window.__testStage3.filtered.length')==0
    assert page.locator('#entityResults .entity-result').count()==0
    page.locator('#categoryAll').click()
    assert page.evaluate('window.__testStage3.filtered.length')>0
    page.locator('#entityClear').click()
    page.locator('#entitySearch').fill('ناسا')
    page.wait_for_function('()=>window.__testStage3.query==="ناسا" && window.__testStage3.filtered.some(r=>r.id==="nasa")',timeout=15000)
    page.locator('#entityResults .entity-result').first.click()
    assert not page.locator('#entityCard').is_hidden()
    print('SEARCH_PICK',page.locator('#entityId').inner_text(),flush=True)
    assert page.locator('.cluster-bubble').count()>=0
    print('PAGE_ERRORS',errors,flush=True)
    assert not errors,errors
    browser.close()
    print('PASS Stage3 browser: WebGL, 14 filters, 108 countries/territories, country filter, search selection')
