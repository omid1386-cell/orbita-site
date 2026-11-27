#!/usr/bin/env python3
"""V23 launch-card visibility regression: real app dialog/styles/renderer, offline data.

Requires Playwright+Chromium; no production network, API, or Github access.
Checks computed geometry and scrolling; mere DOM presence is NOT sufficient.
"""
from pathlib import Path
import json
import sys
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
soup = BeautifulSoup((ROOT/'index.html').read_text(encoding='utf-8'), 'html.parser')
for node in list(soup.select('script,link,iframe')):
    node.decompose()
for img in soup.select('img'):
    img.attrs.pop('src', None)
HTML = str(soup)
CSS = '\n'.join((ROOT/file).read_text(encoding='utf-8') for file in [
    'assets/css/app.css',
    'assets/css/launch-mission-ui.css',
    'assets/css/upcoming-event-display.css',
    'assets/css/raspehr-event-parity-v21.css',
    'assets/css/raspehr-stage5-switch.css',
]) + '\n#raspehrSplash{display:none!important}\n'
LAUNCH = json.loads((ROOT/'data/upcoming_global.json').read_text(encoding='utf-8'))
LANDING = json.loads((ROOT/'data/upcoming_global_landings.json').read_text(encoding='utf-8'))
COUNTRIES = json.loads((ROOT/'data/country_codes.json').read_text(encoding='utf-8'))
JS_FILES=[
    'assets/js/upcoming-launch-filters.js',
    'assets/js/upcoming-event-display.js',
    'assets/js/upcoming-launch-browser.js',
    'assets/js/upcoming-landing-browser.js',
]
SIZES = [('short_laptop', 1280, 558), ('laptop', 1366, 768), ('desktop', 1440, 900),
         ('tablet', 820, 680), ('mobile', 390, 844), ('narrow_mobile', 320, 720)]

FIXED_TIME = '2026-11-27T07:55:00Z'
METRICS_JS = r'''() => {
 const root=document.querySelector('#globalLaunchDialog');
 const list=document.querySelector('#globalLaunchResults');
 const cards=[...list.querySelectorAll('.global-launch-card')];
 const first=cards[0];
 const ls=(el)=>el ? el.getBoundingClientRect() : null;
 const cardRect=ls(first), listRect=ls(list);
 const names=['.launch-mission-card-index','.global-launch-card-title strong',
    '.global-launch-card-date bdi','.global-launch-card-fields',
    '.global-launch-card-meta','.global-launch-card-countries'];
 let parts=[];
 for(let sel of names){
  const el=first?.querySelector(sel);const r=ls(el);
  parts.push({sel, exists:!!el, text:(el?.textContent||'').trim().slice(0,105),
    display:el&&getComputedStyle(el).display, height:r?.height||0,
    top:r?.top||0, bottom:r?.bottom||0,
    withinCard:!!(r&&cardRect&&r.bottom<=cardRect.bottom+2 && r.top>=cardRect.top-2)});
 }
 return {
  count:cards.length, cardHeight:cardRect?.height||0,
  firstTitle:parts[1]?.text, parts, listHeight:listRect?.height||0,
  clientHeight:list?.clientHeight, scrollHeight:list?.scrollHeight,
  overflowY:getComputedStyle(list).overflowY, flex:getComputedStyle(first).flex,
  cardBottom:cardRect?.bottom||0, listBottom:listRect?.bottom||0,
  landingCount:document.querySelectorAll('#globalLandingResults .global-launch-card').length,
 };
}'''

def setup_page(browser,width,height):
    page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
    page.set_content(HTML,wait_until='domcontentloaded')
    page.add_style_tag(content=CSS)
    page.evaluate('''({launch,landing,countries,fixed}) => {
      const RealDate=Date; const fixedMs=new RealDate(fixed).getTime();
      function FrozenDate(...args){ return args.length?new RealDate(...args):new RealDate(fixedMs); }
      FrozenDate.prototype=RealDate.prototype; FrozenDate.now=()=>fixedMs;
      FrozenDate.parse=RealDate.parse;FrozenDate.UTC=RealDate.UTC; window.Date=FrozenDate;
      window.fetch = (url)=> { const str=String(url);
        const d=str.includes('upcoming_global.json')?launch:
          str.includes('upcoming_global_landings.json')?landing:countries;
        return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(d)});
      };
      window.ORBITA_UPCOMING_GLOBAL_V='QA';
      window.ORBITA_UPCOMING_LANDINGS_V='QA'; window.ORBITA_V='QA';
    }''',{'launch':LAUNCH,'landing':LANDING,'countries':COUNTRIES,'fixed':FIXED_TIME})
    for script in JS_FILES:
        page.add_script_tag(content=(ROOT/script).read_text(encoding='utf-8'))
    return page


def run(strict=True):
  assert LAUNCH.get('launches') or LAUNCH.get('items') or LAUNCH.get('events'), 'Unexpected launch JSON schema'
  errors=[]; measurements=[]; checks=0
  with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for label,w,h in SIZES:
      page=setup_page(browser,w,h)
      # Use the actual desktop or mobile launcher, from same production script.
      button=page.locator('#upcomingLaunchesBtn' if w<=760 else '#upcomingLaunchesDesktopBtn')
      try:
        assert button.is_visible(), f'{label}: launch trigger missing'
        button.click(timeout=5000)
        page.wait_for_function("document.querySelectorAll('#globalLaunchResults .global-launch-card').length >= 2",polling=100,timeout=12000)
        m=page.evaluate(METRICS_JS)
        measurements.append((label,m))
        assert m['count']>=2, f'{label}: no launch rows'
        checks+=1
        # Count tests AND visible semantic fields (not just markup).
        for pt in m['parts']:
          assert pt['exists'] and pt['height']>0, f'{label}: missing or hidden {pt}'
          assert pt['text'], f'{label}: empty field {pt["sel"]}'
          assert pt['withinCard'], f'{label}: text clipped by shrinking card: {pt}'
          checks+=1
        assert m['cardHeight']>150, f'{label}: card collapsed to {m["cardHeight"]}px'
        checks+=1
        # Capture the default 30-day view at top scroll; it is the user's actual entry experience.
        if label in ('short_laptop','laptop','mobile'):
          page.locator('#globalLaunchResults').evaluate('(e)=>{e.scrollTop=0}')
          page.screenshot(path=str(Path('/mnt/data')/f'RASPEHR_V23_LAUNCH_{label.upper()}_PREVIEW.png'),full_page=False)
          checks+=1
        if w>760:
          assert m['scrollHeight']>m['clientHeight']+30, f'{label}: should scroll many rows'
          assert m['overflowY'] in ('auto','scroll'), f'{label}: list not scrollable'
          # Scroll to last result and verify complete card doesn't collapse.
          page.locator('#globalLaunchResults').evaluate('(e)=>{e.scrollTop=e.scrollHeight}')
          last=page.locator('#globalLaunchResults .global-launch-card').last
          assert last.count()==1 and last.evaluate('(e)=>e.getBoundingClientRect().height')>150
          checks+=3
        # Filter changes actually regenerate cards without clipping.
        page.locator('#globalLaunchPeriods button[data-days="120"]').click()
        page.wait_for_timeout(70)
        m2=page.evaluate(METRICS_JS)
        assert m2['count']>=m['count'], f'{label}: 120d filter unexpectedly fewer'
        assert all(x['withinCard'] for x in m2['parts']), f'{label}: clipping after 120d filter'
        # Verify every flight in the expanded list, not only the first flight.
        all_cards=page.evaluate('''() => [...document.querySelectorAll('#globalLaunchResults .global-launch-card')].map((el,i)=>{
          const cr=el.getBoundingClientRect();
          const fields=['.global-launch-card-title strong','.global-launch-card-date bdi',
            '.global-launch-card-fields','.global-launch-card-meta','.global-launch-card-countries'];
          const good=fields.every(selector=>{
            const e=el.querySelector(selector);if(!e)return false;
            const r=e.getBoundingClientRect();
            return !!e.textContent.trim()&&r.height>0&&r.bottom<=cr.bottom+2&&r.top>=cr.top-2;
          });
          return {i:i+1, height:cr.height, good};
        })''')
        assert len(all_cards)>=60, f'{label}: expected all upcoming missions in expanded window, got {len(all_cards)}'
        assert all(x['good'] and x['height']>145 for x in all_cards), f'{label}: expanded flight detail clipped'
        checks+=3
        page.locator('#globalLaunchClose').click()
        assert not page.locator('#globalLaunchDialog').evaluate('(e)=>e.open')
        checks+=1
        # Landing dialog still renders, and no change to its structure/behavior.
        page.locator('#upcomingLandingsBtn').click()
        page.wait_for_function("document.querySelectorAll('#globalLandingResults .global-launch-card').length>0",polling=100,timeout=12000)
        landingCards=page.locator('#globalLandingResults .global-launch-card').count()
        assert landingCards>0
        page.locator('#globalLandingClose').click()
        checks+=2
        print(f'{label} {w}x{h}: {m["count"]} cards; height={m["cardHeight"]:.1f}px; list={m["clientHeight"]}/{m["scrollHeight"]} overflow={m["overflowY"]}; landing={landingCards}; PASS')
      except Exception as err:
        errors.append(f'{label}: {type(err).__name__}: {err}')
        print('FAIL:',errors[-1],file=sys.stderr)
      finally:
        page.close()
    browser.close()
  print('CHECKS:',checks,'FAILURES:',len(errors))
  if strict: assert not errors, '\n'.join(errors)
  return checks, errors, measurements

if __name__=='__main__':
    run(strict=True)
