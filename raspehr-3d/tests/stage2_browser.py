#!/usr/bin/env python3
"""Stage 02 full-Chromium WebGL smoke test without network.
Use: xvfb-run -a python raspehr-3d/tests/stage2_browser.py
The test loads the real Three.js and real main data, but mocks only network transport.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, json, re
app=Path(__file__).resolve().parents[1]
root=app.parent
main_data=(root/'data') if (root/'data').exists() else (root.parent/'main/data')
main_assets=(root/'assets') if (root/'assets').exists() else (root.parent/'main/assets')
if not main_data.exists() or not main_assets.exists():
    print('SKIP: this optional test needs main/ data and assets in the QA staging directory')
    raise SystemExit(2)
html=(app/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
html=re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+"\s*>','',html)
assets={}
for image in (app/'assets/tex-tiles').rglob('*.jpg'):
    assets[image.relative_to(app).as_posix()]='data:image/jpeg;base64,'+base64.b64encode(image.read_bytes()).decode('ascii')
for image in (main_assets/'tex').glob('earth_*.jpg'):
    assets['../assets/tex/'+image.name]='data:image/jpeg;base64,'+base64.b64encode(image.read_bytes()).decode('ascii')
data={}
for filename in ('companies.json','sites.json','recovery_sites.json'):
    data['../data/'+filename]=json.loads((main_data/filename).read_text(encoding='utf-8'))
print('Mapped images:',len(assets),'records:',len(data['../data/companies.json'])+len(data['../data/sites.json'])+len(data['../data/recovery_sites.json']['sites']),flush=True)
engine=(app/'assets/js/globe-engine.js').read_text(encoding='utf-8')
assert 'image.src = url;' in engine
engine=engine.replace('image.src = url;', 'image.src = window.__raspehrImageMap[url] || url;')
engine=engine.replace('terrain:true, terrainExaggeration:1','terrain:false, terrainExaggeration:1')
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=False,executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1360,'height':900},device_scale_factor=1)
    errors=[]; logs=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda m:logs.append(m.type+': '+m.text[:300]))
    page.set_content(html,wait_until='domcontentloaded')
    page.add_style_tag(content=(app/'assets/css/prototype.css').read_text(encoding='utf-8'))
    page.evaluate('''({assets,data})=>{
      window.__raspehrImageMap=assets;
      window.__raspehrDataMap=data;
      window.fetch=(url)=>{
        const target=window.__raspehrDataMap[url];
        return Promise.resolve(target ? {ok:true,status:200,json:async()=>target} : {ok:false,status:404,json:async()=>({})});
      };
    }''',{'assets':assets,'data':data})
    for src in [(main_assets/'vendor/three.min.js').read_text(encoding='utf-8'),
                (app/'assets/js/terrain-dem.js').read_text(encoding='utf-8'), engine,
                (app/'assets/js/entity-data.js').read_text(encoding='utf-8'),
                (app/'assets/js/entity-markers.js').read_text(encoding='utf-8')]:
        page.add_script_tag(content=src)
    # Deliberately inject test observables into the prototype controller; not production code.
    ctrl=(app/'assets/js/prototype.js').read_text(encoding='utf-8')
    ctrl=ctrl.replace('engine = new window.RaspehrGlobe.GlobeEngine(', 'engine = window.__testGlobeEngine = new window.RaspehrGlobe.GlobeEngine(')
    ctrl=ctrl.replace('markers = new window.RaspehrEntityMarkers.EntityMarkers(', 'markers = window.__testMarkers = new window.RaspehrEntityMarkers.EntityMarkers(')
    page.add_script_tag(content=ctrl)
    page.wait_for_function("() => window.__testMarkers && document.querySelector('#markerStatus').textContent.includes('۳۹۷')",timeout=90000)
    status=page.evaluate('''() => ({
      count:window.__testMarkers.meshes.reduce((sum,m)=>sum+m.count,0),
      categories:window.__testMarkers.meshes.length,
      canvasCount:document.querySelectorAll('#globeMount canvas').length,
      state:document.querySelector('#markerStatus').textContent,
      legend:document.querySelectorAll('.legend-item').length,
      gl:!!document.querySelector('#globeMount canvas').getContext('webgl2') || !!document.querySelector('#globeMount canvas').getContext('webgl')
    })''')
    print('BROWSER',status,flush=True)
    assert status['count']==420,status
    assert status['categories']==14,status
    assert status['legend']==14,status
    assert status['gl'] is True
    assert not errors,errors
    # Selecting a canonical item focuses camera and exposes its exact ID.
    selected=page.evaluate('''() => {
      const markers=window.__testMarkers;
      const row=markers.catalog.markers.find(x=>x.id==='ksc39a');
      markers.select(row,true);
      return {id:document.querySelector('#entityId').textContent, selected:markers.selected.key,lat:row.lat,lon:row.lon,cardHidden:document.querySelector('#entityCard').hidden};
    }''')
    print('SELECTED',selected,flush=True)
    assert selected['id']=='site:ksc39a'
    assert selected['selected']=='site:ksc39a'
    assert selected['cardHidden'] is False
    page.locator('#markerToggle').uncheck()
    assert page.evaluate('window.__testMarkers.enabled') is False
    page.locator('#markerToggle').check()
    assert page.evaluate('window.__testMarkers.enabled') is True
    page.wait_for_timeout(1400)
    shot=Path('/mnt/data/raspehr_stage2_webgl_markers.png')
    page.screenshot(path=str(shot),full_page=False)
    print('SCREENSHOT',shot,flush=True)
    print('JS_ERRORS',errors,flush=True)
    print('CONSOLE_TAIL',logs[-8:],flush=True)
    browser.close()
