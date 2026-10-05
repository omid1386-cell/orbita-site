'use strict';
// Regression for real sandboxed frames, not just a standalone browser window.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const BASE=process.env.ORBITA_URL || 'http://127.0.0.1:5173';
const output='/home/user/.cache/link-fix';fs.mkdirSync(output,{recursive:true});
const report=[];const pass=s=>{report.push(s);console.log('PASS:',s)};
async function setup(browser, mode, mobile=false){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:950},isMobile:mobile,hasTouch:mobile,ignoreHTTPSErrors:true,reducedMotion:'reduce'});
 context.setDefaultTimeout(12000);
 await context.route(/ll\.thespacedevs\.com/,r=>r.fulfill({contentType:'application/json',body:'{"results":[],"next":null,"count":0}'}));
 await context.route('https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({version:8,name:'Link-test background',sources:{},layers:[{id:'bg',type:'background',paint:{'background-color':'#0b1524'}}]})}));
 const page=await context.newPage();let app=page;
 if(mode!=='standalone'){
  const flags='allow-scripts allow-same-origin'+(mode==='allowed'?' allow-popups allow-popups-to-escape-sandbox':'');
  await page.route(BASE+'/link-test-frame',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%}iframe{width:100%;height:100%;border:0}</style><iframe sandbox="'+flags+'" src="'+BASE+'/"></iframe>'}));
  await page.goto(BASE+'/link-test-frame',{waitUntil:'domcontentloaded'});
  app=await (await page.waitForSelector('iframe')).contentFrame();
 }else await page.goto(BASE+'/',{waitUntil:'domcontentloaded'});
 await app.waitForFunction(()=>window.DATA&&DATA.recoveries&&DATA.recoveries.length===18&&typeof window.openDetail==='function'&&window.map&&typeof map.getCenter==='function'&&map.getStyle());
 await app.evaluate(()=>{if(window.map&&typeof map.stop==='function')map.stop();openDetail({cat:'recovery',kind:'recovery',o:DATA.recoveries.find(s=>s.id==='recovery-utah')})});
 await app.locator('#recoveryHistoryTab').click();
 const event=app.locator('[data-event-id="utah-varda-w1"]');await event.locator('.recovery-event-details>summary').click();
 return {context,page,app,event};
}
async function followsNewTab(env,link){
 const url=new URL(await link.getAttribute('href'),BASE).href;
 const before=await env.app.evaluate(()=>({href:location.href,center:map.getCenter().toArray(),zoom:map.getZoom()}));
 let sentReferer;
 await env.context.route(url,r=>{sentReferer=r.request().headers().referer;return r.fulfill({contentType:'text/html',body:'<title>External source navigation test</title>'})});
 const opening=env.context.waitForEvent('page');await link.click();const popup=await opening;
 await popup.waitForURL(url,{waitUntil:'domcontentloaded'});
 assert.equal(await popup.evaluate(()=>window.opener),null,'External site cannot control the app tab');
 assert.equal(sentReferer,undefined,'No preview address leaked as Referer');
 assert.deepEqual(await env.app.evaluate(()=>({href:location.href,center:map.getCenter().toArray(),zoom:map.getZoom()})),before);
 assert.equal(await env.app.locator('#externalLinkDialog[open]').count(),0);
 await popup.close();await env.context.unroute(url);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  let env=await setup(browser,'standalone');
  await followsNewTab(env,env.event.locator('.recovery-video-link'));
  await followsNewTab(env,env.event.locator('.recovery-primary-source a'));
  await followsNewTab(env,env.event.locator('.recovery-supporting-source a').first());
  await env.app.locator('#recoveryOverviewTab').click();
  await followsNewTab(env,env.app.locator('.recovery-position a'));
  pass('Video, primary source, supporting source and location reference open safely without changing the map');
  // Legacy inline opener must not produce a second tab or swallow the new fallback.
  await env.app.evaluate(()=>{window.legacyLinkClicks=0;const a=document.createElement('a');a.id='legacyExternalTest';a.href='https://example.org/legacy-source';a.textContent='Legacy source';a.style.cssText='position:fixed;top:120px;right:30px;z-index:9999;background:white;color:black';a.onclick=()=>{window.legacyLinkClicks++;window.open(a.href,'_blank');return false};document.querySelector('#view-map').appendChild(a)});
  await followsNewTab(env,env.app.locator('#legacyExternalTest'));
  assert.equal(await env.app.evaluate(()=>window.legacyLinkClicks),0);
  pass('Legacy map link handlers do not double-open or suppress source navigation');
  await env.context.close();
  env=await setup(browser,'blocked',true);
  const link=env.event.locator('.recovery-video-link');const url=await link.getAttribute('href');const mainUrl=env.app.url();
  await link.click();
  await env.app.locator('#externalLinkDialog[open]').waitFor();
  assert.equal(env.context.pages().length,1,'Real sandbox blocks popups');
  assert.equal(await env.app.locator('#externalLinkAddress').inputValue(),url);
  assert.equal(await env.app.locator('#externalLinkCurrent').isVisible(),false,'Never navigate an embedded preview into a frame-blocked source');
  const box=await env.app.locator('#externalLinkDialog').boundingBox();assert(box.width<=390 && box.x>=0);
  await env.app.locator('#externalLinkCopy').click();
  assert.match(await env.app.locator('#externalLinkStatus').innerText(),/کپی شد|کپی خودکار مجاز نشد/);
  await env.page.screenshot({path:output+'/blocked-preview.png'});
  await env.app.locator('#externalLinkRetry').click();
  assert.match(await env.app.locator('#externalLinkStatus').innerText(),/همچنان مسدود/);
  assert.equal(env.app.url(),mainUrl);
  await env.app.locator('#externalLinkClose').click();
  assert.equal(await env.app.locator('#recoveryHistory').isVisible(),true);
  // Force both programmatic copy paths to be unavailable. A selected, readable URL remains.
  await env.app.evaluate(()=>{document.execCommand=()=>false;Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})});
  await env.event.locator('.recovery-primary-source a').click();
  await env.app.locator('#externalLinkCopy').click();
  assert.match(await env.app.locator('#externalLinkStatus').innerText(),/کپی خودکار مجاز نشد/);
  const selection=await env.app.locator('#externalLinkAddress').evaluate(el=>({start:el.selectionStart,end:el.selectionEnd,length:el.value.length}));
  assert.equal(selection.start,0);assert.equal(selection.end,selection.length);
  await env.app.locator('#externalLinkAddress').press('Escape');
  assert.equal(await env.app.locator('#externalLinkDialog[open]').count(),0);
  pass('Restricted mobile preview: video and source clicks show usable URL, copy/retry controls and manual-copy fallback; Escape restores the dossier');
  await env.context.close();
  env=await setup(browser,'allowed');
  await followsNewTab(env,env.event.locator('.recovery-video-link'));
  pass('Popup-enabled iframe also opens the real source target safely');
  await env.context.close();
  env=await setup(browser,'standalone');
  await env.app.evaluate(()=>{window.open=()=>null});
  await env.event.locator('.recovery-video-link').click();
  assert.equal(await env.app.locator('#externalLinkCurrent').isVisible(),true);
  const sameUrl=await env.app.locator('#externalLinkCurrent').getAttribute('href');
  await env.context.route(sameUrl,r=>r.fulfill({contentType:'text/html',body:'<title>Explicit same-tab navigation</title>'}));
  await env.app.locator('#externalLinkCurrent').click();
  await env.page.waitForURL(sameUrl,{waitUntil:'domcontentloaded'});
  pass('When a top-level browser blocks popups, the user can explicitly open the source in the same tab');
  await env.context.close();
 }finally{
  await browser.close();fs.writeFileSync(output+'/report.json',JSON.stringify({checks:report},null,2));
 }
})().catch(e=>{console.error(e);process.exitCode=1});
