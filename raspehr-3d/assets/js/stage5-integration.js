/* Stage 05 — strictly same-origin state exchange with main 2D view. */
(function(global){
 'use strict';
 const embedded=new URLSearchParams(global.location.search).get('raspehr_3d_embedded')==='1' && global.parent!==global;
 if(!embedded)return;
 const origin=global.location.origin,model=global.RaspehrStage5State;
 let engine=null,controller=null,catalog=null,latest=0;
 const back=global.document.getElementById('stage5BackToMap');
 back.hidden=false;
 function reply(type,fields){global.parent.postMessage(Object.assign({channel:'RASPEHR_STAGE5',type},fields||{}),origin);}
 function current(){
  const g=engine.target,scale=180/Math.PI;
  const data=controller.getState();
  return model.normalize(Object.assign({},data,{
   camera:{lat:g.rx*scale,lon:model.wrapLon(-90-g.ry*scale),zoom:model.distanceToZoom(g.distance)},
   profile:global.RaspehrStage4?.getState()||null
  }));
 }
 function apply(s){
  const state=controller.applyState(s),rad=Math.PI/180;
  engine.target.rx=state.camera.lat*rad;
  engine.target.ry=(-90-state.camera.lon)*rad;
  engine.target.distance=model.zoomToDistance(state.camera.zoom);
  engine.dragVelocity.x=0;engine.dragVelocity.y=0;
  const row=state.profile&&catalog.markers.find(r=>r.kind===state.profile.kind&&r.id===state.profile.id);
  if(row){controller.selectRecord(row);}
  global.RaspehrStage4?.openByState(state.profile);
  return state;
 }
 global.addEventListener('message',event=>{
  if(event.origin!==origin||event.source!==global.parent)return;
  const d=event.data;
  if(!d||d.channel!=='RASPEHR_STAGE5')return;
  if(d.type==='apply'){
    latest=Math.max(latest,Number(d.requestId)||0);
    if(!engine||!controller){reply('failure',{message:'نشانگرهای سه‌بعدی هنوز آماده نیستند.'});return;}
    try{apply(d.state);}catch(err){reply('failure',{message:err.message||String(err)});}
  }else if(d.type==='stage6-visibility' && engine){
    engine.setActive(!!(d.state && d.state.visible));
  }else if(d.type==='snapshot' && engine && controller){
    reply('snapshot',{requestId:d.requestId,state:current()});
  }
 });
 back.addEventListener('click',()=>{
   if(!engine||!controller)return;
   reply('switchTo2d',{state:current()});
 });
 global.RaspehrStage5Child={
  mount(e,c,rows){engine=e;controller=c;catalog=rows;reply('ready');},
  fail(error){reply('failure',{message:error&&error.message||'خطا در موتور سه‌بعدی'});}
 };
})(window);
