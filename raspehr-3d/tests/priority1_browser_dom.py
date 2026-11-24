#!/usr/bin/env python3
"""In-memory Chromium DOM test (no HTTP or file navigation required).
Does not claim to validate live WebGL/Render; checks cluster UI anchoring/reuse.
"""
import json, re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
SUB=ROOT/'raspehr-3d'
html=(SUB/'index.html').read_text()
html=re.sub(r'<link rel="stylesheet"[^>]*>', '', html)
html=re.sub(r'<script\s+src="[^"]+"\s*></script>', '', html)
html=html.replace('</head>','<style>'+ (SUB/'assets/css/prototype.css').read_text()+'</style></head>')
raw={
  'company':json.loads((ROOT/'data/companies.json').read_text()),
  'site':json.loads((ROOT/'data/sites.json').read_text()),
  'recovery':json.loads((ROOT/'data/recovery_sites.json').read_text())['sites']
}
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 for label,width,height in [('desktop',1200,800),('mobile',390,844)]:
  page=browser.new_page(viewport={'width':width,'height':height})
  problems=[]
  page.on('pageerror',lambda e:problems.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  for script in ['entity-data.js','entity-explore.js','entity-stage3-ui.js']:
   page.add_script_tag(content=(SUB/'assets/js'/script).read_text())
  page.evaluate('''(raw)=>{
    const catalog=window.RaspehrEntityData.buildRecords(raw);
    const mount=document.getElementById('globeMount');
    const canvas=document.createElement('canvas');canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%';
    mount.appendChild(canvas);
    const observers=[];
    const engine={
      globeGroup:{rotation:{x:0,y:0}},
      scene:{updateMatrixWorld(){}},camera:{position:{z:5.55},updateMatrixWorld(){},fov:42},
      target:{rx:0,ry:0,distance:5.55},controls:new Map(),dragVelocity:{x:0,y:0},
      active:true,stopped:false,renderer:{domElement:canvas},
      addFrameObserver(fn){observers.push(fn);return()=>{const i=observers.indexOf(fn);if(i>=0)observers.splice(i,1);}}
    };
    const markers={
      setDisplay(a,b){this.singles=a;this.clusters=b;return true;},
      setVisible(){},clearSelection(){},focus(){},select(){return true;},
      projectAnchor(row,box,pad=0){
        const theta=(row.lon+90)*Math.PI/180+engine.globeGroup.rotation.y;
        const lat=row.lat*Math.PI/180;
        if(Math.cos(theta)*Math.cos(lat)<0.28)return null;
        const x=box.width/2+Math.sin(theta)*Math.cos(lat)*box.height*.35;
        const y=box.height/2-Math.sin(lat)*box.height*.35;
        if(x<pad||x>box.width-pad||y<pad||y>box.height-pad)return null;
        return {x,y,visible:true};
      }
    };
    window.__stage=new window.RaspehrStage3.Controller(engine,markers,catalog,()=>{});
    window.__mock={engine,markers,observers,catalog};
  }''',raw)
  initial=page.evaluate('''()=>({checked:[...document.querySelectorAll('.category-checkbox:checked')].map(x=>x.value),all:document.querySelectorAll('.category-checkbox').length,bubbles:document.querySelectorAll('.cluster-bubble').length,shown:document.querySelectorAll('.cluster-bubble:not([hidden])').length, pinned:window.__mock.markers.singles.length})''')
  assert initial['checked']==['agency','site'],(label,initial)
  assert initial['all']==14 and initial['bubbles']>0,(label,initial)
  # Force the DOM badges to move while drag is ongoing; membership and DOM identity must remain unchanged.
  result=page.evaluate('''()=>{
    const m=window.__mock,stage=window.__stage;
    const nodes=[...document.querySelectorAll('.cluster-bubble')];
    const a=nodes.find(n=>!n.hidden);
    const left=a?parseFloat(a.style.left):null;
    m.engine.controls.set(1,{});
    m.engine.globeGroup.rotation.y+=.22;
    m.observers.forEach(fn=>fn(performance.now()));
    stage.refreshView(false);
    const right=a?parseFloat(a.style.left):null;
    const preserved=nodes.every(n=>n.parentNode===stage.overlay);
    m.engine.controls.clear();
    return {before:left,after:right,preserved,clusterCount:nodes.length};
  }''')
  assert result['preserved'] and result['clusterCount']==initial['bubbles'],(label,result)
  assert result['before'] is not None and result['after'] is not None and result['before']!=result['after'],(label,result)
  # Filtering should retain correct 14 categories while only two default on.
  page.locator('#categoryAll').click();page.wait_for_timeout(20)
  assert page.locator('.category-checkbox:checked').count()==14
  page.locator('#categoryNone').click();page.wait_for_timeout(20)
  assert page.locator('.category-checkbox:checked').count()==0
  assert page.evaluate('''()=>window.__stage.filtered.length''')==0
  page.locator('#entityClear').click();page.wait_for_timeout(20)
  assert page.locator('.category-checkbox:checked').count()==14
  assert not problems,(label,problems)
  print('PASS',label,json.dumps({'default':initial,'drag':result},ensure_ascii=False))
  page.close()
 browser.close()
