/* RASPEHR Stage 04 — 3D-to-canonical dossier connector.
 * A lazy same-origin iframe runs the unmodified original profile renderers,
 * tab handlers, media gallery and country dossier, WITHOUT a second map renderer.
 */
(function(global){
 'use strict';
 const $=id=>document.getElementById(id);
 const overlay=$('dossierOverlay'), frame=$('dossierFrame'), status=$('dossierStatus');
 const close=$('dossierClose'), profileButton=$('entityFullProfile'), countryButton=$('countryProfileBtn'), countrySelect=$('entityCountry');
 let selected=null,catalog=null,ready=false,loading=false,pending=null,sequence=0,previousFocus=null;
 const url='../index.html?raspehr_profile_embedded=1';
 const origin=global.location.origin;
 function statusText(s){status.textContent=s||'';status.hidden=!s;}
 function activeOrigin(event){return event.origin===origin && event.source===frame.contentWindow;}
 function send(request){if(ready && frame.contentWindow)frame.contentWindow.postMessage({channel:'RASPEHR_STAGE4',type:'open',...request},origin);}
 function ensureFrame(){
   if(loading)return;
   loading=true;
   frame.hidden=false;
   frame.src=url;
 }
 function select(row){
   selected=row&&row.kind&&row.id ? row : null;
   profileButton.disabled=!selected;
 }
 function setCatalog(records){catalog=records;}
 function openRequest(request,title){
   previousFocus=document.activeElement;
   pending={...request,requestId:++sequence};
   $('dossierHeading').textContent=title||'شناسنامه کامل';
   overlay.hidden=false;
   document.body.classList.add('stage4-profile-open');
   statusText('در حال بارگذاری شناسنامه اصلی رسپهر…');
   close.focus({preventScroll:true});
   if(!loading)ensureFrame();
   else if(ready)send(pending);
 }
 function openSelected(){if(!selected)return;openRequest({kind:selected.kind,id:selected.id,category:selected.category},selected.fa||selected.en||'شناسنامه کامل');}
 function openCountry(){
   const name=countrySelect.value;
   if(!name || !catalog)return;
   const row=catalog.markers.find(r=>r.country===name) || catalog.all.find(r=>r.country===name);
   if(!row)return;
   const title=row.countryFa||name;
   openRequest({kind:'country',id:name,countryFa:title},title);
 }
 function hide(){
   overlay.hidden=true;
   document.body.classList.remove('stage4-profile-open');
   pending=null;
   if(previousFocus&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});
 }
 profileButton.disabled=true;
 close.addEventListener('click',hide);
 profileButton.addEventListener('click',openSelected);
 countryButton.addEventListener('click',openCountry);
 countrySelect.addEventListener('change',()=>{countryButton.disabled=!countrySelect.value;});
 $('entityClear').addEventListener('click',()=>queueMicrotask(()=>{countryButton.disabled=!countrySelect.value;}));
 global.addEventListener('keydown',event=>{
   if(overlay.hidden)return;
   if(event.key==='Escape'){
     // Embedded iframe handles its own media dialog first.
     if(document.activeElement!==frame){event.preventDefault();hide();}
   }
 });
 global.addEventListener('message',event=>{
   if(!activeOrigin(event))return;
   const data=event.data;
   if(!data || data.channel!=='RASPEHR_STAGE4')return;
   if(data.type==='ready'){
     ready=true;
     if(pending)send(pending);
   }else if(data.type==='close'){
     hide();
   }else if(data.type==='opened' && pending && data.requestId===pending.requestId){
     statusText('');
     $('dossierHeading').textContent=data.title||$('dossierHeading').textContent;
   }else if(data.type==='error' && (!data.requestId || (pending && data.requestId===pending.requestId))){
     statusText('بارگذاری ناموفق: '+(data.message||'خطای ناشناخته'));
   }
 });
 frame.addEventListener('error',()=>statusText('بارگذاری نمایشگر اصلی شناسنامه ناموفق بود.'));
 function getState(){return !overlay.hidden&&pending?{kind:pending.kind,id:pending.id,category:pending.category||pending.kind}:null;}
 function openByState(profile){
   if(!profile){hide();return;}
   const request={kind:profile.kind,id:profile.id,category:profile.category};
   let title=profile.id;
   if(catalog){const row=catalog.all.find(item=>item.id===profile.id&&item.kind===profile.kind);
     if(row)title=row.fa||row.en||title;}
   openRequest(request,title);
 }
 global.RaspehrStage4={select,setCatalog,openSelected,openCountry,hide,getState,openByState};
})(window);
