/* RASPEHR 3D Stage 02+03 — Earth-anchored markers, filtered views, clustering and picking.
 * Does not alter the original 2D map or render full dossiers (Stage 04).
 */
(function (global) {
  'use strict';
  const T=global.THREE;
  const R=1.72;
  const MARKER_RADIUS=R*1.010;
  const EARTH_RADIUS=R;
  const HORIZON_MARGIN=0.003; // never show a marker on the far hemisphere or at the unstable limb
  const DEG=Math.PI/180;
  function finite(v,limit){return typeof v==='number' && Number.isFinite(v) && Math.abs(v)<=limit;}
  function geo(lat,lon,r){
    if(!finite(lat,90)||!finite(lon,180)) throw new Error('مختصات نامعتبر');
    const p=lat*DEG,l=lon*DEG;
    return new T.Vector3(r*Math.cos(p)*Math.cos(l),r*Math.sin(p),-r*Math.cos(p)*Math.sin(l));
  }
  function focusDistanceFor(row){
    const precision=String(row && row.precision || '').toLowerCase();
    const note=String(row && row.coordinateNote || '').toLowerCase();
    const source=precision+' '+note;
    if(/approx|representative|reference|city|locality|region|area|campus|district|town|تقریبی|مرجع|نماینده|ناحیه|شهر|محوطه|پردیس/.test(source))return 4.05;
    if(/official_site_coordinates|operator_published|official_facility|mapped_(address|named).*building|building_(point|centre|center)|osm_.*building/.test(precision))return 2.72;
    return 3.05;
  }
  function nearestProjectedMarker(rows,project,x,y,maxDistance){
    let best=null,bestDistance=Number(maxDistance)||18;
    bestDistance*=bestDistance;
    for(const row of rows||[]){
      const at=project(row);
      if(!at || at.visible===false || !Number.isFinite(at.x) || !Number.isFinite(at.y))continue;
      const distance=(at.x-x)*(at.x-x)+(at.y-y)*(at.y-y);
      if(distance<=bestDistance){bestDistance=distance;best=row;}
    }
    return best;
  }
  class EntityMarkers {
    constructor(engine,catalog,onSelect) {
      if(!T || !T.InstancedMesh) throw new Error('نمایش نشانگرها به Three.js با قابلیت InstancedMesh نیاز دارد.');
      this.engine=engine;
      this.catalog=catalog;
      this.onSelect=onSelect||function(){};
      this.group=new T.Group();
      this.group.name='raspehr-location-markers';
      this.engine.globeGroup.add(this.group);
      this.meshes=[];
      this.meshPool=new Map(); // Reuse GPU buffers/materials during frequent reclustering.
      this.geometry=new T.SphereGeometry(0.0085,10,8);
      // Cluster labels are screen-space UI only. Rendering a second 3D sphere for each
      // cluster doubled the visible symbols and made the old interface cluttered.
      this.clusterGeometry=null;
      this.selectionGeometry=new T.RingGeometry(0.025,0.039,32);
      this.selectionMaterial=new T.MeshBasicMaterial({color:0xffefad,side:T.DoubleSide,transparent:true,opacity:0.95,depthWrite:false});
      this.selectionRing=new T.Mesh(this.selectionGeometry,this.selectionMaterial);
      this.selectionRing.visible=false;
      this.group.add(this.selectionRing);
      this.haloGeometry=new T.RingGeometry(0.044,0.060,36);
      this.haloMaterial=new T.MeshBasicMaterial({color:0x62d7f5,side:T.DoubleSide,transparent:true,opacity:0.38,depthWrite:false});
      this.selectionHalo=new T.Mesh(this.haloGeometry,this.haloMaterial);
      this.selectionHalo.visible=false;
      this.group.add(this.selectionHalo);
      this.tmpObject=new T.Object3D();
      this.raycaster=new T.Raycaster();
      this.pointer=new T.Vector2();
      this.selected=null;
      this.displayRows=[];
      this.enabled=true;
      this.down=null;
      this.activePointers=new Set();
      this.multiPointerGesture=false;
      this.listeners=[];
      this.selectedLabel=null;
      this.visualObserverOff=null;
      this.motionReduced=!!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if(typeof document!=='undefined' && this.engine.host && this.engine.host.appendChild){
        this.selectedLabel=document.createElement('div');
        this.selectedLabel.className='priority5-selected-label';
        this.selectedLabel.setAttribute('role','status');
        this.selectedLabel.setAttribute('aria-label','مکان انتخاب‌شده روی کره');
        this.selectedLabel.hidden=true;
        this.engine.host.appendChild(this.selectedLabel);
      }
      if(typeof this.engine.addFrameObserver==='function'){
        this.visualObserverOff=this.engine.addFrameObserver(time=>this.updateVisualSelection(time));
      }
      this.build();
      this.install();
    }
    listen(node,name,fn,opts){node.addEventListener(name,fn,opts);this.listeners.push([node,name,fn,opts]);}
    build(rows){
      const defs=global.RaspehrEntityData.CATEGORIES;
      const groups=new Map();
      (rows||this.catalog.markers).forEach(row=>{
        if(row.isCluster)return;
        const category=defs[row.category]?row.category:'agency';
        if(!groups.has(category))groups.set(category,[]);
        groups.get(category).push(row);
      });
      // Detach inactive batches but keep their small, bounded per-category GPU
      // allocations in a pool. Only grow a buffer when it is genuinely too small.
      for(const mesh of this.meshes)this.group.remove(mesh);
      this.meshes=[];
      for(const [category,items] of groups){
        let entry=this.meshPool.get(category);
        if(!entry || items.length>entry.capacity){
          const capacity=Math.max(4,entry?entry.capacity*2:0,items.length);
          const material=new T.MeshBasicMaterial({color:defs[category].color,depthTest:true,depthWrite:true});
          const mesh=new T.InstancedMesh(this.geometry,material,capacity);
          mesh.name='raspehr-marker:'+category;
          mesh.frustumCulled=false;
          mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
          if(entry){this.group.remove(entry.mesh);entry.mesh.material.dispose();}
          entry={mesh,capacity};
          this.meshPool.set(category,entry);
        }
        const mesh=entry.mesh;
        mesh.count=items.length;
        mesh.userData.records=items;
        for(let i=0;i<items.length;i++){
          const row=items[i];
          this.tmpObject.position.copy(geo(row.lat,row.lon,MARKER_RADIUS));
          this.tmpObject.rotation.set(0,0,0);
          this.tmpObject.scale.setScalar(1);
          this.tmpObject.updateMatrix();
          mesh.setMatrixAt(i,this.tmpObject.matrix);
        }
        mesh.instanceMatrix.needsUpdate=true;
        mesh.visible=this.enabled;
        this.meshes.push(mesh);
        this.group.add(mesh);
      }
    }
    install(){
      const canvas=this.engine.renderer.domElement;
      this.listen(canvas,'pointerdown',e=>{
        if(!this.enabled)return;
        if(e.pointerType==='mouse' && e.button!==0)return;
        // Engine listeners register their active pointers before marker listeners.
        // Once a pinch begins, neither finger may turn into a marker selection.
        if(this.activePointers.size || this.engine.controls.size>1){
          this.multiPointerGesture=true;
          this.down=null;
        }
        this.activePointers.add(e.pointerId);
        if(!this.multiPointerGesture)this.down={x:e.clientX,y:e.clientY,id:e.pointerId};
      });
      this.listen(canvas,'pointermove',e=>{
        if(this.down && Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)>
          (e.pointerType==='touch'?12:7))this.down=null;
      });
      const cancel=e=>{
        this.activePointers.delete(e.pointerId);
        this.down=null;
        if(!this.activePointers.size)this.multiPointerGesture=false;
      };
      this.listen(canvas,'pointercancel',cancel);
      this.listen(canvas,'lostpointercapture',cancel);
      this.listen(canvas,'pointerup',e=>{
        const wasGesture=this.multiPointerGesture;
        this.activePointers.delete(e.pointerId);
        if(!this.activePointers.size)this.multiPointerGesture=false;
        if(wasGesture || !this.down || this.down.id!==e.pointerId){
          this.down=null;return;
        }
        const dx=e.clientX-this.down.x,dy=e.clientY-this.down.y;
        this.down=null;
        if(Math.hypot(dx,dy)>(e.pointerType==='touch'?12:7) || this.engine.controls.size>1)return;
        const item=this.pick(e.clientX,e.clientY,e.pointerType);
        if(item)this.select(item,true);
      });
    }
    // All positions are calculated from immutable lat/lon coordinates in the
    // SAME local coordinate system as the globe mesh. No stored screen x/y is
    // used as a geographic anchor. Call after updating scene/camera matrices.
    createProjectionContext(rect){
      const box=rect||this.engine.renderer.domElement.getBoundingClientRect();
      if(!box.width||!box.height)return null;
      const center=this.engine.globeGroup.getWorldPosition(new T.Vector3());
      const d=this.engine.camera.position.distanceTo(center);
      const halfFov=this.engine.camera.fov*Math.PI/360;
      const radiusPixels=(box.height/2)*EARTH_RADIUS/
        Math.sqrt(Math.max(d*d-EARTH_RADIUS*EARTH_RADIUS,0.0001))/Math.tan(halfFov);
      const centerNdc=center.clone().project(this.engine.camera);
      return {box,center,camera:this.engine.camera.position,
        cx:(centerNdc.x+1)*box.width/2,cy:(1-centerNdc.y)*box.height/2,radiusPixels};
    }
    projectAnchor(row,rect,edgePadding,projection){
      if(!row || !finite(row.lat,90) || !finite(row.lon,180))return null;
      const context=projection||this.createProjectionContext(rect);
      if(!context)return null;
      const {box,center,camera,cx,cy,radiusPixels}=context;
      const world=geo(row.lat,row.lon,MARKER_RADIUS).applyMatrix4(this.group.matrixWorld);
      const nx=world.x-center.x,ny=world.y-center.y,nz=world.z-center.z;
      const vx=camera.x-world.x,vy=camera.y-world.y,vz=camera.z-world.z;
      const front=(nx*vx+ny*vy+nz*vz)/Math.sqrt((nx*nx+ny*ny+nz*nz)*(vx*vx+vy*vy+vz*vz));
      if(front<=HORIZON_MARGIN)return null;
      const ndc=world.project(this.engine.camera);
      if(ndc.z<=-1 || ndc.z>=1 || Math.abs(ndc.x)>1 || Math.abs(ndc.y)>1)return null;
      const x=(ndc.x+1)*box.width/2,y=(1-ndc.y)*box.height/2;
      if(Math.hypot(x-cx,y-cy)>radiusPixels-Math.max(0,edgePadding||0))return null;
      return {x,y,visible:true};
    }
    pick(clientX,clientY,pointerType){
      if(!this.enabled)return null;
      const rect=this.engine.renderer.domElement.getBoundingClientRect();
      if(!rect.width || !rect.height)return null;
      this.engine.scene.updateMatrixWorld(true);
      this.engine.camera.updateMatrixWorld(true);
      const rows=this.meshes.flatMap(mesh=>mesh.userData.records||[]);
      const projection=this.createProjectionContext(rect);
      // Prefer the nearest projected pin, not the first raycast hit. At dense
      // aerospace campuses several valid records can be only a few pixels apart.
      const radius=pointerType==='touch'?27:pointerType==='pen'?22:18;
      const nearest=nearestProjectedMarker(rows,row=>this.projectAnchor(row,rect,0,projection),
        clientX-rect.left,clientY-rect.top,radius);
      if(nearest)return nearest;
      this.pointer.set(((clientX-rect.left)/rect.width)*2-1,-((clientY-rect.top)/rect.height)*2+1);
      this.raycaster.setFromCamera(this.pointer,this.engine.camera);
      const hits=this.raycaster.intersectObjects(this.meshes,false);
      for(const hit of hits){
        const row=hit.object.userData.records[hit.instanceId];
        if(!row)continue;
        const local=geo(row.lat,row.lon,MARKER_RADIUS);
        const world=local.clone().applyMatrix4(this.group.matrixWorld);
        const outward=local.clone().normalize().transformDirection(this.group.matrixWorld);
        const toCamera=this.engine.camera.position.clone().sub(world);
        if(outward.dot(toCamera)<=0.003)continue;
        return row;
      }
      return null;
    }
    setDisplay(singles, clusters){
      const displayed=(singles||[]); // never double-render screen-space cluster badges
      this.displayRows=displayed.slice();
      const signature=displayed.map(row=>row.key).join('\n');
      if(signature===this.displaySignature)return false;
      this.displaySignature=signature;
      this.build(displayed);
      this.meshes.forEach(mesh=>{mesh.visible=this.enabled;});
      if(this.selected && !displayed.some(row=>row.key===this.selected.key))this.clearSelection();
      return true;
    }
    clearSelection(){
      this.selected=null;
      this.selectionRing.visible=false;
      this.selectionHalo.visible=false;
      if(this.selectedLabel)this.selectedLabel.hidden=true;
    }
    updateVisualSelection(time){
      if(!this.enabled || !this.selected){
        if(this.selectedLabel)this.selectedLabel.hidden=true;
        return;
      }
      const pulse=this.motionReduced?0:Math.sin((time||0)*0.0035);
      // The earlier constant world-space ring grew to huge screen sizes as the
      // camera approached a site. Convert desired pixel radii to globe units.
      const rect=this.engine.renderer.domElement.getBoundingClientRect();
      if(rect.height>0){
        const world=this.selectionRing.getWorldPosition(new T.Vector3());
        const distance=Math.max(0.001,this.engine.camera.position.distanceTo(world));
        const unitsPerPixel=2*Math.tan((this.engine.camera.fov||42)*Math.PI/360)*distance/rect.height;
        const ringScale=Math.max(0.025,Math.min(3.0,15*unitsPerPixel/0.039));
        const haloScale=Math.max(0.025,Math.min(3.0,20*unitsPerPixel/0.060));
        this.selectionRing.scale.setScalar(ringScale);
        this.selectionHalo.scale.setScalar(haloScale*(1+(pulse+1)*0.045));
      }
      this.haloMaterial.opacity=this.motionReduced?0.26:0.22+(pulse+1)*0.09;
      if(!this.selectedLabel)return;
      const at=this.projectAnchor(this.selected,rect,24);
      if(!at || at.x<44 || at.x>rect.width-44 || at.y<40 || at.y>rect.height-40){
        this.selectedLabel.hidden=true;return;
      }
      this.selectedLabel.hidden=false;
      // CSS controls the pointer-free, non-interactive floating label.
      this.selectedLabel.style.left=Math.round(at.x)+'px';
      this.selectedLabel.style.top=Math.round(at.y-16)+'px';
    }
    select(row,moveCamera){
      if(!row || !finite(row.lat,90) || !finite(row.lon,180))return false;
      this.selected=row;
      const local=geo(row.lat,row.lon,MARKER_RADIUS+0.009);
      this.selectionRing.position.copy(local);
      this.selectionRing.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),local.clone().normalize());
      this.selectionRing.visible=this.enabled;
      this.selectionHalo.position.copy(local);
      this.selectionHalo.quaternion.copy(this.selectionRing.quaternion);
      this.selectionHalo.visible=this.enabled;
      if(this.selectedLabel){
        const approximate=/approx|representative|reference|city|region|area|تقریبی|مرجع|شهر|ناحیه/i.test(String(row.precision||'')+' '+String(row.coordinateNote||''));
        this.selectedLabel.textContent=(row.fa||row.en||row.id||'مکان انتخاب‌شده')+(approximate?' · نقطه مرجع':'');
        this.selectedLabel.hidden=!this.enabled;
      }
      if(moveCamera)this.focus(row);
      this.onSelect(row);
      return true;
    }
    focus(row,options){
      if(!row || !finite(row.lat,90) || !finite(row.lon,180))return false;
      const distance=focusDistanceFor(row);
      if(typeof this.engine.flyToGeo==='function'){
        return this.engine.flyToGeo(row.lat,row.lon,distance,{duration:options&&options.duration||1450});
      }
      this.engine.target.rx=row.lat*DEG;
      this.engine.target.ry=(-90-row.lon)*DEG;
      this.engine.target.distance=distance;
      if(this.engine.dragVelocity)this.engine.dragVelocity.x=this.engine.dragVelocity.y=0;
      return true;
    }
    setVisible(value){
      this.enabled=!!value;
      this.meshes.forEach(mesh=>{mesh.visible=this.enabled;});
      this.selectionRing.visible=this.enabled&&!!this.selected;
      this.selectionHalo.visible=this.enabled&&!!this.selected;
      if(this.selectedLabel)this.selectedLabel.hidden=!this.enabled||!this.selected;
      if(!this.enabled){this.down=null;this.activePointers.clear();this.multiPointerGesture=false;}
    }
    dispose(){
      this.listeners.forEach(([node,name,fn,opts])=>node.removeEventListener(name,fn,opts));
      this.listeners=[];
      if(this.visualObserverOff){this.visualObserverOff();this.visualObserverOff=null;}
      if(this.selectedLabel){this.selectedLabel.remove();this.selectedLabel=null;}
      this.activePointers.clear();
      this.engine.globeGroup.remove(this.group);
      this.meshPool.forEach(entry=>entry.mesh.material.dispose());
      this.meshPool.clear();
      this.geometry.dispose();
      if(this.clusterGeometry)this.clusterGeometry.dispose();
      this.selectionGeometry.dispose();
      this.selectionMaterial.dispose();
      this.haloGeometry.dispose();
      this.haloMaterial.dispose();
      this.meshes=[];
    }
  }
  global.RaspehrEntityMarkers={EntityMarkers,geo,MARKER_RADIUS,focusDistanceFor,nearestProjectedMarker};
})(window);
