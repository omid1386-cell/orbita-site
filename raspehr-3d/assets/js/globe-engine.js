/* RASPEHR / 3D Earth — Stage 01, consolidation R8.
   Local multilevel imagery + optional remote geospatial DEM. No orbit data. */
(function (global) {
  'use strict';

  const T = global.THREE;
  const DEG = Math.PI / 180;
  const TAU = Math.PI * 2;
  const RADIUS = 1.72;
  const MIN_DISTANCE = 2.02;
  const MAX_DISTANCE = 10.8;
  const HOME_DISTANCE = 5.55;
  const QUALITY = Object.freeze({
    low:      {pixelRatio: 1.00, day: 2048, aux: 1024, relief: 0.24, anisotropy: 2},
    balanced: {pixelRatio: 1.35, day: 4096, aux: 2048, relief: 0.52, anisotropy: 4},
    high:     {pixelRatio: 2.00, day: 8192, aux: 4096, relief: 0.82, anisotropy: 8}
  });
  const TILE_LEVELS = Object.freeze([
    {id:'z0', rows:1, cols:2, minDistance:4.85, maxDistance:MAX_DISTANCE},
    {id:'z1', rows:2, cols:4, minDistance:3.30, maxDistance:4.85},
    {id:'z2', rows:4, cols:8, minDistance:MIN_DISTANCE, maxDistance:3.30}
  ]);
  const PRESETS = Object.freeze({
    world:      {name:'جهانی', lat:17, lon:19, distance:HOME_DISTANCE},
    asia:       {name:'آسیا', lat:35, lon:73, distance:3.78},
    europe:     {name:'اروپا', lat:49, lon:17, distance:3.28},
    americas:   {name:'آمریکا', lat:15, lon:-80, distance:4.12},
    middleeast: {name:'خاورمیانه', lat:29, lon:49, distance:3.08},
    africa:     {name:'آفریقا', lat:1, lon:20, distance:3.72},
    northpole:  {name:'قطب شمال', lat:83, lon:0, distance:4.35},
    antarctica: {name:'جنوبگان', lat:-82, lon:0, distance:4.45}
  });

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function geoFocusTarget(lat, lon, distance, minDistance) {
    if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lon) || Math.abs(lon) > 180) {
      throw new Error('مختصات مقصد برای تمرکز دوربین معتبر نیست.');
    }
    return {
      rx: clamp(lat * DEG, -1.569, 1.569),
      ry: (-90 - lon) * DEG,
      distance: clamp(Number.isFinite(distance) ? distance : 3.35, Number.isFinite(minDistance) ? minDistance : MIN_DISTANCE, MAX_DISTANCE)
    };
  }
  function sampleCameraFlight(flight, now) {
    if (!flight) return null;
    const raw = clamp((now - flight.startedAt) / flight.duration, 0, 1);
    const eased = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
    return {
      rx: flight.from.rx + (flight.to.rx - flight.from.rx) * eased,
      ry: lerpAngle(flight.from.ry, flight.to.ry, eased),
      distance: flight.from.distance + (flight.to.distance - flight.from.distance) * eased,
      progress: raw,
      done: raw >= 1
    };
  }
  function normalizeDegrees(v) { return ((v + 180) % 360 + 360) % 360 - 180; }
  function lerpAngle(a, b, t) { return a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t; }
  function seedRng(seed) {
    let state = seed | 0;
    return function () { state = (1664525 * state + 1013904223) | 0; return (state >>> 0) / 4294967296; };
  }
  // V8: no new draw passes or per-frame profile allocations.
  // Pass an existing result object in the render loop; optional for QA callers.
  const VISUAL_STYLES = Object.freeze({
    low:      Object.freeze({halo:0.55, cloud:0.28, twilight:0.28, stars:0.68}),
    balanced: Object.freeze({halo:0.82, cloud:0.34, twilight:0.65, stars:0.84}),
    high:     Object.freeze({halo:1.00, cloud:0.38, twilight:0.85, stars:0.90})
  });
  function getVisualEnvelope(distance, quality, lighting, result) {
    const style = VISUAL_STYLES[quality] || VISUAL_STYLES.balanced;
    const t = clamp((Number(distance) - MIN_DISTANCE) / (HOME_DISTANCE - MIN_DISTANCE), 0, 1);
    const smooth = t * t * (3 - 2 * t);
    result = result || {};
    result.atmosphere = style.halo * (0.18 + 0.82 * smooth);
    result.cloud = style.cloud * (0.72 + 0.28 * smooth);
    result.twilight = lighting === false ? 0 : style.twilight;
    result.stars = style.stars;
    return result;
  }

  function getTileLevelForDistance(distance, activeLevel) {
    // 0.10 globe-unit hysteresis prevents visible level thrash near boundaries.
    if (activeLevel === 'z0' && distance >= 4.75) return TILE_LEVELS[0];
    if (activeLevel === 'z1' && distance >= 3.20 && distance <= 4.95) return TILE_LEVELS[1];
    if (activeLevel === 'z2' && distance <= 3.40) return TILE_LEVELS[2];
    return TILE_LEVELS.find(level => distance >= level.minDistance && distance < level.maxDistance) || TILE_LEVELS[TILE_LEVELS.length - 1];
  }

  function getSunCoordinates(date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    const t = (jd - 2451545.0) / 36525;
    const l0 = (280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360;
    const m = (357.52911 + t * (35999.05029 - 0.0001537 * t)) * DEG;
    const c = Math.sin(m) * (1.914602 - t * (0.004817 + 0.000014 * t))
      + Math.sin(2 * m) * (0.019993 - 0.000101 * t)
      + Math.sin(3 * m) * 0.000289;
    const trueLongitude = l0 + c;
    const omega = (125.04 - 1934.136 * t) * DEG;
    const apparentLongitude = (trueLongitude - 0.00569 - 0.00478 * Math.sin(omega)) * DEG;
    const meanObliquity = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
    const obliquity = (meanObliquity + 0.00256 * Math.cos(omega)) * DEG;
    const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(apparentLongitude), Math.cos(apparentLongitude));
    const declination = Math.asin(Math.sin(obliquity) * Math.sin(apparentLongitude));
    const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0)
      + 0.000387933 * t * t - t * t * t / 38710000) % 360;
    const subsolarLongitude = normalizeDegrees(rightAscension / DEG - gmst);
    return {lat: declination / DEG, lon: subsolarLongitude};
  }
  function getSunDirection(date) {
    const point = getSunCoordinates(date);
    const lat = point.lat * DEG;
    const lon = point.lon * DEG;
    return new T.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)).normalize();
  }
  function geoToVector3(lat, lon, radius) {
    const p = lat * DEG, l = lon * DEG, r = radius == null ? RADIUS * 1.004 : radius;
    return new T.Vector3(r * Math.cos(p) * Math.cos(l), r * Math.sin(p), -r * Math.cos(p) * Math.sin(l));
  }

  function imageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('بارگذاری تصویر ناموفق بود: ' + url));
      image.src = url;
    });
  }
  async function resizedSource(image, maxWidth, maxHeight) {
    const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
    if (scale >= 0.999) return {source:image, flipY:true};
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    if (global.createImageBitmap) {
      try {
        return {source:await global.createImageBitmap(image, {resizeWidth: width, resizeHeight: height, resizeQuality: 'high', imageOrientation:'flipY'}), flipY:false};
      } catch (_) { /* Canvas fallback below. */ }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', {alpha: false});
    if (!ctx) throw new Error('ساخت بافت کم‌حجم در این مرورگر ممکن نیست.');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, width, height);
    return {source:canvas, flipY:true};
  }

  class GlobeEngine {
    constructor(host, onMetrics, onStatus) {
      if (!T) throw new Error('کتابخانه سه‌بعدی پروژه بارگذاری نشده است.');
      this.host = host;
      this.onMetrics = onMetrics || function () {};
      this.onStatus = onStatus || function () {};
      const perf = global.RaspehrStage6Performance;
      this.performanceMode = 'auto';
      this.visualMotionReduced = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
      this.visualEnvelope = {};
      this.perfPolicy = perf ? perf.policy(perf.hints(), this.performanceMode)
        : {fps:60,pixelCap:1.35,quality:'balanced',prefetch:true,moderate:false,mobile:false};
      this.frameInterval = 1000 / this.perfPolicy.fps;
      this.lastRenderAt = 0;
      this.active = true;
      this.options = {lighting:true, clouds:true, rotation:false, stars:true, grid:false, relief:true, terrain:true, terrainExaggeration:1, quality:this.perfPolicy.quality};
      this.target = {rx:0, ry:0, distance:HOME_DISTANCE};
      this.minDistance = MIN_DISTANCE;
      this.controls = new Map();
      this.dragVelocity = {x:0, y:0};
      this.lastPointerTime = 0;
      this.pinchDistance = 0;
      this.frameCount = 0;
      this.fpsTime = performance.now();
      this.lastTime = performance.now();
      this.lastSunUpdate = 0;
      this.lastLevelCheck = 0;
      this.stopped = false;
      this.raf = 0;
      this.boundAnimate = this.animate.bind(this);
      this.renderTiming = {total:0,max:0,count:0};
      this.bindings = [];
      this.frameObservers = new Set();
      this.textureToken = 0;
      this.textureQuality = null;
      this.textureLoadingStarted = false;
      this.contextLost = false;
      this.levelGroups = {};
      this.levelMaterials = {};
      this.levelCache = {};
      this.levelPromises = {};
      this.retiredLevelEntries = [];
      this.activeLevel = null;
      this.terrainData = null;
      this.terrainController = null;
      this.terrainLoaded = false;
      this.surfaceMode = 'uninitialized';
      this.start();
    }

    addFrameObserver(callback){
      if(typeof callback !== 'function')throw new TypeError('frame observer must be a function');
      this.frameObservers.add(callback);
      return () => this.frameObservers.delete(callback);
    }

    listen(node, event, handler, options) {
      node.addEventListener(event, handler, options);
      this.bindings.push([node, event, handler, options]);
    }

    start() {
      this.scene = new T.Scene();
      this.scene.background = new T.Color(0x020814);
      const width = Math.max(this.host.clientWidth, 1);
      const height = Math.max(this.host.clientHeight, 1);
      this.camera = new T.PerspectiveCamera(42, width / height, 0.025, 180);
      this.camera.position.set(0, 0, HOME_DISTANCE);
      this.camera.lookAt(0, 0, 0);
      this.renderer = new T.WebGLRenderer({antialias:this.perfPolicy.mode!=='economy', powerPreference:this.perfPolicy.mode==='economy'?'low-power':'high-performance', alpha:false, stencil:false});
      this.renderer.setClearColor(0x020814, 1);
      this.renderer.setSize(width, height, false);
      if (T.SRGBColorSpace) this.renderer.outputColorSpace = T.SRGBColorSpace;
      else if (T.sRGBEncoding) this.renderer.outputEncoding = T.sRGBEncoding;
      this.host.appendChild(this.renderer.domElement);

      this.globeGroup = new T.Group();
      this.globeGroup.rotation.order = 'XYZ';
      this.scene.add(this.globeGroup);

      const dayFallback = new T.DataTexture(new Uint8Array([19, 59, 92, 255]), 1, 1, T.RGBAFormat);
      const nightFallback = new T.DataTexture(new Uint8Array([1, 5, 10, 255]), 1, 1, T.RGBAFormat);
      const blackFallback = new T.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, T.RGBAFormat);
      dayFallback.needsUpdate = nightFallback.needsUpdate = blackFallback.needsUpdate = true;
      this.fallbackTextures = [dayFallback, nightFallback, blackFallback];

      this.uniforms = {
        uDay:{value:dayFallback}, uNight:{value:nightFallback},
        uRelief:{value:blackFallback}, uSpecular:{value:blackFallback},
        uSun:{value:getSunDirection(new Date())}, uLighting:{value:1},
        uReliefStrength:{value:QUALITY.balanced.relief}, uSpecularStrength:{value:0.22},
        uTwilightStrength:{value:0.65},
        uReliefTexel:{value:new T.Vector2(1 / 2048, 1 / 1024)}
      };

      this.earthMaterial = this.createSingleEarthMaterial();
      this.earth = new T.Mesh(new T.SphereGeometry(RADIUS, 256, 192), this.earthMaterial);
      this.earth.visible = false;
      this.globeGroup.add(this.earth);

      this.createTileLevelGroups();
      this.createCloudLayer();
      this.createAtmosphere();
      this.gridGroup = this.createGraticule();
      this.gridGroup.visible = false;
      this.globeGroup.add(this.gridGroup);
      this.createStarField();

      this.installInteractions();
      this.installLifecycle();
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(this.host);
      // The mobile sheet overlays the globe without changing the globe host's
      // size. Observe its height and state so the camera can center the Earth
      // in the actually visible map area, not behind the sheet.
      const mobileSheet = document.getElementById('mobileMainSheet');
      if (mobileSheet) {
        this.sheetObserver = new ResizeObserver(() => this.resize());
        this.sheetObserver.observe(mobileSheet);
        this.layoutObserver = new MutationObserver(() => {
          if (!this.stopped) global.requestAnimationFrame(() => this.resize());
        });
        this.layoutObserver.observe(document.body, {attributes:true, attributeFilter:['class']});
        this.layoutObserver.observe(mobileSheet, {attributes:true, attributeFilter:['data-mobile-snap']});
      }

      this.preset('world');
      this.setQuality(this.perfPolicy.quality, false);
      this.textureLoadingStarted = true;
      this.ready = this.loadImageryStack(this.perfPolicy.quality, true);
      this.ready.then(() => { if (this.options.terrain && !this.stopped) this.enableTerrain(); }).catch(() => {});
      this.raf = requestAnimationFrame(this.boundAnimate);
    }

    createSingleEarthMaterial() {
      return new T.ShaderMaterial({
        uniforms:this.uniforms,
        vertexShader:`varying vec2 vUvPoint; varying vec3 vWorldNormal; varying vec3 vWorldPosition; varying vec3 vWorldTangent; varying vec3 vWorldBitangent;
          void main(){
            vUvPoint=uv;
            float phi=uv.x*6.28318530718;
            float theta=uv.y*3.14159265359;
            vec3 tangent=normalize(vec3(sin(phi),0.0,cos(phi)));
            vec3 bitangent=normalize(vec3(-cos(phi)*cos(theta),-sin(theta),sin(phi)*cos(theta)));
            vec4 worldPosition=modelMatrix*vec4(position,1.0);
            vWorldPosition=worldPosition.xyz;
            vWorldNormal=normalize(mat3(modelMatrix)*normal);
            vWorldTangent=normalize(mat3(modelMatrix)*tangent);
            vWorldBitangent=normalize(mat3(modelMatrix)*bitangent);
            gl_Position=projectionMatrix*viewMatrix*worldPosition;
          }`,
        fragmentShader:`precision mediump float;
          uniform sampler2D uDay; uniform sampler2D uNight; uniform sampler2D uRelief; uniform sampler2D uSpecular;
          uniform vec3 uSun; uniform float uLighting; uniform float uReliefStrength; uniform float uSpecularStrength; uniform vec2 uReliefTexel; uniform float uTwilightStrength;
          varying vec2 vUvPoint; varying vec3 vWorldNormal; varying vec3 vWorldPosition; varying vec3 vWorldTangent; varying vec3 vWorldBitangent;
          void main(){
            float h0=texture2D(uRelief,vUvPoint).r;
            float hU=texture2D(uRelief,vUvPoint+vec2(uReliefTexel.x,0.0)).r;
            float hV=texture2D(uRelief,vUvPoint+vec2(0.0,uReliefTexel.y)).r;
            vec3 normal=normalize(vWorldNormal - vWorldTangent*(hU-h0)*uReliefStrength*5.0 - vWorldBitangent*(hV-h0)*uReliefStrength*5.0);
            vec3 sun=normalize(uSun);
            float ndl=dot(normal,sun);
            float dayMix=smoothstep(-0.13,0.16,ndl);
            vec3 day=texture2D(uDay,vUvPoint).rgb;
            vec3 night=texture2D(uNight,vUvPoint).rgb;
            vec3 dayColor=day*(0.56+0.52*max(ndl,0.0));
            vec3 nightColor=night*0.82+day*0.035;
            vec3 color=mix(nightColor,dayColor,dayMix);
            color=mix(day,color,uLighting);
            float ocean=texture2D(uSpecular,vUvPoint).r;
            vec3 viewDirection=normalize(cameraPosition-vWorldPosition);
            vec3 halfVector=normalize(viewDirection+sun);
            float highlight=pow(max(dot(normal,halfVector),0.0),52.0)*ocean*uSpecularStrength*max(ndl,0.0);
            color+=vec3(0.16,0.25,0.37)*highlight;
            // Subtle dawn/dusk warmth is applied equally to tiled and fallback terrain.
            float dusk=smoothstep(-0.19,-0.02,ndl)*(1.0-smoothstep(0.07,0.31,ndl));
            color+=vec3(0.075,0.034,0.012)*dusk*uTwilightStrength*uLighting;
            gl_FragColor=vec4(color,1.0);
          }`
      });
    }

    createEarthTileMaterial() {
      return new T.ShaderMaterial({
        uniforms:{
          uDayTile:{value:this.fallbackTextures[0]},
          uNightTile:{value:this.fallbackTextures[1]},
          uRelief:this.uniforms.uRelief,
          uSpecular:this.uniforms.uSpecular,
          uSun:this.uniforms.uSun,
          uLighting:this.uniforms.uLighting,
          uReliefStrength:this.uniforms.uReliefStrength,
          uSpecularStrength:this.uniforms.uSpecularStrength,
          uReliefTexel:this.uniforms.uReliefTexel,
          uTwilightStrength:this.uniforms.uTwilightStrength
        },
        vertexShader:`varying vec2 vTileUv; varying vec2 vGlobalUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition; varying vec3 vWorldTangent; varying vec3 vWorldBitangent;
          void main(){
            vTileUv=uv;
            vec3 objectNormal=normalize(position);
            float u=atan(-objectNormal.z,objectNormal.x)/6.28318530718+0.5;
            float v=asin(clamp(objectNormal.y,-1.0,1.0))/3.14159265359+0.5;
            vGlobalUv=vec2(u,v);
            float phi=u*6.28318530718;
            float theta=v*3.14159265359;
            vec3 tangent=normalize(vec3(sin(phi),0.0,cos(phi)));
            vec3 bitangent=normalize(vec3(-cos(phi)*cos(theta),-sin(theta),sin(phi)*cos(theta)));
            vec4 worldPosition=modelMatrix*vec4(position,1.0);
            vWorldPosition=worldPosition.xyz;
            vWorldNormal=normalize(mat3(modelMatrix)*normal);
            vWorldTangent=normalize(mat3(modelMatrix)*tangent);
            vWorldBitangent=normalize(mat3(modelMatrix)*bitangent);
            gl_Position=projectionMatrix*viewMatrix*worldPosition;
          }`,
        fragmentShader:`precision mediump float;
          uniform sampler2D uDayTile; uniform sampler2D uNightTile; uniform sampler2D uRelief; uniform sampler2D uSpecular;
          uniform vec3 uSun; uniform float uLighting; uniform float uReliefStrength; uniform float uSpecularStrength; uniform vec2 uReliefTexel; uniform float uTwilightStrength;
          varying vec2 vTileUv; varying vec2 vGlobalUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition; varying vec3 vWorldTangent; varying vec3 vWorldBitangent;
          void main(){
            float h0=texture2D(uRelief,vGlobalUv).r;
            float hU=texture2D(uRelief,vGlobalUv+vec2(uReliefTexel.x,0.0)).r;
            float hV=texture2D(uRelief,vGlobalUv+vec2(0.0,uReliefTexel.y)).r;
            vec3 normal=normalize(vWorldNormal - vWorldTangent*(hU-h0)*uReliefStrength*5.0 - vWorldBitangent*(hV-h0)*uReliefStrength*5.0);
            vec3 sun=normalize(uSun);
            float ndl=dot(normal,sun);
            float dayMix=smoothstep(-0.13,0.16,ndl);
            vec3 day=texture2D(uDayTile,vTileUv).rgb;
            vec3 night=texture2D(uNightTile,vTileUv).rgb;
            vec3 dayColor=day*(0.56+0.52*max(ndl,0.0));
            vec3 nightColor=night*0.82+day*0.035;
            vec3 color=mix(nightColor,dayColor,dayMix);
            color=mix(day,color,uLighting);
            float ocean=texture2D(uSpecular,vGlobalUv).r;
            vec3 viewDirection=normalize(cameraPosition-vWorldPosition);
            vec3 halfVector=normalize(viewDirection+sun);
            float highlight=pow(max(dot(normal,halfVector),0.0),52.0)*ocean*uSpecularStrength*max(ndl,0.0);
            color+=vec3(0.16,0.25,0.37)*highlight;
            // Subtle dawn/dusk warmth is applied equally to tiled and fallback terrain.
            float dusk=smoothstep(-0.19,-0.02,ndl)*(1.0-smoothstep(0.07,0.31,ndl));
            color+=vec3(0.075,0.034,0.012)*dusk*uTwilightStrength*uLighting;
            gl_FragColor=vec4(color,1.0);
          }`
      });
    }

    createTileLevelGroups() {
      TILE_LEVELS.forEach(level => {
        const group = new T.Group();
        const materials = [];
        for (let row = 0; row < level.rows; row++) {
          for (let col = 0; col < level.cols; col++) {
            const material = this.createEarthTileMaterial();
            const geometry = new T.SphereGeometry(RADIUS, Math.max(20, 96 / level.cols), Math.max(16, 80 / level.rows), col / level.cols * TAU, TAU / level.cols, row / level.rows * Math.PI, Math.PI / level.rows);
            const mesh = new T.Mesh(geometry, material);
            mesh.userData = {row, col, level: level.id};
            group.add(mesh);
            materials.push(material);
          }
        }
        group.visible = false;
        this.levelGroups[level.id] = group;
        this.levelMaterials[level.id] = materials;
        this.globeGroup.add(group);
      });
    }

    createCloudLayer() {
      this.cloudMaterial = new T.ShaderMaterial({
        uniforms:{uCloudMap:{value:null},uSun:this.uniforms.uSun,uCloudOpacity:{value:0.34}},
        vertexShader:`varying vec2 vUvPoint;varying vec3 vWorldNormal;
          void main(){vUvPoint=uv;vWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader:`precision mediump float;uniform sampler2D uCloudMap;uniform vec3 uSun;uniform float uCloudOpacity;varying vec2 vUvPoint;varying vec3 vWorldNormal;
          void main(){float cloud=texture2D(uCloudMap,vUvPoint).r;float coverage=smoothstep(0.14,0.65,cloud);float sun=dot(normalize(vWorldNormal),normalize(uSun));float daylight=smoothstep(-0.19,0.21,sun);float alpha=coverage*uCloudOpacity*mix(0.26,1.0,daylight);vec3 tint=mix(vec3(0.70,0.80,0.93),vec3(0.93,0.96,1.0),daylight);gl_FragColor=vec4(tint,alpha);}`,
        transparent:true, depthWrite:false, side:T.FrontSide
      });
      this.clouds = new T.Mesh(new T.SphereGeometry(RADIUS * 1.012, 160, 112), this.cloudMaterial);
      this.clouds.visible = false;
      this.globeGroup.add(this.clouds);
    }

    createAtmosphere() {
      this.atmosphereMaterial = new T.ShaderMaterial({
        uniforms:{uSun:this.uniforms.uSun,uAtmosphereIntensity:{value:0.82}},
        vertexShader:`varying vec3 vWorldNormal;varying vec3 vWorldPosition;
          void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWorldPosition=wp.xyz;vWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*wp;}`,
        fragmentShader:`precision mediump float;uniform vec3 uSun;uniform float uAtmosphereIntensity;varying vec3 vWorldNormal;varying vec3 vWorldPosition;
          void main(){vec3 n=normalize(vWorldNormal);vec3 viewDirection=normalize(cameraPosition-vWorldPosition);float rim=pow(1.0-max(dot(n,viewDirection),0.0),3.10);float ndl=dot(n,normalize(uSun));float daylight=smoothstep(-0.24,0.48,ndl);float dusk=smoothstep(-0.35,-0.02,ndl)*(1.0-smoothstep(0.10,0.38,ndl));vec3 blue=mix(vec3(0.027,0.085,0.23),vec3(0.105,0.39,0.83),daylight);vec3 color=mix(blue,vec3(0.42,0.19,0.10),dusk*0.26);float opacity=rim*(0.12+0.88*daylight)*uAtmosphereIntensity*0.46;gl_FragColor=vec4(color,opacity);}`,
        transparent:true, depthWrite:false, blending:T.AdditiveBlending, side:T.FrontSide
      });
      this.atmosphere = new T.Mesh(new T.SphereGeometry(RADIUS * 1.047, 128, 96), this.atmosphereMaterial);
      this.globeGroup.add(this.atmosphere);
    }

    createStarField() {
      const rng = seedRng(48613), coords = [];
      for (let i = 0; i < 1550; i++) {
        const r = 19 + rng() * 57, theta = rng() * TAU, dec = rng() * 2 - 1;
        const radius = Math.sqrt(1 - dec * dec);
        coords.push(r * radius * Math.cos(theta), r * dec, r * radius * Math.sin(theta));
      }
      const geometry = new T.BufferGeometry();
      geometry.setAttribute('position', new T.Float32BufferAttribute(coords, 3));
      const material = new T.PointsMaterial({size:0.11, sizeAttenuation:true, color:0xcdd7ff, transparent:true, opacity:0.9, depthWrite:false});
      this.starField = new T.Points(geometry, material);
      this.scene.add(this.starField);
    }

    createGraticule() {
      const group = new T.Group();
      const materials = [];
      const createLine = (points, color, opacity) => {
        const geometry = new T.BufferGeometry().setFromPoints(points);
        const material = new T.LineBasicMaterial({color, transparent:true, opacity});
        materials.push(material);
        return new T.LineLoop(geometry, material);
      };
      const steps = 180;
      for (let lat = -60; lat <= 60; lat += 30) {
        const points = [];
        for (let i = 0; i < steps; i++) points.push(geoToVector3(lat, i / (steps - 1) * 360 - 180));
        group.add(createLine(points, lat === 0 ? 0x8ec5ff : 0x4f6d8e, lat === 0 ? 0.42 : 0.22));
      }
      for (let lon = -150; lon < 180; lon += 30) {
        const points = [];
        for (let i = 0; i < steps; i++) points.push(geoToVector3(i / (steps - 1) * 180 - 90, lon));
        group.add(createLine(points, 0x35506f, lon === 0 ? 0.38 : 0.18));
      }
      group.userData.materials = materials;
      return group;
    }

    async loadOneTexture(kind, url, maxSize, color) {
      const image = await imageFromUrl(url);
      const {source, flipY} = await resizedSource(image, maxSize, maxSize);
      const texture = new T.Texture(source);
      texture.flipY = flipY;
      texture.needsUpdate = true;
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy ? Math.min(QUALITY[this.options.quality].anisotropy, this.renderer.capabilities.getMaxAnisotropy()) : 1;
      if (color) {
        if (T.SRGBColorSpace) texture.colorSpace = T.SRGBColorSpace;
        else if (T.sRGBEncoding) texture.encoding = T.sRGBEncoding;
      }
      texture.userData.kind = kind;
      texture.userData.width = source.width || source.videoWidth || image.width;
      texture.userData.height = source.height || source.videoHeight || image.height;
      return texture;
    }

    disposeTexture(texture) {
      if (!texture) return;
      const source = texture.image;
      texture.dispose();
      if (source && typeof source.close === 'function') source.close();
    }

    disposeLevelEntries(entries) {
      (entries || []).forEach(entry => {
        if (entry.day) this.disposeTexture(entry.day);
        if (entry.night) this.disposeTexture(entry.night);
      });
    }

    buildLevelDescriptors(level, profile) {
      const tileSize = Math.max(256, Math.round(profile.day / level.cols));
      const descriptors = [];
      for (let row = 0; row < level.rows; row++) {
        for (let col = 0; col < level.cols; col++) {
          descriptors.push({
            row, col, size: tileSize,
            day:`assets/tex-tiles/${level.id}/day/day_${level.id}_r${row}_c${col}.jpg`,
            night:`assets/tex-tiles/${level.id}/night/night_${level.id}_r${row}_c${col}.jpg`
          });
        }
      }
      return descriptors;
    }

    async loadAuxTextures(profile) {
      const token = this.textureToken;
      const files = {
        clouds:{url:'../assets/tex/earth_clouds.jpg',size:profile.aux,color:false},
        relief:{url:'../assets/tex/earth_normal.jpg',size:profile.aux,color:false},
        specular:{url:'../assets/tex/earth_spec.jpg',size:profile.aux,color:false}
      };
      const entries = Object.entries(files);
      const results = await Promise.allSettled(entries.map(([kind, item]) => this.loadOneTexture(kind, item.url, item.size, item.color)));
      if (token !== this.textureToken || this.stopped) {
        results.forEach(r => { if (r.status === 'fulfilled') this.disposeTexture(r.value); });
        return [];
      }
      const errors = [];
      const next = {};
      results.forEach((result, index) => {
        const kind = entries[index][0];
        if (result.status === 'fulfilled') next[kind] = result.value;
        else errors.push(result.reason && result.reason.message ? result.reason.message : String(result.reason));
      });
      // Auxiliary maps are optional: missing clouds/relief/specular must not
      // prevent the main day/night Earth from appearing.
      const old = this.ownedAux || {};
      const combined = Object.assign({}, old, next);
      this.ownedAux = combined;
      this.uniforms.uRelief.value = combined.relief || this.fallbackTextures[2];
      this.uniforms.uSpecular.value = combined.specular || this.fallbackTextures[2];
      this.cloudMaterial.uniforms.uCloudMap.value = combined.clouds || null;
      this.clouds.visible = this.options.clouds && !!this.cloudMaterial.uniforms.uCloudMap.value;
      if (combined.relief) this.uniforms.uReliefTexel.value.set(1 / combined.relief.userData.width, 1 / combined.relief.userData.height);
      Object.keys(old).forEach(kind => { if (next[kind] && old[kind] !== next[kind]) this.disposeTexture(old[kind]); });
      return errors;
    }

    ensureLevelLoaded(levelId, profile, qualityLabel) {
      const level = TILE_LEVELS.find(item => item.id === levelId);
      if (!level) return Promise.reject(new Error('Unknown imagery level: ' + levelId));
      const cached = this.levelCache[levelId];
      if (cached && cached.quality === qualityLabel && cached.entries.length === level.rows * level.cols)
        return Promise.resolve(cached);
      const epoch = this.textureToken;
      const inFlight = this.levelPromises[levelId];
      if (inFlight && inFlight.epoch === epoch && inFlight.quality === qualityLabel)
        return inFlight.promise;
      const promise = (async () => {
        const descriptors = this.buildLevelDescriptors(level, profile);
        // allSettled for each pair ensures one successful texture isn't leaked
        // when the other texture for that tile fails.
        const results = await Promise.allSettled(descriptors.map(async desc => {
          const pair = await Promise.allSettled([
            this.loadOneTexture(`day-${levelId}-${desc.row}-${desc.col}`, desc.day, desc.size, true),
            this.loadOneTexture(`night-${levelId}-${desc.row}-${desc.col}`, desc.night, desc.size, true)
          ]);
          if (pair.every(item => item.status === 'fulfilled')) {
            return {row:desc.row, col:desc.col, day:pair[0].value, night:pair[1].value};
          }
          pair.forEach(item => { if (item.status === 'fulfilled') this.disposeTexture(item.value); });
          const error = pair.find(item => item.status === 'rejected');
          throw (error ? error.reason : new Error('Incomplete imagery pair'));
        }));
        const entries = [], errors = [];
        results.forEach(result => {
          if (result.status === 'fulfilled') entries.push(result.value);
          else errors.push(result.reason && result.reason.message ? result.reason.message : String(result.reason));
        });
        if (errors.length || epoch !== this.textureToken || this.stopped) {
          this.disposeLevelEntries(entries);
          throw new Error(errors[0] || 'Imagery request superseded by a newer quality/session');
        }
        const old = this.levelCache[levelId];
        this.levelCache[levelId] = {quality:qualityLabel, entries};
        // Do not dispose the previous level texture while its material is visible.
        if (old && old.entries !== entries) this.retiredLevelEntries.push(old.entries);
        return this.levelCache[levelId];
      })();
      this.levelPromises[levelId] = {epoch, quality:qualityLabel, promise};
      promise.finally(() => {
        if (this.levelPromises[levelId] && this.levelPromises[levelId].promise === promise)
          delete this.levelPromises[levelId];
      }).catch(() => {});
      return promise;
    }

    flushRetiredTextures() {
      for (const entries of this.retiredLevelEntries) this.disposeLevelEntries(entries);
      this.retiredLevelEntries = [];
    }
    pruneInactiveLevels() {
      // Keep current level and the likeliest adjacent level to bound GPU memory.
      const current = this.activeLevel;
      if (!['z0', 'z1', 'z2'].includes(current)) return;
      const neighbor = current === 'z0' ? 'z1'
        : current === 'z2' ? 'z1'
        : (this.target.distance <= 4.05 ? 'z2' : 'z0');
      const keep = new Set(!this.perfPolicy || this.perfPolicy.prefetch ? [current, neighbor] : [current]);
      Object.keys(this.levelCache).forEach(id => {
        if (keep.has(id)) return;
        const cache = this.levelCache[id];
        if (cache && cache.entries) this.disposeLevelEntries(cache.entries);
        delete this.levelCache[id];
      });
    }

    applyLevel(levelId) {
      const level = TILE_LEVELS.find(item => item.id === levelId);
      const cache = this.levelCache[levelId];
      if (!level || !cache || !cache.entries) return false;
      const materials = this.levelMaterials[levelId];
      cache.entries.forEach(entry => {
        const index = entry.row * level.cols + entry.col;
        const material = materials[index];
        material.uniforms.uDayTile.value = entry.day;
        material.uniforms.uNightTile.value = entry.night;
      });
      TILE_LEVELS.forEach(item => { this.levelGroups[item.id].visible = item.id === levelId; });
      this.earth.visible = false;
      this.activeLevel = levelId;
      this.surfaceMode = 'multilevel';
      this.flushRetiredTextures();
      this.pruneInactiveLevels();
      return true;
    }

    async loadFallbackSurface(profile, epoch) {
      const [dayResult, nightResult] = await Promise.allSettled([
        this.loadOneTexture('day', '../assets/tex/earth_day.jpg', profile.day, true),
        this.loadOneTexture('night', '../assets/tex/earth_night.jpg', profile.day, true)
      ]);
      if ((epoch != null && epoch !== this.textureToken) || this.stopped || dayResult.status !== 'fulfilled' || nightResult.status !== 'fulfilled') {
        if (dayResult.status === 'fulfilled') this.disposeTexture(dayResult.value);
        if (nightResult.status === 'fulfilled') this.disposeTexture(nightResult.value);
        throw new Error('بافت تک‌تکه روز/شب نیز بارگذاری نشد.');
      }
      if (this.ownedFallback) {
        this.disposeTexture(this.ownedFallback.day);
        this.disposeTexture(this.ownedFallback.night);
      }
      this.ownedFallback = {day:dayResult.value, night:nightResult.value};
      this.uniforms.uDay.value = this.ownedFallback.day;
      this.uniforms.uNight.value = this.ownedFallback.night;
      this.earth.visible = true;
      TILE_LEVELS.forEach(item => { this.levelGroups[item.id].visible = false; });
      this.activeLevel = 'single';
      this.surfaceMode = 'single-fallback';
    }

    async loadImageryStack(level, initial) {
      const token = ++this.textureToken;
      const profile = QUALITY[level] || QUALITY.balanced;
      this.onStatus({type:'loading', quality:level, message:initial ? 'در حال بارگذاری هرم چندسطحی تصاویر زمین...' : 'در حال بازآرایی هرم چندسطحی تصاویر...'});
      const errors = await this.loadAuxTextures(profile);
      if (token !== this.textureToken || this.stopped) return {stale:true, loaded:0, errors};
      const targetLevel = getTileLevelForDistance(this.target.distance).id;
      try {
        await this.ensureLevelLoaded(targetLevel, profile, level);
        if (token !== this.textureToken || this.stopped) return {stale:true, loaded:0, errors};
        this.applyLevel(targetLevel);
      } catch (err) {
        if (token !== this.textureToken || this.stopped) return {stale:true, loaded:0, errors};
        errors.push(err.message);
        // Retain the previous visible level if possible instead of flashing blank.
        if (!this.activeLevel) await this.loadFallbackSurface(profile, token);
      }
      this.textureQuality = level;
      // Adjacent-level prefetch is optional and must never override the visible level.
      const nextLevel = targetLevel === 'z0' ? 'z1' : targetLevel === 'z1' ? 'z2' : null;
      if (nextLevel && this.perfPolicy.prefetch) this.ensureLevelLoaded(nextLevel, profile, level).catch(() => {});
      // Keep one-pixel fallback textures alive until dispose() because some
      // inactive ShaderMaterials still reference them.
      const loadedCount = Object.values(this.levelCache).reduce((sum, cache) => sum + (cache && cache.entries ? cache.entries.length * 2 : 0), 0)
        + (this.ownedAux ? Object.keys(this.ownedAux).length : 0)
        + (this.ownedFallback ? 2 : 0);
      this.onStatus({type:'ready', quality:level, loaded:loadedCount, errors, surfaceMode:this.surfaceMode, imageryLevel:this.activeLevel, pyramid:TILE_LEVELS.map(l => `${l.id}:${l.rows}×${l.cols}`).join(' · ')});
      return {loaded:loadedCount, errors, surfaceMode:this.surfaceMode, imageryLevel:this.activeLevel};
    }

    clearPointerGestures() {
      if (this.controls) this.controls.clear();
      this.pinchDistance = 0;
      if (this.dragVelocity) { this.dragVelocity.x = 0; this.dragVelocity.y = 0; }
      if (this.host && this.host.classList) this.host.classList.remove('is-dragging');
    }

    installInteractions() {
      const el = this.renderer.domElement;
      el.style.touchAction = 'none';
      const distance = () => {
        const points = [...this.controls.values()];
        if (points.length < 2) return 0;
        return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      };
      this.listen(el, 'pointerdown', e => {
        if (!this.active || this.stopped || document.hidden) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        this.cancelCameraFlight();
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
        this.controls.set(e.pointerId, {x:e.clientX,y:e.clientY});
        this.lastPointerTime = performance.now();
        if (this.controls.size >= 2) { this.pinchDistance = distance(); this.dragVelocity.x = this.dragVelocity.y = 0; }
        else { this.dragVelocity.x = this.dragVelocity.y = 0; }
        this.host.classList.add('is-dragging');
      });
      this.listen(el, 'pointermove', e => {
        if (!this.active || this.stopped || document.hidden || !this.controls.has(e.pointerId)) return;
        const before = this.controls.get(e.pointerId);
        const dx = e.clientX - before.x;
        const dy = e.clientY - before.y;
        const now = performance.now();
        const dt = clamp((now - this.lastPointerTime) / 1000, 0.008, 0.08);
        this.controls.set(e.pointerId, {x:e.clientX,y:e.clientY});
        if (this.controls.size === 1) {
          const vx = dx * 0.0046;
          const vy = dy * 0.0037;
          this.target.ry += vx;
          this.target.rx = clamp(this.target.rx + vy, -1.535, 1.535);
          this.dragVelocity.x = vx / dt;
          this.dragVelocity.y = vy / dt;
        } else if (this.controls.size >= 2) {
          const after = distance();
          if (this.pinchDistance > 0) this.target.distance = clamp(this.target.distance * (this.pinchDistance / Math.max(1, after)), this.minDistance || MIN_DISTANCE, MAX_DISTANCE);
          this.pinchDistance = after;
        }
        this.lastPointerTime = now;
      });
      const stop = e => {
        this.controls.delete(e.pointerId);
        if (this.controls.size === 0) { this.host.classList.remove('is-dragging'); this.pinchDistance = 0; }
        else if (this.controls.size === 1) { this.dragVelocity.x = this.dragVelocity.y = 0; this.pinchDistance = 0; }
      };
      this.listen(el, 'pointerup', stop);
      this.listen(el, 'pointercancel', stop);
      this.listen(el, 'lostpointercapture', stop);
      this.listen(el, 'wheel', e => { e.preventDefault(); this.zoomBy(Math.exp(clamp(e.deltaY, -240, 240) * 0.0012)); }, {passive:false});
      this.listen(el, 'dblclick', e => { e.preventDefault(); this.zoomBy(0.76); });
      this.listen(el, 'contextmenu', e => e.preventDefault());
      this.listen(global, 'blur', () => this.clearPointerGestures());
    }

    installLifecycle() {
      this.listen(document, 'visibilitychange', () => {
        if (document.hidden) {
          this.clearPointerGestures();
          this.cancelCameraFlight(); // prevent an unseen flight from jumping to its endpoint
          if (this.raf) cancelAnimationFrame(this.raf);
          this.raf = 0;
          this.lastTime = performance.now();
        } else if (!this.stopped && this.active && !this.raf) {
          this.lastTime = performance.now();
          this.fpsTime = this.lastTime;
          this.frameCount = 0;
          this.raf = requestAnimationFrame(this.boundAnimate);
        }
      });
      this.listen(this.renderer.domElement, 'webglcontextlost', e => {
        e.preventDefault();
        this.clearPointerGestures();
        this.cancelCameraFlight();
        this.contextLost = true;
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = 0;
        this.onStatus({type:'context-lost',message:'ارتباط با پردازنده گرافیکی قطع شد؛ در انتظار بازیابی...'});
      });
      this.listen(this.renderer.domElement, 'webglcontextrestored', () => {
        this.contextLost = false;
        this.onStatus({type:'context-restored',message:'پردازنده گرافیکی بازیابی شد؛ بازسازی هرم تصویری...'});
        this.renderer.resetState();
        this.textureToken++; // invalidate outstanding asynchronous imagery requests
        // Keep current CPU-side textures; Three.js will re-upload on WebGL restoration.
        this.loadImageryStack(this.options.quality, false).catch(err => this.onStatus({type:'warning',message:err.message}));
        if (this.active && !document.hidden && !this.raf) this.raf = requestAnimationFrame(this.boundAnimate);
      });
    }

    applyTerrainGeometry(enabled) {
      const adapter = global.RaspehrTerrainDEM;
      if (!adapter) return;
      const source = enabled ? this.terrainData : null;
      const exaggeration = this.options.terrainExaggeration || 1;
      let vertices = 0, displaced = 0;
      const meshes = [this.earth];
      Object.values(this.levelGroups).forEach(group => group.traverse(obj => {
        if (obj.isMesh) meshes.push(obj);
      }));
      meshes.forEach(mesh => {
        if (!mesh.geometry) return;
        const stats = adapter.applyHeightToGeometry(mesh.geometry, source, RADIUS, exaggeration);
        vertices += stats.vertices;
        displaced += stats.displaced;
      });
      this.terrainLoaded = !!enabled && !!this.terrainData;
      return {vertices,displaced};
    }

    async enableTerrain() {
      if (this.stopped || !this.options.terrain) return;
      if (!global.RaspehrTerrainDEM) {
        this.onStatus({type:'terrain-warning',message:'ماژول terrain-dem.js بارگذاری نشده است.'});
        return;
      }
      if (this.terrainData) {
        const stats=this.applyTerrainGeometry(true);
        this.onStatus({type:'terrain-ready',message:'پستی‌وبلندی هندسی از DEM فعال شد.',stats});
        return;
      }
      if (this.terrainController) return;
      const controller=new AbortController();
      this.terrainController=controller;
      this.onStatus({type:'terrain-loading',message:'در حال دریافت داده واقعی ارتفاع زمین از AWS Terrain Tiles...'});
      const terrain=new global.RaspehrTerrainDEM.TerrariumElevation(2);
      try {
        await terrain.load({signal:controller.signal,concurrency:4,onProgress:(done,total)=> {
          if (!this.stopped && !controller.signal.aborted) this.onStatus({type:'terrain-loading',message:`داده ارتفاعی: ${done} از ${total} قطعه`});
        }});
        if (this.stopped || controller.signal.aborted || !this.options.terrain) return;
        this.terrainData=terrain;
        const stats=this.applyTerrainGeometry(true);
        if (!stats || !stats.displaced) {
          this.onStatus({type:'terrain-warning', message:'DEM بارگذاری شد اما هیچ رأسی جابه‌جا نشد؛ داده ارتفاعی یا مختصات باید بررسی شود.', stats});
        } else {
          this.onStatus({type:'terrain-ready',message:'DEM دریافت شد؛ '+stats.displaced.toLocaleString('fa-IR')+' رأس با داده ارتفاعی جابه‌جا شد (ضریب نمایش: '+this.options.terrainExaggeration+'×).',stats});
        }
      } catch (err) {
        if (!controller.signal.aborted && !this.stopped) {
          const reason=err && err.message || String(err);
          this.onStatus({type:'terrain-warning',message:'داده DEM دریافت نشد؛ کره بدون تغییر هندسی باقی ماند. اتصال شبکه، CORS یا مسیر منبع را بررسی کنید. '+reason});
        }
      } finally {
        if (this.terrainController === controller) this.terrainController=null;
      }
    }

    cancelCameraFlight() {
      if (!this.cameraFlight) return false;
      this.cameraFlight = null;
      this.target.rx = this.globeGroup.rotation.x;
      this.target.ry = this.globeGroup.rotation.y;
      this.target.distance = this.camera.position.z;
      return true;
    }

    flyToGeo(lat, lon, distance, options) {
      const lowerBound = Number.isFinite(options && options.minDistance) ? options.minDistance : (this.minDistance || MIN_DISTANCE);
      const to = geoFocusTarget(lat, lon, distance, lowerBound);
      const duration = clamp(Number(options && options.duration) || 1350, 350, 4500);
      this.dragVelocity.x = this.dragVelocity.y = 0;
      this.cameraFlight = {
        from: {
          rx: this.globeGroup.rotation.x,
          ry: this.globeGroup.rotation.y,
          distance: this.camera.position.z
        },
        to,
        startedAt: performance.now(),
        duration
      };
      this.target.rx = to.rx;
      this.target.ry = to.ry;
      this.target.distance = to.distance;
      return true;
    }

    preset(name) {
      this.cancelCameraFlight();
      this.minDistance = MIN_DISTANCE;
      const p = PRESETS[name] || PRESETS.world;
      this.target.rx = p.lat * DEG;
      this.target.ry = (-90 - p.lon) * DEG;
      this.target.distance = p.distance;
      this.dragVelocity.x = this.dragVelocity.y = 0;
      return p;
    }
    zoomBy(factor) {
      this.cancelCameraFlight();
      this.target.distance = clamp(this.target.distance * factor, this.minDistance || MIN_DISTANCE, MAX_DISTANCE);
    }
    turn(x, y) {
      this.cancelCameraFlight();
      this.target.ry += x;
      this.target.rx = clamp(this.target.rx + y, -1.535, 1.535);
    }

    updateVisualLayers(dt, immediate) {
      if (!this.atmosphereMaterial || !this.cloudMaterial || !this.uniforms) return;
      const distance = this.camera && this.camera.position ? this.camera.position.z : this.target.distance;
      const visual = getVisualEnvelope(distance, this.options.quality, this.options.lighting,
        this.visualEnvelope || (this.visualEnvelope = {}));
      const ease = immediate ? 1 : 1 - Math.exp(-clamp(Number(dt) || 0, 0, 0.1) * 4.5);
      const halo = this.atmosphereMaterial.uniforms.uAtmosphereIntensity;
      const cloud = this.cloudMaterial.uniforms.uCloudOpacity;
      const dusk = this.uniforms.uTwilightStrength;
      if (Math.abs(halo.value - visual.atmosphere) > 0.0005) halo.value += (visual.atmosphere - halo.value) * ease;
      if (Math.abs(cloud.value - visual.cloud) > 0.0005) cloud.value += (visual.cloud - cloud.value) * ease;
      if (Math.abs(dusk.value - visual.twilight) > 0.0005) dusk.value += (visual.twilight - dusk.value) * ease;
      if (this.starField && this.starField.material && this.starField.material.opacity !== visual.stars)
        this.starField.material.opacity = visual.stars;
    }

    setOption(key, value) {
      if (!(key in this.options)) return;
      this.options[key] = value;
      if (key === 'lighting') {
        this.uniforms.uLighting.value = value ? 1 : 0;
        this.updateVisualLayers(0, true);
      }
      if (key === 'clouds') this.clouds.visible = !!value && !!this.cloudMaterial.uniforms.uCloudMap.value;
      if (key === 'stars') this.starField.visible = !!value;
      if (key === 'grid') this.gridGroup.visible = !!value;
      if (key === 'relief') this.uniforms.uReliefStrength.value = value ? QUALITY[this.options.quality].relief : 0;
      if (key === 'terrain') {
        if (value) this.enableTerrain();
        else {
          if (this.terrainController) { const pending=this.terrainController; this.terrainController=null; pending.abort(); }
          this.applyTerrainGeometry(false);
          this.onStatus({type:'terrain-off',message:'نمای هندسی مسطح فعال است.'});
        }
      }
      if (key === 'terrainExaggeration' && this.terrainData && this.options.terrain) {
        this.applyTerrainGeometry(true);
        this.onStatus({type:'terrain-ready',message:'بزرگ‌نمایی ارتفاع: '+value+' برابر'});
      }
      if (key === 'quality') this.setQuality(value);
    }

    setQuality(level, reload) {
      let normalized = QUALITY[level] ? level : 'balanced';
      const isMobile = !!(global.matchMedia && global.matchMedia('(max-width: 700px)').matches);
      const memory = global.navigator && Number(global.navigator.deviceMemory || 0);
      if (normalized === 'high' && (isMobile || (memory > 0 && memory <= 4))) {
        normalized = 'balanced';
        this.onStatus({type:'warning',message:'کیفیت ۸K برای این دستگاه سنگین است؛ کیفیت ۴K اعمال شد.'});
      }
      this.options.quality = normalized;
      const profile = QUALITY[normalized];
      if (this.renderer) {
        const deviceRatio = global.devicePixelRatio || 1;
        this.renderer.setPixelRatio(Math.min(profile.pixelRatio, this.perfPolicy.pixelCap, deviceRatio));
        this.resize();
      }
      this.uniforms.uReliefStrength.value = this.options.relief ? profile.relief : 0;
      this.updateVisualLayers(0, true);
      if (reload !== false && this.textureLoadingStarted && this.textureQuality !== normalized) {
        // The old level remains visible until the requested quality is ready.
        this.loadImageryStack(normalized, false).catch(err => this.onStatus({type:'warning',message:err.message}));
      }
    }

    setPerformanceMode(mode) {
      const perf = global.RaspehrStage6Performance;
      if (!perf) return this.perfPolicy;
      const next = perf.policy(perf.hints(), mode);
      this.performanceMode = next.requestedMode;
      this.perfPolicy = next;
      this.frameInterval = 1000 / next.fps;
      this.lastRenderAt = 0;
      this.setQuality(next.quality);
      this.pruneInactiveLevels();
      this.onStatus({type:'performance',message:'حالت عملکرد: '+(next.mode==='economy'?'کم‌مصرف':next.mode==='balanced'?'متعادل':'جزئیات بالا')+' · سقف '+next.fps+' فریم بر ثانیه'});
      return next;
    }

    setActive(value) {
      const next = !!value;
      if (this.stopped || this.active === next) return;
      this.active = next;
      if (!next) {
        this.clearPointerGestures();
        this.cancelCameraFlight(); // keep visible camera pose when the 3D view is hidden
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = 0;
        this.frameCount = 0;
      } else {
        this.lastTime = performance.now();
        this.lastRenderAt = 0;
        this.fpsTime = this.lastTime;
        this.frameCount = 0;
        this.resize();
        if (!document.hidden && !this.contextLost && !this.raf)
          this.raf = requestAnimationFrame(this.boundAnimate);
      }
    }

    getMobileSheetCameraOffset(height) {
      if (!global.matchMedia || !global.matchMedia('(max-width: 700px)').matches) return 0;
      if (!document.body.classList.contains('mobile-sheet-ready')) return 0;
      const panel = document.getElementById('mobileMainSheet');
      if (!panel || panel.dataset.mobileSnap === 'full') return 0;
      const hostRect = this.host.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      // Only compensate for a bottom-attached sheet that actually overlaps
      // the globe canvas. A side panel or unrelated floating card is ignored.
      if (Math.abs(hostRect.bottom - panelRect.bottom) > 4) return 0;
      const overlapTop = Math.max(hostRect.top, panelRect.top);
      const overlapBottom = Math.min(hostRect.bottom, panelRect.bottom);
      const covered = Math.max(0, overlapBottom - overlapTop);
      if (covered < 1) return 0;
      // A vertical camera view offset moves the globe upward by half the
      // covered area, placing its projected center at the center of the
      // remaining map viewport. Cap it for unusually tall sheets.
      return clamp(covered * 0.5, 0, height * 0.28);
    }

    resize() {
      if (!this.renderer || !this.host) return;
      const w = this.host.clientWidth, h = this.host.clientHeight;
      if (w < 1 || h < 1) return;
      this.camera.aspect = w / h;
      const offsetY = this.getMobileSheetCameraOffset(h);
      const previous = this.viewportLayout || {width:0,height:0,offsetY:NaN};
      const changed = previous.width !== w || previous.height !== h || Math.abs(previous.offsetY - offsetY) > 0.5;
      if (changed) {
        if (offsetY > 0.5) this.camera.setViewOffset(w, h, 0, offsetY, w, h);
        else if (this.camera.view && this.camera.view.enabled) this.camera.clearViewOffset();
        else this.camera.updateProjectionMatrix();
        this.viewportLayout = {width:w,height:h,offsetY};
      }
      this.renderer.setSize(w, h, false);
    }

    updateImageryLevel(now) {
      if (now - this.lastLevelCheck < 260) return;
      this.lastLevelCheck = now;
      if (!this.textureQuality || this.surfaceMode === 'single-fallback') return;
      const desired = getTileLevelForDistance(this.target.distance, this.activeLevel).id;
      if (desired === this.activeLevel && this.surfaceMode === 'multilevel') return;
      const epoch = this.textureToken;
      const profile = QUALITY[this.textureQuality];
      const cache = this.levelCache[desired];
      if (cache && cache.quality === this.textureQuality) {
        this.applyLevel(desired);
        return;
      }
      this.ensureLevelLoaded(desired, profile, this.textureQuality)
        .then(() => {
          // A late download cannot replace a more recent camera/quality choice.
          if (this.stopped || epoch !== this.textureToken ||
              getTileLevelForDistance(this.target.distance, this.activeLevel).id !== desired) return;
          this.applyLevel(desired);
          this.onStatus({type:'ready', quality:this.textureQuality, loaded:0, errors:[], surfaceMode:this.surfaceMode, imageryLevel:this.activeLevel, pyramid:TILE_LEVELS.map(l => `${l.id}:${l.rows}×${l.cols}`).join(' · ')});
        })
        .catch(err => {
          if (!this.stopped && epoch === this.textureToken)
            this.onStatus({type:'warning',message:'سطح تصویری جدید بارگذاری نشد؛ نمای قبلی حفظ شد. ' + err.message});
        });
    }

    animate(now) {
      if (this.stopped || !this.active || this.contextLost || document.hidden) { this.raf = 0; return; }
      this.raf = requestAnimationFrame(this.boundAnimate);
      // Limit actual GPU draws on constrained devices without altering globe state.
      // RAF still schedules normally, but motion time advances only when a frame is rendered.
      if (this.lastRenderAt && now - this.lastRenderAt < this.frameInterval - 1.5) return;
      this.lastRenderAt = now;
      const dt = clamp((now - this.lastTime) / 1000, 0, 0.06);
      this.lastTime = now;
      const easing = 1 - Math.exp(-dt * 5.6);
      if (this.cameraFlight) {
        const sample = sampleCameraFlight(this.cameraFlight, now);
        this.globeGroup.rotation.x = sample.rx;
        this.globeGroup.rotation.y = sample.ry;
        this.camera.position.z = sample.distance;
        this.target.rx = sample.rx;
        this.target.ry = sample.ry;
        this.target.distance = sample.distance;
        if (sample.done) this.cameraFlight = null;
      } else {
        if (this.options.rotation && !this.controls.size) this.target.ry += dt * 0.024;
        if (!this.controls.size && !this.options.rotation) {
          this.target.ry += this.dragVelocity.x * dt;
          this.target.rx = clamp(this.target.rx + this.dragVelocity.y * dt, -1.535, 1.535);
          const decay = Math.exp(-dt * 3.7);
          this.dragVelocity.x *= decay;
          this.dragVelocity.y *= decay;
          if (Math.abs(this.dragVelocity.x) < 0.002) this.dragVelocity.x = 0;
          if (Math.abs(this.dragVelocity.y) < 0.002) this.dragVelocity.y = 0;
        }
        this.globeGroup.rotation.x += (this.target.rx - this.globeGroup.rotation.x) * easing;
        this.globeGroup.rotation.y = lerpAngle(this.globeGroup.rotation.y, this.target.ry, easing);
        this.camera.position.z += (this.target.distance - this.camera.position.z) * easing;
      }
      if (this.options.clouds && !this.visualMotionReduced) this.clouds.rotation.y += dt * 0.00145;
      this.updateVisualLayers(dt, false);
      if (now - this.lastSunUpdate > 15000) {
        const date = new Date();
        this.uniforms.uSun.value.copy(getSunDirection(date));
        this.lastSunUpdate = now;
        this.sunCoordinates = getSunCoordinates(date);
      }
      this.updateImageryLevel(now);
      // Keep DOM cluster badges aligned to the rendered globe on every frame,
      // rather than making them jump every 180ms while the camera is moving.
      if(this.frameObservers.size){
        this.scene.updateMatrixWorld(true);
        this.camera.updateMatrixWorld(true);
        for(const callback of this.frameObservers){
          try{callback(now);}catch(error){console.error('[RASPEHR frame observer]',error);this.frameObservers.delete(callback);}
        }
      }
      const drawStart=performance.now();
      this.renderer.render(this.scene, this.camera);
      const drawMs=Math.max(0,performance.now()-drawStart);
      this.renderTiming.total+=drawMs;
      this.renderTiming.max=Math.max(this.renderTiming.max,drawMs);
      this.renderTiming.count++;
      this.frameCount++;
      if (now - this.fpsTime > 1100) {
        const fps = Math.round(this.frameCount * 1000 / (now - this.fpsTime));
        this.frameCount = 0;
        this.fpsTime = now;
        const altitude = Math.max(0, ((this.camera.position.z - RADIUS) / RADIUS) * 6371);
        const sun = this.sunCoordinates || getSunCoordinates(new Date());
        const textureCount = Object.values(this.levelCache).reduce((sum, cache) => sum + (cache && cache.entries ? cache.entries.length * 2 : 0), 0)
          + (this.ownedAux ? Object.keys(this.ownedAux).length : 0)
          + (this.ownedFallback ? 2 : 0);
        const timing=this.renderTiming;
        const drawMsAvg=timing.count?Math.round(timing.total/timing.count*10)/10:0;
        const drawMsMax=Math.round(timing.max*10)/10;
        this.renderTiming={total:0,max:0,count:0};
        this.onMetrics({fps, altitudeKm:Math.round(altitude), distance:this.camera.position.z,
          quality:this.options.quality, textureQuality:this.textureQuality, surfaceMode:this.surfaceMode,
          imageryLevel:this.activeLevel, sunLat:sun.lat, sunLon:sun.lon, textureCount,
          drawMsAvg,drawMsMax});
      }
    }

    dispose() {
      this.stopped = true;
      if(this.frameObservers)this.frameObservers.clear();
      this.active = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      if (this.observer) this.observer.disconnect();
      if (this.sheetObserver) this.sheetObserver.disconnect();
      if (this.layoutObserver) this.layoutObserver.disconnect();
      this.textureToken++;
      if (this.terrainController) this.terrainController.abort();
      if (this.terrainData) this.terrainData.clear();
      for (const [node, event, fn, opt] of this.bindings) node.removeEventListener(event, fn, opt);
      this.earth.geometry.dispose();
      Object.values(this.levelGroups).forEach(group => group.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); }));
      this.clouds.geometry.dispose();
      this.atmosphere.geometry.dispose();
      this.starField.geometry.dispose();
      this.gridGroup.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); });
      this.gridGroup.userData.materials.forEach(material => material.dispose());
      this.earthMaterial.dispose();
      Object.values(this.levelMaterials).forEach(materials => materials.forEach(material => material.dispose()));
      this.cloudMaterial.dispose();
      this.atmosphereMaterial.dispose();
      this.starField.material.dispose();
      if (this.ownedAux) Object.values(this.ownedAux).forEach(texture => this.disposeTexture(texture));
      Object.values(this.levelCache).forEach(cache => cache && cache.entries && this.disposeLevelEntries(cache.entries));
      this.flushRetiredTextures();
      if (this.ownedFallback) { this.disposeTexture(this.ownedFallback.day); this.disposeTexture(this.ownedFallback.night); }
      this.fallbackTextures.forEach(texture => texture.dispose());
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }

  global.RaspehrGlobe = {GlobeEngine, PRESETS, QUALITY, TILE_LEVELS, getSunDirection, getSunCoordinates, geoToVector3, getTileLevelForDistance, geoFocusTarget, sampleCameraFlight, getVisualEnvelope};
})(window);
