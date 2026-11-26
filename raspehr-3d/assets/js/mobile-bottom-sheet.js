/* RASPEHR Atlas Panel v2 — desktop sections + lightweight mobile sheet.
 * One real DOM and one 3D renderer. Original marker/filter/profile handlers stay intact.
 * The selected card MOVES between the globe and sheet; it is never cloned.
 */
(function(global){
 'use strict';
 const $=id=>document.getElementById(id);
 const panel=$('mobileMainSheet'),header=$('mobileSheetHeader'),body=$('mobileSheetBody');
 const card=$('selectedLocationCard'),slot=$('mobileSelectedSlot');
 const shortcuts=$('mobileMapShortcuts'),mapPlace=$('mobileMapPlace'),placeTab=$('mobileLocationTab');
 const dossier=$('dossierOverlay'),dossierBar=$('mobileDossierBar');
 const media=global.matchMedia('(max-width: 700px)');
 const states=['collapsed','half','full'];
 const tabNames={filters:'کاوش مکان‌ها',layers:'لایه‌های نقشه',place:'مکان انتخاب‌شده',controls:'تنظیمات نمایش'};
 const sectionNames={filters:'explore',layers:'layers',controls:'settings'};
 const state={enabled:false,snap:'collapsed',tab:'filters',section:'explore',dossierSnap:'full',dragging:false,desktopCollapsed:false};
 const cardParent=card.parentNode,cardNext=card.nextSibling;
 let selectionWasOpen=!card.hidden,clusterWasOpen=!$('clusterCard').hidden;
 const dragThreshold=50;
 // A single scroll container serves multiple panels; remember independent positions.
 const scrollMemory={explore:0,layers:0,settings:0,place:0};
 const viewKey=()=>state.enabled?({filters:'explore',layers:'layers',place:'place',controls:'settings'}[state.tab]||'explore'):state.section;
 const remember=()=>{scrollMemory[viewKey()]=body.scrollTop;};
 const restore=key=>global.requestAnimationFrame(()=>{if(viewKey()===key)body.scrollTop=scrollMemory[key]||0;});
 function validSnap(v){return states.includes(v)?v:'half';}
 function syncButtons(selector,value,attribute){
   for(const btn of document.querySelectorAll(selector)){
     const active=btn.getAttribute(attribute)===value;
     btn.classList.toggle('is-active',active);
     btn.setAttribute('aria-pressed',String(active));
   }
 }
 function setSection(name){
   const section=['explore','layers','settings'].includes(name)?name:'explore';
   const changed=state.section!==section;
   if(changed&&!state.enabled)remember();
   state.section=section;panel.dataset.atlasSection=section;
   syncButtons('button[data-atlas-tab]',section,'data-atlas-tab');
   if(changed&&!state.enabled)restore(section);
   return section;
 }
 function setSnap(value){
   state.snap=validSnap(value);panel.dataset.mobileSnap=state.snap;
   syncButtons('button[data-mobile-snap]',state.snap,'data-mobile-snap');
   $('mobileSheetHandle').setAttribute('aria-expanded',String(state.snap!=='collapsed'));
   $('mobileSheetMaximize').setAttribute('aria-label',state.snap==='full'?'نمای نیمه‌باز پنل':'نمایش تمام‌صفحه پنل');
   return state.snap;
 }
 function setTab(value,opts){
   const next=(value==='place'&&card.hidden)?'filters':(tabNames[value]?value:'filters');
   const changed=state.tab!==next;
   if(changed)remember();
   state.tab=next;panel.dataset.mobileTab=next;
   $('mobileSheetTitle').textContent=tabNames[next];
   syncButtons('button[data-mobile-tab]',next,'data-mobile-tab');
   if(sectionNames[next])setSection(sectionNames[next]);
   if(opts&&opts.snap)setSnap(opts.snap);
   if(changed)restore(viewKey());
   if(opts&&opts.focusSearch&&next==='filters')$('entitySearch').focus({preventScroll:true});
   return next;
 }
 function setDossierSnap(value){
   state.dossierSnap=validSnap(value);dossier.dataset.mobileSnap=state.dossierSnap;
   syncButtons('[data-dossier-snap]',state.dossierSnap,'data-dossier-snap');
   dossier.setAttribute('aria-modal',String(!state.enabled||state.dossierSnap==='full'));
   $('mobileDossierHandle').setAttribute('aria-expanded',String(state.dossierSnap!=='collapsed'));
   return state.dossierSnap;
 }
 function setDesktopCollapsed(collapsed){
   state.desktopCollapsed=!!collapsed;
   if(!state.enabled){
     document.body.classList.toggle('atlas-desktop-collapsed',state.desktopCollapsed);
     $('atlasPanelOpen').hidden=!state.desktopCollapsed;
     $('atlasPanelCollapse').setAttribute('aria-expanded',String(!state.desktopCollapsed));
     $('atlasPanelOpen').setAttribute('aria-expanded',String(!state.desktopCollapsed));
     // The globe uses ResizeObserver/window-resize to recompute its viewport.
     global.requestAnimationFrame(()=>global.dispatchEvent(new Event('resize')));
   }
 }
 function syncSelection(){
   const hasLocation=!card.hidden;
   placeTab.disabled=!hasLocation;mapPlace.disabled=!hasLocation;
   if(!state.enabled){selectionWasOpen=hasLocation;return;}
   if(hasLocation&&!selectionWasOpen)revealPlace();
   else if(!hasLocation&&state.tab==='place')setTab('filters',{snap:state.snap});
   selectionWasOpen=hasLocation;
 }
 function revealPlace(){
   if(card.hidden)return;
   // A new selected place starts at the top, but respects an intentional full panel.
   selectionWasOpen=true;
   scrollMemory.place=0;
   if(state.enabled){
     setTab('place',{snap:state.snap==='collapsed'?'half':state.snap});
     body.scrollTop=0;
   }
 }
 function syncCluster(){
   const active=!$('clusterCard').hidden;
   if(state.enabled&&active&&!clusterWasOpen)setTab('filters',{snap:state.snap==='collapsed'?'half':state.snap});
   clusterWasOpen=active;
 }
 function activate(enabled){
   if(state.enabled===enabled)return;
   remember();
   state.enabled=enabled;
   document.body.classList.toggle('mobile-sheet-ready',enabled);
   document.body.classList.toggle('atlas-desktop-collapsed',!enabled&&state.desktopCollapsed);
   header.hidden=!enabled;shortcuts.hidden=!enabled;dossierBar.hidden=!enabled;
   if(enabled){
     slot.appendChild(card);
     // Respect a prior selection while preserving the compact default entry state.
     setTab(!card.hidden?'place':state.tab,{snap:state.snap});
     if(!dossier.hidden)setDossierSnap('full');
   }else{
     cardParent.insertBefore(card,cardNext);
     dossier.setAttribute('aria-modal','true');
     setSection(state.section);
     $('atlasPanelOpen').hidden=!state.desktopCollapsed;
   }
   restore(viewKey());
   syncSelection();
 }
 // Gestures are restricted to the drag handle, so list scrolling and map
 // pointer gestures do not fight with the bottom sheet.
 function bindHandle(handle,getSnap,setMode){
   let startY=null,started=null,id=null;
   handle.addEventListener('pointerdown',event=>{
     if(event.isPrimary===false||(event.pointerType==='mouse'&&event.button!==0))return;
     event.preventDefault(); // do not turn a sheet gesture into map selection or page scrolling
     startY=event.clientY;started=getSnap();id=event.pointerId;state.dragging=true;
     try{handle.setPointerCapture(id);}catch(_){/* browser without capture */}
   });
   handle.addEventListener('pointerup',event=>{
     if(id!==event.pointerId||startY===null)return;
     const dy=event.clientY-startY;
     if(Math.abs(dy)>=dragThreshold){
       const at=states.indexOf(started);
       setMode(states[Math.max(0,Math.min(2,at+(dy<0?1:-1)))],true);
     }else setMode(getSnap()==='collapsed'?'half':'collapsed',true);
     startY=null;started=null;id=null;state.dragging=false;
   });
   const cancel=()=>{startY=null;started=null;id=null;state.dragging=false;};
   handle.addEventListener('pointercancel',cancel);
   handle.addEventListener('lostpointercapture',()=>{if(startY!==null)cancel();});
   handle.addEventListener('keydown',event=>{
     if(event.key!=='ArrowUp'&&event.key!=='ArrowDown'&&event.key!=='Enter'&&event.key!==' ')return;
     event.preventDefault();
     if(event.key==='Enter'||event.key===' '){setMode(getSnap()==='collapsed'?'half':'collapsed',true);return;}
     const at=states.indexOf(getSnap());
     setMode(states[Math.max(0,Math.min(2,at+(event.key==='ArrowUp'?1:-1)))],true);
   });
 }
 bindHandle($('mobileSheetHandle'),()=>state.snap,setSnap);
 bindHandle($('mobileDossierHandle'),()=>state.dossierSnap,setDossierSnap);
 for(const b of document.querySelectorAll('button[data-mobile-snap]'))b.addEventListener('click',()=>setSnap(b.dataset.mobileSnap));
 for(const b of document.querySelectorAll('[data-dossier-snap]'))b.addEventListener('click',()=>setDossierSnap(b.dataset.dossierSnap));
 for(const b of document.querySelectorAll('button[data-mobile-tab]')){
   b.addEventListener('click',()=>setTab(b.dataset.mobileTab,{snap:state.snap==='collapsed'?'half':state.snap}));
 }
 for(const b of document.querySelectorAll('[data-mobile-quick]')){
   b.addEventListener('click',()=>setTab(b.dataset.mobileQuick,{snap:'half',focusSearch:false}));
 }
 for(const b of document.querySelectorAll('button[data-atlas-tab]')){
   b.addEventListener('click',()=>setSection(b.dataset.atlasTab));
 }
 $('mobileSheetMinimize').addEventListener('click',()=>setSnap('collapsed'));
 $('mobileSheetMaximize').addEventListener('click',()=>setSnap(state.snap==='full'?'half':'full'));
 $('atlasPanelCollapse').addEventListener('click',()=>setDesktopCollapsed(true));
 $('atlasPanelOpen').addEventListener('click',()=>setDesktopCollapsed(false));
 new MutationObserver(syncSelection).observe(card,{attributes:true,attributeFilter:['hidden']});
 // Explicit place-selection event avoids incidental DOM mutations re-opening the sheet
 // or downgrading a user's intentionally expanded full-screen panel.
 global.addEventListener('raspehr:place-selected',revealPlace);
 new MutationObserver(syncCluster).observe($('clusterCard'),{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(()=>{if(!dossier.hidden&&state.enabled)setDossierSnap('full');}).observe(dossier,{attributes:true,attributeFilter:['hidden']});
 global.addEventListener('keydown',event=>{
   if(!state.enabled||event.key!=='Escape'||!dossier.hidden||event.defaultPrevented)return;
   if(state.snap==='full'||state.snap==='half'){
     event.preventDefault();setSnap(state.snap==='full'?'half':'collapsed');
   }
 });
 const onChange=()=>activate(media.matches);
 if(media.addEventListener)media.addEventListener('change',onChange);
 else media.addListener(onChange);
 setSection('explore');
 activate(media.matches);
 global.RaspehrMobileSheet={setSnap,setTab,setDossierSnap,setSection,setDesktopCollapsed,revealPlace,getState:()=>({...state})};
})(window);
