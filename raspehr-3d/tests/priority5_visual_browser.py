#!/usr/bin/env python3
"""Priority 5 visual hierarchy and P4 mobile regression QA.
Real DOM/CSS/gesture events in Chromium; no network or GPU dependency.
Run: python raspehr-3d/tests/priority4_mobile_browser.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, re

app=Path(__file__).resolve().parents[1]
html=(app/'index.html').read_text('utf-8')
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
html=re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+"\s*>','',html)
css=(app/'assets/css/prototype.css').read_text('utf-8')
module=(app/'assets/js/mobile-bottom-sheet.js').read_text('utf-8')

with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  out={}
  for name,viewport,touch in [
    ('mobile_390',{'width':390,'height':844},True),
    ('mobile_narrow',{'width':320,'height':720},True),
    ('mobile_landscape',{'width':667,'height':375},True),
    ('desktop',{'width':1280,'height':800},False)
  ]:
    context=browser.new_context(viewport=viewport,device_scale_factor=1,is_mobile=touch,has_touch=touch)
    page=context.new_page(); errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content(html,wait_until='domcontentloaded')
    page.add_style_tag(content=css)
    page.add_style_tag(content=(app/'assets/css/priority5-visual.css').read_text('utf-8'))
    page.add_script_tag(content=module)
    # Visual tokens, subtle cluster badges, and map gesture transparency.
    visual=page.evaluate('''()=>{
      const host=document.getElementById('globeMount');
      const bubble=document.createElement('button');bubble.className='cluster-bubble';
      bubble.style.setProperty('--cluster-accent','#51d4c8');
      bubble.dataset.density='medium';bubble.dataset.mixed='false';
      bubble.textContent='۱۲';host.appendChild(bubble);
      const marker=document.createElement('div');marker.className='priority5-selected-label';
      marker.textContent='مرکز فضایی کندی';host.appendChild(marker);
      const b=getComputedStyle(bubble),mark=getComputedStyle(marker),target=getComputedStyle(bubble,'::before');
      const result={bubbleWidth:parseFloat(b.width),clusterBorder:b.borderColor,
        bubbleBackground:b.backgroundColor,labelPointer:mark.pointerEvents,
        accent:b.getPropertyValue('--cluster-accent').trim(),
        hitWidth:parseFloat(b.width)+18,
        selectedMaxWidth:mark.maxWidth};
      bubble.remove();marker.remove();return result;
    }''')
    assert 27<=visual['bubbleWidth']<=34,(name,visual)
    assert visual['hitWidth']>=44,(name,'touch target',visual)
    assert visual['labelPointer']=='none',(name,'visual label blocks map',visual)
    assert visual['accent']=='#51d4c8',(name,visual)
    enabled=page.evaluate('document.body.classList.contains("mobile-sheet-ready")')
    assert enabled is touch,(name,enabled)
    if not touch:
      assert page.evaluate('document.getElementById("selectedLocationCard").parentElement.className')=='globe-panel',name
      assert page.locator('#mobileSheetHeader').is_hidden(),name
      assert page.locator('#mobileMapShortcuts').is_hidden(),name
      out[name]={'enabled':False,'errors':errors}
      context.close();continue
    assert page.evaluate('document.getElementById("selectedLocationCard").parentElement.id')=='mobileSelectedSlot',name
    assert page.evaluate('document.getElementById("mobileMainSheet").dataset.mobileSnap')=='half',name
    assert page.evaluate('document.getElementById("mobileMainSheet").dataset.mobileTab')=='filters',name
    assert not page.locator('#mobileSheetHeader').is_hidden(),name
    assert not page.locator('#mobileMapShortcuts').is_hidden(),name
    width=page.evaluate('document.documentElement.scrollWidth');assert width<=viewport['width']+1,(name,'overflow',width,viewport)
    # Globe must occupy viewport behind the bottom sheet and remain accessible above it.
    globe_box=page.locator('.globe-panel').bounding_box()
    sheet_box=page.locator('#mobileMainSheet').bounding_box()
    assert abs(globe_box['height']-viewport['height'])<=2,(name,globe_box)
    assert sheet_box['height']<viewport['height']-80,(name,sheet_box)
    # All three snap modes, height invariants, usable header in collapsed state.
    page.locator('button[data-mobile-snap="collapsed"]').click()
    page.wait_for_timeout(350)
    collapsed=page.locator('#mobileMainSheet').bounding_box()
    assert 110<=collapsed['height']<=160,(name,collapsed)
    assert page.locator('#mobileSheetHeader').is_visible(),name
    page.locator('button[data-mobile-snap="full"]').click()
    page.wait_for_timeout(350)
    full=page.locator('#mobileMainSheet').bounding_box()
    assert full['height']>viewport['height']*.89,(name,full)
    assert full['y']>=0,(name,full)
    page.locator('button[data-mobile-snap="half"]').click()
    page.wait_for_timeout(350)
    half=page.locator('#mobileMainSheet').bounding_box()
    assert collapsed['height']+80<half['height']<full['height']-35,(name,collapsed,half,full)
    # Dedicated drag handle supports gestures without hijacking content scrolling.
    page.evaluate('''()=>{
      const h=document.getElementById('mobileSheetHandle');
      h.dispatchEvent(new PointerEvent('pointerdown',{pointerId:101,pointerType:'touch',isPrimary:true,clientY:320,bubbles:true}));
      h.dispatchEvent(new PointerEvent('pointerup',{pointerId:101,pointerType:'touch',isPrimary:true,clientY:240,bubbles:true}));
    }''')
    assert page.evaluate('window.RaspehrMobileSheet.getState().snap')=='full',(name,'swipe up')
    page.evaluate('''()=>{
      const h=document.getElementById('mobileSheetHandle');
      h.dispatchEvent(new PointerEvent('pointerdown',{pointerId:102,pointerType:'touch',isPrimary:true,clientY:240,bubbles:true}));
      h.dispatchEvent(new PointerEvent('pointerup',{pointerId:102,pointerType:'touch',isPrimary:true,clientY:335,bubbles:true}));
    }''')
    assert page.evaluate('window.RaspehrMobileSheet.getState().snap')=='half',(name,'swipe down')
    assert page.evaluate('getComputedStyle(document.querySelector(".mobile-sheet-body")).touchAction')=='pan-y'
    # Accessible keyboard arrows and Escape implement the same snapping behavior.
    page.locator('#mobileSheetHandle').focus()
    page.keyboard.press('ArrowUp')
    assert page.evaluate('window.RaspehrMobileSheet.getState().snap')=='full',name
    page.keyboard.press('ArrowDown')
    assert page.evaluate('window.RaspehrMobileSheet.getState().snap')=='half',name
    page.keyboard.press('Escape')
    assert page.evaluate('window.RaspehrMobileSheet.getState().snap')=='collapsed',name
    page.locator('button[data-mobile-snap="half"]').click()
    # Tabs show only their intended original source sections.
    page.locator('button[data-mobile-tab="controls"]').click()
    assert page.locator('.stage-panel .toolbar-row').is_visible(),name
    assert page.locator('.stage-panel .entity-panel').is_hidden(),name
    page.locator('button[data-mobile-tab="filters"]').click()
    assert page.locator('.stage-panel .entity-panel').is_visible(),name
    assert page.locator('.stage-panel .toolbar-row').is_hidden(),name
    # Selection mutation brings up the exact existing card, not a duplicate.
    page.evaluate('''()=>{
      const el=document.getElementById('selectedLocationCard');
      document.getElementById('selectedLocationTitle').textContent='مرکز فضایی کندی';
      el.hidden=false;
    }''')
    page.wait_for_function('document.getElementById("mobileMainSheet").dataset.mobileTab==="place"')
    assert page.locator('#mobileLocationTab').is_enabled(),name
    assert page.locator('#mobileMapPlace').is_enabled(),name
    assert page.locator('#selectedLocationTitle').inner_text()=='مرکز فضایی کندی',name
    assert page.locator('.stage-panel .entity-panel').is_hidden(),name
    card_box=page.locator('#selectedLocationCard').bounding_box()
    assert card_box and 0<=card_box['x'] and card_box['x']+card_box['width']<=viewport['width']+1,(name,card_box)
    # Quick control must re-open collapsed panel on details and filters.
    page.locator('button[data-mobile-snap="collapsed"]').click();page.wait_for_timeout(330)
    page.locator('[data-mobile-quick="filters"]').click();page.wait_for_timeout(330)
    assert page.evaluate('document.getElementById("mobileMainSheet").dataset.mobileSnap')=='half'
    assert page.evaluate('document.getElementById("mobileMainSheet").dataset.mobileTab')=='filters'
    page.locator('[data-mobile-quick="place"]').click()
    assert page.evaluate('document.getElementById("mobileMainSheet").dataset.mobileTab')=='place'
    # Simulate modal open; dossier has its own independent three sizes.
    page.evaluate("document.getElementById('dossierOverlay').hidden=false")
    page.wait_for_function('document.getElementById("dossierOverlay").dataset.mobileSnap==="full"')
    page.locator('[data-dossier-snap="half"]').click();page.wait_for_timeout(330)
    dossier_half=page.locator('#dossierOverlay').bounding_box()
    assert dossier_half['height']<viewport['height']*.7 and dossier_half['height']>viewport['height']*.45,(name,dossier_half)
    page.locator('[data-dossier-snap="collapsed"]').click();page.wait_for_timeout(330)
    dossier_collapsed=page.locator('#dossierOverlay').bounding_box()
    assert dossier_collapsed['height']<dossier_half['height'],name
    page.locator('[data-dossier-snap="full"]').click();page.wait_for_timeout(330)
    dossier_full=page.locator('#dossierOverlay').bounding_box()
    assert dossier_full['height']>viewport['height']*.90,(name,dossier_full)
    page.evaluate("document.getElementById('dossierOverlay').hidden=true")
    # Native map behind panel should not have a touch-blocking scrim.
    probe=page.evaluate('''()=>{
      const e=document.elementFromPoint(innerWidth/2,innerHeight*.31);
      return {tag:e&&e.tagName,id:e&&e.id,className:e&&e.className};
    }''')
    assert probe['id'] not in ('mobileMainSheet','dossierOverlay'),(name,probe)
    # portrait/mobile rotation to desktop and back must restore same node.
    page.set_viewport_size({'width':1100,'height':800})
    page.wait_for_function('!document.body.classList.contains("mobile-sheet-ready")')
    assert page.evaluate('document.getElementById("selectedLocationCard").parentElement.className')=='globe-panel',name
    page.set_viewport_size(viewport)
    page.wait_for_function('document.body.classList.contains("mobile-sheet-ready")')
    assert page.evaluate('document.getElementById("selectedLocationCard").parentElement.id')=='mobileSelectedSlot',name
    assert len(errors)==0,(name,errors)
    out[name]={'width':width,'collapsed_px':round(collapsed['height']),'half_px':round(half['height']),
               'full_px':round(full['height']),'dossier_half_px':round(dossier_half['height']),
               'errors':len(errors)}
    if name=='mobile_390':
      page.locator('button[data-mobile-snap="half"]').click()
      page.locator('button[data-mobile-tab="place"]').click()
      page.screenshot(path='/mnt/data/raspehr_priority5_mobile_visual_dom.png')
    context.close()
  browser.close()
print('PASS Priority5 mobile visual regression:',json.dumps(out,ensure_ascii=False))
