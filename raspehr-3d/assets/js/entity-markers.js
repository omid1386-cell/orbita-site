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
      this.geometry=new T.SphereGeometry(0.007,9,7);
      // Cluster labels are screen-space UI only. Rendering a second 3D sphere for each
      // cluster doubled the visible symbols and made the old interface cluttered.
      this.clusterGeometry=null;
      this.selectionGeometry=new T.RingGeometry(0.016,0.025,28);
      this.selectionMaterial=new T.MeshBasicMaterial({color:0xffefad,side:T.DoubleSide,transparent:true,opacity:0.95,depthWrite:false});
      this.selectionRing=new T.Mesh(this.selectionGeometry,this.selectionMaterial);
      this.selectionRing.visible=false;
      this.group.add(this.selectionRing);
      this.haloGeometry=new T.RingGeometry(0.027,0.040,32);
      this.haloMaterial=new T.MeshBasicMaterial({color:0x62d7f5,side:T.DoubleSide,transparent:true,opacity:0.38,depthWrite:false});
      this.selectionHalo=new T.Mesh(this.haloGeometry,this.haloMaterial);
      this.selectionHalo.visible=false;
      this.group.add(this.selectionHalo);
      this.tmpObject=new T.Object3D();
      this.raycaster=new T.Raycaster();
      this.pointer=new T.Vector2();
      this.selected=null;
      this.enabled=true;
      this.down=null;
      this.activePointers=new Set();
      this.multiPointerGesture=false;
      this.listeners=[];
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
      for(const [category,items] of groups){
        const color=defs[category].color;
        const material=new T.MeshBasicMaterial({color,depthTest:true,depthWrite:true});
        const mesh=new T.InstancedMesh(this.geometry,material,items.length);
        mesh.name='raspehr-marker:'+category;
        mesh.userData.records=items;
        mesh.frustumCulled=false; // mark every point; otherwise partial instanced-bounds can cull markers
        mesh.instanceMatrix.setUsage(T.StaticDrawUsage);
        items.forEach((row,i)=>{
          this.tmpObject.position.copy(geo(row.lat,row.lon,MARKER_RADIUS));
          this.tmpObject.rotation.set(0,0,0);
          this.tmpObject.scale.setScalar(1);
          this.tmpObject.updateMatrix();
          mesh.setMatrixAt(i,this.tmpObject.matrix);
        });
        mesh.instanceMatrix.needsUpdate=true;
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
        const item=this.pick(e.clientX,e.clientY);
        if(item)this.select(item,true);
      });
    }
    // All positions are calculated from immutable lat/lon coordinates in the
    // SAME local coordinate system as the globe mesh. No stored screen x/y is
    // used as a geographic anchor. Call after updating scene/camera matrices.
    projectAnchor(row,rect,edgePadding){
      if(!row || !finite(row.lat,90) || !finite(row.lon,180))return null;
      const box=rect||this.engine.renderer.domElement.getBoundingClientRect();
      if(!box.width||!box.height)return null;
      const local=geo(row.lat,row.lon,MARKER_RADIUS);
      const world=local.applyMatrix4(this.group.matrixWorld);
      const surfaceNormal=world.clone().sub(this.engine.globeGroup.getWorldPosition(new T.Vector3())).normalize();
      const toCamera=this.engine.camera.position.clone().sub(world);
      // A marker must face the camera (back-side markers must not 'float'
      // outside the geographic disk when the Earth rotates).
      if(surfaceNormal.dot(toCamera)<=HORIZON_MARGIN)return null;
      const ndc=world.clone().project(this.engine.camera);
      if(ndc.z<=-1 || ndc.z>=1 || Math.abs(ndc.x)>1 || Math.abs(ndc.y)>1)return null;
      const x=(ndc.x+1)*box.width/2, y=(1-ndc.y)*box.height/2;
      // Keep cluster bubbles fully INSIDE the visible Earth silhouette.
      // Sphere angular radius as projected by a perspective camera.
      const center=this.engine.globeGroup.getWorldPosition(new T.Vector3());
      const d=this.engine.camera.position.distanceTo(center);
      const fov=this.engine.camera.fov*Math.PI/180;
      const radiusPixels=(box.height/2)*EARTH_RADIUS/Math.sqrt(Math.max(d*d-EARTH_RADIUS*EARTH_RADIUS,0.0001))/Math.tan(fov/2);
      const centerProjection=center.project(this.engine.camera);
      const cx=(centerProjection.x+1)*box.width/2, cy=(1-centerProjection.y)*box.height/2;
      if(Math.hypot(x-cx,y-cy)>radiusPixels-Math.max(0,edgePadding||0))return null;
      return {x,y,visible:true};
    }
    pick(clientX,clientY){
      if(!this.enabled)return null;
      const rect=this.engine.renderer.domElement.getBoundingClientRect();
      if(!rect.width || !rect.height)return null;
      this.pointer.set(((clientX-rect.left)/rect.width)*2-1,-((clientY-rect.top)/rect.height)*2+1);
      this.engine.scene.updateMatrixWorld(true);
      this.raycaster.setFromCamera(this.pointer,this.engine.camera);
      const hits=this.raycaster.intersectObjects(this.meshes,false);
      for(const hit of hits){
        const row=hit.object.userData.records[hit.instanceId];
        if(!row)continue;
        const local=geo(row.lat,row.lon,MARKER_RADIUS);
        const world=local.clone().applyMatrix4(this.group.matrixWorld);
        const outward=local.clone().normalize().transformDirection(this.group.matrixWorld);
        const toCamera=this.engine.camera.position.clone().sub(world);
        // Do not select markers behind the solid Earth, including those near the limb.
        if(outward.dot(toCamera)<=0.003)continue;
        return row;
      }
      return null;
    }
    setDisplay(singles, clusters){
      const displayed=(singles||[]); // never double-render screen-space cluster badges
      const signature=displayed.map(row=>row.key).join('\n');
      if(signature===this.displaySignature)return false;
      this.displaySignature=signature;
      for(const mesh of this.meshes){this.group.remove(mesh);mesh.material.dispose();}
      this.meshes=[];
      this.build(displayed);
      this.meshes.forEach(mesh=>{mesh.visible=this.enabled;});
      if(this.selected && !displayed.some(row=>row.key===this.selected.key))this.clearSelection();
      return true;
    }
    clearSelection(){
      this.selected=null;
      this.selectionRing.visible=false;
      this.selectionHalo.visible=false;
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
      if(moveCamera)this.focus(row);
      this.onSelect(row);
      return true;
    }
    focus(row){
      this.engine.target.rx=row.lat*DEG;
      this.engine.target.ry=(-90-row.lon)*DEG;
      this.engine.target.distance=Math.min(this.engine.target.distance,3.35);
      if(this.engine.dragVelocity)this.engine.dragVelocity.x=this.engine.dragVelocity.y=0;
    }
    setVisible(value){
      this.enabled=!!value;
      this.meshes.forEach(mesh=>{mesh.visible=this.enabled;});
      this.selectionRing.visible=this.enabled&&!!this.selected;
      this.selectionHalo.visible=this.enabled&&!!this.selected;
      if(!this.enabled){this.down=null;this.activePointers.clear();this.multiPointerGesture=false;}
    }
    dispose(){
      this.listeners.forEach(([node,name,fn,opts])=>node.removeEventListener(name,fn,opts));
      this.listeners=[];
      this.activePointers.clear();
      this.engine.globeGroup.remove(this.group);
      this.meshes.forEach(mesh=>{mesh.material.dispose();});
      this.geometry.dispose();
      if(this.clusterGeometry)this.clusterGeometry.dispose();
      this.selectionGeometry.dispose();
      this.selectionMaterial.dispose();
      this.haloGeometry.dispose();
      this.haloMaterial.dispose();
      this.meshes=[];
    }
  }
  global.RaspehrEntityMarkers={EntityMarkers,geo,MARKER_RADIUS};
})(window);
