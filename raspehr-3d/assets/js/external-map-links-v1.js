/* RASPEHR external navigation — Google Maps & verified Google Earth links.
 * Uses the Stage-2 registry by canonical kind:id only. Never claims actual 3D coverage.
 * Core globe selection remains functional even if this independent module fails to load.
 */
(function(root,factory){
  'use strict';
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RaspehrExternalMaps=api;
})(typeof window!=='undefined'?window:null,function(root){
  'use strict';
  const $=id=>root&&root.document?root.document.getElementById(id):null;
  const REGISTRY_URL='data/external-links-v1.json';
  let active=null,entries=null,inflight=null,loadError='';
  const validCoord=(v,max)=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=max;
  const keyOf=row=>row&&typeof row.kind==='string'&&typeof row.id==='string'?row.kind+':'+row.id:null;
  function mapsUrl(lat,lon){
    if(!validCoord(lat,90)||!validCoord(lon,180))return '';
    return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(lat+','+lon);
  }
  function satelliteUrl(lat,lon,kind){
    if(!validCoord(lat,90)||!validCoord(lon,180))return '';
    const zoom=kind==='recovery'?11:kind==='site'?15:kind==='company'?16:null;
    if(zoom===null)return '';
    return 'https://www.google.com/maps/@?api=1&map_action=map&center='+encodeURIComponent(lat+','+lon)+'&zoom='+zoom+'&basemap=satellite';
  }
  // The direct Earth camera URL is derived from canonical coordinates. Google does
  // not document this format as a stable public URL API. It must remain visibly
  // labelled as an experimental direct view, separate from verified share URLs.
  function geoPart(v){return Number(v.toPrecision(15)).toString();}
  function earthDirectUrl(lat,lon,range,tilt){
    if(!validCoord(lat,90)||!validCoord(lon,180)||
       !Number.isInteger(range)||range<500||range>100000||
       !Number.isInteger(tilt)||tilt<0||tilt>80)return '';
    return 'https://earth.google.com/web/@'+geoPart(lat)+','+geoPart(lon)+',0a,'+range+'d,35y,0h,'+tilt+'t,0r';
  }
  function safeDirectEarthLink(entry){
    if(!entry||!['pilot_user_confirmed','generated_pattern_unverified'].includes(entry.google_earth_direct_status)||
       !entry.google_earth_direct_camera||typeof entry.google_earth_direct_url!=='string')return '';
    const camera=entry.google_earth_direct_camera;
    const expected=earthDirectUrl(entry.lat,entry.lon,camera.range_m,camera.tilt_deg);
    return expected&&entry.google_earth_direct_url===expected?expected:'';
  }
  function safeEarthLink(entry){
    if(!entry||entry.google_earth_live_checked!==true||entry.google_earth_status!=='verified'||typeof entry.google_earth_share_url!=='string')return '';
    try{
      const url=new URL(entry.google_earth_share_url);
      return url.protocol==='https:'&&url.hostname==='earth.google.com' ? url.href : '';
    }catch(_){return '';}
  }
  function validateRowAgainstRegistry(row,entry){
    return !!(row&&entry&&row.id===entry.id&&row.kind===entry.kind&&
      validCoord(row.lat,90)&&validCoord(row.lon,180)&&
      validCoord(entry.lat,90)&&validCoord(entry.lon,180)&&
      Math.abs(row.lat-entry.lat)<1e-7&&Math.abs(row.lon-entry.lon)<1e-7&&
      entry.google_maps_url===mapsUrl(row.lat,row.lon)&&
      entry.google_maps_satellite_url===satelliteUrl(row.lat,row.lon,row.kind));
  }
  function setAnchor(id,href){
    const el=$(id);if(!el)return;
    if(href){el.href=href;el.hidden=false;}
    else{el.removeAttribute('href');el.hidden=true;}
  }
  function render(){
    const container=$('atlasExternalMaps');if(!container)return;
    if(!active){container.hidden=true;container.open=false;return;}
    container.hidden=false;
    const precision=$('atlasExternalMapsPrecision'),status=$('atlasExternalMapsStatus');
    setAnchor('atlasGoogleMapsLink','');setAnchor('atlasGoogleSatelliteLink','');setAnchor('atlasGoogleEarthLink','');
    const unavailable=$('atlasGoogleEarthUnavailable');if(unavailable)unavailable.hidden=false;
    if(!entries){
      if(precision)precision.textContent='دقت مکان باید از بانک پیوندها بررسی شود.';
      if(status)status.textContent=loadError?'بانک پیوندها بارگذاری نشد؛ قابلیت خارجی موقتا در دسترس نیست.':'در حال آماده‌سازی پیوندهای این مکان…';
      return;
    }
    const rec=entries.get(keyOf(active));
    if(!validateRowAgainstRegistry(active,rec)){
      if(precision)precision.textContent='مختصات این مکان با بانک پیوندها تطبیق نداشت.';
      if(status)status.textContent='پیوند خارجی برای جلوگیری از بازشدن موقعیت اشتباه غیرفعال شد.';
      return;
    }
    if(precision)precision.textContent='دقت موقعیت: '+(rec.coordinate_accuracy_label_fa||'نیازمند بررسی')+(rec.kind==='recovery'?' · نشانگر محدوده مرجع فرود/بازیابی است.':'')+(rec.geo_review_note_fa?' · '+rec.geo_review_note_fa:'');
    setAnchor('atlasGoogleMapsLink',rec.google_maps_url);
    setAnchor('atlasGoogleSatelliteLink',rec.google_maps_satellite_url);
    const verifiedEarth=safeEarthLink(rec);
    const directEarth=safeDirectEarthLink(rec);
    const earth=verifiedEarth||directEarth;
    setAnchor('atlasGoogleEarthLink',earth);
    const label=$('atlasGoogleEarthLinkLabel');
    if(label)label.textContent=verifiedEarth?'کاوش در گوگل ارث':'کاوش در گوگل ارث · لینک مستقیم آزمایشی';
    if(unavailable){
      unavailable.hidden=!!verifiedEarth;
      if(!verifiedEarth)unavailable.textContent=directEarth?
        'لینک مستقیم از مختصات این شناسنامه ساخته شده است. پنج لینک پایلوت طبق اعلام کاربر باز شده‌اند؛ نمایش صحیح این مکان و پوشش سه‌بعدی/۳۶۰ درجه مستقلا تأیید نشده است. دسترسی به سرور گوگل ارث هم ممکن است محدود باشد.':
        'لینک معتبر گوگل ارث برای این مکان در دسترس نیست.';
    }
    if(status)status.textContent=verifiedEarth?
      'پیوند اشتراکی گوگل ارث برای این مکان تأیید شده است؛ پوشش سه‌بعدی و پانوراما لزوما تأیید نشده‌اند.':
      (directEarth?(rec.google_earth_direct_status==='pilot_user_confirmed'?
        'این مکان جزو پنج لینک پایلوت تأییدشده توسط کاربر است؛ کیفیت تصاویر/سه‌بعدی تأیید نشده است.':
        'پیوند آزمایشی این مکان براساس الگوی پایلوت تولید شده؛ عملکرد آن به‌طور مستقل بررسی نشده است.'):
        'لینک گوگل ارث برای این مکان غیرفعال است.');
  }
  async function load(){
    if(entries)return entries;
    if(inflight)return inflight;
    if(!root||typeof root.fetch!=='function'){loadError='fetch unavailable';render();return null;}
    loadError='';
    inflight=(async()=>{
      const res=await root.fetch(REGISTRY_URL,{cache:'no-cache'});
      if(!res||!res.ok)throw new Error('Unable to read external map registry');
      const payload=await res.json();
      if(!payload||!Array.isArray(payload.records)||payload.records.length!==420)throw new Error('Registry count unexpected');
      const next=new Map();
      for(const rec of payload.records){
        const key=keyOf(rec);
        if(!key||next.has(key)||!validCoord(rec.lat,90)||!validCoord(rec.lon,180))throw new Error('Registry record invalid');
        next.set(key,rec);
      }
      entries=next;return entries;
    })().catch(err=>{loadError=String(err&&err.message||err);return null;}).finally(()=>{inflight=null;render();});
    return inflight;
  }
  function select(row){
    active=row||null;
    const container=$('atlasExternalMaps');if(container)container.open=false;
    render();
    if(active&&!entries)load();
  }
  const container=$('atlasExternalMaps');
  if(container)container.addEventListener('toggle',()=>{
    if(!container.open)return;
    if(active&&!entries)load();
    // Explicitly opening external links on a phone gives them enough room.
    // Do not affect the globe or the mobile sheet on place selection alone.
    const sheet=root&&root.RaspehrMobileSheet;
    if(sheet&&sheet.getState&&sheet.getState().enabled){
      if(sheet.getState().snap==='half')sheet.setSnap('full');
      if(typeof root.requestAnimationFrame==='function')root.requestAnimationFrame(()=>{
        if(container.open&&sheet.getState().enabled)container.scrollIntoView({block:'nearest'});
      });
    }
  });
  return {select,mapsUrl,satelliteUrl,earthDirectUrl,safeDirectEarthLink,safeEarthLink,validateRowAgainstRegistry,load,getState:()=>({activeKey:keyOf(active),loaded:!!entries,error:loadError})};
});
