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
      cat_site: "پایگاه‌های پرتاب", cat_recovery: "فرود و بازیابی", results: "نتایج",
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
      toggle_theme: "تغییر پوسته نقشه", style_dark: "پوسته ۱", style_sunny: "پوسته ۲", style_osm: "پوسته ۳",
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
      cat_site: "Launch sites", cat_recovery: "Landing & recovery", results: "Results",
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
      toggle_theme: "Toggle Map Style", style_dark: "Style 1", style_sunny: "Style 2", style_osm: "Style 3",
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
      '<path d="M15 6.2c2.7 2.3 4.1 5.6 4.1 9 0 1.4-.2 2.6-.6 3.8h-7c-.4-1.2-.6-2.4-.6-3.8 0-3.4 1.4-6.7 4.1-9z" fill="#040a12"/>' +
      '<circle cx="15" cy="13.6" r="1.7" fill="' + c + '"/>' +
      '<path d="M10.9 16.6l-2 3.6 2.6-1.1zM19.1 16.6l2 3.6-2.6-1.1z" fill="#040a12"/>' +
      '<path d="M13.4 20.3h3.2l-1.6 3.4z" fill="#040a12" opacity=".85"/></svg>';
  }
  function svgPropulsion(c) { // hexagon pin + engine bell with flame
    return '<svg width="30" height="38" viewBox="0 0 30 38">' +
      '<path d="M15 37L3.2 24.6A14 14 0 1 1 26.8 24.6Z" fill="' + c + '" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/>' +
      '<path d="M12.2 6.6h5.6l1 5.2c.2 1 .7 1.7 1.5 2.4l1.6 1.4c.6.5.4 1.5-.4 1.7l-3 .8h-7l-3-.8c-.8-.2-1-1.2-.4-1.7l1.6-1.4c.8-.7 1.3-1.4 1.5-2.4z" fill="#040a12"/>' +
      '<path d="M15 19.6c1.5 1.6 2.4 3.2 2.4 4.6 0 1.6-1.1 2.7-2.4 2.7s-2.4-1.1-2.4-2.7c0-1.4.9-3 2.4-4.6z" fill="#040a12" opacity=".9"/></svg>';
  }
  function svgAgency(c) { // shield + orbit/globe
    return '<svg width="30" height="38" viewBox="0 0 30 38">' +
      '<path d="M15 37c8.5-4.3 12-9.9 12-17.6V6.6L15 2.2 3 6.6v12.8C3 27.1 6.5 32.7 15 37z" fill="' + c + '" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/>' +
      '<circle cx="15" cy="17" r="5.6" fill="none" stroke="#040a12" stroke-width="1.8"/>' +
      '<path d="M15 11.4c-2.2 2.6-2.2 8.6 0 11.2M9.4 17h11.2" stroke="#040a12" stroke-width="1.4" fill="none"/>' +
      '<ellipse cx="15" cy="17" rx="9" ry="3.3" fill="none" stroke="#040a12" stroke-width="1.6" transform="rotate(-28 15 17)"/></svg>';
  }
  function svgSite(c) { // launch pad: gantry tower + rocket on pad
    return '<svg width="32" height="38" viewBox="0 0 32 38">' +
      '<path d="M16 37L4.5 25.5A16 16 0 1 1 27.5 25.5Z" fill="' + c + '" stroke="#fff" stroke-opacity=".55" stroke-width="1.4" opacity=".18"/>' +
      '<circle cx="16" cy="16" r="13.4" fill="' + c + '" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>' +
      '<path d="M16 6.4c1.9 1.9 2.9 4.4 2.9 7.1 0 2-.4 3.7-1.1 5.2h-3.6c-.7-1.5-1.1-3.2-1.1-5.2 0-2.7 1-5.2 2.9-7.1z" fill="#040a12"/>' +
      '<path d="M9.6 8.6v13.2M22.4 8.6v13.2" stroke="#040a12" stroke-width="1.7" stroke-linecap="round"/>' +
      '<path d="M9.6 11.6h3.4M19 11.6h3.4M9.6 15.4h2.8M19.6 15.4h2.8M9.6 19.2h3.4M19 19.2h3.4" stroke="#040a12" stroke-width="1.2"/>' +
      '<path d="M7.4 23.4h17.2" stroke="#040a12" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M16 37l-3.4-13h6.8z" fill="' + c + '"/></svg>';
  }
  // A new category only; all existing marker artwork and dimensions are untouched.
  C.recovery = "#38bdf8";
  function svgRecovery(c) {
    return '<svg width="30" height="38" viewBox="0 0 30 38" aria-hidden="true">' +
      '<path d="M15 37S28 23 28 14A13 13 0 0 0 2 14C2 23 15 37 15 37Z" fill="' + c + '" stroke="#fff" stroke-opacity=".8" stroke-width="1.4"/>' +
      '<path d="M15 5.5v10.8m-4.4-4.4 4.4 4.4 4.4-4.4" fill="none" stroke="#071827" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="15" cy="22.2" rx="7.2" ry="3.1" fill="none" stroke="#071827" stroke-width="1.8"/>' +
      '<path d="M15 20.4v3.6" stroke="#071827" stroke-width="1.4" stroke-linecap="round"/></svg>';
  }
  function iconFor(cat, status) {
    if (cat === "recovery") return svgRecovery(C.recovery);
    if (cat === "launch") return svgLaunch(C.launch);
    if (cat === "propulsion") return svgPropulsion(C.propulsion);
    if (cat === "agency") return svgAgency(C.agency);
    return svgSite(status === "inactive" ? C.siteOff : status === "under_construction" ? C.siteWip : C.site);
  }

  /* ================= state ================= */
  var DATA = { companies: [], sites: [], missions: [], recoveries: [] };
  window.DATA = DATA;

  var markers = [], map = null;
  var filters = { launch: true, propulsion: true, agency: true, site: true, recovery: false };
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
    updateCitiesBtn();
  }
  on("#langBtn", "click", function () {
    LANG = LANG === "fa" ? "en" : "fa"; localStorage.setItem("orbita_lang", LANG);
    applyI18n(); buildLayerBar(); renderMarkers(); buildLabels(); buildCityLabels(); renderList(); buildFilters(); renderMissions();
    var d = $("#detail"); if (d) d.classList.remove("open");
    if (window.ORBITA3D && ORBITA3D.ready()) {
      buildOrbLegend(); syncDensityUI(); ORBITA3D.clearSelection();
      if (SITE && $("#passPanel") && $("#passPanel").classList.contains("open")) runPasses();
    }
  });
  var MAP_STYLE = localStorage.getItem("orbita_map_style") || (THEME === "light" ? "sunny" : "dark");
  function cycleMapStyle() {
    if (MAP_STYLE === "dark") MAP_STYLE = "sunny";
    else if (MAP_STYLE === "sunny") MAP_STYLE = "osm";
    else MAP_STYLE = "dark";

    THEME = MAP_STYLE === "dark" ? "navy" : "light";
    localStorage.setItem("orbita_map_style", MAP_STYLE);
    localStorage.setItem("orbita_theme", THEME);
    document.documentElement.setAttribute("data-theme", THEME);

    var sc = $("#mapStyleChip");
    if (sc) {
      var lbl = sc.querySelector(".lb");
      if (lbl) lbl.textContent = t("style_" + MAP_STYLE);
    }
    if (map) applyMapStyle();
  }
  on("#themeBtn", "click", cycleMapStyle);
  $$(".tab").forEach(function (b) {
    b.onclick = function () {
      $$(".tab").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      $$(".view").forEach(function (v) { v.classList.remove("active"); });
      $("#view-" + b.dataset.view).classList.add("active");
      if (b.dataset.view === "map" && map) setTimeout(function () { map.resize(); }, 60);
      if (b.dataset.view === "orbit") { 

  bootOrbit(); } else if (window.ORBITA3D) { ORBITA3D.stop(); }
    };
  });

  /* ================= map ================= */
  var BASEMODE = "online";
  localStorage.setItem("orbita_base", "online");

  function offlineStyle() {
    var dark = THEME === "navy";
    return {
      version: 8,
      sources: {
        countries: { type: "geojson", data: "assets/geo/countries.json?_t=" + Date.now() }
      },
      layers: [
        { id: "ocean", type: "background",
          paint: { "background-color": dark ? "#08131f" : "#dbe7f3" } },
        { id: "country-fill", type: "fill", source: "countries",
          paint: { "fill-color": dark ? "#16283d" : "#f7fafc", "fill-opacity": 1 } },
        { id: "country-hover", type: "fill", source: "countries",
          filter: ["==", ["get", "NAME"], ""],
          paint: { "fill-color": dark ? "#183254" : "#e4eefb" } },
        { id: "country-select", type: "fill", source: "countries",
          filter: ["==", ["get", "NAME"], ""],
          paint: { "fill-color": dark ? "#254d75" : "#cbe2f8", "fill-opacity": 0.85 } },
        { id: "country-select-outline", type: "line", source: "countries",
          filter: ["==", ["get", "NAME"], ""],
          paint: { "line-color": dark ? "#00d2ff" : "#0077ff", "line-width": 1.4, "line-opacity": 1 } },
        { id: "country-line", type: "line", source: "countries",
          paint: { "line-color": dark ? "#1e3854" : "#b9c9dc", "line-width": 0.35, "line-opacity": 0.45 } }
      ]
    };
  }

  var ONLINE_DARK_URL = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
  var ONLINE_SUNNY_URL = "assets/geo/jawg_sunny.json";
  var ONLINE_OSM_URL = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

  function onlineStyleUrl() {
    if (MAP_STYLE === "sunny") return ONLINE_SUNNY_URL;
    if (MAP_STYLE === "osm") return ONLINE_OSM_URL;
    return ONLINE_DARK_URL;
  }

  /* ---- one language rule for all labels: English first, local name fallback ---- */
  function localizeStyleLabels(style) {
    (style.layers || []).forEach(function (L) {
      if (!L.layout || L.layout["text-field"] === undefined) return;
      var s = JSON.stringify(L.layout["text-field"]);
      if (s.indexOf("housenumber") > -1) return;
      if (s.indexOf("name") === -1) return;
      L.layout["text-field"] = ["coalesce", ["get", "name_en"], ["get", "name"]];
    });
    return style;
  }
  var STYLE_CACHE = {};
  function fetchOnlineStyle() {
    var url = onlineStyleUrl();
    if (STYLE_CACHE[url]) {
      try { return Promise.resolve(JSON.parse(JSON.stringify(STYLE_CACHE[url]))); }
      catch (e) { return Promise.resolve(url); }
    }
    return fetch(url).then(function (r) { return r.json(); }).then(function (s) {
      var localized = localizeStyleLabels(s);
      STYLE_CACHE[url] = JSON.parse(JSON.stringify(localized));
      return localized;
    }).catch(function () { return url; });
  }
  function afterStyleApply() {
    if (!map) return;
    try { renderMarkers(); buildLabels(); buildCityLabels(); } catch (e) {}
    setTimeout(function () {
      try { renderMarkers(); buildLabels(); buildCityLabels(); } catch (e) {}
    }, 300);
  }
  function applyMapStyle() {
    if (!map) return;
    if (BASEMODE === "offline") {
      try { map.setStyle(offlineStyle(), { diff: false }); } catch (e) { map.setStyle(offlineStyle()); }
      afterStyleApply();
      return;
    }
    fetchOnlineStyle().then(function (st) {
      if (map) {
        try { map.setStyle(st, { diff: false }); } catch (e) { map.setStyle(st); }
        map.once("styledata", afterStyleApply);
        afterStyleApply();
      }
    }).catch(function () {
      if (map) {
        var rawUrl = onlineStyleUrl();
        try { map.setStyle(rawUrl, { diff: false }); } catch (e) { map.setStyle(rawUrl); }
        map.once("styledata", afterStyleApply);
        afterStyleApply();
      }
    });
  }

  /* country name labels rendered as DOM markers (works without remote glyph fonts) */
  var labelMarkers = [], LABELS = null;
  function getCountryAtLngLat(lng, lat) {
    if (!LABELS || !LABELS.features || !LABELS.features.length) return null;
    var best = null, bestDist = 1e9;
    var normLng = ((lng + 180) % 360 + 360) % 360 - 180;

    for (var i = 0; i < LABELS.features.length; i++) {
      var feat = LABELS.features[i];
      var c = feat.geometry.coordinates;
      var dlng = normLng - c[0];
      var dlat = lat - c[1];
      if (dlng > 180) dlng -= 360;
      if (dlng < -180) dlng += 360;
      var dist = dlng * dlng + dlat * dlat;
      if (dist < bestDist) {
        bestDist = dist;
        best = feat;
      }
    }
    if (best && bestDist < 625) {
      return {
        country_en: best.properties.NAME,
        country_fa: best.properties.NAME_FA || best.properties.NAME
      };
    }
    return null;
  }

  function buildLabels() {
    if (!map) return;
    labelMarkers.forEach(function (m) { m.remove(); });
    labelMarkers = [];
    // Country text labels removed per user directive ("نیازی نیست هیچ نام فارسی یا انگلیسی رو کشور ها نوشته شود")
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

  /* space hub city labels rendered as DOM markers */
  var cityMarkers = [], CITIES = null, SHOW_CITIES = localStorage.getItem("orbita_cities") === "true";
  function updateCitiesBtn() {
    var cb = $("#citiesBtnText");
    if (cb) {
      cb.textContent = SHOW_CITIES 
        ? (LANG === "fa" ? "شهرها: روشن" : "Cities: ON")
        : (LANG === "fa" ? "شهرها: خاموش" : "Cities: OFF");
    }
    var btn = $("#citiesBtn");
    if (btn) {
      if (SHOW_CITIES) btn.classList.add("active");
      else btn.classList.remove("active");
    }
  }

  function buildCityLabels() {
    if (!map) return;
    cityMarkers.forEach(function (m) { m.remove(); });
    cityMarkers = [];
    updateCitiesBtn();
    if (!CITIES || !SHOW_CITIES || BASEMODE === "online") return;
    CITIES.features.forEach(function (f) {
      var el = document.createElement("div");
      el.className = "city-label r" + (f.properties.RANK || 2);
      var cname = LANG === "fa" ? (f.properties.NAME_FA || f.properties.NAME) : f.properties.NAME;
      var hubInfo = f.properties.HUB ? (" · " + f.properties.HUB) : "";
      el.textContent = cname;
      el.title = cname + hubInfo;
      cityMarkers.push(new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(f.geometry.coordinates).addTo(map));
    });
    zoomCityLabels();
  }

  function zoomCityLabels() {
    if (!map) return;
    var z = map.getZoom();
    cityMarkers.forEach(function (m) {
      var el = m.getElement();
      if (!SHOW_CITIES) {
        el.style.display = "none";
        return;
      }
      var rank = +(el.className.match(/r(\d+)/) || [0, 2])[1];
      var minZoom = rank === 1 ? 3.2 : (rank === 2 ? 4.2 : 5.0);
      el.style.display = (z >= minZoom) ? "block" : "none";
    });
  }

  function initMap() {
    setTimeout(function() {
      var el = document.getElementById("mapStatus");
      if (el) el.style.display = "none";
    }, 2000);
    if (typeof maplibregl === "undefined") { $("#mapStatus").textContent = "MapLibre failed to load."; return; }
    /* correct Persian/Arabic/Hebrew shaping: load RTL plugin before map creation */
    try {
      if (maplibregl.setRTLTextPlugin) {
        var rtlStatus = (typeof maplibregl.getRTLTextPluginStatus === "function") ? maplibregl.getRTLTextPluginStatus() : "unavailable";
        if (rtlStatus === "unavailable") maplibregl.setRTLTextPlugin("assets/vendor/mapbox-gl-rtl-text.js", null, false);
      }
    } catch (e) {}
    if (BASEMODE === "offline") createMap(offlineStyle());
    else fetchOnlineStyle().then(function (st) { createMap(st); });
  }

  function mobileView() {
    try { return window.matchMedia && window.matchMedia("(max-width: 820px)").matches; }
    catch (e) { return window.innerWidth <= 820; }
  }
  function syncTouchGestures() {
    if (!map) return;
    var mob = mobileView();
    try {
      if (map.touchZoomRotate) {
        if (mob && map.touchZoomRotate.disableRotation) map.touchZoomRotate.disableRotation();
        else if (!mob && map.touchZoomRotate.enableRotation) map.touchZoomRotate.enableRotation();
      }
      if (map.touchPitch) {
        if (mob && map.touchPitch.disable) map.touchPitch.disable();
        else if (!mob && map.touchPitch.enable) map.touchPitch.enable();
      }
    } catch (e) {}
  }
  window.addEventListener("resize", function () { try { syncTouchGestures(); } catch (e) {} });

  function createMap(style) {
    map = new maplibregl.Map({
      container: "map",
      style: style,
      center: [20, 25],
      zoom: 1.9,
      minZoom: 1,
      maxZoom: 20,
      hash: true,
      fadeDuration: 0,
      maxTileCacheSize: 120,
      trackResize: true,
      attributionControl: { compact: true }
    });
    window.map = map;
    /* faster manual zoom: ~2x wheel/trackpad rate, smooth animation preserved */
    try {
      if (map.scrollZoom) {
        if (map.scrollZoom.setWheelZoomRate) map.scrollZoom.setWheelZoomRate(1 / 225);
        if (map.scrollZoom.setZoomRate) map.scrollZoom.setZoomRate(1 / 50);
      }
    } catch (e) {}
    /* mobile only: lock rotation & tilt (desktop keeps them) */
    try { syncTouchGestures(); } catch (e) {}
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    map.addControl(new maplibregl.FullscreenControl(), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.on("load", function () {
      $("#mapStatus").style.display = "none";
      renderMarkers();
      fetch("assets/geo/labels.json?_t=" + Date.now()).then(function (r) { return r.json(); })
        .then(function (d) { LABELS = d; buildLabels(); }).catch(function () {});
      fetch("assets/geo/cities.json?_t=" + Date.now()).then(function (r) { return r.json(); })
        .then(function (d) { CITIES = d; buildCityLabels(); }).catch(function () {});
    });
    map.on("styledata", function () {
      if ($("#mapStatus")) $("#mapStatus").style.display = "none";
      if (markers.length === 0) renderMarkers();
    });
    var rafZoom = null;
    map.on("zoom", function () {
      if (rafZoom) cancelAnimationFrame(rafZoom);
      rafZoom = requestAnimationFrame(function () {
        zoomLabels();
        zoomCityLabels();
      });
    });
    var rafMove = null;
    map.on("move", function () {
      if (rafMove) cancelAnimationFrame(rafMove);
      rafMove = requestAnimationFrame(function () {
        var c = map.getCenter();
        $("#coords").textContent = c.lat.toFixed(2) + ", " + c.lng.toFixed(2) + " · z" + map.getZoom().toFixed(1);
      });
    });
    map.on("error", function (e) { 
      console.warn("map:", (e && e.error && e.error.message) || e);
      var statusEl = document.getElementById("mapStatus");
      if (statusEl) statusEl.style.display = "none";
    });

    // country hover & click highlight (offline style only)
    map.on("mousemove", function (e) {
      if (BASEMODE !== "offline" || !map.getLayer("country-hover")) return;
      var f = map.queryRenderedFeatures(e.point, { layers: ["country-fill"] })[0];
      map.setFilter("country-hover", ["==", ["get", "NAME"], f ? f.properties.NAME : ""]);
    });

    map.on("click", function (e) {
      var cNameEn = null, cNameFa = null;
      try {
        if (map.getLayer("country-fill")) {
          var f = map.queryRenderedFeatures(e.point, { layers: ["country-fill"] })[0];
          if (f && f.properties && f.properties.NAME) {
            cNameEn = f.properties.NAME;
            cNameFa = f.properties.NAME_FA || f.properties.NAME;
          }
        }
      } catch (err) {}

      if (!cNameEn && e.lngLat) {
        var spatialMatch = getCountryAtLngLat(e.lngLat.lng, e.lngLat.lat);
        if (spatialMatch) {
          cNameEn = spatialMatch.country_en;
          cNameFa = spatialMatch.country_fa;
        }
      }

      if (cNameEn) {
        openDetail({ kind: "country", cat: "country", country_en: cNameEn, country_fa: cNameFa });
      }

      if (BASEMODE !== "offline" || !map.getLayer("country-select")) return;
      map.setFilter("country-select", ["==", ["get", "NAME"], cNameEn || ""]);
      map.setFilter("country-select-outline", ["==", ["get", "NAME"], cNameEn || ""]);
    });
  }

  on("#citiesBtn", "click", function () {
    SHOW_CITIES = !SHOW_CITIES;
    localStorage.setItem("orbita_cities", SHOW_CITIES ? "true" : "false");
    buildCityLabels();
  });

  on("#baseBtn", "click", function () {
    BASEMODE = BASEMODE === "offline" ? "online" : "offline";
    localStorage.setItem("orbita_base", BASEMODE);
    var bb = $("#baseBtn"); if (bb) bb.querySelector("span").textContent = t(BASEMODE === "offline" ? "base_offline" : "base_online");
    if (map) applyMapStyle();
  });

  function allPoints() {
    var p = [];
    DATA.companies.forEach(function (c) { p.push({ kind: "company", cat: c.cat, o: c }); });
    DATA.sites.forEach(function (s) { p.push({ kind: "site", cat: "site", o: s }); });
    DATA.recoveries.forEach(function (s) { p.push({ kind: "recovery", cat: "recovery", o: s }); });
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
      { k: "site", n: DATA.sites.length },
      { k: "recovery", n: DATA.recoveries.length }
    ];
    var html = cats.map(function (c) {
      if (c.k === "recovery") {
        return '<button type="button" class="lchip cat-chip recovery-chip' + (filters.recovery ? '' : ' off') +
          '" data-cat="recovery" aria-pressed="' + filters.recovery + '" aria-label="' + t("cat_recovery") + '" title="' + t("cat_recovery") + '"' +
          (c.n ? '' : ' disabled') + ' style="color:' + C.recovery + '">' +
          '<span class="ic">' + svgRecovery(C.recovery).replace('width="30"', 'width="18"').replace('height="38"', 'height="23"') + '</span>' +
          '<span class="lb">' + t("cat_recovery") + '</span><span class="n">' + fmtNum(c.n) + '</span></button>';
      }
      return '<div class="lchip cat-chip' + (filters[c.k] ? "" : " off") + '" title="' + t("cat_" + c.k) + '" data-cat="' + c.k + '" style="color:' + C[c.k === "site" ? "site" : c.k] + '">' +
        '<span class="ic">' + iconFor(c.k, "active").replace(/width="3\d"/, 'width="18"').replace(/height="38"/, 'height="23"') + "</span>" +
        '<span class="lb" style="color:var(--text)">' + t("cat_" + c.k) + '</span><span class="n">' + c.n + "</span></div>";
    }).join("");
    html += '<span class="chip-sep" aria-hidden="true"></span>';
    html += '<button type="button" class="lchip style-chip" id="mapStyleChip" title="' + t("toggle_theme") + '">' +
      '<span class="lb" style="color:var(--text)">' + t("style_" + MAP_STYLE) + '</span></button>';
    $("#layerbar").innerHTML = html;
    
    var scEl = $("#mapStyleChip");
    if (scEl) {
      scEl.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        cycleMapStyle();
      };
    }
    
    $$(".cat-chip").forEach(function (el) {
      el.onclick = function () {
        var k = el.dataset.cat;
        if (!k) return;
        filters[k] = !filters[k];
        el.classList.toggle("off", !filters[k]);
        if (k === "recovery") el.setAttribute("aria-pressed", String(filters[k]));
        clusterMode = null;
        renderMarkers();
        renderList();
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
    if (z >= 4) {
      if (!filters.recovery) return pts.map(function (p) { return { pts: [p] }; });
      // Only the opt-in layer gets a shared selector when it overlaps an existing place.
      // Never displace individual coordinates or alter the old clustering when the layer is off.
      var used = {}, shared = [];
      pts.forEach(function (p, i) {
        if (p.cat !== "recovery" || used[i]) return;
        var origin = map.project([p.o.lon, p.o.lat]), group = { pts: [p] };
        used[i] = true;
        pts.forEach(function (other, j) {
          if (used[j]) return;
          var point = map.project([other.o.lon, other.o.lat]);
          var dx = point.x - origin.x, dy = point.y - origin.y;
          if (dx * dx + dy * dy < 22 * 22) { used[j] = true; group.pts.push(other); }
        });
        shared.push(group);
      });
      pts.forEach(function (p, i) { if (!used[i]) shared.push({ pts: [p] }); });
      return shared;
    }
    var cell = z < 2.5 ? 30 : z < 3.5 ? 24 : 18;                            // screen pixels
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
    el.title = (LANG === "fa" ? "مشاهده فهرست " + n + " مورد در این ناحیه" : "View list of " + n + " items in this area");
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
          openClusterList(g.pts);
        });
      } else {
        var p = g.pts[0];
        el = document.createElement("div");
        el.className = "pin"; el.title = name(p.o);
        if (p.cat === "recovery") {
          el.dataset.recoveryId = p.o.id;
          el.title = name(p.o) + (LANG === "fa" ? " — موقعیت مرجع" : " — reference location");
          el.setAttribute("role", "button"); el.setAttribute("aria-label", el.title); el.tabIndex = 0;
          el.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); el.click(); }
          });
        }
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

  /* ---- cluster list mode: one click on a cluster opens its members as a clean list ---- */
  var clusterMode = null;   /* null = normal results, otherwise { pts: [...] } */
  function openClusterList(pts) {
    clusterMode = { pts: pts.slice() };
    openSide(false);
    renderList();
    var rl = $("#resultList");
    if (rl) rl.scrollTop = 0;
  }
  window.exitClusterList = function () {
    clusterMode = null;
    renderList();
  };

  function renderList() {
    var inCluster = !!clusterMode;
    var pts = inCluster ? clusterMode.pts : filteredPoints();
    $("#resCount").textContent = pts.length;
    var defaultLogoSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%2338bdf8' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%2338bdf8' text-anchor='middle'>🚀</text></svg>";
    var html = "";
    if (inCluster) {
      var n = pts.length;
      var headTxt = LANG === "fa" ? ("فهرست " + n + " مورد در این ناحیه") : ("List of " + n + " items in this area");
      var backTxt = LANG === "fa" ? "بازگشت به همه" : "Back to all";
      html += '<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 10px; margin-bottom:8px; background:rgba(0,210,255,0.08); border:1px solid rgba(0,210,255,0.30); border-radius:8px; font-size:11px; font-weight:bold;">' +
        '<span>📋 ' + esc(headTxt) + '</span>' +
        '<button type="button" class="mini-btn" onclick="exitClusterList()" style="cursor:pointer; white-space:nowrap; width:auto; height:auto; font-size:10px; padding:4px 8px;">↩ ' + esc(backTxt) + '</button>' +
        '</div>';
    }
    html += pts.slice(0, 400).map(function (p, i) {
      var sub = (LANG === "fa" ? (p.o.country_fa || p.o.country) : (p.o.country || p.o.country_fa)) || "";
      var logoSrc = p.o.logo_data || p.o.logo;
      var logoHtml = "";
      if (logoSrc) {
        logoHtml = '<div style="width:26px; height:26px; border-radius:6px; background:#000; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; padding:1px;">' +
          '<img src="' + esc(logoSrc) + '" alt="' + esc(name(p.o)) + '" onerror="this.onerror=null; this.src=\'' + defaultLogoSvg + '\';" style="max-width:100%; max-height:100%; object-fit:contain;" />' +
          '</div>';
      } else {
        var ic = iconFor(p.cat, p.o.status).replace(/width="3\d"/, 'width="17"').replace(/height="38"/, 'height="22"');
        logoHtml = '<span class="ic">' + ic + '</span>';
      }
      return '<div class="res" data-i="' + i + '" style="display:flex; align-items:center; gap:8px;">' + logoHtml +
        '<span class="t"><b>' + esc(name(p.o)) + "</b><span>" + esc(sub) + "</span></span></div>";
    }).join("") || '<div class="up-empty">' + t("no_res") + "</div>";
    $("#resultList").innerHTML = html;
    $$("#resultList .res").forEach(function (el) {
      el.onclick = function () {
        var p = pts[+el.dataset.i];
        if (inCluster) {
          if (p.cat === "recovery") map.flyTo({ center: [p.o.lon, p.o.lat], zoom: 7, duration: 900 });
          else if (window.flyToCoords) window.flyToCoords(p.o.lat, p.o.lon, 7);
          openDetail(p);
        } else {
          map.flyTo({ center: [p.o.lon, p.o.lat], zoom: 5.5, duration: 1100 }); openDetail(p);
        }
        if (window.innerWidth < 900) closeSide();
      };
    });
  }

  function cell(label, val, ltr) {
    if (!val) return "";
    return '<div class="cell' + (ltr ? " ltr" : "") + '"><small>' + esc(label) + "</small><b>" + esc(val) + "</b></div>";
  }


  function renderSiteDetail(p) {
    var o = p.o, h = "";
    var ic = iconFor(p.cat, o.status).replace(/width="3\d"/, 'width="34"').replace(/height="38"/, 'height="44"');
    var isFa = LANG === "fa";

    // Status label & badge class
    var st = o.status || "active";
    var stClass = st === "active" ? "badge-ok" : (st === "inactive" ? "badge-fail" : "badge-constr");
    var stText = statusLabel(st);

    // Header with Title & Status Badge placed inline next to title (Fix for Bug 1: No overlap with X button)
    h += '<div class="d-head" style="margin-inline-end: 38px;">';
    h += '<div style="display:flex; gap:10px; align-items:center;"><div>' + ic + '</div><div>' +
      '<div class="d-kicker">' + esc(t("cat_site")) + '</div>' +
      '<h2 class="d-title" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' + 
      esc(name(o)) + 
      ' <span class="' + stClass + '" style="padding:2px 8px; border-radius:12px; font-size:10.5px; font-weight:bold; vertical-align:middle;">' + esc(stText) + '</span>' +
      '</h2></div></div>';
    h += '</div>';

    h += '<div class="d-sub">' + esc(isFa ? o.en : o.fa) + '</div>';

    // Header Photo or Design 1 Clean Blueprint Vector (Without Text)
    h += '<div class="site-photo-box" style="margin-top:8px; margin-bottom:10px; width:100%; height:165px; border-radius:8px; overflow:hidden; border:1px solid var(--line); position:relative; background:#07172b;">';
    if (o.has_photo && o.photo_url) {
      h += '<img src="' + esc(o.photo_url) + '" alt="" aria-hidden="true" class="site-photo-bg" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:blur(14px) brightness(0.55); transform:scale(1.15);" />';
      h += '<img src="' + esc(o.photo_url) + '" alt="' + esc(name(o)) + '" class="site-photo-img" style="position:relative; width:100%; height:165px; object-fit:contain; z-index:1;" />';
    } else {
      h += "<svg width=\"100%\" height=\"165\" viewBox=\"0 0 380 130\" preserveAspectRatio=\"xMidYMid slice\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background: linear-gradient(135deg, #07172b 0%, #0d2847 100%);\">\n  <defs>\n    <pattern id=\"siteGrid\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\">\n      <path d=\"M 20 0 L 0 0 0 20\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.12)\" stroke-width=\"0.8\"/>\n    </pattern>\n  </defs>\n  <rect width=\"100%\" height=\"100%\" fill=\"url(#siteGrid)\" />\n  <circle cx=\"190\" cy=\"65\" r=\"45\" stroke=\"rgba(56, 189, 248, 0.25)\" stroke-width=\"1\" fill=\"none\" stroke-dasharray=\"3 3\"/>\n  <circle cx=\"190\" cy=\"65\" r=\"25\" stroke=\"rgba(56, 189, 248, 0.4)\" stroke-width=\"1\" fill=\"none\"/>\n  <line x1=\"190\" y1=\"10\" x2=\"190\" y2=\"120\" stroke=\"rgba(56, 189, 248, 0.2)\" stroke-width=\"1\"/>\n  <line x1=\"130\" y1=\"65\" x2=\"250\" y2=\"65\" stroke=\"rgba(56, 189, 248, 0.2)\" stroke-width=\"1\"/>\n  <path d=\"M190 48 L202 58 L190 68 L178 58 Z\" fill=\"rgba(56, 189, 248, 0.3)\" stroke=\"#38bdf8\" stroke-width=\"1.5\"/>\n  <path d=\"M190 58 L202 68 L190 78 L178 68 Z\" fill=\"rgba(245, 158, 11, 0.3)\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n</svg>";
    }
    h += '</div>';

    if (o.has_photo && o.photo_url && (o.photo_caption_fa || o.photo_caption_en || o.photo_credit)) {
      var pcap = isFa ? (o.photo_caption_fa || o.photo_caption_en) : (o.photo_caption_en || o.photo_caption_fa);
      h += '<div class="site-photo-meta" style="margin:-6px 0 10px; font-size:10px; line-height:1.9; color:var(--muted);">' +
        (pcap ? '<span style="display:block; font-size:10.5px; color:var(--fg);">' + esc(pcap) + '</span>' : '') +
        (o.photo_credit ? (isFa ? 'عکس: ' : 'Photo: ') + esc(o.photo_credit) : '') +
        (o.photo_license ? ' · <bdi>' + esc(o.photo_license) + '</bdi>' : '') +
        (o.photo_source_url ? ' · <a href="' + esc(o.photo_source_url) + '" target="_blank" rel="noopener noreferrer" style="color:var(--muted); text-decoration:underline;">' + (isFa ? 'منبع تصویر' : 'Image source') + '</a>' : '') +
        '</div>';
    }

    h += '<div class="d-desc">' + esc(desc(o)) + '</div>';

    var launches = o.launches || [];
    var tot = launches.length;
    var succ = 0, fail = 0;
    var yearCounts = {};

    launches.forEach(function (l) {
      if (l.success) succ++; else fail++;
      var yr = (l.date || "").split("-")[0];
      if (yr) yearCounts[yr] = (yearCounts[yr] || 0) + 1;
    });

    var rate = tot > 0 ? Math.round((succ / tot) * 100) : 100;

    // 3 Clean Tabs Header
    h += '<div class="site-tabs">';
    h += '<button class="site-tab-btn active" onclick="switchSiteTab(\'overview\', this)">' + (isFa ? "شناسنامه و آمار" : "Overview & Stats") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchSiteTab(\'launches\', this)">' + (isFa ? "تاریخچه و تحلیلی (" + tot + ")" : "Launch History (" + tot + ")") + '</button>';
    var upcCnt = upcomingCountFor(o.id);
    h += '<button class="site-tab-btn" onclick="switchSiteTab(\'upcoming\', this)">' + (isFa ? "پرتاب‌های پیشِ رو" : "Upcoming") + (upcCnt > 0 ? " (" + upcCnt + ")" : "") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchSiteTab(\'analysis\', this)">' + (isFa ? "تحلیل جغرافیا و زیرساخت" : "Analysis & Infra") + '</button>';
    h += '</div>';

    // TAB 1: OVERVIEW & STATS
    h += '<div id="siteTabOverview" class="site-tab-content active">';
    
    h += '<div class="grid2">';
    h += cell(t("country"), isFa ? o.country_fa : o.country);
    h += cell(t("operator"), o.op, true);
    h += cell(t("status"), stText);
    h += cell(t("first_launch"), o.first);
    h += cell(t("pads"), o.pads, true);
    h += cell(t("coords"), o.lat.toFixed(4) + ", " + o.lon.toFixed(4), true);
    h += cell(isFa ? "ارتفاع از دریا" : "Altitude", o.alt || "50 m", true);
    h += cell(isFa ? "جهت‌های مجاز پرتاب (ازیموت)" : "Launch Azimuths", o.azimuth || "شرق روی پهنه ایمن", true);
    h += cell(isFa ? "مدارهای هدف اصلی" : "Target Orbits", o.target_orbits || "LEO, SSO", true);
    h += '</div>';

    h += '<div class="site-metrics-grid">';
    h += '<div class="site-metric-card gold"><div class="lbl">' + (isFa ? "تعداد کل پرتاب‌ها" : "Total Launches") + '</div><div class="val">' + tot + '</div><div class="lbl">' + (isFa ? "پرتاب مداری" : "Orbital Flights") + '</div></div>';
    h += '<div class="site-metric-card green"><div class="lbl">' + (isFa ? "نرخ موفقیت" : "Success Rate") + '</div><div class="val">' + rate + '%</div><div class="lbl">' + succ + (isFa ? " موفق / " : " ok / ") + fail + (isFa ? " ناموفق" : " failed") + '</div></div>';
    h += '<div class="site-metric-card"><div class="lbl">' + (isFa ? "ارتفاع از سطح دریا" : "Elevation") + '</div><div class="val">' + (o.alt || "50 m") + '</div><div class="lbl">' + (isFa ? "متر" : "meters") + '</div></div>';
    h += '<div class="site-metric-card"><div class="lbl">' + (isFa ? "فاصله از خط استوا" : "Equator Dist.") + '</div><div class="val" style="font-size:12px; margin-top:5px;">' + (o.equator_dist || "0 km") + '</div></div>';
    h += '</div>';

    var years = Object.keys(yearCounts).sort();
    var maxVal = 1;
    years.forEach(function (y) { if (yearCounts[y] > maxVal) maxVal = yearCounts[y]; });

    h += '<div class="site-chart-box">';
    h += '<div class="site-chart-head"><span>📊 ' + (isFa ? "روند پرتاب‌های سالانه (سال میلادی)" : "Annual Launches (Gregorian)") + '</span><span style="font-size:9.5px; opacity:0.75;">' + (isFa ? "استخراج خودکار" : "Auto Calculated") + '</span></div>';
    h += '<div class="site-chart-bars" style="direction: ltr;">';
    years.forEach(function (yr) {
      var cnt = yearCounts[yr];
      var pct = Math.max(Math.round((cnt / maxVal) * 100), 12);
      h += '<div class="site-bar-col"><div class="site-bar-fill" style="height:' + pct + '%;"><span class="site-bar-val">' + cnt + '</span></div><span class="site-bar-lbl">' + yr + '</span></div>';
    });
    h += '</div></div>';

    var rockets = o.rockets || [];
    if (rockets.length) {
      h += '<div class="sec-t">' + (isFa ? "پرتابگرهای مورد استفاده" : "Launch Vehicles") + '</div><div class="chips">' +
        rockets.map(function (x) { return '<span class="chip">' + esc(x) + '</span>'; }).join("") + '</div>';
    }

    h += '</div>'; // end tab 1

    // TAB 2: LAUNCH HISTORY & ANALYTICAL DRAWER (Fix for Bug 2: Clean inline onclick handler!)
    h += '<div id="siteTabLaunches" class="site-tab-content">';
    h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:6px;">' + (isFa ? "💡 جهت مشاهده جزئیات فنی و تحلیل علت موفقیت/شکست روی هر پرتاب کلیک کنید:" : "💡 Click on any launch row for technical details & analysis:") + '</div>';

    h += '<div class="site-launch-list" style="display:flex; flex-direction:column; gap:6px;">';
    launches.forEach(function (l, idx) {
      var resClass = l.success ? "badge-ok" : "badge-fail";
      var resText = l.success ? (isFa ? "موفق" : "Success") : (isFa ? "ناموفق" : "Failed");
      var drawerId = "ldrawer_" + idx;

      h += '<div class="site-launch-item" style="background:var(--bg2); border:1px solid var(--line); border-radius:6px; overflow:hidden;">';
      h += '<div class="site-launch-row" onclick="toggleSiteLaunchDrawer(\'' + drawerId + '\')" style="padding:8px 10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:11px; user-select:none;">';
      h += '<div style="display:flex; align-items:center; gap:8px;">';
      h += '<span style="direction:ltr; font-family:monospace; color:var(--accent);">' + esc(l.date) + '</span>';
      h += '<b>' + esc(l.payload || l.rocket) + ' (' + esc(l.rocket) + ')</b>';
      h += '</div>';
      h += '<div><span class="' + resClass + '">' + resText + '</span> <span style="color:var(--accent); font-size:10px; margin-inline-start:4px;">▼</span></div>';
      h += '</div>';

      // Expanded Drawer
      h += '<div id="' + drawerId + '" class="site-launch-drawer" style="display:none; padding:10px; background:color-mix(in srgb, var(--bg2) 80%, black); border-top:1px solid var(--line); flex-direction:column; gap:8px; font-size:11px;">';
      
      if (l.has_photo && l.photo_url) {
        h += '<img src="' + esc(l.photo_url) + '" alt="' + esc(l.payload) + '" style="width:100%; height:110px; object-fit:cover; border-radius:5px; border:1px solid var(--line);" />';
      } else {
        h += '<div style="background:rgba(255,255,255,0.03); border:1px dashed var(--line); padding:6px; text-align:center; border-radius:5px; color:var(--muted); font-size:10px;">📷 تصویر اختصاصی برای این پرتاب ثبت نشده است</div>';
      }

      h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; background:rgba(255,255,255,0.02); padding:6px; border-radius:4px; font-size:10.5px;">';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "زمان UTC:" : "Time UTC:") + '</span> <b>' + esc(l.time_utc || "12:00:00 UTC") + '</b></div>';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "جرم محموله:" : "Payload Mass:") + '</span> <b>' + esc(l.mass || "—") + '</b></div>';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "نسخه پرتابگر:" : "Rocket Variant:") + '</span> <b>' + esc(l.rocket_var || l.rocket) + '</b></div>';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "شیب مداری:" : "Inclination:") + '</span> <b>' + esc(l.inc || "—") + '</b></div>';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "مدت مأموریت:" : "Duration:") + '</span> <b>' + esc(l.duration || "—") + '</b></div>';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "مدار هدف:" : "Orbit:") + '</span> <b>' + esc(l.orbit || "LEO") + '</b></div>';
      h += '</div>';

      h += '<div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:5px; padding:8px; font-size:11px; line-height:1.5; color:#fde68a;">';
      h += l.analysis;
      h += '</div>';

      h += '</div>'; // end drawer
      h += '</div>'; // end item
    });
    h += '</div></div>'; // end tab 2

    // TAB 2.5: UPCOMING LAUNCHES
    h += '<div id="siteTabUpcoming" class="site-tab-content" data-site="' + esc(o.id) + '" data-isfa="' + (isFa ? "1" : "0") + '">';
    h += buildUpcomingTabInner(o.id, isFa);
    h += '</div>'; // end upcoming tab

    // TAB 3: GEOGRAPHY & INFRASTRUCTURE ANALYSIS
    h += '<div id="siteTabAnalysis" class="site-tab-content">';
    
    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:6px; padding:10px;">';
    h += '<div style="font-size:12px; font-weight:bold; color:#f59e0b; margin-bottom:6px;">🌍 ' + (isFa ? "تحلیل دلایل انتخاب موقعیت جغرافیایی" : "Geographical Positioning Analysis") + '</div>';
    h += '<div style="font-size:11px; color:var(--text); line-height:1.6; text-align:justify;">' + esc(o.geo_analysis || "") + '</div>';
    h += '</div>';

    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:6px; padding:10px;">';
    h += '<div style="font-size:12px; font-weight:bold; color:var(--accent); margin-bottom:8px;">🏗️ ' + (isFa ? "چک‌لیست زیرساخت‌های پایگاه (۱۵ گانه)" : "Site Infrastructure Checklist") + '</div>';
    h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">';
    
    (o.infra || []).forEach(function (item) {
      var dotColor = item.active ? "#10b981" : "#ef4444";
      var statusLbl = item.active ? (isFa ? "موجود" : "Active") : (isFa ? "ناموجود" : "Inactive");
      h += '<div style="background:rgba(255,255,255,0.02); border:1px solid var(--line); padding:5px 7px; border-radius:4px; display:flex; align-items:center; justify-content:space-between; font-size:10.5px;">';
      h += '<span>' + esc(item.name) + '</span>';
      h += '<span style="display:flex; align-items:center; gap:4px;"><small style="opacity:0.75;">' + statusLbl + '</small><i style="width:7px; height:7px; border-radius:50%; background:' + dotColor + '; display:inline-block;"></i></span>';
      h += '</div>';
    });

    h += '</div></div>';
    h += '</div>'; // end tab 3

    return h;
  }

  /* ============ upcoming launches per site (tab: پرتاب‌های پیشِ رو) ============ */
  var UPC = { data: null, live: null, liveOk: false };

  function loadSiteUpcomingData() {
    fetch("data/upcoming.json?_t=" + Date.now())
      .then(function (r) { if (!r.ok) throw new Error("upcoming data unavailable"); return r.json(); })
      .then(function (j) { UPC.data = j; syncUpcomingLive(); })
      .catch(function (e) { console.warn("upcoming:", e.message); });
  }

  function syncUpcomingLive() {
    try {
      var c = localStorage.getItem("upcSyncV1");
      if (c) {
        var o = JSON.parse(c);
        if (o && o.ts && (Date.now() - o.ts) < 6 * 3600 * 1000 && o.map) {
          UPC.live = o.map; UPC.liveOk = true; return;
        }
      }
    } catch (e) {}
    var wend = (UPC.data && UPC.data.window_end) ? UPC.data.window_end : "2027-01-06";
    var base = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=100&mode=list&net__lte=" + wend + "T00%3A00%3A00Z";
    var map = {};
    function absorb(j) {
      (j.results || []).forEach(function (x) {
        map[x.id] = { net: x.net, status: x.status ? x.status.abbrev : "", prec: x.net_precision ? x.net_precision.abbrev : "" };
      });
      return j.next ? fetch(j.next).then(function (r) { return r.json(); }).then(absorb) : null;
    }
    fetch(base).then(function (r) { return r.json(); }).then(absorb).then(function () {
      UPC.live = map; UPC.liveOk = true;
      try { localStorage.setItem("upcSyncV1", JSON.stringify({ ts: Date.now(), map: map })); } catch (e) {}
    }).catch(function () { UPC.liveOk = false; });
  }

  function upcEffective(l) {
    var eff = { net: l.net, status: l.status, precision: l.precision, dateFa: l.date_label_fa, dateEn: l.date_label_en, timeFa: l.time_fa, timeEn: l.time_en, updatedLive: false };
    var lv = UPC.live && UPC.live[l.ll2_id];
    if (lv && lv.net) {
      var dayPrec = (lv.prec === "SEC" || lv.prec === "MIN" || lv.prec === "HR" || lv.prec === "DAY");
      if (lv.net !== l.net && dayPrec) {
        eff.net = lv.net; eff.precision = "day";
        eff.dateFa = lv.net.slice(0, 10); eff.dateEn = lv.net.slice(0, 10);
        eff.timeFa = "ساعت " + lv.net.slice(11, 16) + " به وقت جهانی";
        eff.timeEn = lv.net.slice(11, 16) + " UTC";
        eff.updatedLive = true;
      } else { eff.net = lv.net; }
      if (lv.status) eff.status = lv.status;
    }
    return eff;
  }

  function upcVisibleRows(siteId) {
    if (!UPC.data) return [];
    var now = Date.now();
    var rank = { day: 0, month: 1, quarter: 2, tbd: 3 };
    return (UPC.data.launches || [])
      .filter(function (l) { return l.site === siteId; })
      .map(function (l) { return { l: l, eff: upcEffective(l) }; })
      .filter(function (p) { return (new Date(p.eff.net)).getTime() > now - 2 * 3600 * 1000; })
      .sort(function (a, b) {
        var r = (rank[a.eff.precision] || 0) - (rank[b.eff.precision] || 0);
        return r !== 0 ? r : (a.eff.net < b.eff.net ? -1 : 1);
      });
  }

  function upcomingCountFor(siteId) {
    try { return upcVisibleRows(siteId).length; } catch (e) { return 0; }
  }

  function buildUpcomingTabInner(siteId, isFa) {
    var PREC_BADGE = { day: ["#10b981", "روز و ساعت مشخص", "Date & time set"], month: ["#f59e0b", "فقط ماه مشخص", "Month known"], quarter: ["#f97316", "بازهٔ فصلی", "Quarterly window"], tbd: ["#94a3b8", "در انتظار اعلام", "Date TBA"] };
    var ST_FA = { Go: "تأیید شده", TBC: "در انتظار تأیید", TBD: "زمان نامعین" };
    var h = "";
    if (!UPC.data) {
      return '<div style="padding:14px; text-align:center; color:var(--muted); font-size:11px;">' + (isFa ? "داده در حال آماده‌سازی است. لحظه‌ای بعد دوباره این زبانه را باز کنید." : "Data is loading; reopen this tab in a moment.") + '</div>';
    }
    var covered = (UPC.data.sites_covered || []).indexOf(siteId) > -1;
    // سربرگ: مهر به‌روزرسانی + وضعیت هم‌زمانی زنده
    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:6px; padding:7px 10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; font-size:10px; color:var(--muted);">';
    h += '<span>🗓 ' + (isFa ? "آخرین به‌روزرسانی دادهٔ محلی: " : "Local data updated: ") + '<b style="direction:ltr; font-family:monospace;">' + esc(UPC.data.updated || "—") + '</b></span>';
    h += '<span>' + (UPC.liveOk ? (isFa ? "هم‌زمانی زندهٔ تاریخ‌ها: انجام شد ✅" : "Live date sync: OK ✅") : (isFa ? "هم‌زمانی زنده: در دسترس نیست" : "Live sync: unavailable")) + '</span>';
    h += '</div>';
    if (!covered) {
      h += '<div style="background:rgba(255,255,255,0.03); border:1px dashed var(--line); padding:12px; text-align:center; border-radius:6px; color:var(--muted); font-size:11px;">' + (isFa ? "دادهٔ پرتاب‌های پیشِ رو برای این پایگاه در گام‌های بعدی تکمیل می‌شود." : "Upcoming-launch data for this site will be added in the next phases.") + '</div>';
      return h;
    }
    var rows = upcVisibleRows(siteId);
    if (!rows.length) {
      var note = (UPC.data.site_notes || {})[siteId];
      h += '<div style="background:rgba(255,255,255,0.03); border:1px dashed var(--line); padding:12px; text-align:center; border-radius:6px; color:var(--muted); font-size:11px;">' + (isFa ? "پرتابی برای این پایگاه اعلام نشده است." : "No launches are announced for this site.");
      if (note) h += '<div style="margin-top:7px; font-size:10.5px; line-height:1.7; color:var(--fg); opacity:0.85;">ℹ️ ' + esc(isFa ? note[0] : note[1]) + '</div>';
      h += '</div>';
      return h;
    }
    h += '<div style="font-size:10px; color:var(--muted); margin-bottom:6px;">' + (isFa ? "💡 تاریخ‌ها طبق اعلام رسمی است و ممکن است جابه‌جا شود. پس از انجام هر پرتاب، ردیف آن حذف و به تاریخچه منتقل می‌شود." : "💡 Dates follow official announcements and may slip. Completed launches move to the history tab.") + '</div>';
    h += '<div style="display:flex; flex-direction:column; gap:6px;">';
    rows.forEach(function (p, idx) {
      var l = p.l, eff = p.eff;
      var bd = PREC_BADGE[eff.precision] || PREC_BADGE.tbd;
      var drawerId = "udrawer_" + idx;
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:6px; overflow:hidden;">';
      h += '<div onclick="toggleSiteLaunchDrawer(\'' + drawerId + '\')" style="padding:8px 10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:11px; user-select:none; gap:6px;">';
      h += '<div style="display:flex; align-items:center; gap:8px; min-width:0;">';
      h += '<span style="direction:ltr; font-family:monospace; color:var(--accent); white-space:nowrap;">' + esc(isFa ? eff.dateFa : eff.dateEn) + '</span>';
      h += '<b style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(isFa ? l.payload_fa : l.payload_en) + '</b>';
      h += '</div>';
      h += '<span style="display:flex; align-items:center; gap:6px; white-space:nowrap;"><span style="border:1px solid ' + bd[0] + '; color:' + bd[0] + '; border-radius:10px; padding:1px 7px; font-size:9.5px;">' + (isFa ? bd[1] : bd[2]) + '</span><span style="color:var(--accent); font-size:10px;">▼</span></span>';
      h += '</div>';
      h += '<div id="' + drawerId + '" style="display:none; padding:10px; background:color-mix(in srgb, var(--bg2) 80%, black); border-top:1px solid var(--line); flex-direction:column; gap:8px; font-size:11px;">';
      h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; background:rgba(255,255,255,0.02); padding:6px; border-radius:4px; font-size:10.5px;">';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "راکت و پیکربندی:" : "Rocket:") + '</span> <b>' + esc(isFa ? l.rocket_fa : l.rocket_en) + '</b></div>';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "مدار مقصد:" : "Target orbit:") + '</span> <b>' + esc(isFa ? l.orbit_fa : l.orbit_en) + '</b></div>';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "نوع مأموریت:" : "Mission type:") + '</span> <b>' + esc(isFa ? l.mtype_fa : l.mtype_en) + '</b></div>';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "مشتری / بهره‌بردار:" : "Customer:") + '</span> <b>' + esc(isFa ? l.customer_fa : l.customer_en) + '</b></div>';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "زمان حدودی:" : "Approx. time:") + '</span> <b>' + esc(isFa ? eff.timeFa : eff.timeEn) + (eff.updatedLive ? ' <span style="color:#10b981; font-size:9px;">' + (isFa ? "(به‌روزشدهٔ زنده)" : "(live update)") + '</span>' : '') + '</b></div>';
      h += '<div><span style="color:var(--muted);">' + (isFa ? "وضعیت:" : "Status:") + '</span> <b>' + esc(isFa ? (ST_FA[eff.status] || eff.status) : eff.status) + '</b></div>';
      h += '</div>';
      h += '<div style="background:rgba(59, 130, 246, 0.08); border:1px solid rgba(59, 130, 246, 0.25); border-radius:5px; padding:8px; font-size:11px; line-height:1.6; color:#bfdbfe;">' + esc(isFa ? l.desc_fa : l.desc_en) + '</div>';
      if (l.calendar_url || l.stream_url) {
        h += '<div style="display:flex; gap:8px; flex-wrap:wrap;">';
        if (l.calendar_url) h += '<a href="' + esc(l.calendar_url) + '" target="_blank" rel="noopener noreferrer" style="font-size:10px; color:var(--accent); text-decoration:none; border:1px solid var(--line); border-radius:5px; padding:4px 9px;">🗓 ' + (isFa ? "گاه‌شمار رسمی" : "Official schedule") + ' ↗</a>';
        if (l.stream_url) h += '<a href="' + esc(l.stream_url) + '" target="_blank" rel="noopener noreferrer" style="font-size:10px; color:var(--accent); text-decoration:none; border:1px solid var(--line); border-radius:5px; padding:4px 9px;">📺 ' + (isFa ? "پخش زندهٔ رسمی" : "Official stream") + ' ↗</a>';
        h += '</div>';
      }
      h += '</div></div>';
    });
    h += '</div>';
    return h;
  }

  window.toggleSiteLaunchDrawer = function(drawerId) {
    var id = String(drawerId).trim();
    var drawer = document.getElementById(id);
    if (!drawer) return;
    var current = drawer.style.display;
    drawer.style.display = (current === "none" || !current) ? "flex" : "none";
  };

  window.switchSiteTab = function(tabId, el) {
    $$(".site-tab-btn").forEach(function(b) { b.classList.remove("active"); });
    $$(".site-tab-content").forEach(function(c) { c.classList.remove("active"); });
    el.classList.add("active");
    if (tabId === "overview") $("#siteTabOverview").classList.add("active");
    else if (tabId === "launches") $("#siteTabLaunches").classList.add("active");
    else if (tabId === "upcoming") {
      var up = $("#siteTabUpcoming");
      if (up) {
        up.innerHTML = buildUpcomingTabInner(up.getAttribute("data-site"), up.getAttribute("data-isfa") === "1");
        up.classList.add("active");
      }
    }
    else if (tabId === "analysis") $("#siteTabAnalysis").classList.add("active");
  };

  window.flyToLaunchSite = function(siteId) {
    if (!siteId || typeof DATA === "undefined" || !DATA.sites) return;
    var sid = String(siteId).trim().toLowerCase();
    var s = DATA.sites.find(function(x) {
      return (x.id && x.id.toLowerCase() === sid) || 
             (x.en && x.en.toLowerCase().indexOf(sid) > -1) || 
             (x.fa && x.fa.indexOf(sid) > -1);
    });
    if (s) {
      if (typeof map !== "undefined" && map) {
        map.flyTo({ center: [s.lon, s.lat], zoom: 8, duration: 1400 });
      }
      openDetail({ kind: "site", cat: "site", o: s });
    }
  };

  window.flyToCoords = function(lat, lon, zoom) {
    var nLat = parseFloat(lat);
    var nLon = parseFloat(lon);
    if (isNaN(nLat) || isNaN(nLon)) return;
    
    var nZoom = zoom ? parseFloat(zoom) : 8;
    
    if (typeof map !== "undefined" && map) {
      // Calculate right padding to avoid being covered by right side panel (#detailPanel width ~380px)
      var rightPad = (window.innerWidth > 900) ? 380 : 0;
      
      map.flyTo({
        center: [nLon, nLat],
        zoom: Math.max(map.getZoom(), nZoom),
        duration: 1200,
        padding: { right: rightPad, top: 60, bottom: 60, left: 60 }
      });

      // Temporary neon cyan pulsing marker at fly target
      try {
        if (window.activeFlyMarker) {
          window.activeFlyMarker.remove();
          window.activeFlyMarker = null;
        }
        var el = document.createElement("div");
        el.style.cssText = "width:22px; height:22px; border-radius:50%; background:rgba(0, 210, 255, 0.9); border:2px solid #ffffff; box-shadow:0 0 15px #00d2ff, 0 0 30px #00d2ff; pointer-events:none;";
        window.activeFlyMarker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([nLon, nLat])
          .addTo(map);

        setTimeout(function() {
          if (window.activeFlyMarker) {
            window.activeFlyMarker.remove();
            window.activeFlyMarker = null;
          }
        }, 4000);
      } catch (err) {}

      // On mobile screens collapse side panel to reveal map
      if (window.innerWidth < 900 && typeof closeSide === "function") {
        closeSide();
      }
    }
  };

  window.switchCompTab = function(tabId, el) {
    $$(".site-tab-btn").forEach(function(b) { b.classList.remove("active"); });
    $$(".site-tab-content").forEach(function(c) { 
      c.classList.remove("active"); 
      c.style.display = "none"; 
    });

    if (el) el.classList.add("active");

    var target = null;
    if (tabId === "cPropulsion") {
      target = $("#compTabCPropulsion");
    } else if (tabId === "cLaunch") {
      target = $("#compTabCLaunch");
    } else if (tabId === "cAgency") {
      target = $("#compTabCAgency");
    } else if (tabId === "cSite") {
      target = $("#compTabCSite");
    } else if (tabId === "overview") {
      target = $("#compTabOverview");
    } else if (tabId === "vehicles") {
      target = $("#compTabVehicles") || $("#compTabProducts");
    } else if (tabId === "products") {
      target = $("#compTabProducts") || $("#compTabVehicles");
    } else if (tabId === "engines") {
      target = $("#compTabEngines") || $("#compTabVehicles") || $("#compTabProducts");
    } else if (tabId === "testing") {
      target = $("#compTabTesting") || $("#compTabTimeline") || $("#compTabHistory");
    } else if (tabId === "timeline" || tabId === "history") {
      target = $("#compTabTimeline") || $("#compTabHistory");
    } else if (tabId === "roadmap" || tabId === "partnerships") {
      target = $("#compTabRoadmap") || $("#compTabPartnerships");
    } else if (tabId === "gallery") {
      target = $("#compTabGallery");
    }

    if (target) {
      target.classList.add("active");
      target.style.display = "block";
    }
  };

  function renderCompanyDetail(p) {
    var o = p.o || p, h = "";
    var isFa = (typeof LANG !== "undefined" && LANG === "fa");
    var isPropulsionComp = (p.cat === "propulsion" || o.cat === "propulsion" || o.category === "propulsion" || "engine_products_bilingual" in o);
    var isLaunchComp = (p.cat === "launch" || o.cat === "launch" || p.kind === "launch" || o.rockets_fleet) || !isPropulsionComp;

    // Dynamic Bilingual Org Type Badge calculation
    var orgTypeStr = isFa ? (o.org_type_fa || o.org_type_en || "شرکت پرتاب تجاری") : (o.org_type_en || o.org_type_fa || o.org_type || "Commercial Launch Provider");
    var stClass = "badge-private";
    if ((o.org_type_fa || "").indexOf("دولتی") > -1 || (o.org_type_fa || "").indexOf("حاکمیتی") > -1 || (o.org_type_en || "").indexOf("State") > -1 || (o.org_type_en || "").indexOf("Government") > -1) stClass = "badge-gov";

    // Logo with graceful SVG fallback onerror
    var defaultLogoSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%2338bdf8' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%2338bdf8' text-anchor='middle'>🚀</text></svg>";
    var logoSrc = o.logo_data || o.logo || defaultLogoSvg;

    // Header with Title & Logo Image Tag & Org Type Badge
    h += '<div class="d-head" style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-inline-end: 35px;">';
    
    h += '<div style="display:flex; gap:10px; align-items:center; flex:1;">';
    h += '<div style="width:48px; height:48px; border-radius:8px; background:#000; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; padding:2px;">';
    h += '<img src="' + esc(logoSrc) + '" alt="' + esc(name(o)) + '" onerror="this.onerror=null; this.src=defaultLogoSvg;" style="max-width:100%; max-height:100%; object-fit:contain;" />';
    h += '</div>';
    
    h += '<div><div class="d-kicker">' + esc(isFa ? (o.acronym_fa || o.en) : (o.en || o.fa)) + '</div>';
    h += '<h2 class="d-title" style="margin:0;">' + esc(name(o)) + '</h2></div></div>';

    h += '<span class="' + stClass + '" style="padding:3px 10px; border-radius:12px; font-size:10.5px; font-weight:bold; white-space:nowrap;">' + esc(orgTypeStr) + '</span>';
    h += '</div>';

    h += '<div class="d-sub" style="margin-top:4px;">' + esc(isFa ? (o.en || o.fa) : (o.fa || o.en)) + '</div>';
    h += '<div class="d-desc" style="margin-top:6px; line-height:1.6;">' + esc(desc(o)) + '</div>';

    if (isPropulsionComp) {
      // 3 TABS FOR PROPULSION COMPANIES
      var propCat = isFa ? (o.propulsion_category_fa || o.propulsion_category_en || "پیشرانه فضایی") : (o.propulsion_category_en || "Propulsion Contractor");
      var propType = isFa ? (o.propulsion_type_fa || o.propulsion_type_en || "سوخت مایع / جامد") : (o.propulsion_type_en || "Liquid/Solid Propulsion");

      h += '<div class="site-tabs" style="margin-top:10px;">';
      h += '<button class="site-tab-btn active" onclick="switchCompTab(\'overview\', this)">' + (isFa ? "شناسنامه و معماری" : "Overview & Architecture") + '</button>';
      h += '<button class="site-tab-btn" onclick="switchCompTab(\'engines\', this)">' + (isFa ? "موتورها و موشک مقصد" : "Engines & Mission Link") + '</button>';
      h += '<button class="site-tab-btn" onclick="switchCompTab(\'testing\', this)">' + (isFa ? "تست‌های گرم و نقشه راه" : "Test History & Roadmap") + '</button>';
      h += '</div>';

      // TAB 1: OVERVIEW & ARCHITECTURE
      h += '<div id="compTabOverview" class="site-tab-content active" style="display:block;">';
      
      h += '<div class="grid2" style="margin-top:8px;">';
      h += cell(isFa ? "سال تأسیس" : "Founded", o.founded || "—");
      h += cell(isFa ? "مقر اصلی" : "Headquarters", isFa ? (o.city_fa || o.city) : (o.city || o.city_fa));
      h += cell(t("country"), isFa ? (o.country_fa || o.country) : (o.country || o.country_fa));
      h += cell(isFa ? "نوع نهاد" : "Org Type", orgTypeStr, true);
      h += cell(isFa ? "رده پیشرانه" : "Category", propCat, true);
      h += cell(isFa ? "نوع پیشرانه" : "Propulsion Type", propType, true);
      h += '</div>';

      // Flagship Engine Card
      var flagshipEngine = isFa ? (o.flagship_engine_fa || o.flagship_engine_en) : (o.flagship_engine_en || o.flagship_engine_fa);
      var flagshipStatus = isFa ? (o.flagship_status_fa || o.flagship_status_en || "عملیاتی") : (o.flagship_status_en || o.flagship_status_fa || "Operational");
      
      if (flagshipEngine) {
        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px; display:flex; justify-content:space-between; align-items:center;">';
        h += '<div><div style="font-size:10px; color:var(--muted);">' + (isFa ? "⚙️ موتور پرچم‌دار اصلی:" : "⚙️ Flagship Engine:") + '</div>';
        h += '<b style="font-size:12px; color:#fff;">' + esc(flagshipEngine) + '</b></div>';
        h += '<span style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); color:#10b981; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:10px;">' + esc(flagshipStatus) + '</span>';
        h += '</div>';
      }

      // EXPLICIT LINKS ROW WITH FULL URL TEXT
      var compLinks = extractEntityLinks(o);
      var webUrl = compLinks.webUrl;
      var displayWeb = compLinks.displayWeb || (isFa ? "وب‌سایت رسمی" : "Website");
      var linkedinUrl = compLinks.linkedinUrl;
      var displayLinkedin = compLinks.displayLinkedin || "LinkedIn";

      if (webUrl || linkedinUrl || (o.lat && o.lon)) {
        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:10.5px; flex-wrap:wrap; gap:8px;">';
        
        if (webUrl) {
          h += '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent); font-weight:bold; font-family:monospace; text-decoration:none; background:rgba(56, 189, 248, 0.12); padding:5px 12px; border-radius:6px; border:1px solid rgba(56, 189, 248, 0.3); word-break:break-all;" onclick="window.open(\'' + esc(webUrl) + '\', \'_blank\'); return false;">🌐 ' + esc(displayWeb) + ' ↗</a>';
        }
        
        if (linkedinUrl) {
          h += '<a href="' + esc(linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-weight:bold; font-family:monospace; text-decoration:none; background:rgba(14, 118, 168, 0.2); padding:5px 12px; border-radius:6px; border:1px solid rgba(14, 118, 168, 0.4); word-break:break-all;" onclick="window.open(\'' + esc(linkedinUrl) + '\', \'_blank\'); return false;">💼 ' + esc(displayLinkedin) + ' ↗</a>';
        }

        if (o.lat && o.lon) {
          h += '<button type="button" class="btn btn-sm country-btn-fly" onclick="flyToCoords(' + o.lat + ',' + o.lon + ', 8)" style="font-size:10px; padding:5px 10px; cursor:pointer;">📍 ' + (isFa ? "پرواز به موقعیت روی نقشه ↗" : "Fly to Location ↗") + '</button>';
        }

        h += '</div>';
      }

      h += '</div>'; // end TAB 1

      // TAB 2: ENGINES CATALOG
      h += '<div id="compTabEngines" class="site-tab-content" style="display:none;">';
      var engList = o.engine_products_bilingual || [];
      if (engList.length) {
        h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:6px;">⚙️ ' + (isFa ? "کاتالوگ موتورهای پیشرانش مایع، جامد و پلاسما:" : "Propulsion Engines Catalog:") + '</div>';
        h += '<div style="display:flex; flex-direction:column; gap:8px;">';
        
        engList.forEach(function(eng, idx) {
          var engName = isFa ? (eng.name_fa || eng.name_en) : (eng.name_en || eng.name_fa);
          var engProp = isFa ? (eng.propellant_fa || eng.propellant_en || "—") : (eng.propellant_en || eng.propellant_fa || "—");
          var engSt = isFa ? (eng.status_fa || eng.status_en || "عملیاتی") : (eng.status_en || eng.status_fa || "Operational");
          var openAttr = (idx === 0) ? " open" : "";

          h += '<details class="acc" ' + openAttr + ' style="background:linear-gradient(180deg, rgba(15,31,51,0.8) 0%, rgba(9,13,22,0.9) 100%); border:1px solid var(--line); border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:all 0.2s ease;">';
          h += '<summary style="padding:10px 12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:10px; user-select:none; background:rgba(255,255,255,0.03); outline:none; flex-wrap:wrap;">';
          h += '<div style="font-size:12px; font-weight:bold; color:#fff; line-height:1.45; word-break:break-word; flex:1; min-width:180px;">⚙️ <bdi>' + esc(engName) + '</bdi></div>';
          h += '<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">';
          h += '<span style="color:#38bdf8; font-size:9.5px; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.3); padding:2px 7px; border-radius:12px; font-weight:bold;"><bdi>' + esc(engProp) + '</bdi></span>';
          h += '<span style="color:#10b981; font-weight:bold; font-size:9.5px; background:rgba(16, 185, 129, 0.12); border:1px solid rgba(16, 185, 129, 0.3); padding:2px 7px; border-radius:12px;"><bdi>' + esc(engSt) + '</bdi></span>';
          h += '<span style="color:var(--muted); font-size:10px; opacity:0.8;">▼</span>';
          h += '</div>';
          h += '</summary>';
          
          h += '<div style="padding:10px 12px; border-top:1px solid var(--line); background:rgba(0,0,0,0.2); font-size:10.5px; line-height:1.6; color:var(--text);">';
          if (eng.thrust_fa || eng.thrust_en) {
            h += '<div><b>' + (isFa ? "رانش (Thrust):" : "Thrust:") + '</b> ' + esc(isFa ? (eng.thrust_fa || eng.thrust_en) : (eng.thrust_en || eng.thrust_fa)) + '</div>';
          }
          if (eng.isp_fa || eng.isp_en) {
            h += '<div><b>' + (isFa ? "تکانه ویژه (Isp):" : "Specific Impulse:") + '</b> ' + esc(isFa ? (eng.isp_fa || eng.isp_en) : (eng.isp_en || eng.isp_fa)) + '</div>';
          }
          if (eng.engineering_desc_fa || eng.engineering_desc_en) {
            h += '<div style="margin-top:4px; color:var(--muted);">' + esc(isFa ? (eng.engineering_desc_fa || eng.engineering_desc_en) : (eng.engineering_desc_en || eng.engineering_desc_fa)) + '</div>';
          }
          h += '</div>';
          h += '</details>';
        });

        h += '</div>';
      } else {
        h += '<div style="padding:16px; text-align:center; color:var(--muted); font-size:11px;">' + (isFa ? "کاتالوگ موتورهای جزئی برای این مجموعه ثبت نشده است." : "No detailed engine catalog registered.") + '</div>';
      }
      h += '</div>'; // end TAB 2

      // TAB 3: TESTING & ROADMAP
      h += '<div id="compTabTesting" class="site-tab-content" style="display:none;">';
      h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:6px;">🔥 ' + (isFa ? "تاریخچه تست‌های گرم و نقشه راه توسعه:" : "Hot Test History & Roadmap:") + '</div>';
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; font-size:11px; line-height:1.6; color:var(--text);">';
      h += esc(desc(o));
      h += '</div>';
      h += '</div>'; // end TAB 3

    } else if (isLaunchComp && o.rockets_fleet) {
      // 3 TABS FOR LAUNCH COMPANIES
      h += '<div class="site-tabs" style="margin-top:10px;">';
      h += '<button class="site-tab-btn active" onclick="switchCompTab(\'overview\', this)">' + (isFa ? "شناسنامه و آمار" : "Overview & Stats") + '</button>';
      h += '<button class="site-tab-btn" onclick="switchCompTab(\'vehicles\', this)">' + (isFa ? "ناوگان پرتاب‌گرها" : "Rockets Fleet") + '</button>';
      h += '<button class="site-tab-btn" onclick="switchCompTab(\'timeline\', this)">' + (isFa ? "تاریخچه و شبکه" : "History & Network") + '</button>';
      h += '</div>';

      // TAB 1: OVERVIEW & STATS
      h += '<div id="compTabOverview" class="site-tab-content active" style="display:block;">';
      
      // Executive Info Grid
      h += '<div class="grid2">';
      h += cell(isFa ? "سال تأسیس" : "Founded", o.founded || "—");
      h += cell(isFa ? "سال اولین پرتاب" : "First Launch", o.first_launch_year || "—");
      h += cell(isFa ? "بنیان‌گذار" : "Founder", isFa ? (o.founder_fa || "—") : (o.founder_en || o.founder_fa || "—"));
      h += cell(isFa ? "مدیرعامل" : "CEO", isFa ? (o.ceo_fa || "—") : (o.ceo_en || o.ceo_fa || "—"));
      h += cell(isFa ? "مقر اصلی" : "Headquarters", isFa ? (o.city_fa || o.city) : (o.city || o.city_fa));
      h += cell(t("country"), isFa ? (o.country_fa || o.country) : (o.country || o.country_fa));
      h += '</div>';

      // Performance Stats Banner
      var stats = o.stats || { total_launches: 0, success_launches: 0, failed_launches: 0, success_rate: "100%", active_vehicles_count: 1 };
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:8px;">📊 ' + (isFa ? "آمار کلیدی عملکرد پرتاب" : "Performance Statistics") + '</div>';
      h += '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; text-align:center;">';
      
      h += '<div style="background:rgba(0,0,0,0.3); padding:6px; border-radius:6px; border:1px solid var(--line);">';
      h += '<div style="font-size:15px; font-weight:bold; color:#fff;">' + esc(stats.total_launches) + '</div>';
      h += '<div style="font-size:9.5px; color:var(--muted);">' + (isFa ? "کل پرتاب‌ها" : "Total") + '</div>';
      h += '</div>';

      h += '<div style="background:rgba(16, 185, 129, 0.1); padding:6px; border-radius:6px; border:1px solid rgba(16, 185, 129, 0.3);">';
      h += '<div style="font-size:15px; font-weight:bold; color:#10b981;">' + esc(stats.success_launches) + '</div>';
      h += '<div style="font-size:9.5px; color:#10b981;">' + (isFa ? "موفق" : "Success") + '</div>';
      h += '</div>';

      h += '<div style="background:rgba(239, 68, 68, 0.1); padding:6px; border-radius:6px; border:1px solid rgba(239, 68, 68, 0.3);">';
      h += '<div style="font-size:15px; font-weight:bold; color:#ef4444;">' + esc(stats.failed_launches) + '</div>';
      h += '<div style="font-size:9.5px; color:#ef4444;">' + (isFa ? "ناموفق" : "Failed") + '</div>';
      h += '</div>';

      var srText = isFa ? (stats.success_rate || "۹۵٪") : (stats.success_rate ? stats.success_rate.replace(/[۰-۹]/g, function(c){ return "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(c)]; }) : "95%");
      h += '<div style="background:rgba(245, 158, 11, 0.1); padding:6px; border-radius:6px; border:1px solid rgba(245, 158, 11, 0.3);">';
      h += '<div style="font-size:15px; font-weight:bold; color:#f59e0b;">' + esc(srText) + '</div>';
      h += '<div style="font-size:9.5px; color:#f59e0b;">' + (isFa ? "نرخ موفقیت" : "Success Rate") + '</div>';
      h += '</div>';

      h += '</div></div>';

      // Annual Launch Trend Chart (HTML/CSS Bar Graph)
      var trend = stats.annual_trend || [];
      if (trend.length) {
        var maxCount = 1;
        trend.forEach(function(item) { if (item.count > maxCount) maxCount = item.count; });
        
        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
        h += '<div style="font-size:11.5px; font-weight:bold; color:#f59e0b; margin-bottom:8px;">📈 ' + (isFa ? "نمودار سالانه تعداد پرتاب‌ها" : "Annual Launch Trend") + '</div>';
        h += '<div style="display:flex; align-items:flex-end; gap:8px; height:80px; padding-top:10px; border-bottom:1px solid var(--line); border-left:1px solid var(--line); padding-left:6px;">';
        
        trend.forEach(function(tItem) {
          var pct = Math.max(12, Math.round((tItem.count / maxCount) * 100));
          h += '<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; height:100%; justify-content:flex-end;">';
          h += '<small style="font-size:9px; color:#38bdf8; font-weight:bold;">' + esc(tItem.count) + '</small>';
          h += '<div style="width:100%; max-width:20px; height:' + pct + '%; background:linear-gradient(180deg, #38bdf8, #0284c7); border-radius:3px 3px 0 0;" title="' + esc(tItem.year) + ': ' + esc(tItem.count) + ' launches"></div>';
          h += '<span style="font-size:9px; color:var(--muted); font-family:monospace;">' + esc(tItem.year) + '</span>';
          h += '</div>';
        });

        h += '</div></div>';
      }

      // Mission Types & Orbital Capabilities Badges
      var mTypes = isFa ? (o.mission_types_fa || ["پرتاب تجاری", "علمی", "نظامی"]) : (o.mission_types_en || ["Commercial Launch", "Scientific Missions", "Defense Space"]);
      var oCaps = isFa ? (o.orbital_capabilities_fa || ["LEO", "SSO", "GTO"]) : (o.orbital_capabilities_en || ["LEO", "SSO", "GTO"]);

      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px; display:flex; flex-direction:column; gap:6px;">';
      h += '<div style="font-size:11px; font-weight:bold; color:var(--accent);">🎯 ' + (isFa ? "انواع مأموریت‌ها و پوشش مداری" : "Mission Types & Orbit Capabilities") + '</div>';
      
      h += '<div style="display:flex; flex-wrap:wrap; gap:4px;">';
      mTypes.forEach(function(m) {
        h += '<span style="background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.3); color:#38bdf8; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:bold;">' + esc(m) + '</span>';
      });
      oCaps.forEach(function(ob) {
        h += '<span style="background:rgba(245, 158, 11, 0.12); border:1px solid rgba(245, 158, 11, 0.3); color:#f59e0b; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:bold;"><code>' + esc(ob) + '</code></span>';
      });
      h += '</div></div>';

      // Associated Launch Sites with Click-to-Fly Buttons
      var siteIds = o.site_ids || [];
      if (siteIds.length) {
        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
        h += '<div style="font-size:11px; font-weight:bold; color:#10b981; margin-bottom:6px;">📍 ' + (isFa ? "پایگاه‌های پرتاب مورد استفاده (کلیک جهت انتقال روی نقشه)" : "Operational Launch Sites (Click to Fly)") + '</div>';
        h += '<div style="display:flex; flex-direction:column; gap:4px;">';
        
        siteIds.forEach(function(sid) {
          var matchedSite = (typeof DATA !== "undefined" && DATA.sites) ? DATA.sites.find(function(x) { return x.id === sid || (x.en && x.en.toLowerCase().indexOf(sid.toLowerCase()) > -1); }) : null;
          var siteName = matchedSite ? (isFa ? (matchedSite.fa || matchedSite.en) : (matchedSite.en || matchedSite.fa)) : sid;
          
          h += '<button type="button" onclick="flyToLaunchSite(\'' + esc(sid) + '\')" class="btn btn-sm country-btn-site" style="display:flex; justify-content:space-between; align-items:center; width:100%; text-align:right; font-size:10.5px; padding:6px 10px; cursor:pointer;">';
          h += '<span>🚀 ' + esc(siteName) + '</span>';
          h += '<span style="color:#10b981; font-weight:bold;">' + (isFa ? "پرواز روی نقشه ↗" : "Fly to Location ↗") + '</span>';
          h += '</button>';
        });

        h += '</div></div>';
      }

      // Official Links Box (FULL URL LABELS FOR WEBSITE & LINKEDIN)
      var compLinks = extractEntityLinks(o);
      var webUrl = compLinks.webUrl;
      var displayWeb = compLinks.displayWeb || "Website";
      var linkedinUrl = compLinks.linkedinUrl;
      var displayLinkedin = compLinks.displayLinkedin || "LinkedIn";

      if (webUrl || linkedinUrl) {
        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px; display:flex; justify-content:space-between; align-items:center; font-size:10.5px; flex-wrap:wrap; gap:8px;">';
        if (webUrl) {
          h += '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent); font-weight:bold; font-family:monospace; text-decoration:none; background:rgba(56, 189, 248, 0.12); padding:5px 12px; border-radius:6px; border:1px solid rgba(56, 189, 248, 0.3); word-break:break-all;" onclick="window.open(\'' + esc(webUrl) + '\', \'_blank\'); return false;">🌐 ' + esc(displayWeb) + ' ↗</a>';
        }
        if (linkedinUrl) {
          h += '<a href="' + esc(linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-weight:bold; font-family:monospace; text-decoration:none; background:rgba(14, 118, 168, 0.2); padding:5px 12px; border-radius:6px; border:1px solid rgba(14, 118, 168, 0.4); word-break:break-all;" onclick="window.open(\'' + esc(linkedinUrl) + '\', \'_blank\'); return false;">💼 ' + esc(displayLinkedin) + ' ↗</a>';
        }
        h += '</div>';
      }

      h += '</div>'; // end TAB 1

      // TAB 2: ROCKETS FLEET
      var fleet = o.rockets_fleet || [];
      h += '<div id="compTabVehicles" class="site-tab-content" style="display:none;">';
      h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:6px;">🚀 ' + (isFa ? "مشخصات کامل فنی و عملیاتی موشک‌ها و پرتاب‌گرها:" : "Detailed Rockets Fleet Specifications:") + '</div>';
      
      fleet.forEach(function(v) {
        var rName = isFa ? v.name : (v.name ? v.name.split(" (")[0] : "Launch Vehicle");
        var stText = isFa ? (v.status_fa || "عملیاتی") : (v.status_en || v.status_fa || "Operational");
        var stBadge = "badge-private";
        if (stText.indexOf("عملیاتی") > -1 || stText.indexOf("Operational") > -1) stBadge = "badge-gov";

        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
        h += '<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line); padding-bottom:6px; margin-bottom:8px;">';
        h += '<div><span style="font-size:13px; font-weight:bold; color:#fff;">🚀 <bdi>' + esc(rName) + '</bdi></span> <small style="color:var(--muted); font-size:10px;">(' + esc(v.maiden_flight || "—") + ')</small></div>';
        h += '<span class="' + stBadge + '" style="padding:2px 8px; border-radius:10px; font-size:10px;"><bdi>' + esc(stText) + '</bdi></span>';
        h += '</div>';

        var rReu = isFa ? (v.reusability_fa || "یک‌بارمصرف") : (v.reusability_en || "Expendable");
        var rProp = isFa ? (v.propellant_fa || "—") : (v.propellant_en || v.propellant_fa || "—");
        var rEng = isFa ? (v.engine_type_fa || "—") : (v.engine_type_en || v.engine_type_fa || "—");
        var rThr = isFa ? (v.thrust_fa || "—") : (v.thrust_en || v.thrust_fa || "—");
        var rLeo = isFa ? (v.payload_leo_fa || "—") : (v.payload_leo_en || v.payload_leo_fa || "—");
        var rSso = isFa ? (v.payload_sso_fa || "—") : (v.payload_sso_en || v.payload_sso_fa || "—");
        var rGto = isFa ? (v.payload_gto_fa || "—") : (v.payload_gto_en || v.payload_gto_fa || "—");

        var dimText = isFa ?
          ("ارتفاع: " + esc(v.height_fa || "—") + " | قطر: " + esc(v.diameter_fa || "—") + " | جرم: " + esc(v.mass_fa || "—")) :
          ("Height: " + esc(v.height_en || v.height_fa || "—") + " | Diameter: " + esc(v.diameter_en || v.diameter_fa || "—") + " | Mass: " + esc(v.mass_en || v.mass_fa || "—"));

        // Rocket Tech Specs Grid
        h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:10.5px;">';
        h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>' + (isFa ? "تعداد مراحل:" : "Stages:") + '</b> ' + esc(v.stages || 2) + '</div>';
        h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>' + (isFa ? "بازمصرف‌پذیری:" : "Reusability:") + '</b> <bdi>' + esc(rReu) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px; grid-column:span 2;"><b>' + (isFa ? "پیشرانه / سوخت:" : "Propellant:") + '</b> <bdi>' + esc(rProp) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px; grid-column:span 2;"><b>' + (isFa ? "نوع موتور:" : "Engine:") + '</b> <bdi>' + esc(rEng) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>' + (isFa ? "نیروی رانش:" : "Thrust:") + '</b> <bdi>' + esc(rThr) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>' + (isFa ? "ظرفیت LEO:" : "LEO Payload:") + '</b> <bdi>' + esc(rLeo) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>' + (isFa ? "ظرفیت SSO:" : "SSO Payload:") + '</b> <bdi>' + esc(rSso) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>' + (isFa ? "ظرفیت GTO:" : "GTO Payload:") + '</b> <bdi>' + esc(rGto) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px; grid-column:span 2;"><b>' + (isFa ? "ابعاد و جرم:" : "Dimensions:") + '</b> <bdi>' + dimText + '</bdi></div>';
        h += '</div>';

        // Rocket Flights Record
        var flightsLabel = isFa ?
          ('پروازها: <b>' + esc(v.total_launches || 0) + '</b> (موفق: <b style="color:#10b981;">' + esc(v.success_launches || 0) + '</b> | ناموفق: <b style="color:#ef4444;">' + esc(v.failed_launches || 0) + '</b>)') :
          ('Flights: <b>' + esc(v.total_launches || 0) + '</b> (Success: <b style="color:#10b981;">' + esc(v.success_launches || 0) + '</b> | Failed: <b style="color:#ef4444;">' + esc(v.failed_launches || 0) + '</b>)');

        var lastFlightLabel = isFa ?
          ('آخرین پرتاب: <b>' + esc(v.last_launch_fa || "—") + '</b>') :
          ('Last Flight: <b>' + esc(v.last_launch_en || v.last_launch_fa || "—") + '</b>');

        h += '<div style="margin-top:6px; background:rgba(56, 189, 248, 0.08); border:1px solid rgba(56, 189, 248, 0.2); padding:6px; border-radius:4px; font-size:10px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px;">';
        h += '<span>' + flightsLabel + '</span>';
        h += '<span>' + lastFlightLabel + '</span>';
        h += '</div>';

        h += '</div>'; // end rocket card
      });

      h += '</div>'; // end TAB 2

      // TAB 3: TIMELINE & NETWORK
      var timeline = isFa ? (o.timeline_fa || o.timeline_en || []) : (o.timeline_en || o.timeline_fa || []);
      var customers = isFa ? (o.customers_fa || o.customers_en || []) : (o.customers_en || o.customers_fa || []);
      var partners = isFa ? (o.partners_fa || o.partners_en || []) : (o.partners_en || o.partners_fa || []);

      h += '<div id="compTabTimeline" class="site-tab-content" style="display:none;">';
      
      // Timeline Box
      if (timeline.length) {
        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
        h += '<div style="font-size:11.5px; font-weight:bold; color:#f59e0b; margin-bottom:8px;">⏳ ' + (isFa ? "خط زمانی رویدادهای کلیدی و تاریخی" : "Historical Timeline") + '</div>';
        h += '<div style="display:flex; flex-direction:column; gap:8px;">';
        
        timeline.forEach(function(item) {
          var tTitle = isFa ? (item.title || item.title_fa) : (item.title_en || item.title);
          var tDesc = isFa ? (item.desc || item.desc_fa) : (item.desc_en || item.desc);

          h += '<div style="background:rgba(0,0,0,0.25); border-right:3px solid #f59e0b; padding:6px 10px; border-radius:4px; font-size:10.5px;">';
          h += '<div style="font-weight:bold; color:#fff;"><span style="color:#f59e0b; font-family:monospace;">' + esc(item.year) + ':</span> ' + esc(tTitle) + '</div>';
          h += '<div style="color:var(--muted); margin-top:2px; line-height:1.4;">' + esc(tDesc) + '</div>';
          h += '</div>';
        });

        h += '</div></div>';
      }

      // Customers & Partners Network
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:6px;">🤝 ' + (isFa ? "شبکه مشتریان و همکاران پیشرانش" : "Customers & Propulsion Network") + '</div>';
      
      if (customers.length) {
        h += '<div style="font-size:10.5px; margin-bottom:4px;"><b>' + (isFa ? "مشتریان اصلی:" : "Primary Customers:") + '</b></div>';
        h += '<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">';
        customers.forEach(function(cst) {
          h += '<span style="background:rgba(255,255,255,0.05); border:1px solid var(--line); padding:2px 8px; border-radius:4px; font-size:10px;">' + esc(cst) + '</span>';
        });
        h += '</div>';
      }

      if (partners.length) {
        h += '<div style="font-size:10.5px; margin-bottom:4px;"><b>' + (isFa ? "شرکای صنعتی و تامین‌کنندگان پیشرانه:" : "Industrial Partners & Propulsion Suppliers:") + '</b></div>';
        h += '<div style="display:flex; flex-wrap:wrap; gap:4px;">';
        partners.forEach(function(prt) {
          h += '<span style="background:rgba(16, 185, 129, 0.12); border:1px solid rgba(16, 185, 129, 0.3); color:#10b981; padding:2px 8px; border-radius:4px; font-size:10px;">' + esc(prt) + '</span>';
        });
        h += '</div>';
      }

      h += '</div>';

      h += '</div>'; // end TAB 3

    } else {
      // STANDARD / AGENCY DRAWER LAYOUT
      var isAgency = (p.cat === "agency");
      h += '<div class="site-tabs" style="margin-top:10px;">';
      h += '<button class="site-tab-btn active" onclick="switchCompTab(\'overview\', this)">' + (isFa ? "شناسنامه و تایم‌لاین" : "Overview & Timeline") + '</button>';
      h += '<button class="site-tab-btn" onclick="switchCompTab(\'products\', this)">' + (isAgency ? (isFa ? "محصولات و برنامه‌ها" : "Products & Programs") : (isFa ? "سبد محصولات و خدمات" : "Products Portfolio")) + '</button>';
      if (isAgency && (o.gallery || []).length) {
        h += '<button class="site-tab-btn" onclick="switchCompTab(\'gallery\', this)">' + (isFa ? "گالری تصاویر" : "Media Gallery") + '</button>';
      }
      h += '</div>';

      // TAB 1: OVERVIEW
      h += '<div id="compTabOverview" class="site-tab-content active" style="display:block;">';
      h += '<div class="grid2">';
      h += cell(isFa ? "سال تأسیس" : "Founded", o.founded);
      h += cell(isFa ? "مقر اصلی" : "Headquarters", isFa ? (o.city_fa || o.city) : (o.city || o.city_fa));
      h += cell(t("country"), isFa ? (o.country_fa || o.country) : (o.country || o.country_fa));
      h += cell(isFa ? "حوزه‌های فعالیت" : "Sectors", isFa ? (o.sectors_fa || o.sectors || "هوافضا و صنایع فضایی") : (o.sectors_en || "Aerospace Systems"), true);
      h += '</div></div>';

      // TAB 2: PRODUCTS
      h += '<div id="compTabProducts" class="site-tab-content" style="display:none;">';
      h += '<div style="font-size:11px; color:var(--text); line-height:1.5; padding:10px;">' + esc(desc(o)) + '</div>';
      h += '</div>';
    }

    return h;
  }

  /* ================= COUNTRY PROFILE SYSTEM ================= */
  window.openDetailById = function(id, kind) {
    if (!id || typeof DATA === "undefined") return;
    if (kind === "site") {
      var s = (DATA.sites || []).find(function(x) { return x.id === id; });
      if (s) openDetail({ kind: "site", cat: "site", o: s });
    } else {
      var c = (DATA.companies || []).find(function(x) { return x.id === id; });
      if (c) openDetail({ kind: c.cat || "company", cat: c.cat || "launch", o: c });
    }
  };

  function isEntityInCountry(entity, targetEn, targetFa) {
    if (!entity) return false;
    var eCountryEn = (entity.country || "").trim().toLowerCase();
    var eCountryFa = (entity.country_fa || "").trim().toLowerCase();

    var tEn = (targetEn || "").trim().toLowerCase();
    var tFa = (targetFa || "").trim().toLowerCase();

    if (!tEn && !tFa) return false;

    var synMap = {
      "united states of america": ["united states", "usa", "us", "ایالات متحده", "امریکایی", "آمریکا", "ایالات متحده آمریکا"],
      "united states": ["united states of america", "usa", "us", "ایالات متحده", "امریکایی", "آمریکا", "ایالات متحده آمریکا"],
      "usa": ["united states of america", "united states", "us", "ایالات متحده", "آمریکا"],
      "people's republic of china": ["china", "چین", "جمهوری خلق چین"],
      "china": ["people's republic of china", "چین", "جمهوری خلق چین"],
      "russian federation": ["russia", "روسیه", "فدراسیون روسیه"],
      "russia": ["russian federation", "روسیه", "فدراسیون روسیه"],
      "united kingdom": ["uk", "great britain", "britain", "بریتانیا", "انگلیس"],
      "uk": ["united kingdom", "great britain", "britain", "بریتانیا", "انگلیس"],
      "french guiana": ["france", "گویان فرانسه", "فرانسه"],
      "france": ["french guiana", "گویان فرانسه", "فرانسه"],
      "kazakhstan": ["kazakhstan (leased by russia)", "قزاقستان", "قزاقستان (اجارهٔ روسیه)"],
      "united arab emirates": ["uae", "امارات", "امارات متحده عربی"],
      "uae": ["united arab emirates", "امارات", "امارات متحده عربی"],
      "turkey": ["türkiye", "ترکیه"],
      "türkiye": ["turkey", "ترکیه"],
      "south korea": ["korea, republic of", "کره جنوبی"],
      "north korea": ["korea, democratic people's republic of", "کره شمالی", "کرهٔ شمالی"]
    };

    var eEnParts = eCountryEn.split('/').map(function(x) { return x.trim(); });
    var eFaParts = eCountryFa.split('/').map(function(x) { return x.trim(); });

    if (tEn && (eEnParts.indexOf(tEn) > -1 || eCountryEn === tEn)) return true;
    if (tFa && (eFaParts.indexOf(tFa) > -1 || eCountryFa === tFa)) return true;

    var synonyms = [];
    if (tEn in synMap) synonyms = synonyms.concat(synMap[tEn]);
    if (tFa in synMap) synonyms = synonyms.concat(synMap[tFa]);

    for (var i = 0; i < synonyms.length; i++) {
      var s = synonyms[i].trim().toLowerCase();
      if (eEnParts.indexOf(s) > -1 || eCountryEn === s) return true;
      if (eFaParts.indexOf(s) > -1 || eCountryFa === s) return true;
    }

    return false;
  }

  function extractEntityLinks(item) {
    if (!item) return { webUrl: null, displayWeb: null, linkedinUrl: null, displayLinkedin: null };
    var rawWeb = item.website || item.website_url || item.site || item.official_website || (item.contacts ? item.contacts.website : null);
    var webUrl = rawWeb ? (rawWeb.startsWith("http") ? rawWeb : "https://" + rawWeb) : null;
    var displayWeb = webUrl ? webUrl.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "") : null;

    var rawLinkedin = item.linkedin || item.linkedin_url || (item.contacts ? item.contacts.linkedin : null);
    var linkedinUrl = rawLinkedin ? (rawLinkedin.startsWith("http") ? rawLinkedin : "https://" + rawLinkedin) : null;
    var displayLinkedin = linkedinUrl ? linkedinUrl.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "") : null;

    return { webUrl: webUrl, displayWeb: displayWeb, linkedinUrl: linkedinUrl, displayLinkedin: displayLinkedin };
  }

  function renderCountryProfile(p) {
    var isFa = (typeof LANG !== "undefined" && LANG === "fa");
    
    // Determine Country Name
    var cEn = p.country_en || (p.o ? p.o.country_en || p.o.country : null) || p.country || "Iran";
    var cFa = p.country_fa || (p.o ? p.o.country_fa : null) || countryOf(cEn) || cEn;

    var allCompanies = (typeof DATA !== "undefined" && DATA.companies) ? DATA.companies : [];
    var allSites = (typeof DATA !== "undefined" && DATA.sites) ? DATA.sites : [];

    // Filter items for this country using smart synonym & spatial matching
    var propulsionItems = allCompanies.filter(function(c) {
      var isC = isEntityInCountry(c, cEn, cFa);
      var isP = (c.category === "propulsion" || c.org_type_en === "Propulsion Contractor" || "engine_products_bilingual" in c || c.cat === "propulsion");
      return isC && isP;
    });

    propulsionItems.sort(function(a, b) {
      if (a.id === "aio-propulsion") return -1;
      if (b.id === "aio-propulsion") return 1;
      return (a.fa || a.en || "").localeCompare(b.fa || b.en || "");
    });

    var launchItems = allCompanies.filter(function(c) {
      var isC = isEntityInCountry(c, cEn, cFa);
      var isL = (c.cat === "launch" || "rockets_fleet" in c || c.org_type_en === "Launch Operator");
      return isC && isL;
    });

    launchItems.sort(function(a, b) {
      if (a.id === "irgc-space" || a.id === "aio-iran") return -1;
      if (b.id === "irgc-space" || b.id === "aio-iran") return 1;
      return (a.fa || a.en || "").localeCompare(b.fa || b.en || "");
    });

    var agencyItems = allCompanies.filter(function(c) {
      var isC = isEntityInCountry(c, cEn, cFa);
      var isA = (c.cat === "agency");
      return isC && isA;
    });

    var siteItems = allSites.filter(function(s) {
      var isC = isEntityInCountry(s, cEn, cFa);
      return isC;
    });

    var totalEntities = propulsionItems.length + launchItems.length + agencyItems.length + siteItems.length;

    var h = "";

    // Header Title (NO COUNTRY FLAGS PER EXPLICIT USER CONSTRAINT!)
    h += '<div class="d-head" style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-inline-end:35px;">';
    h += '<div style="display:flex; gap:10px; align-items:center; flex:1;">';
    h += '<div style="font-size:28px; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.3); border-radius:8px; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">🌍</div>';
    h += '<div><div class="d-kicker">' + (isFa ? "شناسنامه جامع فضایی کشور" : "National Space Dossier") + '</div>';
    h += '<h2 class="d-title" style="margin:0;">' + esc(isFa ? cFa : cEn) + '</h2></div></div>';
    h += '<span class="badge-gov" style="padding:3px 10px; border-radius:12px; font-size:10.5px; font-weight:bold; white-space:nowrap;">' + (isFa ? (totalEntities + " مرکز فعال") : (totalEntities + " Active Entities")) + '</span>';
    h += '</div>';

    h += '<div class="d-sub" style="margin-top:4px;">' + esc(isFa ? cEn : cFa) + '</div>';

    // SECTION 1: SHARE & OVERVIEW 4-GRID BANNER (سهم و آمار فضایی کشور)
    h += '<div style="background:linear-gradient(135deg, rgba(15, 31, 51, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%); border:1px solid rgba(56, 189, 248, 0.35); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 16px rgba(0,0,0,0.4);">';
    h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:8px; display:flex; align-items:center; gap:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px;">📊 ' + (isFa ? "سهم و آمار توزیع زیرساخت‌های فضایی کشور:" : "Space Infrastructure Share Distribution:") + '</div>';
    
    h += '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; text-align:center;">';
    
    // 1. Propulsion
    h += '<div style="background:rgba(245, 158, 11, 0.1); padding:8px 4px; border-radius:6px; border:1px solid rgba(245, 158, 11, 0.3);">';
    h += '<div style="font-size:16px; font-weight:bold; color:#f59e0b;">' + esc(propulsionItems.length) + '</div>';
    h += '<div style="font-size:9px; color:#f59e0b; margin-top:2px;">' + (isFa ? "پیشرانش" : "Propulsion") + '</div>';
    h += '</div>';

    // 2. Launch
    h += '<div style="background:rgba(16, 185, 129, 0.1); padding:8px 4px; border-radius:6px; border:1px solid rgba(16, 185, 129, 0.3);">';
    h += '<div style="font-size:16px; font-weight:bold; color:#10b981;">' + esc(launchItems.length) + '</div>';
    h += '<div style="font-size:9px; color:#10b981; margin-top:2px;">' + (isFa ? "پرتاب‌گرها" : "Launch") + '</div>';
    h += '</div>';

    // 3. Agencies
    h += '<div style="background:rgba(56, 189, 248, 0.1); padding:8px 4px; border-radius:6px; border:1px solid rgba(56, 189, 248, 0.3);">';
    h += '<div style="font-size:16px; font-weight:bold; color:#38bdf8;">' + esc(agencyItems.length) + '</div>';
    h += '<div style="font-size:9px; color:#38bdf8; margin-top:2px;">' + (isFa ? "سازمان‌ها" : "Agencies") + '</div>';
    h += '</div>';

    // 4. Sites
    h += '<div style="background:rgba(239, 68, 68, 0.1); padding:8px 4px; border-radius:6px; border:1px solid rgba(239, 68, 68, 0.3);">';
    h += '<div style="font-size:16px; font-weight:bold; color:#ef4444;">' + esc(siteItems.length) + '</div>';
    h += '<div style="font-size:9px; color:#ef4444; margin-top:2px;">' + (isFa ? "پایگاه‌ها" : "Spaceports") + '</div>';
    h += '</div>';

    h += '</div></div>';

    // SECTION 2: 4 DEDICATED TABS
    h += '<div class="site-tabs" style="margin-top:10px;">';
    h += '<button class="site-tab-btn active" onclick="switchCompTab(\'cPropulsion\', this)">' + (isFa ? "شرکت‌های پیشران" : "Propulsion") + ' (' + propulsionItems.length + ')</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'cLaunch\', this)">' + (isFa ? "شرکت‌های پرتاب" : "Launch") + ' (' + launchItems.length + ')</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'cAgency\', this)">' + (isFa ? "سازمان‌های فضایی" : "Agencies") + ' (' + agencyItems.length + ')</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'cSite\', this)">' + (isFa ? "پایگاه‌های پرتاب" : "Sites") + ' (' + siteItems.length + ')</button>';
    h += '</div>';

    // TAB 1: PROPULSION CONTRACTORS
    h += '<div id="compTabCPropulsion" class="site-tab-content active" style="display:block;">';
    if (propulsionItems.length) {
      h += '<div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">';
      propulsionItems.forEach(function(item) {
        var nameStr = isFa ? (item.fa || item.en) : (item.en || item.fa);
        var cityStr = isFa ? (item.city_fa || item.city || "—") : (item.city || item.city_fa || "—");
        var catStr = isFa ? (item.propulsion_category_fa || item.propulsion_category_en || "پیشرانه فضایی") : (item.propulsion_category_en || "Propulsion");
        var defaultLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%23f59e0b' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%23f59e0b' text-anchor='middle'>⚙️</text></svg>";
        var logoSrc = item.logo_data || item.logo || defaultLogo;

        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:flex; justify-content:space-between; align-items:center;">';
        h += '<div style="display:flex; align-items:center; gap:8px;">';
        h += '<img src="' + esc(logoSrc) + '" alt="" onerror="this.src=defaultLogo;" style="width:28px; height:28px; object-fit:contain; border-radius:4px; background:#000; padding:1px; border:1px solid var(--line);" />';
        h += '<div><b style="font-size:11.5px; color:#fff;"><bdi>' + esc(nameStr) + '</bdi></b>';
        h += '<div style="font-size:9.5px; color:var(--muted);">📍 ' + esc(cityStr) + '</div></div>';
        h += '</div>';
        h += '<span style="font-size:9.5px; color:#f59e0b; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); padding:2px 6px; border-radius:10px;"><bdi>' + esc(catStr) + '</bdi></span>';
        h += '</div>';

        // Description Kicker
        var shortDesc = desc(item);
        if (shortDesc) {
          h += '<div style="font-size:10px; color:var(--text); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">' + esc(shortDesc) + '</div>';
        }

        // LINKS & 2 ACTION BUTTONS UNDER EACH ENTITY CARD
        var links = extractEntityLinks(item);
        if (links.webUrl || links.linkedinUrl) {
          h += '<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:2px;">';
          if (links.webUrl) {
            h += '<a href="' + esc(links.webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.35); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">🌐 ' + esc(links.displayWeb || "Website") + ' ↗</a>';
          }
          if (links.linkedinUrl) {
            h += '<a href="' + esc(links.linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(14, 118, 168, 0.18); border:1px solid rgba(14, 118, 168, 0.45); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">💼 ' + esc(links.displayLinkedin || "LinkedIn") + ' ↗</a>';
          }
          h += '</div>';
        }

        h += '<div style="display:flex; gap:6px; margin-top:4px;">';
        if (item.lat && item.lon) {
          h += '<button type="button" onclick="flyToCoords(' + item.lat + ',' + item.lon + ', 8)" class="btn btn-sm country-btn-fly" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer;">📍 ' + (isFa ? "مشاهده روی نقشه" : "Fly on Map") + '</button>';
        }
        h += '<button type="button" onclick="openDetailById(\'' + esc(item.id) + '\', \'propulsion\')" class="btn btn-sm country-btn-detail" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.4); color:#38bdf8;">📖 ' + (isFa ? "باز شدن جزئیات" : "Open Details") + '</button>';
        h += '</div>';

        h += '</div>'; // end entity card
      });
      h += '</div>';
    } else {
      h += '<div style="padding:16px; text-align:center; color:var(--muted); font-size:11px;">' + (isFa ? "هیچ مرکز پیشرانش ثبت‌شده‌ای برای این کشور یافت نشد." : "No registered propulsion contractors for this country.") + '</div>';
    }
    h += '</div>'; // end TAB 1

    // TAB 2: LAUNCH OPERATORS
    h += '<div id="compTabCLaunch" class="site-tab-content" style="display:none;">';
    if (launchItems.length) {
      h += '<div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">';
      launchItems.forEach(function(item) {
        var nameStr = isFa ? (item.fa || item.en) : (item.en || item.fa);
        var cityStr = isFa ? (item.city_fa || item.city || "—") : (item.city || item.city_fa || "—");
        var orgStr = isFa ? (item.org_type_fa || "شرکت پرتاب تجاری") : (item.org_type_en || "Launch Provider");
        var defaultLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%2310b981' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%2310b981' text-anchor='middle'>🚀</text></svg>";
        var logoSrc = item.logo_data || item.logo || defaultLogo;

        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:flex; justify-content:space-between; align-items:center;">';
        h += '<div style="display:flex; align-items:center; gap:8px;">';
        h += '<img src="' + esc(logoSrc) + '" alt="" onerror="this.src=defaultLogo;" style="width:28px; height:28px; object-fit:contain; border-radius:4px; background:#000; padding:1px; border:1px solid var(--line);" />';
        h += '<div><b style="font-size:11.5px; color:#fff;"><bdi>' + esc(nameStr) + '</bdi></b>';
        h += '<div style="font-size:9.5px; color:var(--muted);">📍 ' + esc(cityStr) + '</div></div>';
        h += '</div>';
        h += '<span style="font-size:9.5px; color:#10b981; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); padding:2px 6px; border-radius:10px;"><bdi>' + esc(orgStr) + '</bdi></span>';
        h += '</div>';

        // Description Kicker
        var shortDesc = desc(item);
        if (shortDesc) {
          h += '<div style="font-size:10px; color:var(--text); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">' + esc(shortDesc) + '</div>';
        }

        // LINKS & 2 ACTION BUTTONS UNDER EACH ENTITY CARD
        var links = extractEntityLinks(item);
        if (links.webUrl || links.linkedinUrl) {
          h += '<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:2px;">';
          if (links.webUrl) {
            h += '<a href="' + esc(links.webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.35); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">🌐 ' + esc(links.displayWeb || "Website") + ' ↗</a>';
          }
          if (links.linkedinUrl) {
            h += '<a href="' + esc(links.linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(14, 118, 168, 0.18); border:1px solid rgba(14, 118, 168, 0.45); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">💼 ' + esc(links.displayLinkedin || "LinkedIn") + ' ↗</a>';
          }
          h += '</div>';
        }

        h += '<div style="display:flex; gap:6px; margin-top:4px;">';
        if (item.lat && item.lon) {
          h += '<button type="button" onclick="flyToCoords(' + item.lat + ',' + item.lon + ', 8)" class="btn btn-sm country-btn-fly" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer;">📍 ' + (isFa ? "مشاهده روی نقشه" : "Fly on Map") + '</button>';
        }
        h += '<button type="button" onclick="openDetailById(\'' + esc(item.id) + '\', \'launch\')" class="btn btn-sm country-btn-detail" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.4); color:#38bdf8;">📖 ' + (isFa ? "باز شدن جزئیات" : "Open Details") + '</button>';
        h += '</div>';

        h += '</div>'; // end entity card
      });
      h += '</div>';
    } else {
      h += '<div style="padding:16px; text-align:center; color:var(--muted); font-size:11px;">' + (isFa ? "هیچ اپراتور پرتابی برای این کشور یافت نشد." : "No launch operators for this country.") + '</div>';
    }
    h += '</div>'; // end TAB 2

    // TAB 3: SPACE AGENCIES
    h += '<div id="compTabCAgency" class="site-tab-content" style="display:none;">';
    if (agencyItems.length) {
      h += '<div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">';
      agencyItems.forEach(function(item) {
        var nameStr = isFa ? (item.fa || item.en) : (item.en || item.fa);
        var cityStr = isFa ? (item.city_fa || item.city || "—") : (item.city || item.city_fa || "—");
        var orgStr = isFa ? (item.org_type_fa || "سازمان فضایی دولتی") : (item.org_type_en || "Space Agency");
        var defaultLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%2338bdf8' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%2338bdf8' text-anchor='middle'>🏛️</text></svg>";
        var logoSrc = item.logo_data || item.logo || defaultLogo;

        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:flex; justify-content:space-between; align-items:center;">';
        h += '<div style="display:flex; align-items:center; gap:8px;">';
        h += '<img src="' + esc(logoSrc) + '" alt="" onerror="this.src=defaultLogo;" style="width:28px; height:28px; object-fit:contain; border-radius:4px; background:#000; padding:1px; border:1px solid var(--line);" />';
        h += '<div><b style="font-size:11.5px; color:#fff;"><bdi>' + esc(nameStr) + '</bdi></b>';
        h += '<div style="font-size:9.5px; color:var(--muted);">📍 ' + esc(cityStr) + '</div></div>';
        h += '</div>';
        h += '<span style="font-size:9.5px; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); padding:2px 6px; border-radius:10px;"><bdi>' + esc(orgStr) + '</bdi></span>';
        h += '</div>';

        // Description Kicker
        var shortDesc = desc(item);
        if (shortDesc) {
          h += '<div style="font-size:10px; color:var(--text); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">' + esc(shortDesc) + '</div>';
        }

        // LINKS & 2 ACTION BUTTONS UNDER EACH ENTITY CARD
        var links = extractEntityLinks(item);
        if (links.webUrl || links.linkedinUrl) {
          h += '<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:2px;">';
          if (links.webUrl) {
            h += '<a href="' + esc(links.webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.35); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">🌐 ' + esc(links.displayWeb || "Website") + ' ↗</a>';
          }
          if (links.linkedinUrl) {
            h += '<a href="' + esc(links.linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(14, 118, 168, 0.18); border:1px solid rgba(14, 118, 168, 0.45); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">💼 ' + esc(links.displayLinkedin || "LinkedIn") + ' ↗</a>';
          }
          h += '</div>';
        }

        h += '<div style="display:flex; gap:6px; margin-top:4px;">';
        if (item.lat && item.lon) {
          h += '<button type="button" onclick="flyToCoords(' + item.lat + ',' + item.lon + ', 8)" class="btn btn-sm country-btn-fly" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer;">📍 ' + (isFa ? "مشاهده روی نقشه" : "Fly on Map") + '</button>';
        }
        h += '<button type="button" onclick="openDetailById(\'' + esc(item.id) + '\', \'agency\')" class="btn btn-sm country-btn-detail" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.4); color:#38bdf8;">📖 ' + (isFa ? "باز شدن جزئیات" : "Open Details") + '</button>';
        h += '</div>';

        h += '</div>'; // end entity card
      });
      h += '</div>';
    } else {
      h += '<div style="padding:16px; text-align:center; color:var(--muted); font-size:11px;">' + (isFa ? "هیچ سازمان فضایی برای این کشور ثبت نشده است." : "No space agency registered for this country.") + '</div>';
    }
    h += '</div>'; // end TAB 3

    // TAB 4: LAUNCH SITES
    h += '<div id="compTabCSite" class="site-tab-content" style="display:none;">';
    if (siteItems.length) {
      h += '<div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">';
      siteItems.forEach(function(item) {
        var nameStr = isFa ? (item.fa || item.en) : (item.en || item.fa);
        var locStr = isFa ? (item.loc_fa || item.loc || "—") : (item.loc || item.loc_fa || "—");
        var stStr = isFa ? (item.status === "active" ? "فعال و عملیاتی" : "غیرفعال / تاریخی") : (item.status === "active" ? "Active Spaceport" : "Inactive");

        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:flex; justify-content:space-between; align-items:center;">';
        h += '<div><b style="font-size:11.5px; color:#fff;">📍 <bdi>' + esc(nameStr) + '</bdi></b>';
        h += '<div style="font-size:9.5px; color:var(--muted); margin-top:2px;">🌍 ' + esc(locStr) + '</div></div>';
        h += '<span style="font-size:9.5px; color:#ef4444; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); padding:2px 6px; border-radius:10px;"><bdi>' + esc(stStr) + '</bdi></span>';
        h += '</div>';

        // Description Kicker
        var shortDesc = desc(item);
        if (shortDesc) {
          h += '<div style="font-size:10px; color:var(--text); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">' + esc(shortDesc) + '</div>';
        }

        // LINKS & 2 ACTION BUTTONS UNDER EACH ENTITY CARD
        var links = extractEntityLinks(item);
        if (links.webUrl || links.linkedinUrl) {
          h += '<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:2px;">';
          if (links.webUrl) {
            h += '<a href="' + esc(links.webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.35); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">🌐 ' + esc(links.displayWeb || "Website") + ' ↗</a>';
          }
          if (links.linkedinUrl) {
            h += '<a href="' + esc(links.linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(14, 118, 168, 0.18); border:1px solid rgba(14, 118, 168, 0.45); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">💼 ' + esc(links.displayLinkedin || "LinkedIn") + ' ↗</a>';
          }
          h += '</div>';
        }

        h += '<div style="display:flex; gap:6px; margin-top:4px;">';
        if (item.lat && item.lon) {
          h += '<button type="button" onclick="flyToCoords(' + item.lat + ',' + item.lon + ', 8)" class="btn btn-sm country-btn-fly" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer;">📍 ' + (isFa ? "مشاهده روی نقشه" : "Fly on Map") + '</button>';
        }
        h += '<button type="button" onclick="openDetailById(\'' + esc(item.id) + '\', \'site\')" class="btn btn-sm country-btn-detail" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.4); color:#38bdf8;">📖 ' + (isFa ? "باز شدن جزئیات" : "Open Details") + '</button>';
        h += '</div>';

        h += '</div>'; // end site card
      });
      h += '</div>';
    } else {
      h += '<div style="padding:16px; text-align:center; color:var(--muted); font-size:11px;">' + (isFa ? "هیچ پایگاه پرتاب ثبت‌شده‌ای برای این کشور یافت نشد." : "No registered launch sites for this country.") + '</div>';
    }
    h += '</div>'; // end TAB 4

    return h;
  }
  window.isEntityInCountry = isEntityInCountry;
  window.getCountryAtLngLat = getCountryAtLngLat;
  window.renderCompanyDetail = renderCompanyDetail;
  window.renderCountryProfile = renderCountryProfile;
  window.bindCountryItemClicks = function() {};


  function renderAgencyDetail(p) {
    var o = p.o || p, h = "";
    var isFa = (typeof LANG !== "undefined" && LANG === "fa");

    var orgTypeStr = isFa ? (o.org_type_fa || "سازمان فضایی دولتی") : (o.org_type_en || o.org_type || "Government Space Agency");

    // Logo with graceful SVG fallback
    var defaultLogoSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%2338bdf8' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%2338bdf8' text-anchor='middle'>🏛️</text></svg>";
    var logoSrc = o.logo_data || o.logo || defaultLogoSvg;

    // Header
    h += '<div class="d-head" style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-inline-end: 35px;">';
    h += '<div style="display:flex; gap:10px; align-items:center; flex:1;">';
    h += '<div style="width:48px; height:48px; border-radius:8px; background:#000; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; padding:2px;">';
    h += '<img src="' + esc(logoSrc) + '" alt="' + esc(name(o)) + '" onerror="this.onerror=null; this.src=defaultLogoSvg;" style="max-width:100%; max-height:100%; object-fit:contain;" />';
    h += '</div>';
    h += '<div><div class="d-kicker">' + esc(t("cat_agency")) + '</div>';
    h += '<h2 class="d-title" style="margin:0;">' + esc(name(o)) + '</h2></div></div>';
    h += '<span class="badge-gov" style="padding:3px 10px; border-radius:12px; font-size:10.5px; font-weight:bold; white-space:nowrap;">' + esc(orgTypeStr) + '</span>';
    h += '</div>';

    h += '<div class="d-sub" style="margin-top:4px;">' + esc(isFa ? (o.en || o.fa) : (o.fa || o.en)) + '</div>';
    h += '<div class="d-desc" style="margin-top:6px; line-height:1.6;">' + esc(desc(o)) + '</div>';

    // 3 Tabs
    h += '<div class="site-tabs" style="margin-top:10px;">';
    h += '<button class="site-tab-btn active" onclick="switchCompTab(\'overview\', this)">' + (isFa ? "شناسنامه و برنامه‌های اصلی" : "Overview & Core Flagships") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'products\', this)">' + (isFa ? "محصولات و برنامه‌های کلان" : "Products & Programs") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'timeline\', this)">' + (isFa ? "سیر تاریخی و شبکه" : "Timeline & Network") + '</button>';
    h += '</div>';

    // TAB 1: OVERVIEW & CORE FLAGSHIPS
    h += '<div id="compTabOverview" class="site-tab-content active" style="display:block;">';
    
    // Executive 6-Grid Box
    h += '<div class="grid2" style="margin-top:8px;">';
    h += cell(isFa ? "سال تأسیس" : "Founded", o.founded || "—");
    h += cell(isFa ? "مقر اصلی" : "Headquarters", isFa ? (o.city_fa || o.city) : (o.city || o.city_fa));
    h += cell(t("country"), isFa ? (o.country_fa || o.country) : (o.country || o.country_fa));
    h += cell(isFa ? "حوزه‌های فعالیت" : "Sectors", isFa ? (o.sectors_fa || "هوافضا و علوم فضایی") : (o.sectors_en || "Aerospace & Space Science"), true);
    h += cell(isFa ? "نوع نهاد" : "Org Type", orgTypeStr, true);
    h += cell(isFa ? "سطح فعالیت" : "Scope", isFa ? "ملی و بین‌المللی" : "Global / National", true);
    h += '</div>';

    // SECTION 1: FLAGSHIP PRODUCT CARD
    var flagProdName = isFa ? (o.flagship_product_fa || o.flagship_product) : (o.flagship_product_en || o.flagship_product);
    var flagProdStatus = isFa ? (o.flagship_prod_status_fa || "عملیاتی") : (o.flagship_prod_status_en || "Operational");
    var flagProdExpl = isFa ? (o.flagship_prod_expl_fa || o.flagship_prod_expl) : (o.flagship_prod_expl_en || o.flagship_prod_expl);

    if (flagProdName) {
      h += '<div style="background:linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 31, 51, 0.85) 100%); border:1px solid rgba(245, 158, 11, 0.4); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">';
      h += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">';
      h += '<span style="font-size:12px; font-weight:bold; color:#f59e0b;">🏆 ' + (isFa ? "محصول شاخص:" : "Flagship Product:") + ' <b><bdi style="color:#fff;">' + esc(flagProdName) + '</bdi></b></span>';
      h += '<span class="badge-gov" style="padding:2px 8px; border-radius:10px; font-size:10px; background:rgba(245, 158, 11, 0.2); border:1px solid rgba(245, 158, 11, 0.4); color:#f59e0b;">' + esc(flagProdStatus) + '</span>';
      h += '</div>';
      if (flagProdExpl) {
        h += '<div style="font-size:10.5px; color:var(--text); margin-top:4px; line-height:1.6;">' + esc(flagProdExpl) + '</div>';
      }
      h += '</div>';
    }

    // SECTION 2: FLAGSHIP PROGRAM CARD
    var flagProgName = isFa ? (o.flagship_program_fa || o.flagship_program) : (o.flagship_program_en || o.flagship_program);
    var flagProgTimeline = isFa ? (o.flagship_prog_timeline_fa || o.flagship_prog_timeline || "۲۰۲۰ تا کنون") : (o.flagship_prog_timeline_en || o.flagship_prog_timeline || "2020 to Present");
    var flagProgExpl = isFa ? (o.flagship_prog_expl_fa || o.flagship_prog_expl) : (o.flagship_prog_expl_en || o.flagship_prog_expl);

    if (flagProgName) {
      h += '<div style="background:linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 31, 51, 0.85) 100%); border:1px solid rgba(16, 185, 129, 0.4); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">';
      h += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">';
      h += '<span style="font-size:12px; font-weight:bold; color:#10b981;">🚀 ' + (isFa ? "برنامه کلان شاخص:" : "Flagship Program:") + ' <b><bdi style="color:#fff;">' + esc(flagProgName) + '</bdi></b></span>';
      h += '<span style="padding:2px 8px; border-radius:10px; font-size:10px; background:rgba(16, 185, 129, 0.2); border:1px solid rgba(16, 185, 129, 0.4); color:#10b981;">' + esc(flagProgTimeline) + '</span>';
      h += '</div>';
      if (flagProgExpl) {
        h += '<div style="font-size:10.5px; color:var(--text); margin-top:4px; line-height:1.6;">' + esc(flagProgExpl) + '</div>';
      }
      h += '</div>';
    }

    // SECTION 3: OFFICIAL CONTACTS & LINKS BAR (DISPLAY ACTUAL DOMAIN NAME TEXT INSTEAD OF GENERIC Official Website)
    var agencyLinks = extractEntityLinks(o);
    var rawWeb = agencyLinks.webUrl;
    var webUrl = rawWeb ? (rawWeb.startsWith("http") ? rawWeb : "https://" + rawWeb) : "https://isa.ir";
    var displayWebDomain = webUrl.replace("https://", "").replace("http://", "").replace("www.", "").replace(/\/$/, "");
    
    var rawLinkedin = o.linkedin || (o.contacts ? o.contacts.linkedin : null);
    var linkedinUrl = rawLinkedin ? (rawLinkedin.startsWith("http") ? rawLinkedin : "https://" + rawLinkedin) : "https://linkedin.com/company/isa-iran";
    var displayLinkedin = linkedinUrl.replace("https://", "").replace("http://", "").replace("www.", "").replace(/\/$/, "");

    var emailAddr = o.email || (o.contacts ? o.contacts.email : null) || "info@isa.ir";

    h += '<div style="background:linear-gradient(135deg, rgba(15, 31, 51, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%); border:1px solid rgba(56, 189, 248, 0.35); border-radius:8px; padding:12px; margin-top:12px; box-shadow:0 6px 16px rgba(0,0,0,0.4); backdrop-filter:blur(8px);">';
    h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:10px; display:flex; align-items:center; gap:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px;">🌐 ' + (isFa ? "درگاه‌های رسمی ارتباطی و وب‌سایت سازمان:" : "Official Communication Channels:") + '</div>';
    
    h += '<div style="display:flex; flex-direction:column; gap:8px;">';
    
    // Website Row (Displays actual domain URL text like isa.ir ↗)
    h += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(16, 185, 129, 0.3);">';
    h += '<span style="font-size:10.5px; color:#fff; font-weight:bold;">🌐 ' + (isFa ? "وب‌سایت رسمی:" : "Official Website:") + '</span>';
    h += '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#10b981; font-weight:bold; text-decoration:none; background:rgba(16, 185, 129, 0.15); padding:4px 12px; border-radius:5px; border:1px solid rgba(16, 185, 129, 0.4); font-size:10.5px; font-family:monospace; display:flex; align-items:center; gap:4px;"><bdi>' + esc(displayWebDomain) + '</bdi> ↗</a>';
    h += '</div>';

    // LinkedIn Row
    if (linkedinUrl && linkedinUrl !== "#") {
      h += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(56, 189, 248, 0.3);">';
      h += '<span style="font-size:10.5px; color:#fff; font-weight:bold;">💼 ' + (isFa ? "صفحه رسمی لینکدین:" : "Official LinkedIn:") + '</span>';
      h += '<a href="' + esc(linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-weight:bold; text-decoration:none; background:rgba(56, 189, 248, 0.15); padding:4px 12px; border-radius:5px; border:1px solid rgba(56, 189, 248, 0.4); font-size:10.5px; font-family:monospace; display:flex; align-items:center; gap:4px;"><bdi>' + esc(displayLinkedin) + '</bdi> ↗</a>';
      h += '</div>';
    }

    // Email Row
    if (emailAddr) {
      h += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(245, 158, 11, 0.3);">';
      h += '<span style="font-size:10.5px; color:#fff; font-weight:bold;">📧 ' + (isFa ? "پست الکترونیک ارتباطی:" : "Contact Email:") + '</span>';
      h += '<a href="mailto:' + esc(emailAddr) + '" style="color:#f59e0b; font-weight:bold; font-size:10.5px; font-family:monospace; background:rgba(245, 158, 11, 0.15); padding:4px 12px; border-radius:5px; border:1px solid rgba(245, 158, 11, 0.4); text-decoration:none;"><bdi>' + esc(emailAddr) + '</bdi></a>';
      h += '</div>';
    }

    h += '</div></div>';

    h += '</div>'; // end TAB 1

    // TAB 2: PRODUCTS & UMBRELLA PROGRAMS
    h += '<div id="compTabProducts" class="site-tab-content" style="display:none;">';
    var pList = o.products_list_bilingual || o.products_list || [];
    var prgList = o.programs_list_bilingual || o.programs_list || [];
    var notMissions = isFa ? (o.notable_missions_detail_fa || o.notable_missions_detail) : (o.notable_missions_detail_en || o.notable_missions_detail);

    // 1. Hardware Products Section
    if (pList.length) {
      h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:8px;">🛠️ ' + (isFa ? "برای مشاهده مشخصات فنی، کلاس فیزیکی و شرح کاربردی روی هر محصول کلیک کنید:" : "Click on any product to expand physical class, technical specifications & operational role:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">';
      
      pList.forEach(function(item, idx) {
        var pName = isFa ? (item.name_fa || item.name) : (item.name_en || item.name);
        var pClass = isFa ? (item.class_fa || item.type_fa || item.type || "پلتفرم مداری بومی") : (item.class_en || item.type_en || item.type || "Indigenous Space Platform");
        var pYear = isFa ? (item.first_flight_fa || item.first_flight || "—") : (item.first_flight_en || item.first_flight || "—");
        var pSt = isFa ? (item.status_fa || item.status || "عملیاتی") : (item.status_en || item.status || "Operational");
        var pSpecs = isFa ? (item.specs_fa || item.specs || "—") : (item.specs_en || item.specs || "—");
        var pRole = isFa ? (item.role_fa || item.role || "—") : (item.role_en || item.role || "—");

        var openAttr = (idx === 0) ? " open" : "";
        h += '<details class="acc" ' + openAttr + ' style="background:linear-gradient(180deg, rgba(15,31,51,0.85) 0%, rgba(9,13,22,0.95) 100%); border:1px solid var(--line); border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:all 0.2s ease;">';
        
        // Summary Header Bar
        h += '<summary style="padding:10px 12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; user-select:none; background:rgba(255,255,255,0.03); outline:none;">';
        h += '<div style="font-size:12px; font-weight:bold; color:#fff; flex:1; line-height:1.5;">📡 <bdi>' + esc(pName) + '</bdi></div>';
        h += '<span style="color:var(--muted); font-size:10px; opacity:0.8; margin-inline-start:8px;">▼</span>';
        h += '</summary>';

        // Sleek Collapsible Details Body
        h += '<div style="padding:12px; border-top:1px solid rgba(255,255,255,0.08); background:rgba(4,10,18,0.7); font-size:10.5px; display:flex; flex-direction:column; gap:8px;">';
        
        // Grid
        h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line); grid-column:span 2;"><b>' + (isFa ? "کلاس فیزیکی سامانه:" : "Physical Class:") + '</b> <bdi style="color:#38bdf8; font-weight:bold; margin-inline-start:4px;">' + esc(pClass) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>' + (isFa ? "وضعیت عملیاتی:" : "Status:") + '</b> <br><bdi style="color:#10b981; font-weight:bold;">' + esc(pSt) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>' + (isFa ? "سال ساخت / نخستین پرتاب:" : "First Launch:") + '</b> <br><span style="color:#f59e0b; font-weight:bold;"><bdi>' + esc(pYear) + '</bdi></span></div>';
        h += '</div>';

        // Technical Specs Highlight Box
        if (pSpecs && pSpecs !== "—") {
          h += '<div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.25); padding:8px 10px; border-radius:6px;">';
          h += '<div style="font-size:11px; font-weight:bold; color:#10b981; margin-bottom:3px; display:flex; align-items:center; gap:4px;">⚙️ ' + (isFa ? "مشخصات فنی و پارامترها:" : "Technical Specifications:") + '</div>';
          h += '<div style="font-size:10px; color:#fff; line-height:1.5;"><bdi>' + esc(pSpecs) + '</bdi></div>';
          h += '</div>';
        }

        // Operational Role Highlight Box
        if (pRole && pRole !== "—") {
          h += '<div style="background:rgba(15, 31, 51, 0.6); border:1px solid rgba(245, 158, 11, 0.35); border-radius:6px; padding:8px 10px;">';
          h += '<div style="font-size:11px; font-weight:bold; color:#f59e0b; margin-bottom:3px; display:flex; align-items:center; gap:4px;">🛠️ ' + (isFa ? "شرح کاربردی و مأموریت مداری:" : "Operational Role & Mission:") + '</div>';
          h += '<div style="font-size:10px; color:var(--text); line-height:1.5;"><bdi>' + esc(pRole) + '</bdi></div>';
          h += '</div>';
        }

        h += '</div>';
        h += '</details>';
      });
      h += '</div>';
    }

    // 2. Umbrella Programs & Constellations Section
    if (prgList.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#f59e0b; margin-bottom:6px;">🚀 ' + (isFa ? "برنامه‌های کلان استراتژیک و منظومه‌ها:" : "Umbrella Programs & Space Constellations:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:6px;">';
      prgList.forEach(function(prg) {
        var prgName = isFa ? (prg.name_fa || prg.name) : (prg.name_en || prg.name);
        var prgAuth = isFa ? (prg.authority_fa || prg.authority) : (prg.authority_en || prg.authority);
        var prgObj = isFa ? (prg.objective_fa || prg.objective) : (prg.objective_en || prg.objective);
        var prgNext = isFa ? (prg.next_step_fa || prg.next_step) : (prg.next_step_en || prg.next_step);

        h += '<div style="background:rgba(0,0,0,0.3); border-right:3px solid #f59e0b; padding:8px 10px; border-radius:6px; font-size:10.5px;">';
        h += '<b style="color:#fff; font-size:11px;">🌌 <bdi>' + esc(prgName) + '</bdi></b>';
        if (prgObj) h += '<div style="color:var(--text); font-size:10px; margin-top:3px; line-height:1.5;"><b>' + (isFa ? "هدف کلان:" : "Objective:") + '</b> <bdi>' + esc(prgObj) + '</bdi></div>';
        if (prgNext) h += '<div style="color:#38bdf8; font-size:9.5px; margin-top:3px;"><b>' + (isFa ? "گام بعدی:" : "Next Step:") + '</b> <bdi>' + esc(prgNext) + '</bdi></div>';
        h += '</div>';
      });
      h += '</div></div>';
    }

    // 3. Notable Missions Section
    if (notMissions) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:4px;">🎯 ' + (isFa ? "مأموریت‌های برجسته فضایی:" : "Notable Space Missions:") + '</div>';
      h += '<div style="font-size:10.5px; color:var(--text); line-height:1.6;">' + notMissions + '</div>';
      h += '</div>';
    }

    h += '</div>'; // end TAB 2

    // TAB 3: TIMELINE & NETWORK
    h += '<div id="compTabTimeline" class="site-tab-content" style="display:none;">';
    var timeline = isFa ? (o.timeline_fa || o.timeline || []) : (o.timeline_en || o.timeline || []);
    var futRoadmap = isFa ? (o.future_roadmap_fa || o.future_roadmap) : (o.future_roadmap_en || o.future_roadmap);
    var partners = isFa ? (o.partnerships_detail_fa || o.partnerships_detail) : (o.partnerships_detail_en || o.partnerships_detail);

    // 1. Timeline Box
    if (timeline.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:8px;">⏳ ' + (isFa ? "سیر تاریخی و خط زمانی" : "Historical Timeline") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:6px;">';
      
      timeline.forEach(function(item) {
        if (typeof item === "string") {
          h += '<div style="font-size:10.5px; color:#fff;">• ' + esc(item) + '</div>';
        } else {
          var yr = item.year || item.date || "";
          var txt = isFa ? (item.text || item.title || item.desc) : (item.text_en || item.title_en || item.desc_en || item.text || item.title);

          h += '<div style="font-size:10.5px; color:var(--text); line-height:1.5;">';
          h += '<b style="color:#f59e0b; font-family:monospace;"><bdi>' + esc(yr) + '</bdi>:</b> <bdi>' + esc(txt) + '</bdi>';
          h += '</div>';
        }
      });

      h += '</div></div>';
    }

    // 2. Future Roadmap & Partnerships
    if (futRoadmap) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:4px;">🚀 ' + (isFa ? "نقشه راه استراتژیک توسعه:" : "Future Strategic Roadmap:") + '</div>';
      h += '<div style="font-size:10.5px; color:var(--text); line-height:1.6;">' + esc(futRoadmap) + '</div>';
      h += '</div>';
    }

    if (partners) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#38bdf8; margin-bottom:4px;">🤝 ' + (isFa ? "دیپلماسی فضایی و مشارکت‌های بین‌المللی:" : "Space Diplomacy & Partnerships:") + '</div>';
      h += '<div style="font-size:10.5px; color:var(--text); line-height:1.6;">' + esc(partners) + '</div>';
      h += '</div>';
    }

    h += '</div>'; // end TAB 3

    return h;
}

  function renderPropulsionDetail(p) {
    var o = p.o || p, h = "";
    var isFa = (typeof LANG !== "undefined" && LANG === "fa");

    var propCat = isFa ? (o.propulsion_category_fa || o.propulsion_category_en || "پیشرانه‌های فضایی") : (o.propulsion_category_en || o.propulsion_category_fa || "Space Propulsion");
    var propType = isFa ? (o.propulsion_type_fa || o.propulsion_type_en || "پیشرانه سوخت مایع") : (o.propulsion_type_en || o.propulsion_type_fa || "Liquid Propulsion");
    var orgTypeStr = isFa ? (o.org_type_fa || o.org_type_en || "مجتمع تخصصی پیشرانش") : (o.org_type_en || o.org_type_fa || "Propulsion Contractor");

    // Header with Title & Icon & Category Badge
    h += '<div class="d-head" style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-inline-end: 35px;">';
    h += '<div style="display:flex; gap:10px; align-items:center; flex:1;">';
    var ic = iconFor("propulsion", "active").replace(/width="3\d"/, 'width="34"').replace(/height="38"/, 'height="44"');
    h += '<div>' + ic + '</div>';
    h += '<div><div class="d-kicker">' + esc(t("cat_propulsion")) + '</div>';
    h += '<h2 class="d-title" style="margin:0;">' + esc(name(o)) + '</h2></div></div>';
    h += '<span class="badge-private" style="padding:3px 10px; border-radius:12px; font-size:10.5px; font-weight:bold; white-space:nowrap;">' + esc(propCat) + '</span>';
    h += '</div>';

    h += '<div class="d-sub" style="margin-top:4px;">' + esc(isFa ? (o.en || o.fa) : (o.fa || o.en)) + '</div>';
    h += '<div class="d-desc" style="margin-top:6px; line-height:1.6;">' + esc(desc(o)) + '</div>';

    // 3 Tabs
    h += '<div class="site-tabs" style="margin-top:10px;">';
    h += '<button class="site-tab-btn active" onclick="switchCompTab(\'overview\', this)">' + (isFa ? "شناسنامه و معماری" : "Overview & Architecture") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'engines\', this)">' + (isFa ? "موتورها و موشک مقصد" : "Engines & Mission Link") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'testing\', this)">' + (isFa ? "تست‌های گرم و نقشه راه" : "Test History & Roadmap") + '</button>';
    h += '</div>';

    // TAB 1: OVERVIEW & ARCHITECTURE & FLAGSHIP (HIGH-CONTRAST BILINGUAL GLASSMOPHIC UI)
    h += '<div id="compTabOverview" class="site-tab-content active" style="display:block;">';
    
    // Executive 6-Grid Box
    h += '<div class="grid2" style="margin-top:8px;">';
    h += cell(isFa ? "سال تأسیس" : "Founded", o.founded || "—");
    h += cell(isFa ? "مقر اصلی" : "Headquarters", isFa ? (o.city_fa || o.city) : (o.city || o.city_fa));
    h += cell(t("country"), isFa ? (o.country_fa || o.country) : (o.country || o.country_fa));
    h += cell(isFa ? "نوع نهاد" : "Org Type", orgTypeStr, true);
    h += cell(isFa ? "رده پیشرانه" : "Category", propCat, true);
    h += cell(isFa ? "نوع پیشرانه" : "Propulsion Type", propType, true);
    h += '</div>';

    // SECTION 1: Flagship Engine Card (100% PURE BILINGUAL)
    var flagshipEngine = isFa ? (o.flagship_engine_fa || o.flagship_engine_en) : (o.flagship_engine_en || o.flagship_engine_fa);
    var flagshipStatus = isFa ? (o.flagship_status_fa || o.flagship_status_en || "عملیاتی") : (o.flagship_status_en || o.flagship_status_fa || "Operational");
    var flagshipApp = isFa ? (o.flagship_application_fa || o.flagship_application_en || "پرتابگرهای مداری") : (o.flagship_application_en || o.flagship_application_fa || "Orbital Launchers");

    if (flagshipEngine) {
      h += '<div style="background:linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(15, 31, 51, 0.8) 100%); border:1px solid rgba(56, 189, 248, 0.35); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">';
      h += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">';
      h += '<span style="font-size:12px; font-weight:bold; color:var(--accent);">⚙️ ' + (isFa ? "موتور پرچمدار و شاخص:" : "Flagship Engine:") + ' <b><bdi>' + esc(flagshipEngine) + '</bdi></b></span>';
      h += '<span class="badge-gov" style="padding:2px 8px; border-radius:10px; font-size:10px; background:rgba(16, 185, 129, 0.2); border:1px solid rgba(16, 185, 129, 0.4); color:#10b981;">' + esc(flagshipStatus) + '</span>';
      h += '</div>';
      h += '<div style="font-size:10.5px; color:#fff; margin-top:4px; line-height:1.5;">🚀 <b>' + (isFa ? "کاربرد اصلی:" : "Primary Application:") + '</b> <bdi>' + esc(flagshipApp) + '</bdi></div>';
      h += '</div>';
    }

    // SECTION 2: Company History Box
    var histText = isFa ? (o.history_fa || o.history_en || o.fa_d) : (o.history_en || o.history_fa || o.en_d);
    if (histText) {
      h += '<div style="background:rgba(15, 31, 51, 0.6); border:1px solid rgba(245, 158, 11, 0.35); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.25);">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#f59e0b; margin-bottom:6px; display:flex; align-items:center; gap:6px;">📜 ' + (isFa ? "تاریخچه سازمانی و توسعه پیشرانه:" : "Company & Propulsion History:") + '</div>';
      h += '<div style="font-size:10.5px; color:var(--text); line-height:1.6;">' + esc(histText) + '</div>';
      h += '</div>';
    }

    // SECTION 3: Product Development History Box
    var prodHistText = isFa ? (o.product_history_fa || o.product_history_en) : (o.product_history_en || o.product_history_fa);
    if (prodHistText) {
      h += '<div style="background:rgba(15, 31, 51, 0.6); border:1px solid rgba(16, 185, 129, 0.35); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.25);">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:6px; display:flex; align-items:center; gap:6px;">⚙️ ' + (isFa ? "تاریخچه بومی‌سازی و ساخت محصولات:" : "Product Development & Manufacturing:") + '</div>';
      h += '<div style="font-size:10.5px; color:var(--text); line-height:1.6;">' + esc(prodHistText) + '</div>';
      h += '</div>';
    }

    // Official Links Bar
    var compLinks = extractEntityLinks(o);
    var webUrl = compLinks.webUrl;
    var displayWeb = compLinks.displayWeb || (isFa ? "وب‌سایت رسمی" : "Website");
    var linkedinUrl = compLinks.linkedinUrl;
    var displayLinkedin = compLinks.displayLinkedin || "LinkedIn";

    if (webUrl || linkedinUrl || (o.lat && o.lon)) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:10.5px; flex-wrap:wrap; gap:8px;">';
      
      if (webUrl) {
        h += '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent); font-weight:bold; font-family:monospace; text-decoration:none; background:rgba(56, 189, 248, 0.12); padding:5px 12px; border-radius:6px; border:1px solid rgba(56, 189, 248, 0.3); word-break:break-all;" onclick="window.open(\'' + esc(webUrl) + '\', \'_blank\'); return false;">🌐 ' + esc(displayWeb) + ' ↗</a>';
      }
      
      if (linkedinUrl) {
        h += '<a href="' + esc(linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-weight:bold; font-family:monospace; text-decoration:none; background:rgba(14, 118, 168, 0.2); padding:5px 12px; border-radius:6px; border:1px solid rgba(14, 118, 168, 0.4); word-break:break-all;" onclick="window.open(\'' + esc(linkedinUrl) + '\', \'_blank\'); return false;">💼 ' + esc(displayLinkedin) + ' ↗</a>';
      }

      if (o.lat && o.lon) {
        h += '<button type="button" class="btn btn-sm country-btn-fly" onclick="flyToCoords(' + o.lat + ',' + o.lon + ', 8)" style="font-size:10px; padding:5px 10px; cursor:pointer;">📍 ' + (isFa ? "پرواز به موقعیت روی نقشه ↗" : "Fly to Location ↗") + '</button>';
      }

      h += '</div>';
    }

    h += '</div>'; // end TAB 1

    // TAB 2: ENGINES CATALOG & MISSION RELATIONSHIP (REFINED ACCORDION WITH SPACEFLIGHT OPERATIONAL ROLE)
    h += '<div id="compTabEngines" class="site-tab-content" style="display:none;">';
    var engList = o.engine_products_bilingual || [];
    var prodList = o.products || [];
    var notMissions = isFa ? (o.notable_missions_fa || o.notable_missions_en || []) : (o.notable_missions_en || o.notable_missions_fa || []);

    if (engList.length) {
      h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:8px;">⚙️ ' + (isFa ? "برای مشاهده مشخصات فنی، شرح کارکرد عملیاتی در فضا و موشک مقصد روی هر موتور کلیک کنید:" : "Click on any engine to expand specifications & spaceflight operational role:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:8px;">';
      
      (Array.isArray(engList) ? engList : [engList]).forEach(function(eng, idx) {
        var engName = isFa ? (eng.name_fa || eng.name_en) : (eng.name_en || eng.name_fa);
        var engType = isFa ? (eng.type_fa || eng.type_en || "پیشرانه موشک") : (eng.type_en || eng.type_fa || "Rocket Engine");
        var engProp = isFa ? (eng.propellant_fa || eng.propellant_en || "—") : (eng.propellant_en || eng.propellant_fa || "—");
        var engRocket = isFa ? (eng.rocket_fa || eng.rocket_en || "پرتابگرهای مداری") : (eng.rocket_en || eng.rocket_fa || "Orbital Launchers");
        var engThrust = isFa ? (eng.thrust_fa || eng.thrust_en || "—") : (eng.thrust_en || eng.thrust_fa || "—");
        var engSt = isFa ? (eng.status_fa || eng.status_en || "عملیاتی") : (eng.status_en || eng.status_fa || "Operational");
        var engRole = isFa ? (eng.engineering_desc_fa || eng.engineering_desc_en || "") : (eng.engineering_desc_en || eng.engineering_desc_fa || "");

        var openAttr = (idx === 0) ? " open" : "";
        h += '<details class="acc" ' + openAttr + ' style="background:linear-gradient(180deg, rgba(15,31,51,0.8) 0%, rgba(9,13,22,0.9) 100%); border:1px solid var(--line); border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:all 0.2s ease;">';
        
        // Summary Header Bar (FIXED FULL WRAP TITLE WITHOUT ELLIPSIS!)
        h += '<summary style="padding:10px 12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:10px; user-select:none; background:rgba(255,255,255,0.03); outline:none; flex-wrap:wrap;">';
        h += '<div style="font-size:12px; font-weight:bold; color:#fff; line-height:1.45; word-break:break-word; flex:1; min-width:180px;">⚙️ <bdi>' + esc(engName) + '</bdi></div>';
        h += '<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">';
        h += '<span style="color:#38bdf8; font-size:9.5px; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.3); padding:2px 7px; border-radius:12px; font-weight:bold;"><bdi>' + esc(engProp) + '</bdi></span>';
        h += '<span style="color:#10b981; font-weight:bold; font-size:9.5px; background:rgba(16, 185, 129, 0.12); border:1px solid rgba(16, 185, 129, 0.3); padding:2px 7px; border-radius:12px;"><bdi>' + esc(engSt) + '</bdi></span>';
        h += '<span style="color:var(--muted); font-size:10px; opacity:0.8;">▼</span>';
        h += '</div>';
        h += '</summary>';

        // Sleek Collapsible Details Body
        h += '<div style="padding:12px; border-top:1px solid rgba(255,255,255,0.08); background:rgba(4,10,18,0.7); font-size:10.5px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>' + (isFa ? "چرخه / نوع احتراق:" : "Cycle / Type:") + '</b> <br><bdi style="color:#fff;">' + esc(engType) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>' + (isFa ? "ترکیب سوخت:" : "Propellant:") + '</b> <br><span style="color:#f59e0b; font-weight:bold;"><bdi>' + esc(engProp) + '</bdi></span></div>';
        h += '</div>';

        h += '<div style="color:#10b981; background:rgba(16, 185, 129, 0.08); padding:6px 8px; border-radius:4px; border:1px solid rgba(16, 185, 129, 0.2);"><b>' + (isFa ? "مشخصات فنی و رانش:" : "Specifications:") + '</b> <bdi>' + esc(engThrust) + '</bdi></div>';

        // SPACEFLIGHT OPERATIONAL ROLE BOX
        if (engRole) {
          h += '<div style="background:rgba(15, 31, 51, 0.6); border:1px solid rgba(245, 158, 11, 0.35); border-radius:6px; padding:8px 10px; margin-top:2px;">';
          h += '<div style="font-size:11px; font-weight:bold; color:#f59e0b; margin-bottom:3px; display:flex; align-items:center; gap:4px;">🛠️ ' + (isFa ? "شرح کارکرد عملیاتی در فضا:" : "Spaceflight Operational Role:") + '</div>';
          h += '<div style="font-size:10px; color:var(--text); line-height:1.5;">' + esc(engRole) + '</div>';
          h += '</div>';
        }

        // Target Rocket / Mission Highlight Box
        h += '<div style="color:#fff; background:linear-gradient(90deg, rgba(56, 189, 248, 0.12) 0%, rgba(2, 132, 199, 0.05) 100%); border:1px solid rgba(56, 189, 248, 0.3); padding:8px 10px; border-radius:6px; margin-top:2px;">';
        h += '<div style="font-size:11px; font-weight:bold; color:var(--accent); margin-bottom:2px;">🚀 ' + (isFa ? "موشک و مأموریت مقصد (Mission → Engine):" : "Target Rocket / Mission:") + '</div>';
        h += '<div style="font-size:10.5px;"><bdi>' + esc(engRocket) + '</bdi></div>';
        h += '</div>';

        h += '</div>';
        h += '</details>';
      });
      h += '</div>';
    } else if (prodList.length) {
      h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:6px;">📦 ' + (isFa ? "سبد محصولات و سامانه‌های پیشرانش:" : "Products Portfolio:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:4px;">';
      (Array.isArray(prodList) ? prodList : [prodList]).forEach(function(pItem) {
        h += '<div style="background:var(--bg2); border:1px solid var(--line); padding:6px 10px; border-radius:4px; font-size:10.5px; color:#fff;">⚙️ <bdi>' + esc(pItem) + '</bdi></div>';
      });
      h += '</div>';
    }

    if (notMissions.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:6px;">🎯 ' + (isFa ? "مأموریت‌های برجسته صنعتی و فضایی:" : "Notable Missions:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:4px;">';
      (Array.isArray(notMissions) ? notMissions : [notMissions]).forEach(function(m) {
        h += '<div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.2); padding:6px; border-radius:4px; font-size:10.5px; color:#fff;">🚀 ' + esc(m) + '</div>';
      });
      h += '</div></div>';
    }

    h += '</div>'; // end TAB 2

    // TAB 3: HOT-FIRE TESTING & ROADMAP (100% BILINGUAL GUARANTEED)
    h += '<div id="compTabTesting" class="site-tab-content" style="display:none;">';
    var testHist = isFa ? (o.test_history_fa || o.test_history_en || []) : (o.test_history_en || o.test_history_fa || []);
    var futPlans = isFa ? (o.future_plans_fa || o.future_plans_en || []) : (o.future_plans_en || o.future_plans_fa || []);

    if (testHist.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#f59e0b; margin-bottom:6px;">🔥 ' + (isFa ? "تاریخچه تست‌های گرم زمین‌پایه و آزمون‌های نازل:" : "Static Hot-Fire Test Records & Nozzle Firing Tests:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:6px;">';
      (Array.isArray(testHist) ? testHist : [testHist]).forEach(function(tRecord) {
        if (typeof tRecord === "string") {
          h += '<div style="background:rgba(0,0,0,0.25); border-right:3px solid #f59e0b; padding:6px 8px; border-radius:4px; font-size:10.5px; color:#fff;">• ' + esc(tRecord) + '</div>';
        } else {
          var tYr = tRecord.year || "2023";
          var tTitle = isFa ? (tRecord.title_fa || tRecord.title || "") : (tRecord.title_en || tRecord.title || "");
          var tDesc = isFa ? (tRecord.desc_fa || tRecord.desc || "") : (tRecord.desc_en || tRecord.desc || "");

          h += '<div style="background:rgba(0,0,0,0.3); border-right:3px solid #f59e0b; padding:8px 10px; border-radius:6px; font-size:10.5px; border:1px solid rgba(245,158,11,0.2);">';
          h += '<b style="color:#fff;"><code style="color:#f59e0b; font-size:11px; font-family:monospace;"><bdi>' + esc(tYr) + '</bdi></code> — ' + esc(tTitle) + '</b>';
          if (tDesc) h += '<div style="color:var(--muted); font-size:10px; margin-top:3px; line-height:1.5;">' + esc(tDesc) + '</div>';
          h += '</div>';
        }
      });
      h += '</div></div>';
    }

    if (futPlans.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:6px;">🚀 ' + (isFa ? "برنامه‌های آتی ارتقای توان رانش و نقشه راه:" : "Future Thrust Scaling & Strategic Roadmap:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:4px;">';
      (Array.isArray(futPlans) ? futPlans : [futPlans]).forEach(function(fPlan) {
        h += '<div style="background:rgba(56, 189, 248, 0.08); border:1px solid rgba(56, 189, 248, 0.2); padding:6px; border-radius:4px; font-size:10.5px; color:#fff;">🎯 ' + esc(fPlan) + '</div>';
      });
      h += '</div></div>';
    }

    h += '</div>'; // end TAB 3

    return h;
  }

  /* ================= landing & recovery: curated, opt-in pilot ================= */
  function validRecoverySite(s) {
    return s && s.cat === "recovery" && typeof s.id === "string" && s.fa && s.en &&
      Number.isFinite(s.lat) && Number.isFinite(s.lon) && Math.abs(s.lat) < 85 && Math.abs(s.lon) <= 180 &&
      Array.isArray(s.events) && s.events.length > 0 && s.events.every(function (e) {
        return e.id && /^\d{4}-\d{2}-\d{2}$/.test(e.date || "") && /^https:\/\//.test(e.source_url || "") &&
          ["success", "failure", "unknown"].indexOf(e.landing_outcome) >= 0 &&
          ["confirmed", "partial", "failed", "unknown", "not_planned"].indexOf(e.recovery_outcome) >= 0;
      });
  }
  function recoveryDate(date) {
    return new Date(date + "T12:00:00Z").toLocaleDateString(LANG === "fa" ? "fa-IR-u-ca-gregory" : "en-GB",
      { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  }
  function recoveryText(o, key) { return o[key + (LANG === "fa" ? "_fa" : "_en")] || "—"; }
  /* External map links: open synchronously while the click is active, with a real fallback.
     Do not navigate the preview frame to third-party sites or try to override its sandbox. */
  var externalLinkDialog = null, externalLinkTrigger = null, externalLinkUrl = "";
  function externalMapUrl(href) {
    try {
      var url = new URL(href, window.location.href);
      if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password ||
          url.origin === window.location.origin) return null;
      return url.href;
    } catch (e) { return null; }
  }
  function openExternalMapWindow(url) {
    var popup = null;
    try {
      // Reserve the tab before any asynchronous work. noopener in window.open's feature
      // string can return null even on success, so detach the opener on this blank tab first.
      popup = window.open("about:blank", "_blank");
      if (!popup || popup.closed) return false;
      popup.opener = null;
      var referrer = popup.document.createElement("meta");
      referrer.name = "referrer"; referrer.content = "no-referrer";
      popup.document.head.appendChild(referrer);
      // An anchor's referrer policy is respected even when this click handler lives in
      // the original document; assigning popup.location can use the opener's policy.
      var destination = popup.document.createElement("a");
      destination.href = url; destination.target = "_self";
      destination.rel = "noreferrer"; destination.referrerPolicy = "no-referrer";
      destination.hidden = true;
      popup.document.body.appendChild(destination);
      destination.click();
      try { popup.focus(); } catch (ignored) {}
      return true;
    } catch (e) {
      try { if (popup && !popup.closed) popup.close(); } catch (ignored) {}
      return false;
    }
  }
  function selectExternalLinkAddress() {
    var field = $("#externalLinkAddress");
    if (!field) return;
    field.focus(); field.select(); field.setSelectionRange(0, field.value.length);
  }
  function externalCopyStatus(ok) {
    var status = $("#externalLinkStatus");
    if (!status) return;
    status.dataset.state = ok ? "copied" : "manual";
    status.textContent = LANG === "fa" ?
      (ok ? "نشانی کپی شد؛ آن را در نوار نشانی مرورگر باز کنید." :
        "کپی خودکار مجاز نشد. نشانی انتخاب شده است؛ از فرمان کپی مرورگر یا لمسِ طولانی استفاده کنید.") :
      (ok ? "Link copied. Paste it into your browser address bar." :
        "Automatic copying is unavailable. The address is selected; use your browser’s Copy command or long-press it.");
    if (!ok) selectExternalLinkAddress();
  }
  function copyExternalLinkAddress() {
    selectExternalLinkAddress();
    // Synchronous copy is useful in frames where the async Clipboard API is disallowed.
    var copied = false;
    try { copied = document.execCommand("copy"); } catch (e) {}
    if (copied) { externalCopyStatus(true); return; }
    externalCopyStatus(false);
    var copyingUrl = externalLinkUrl;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyingUrl).then(function () {
          if (externalLinkDialog.open && externalLinkUrl === copyingUrl) externalCopyStatus(true);
        }, function () {
          if (externalLinkDialog.open && externalLinkUrl === copyingUrl) externalCopyStatus(false);
        });
      }
    } catch (e) {}
  }
  function ensureExternalLinkDialog() {
    if (externalLinkDialog) return externalLinkDialog;
    var dialog = document.createElement("dialog");
    dialog.id = "externalLinkDialog"; dialog.className = "external-link-dialog";
    dialog.setAttribute("aria-labelledby", "externalLinkTitle");
    dialog.setAttribute("aria-describedby", "externalLinkExplanation");
    dialog.innerHTML = '<h2 id="externalLinkTitle"></h2><p id="externalLinkExplanation"></p>' +
      '<label id="externalLinkAddressLabel" for="externalLinkAddress"></label>' +
      '<textarea id="externalLinkAddress" rows="3" dir="ltr" readonly spellcheck="false"></textarea>' +
      '<p id="externalLinkStatus" class="external-link-status" role="status" aria-live="polite"></p>' +
      '<div class="external-link-actions"><button type="button" class="ghost-btn" id="externalLinkCopy"></button>' +
      '<button type="button" class="ghost-btn" id="externalLinkRetry"></button>' +
      '<button type="button" class="ghost-btn" id="externalLinkClose"></button></div>' +
      '<a id="externalLinkCurrent" class="external-link-current" target="_self" rel="noreferrer" hidden></a>';
    document.body.appendChild(dialog); externalLinkDialog = dialog;
    $("#externalLinkCopy").addEventListener("click", copyExternalLinkAddress);
    $("#externalLinkRetry").addEventListener("click", function () {
      if (openExternalMapWindow(externalLinkUrl)) { dialog.close(); return; }
      $("#externalLinkStatus").textContent = LANG === "fa" ?
        "بازکردن زبانه همچنان مسدود است؛ از کپی نشانی استفاده کنید." :
        "New tabs are still blocked. Copy the address instead.";
    });
    $("#externalLinkClose").addEventListener("click", function () { dialog.close(); });
    $("#externalLinkAddress").addEventListener("click", selectExternalLinkAddress);
    dialog.addEventListener("keydown", function (e) {
      e.stopPropagation(); // Keep map/search shortcuts out of the modal; native keys still work.
    });
    dialog.addEventListener("close", function () {
      if (externalLinkTrigger && externalLinkTrigger.isConnected) {
        try { externalLinkTrigger.focus({ preventScroll: true }); } catch (e) {}
      }
      externalLinkTrigger = null;
    });
    return dialog;
  }
  function showExternalLinkFallback(url, trigger) {
    var dialog = ensureExternalLinkDialog(), fa = LANG === "fa";
    externalLinkUrl = url; externalLinkTrigger = trigger;
    $("#externalLinkTitle").textContent = fa ? "زبانهٔ جدید باز نشد" : "The new tab did not open";
    $("#externalLinkExplanation").textContent = fa ?
      "پیش‌نمایش یا مرورگر اجازهٔ بازکردن پنجرهٔ جدید را نداد. نشانی منبع را کپی کنید و در مرورگر باز کنید؛ نقشه در همین‌جا باقی می‌ماند." :
      "The preview or browser did not allow a new window. Copy the source address and open it in your browser; the map will stay here.";
    $("#externalLinkAddressLabel").textContent = fa ? "نشانی منبع" : "Source address";
    $("#externalLinkAddress").value = url;
    $("#externalLinkStatus").textContent = "";
    $("#externalLinkStatus").removeAttribute("data-state");
    $("#externalLinkCopy").textContent = fa ? "کپی نشانی" : "Copy link";
    $("#externalLinkRetry").textContent = fa ? "تلاش دوباره" : "Try again";
    $("#externalLinkClose").textContent = fa ? "بستن" : "Close";
    // A top-level browser can offer ordinary same-tab navigation. Never replace an
    // embedded preview with YouTube/NASA, which can refuse iframe embedding.
    var current = $("#externalLinkCurrent"), embedded = true;
    try { embedded = window.top !== window; } catch (e) {}
    current.hidden = embedded;
    current.href = url;
    current.textContent = fa ? "خروج از برنامه و بازکردن منبع در همین زبانه" : "Leave the app and open the source in this tab";
    if (!dialog.open) dialog.showModal();
    $("#externalLinkCopy").focus();
  }
  var worldMapView = $("#view-map");
  if (worldMapView) worldMapView.addEventListener("click", function (event) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    var node = event.target;
    var link = node && node.closest ? node.closest("a[href]") : null;
    if (!link || !worldMapView.contains(link) || link.hasAttribute("download")) return;
    var url = externalMapUrl(link.getAttribute("href"));
    if (!url) return;
    event.preventDefault();
    // The older company dossiers have inline window.open handlers. Do not run both.
    event.stopImmediatePropagation();
    if (!openExternalMapWindow(url)) showExternalLinkFallback(url, link);
  }, true);

  function recoverySource(url, label) {
    if (!/^https:\/\//.test(url || "")) return "";
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + '</a>';
  }
  function recoveryOutcome(value, isLanding, method) {
    var fa = LANG === "fa";
    var labels = isLanding ? {
      success: fa ? "فرود موفق" : "Landing confirmed", failure: fa ? "فرود ناموفق" : "Landing failed",
      unknown: fa ? "نتیجهٔ فرود نامشخص" : "Landing not verified"
    } : {
      confirmed: fa ? "بازیابی تأییدشده" : "Recovery confirmed", partial: fa ? "بازیابی جزئی" : "Partial recovery",
      failed: fa ? "بازیابی ناموفق" : "Recovery failed", unknown: fa ? "بازیابی نامشخص" : "Recovery unverified",
      not_planned: fa ? "بازیابی در برنامه نبود" : "Recovery not planned"
    };
    if (isLanding && method === "tower_capture") {
      labels.success = fa ? "گرفتن با برج موفق" : "Tower capture confirmed";
      labels.failure = fa ? "گرفتن با برج ناموفق" : "Tower capture failed";
      labels.unknown = fa ? "نتیجهٔ گرفتن نامشخص" : "Capture not verified";
    }
    var tone = value === "success" || value === "confirmed" ? "good" :
      value === "failure" || value === "failed" ? "bad" : value === "partial" ? "partial" : "unknown";
    return '<span class="recovery-outcome ' + tone + '">' + esc(labels[value] || labels.unknown) + '</span>';
  }
  function validRecoveryVideo(video, eventId) {
    if (!video || video.verified !== true || video.official_source !== true || video.event_id !== eventId ||
        ["landing", "recovery", "return_coverage", "mission_recap"].indexOf(video.kind) < 0 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(video.verified_on || "")) return false;
    try {
      var url = new URL(video.url);
      if (url.protocol !== "https:" || url.username || url.password) return false;
      if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
        return url.pathname === "/watch" && /^[A-Za-z0-9_-]{11}$/.test(url.searchParams.get("v") || "");
      }
      if (url.hostname === "youtu.be") return /^\/[A-Za-z0-9_-]{11}\/?$/.test(url.pathname);
      if (url.hostname === "images.nasa.gov") return url.pathname.indexOf("/details/") === 0 && url.pathname.length > 9;
      if (url.hostname === "x.com" || url.hostname === "www.x.com" ||
          url.hostname === "twitter.com" || url.hostname === "www.twitter.com") {
        return /^\/[A-Za-z0-9_]{1,15}\/status\/\d{10,25}\/?$/.test(url.pathname) && !url.search;
      }
      return url.hostname === "plus.nasa.gov" && url.pathname.indexOf("/video/") === 0 && url.pathname.length > 7;
    } catch (e) { return false; }
  }
  function renderRecoveryVideos(event) {
    var seen = {}, videos = (Array.isArray(event.videos) ? event.videos : []).filter(function (video) {
      if (!validRecoveryVideo(video, event.id) || seen[video.url]) return false;
      seen[video.url] = true; return true;
    });
    if (!videos.length) return "";
    var fa = LANG === "fa";
    var labels = {
      landing: fa ? "تماشای ویدئوی فرود" : "Watch landing video",
      recovery: fa ? "تماشای عملیات بازیابی" : "Watch recovery footage",
      return_coverage: fa ? "تماشای پوشش بازگشت" : "Watch return coverage",
      mission_recap: fa ? "تماشای گزارش ویدئویی" : "Watch video report"
    };
    var h = '<section class="recovery-media" aria-label="' + (fa ? "ویدئوی همین رویداد" : "Video of this event") + '">';
    videos.forEach(function (video) {
      var title = fa ? video.title_fa : video.title_en;
      var provider = fa ? video.provider_fa : video.provider_en;
      var label = labels[video.kind];
      h += '<a class="recovery-video-link" href="' + esc(video.url) + '" target="_blank" rel="noopener noreferrer"' +
        ' data-video-id="' + esc(video.id) + '" data-video-kind="' + esc(video.kind) + '" aria-label="' +
        esc(label + ' — ' + title + (fa ? ' — بازشدن در زبانهٔ جدید' : ' — opens in a new tab')) + '">' +
        '<span class="recovery-play" aria-hidden="true">▶</span><span class="recovery-video-copy"><strong>' + esc(label) +
        '</strong><span>' + esc(title) + '</span></span><span aria-hidden="true">↗</span></a>' +
        '<div class="recovery-video-meta"><span>' + esc(provider) + '</span><span>' +
        (fa ? "بررسی پیوند: " : "Link checked: ") + esc(recoveryDate(video.verified_on)) + '</span></div>';
    });
    return h + '<p class="recovery-video-note">' +
      (fa ? "ویدئو در سایت مرجع باز می‌شود. پوشش آرشیوی ممکن است طولانی باشد؛ پخش به شرایط دسترسی سایت مقصد وابسته است." :
      "Opens on the source website. Archived coverage may be long; playback depends on the destination’s access conditions.") + '</p></section>';
  }

  function renderRecoveryDetail(o) {
    var fa = LANG === "fa", events = o.events.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var types = { booster: fa ? "سکوی بوستر" : "Booster landing", capsule: fa ? "بازیابی کپسول" : "Capsule recovery",
      runway: fa ? "باند فرود" : "Runway landing", mixed: fa ? "کپسول و باند" : "Capsule & runway",
      tower: fa ? "برج گرفتن بوستر" : "Booster catch tower",
      droneship: fa ? "شناور فرود دریایی" : "Landing droneship",
      splashdown_zone: fa ? "پهنهٔ آب‌نشینی" : "Splashdown zone" };
    var basis = { utc: fa ? "وقت جهانی" : "UTC", australia: fa ? "تاریخ محلی استرالیا" : "Australian local date",
      japan: fa ? "وقت ژاپن" : "Japanese local date", us_eastern: fa ? "وقت شرق آمریکا" : "U.S. Eastern date",
      china: fa ? "تاریخ محلی چین" : "Chinese local date", kazakhstan: fa ? "تاریخ محلی قزاقستان" : "Kazakhstan local date" };
    var publishers = { "NASA": "ناسا", "JAXA": "سازمان فضایی ژاپن", "JAXA / ISAS": "سازمان فضایی ژاپن",
      "Australian Space Agency": "سازمان فضایی استرالیا", "U.S. Space Force": "نیروی فضایی آمریکا", "Space.com": "رسانهٔ اسپیس",
      "U.S. Air Force": "نیروی هوایی آمریکا", "Rocket Lab": "راکت‌لب", "SpaceX": "اسپیس‌ایکس",
      "CMSA": "برنامهٔ فضایی سرنشین‌دار چین", "CNSA": "سازمان فضایی چین",
      "China State Council / Xinhua": "درگاه دولت چین و شین‌هوا" };
    var h = '<div class="recovery-dossier"><header class="recovery-header">' +
      '<div class="recovery-heading"><span class="recovery-heading-icon">' + svgRecovery(C.recovery) + '</span><div>' +
      '<div class="d-kicker">' + t("cat_recovery") + '</div><h2 class="d-title">' + esc(name(o)) + '</h2>' +
      '<p class="recovery-location">' + esc(fa ? o.city_fa : o.city) + '</p></div></div>' +
      '<div class="recovery-tags"><span class="recovery-type">' + esc(types[o.recovery_type] || "") + '</span><span>' +
      (o.mobility === "mobile" ? (fa ? "سکوی متحرک" : "Mobile platform") : (fa ? "موقعیت مرجع" : "Reference location")) +
      '</span><span>' + (fa ? "غیرزنده" : "Not live") + '</span></div></header>' +
      '<div class="recovery-summary"><div><span>' + (fa ? "رویداد در این فهرست" : "Events in this list") + '</span><strong>' +
      fmtNum(events.length) + '</strong></div><div><span>' + (fa ? "آخرین رویداد ثبت‌شده" : "Latest recorded event") +
      '</span><strong class="recovery-summary-date">' + esc(recoveryDate(events[0].date)) + '</strong></div></div>' +
      '<div class="recovery-tabs" role="tablist" aria-label="' + (fa ? "اطلاعات محل" : "Location details") + '">' +
      '<button type="button" id="recoveryOverviewTab" role="tab" aria-selected="true" aria-controls="recoveryOverview" data-recovery-tab="overview">' +
      (fa ? "معرفی محل" : "Overview") + '</button>' +
      '<button type="button" id="recoveryHistoryTab" role="tab" aria-selected="false" aria-controls="recoveryHistory" tabindex="-1" data-recovery-tab="history">' +
      (fa ? "تاریخچهٔ فرود و بازیابی" : "Landing & recovery history") + '</button></div>' +
      '<section id="recoveryOverview" class="recovery-tab-panel" role="tabpanel" aria-labelledby="recoveryOverviewTab" tabindex="0">' +
      (o.image ? '<figure class="recovery-hero">' +
        '<img src="' + esc(o.image.file) + '" alt="' + esc(fa ? o.image.caption_fa : o.image.caption_en) + '" loading="lazy" decoding="async">' +
        '<figcaption><span class="recovery-hero-caption">' + esc(fa ? o.image.caption_fa : o.image.caption_en) + '</span>' +
        '<span class="recovery-hero-credit">' + (fa ? "عکس: " : "Photo: ") + esc(fa ? o.image.credit_fa : o.image.credit_en) +
        ' · <bdi>' + esc(o.image.license) + '</bdi>' +
        (o.image.source_url ? ' · ' + recoverySource(o.image.source_url, fa ? "منبع تصویر" : "Image source") : '') +
        '</span></figcaption></figure>' : '') +
      '<div class="recovery-section-label">' + (fa ? "شناسنامهٔ محل" : "Facility profile") + '</div>' +
      '<p class="recovery-description">' + esc(desc(o)) + '</p><dl class="recovery-facts">';
    [
      [fa ? "کشور محل بازگشت" : "Return-location country", fa ? o.country_fa : o.country, ""],
      [fa ? "نوع محل" : "Facility type", types[o.recovery_type], ""],
      [fa ? "بهره‌بردار و گروه مرتبط" : "Operator / associated teams", fa ? o.op_fa : o.op, "recovery-fact-wide"],
      [fa ? "روش فرود و بازیابی" : "Landing and recovery method", recoveryText(o, "method"), "recovery-fact-wide"],
      [fa ? "وضعیت و دامنهٔ اطلاعات" : "Status and information scope", (fa ? o.activity_fa : o.activity_en) ||
        (fa ? "سابقهٔ مستند؛ وضعیت آمادگی کنونی محل از این فهرست استنباط نمی‌شود." : "Documented history; current facility readiness is not inferred from this list."), "recovery-fact-wide"]
    ].forEach(function (row) { h += '<div class="' + row[2] + '"><dt>' + esc(row[0]) + '</dt><dd>' + esc(row[1]) + '</dd></div>'; });
    h += '</dl>';
    if (o.mobility === "mobile" && (o.mobility_note_fa || o.mobility_note_en)) {
      h += '<p class="recovery-location-disclosure recovery-mobility-note"><strong>' +
        (fa ? "این سکو ثابت نیست." : "This platform is not fixed.") + '</strong><span>' +
        esc(fa ? o.mobility_note_fa : o.mobility_note_en) + '</span></p>';
    }
    h += '<div class="recovery-position"><div class="recovery-section-label">' + (fa ? "موقعیت و دقت مکانی" : "Position & precision") + '</div><p>' +
      esc(recoveryText(o,"coordinate_note")) + '</p><div class="recovery-position-bottom"><bdi class="recovery-coordinates">' +
      String(o.lat) + ', ' + String(o.lon) + '</bdi>' + recoverySource(o.coordinate_source_url,
      fa ? "مرجع موقعیت" : "Location reference") + '</div>' +
      (o.coordinate_supporting_sources || []).map(function (source) {
        return '<div class="recovery-position-support">' + recoverySource(source.url, fa ? source.fa : source.en) + '</div>';
      }).join('') +
      (o.coordinate_audit ? '<p class="recovery-position-audit">' + esc(fa ? o.coordinate_audit.fa : o.coordinate_audit.en) + '</p>' : '') + '</div>' +
      '<p class="recovery-small">' + (fa ? "نقطهٔ مرجع، مختصات دقیق تماس یا مرز ایمنی نیست و مجوز ورود به محل محسوب نمی‌شود." :
      "Reference points are not exact touchdown positions, safety boundaries or access permissions.") + '</p></section>' +
      '<section id="recoveryHistory" class="recovery-tab-panel" role="tabpanel" aria-labelledby="recoveryHistoryTab" tabindex="0" hidden>' +
      (function () {
        var complete = o.history_coverage === "complete";
        var registry = o.landing_registry;
        var chip = complete ? (fa ? "پوشش کامل" : "Complete coverage") : (fa ? "در حال تکمیل" : "In progress");
        var text;
        if (complete && registry) {
          text = fa ? "رویدادهای برجسته در خط زمان روایت شده‌اند و فهرست کامل فرودها در انتهای همین زبانه آمده است." :
            "Key events are narrated on the timeline; the complete landing list appears at the end of this tab.";
        } else if (complete) {
          text = fa ? "بر پایهٔ منابع بررسی‌شده، همهٔ بازگشت‌های مداری ثبت‌شدهٔ این محل در همین فهرست آمده‌اند." :
            "Per the reviewed sources, every recorded orbital return at this location is listed here.";
        } else if (registry) {
          text = fa ? "خط زمان، رویدادهای منتخب را روایت می‌کند و فهرست انتهای زبانه نیز هنوز کامل نیست؛ دامنهٔ آن در همان‌جا اعلام شده است." :
            "The timeline narrates selected events and the list at the end of this tab is itself not yet complete; its scope is stated there.";
        } else {
          text = fa ? "این فهرست منتخب است؛ نه تاریخچهٔ کامل همهٔ فرودهای محل." :
            "Selected, sourced events — not a complete history of this location.";
        }
        return '<div class="recovery-coverage' + (complete ? ' is-complete' : '') + '"><div><strong>' +
          (fa ? "رویدادهای مستند" : "Documented events") + '</strong><span>' + chip + '</span></div><p>' + text + '</p></div>';
      })() +
      (o.coverage_start && o.coverage_end ? '<p class="recovery-coverage-range">' +
        (fa ? "بازهٔ رویدادهای این فهرست: " : "Events in this list: ") + esc(recoveryDate(o.coverage_start)) +
        (fa ? " تا " : " to ") + esc(recoveryDate(o.coverage_end)) + '</p>' : '') +
      '<div class="recovery-timeline">';
    var lastYear = "";
    events.forEach(function (e) {
      var year = e.date.slice(0, 4);
      if (year !== lastYear) {
        h += '<div class="recovery-year">' + Number(year).toLocaleString(fa ? "fa-IR" : "en", { useGrouping: false }) + '</div>';
        lastYear = year;
      }
      h += '<article class="recovery-event" data-event-id="' + esc(e.id) + '" data-landing-outcome="' + esc(e.landing_outcome) + '">' +
        '<div class="recovery-event-top"><time datetime="' + esc(e.date) + '">' + esc(recoveryDate(e.date)) + '</time></div>' +
        '<h3>' + esc(fa ? e.fa : e.en) + '</h3><p class="recovery-vehicle">' + esc(recoveryText(e,"vehicle")) + '</p>';
      if (e.summary_fa || e.summary_en) h += '<p class="recovery-event-brief">' + esc(recoveryText(e,"summary")) + '</p>';
      h += '<div class="recovery-outcomes">' + recoveryOutcome(e.landing_outcome,true,e.landing_method) + recoveryOutcome(e.recovery_outcome,false) + '</div>';
      if (e.site_role === "intended_target") {
        h += '<p class="recovery-location-disclosure"><strong>' +
          (fa ? "این محل فقط مقصد برنامه‌ریزی‌شده بود؛ فرود اینجا رخ نداد." : "This site was the intended target; touchdown occurred elsewhere.") +
          '</strong><span>' + esc(fa ? e.actual_location_fa : e.actual_location_en) + '</span></p>';
      }
      if (e.recovery_scope_fa || e.recovery_scope_en) {
        h += '<p class="recovery-scope-note">' + esc(fa ? e.recovery_scope_fa : e.recovery_scope_en) + '</p>';
      }
      h += '<details class="recovery-event-details"><summary><span>' + (fa ? "جزئیات و منبع رویداد" : "Event details and sources") +
        '</span><span class="recovery-expand" aria-hidden="true"></span></summary><div class="recovery-event-reading">';
      [
        ["context", fa ? "زمینهٔ مأموریت" : "Mission context"],
        ["sequence", fa ? "روند فرود و بازیابی" : "Landing & recovery sequence"],
        ["significance", fa ? "نتیجه و اهمیت" : "Outcome & significance"]
      ].forEach(function (part) {
        if (e[part[0] + (fa ? "_fa" : "_en")]) {
          h += '<section class="recovery-story-section"><h4>' + part[1] + '</h4><p>' + esc(recoveryText(e,part[0])) + '</p></section>';
        }
      });
      h += renderRecoveryVideos(e);
      h += '<div class="recovery-evidence"><div class="recovery-evidence-heading">' +
        (fa ? "منابع و یادداشت ثبت" : "Sources & record notes") + '</div><div class="recovery-primary-source">' +
        recoverySource(e.source_url, fa ? "گزارش " + (publishers[e.source_publisher] || "منبع رویداد") : e.source_publisher + " report") + '</div>';
      (e.supporting_sources || []).forEach(function (source) {
        h += '<div class="recovery-supporting-source">' + recoverySource(source.url, fa ? source.fa : source.en) + '</div>';
      });
      h += '<dl class="recovery-evidence-meta"><div><dt>' + (fa ? "مبنای تاریخ" : "Date basis") + '</dt><dd>' +
        esc(basis[e.date_basis] || basis.utc) + '</dd></div><div><dt>' + (fa ? "بررسی ثبت‌شده" : "Recorded review") + '</dt><dd>' +
        esc(recoveryDate(e.verified_on || o.reviewed_on)) + '</dd></div></dl><p class="recovery-record-note">' +
        esc(recoveryText(e,"note")) + '</p></div></div></details></article>';
    });
    return h + '</div>' + renderRecoveryRegistry(o) + '<p class="recovery-small">' +
      (fa ? "«بازیابی نامشخص» یعنی تأیید مستقل آن در منبع ثبت نشده است؛ نه اینکه بازیابی شکست خورده باشد." :
      "Unverified recovery means a separate confirmation is not recorded in the source; it does not mean recovery failed.") +
      '</p></section><footer class="recovery-footer"><span>' + (fa ? "آخرین بررسی منابع" : "Sources reviewed") + '</span><span>' +
      esc(recoveryDate(o.reviewed_on)) + '</span></footer></div>';
  }
  function renderRecoveryRegistry(o) {
    var reg = o.landing_registry;
    if (!reg || !Array.isArray(reg.entries) || !reg.entries.length) return "";
    var fa = LANG === "fa";
    var statusLabels = {
      success: fa ? "موفق" : "Success", failure: fa ? "ناموفق" : "Failed",
      partial: fa ? "نیمه‌موفق" : "Partial", no_attempt: fa ? "بدون تلاش" : "No attempt"
    };
    var rows = "";
    reg.entries.forEach(function (r) {
      var note = fa ? r.n_fa : r.n_en;
      rows += '<tr><td class="recovery-registry-date"><time datetime="' + esc(r.d) + '">' + esc(recoveryDate(r.d)) + '</time></td>' +
        '<td class="recovery-registry-mission"><bdi>' + esc(r.m || "—") + '</bdi>' +
        (r.v ? '<span class="recovery-registry-vehicle"><bdi>' + esc(r.v) + '</bdi></span>' : '') +
        (note ? '<span class="recovery-registry-note">' + esc(note) + '</span>' : '') + '</td>' +
        '<td class="recovery-registry-status"><span class="recovery-registry-dot ' + esc(r.o) + '"></span>' +
        esc(statusLabels[r.o] || r.o) + '</td></tr>';
    });
    return '<details class="recovery-registry"><summary><span>' +
      (fa ? "فهرست کامل فرودها (" + fmtNum(reg.entries.length) + " مورد)" : "Full landing list (" + fmtNum(reg.entries.length) + " entries)") +
      '</span><span class="recovery-expand" aria-hidden="true"></span></summary>' +
      '<div class="recovery-registry-body">' +
      '<p class="recovery-registry-scope">' + esc(fa ? reg.scope_fa : reg.scope_en) + '</p>' +
      (!reg.complete ? '<p class="recovery-registry-partial">' +
        (fa ? "این فهرست هنوز کامل نیست و در گام‌های بعدی تکمیل می‌شود." : "This list is not yet complete and will be extended in later steps.") + '</p>' : '') +
      '<table class="recovery-registry-table"><thead><tr><th>' + (fa ? "تاریخ" : "Date") + '</th><th>' +
      (fa ? "مأموریت / وسیله" : "Mission / vehicle") + '</th><th>' + (fa ? "نتیجه" : "Result") + '</th></tr></thead><tbody>' +
      rows + '</tbody></table>' +
      '<p class="recovery-registry-basis">' + esc(fa ? reg.basis_fa : reg.basis_en) + '</p>' +
      '<div class="recovery-registry-source">' + recoverySource(reg.source_url, fa ? "منبع فهرست" : "List source") +
      '<span>' + (fa ? "بررسی پیوند: " : "Checked: ") + esc(recoveryDate(reg.verified_on)) + '</span></div>' +
      '</div></details>';
  }
  function switchRecoveryTab(button) {
    var root = button.closest(".recovery-dossier");
    if (!root) return;
    root.querySelectorAll("[data-recovery-tab]").forEach(function (tab) {
      var selected = tab === button;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      root.querySelector("#" + tab.getAttribute("aria-controls")).hidden = !selected;
    });
  }
  on("#detailBody", "click", function (event) {
    var button = event.target.closest("button[data-recovery-tab]");
    if (button) { event.preventDefault(); switchRecoveryTab(button); }
  });
  on("#detailBody", "keydown", function (event) {
    var button = event.target.closest("button[data-recovery-tab]");
    if (!button || ["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(event.key) < 0) return;
    var tabs = button.parentElement.querySelectorAll("[data-recovery-tab]");
    var next = event.key === "Home" ? tabs[0] : event.key === "End" ? tabs[tabs.length-1] :
      (button === tabs[0] ? tabs[1] : tabs[0]);
    event.preventDefault(); switchRecoveryTab(next); next.focus();
  });

  function openDetail(p) {
    if (!p) return;
    if (!p.o) {
      p = { kind: p.cat || "company", cat: p.cat || "launch", o: p };
    }
    var cat = p.cat || (p.o ? p.o.cat : "");
    var kind = p.kind || cat;

    if (cat === "recovery" || kind === "recovery") {
      $("#detailBody").innerHTML = renderRecoveryDetail(p.o);
      $("#detail").classList.add("open");
      $("#detail").scrollTop = 0;
      return;
    }
    if (cat === "country" || kind === "country" || (p.o && p.o.cat === "country")) {
      $("#detailBody").innerHTML = renderCountryProfile(p);
      $("#detail").classList.add("open");
      bindCountryItemClicks();
      return;
    }



    if (cat === "propulsion" || (p.o && p.o.cat === "propulsion")) {
      $("#detailBody").innerHTML = renderPropulsionDetail(p);
      $("#detail").classList.add("open");
      return;
    }
    if (cat === "site" || kind === "site") {
      $("#detailBody").innerHTML = renderSiteDetail(p);
      $("#detail").classList.add("open");
      return;
    }
    if (cat === "agency" || (p.o && p.o.cat === "agency")) {
      $("#detailBody").innerHTML = renderAgencyDetail(p);
      $("#detail").classList.add("open");
      return;
    }
    if (cat === "agency" || cat === "launch" || kind === "company" || kind === "launch") {
      $("#detailBody").innerHTML = renderCompanyDetail(p);
      $("#detail").classList.add("open");
      return;
    }
    if (p.cat === "propulsion") {
      $("#detailBody").innerHTML = renderPropulsionDetail(p);
      $("#detail").classList.add("open");
      return;
    }
    // Reverted back to exact normal rendering for launch and propulsion companies
    var o = p.o, h = "";
    var ic = iconFor(p.cat, o.status || "active").replace(/width="3\d"/, 'width="34"').replace(/height="38"/, 'height="44"');
    h += '<div class="d-head"><div>' + ic + "</div><div>" +
      '<div class="d-kicker">' + esc(t("cat_" + p.cat).replace(/های /, "")) + "</div>" +
      '<h2 class="d-title">' + esc(name(o)) + "</h2></div></div>";
    h += '<div class="d-sub">' + esc(LANG === "fa" ? o.en : o.fa) + "</div>";
    h += '<div class="d-desc">' + esc(desc(o)) + "</div>";
    h += '<div class="grid2">';
    h += cell(t("country"), LANG === "fa" ? (o.country_fa || o.country) : (o.country || o.country_fa));
    h += cell(t("city"), LANG === "fa" ? (o.city_fa || o.city) : (o.city || o.city_fa));
    h += cell(t("founded"), o.founded);
    h += cell(t("website"), o.site && o.site !== "—" ? o.site : "", true);
    if (o.lat && o.lon) {
      h += cell(t("coords"), o.lat.toFixed(4) + ", " + o.lon.toFixed(4), true);
    }
    h += '</div>';
    
    var list = o.products || o.rockets || [];
    if (list.length) {
      h += '<div class="sec-t">' + (p.cat === "propulsion" ? t("products") : t("rockets")) + "</div><div class='chips'>" +
        list.map(function (x) { return '<span class="chip">' + esc(x) + "</span>"; }).join("") + "</div>";
    }
    if (o.en_d || o.fa_d) {
      h += '<details class="acc"><summary>▸ ' + t("en_desc") + '</summary><div class="in"><div class="d-desc en">' +
        esc(LANG === "fa" ? o.en_d : o.fa_d) + "</div></div></details>";
    }
    $("#detailBody").innerHTML = h;
    $("#detail").classList.add("open");
  }
  on("#detailClose", "click", function () { var d = $("#detail"); if (d) d.classList.remove("open"); });
  on("#mapSearch", "input", function () { clusterMode = null; renderMarkers(); renderList(); });

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
    clusterMode = null;
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

  window.renderAgencyDetail = renderAgencyDetail;
  window.renderPropulsionDetail = renderPropulsionDetail;
  window.openDetail = openDetail;

  /* ================= boot ================= */
  applyI18n();
  Promise.all([
    fetch("data/companies.json?_t=" + Date.now()).then(function (r) { return r.json(); }),
    fetch("data/sites.json?_t=" + Date.now()).then(function (r) { return r.json(); }),
    fetch("data/missions.json?_t=" + Date.now()).then(function (r) { return r.json(); }),
    fetch("data/recovery_sites.json").then(function (r) {
      if (!r.ok) throw new Error("Recovery data unavailable");
      return r.json();
    }).catch(function (e) { console.warn(e.message); return { sites: [] }; })
  ]).then(function (res) {
    DATA.companies = res[0]; DATA.sites = res[1]; DATA.missions = res[2];
    DATA.recoveries = res[3] && Array.isArray(res[3].sites) ? res[3].sites.filter(validRecoverySite) : [];
    initMap(); buildLayerBar(); renderList(); buildFilters(); renderMissions(); loadUpcoming(); loadNextLaunch(); loadLiveLaunches(); loadSiteUpcomingData();
  }).catch(function (e) {
    var el = $("#mapStatus");
    if (el) { el.style.display = "block"; el.textContent = "خطا در بارگذاری داده‌ها / Data load error: " + e; }
  });
})();
