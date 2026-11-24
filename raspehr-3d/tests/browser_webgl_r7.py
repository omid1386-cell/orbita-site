#!/usr/bin/env python3
# Optional, reproducible software-WebGL smoke test.
# Requires Playwright, Chromium and Xvfb (Linux: xvfb-run -a python browser_webgl_r7.py).
# It uses local JPEGs encoded as test data URLs; no real DEM/network requests are made.
from playwright.sync_api import sync_playwright
from pathlib import Path
import re,base64,traceback
root=Path(__file__).resolve().parents[2]
app=root/'raspehr-3d'
html=(app/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
html=re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+"\s*>','',html)
assets={}
for item in (app/'assets/tex-tiles').rglob('*.jpg'):
 rel=item.relative_to(app).as_posix()
 assets[rel] = 'data:image/jpeg;base64,'+base64.b64encode(item.read_bytes()).decode('ascii')
for item in (root/'assets/tex').glob('earth_*.jpg'):
 rel='../assets/tex/'+item.name
 assets[rel]='data:image/jpeg;base64,'+base64.b64encode(item.read_bytes()).decode('ascii')
print('Mapped imagery',len(assets),'encodedMB',round(sum(len(v) for v in assets.values())/1e6,1),flush=True)
engine=(app/'assets/js/globe-engine.js').read_text(encoding='utf-8')
assert 'image.src = url;' in engine
engine=engine.replace('image.src = url;',"image.src = window.__raspehrImageMap[url] || url;")
engine=engine.replace('terrain:true, terrainExaggeration:1', 'terrain:false, terrainExaggeration:1')
controller=(app/'assets/js/prototype.js').read_text(encoding='utf-8')
controller=controller.replace('engine = new window.RaspehrGlobe.GlobeEngine(', 'engine = window.__raspehrEngine = new window.RaspehrGlobe.GlobeEngine(')
with sync_playwright() as p:
 b=p.chromium.launch(headless=False,executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1260,'height':760},device_scale_factor=1)
 errors=[];logs=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('console',lambda m:logs.append(m.type+': '+m.text[:240]))
 page.set_content(html,wait_until='domcontentloaded')
 page.add_style_tag(content=(app/'assets/css/prototype.css').read_text(encoding='utf-8'))
 page.evaluate('(assets) => {window.__raspehrImageMap = assets;}',assets)
 page.add_script_tag(content=(root/'assets/vendor/three.min.js').read_text(encoding='utf-8'))
 page.add_script_tag(content=(app/'assets/js/terrain-dem.js').read_text(encoding='utf-8'))
 page.add_script_tag(content=engine)
 page.add_script_tag(content=controller)
 print('GL',page.evaluate("({gl:!!document.createElement('canvas').getContext('webgl'),gl2:!!document.createElement('canvas').getContext('webgl2')})"),flush=True)
 try:
  page.wait_for_function("() => window.__raspehrEngine && window.__raspehrEngine.activeLevel === 'z0'",timeout=75000)
  print('INITIAL',page.evaluate("({level:window.__raspehrEngine.activeLevel,mode:window.__raspehrEngine.surfaceMode,quality:window.__raspehrEngine.textureQuality,ui:document.getElementById('engineStatus').textContent})"),flush=True)
  page.wait_for_timeout(1000)
  # Optional: take screenshot with page.screenshot(path='raspehr-world.png')
  # Programmatic zoom to medium, then near to force LOD change.
  page.evaluate("() => window.__raspehrEngine.zoomBy(0.65)")
  page.wait_for_function("() => window.__raspehrEngine.activeLevel === 'z1'",timeout=60000)
  print('Z1',page.evaluate("window.__raspehrEngine.activeLevel"),flush=True)
  # z1 shown with actual WebGL surface
  page.evaluate("() => window.__raspehrEngine.zoomBy(0.68)")
  page.wait_for_function("() => window.__raspehrEngine.activeLevel === 'z2'",timeout=90000)
  print('Z2',page.evaluate("({level:window.__raspehrEngine.activeLevel,cached:Object.keys(window.__raspehrEngine.levelCache),textures:window.__raspehrEngine.textureQuality})"),flush=True)
  # z2 shown with actual WebGL surface
  # optional simulated geometry height test, not live AWS.
  page.evaluate("""() => {
    window.__raspehrEngine.terrainData={meters:(lat,lon)=>Math.abs(lat)<80 ? 3000 : 0};
    window.__raspehrEngine.options.terrain=true;
    window.__terrainStats=window.__raspehrEngine.applyTerrainGeometry(true);
  }""")
  print('TERRAIN',page.evaluate("window.__terrainStats"),flush=True)
  page.wait_for_timeout(500)
  # DEM values are synthetic and are used ONLY for validating geometry rendering.
 except Exception as e:
  print('TEST_FAILURE',repr(e),flush=True)
 assert not errors, 'Unexpected page JS errors: '+repr(errors)
 print('PAGE_ERRORS',errors[:15],flush=True)
 print('CONSOLE',logs[-20:],flush=True)
 b.close()
