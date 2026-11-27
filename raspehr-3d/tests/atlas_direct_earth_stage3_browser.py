"""V16 direct Earth integration smoke with mocked app and new-tab fixture, NOT live Google Earth."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re
app=Path(__file__).resolve().parent.parent
html=(app/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
html=re.sub(r'<link\s+rel="stylesheet"[^>]*>','',html)
css='\n'.join((app/f).read_text(encoding='utf-8') for f in [
  'assets/css/prototype.css','assets/css/priority5-visual.css','assets/css/atlas-panel-v2.css',
  'assets/css/place-journey-v4.css','assets/css/mobile-bottom-sheet.css',
  'assets/css/external-map-links-v1.css'] if (app/f).exists())
html=html.replace('</head>','<style>'+css+'\n[hidden]{display:none!important}</style></head>')
registry=json.loads((app/'data/external-links-v1.json').read_text(encoding='utf-8'))
by={(r['kind'],r['id']):r for r in registry['records']}
pilot=by[('site','starbase')]
company=next(r for r in registry['records'] if r['kind']=='company' and r['google_earth_direct_status']=='generated_pattern_unverified')
recovery=next(r for r in registry['records'] if r['kind']=='recovery' and r['google_earth_direct_status']=='generated_pattern_unverified')
checks=[]
def check(cond,name):assert cond,name;checks.append(name)
def row(r):return dict(id=r['id'],kind=r['kind'],lat=r['lat'],lon=r['lon'],fa=r['id'],category=r['kind'])
def setup(page,data,with_mobile=True):
 page.set_content(html)
 page.evaluate('''data=>{window.fetch=async()=>({ok:true,json:async()=>data});}''',data)
 if with_mobile:page.add_script_tag(content=(app/'assets/js/mobile-bottom-sheet.js').read_text(encoding='utf-8'))
 page.add_script_tag(content=(app/'assets/js/external-map-links-v1.js').read_text(encoding='utf-8'))
def select(page,r):
 page.evaluate('''record=>{
  document.getElementById('selectedLocationCard').hidden=false;
  window.RaspehrExternalMaps.select(record);
 }''',row(r))
 page.wait_for_function('window.RaspehrExternalMaps.getState().loaded===true')
 page.locator('#atlasExternalMaps summary').click(force=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1280,'height':900},accept_downloads=True)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 setup(page,registry)
 check(page.locator('#atlasExternalMaps').is_hidden(),'external menu hidden until selection')
 select(page,pilot)
 link=page.locator('#atlasGoogleEarthLink')
 check(link.is_visible(),'direct Earth link rendered for pilot')
 check(link.get_attribute('href')==pilot['google_earth_direct_url'],'pilot exact canonical href')
 check(link.get_attribute('target')=='_blank' and link.get_attribute('rel')=='noopener noreferrer','secure external target')
 check('آزمایشی' in page.locator('#atlasGoogleEarthLinkLabel').inner_text(),'experimental label rather than verified')
 check('پنج لینک' in page.locator('#atlasGoogleEarthUnavailable').inner_text(),'five pilot caveat')
 check('پایلوت' in page.locator('#atlasExternalMapsStatus').inner_text(),'pilot-specific user confirmation')
 check(page.locator('#atlasGoogleMapsLink').get_attribute('href')==pilot['google_maps_url'],'Maps original URL unchanged')
 check(page.locator('#atlasGoogleSatelliteLink').get_attribute('href')==pilot['google_maps_satellite_url'],'satellite original URL unchanged')
 page.screenshot(path='/mnt/data/RASPEHR_DIRECT_EARTH_STAGE3_V16_DESKTOP_MOCK.png')
 select(page,company)
 check(link.get_attribute('href')==company['google_earth_direct_url'],'new company candidate maps to own coordinates')
 check('به‌طور مستقل بررسی نشده' in page.locator('#atlasExternalMapsStatus').inner_text(),'unreviewed company is labelled unverified')
 select(page,recovery)
 check(link.get_attribute('href')==recovery['google_earth_direct_url'],'recovery link maps to recovery coords')
 check('فرود' in page.locator('#atlasExternalMapsPrecision').inner_text(),'recovery uncertainty carried over')
 link.evaluate('(el)=>el.href="about:blank"')
 with page.expect_popup(timeout=6000) as popup_event:link.click(force=True)
 popup=popup_event.value;popup.wait_for_load_state('domcontentloaded')
 check(popup.url=='about:blank','external tab opening simulated')
 popup.close();page.bring_to_front()
 check(page.evaluate('window.RaspehrExternalMaps.getState().activeKey')=='recovery:'+recovery['id'],'app remains on selected recovery after popup')
 page.evaluate('''rec=>window.RaspehrExternalMaps.select({...rec,lat:rec.lat+1})''',row(company))
 check(link.is_hidden(),'coordinate mismatch blocks direct Earth candidate')
 check(page.locator('#atlasGoogleMapsLink').is_hidden(),'coordinate mismatch also blocks Maps')
 page.evaluate('window.RaspehrExternalMaps.select(null)')
 check(page.locator('#atlasExternalMaps').is_hidden(),'no link after clearing selected location')
 page.set_viewport_size({'width':390,'height':844})
 select(page,company)
 page.evaluate('''()=>window.RaspehrMobileSheet.setTab('place',{snap:'half'})''')
 # The explicit opening motion should expand the sheet; the same links must persist.
 page.locator('#atlasExternalMaps').evaluate('el=>{el.open=false}')
 page.locator('#atlasExternalMaps summary').click(force=True)
 page.wait_for_timeout(100)
 check(page.locator('#atlasGoogleEarthLink').get_attribute('href')==company['google_earth_direct_url'],'mobile Earth link remains canonical')
 check(page.locator('#selectedLocationCard').evaluate('el=>el.parentElement.id')=='mobileSelectedSlot','mobile sheet contains real selected card')
 page.screenshot(path='/mnt/data/RASPEHR_DIRECT_EARTH_STAGE3_V16_MOBILE_MOCK.png')
 check(errors==[],'no javascript runtime errors')
 page.close()
 # A verified share link from a future review must override candidate URL.
 data=json.loads(json.dumps(registry)); rec=next(r for r in data['records'] if r['id']==company['id'] and r['kind']=='company')
 rec.update(google_earth_share_url='https://earth.google.com/web/search/Rocket/',google_earth_live_checked=True,google_earth_status='verified')
 page=browser.new_page();setup(page,data,False);select(page,company)
 check(page.locator('#atlasGoogleEarthLink').get_attribute('href')==rec['google_earth_share_url'],'verified share URL overrides direct candidate')
 check(page.locator('#atlasGoogleEarthUnavailable').is_hidden(),'verified share hides experimental warning')
 page.close()
 # Tampered candidate should not be shown, and should not break Maps.
 data=json.loads(json.dumps(registry));rec=next(r for r in data['records'] if r['id']==company['id'] and r['kind']=='company')
 rec['google_earth_direct_url']='https://earth.google.com.evil.example/web/@1,2,0a,2500d,35y,0h,45t,0r'
 page=browser.new_page();setup(page,data,False);select(page,company)
 check(page.locator('#atlasGoogleEarthLink').is_hidden(),'tampered Earth URL rejected')
 check(page.locator('#atlasGoogleMapsLink').is_visible(),'Maps unaffected by tampered Earth URL')
 page.close()
 browser.close()
print('V16 DIRECT EARTH MOCK BROWSER',len(checks),'PASS')
for x in checks:print('PASS',x)
print('NOTE: Google Earth web/app was not contacted; 3D imagery coverage not checked.')
