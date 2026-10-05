'use strict';
// QA only. Run with Playwright available in NODE_PATH; no application runtime dependency.
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict'), zlib=require('node:zlib');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/recovery_sites.json'),'utf8'));
assert.equal(data.sites.length,18);
assert.equal(data.sites.reduce((n,s)=>n+s.events.length,0),65);
assert.equal(data.sites.reduce((n,s)=>n+s.events.reduce((k,e)=>k+(e.videos||[]).length,0),0),31);
assert.equal(new Set(data.sites.map(s=>s.id)).size,18);
const eventIds=new Set();
for(const s of data.sites){
  assert(s.events.length>0 && ['partial','complete'].includes(s.history_coverage));
  assert(Math.abs(s.lat)<85 && Math.abs(s.lon)<=180);
  assert.equal(s.coordinate_precision,'representative');
  assert(s.coordinate_source_url.startsWith('https://'));
  for(const e of s.events){
    assert(!eventIds.has(e.id));eventIds.add(e.id);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(e.date));
    assert(e.date<=data.reviewed_on);
    assert(e.source_url.startsWith('https://') && e.note_fa && e.note_en);
  }
}
// --- site images: exactly 16 sites carry a licensed official image; 2 honest skips ---
const allowedLicenses=['Public Domain','CC0','CC BY 2.0','CC BY 3.0','CC BY 4.0','CC BY-SA 2.0','CC BY-SA 3.0','CC BY-SA 4.0'];
const imaged=data.sites.filter(s=>s.image);
assert.equal(imaged.length,16);
for(const s of imaged){
  assert.equal(s.image.file,'assets/img/recovery/'+s.id+'.jpg','image path: '+s.id);
  assert(s.image.caption_fa && s.image.caption_en && s.image.credit_fa && s.image.credit_en,'image captions/credits: '+s.id);
  assert(allowedLicenses.includes(s.image.license),'image license: '+s.id+' '+s.image.license);
  assert(/^https:\/\/(images\.nasa\.gov|commons\.wikimedia\.org)\//.test(s.image.source_url),'image source: '+s.id);
}
for(const sid of ['recovery-koonibba','recovery-starship-indian'])
  assert(!data.sites.find(x=>x.id===sid).image,'honest skip: '+sid);
// --- landing registry integrity ---
const expectedRegistries={'recovery-lz1':54,'recovery-lz4':35,'recovery-jrti':159,'recovery-ocisly':235,'recovery-asog':168,
  'recovery-kennedy-runway':81,'recovery-edwards':54,'recovery-dzhezkazgan':160,'recovery-dongfeng':11,'recovery-siziwang':13,
  'recovery-starbase-catch':4,'recovery-starship-indian':9,'recovery-dragon-pacific':7,'recovery-dragon-gulf':27};
for(const [sid,count] of Object.entries(expectedRegistries)){
  const s=data.sites.find(x=>x.id===sid);const reg=s.landing_registry;
  assert(reg,'registry present: '+sid);
  assert.equal(reg.entries.length,count,'registry rows: '+sid);
  assert(reg.scope_fa && reg.scope_en && reg.basis_fa && reg.basis_en && reg.source_url.startsWith('https://'));
  assert.equal(typeof reg.complete,'boolean');
  assert.equal(s.history_coverage,reg.complete?'complete':'partial');
  let prev='';
  for(const r of reg.entries){
    assert(/^\d{4}-\d{2}-\d{2}$/.test(r.d) && r.d<=data.reviewed_on);
    assert(r.d>=prev,'registry sorted ascending: '+sid);prev=r.d;
    assert(['success','failure','partial','no_attempt'].includes(r.o));
  }
}
for(const sid of ['recovery-white-sands','recovery-utah','recovery-woomera','recovery-koonibba']){
  const s=data.sites.find(x=>x.id===sid);
  assert.equal(s.history_coverage,'complete');assert(!s.landing_registry);
}
for(const s of data.sites){
  if(s.recovery_type==='droneship'){assert.equal(s.mobility,'mobile');assert(s.mobility_note_fa && s.mobility_note_en);}
  if(s.recovery_type==='splashdown_zone')assert(s.coordinate_note_fa.length>30);
}
assert.equal(data.sites.filter(s=>s.recovery_type==='droneship').length,3);
assert.equal(data.sites.filter(s=>s.recovery_type==='splashdown_zone').length,3);
console.log('PASS: 14 landing registries (1017 rows) are sourced, dated, ordered and scope-labelled; marine sites disclose mobility and zone approximation.');
const backup='/home/user/rollback/landing-recovery';
if(fs.existsSync(path.join(backup,'app.js.gz'))){
  const before=zlib.gunzipSync(fs.readFileSync(path.join(backup,'app.js.gz'))).toString();
  const after=fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
  const extract=(text,name)=>{const start=text.indexOf('  function '+name+'(');assert(start>=0);return text.slice(start,text.indexOf('\n  }\n',start)+5)};
  for(const name of ['svgLaunch','svgPropulsion','svgAgency','svgSite','offlineStyle','fetchOnlineStyle','localizeStyleLabels','applyMapStyle','createMap'])assert.equal(extract(after,name),extract(before,name),'Unchanged: '+name);
  assert(fs.readFileSync(path.join(root,'assets/css/app.css'),'utf8').startsWith(zlib.gunzipSync(fs.readFileSync(path.join(backup,'app.css.gz'))).toString()));
}
console.log('PASS: 18 sites, 65 sourced events and 31 official video links, honest coverage/coordinates, existing marker artwork and basemaps unchanged.');
const output='/home/user/.cache/recovery-qa';fs.mkdirSync(output,{recursive:true});
const errors=[],checks=[];
const vm=require('node:vm');
const appCode=fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
const vs=appCode.indexOf('  function validRecoveryVideo('),ve=appCode.indexOf('  function renderRecoveryVideos(',vs);
const videoCtx={URL};vm.createContext(videoCtx);vm.runInContext(appCode.slice(vs,ve),videoCtx);
for(const site of data.sites)for(const event of site.events)for(const v of event.videos||[]){
 assert.equal(videoCtx.validRecoveryVideo(v,event.id),true);
 assert.equal(videoCtx.validRecoveryVideo({...v,url:'https://x.com/SpaceX/status/1845507539053826155'},event.id),true);
 assert.equal(videoCtx.validRecoveryVideo({...v,url:'https://x.com/SpaceX/status/1845507539053826155?s=20'},event.id),false);
 assert.equal(videoCtx.validRecoveryVideo({...v,url:'https://x.com/search?q=starship'},event.id),false);
 assert.equal(videoCtx.validRecoveryVideo({...v,url:'https://x.com.attacker.invalid/SpaceX/status/1'},event.id),false);
 for(const change of [{url:'javascript:alert(1)'},{url:'https://images.nasa.gov.attacker.invalid/details/video'},{event_id:'wrong-event'},{verified:false},{official_source:false},{kind:'animation'},{url:'https://www.youtube.com/results?search_query=landing'}])assert.equal(videoCtx.validRecoveryVideo({...v,...change},event.id),false);
}
console.log('PASS: only verified, event-matched, HTTPS official watch links are accepted.');
const pass=x=>{checks.push(x);console.log('PASS:',x)};
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:950},ignoreHTTPSErrors:true,reducedMotion:'reduce'});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    const unsolicitedMedia=[];page.on('request',r=>{if(/^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|images\.nasa\.gov|plus\.nasa\.gov|x\.com|twitter\.com)\//.test(r.url()))unsolicitedMedia.push(r.url())});
    await page.route(/ll\.thespacedevs\.com/,r=>r.fulfill({contentType:'application/json',body:'{"results":[],"next":null,"count":0}'}));
    await page.addInitScript(()=>{localStorage.setItem('orbita_lang','fa');localStorage.setItem('orbita_map_style','dark');localStorage.setItem('orbita_theme','navy')});
    await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.map&&typeof map.getStyle==='function'&&map.getStyle()&&DATA.recoveries.length===18);
    const chip=page.locator('.recovery-chip');
    assert.equal(await chip.getAttribute('aria-pressed'),'false');
    assert.equal(await page.locator('#mapStyleChip').innerText(),'پوسته ۱');
    assert.equal(await page.locator('#mapStyleChip .ic').count(),0);
    assert.equal(await page.locator('.recovery-chip .lb').isVisible(),true);
    assert.equal(await page.locator('.recovery-chip .lb').evaluate(el=>getComputedStyle(el).display),await page.locator('.cat-chip[data-cat="launch"] .lb').evaluate(el=>getComputedStyle(el).display));
    assert.equal(await page.locator('[data-recovery-id]').count(),0);
    const camera=await page.evaluate(()=>[map.getCenter().lng,map.getCenter().lat,map.getZoom()]);
    await chip.click();
    assert.equal(await chip.getAttribute('aria-pressed'),'true');
    assert.deepEqual(await page.evaluate(()=>[map.getCenter().lng,map.getCenter().lat,map.getZoom()]),camera);
    pass('Layer is off by default, keyboard-ready and does not move the map when enabled');
    await page.evaluate(()=>map.jumpTo({center:[-113.25,41],zoom:7}));
    await page.locator('[data-recovery-id="recovery-utah"]').waitFor();
    await page.locator('[data-recovery-id="recovery-utah"]').click();
    await page.locator('.recovery-dossier').waitFor();
    assert.equal(await page.locator('#recoveryOverview').isVisible(),true);
    await page.locator('#recoveryOverviewTab').focus();await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#recoveryHistory').isVisible(),true);
    assert.equal(await page.locator('.recovery-event').count(),4);
    assert.equal(await page.locator('[data-event-id="utah-genesis"] .bad').innerText(),'فرود ناموفق');
    assert.equal(await page.locator('[data-event-id="utah-genesis"] .partial').innerText(),'بازیابی جزئی');
    assert.equal(await page.locator('.recovery-dossier img').count(),1);
    assert.equal(await page.locator('.recovery-hero img').evaluate(el=>fetch(el.getAttribute('src')).then(r=>r.ok)),true);
    assert.match(await page.locator('.recovery-hero-credit').evaluate(el=>el.textContent),/عکس:/);
    assert.equal(await page.locator('.recovery-coverage').isVisible(),true);
    pass('A real map-marker click opens two accessible tabs; Genesis landing failure and partial recovery are distinct');
    for(const site of data.sites){
      await page.evaluate(id=>openDetail({cat:'recovery',kind:'recovery',o:DATA.recoveries.find(s=>s.id===id)}),site.id);
      await page.locator('#recoveryHistoryTab').click();
      assert.equal(await page.locator('.recovery-event').count(),site.events.length);
      const dates=await page.locator('.recovery-event time').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('datetime')));
      assert.deepEqual(dates,[...dates].sort().reverse());
      assert.equal(await page.locator('.recovery-primary-source a').count(),site.events.length);
      assert.equal(await page.locator('.recovery-video-link').count(),site.events.reduce((n,e)=>n+(e.videos||[]).length,0));
      assert.equal(await page.locator('.recovery-dossier video,.recovery-dossier iframe,.recovery-dossier source').count(),0);
      assert.equal(await page.locator('.recovery-story-section').count(),site.events.length*3);
      const reg=site.landing_registry;
      assert.equal(await page.locator('.recovery-registry').count(),reg?1:0);
      if(reg){
        assert.equal(await page.locator('.recovery-registry-table tbody tr').count(),reg.entries.length);
        assert.equal(await page.locator('.recovery-registry-body a').count(),1);
        assert.equal((await page.locator('.recovery-coverage span').innerText()).trim(),site.history_coverage==='complete'?'پوشش کامل':'در حال تکمیل');
      }
      for(const event of site.events){
        assert(event.summary_fa && event.context_fa && event.sequence_fa && event.significance_fa);
        assert(event.summary_en && event.context_en && event.sequence_en && event.significance_en);
      }
      assert.equal(await page.locator('.recovery-dossier img').count(),site.image?1:0);
      if(site.image)assert.equal(await page.locator('.recovery-hero img').evaluate(el=>fetch(el.getAttribute('src')).then(r=>r.ok)),true);
    }
    pass('Every site has sourced, newest-first history; media links appear only where verified, with no embedded players');
    await page.evaluate(()=>openDetail({cat:'recovery',kind:'recovery',o:DATA.recoveries.find(s=>s.id==='recovery-lz1')}));
    await page.locator('#recoveryHistoryTab').click();
    const diverted=page.locator('[data-event-id="lz1-crs16-attempt"]');
    assert.equal(await diverted.locator('.recovery-location-disclosure').isVisible(),true);
    assert.match(await diverted.innerText(),/فرود اینجا رخ نداد/);
    assert.equal(await diverted.locator('.bad').innerText(),'فرود ناموفق');
    assert.equal(await diverted.locator('.good').innerText(),'بازیابی تأییدشده');
    await page.evaluate(()=>openDetail({cat:'recovery',kind:'recovery',o:DATA.recoveries.find(s=>s.id==='recovery-starbase-catch')}));
    await page.locator('#recoveryHistoryTab').click();
    assert.equal(await page.locator('.recovery-event').count(),3);
    assert.equal(await page.getByText('گرفتن با برج موفق',{exact:true}).count(),3);
    assert.equal(await page.getByText('فرود موفق',{exact:true}).count(),0);
    pass('Intended targets are separated from actual touchdown locations, and tower catches are labelled accurately');
    await page.evaluate(()=>openDetail({cat:'recovery',kind:'recovery',o:DATA.recoveries.find(s=>s.id==='recovery-ocisly')}));
    assert.match(await page.locator('.recovery-tags').innerText(),/سکوی متحرک/);
    assert.equal(await page.locator('.recovery-mobility-note').isVisible(),true);
    await page.locator('#recoveryHistoryTab').click();
    assert.equal((await page.locator('.recovery-coverage span').innerText()).trim(),'پوشش کامل');
    await page.locator('.recovery-registry>summary').click();
    assert.equal(await page.locator('.recovery-registry-table tbody tr').count(),235);
    assert.equal(await page.locator('.recovery-registry-dot.failure').count(),data.sites.find(s=>s.id==='recovery-ocisly').landing_registry.entries.filter(r=>r.o==='failure').length);
    await page.evaluate(()=>openDetail({cat:'recovery',kind:'recovery',o:DATA.recoveries.find(s=>s.id==='recovery-starship-indian')}));
    await page.locator('#recoveryHistoryTab').click();
    assert.equal(await page.getByText('بازیابی در برنامه نبود',{exact:true}).count(),3);
    pass('Droneships disclose mobility, complete registries expand to the full landing table, and planned no-recovery splashdowns are labelled honestly');

    assert.deepEqual(unsolicitedMedia,[], 'No video-provider calls while rendering dossiers');
    await page.evaluate(()=>{map.stop();openDetail({cat:'recovery',kind:'recovery',o:DATA.recoveries.find(s=>s.id==='recovery-utah')})});
    await page.locator('#recoveryHistoryTab').click();
    const mediaEvent=page.locator('[data-event-id="utah-varda-w1"]');
    await mediaEvent.locator('.recovery-event-details>summary').click();
    const mediaLink=mediaEvent.locator('.recovery-video-link');
    const watchURL=await mediaLink.getAttribute('href');
    assert.equal(await mediaLink.getAttribute('target'),'_blank');
    assert.match(await mediaLink.getAttribute('rel'),/noopener/);
    const mainURL=page.url(),view=await page.evaluate(()=>[map.getCenter().lng,map.getCenter().lat,map.getZoom()]);
    // Validate the user's navigation action without loading a video player or downloading media.
    await context.route(watchURL,r=>r.fulfill({contentType:'text/html',body:'<title>Watch-link navigation test</title>'}));
    const newTab=context.waitForEvent('page');await mediaLink.click();const tab=await newTab;
    await tab.waitForURL(watchURL,{waitUntil:'domcontentloaded'});assert.equal(tab.url(),watchURL);
    assert.equal(page.url(),mainURL);assert.deepEqual(await page.evaluate(()=>[map.getCenter().lng,map.getCenter().lat,map.getZoom()]),view);
    await tab.close();await context.unroute(watchURL);
    await mediaLink.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(output,'desktop-video-link.png')});
    pass('Video opens the exact reference in a new tab without moving or replacing the map');
    await page.evaluate(()=>{const o=JSON.parse(JSON.stringify(DATA.recoveries.find(s=>s.id==='recovery-utah')));const e=o.events.find(e=>e.id==='utah-varda-w1');e.videos[0].verified=false;o.events=[e];openDetail({cat:'recovery',kind:'recovery',o})});
    assert.equal(await page.locator('.recovery-video-link').count(),0);
    assert.equal(await page.locator('.recovery-media').count(),0);
    pass('An unverified video produces neither a button nor an empty placeholder');
    await page.evaluate(()=>{map.stop();map.jumpTo({center:[136,-30],zoom:4});openDetail({cat:'recovery',kind:'recovery',o:DATA.recoveries.find(s=>s.id==='recovery-koonibba')})});
    await page.locator('#recoveryHistoryTab').click();
    for(const next of ['sunny','osm','dark']){
      await page.locator('#detailClose').click();
      await page.locator('#mapStyleChip').click();
      await page.evaluate(()=>openDetail({cat:'recovery',kind:'recovery',o:DATA.recoveries.find(s=>s.id==='recovery-koonibba')}));
      await page.locator('#recoveryHistoryTab').click();
      await page.waitForFunction(next=>{const s=map.getStyle();return s&&(next==='sunny'?!!s.sources['streets-v2']:s.name===(next==='dark'?'Dark Matter':'Voyager'))},next,{timeout:25000});
      assert.equal(await chip.getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('#mapStyleChip').innerText(),{sunny:'پوسته ۲',osm:'پوسته ۳',dark:'پوسته ۱'}[next]);
      assert.equal(await page.locator('.recovery-event').count(),4);
    }
    await page.waitForFunction(()=>map.loaded()&&map.areTilesLoaded(),null,{timeout:25000});
    await page.screenshot({path:path.join(output,'desktop-history.png')});
    const firstEvent=page.locator('.recovery-event').first();
    await firstEvent.locator('.recovery-event-details>summary').click();
    assert.equal(await firstEvent.locator('.recovery-story-section').count(),3);
    assert.equal(await firstEvent.locator('.recovery-event-reading').isVisible(),true);
    assert.equal(await firstEvent.locator('.recovery-evidence').isVisible(),true);
    await firstEvent.scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,'desktop-details.png')});
    pass('The recovery layer and history remain available through all three map skins');
    await page.locator('#detailClose').click();
    await chip.click();
    await page.waitForFunction(()=>document.querySelectorAll('[data-recovery-id]').length===0);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('.recovery-chip'));
    assert.equal(await chip.getAttribute('aria-pressed'),'false');
    await page.locator('#langBtn').click();
    await page.evaluate(()=>openDetail({cat:'recovery',kind:'recovery',o:DATA.recoveries[0]}));
    assert.match(await page.locator('#recoveryHistoryTab').innerText(),/Landing/);
    await page.locator('#recoveryHistoryTab').click();
    assert.match(await page.locator('.recovery-coverage').innerText(),/complete landing list|selected/i);
    pass('Turning off removes the markers; reload stays off; English labels work');
    await context.close();
    const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,ignoreHTTPSErrors:true});
    const mp=await mobile.newPage();mp.on('pageerror',e=>errors.push(e.message));
    await mp.route(/ll\.thespacedevs\.com/,r=>r.fulfill({contentType:'application/json',body:'{"results":[],"next":null,"count":0}'}));
    await mp.addInitScript(()=>{localStorage.setItem('orbita_lang','fa');localStorage.setItem('orbita_map_style','osm');localStorage.setItem('orbita_theme','light')});
    await mp.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded'});
    await mp.waitForFunction(()=>window.map&&typeof map.getStyle==='function'&&map.getStyle()&&DATA.recoveries.length===18);
    assert.equal(await mp.locator('.recovery-chip .lb').evaluate(el=>getComputedStyle(el).display),'none');
    assert.equal(await mp.locator('.recovery-chip').getAttribute('aria-label'),'فرود و بازیابی');
    assert.equal(await mp.locator('#mapStyleChip').innerText(),'پوسته ۳');
    await mp.screenshot({path:path.join(output,'mobile-toolbar.png')});
    await mp.locator('.recovery-chip').click();
    await mp.locator('#sideOpen').click();await mp.locator('#mapSearch').fill('کونیبا');
    await mp.getByText('محدودهٔ کونیبا',{exact:true}).click();
    await mp.screenshot({path:path.join(output,'mobile-overview.png')});
    await mp.locator('#recoveryHistoryTab').click();
    assert.equal(await mp.locator('.recovery-event').count(),4);
    const panel=await mp.locator('.recovery-dossier').boundingBox();assert(panel.x>=0&&panel.x+panel.width<=391);
    const overflow=await mp.locator('#detail').evaluate(el=>el.scrollWidth>el.clientWidth+1);assert.equal(overflow,false);
    assert.equal(await mp.evaluate(()=>map.touchZoomRotate._rotationDisabled),true);
    await mp.screenshot({path:path.join(output,'mobile-history.png')});
    await mp.locator('.recovery-event-details>summary').first().click();
    assert.equal(await mp.locator('.recovery-event-reading').first().isVisible(),true);
    assert.equal(await mp.locator('#detail').evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
    await mp.screenshot({path:path.join(output,'mobile-details.png')});
    await mp.locator('#detailClose').click();await mp.locator('.recovery-chip').click();
    assert.equal(await mp.locator('.recovery-chip').getAttribute('aria-pressed'),'false');
    pass('Mobile search, dossier tabs, scrolling and layer toggle work; existing gesture lock preserved');
    await mobile.close();
    assert.deepEqual(errors,[]);
    pass('No unhandled browser errors');
  }finally{
    await browser.close();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({checks,errors},null,2));
  }
})().catch(e=>{console.error(e);process.exitCode=1});
