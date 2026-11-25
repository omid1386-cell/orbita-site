/* RASPEHR Priority 3 — local open imagery and mapped facility geometry.
 * Imagery: OpenAerialMap STAC + item-scoped TiTiler tiles (CC-BY / CC-BY-SA only).
 * Facilities: OpenStreetMap building ways (ODbL), requested only after user action.
 * Approximate/reference coordinates are deliberately excluded from close facility mode.
 */
(function (global) {
  'use strict';

  const T = global.THREE;
  const RADIUS = 1.72;
  const EARTH_METERS = 6371000;
  const DEG = Math.PI / 180;
  const WORLD_PER_METER = RADIUS / EARTH_METERS;
  const FACILITY_CAMERA_MIN = RADIUS + 0.00008;
  const FACILITY_CAMERA_DISTANCE = RADIUS + 0.00012;
  const PATCH_RADIUS_OFFSET = 0.000002;
  const BUILDING_RADIUS_OFFSET = 0.000003;
  const STAC_SEARCH_URL = 'https://api.imagery.hotosm.org/stac/search';
  const OAM_TILE_ROOT = 'https://tiles.imagery.hotosm.org/raster/collections/openaerialmap/items/';
  const DEFAULT_OVERPASS_URL = 'https://overpass.private.coffee/api/interpreter';
  const FACILITY_CATEGORIES = new Set(['test_facility','ground_station','mission_control','university_space','ground_services']);
  const BUILDING_CACHE = new Map();

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function isApproximate(row) {
    const source = String((row && row.precision) || '') + ' ' + String((row && row.coordinateNote) || '');
    return /approx|representative|reference|city|locality|region|area|campus|district|town|تقریبی|مرجع|نماینده|ناحیه|شهر|محوطه|پردیس/i.test(source);
  }
  function hasExplicitFacilityPrecision(row) {
    const precision = String((row && row.precision) || '').toLowerCase();
    return /official|operator_published|mapped_|osm_|building|site_coordinates|facility_coordinate|antenna/.test(precision);
  }
  function facilityEligibility(row) {
    if (!row || !Number.isFinite(row.lat) || !Number.isFinite(row.lon) || Math.abs(row.lat) > 90 || Math.abs(row.lon) > 180)
      return {allowed:false, reason:'مختصات معتبر برای این مکان ثبت نشده است.'};
    if (isApproximate(row))
      return {allowed:false, reason:'مختصات این رکورد تقریبی یا نماینده یک محدوده است؛ برای جلوگیری از نمایش گمراه‌کننده، نمای نزدیک تأسیسات غیرفعال است.'};
    const explicit = hasExplicitFacilityPrecision(row);
    if (row.kind === 'site') {
      return {allowed:true, confidence:explicit?'verified':'unverified', reason:explicit?'مبنای مختصات تأسیسات در رکورد مشخص شده است.':'مبنای دقیق مختصات در رکورد ثبت نشده؛ تصویر فقط محدوده پیرامون نقطه ثبت‌شده را نشان می‌دهد.'};
    }
    if (row.kind === 'company' && explicit && (row.categories || []).some(category => FACILITY_CATEGORIES.has(category)))
      return {allowed:true, confidence:'verified', reason:'موقعیت تأسیسات دارای مبنای مکانی ثبت‌شده است.'};
    if (row.kind === 'recovery' && explicit)
      return {allowed:true, confidence:'verified', reason:'مبنای مختصات مکان بازیابی ثبت شده است.'};
    return {allowed:false, reason:'برای این شناسنامه مختصات تأسیسات یا ساختمان به‌اندازه کافی مشخص نیست.'};
  }

  function mercatorTile(lat, lon, zoom) {
    const n = 2 ** zoom;
    const safeLat = clamp(lat, -85.05112878, 85.05112878) * DEG;
    const x = ((lon + 180) / 360 * n + n) % n;
    const y = clamp((1 - Math.log(Math.tan(safeLat) + 1 / Math.cos(safeLat)) / Math.PI) / 2 * n, 0, n - 1e-9);
    return {x:Math.floor(x), y:Math.floor(y), zoom};
  }
  function tileBounds(zoom, x, y) {
    const n = 2 ** zoom;
    const lonWest = x / n * 360 - 180;
    const lonEast = (x + 1) / n * 360 - 180;
    const latNorth = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) / DEG;
    const latSouth = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))) / DEG;
    return {west:lonWest,east:lonEast,north:latNorth,south:latSouth};
  }
  function zoomForGsd(gsd, lat) {
    const resolution = 156543.03392804097 * Math.cos(lat * DEG);
    const target = Number.isFinite(gsd) && gsd > 0 ? gsd : 1.2;
    return clamp(Math.round(Math.log2(resolution / target)), 14, 19);
  }
  function normalizeLicense(value) {
    return String(value || '').trim().toUpperCase().replace(/_/g,'-').replace(/\s+/g,'');
  }
  function pointInRing(lon, lat, ring) {
    if (!Array.isArray(ring) || ring.length < 4) return false;
    let inside = false;
    for (let i=0,j=ring.length-1;i<ring.length;j=i++) {
      const xi=Number(ring[i][0]), yi=Number(ring[i][1]);
      const xj=Number(ring[j][0]), yj=Number(ring[j][1]);
      const intersects=((yi>lat)!==(yj>lat)) && (lon < (xj-xi)*(lat-yi)/((yj-yi)||1e-15)+xi);
      if (intersects) inside=!inside;
    }
    return inside;
  }
  function geometryContainsPoint(item, point) {
    const geometry = item && item.geometry;
    if (geometry && geometry.type === 'Polygon' && Array.isArray(geometry.coordinates))
      return pointInRing(point.lon,point.lat,geometry.coordinates[0]);
    if (geometry && geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates))
      return geometry.coordinates.some(poly=>pointInRing(point.lon,point.lat,poly[0]));
    const bbox=item && item.bbox;
    return Array.isArray(bbox) && bbox.length>=4 && point.lon>=bbox[0] && point.lon<=bbox[2] && point.lat>=bbox[1] && point.lat<=bbox[3];
  }
  function chooseBestImageryItem(items, point) {
    const candidates=(items||[]).filter(item=>{
      const props=item && item.properties || {};
      const license=normalizeLicense(props.license || props['oam:license'] || item.license);
      const allowed=license==='CC-BY-4.0' || license==='CC-BY-SA-4.0';
      const gsd=Number(props.gsd || props['proj:gsd'] || props['eo:gsd']);
      const product=String(props['oam:product_type'] || 'visual').toLowerCase();
      return !!(item && item.id && item.assets && item.assets.visual && allowed && product==='visual' && Number.isFinite(gsd) && gsd>0 && gsd<=10 && geometryContainsPoint(item,point));
    });
    candidates.sort((a,b)=>{
      const ag=Number(a.properties.gsd || a.properties['proj:gsd'] || a.properties['eo:gsd']);
      const bg=Number(b.properties.gsd || b.properties['proj:gsd'] || b.properties['eo:gsd']);
      if (Math.abs(ag-bg)>1e-9) return ag-bg;
      const ad=Date.parse(a.properties.datetime || a.properties.start_datetime || '') || 0;
      const bd=Date.parse(b.properties.datetime || b.properties.start_datetime || '') || 0;
      return bd-ad;
    });
    return candidates[0] || null;
  }
  function parseHeight(tags) {
    const raw=String((tags && tags.height) || '').trim();
    if (raw) {
      const match=raw.match(/([0-9]+(?:\.[0-9]+)?)\s*(m|meter|meters|ft|feet|foot)?/i);
      if (match) {
        let meters=Number(match[1]);
        if (/^(ft|feet|foot)$/i.test(match[2] || '')) meters*=0.3048;
        if (Number.isFinite(meters) && meters>0 && meters<=300) return {meters,approximate:false,source:'height'};
      }
    }
    const levels=Number(tags && tags['building:levels']);
    if (Number.isFinite(levels) && levels>0 && levels<=80)
      return {meters:levels*3.2,approximate:true,source:'building:levels'};
    return {meters:0,approximate:false,source:'footprint-only'};
  }
  function makeOverpassQuery(row, radiusMeters) {
    const latDelta=(radiusMeters || 500)/111320;
    const lonDelta=(radiusMeters || 500)/(111320*Math.max(0.15,Math.cos(row.lat*DEG)));
    const south=clamp(row.lat-latDelta,-85,85), north=clamp(row.lat+latDelta,-85,85);
    const west=clamp(row.lon-lonDelta,-180,180), east=clamp(row.lon+lonDelta,-180,180);
    return `[out:json][timeout:20];way["building"](${south.toFixed(6)},${west.toFixed(6)},${north.toFixed(6)},${east.toFixed(6)});out geom;`;
  }
  function imagerySearchUrl(row) {
    const latDelta=0.008;
    const lonDelta=0.008/Math.max(0.15,Math.cos(row.lat*DEG));
    const west=clamp(row.lon-lonDelta,-180,180), east=clamp(row.lon+lonDelta,-180,180);
    const south=clamp(row.lat-latDelta,-85,85), north=clamp(row.lat+latDelta,-85,85);
    const url=new URL(STAC_SEARCH_URL);
    url.searchParams.set('bbox',[west,south,east,north].join(','));
    url.searchParams.set('collections','openaerialmap');
    url.searchParams.set('limit','40');
    return url.toString();
  }
  function parseProvider(item) {
    const props=item.properties || {};
    return String(props['oam:producer_name'] || (item.providers && item.providers[0] && item.providers[0].name) || 'تولیدکننده ثبت نشده');
  }
  function imageryMetadata(item) {
    const props=item.properties || {};
    return {
      id:item.id,
      gsd:Number(props.gsd || props['proj:gsd'] || props['eo:gsd']),
      date:props.datetime || props.start_datetime || 'تاریخ ثبت نشده',
      provider:parseProvider(item),
      license:props.license || props['oam:license'] || item.license,
      platform:props['oam:platform_type'] || 'نامشخص',
      url:`https://api.imagery.hotosm.org/stac/collections/openaerialmap/items/${encodeURIComponent(item.id)}`
    };
  }
  function pointOnSurface(lat,lon,radius) {
    const p=lat*DEG,l=lon*DEG,r=radius==null?RADIUS+PATCH_RADIUS_OFFSET:radius;
    return new T.Vector3(r*Math.cos(p)*Math.cos(l),r*Math.sin(p),-r*Math.cos(p)*Math.sin(l));
  }
  function buildTileGeometry(zoom,x,y,segments) {
    const bounds=tileBounds(zoom,x,y),steps=segments||16;
    const positions=[],uvs=[],indices=[];
    for(let row=0;row<=steps;row++){
      const v=row/steps,lat=bounds.north+(bounds.south-bounds.north)*v;
      for(let col=0;col<=steps;col++){
        const u=col/steps,lon=bounds.west+(bounds.east-bounds.west)*u;
        const point=pointOnSurface(lat,lon);
        positions.push(point.x,point.y,point.z);
        uvs.push(u,1-v);
      }
    }
    for(let row=0;row<steps;row++){
      for(let col=0;col<steps;col++){
        const a=row*(steps+1)+col,b=a+(steps+1),c=a+1,d=b+1;
        indices.push(a,b,c,b,d,c);
      }
    }
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }
  function parseOsmBuilding(element) {
    if (!element || element.type!=='way' || !element.tags || !element.tags.building || !Array.isArray(element.geometry) || element.geometry.length<4) return null;
    const coords=element.geometry.map(point=>({lat:Number(point.lat),lon:Number(point.lon)}));
    if (coords.some(point=>!Number.isFinite(point.lat)||!Number.isFinite(point.lon))) return null;
    const first=coords[0],last=coords[coords.length-1];
    if (Math.abs(first.lat-last.lat)>1e-7 || Math.abs(first.lon-last.lon)>1e-7) coords.push({lat:first.lat,lon:first.lon});
    if (coords.length<4) return null;
    const center=coords.slice(0,-1).reduce((acc,p)=>({lat:acc.lat+p.lat/ (coords.length-1),lon:acc.lon+p.lon/(coords.length-1)}),{lat:0,lon:0});
    const points=coords.slice(0,-1).map(p=>({x:(p.lon-center.lon)*DEG*EARTH_METERS*Math.cos(center.lat*DEG)*WORLD_PER_METER,y:(p.lat-center.lat)*DEG*EARTH_METERS*WORLD_PER_METER}));
    let area=0;
    for(let i=0,j=points.length-1;i<points.length;j=i++) area+=points[j].x*points[i].y-points[i].x*points[j].y;
    const areaM2=Math.abs(area)*0.5/(WORLD_PER_METER*WORLD_PER_METER);
    if (areaM2<12 || areaM2>250000) return null;
    return {id:element.id,center,points,tags:element.tags,areaM2,height:parseHeight(element.tags)};
  }

  class LocalFacilityView {
    constructor(engine,onStatus,options) {
      if(!T || !T.Group) throw new Error('Local facility view requires Three.js.');
      this.engine=engine;
      this.onStatus=typeof onStatus==='function'?onStatus:function(){};
      this.options=options||{};
      this.markers=null;
      this.selected=null;
      this.active=false;
      this.token=0;
      this.imageryAbort=null;
      this.buildingAbort=null;
      this.saved=null;
      this.imageryMeta=null;
      this.buildingSummary={total:0,extruded:0,heightExplicit:0,heightApproximate:0,footprints:0,osmTimestamp:'نامشخص'};
      this.imageryGroup=new T.Group();
      this.imageryGroup.name='raspehr-local-imagery';
      this.buildingGroup=new T.Group();
      this.buildingGroup.name='raspehr-osm-facility-buildings';
      this.imageryGroup.visible=false;
      this.buildingGroup.visible=false;
      this.engine.globeGroup.add(this.imageryGroup,this.buildingGroup);
    }
    setMarkers(markers){this.markers=markers||null;}
    canOpen(row){return facilityEligibility(row);}
    setSelection(row){
      if(this.active && (!row || !this.selected || row.key!==this.selected.key)) this.exit({restoreCamera:!row});
      this.selected=row||null;
      if(!row)this.emit({state:'idle',active:false,message:'مکانی انتخاب نشده است.'});
    }
    emit(status){
      try{this.onStatus(Object.assign({active:this.active,imagery:this.imageryMeta,buildings:this.buildingSummary},status||{}));}
      catch(error){console.warn('[RASPEHR local facility status]',error);}
    }
    clearGroup(group){
      while(group.children.length){
        const object=group.children[0];
        group.remove(object);
        if(object.geometry)object.geometry.dispose();
        if(object.material){
          const materials=Array.isArray(object.material)?object.material:[object.material];
          materials.forEach(material=>{
            if(material.map){const source=material.map.image;if(source&&typeof source.close==='function')source.close();material.map.dispose();}
            material.dispose();
          });
        }
      }
    }
    async enter(row){
      const access=this.canOpen(row);
      if(!access.allowed){this.emit({state:'blocked',active:false,message:access.reason});return false;}
      if(this.active)this.exit({restoreCamera:false});
      this.selected=row;
      this.active=true;
      const token=++this.token;
      this.imageryAbort=new AbortController();
      this.buildingAbort=new AbortController();
      this.saved={
        minDistance:this.engine.minDistance,
        near:this.engine.camera.near,
        far:this.engine.camera.far,
        clouds:!!this.engine.clouds.visible,
        atmosphere:!!this.engine.atmosphere.visible,
        stars:!!this.engine.starField.visible,
        grid:!!this.engine.gridGroup.visible,
        markerEnabled:this.markers?this.markers.enabled:true
      };
      const terrainMeters=this.engine.terrainData && this.engine.options.terrain
        ? Math.max(0,this.engine.terrainData.meters(row.lat,row.lon))*(this.engine.options.terrainExaggeration||1):0;
      const terrainOffset=(terrainMeters/EARTH_METERS)*RADIUS;
      const localRadius=RADIUS+terrainOffset;
      this.engine.minDistance=localRadius+(FACILITY_CAMERA_MIN-RADIUS);
      this.engine.camera.near=0.00001;
      this.engine.camera.far=12;
      this.engine.camera.updateProjectionMatrix();
      this.engine.clouds.visible=false;
      this.engine.atmosphere.visible=false;
      this.engine.starField.visible=false;
      this.engine.gridGroup.visible=false;
      if(this.markers)this.markers.setVisible(false);
      this.imageryGroup.visible=true;
      this.buildingGroup.visible=true;
      this.emit({state:'loading',active:true,message:'در حال جست‌وجوی تصویر باز و ساختمان‌های نقشه‌برداری‌شده پیرامون این مکان…'});
      this.engine.flyToGeo(row.lat,row.lon,localRadius+(FACILITY_CAMERA_DISTANCE-RADIUS),{duration:1800,minDistance:this.engine.minDistance});
      const [imagery,buildings]=await Promise.all([
        this.loadImagery(row,token,this.imageryAbort.signal).catch(error=>({error:error&&error.message||String(error),loaded:0})),
        this.loadBuildings(row,token,this.buildingAbort.signal).catch(error=>({error:error&&error.message||String(error),total:0,extruded:0,footprints:0}))
      ]);
      if(token!==this.token || !this.active)return false;
      const messages=[];
      if(imagery && imagery.loaded) messages.push(`${imagery.loaded} قطعه تصویر محلی`);
      else messages.push(imagery && imagery.message || 'تصویر ماهواره‌ای باز برای این محدوده پیدا نشد');
      if(buildings && buildings.total) messages.push(`${buildings.total} ساختمان نقشه‌برداری‌شده`);
      else messages.push(buildings && buildings.message || 'ساختمان ثبت‌شده‌ای در محدوده پیدا نشد');
      if(imagery && imagery.error) messages.push('تصویر: '+imagery.error);
      if(buildings && buildings.error) messages.push('ساختمان: '+buildings.error);
      this.emit({state:'ready',active:true,message:messages.join(' · '),imagery:this.imageryMeta,buildings:this.buildingSummary,confidence:access.confidence});
      return true;
    }
    async fetchJson(url,options,signal,timeoutMs){
      const controller=new AbortController();
      const relay=()=>controller.abort();
      if(signal){if(signal.aborted)controller.abort();else signal.addEventListener('abort',relay,{once:true});}
      const timer=setTimeout(()=>controller.abort(),timeoutMs||18000);
      try{
        const response=await fetch(url,Object.assign({mode:'cors',credentials:'omit',signal:controller.signal},options||{}));
        if(!response.ok)throw new Error('HTTP '+response.status);
        return await response.json();
      }catch(error){
        if(controller.signal.aborted && !(signal&&signal.aborted))throw new Error('درخواست پس از پایان مهلت متوقف شد.');
        throw error;
      }finally{clearTimeout(timer);if(signal)signal.removeEventListener('abort',relay);}
    }
    async loadImagery(row,token,signal){
      const url=imagerySearchUrl(row);
      const data=await this.fetchJson(url,{headers:{'Accept':'application/geo+json, application/json'}},signal,18000);
      if(token!==this.token || signal.aborted)return {loaded:0,message:'درخواست تصویر لغو شد'};
      const features=Array.isArray(data.features)?data.features:[];
      const item=chooseBestImageryItem(features,{lat:row.lat,lon:row.lon});
      if(!item)return {loaded:0,message:'تصویر باز با پوشش همین مختصات و وضوح حداکثر ۱۰ متر در کاتالوگ موجود نیست'};
      const meta=imageryMetadata(item);
      this.imageryMeta=meta;
      const zoom=zoomForGsd(meta.gsd,row.lat);
      const center=mercatorTile(row.lat,row.lon,zoom);
      const n=2**zoom,tasks=[];
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const x=((center.x+dx)%n+n)%n,y=clamp(center.y+dy,0,n-1);
        tasks.push({x,y,z:zoom});
      }
      let next=0,loaded=0,errors=0;
      const worker=async()=>{
        while(next<tasks.length && !signal.aborted && token===this.token){
          const tile=tasks[next++];
          try{
            const tileUrl=`${OAM_TILE_ROOT}${encodeURIComponent(item.id)}/tiles/WebMercatorQuad/${tile.z}/${tile.x}/${tile.y}?assets=visual&nodata=0`;
            const texture=await this.loadTexture(tileUrl,signal);
            if(signal.aborted || token!==this.token){this.disposeTexture(texture);continue;}
            const geometry=buildTileGeometry(tile.z,tile.x,tile.y,18);
            if(this.engine.terrainData && this.engine.options.terrain && global.RaspehrTerrainDEM)
              global.RaspehrTerrainDEM.applyHeightToGeometry(geometry,this.engine.terrainData,RADIUS,this.engine.options.terrainExaggeration||1);
            const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,depthTest:true,side:T.DoubleSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2});
            const mesh=new T.Mesh(geometry,material);
            mesh.renderOrder=3;
            this.imageryGroup.add(mesh);
            loaded++;
          }catch(error){errors++;}
        }
      };
      await Promise.all(Array.from({length:3},worker));
      if(token!==this.token || signal.aborted)return {loaded:0,message:'درخواست تصویر لغو شد'};
      return {loaded,errors,message:loaded?'تصویر باز بارگذاری شد':'کاشی تصویری برای این محدوده در دسترس نبود'};
    }
    async loadTexture(url,signal){
      const controller=new AbortController();
      const relay=()=>controller.abort();
      if(signal){if(signal.aborted)controller.abort();else signal.addEventListener('abort',relay,{once:true});}
      const timer=setTimeout(()=>controller.abort(),18000);
      let blob;
      try{
        const response=await fetch(url,{mode:'cors',credentials:'omit',signal:controller.signal,cache:'force-cache'});
        if(!response.ok)throw new Error('کاشی تصویر HTTP '+response.status);
        blob=await response.blob();
      }catch(error){
        if(controller.signal.aborted && !(signal&&signal.aborted))throw new Error('مهلت دریافت کاشی تصویر به پایان رسید.');
        throw error;
      }finally{clearTimeout(timer);if(signal)signal.removeEventListener('abort',relay);}
      let source,flipY=true;
      if(global.createImageBitmap){
        try{source=await global.createImageBitmap(blob,{imageOrientation:'flipY'});flipY=false;}
        catch(_){source=await global.createImageBitmap(blob);flipY=true;}
      }else{
        const objectUrl=URL.createObjectURL(blob);
        try{source=await new Promise((resolve,reject)=>{const image=new Image();image.crossOrigin='anonymous';image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('رمزگشایی کاشی تصویر ناموفق بود'));image.src=objectUrl;});}
        finally{URL.revokeObjectURL(objectUrl);}
      }
      const texture=new T.Texture(source);
      texture.flipY=flipY;
      texture.generateMipmaps=true;
      texture.minFilter=T.LinearMipmapLinearFilter;
      texture.magFilter=T.LinearFilter;
      if(T.SRGBColorSpace)texture.colorSpace=T.SRGBColorSpace;
      else if(T.sRGBEncoding)texture.encoding=T.sRGBEncoding;
      const max=this.engine.renderer.capabilities.getMaxAnisotropy?this.engine.renderer.capabilities.getMaxAnisotropy():1;
      texture.anisotropy=Math.min(8,max||1);
      texture.needsUpdate=true;
      return texture;
    }
    disposeTexture(texture){if(!texture)return;const source=texture.image;texture.dispose();if(source&&typeof source.close==='function')source.close();}
    async loadBuildings(row,token,signal){
      const key=`${row.lat.toFixed(4)},${row.lon.toFixed(4)}`;
      let data=BUILDING_CACHE.get(key);
      if(!data){
        const query=makeOverpassQuery(row,500);
        const endpoint=String(global.RASPEHR_OVERPASS_URL || DEFAULT_OVERPASS_URL);
        const body='data='+encodeURIComponent(query);
        data=await this.fetchJson(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8','Accept':'application/json'},body},signal,24000);
        if(BUILDING_CACHE.size>=80)BUILDING_CACHE.delete(BUILDING_CACHE.keys().next().value);
        BUILDING_CACHE.set(key,data);
      }
      if(token!==this.token || signal.aborted)return {total:0,extruded:0,footprints:0,message:'درخواست ساختمان لغو شد'};
      const elements=Array.isArray(data.elements)?data.elements:[];
      const parsed=elements.map(parseOsmBuilding).filter(Boolean)
        .sort((a,b)=>{
          const da=Math.hypot((a.center.lat-row.lat)*111320,(a.center.lon-row.lon)*111320*Math.cos(row.lat*DEG));
          const db=Math.hypot((b.center.lat-row.lat)*111320,(b.center.lon-row.lon)*111320*Math.cos(row.lat*DEG));
          return da-db;
        }).slice(0,80);
      let extruded=0,heightExplicit=0,heightApproximate=0,footprints=0;
      const zAxis=new T.Vector3(0,0,1);
      parsed.forEach(building=>{
        const shape=new T.Shape();
        building.points.forEach((point,index)=>{if(index===0)shape.moveTo(point.x,point.y);else shape.lineTo(point.x,point.y);});
        shape.closePath();
        const heightWorld=building.height.meters*WORLD_PER_METER;
        const geometry=heightWorld>0
          ? new T.ExtrudeGeometry(shape,{depth:heightWorld,bevelEnabled:false,curveSegments:1,steps:1})
          : new T.ShapeGeometry(shape);
        geometry.computeVertexNormals();
        const terrainMeters=this.engine.terrainData&&this.engine.options.terrain?Math.max(0,this.engine.terrainData.meters(building.center.lat,building.center.lon))*(this.engine.options.terrainExaggeration||1):0;
        const baseRadius=RADIUS+(terrainMeters/EARTH_METERS)*RADIUS+BUILDING_RADIUS_OFFSET;
        const radial=pointOnSurface(building.center.lat,building.center.lon,1).normalize();
        const lon=building.center.lon*DEG,lat=building.center.lat*DEG;
        const east=new T.Vector3(-Math.sin(lon),0,-Math.cos(lon)).normalize();
        const north=new T.Vector3(-Math.sin(lat)*Math.cos(lon),Math.cos(lat),Math.sin(lat)*Math.sin(lon)).normalize();
        const basis=new T.Matrix4().makeBasis(east,north,radial);
        const quaternion=new T.Quaternion().setFromRotationMatrix(basis);
        const center=pointOnSurface(building.center.lat,building.center.lon,baseRadius);
        const hasHeight=heightWorld>0;
        const material=new T.MeshBasicMaterial({color:hasHeight?0xd7ae64:0x54c9e6,transparent:true,opacity:hasHeight?0.34:0.24,depthWrite:false,side:T.DoubleSide});
        const mesh=new T.Mesh(geometry,material);
        mesh.position.copy(center);
        mesh.quaternion.copy(quaternion);
        mesh.renderOrder=4;
        mesh.userData={osmId:building.id,heightMeters:building.height.meters,heightApproximate:building.height.approximate,areaM2:building.areaM2,tags:building.tags};
        this.buildingGroup.add(mesh);
        const outlinePoints=building.points.map(point=>new T.Vector3(point.x,point.y,hasHeight?heightWorld:0.00000025));
        const outlineGeometry=new T.BufferGeometry().setFromPoints(outlinePoints);
        const outlineMaterial=new T.LineBasicMaterial({color:hasHeight?0xffd58a:0x8feaff,transparent:true,opacity:0.95,depthWrite:false});
        const outline=new T.LineLoop(outlineGeometry,outlineMaterial);
        outline.position.copy(center);
        outline.quaternion.copy(quaternion);
        outline.renderOrder=5;
        this.buildingGroup.add(outline);
        if(hasHeight){
          extruded++;
          if(building.height.approximate)heightApproximate++;else heightExplicit++;
        }else footprints++;
      });
      this.buildingSummary={total:parsed.length,extruded,heightExplicit,heightApproximate,footprints,
        osmTimestamp:data.osm3s&&data.osm3s.timestamp_osm_base||'زمان به‌روزرسانی ثبت نشده'};
      return Object.assign({},this.buildingSummary,{message:parsed.length?'ساختمان‌های ثبت‌شده در نقشه بارگذاری شدند':'در محدوده انتخابی ساختمان نقشه‌برداری‌شده‌ای ثبت نشده است'});
    }
    exit(options){
      const opts=options||{};
      if(!this.active){this.clearGroup(this.imageryGroup);this.clearGroup(this.buildingGroup);this.imageryGroup.visible=false;this.buildingGroup.visible=false;return false;}
      this.token++;
      if(this.imageryAbort)this.imageryAbort.abort();
      if(this.buildingAbort)this.buildingAbort.abort();
      this.imageryAbort=this.buildingAbort=null;
      const row=this.selected,saved=this.saved||{};
      this.active=false;
      this.clearGroup(this.imageryGroup);
      this.clearGroup(this.buildingGroup);
      this.imageryGroup.visible=false;
      this.buildingGroup.visible=false;
      this.imageryMeta=null;
      this.buildingSummary={total:0,extruded:0,heightExplicit:0,heightApproximate:0,footprints:0,osmTimestamp:'نامشخص'};
      this.engine.minDistance=Number.isFinite(saved.minDistance)?saved.minDistance:2.02;
      this.engine.camera.near=Number.isFinite(saved.near)?saved.near:0.025;
      this.engine.camera.far=Number.isFinite(saved.far)?saved.far:180;
      this.engine.camera.updateProjectionMatrix();
      this.engine.clouds.visible=!!saved.clouds;
      this.engine.atmosphere.visible=saved.atmosphere!==false;
      this.engine.starField.visible=!!saved.stars;
      this.engine.gridGroup.visible=!!saved.grid;
      if(this.markers)this.markers.setVisible(saved.markerEnabled!==false);
      this.saved=null;
      if(opts.restoreCamera!==false && row){
        const focus=global.RaspehrEntityMarkers?global.RaspehrEntityMarkers.focusDistanceFor(row):3.05;
        this.engine.flyToGeo(row.lat,row.lon,focus,{duration:1100});
      }
      this.emit({state:'idle',active:false,message:'به نمای معمول کره زمین بازگشتید.'});
      return true;
    }
    dispose(){this.exit({restoreCamera:false});this.clearGroup(this.imageryGroup);this.clearGroup(this.buildingGroup);this.engine.globeGroup.remove(this.imageryGroup,this.buildingGroup);}
  }

  global.RaspehrLocalFacility={
    LocalFacilityView,facilityEligibility,isApproximate,hasExplicitFacilityPrecision,
    mercatorTile,tileBounds,zoomForGsd,chooseBestImageryItem,geometryContainsPoint,
    parseHeight,makeOverpassQuery,imagerySearchUrl,buildTileGeometry,parseOsmBuilding,
    constants:{RADIUS,EARTH_METERS,FACILITY_CAMERA_MIN,FACILITY_CAMERA_DISTANCE,STAC_SEARCH_URL,OAM_TILE_ROOT,DEFAULT_OVERPASS_URL}
  };
})(window);
