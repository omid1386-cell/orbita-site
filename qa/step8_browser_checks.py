"""Isolated Chromium cross-panel integration regression against complete ORBITA HTML/CSS.
Uses in-memory synthetic test responses. Does not claim a live MapLibre or API test.
"""
from pathlib import Path
import json, re
from datetime import datetime, timezone, timedelta
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
soup=BeautifulSoup((ROOT/'index.html').read_text(), 'html.parser')
for tag in soup.select('script, link[rel=stylesheet], link[rel=preconnect], link[rel=preload]'):
 tag.decompose()
html=str(soup)
now=datetime.now(timezone.utc)
def iso(days): return (now+timedelta(days=days)).strftime('%Y-%m-%dT%H:%M:%SZ')
def date(days): return (now+timedelta(days=days)).strftime('%Y-%m-%d')
fixture={
 'data/country_codes.json':json.loads((ROOT/'data/country_codes.json').read_text()),
 'data/upcoming_global.json':{'schema_version':1,'coverage_status':'complete_from_source_at_fetch_time','updated_utc':iso(-0.04),'horizon_days':120,'count':5,'launches':[
 {'ll2_id':'A','launch_name':'CHINA NEAR','net':iso(5),'net_precision':'Minute','status':'go','operator_country_code':'CHN','launch_country_code':'USA'},
 {'ll2_id':'B','launch_name':'USA NEAR','net':iso(10),'net_precision':'Day','status':'tbc','operator_country_code':'USA','launch_country_code':'USA'},
 {'ll2_id':'C','launch_name':'CHINA LATER','net':iso(25),'net_precision':'Month','status':'tbd','operator_country_code':'CHN','launch_country_code':'CHN'},
 {'ll2_id':'D','launch_name':'INDIA FAR','net':iso(90),'net_precision':'Day','status':'tbc','operator_country_code':'IND','launch_country_code':'IND'},
 {'ll2_id':'E','launch_name':'UNKNOWN','net':iso(12),'net_precision':'Day','status':'planned','operator_country_code':None,'launch_country_code':None},
 ]},
 'data/upcoming_global_landings.json':{'schema_version':1,'coverage_status':'partial_source_coverage','updated_utc':iso(-0.04),'horizon_days':120,'count':3,'landings':[
 {'event_kind':'landing','event_id':'L1','mission_name':'CHINA RECOVERY','date_utc':date(5),'date_basis':'associated_launch_date_not_landing_time','status':'planned','operator_country_code':'CHN','recovery_country_code':'CHN'},
 {'event_kind':'landing','event_id':'L2','mission_name':'USA RECOVERY','date_utc':date(25),'date_basis':'spacecraft_mission_end_estimate','status':'planned','operator_country_code':'USA','recovery_country_code':None},
 {'event_kind':'landing','event_id':'L3','mission_name':'INDIA RECOVERY','date_utc':date(90),'date_basis':'curated_schedule_date_unverified','status':'planned','operator_country_code':'IND','recovery_country_code':'IND'}
 ]}}
mock_js='''window.__testLang="fa"; Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:function(k){return k==="orbita_lang"?window.__testLang:null},setItem:function(k,v){if(k==="orbita_lang")window.__testLang=v}}}); window.__testBroken={};const FIXTURE=REPLACE; window.__qaFixture=FIXTURE; window.fetch=function(url){let k=String(url).split('?')[0];if(window.__testBroken[k])return Promise.reject(new Error('simulate network failure')); if(!FIXTURE[k])return Promise.reject(new Error('not in in-memory synthetic fixture: '+k));return Promise.resolve({ok:true,json:()=>Promise.resolve(JSON.parse(JSON.stringify(FIXTURE[k])))})};'''.replace('REPLACE',json.dumps(fixture,ensure_ascii=False))
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width,height in [(1440,900),(390,844)]:
  pg=browser.new_page(viewport={'width':width,'height':height})
  errs=[]
  pg.on('pageerror',lambda e: errs.append(str(e)))
  pg.set_content(html)
  for css in ('assets/css/app.css','assets/css/launch-mission-ui.css','assets/css/upcoming-event-display.css'):
   pg.add_style_tag(content=(ROOT/css).read_text())
  pg.evaluate('(function(){'+mock_js+'})()')
  for js in ('assets/js/upcoming-launch-filters.js','assets/js/upcoming-event-display.js','assets/js/upcoming-launch-browser.js','assets/js/upcoming-landing-browser.js'):
   pg.add_script_tag(content=(ROOT/js).read_text())
  # Hide splash overlay, whose actual runtime is deliberately not loaded.
  pg.evaluate('document.getElementById("raspehrSplash")?.remove()')
  pg.locator('#upcomingLaunchesBtn').click(force=True)
  pg.locator('#globalLaunchResults .global-launch-card').first.wait_for(timeout=6000)
  assert pg.locator('#globalLaunchResults .global-launch-card').count()==4
  pg.locator('#globalLaunchDialog [data-quick-country="CHN"]').click(force=True)
  pg.locator('#globalLaunchDialog [data-quick-country="USA"]').click(force=True)
  assert pg.locator('#globalLaunchResults .global-launch-card').count()==3
  pg.locator('#globalLaunchDialog [data-days="7"]').click(force=True)
  assert pg.locator('#globalLaunchResults .global-launch-card').count()==1
  pg.locator('#globalLaunchDialog [data-days="120"]').click(force=True)
  assert pg.locator('#globalLaunchResults .global-launch-card').count()==3
  pg.locator('#globalLaunchCountryBasis').select_option('site')
  assert pg.locator('#globalLaunchResults .global-launch-card').count()==3
  pg.locator('#globalLaunchCountryBasis').select_option('operator')
  pg.locator('#globalLaunchReload').click(force=True)
  assert pg.locator('#globalLaunchResults .global-launch-card').count()==3
  pg.evaluate('window.__testBroken["data/upcoming_global.json"]=true')
  pg.locator('#globalLaunchReload').click(force=True)
  pg.wait_for_timeout(100)
  assert pg.locator('#globalLaunchResults .global-launch-card').count()==3, 'last good snapshot not retained'
  pg.evaluate('window.__testBroken["data/upcoming_global.json"]=false;window.__qaFixture["data/upcoming_global.json"].updated_utc=null')
  pg.locator('#globalLaunchReload').click(force=True)
  pg.wait_for_timeout(70)
  assert 'نخستین' in pg.locator('#globalLaunchFeedState').inner_text(), 'missing update timestamp falsely marked fresh'
  pg.evaluate('window.__qaFixture["data/upcoming_global.json"].updated_utc="2099-01-01T00:00:00Z"')
  pg.locator('#globalLaunchReload').click(force=True)
  pg.wait_for_timeout(70)
  assert 'نامعتبر' in pg.locator('#globalLaunchFeedState').inner_text(), 'future timestamp falsely marked fresh'
  pg.evaluate('window.__qaFixture["data/upcoming_global.json"].updated_utc = ' + json.dumps(iso(-0.04)))
  pg.locator('#globalLaunchReload').click(force=True)
  pg.evaluate('window.__testLang="en"')
  pg.locator('#langBtn').dispatch_event('click')
  pg.wait_for_timeout(100)
  assert 'launch' in pg.locator('#globalLaunchResultCount').inner_text().lower()
  pg.locator('#globalLaunchClose').click(force=True)
  pg.locator('#upcomingLandingsBtn').click(force=True)
  pg.locator('#globalLandingResults .global-launch-card').first.wait_for(timeout=6000)
  assert pg.locator('#globalLandingResults .global-launch-card').count()==2
  pg.locator('#globalLandingDialog [data-days="120"]').click(force=True)
  assert pg.locator('#globalLandingResults .global-launch-card').count()==3
  pg.locator('#globalLandingCountryOptions [data-country-code="CHN"]').click(force=True)
  assert pg.locator('#globalLandingResults .global-launch-card').count()==1
  pg.locator('#globalLandingCountryBasis').select_option('site')
  assert pg.locator('#globalLandingResults .global-launch-card').count()==1
  pg.evaluate('window.__qaFixture["data/upcoming_global_landings.json"].updated_utc=null')
  pg.locator('#globalLandingReload').click(force=True)
  pg.wait_for_timeout(50)
  assert 'Awaiting first update' in pg.locator('#globalLandingFeedState').inner_text(), 'missing landing timestamp falsely marked fresh'
  pg.locator('#globalLandingClose').click(force=True)
  assert not pg.locator('#globalLaunchDialog').evaluate('(x)=>x.open')
  assert not pg.locator('#globalLandingDialog').evaluate('(x)=>x.open')
  if width==390:
   assert pg.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'), 'horizontal overflow'
  assert not errs,errs
  print('PASS',width,'full ORBITA DOM: 2 modals, cross-panel launch/landing, filters, 120d, basis, refresh failure, i18n, no JS error')
  pg.close()
 browser.close()
