/* Stage 05 — same-page switch, no duplicate 2D map or URL reload. */
(function(global){
 'use strict';
 if(global.RASPEHR_PROFILE_EMBEDDED)return; // never recurse into dossier iframe
 const root=global.document,button=root.getElementById('raspehrStage5Toggle');
 const overlay=root.getElementById('raspehr3dOverlay'),frame=root.getElementById('raspehrStage5Frame'),status=root.getElementById('raspehrStage5Status');
 if(!button||!overlay||!frame)return;
 const origin=global.location.origin;let loaded=false,ready=false,active=false,revision=0,pendingTimer=0;
 function note(message){status.textContent=message||'';status.hidden=!message;}
 function toggleVisual(on){active=on;overlay.hidden=!on;root.body.classList.toggle('raspehr-stage5-active',on);
  button.setAttribute('aria-pressed',String(on));button.textContent=on?'🗺 بازگشت به نقشه دوبعدی':'🌐 نمای سه‌بعدی';}
 function send(type,state,requestId){if(frame.contentWindow)frame.contentWindow.postMessage({channel:'RASPEHR_STAGE5',type,state,requestId},origin);}
 function stage6Visible(visible){if(ready)send('stage6-visibility',{visible:!!visible},revision);}
 function activate(){
  if(!global.RaspehrStage5MapAdapter){note('نقشه دوبعدی هنوز آماده نیست.');return;}
  revision++;global.clearTimeout(pendingTimer);
  toggleVisual(true);note(ready?'':'در حال آماده‌سازی کره سه‌بعدی…');
  if(!loaded){loaded=true;frame.src='raspehr-3d/index.html?raspehr_3d_embedded=1&v=20261125-local-gallery1';}
  else if(ready){stage6Visible(true);send('apply',global.RaspehrStage5MapAdapter.getState(),revision);note('');}
 }
 function finishBack(state,message){
  global.clearTimeout(pendingTimer);
  if(state){Promise.resolve(global.RaspehrStage5MapAdapter.applyState(state)).catch(function(err){console.warn('[Stage5] 2D state restore',err);});}
  toggleVisual(false);stage6Visible(false);note(message||'');button.focus({preventScroll:true});
  try{global.map && global.map.resize && global.map.resize();}catch(_){/* keep view */}
 }
 function deactivate(){
  if(!active)return;
  revision++;global.clearTimeout(pendingTimer);
  if(!ready){finishBack(null);return;}
  note('در حال انتقال موقعیت و فیلترها…');const ticket=revision;
  send('snapshot',null,ticket);
  pendingTimer=global.setTimeout(()=>{if(ticket===revision){finishBack(null,'پاسخی از کره دریافت نشد؛ بازگشت بدون انتقال تغییرات جدید.');}},4000);
 }
 button.addEventListener('click',()=>active?deactivate():activate());
 frame.addEventListener('error',()=>note('بارگذاری نمای سه‌بعدی ناموفق بود. به نمای دوبعدی برگردید.'));
 global.addEventListener('message',event=>{
  if(event.origin!==origin || event.source!==frame.contentWindow)return;
  const d=event.data;
  if(!d || d.channel!=='RASPEHR_STAGE5')return;
  if(d.type==='ready'){
   ready=true;
   stage6Visible(active);
   if(active){send('apply',global.RaspehrStage5MapAdapter.getState(),revision);note('');}
  }else if(d.type==='snapshot' && active && d.requestId===revision){finishBack(d.state);}
  else if(d.type==='switchTo2d' && active){revision++;finishBack(d.state);}
  else if(d.type==='failure'){note('نمای سه‌بعدی با خطا مواجه شد: '+String(d.message||'').slice(0,180));}
 });
 global.RaspehrStage5Switch={activate,deactivate,isActive:()=>active};
})(window);
