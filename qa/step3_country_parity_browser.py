#!/usr/bin/env python3
"""Compare all 14 country dossier panels in V18 and V19 using real app.js slices."""
from pathlib import Path
import json,statistics,re
from playwright.sync_api import sync_playwright
p=Path(__file__).resolve().parents[1]
prior=Path('/mnt/data/raspehr_fix_step2_v18/orbita')
assert prior.exists(),'V18 baseline must be present'
newapp=(p/'assets/js/app.js').read_text()
oldapp=(prior/'assets/js/app.js').read_text()
fast=json.loads((p/'data/country_profile_fast_v1.json').read_text())
keys='launch propulsion agency satmaker components payloads ground_services inspace_services university_space test_facility ground_station mission_control'.split()
merged={}
for cat in keys:
    for row in json.loads((p/'data'/('companies_'+cat+'.json')).read_text()):
        id=str(row['id'])
        if id not in merged or merged[id].get('__orbita_fast_summary') and not row.get('__orbita_fast_summary'):merged[id]=row
full={'companies':[r for r in merged.values() if not r.get('alias_of_id')],
      'sites':json.loads((p/'data/sites.json').read_text()),
      'recoveries':json.loads((p/'data/recovery_sites.json').read_text())['sites']}

def code(source,modern):
    matching=source[source.index('  function isEntityInCountry(entity, targetEn, targetFa) {'):source.index('  function extractEntityLinks(',source.index('  function isEntityInCountry(entity, targetEn, targetFa) {'))]
    renderer=source[source.index('  function renderCountryProfile(p) {'):source.index('  window.isEntityInCountry = isEntityInCountry;',source.index('  function renderCountryProfile(p) {'))]
    if modern:
        tabs=source[source.index('  var countryProfileDeferredTabs = Object.create(null);'):source.index('  function renderAgencyCompanyArabic(',source.index('  var countryProfileDeferredTabs = Object.create(null);'))]
    else:
        tabs=source[source.index('  window.switchCompTab = function(tabId, el) {'):source.index('  function renderAgencyCompanyArabic(',source.index('  window.switchCompTab = function(tabId, el) {'))]
    setup='''
        window.LANG='fa';window.DATA=window.fullData;
        window.$=s=>document.querySelector(s);
        window.$$=s=>Array.from(document.querySelectorAll(s));
        const name=o=>LANG==='fa'?(o.fa||o.en||''):LANG==='ar'?(o.ar||o.en||o.fa||''):(o.en||o.fa||'');
        const desc=o=>LANG==='fa'?(o.fa_d||o.en_d||''):LANG==='ar'?(o.ar_d||(o.live?'':(o.en_d||''))):(o.en_d||o.fa_d||'');
        const esc=s=>String(s==null?'':s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
        const countryOf=x=>x, countryNameAr=x=>x;
        const countryNameKey=x=>String(x||'').toLowerCase();
        const flagCodesFor=()=>['globe'];
        const fallbackLogoDataUri=()=>'';
        const fallbackImageErrorAttribute=()=>'';
        const logoZoomAttrs=()=>'';
        const extractEntityLinks=o=>({webUrl:o.website||o.site||null,linkedinUrl:o.linkedin||null});
        const canonicalCompanyRecords=()=>fullData.companies;
        const companyBelongsToCategory=(o,k)=>[o.cat,...(o.secondary_categories||[])].includes(k);
        const layerName=k=>k;
        window.openDetailById=()=>null;window.flyToCoords=()=>null;
    '''
    return setup+'\n'+matching+'\n'+tabs+'\n'+renderer+'\nwindow.makeCountry=renderCountryProfile;'

samples=[('United States','ایالات متحده'),('China','چین'),('Algeria','الجزایر'),('Germany','آلمان'),('India','هند'),('France','فرانسه')]
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    pages=[]
    for modern in [False,True]:
        page=browser.new_page(viewport={'width':390,'height':844})
        page.set_content('<!doctype html><html><body><div id="detailBody"></div></body></html>')
        page.add_script_tag(content='window.fullData='+json.dumps(full,ensure_ascii=False,separators=(',',':'))+';window.fastPayload='+json.dumps(fast,ensure_ascii=False,separators=(',',':'))+';')
        page.add_script_tag(content=code(newapp if modern else oldapp,modern))
        if modern: page.evaluate('window.countryProfileFastData=window.fastPayload')
        pages.append(page)
    trials=[]
    for lang in ['fa','en','ar']:
        for en,fa in samples:
            results=[]
            for page in pages:
                result=page.evaluate('''({en,fa,lang})=>{
                    window.LANG=lang;
                    const start=performance.now();
                    const html=window.makeCountry({country_en:en,country_fa:fa});
                    const renderMs=performance.now()-start;
                    document.getElementById('detailBody').innerHTML=html;
                    const counts=[...document.querySelectorAll('.country-profile-summary-item strong')].map(e=>e.textContent);
                    const panels=[...document.querySelectorAll('.country-profile-panel')];
                    const contents=panels.map(panel=>{
                        const id=panel.id.replace(/^compTab/,'');
                        const button=document.querySelector('button[aria-controls="'+panel.id+'"]');
                        window.switchCompTab(id,button);
                        return panel.textContent.replace(/\\s+/g,' ').trim();
                    });
                    return {counts,contents,renderMs,htmlLength:html.length};
                }''',{'en':en,'fa':fa,'lang':lang})
                results.append(result)
            a,b=results
            assert a['counts']==b['counts'],f'count mismatch {lang}/{en}'
            for i,(x,y) in enumerate(zip(a['contents'],b['contents'])):
                assert x==y, f'visible content mismatch {lang}/{en} tab {i}: {x[:80]!r}!={y[:80]!r}'
            trials.append((lang,en,a['renderMs'],b['renderMs'],a['htmlLength'],b['htmlLength']))
    browser.close()
print(f'PASS: {len(trials)}/18 exact all-14-tab text-and-count comparisons of real V18 and V19 code.')
print('Country DOM string generation (fully local loaded):')
for row in trials:
    if row[0]=='fa':print(f'  {row[1]:16s} V18={row[2]:7.2f}ms V19={row[3]:7.2f}ms HTML {row[4]}/{row[5]} chars')
print('Median V18/V19 ms',round(statistics.median(r[2] for r in trials),2),round(statistics.median(r[3] for r in trials),2))
