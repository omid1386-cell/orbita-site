/* RASPEHR Stage 04 — same-origin RPC bridge to the existing 2D dossier renderer.
 * No duplicate profile data, formatting, media permissions or tab markup.
 * This script is inert in the normal 2D application.
 */
(function(global){
 'use strict';
 if(!global.RASPEHR_PROFILE_EMBEDDED || global.parent===global)return;
 const localOrigin=global.location.origin;
 const validKind=new Set(['company','site','recovery','country']);
 const validCategory=new Set(['launch','propulsion','agency','satmaker','components','payloads','ground_services','inspace_services','university_space','test_facility','ground_station','mission_control']);
 let requestSequence=0;
 function notify(type,fields){global.parent.postMessage(Object.assign({channel:'RASPEHR_STAGE4',type},fields||{}),localOrigin);}
 function validId(s){return typeof s==='string' && s.length>0 && s.length<=180 && /^[\p{L}\p{N}_: .+\-\/()’'&,]+$/u.test(s);}
 async function openRequest(data,sequence){
   const kind=data.kind, id=data.id, cat=data.category;
   if(!validKind.has(kind))throw new Error('نوع شناسنامه معتبر نیست.');
   if(!validId(id))throw new Error('شناسه شناسنامه معتبر نیست.');
   if(typeof global.openDetail!=='function' || typeof global.retryLayer!=='function')throw new Error('موتور شناسنامه آماده نیست.');
   if(kind==='country'){
     // Keep source/canonical name for country matching; UI display is localized by main app.
     const countryFa=(typeof data.countryFa==='string' && data.countryFa.length<160) ? data.countryFa : id;
     global.openDetail({kind:'country',cat:'country',country_en:id,country_fa:countryFa});
   }else{
     if(kind==='company' && !validCategory.has(cat))throw new Error('دسته شناسنامه معتبر نیست.');
     const layer=kind==='company'?cat:kind==='site'?'sites':'recoveries';
     const loaded=await global.retryLayer(layer);
     if(!loaded)throw new Error('بارگذاری اطلاعات شناسنامه ناموفق بود.');
     if(sequence!==requestSequence)return;
     const registry=global.DATA || {};
     const rows=kind==='company'?registry.companies:kind==='site'?registry.sites:registry.recoveries;
     if(!Array.isArray(rows))throw new Error('فهرست شناسنامه موجود نیست.');
     const row=rows.find(item=>item && String(item.id)===id);
     if(!row)throw new Error('شناسه انتخاب‌شده در داده‌های اصلی پیدا نشد.');
     // The verified specialist renderer uses the entity's primary category.
     const dossierCategory=kind==='company' && validCategory.has(row.cat) ? row.cat : (kind==='company'?cat:kind);
     global.openDetail({kind,cat:dossierCategory,o:row});
   }
   if(sequence!==requestSequence)return;
   const body=document.getElementById('detailBody');
   const panel=document.getElementById('detail');
   if(!body || !panel || !panel.classList.contains('open'))throw new Error('نمایشگر شناسنامه باز نشد.');
   panel.scrollTop=0;
   // Inform parent immediately; media may arrive asynchronously via the original gallery.
   notify('opened',{requestId:data.requestId,kind,id,title:body.querySelector('.d-title')?.textContent?.trim()||id});
 }
 global.addEventListener('message',event=>{
   if(event.origin!==localOrigin || event.source!==global.parent)return;
   const data=event.data;
   if(!data || data.channel!=='RASPEHR_STAGE4' || data.type!=='open')return;
   const sequence=++requestSequence;
   openRequest(data,sequence).catch(err=>{
     if(sequence===requestSequence)notify('error',{requestId:data.requestId,message:err?.message||'خطا در بازکردن شناسنامه'});
   });
 });
 global.document.addEventListener('keydown',event=>{
   if(event.key==='Escape' && !global.document.querySelector('dialog[open]'))notify('close');
 });
 // App's deferred app.js executes before this deferred script.
 if(typeof global.openDetail==='function' && typeof global.retryLayer==='function')notify('ready');
 else notify('error',{message:'موتور شناسنامه در دسترس نیست.'});
})(window);
