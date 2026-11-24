from pathlib import Path
from playwright.sync_api import sync_playwright
import re,json,datetime
root=Path(__file__).resolve().parents[2]
html=(root/'index.html').read_text('utf8')
html=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.S|re.I)
html=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>','',html,flags=re.I)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=browser.new_page(viewport={'width':700,'height':900})
 errors=[]
 page.on('pageerror',lambda x:errors.append(str(x)))
 page.set_content(html, wait_until='domcontentloaded',timeout=30000)
 # Styles and profile flag (source inline script normally detects same-origin iframe).
 page.add_style_tag(content=(root/'assets/css/app.css').read_text('utf8'))
 page.add_style_tag(content=(root/'assets/css/media-gallery.css').read_text('utf8'))
 page.add_style_tag(content=(root/'assets/css/raspehr-profile-host.css').read_text('utf8'))
 page.evaluate('''()=>{window.ORBITA_V='1';window.ORBITA_PROFILE_EMBEDDED=true;window.RASPEHR_PROFILE_EMBEDDED=true;Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}});document.documentElement.classList.add('raspehr-profile-host');}''')
 def loadfile(name):
  k=name.split('?')[0].split('#')[0]
  if k.startswith('data/') and (root/k).is_file():return json.loads((root/k).read_text('utf8'))
  raise ValueError('unavailable:'+k)
 page.expose_function('readRaspehrJson',loadfile)
 page.evaluate('''()=>{window.fetch=async u=>{const url=String(u);if(!url.startsWith('data/'))throw Error('offline');try{const obj=await window.readRaspehrJson(url);return{ok:true,status:200,json:async()=>obj};}catch(e){return{ok:false,status:404,json:async()=>null};}}}''')
 # MapLibre not instantiated in profile-only mode; none of these dependencies are needed.
 for path in ['assets/js/app.js','assets/js/media-bank.js','assets/js/media-gallery.js']:
  page.add_script_tag(content=(root/path).read_text('utf8'))
 print('BOOT STATUS',page.evaluate('''()=>({hasOpen:typeof window.openDetail,hasRetry:typeof window.retryLayer,embed:window.RASPEHR_PROFILE_EMBEDDED})'''),'ERRORS',errors[:12],flush=True)
 page.wait_for_function('()=>typeof window.openDetail==="function" && typeof window.retryLayer==="function"',timeout=30000)
 assert page.locator('#map canvas').count()==0
 print('APP LOADED NO MAP; errors:',errors[:3])
 tests=[]
 for kind,layer,id_,cat in [('company','agency','nasa','agency'),('site','sites','ksc39a','site'),('recovery','recoveries',None,'recovery')]:
  info=page.evaluate('''async cfg=>{const ok=await window.retryLayer(cfg.layer);if(!ok)throw Error('failed layer '+cfg.layer);const rows=cfg.kind==='company'?window.DATA.companies:cfg.kind==='site'?window.DATA.sites:window.DATA.recoveries;const row=cfg.id ? rows.find(x=>x.id===cfg.id):rows[0];if(!row)throw Error('missing record');window.openDetail({kind:cfg.kind,cat:cfg.cat,o:row}); return {id:row.id,fa:row.fa,rows:rows.length};}''',{'kind':kind,'layer':layer,'id':id_,'cat':cat})
  page.wait_for_selector('#detail.open',timeout=15000)
  heading=page.locator('#detail .d-title').first.inner_text() if page.locator('#detail .d-title').count()>0 else '<none>'
  tabs=page.locator('#detail .site-tab-btn').count()
  print(kind,info['id'],'=>',heading,'tabs',tabs,'mediaDOM',page.locator('#detail .orbita-media-section').count())
  assert heading and heading!='<none>',kind
  if kind=='site':assert tabs>=3,'site profile tabs missing'
  page.wait_for_timeout(100)
  assert page.locator('#detail .orbita-media-section').count()==1, 'stage4 must reuse canonical media gallery: '+kind
  print('GALLERY',kind,page.evaluate('window.ORBITA_MEDIA_GALLERY.getState()'))
  if kind=='recovery':assert page.locator('#detail [data-recovery-tab]').count()>=3,'recovery profile tabs missing'
  tests.append(kind)
 page.evaluate('''()=>window.openDetail({kind:'country',cat:'country',country_en:'United States',country_fa:'ایالات متحده'})''')
 page.wait_for_selector('#detail .country-profile-head',timeout=15000)
 page.wait_for_timeout(850)
 print('country',page.locator('#detail .d-title').first.inner_text(),'tabs',page.locator('#detail .country-profile-tab').count())
 print('JS errors',errors[:12])
 assert not errors,errors
 browser.close()
print('STAGE4 DOM RENDERER TEST PASS')
