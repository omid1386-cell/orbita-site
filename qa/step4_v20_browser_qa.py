from pathlib import Path
from playwright.sync_api import sync_playwright
import re,json
root=Path(__file__).resolve().parents[1]/'raspehr-3d'
html=(root/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link\s+rel="stylesheet"[^>]+>', '', html)
html=re.sub(r'<script\s+src="[^"]+"[^>]*></script>', '', html)
css='\n'.join((root/x).read_text(encoding='utf-8') for x in ['assets/css/prototype.css','assets/css/priority5-visual.css','assets/css/site-views.css','assets/css/atlas-panel-v2.css','assets/css/place-journey-v4.css','assets/css/interaction-stability-v5.css','assets/css/external-map-links-v1.css','assets/css/atlas-ux-step4-v20.css'])
html=html.replace('</head>',f'<style>{css}</style></head>')
jsmobile=(root/'assets/js/mobile-bottom-sheet.js').read_text(encoding='utf-8')
jsstep=(root/'assets/js/atlas-ux-step4-v20.js').read_text(encoding='utf-8')
results=[]
def check(title,condition):
  results.append((title,bool(condition)))
  if not condition: print('FAIL',title)
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
  for width,height,mode in [(1440,900,'desktop'),(900,768,'laptop'),(701,800,'threshold_desktop'),(390,844,'mobile'),(360,720,'small_mobile'),(320,700,'narrow_mobile')]:
    page=browser.new_page(viewport={'width':width,'height':height}, device_scale_factor=1)
    page.set_content(html,wait_until='domcontentloaded')
    page.add_script_tag(content=jsmobile)
    page.add_script_tag(content=jsstep)
    desktop=width>700
    check(f'{mode}: no old explore header',page.locator('text="کجا را می‌خواهید ببینید؟"').count()==0)
    check(f'{mode}: quick filters preserved',page.locator('[data-category-preset]').count()==4)
    check(f'{mode}: card hidden initial',page.locator('#selectedLocationCard').is_hidden())
    check(f'{mode}: toolbar has 3 controls',page.locator('#zoomIn').count()==1 and page.locator('#zoomOut').count()==1 and page.locator('#resetBtn').count()==1)
    check(f'{mode}: zoom touch size',page.locator('#zoomIn').evaluate('(e)=>e.getBoundingClientRect().width') >= (44 if not desktop else 38))
    check(f'{mode}: sidebar/search functional',page.locator('#entitySearch').count()==1 and page.locator('#entityCountry').count()==1)
    # selection event - simulate existing renderer, no synthetic catalogue
    page.evaluate("() => {const c=document.getElementById('selectedLocationCard');c.hidden=false;document.getElementById('selectedLocationTitle').textContent='پایگاه آزمایشی';dispatchEvent(new CustomEvent('raspehr:place-selected',{detail:{key:'sample'}}));}")
    page.wait_for_timeout(60)
    check(f'{mode}: card moved into side slot',page.locator('#selectedLocationCard').evaluate('(c)=>c.parentElement.id')=='mobileSelectedSlot')
    check(f'{mode}: card visible after selection',page.locator('#selectedLocationCard').is_visible())
    check(f'{mode}: selected name exists',page.locator('#selectedLocationTitle').inner_text()=='پایگاه آزمایشی')
    if desktop:
      check(f'{mode}: place nav visible',page.locator('#atlasDesktopPlaceTab').is_visible())
      check(f'{mode}: desktop uses sidebar',page.evaluate("document.body.classList.contains('atlas-desktop-place-active')"))
      check(f'{mode}: details do not overlap globe',page.evaluate("() => {let a=document.querySelector('#selectedLocationCard').getBoundingClientRect(),g=document.querySelector('.globe-panel').getBoundingClientRect(); return (a.right<=g.left+2 || a.left>=g.right-2);}"))
      page.locator('button[data-atlas-tab="explore"]').click()
      check(f'{mode}: explore available after selection',page.locator('#atlasExplore').is_visible())
      page.evaluate("() => {document.getElementById('selectedLocationTitle').textContent='مکان دوم';dispatchEvent(new CustomEvent('raspehr:place-selected',{detail:{key:'second'}}));}")
      page.wait_for_timeout(30)
      check(f'{mode}: second selection reopens place',page.locator('#selectedLocationCard').is_visible() and page.locator('#selectedLocationTitle').inner_text()=='مکان دوم')
      page.locator('button[data-atlas-tab="explore"]').click()
      page.locator('#atlasDesktopPlaceTab').click()
      check(f'{mode}: place reopen restores same DOM',page.locator('#selectedLocationCard').is_visible())
    else:
      check(f'{mode}: mobile sheet active',page.evaluate("document.body.classList.contains('mobile-sheet-ready')"))
      check(f'{mode}: mobile place tab selected',page.locator('#mobileMainSheet').get_attribute('data-mobile-tab')=='place')
      check(f'{mode}: mobile no desktop place button',page.locator('#atlasDesktopPlaceTab').is_hidden())
    # no horizontal overflow in sidebar / main shell
    check(f'{mode}: no horizontal overflow',page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'))
    page.evaluate("() => {document.getElementById('selectedLocationCard').hidden=true;}")
    page.wait_for_timeout(60)
    check(f'{mode}: card hidden after close',page.locator('#selectedLocationCard').is_hidden())
    if desktop:
      check(f'{mode}: explore restored on close',page.locator('#atlasExplore').is_visible())
    if mode=='desktop':
      page.evaluate("() => {document.getElementById('selectedLocationCard').hidden=false;dispatchEvent(new CustomEvent('raspehr:place-selected',{detail:{key:'sample'}}));}")
      page.wait_for_timeout(50)
    if mode=='mobile':
      page.evaluate("() => {document.getElementById('selectedLocationCard').hidden=false;dispatchEvent(new CustomEvent('raspehr:place-selected',{detail:{key:'sample'}}));}")
      page.wait_for_timeout(50)
    page.close()
  # width transition preserves existing selected card and restores correct desktop view
  page=browser.new_page(viewport={'width':390,'height':844})
  page.set_content(html,wait_until='domcontentloaded')
  page.add_script_tag(content=jsmobile);page.add_script_tag(content=jsstep)
  page.evaluate("()=>{document.getElementById('selectedLocationCard').hidden=false;dispatchEvent(new CustomEvent('raspehr:place-selected'))}")
  page.wait_for_timeout(60)
  page.set_viewport_size({'width':1100,'height':850});page.wait_for_timeout(250)
  check('mobile→desktop: docked place shown',page.locator('#selectedLocationCard').is_visible() and page.evaluate("document.body.classList.contains('atlas-desktop-place-active')"))
  page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(250)
  check('desktop→mobile: sheet place shown',page.locator('#selectedLocationCard').is_visible() and page.locator('#mobileMainSheet').get_attribute('data-mobile-tab')=='place')
  page.close()
  browser.close()
print(json.dumps({'passed':sum(x[1] for x in results),'total':len(results),'failed':[x[0] for x in results if not x[1]]},ensure_ascii=False,indent=2))
if not all(x[1] for x in results):raise SystemExit(1)
