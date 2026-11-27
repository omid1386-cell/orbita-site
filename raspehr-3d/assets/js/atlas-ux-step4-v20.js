/* RASPEHR UX V20: single DOM card, dock on desktop, three-state sheet on mobile.
 * The legacy controller continues to own marker selection, close and data loading.
 */
(function(global){
 'use strict';
 const doc=global.document;
 const $=id=>doc.getElementById(id);
 const card=$('selectedLocationCard'),slot=$('mobileSelectedSlot');
 const placeTab=$('atlasDesktopPlaceTab'),panel=$('mobileMainSheet');
 if(!card||!slot||!placeTab||!panel)return;
 const mobile=global.matchMedia('(max-width:700px)');
 let lastOpen=false,wasDesktop=!mobile.matches;
 function setPlaceView(show){
   if(mobile.matches)return;
   doc.body.classList.toggle('atlas-desktop-place-active',!!show);
   placeTab.classList.toggle('is-active',!!show);
   placeTab.setAttribute('aria-pressed',String(!!show));
   if(show){
     doc.querySelectorAll('[data-atlas-tab]').forEach(button=>{
       button.classList.remove('is-active');button.setAttribute('aria-pressed','false');
     });
   }else{
     // Preserve whatever non-place tab the existing navigator selected.
     const section=panel.dataset.atlasSection||'explore';
     const active=doc.querySelector('[data-atlas-tab="'+section+'"]');
     if(active){active.classList.add('is-active');active.setAttribute('aria-pressed','true');}
   }
 }
 function sync(){
   if(mobile.matches){
     doc.body.classList.remove('atlas-desktop-place-active');
     placeTab.hidden=true;placeTab.disabled=true;lastOpen=!card.hidden;wasDesktop=false;
     return;
   }
   const switchedToDesktop=!wasDesktop;wasDesktop=true;
   // Once the mobile-sheet controller has activated desktop mode, place the
   // *same* selected-location DOM node in the dedicated sidebar slot.
   if(card.parentElement!==slot)slot.appendChild(card);
   const opened=!card.hidden;
   placeTab.hidden=!opened;placeTab.disabled=!opened;
   if(opened && (!lastOpen||switchedToDesktop)){
     const sheet=global.RaspehrMobileSheet;
     if(sheet && sheet.setDesktopCollapsed)sheet.setDesktopCollapsed(false);
     setPlaceView(true);
     const body=$('mobileSheetBody');if(body)body.scrollTop=0;
   }else if(!opened && lastOpen){
     setPlaceView(false);
   }
   lastOpen=opened;
 }
 placeTab.addEventListener('click',()=>{if(!placeTab.disabled)setPlaceView(true);});
 doc.querySelectorAll('[data-atlas-tab]').forEach(button=>{
   button.addEventListener('click',()=>setPlaceView(false));
 });
 const back=$('atlasBackToExplore');
 if(back)back.addEventListener('click',()=>setPlaceView(false));
 new MutationObserver(sync).observe(card,{attributes:true,attributeFilter:['hidden']});
 global.addEventListener('raspehr:place-selected',()=>{
   sync();
   if(!mobile.matches && !card.hidden){
     const sheet=global.RaspehrMobileSheet;
     if(sheet && sheet.setDesktopCollapsed)sheet.setDesktopCollapsed(false);
     setPlaceView(true); // Selecting another marker also reopens its details.
     const body=$('mobileSheetBody');if(body)body.scrollTop=0;
   }
 });
 const onResize=()=>global.requestAnimationFrame(sync);
 if(mobile.addEventListener)mobile.addEventListener('change',onResize);
 else mobile.addListener(onResize);
 // Resize listener protects against device rotation and browser emulation.
 global.addEventListener('resize',()=>{
   if(!mobile.matches && card.parentElement!==slot)onResize();
 });
 sync();
 global.RaspehrUxV20={sync,setPlaceView};
})(window);
