/* RASPEHR local-only photo explorer. A still image is never presented as a 360° panorama. */
(function(global){
 'use strict';
 const $=id=>document.getElementById(id);
 const manifestUrl='data/site-views-local.v1.json?v=20261125-local-gallery1';
 const allowed=/^assets\/site-views\/photos\/[a-z0-9-]+\.jpg$/;
 let catalogue=new Map(),selection=null,loaded=false,open=false,scale=1.45,dx=0,dy=0,activePointer=null,originX=0,originY=0,returnFocus=null,pinchDistance=0;
 const pointers=new Map();
 const preview=$('siteViewPreview'),previewImage=$('siteViewPreviewImage'),previewTitle=$('siteViewPreviewTitle'),previewNote=$('siteViewPreviewNote');
 const modal=$('siteViewDialog'),stage=$('siteViewStage'),image=$('siteViewImage'),title=$('siteViewTitle'),kind=$('siteViewKind'),caption=$('siteViewCaption'),source=$('siteViewSource'),rights=$('siteViewRights');
 const amount=$('siteViewZoom');
 function recordFor(row){return row&&row.kind==='site'?catalogue.get(row.id):null;}
 function itemFor(row){const rec=recordFor(row);return rec&&Array.isArray(rec.files)&&rec.files.length?rec.files[0]:null;}
 function validatedPath(item){return item && typeof item.src==='string'&&allowed.test(item.src)?item.src:null;}
 function limits(){
  if(!image.naturalWidth||!stage.clientWidth||!stage.clientHeight)return {x:0,y:0};
  const factor=Math.min(stage.clientWidth/image.naturalWidth,stage.clientHeight/image.naturalHeight);
  const w=image.naturalWidth*factor*scale,h=image.naturalHeight*factor*scale;
  return {x:Math.max(0,(w-stage.clientWidth)/2),y:Math.max(0,(h-stage.clientHeight)/2)};
 }
 function render(){const lim=limits();dx=Math.max(-lim.x,Math.min(lim.x,dx));dy=Math.max(-lim.y,Math.min(lim.y,dy));image.style.transform=`translate3d(${dx}px,${dy}px,0) scale(${scale})`;amount.textContent=Math.round(scale*100).toLocaleString('fa-IR')+'٪';}
 function zoomBy(factor){scale=Math.min(5,Math.max(1,scale*factor));render();}
 function reset(){scale=1.45;dx=dy=0;render();}
 function showPreview(row){
  selection=row||null;const record=recordFor(row),file=itemFor(row),path=validatedPath(file);
  preview.hidden=!path;
  if(!path)return;
  previewImage.src=path;previewImage.alt=(record.fa||row.fa)+' — '+record.status_fa;
  previewTitle.textContent='دیدن محیط پایگاه و جابه‌جایی در تصویر';
  previewNote.textContent=record.status_fa+' · یک عکس واقعی ذخیره‌شده در رسپهر؛ نمای ۳۶۰ درجه نیست.';
 }
 function show(){
  if(!loaded)return false;
  const record=recordFor(selection),file=itemFor(selection),path=validatedPath(file);
  if(!path)return false;
  returnFocus=document.activeElement;
  title.textContent=record.fa;
  kind.textContent=record.status_fa;
  caption.textContent=(file.caption_fa||record.status_fa)+' · تصویر ثابت؛ برای دیدن بخش‌های مختلف، عکس را بکشید یا بزرگ کنید.';
  rights.textContent='اعتبار: '+(file.credit||'نامشخص')+' · '+(file.license||'حق استفاده نامشخص');
  if(typeof file.source_url==='string'&&/^https:\/\//.test(file.source_url)){source.hidden=false;source.href=file.source_url;}else{source.hidden=true;source.removeAttribute('href');}
  image.alt=(record.fa||'پایگاه')+' — '+record.status_fa;
  image.src=path;
  modal.hidden=false;open=true;document.body.classList.add('site-view-open');reset();$('siteViewClose').focus({preventScroll:true});return true;
 }
 function close(){if(!open)return;modal.hidden=true;open=false;image.removeAttribute('src');activePointer=null;pointers.clear();pinchDistance=0;document.body.classList.remove('site-view-open');if(returnFocus&&returnFocus.isConnected)returnFocus.focus({preventScroll:true});}
 function select(row){if(open)close();showPreview(row);}
 function install(){
  $('siteViewPreviewOpen').addEventListener('click',show);$('siteViewClose').addEventListener('click',close);
  $('siteViewZoomIn').addEventListener('click',()=>zoomBy(1.27));$('siteViewZoomOut').addEventListener('click',()=>zoomBy(1/1.27));$('siteViewReset').addEventListener('click',reset);
  $('siteViewPanLeft').addEventListener('click',()=>{dx-=65;render();});$('siteViewPanRight').addEventListener('click',()=>{dx+=65;render();});
  $('siteViewPanUp').addEventListener('click',()=>{dy+=65;render();});$('siteViewPanDown').addEventListener('click',()=>{dy-=65;render();});
  stage.addEventListener('pointerdown',event=>{
   if(!open||event.button>0)return;
   pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
   stage.setPointerCapture(event.pointerId);stage.classList.add('is-dragging');
   if(pointers.size===1){activePointer=event.pointerId;originX=event.clientX-dx;originY=event.clientY-dy;}
   else if(pointers.size===2){activePointer=null;const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);}
   event.preventDefault();
  });
  stage.addEventListener('pointermove',event=>{
   if(!pointers.has(event.pointerId))return;
   pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
   if(pointers.size>=2){
    const [a,b]=[...pointers.values()];const next=Math.hypot(a.x-b.x,a.y-b.y);
    if(pinchDistance>2&&next>2){scale=Math.max(1,Math.min(5,scale*next/pinchDistance));render();}
    pinchDistance=next;
   }else if(event.pointerId===activePointer){dx=event.clientX-originX;dy=event.clientY-originY;render();}
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(name,event=>{
   if(!pointers.delete(event.pointerId))return;
   if(!pointers.size){activePointer=null;pinchDistance=0;stage.classList.remove('is-dragging');}
   else if(pointers.size===1){const [id,pos]=[...pointers.entries()][0];activePointer=id;originX=pos.x-dx;originY=pos.y-dy;pinchDistance=0;}
  });
  stage.addEventListener('wheel',event=>{if(!open)return;event.preventDefault();zoomBy(event.deltaY<0?1.16:1/1.16);},{passive:false});
  image.addEventListener('load',render);
  image.addEventListener('error',()=>{$('siteViewMissing').hidden=false;stage.querySelector('img').hidden=true;});
  image.addEventListener('load',()=>{$('siteViewMissing').hidden=true;image.hidden=false;});
  document.addEventListener('keydown',event=>{if(!open)return;const tag=(event.target.tagName||'').toLowerCase();if(event.key==='Escape'){event.preventDefault();close();return;}
   if(['input','textarea','select'].includes(tag))return;
   const key=event.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(key))return;event.preventDefault();
   if(key==='ArrowLeft')dx-=64;else if(key==='ArrowRight')dx+=64;else if(key==='ArrowUp')dy+=64;else if(key==='ArrowDown')dy-=64;else if(key==='+'||key==='='){zoomBy(1.25);return;}else if(key==='-'){zoomBy(.8);return;}else if(key==='0'){reset();return;}render();});
  modal.addEventListener('keydown',event=>{
   if(event.key!=='Tab')return;
   const focusable=[...modal.querySelectorAll('button:not([disabled]),a[href]')].filter(el=>!el.hidden);
   if(!focusable.length)return;
   const first=focusable[0],last=focusable[focusable.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  global.addEventListener('resize',()=>{if(open)render();});
 }
 async function init(){install();try{
   const r=await global.fetch(manifestUrl,{cache:'no-cache'});if(!r.ok)throw new Error('HTTP '+r.status);
   const data=await r.json();if(!data||!Array.isArray(data.sites)||data.sites.length!==79)throw new Error('Invalid 79-site manifest');
   catalogue=new Map(data.sites.map(x=>[x.id,x]));loaded=true;if(selection)showPreview(selection);
  }catch(error){console.warn('[RASPEHR local site views] Local image catalog unavailable:',error);}
 }
 global.RaspehrSiteViews={init,select,open:show,close,getStatus:()=>({loaded,count:catalogue.size,selected:selection&&selection.id,opened:open})};
 init();
})(window);
