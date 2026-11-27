#!/usr/bin/env python3
"""V17 step-1 visual regression: actual stage5 switch CSS/JS in a browser DOM.
It intentionally does not claim that the real map/WebGL or GitHub deployment was tested."""
import asyncio, json, pathlib
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
CSS = (ROOT/'assets/css/raspehr-stage5-switch.css').read_text(encoding='utf-8')
JS = (ROOT/'assets/js/raspehr-stage5-switch.js').read_text(encoding='utf-8')
HTML = '''<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"></head>
<body style="margin:0;font-family:Tahoma,sans-serif;background:#0a1c2d;color:white">
<main id="view-map" style="position:relative;height:100vh;overflow:hidden;background:#0b1c2c">
<div id="map" style="position:absolute;inset:0;background:linear-gradient(50deg,#163950,#071723)"></div>
<div class="raspehr-stage5-dock" id="raspehrStage5Dock"><button id="raspehrStage5Toggle" type="button">🌐 نمای سه‌بعدی</button><span id="raspehrStage5Status" hidden></span></div>
<section id="raspehr3dOverlay" class="raspehr-stage5-overlay" hidden><iframe id="raspehrStage5Frame"></iframe></section>
<section id="detail" class="detail-panel" style="position:absolute;top:20px;left:10px;width:350px;max-width:calc(100% - 40px);height:70%;background:white;color:#102337;border-radius:14px;padding:12px;box-sizing:border-box;z-index:25;display:none">
<button id="detailClose">بستن</button><h2>شناسنامه کشور الجزایر</h2><div style="background:#e9eef2;padding:24px;border-radius:8px">گالری تصاویر و اطلاعات</div>
</section></main>
<dialog id="testLightbox"><p>گالری تصاویر و ویدئوها</p><button id="closeGallery">بستن</button></dialog>
</body></html>'''
async def run():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width,height,label in [(390,844,'mobile'),(1365,768,'desktop')]:
   page=await browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
   await page.set_content(HTML)
   await page.add_style_tag(content=CSS+'\n#detail.open{display:block!important}')
   await page.evaluate("""() => { window.RaspehrStage5MapAdapter={getState:()=>({}),applyState:()=>Promise.resolve()};window.map={resize:()=>{}}; }""")
   await page.add_script_tag(content=JS)
   async def check(name,want_hidden):
    visible=await page.locator('#raspehrStage5Toggle').evaluate('(el)=>getComputedStyle(el.parentElement).display!=="none"')
    assert visible == (not want_hidden), f'{label} {name}: expected {want_hidden=} saw {visible=}'
    results.append({'screen':label,'case':name,'pass':True})
   await check('2D bare map: entry toggle visible',False)
   await page.locator('#detail').evaluate("el=>el.classList.add('open')")
   await page.wait_for_function("document.body.classList.contains('raspehr-stage5-detail-open')")
   await check('country dossier: entry toggle hidden',True)
   await page.locator('#detail').evaluate("el=>el.classList.remove('open')")
   await page.wait_for_function("!document.body.classList.contains('raspehr-stage5-detail-open')")
   await check('country dossier closed: entry restored',False)
   await page.locator('#testLightbox').evaluate("el=>el.showModal()")
   await check('media gallery/modal: entry toggle hidden',True)
   await page.locator('#testLightbox').evaluate('el=>el.close()')
   await check('media gallery closed: entry restored',False)
   # Call the ACTUAL switch controller (not a synthetic active class). The
   # mocked iframe cannot provide WebGL, but the parent-side transition runs.
   await page.locator('#raspehrStage5Toggle').click()
   assert await page.evaluate('RaspehrStage5Switch.isActive()')
   await check('3D activated: duplicate parent return hidden',True)
   assert 'بازگشت' not in await page.locator('#raspehrStage5Toggle').inner_text(), 'parent must never become another return button'
   results.append({'screen':label,'case':'3D activation leaves only child return control','pass':True})
   await page.evaluate('RaspehrStage5Switch.deactivate()')
   assert not await page.evaluate('RaspehrStage5Switch.isActive()')
   await check('3D exit: 2D entry visible',False)
   await page.locator('#raspehrStage5Toggle').click()
   await page.locator('#detail').evaluate("el=>el.classList.add('open')")
   await page.wait_for_function("document.body.classList.contains('raspehr-stage5-detail-open')")
   await page.evaluate('RaspehrStage5Switch.deactivate()')
   await check('3D return with dossier: entry stays hidden',True)
   focus=await page.evaluate('document.activeElement && document.activeElement.id')
   assert focus=='detailClose', f'{label}: return with dossier should focus its close control, got {focus}'
   results.append({'screen':label,'case':'3D return focus goes to dossier close','pass':True})
   await page.locator('#detail').evaluate("el=>el.classList.remove('open')")
   await page.wait_for_function("!document.body.classList.contains('raspehr-stage5-detail-open')")
   await page.screenshot(path=str(pathlib.Path(__file__).parent/f'RASPEHR_V17_STEP1_{label}_TEST.png'))
   await page.close()
  await browser.close()
 print(json.dumps({'passes':len(results),'failures':0,'tests':results},ensure_ascii=False,indent=2))
if __name__=='__main__': asyncio.run(run())
