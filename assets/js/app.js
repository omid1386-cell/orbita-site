/* ORBITA — Aerospace intelligence app (v2)
   • professional SVG map markers   • horizontal layer bar
   • mission table with photos, orbit chips, chronological sort, live launches */
(function () {
  "use strict";

  var LANG = localStorage.getItem("orbita_lang") || "fa";
  var THEME = localStorage.getItem("orbita_theme") || "navy";
  document.documentElement.setAttribute("data-theme", THEME);

  /* ================= i18n ================= */
  var I18N = {
    fa: {
      tagline: "سامانهٔ اطلاعات هوافضا", tab_map: "نقشهٔ جهانی", tab_missions: "پروژه‌های فضایی",
      cat_launch: "شرکت‌های پرتاب", cat_propulsion: "شرکت‌های پیشران", cat_agency: "سازمان‌های فضایی",
      cat_site: "پایگاه‌های پرتاب", results: "نتایج",
      ph_search_map: "جستجوی شرکت، پایگاه یا کشور...", ph_search_mission: "جستجو در نتایج بارگذاری‌شده...",
      project: "پروژه", upcoming: "پرتاب‌های پیش‌رو (زنده)", up_loading: "در حال دریافت از سرویس زندهٔ The Space Devs…",
      loading_map: "در حال بارگذاری نقشه…", country: "کشور", city: "شهر", founded: "سال تأسیس",
      website: "وب‌سایت", products: "محصولات و برنامه‌ها", operator: "بهره‌بردار", first_launch: "نخستین پرتاب",
      pads: "سکوها", rockets: "پرتابگرها", status: "وضعیت", coords: "مختصات", provider: "ارائه‌دهنده",
      rocket: "پرتابگر", orbit: "مدار", mtype: "نوع مأموریت", site: "پایگاه", pad: "سکو",
      location: "مکان", date: "تاریخ", cost: "هزینهٔ برآوردی", en_desc: "شرح رسمی انگلیسی", all: "همه",
      f_type: "همهٔ انواع", f_status: "همه نتایج", f_orbit: "همه مدارها", no_res: "موردی یافت نشد",
      up_err: "دریافت داده‌های زنده ممکن نشد (نیازمند اینترنت).",
      th_mission: "مأموریت / زمان UTC", th_rocket: "پرتابگر", th_op: "ارائه‌دهنده", th_orbit: "مدار",
      th_loc: "کشور / پایگاه", th_result: "نتیجه",
      sort_near: "مرتب‌سازی: نزدیک‌ترین زمان", sort_new: "جدیدترین پرتاب در صدر",
      sort_old: "قدیمی‌ترین ← جدیدترین", sort_az: "الفبایی",
      credit: "تصویر", show_map: "نمایش پایگاه روی نقشه", base_offline: "نقشهٔ آفلاین", base_online: "نقشهٔ آنلاین",
      tab_orbit: "مدار زمین", orbit_loading: "در حال آماده‌سازی کرهٔ زمین و محاسبهٔ مدارها…",
      ph_search_sat: "جستجوی ماهواره یا شناسهٔ رصدی...", mega: "منظومه‌های انبوه",
      featured_only: "فقط ماهواره‌های شاخص", objects: "جسم در مدار",
      dens_1: "شاخص", dens_2: "گسترده", dens_3: "کامل",
      dens_1_t: "شاخص‌ترین ماهواره‌های هر مدار با تنوع کاربردی — نمای تمیز",
      dens_2_t: "همهٔ اجسام به‌جز منظومه‌های انبوه استارلینک و وان‌وب",
      dens_3_t: "تمام اجسام فعال در مدار زمین — نمای شلوغ",
      pass_btn: "عبور از فراز شما", pass_title: "عبور از فراز شما",
      ph_city: "نام شهر را بنویسید…", use_gps: "گرفتن موقعیت از مرورگر",
      only_visible: "فقط قابل رؤیت با چشم", h24: "۲۴ ساعت", h48: "۴۸ ساعت", h72: "۷۲ ساعت",
      pass_hint: "شهر خود را انتخاب کنید تا عبور ماهواره‌های شاخص محاسبه شود.",
      pass_calc: "در حال محاسبهٔ عبورها…", pass_none: "در این بازه عبوری یافت نشد.",
      pass_none_vis: "در این بازه عبور قابل رؤیت با چشم یافت نشد. تیک را بردارید تا همهٔ عبورها را ببینید.",
      pass_found: "عبور یافت شد", pass_of: "از", pass_sats: "ماهوارهٔ شاخص",
      p_dur: "مدت", p_max: "بیشترین ارتفاع", p_dir: "جهت", p_rng: "فاصله",
      p_min: "دقیقه", p_sec: "ثانیه", eye: "قابل رؤیت",
      next_launch: "پرتاب بعدی", watch_live: "پخش زنده", close: "بستن",
      src_curated: "پروندهٔ کامل", src_live: "تازه‌رسیده", mega_n: "پرتاب",
      mega_list: "فهرست پرتاب‌های این منظومه",
      live_note: "این ردیف به‌صورت خودکار از پایگاه دادهٔ پرتاب‌های جهانی افزوده شده است. شرح تفصیلی فارسی برای آن هنوز نوشته نشده؛ مشخصات بالا ترجمه‌شده‌اند.",
      pass_note: "محاسبه به‌صورت محلی و بدون اینترنت انجام می‌شود. دقت برای دو روز نخست بالاست.",
      today: "امروز", tomorrow: "فردا", geo_err: "دریافت موقعیت ممکن نشد؛ شهر را دستی انتخاب کنید.",
      my_loc: "موقعیت شما",
      n_n: "شمال", n_ne: "شمال شرقی", n_e: "شرق", n_se: "جنوب شرقی",
      n_s: "جنوب", n_sw: "جنوب غربی", n_w: "غرب", n_nw: "شمال غربی",
      orbit_hint: "کشیدن = چرخش کره · چرخ موشی = بزرگ‌نمایی · کلیک روی هر نقطه = اطلاعات ماهواره"
    },
    en: {
      tagline: "Aerospace Intelligence Platform", tab_map: "World Map", tab_missions: "Space Projects",
      cat_launch: "Launch companies", cat_propulsion: "Propulsion companies", cat_agency: "Space agencies",
      cat_site: "Launch sites", results: "Results",
      ph_search_map: "Search company, site or country...", ph_search_mission: "Search loaded results...",
      project: "projects", upcoming: "Upcoming launches (live)", up_loading: "Fetching from The Space Devs…",
      loading_map: "Loading map…", country: "Country", city: "City", founded: "Founded",
      website: "Website", products: "Products & programmes", operator: "Operator", first_launch: "First launch",
      pads: "Pads", rockets: "Rockets", status: "Status", coords: "Coordinates", provider: "Provider",
      rocket: "Launch vehicle", orbit: "Orbit", mtype: "Mission type", site: "Launch site", pad: "Pad",
      location: "Location", date: "Date", cost: "Estimated cost", en_desc: "Full English description", all: "All",
      f_type: "All types", f_status: "All results", f_orbit: "All orbits", no_res: "No results",
      up_err: "Live data unavailable (internet required).",
      th_mission: "Mission / UTC time", th_rocket: "Launch vehicle", th_op: "Provider", th_orbit: "Orbit",
      th_loc: "Country / site", th_result: "Result",
      sort_near: "Sort: nearest date", sort_new: "Latest launch first", sort_old: "Oldest → newest", sort_az: "Alphabetical",
      credit: "Image", show_map: "Show launch site on map", base_offline: "Offline map", base_online: "Online map",
      tab_orbit: "Earth Orbit", orbit_loading: "Preparing the globe and propagating orbits…",
      ph_search_sat: "Search satellite or NORAD ID...", mega: "Mega-constellations",
      featured_only: "Featured satellites only", objects: "objects in orbit",
      dens_1: "Featured", dens_2: "Extended", dens_3: "Full",
      dens_1_t: "Most notable satellites of each orbit, across mission types — clean view",
      dens_2_t: "Everything except the Starlink and OneWeb mega-constellations",
      dens_3_t: "Every active object in Earth orbit — dense view",
      pass_btn: "Passes overhead", pass_title: "Passes overhead",
      ph_city: "Type a city name…", use_gps: "Use browser location",
      only_visible: "Naked-eye visible only", h24: "24 hours", h48: "48 hours", h72: "72 hours",
      pass_hint: "Pick your city to compute passes of the featured satellites.",
      pass_calc: "Computing passes…", pass_none: "No passes found in this window.",
      pass_none_vis: "No naked-eye passes in this window. Untick the box to see all passes.",
      pass_found: "passes found", pass_of: "of", pass_sats: "featured satellites",
      p_dur: "Duration", p_max: "Max elevation", p_dir: "Direction", p_rng: "Range",
      p_min: "min", p_sec: "s", eye: "visible",
      next_launch: "Next launch", watch_live: "Watch live", close: "Dismiss",
      src_curated: "Full file", src_live: "Newly added", mega_n: "launches",
      mega_list: "Launches in this constellation",
      live_note: "This entry was imported automatically from the global launch database. A detailed write-up has not been added yet.",
      pass_note: "Computed locally, no internet needed. Accuracy is best for the first two days.",
      today: "Today", tomorrow: "Tomorrow", geo_err: "Location unavailable; pick a city manually.",
      my_loc: "Your location",
      n_n: "N", n_ne: "NE", n_e: "E", n_se: "SE", n_s: "S", n_sw: "SW", n_w: "W", n_nw: "NW",
      orbit_hint: "Drag = rotate · Scroll = zoom · Click any dot = satellite info"
    }
  };
  function t(k) { return (I18N[LANG] && I18N[LANG][k]) || k; }

  var STATUS_FA = { success: "موفق", operational: "فعال / در بهره‌برداری", upcoming: "پیش‌رو", development: "در دست توسعه",
    cruise: "در مسیر", partial: "موفقیت نسبی", failure: "ناموفق", deployment: "در حال استقرار",
    active: "فعال", inactive: "غیرفعال", under_construction: "در دست ساخت" };
  var STATUS_EN = { success: "Success", operational: "Operational", upcoming: "Upcoming", development: "In development",
    cruise: "In cruise", partial: "Partial", failure: "Failure", deployment: "Deploying",
    active: "Active", inactive: "Inactive", under_construction: "Under construction" };
  function statusLabel(s) { return LANG === "fa" ? (STATUS_FA[s] || s) : (STATUS_EN[s] || s); }

  /* ================= professional SVG markers ================= */
  var C = { launch: "#2fd4a7", propulsion: "#f5a524", agency: "#a78bfa", site: "#fb7185", siteOff: "#8ea0bd", siteWip: "#38bdf8" };

  function svgLaunch(c) { // rounded pin + rocket glyph
    return '<svg width="30" height="38" viewBox="0 0 30 38">' +
      '<path d="M15 37C15 37 28 22.5 28 14A13 13 0 1 0 2 14C2 22.5 15 37 15 37Z" fill="' + c + '" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/>' +
      '<path d="M15 6.2c2.7 2.3 4.1 5.6 4.1 9 0 1.4-.2 2.6-.6 3.8h-7c-.4-1.2-.6-2.4-.6-3.8 0-3.4 1.4-6.7 4.1-9z" fill="#08131f"/>' +
      '<circle cx="15" cy="13.6" r="1.7" fill="' + c + '"/>' +
      '<path d="M10.9 16.6l-2 3.6 2.6-1.1zM19.1 16.6l2 3.6-2.6-1.1z" fill="#08131f"/>' +
      '<path d="M13.4 20.3h3.2l-1.6 3.4z" fill="#08131f" opacity=".85"/></svg>';
  }
  function svgPropulsion(c) { // hexagon pin + engine bell with flame
    return '<svg width="30" height="38" viewBox="0 0 30 38">' +
      '<path d="M15 37L3.2 24.6A14 14 0 1 1 26.8 24.6Z" fill="' + c + '" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/>' +
      '<path d="M12.2 6.6h5.6l1 5.2c.2 1 .7 1.7 1.5 2.4l1.6 1.4c.6.5.4 1.5-.4 1.7l-3 .8h-7l-3-.8c-.8-.2-1-1.2-.4-1.7l1.6-1.4c.8-.7 1.3-1.4 1.5-2.4z" fill="#08131f"/>' +
      '<path d="M15 19.6c1.5 1.6 2.4 3.2 2.4 4.6 0 1.6-1.1 2.7-2.4 2.7s-2.4-1.1-2.4-2.7c0-1.4.9-3 2.4-4.6z" fill="#08131f" opacity=".9"/></svg>';
  }
  function svgAgency(c) { // shield + orbit/globe
    return '<svg width="30" height="38" viewBox="0 0 30 38">' +
      '<path d="M15 37c8.5-4.3 12-9.9 12-17.6V6.6L15 2.2 3 6.6v12.8C3 27.1 6.5 32.7 15 37z" fill="' + c + '" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/>' +
      '<circle cx="15" cy="17" r="5.6" fill="none" stroke="#08131f" stroke-width="1.8"/>' +
      '<path d="M15 11.4c-2.2 2.6-2.2 8.6 0 11.2M9.4 17h11.2" stroke="#08131f" stroke-width="1.4" fill="none"/>' +
      '<ellipse cx="15" cy="17" rx="9" ry="3.3" fill="none" stroke="#08131f" stroke-width="1.6" transform="rotate(-28 15 17)"/></svg>';
  }
  function svgSite(c) { // launch pad: gantry tower + rocket on pad
    return '<svg width="32" height="38" viewBox="0 0 32 38">' +
      '<path d="M16 37L4.5 25.5A16 16 0 1 1 27.5 25.5Z" fill="' + c + '" stroke="#fff" stroke-opacity=".55" stroke-width="1.4" opacity=".18"/>' +
      '<circle cx="16" cy="16" r="13.4" fill="' + c + '" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>' +
      '<path d="M16 6.4c1.9 1.9 2.9 4.4 2.9 7.1 0 2-.4 3.7-1.1 5.2h-3.6c-.7-1.5-1.1-3.2-1.1-5.2 0-2.7 1-5.2 2.9-7.1z" fill="#08131f"/>' +
      '<path d="M9.6 8.6v13.2M22.4 8.6v13.2" stroke="#08131f" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path d="M9.6 11.6h3.4M19 11.6h3.4M9.6 15.4h2.8M19.6 15.4h2.8M9.6 19.2h3.4M19 19.2h3.4" stroke="#08131f" stroke-width="1.2"/>' +
      '<path d="M7.4 23.4h17.2" stroke="#08131f" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M16 37l-3.4-13h6.8z" fill="' + c + '"/></svg>';
  }
  function iconFor(cat, status) {
    if (cat === "launch") return svgLaunch(C.launch);
    if (cat === "propulsion") return svgPropulsion(C.propulsion);
    if (cat === "agency") return svgAgency(C.agency);
    return svgSite(status === "inactive" ? C.siteOff : status === "under_construction" ? C.siteWip : C.site);
  }

  /* ================= state ================= */
  var DATA = { companies: [], sites: [], missions: [] };
  var markers = [], map = null;
  var filters = { launch: true, propulsion: true, agency: true, site: true };
  var SORT = "new";   /* newest launch first — the user asked for this ordering */

  var $ = function (s) { return document.querySelector(s) || null; };
  function on(sel, ev, fn) { var el = document.querySelector(sel); if (el) el.addEventListener(ev, fn); }
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function name(o) { return LANG === "fa" ? o.fa : o.en; }
  function desc(o) { return LANG === "fa" ? o.fa_d : o.en_d; }

  /* ================= date parsing & sorting ================= */
  function missionTime(m) {
    var d = String(m.date || "");
    var planned = /upcoming|development|deployment/.test(m.status || "");
    var iso = d.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return Date.UTC(+iso[1], +iso[2] - 1, +iso[3]);
    var ym = d.match(/(\d{4})-(\d{2})/);
    if (ym) return Date.UTC(+ym[1], +ym[2] - 1, 15);
    var range = d.match(/(\d{4})\s*[–-]\s*(\d{4})/);
    if (range) return Date.UTC(+range[1], planned ? 11 : 6, planned ? 31 : 1);
    var y = d.match(/(\d{4})/);
    if (y) return Date.UTC(+y[1], planned ? 11 : 6, planned ? 31 : 1);
    if (/late 2020s/i.test(d)) return Date.UTC(2029, 0, 1);
    if (/2030s/.test(d)) return Date.UTC(2034, 0, 1);
    return Date.UTC(2035, 0, 1);
  }
  function fmtDate(m) {
    var ts = missionTime(m), dt = new Date(ts);
    var hasDay = /\d{4}-\d{2}-\d{2}/.test(m.date);
    var mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dt.getUTCMonth()];
    return hasDay ? (dt.getUTCDate() + " " + mon + " " + dt.getUTCFullYear() + " UTC") : String(m.date);
  }
  function relTime(m) {
    var diff = missionTime(m) - Date.now(), day = 86400000;
    var d = Math.round(Math.abs(diff) / day);
    if (LANG === "fa") {
      if (diff > 0) return d > 400 ? "حدود " + Math.round(d / 365) + " سال دیگر" : d + " روز دیگر";
      return d > 400 ? Math.round(d / 365) + " سال پیش" : d + " روز پیش";
    }
    if (diff > 0) return d > 400 ? "in ~" + Math.round(d / 365) + " yr" : "in " + d + " d";
    return d > 400 ? Math.round(d / 365) + " yr ago" : d + " d ago";
  }
  function sortMissions(list) {
    var now = Date.now();
    if (SORT === "near") {
      var fut = list.filter(function (m) { return missionTime(m) >= now; }).sort(function (a, b) { return missionTime(a) - missionTime(b); });
      var past = list.filter(function (m) { return missionTime(m) < now; }).sort(function (a, b) { return missionTime(b) - missionTime(a); });
      return fut.concat(past);
    }
    if (SORT === "new") {
      /* "newest first" must mean the most recent *actual* launch at the top.
         Not-yet-flown projects would otherwise bury today's launches under
         dates years in the future, so they are listed after the flown ones. */
      var flown = list.filter(function (m) { return missionTime(m) <= now; })
        .sort(function (a, b) { return missionTime(b) - missionTime(a); });
      var ahead = list.filter(function (m) { return missionTime(m) > now; })
        .sort(function (a, b) { return missionTime(a) - missionTime(b); });
      return flown.concat(ahead);
    }
    if (SORT === "old") return list.slice().sort(function (a, b) { return missionTime(a) - missionTime(b); });
    return list.slice().sort(function (a, b) { return name(a).localeCompare(name(b)); });
  }

  /* ================= orbit classification ================= */
  function orbitInfo(o) {
    var s = String(o || "").toLowerCase();
    if (/l2|l1|halo|lagrang/.test(s)) return { k: "L1/L2", fa: "نقطهٔ لاگرانژ", c: "#a78bfa" };
    if (/lunar|moon|tli|nrho/.test(s)) return { k: "Lunar", fa: "مدار / سطح ماه", c: "#f5a524" };
    if (/mars|jupiter|asteroid|titan|mercury|comet|interstellar|kuiper|solar|helio|phobos|europa/.test(s))
      return { k: "Deep space", fa: "فضای عمیق", c: "#fb7185" };
    if (/sso|sun-sync/.test(s)) return { k: "SSO", fa: "مدار خورشیدآهنگ (SSO)", c: "#2fd4a7" };
    if (/gto|geo|geostation/.test(s)) return { k: "GTO/GEO", fa: "مدار زمین‌ثابت (GEO)", c: "#38bdf8" };
    if (/meo/.test(s)) return { k: "MEO", fa: "مدار میانی (MEO)", c: "#38bdf8" };
    if (/leo|low earth|suborbital|400|390/.test(s)) return { k: "LEO", fa: "مدار پایین زمین (LEO)", c: "#2fd4a7" };
    return { k: "Other", fa: "سایر", c: "#8ba3c4" };
  }

  var COUNTRY = [
    ["USA", "ایالات متحده"], ["United States", "ایالات متحده"], ["Florida", "ایالات متحده"],
    ["California", "ایالات متحده"], ["Texas", "ایالات متحده"], ["China", "چین"], ["Hainan", "چین"],
    ["India", "هند"], ["Japan", "ژاپن"], ["Russia", "روسیه"], ["Kazakhstan", "قزاقستان"],
    ["French Guiana", "گویان فرانسه"], ["Iran", "ایران"], ["Semnan", "ایران"], ["South Korea", "کره جنوبی"],
    ["Norway", "نروژ"], ["Australia", "استرالیا"], ["New Zealand", "نیوزیلند"], ["Brazil", "برزیل"]
  ];
  function countryOf(loc) {
    var s = String(loc || "");
    for (var i = 0; i < COUNTRY.length; i++) if (s.indexOf(COUNTRY[i][0]) > -1) return LANG === "fa" ? COUNTRY[i][1] : COUNTRY[i][0];
    return s.split(",").pop().trim() || "—";
  }

  /* ================= theme / language ================= */
  function applyI18n() {
    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $$("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
    $$("[data-i18n-title]").forEach(function (el) { el.title = t(el.getAttribute("data-i18n-title")); });
    document.documentElement.lang = LANG;
    document.documentElement.dir = LANG === "fa" ? "rtl" : "ltr";
    var lb = $("#langBtn"); if (lb) lb.textContent = LANG === "fa" ? "EN" : "فا";
    var bb2 = $("#baseBtn"); if (bb2 && bb2.querySelector("span")) bb2.querySelector("span").textContent = t(BASEMODE === "offline" ? "base_offline" : "base_online");
  }
  on("#langBtn", "click", function () {
    LANG = LANG === "fa" ? "en" : "fa"; localStorage.setItem("orbita_lang", LANG);
    applyI18n(); buildLayerBar(); renderMarkers(); buildLabels(); renderList(); buildFilters(); renderMissions();
    var d = $("#detail"); if (d) d.classList.remove("open");
    if (window.ORBITA3D && ORBITA3D.ready()) {
      buildOrbLegend(); syncDensityUI(); ORBITA3D.clearSelection();
      if (SITE && $("#passPanel") && $("#passPanel").classList.contains("open")) runPasses();
    }
  });
  on("#themeBtn", "click", function () {
    THEME = THEME === "navy" ? "light" : "navy"; localStorage.setItem("orbita_theme", THEME);
    document.documentElement.setAttribute("data-theme", THEME);
    if (map) { map.setStyle(mapStyle()); setTimeout(function () { renderMarkers(); buildLabels(); }, 400); }
  });
  $$(".tab").forEach(function (b) {
    b.onclick = function () {
      $$(".tab").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      $$(".view").forEach(function (v) { v.classList.remove("active"); });
      $("#view-" + b.dataset.view).classList.add("active");
      if (b.dataset.view === "map" && map) setTimeout(function () { map.resize(); }, 60);
      if (b.dataset.view === "orbit") { bootOrbit(); } else if (window.ORBITA3D) { ORBITA3D.stop(); }
    };
  });

  /* ================= map ================= */
  var BASEMODE = localStorage.getItem("orbita_base") || "offline";

  function offlineStyle() {
    var dark = THEME === "navy";
    return {
      version: 8,
      sources: {
        countries: { type: "geojson", data: "assets/geo/countries.json" }
      },
      layers: [
        { id: "ocean", type: "background",
          paint: { "background-color": dark ? "#08131f" : "#dbe7f3" } },
        { id: "country-fill", type: "fill", source: "countries",
          paint: { "fill-color": dark ? "#16283d" : "#f7fafc", "fill-opacity": 1 } },
        { id: "country-hover", type: "fill", source: "countries",
          filter: ["==", ["get", "NAME"], ""],
          paint: { "fill-color": dark ? "#1f3c5b" : "#e4eefb" } },
        { id: "country-line", type: "line", source: "countries",
          paint: { "line-color": dark ? "#2b4a6e" : "#b9c9dc", "line-width": 0.7, "line-opacity": .9 } }
      ]
    };
  }

  function onlineStyle() {
    return THEME === "navy"
      ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
  }
  function mapStyle() { return BASEMODE === "online" ? onlineStyle() : offlineStyle(); }

  /* country name labels rendered as DOM markers (works without remote glyph fonts) */
  var labelMarkers = [], LABELS = null;
  function buildLabels() {
    if (!map) return;
    labelMarkers.forEach(function (m) { m.remove(); });
    labelMarkers = [];
    if (!LABELS || BASEMODE === "online") return;
    LABELS.features.forEach(function (f) {
      var el = document.createElement("div");
      el.className = "clabel r" + (f.properties.RANK || 5);
      el.textContent = LANG === "fa" ? (f.properties.NAME_FA || f.properties.NAME) : f.properties.NAME;
      labelMarkers.push(new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(f.geometry.coordinates).addTo(map));
    });
    zoomLabels();
  }
  function zoomLabels() {
    if (!map) return;
    var z = map.getZoom();
    labelMarkers.forEach(function (m) {
      var el = m.getElement();
      var rank = +(el.className.match(/r(\d+)/) || [0, 5])[1];
      el.style.display = (z >= rank - 1.5) ? "block" : "none";
    });
  }

  function initMap() {
    if (typeof maplibregl === "undefined") { $("#mapStatus").textContent = "MapLibre failed to load."; return; }
    map = new maplibregl.Map({ container: "map", style: mapStyle(), center: [20, 25], zoom: 1.9,
      minZoom: 1, maxZoom: 18, hash: true, attributionControl: { compact: true } });
    window.map = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    map.addControl(new maplibregl.FullscreenControl(), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.on("load", function () {
      $("#mapStatus").style.display = "none";
      renderMarkers();
      fetch("assets/geo/labels.json").then(function (r) { return r.json(); })
        .then(function (d) { LABELS = d; buildLabels(); }).catch(function () {});
    });
    map.on("styledata", function () {
      if ($("#mapStatus")) $("#mapStatus").style.display = "none";
      if (markers.length === 0) renderMarkers();
    });
    map.on("zoom", zoomLabels);
    map.on("move", function () { var c = map.getCenter();
      $("#coords").textContent = c.lat.toFixed(2) + ", " + c.lng.toFixed(2) + " · z" + map.getZoom().toFixed(1); });
    map.on("error", function (e) { console.warn("map:", (e && e.error && e.error.message) || e); });

    // country hover highlight (offline style only)
    map.on("mousemove", function (e) {
      if (BASEMODE !== "offline" || !map.getLayer("country-hover")) return;
      var f = map.queryRenderedFeatures(e.point, { layers: ["country-fill"] })[0];
      map.setFilter("country-hover", ["==", ["get", "NAME"], f ? f.properties.NAME : ""]);
    });
  }

  on("#baseBtn", "click", function () {
    BASEMODE = BASEMODE === "offline" ? "online" : "offline";
    localStorage.setItem("orbita_base", BASEMODE);
    var bb = $("#baseBtn"); if (bb) bb.querySelector("span").textContent = t(BASEMODE === "offline" ? "base_offline" : "base_online");
    if (map) { map.setStyle(mapStyle()); setTimeout(function () { renderMarkers(); buildLabels(); }, 400); }
  });

  function allPoints() {
    var p = [];
    DATA.companies.forEach(function (c) { p.push({ kind: "company", cat: c.cat, o: c }); });
    DATA.sites.forEach(function (s) { p.push({ kind: "site", cat: "site", o: s }); });
    return p;
  }
  function filteredPoints() {
    var q = (($("#mapSearch")||{}).value || "").trim().toLowerCase();
    return allPoints().filter(function (p) {
      if (!filters[p.cat]) return false;
      if (!q) return true;
      var o = p.o;
      return [o.en, o.fa, o.country, o.country_fa, o.city, o.city_fa, o.op, (o.rockets || o.products || []).join(" ")]
        .join(" ").toLowerCase().indexOf(q) > -1;
    });
  }

  function buildLayerBar() {
    var cats = [
      { k: "launch", n: DATA.companies.filter(function (x) { return x.cat === "launch"; }).length },
      { k: "propulsion", n: DATA.companies.filter(function (x) { return x.cat === "propulsion"; }).length },
      { k: "agency", n: DATA.companies.filter(function (x) { return x.cat === "agency"; }).length },
      { k: "site", n: DATA.sites.length }
    ];
    $("#layerbar").innerHTML = cats.map(function (c) {
      return '<div class="lchip' + (filters[c.k] ? "" : " off") + '" title="' + t("cat_" + c.k) + '" data-cat="' + c.k + '" style="color:' + C[c.k === "site" ? "site" : c.k] + '">' +
        '<span class="ic">' + iconFor(c.k, "active").replace(/width="3\d"/, 'width="18"').replace(/height="38"/, 'height="23"') + "</span>" +
        '<span class="lb" style="color:var(--text)">' + t("cat_" + c.k) + '</span><span class="n">' + c.n + "</span></div>";
    }).join("");
    $$(".lchip").forEach(function (el) {
      el.onclick = function () {
        var k = el.dataset.cat; filters[k] = !filters[k];
        el.classList.toggle("off", !filters[k]); renderMarkers(); renderList();
      };
    });
  }

  /* ---- marker sizing: compact at world zoom, full size when zoomed in ---- */
  var PIN_BASE = 0.8;              // 80% of the original artwork
  function pinScale() {
    var z = map ? map.getZoom() : 2;
    if (z < 3) return PIN_BASE * 0.82;
    if (z < 5) return PIN_BASE * 0.92;
    return PIN_BASE;
  }
  function sizedIcon(cat, status, sc) {
    return iconFor(cat, status).replace(/width="(\d+)"/, function (m, w) {
      return 'width="' + Math.round(+w * sc) + '"';
    }).replace(/height="(\d+)"/, function (m, h) {
      return 'height="' + Math.round(+h * sc) + '"';
    });
  }

  /* ---- grid clustering: merge markers that would overlap on screen ---- */
  function clusterPoints(pts) {
    if (!map) return pts.map(function (p) { return { pts: [p] }; });
    var z = map.getZoom();
    if (z >= 6) return pts.map(function (p) { return { pts: [p] }; });   // close in: never cluster
    var cell = z < 3 ? 34 : z < 4.5 ? 26 : 20;                            // screen pixels
    var bins = {}, order = [];
    pts.forEach(function (p) {
      var s;
      try { s = map.project([p.o.lon, p.o.lat]); } catch (e) { return; }
      var key = Math.round(s.x / cell) + "|" + Math.round(s.y / cell);
      if (!bins[key]) { bins[key] = { pts: [] }; order.push(bins[key]); }
      bins[key].pts.push(p);
    });
    return order;
  }

  function clusterEl(group, sc) {
    var n = group.pts.length;
    var cats = {}; group.pts.forEach(function (p) { cats[p.cat] = (cats[p.cat] || 0) + 1; });
    var top = Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; })[0];
    var col = C[top === "site" ? "site" : top] || C.launch;
    var d = Math.round((n > 20 ? 38 : n > 8 ? 34 : 30) * sc);
    var el = document.createElement("div");
    el.className = "pin cluster";
    el.style.width = d + "px"; el.style.height = d + "px";
    el.style.setProperty("--cc", col);
    el.textContent = LANG === "fa" ? fmtNum(n) : String(n);
    el.title = (LANG === "fa" ? n + " مورد در این ناحیه" : n + " items in this area");
    return el;
  }

  var clusterZoomBound = false;
  function renderMarkers() {
    if (!map) return;
    markers.forEach(function (m) { m.remove(); }); markers = [];
    var sc = pinScale();
    clusterPoints(filteredPoints()).forEach(function (g) {
      var el, lngLat, anchor;
      if (g.pts.length > 1) {
        el = clusterEl(g, sc);
        anchor = "center";
        var sx = 0, sy = 0;
        g.pts.forEach(function (p) { sx += p.o.lon; sy += p.o.lat; });
        lngLat = [sx / g.pts.length, sy / g.pts.length];
        el.addEventListener("click", function (ev) {
          ev.stopPropagation();
          map.flyTo({ center: lngLat, zoom: Math.min(map.getZoom() + 2.4, 9), duration: 800 });
        });
      } else {
        var p = g.pts[0];
        el = document.createElement("div");
        el.className = "pin"; el.title = name(p.o);
        el.innerHTML = sizedIcon(p.cat, p.o.status, sc);
        anchor = "bottom";
        lngLat = [p.o.lon, p.o.lat];
        el.addEventListener("click", function (ev) {
          ev.stopPropagation(); openDetail(p);
          map.flyTo({ center: lngLat, zoom: Math.max(map.getZoom(), 4.5), duration: 900 });
        });
      }
      markers.push(new maplibregl.Marker({ element: el, anchor: anchor }).setLngLat(lngLat).addTo(map));
    });
    if (!clusterZoomBound) {
      clusterZoomBound = true;
      var tmr = 0;
      map.on("zoomend", function () { clearTimeout(tmr); tmr = setTimeout(renderMarkers, 90); });
    }
  }

  function renderList() {
    var pts = filteredPoints();
    $("#resCount").textContent = pts.length;
    $("#resultList").innerHTML = pts.slice(0, 400).map(function (p, i) {
      var sub = LANG === "fa" ? (p.o.country_fa || "") : (p.o.country || "");
      var ic = iconFor(p.cat, p.o.status).replace(/width="3\d"/, 'width="17"').replace(/height="38"/, 'height="22"');
      return '<div class="res" data-i="' + i + '"><span class="ic">' + ic + "</span>" +
        '<span class="t"><b>' + esc(name(p.o)) + "</b><span>" + esc(sub) + "</span></span></div>";
    }).join("") || '<div class="up-empty">' + t("no_res") + "</div>";
    $$("#resultList .res").forEach(function (el) {
      el.onclick = function () {
        var p = pts[+el.dataset.i];
        map.flyTo({ center: [p.o.lon, p.o.lat], zoom: 5.5, duration: 1100 }); openDetail(p);
        if (window.innerWidth < 900) closeSide();
      };
    });
  }

  function cell(label, val, ltr) {
    if (!val) return "";
    return '<div class="cell' + (ltr ? " ltr" : "") + '"><small>' + esc(label) + "</small><b>" + esc(val) + "</b></div>";
  }

  function openDetail(p) {
    var o = p.o, h = "";
    var ic = iconFor(p.cat, o.status).replace(/width="3\d"/, 'width="34"').replace(/height="38"/, 'height="44"');
    h += '<div class="d-head"><div>' + ic + "</div><div>" +
      '<div class="d-kicker">' + esc(t("cat_" + p.cat).replace(/های /, "")) + "</div>" +
      '<h2 class="d-title">' + esc(name(o)) + "</h2></div></div>";
    h += '<div class="d-sub">' + esc(LANG === "fa" ? o.en : o.fa) + "</div>";
    h += '<div class="d-desc">' + esc(desc(o)) + "</div>";
    h += '<div class="grid2">';
    h += cell(t("country"), LANG === "fa" ? o.country_fa : o.country);
    if (p.kind === "company") {
      h += cell(t("city"), LANG === "fa" ? o.city_fa : o.city);
      h += cell(t("founded"), o.founded);
      h += cell(t("website"), o.site && o.site !== "—" ? o.site : "", true);
    } else {
      h += cell(t("operator"), o.op, true);
      h += cell(t("first_launch"), o.first);
      h += cell(t("status"), statusLabel(o.status));
      h += cell(t("pads"), o.pads, true);
    }
    h += cell(t("coords"), o.lat.toFixed(4) + ", " + o.lon.toFixed(4), true) + "</div>";
    var list = o.products || o.rockets || [];
    if (list.length) {
      h += '<div class="sec-t">' + (p.kind === "company" ? t("products") : t("rockets")) + "</div><div class='chips'>" +
        list.map(function (x) { return '<span class="chip">' + esc(x) + "</span>"; }).join("") + "</div>";
    }
    h += '<details class="acc"><summary>▸ ' + t("en_desc") + '</summary><div class="in"><div class="d-desc en">' +
      esc(LANG === "fa" ? o.en_d : o.fa_d) + "</div></div></details>";
    $("#detailBody").innerHTML = h;
    $("#detail").classList.add("open");
  }
  on("#detailClose", "click", function () { var d = $("#detail"); if (d) d.classList.remove("open"); });
  on("#mapSearch", "input", function () { renderMarkers(); renderList(); });

  function openSide(focus) {
    var sb = $("#sidebar"), fab = $("#sideOpen");
    if (!sb) return;
    sb.classList.remove("collapsed");
    if (fab) fab.classList.add("hidden");
    if (focus) { var i = $("#mapSearch"); if (i) i.focus(); }
  }
  function closeSide() {
    var sb = $("#sidebar"), fab = $("#sideOpen");
    if (sb) sb.classList.add("collapsed");
    if (fab) fab.classList.remove("hidden");
  }
  on("#sideOpen", "click", function () { openSide(true); });
  on("#sideClose", "click", function () {
    var i = $("#mapSearch"); if (i) i.value = "";
    renderMarkers(); renderList(); closeSide();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSide();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSide(true); }
  });

  /* ================= missions table ================= */
  function uniq(a) { return a.filter(function (v, i, s) { return v && s.indexOf(v) === i; }).sort(); }

  function buildFilters() {
    /* filters cover curated projects and imported launches alike */
    var m = allMissions(), cur;
    // status
    cur = $("#fStatus").value;
    $("#fStatus").innerHTML = '<option value="">' + t("f_status") + "</option>" +
      uniq(m.map(function (x) { return x.status; })).map(function (v) {
        return '<option value="' + esc(v) + '">' + esc(statusLabel(v)) + "</option>"; }).join("");
    $("#fStatus").value = cur;
    // orbit groups
    cur = $("#fOrbit").value;
    var groups = uniq(m.map(function (x) { return orbitInfo(x.orbit).k; }));
    $("#fOrbit").innerHTML = '<option value="">' + t("f_orbit") + "</option>" +
      groups.map(function (g) {
        var f = m.find(function (x) { return orbitInfo(x.orbit).k === g; });
        return '<option value="' + esc(g) + '">' + esc(LANG === "fa" ? orbitInfo(f.orbit).fa : g) + "</option>"; }).join("");
    $("#fOrbit").value = cur;
    // type
    cur = $("#fType").value;
    $("#fType").innerHTML = '<option value="">' + t("f_type") + "</option>" +
      uniq(m.map(function (x) { return x.type_key || x.type; })).filter(function (v) { return v; })
        .map(function (v) {
          var f = m.find(function (x) { return (x.type_key || x.type) === v; });
          return '<option value="' + esc(v) + '">' + esc(LANG === "fa" ? f.type_fa : (f.type || v)) + "</option>"; }).join("");
    $("#fType").value = cur;
    // sort
    $("#fSort").innerHTML = ["near", "new", "old", "az"].map(function (s) {
      return '<option value="' + s + '"' + (SORT === s ? " selected" : "") + ">" + t("sort_" + s) + "</option>"; }).join("");
  }

  function rowHTML(m) {
    var oi = orbitInfo(m.orbit);
    var orbTxt = LANG === "fa" ? (m.orbit_fa || oi.fa) : (oi.k || m.orbit);
    var country = LANG === "fa" && m.loc_fa ? m.loc_fa : countryOf(m.loc);
    var tag = m.mega
      ? '<span class="src-tag mega">' + fmtNum(m.kids.length) + " " + t("mega_n") + "</span>"
      : m.live ? '<span class="src-tag new">' + t("src_live") + "</span>"
               : '<span class="src-tag full">' + t("src_curated") + "</span>";
    return '<div class="mrow' + (m.live ? " is-live" : "") + '" data-id="' + esc(m.id) + '">' +
      '<div class="mrow-grid">' +
        '<div class="m-main">' +
          '<img class="m-thumb" loading="lazy" src="' + esc(m.img || "") + '" alt="" onerror="this.style.visibility=\'hidden\'"/>' +
          '<div class="m-txt">' +
            '<div class="t1"><bdi>' + esc(name(m)) + "</bdi>" + tag + "</div>" +
            '<div class="t2"><bdi>' + esc(m.en) + "</bdi>" + (m.rocket ? " | <bdi>" + esc(m.rocket) + "</bdi>" : "") + "</div>" +
            '<div class="t3">' + esc(fmtDate(m)) + " · " + esc(relTime(m)) + "</div>" +
            '<div class="t4"><bdi>' + esc(LANG === "fa" ? m.op : m.op_fa) + "</bdi></div>" +
          "</div></div>" +
        '<div class="cc c-rocket"><bdi>' + esc(m.rocket) + "</bdi></div>" +
        '<div class="cc c-op"><bdi>' + esc(LANG === "fa" ? m.op_fa : m.op) + "</bdi></div>" +
        '<div class="cc"><span class="orbit-chip" style="color:' + oi.c + ';border-color:' + oi.c + '55;background:' + oi.c + '1f">' +
          esc(orbTxt) + "</span></div>" +
        '<div class="cc two c-loc">' + esc(country) + "<small><bdi>" + esc(m.site) + "</bdi></small></div>" +
        '<div class="cc"><span class="badge b-' + esc(m.status) + '">' + esc(statusLabel(m.status)) + "</span></div>" +
        '<div><button class="exp-btn">›</button></div>' +
      "</div>" +
      '<div class="m-detail"></div></div>';
  }

  function detailHTML(m) {
    var h = '<div class="det-2col"><div>' +
      '<img src="' + esc(m.img || "") + '" alt="" onerror="this.style.display=\'none\'"/>' +
      '<div style="font-size:10px;color:var(--muted);margin-top:6px">' + t("credit") + ': Wikimedia Commons</div></div><div>';
    h += '<div class="d-kicker">' + esc(LANG === "fa" ? m.type_fa : m.type) + "</div>";
    h += '<h3 class="d-title">' + esc(name(m)) + "</h3>";
    h += '<div class="d-sub">' + esc(LANG === "fa" ? m.en : m.fa) + "</div>";
    var dtxt = desc(m);
    if (dtxt) h += '<div class="d-desc">' + esc(dtxt) + "</div>";
    else if (m.live) h += '<div class="d-note">' + t("live_note") + "</div>";
    h += '<div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">';
    h += cell(t("provider"), LANG === "fa" ? m.op_fa : m.op);
    h += cell(t("rocket"), m.rocket, true);
    h += cell(t("orbit"), LANG === "fa" ? (m.orbit_fa || m.orbit) : m.orbit, !(LANG === "fa" && m.orbit_fa));
    h += cell(t("mtype"), LANG === "fa" ? m.type_fa : m.type);
    h += cell(t("site"), m.site, true);
    h += cell(t("pad"), m.pad, true);
    h += cell(t("location"), LANG === "fa" && m.loc_fa ? m.loc_fa : m.loc, !(LANG === "fa" && m.loc_fa));
    h += cell(t("date"), m.date, true);
    h += cell(t("cost"), m.cost && m.cost !== "—" ? m.cost : "", true);
    h += "</div>";

    /* mega-constellation group: list the individual launches it folds */
    if (m.mega && m.kids && m.kids.length) {
      h += '<details class="acc"><summary>▸ ' + t("mega_list") + " (" + fmtNum(m.kids.length) + ")</summary><div class=\"in\">";
      h += '<div class="mega-list">' + m.kids.slice().sort(function (a, b) {
        return (b.date || "").localeCompare(a.date || "");
      }).map(function (k) {
        return '<div class="mk"><span class="mk-d">' + esc(k.date) + "</span>" +
          "<bdi>" + esc(k.en) + "</bdi>" +
          '<span class="mk-r"><bdi>' + esc(k.rocket) + "</bdi></span></div>";
      }).join("") + "</div></div></details>";
    }

    var alt = LANG === "fa" ? m.en_d : m.fa_d;
    if (alt) {
      h += '<details class="acc"><summary>▸ ' + t("en_desc") + '</summary><div class="in"><div class="d-desc en"><bdi>' +
        esc(alt) + "</bdi></div></div></details>";
    }
    if (m.vid) {
      h += '<a class="ghost-btn watch" href="' + esc(m.vid) + '" target="_blank" rel="noopener noreferrer">' +
        t("watch_live") + "</a>";
    }
    h += '<button class="ghost-btn go-map" data-site="' + esc(m.site) + '">' + t("show_map") + "</button>";
    return h + "</div></div>";
  }

  /* ================= live launch feed (last 90 days) ================= */
  /* Recent launches are pulled from The Space Devs, translated into Persian
     wherever the vocabulary is finite, cached locally so the app still works
     offline, and merged into the curated mission list. */

  var LIVE = [], LIVE_TS = 0;
  var LIVE_TTL = 6 * 3600 * 1000;              // refresh at most every 6 hours
  var LIVE_DAYS = 90;

  /* --- finite vocabularies get proper Persian --- */
  var MTYPE_FA = {
    "Communications": ["مخابراتی", "communications"],
    "Earth Science": ["علوم زمین", "earth-observation"],
    "Earth Observation": ["سنجش از دور", "earth-observation"],
    "Planetary Science": ["علوم سیاره‌ای", "planetary"],
    "Astrophysics": ["اخترفیزیک", "astrophysics"],
    "Heliophysics": ["فیزیک خورشید", "heliophysics"],
    "Human Exploration": ["پرواز سرنشین‌دار", "crewed"],
    "Resupply": ["باربری و تدارکات", "cargo"],
    "Test Flight": ["پرواز آزمایشی", "launch-system"],
    "Navigation": ["ناوبری", "navigation"],
    "Tourism": ["گردشگری فضایی", "crewed"],
    "Government/Top Secret": ["دولتی و طبقه‌بندی‌شده", "technology"],
    "Dedicated Rideshare": ["پرتاب اشتراکی", "technology"],
    "Suborbital": ["زیرمداری", "launch-system"],
    "Lunar Exploration": ["کاوش ماه", "lunar"],
    "Robotic Exploration": ["کاوش رباتیک", "deep-space"],
    "Technology": ["نمایش فناوری", "technology"],
    "Micro-gravity": ["پژوهش بی‌وزنی", "technology"]
  };
  var ORBIT_FA = {
    "Low Earth Orbit": "مدار پایین زمین",
    "Sun-Synchronous Orbit": "مدار خورشیدآهنگ",
    "Geostationary Transfer Orbit": "مدار انتقالی زمین‌ثابت",
    "Geosynchronous Orbit": "مدار زمین‌آهنگ",
    "Geostationary Orbit": "مدار زمین‌ثابت",
    "Medium Earth Orbit": "مدار میانی زمین",
    "Highly Elliptical Orbit": "مدار بیضوی کشیده",
    "Polar Orbit": "مدار قطبی",
    "Heliocentric Orbit": "مدار خورشیدمرکز",
    "Lunar Orbit": "مدار ماه",
    "Lunar Transfer Orbit": "مدار انتقالی ماه",
    "Suborbital": "زیرمداری",
    "Elliptical Orbit": "مدار بیضوی",
    "Trans Lunar Injection": "تزریق به مسیر ماه"
  };
  var LSTATUS_FA = {
    "Success": ["موفق", "success"],
    "Failure": ["ناموفق", "failure"],
    "Partial Failure": ["نیمه‌موفق", "partial"],
    "Go": ["برنامه‌ریزی‌شده", "upcoming"],
    "TBC": ["در انتظار تأیید", "upcoming"],
    "TBD": ["زمان نامعین", "upcoming"],
    "In Flight": ["در پرواز", "deployment"]
  };
  var COUNTRY_FA = {
    "United States of America": "ایالات متحده", "China": "چین", "Russia": "روسیه",
    "India": "هند", "Japan": "ژاپن", "France": "فرانسه", "French Guiana": "گویان فرانسه",
    "New Zealand": "نیوزیلند", "Kazakhstan": "قزاقستان", "Iran": "ایران",
    "South Korea": "کره جنوبی", "North Korea": "کره شمالی", "Israel": "اسرائیل",
    "United Kingdom": "بریتانیا", "Norway": "نروژ", "Australia": "استرالیا",
    "Brazil": "برزیل", "Italy": "ایتالیا", "Germany": "آلمان", "Spain": "اسپانیا"
  };
  var MEGA = [
    { re: /starlink/i, id: "mega-starlink", fa: "استارلینک", en: "Starlink" },
    { re: /oneweb/i, id: "mega-oneweb", fa: "وان‌وب", en: "OneWeb" },
    { re: /kuiper/i, id: "mega-kuiper", fa: "کویپر", en: "Kuiper" },
    { re: /qianfan|thousand sails|g60/i, id: "mega-qianfan", fa: "چیان‌فان", en: "Qianfan" },
    { re: /guowang|sat[- ]?net/i, id: "mega-guowang", fa: "گوووانگ", en: "Guowang" }
  ];

  function faOf(map, key, fallback) {
    var v = map[key];
    if (!v) return fallback != null ? fallback : (key || "");
    return typeof v === "string" ? v : v[0];
  }

  /* turn one API launch record into a mission-shaped object */
  function liveToMission(l) {
    var m = l.mission || {}, pad = l.pad || {}, loc = pad.location || {};
    var st = (l.status && l.status.abbrev) || "";
    var stf = LSTATUS_FA[st] || LSTATUS_FA[(l.status && l.status.name) || ""] || ["—", "operational"];
    var ty = m.type || "";
    var tyf = MTYPE_FA[ty] || [ty || "—", "technology"];
    var orb = (m.orbit && m.orbit.name) || "";
    var cty = (loc.country && loc.country.name) || loc.country_code || "";
    var prov = (l.launch_service_provider && l.launch_service_provider.name) || "";
    var rocket = (l.rocket && l.rocket.configuration &&
      (l.rocket.configuration.full_name || l.rocket.configuration.name)) || "";
    var img = (l.image && (l.image.thumbnail_url || l.image.image_url)) || "";
    return {
      id: "live-" + l.id,
      live: 1,                                  // marks an auto-imported row
      en: m.name || l.name || "",
      fa: m.name || l.name || "",               // no curated Persian name available
      op: prov, op_fa: provLabel(prov),
      rocket: rocket,
      orbit: orb, orbit_fa: faOf(ORBIT_FA, orb, orb),
      type: ty, type_fa: tyf[0], type_key: tyf[1],
      site: pad.name || "", pad: pad.name || "",
      loc: loc.name || "", loc_fa: faOf(COUNTRY_FA, cty, cty),
      lat: pad.latitude != null ? +pad.latitude : null,
      lon: pad.longitude != null ? +pad.longitude : null,
      status: stf[1], status_raw: st,
      date: (l.net || "").slice(0, 10),
      cost: "",
      en_d: m.description || "",
      fa_d: "",                                 // deliberately empty: no machine Persian
      img: img,
      vid: (function () {
        var v = l.vidURLs || [];
        for (var i = 0; i < v.length; i++) if (v[i] && v[i].url) return v[i].url;
        return "";
      })()
    };
  }

  /* collapse repeated mega-constellation payloads into one expandable row */
  function foldMega(list) {
    var out = [], bucket = {};
    list.forEach(function (m) {
      var hit = null;
      for (var i = 0; i < MEGA.length; i++) {
        if (MEGA[i].re.test(m.en) || MEGA[i].re.test(m.fa)) { hit = MEGA[i]; break; }
      }
      if (!hit) { out.push(m); return; }
      if (!bucket[hit.id]) {
        bucket[hit.id] = {
          id: hit.id, live: 1, mega: 1, kids: [],
          en: hit.en, fa: hit.fa,
          op: m.op, op_fa: m.op_fa, rocket: m.rocket,
          orbit: m.orbit, orbit_fa: m.orbit_fa,
          type: m.type, type_fa: m.type_fa, type_key: m.type_key,
          site: m.site, pad: m.pad, loc: m.loc, loc_fa: m.loc_fa,
          lat: m.lat, lon: m.lon,
          status: "operational", date: m.date,
          cost: "", en_d: m.en_d, fa_d: "", img: m.img, vid: ""
        };
        out.push(bucket[hit.id]);
      }
      var g = bucket[hit.id];
      g.kids.push(m);
      if (m.date > g.date) { g.date = m.date; g.img = g.img || m.img; }
    });
    return out;
  }

  function cacheLive(rows) {
    try {
      localStorage.setItem("orbita_live", JSON.stringify({ ts: Date.now(), rows: rows }));
    } catch (e) { /* quota: caching is best-effort */ }
  }
  function readLiveCache() {
    try {
      var c = JSON.parse(localStorage.getItem("orbita_live") || "null");
      if (c && c.rows && Array.isArray(c.rows)) { LIVE_TS = c.ts || 0; return c.rows; }
    } catch (e) {}
    return null;
  }

  function loadLiveLaunches(force) {
    var cached = readLiveCache();
    if (cached && !force && (Date.now() - LIVE_TS) < LIVE_TTL) {
      LIVE = cached; buildFilters(); renderMissions(); return;
    }
    if (cached) { LIVE = cached; renderMissions(); }        // show stale data immediately
    var since = new Date(Date.now() - LIVE_DAYS * 86400000).toISOString().slice(0, 10);
    fetch("https://ll.thespacedevs.com/2.3.0/launches/previous/?limit=100&mode=detailed&net__gte=" + since)
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) {
        var rows = (d.results || []).map(liveToMission).filter(function (m) { return m.date; });
        if (!rows.length) return;
        LIVE = rows; LIVE_TS = Date.now();
        cacheLive(rows);
        buildFilters(); renderMissions();
      })
      .catch(function () { /* offline or throttled: keep whatever we have */ });
  }

  /* curated projects + folded live rows, newest first */
  function allMissions() {
    var live = foldMega(LIVE);
    /* a curated entry always wins over an auto row for the same mission */
    var seen = {};
    DATA.missions.forEach(function (m) { seen[String(m.en || "").toLowerCase()] = 1; });
    live = live.filter(function (m) { return !seen[String(m.en || "").toLowerCase()]; });
    return DATA.missions.concat(live);
  }

  function renderMissions() {
    var q = (($("#mSearch")||{}).value || "").trim().toLowerCase();
    var st = ($("#fStatus")||{}).value || "", ob = ($("#fOrbit")||{}).value || "", ty = ($("#fType")||{}).value || "";
    var list = allMissions().filter(function (m) {
      if (st && m.status !== st) return false;
      if (ob && orbitInfo(m.orbit).k !== ob) return false;
      if (ty && (m.type_key || m.type) !== ty) return false;
      if (!q) return true;
      return [m.en, m.fa, m.op, m.op_fa, m.rocket, m.orbit, m.orbit_fa, m.site, m.loc, m.loc_fa, m.en_d, m.fa_d]
        .join(" ").toLowerCase().indexOf(q) > -1;
    });
    list = sortMissions(list);
    $("#mCount").textContent = list.length;
    $("#missionRows").innerHTML = list.map(rowHTML).join("") || '<div class="up-empty">' + t("no_res") + "</div>";
    $$("#missionRows .mrow").forEach(function (row) {
      row.querySelector(".mrow-grid").onclick = function () {
        var m = list.find(function (x) { return x.id === row.dataset.id; });
        if (!m) return;
        var body = row.querySelector(".m-detail");
        if (!row.classList.contains("open") && !body.innerHTML) body.innerHTML = detailHTML(m);
        row.classList.toggle("open");
        var go = body.querySelector(".go-map");
        if (go) go.onclick = function (e) {
          e.stopPropagation();
          /* auto rows carry their own pad coordinates */
          if (m.live && m.lat != null && m.lon != null) {
            goToPad({ name: m.pad || m.site, loc: m.loc, lat: m.lat, lon: m.lon });
            return;
          }
          var s = DATA.sites.find(function (x) { return (m.site || "").toLowerCase().indexOf(x.en.split(" –")[0].split(" (")[0].toLowerCase()) > -1; });
          $$(".tab")[0].click();
          if (s && map) { map.flyTo({ center: [s.lon, s.lat], zoom: 8, duration: 1400 }); openDetail({ kind: "site", cat: "site", o: s }); }
        };
      };
    });
  }
  ["mSearch", "fStatus", "fOrbit", "fType"].forEach(function (id) {
    on("#" + id, "input", renderMissions); on("#" + id, "change", renderMissions);
  });
  on("#fSort", "change", function () { SORT = this.value; renderMissions(); });
  on("#upRefresh", "click", function () { loadUpcoming(); loadLiveLaunches(true); renderMissions(); });

  /* ================= live upcoming launches ================= */
  var UPCOMING = [];

  /* jump to a launch pad on the world map; falls back to the nearest known site */
  function goToPad(pad) {
    if (!pad || pad.lat == null || pad.lon == null) return false;
    $$(".tab")[0].click();
    setTimeout(function () {
      if (!map) return;
      map.resize();
      map.flyTo({ center: [pad.lon, pad.lat], zoom: 9, duration: 1500 });
      /* Match a documented site only when we are confident: the pad designator
         (e.g. "SLC-4E") must agree, otherwise a neighbouring pad a few km away
         would be shown instead of the real one. */
      var padCode = String(pad.name || "").toUpperCase().replace(/[\s_]/g, "");
      var best = null, bestD = 1e9, exact = null;
      DATA.sites.forEach(function (s) {
        var dx = s.lon - pad.lon, dy = s.lat - pad.lat, d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = s; }
        var sc = String(s.pads || s.en || "").toUpperCase().replace(/[\s_]/g, "");
        if (padCode && sc && (sc.indexOf(padCode) > -1 || padCode.indexOf(sc) > -1) && d < 0.09) exact = s;
      });
      if (exact) {
        openDetail({ kind: "site", cat: "site", o: exact });
      } else if (best && bestD < 0.0004) {        // ~2 km: same pad, different naming
        openDetail({ kind: "site", cat: "site", o: best });
      } else {
        new maplibregl.Popup({ closeButton: true, offset: 12 })
          .setLngLat([pad.lon, pad.lat])
          .setHTML('<b style="font-size:12.5px"><bdi>' + esc(pad.name || "") + "</bdi></b><br>" +
                   '<span style="font-size:11px;opacity:.75"><bdi>' + esc(pad.loc || "") + "</bdi></span>")
          .addTo(map);
      }
    }, 120);
    return true;
  }

  function loadUpcoming() {
    var box = $("#upList");
    box.innerHTML = '<div class="up-empty">' + t("up_loading") + "</div>";
    fetch("https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=12&mode=detailed")
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) {
        var res = d.results || []; if (!res.length) throw 0;
        UPCOMING = res.map(function (l) {
          var pad = l.pad || {};
          var loc = pad.location || {};
          return {
            name: l.name || "",
            prov: (l.launch_service_provider && l.launch_service_provider.name) || "",
            net: l.net ? new Date(l.net).getTime() : null,
            exact: precRank(l.net_precision) >= 3,
            pad: (pad.latitude != null && pad.longitude != null) ? {
              name: pad.name || "", loc: loc.name || "",
              lat: +pad.latitude, lon: +pad.longitude
            } : null
          };
        });
        box.innerHTML = UPCOMING.map(function (l, i) {
          var when = l.net ? new Date(l.net) : null;
          var cd = l.net ? cdText(l.net - Date.now(), false) : "";
          return '<div class="up-card' + (l.pad ? " has-pad" : "") + '" data-i="' + i + '">' +
            "<b><bdi>" + esc(l.name) + "</bdi></b>" +
            "<span><bdi>" + esc(provLabel(l.prov)) + "</bdi></span>" +
            "<span>" + esc(when ? when.toISOString().slice(0, 16).replace("T", " ") + " UTC" : "TBD") + "</span>" +
            '<div class="cd">' + esc(cd) + "</div>" +
            (l.pad ? '<div class="up-pad"><svg viewBox="0 0 24 24" width="11" height="11"><path fill="currentColor" d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/></svg>' +
              "<bdi>" + esc(l.pad.loc || l.pad.name) + "</bdi></div>" : "") +
            "</div>";
        }).join("");
        $$("#upList .up-card.has-pad").forEach(function (el) {
          el.onclick = function () { goToPad(UPCOMING[+el.dataset.i].pad); };
        });
      })
      .catch(function () { box.innerHTML = '<div class="up-empty">' + t("up_err") + "</div>"; });
  }

  /* ================= next-launch ticker ================= */
  /* Countdown honours the API's net_precision: a to-the-second clock is only
     shown when the launch time is actually known to that resolution. */
  var LNCH = null, lnchTmr = 0;

  /* provider names from the API can be very long; show a compact known label */
  var PROV_SHORT = {
    "China Aerospace Science and Technology Corporation": ["ساسک چین", "CASC"],
    "National Aeronautics and Space Administration": ["ناسا", "NASA"],
    "European Space Agency": ["سازمان فضایی اروپا", "ESA"],
    "Indian Space Research Organization": ["ایسرو", "ISRO"],
    "Japan Aerospace Exploration Agency": ["جاکسا", "JAXA"],
    "Russian Federal Space Agency (ROSCOSMOS)": ["روس‌کاسموس", "Roscosmos"],
    "United Launch Alliance": ["یونایتد لانچ الاینس", "ULA"],
    "Arianespace": ["آریان‌اسپیس", "Arianespace"],
    "Rocket Lab": ["راکت لب", "Rocket Lab"],
    "SpaceX": ["اسپیس‌ایکس", "SpaceX"],
    "Blue Origin": ["بلو اوریجین", "Blue Origin"],
    "Northrop Grumman": ["نورثروپ گرومن", "Northrop Grumman"],
    "Firefly Aerospace": ["فایرفلای", "Firefly"],
    "Galactic Energy": ["گلکتیک انرژی", "Galactic Energy"],
    "LandSpace": ["لند‌اسپیس", "LandSpace"],
    "iSpace": ["آی‌اسپیس", "iSpace"],
    "ExPace": ["اکس‌پیس", "ExPace"]
  };
  function provLabel(n) {
    var s = PROV_SHORT[n];
    if (s) return LANG === "fa" ? s[0] : s[1];
    return n && n.length > 34 ? n.slice(0, 32) + "…" : (n || "");
  }

  function precRank(p) {
    var n = ((p && p.name) || "").toLowerCase();
    if (n.indexOf("second") > -1) return 4;
    if (n.indexOf("minute") > -1) return 3;
    if (n.indexOf("hour") > -1) return 2;
    if (n.indexOf("day") > -1) return 1;
    return 0;                                   // week / month / quarter / year
  }

  function cdText(ms, exact) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600),
        m = Math.floor(s % 3600 / 60), sec = s % 60;
    function two(x) { return fmtNum(String(x).padStart(2, "0")); }
    if (!exact) {
      if (d > 0) return (LANG === "fa" ? "حدود " + fmtNum(d) + " روز دیگر" : "in ~" + d + " days");
      if (h > 0) return (LANG === "fa" ? "حدود " + fmtNum(h) + " ساعت دیگر" : "in ~" + h + " hours");
      return LANG === "fa" ? "به‌زودی" : "soon";
    }
    if (d > 0) return fmtNum(d) + (LANG === "fa" ? " روز " : "d ") + two(h) + ":" + two(m) + ":" + two(sec);
    return two(h) + ":" + two(m) + ":" + two(sec);
  }

  function paintLnch() {
    if (!LNCH) return;
    var bar = $("#lnchBar"); if (!bar) return;
    var left = LNCH.net - Date.now();
    var el = $("#lnchCd"); if (!el) return;
    if (left <= 0) {
      el.textContent = LANG === "fa" ? "در حال پرتاب" : "lifting off";
      el.classList.add("approx");
      return;
    }
    el.textContent = cdText(left, LNCH.exact);
    el.classList.toggle("approx", !LNCH.exact);
    var pv = $("#lnchProv"); if (pv) pv.textContent = provLabel(LNCH.prov);
  }

  function showLnch(l) {
    LNCH = l;
    var bar = $("#lnchBar"); if (!bar) return;
    $("#lnchName").textContent = l.name;
    $("#lnchProv").textContent = provLabel(l.prov);
    var live = $("#lnchLive");
    if (l.video) { live.href = l.video; live.hidden = false; } else { live.hidden = true; }
    var nm = $("#lnchName");
    if (nm) {
      nm.classList.toggle("clickable", !!l.pad);
      nm.title = l.pad ? (LANG === "fa" ? "نمایش پایگاه پرتاب روی نقشه" : "Show launch pad on the map") : "";
      nm.onclick = l.pad ? function () { goToPad(l.pad); } : null;
    }
    bar.hidden = false;
    document.body.classList.add("has-lnch");
    paintLnch();
    clearInterval(lnchTmr);
    lnchTmr = setInterval(paintLnch, 1000);
    if (map) setTimeout(function () { map.resize(); }, 60);
    window.dispatchEvent(new Event("resize"));
  }

  function loadNextLaunch() {
    if (localStorage.getItem("orbita_lnch_off") === "1") return;
    fetch("https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=6&mode=detailed")
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) {
        var now = Date.now();
        var res = (d.results || []).filter(function (l) {
          return l.net && new Date(l.net).getTime() > now - 3600000;
        });
        if (!res.length) return;
        var l = res[0];
        var vids = l.vidURLs || [];
        var vid = null;
        for (var i = 0; i < vids.length; i++) {
          if (vids[i] && vids[i].url) { vid = vids[i].url; break; }
        }
        var pad = l.pad || {}, ploc = pad.location || {};
        showLnch({
          name: l.name || "",
          prov: (l.launch_service_provider && l.launch_service_provider.name) || "",
          net: new Date(l.net).getTime(),
          exact: precRank(l.net_precision) >= 3,          // minute-or-better only
          video: vid,
          pad: (pad.latitude != null && pad.longitude != null) ? {
            name: pad.name || "", loc: ploc.name || "",
            lat: +pad.latitude, lon: +pad.longitude
          } : null
        });
      })
      .catch(function () { /* offline: ticker simply stays hidden */ });
  }

  on("#lnchClose", "click", function () {
    clearInterval(lnchTmr);
    $("#lnchBar").hidden = true;
    document.body.classList.remove("has-lnch");
    localStorage.setItem("orbita_lnch_off", "1");
    if (map) setTimeout(function () { map.resize(); }, 60);
    window.dispatchEvent(new Event("resize"));
  });

  window.addEventListener("error", function (e) {
    var el = $("#mapStatus");
    if (el && el.style.display !== "none") {
      el.style.display = "block";
      el.innerHTML = "خطای اجرا / Runtime error:<br><span style='font-size:11px;direction:ltr;display:block'>" +
        esc(e.message || "") + "</span><br><span style='font-size:11px'>لطفاً صفحه را با Ctrl+F5 رفرش کنید</span>";
    }
  });


  /* ================= orbit (3D) view ================= */
  var orbBooted = false;

  function syncDensityUI() {
    if (!window.ORBITA3D || !ORBITA3D.ready()) return;
    var lvl = ORBITA3D.filters.density, dc = ORBITA3D.densityCounts();
    $$("#densitySeg .seg-b").forEach(function (b) {
      var n = +b.dataset.density;
      b.classList.toggle("active", n === lvl);
      var badge = b.querySelector(".seg-n");
      if (badge) badge.textContent = fmtNum(dc[n] || 0);
    });
  }

  /* ================= pass prediction UI ================= */
  var CITIES = [], SITE = null, passTmr = 0;

  function loadCities() {
    if (CITIES.length) return Promise.resolve(CITIES);
    return fetch("data/cities.json?v=1").then(function (r) { return r.json(); })
      .then(function (d) { CITIES = d; return d; }).catch(function () { return []; });
  }

  function compass(deg) {
    var k = ["n_n", "n_ne", "n_e", "n_se", "n_s", "n_sw", "n_w", "n_nw"];
    return t(k[Math.round(((deg % 360) + 360) % 360 / 45) % 8]);
  }
  function dayLabel(ms) {
    var d = new Date(ms), n = new Date();
    var a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var b = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    var diff = Math.round((a - b) / 86400000);
    if (diff === 0) return t("today");
    if (diff === 1) return t("tomorrow");
    return d.toLocaleDateString(LANG === "fa" ? "fa-IR" : "en-GB", { day: "numeric", month: "short" });
  }
  function clockOf(ms) {
    var d = new Date(ms);
    var s = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    return LANG === "fa" ? s.replace(/[0-9]/g, function (c) { return "۰۱۲۳۴۵۶۷۸۹"[+c]; }) : s;
  }
  function durText(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m ? fmtNum(m) + " " + t("p_min") + (s ? " " + fmtNum(s) + " " + t("p_sec") : "")
             : fmtNum(s) + " " + t("p_sec");
  }

  function renderCityList(q) {
    var box = $("#cityList");
    if (!box) return;
    q = (q || "").trim().toLowerCase();
    var hits = CITIES.filter(function (c) {
      if (!q) return false;
      return c[0].indexOf(q) > -1 || c[1].toLowerCase().indexOf(q) > -1 ||
             c[2].indexOf(q) > -1 || c[3].toLowerCase().indexOf(q) > -1;
    }).slice(0, 40);
    if (!hits.length) { box.classList.remove("open"); box.innerHTML = ""; return; }
    box.innerHTML = hits.map(function (c, i) {
      return '<div class="ci" data-i="' + CITIES.indexOf(c) + '"><b>' + esc(LANG === "fa" ? c[0] : c[1]) +
        "</b><small>" + esc(LANG === "fa" ? c[2] : c[3]) + "</small></div>";
    }).join("");
    box.classList.add("open");
    $$("#cityList .ci").forEach(function (el) {
      el.onclick = function () {
        var c = CITIES[+el.dataset.i];
        SITE = { name: LANG === "fa" ? c[0] : c[1], lat: c[4], lon: c[5], alt: (c[6] || 0) / 1000 };
        $("#cityInput").value = SITE.name;
        box.classList.remove("open");
        runPasses();
      };
    });
  }

  function renderPasses(list, total) {
    var box = $("#passBody");
    if (!box) return;
    var onlyVis = $("#tgVisible").checked;
    if (!list.length) {
      box.innerHTML = '<div class="pass-empty">' + t(onlyVis ? "pass_none_vis" : "pass_none") + "</div>";
      return;
    }
    var h = list.slice(0, 60).map(function (p, i) {
      var col = "#" + (ORBITA3D.classColors[p.cls] || 0xffffff).toString(16).padStart(6, "0");
      var w = Math.max(6, Math.min(100, Math.round(p.maxEl / 90 * 100)));
      return '<div class="pcard" data-id="' + p.id + '" style="--pc:' + col + '">' +
        '<div class="p1"><b><bdi>' + esc(LANG === "fa" ? p.fa : p.en) + "</bdi></b>" +
        (p.visible ? '<span class="eye">' + t("eye") + "</span>" : "") + "</div>" +
        '<div class="p2">' +
        "<span>" + dayLabel(p.rise) + " <b>" + clockOf(p.rise) + "</b></span>" +
        "<span>" + t("p_dur") + " <b>" + durText(p.dur) + "</b></span>" +
        "<span>" + t("p_max") + " <b>" + fmtNum(Math.round(p.maxEl)) + "°</b></span>" +
        "<span>" + compass(p.azRise) + " ← " + compass(p.azSet) + "</span>" +
        "<span>" + t("p_rng") + " <b>" + fmtNum(Math.round(p.range)) + (LANG === "fa" ? " کیلومتر" : " km") + "</b></span>" +
        '</div><div class="bar"><i style="width:' + w + '%"></i></div></div>';
    }).join("");
    h += '<div class="pass-note">' + t("pass_note") + "</div>";
    box.innerHTML = h;
    $$("#passBody .pcard").forEach(function (el) {
      el.onclick = function () { ORBITA3D.selectById(+el.dataset.id); };
    });
    var w = $("#passWhere");
    if (w) {
      w.innerHTML = "<b>" + fmtNum(list.length) + "</b> " + t("pass_found") +
        " · " + t("pass_of") + " <b>" + fmtNum(ORBITA3D.featuredCount()) + "</b> " + t("pass_sats");
    }
  }

  function runPasses() {
    if (!SITE || !window.ORBITA3D || !ORBITA3D.ready()) return;
    var box = $("#passBody");
    box.innerHTML = '<div class="pass-empty">' + t("pass_calc") + "</div>";
    var where = $("#passWhere");
    if (where) {
      where.innerHTML = "<b>" + esc(SITE.name) + "</b> · " +
        fmtNum(Math.abs(SITE.lat).toFixed(2)) + "° " + (SITE.lat >= 0 ? t("n_n") : t("n_s")) + " · " +
        fmtNum(Math.abs(SITE.lon).toFixed(2)) + "° " + (SITE.lon >= 0 ? t("n_e") : t("n_w"));
    }
    clearTimeout(passTmr);
    passTmr = setTimeout(function () {
      var hours = +($("#passHours") || {}).value || 24;
      var all;
      try {
        all = ORBITA3D.predictPasses({ lat: SITE.lat, lon: SITE.lon, alt: SITE.alt || 0, hours: hours, minEl: 10 });
      } catch (e) { all = []; }
      var onlyVis = $("#tgVisible").checked;
      renderPasses(onlyVis ? all.filter(function (p) { return p.visible; }) : all, all.length);
    }, 40);
  }

  function initPassUI() {
    loadCities();
    on("#passBtn", "click", function () {
      var pn = $("#passPanel");
      var open = pn.classList.toggle("open");
      $("#passBtn").classList.toggle("on", open);
      if (open) { loadCities().then(function () { $("#cityInput").focus(); }); }
    });
    on("#passClose", "click", function () {
      $("#passPanel").classList.remove("open");
      $("#passBtn").classList.remove("on");
    });
    var ci = $("#cityInput"), ctm = 0;
    if (ci) {
      ci.oninput = function () {
        clearTimeout(ctm);
        var v = ci.value;
        ctm = setTimeout(function () { loadCities().then(function () { renderCityList(v); }); }, 130);
      };
      ci.onblur = function () { setTimeout(function () { $("#cityList").classList.remove("open"); }, 180); };
    }
    on("#geoBtn", "click", function () {
      if (!navigator.geolocation) { alert(t("geo_err")); return; }
      navigator.geolocation.getCurrentPosition(function (pos) {
        SITE = { name: t("my_loc"), lat: pos.coords.latitude, lon: pos.coords.longitude,
                 alt: (pos.coords.altitude || 0) / 1000 };
        $("#cityInput").value = SITE.name;
        runPasses();
      }, function () { alert(t("geo_err")); }, { timeout: 8000, maximumAge: 600000 });
    });
    on("#tgVisible", "change", runPasses);
    on("#passHours", "change", runPasses);
  }

  function buildOrbLegend() {
    var box = $("#orbLegend");
    if (!box || !window.ORBITA3D || !ORBITA3D.ready()) return;
    var st = ORBITA3D.stats(), keys = ["leo", "sso", "meo", "geo", "heo"], h = "";
    keys.forEach(function (k) {
      var col = "#" + ORBITA3D.classColors[k].toString(16).padStart(6, "0");
      var nm = LANG === "fa" ? ORBITA3D.classFa[k] : ORBITA3D.classEn[k];
      var off = ORBITA3D.filters.cls[k] ? "" : " off";
      h += '<div class="lg-row' + off + '" data-cls="' + k + '">' +
        '<i class="lg-dot" style="background:' + col + ';color:' + col + '"></i>' +
        "<span>" + nm + "</span><span class=\"lg-n\">" + fmtNum(st[k] || 0) + "</span></div>";
    });
    box.innerHTML = h;
    $$("#orbLegend .lg-row").forEach(function (r) {
      r.onclick = function () {
        var k = r.dataset.cls;
        ORBITA3D.filters.cls[k] = !ORBITA3D.filters.cls[k];
        r.classList.toggle("off", !ORBITA3D.filters.cls[k]);
        ORBITA3D.applyFilters();
      };
    });
  }

  function fmtNum(n) { return Number(n).toLocaleString(LANG === "fa" ? "fa-IR" : "en-US"); }

  function bootOrbit() {
    if (orbBooted) { ORBITA3D.start(); setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 60); return; }
    orbBooted = true;
    if (typeof THREE === "undefined" || typeof satellite === "undefined") {
      $("#globeLoading").innerHTML = "<span>کتابخانهٔ سه‌بعدی بارگذاری نشد / 3D library failed to load</span>";
      return;
    }
    ORBITA3D.start();
    Promise.all([
      fetch("data/sats.json?v=1").then(function (r) { return r.json(); }),
      fetch("data/sat_featured.json?v=2").then(function (r) { return r.json(); })
    ]).then(function (res) {
      ORBITA3D.load(res[0], res[1]);
      buildOrbLegend();
      syncDensityUI();
      $("#globeLoading").classList.add("hidden");
    }).catch(function (e) {
      $("#globeLoading").innerHTML = "<span>خطا در بارگذاری دادهٔ ماهواره‌ها: " + esc(String(e)) + "</span>";
    });

    var si = $("#satSearch"), tmr = 0;
    if (si) si.oninput = function () { clearTimeout(tmr); tmr = setTimeout(function () { ORBITA3D.applyFilters(); }, 220); };
    $$("#densitySeg .seg-b").forEach(function (b) {
      b.onclick = function () {
        ORBITA3D.setDensity(+b.dataset.density);
        syncDensityUI();
        buildOrbLegend();
      };
    });
    ORBITA3D.onDensityChange = function () { syncDensityUI(); buildOrbLegend(); };
    initPassUI();
    on("#satClose", "click", function () { ORBITA3D.clearSelection(); });
  }

  /* ================= boot ================= */
  applyI18n();
  Promise.all([
    fetch("data/companies.json?v=4").then(function (r) { return r.json(); }),
    fetch("data/sites.json?v=4").then(function (r) { return r.json(); }),
    fetch("data/missions.json?v=4").then(function (r) { return r.json(); })
  ]).then(function (res) {
    DATA.companies = res[0]; DATA.sites = res[1]; DATA.missions = res[2];
    initMap(); buildLayerBar(); renderList(); buildFilters(); renderMissions(); loadUpcoming(); loadNextLaunch(); loadLiveLaunches();
  }).catch(function (e) {
    var el = $("#mapStatus");
    if (el) { el.style.display = "block"; el.textContent = "خطا در بارگذاری داده‌ها / Data load error: " + e; }
  });
})();
