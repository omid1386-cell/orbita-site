/* RASPEHR Stage 05 — strict 2D/3D state format, no persistent user tracking. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RaspehrStage5State=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const categories=Object.freeze(['launch','propulsion','agency','satmaker','components','payloads','ground_services',
 'inspace_services','university_space','test_facility','ground_station','mission_control','site','recovery']);
 const kinds=Object.freeze(['company','site','recovery','country']);
 function bounded(v,min,max,fallback){let n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;}
 function str(v,len){return typeof v==='string'?v.slice(0,len):'';}
 function normalize(state){
  const s=state&&typeof state==='object'?state:{};
  const raw=s.camera&&typeof s.camera==='object'?s.camera:{};
  const camera={lat:bounded(raw.lat,-85,85,25),lon:bounded(raw.lon,-180,180,20),zoom:bounded(raw.zoom,1,20,1.9)};
  const selected=Array.isArray(s.categories)?s.categories.filter(x=>categories.includes(x)):categories;
  const p=s.profile&&typeof s.profile==='object'?s.profile:null;
  let profile=null;
  if(p && kinds.includes(p.kind) && str(p.id,180)){
   if(p.kind!=='company'||categories.slice(0,12).includes(p.category))profile={kind:p.kind,id:str(p.id,180),category:p.kind==='company'?p.category:p.kind};
  }
  return {camera,query:str(s.query,300),country:str(s.country,180),categories:[...new Set(selected)],profile,
    markerVisible:s.markerVisible!==false};
 }
 function zoomToDistance(zoom){return bounded(7.5/Math.pow(1.45,bounded(zoom,1,20,1.9)-1.5),2.08,9.5,5);}
 function distanceToZoom(distance){return bounded(1.5+Math.log(7.5/bounded(distance,2.08,9.5,5))/Math.log(1.45),1,20,2);}
 function wrapLon(lon){return ((Number(lon)+180)%360+360)%360-180;}
 return {normalize,categories,kinds,zoomToDistance,distanceToZoom,wrapLon};
});
