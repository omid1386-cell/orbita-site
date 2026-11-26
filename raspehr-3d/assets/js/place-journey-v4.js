/* RASPEHR V4 — lightweight journey between discovery and the canonical dossier.
 * Deliberately no new imagery, image loading, tracking or persistent storage.
 * The existing Stage3 controller remains the only owner of marker selection.
 */
(function(root,factory){
 'use strict';
 const api=factory(root);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RaspehrPlaceJourney=api;
})(typeof window!=='undefined'?window:null,function(root){
 'use strict';
 const $=id=>root.document.getElementById(id);
 const history=[];
 let catalog=null,goTo=null,current=null;
 function approximate(row){
   const note=String(row&&row.precision||'')+' '+String(row&&row.coordinateNote||'');
   return /approx|representative|reference|city|locality|region|area|campus|district|town|تقریبی|مرجع|نماینده|ناحیه|شهر|محوطه|پردیس/i.test(note);
 }
 function positionStatus(row){
   if(!row || !Number.isFinite(row.lat)||!Number.isFinite(row.lon))return {label:'مختصات ثبت نشده',note:'مکان را از شناسنامه اصلی بررسی کنید.',approximate:false};
   if(approximate(row))return {label:'نقطه مرجع تقریبی',note:'مختصات معادل محل دقیق ساختمان یا سکو نیست.',approximate:true};
   return {label:'مختصات ثبت‌شده',note:'دقت مکانی را در جزئیات و شناسنامه بررسی کنید.',approximate:false};
 }
 function formatCoords(row){
   if(!row || !Number.isFinite(row.lat)||!Number.isFinite(row.lon))return '';
   const digits=approximate(row)?2:6;
   return row.lat.toFixed(digits)+', '+row.lon.toFixed(digits);
 }
 function renderHistory(){
   const section=$('atlasRecentLocations'),list=$('atlasRecentList');
   if(!section||!list)return;
   section.hidden=history.length===0;list.replaceChildren();
   history.forEach(key=>{
     const row=catalog&&catalog.markers.find(item=>item.key===key);
     if(!row)return;
     const b=root.document.createElement('button');b.type='button';b.className='atlas-recent-item';
     b.setAttribute('aria-label','بازگشت به '+row.fa);
     const name=root.document.createElement('strong');name.textContent=row.fa;
     const loc=root.document.createElement('small');loc.textContent=[row.countryFa||row.country,row.cityFa||row.city].filter(Boolean).join('، ');
     b.append(name,loc);
     b.addEventListener('click',()=>{if(goTo)goTo(row);});
     list.appendChild(b);
   });
 }
 function select(row){
   current=row||null;
   const position=$('atlasLocationPosition'),note=$('atlasLocationPositionNote');
   if(current){
     const state=positionStatus(current);
     if(position){position.textContent=state.label;position.classList.toggle('is-approximate',state.approximate);}
     if(note)note.textContent=state.note;
     if(catalog){
       const i=history.indexOf(current.key);if(i>=0)history.splice(i,1);
       history.unshift(current.key);if(history.length>5)history.pop();
       renderHistory();
     }
   }else{
     if(position)position.textContent='';if(note)note.textContent='';
   }
   const feedback=$('atlasPlaceActionStatus');if(feedback)feedback.textContent='';
   if(current && root && typeof root.dispatchEvent==='function' && typeof root.CustomEvent==='function'){
     root.dispatchEvent(new root.CustomEvent('raspehr:place-selected',{detail:{key:current.key}}));
   }
 }
 async function copyCoords(){
   const feedback=$('atlasPlaceActionStatus'),value=formatCoords(current);
   if(!feedback)return false;
   if(!value){feedback.textContent='مختصات معتبری برای کپی در دسترس نیست.';return false;}
   try{
     if(!root.navigator.clipboard||typeof root.navigator.clipboard.writeText!=='function')throw new Error('clipboard unsupported');
     await root.navigator.clipboard.writeText(value);
     feedback.textContent='مختصات کپی شد.';return true;
   }catch(_){
     // In non-secure environments avoid pretending that copy worked.
     feedback.textContent='کپی خودکار در این مرورگر ممکن نشد؛ مختصات را از بخش جزئیات انتخاب و کپی کنید.';
     const details=$('selectedLocationCoordinates')&&$('selectedLocationCoordinates').closest('details');
     if(details)details.open=true;
     return false;
   }
 }
 function backToExplore(){
   const sheet=root.RaspehrMobileSheet;
   if(sheet){
     if(sheet.getState&&sheet.getState().enabled)sheet.setTab('filters',{snap:'half'});
     else {sheet.setDesktopCollapsed(false);sheet.setSection('explore');}
   }
   const input=$('entitySearch');
   if(input)input.focus({preventScroll:true});
 }
 function connect(data,navigate){
   catalog=data||null;goTo=typeof navigate==='function'?navigate:null;
   if(current&&current.key&&catalog&&catalog.markers.some(row=>row.key===current.key)){
     history.unshift(current.key);
   }
   renderHistory();
 }
 function clearRecent(){history.splice(0);renderHistory();}
 const doc=root&&root.document;
 if(doc){
   const copy=$('atlasCopyCoordinates'),back=$('atlasBackToExplore'),clear=$('atlasRecentClear');
   if(copy)copy.addEventListener('click',copyCoords);
   if(back)back.addEventListener('click',backToExplore);
   if(clear)clear.addEventListener('click',clearRecent);
 }
 return {select,connect,positionStatus,formatCoords,copyCoords,backToExplore,clearRecent,getRecentKeys:()=>history.slice()};
});
