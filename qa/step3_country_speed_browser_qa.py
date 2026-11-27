#!/usr/bin/env python3
"""Browser-level checks of actual V19 country renderer & shared tab handler.
Uses an isolated HTML fixture because live MapLibre/Google navigation is blocked.
"""
from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
app=(root/'assets/js/app.js').read_text(encoding='utf-8')
match=app[app.index('  function isEntityInCountry(entity, targetEn, targetFa) {'):app.index('  function extractEntityLinks(',app.index('  function isEntityInCountry(entity, targetEn, targetFa) {'))]
render=app[app.index('  function renderCountryProfile(p) {'):app.index('  window.isEntityInCountry = isEntityInCountry;',app.index('  function renderCountryProfile(p) {'))]
tab=app[app.index('  var countryProfileDeferredTabs = Object.create(null);'):app.index('  function renderAgencyCompanyArabic(',app.index('  var countryProfileDeferredTabs = Object.create(null);'))]
fast=(root/'data/country_profile_fast_v1.json').read_text(encoding='utf-8')
bootstrap='''
window.LANG='fa';window.countryProfileFastData=window.fastPayload;
window.DATA={companies:[],sites:[],recoveries:[]};
window.$ = s => document.querySelector(s);
window.$$ = s => Array.from(document.querySelectorAll(s));
const name = o => LANG==='fa'?(o.fa||o.en||''):LANG==='ar'?(o.ar||o.en||o.fa||''):(o.en||o.fa||'');
window.desc = o => LANG==='fa'?(o.fa_d||o.en_d||''):LANG==='ar'?(o.ar_d||(o.live?'':(o.en_d||''))):(o.en_d||o.fa_d||'');
window.esc = s => String(s==null?'':s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
window.countryOf = x=>x;window.countryNameAr=x=>x;
window.countryNameKey=x=>String(x||'').toLowerCase();
window.flagCodesFor=()=>['globe'];
window.fallbackLogoDataUri=()=>'';
window.fallbackImageErrorAttribute=()=>'';
window.logoZoomAttrs=()=>'';
window.extractEntityLinks=o=>({webUrl:o.website||o.site||null,linkedinUrl:o.linkedin||null});
window.canonicalCompanyRecords=()=>fastPayload.companies;
window.companyBelongsToCategory=(o,k)=>[o.cat,...(o.secondary_categories||[])].includes(k);
window.layerName=k=>k;
window.openDetailById=()=>null;window.flyToCoords=()=>null;
'''
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':390,'height':844})
    page.set_content('<!doctype html><html lang="fa"><body><div id="detailBody"></div></body></html>')
    page.add_style_tag(content=(root/'assets/css/app.css').read_text(encoding='utf-8'))
    page.add_script_tag(content='window.fastPayload='+fast+';')
    page.add_script_tag(content=bootstrap+ '\n' + match+'\n'+tab+'\n'+render+'\nwindow.makeCountry=renderCountryProfile;')
    checks=0
    def check(condition, why):
        global checks
        assert condition,why
        checks += 1
    for lang in ['fa','en','ar']:
        for en,fa in [('Algeria','الجزایر'),('United States','ایالات متحده'),('Germany','آلمان')]:
            page.evaluate('''([en,fa,lang])=>{window.LANG=lang;
                document.getElementById('detailBody').innerHTML=makeCountry({country_en:en,country_fa:fa});
            }''',[en,fa,lang])
            check(page.locator('#detailBody .country-profile-tab').count()==14, '14 tabs')
            check(page.locator('#detailBody .country-profile-panel').count()==14,'14 panels')
            check(page.locator('#detailBody .country-profile-summary-item').count()==14,'14 metrics')
            initial_html=page.locator('#detailBody').inner_html()
            initial_cards=page.locator('#compTabcCategoryLaunch .country-profile-card').count()
            expected=page.evaluate('''([en,fa])=>fastPayload.companies.filter(c=>
                isEntityInCountry(c,en,fa)&&companyBelongsToCategory(c,'launch')).length''',[en,fa])
            check(initial_cards==expected,'visible first tab full cards')
            check(page.locator('#compTabcCategoryAgency .country-profile-card').count()==0,'inactive tab deferred')
            page.locator('button[aria-controls="compTabcCategoryAgency"]').click()
            selected_cards=page.locator('#compTabcCategoryAgency .country-profile-card').count()
            expected2=page.evaluate('''([en,fa])=>fastPayload.companies.filter(c=>
                isEntityInCountry(c,en,fa)&&companyBelongsToCategory(c,'agency')).length''',[en,fa])
            check(selected_cards==expected2,'agency cards created on demand')
            check(page.locator('button[aria-controls="compTabcCategoryAgency"]').get_attribute('class').find('active')>=0,'agency tab active')
            page.locator('button[aria-controls="compTabcCategoryLaunch"]').click()
            page.locator('button[aria-controls="compTabcCategoryAgency"]').click()
            check(page.locator('#compTabcCategoryAgency .country-profile-card').count()==expected2,'no duplicate cards after repeated tab selection')
    browser.close()
print(f'PASS: {checks}/{checks} checks (14 categories, responsive actual markup, 3 languages, 3 countries, lazy tab materialization).')
