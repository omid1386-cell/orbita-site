from pathlib import Path
import base64, io, re
from PIL import Image
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]
html=(root/'raspehr-3d/index.html').read_text()
html=re.sub(r'<script[^>]+></script>','',html)
html=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',html)
img=Image.new('RGBA',(256,256),(135,208,0,255));b=io.BytesIO();img.save(b,'PNG')
png64=base64.b64encode(b.getvalue()).decode()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank')
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate("""()=>{document.querySelector('#globeMount').style.cssText='position:relative;width:900px;height:700px;'}""")
 page.add_script_tag(content=(root/'assets/vendor/three.min.js').read_text())
 page.evaluate('''(encoded)=>{
 const raw=atob(encoded);const bytes=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 const png=new Blob([bytes],{type:'image/png'});
 window.__failFetch=true; window.fetch=async()=>{if(window.__failFetch)throw new Error('simulated offline'); return new Response(png,{status:200,headers:{'content-type':'image/png'}});};
 window.Image=class FakeImage{
   constructor(){this.width=256;this.height=128;this.decoding='async';}
   set src(val){this.url=val; Promise.resolve().then(()=>this.onload&&this.onload());}
 };
 THREE.WebGLRenderer=class MockRenderer{
   constructor(){this.domElement=document.createElement('canvas');this.domElement.style.width='100%';this.domElement.style.height='100%';this.capabilities={getMaxAnisotropy:()=>4};}
   setClearColor(){}setSize(){}setPixelRatio(){}render(){}resetState(){}dispose(){}
 };
 }''',png64)
 for path in ['raspehr-3d/assets/js/terrain-dem.js','raspehr-3d/assets/js/globe-engine.js','raspehr-3d/assets/js/prototype.js']:
  page.add_script_tag(content=(root/path).read_text())
 try:
  page.wait_for_function("()=>document.getElementById('terrainRetry').hidden===false",timeout=12000)
  print('TERRAIN_RETRY_SHOWN:',page.locator('#terrainStatus').inner_text()[:95])
  page.evaluate("window.__failFetch=false")
  page.locator('#terrainRetry').click()
  page.wait_for_function("()=>document.getElementById('terrainStatus').textContent.includes('DEM دریافت شد')",timeout=12000)
  status=page.locator('#terrainStatus').inner_text()
  print('TERRAIN_READY:',status)
  page.locator('#terrain').uncheck()
  page.wait_for_function("()=>document.getElementById('terrainStatus').textContent.includes('مسطح')",timeout=5000)
  print('TERRAIN_OFF:',page.locator('#terrainStatus').inner_text())
  page.locator('#terrain').check()
  page.wait_for_function("()=>document.getElementById('terrainStatus').textContent.includes('پستی')",timeout=5000)
  print('TERRAIN_ON:',page.locator('#terrainStatus').inner_text())
  print('ENGINE_STATUS:',page.locator('#engineStatus').inner_text())
 except Exception as e:
  print('BROWSER_MOCK_ERROR',str(e))
  print('STATUS:',page.locator('#terrainStatus').inner_text())
  browser.close()
  raise SystemExit(1)
 print('PAGE_ERRORS',errors[:10])
 browser.close()
 if errors:
  raise SystemExit(1)
