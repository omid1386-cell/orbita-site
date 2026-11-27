# Stage 4 QA: 15-place structural checks and simulated external-tab roundtrip.
# NOT live Google imagery/Street View or physical device verification.
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, re, urllib.parse
root=Path(__file__).resolve().parents[1]
registry=json.loads((root/'data/external-links-v1.json').read_text(encoding='utf-8'))
pilot=json.loads((root/'qa/RASPEHR_GOOGLE_STAGE4_PILOT_15.json').read_text(encoding='utf-8'))['records']
map_by_key={(r['kind'],r['id']):r for r in registry['records']}
assert len(pilot)==15
for r in pilot:
 rec=map_by_key[(r['kind'],r['id'])]
 assert r['google_maps_url']==rec['google_maps_url']
 u=urllib.parse.urlsplit(rec['google_maps_url'])
 q=urllib.parse.parse_qs(u.query)
 assert u.scheme=='https' and u.netloc=='www.google.com' and u.path=='/maps/search/'
 assert q['api']==['1'] and q['query']==[str(r['lat'])+','+str(r['lon'])]
 assert not r['google_earth_share_url'] and r['maps_live_status']=='not_tested'
print('PASS 15 canonical Maps URL format checks (not live Google)')
html=(root/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
html=re.sub(r'<link\s+rel="stylesheet"[^>]*>','',html)
css='\n'.join((root/f).read_text(encoding='utf-8') for f in (
 'assets/css/prototype.css','assets/css/atlas-panel-v2.css','assets/css/place-journey-v4.css',
 'assets/css/external-map-links-v1.css'))
html=html.replace('</head>','<style>'+css+'\n[hidden]{display:none!important}</style></head>')
n=0
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
   args=['--no-sandbox','--disable-dev-shm-usage','--no-proxy-server'])
 for mobile in (False,True):
  page=browser.new_page(viewport={'width':390 if mobile else 1280,'height':844 if mobile else 900},is_mobile=mobile,has_touch=mobile)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html)
  page.evaluate('''data => {window.fetch=async()=>({ok:true,json:async()=>data})}''',registry)
  page.add_script_tag(content=(root/'assets/js/mobile-bottom-sheet.js').read_text(encoding='utf-8'))
  page.add_script_tag(content=(root/'assets/js/external-map-links-v1.js').read_text(encoding='utf-8'))
  for r in (pilot[0],pilot[7],pilot[-1]):
   row={'id':r['id'],'kind':r['kind'],'lat':r['lat'],'lon':r['lon'],'fa':r['name_fa']}
   page.evaluate('''row=>{
     document.getElementById('selectedLocationCard').hidden=false;
     document.getElementById('selectedLocationTitle').textContent=row.fa;
     window.RaspehrExternalMaps.select(row);
     if(window.RaspehrMobileSheet&&window.RaspehrMobileSheet.getState().enabled)
       window.RaspehrMobileSheet.setTab('place',{snap:'half'});
     }''',row)
   page.wait_for_function('window.RaspehrExternalMaps.getState().loaded===true')
   page.locator('#atlasExternalMaps summary').click(force=True)
   assert page.locator('#atlasGoogleMapsLink').get_attribute('href')==r['google_maps_url']
   assert page.locator('#atlasGoogleMapsLink').get_attribute('target')=='_blank'
   assert set(page.locator('#atlasGoogleMapsLink').get_attribute('rel').split())>=set(('noopener','noreferrer'))
   current=map_by_key[(r['kind'],r['id'])]
   assert page.locator('#atlasGoogleEarthLink').get_attribute('href')==current['google_earth_direct_url']
   page.locator('#atlasGoogleMapsLink').evaluate("(el)=>el.href='about:blank'")
   with page.expect_popup(timeout=5000) as pi:
    page.locator('#atlasGoogleMapsLink').click(force=True)
   popup=pi.value
   popup.wait_for_load_state('domcontentloaded')
   assert popup.url=='about:blank'
   popup.close()
   page.bring_to_front()
   assert page.locator('#selectedLocationTitle').text_content()==r['name_fa']
   assert page.evaluate("window.RaspehrExternalMaps.getState().activeKey")==r['kind']+':'+r['id']
   assert page.locator('#atlasExternalMaps').get_attribute('open') is not None
   if mobile:
    assert page.evaluate('window.RaspehrMobileSheet.getState().tab')=='place'
   n+=1
  assert not errors,errors
  page.close()
 page=browser.new_page(viewport={'width':1000,'height':800},accept_downloads=True)
 page.set_content((root/'qa/RASPEHR_GOOGLE_STAGE4_MANUAL_QA.html').read_text(encoding='utf-8'))
 assert page.locator('.card').count()==15
 page.locator('.card').first.locator('summary').click()
 page.locator('.card').first.locator('[data-field="maps"]').select_option('opened_correct')
 assert page.locator('#statMaps').text_content()=='1'
 with page.expect_download(timeout=5000) as download:
  page.locator('#exportJSON').click()
 assert download.value.suggested_filename=='RASPEHR_STAGE4_MANUAL_RESULTS.json'
 page.close()
 browser.close()
print('PASS simulated external tab return, desktop+mobile 3 places each:',n)
print('PASS standalone 15-place manual QA page and JSON export')
print('NOTE: no real Google app, Street View, WebGL, device or Iran network access tested')
