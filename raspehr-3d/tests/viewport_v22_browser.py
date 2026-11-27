#!/usr/bin/env python3
"""V22 viewport-centering and compact-control regression test.
Uses the real Three.js camera/renderer and production CSS/GlobeEngine.
External imagery is intentionally stubbed; no production data is changed.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, json

app=Path(__file__).resolve().parents[1]
root=app.parent
html=(app/'index.html').read_text('utf-8')
html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
html=re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]+"\s*>','',html)
css_files=[
 'prototype.css','priority5-visual.css','site-views.css','atlas-panel-v2.css',
 'place-journey-v4.css','interaction-stability-v5.css','external-map-links-v1.css',
 'atlas-ux-step4-v20.css','atlas-viewport-v22.css'
]

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=[
      '--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist','--disable-dev-shm-usage'
    ])
    summary={}
    for name,viewport,is_mobile in [
      ('mobile_390',{'width':390,'height':844},True),
      ('mobile_320',{'width':320,'height':720},True),
      ('mobile_landscape',{'width':667,'height':375},True),
      ('desktop',{'width':1280,'height':800},False),
    ]:
      context=browser.new_context(viewport=viewport,device_scale_factor=1,is_mobile=is_mobile,has_touch=is_mobile)
      page=context.new_page(); errors=[]
      page.on('pageerror',lambda err:errors.append(str(err)))
      page.set_content(html,wait_until='domcontentloaded')
      for filename in css_files:
        page.add_style_tag(content=(app/'assets/css'/filename).read_text('utf-8'))
      page.add_script_tag(content=(root/'assets/vendor/three.min.js').read_text('utf-8'))
      for filename in ['terrain-source.js','terrain-dem.js','stage6-performance.js','globe-engine.js']:
        page.add_script_tag(content=(app/'assets/js'/filename).read_text('utf-8'))
      page.evaluate('''()=>{
        const P=window.RaspehrGlobe.GlobeEngine.prototype;
        P.loadImageryStack=function(){return Promise.resolve({stubbed:true});};
        P.enableTerrain=function(){return Promise.resolve(false);};
        window.__v22Engine=new window.RaspehrGlobe.GlobeEngine(document.getElementById('globeMount'),()=>{},()=>{});
      }''')
      page.add_script_tag(content=(app/'assets/js/mobile-bottom-sheet.js').read_text('utf-8'))
      page.wait_for_function('window.__v22Engine && window.__v22Engine.renderer && window.__v22Engine.camera',timeout=15000)
      page.wait_for_timeout(120)
      # Canvas must exactly fill its host; inline intrinsic canvas layout must not offset it.
      geometry=page.evaluate('''()=>{
        const host=document.getElementById('globeMount').getBoundingClientRect();
        const canvas=window.__v22Engine.renderer.domElement.getBoundingClientRect();
        return {host:{x:host.x,y:host.y,width:host.width,height:host.height},
          canvas:{x:canvas.x,y:canvas.y,width:canvas.width,height:canvas.height}};
      }''')
      assert abs(geometry['host']['x']-geometry['canvas']['x'])<1,(name,geometry)
      assert abs(geometry['host']['y']-geometry['canvas']['y'])<1,(name,geometry)
      assert abs(geometry['host']['width']-geometry['canvas']['width'])<1,(name,geometry)
      assert abs(geometry['host']['height']-geometry['canvas']['height'])<1,(name,geometry)

      # The three controls become one short horizontal capsule, while mobile
      # hit boxes remain 44x44 CSS px.
      controls=page.evaluate('''()=>{
        const group=document.querySelector('.atlas-zoom-tools');
        const box=group.getBoundingClientRect(),toolbar=document.querySelector('.atlas-globe-toolbar').getBoundingClientRect();
        const buttons=[...group.querySelectorAll('button')].map(b=>{
          const r=b.getBoundingClientRect(),s=getComputedStyle(b);
          return {width:r.width,height:r.height,fontSize:s.fontSize,background:s.backgroundImage};
        });
        return {width:box.width,height:box.height,buttons,toolbar:{x:toolbar.x,y:toolbar.y,right:toolbar.right,bottom:toolbar.bottom}};
      }''')
      assert len(controls['buttons'])==3,(name,controls)
      assert controls['height']<=46,(name,'zoom group too tall',controls)
      assert controls['width']<=140,(name,'zoom group too wide',controls)
      if is_mobile:
        assert all(abs(b['width']-44)<1 and abs(b['height']-44)<1 for b in controls['buttons']),(name,controls)
        assert controls['toolbar']['x']>=-1 and controls['toolbar']['right']<=viewport['width']+1,(name,'toolbar clipped',controls)
      else:
        assert all(abs(b['width']-38)<1 and abs(b['height']-38)<1 for b in controls['buttons']),(name,controls)

      # A projected surface point and a Raycaster query must stay aligned after
      # applying the off-center camera projection (markers and clicks use this).
      raycheck=page.evaluate('''()=>{
        const e=window.__v22Engine,T=window.THREE;
        e.earth.visible=true;
        e.scene.updateMatrixWorld(true);e.camera.updateMatrixWorld(true);
        const localCamera=e.globeGroup.worldToLocal(e.camera.position.clone()).normalize().multiplyScalar(1.72);
        const worldPoint=e.earth.localToWorld(localCamera.clone());
        const ndc=worldPoint.clone().project(e.camera);
        const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(ndc.x,ndc.y),e.camera);
        const hits=ray.intersectObject(e.earth,true);
        return {hitCount:hits.length,error:hits.length?hits[0].point.distanceTo(worldPoint):999};
      }''')
      assert raycheck['hitCount']>0 and raycheck['error']<0.02,(name,'raycaster projection mismatch',raycheck)

      snap_results=[]
      if is_mobile:
        assert page.evaluate("document.body.classList.contains('mobile-sheet-ready')"),(name,'sheet not activated')
        # At collapsed and half snaps, center of the projected globe must equal
        # the center of the map area above the bottom sheet.
        for snap in ['collapsed','half']:
          page.evaluate('(snap)=>window.RaspehrMobileSheet.setSnap(snap)',snap)
          page.wait_for_timeout(300)
          result=page.evaluate('''()=>{
            const e=window.__v22Engine,p=document.getElementById('mobileMainSheet');
            const h=e.host.getBoundingClientRect(),s=p.getBoundingClientRect();
            const covered=Math.max(0,Math.min(h.bottom,s.bottom)-Math.max(h.top,s.top));
            const shift=e.camera.view&&e.camera.view.enabled?e.camera.view.offsetY:0;
            e.camera.updateMatrixWorld(true);
            const projected=new THREE.Vector3(0,0,0).project(e.camera);
            const screenY=(1-projected.y)*0.5*h.height;
            const expected=(h.height-covered)*0.5;
            return {snap:p.dataset.mobileSnap,covered,shift,screenY,expected,viewEnabled:!!(e.camera.view&&e.camera.view.enabled)};
          }''')
          assert result['viewEnabled'],(name,snap,result)
          assert abs(result['shift']-result['covered']/2)<1.5,(name,snap,result)
          assert abs(result['screenY']-result['expected'])<1.5,(name,snap,result)
          snap_results.append(result)
        # Full sheet covers nearly all of the map; do not make a huge camera pan
        # for a map that is intentionally hidden behind the sheet.
        page.evaluate("window.RaspehrMobileSheet.setSnap('full')")
        page.wait_for_timeout(300)
        full=page.evaluate('''()=>({enabled:!!(window.__v22Engine.camera.view&&window.__v22Engine.camera.view.enabled),
          panelTop:document.getElementById('mobileMainSheet').getBoundingClientRect().top})''')
        assert not full['enabled'],(name,'full sheet should not shift hidden map',full)
        # Rotation/resize recomputes the offset using the new sheet geometry.
        page.set_viewport_size({'width':390,'height':844})
        page.evaluate("window.RaspehrMobileSheet.setSnap('collapsed')")
        page.wait_for_timeout(350)
        resized=page.evaluate('''()=>{
          const e=window.__v22Engine,p=document.getElementById('mobileMainSheet');
          const h=e.host.getBoundingClientRect(),s=p.getBoundingClientRect();
          return {width:h.width,height:h.height,offset:e.camera.view&&e.camera.view.enabled?e.camera.view.offsetY:0,
            expected:Math.max(0,h.bottom-s.top)/2};
        }''')
        assert abs(resized['offset']-resized['expected'])<1.5,(name,'resize',resized)
      else:
        result=page.evaluate('''()=>{
          const e=window.__v22Engine;
          const projected=new THREE.Vector3(0,0,0).project(e.camera);
          return {viewEnabled:!!(e.camera.view&&e.camera.view.enabled),x:projected.x,y:projected.y};
        }''')
        assert not result['viewEnabled'] and abs(result['x'])<1e-6 and abs(result['y'])<1e-6,(name,result)

      assert not errors,(name,errors)
      summary[name]={'canvas':geometry,'controls':controls,'snapResults':snap_results,'pageErrors':len(errors)}
      context.close()
    browser.close()

# Cache-busting is part of the install contract: both the parent iframe and
# child resources must point at the new V22 versions.
parent_index=(root/'index.html').read_text('utf-8')
parent_switch=(root/'assets/js/raspehr-stage5-switch.js').read_text('utf-8')
child_index=(app/'index.html').read_text('utf-8')
assert 'raspehr-stage5-switch.js?v=20261127-ux-v22' in parent_index
assert 'raspehr-3d/index.html?raspehr_3d_embedded=1&v=20261127-v22' in parent_switch
assert 'atlas-viewport-v22.css?v=20261127-v22' in child_index
assert 'globe-engine.js?v=20261127-v22' in child_index
print('PASS V22 VIEWPORT/CAMERA/CONTROLS/CACHE',json.dumps(summary,ensure_ascii=False))
