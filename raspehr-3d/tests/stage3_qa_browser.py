#!/usr/bin/env python3
"""End-to-end responsive UI/gesture/stress QA using real stage-3 scripts and
canonical records with a deterministic Three.js scene driver. This test does
NOT replace real GPU WebGL QA or testing on a physical phone.
Run: python raspehr-3d/tests/stage3_qa_browser.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,time
app=Path(__file__).resolve().parents[1]
root=app.parent
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',(app/'index.html').read_text('utf-8'))
html=re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+"\s*>','',html)
records={'../data/'+name:json.loads((root/'data'/name).read_text('utf-8')) for name in ('companies.json','sites.json','recovery_sites.json')}
FAKE_ENGINE=r'''(function(global){
 const T=global.THREE;
 class Engine {
   constructor(host,metrics,status){
    this.host=host;this.stopped=false;this.controls=new Map();this.dragVelocity={x:0,y:0};
    this.scene=new T.Scene();this.globeGroup=new T.Group();this.scene.add(this.globeGroup);
    this.camera=new T.PerspectiveCamera(42,900/700,.02,80);this.camera.position.z=5.55;
    this.target={rx:0,ry:0,distance:5.55};this.options={quality:'balanced'};this.perfPolicy={mode:'balanced',fps:45};
    const canvas=document.createElement('canvas');canvas.style.cssText='width:100%;height:100%;position:absolute;inset:0;';
    canvas.width=900;canvas.height=700;host.appendChild(canvas);
    this.renderer={domElement:canvas};
    const adapt=()=>{const b=canvas.getBoundingClientRect();if(b.width&&b.height){this.camera.aspect=b.width/b.height;this.camera.updateProjectionMatrix();}};
    new ResizeObserver(adapt).observe(canvas);
    canvas.addEventListener('pointerdown',e=>this.controls.set(e.pointerId,{x:e.clientX,y:e.clientY}));
    const up=e=>this.controls.delete(e.pointerId);
    canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
    this.ready=Promise.resolve({errors:[]});
    setTimeout(()=>status({type:'ready',quality:'balanced',surfaceMode:'multilevel',imageryLevel:'z0'}),0);
   }
   turn(a,b){this.globeGroup.rotation.y+=a;this.globeGroup.rotation.x+=b;}
   flyToGeo(lat,lon,distance){
    this.target.rx=lat*Math.PI/180;this.target.ry=(-90-lon)*Math.PI/180;
    this.target.distance=distance;this.globeGroup.rotation.x=this.target.rx;
    this.globeGroup.rotation.y=this.target.ry;this.camera.position.z=distance;return true;
   }
   cancelCameraFlight(){return false;}
   zoomBy(n){this.target.distance=Math.max(2.02,Math.min(10.8,this.target.distance*n));this.camera.position.z=this.target.distance;}
   preset(){this.target.distance=5.55;this.camera.position.z=5.55;this.globeGroup.rotation.set(0,0,0);}
   setOption(){}
   setPerformanceMode(mode){this.perfPolicy.mode=mode;}
   enableTerrain(){}
   dispose(){this.stopped=true;}
 }
 global.RaspehrGlobe={GlobeEngine:Engine,PRESETS:{world:{name:'جهانی'},asia:{name:'آسیا'},europe:{name:'اروپا'},americas:{name:'آمریکا'},middleeast:{name:'خاورمیانه'},africa:{name:'آفریقا'},northpole:{name:'قطب شمال'},antarctica:{name:'جنوبگان'}}};
})(window);
'''

def load_page(browser,viewport, touch=False):
    context=browser.new_context(viewport=viewport,device_scale_factor=1,has_touch=touch,is_mobile=touch, reduced_motion='reduce')
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded');page.add_style_tag(content=(app/'assets/css/prototype.css').read_text('utf-8'))
    page.evaluate('(data)=>{window.fetch=url=>Promise.resolve(data[url]?{ok:true,status:200,json:async()=>data[url]}:{ok:false,status:404});}',records)
    page.add_script_tag(content=(root/'assets/vendor/three.min.js').read_text('utf-8'))
    page.add_script_tag(content=FAKE_ENGINE)
    for n in ('entity-data.js','entity-markers.js','entity-explore.js','entity-stage3-ui.js','local-facility-view.js'):
        page.add_script_tag(content=(app/'assets/js'/n).read_text('utf-8'))
    prototype=(app/'assets/js/prototype.js').read_text('utf-8')
    prototype=prototype.replace('engine = new window.RaspehrGlobe.GlobeEngine(', 'engine = window.__testEngine = new window.RaspehrGlobe.GlobeEngine(')
    prototype=prototype.replace('markers = new window.RaspehrEntityMarkers.EntityMarkers(', 'markers = window.__testMarkers = new window.RaspehrEntityMarkers.EntityMarkers(')
    prototype=prototype.replace('stage3 = new window.RaspehrStage3.Controller(', 'stage3 = window.__testStage3 = new window.RaspehrStage3.Controller(')
    page.add_script_tag(content=prototype)
    page.wait_for_function('()=>window.__testStage3 && window.__testStage3.filtered.length>0 && document.querySelectorAll(".cluster-bubble").length>0',timeout=25000)
    return context,page,errors

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 metrics={}
 for mode,viewport,touch in [('desktop',{'width':1366,'height':900},False),('mobile',{'width':390,'height':844},True)]:
    context,page,errors=load_page(browser,viewport,touch)
    page.wait_for_timeout(250)
    raw=page.evaluate('''()=>({records:window.__testStage3.catalog.counts.total,markers:window.__testStage3.catalog.counts.markers,
      categories:document.querySelectorAll('.category-checkbox').length,clusters:document.querySelectorAll('.cluster-bubble').length,
      width:document.documentElement.scrollWidth,viewWidth:window.innerWidth})''')
    assert raw['records']==420 and raw['markers']==420 and raw['categories']==14 and raw['clusters']>0,raw
    assert raw['width']<=raw['viewWidth']+1, ('horizontal overflow',mode,raw)
    # A cluster bubble must open the right member list, with a touch target >=44px on mobile.
    bubble=page.locator('.cluster-bubble:not([hidden])').first
    bubble.wait_for(state='visible');bbox=bubble.bounding_box()
    if touch:
        # Visual badges are deliberately compact, but invisible ::before hit
        # padding preserves the recommended >=44px touch interaction footprint.
        tap=page.evaluate('''()=>{const b=document.querySelector('.cluster-bubble:not([hidden])');const c=getComputedStyle(b,'::before');return b.getBoundingClientRect().width+2*Math.abs(parseFloat(c.left||'-7'))}''')
        assert tap>=43,('touch hit area',tap,bbox)
    before=page.evaluate('window.__testEngine.target.distance')
    bubble.click(timeout=5000)
    assert not page.locator('#clusterCard').is_hidden(), ('cluster card',mode)
    assert page.locator('#clusterMembers .entity-result').count()>=2
    after=page.evaluate('window.__testEngine.target.distance')
    assert after<before,(mode,before,after)
    page.locator('#clusterFocusBtn').click()
    refocus=page.evaluate('window.__testEngine.target.distance')
    assert 2.15<=refocus<=6.8,(mode,refocus)
    # Repeated zoom/rotation stresses re-clustering while keeping DOM and mesh count bounded.
    result=page.evaluate('''()=>{
      const ui=window.__testStage3, e=window.__testEngine;
      let maxBubbles=0,maxMeshes=0, maxVisible=0;
      for(let i=0;i<240;i++){
        e.globeGroup.rotation.y+=0.021;e.globeGroup.rotation.x=Math.sin(i/25)*0.25;
        e.camera.position.z=2.7+(i%90)*0.034;
        e.scene.updateMatrixWorld(true);ui.refreshView(true);
        maxBubbles=Math.max(maxBubbles,document.querySelectorAll('.cluster-bubble').length);
        maxMeshes=Math.max(maxMeshes,window.__testMarkers.meshes.length);
        maxVisible=Math.max(maxVisible,ui.view.visibleCount);
        if(ui.view.visibleCount>ui.filtered.length)throw Error('visible count exceeds filter');
        if(ui.view.singles.length+ui.view.clusters.reduce((sum,c)=>sum+c.count,0)!==ui.view.visibleCount)throw Error('cluster double-count');
      }
      return {maxBubbles,maxMeshes,maxVisible,lastBubbles:document.querySelectorAll('.cluster-bubble').length,
        lastMeshes:window.__testMarkers.meshes.length,filtered:ui.filtered.length};
    }''')
    assert result['maxBubbles']<=420 and result['maxMeshes']<=15,result
    # Country/category switching and repeated toggles must never leak extra overlays.
    page.locator('#entityCountry').select_option('United States')
    page.locator('#categoryNone').click()
    assert page.evaluate('window.__testStage3.filtered.length')==0
    page.locator('#categoryAll').click()
    page.locator('#entityClear').click()
    page.locator('#entitySearch').fill('NASA')
    page.wait_for_function('()=>window.__testStage3.filtered.some(r=>r.id==="nasa")',timeout=5000)
    page.locator('#entityResults .entity-result').first.click()
    assert page.locator('#entityId').inner_text()=='company:nasa'
    assert not page.locator('#selectedLocationCard').is_hidden()
    assert page.locator('#selectedLocationTitle').inner_text()=='ناسا'
    assert page.evaluate('window.__testStage3.pinnedKey')=='company:nasa'
    assert page.evaluate('window.__testMarkers.displayRows.some(r=>r.key===\"company:nasa\")')
    # A forgiving off-center canvas tap must resolve the nearest visible pin.
    page.locator('#entitySearch').fill('ksc39a')
    page.wait_for_function("()=>window.__testStage3.filtered.length===1 && window.__testStage3.filtered[0].id==='ksc39a'",timeout=5000)
    page.evaluate('''()=>{
      const ui=window.__testStage3,e=window.__testEngine,m=window.__testMarkers;
      const row=ui.filtered[0];
      e.flyToGeo(row.lat,row.lon,3.05);
      e.scene.updateMatrixWorld(true);e.camera.updateMatrixWorld(true);
      const at=m.projectAnchor(row,e.renderer.domElement.getBoundingClientRect(),0);
      const rect=e.renderer.domElement.getBoundingClientRect(),x=rect.left+at.x+12,y=rect.top+at.y+8;
      const canvas=e.renderer.domElement;
      canvas.dispatchEvent(new PointerEvent('pointerdown',{pointerId:77,pointerType:'mouse',button:0,clientX:x,clientY:y,bubbles:true}));
      canvas.dispatchEvent(new PointerEvent('pointerup',{pointerId:77,pointerType:'mouse',button:0,clientX:x,clientY:y,bubbles:true}));
    }''')
    assert page.evaluate('window.__testMarkers.selected && window.__testMarkers.selected.id')=='ksc39a'
    assert not page.locator('#selectedLocationCard').is_hidden()
    assert page.locator('#selectedLocationTitle').inner_text()=='مرکز فضایی کندی، سکوی ۳۹A'
    assert page.evaluate('window.__testStage3.pinnedKey')=='site:ksc39a'
    card_box=page.locator('#selectedLocationCard').bounding_box()
    assert card_box and card_box['x']>=0 and card_box['y']>=0
    assert card_box['x']+card_box['width']<=viewport['width']+1,(mode,card_box,viewport)
    globe_box=page.locator('.globe-panel').bounding_box()
    assert globe_box and card_box['y']+card_box['height']<=globe_box['y']+globe_box['height']+1,(mode,card_box,globe_box)
    # Stage 7 precision disclosure on a proposed, not built, site.
    page.locator('#entityClear').click()
    page.locator('#entitySearch').fill('Biak')
    page.wait_for_function("()=>window.__testStage3.filtered.some(r=>r.id==='biak')",timeout=5000)
    page.locator('#entityResults .entity-result').first.click()
    assert 'نقطه مرجع' in page.locator('#entityCoord').inner_text()
    assert 'تأیید نشده' in page.locator('#entityPrecision').inner_text()
    page.locator('#markerToggle').uncheck()
    assert page.locator('.cluster-bubble').count()==0
    page.locator('#markerToggle').check()
    page.locator('#entityClear').click()
    page.wait_for_timeout(350)
    assert page.locator('.cluster-overlay').count()==1
    # Hold down the pointer on a cluster, even as camera moves: the element must stay mounted.
    page.evaluate('''()=>{
      const bubble=document.querySelector('.cluster-bubble');
      if(!bubble)throw Error('missing cluster for hold test');
      bubble.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:9,pointerType:'touch'}));
      window.__testStage3.__heldBubble=bubble;
      window.__testEngine.globeGroup.rotation.y+=0.08;
      window.__testStage3.refreshView(false);
      if(!bubble.isConnected)throw Error('bubble disappeared during touch');
      bubble.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:9,pointerType:'touch'}));
      bubble.click();
    }''')
    assert not page.locator('#clusterCard').is_hidden()
    assert not errors,errors
    metrics[mode]={'start':raw,'stress':result,'errors':len(errors),'focus_distance_before':round(before,3),'after':round(after,3)}
    context.close()
 browser.close()
print('PASS responsive interaction, cluster click/focus/hold, 240 camera-step stress, controls',json.dumps(metrics,ensure_ascii=False),flush=True)
