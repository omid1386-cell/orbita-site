from pathlib import Path
from playwright.sync_api import sync_playwright
p=Path(__file__).with_name('RASPEHR_DIRECT_EARTH_LINK_PILOT_5.html')
html=p.read_text(encoding='utf-8')
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 assert page.locator('.card').count()==5
 assert page.locator('a.btn').count()==5
 page.locator('.card').nth(0).locator('.status').select_option('correct')
 page.locator('.card').nth(0).locator('select.building3d').select_option('yes')
 page.locator('.card').nth(0).locator('.evidence').fill('QA test only')
 result=page.evaluate('collect()')
 assert result['format']=='raspehr-direct-earth-pilot-results-v1'
 assert result['records'][0]['open_status']=='correct'
 assert result['records'][0]['building_3d']=='yes'
 assert errors==[],errors
 b.close()
print('PILOT HTML PASS: 5 cards, 5 links, form capture, JSON export model; no JS errors')
