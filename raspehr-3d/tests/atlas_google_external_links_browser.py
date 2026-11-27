"""Browser QA for external maps UI with a mocked globe; NOT a real Google Maps or WebGL test."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re
root=Path(__file__).resolve().parent.parent
html=(root/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
html=re.sub(r'<link\s+rel="stylesheet"[^>]*>','',html)
css='\n'.join((root/f).read_text(encoding='utf-8') for f in [
 'assets/css/prototype.css','assets/css/priority5-visual.css',
 'assets/css/site-views.css','assets/css/atlas-panel-v2.css',
 'assets/css/place-journey-v4.css','assets/css/interaction-stability-v5.css',
 'assets/css/external-map-links-v1.css'])
html=html.replace('</head>','<style>'+css+'\n[hidden]{display:none!important} .qa-globe{position:absolute;inset:27% 15%;border-radius:50%;background:radial-gradient(circle at 35% 26%,#3688a9,#15506e 48%,#071829 82%);opacity:.75;pointer-events:none}</style></head>')
html=html.replace('<div id="globeMount"></div>','<div id="globeMount"><div class="qa-globe"></div></div>')
registry=json.loads((root/'data/external-links-v1.json').read_text())
def row(rec,fa):
 return dict(id=rec['id'],kind=rec['kind'],key=rec['kind']+':'+rec['id'],lat=rec['lat'],lon=rec['lon'],fa=fa,category='site',categories=['site'])
site=next(x for x in registry['records'] if x['kind']=='site' and 'kennedy' in x['id'].lower()) if any('kennedy' in x['id'].lower() and x['kind']=='site' for x in registry['records']) else next(x for x in registry['records'] if x['kind']=='site')
recover=next(x for x in registry['records'] if x['kind']=='recovery')
company=next(x for x in registry['records'] if x['kind']=='company' and x['id']=='nasa')
passed=[]
def check(cond,name):
 assert cond,name
 passed.append(name)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1280,'height':900},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 page.evaluate('''data=>{window.fetch=async(_url)=>({ok:true,json:async()=>data});}''',registry)
 page.add_script_tag(content=(root/'assets/js/mobile-bottom-sheet.js').read_text())
 page.add_script_tag(content=(root/'assets/js/external-map-links-v1.js').read_text())
 check(page.locator('#atlasExternalMaps').is_hidden(),'external links hidden until selection')
 page.evaluate('''record=>{
  const card=document.getElementById('selectedLocationCard');card.hidden=false;
  document.getElementById('selectedLocationTitle').textContent=record.fa;
  window.RaspehrExternalMaps.select(record);
 }''',row(site,'پایگاه نمونه'))
 page.wait_for_function("window.RaspehrExternalMaps.getState().loaded === true")
 check(not page.locator('#atlasExternalMaps').is_hidden(),'menu shown for selected location')
 check(not page.locator('#atlasExternalMaps').get_attribute('open'),'external menu closed by default')
 page.locator('#atlasExternalMaps summary').click()
 check(page.locator('#atlasGoogleMapsLink').get_attribute('href')==site['google_maps_url'],'correct canonical Maps URL')
 check(page.locator('#atlasGoogleMapsLink').get_attribute('target')=='_blank','external URL opens new tab')
 check(page.locator('#atlasGoogleMapsLink').get_attribute('rel')=='noopener noreferrer','external URL isolated from origin')
 check(page.locator('#atlasGoogleEarthLink').get_attribute('href')==site['google_earth_direct_url'],'experimental Earth URL follows canonical registry')
 check(page.locator('#atlasGoogleEarthUnavailable').is_visible(),'experimental Earth safety caveat shown')
 check('۳۶۰' in page.locator('.atlas-external-maps-info').inner_text(),'honest 3D disclaimer')
 page.evaluate('''record=>window.RaspehrExternalMaps.select(record)''',row(recover,'محل فرود نمونه'))
 check(not page.locator('#atlasExternalMaps').get_attribute('open'),'selection reset collapses menu')
 page.locator('#atlasExternalMaps summary').click()
 check('فرود' in page.locator('#atlasExternalMapsPrecision').inner_text(),'recovery has area warning')
 check(page.locator('#atlasGoogleMapsLink').get_attribute('href')==recover['google_maps_url'],'recovery URL updates')
 page.evaluate('''record=>window.RaspehrExternalMaps.select(record)''',{**row(company,'ناسا'), 'lat':company['lat']+0.5})
 check(page.locator('#atlasGoogleMapsLink').is_hidden(),'coordinate mismatch blocks link')
 check('غیرفعال' in page.locator('#atlasExternalMapsStatus').text_content(),'coordinate mismatch explained')
 page.evaluate('window.RaspehrExternalMaps.select(null)')
 check(page.locator('#atlasExternalMaps').is_hidden(),'selection clear removes external menu')
 # Mobile: the same actual aside moves into a sheet; links must survive.
 page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(160)
 page.evaluate('''record=>{
  document.getElementById('selectedLocationCard').hidden=false;
  document.getElementById('selectedLocationTitle').textContent=record.fa;
  window.RaspehrExternalMaps.select(record);
  window.RaspehrMobileSheet.setTab('place',{snap:'half'});
 }''',row(company,'ناسا'))
 page.wait_for_function("window.RaspehrExternalMaps.getState().loaded === true")
 check(page.locator('#selectedLocationCard').evaluate('el=>el.parentElement.id')=='mobileSelectedSlot','same card moved to mobile sheet')
 page.locator('#atlasExternalMaps summary').click(force=True)
 page.wait_for_timeout(120)
 check(page.evaluate("window.RaspehrMobileSheet.getState().snap")=='full','explicit external menu opens full mobile sheet')
 check(page.locator('#atlasGoogleMapsLink').get_attribute('href')==company['google_maps_url'],'mobile correct Google Maps URL')
 page.screenshot(path='/mnt/data/raspehr_google_stage3_mobile_preview.png',full_page=False)
 page.set_viewport_size({'width':1280,'height':900});page.wait_for_timeout(180)
 check(page.locator('#selectedLocationCard').evaluate('el=>el.parentElement.id')!='mobileSelectedSlot','desktop returns card to globe')
 page.screenshot(path='/mnt/data/raspehr_google_stage3_desktop_preview.png',full_page=False)
 check(errors==[], 'no browser JS errors: '+str(errors[:4]))
 page.close()
 # Dedicated test for a verified Earth URL, without modifying real registry
 verified=json.loads(json.dumps(registry))
 r=next(x for x in verified['records'] if x['id']=='nasa' and x['kind']=='company')
 r['google_earth_share_url']='https://earth.google.com/web/search/NASA/';r['google_earth_status']='verified';r['google_earth_live_checked']=True
 page=browser.new_page()
 page.set_content(html)
 page.evaluate('''data=>{window.fetch=async()=>({ok:true,json:async()=>data});}''',verified)
 page.add_script_tag(content=(root/'assets/js/external-map-links-v1.js').read_text())
 page.evaluate('''record=>{document.getElementById('selectedLocationCard').hidden=false;window.RaspehrExternalMaps.select(record);}''',row(company,'ناسا'))
 page.wait_for_function('window.RaspehrExternalMaps.getState().loaded===true')
 page.locator('#atlasExternalMaps summary').click()
 check(page.locator('#atlasGoogleEarthLink').get_attribute('href')=='https://earth.google.com/web/search/NASA/','verified Earth link activates')
 check(page.locator('#atlasGoogleEarthUnavailable').is_hidden(),'verified Earth link hides placeholder')
 page.close()
 # Failure to load registry does not crash globe UI or fake links
 page=browser.new_page();page.set_content(html)
 page.evaluate('''() => {window.fetch=async()=>{throw new Error("network down")};return true;}''')
 page.add_script_tag(content=(root/'assets/js/external-map-links-v1.js').read_text())
 page.evaluate('''record=>{document.getElementById('selectedLocationCard').hidden=false;window.RaspehrExternalMaps.select(record)}''',row(company,'ناسا'))
 page.wait_for_function("window.RaspehrExternalMaps.getState().error.length>0")
 check(page.locator('#atlasGoogleMapsLink').is_hidden(),'failed load never shows guessed links')
 check('در دسترس نیست' in page.locator('#atlasExternalMapsStatus').text_content(),'failed load reports graceful fallback')
 page.close();browser.close()
print('BROWSER UI PASSED',len(passed))
for x in passed:print('PASS',x)
