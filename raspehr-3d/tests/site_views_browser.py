#!/usr/bin/env python3
"""Deterministic offline Chromium test: reads actual local files, mounts document without network."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,json,base64
app=Path(__file__).resolve().parents[1]
root=app.parent
html=(app/'index.html').read_text('utf-8')
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
html=re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+"\s*>','',html)
manifest=json.loads((app/'data/site-views-local.v1.json').read_text('utf-8'))
images={x['files'][0]['src']:(app/x['files'][0]['src']).read_bytes() for x in manifest['sites'] if x['files']}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1280,800),(390,844)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  page.add_style_tag(content=(app/'assets/css/prototype.css').read_text('utf-8'))
  page.add_style_tag(content=(app/'assets/css/site-views.css').read_text('utf-8'))
  # The real manifest and 48 real local JPEG files are injected as data URLs for an offline test.
  fixtures=json.loads(json.dumps(manifest))
  for row in fixtures['sites']:
   if row['files']:
    src=row['files'][0]['src'];row['files'][0]['src']='data:image/jpeg;base64,'+base64.b64encode(images[src]).decode('ascii')
  page.evaluate('(data)=>{window.fetch=async()=>({ok:true,json:async()=>data});}',fixtures)
  code=(app/'assets/js/site-views.js').read_text('utf-8')
  code=re.sub(r'const allowed=/[^;]+;', "const allowed=/^(?:data:image\\/jpeg;base64,|assets\\/site-views\\/photos\\/)/;",code)
  page.add_script_tag(content=code)
  page.wait_for_function('window.RaspehrSiteViews?.getStatus().loaded',timeout=10000)
  assert page.evaluate('window.RaspehrSiteViews.getStatus().count')==79
  page.evaluate("document.getElementById('selectedLocationCard').hidden=false; window.RaspehrSiteViews.select({id:'ksc39a',kind:'site',fa:'کندی'})")
  assert page.locator('#siteViewPreview').is_visible()
  page.wait_for_function('document.getElementById("siteViewPreviewImage").naturalWidth > 0')
  page.locator('#siteViewPreviewOpen').click()
  assert page.locator('#siteViewDialog').is_visible()
  page.wait_for_function('document.getElementById("siteViewImage").naturalWidth > 0')
  assert '۳۶۰ درجه نیست' in page.locator('#siteViewDialog').inner_text()
  z1=page.locator('#siteViewZoom').inner_text()
  page.locator('#siteViewZoomIn').click()
  z2=page.locator('#siteViewZoom').inner_text();assert z1!=z2
  stage=page.locator('#siteViewStage');b=stage.bounding_box()
  page.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2)
  before=page.locator('#siteViewImage').evaluate('(e)=>e.style.transform')
  page.mouse.down();page.mouse.move(b['x']+b['width']/2+80,b['y']+b['height']/2+40,steps=4);page.mouse.up()
  after=page.locator('#siteViewImage').evaluate('(e)=>e.style.transform')
  assert before!=after,(before,after)
  page.screenshot(path=f'/mnt/data/raspehr_site_photo_viewer_{width}.png')
  page.keyboard.press('Escape');assert page.locator('#siteViewDialog').is_hidden()
  page.evaluate("window.RaspehrSiteViews.select({id:'mahia',kind:'site',fa:'ماهیا'})")
  assert page.locator('#siteViewPreview').is_visible()
  page.evaluate("window.RaspehrSiteViews.select({id:'bowen',kind:'site',fa:'بوون'})")
  assert page.locator('#siteViewPreview').is_hidden()
  page.evaluate("window.RaspehrSiteViews.select({id:'nasa',kind:'company',fa:'ناسا'})")
  assert page.locator('#siteViewPreview').is_hidden()
  assert not errors,errors
  print('PASS',f'{width}x{height}','manifest 79','photo displayed','zoom','drag','escape','missing','no JS errors')
  page.close()
 browser.close()
