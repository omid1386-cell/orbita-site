#!/usr/bin/env python3
"""Local offline browser QA for desktop/mobile upcoming-launch opening and filtering.
No network, no Render/GitHub/Google calls; the actual index markup & CSS are used.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / 'index.html').read_text(encoding='utf-8')
soup = BeautifulSoup(html, 'html.parser')
for tag in list(soup.select('script, link, iframe')):
    tag.decompose()
# Preserve original markup but prevent page loading external assets from disk.
for img in soup.find_all('img'):
    img.attrs.pop('src',None)
html = str(soup)
css = '\n'.join((ROOT / p).read_text(encoding='utf-8') for p in [
    'assets/css/app.css',
    'assets/css/launch-mission-ui.css',
    'assets/css/upcoming-event-display.css',
    'assets/css/raspehr-stage5-switch.css',
]) + '\n#raspehrSplash {display:none!important}\n'
launch = json.loads((ROOT/'data/upcoming_global.json').read_text(encoding='utf-8'))
landing = json.loads((ROOT/'data/upcoming_landings.json').read_text(encoding='utf-8'))
countries = json.loads((ROOT/'data/country_codes.json').read_text(encoding='utf-8'))
scripts=[
    'assets/js/upcoming-launch-filters.js',
    'assets/js/upcoming-event-display.js',
    'assets/js/upcoming-launch-browser.js',
    'assets/js/upcoming-landing-browser.js',
]

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox','--disable-dev-shm-usage'])
    total = 0
    for device, width, height in [('desktop',1440,900),('laptop',1024,768),('mobile',390,844)]:
        pg = browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
        pg.set_content(html, wait_until='domcontentloaded')
        pg.add_style_tag(content=css)
        pg.evaluate('''({launch,landing,countries}) => {
          window.fetch = function(url) {
            const str=String(url);
            let data = str.includes('upcoming_global.json') ? launch :
              str.includes('upcoming_landings.json') ? landing : countries;
            return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(data)});
          };
          window.ORBITA_UPCOMING_GLOBAL_V='QA';
          window.ORBITA_UPCOMING_LANDINGS_V='QA';
          window.ORBITA_V='QA';
        }''', {'launch':launch,'landing':landing,'countries':countries})
        for script in scripts:
            pg.add_script_tag(content=(ROOT/script).read_text(encoding='utf-8'))
        desktop_btn=pg.locator('#upcomingLaunchesDesktopBtn')
        map_btn=pg.locator('#upcomingLaunchesBtn')
        assert desktop_btn.count()==1 and map_btn.count()==1
        if device != 'mobile':
            assert desktop_btn.is_visible(), device + ' launch desktop button not visible'
            assert not map_btn.is_visible(), device + ' duplicate dock visible'
            # The desktop topbar route must also work in normal 2D mode.
            desktop_btn.click(timeout=5000)
            assert pg.locator('#globalLaunchDialog').evaluate('(e)=>e.open')
            pg.locator('#globalLaunchClose').click()
            pg.wait_for_function('''() => document.querySelector('#upcomingLaunchesDesktopBtn').getAttribute('aria-expanded')==='false' ''',timeout=3000)
            pg.locator('body').evaluate('(e)=>e.classList.add("raspehr-stage5-active")')
            assert desktop_btn.is_visible(), device + ' launcher hidden under 3D overlay'
            assert pg.locator('#upcomingLandingsBtn').is_visible(), device + ' landing tab hidden'
            desktop_btn.click(timeout=5000)
        else:
            assert not desktop_btn.is_visible(), 'mobile header launcher must be hidden'
            assert map_btn.is_visible(), 'original mobile dock must remain visible'
            map_btn.click(timeout=5000)
        dialog=pg.locator('#globalLaunchDialog')
        assert dialog.evaluate('(e)=>e.open'),device + ' launch dialog did not open'
        pg.wait_for_function('''() => document.querySelector('#globalLaunchResultCount').textContent.includes('پرتاب')''',timeout=8000)
        assert pg.locator('#globalLaunchResults .global-launch-card').count()>0, device + ' launch list empty'
        assert pg.locator('#globalLaunchPeriods button[data-days="7"]').count()==1
        pg.locator('#globalLaunchPeriods button[data-days="7"]').click()
        assert pg.locator('#globalLaunchPeriods button[data-days="7"]').get_attribute('aria-pressed')=='true'
        pg.locator('#globalLaunchClose').click()
        assert not dialog.evaluate('(e)=>e.open')
        pg.wait_for_function('''() => document.querySelector('#upcomingLaunchesBtn').getAttribute('aria-expanded') === 'false' && document.querySelector('#upcomingLaunchesDesktopBtn').getAttribute('aria-expanded') === 'false' ''', timeout=3000)
        total += 9 if device != 'mobile' else 7
        print(f'{device}: launch controls + 3D/2D behavior + data/filter/close: PASS')
        # Restore normal 2D for the landing interaction (which must be unchanged).
        # Landing entry remains accessible even while a desktop 3D view is active.
        pg.locator('#upcomingLandingsBtn').click()
        assert pg.locator('#globalLandingDialog').evaluate('(e)=>e.open')
        pg.locator('#globalLandingClose').click()
        assert not pg.locator('#globalLandingDialog').evaluate('(e)=>e.open')
        total += 2
        print(f'{device}: landing controls: PASS')
        pg.close()
    browser.close()
    print(f'PASS {total}/{total} offline interaction checks')
