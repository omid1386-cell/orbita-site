/* RASPEHR Stage 03 — Explorer UI, globe projection, adaptive clustering and country selection.
 * All canonical JSON files and 2D map components remain read-only.
 */
(function(global){
 'use strict';
 const $=id=>document.getElementById(id);
 const format=n=>n.toLocaleString('fa-IR');
 class Controller {
   constructor(engine,markers,catalog,showEntity){
     this.engine=engine;this.markers=markers;this.catalog=catalog;this.showEntityCallback=showEntity;
     this.explore=global.RaspehrEntityExplore;
     this.categories=new Set(Object.keys(global.RaspehrEntityData.CATEGORIES));
     this.query='';this.country='';this.filtered=[];this.view=null;this.timer=null;
     this.lastCamera='';this.clusterPointerHeld=false;this.clusterHoldUntil=0;this.overlay=document.createElement('div');
     this.overlay.id='clusterOverlay';this.overlay.className='cluster-overlay';
     $('globeMount').appendChild(this.overlay);
     this.initialize();
   }
   initialize(){
     const defs=global.RaspehrEntityData.CATEGORIES;
     const countryList=$('entityCountry');
     for(const country of this.explore.countries(this.catalog.all)){
       const option=document.createElement('option');option.value=country.value;option.textContent=country.label;
       countryList.appendChild(option);
     }
     const legend=$('entityLegend');legend.replaceChildren();
     for(const [key,def] of Object.entries(defs)){
       const label=document.createElement('label');label.className='legend-item';
       const input=document.createElement('input');input.type='checkbox';input.value=key;input.checked=true;
       input.className='category-checkbox';input.setAttribute('aria-label',def.fa);
       const dot=document.createElement('span');dot.className='legend-dot';
       dot.style.setProperty('--dot','#'+def.color.toString(16).padStart(6,'0'));
       const text=document.createElement('span');
       text.textContent=def.fa+' ('+format(this.catalog.roles[key]||0)+')';
       label.append(input,dot,text);legend.append(label);
       input.addEventListener('change',()=>{
         if(input.checked)this.categories.add(key);else this.categories.delete(key);
         this.refreshFilters();
       });
     }
     let debounce;
     $('entitySearch').addEventListener('input',event=>{
       this.query=event.target.value;
       clearTimeout(debounce);debounce=setTimeout(()=>this.refreshFilters(),120);
     });
     $('entitySearch').addEventListener('keydown',event=>{
       if(event.key==='Enter' && this.filtered.length){event.preventDefault();this.selectRecord(this.filtered[0]);}
     });
     countryList.addEventListener('change',event=>{
       this.country=event.target.value;this.refreshFilters();
       if(this.country && this.filtered.length){
         const center=this.explore.centralGeo(this.filtered);
         this.markers.focus(center);
         this.engine.target.distance=4.0;
       }
     });
     $('categoryAll').addEventListener('click',()=>{this.categories=new Set(Object.keys(defs));this.syncCheckboxes();this.refreshFilters();});
     $('categoryNone').addEventListener('click',()=>{this.categories.clear();this.syncCheckboxes();this.refreshFilters();});
     $('entityClear').addEventListener('click',()=>{
       $('entitySearch').value='';$('entityCountry').value='';this.query='';this.country='';
       this.categories=new Set(Object.keys(defs));this.syncCheckboxes();this.refreshFilters();
     });
     $('clusterFocusBtn').addEventListener('click',()=>{
       if(this.activeCluster)this.focusCluster(this.activeCluster);
     });
     $('markerToggle').addEventListener('change',()=>{
       this.overlay.hidden=!$('markerToggle').checked;
       this.refreshView(true);
     });
     this.refreshFilters();
     this.timer=global.setInterval(()=>{
       if(document.hidden || this.engine.stopped || this.engine.active===false)return;
       this.refreshView(false);
     },180);
   }
   syncCheckboxes(){
     document.querySelectorAll('.category-checkbox').forEach(checkbox=>{checkbox.checked=this.categories.has(checkbox.value);});
   }
   refreshFilters(){
     this.filtered=this.explore.filter(this.catalog.markers,{
       query:this.query,country:this.country,categories:[...this.categories]
     });
     this.clusterPointerHeld=false;this.clusterHoldUntil=0;
     const card=$('entityCard');card.hidden=true;
     $('clusterCard').hidden=true;this.activeCluster=null;this.markers.clearSelection();
     this.populateResults();this.lastCamera='';this.refreshView(true);
   }
   populateResults(){
     const results=$('entityResults');results.replaceChildren();
     const shouldShow=this.query.trim().length>0 || this.country || this.categories.size!==Object.keys(global.RaspehrEntityData.CATEGORIES).length;
     results.hidden=!shouldShow;
     if(!shouldShow)return;
     const visible=this.filtered.slice(0,24);
     if(!visible.length){
       const empty=document.createElement('p');empty.className='entity-note';empty.textContent='موردی مطابق این فیلترها پیدا نشد.';results.appendChild(empty);return;
     }
     for(const row of visible){
       const button=document.createElement('button');button.type='button';button.className='entity-result';
       const name=document.createElement('strong');name.textContent=row.fa;
       const subtitle=document.createElement('small');
       subtitle.textContent=[row.countryFa||row.country,row.cityFa||row.city,(row.precision||'').startsWith('approximate')?'نشانگر تقریبی':null].filter(Boolean).join(' · ');
       button.append(name,subtitle);button.addEventListener('click',()=>this.selectRecord(row));results.appendChild(button);
     }
     if(this.filtered.length>visible.length){
       const note=document.createElement('p');note.className='entity-note';
       note.textContent='فقط '+format(visible.length)+' نتیجه نخست نمایش داده شده است؛ جست‌وجو را دقیق‌تر کنید.';
       results.appendChild(note);
     }
   }
   cameraSignature(){
     const g=this.engine.globeGroup.rotation,c=this.engine.camera;
     const bounds=this.engine.renderer.domElement.getBoundingClientRect();
     return [g.x,g.y,c.position.z,bounds.width,bounds.height].map(n=>Math.round(n*100)).join(',');
   }
   projector(){
     const T=global.THREE;
     const scene=this.engine.scene;scene.updateMatrixWorld(true);
     this.engine.camera.updateMatrixWorld(true);
     const bounds=this.engine.renderer.domElement.getBoundingClientRect();
     const w=bounds.width,h=bounds.height;
     const m=this.markers.group.matrixWorld,camera=this.engine.camera;
     return row=>{
       if(!w||!h)return null;
       const local=global.RaspehrEntityMarkers.geo(row.lat,row.lon,global.RaspehrEntityMarkers.MARKER_RADIUS);
       const world=local.clone().applyMatrix4(m);
       const outward=local.clone().normalize().transformDirection(m);
       if(outward.dot(camera.position.clone().sub(world))<=0.003)return null;
       const ndc=world.clone().project(camera);
       if(ndc.z>=1||ndc.z<=-1||Math.abs(ndc.x)>1.02||Math.abs(ndc.y)>1.02)return null;
       return {x:(ndc.x+1)*w/2,y:(1-ndc.y)*h/2,visible:true};
     };
   }
   refreshView(force){
     if(!$('markerToggle').checked){
       this.overlay.replaceChildren();this.overlay.hidden=true;return;
     }
     const signature=this.cameraSignature();
     // Never remove/rebuild a bubble between pointerdown and the following click.
     if(!force && (this.clusterPointerHeld || performance.now()<this.clusterHoldUntil))return;
     if(!force && signature===this.lastCamera)return;
     this.lastCamera=signature;
     const project=this.projector();
     // At close distances reduce merging; never merge locations based on lat/lon alone.
     const radius=this.engine.camera.position.z<2.9?34:48;
     const view=this.explore.cluster(this.filtered,project,radius);
     this.view=view;
     this.markers.setDisplay(view.singles,view.clusters);
     this.showClusters(view);
     $('entityResultCount').textContent=format(this.filtered.length)+' از '+format(this.catalog.counts.markers)+' مکان منطبق با فیلترها · '+format(view.visibleCount)+' در سمت قابل مشاهده کره · '+format(view.clusters.length)+' خوشه';
   }
   showClusters(view){
     this.overlay.hidden=false;
     // Reuse cluster controls across frames so a pointerdown remains attached
     // to the same DOM element until pointerup (avoids lost clicks on moving globe).
     const old=new Map([...this.overlay.children].map(el=>[el.dataset.key,el]));
     for(const cluster of view.clusters){
       // Cluster labels are screen-space aggregates. Projecting the geographic
       // centroid can shift a label behind the globe for widely spread members.
       const at={x:cluster.x,y:cluster.y};
       if(!Number.isFinite(at.x)||!Number.isFinite(at.y))continue;
       let button=old.get(cluster.key);
       if(button){old.delete(cluster.key);}
       else{
         button=document.createElement('button');button.type='button';
         button.className='cluster-bubble';button.dataset.key=cluster.key;
         button.addEventListener('pointerdown',event=>{
           event.stopPropagation();
           this.clusterPointerHeld=true;
           this.clusterHoldUntil=performance.now()+450;
           // Capture release even if a finger slides away from the bubble.
           try{button.setPointerCapture(event.pointerId);}catch(_){/* fallback to cancel */}
         });
         const release=event=>{
           event.stopPropagation();
           this.clusterPointerHeld=false;
           this.clusterHoldUntil=performance.now()+300;
           this.lastCamera='';
         };
         button.addEventListener('pointerup',release);
         button.addEventListener('pointercancel',release);
         button.addEventListener('lostpointercapture',release);
         button.addEventListener('click',()=>this.selectCluster(button.clusterRecord));
         this.overlay.appendChild(button);
       }
       button.clusterRecord=cluster;
       button.textContent=format(cluster.count);
       button.title=format(cluster.count)+' مکان؛ برای بزرگ‌نمایی و مشاهده اعضا کلیک کنید';
       button.setAttribute('aria-label',button.title);
       button.style.left=at.x+'px';button.style.top=at.y+'px';
     }
     old.forEach(button=>button.remove());
   }
   showCluster(cluster){
     this.activeCluster=cluster;
     $('entityCard').hidden=true;
     $('clusterCard').hidden=false;
     $('clusterSummary').textContent='خوشه شامل '+format(cluster.count)+' مکان';
     const list=$('clusterMembers');list.replaceChildren();
     for(const row of cluster.members.slice(0,28)){
       const btn=document.createElement('button');btn.type='button';btn.className='entity-result';
       btn.textContent=row.fa;btn.addEventListener('click',()=>this.selectRecord(row));list.appendChild(btn);
     }
     $('clusterMore').textContent=cluster.members.length>28?'برای مشاهده همه '+format(cluster.members.length)+' مورد، بزرگ‌نمایی یا فیلتر جست‌وجو را محدودتر کنید.':'';
   }
   hideCluster(){$('clusterCard').hidden=true;this.activeCluster=null;}
   selectCluster(cluster){this.markers.select(cluster,false);}
   focusCluster(cluster){
     this.markers.focus(cluster);
     this.engine.target.distance=Math.max(2.10,this.engine.target.distance*0.64);
     // The regular render loop projects clusters after camera easing; avoid forcing
     // a scene rebuild while the interaction event is being dispatched.
     this.lastCamera='';
   }
   selectRecord(row){
     this.hideCluster();this.markers.select(row,true);
     this.showEntityCallback(row);
     $('entitySearch').blur();
   }
   getState(){return {query:this.query,country:this.country,categories:[...this.categories],markerVisible:$('markerToggle').checked};}
   applyState(state){
     const s=global.RaspehrStage5State.normalize(state);
     this.query=s.query;this.country=[...$('entityCountry').options].some(opt=>opt.value===s.country)?s.country:'';
     this.categories=new Set(s.categories);
     $('entitySearch').value=this.query;$('entityCountry').value=this.country;
     $('markerToggle').checked=s.markerVisible;this.markers.setVisible(s.markerVisible);
     this.syncCheckboxes();this.refreshFilters();
     $('countryProfileBtn').disabled=!this.country;
     return s;
   }
   dispose(){if(this.timer){global.clearInterval(this.timer);this.timer=null;}this.clusterPointerHeld=false;this.overlay.remove();}
 }
 global.RaspehrStage3={Controller};
})(window);
