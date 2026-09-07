/* ORBITA — 3D orbital view
   Earth globe (three.js, local) + SGP4 propagation (satellite.js, local)
   GPU point cloud for all objects, click-picking, orbit-class colouring. */
(function () {
  "use strict";

  var OV = {};           // public namespace
  window.ORBITA3D = OV;

  var R_EARTH = 6371;    // km
  var SCALE = 1 / R_EARTH;
  var UPDATE_CHUNK = 900;    // satellites propagated per frame
  var DEG = Math.PI / 180;

  var CLASS_COLORS = {
    leo: 0x22d3ee,   // مدار پایین
    sso: 0x34d399,   // خورشیدآهنگ / قطبی
    meo: 0xa78bfa,   // میانی
    geo: 0xf5a524,   // زمین‌ثابت
    heo: 0xfb7185    // بیضوی کشیده
  };
  var CLASS_FA = {
    leo: "مدار پایین زمین", sso: "خورشیدآهنگ / قطبی", meo: "مدار میانی",
    geo: "مدار زمین‌ثابت", heo: "مدار بیضوی کشیده"
  };
  var CLASS_EN = {
    leo: "Low Earth orbit", sso: "Sun-synchronous / polar", meo: "Medium Earth orbit",
    geo: "Geostationary", heo: "Highly elliptical"
  };

  /* mission types: [نام فارسی, English, colour] */
  var USE = {
    comm:     ["مخابرات", "Communications", "#38bdf8"],
    eo:       ["سنجش نوری زمین", "Optical Earth imaging", "#4ade80"],
    sar:      ["رادار روزنهٔ ترکیبی", "Synthetic-aperture radar", "#f472b6"],
    weather:  ["هواشناسی", "Meteorology", "#facc15"],
    nav:      ["ناوبری ماهواره‌ای", "Satellite navigation", "#a78bfa"],
    earthsci: ["علوم زمین و اقلیم", "Earth & climate science", "#2dd4bf"],
    science:  ["اخترفیزیک و علوم پایه", "Astrophysics & science", "#c084fc"],
    station:  ["ایستگاه و فضاپیمای سرنشین‌دار", "Station & crewed spacecraft", "#fb923c"],
    tech:     ["نمایش فناوری", "Technology demonstration", "#94a3b8"],
    defense:  ["دفاعی و هشدار زودهنگام", "Defence & early warning", "#f87171"],
    iot:      ["اینترنت اشیا و پیام‌رسانی", "IoT & messaging", "#22d3ee"],
    mega:     ["منظومهٔ انبوه", "Mega-constellation", "#60a5fa"],
    amateur:  ["رادیو آماتوری", "Amateur radio", "#84cc16"]
  };

  /* operators: [نام فارسی, English, نشان کوتاه, رنگ] */
  var OPS = {
    nasa:       ["ناسا", "NASA", "NASA", "#0b3d91"],
    esa:        ["سازمان فضایی اروپا", "ESA", "ESA", "#003247"],
    cnsa:       ["سازمان ملی فضایی چین", "CNSA", "CNSA", "#b91c1c"],
    roscosmos:  ["روس‌کاسموس", "Roscosmos", "РК", "#1e40af"],
    isro:       ["سازمان تحقیقات فضایی هند", "ISRO", "ISRO", "#ea580c"],
    jaxa:       ["جاکسا", "JAXA", "JAXA", "#0369a1"],
    noaa:       ["سازمان ملی اقیانوسی و جوی", "NOAA", "NOAA", "#075985"],
    iran:       ["سازمان فضایی ایران", "Iranian Space Agency", "ISA", "#15803d"],
    eumetsat:   ["یومت‌ست", "EUMETSAT", "EUM", "#1d4ed8"],
    ussf:       ["نیروی فضایی آمریکا", "US Space Force", "USSF", "#111827"],
    kari:       ["مؤسسهٔ هوافضای کره", "KARI", "KARI", "#1e3a8a"],
    ses:        ["اس‌ای‌اس", "SES", "SES", "#0e7490"],
    airbus:     ["ایرباس", "Airbus", "AIR", "#00205b"],
    cma:        ["ادارهٔ هواشناسی چین", "China Meteorological Adm.", "CMA", "#b45309"],
    spacex:     ["اسپیس‌ایکس", "SpaceX", "SPX", "#111827"],
    maxar:      ["مکسار", "Maxar", "MXR", "#166534"],
    inpe:       ["مؤسسهٔ ملی پژوهش‌های فضایی برزیل", "INPE", "INPE", "#047857"],
    planet:     ["پلنت لبز", "Planet Labs", "PL", "#0891b2"],
    dlr:        ["مرکز هوافضای آلمان", "DLR", "DLR", "#1e3a8a"],
    csa:        ["سازمان فضایی کانادا", "Canadian Space Agency", "CSA", "#b91c1c"],
    hisdesat:   ["هیسدست", "Hisdesat", "HSD", "#7c2d12"],
    arabsat:    ["عرب‌ست", "Arabsat", "ARB", "#065f46"],
    turksat:    ["ترک‌ست", "Türksat", "TS", "#b91c1c"],
    skyperfect: ["اسکای پرفکت جی‌ست", "SKY Perfect JSAT", "JSAT", "#1d4ed8"],
    hispasat:   ["هیسپاست", "Hispasat", "HIS", "#c2410c"],
    cnes:       ["مرکز ملی مطالعات فضایی فرانسه", "CNES", "CNES", "#1d4ed8"],
    intelsat:   ["اینتل‌ست", "Intelsat", "INTL", "#0f766e"],
    eutelsat:   ["یوتل‌ست", "Eutelsat", "EUT", "#1e40af"],
    inmarsat:   ["اینمارست", "Inmarsat", "IMS", "#0c4a6e"],
    iridium:    ["ایریدیوم", "Iridium", "IRD", "#334155"],
    globalstar: ["گلوبال‌استار", "Globalstar", "GS", "#065f46"],
    orbcomm:    ["اورب‌کام", "Orbcomm", "ORB", "#4338ca"],
    oneweb:     ["وان‌وب", "OneWeb", "OW", "#1e3a8a"],
    viasat:     ["وایاست", "Viasat", "VIA", "#0e7490"],
    echostar:   ["اکو‌استار", "EchoStar", "ECH", "#3730a3"],
    rscc:       ["شرکت ارتباطات ماهواره‌ای روسیه", "RSCC", "RSCC", "#1e40af"],
    gazprom:    ["گازپروم فضا", "Gazprom Space Systems", "GZP", "#1e3a8a"],
    cgwic:      ["شرکت پرتاب و فناوری ماهوارهٔ چین", "CGWIC", "CGW", "#b91c1c"],
    nilesat:    ["نایل‌ست", "Nilesat", "NIL", "#047857"],
    ktsat:      ["کی‌تی‌ست", "KT SAT", "KT", "#be123c"],
    optus:      ["اپتوس", "Optus", "OPT", "#0891b2"],
    measat:     ["می‌ست", "MEASAT", "MEA", "#1d4ed8"],
    thaicom:    ["تای‌کام", "Thaicom", "THA", "#0369a1"],
    embratel:   ["امبراتل استار وان", "Embratel Star One", "S1", "#065f46"],
    azercosmos: ["آذرکاسموس", "Azercosmos", "AZ", "#0e7490"],
    kazcosmos:  ["قزاق‌کاسموس", "KazCosmos", "KZ", "#0369a1"],
    angosat:    ["آنگوست", "Angosat", "ANG", "#b45309"],
    nigcomsat:  ["نایج‌کام‌ست", "NigComSat", "NIG", "#047857"],
    suparco:    ["سوپارکو", "SUPARCO", "SUP", "#166534"],
    bsccl:      ["بنگابندو", "BSCCL", "BSC", "#047857"],
    eshailsat:  ["اس‌هیل‌ست", "Es'hailSat", "ESH", "#7c2d12"],
    yahsat:     ["یاه‌ست", "Yahsat", "YAH", "#0c4a6e"],
    spire:      ["اسپایر گلوبال", "Spire Global", "SPR", "#4338ca"],
    capella:    ["کاپلا اسپیس", "Capella Space", "CAP", "#be123c"],
    umbra:      ["آمبرا", "Umbra", "UMB", "#334155"],
    iceye:      ["آیس‌آی", "ICEYE", "ICE", "#0e7490"],
    satellogic: ["ساتلاجیک", "Satellogic", "SAT", "#0891b2"],
    changuang:  ["چانگ‌گوانگ", "Chang Guang", "CGS", "#b91c1c"],
    guodian:    ["گودیان گائوکه", "Guodian Gaoke", "GDK", "#7f1d1d"],
    cgsti:      ["مؤسسهٔ فناوری فضایی چین", "CGSTI", "CST", "#b91c1c"],
    ghgsat:     ["جی‌اچ‌جی‌ست", "GHGSat", "GHG", "#166534"],
    egsa:       ["سازمان فضایی مصر", "Egyptian Space Agency", "EGSA", "#a16207"],
    tasa:       ["سازمان فضایی تایوان", "TASA", "TASA", "#1d4ed8"],
    dsta:       ["دی‌اس‌تی‌ای سنگاپور", "DSTA", "DSTA", "#be123c"],
    conae:      ["کوناِ آرژانتین", "CONAE", "CON", "#0284c7"],
    jma:        ["سازمان هواشناسی ژاپن", "JMA", "JMA", "#0369a1"],
    amsat:      ["امست", "AMSAT", "AM", "#65a30d"]
  };
  function opInfo(code) {
    var o = OPS[code];
    if (o) return { fa: o[0], en: o[1], mark: o[2], col: o[3] };
    var c = String(code || "?");
    return { fa: c, en: c, mark: c.slice(0, 3).toUpperCase(), col: "#475569" };
  }

  var scene, camera, renderer, earth, clouds, atmo, starfield, raf = 0;
  var points, pointGeo, pointMat, selMarker, orbitLine, footprint;
  var SATS = [], META = null, FEAT = {}, ACTIVE = [];   // ACTIVE = indices currently rendered
  var cursor = 0, selected = -1, inited = false, running = false;
  var camState = { lon: 40, lat: 25, dist: 3.2, target: null };

  /* ---------------- helpers ---------------- */
  function el(id) { return document.getElementById(id); }
  function lang() { return document.documentElement.lang === "en" ? "en" : "fa"; }
  function fa(n) { return String(n); }

  function gmst(date) { return satellite.gstime(date); }

  function sunDirectionECI(date) {
    // low-precision solar position (good to ~0.01°)
    var jd = date.getTime() / 86400000 + 2440587.5;
    var n = jd - 2451545.0;
    var L = (280.460 + 0.9856474 * n) % 360;
    var g = ((357.528 + 0.9856003 * n) % 360) * DEG;
    var lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DEG;
    var eps = (23.439 - 0.0000004 * n) * DEG;
    return new THREE.Vector3(Math.cos(lam), Math.cos(eps) * Math.sin(lam), Math.sin(eps) * Math.sin(lam));
  }


  var SITE_FA = {
    AFETR: ["پایگاه کیپ کاناورال / مرکز فضایی کندی، آمریکا", "Cape Canaveral / Kennedy Space Center, USA"],
    AFWTR: ["پایگاه ونـدنبرگ، کالیفرنیا، آمریکا", "Vandenberg SFB, California, USA"],
    JSC: ["پایگاه جیوچوان، چین", "Jiuquan, China"],
    TAISC: ["پایگاه تای‌یوان، چین", "Taiyuan, China"],
    XICLF: ["پایگاه شی‌چانگ، چین", "Xichang, China"],
    WSC: ["پایگاه ون‌چانگ، چین", "Wenchang, China"],
    FRGUI: ["مرکز فضایی گویان، کورو، فرانسه", "Guiana Space Centre, Kourou"],
    TYMSC: ["پایگاه بایکونور، قزاقستان", "Baikonur Cosmodrome, Kazakhstan"],
    PLMSC: ["پایگاه پلستسک، روسیه", "Plesetsk Cosmodrome, Russia"],
    VOSTO: ["پایگاه واستوچنی، روسیه", "Vostochny Cosmodrome, Russia"],
    SRILR: ["مرکز فضایی ساتیش داوان، هند", "Satish Dhawan Space Centre, India"],
    RLLB: ["مجتمع پرتاب ماهیا، نیوزیلند", "Rocket Lab, Mahia, New Zealand"],
    YSLA: ["سکوی دریایی زرد، چین", "Yellow Sea launch platform, China"],
    SCSLA: ["سکوی دریایی دریای چین جنوبی", "South China Sea platform"],
    JJSLA: ["سکوی دریایی جیانگ‌سو، چین", "Jiangsu sea platform, China"],
    DLS: ["پایگاه دومباروفسکی، روسیه", "Dombarovsky, Russia"],
    TANSC: ["مرکز فضایی تانگاشیما، ژاپن", "Tanegashima Space Center, Japan"],
    KSCUT: ["پایگاه اوچینورا، ژاپن", "Uchinoura, Japan"],
    SEAL: ["سکوی شناور دریایی اودیسه", "Sea Launch Odyssey platform"],
    NSC: ["پایگاه نارو، کرهٔ جنوبی", "Naro Space Center, South Korea"],
    ERAS: ["پایگاه سمنان، ایران", "Semnan launch site, Iran"],
    SEMLS: ["پایگاه سمنان، ایران", "Semnan launch site, Iran"],
    WLPIS: ["جزیرهٔ والوپس، آمریکا", "Wallops Island, USA"],
    WRAS: ["مجتمع دریایی والوپس", "Wallops range"],
    KODAK: ["مجتمع کودیاک، آلاسکا", "Kodiak, Alaska"],
    SMTS: ["پایگاه کاپوستین یار، روسیه", "Kapustin Yar, Russia"],
    YUN: ["پایگاه سوهه، کرهٔ شمالی", "Sohae, North Korea"],
    KYMSC: ["پایگاه کاپوستین یار، روسیه", "Kapustin Yar, Russia"],
    ISS: ["رهاسازی از ایستگاه فضایی بین‌المللی", "Deployed from the ISS"]
  };
  var OWN_EXTRA = { ISS: ["برنامهٔ مشترک ایستگاه فضایی", "ISS partner programme"], TBD: ["نامشخص", "Undetermined"] };
  var FA_DIG = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  function num(v) {
    if (v === null || v === undefined || v === "") return "";
    var s = String(v);
    if (lang() !== "fa") return s;
    return s.replace(/[0-9]/g, function (d) { return FA_DIG[+d]; });
  }

  /* ---------------- scene ---------------- */
  function buildScene(container) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    var maxAniso = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
    var tl = new THREE.TextureLoader();
    function tex(url, srgb) {
      var t = tl.load(url);
      t.anisotropy = Math.min(16, maxAniso);
      if (srgb) { if ("colorSpace" in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else t.encoding = THREE.sRGBEncoding; }
      return t;
    }
    if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    else renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.42;

    var day = tex("assets/tex/earth_day.jpg?v=2", true);
    var night = tex("assets/tex/earth_night.jpg?v=3", true);
    var cloudTex = tex("assets/tex/earth_clouds.jpg?v=2", false);
    var specTex = tex("assets/tex/earth_spec.jpg?v=2", false);
    var normTex = tex("assets/tex/earth_normal.jpg?v=2", false);
    var starTex = tex("assets/tex/stars.jpg", true);

    // stars (inside of a big sphere)
    starfield = new THREE.Mesh(
      new THREE.SphereGeometry(400, 32, 16),
      new THREE.MeshBasicMaterial({ map: starTex, side: THREE.BackSide, depthWrite: false, color: 0x8a93ad })
    );
    scene.add(starfield);

    /* ---- Earth surface: day/night, normal mapping, ocean specular, cloud shadow ---- */
    earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 256, 160),
      new THREE.ShaderMaterial({
        uniforms: {
          dayMap: { value: day }, nightMap: { value: night }, specMap: { value: specTex },
          normMap: { value: normTex }, cloudMap: { value: cloudTex },
          sunDir: { value: new THREE.Vector3(1, 0, 0) }, camPos: { value: new THREE.Vector3() }
        },
        vertexShader: [
          "varying vec2 vUv; varying vec3 vN; varying vec3 vW;",
          "void main(){",
          "  vUv = vec2(1.0 - uv.x, uv.y);",
          "  vN = normalize(mat3(modelMatrix) * normal);",
          "  vec4 wp = modelMatrix * vec4(position,1.0);",
          "  vW = wp.xyz;",
          "  gl_Position = projectionMatrix * viewMatrix * wp;",
          "}"
        ].join("\n"),
        fragmentShader: [
          "uniform sampler2D dayMap, nightMap, specMap, normMap, cloudMap;",
          "uniform vec3 sunDir, camPos;",
          "varying vec2 vUv; varying vec3 vN; varying vec3 vW;",
          "void main(){",
          "  vec3 N = normalize(vN);",
          "  vec3 L = normalize(sunDir);",
          "  vec3 V = normalize(camPos - vW);",
          // tangent basis on a sphere (u = east, v = north)
          "  vec3 up = vec3(0.0,1.0,0.0);",
          "  vec3 T = normalize(cross(up, N) + vec3(1e-6));",
          "  vec3 B = cross(N, T);",
          "  vec3 nm = texture2D(normMap, vUv).xyz * 2.0 - 1.0;",
          "  vec3 Nb = normalize(N + (T * nm.x + B * nm.y) * 0.55);",
          "  float ndl = dot(Nb, L);",
          "  float ndlGeo = dot(N, L);",
          // cloud shadow: shift the cloud lookup toward the sun
          "  vec3 Lt = normalize(L - N * dot(L, N));",
          "  vec2 off = vec2(dot(Lt, T), dot(Lt, B)) * 0.0032;",
          "  float shadow = 1.0 - texture2D(cloudMap, vUv - off).r * 0.42 * smoothstep(0.0, 0.35, ndlGeo);",
          "  vec3 dayC = texture2D(dayMap, vUv).rgb;",
          "  float wet = texture2D(specMap, vUv).r;",
          // deepen and cool the ocean a little
          "  dayC = mix(dayC, dayC * vec3(0.72,0.92,1.22), wet * 0.45);",
          "  float hl = clamp(ndl * 0.5 + 0.5, 0.0, 1.0);",
          "  float diff = pow(hl, 1.7) * 1.55;",
          "  float wrap = clamp((ndlGeo + 0.12) / 1.12, 0.0, 1.0);",
          "  vec3 lit = dayC * (diff + wrap * wrap * 0.10) * shadow;",
          // sun glint on water
          "  vec3 H = normalize(L + V);",
          "  float spec = pow(clamp(dot(N, H), 0.0, 1.0), 150.0) * wet * clamp(ndlGeo*3.0,0.0,1.0);",
          "  lit += vec3(1.0, 0.95, 0.82) * spec * 0.55;",
          // night side city lights
          "  float nightMask = smoothstep(0.12, -0.18, ndlGeo);",
          "  vec3 nightC = texture2D(nightMap, vUv).rgb;",
          "  nightC = nightC * vec3(1.05, 0.92, 0.70) * 1.25;",
          "  vec3 col = lit + nightC * nightMask;",
          // warm sunrise/sunset band + blue atmospheric wrap
          "  float term = exp(-pow(ndlGeo / 0.05, 2.0));",
          "  col += vec3(1.0, 0.46, 0.16) * term * 0.05;",
          "  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);",
          "  col += vec3(0.26, 0.50, 1.0) * fres * clamp(ndlGeo + 0.10, 0.0, 1.0) * 0.34;",
          "  gl_FragColor = vec4(col, 1.0);",
          "}"
        ].join("\n")
      })
    );
    scene.add(earth);

    /* ---- Clouds ---- */
    clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.0045, 160, 100),
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { cloudMap: { value: cloudTex }, sunDir: { value: new THREE.Vector3(1, 0, 0) } },
        vertexShader: [
          "varying vec2 vUv; varying vec3 vN;",
          "void main(){ vUv=vec2(1.0-uv.x, uv.y); vN=normalize(mat3(modelMatrix)*normal);",
          " gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }"
        ].join("\n"),
        fragmentShader: [
          "uniform sampler2D cloudMap; uniform vec3 sunDir;",
          "varying vec2 vUv; varying vec3 vN;",
          "void main(){",
          "  float c = texture2D(cloudMap, vUv).r;",
          "  c = smoothstep(0.06, 0.92, c);",
          "  float ndl = dot(normalize(vN), normalize(sunDir));",
          "  float light = clamp(ndl, 0.0, 1.0) * 0.95 + 0.05;",
          "  float term = exp(-pow(ndl / 0.18, 2.0));",
          "  vec3 col = mix(vec3(1.0), vec3(1.0, 0.72, 0.5), term * 0.6) * light;",
          "  float a = c * (0.14 + 0.78 * clamp(ndl + 0.12, 0.0, 1.0));",
          "  gl_FragColor = vec4(col, a);",
          "}"
        ].join("\n")
      })
    );
    scene.add(clouds);

    /* ---- Atmosphere: rim scattering seen from outside ---- */
    atmo = new THREE.Mesh(
      new THREE.SphereGeometry(1.032, 128, 80),
      new THREE.ShaderMaterial({
        side: THREE.FrontSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { sunDir: { value: new THREE.Vector3(1, 0, 0) }, camPos: { value: new THREE.Vector3() } },
        vertexShader: [
          "varying vec3 vN; varying vec3 vW;",
          "void main(){ vN=normalize(mat3(modelMatrix)*normal);",
          " vec4 wp=modelMatrix*vec4(position,1.0); vW=wp.xyz;",
          " gl_Position=projectionMatrix*viewMatrix*wp; }"
        ].join("\n"),
        fragmentShader: [
          "uniform vec3 sunDir, camPos; varying vec3 vN; varying vec3 vW;",
          "void main(){",
          "  vec3 N = normalize(vN); vec3 V = normalize(camPos - vW); vec3 L = normalize(sunDir);",
          "  float rim = pow(clamp(1.0 - dot(N, V), 0.0, 1.0), 2.6);",
          "  float sun = clamp(dot(N, L), 0.0, 1.0);",
          "  float warm = pow(clamp(1.0 - abs(dot(N, L)) * 4.0, 0.0, 1.0), 1.4);",
          "  vec3 col = mix(vec3(0.22,0.48,1.0), vec3(1.0,0.52,0.22), warm * 0.75);",
          "  float amt = rim * pow(sun, 0.7) * 1.15 + pow(rim, 6.0) * warm * 0.9;",
          "  gl_FragColor = vec4(col * amt * 0.95, 1.0);",
          "}"
        ].join("\n")
      })
    );
    scene.add(atmo);

    // selection marker
    selMarker = new THREE.Mesh(
      new THREE.RingGeometry(0.028, 0.038, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, depthTest: false })
    );
    selMarker.visible = false;
    scene.add(selMarker);

    orbitLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })
    );
    orbitLine.visible = false;
    scene.add(orbitLine);

    window.addEventListener("resize", onResize);
    bindControls(renderer.domElement);
  }

  function onResize() {
    var c = el("globe");
    if (!c || !renderer) return;
    camera.aspect = c.clientWidth / c.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(c.clientWidth, c.clientHeight);
  }

  /* ---------------- camera controls ---------------- */
  function bindControls(dom) {
    var down = false, moved = false, px = 0, py = 0;
    dom.addEventListener("pointerdown", function (e) { down = true; moved = false; px = e.clientX; py = e.clientY; dom.setPointerCapture(e.pointerId); });
    dom.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - px, dy = e.clientY - py;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      px = e.clientX; py = e.clientY;
      camState.lon -= dx * 0.25;
      camState.lat = Math.max(-88, Math.min(88, camState.lat + dy * 0.25));
    });
    dom.addEventListener("pointerup", function (e) {
      down = false;
      if (!moved) pick(e);
    });
    dom.addEventListener("wheel", function (e) {
      e.preventDefault();
      camState.dist = Math.max(1.06, Math.min(60, camState.dist * (1 + (e.deltaY > 0 ? 0.12 : -0.12))));
    }, { passive: false });
  }

  function updateCamera() {
    var la = camState.lat * DEG, lo = camState.lon * DEG, d = camState.dist;
    camera.position.set(
      d * Math.cos(la) * Math.cos(lo),
      d * Math.sin(la),
      d * Math.cos(la) * Math.sin(lo)
    );
    camera.lookAt(0, 0, 0);
  }

  /* ---------------- satellite data ---------------- */
  function initSats(raw, featured) {
    META = raw;
    FEAT = featured || {};
    var f = raw.fields, idx = {};
    f.forEach(function (k, i) { idx[k] = i; });
    SATS = [];
    raw.sats.forEach(function (s) {
      var rec = null;
      try { rec = satellite.twoline2satrec(s[idx.t1], s[idx.t2]); } catch (e) { rec = null; }
      if (!rec || rec.error) return;
      SATS.push({
        id: s[idx.id], name: s[idx.name], grp: s[idx.grp], own: s[idx.own],
        launch: s[idx.launch], site: s[idx.site], period: s[idx.period], inc: s[idx.inc],
        apo: s[idx.apo], per: s[idx.per], rcs: s[idx.rcs], cls: s[idx.cls],
        rec: rec, p: new Float64Array(3), v: new Float64Array(3), t: 0, ok: false
      });
    });
  }

  function propagate(sat, date) {
    var pv;
    try { pv = satellite.propagate(sat.rec, date); } catch (e) { sat.ok = false; return; }
    if (!pv || !pv.position) { sat.ok = false; return; }
    sat.p[0] = pv.position.x; sat.p[1] = pv.position.y; sat.p[2] = pv.position.z;
    sat.v[0] = pv.velocity.x; sat.v[1] = pv.velocity.y; sat.v[2] = pv.velocity.z;
    sat.t = date.getTime();
    sat.ok = true;
  }

  /* ---------------- point cloud ---------------- */
  var _dotTex = null;
  function dotTexture() {
    if (_dotTex) return _dotTex;
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var x = c.getContext("2d");
    var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, "rgba(255,255,255,1)");
    g.addColorStop(0.32, "rgba(255,255,255,0.95)");
    g.addColorStop(0.55, "rgba(255,255,255,0.30)");
    g.addColorStop(1.0, "rgba(255,255,255,0)");
    x.fillStyle = g; x.beginPath(); x.arc(32, 32, 32, 0, 6.2832); x.fill();
    _dotTex = new THREE.CanvasTexture(c);
    return _dotTex;
  }

  function rebuildPoints() {
    if (points) { scene.remove(points); pointGeo.dispose(); }
    var n = ACTIVE.length;
    pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(Math.max(n, 1) * 3), 3));
    var col = new Float32Array(Math.max(n, 1) * 3), c = new THREE.Color();
    for (var i = 0; i < n; i++) {
      c.setHex(CLASS_COLORS[SATS[ACTIVE[i]].cls] || 0xffffff);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    pointGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    pointMat = new THREE.PointsMaterial({
      size: 7.0, sizeAttenuation: false, vertexColors: true, transparent: true,
      opacity: 0.98, map: dotTexture(), alphaTest: 0.02, depthWrite: false
    });
    points = new THREE.Points(pointGeo, pointMat);
    points.frustumCulled = false;
    scene.add(points);
    if (el("satCount")) el("satCount").textContent = n.toLocaleString(lang() === "fa" ? "fa-IR" : "en-US");
  }

  /* density levels: 1 = featured only | 2 = wide (all but mega-constellations) | 3 = full catalogue */
  function passDensity(s, lvl) {
    if (lvl >= 3) return true;
    if (lvl === 2) return s.grp !== "starlink" && s.grp !== "oneweb";
    return !!FEAT[s.id];
  }

  function applyFilters() {
    var q = (el("satSearch") ? el("satSearch").value : "").trim().toLowerCase();
    var cls = OV.filters.cls, lvl = OV.filters.density;
    ACTIVE = [];
    for (var i = 0; i < SATS.length; i++) {
      var s = SATS[i];
      if (!cls[s.cls]) continue;
      if (!passDensity(s, lvl)) continue;
      if (q && s.name.toLowerCase().indexOf(q) < 0 && String(s.id).indexOf(q) < 0) continue;
      ACTIVE.push(i);
    }
    rebuildPoints();
    cursor = 0;
  }
  OV.filters = { cls: { leo: 1, sso: 1, meo: 1, geo: 1, heo: 1 }, density: 1 };
  OV.applyFilters = applyFilters;
  OV.setDensity = function (lvl) {
    OV.filters.density = Math.max(1, Math.min(3, lvl | 0));
    applyFilters();
    return OV.filters.density;
  };
  /* how many objects each density level would show (class filter + search ignored) */
  OV.densityCounts = function () {
    var c = { 1: 0, 2: 0, 3: SATS.length };
    for (var i = 0; i < SATS.length; i++) {
      var s = SATS[i];
      if (FEAT[s.id]) c[1]++;
      if (s.grp !== "starlink" && s.grp !== "oneweb") c[2]++;
    }
    return c;
  };

  /* ---------------- animation ---------------- */
  function tick() {
    raf = requestAnimationFrame(tick);
    if (!running) return;
    if (!pointGeo) { updateCamera(); renderer.render(scene, camera); return; }
    var now = new Date();
    var nowMs = now.getTime();

    // rotate earth to current sidereal angle (scene frame = ECI)
    var g = gmst(now);
    earth.rotation.y = -g;
    clouds.rotation.y = -g - 0.0004 * (nowMs / 60000 % 2000);
    // everything below works in the world (inertial) frame
    var sd = sunDirectionECI(now);
    var sdScene = new THREE.Vector3(sd.x, sd.z, sd.y);
    earth.material.uniforms.sunDir.value.copy(sdScene);
    earth.material.uniforms.camPos.value.copy(camera.position);
    clouds.material.uniforms.sunDir.value.copy(sdScene);
    atmo.material.uniforms.sunDir.value.copy(sdScene);
    atmo.material.uniforms.camPos.value.copy(camera.position);

    // propagate a chunk
    var n = ACTIVE.length, done = 0;
    while (done < UPDATE_CHUNK && n > 0) {
      var s = SATS[ACTIVE[cursor % n]];
      propagate(s, now);
      cursor++; done++;
      if (cursor >= n) { cursor = 0; break; }
    }

    // write interpolated positions
    var arr = pointGeo.attributes.position.array;
    for (var i = 0; i < n; i++) {
      var sat = SATS[ACTIVE[i]];
      if (!sat.ok) { arr[i * 3] = arr[i * 3 + 1] = arr[i * 3 + 2] = 0; continue; }
      var dt = (nowMs - sat.t) / 1000;
      if (dt > 60) dt = 60;
      // ECI (x,y,z) -> three.js (x, z, y) so that +Y is the north pole
      arr[i * 3] = (sat.p[0] + sat.v[0] * dt) * SCALE;
      arr[i * 3 + 1] = (sat.p[2] + sat.v[2] * dt) * SCALE;
      arr[i * 3 + 2] = (sat.p[1] + sat.v[1] * dt) * SCALE;
    }
    pointGeo.attributes.position.needsUpdate = true;
    pointGeo.computeBoundingSphere();

    if (selected >= 0) {
      var k = ACTIVE.indexOf(selected);
      if (k >= 0) {
        selMarker.position.set(arr[k * 3], arr[k * 3 + 1], arr[k * 3 + 2]);
        selMarker.lookAt(camera.position);
        selMarker.visible = true;
        if (Date.now() % 1000 < 40) updateLiveInfo(SATS[selected], now);
      } else { selMarker.visible = false; }
    }

    updateCamera();
    renderer.render(scene, camera);
  }

  /* ---------------- picking ---------------- */
  function pick(ev) {
    if (!points || !ACTIVE.length) return;
    var rect = renderer.domElement.getBoundingClientRect();
    var mouse = new THREE.Vector2(
      ((ev.clientX - rect.left) / rect.width) * 2 - 1,
      -((ev.clientY - rect.top) / rect.height) * 2 + 1
    );
    var rc = new THREE.Raycaster();
    rc.params.Points.threshold = 0.012 * camState.dist;
    rc.setFromCamera(mouse, camera);

    var hits = rc.intersectObject(points, false);
    if (!hits.length) { clearSelection(); return; }
    // ignore points hidden behind the globe
    var earthHit = rc.intersectObject(earth, false);
    var best = null;
    for (var i = 0; i < hits.length; i++) {
      if (earthHit.length && hits[i].distance > earthHit[0].distance) continue;
      best = hits[i]; break;
    }
    if (!best) { clearSelection(); return; }
    selectIndex(ACTIVE[best.index]);
  }

  function clearSelection() {
    selected = -1;
    selMarker.visible = false;
    orbitLine.visible = false;
    var p = el("satPanel"); if (p) p.classList.remove("open");
  }

  function selectIndex(i) {
    selected = i;
    drawOrbit(SATS[i]);
    showPanel(SATS[i]);
  }
  OV.selectById = function (id) {
    for (var i = 0; i < SATS.length; i++) if (SATS[i].id === id) {
      if (ACTIVE.indexOf(i) < 0) {
        // raise density only as far as needed to reveal this object
        var s0 = SATS[i];
        var need = FEAT[s0.id] ? 1 : (s0.grp !== "starlink" && s0.grp !== "oneweb" ? 2 : 3);
        if (need > OV.filters.density) OV.filters.density = need;
        if (!OV.filters.cls[s0.cls]) OV.filters.cls[s0.cls] = 1;
        applyFilters();
        if (typeof OV.onDensityChange === "function") OV.onDensityChange(OV.filters.density);
      }
      selectIndex(i);
      var s = SATS[i];
      propagate(s, new Date());
      if (s.ok) {
        var r = Math.sqrt(s.p[0] * s.p[0] + s.p[1] * s.p[1] + s.p[2] * s.p[2]) * SCALE;
        camState.dist = Math.max(2.1, r * 2.4);
      }
      return true;
    }
    return false;
  };

  function drawOrbit(sat) {
    var per = (sat.period || 95) * 60;            // seconds
    var steps = 220, pts = [], base = Date.now();
    for (var i = 0; i <= steps; i++) {
      var d = new Date(base + (per * 1000 * i) / steps);
      var pv;
      try { pv = satellite.propagate(sat.rec, d); } catch (e) { continue; }
      if (!pv || !pv.position) continue;
      pts.push(new THREE.Vector3(pv.position.x * SCALE, pv.position.z * SCALE, pv.position.y * SCALE));
    }
    if (pts.length < 4) { orbitLine.visible = false; return; }
    orbitLine.geometry.dispose();
    orbitLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    orbitLine.material.color.setHex(CLASS_COLORS[sat.cls] || 0xffffff);
    orbitLine.visible = true;
  }

  /* ---------------- info panel ---------------- */
  function ownerName(code) {
    var o = META && META.owners && META.owners[code];
    /* some catalogue entries are placeholders (both names equal the raw code) */
    if (!o || (o[0] === code && o[1] === code)) o = OWN_EXTRA[code] || o;
    return o ? (lang() === "fa" ? o[0] : o[1]) : code;
  }
  function siteName(code) {
    var o = SITE_FA[code];
    return o ? (lang() === "fa" ? o[0] : o[1]) : (code || "");
  }
  function faDate(iso) {
    if (!iso) return "";
    if (lang() !== "fa") return iso;
    var m = String(iso).split("-");
    var MO = ["ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"];
    if (m.length < 3) return num(iso);
    return num(+m[2]) + " " + MO[+m[1] - 1] + " " + num(m[0]);
  }
  function groupName(code) {
    var g = META && META.groups && META.groups[code];
    return g ? (lang() === "fa" ? g[0] : g[1]) : code;
  }
  function cellHTML(label, value) {
    if (value === null || value === undefined || value === "" ) return "";
    return '<div class="cell"><small>' + label + "</small><b><bdi>" + value + "</bdi></b></div>";
  }

  /* photo when available, otherwise an operator crest built from the operator table */
  function mediaHTML(sat, f, L) {
    var op = opInfo(f && f.op ? f.op : null);
    if (f && f.img) {
      var cap = L === "fa" ? "تصویر: ویکی‌پدیا" : "Image: Wikipedia";
      return '<figure class="sat-photo">' +
        '<img src="assets/img/sats/' + sat.id + '.jpg" alt="" loading="lazy" ' +
        'onerror="this.closest(\'figure\').classList.add(\'failed\')" />' +
        '<figcaption>' + cap + "</figcaption></figure>";
    }
    if (!f) return "";
    var lbl = L === "fa" ? "نشان بهره‌بردار" : "Operator crest";
    return '<div class="sat-crest" style="--crest:' + op.col + '">' +
      '<div class="crest-mark"><bdi>' + op.mark + "</bdi></div>" +
      '<div class="crest-txt"><small>' + lbl + "</small><b><bdi>" +
      (L === "fa" ? op.fa : op.en) + "</bdi></b></div></div>";
  }

  function showPanel(sat) {
    var L = lang(), f = FEAT[sat.id];
    var title = f ? (L === "fa" ? f.fa : f.en) : sat.name;
    var sub = f ? (L === "fa" ? f.en : f.fa) : (L === "fa" ? "شناسهٔ رصدی " + sat.id : "NORAD " + sat.id);
    var h = "";
    h += '<div class="d-kicker" style="color:#' + (CLASS_COLORS[sat.cls] || 0xffffff).toString(16).padStart(6, "0") + '">' +
      (L === "fa" ? CLASS_FA[sat.cls] : CLASS_EN[sat.cls]) + "</div>";
    h += '<h3 class="d-title">' + title + "</h3>";
    h += '<div class="d-sub">' + sub + "</div>";
    h += mediaHTML(sat, f, L);
    if (f && USE[f.use]) {
      h += '<div class="use-tag" style="--use:' + USE[f.use][2] + '">' +
        '<i></i><span>' + (L === "fa" ? USE[f.use][0] : USE[f.use][1]) + "</span></div>";
    }
    if (f) h += '<div class="d-desc">' + (L === "fa" ? f.fa_d : f.en_d) + "</div>";
    h += '<div id="liveBox" class="live-box"></div>';
    h += '<div class="grid2">';
    h += cellHTML(L === "fa" ? "کشور ثبت‌کننده" : "Registered by", ownerName(sat.own));
    if (f) h += cellHTML(L === "fa" ? "بهره‌بردار" : "Operator",
      (L === "fa" ? opInfo(f.op).fa : opInfo(f.op).en));
    /* raw catalogue group is only shown when we have no curated mission type */
    if (!(f && USE[f.use])) {
      h += cellHTML(L === "fa" ? "دسته" : "Category",
        (sat.id === 25544 || sat.id === 48274) ? (L === "fa" ? "ایستگاه فضایی سرنشین‌دار" : "Crewed space station")
          : groupName(sat.grp));
    }
    h += cellHTML(L === "fa" ? "تاریخ پرتاب" : "Launch date", faDate(sat.launch));
    h += cellHTML(L === "fa" ? "پایگاه پرتاب" : "Launch site", siteName(sat.site));
    h += cellHTML(L === "fa" ? "دورهٔ گردش" : "Period", sat.period ? num(sat.period) + (L === "fa" ? " دقیقه" : " min") : "");
    h += cellHTML(L === "fa" ? "شیب مداری" : "Inclination", sat.inc != null ? num(sat.inc) + "°" : "");
    h += cellHTML(L === "fa" ? "اوج مدار" : "Apogee", sat.apo ? num(sat.apo) + (L === "fa" ? " کیلومتر" : " km") : "");
    h += cellHTML(L === "fa" ? "حضیض مدار" : "Perigee", sat.per ? num(sat.per) + (L === "fa" ? " کیلومتر" : " km") : "");
    h += cellHTML(L === "fa" ? "شناسهٔ رصدی" : "NORAD ID", num(sat.id));
    h += "</div>";
    el("satBody").innerHTML = h;
    el("satPanel").classList.add("open");
    updateLiveInfo(sat, new Date());
  }

  function updateLiveInfo(sat, date) {
    var box = el("liveBox");
    if (!box || !sat.ok) return;
    var L = lang();
    var gd = satellite.eciToGeodetic({ x: sat.p[0], y: sat.p[1], z: sat.p[2] }, gmst(date));
    var latD = satellite.degreesLat(gd.latitude), lonD = satellite.degreesLong(gd.longitude);
    var alt = gd.height;
    var spd = Math.sqrt(sat.v[0] * sat.v[0] + sat.v[1] * sat.v[1] + sat.v[2] * sat.v[2]);
    box.innerHTML =
      '<div class="live-row"><span>' + (L === "fa" ? "ارتفاع" : "Altitude") + "</span><b><bdi>" +
      num(alt.toFixed(0)) + (L === "fa" ? " کیلومتر" : " km") + "</bdi></b></div>" +
      '<div class="live-row"><span>' + (L === "fa" ? "سرعت" : "Speed") + "</span><b><bdi>" +
      num(spd.toFixed(2)) + (L === "fa" ? " کیلومتر بر ثانیه" : " km/s") + "</bdi></b></div>" +
      '<div class="live-row"><span>' + (L === "fa" ? "پای‌رد بر زمین" : "Sub-point") + "</span><b><bdi>" +
      num(Math.abs(latD).toFixed(2)) + "° " + (L === "fa" ? (latD >= 0 ? "شمالی" : "جنوبی") : (latD >= 0 ? "N" : "S")) + " · " +
      num(Math.abs(lonD).toFixed(2)) + "° " + (L === "fa" ? (lonD >= 0 ? "شرقی" : "غربی") : (lonD >= 0 ? "E" : "W")) + "</bdi></b></div>";
  }

  /* ---------------- public API ---------------- */
  OV.start = function () {
    running = true;
    if (inited) { onResize(); return; }
    inited = true;
    var container = el("globe");
    buildScene(container);
    tick();
  };
  OV.stop = function () { running = false; };
  OV.ready = function () { return SATS.length > 0; };
  OV.count = function () { return SATS.length; };
  OV.classColors = CLASS_COLORS;
  OV.classFa = CLASS_FA;
  OV.classEn = CLASS_EN;
  OV.load = function (raw, featured) { initSats(raw, featured); applyFilters(); };
  /* per-class counts inside the current density level (class filter + search ignored) */
  OV.stats = function () {
    var c = { leo: 0, sso: 0, meo: 0, geo: 0, heo: 0 }, lvl = OV.filters.density;
    SATS.forEach(function (s) { if (passDensity(s, lvl)) c[s.cls] = (c[s.cls] || 0) + 1; });
    return c;
  };
  OV.clearSelection = clearSelection;
  OV.camState = camState;

  /* ================= pass prediction over an observer site ================= */
  /* All maths is local: SGP4 propagation + look angles, no network involved. */

  function sunAltitudeDeg(date, latDeg, lonDeg) {
    var sd = sunDirectionECI(date);                       // unit vector, ECI (x, y=equatorial, z)
    var g = gmst(date);
    var lat = latDeg * DEG, lon = lonDeg * DEG;
    /* observer unit normal in ECI */
    var th = g + lon;
    var ox = Math.cos(lat) * Math.cos(th), oy = Math.cos(lat) * Math.sin(th), oz = Math.sin(lat);
    /* sunDirectionECI returns (x, cos(eps)sin(lam), sin(eps)sin(lam)) = (x, y, z) in ECI */
    var d = ox * sd.x + oy * sd.y + oz * sd.z;
    return Math.asin(Math.max(-1, Math.min(1, d))) / DEG;
  }

  /* is the satellite itself lit by the Sun (not inside Earth's shadow)? */
  function satIsSunlit(posEci, date) {
    var sd = sunDirectionECI(date);
    var r = Math.sqrt(posEci[0] * posEci[0] + posEci[1] * posEci[1] + posEci[2] * posEci[2]);
    if (!r) return false;
    var dot = (posEci[0] * sd.x + posEci[1] * sd.y + posEci[2] * sd.z);
    if (dot > 0) return true;                              // sun-side of Earth
    /* perpendicular distance from the Earth–Sun axis */
    var px = posEci[0] - dot * sd.x, py = posEci[1] - dot * sd.y, pz = posEci[2] - dot * sd.z;
    return Math.sqrt(px * px + py * py + pz * pz) > 6378.137;
  }

  function lookAngles(sat, date, obsGd) {
    var pv;
    try { pv = satellite.propagate(sat.rec, date); } catch (e) { return null; }
    if (!pv || !pv.position) return null;
    var g = satellite.gstime(date);
    var ecf = satellite.eciToEcf(pv.position, g);
    var la = satellite.ecfToLookAngles(obsGd, ecf);
    return {
      el: la.elevation / DEG,
      az: (la.azimuth / DEG + 360) % 360,
      range: la.rangeSat,
      eci: [pv.position.x, pv.position.y, pv.position.z]
    };
  }

  /* refine a bracketed horizon crossing to ~1 s with bisection */
  function refineCross(sat, obsGd, tA, tB, wantRise, minEl) {
    for (var k = 0; k < 14 && (tB - tA) > 1000; k++) {
      var tMid = (tA + tB) / 2, la = lookAngles(sat, new Date(tMid), obsGd);
      if (!la) break;
      var above = la.el >= minEl;
      if (above === wantRise) tB = tMid; else tA = tMid;
    }
    return wantRise ? tB : tA;
  }

  /**
   * Predict visible passes of one satellite over an observer.
   * opts: { lat, lon, alt(km), hours, minEl(deg), coarse(sec) }
   */
  function passesFor(sat, opts) {
    var obsGd = {
      longitude: opts.lon * DEG,
      latitude: opts.lat * DEG,
      height: (opts.alt || 0)
    };
    var minEl = opts.minEl != null ? opts.minEl : 10;
    var step = (opts.coarse || 30) * 1000;
    var t0 = opts.from || Date.now();
    var t1 = t0 + (opts.hours || 24) * 3600000;
    var out = [], prevAbove = false, prevT = t0, riseT = 0;
    var peak = null;

    for (var t = t0; t <= t1; t += step) {
      var la = lookAngles(sat, new Date(t), obsGd);
      if (!la) { prevAbove = false; prevT = t; continue; }
      var above = la.el >= minEl;
      if (above && !prevAbove) {
        riseT = refineCross(sat, obsGd, prevT, t, true, minEl);
        peak = { t: t, el: la.el, az: la.az, range: la.range, eci: la.eci };
      } else if (above && prevAbove) {
        if (!peak || la.el > peak.el) peak = { t: t, el: la.el, az: la.az, range: la.range, eci: la.eci };
      } else if (!above && prevAbove) {
        var setT = refineCross(sat, obsGd, prevT, t, false, minEl);
        if (peak && setT > riseT) {
          /* refine the culmination with a finer scan */
          var bestT = peak.t, bestEl = peak.el, fine = Math.max(2000, (setT - riseT) / 40);
          for (var u = riseT; u <= setT; u += fine) {
            var lu = lookAngles(sat, new Date(u), obsGd);
            if (lu && lu.el > bestEl) { bestEl = lu.el; bestT = u; peak = { t: u, el: lu.el, az: lu.az, range: lu.range, eci: lu.eci }; }
          }
          var rl = lookAngles(sat, new Date(riseT), obsGd);
          var sl = lookAngles(sat, new Date(setT), obsGd);
          var sunAlt = sunAltitudeDeg(new Date(bestT), opts.lat, opts.lon);
          var lit = satIsSunlit(peak.eci, new Date(bestT));
          out.push({
            id: sat.id, name: sat.name, cls: sat.cls,
            rise: riseT, peak: bestT, set: setT,
            dur: Math.round((setT - riseT) / 1000),
            maxEl: bestEl,
            azRise: rl ? rl.az : null, azPeak: peak.az, azSet: sl ? sl.az : null,
            range: peak.range,
            sunAlt: sunAlt, sunlit: lit,
            /* Naked-eye rule: sky dark enough, satellite still sunlit, high enough to
               clear obstructions, and close enough to be plausibly bright. */
            visible: (sunAlt < -6) && lit && bestEl >= 20 && peak.range < 2000
          });
        }
        peak = null;
      }
      prevAbove = above; prevT = t;
    }
    return out;
  }

  /**
   * Predict passes for every featured satellite.
   * Returns a chronologically sorted list. Runs entirely offline.
   */
  OV.predictPasses = function (opts) {
    opts = opts || {};
    var all = [], i;
    for (i = 0; i < SATS.length; i++) {
      var s = SATS[i];
      if (!FEAT[s.id]) continue;                       // featured list only (trial stage)
      if (s.cls === "geo") continue;                   // geostationary: never rises or sets
      /* high/slow orbits linger above the horizon for hours — that is not a "pass" */
      if (s.period && s.period > 400) continue;
      var r;
      try { r = passesFor(s, opts); } catch (e) { r = []; }
      for (var j = 0; j < r.length; j++) {
        r[j].fa = FEAT[s.id].fa; r[j].en = FEAT[s.id].en;
        r[j].use = FEAT[s.id].use; r[j].op = FEAT[s.id].op;
        r[j].img = FEAT[s.id].img ? 1 : 0;
        all.push(r[j]);
      }
    }
    all.sort(function (a, b) { return a.rise - b.rise; });
    return all;
  };

  OV.featuredCount = function () {
    var n = 0; for (var i = 0; i < SATS.length; i++) if (FEAT[SATS[i].id]) n++; return n;
  };
  OV.opInfo = opInfo;
  OV.useInfo = function (k) { return USE[k] || null; };
  OV.sunAltitude = sunAltitudeDeg;
})();
