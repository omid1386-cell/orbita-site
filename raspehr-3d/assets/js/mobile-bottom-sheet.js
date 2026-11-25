/* RASPEHR Priority 4 — mobile bottom-sheet interaction layer.
 * No duplicated profiles, data, renderers or map; moves the existing quick card.
 * Three snap states: collapsed, half, full. Desktop DOM is restored on resize.
 */
(function(global){
 'use strict';
 const $=id=>document.getElementById(id);
 const panel=$('mobileMainSheet'), header=$('mobileSheetHeader'), body=$('mobileSheetBody');
 const globe=$('globeMount'), card=$('selectedLocationCard'), slot=$('mobileSelectedSlot');
 const shortcuts=$('mobileMapShortcuts'), mapPlace=$('mobileMapPlace'), placeTab=$('mobileLocationTab');
 const dossier=$('dossierOverlay'), dossierBar=$('mobileDossierBar');
 const media=global.matchMedia('(max-width: 700px)');
 const states=['collapsed','half','full'];
 const tabNames={filters:'مکان‌ها و فیلترها',place:'مکان انتخاب‌شده',controls:'کنترل‌های نقشه'};
 const state={enabled:false,snap:'half',tab:'filters',dossierSnap:'full',dragging:false};
 const cardParent=card.parentNode, cardNext=card.nextSibling;
 const initialFocus=$('entitySearch');
 let selectionWasOpen=!card.hidden,clusterWasOpen=!$('clusterCard').hidden;
 const dragThreshold=54;
 function validSnap(v){return states.includes(v)?v:'half';}
 function syncButtons(selector,value,attribute){
   for(const btn of document.querySelectorAll(selector)){
     const active=btn.getAttribute(attribute)===value;
     btn.classList.toggle('is-active',active);
     btn.setAttribute('aria-pressed',String(active));
   }
 }
 function setSnap(value){
   state.snap=validSnap(value);panel.dataset.mobileSnap=state.snap;
   syncButtons('button[data-mobile-snap]',state.snap,'data-mobile-snap');
   $('mobileSheetHandle').setAttribute('aria-expanded',String(state.snap!=='collapsed'));
   return state.snap;
 }
 function setTab(value,opts){
   const next=(value==='place' && card.hidden)?'filters':(tabNames[value]?value:'filters');
   state.tab=next;panel.dataset.mobileTab=next;
   $('mobileSheetTitle').textContent=tabNames[next];
   syncButtons('button[data-mobile-tab]',next,'data-mobile-tab');
   if(opts&&opts.snap)setSnap(opts.snap);
   if(opts&&opts.focusSearch&&next==='filters')initialFocus.focus({preventScroll:true});
   body.scrollTop=0;
   return next;
 }
 function setDossierSnap(value){
   state.dossierSnap=validSnap(value);dossier.dataset.mobileSnap=state.dossierSnap;
   syncButtons('[data-dossier-snap]',state.dossierSnap,'data-dossier-snap');
   dossier.setAttribute('aria-modal',String(!state.enabled||state.dossierSnap==='full'));
   $('mobileDossierHandle').setAttribute('aria-expanded',String(state.dossierSnap!=='collapsed'));
   return state.dossierSnap;
 }
 function syncSelection(){
   const hasLocation=!card.hidden;
   placeTab.disabled=!hasLocation;mapPlace.disabled=!hasLocation;
   if(!state.enabled){selectionWasOpen=hasLocation;return;}
   if(hasLocation&&!selectionWasOpen)setTab('place',{snap:'half'});
   else if(!hasLocation && state.tab==='place')setTab('filters',{snap:'half'});
   selectionWasOpen=hasLocation;
 }
 function syncCluster(){
   const active=!$('clusterCard').hidden;
   if(state.enabled && active && !clusterWasOpen)setTab('filters',{snap:'half'});
   clusterWasOpen=active;
 }
 function activate(enabled){
   if(state.enabled===enabled)return;
   state.enabled=enabled;
   document.body.classList.toggle('mobile-sheet-ready',enabled);
   header.hidden=!enabled;shortcuts.hidden=!enabled;dossierBar.hidden=!enabled;
   if(enabled){
     slot.appendChild(card);
     setSnap(state.snap);
     setTab(!card.hidden?'place':'filters');
     if(!dossier.hidden)setDossierSnap('full');
   }else{
     cardParent.insertBefore(card,cardNext);
     dossier.setAttribute('aria-modal','true');
   }
   syncSelection();
 }
 // Only the dedicated handle may initiate drag; content remains natively scrollable.
 function bindHandle(handle, getSnap, setMode){
   let startY=null,started=null,id=null;
   handle.addEventListener('pointerdown',event=>{
     if(event.isPrimary===false || (event.pointerType==='mouse'&&event.button!==0))return;
     startY=event.clientY;started=getSnap();id=event.pointerId;state.dragging=true;
     try{handle.setPointerCapture(id);}catch(_){}
   });
   handle.addEventListener('pointerup',event=>{
     if(id!==event.pointerId || startY===null)return;
     const dy=event.clientY-startY;
     if(Math.abs(dy)>=dragThreshold){
       const at=states.indexOf(started);
       setMode(states[Math.max(0,Math.min(2,at+(dy<0?1:-1)))]);
     }else if(getSnap()==='collapsed')setMode('half');
     startY=null;started=null;id=null;state.dragging=false;
   });
   const cancel=()=>{startY=null;started=null;id=null;state.dragging=false;};
   handle.addEventListener('pointercancel',cancel);
   handle.addEventListener('lostpointercapture',()=>{if(startY!==null)cancel();});
   handle.addEventListener('keydown',event=>{
     if(event.key!=='ArrowUp'&&event.key!=='ArrowDown')return;
     event.preventDefault();
     const at=states.indexOf(getSnap());
     setMode(states[Math.max(0,Math.min(2,at+(event.key==='ArrowUp'?1:-1)))]);
   });
 }
 bindHandle($('mobileSheetHandle'),()=>state.snap,setSnap);
 bindHandle($('mobileDossierHandle'),()=>state.dossierSnap,setDossierSnap);
 for(const b of document.querySelectorAll('button[data-mobile-snap]')){
   b.addEventListener('click',()=>setSnap(b.dataset.mobileSnap));
 }
 for(const b of document.querySelectorAll('[data-dossier-snap]')){
   b.addEventListener('click',()=>setDossierSnap(b.dataset.dossierSnap));
 }
 for(const b of document.querySelectorAll('button[data-mobile-tab]')){
   b.addEventListener('click',()=>setTab(b.dataset.mobileTab,{snap:state.snap==='collapsed'?'half':state.snap}));
 }
 for(const b of document.querySelectorAll('[data-mobile-quick]')){
   b.addEventListener('click',()=>setTab(b.dataset.mobileQuick,{snap:'half',focusSearch:false}));
 }
 new MutationObserver(syncSelection).observe(card,{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(syncCluster).observe($('clusterCard'),{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(()=>{
   if(!dossier.hidden&&state.enabled)setDossierSnap('full');
 }).observe(dossier,{attributes:true,attributeFilter:['hidden']});
 global.addEventListener('keydown',event=>{
   if(!state.enabled||event.key!=='Escape'||!dossier.hidden||event.defaultPrevented)return;
   if(state.snap==='full'||state.snap==='half'){
     event.preventDefault();setSnap(state.snap==='full'?'half':'collapsed');
   }
 });
 // Respond to viewport changes, including landscape phone and browser resizing.
 const onChange=()=>activate(media.matches);
 if(media.addEventListener)media.addEventListener('change',onChange);
 else media.addListener(onChange);
 activate(media.matches);
 global.RaspehrMobileSheet={setSnap,setTab,setDossierSnap,getState:()=>({...state})};
})(window);
