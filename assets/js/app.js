/* ORBITA — Aerospace intelligence app (v2)
   • professional SVG map markers   • horizontal layer bar
   • mission table with photos, orbit chips, chronological sort, live launches */
(function () {
  "use strict";

  var LANG = localStorage.getItem("orbita_lang") || "fa";
  if (["fa", "en", "ar"].indexOf(LANG) < 0) LANG = "fa";
  var THEME = localStorage.getItem("orbita_theme") || "navy";
  document.documentElement.setAttribute("data-theme", THEME);

  /* ================= i18n ================= */
  var I18N = {
    fa: {
      tagline: "سامانهٔ اطلاعات هوافضا", change_language: "تغییر زبان", search: "جستجو", refresh: "به‌روزرسانی", tab_map: "نقشهٔ جهانی", tab_missions: "پروژه‌های فضایی",
      cat_launch: "شرکت‌های پرتاب", cat_propulsion: "شرکت‌های پیشران", cat_agency: "سازمان‌های فضایی",
      cat_satmaker: "سازندگان ماهواره و قطعات",
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
      tagline: "Aerospace Intelligence Platform", change_language: "Change language", search: "Search", refresh: "Refresh", tab_map: "World Map", tab_missions: "Space Projects",
      cat_launch: "Launch companies", cat_propulsion: "Propulsion companies", cat_agency: "Space agencies",
      cat_satmaker: "Satellite & component makers",
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
    },
    ar: {
      tagline: "منصة معلومات الفضاء والطيران", change_language: "تغيير اللغة", search: "بحث", refresh: "تحديث",
      tab_map: "الخريطة العالمية", tab_missions: "المشاريع الفضائية",
      cat_launch: "شركات الإطلاق", cat_propulsion: "شركات أنظمة الدفع", cat_agency: "وكالات الفضاء",
      cat_satmaker: "مصنّعو الأقمار الصناعية ومكوّناتها",
      cat_site: "مواقع الإطلاق", cat_recovery: "الهبوط والاستعادة", results: "النتائج",
      ph_search_map: "ابحث عن شركة أو موقع إطلاق أو دولة…", ph_search_mission: "ابحث في النتائج المحمّلة…",
      project: "مشروع", upcoming: "عمليات الإطلاق القادمة (بيانات مباشرة)", up_loading: "جارٍ جلب البيانات من خدمة The Space Devs المباشرة…",
      loading_map: "جارٍ تحميل الخريطة…", country: "الدولة", city: "المدينة", founded: "سنة التأسيس",
      website: "الموقع الإلكتروني", products: "المنتجات والبرامج", operator: "المشغّل", first_launch: "أول عملية إطلاق",
      pads: "منصات الإطلاق", rockets: "صواريخ الإطلاق", status: "الحالة", coords: "الإحداثيات", provider: "الجهة المنفذة",
      rocket: "مركبة الإطلاق", orbit: "المدار", mtype: "نوع المهمة", site: "موقع الإطلاق", pad: "منصة الإطلاق",
      location: "الموقع", date: "التاريخ", cost: "التكلفة التقديرية", en_desc: "الوصف الرسمي باللغة الإنجليزية", all: "الكل",
      f_type: "جميع الأنواع", f_status: "جميع النتائج", f_orbit: "جميع المدارات", no_res: "لا توجد نتائج",
      up_err: "تعذّر تحميل البيانات المباشرة (يتطلب الاتصال بالإنترنت).",
      th_mission: "المهمة / التوقيت UTC", th_rocket: "مركبة الإطلاق", th_op: "الجهة المنفذة", th_orbit: "المدار",
      th_loc: "الدولة / موقع الإطلاق", th_result: "النتيجة",
      sort_near: "الترتيب: أقرب موعد", sort_new: "الأحدث إطلاقًا أولًا", sort_old: "من الأقدم إلى الأحدث", sort_az: "ترتيب أبجدي",
      credit: "الصورة", show_map: "إظهار موقع الإطلاق على الخريطة", base_offline: "خريطة دون اتصال", base_online: "خريطة متصلة بالإنترنت",
      toggle_theme: "تغيير نمط الخريطة", style_dark: "النمط 1", style_sunny: "النمط 2", style_osm: "النمط 3",
      tab_orbit: "مدار الأرض", orbit_loading: "جارٍ تجهيز الكرة الأرضية وحساب المدارات…",
      ph_search_sat: "ابحث عن قمر صناعي أو رقم NORAD…", mega: "الكوكبات الضخمة للأقمار الصناعية",
      featured_only: "الأقمار الصناعية البارزة فقط", objects: "أجسام في المدار",
      dens_1: "بارزة", dens_2: "موسّعة", dens_3: "كاملة",
      dens_1_t: "أبرز الأقمار الصناعية في كل مدار مع تنوّع في المهام — عرض مبسّط",
      dens_2_t: "جميع الأجسام باستثناء كوكبتي Starlink وOneWeb الضخمتين",
      dens_3_t: "جميع الأجسام النشطة في مدار الأرض — عرض كثيف",
      pass_btn: "مرور الأقمار فوق موقعك", pass_title: "مرور الأقمار فوق موقعك",
      ph_city: "اكتب اسم المدينة…", use_gps: "استخدام موقع المتصفح",
      only_visible: "المرئية بالعين المجردة فقط", h24: "24 ساعة", h48: "48 ساعة", h72: "72 ساعة",
      pass_hint: "اختر مدينتك لحساب مرور الأقمار البارزة فوقها.",
      pass_calc: "جارٍ حساب مرات المرور…", pass_none: "لم يُعثر على مرور خلال هذه الفترة.",
      pass_none_vis: "لم يُعثر على مرور مرئي بالعين المجردة خلال هذه الفترة. ألغِ تحديد الخيار لعرض جميع مرات المرور.",
      pass_found: "مرور", pass_of: "من أصل", pass_sats: "قمرًا صناعيًا بارزًا",
      p_dur: "المدة", p_max: "أقصى ارتفاع", p_dir: "الاتجاه", p_rng: "المسافة",
      p_min: "د", p_sec: "ث", eye: "مرئي",
      next_launch: "الإطلاق القادم", watch_live: "مشاهدة البث المباشر", close: "إغلاق",
      src_curated: "ملف موثّق", src_live: "مضاف حديثًا", mega_n: "إطلاقات",
      mega_list: "الإطلاقات ضمن هذه الكوكبة",
      live_note: "لا يتوفر وصف عربي لهذا الإطلاق حالياً.",
      pass_note: "يُحسب ذلك محليًا دون الحاجة إلى الإنترنت. تكون الدقة أفضل خلال اليومين الأولين.",
      today: "اليوم", tomorrow: "غدًا", geo_err: "تعذّر تحديد الموقع؛ اختر مدينة يدويًا.",
      my_loc: "موقعك",
      n_n: "شمال", n_ne: "شمال شرقي", n_e: "شرق", n_se: "جنوب شرقي",
      n_s: "جنوب", n_sw: "جنوب غربي", n_w: "غرب", n_nw: "شمال غربي",
      orbit_hint: "اسحب لتدوير الكرة · مرّر للتكبير · انقر على أي نقطة لعرض معلومات القمر الصناعي"
    }
  };
  function t(k) { return (I18N[LANG] && I18N[LANG][k]) || (I18N.en && I18N.en[k]) || k; }

  var STATUS_FA = { success: "موفق", operational: "فعال / در بهره‌برداری", upcoming: "پیش‌رو", development: "در دست توسعه",
    cruise: "در مسیر", partial: "موفقیت نسبی", failure: "ناموفق", deployment: "در حال استقرار",
    active: "فعال", inactive: "غیرفعال", dormant: "راکد", under_construction: "در دست ساخت" };
  var STATUS_EN = { success: "Success", operational: "Operational", upcoming: "Upcoming", development: "In development",
    cruise: "In cruise", partial: "Partial", failure: "Failure", deployment: "Deploying",
    active: "Active", inactive: "Inactive", dormant: "Dormant", under_construction: "Under construction" };
  var STATUS_AR = { success: "نجاح", operational: "قيد التشغيل", upcoming: "قادم", development: "قيد التطوير",
    cruise: "في طريقه", partial: "نجاح جزئي", failure: "فشل", deployment: "قيد النشر",
    active: "نشط", inactive: "غير نشط", dormant: "خامل", under_construction: "قيد الإنشاء" };
  function statusLabel(s) {
    return LANG === "fa" ? (STATUS_FA[s] || s) : LANG === "ar" ? (STATUS_AR[s] || STATUS_EN[s] || s) : (STATUS_EN[s] || s);
  }

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
  C.satmaker = "#a3e635"; // سبز لیمویی — رنگ اختصاصی دستهٔ سازندگان ماهواره و قطعات
  function svgSatmaker(c) { // rounded-square pin + satellite glyph (body, solar panels, antenna)
    return '<svg width="30" height="38" viewBox="0 0 30 38" aria-hidden="true">' +
      '<rect x="3" y="2.6" width="24" height="24" rx="7.5" fill="' + c + '" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/>' +
      '<path d="M15 37l-5.6-10.6h11.2z" fill="' + c + '"/>' +
      '<rect x="11.6" y="10.6" width="6.8" height="8.2" rx="1.4" fill="#040a12"/>' +
      '<rect x="4.4" y="12.3" width="5.6" height="4.8" rx="1" fill="#040a12"/>' +
      '<rect x="20" y="12.3" width="5.6" height="4.8" rx="1" fill="#040a12"/>' +
      '<path d="M10 14.7h1.6M18.4 14.7H20" stroke="#040a12" stroke-width="1.3"/>' +
      '<circle cx="15" cy="8" r="1.5" fill="#040a12"/>' +
      '<path d="M15 9.5v1.1" stroke="#040a12" stroke-width="1.2"/></svg>';
  }
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
    if (cat === "satmaker") return svgSatmaker(C.satmaker);
    if (cat === "launch") return svgLaunch(C.launch);
    if (cat === "propulsion") return svgPropulsion(C.propulsion);
    if (cat === "agency") return svgAgency(C.agency);
    return svgSite(status === "inactive" ? C.siteOff : status === "under_construction" ? C.siteWip : C.site);
  }

  /* ================= state ================= */
  var DATA = { companies: [], sites: [], missions: [], recoveries: [] };
  window.DATA = DATA;

  var markers = [], lastMarkerSig = "", map = null;
  var filters = { launch: true, propulsion: true, agency: true, satmaker: true, site: true, recovery: false };
  var SORT = "new";   /* newest launch first — the user asked for this ordering */

  var $ = function (s) { return document.querySelector(s) || null; };
  function on(sel, ev, fn) { var el = document.querySelector(sel); if (el) el.addEventListener(ev, fn); }
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function name(o) {
    if (LANG === "fa") return o.fa || o.en || "";
    if (LANG === "ar") return o.ar || o.en || o.fa || "";
    return o.en || o.fa || "";
  }
  function desc(o) {
    if (LANG === "fa") return o.fa_d || o.en_d || "";
    if (LANG === "ar") return o.ar_d || (o.live ? "" : (o.en_d || ""));
    return o.en_d || o.fa_d || "";
  }

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
    if (LANG === "ar") {
      var years = Math.round(d / 365), useYears = d > 400, n = useYears ? years : d;
      var unit = useYears
        ? (n === 1 ? "سنة" : n === 2 ? "سنتين" : n >= 3 && n <= 10 ? "سنوات" : "سنة")
        : (n === 1 ? "يوم" : n === 2 ? "يومين" : n >= 3 && n <= 10 ? "أيام" : "يومًا");
      return diff > 0 ? "بعد " + (useYears ? "نحو " : "") + fmtNum(n) + " " + unit
                      : "قبل " + (useYears ? "نحو " : "") + fmtNum(n) + " " + unit;
    }
    if (diff > 0) return d > 400 ? "in ~" + Math.round(d / 365) + " yr" : "in " + d + " d";
    return d > 400 ? "about " + Math.round(d / 365) + " yr ago" : d + " d ago";
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
    document.documentElement.dir = (LANG === "fa" || LANG === "ar") ? "rtl" : "ltr";

    var pageMeta = LANG === "ar" ? {
      title: "ORBITA — منصة معلومات الفضاء والطيران",
      description: "خريطة عالمية لمواقع الإطلاق والمشاريع الفضائية، مع عرض الأقمار الصناعية النشطة في مدار الأرض."
    } : LANG === "en" ? {
      title: "ORBITA — Aerospace Intelligence Platform",
      description: "A global map of launch sites and space projects, with active satellites in Earth orbit."
    } : {
      title: "ORBITA — سامانهٔ اطلاعات هوافضا",
      description: "سامانهٔ اطلاعات هوافضا: نقشهٔ جهانی پایگاه‌های پرتاب، پروژه‌های فضایی، و نمایش سه‌بعدی ماهواره‌های فعال در مدار زمین."
    };
    document.title = pageMeta.title;
    var description = $("meta[name=description]"); if (description) description.content = pageMeta.description;
    var ogTitle = $("meta[property='og:title']"); if (ogTitle) ogTitle.content = pageMeta.title;
    var ogDescription = $("meta[property='og:description']"); if (ogDescription) ogDescription.content = pageMeta.description;

    var lb = $("#langBtn");
    if (lb) {
      lb.textContent = LANG === "fa" ? "EN" : LANG === "en" ? "عربي" : "فا";
      lb.title = t("change_language");
      lb.setAttribute("aria-label", t("change_language"));
    }
    var bb2 = $("#baseBtn"); if (bb2 && bb2.querySelector("span")) bb2.querySelector("span").textContent = t(BASEMODE === "offline" ? "base_offline" : "base_online");
    updateCitiesBtn();
  }
  on("#langBtn", "click", function () {
    var previousLang = LANG;
    LANG = LANG === "fa" ? "en" : LANG === "en" ? "ar" : "fa";
    localStorage.setItem("orbita_lang", LANG);
    applyI18n(); buildLayerBar(); renderMarkers(); buildLabels(); buildCityLabels(); renderList(); buildFilters(); renderMissions();
    var d = $("#detail"); if (d) d.classList.remove("open");
    if (previousLang !== LANG && (previousLang === "ar" || LANG === "ar") && map && BASEMODE === "online") applyMapStyle();
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
        countries: { type: "geojson", data: "assets/geo/countries.json?v=" + (window.ORBITA_V || "1"), promoteId: "NAME" }
      },
      layers: [
        { id: "ocean", type: "background",
          paint: { "background-color": dark ? "#08131f" : "#dbe7f3" } },
        { id: "country-fill", type: "fill", source: "countries",
          paint: { "fill-color": dark ? "#16283d" : "#f7fafc", "fill-opacity": 1 } },
        { id: "country-line", type: "line", source: "countries",
          paint: { "line-color": dark ? "#1e3854" : "#b9c9dc", "line-width": 0.35, "line-opacity": 0.45 } },
        { id: "country-hover", type: "fill", source: "countries",
          paint: { "fill-color": "#F08970", "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.72, 0] } },
        { id: "country-select-outline", type: "line", source: "countries",
          paint: { "line-color": "#1677F5", "line-width": 2,
            "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, 0] } }
      ]
    };
  }

  var COUNTRY_OVERLAY_SOURCE = "orbita-country-interaction";
  var COUNTRY_HIT_LAYER = "orbita-country-hit";
  var COUNTRY_HOVER_LAYER = "orbita-country-hover";
  var COUNTRY_SELECT_OUTLINE_LAYER = "orbita-country-select-outline";
  var COUNTRY_HOVER_COLOR = "#F08970";
  var COUNTRY_SELECTED_OUTLINE = "#1677F5";
  var selectedCountryName = "", hoveredCountryName = "";
  var installingCountryLayers = false, countryFeatureStateNeedsSync = true;
  var countryInteractionEventLayer = "", countryHoverFrame = 0, pendingHoveredCountryName = "";

  function countryInteractionSourceId() {
    if (!map) return "";
    if (map.getSource(COUNTRY_OVERLAY_SOURCE)) return COUNTRY_OVERLAY_SOURCE;
    if (map.getSource("countries")) return "countries";
    return "";
  }
  function setCountryFeatureState(name, stateName, enabled) {
    if (!map || !name) return;
    var source = countryInteractionSourceId();
    if (!source) { countryFeatureStateNeedsSync = true; return; }
    try {
      if (map.isSourceLoaded && !map.isSourceLoaded(source)) { countryFeatureStateNeedsSync = true; return; }
      var state = {}; state[stateName] = !!enabled;
      map.setFeatureState({ source: source, id: name }, state);
    } catch (e) { countryFeatureStateNeedsSync = true; }
  }
  function syncCountryFeatureStates() {
    if (!map || !countryFeatureStateNeedsSync) return;
    var source = countryInteractionSourceId();
    if (!source) return;
    try {
      if (map.isSourceLoaded && !map.isSourceLoaded(source)) return;
      if (hoveredCountryName) map.setFeatureState({ source: source, id: hoveredCountryName }, { hover: true });
      if (selectedCountryName) map.setFeatureState({ source: source, id: selectedCountryName }, { selected: true });
      countryFeatureStateNeedsSync = false;
    } catch (e) {}
  }
  function setHoveredCountry(name) {
    name = name || "";
    if (name === hoveredCountryName) return;
    var previous = hoveredCountryName;
    hoveredCountryName = name;
    if (previous) setCountryFeatureState(previous, "hover", false);
    if (name) setCountryFeatureState(name, "hover", true);
  }
  function setSelectedCountry(name) {
    name = name || "";
    if (name === selectedCountryName) return;
    var previous = selectedCountryName;
    selectedCountryName = name;
    if (previous) setCountryFeatureState(previous, "selected", false);
    if (name) setCountryFeatureState(name, "selected", true);
  }
  function countryRecordFromFeature(feature) {
    var props = feature && feature.properties || {};
    if (!props.NAME) return null;
    return {
      en: props.NAME,
      fa: props.NAME_FA || props.NAME,
      ar: props.NAME_AR || countryNameAr(props.NAME, props.ISO) || props.NAME,
      iso: props.ISO || null
    };
  }
  function countryLayerMouseEnter() {
    if (map && map.getCanvas()) map.getCanvas().style.cursor = "pointer";
  }
  function countryLayerMouseMove(e) {
    var feature = e && e.features && e.features[0];
    var props = feature && feature.properties || {};
    pendingHoveredCountryName = props.NAME || "";
    if (countryHoverFrame) return;
    countryHoverFrame = requestAnimationFrame(function () {
      countryHoverFrame = 0;
      setHoveredCountry(pendingHoveredCountryName);
    });
  }
  function countryLayerMouseLeave() {
    if (countryHoverFrame) cancelAnimationFrame(countryHoverFrame);
    countryHoverFrame = 0; pendingHoveredCountryName = "";
    setHoveredCountry("");
    if (map && map.getCanvas()) map.getCanvas().style.cursor = "";
  }
  function countryRecordFromSpatialMatch(match) {
    if (!match) return null;
    return {
      en: match.country_en, fa: match.country_fa,
      ar: match.country_ar || countryNameAr(match.country_en, match.country_iso) || match.country_en,
      iso: match.country_iso || null
    };
  }
  function unbindCountryInteractionEvents() {
    if (!map || !countryInteractionEventLayer) return;
    try {
      map.off("mouseenter", countryInteractionEventLayer, countryLayerMouseEnter);
      map.off("mousemove", countryInteractionEventLayer, countryLayerMouseMove);
      map.off("mouseleave", countryInteractionEventLayer, countryLayerMouseLeave);
    } catch (e) {}
    countryInteractionEventLayer = "";
  }
  function bindCountryInteractionEvents(layerId) {
    if (!map || !layerId || countryInteractionEventLayer === layerId) return;
    unbindCountryInteractionEvents();
    try {
      map.on("mouseenter", layerId, countryLayerMouseEnter);
      map.on("mousemove", layerId, countryLayerMouseMove);
      map.on("mouseleave", layerId, countryLayerMouseLeave);
      countryInteractionEventLayer = layerId;
    } catch (e) {
      console.warn("country interaction events:", e && e.message || e);
    }
  }
  function handleCountryMapClick(e) {
    if (!map || !e) return;
    var record = null, sourceId = countryInteractionSourceId();
    if (countryInteractionEventLayer && e.point) {
      try {
        var hits = map.queryRenderedFeatures(e.point, { layers: [countryInteractionEventLayer] });
        record = countryRecordFromFeature(hits[0]);
      } catch (err) {}
    }
    var sourceReady = false;
    try { sourceReady = !!sourceId && (!map.isSourceLoaded || map.isSourceLoaded(sourceId)); } catch (err) {}
    if (!record && e.lngLat && (!countryInteractionEventLayer || !sourceReady)) {
      record = countryRecordFromSpatialMatch(getCountryAtLngLat(e.lngLat.lng, e.lngLat.lat));
    }
    if (!record) { setSelectedCountry(""); return; }
    setSelectedCountry(record.en);
    openDetail({
      kind: "country", cat: "country",
      country_en: record.en, country_fa: record.fa, country_ar: record.ar, country_iso: record.iso
    });
  }
  function resetCountryInteractionStyleState() {
    unbindCountryInteractionEvents();
    if (countryHoverFrame) cancelAnimationFrame(countryHoverFrame);
    countryHoverFrame = 0; pendingHoveredCountryName = "";
    setHoveredCountry("");
    countryFeatureStateNeedsSync = true;
  }
  function ensureCountryInteractionLayers() {
    if (!map || installingCountryLayers) return;
    try { if (map.isStyleLoaded && !map.isStyleLoaded()) return; } catch (e) { return; }
    if (map.getSource("countries") && map.getLayer("country-fill")) {
      bindCountryInteractionEvents("country-fill");
      syncCountryFeatureStates();
      return;
    }
    installingCountryLayers = true;
    try {
      if (!map.getSource(COUNTRY_OVERLAY_SOURCE)) {
        map.addSource(COUNTRY_OVERLAY_SOURCE, {
          type: "geojson",
          data: "assets/geo/countries.json?v=" + (window.ORBITA_V || "1"),
          promoteId: "NAME"
        });
      }
      var layers = (map.getStyle() || {}).layers || [], beforeId = null;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol") { beforeId = layers[i].id; break; }
      }
      function addInteractionLayer(layer) {
        if (map.getLayer(layer.id)) return;
        if (beforeId) map.addLayer(layer, beforeId);
        else map.addLayer(layer);
      }
      var stateHover = ["case", ["boolean", ["feature-state", "hover"], false], 0.72, 0];
      addInteractionLayer({ id: COUNTRY_HIT_LAYER, type: "fill", source: COUNTRY_OVERLAY_SOURCE,
        paint: { "fill-color": "#000000", "fill-opacity": 0.001 } });
      addInteractionLayer({ id: COUNTRY_HOVER_LAYER, type: "fill", source: COUNTRY_OVERLAY_SOURCE,
        paint: { "fill-color": COUNTRY_HOVER_COLOR, "fill-opacity": stateHover } });
      addInteractionLayer({ id: COUNTRY_SELECT_OUTLINE_LAYER, type: "line", source: COUNTRY_OVERLAY_SOURCE,
        paint: { "line-color": COUNTRY_SELECTED_OUTLINE, "line-width": 2,
          "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, 0] } });
    } catch (e) {
      console.warn("country interaction layers:", e && e.message || e);
    } finally {
      installingCountryLayers = false;
    }
    if (map.getLayer(COUNTRY_HIT_LAYER)) bindCountryInteractionEvents(COUNTRY_HIT_LAYER);
    syncCountryFeatureStates();
  }

  var ONLINE_DARK_URL = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
  var ONLINE_SUNNY_URL = "assets/geo/jawg_sunny.json";
  var ONLINE_OSM_URL = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

  function onlineStyleUrl() {
    if (MAP_STYLE === "sunny") return ONLINE_SUNNY_URL;
    if (MAP_STYLE === "osm") return ONLINE_OSM_URL;
    return ONLINE_DARK_URL;
  }

  /* ---- native basemap labels: Arabic when supplied, English fallback ---- */
  function localizeStyleLabels(style) {
    (style.layers || []).forEach(function (L) {
      if (!L.layout || L.layout["text-field"] === undefined) return;
      var s = JSON.stringify(L.layout["text-field"]);
      if (s.indexOf("housenumber") > -1) return;
      if (s.indexOf("name") === -1) return;
      L.layout["text-field"] = LANG === "ar"
        ? ["coalesce", ["get", "name_ar"], ["get", "name:ar"], ["get", "name_en"], ["get", "name"]]
        : ["coalesce", ["get", "name_en"], ["get", "name"]];
    });
    return style;
  }
  var STYLE_CACHE = {};
  function cachedOnlineStyle() {
    try {
      var k = "orbita_style_" + LANG + "_" + onlineStyleUrl();
      var saved = JSON.parse(localStorage.getItem(k) || "null");
      if (saved && saved.ts && (Date.now() - saved.ts) < 7 * 86400000 && saved.style) return saved.style;
    } catch (e) {}
    return null;
  }
  function fetchOnlineStyle() {
    var url = onlineStyleUrl();
    var cacheKey = LANG + "|" + url;
    if (STYLE_CACHE[cacheKey]) {
      try { return Promise.resolve(JSON.parse(JSON.stringify(STYLE_CACHE[cacheKey]))); }
      catch (e) { return Promise.resolve(url); }
    }
    var lsKey = "orbita_style_" + LANG + "_" + url;
    try {
      var saved = JSON.parse(localStorage.getItem(lsKey) || "null");
      if (saved && saved.ts && (Date.now() - saved.ts) < 7 * 86400000 && saved.style) {
        STYLE_CACHE[cacheKey] = saved.style;
        return Promise.resolve(JSON.parse(JSON.stringify(saved.style)));
      }
    } catch (e) {}
    return fetch(url).then(function (r) { return r.json(); }).then(function (s) {
      var localized = localizeStyleLabels(s);
      STYLE_CACHE[cacheKey] = JSON.parse(JSON.stringify(localized));
      try { localStorage.setItem(lsKey, JSON.stringify({ ts: Date.now(), style: localized })); } catch (e) {}
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
      resetCountryInteractionStyleState();
      try { map.setStyle(offlineStyle(), { diff: false }); } catch (e) { map.setStyle(offlineStyle()); }
      afterStyleApply();
      return;
    }
    fetchOnlineStyle().then(function (st) {
      if (map) {
        resetCountryInteractionStyleState();
        try { map.setStyle(st, { diff: false }); } catch (e) { map.setStyle(st); }
        map.once("styledata", afterStyleApply);
        afterStyleApply();
      }
    }).catch(function () {
      if (map) {
        var rawUrl = onlineStyleUrl();
        resetCountryInteractionStyleState();
        try { map.setStyle(rawUrl, { diff: false }); } catch (e) { map.setStyle(rawUrl); }
        map.once("styledata", afterStyleApply);
        afterStyleApply();
      }
    });
  }

  /* country name labels rendered as DOM markers (works without remote glyph fonts) */
  var labelMarkers = [], LABELS = null, COUNTRIES_GEO = null;
  var COUNTRY_AR_BY_NAME = Object.create(null), COUNTRY_AR_BY_ISO = Object.create(null);
  var COUNTRY_AR_SPECIAL = {
    "united states": "الولايات المتحدة", "u s a": "الولايات المتحدة", "usa": "الولايات المتحدة",
    "uae": "الإمارات العربية المتحدة", "uk": "المملكة المتحدة",
    "kazakhstan (leased by russia)": "كازاخستان",
    "french guiana": "غويانا الفرنسية", "marshall islands": "جزر مارشال",
    "northern cyprus": "قبرص الشمالية", "turkish republic of northern cyprus": "قبرص الشمالية",
    "kosovo": "كوسوفو", "somaliland": "أرض الصومال", "türkiye": "تركيا",
    "the bahamas": "جزر البهاما", "bahamas": "جزر البهاما",
    "ivory coast": "ساحل العاج", "east timor": "تيمور الشرقية",
    "international waters": "المياه الدولية",
    "international / pacific ocean": "المحيط الهادئ / المياه الدولية"
  };
  function countryNameKey(name) {
    return String(name || "").trim().toLowerCase().replace(/[’]/g, "'").replace(/[._-]+/g, " ").replace(/\s+/g, " ");
  }
  function recordCountryArabic(name, iso, arabic) {
    if (!arabic) return;
    var key = countryNameKey(name), code = String(iso || "").trim().toUpperCase();
    if (key) COUNTRY_AR_BY_NAME[key] = arabic;
    if (code && code !== "-99") COUNTRY_AR_BY_ISO[code] = arabic;
  }
  function countryNameAr(name, iso) {
    var code = String(iso || "").trim().toUpperCase(), key = countryNameKey(name);
    if (code && COUNTRY_AR_BY_ISO[code]) return COUNTRY_AR_BY_ISO[code];
    return COUNTRY_AR_BY_NAME[key] || COUNTRY_AR_SPECIAL[key] || null;
  }
  function indexCountriesGeo(fc) {
    if (!fc || !fc.features) return null;
    fc.features.forEach(function (f) {
      var props = f.properties || {};
      if (props.NAME_AR) recordCountryArabic(props.NAME, props.ISO, props.NAME_AR);
      var g = f.geometry;
      if (!g || !g.coordinates) { f._polys = []; return; }
      var raw = g.type === "Polygon" ? [g.coordinates] : (g.type === "MultiPolygon" ? g.coordinates : []);
      f._polys = raw.map(function (poly) {
        var r = poly[0] || [], minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
        for (var i = 0; i < r.length; i++) {
          var x = r[i][0], y = r[i][1];
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
        return { outer: r, holes: poly.slice(1), minX: minX, minY: minY, maxX: maxX, maxY: maxY };
      });
    });
    return fc;
  }
  function pipRing(x, y, ring) {
    var inside = false, n = ring.length;
    for (var i = 0, j = n - 1; i < n; j = i++) {
      var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-30) + xi)) inside = !inside;
    }
    return inside;
  }
  function segDistSq(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    if (dx === 0 && dy === 0) return (px - ax) * (px - ax) + (py - ay) * (py - ay);
    var t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    if (t < 0) t = 0; else if (t > 1) t = 1;
    var cx = ax + t * dx, cy = ay + t * dy;
    return (px - cx) * (px - cx) + (py - cy) * (py - cy);
  }
  function formatGeoMatch(props, lng, lat) {
    if (props.NAME === "France" && lng > -56 && lng < -50 && lat > 1 && lat < 7) {
      return { country_en: "French Guiana", country_fa: "گویان فرانسه", country_ar: "غويانا الفرنسية", country_iso: "GF" };
    }
    return {
      country_en: props.NAME,
      country_fa: props.NAME_FA || props.NAME,
      country_ar: props.NAME_AR || countryNameAr(props.NAME, props.ISO) || props.NAME,
      country_iso: props.ISO || null
    };
  }
  // Eagerly preload self-hosted country polygons & labels so online map clicks work instantly
  (function preloadCountryGeo() {
    var v = (window.ORBITA_V || "1");
    fetch("assets/geo/countries.json?v=" + v).then(function (r) { return r.json(); })
      .then(function (d) { COUNTRIES_GEO = indexCountriesGeo(d); }).catch(function () {});
    fetch("assets/geo/labels.json?v=" + v).then(function (r) { return r.json(); })
      .then(function (d) { if (!LABELS) { LABELS = d; buildLabels(); } }).catch(function () {});
  })();

  function getCountryAtLngLat(lng, lat) {
    var normLng = ((lng + 180) % 360 + 360) % 360 - 180;
    // 1. Exact point-in-polygon against self-hosted countries.json (handles coasts, exclaves, multi-polygons)
    if (COUNTRIES_GEO && COUNTRIES_GEO.features && COUNTRIES_GEO.features.length) {
      var feats = COUNTRIES_GEO.features;
      for (var i = 0; i < feats.length; i++) {
        var polys = feats[i]._polys || [];
        for (var p = 0; p < polys.length; p++) {
          var b = polys[p];
          if (normLng < b.minX || normLng > b.maxX || lat < b.minY || lat > b.maxY) continue;
          if (pipRing(normLng, lat, b.outer)) {
            var inHole = false;
            for (var h = 0; h < b.holes.length; h++) {
              if (pipRing(normLng, lat, b.holes[h])) { inHole = true; break; }
            }
            if (!inHole) return formatGeoMatch(feats[i].properties, normLng, lat);
          }
        }
      }
      // 2. Coastal tolerance (<= 3 deg to a mapped land boundary for tiny coastal features)
      var bestFeat = null, bestSegD2 = 1e9;
      for (var fi = 0; fi < feats.length; fi++) {
        var ps = feats[fi]._polys || [];
        for (var pi = 0; pi < ps.length; pi++) {
          var pb = ps[pi];
          if (normLng < pb.minX - 3.2 || normLng > pb.maxX + 3.2 || lat < pb.minY - 3.2 || lat > pb.maxY + 3.2) continue;
          var ring = pb.outer;
          for (var ri = 0; ri < ring.length - 1; ri++) {
            var d2 = segDistSq(normLng, lat, ring[ri][0], ring[ri][1], ring[ri + 1][0], ring[ri + 1][1]);
            if (d2 < bestSegD2) { bestSegD2 = d2; bestFeat = feats[fi]; }
          }
        }
      }
      if (bestFeat && bestSegD2 <= 9.0) return formatGeoMatch(bestFeat.properties, normLng, lat);

      // 3. Small sovereign oceanic island sites not represented in the country polygons (e.g. Marshall Islands)
      if (typeof DATA !== "undefined" && Array.isArray(DATA.sites)) {
        var bestSite = null, bestSiteD2 = 6.25;
        for (var si = 0; si < DATA.sites.length; si++) {
          var st = DATA.sites[si];
          if (!st.country || /^international/i.test(st.country) || st.lon == null || st.lat == null) continue;
          var sdx = normLng - st.lon, sdy = lat - st.lat;
          if (sdx > 180) sdx -= 360; else if (sdx < -180) sdx += 360;
          var sd2 = sdx * sdx + sdy * sdy;
          if (sd2 < bestSiteD2) { bestSiteD2 = sd2; bestSite = st; }
        }
        if (bestSite) {
          return { country_en: bestSite.country, country_fa: bestSite.country_fa || bestSite.country,
            country_ar: bestSite.country_ar || countryNameAr(bestSite.country, null) || bestSite.country, country_iso: null };
        }
      }
      return null;
    }

    // 4. Fallback if labels loaded before countries.json
    if (!LABELS || !LABELS.features || !LABELS.features.length) return null;
    var best = null, bestDist = 1e9;
    for (var li = 0; li < LABELS.features.length; li++) {
      var feat = LABELS.features[li];
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
        country_fa: best.properties.NAME_FA || best.properties.NAME,
        country_ar: best.properties.NAME_AR || countryNameAr(best.properties.NAME, best.properties.ISO) || best.properties.NAME,
        country_iso: best.properties.ISO || null
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
      cb.textContent = LANG === "ar"
        ? (SHOW_CITIES ? "المدن: مفعّلة" : "المدن: متوقفة")
        : SHOW_CITIES
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
      var cname = LANG === "fa" ? (f.properties.NAME_FA || f.properties.NAME)
        : LANG === "ar" ? (f.properties.NAME_AR || f.properties.NAME)
        : f.properties.NAME;
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
    /* شروع هوشمند: اگر پوستهٔ آنلاین در کش مرورگر هست، مستقیم با همان (تک‌مرحله‌ای)؛
       وگرنه زمینهٔ محلی فوری و پوستهٔ آنلاین بعداً نرم سوار می‌شود */
    var cs = (BASEMODE !== "offline") ? cachedOnlineStyle() : null;
    if (cs) {
      createMap(JSON.parse(JSON.stringify(cs)));
    } else {
      createMap(offlineStyle());
      if (BASEMODE !== "offline") applyMapStyle();
    }
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
      maxTileCacheSize: 256,
      trackResize: true,
      attributionControl: { compact: true },
      customAttribution: "© OpenStreetMap contributors; Terrae"
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
      ensureCountryInteractionLayers();
      renderMarkers();
      fetch("assets/geo/labels.json?v=" + (window.ORBITA_V || "1")).then(function (r) { return r.json(); })
        .then(function (d) { LABELS = d; buildLabels(); }).catch(function () {});
      fetch("assets/geo/cities.json?v=" + (window.ORBITA_V || "1")).then(function (r) { return r.json(); })
        .then(function (d) { CITIES = d; buildCityLabels(); }).catch(function () {});
    });
    map.on("styledata", function () {
      if ($("#mapStatus")) $("#mapStatus").style.display = "none";
      ensureCountryInteractionLayers();
      if (markers.length === 0) renderMarkers();
    });
    map.on("sourcedata", function (e) {
      if (e && e.isSourceLoaded && (e.sourceId === COUNTRY_OVERLAY_SOURCE || e.sourceId === "countries")) {
        syncCountryFeatureStates();
      }
    });
    map.on("click", handleCountryMapClick);
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

    // Country hover/click events are bound directly to country layers as each style loads.
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

  function canonicalCompanyRecords() {
    return (DATA.companies || []).filter(function (c) { return !c.alias_of_id; });
  }
  function allPoints() {
    var p = [];
    canonicalCompanyRecords().forEach(function (c) { p.push({ kind: "company", cat: c.cat, o: c }); });
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
    function nTxt(group, n) {
      var st = (typeof LAYER_STATE !== "undefined") ? LAYER_STATE[group] : "";
      if ((st === "loading" || st === "idle") && !n) return "…";
      if (st === "error" && !n) return "!";
      return n;
    }
    var companies = canonicalCompanyRecords();
    var cats = [
      { k: "launch", n: companies.filter(function (x) { return x.cat === "launch"; }).length },
      { k: "propulsion", n: companies.filter(function (x) { return x.cat === "propulsion"; }).length },
      { k: "agency", n: companies.filter(function (x) { return x.cat === "agency"; }).length },
      { k: "satmaker", n: companies.filter(function (x) { return x.cat === "satmaker"; }).length },
      { k: "site", n: DATA.sites.length },
      { k: "recovery", n: DATA.recoveries.length }
    ];
    var html = cats.map(function (c) {
      if (c.k === "recovery") {
        return '<button type="button" class="lchip cat-chip recovery-chip' + (filters.recovery ? '' : ' off') +
          '" data-cat="recovery" aria-pressed="' + filters.recovery + '" aria-label="' + t("cat_recovery") + '" title="' + t("cat_recovery") + '"' +
          (c.n ? '' : (LAYER_STATE.recoveries === "error" ? ' disabled' : '')) + ' style="color:' + C.recovery + '">' +
          '<span class="ic">' + svgRecovery(C.recovery).replace('width="30"', 'width="18"').replace('height="38"', 'height="23"') + '</span>' +
          '<span class="lb">' + t("cat_recovery") + '</span><span class="n">' + nTxt("recoveries", c.n) + '</span></button>';
      }
      return '<div class="lchip cat-chip' + (filters[c.k] ? "" : " off") + '" title="' + t("cat_" + c.k) + '" data-cat="' + c.k + '" style="color:' + C[c.k === "site" ? "site" : c.k] + '">' +
        '<span class="ic">' + iconFor(c.k, "active").replace(/width="3\d"/, 'width="18"').replace(/height="38"/, 'height="23"') + "</span>" +
        '<span class="lb" style="color:var(--text)">' + t("cat_" + c.k) + '</span><span class="n">' + nTxt(c.k === "site" ? "sites" : "companies", c.n) + "</span></div>";
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
        /* دادهٔ بازیابی از نگاه اول کنار گذاشته شده؛ با نخستین درخواست کاربر می‌آید */
        if (k === "recovery" && filters.recovery &&
            (LAYER_STATE.recoveries === "idle" || LAYER_STATE.recoveries === "error")) {
          BOOT_LOADERS.recoveries();
          return;
        }
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
  function renderMarkers(force) {
    if (!map) return;
    var sc = pinScale();
    var groups = clusterPoints(filteredPoints());
    /* بازساخت هوشمند: اگر خوشه‌بندی و مقیاس عوض نشده، دست به DOM نزن */
    var sig = sc + "|" + groups.map(function (g) {
      return g.pts.length + ":" + (g.pts[0].o.id || g.pts[0].o.en || "");
    }).join(",");
    if (!force && sig === lastMarkerSig && markers.length) return;
    lastMarkerSig = sig;
    markers.forEach(function (m) { m.remove(); }); markers = [];
    groups.forEach(function (g) {
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


  // Arabic labels for the repeated launch-site infrastructure checklist.
  var INFRA_LABEL_AR = {
    "سکوی پرتاب (Launch Pad)": "منصة الإطلاق",
    "برج پرتاب و خدمات (Launch Tower)": "برج الإطلاق والخدمات",
    "ساختمان مونتاژ موشک (VAB)": "مبنى تجميع المركبات (VAB)",
    "تأسیسات یکپارچه‌سازی (Integration)": "مرفق التكامل",
    "مخازن سوخت و پیشران (Propellant Storage)": "مخازن الوقود والمواد الدافعة",
    "فرآوری محموله (Payload Processing)": "معالجة الحمولة",
    "اتاق کنترل مأموریت (Mission Control)": "مركز التحكم بالمهام",
    "ایستگاه‌های ردیابی (Tracking Station)": "محطات التتبع",
    "رادارهای پایش پرواز (Tracking Radar)": "رادارات تتبع الإطلاق",
    "ایستگاه هواشناسی (Weather Station)": "محطة الأرصاد الجوية",
    "خندق شعله (Flame Trench)": "خندق اللهب",
    "سیستم فوران آب (Water Deluge)": "نظام إغراق المياه",
    "شبکه ریلی / جاده‌ای (Transport Infra)": "شبكة النقل بالسكك الحديدية والطرق",
    "سیستم‌های سوخت‌رسانی (Fueling Systems)": "أنظمة التزويد بالوقود",
    "پادگان و پشتیبانی (Support Base)": "قاعدة الدعم",
    "باند اصلی ۳۸۰۴ متری (Runway 12-30)": "المدرج الرئيسي بطول 3804 أمتار (12–30)",
    "آشیانه‌های اسکیلد کامپوزیتس و شرکت‌ها (Hangars)": "حظائر Skild Composites والشركات",
    "سکوهای تست موتور راکت (Test Stands)": "منصات اختبار المحركات الصاروخية",
    "برج مراقبت (Tower)": "برج المراقبة",
    "گورستان هواپیماها (Storage)": "منطقة تخزين الطائرات",
    "باند ۲٬۷۴۴ متری (Runway)": "مدرج بطول 2744 مترًا",
    "مرکز یکپارچه‌سازی ماهواره (SIF)": "مرفق دمج الأقمار الصناعية (SIF)",
    "پایانهٔ فرودگاهی (Terminal)": "مبنى الركاب",
    "سکوی پرتاب عمودی (Vertical Pad)": "منصة إطلاق عمودية",
    "سکوهای پرتاب راکت کاوشی (Pads)": "منصات إطلاق الصواريخ السبرية",
    "کلیسای تاریخی/موزهٔ فضا (Museum)": "كنيسة تاريخية / متحف الفضاء",
    "مرکز فضایی ویکرام سارابای (VSSC)": "مركز فيكرام ساراباي الفضائي (VSSC)",
    "ایستگاه رادار و تله‌متری (Tracking)": "محطة رادار وقياس عن بُعد",
    "آزمایشگاه‌های یون‌سپهر (Labs)": "مختبرات الأيونوسفير",
    "سکوی پرتاب و برج خدمات (Pad)": "منصة الإطلاق وبرج الخدمات",
    "ساختمان مونتاژ (Assembly)": "مبنى التجميع",
    "ایستگاه کنترل و ردیابی (Control)": "محطة التحكم والتتبع",
    "سکوی تست موتور (Engine Test)": "منصة اختبار المحرك",
    "زیرساخت ریلی/جاده‌ای (Transport)": "بنية النقل بالسكك الحديدية والطرق",
    "سیلوهای پرتاب (Silos)": "صوامع الإطلاق",
    "مرکز فرماندهی (Command)": "مركز القيادة",
    "سالن آماده‌سازی محموله (Payload Prep)": "قاعة إعداد الحمولة",
    "شبکه ریلی (Rail)": "شبكة السكك الحديدية",
    "پادگان پشتیبانی (Support Base)": "قاعدة الدعم",
    "مجتمع تاریخی ۳۳ و دکل وی-۲ (LC-33)": "المجمع التاريخي 33 وبرج V-2 (LC-33)",
    "باند فرود اسپیس هاربر (Space Harbor)": "مدرج Space Harbor",
    "تأسیسات تست ناسا (WSTF)": "منشأة اختبار ناسا (WSTF)",
    "رادار و اپتیک رهگیری (Instrumentation)": "أجهزة الرصد والرادار البصري",
    "موزهٔ موشکی (Museum)": "متحف الصواريخ",
    "سکوی موقت جنسیس": "منصة Genesis المؤقتة",
    "آشیانه یکپارچه‌سازی پرتابگر": "حظيرة دمج مركبات الإطلاق",
    "مرکز کنترل پرتاب و برد": "مركز التحكم بالإطلاق ومدى التتبع",
    "مجتمع LC-1 برای کلاس سنگین": "المجمع LC-1 للمركبات الثقيلة",
    "مجتمع LC-2 برای کلاس میانه": "المجمع LC-2 للمركبات المتوسطة",
    "مجتمع LC-3A/B برای کلاس کوچک و زیرمداری": "المجمع LC-3A/B للمركبات الصغيرة والإطلاقات شبه المدارية"
  };
  var INFRA_LABEL_EN = {
    "سکوی موقت جنسیس": "Temporary Genesis Pad",
    "آشیانه یکپارچه‌سازی پرتابگر": "Launch Vehicle Integration Hangar",
    "مرکز کنترل پرتاب و برد": "Launch and Range Control Center",
    "مجتمع LC-1 برای کلاس سنگین": "LC-1 Heavy-Lift Complex",
    "مجتمع LC-2 برای کلاس میانه": "LC-2 Medium-Lift Complex",
    "مجتمع LC-3A/B برای کلاس کوچک و زیرمداری": "LC-3A/B Small and Suborbital Complex"
  };
  function localizedInfraName(item, locale) {
    var raw = item && item.name ? item.name : "";
    if (locale === "ar") return INFRA_LABEL_AR[raw] || "مرفق في موقع الإطلاق";
    if (locale === "fa") return raw || "—";
    var m = raw.match(/\(([^()]*)\)\s*$/);
    return m ? m[1] : (INFRA_LABEL_EN[raw] || raw || "—");
  }

  function renderSiteDetail(p) {
    var o = p.o, h = "";
    var ic = iconFor(p.cat, o.status).replace(/width="3\d"/, 'width="34"').replace(/height="38"/, 'height="44"');
    var isFa = LANG === "fa", isAr = LANG === "ar";
    var stxt = function (fa, en, ar) { return isFa ? fa : (isAr ? ar : en); };
    function safeEnglish(value, fallback) {
      var v = String(value == null ? "" : value).trim();
      if (!v) return fallback === undefined ? "—" : fallback;
      if (!/[\u0600-\u06FF]/.test(v)) return v;
      var clean = v.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, " ")
        .replace(/[،؛؟]/g, " ").replace(/\(\s*\)/g, " ")
        .replace(/\s*([/|·–—-])\s*$/g, "").replace(/\s+/g, " ").trim();
      return /[A-Za-z0-9]/.test(clean) ? clean : (fallback === undefined ? "—" : fallback);
    }
    function arabicOrEnglish(arabicValue, englishValue, fallback) {
      var a = String(arabicValue == null ? "" : arabicValue).trim();
      return a || safeEnglish(englishValue, fallback);
    }
    function safeArabic(value, fallback) {
      var a = String(value == null ? "" : value).trim();
      return a && !/[پچژگکی]/.test(a) ? a : (fallback === undefined ? "" : fallback);
    }

    // Status label & badge class
    var st = o.status || "active";
    var stClass = st === "active" ? "badge-ok" : (st === "inactive" ? "badge-fail" : "badge-constr");
    var stText = statusLabel(st);

    // Header: Arabic names are primary; the official Latin name remains available secondarily.
    h += '<div class="d-head" style="margin-inline-end: 38px;">';
    h += '<div style="display:flex; gap:10px; align-items:center;"><div>' + ic + '</div><div>' +
      '<div class="d-kicker">' + esc(t("cat_site")) + '</div>' +
      '<h2 class="d-title" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
      esc(name(o)) +
      ' <span class="' + stClass + '" style="padding:2px 8px; border-radius:12px; font-size:10.5px; font-weight:bold; vertical-align:middle;">' + esc(stText) + '</span>' +
      '</h2></div></div>';
    h += '</div>';
    h += '<div class="d-sub"><bdi>' + esc(isFa ? o.en : (isAr ? o.en : o.fa)) + '</bdi></div>';

    // Header photo or clean blueprint illustration.
    h += '<div class="site-photo-box" style="margin-top:8px; margin-bottom:10px; width:100%; height:165px; border-radius:8px; overflow:hidden; border:1px solid var(--line); position:relative; background:#07172b;">';
    if (o.has_photo && o.photo_url) {
      h += '<img src="' + esc(o.photo_url) + '" alt="" aria-hidden="true" class="site-photo-bg" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter:blur(14px) brightness(0.55); transform:scale(1.15);" />';
      h += '<img src="' + esc(o.photo_url) + '" alt="' + esc(name(o)) + '" class="site-photo-img" style="position:relative; width:100%; height:165px; object-fit:contain; z-index:1;" />';
    } else {
      h += "<svg width=\"100%\" height=\"165\" viewBox=\"0 0 380 130\" preserveAspectRatio=\"xMidYMid slice\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background: linear-gradient(135deg, #07172b 0%, #0d2847 100%);\">\n  <defs>\n    <pattern id=\"siteGrid\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\">\n      <path d=\"M 20 0 L 0 0 0 20\" fill=\"none\" stroke=\"rgba(56, 189, 248, 0.12)\" stroke-width=\"0.8\"/>\n    </pattern>\n  </defs>\n  <rect width=\"100%\" height=\"100%\" fill=\"url(#siteGrid)\" />\n  <circle cx=\"190\" cy=\"65\" r=\"45\" stroke=\"rgba(56, 189, 248, 0.25)\" stroke-width=\"1\" fill=\"none\" stroke-dasharray=\"3 3\"/>\n  <circle cx=\"190\" cy=\"65\" r=\"25\" stroke=\"rgba(56, 189, 248, 0.4)\" stroke-width=\"1\" fill=\"none\"/>\n  <line x1=\"190\" y1=\"10\" x2=\"190\" y2=\"120\" stroke=\"rgba(56, 189, 248, 0.2)\" stroke-width=\"1\"/>\n  <line x1=\"130\" y1=\"65\" x2=\"250\" y2=\"65\" stroke=\"rgba(56, 189, 248, 0.2)\" stroke-width=\"1\"/>\n  <path d=\"M190 48 L202 58 L190 68 L178 58 Z\" fill=\"rgba(56, 189, 248, 0.3)\" stroke=\"#38bdf8\" stroke-width=\"1.5\"/>\n  <path d=\"M190 58 L202 68 L190 78 L178 68 Z\" fill=\"rgba(245, 158, 11, 0.3)\" stroke=\"#f59e0b\" stroke-width=\"1.5\"/>\n</svg>";
    }
    h += '</div>';

    if (o.has_photo && o.photo_url && (o.photo_caption_fa || o.photo_caption_en || o.photo_caption_ar || o.photo_credit)) {
      var pcap = isFa ? (o.photo_caption_fa || o.photo_caption_en) : (isAr ? arabicOrEnglish(o.photo_caption_ar, o.photo_caption_en, "") : (o.photo_caption_en || o.photo_caption_fa));
      h += '<div class="site-photo-meta" style="margin:-6px 0 10px; font-size:10px; line-height:1.9; color:var(--muted);">' +
        (pcap ? '<span style="display:block; font-size:10.5px; color:var(--fg);">' + esc(pcap) + '</span>' : '') +
        (o.photo_credit ? stxt('عکس: ', 'Photo: ', 'حقوق الصورة: ') + esc(isAr ? safeEnglish(o.photo_credit, "—") : o.photo_credit) : '') +
        (o.photo_license ? ' · <bdi>' + esc(isAr ? safeEnglish(o.photo_license, "—") : o.photo_license) + '</bdi>' : '') +
        (o.photo_source_url ? ' · <a href="' + esc(o.photo_source_url) + '" target="_blank" rel="noopener noreferrer" style="color:var(--muted); text-decoration:underline;">' + stxt('منبع تصویر', 'Image source', 'مصدر الصورة') + '</a>' : '') +
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
    /* آمار واقعی پایگاه؛ در نبودش همان شمارش ردیف‌های گزیده */
    var statTot = (typeof o.stats_total === "number") ? o.stats_total : tot;
    var statSucc = (typeof o.stats_success === "number") ? o.stats_success : succ;
    var statFail = (typeof o.stats_fail === "number") ? o.stats_fail : fail;
    var statRate = statTot > 0 ? Math.round((statSucc / statTot) * 100) : rate;

    // Three site tabs.
    h += '<div class="site-tabs">';
    h += '<button class="site-tab-btn active" onclick="switchSiteTab(\'overview\', this)">' + stxt("شناسنامه و آمار", "Overview & Stats", "نظرة عامة وإحصاءات") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchSiteTab(\'launches\', this)">' + (isFa ? "تاریخچه و تحلیلی (" + tot + ")" : (isAr ? "سجل الإطلاقات (" + tot + ")" : "Launch History (" + tot + ")")) + '</button>';
    var upcCnt = upcomingCountFor(o.id);
    h += '<button class="site-tab-btn" onclick="switchSiteTab(\'upcoming\', this)">' + stxt("پرتاب‌های پیشِ رو", "Upcoming", "الإطلاقات القادمة") + (upcCnt > 0 ? " (" + upcCnt + ")" : "") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchSiteTab(\'analysis\', this)">' + stxt("تحلیل جغرافیا و زیرساخت", "Analysis & Infra", "التحليل والبنية التحتية") + '</button>';
    h += '</div>';

    // TAB 1: overview and statistics.
    h += '<div id="siteTabOverview" class="site-tab-content active"><div class="grid2">';
    var countryValue = isFa ? (o.country_fa || o.country) : (isAr ? (o.country_ar || countryNameAr(o.country, o.country_iso) || safeEnglish(o.country, "غير محددة")) : (o.country || o.country_fa));
    h += cell(t("country"), countryValue);
    h += cell(t("operator"), isAr ? safeEnglish(o.op, "—") : o.op, true);
    h += cell(t("status"), stText);
    h += cell(t("first_launch"), o.first);
    h += cell(t("pads"), isAr ? safeEnglish(o.pads, "غير متاح بالعربية") : o.pads, true);
    h += cell(t("coords"), o.lat.toFixed(4) + ", " + o.lon.toFixed(4), true);
    h += cell(stxt("ارتفاع از دریا", "Altitude", "الارتفاع عن سطح البحر"), isAr ? safeEnglish(o.alt || "50 m", "—") : (o.alt || "50 m"), true);
    h += cell(stxt("جهت‌های مجاز پرتاب (ازیموت)", "Launch Azimuths", "اتجاهات الإطلاق (السمت)"), isAr ? safeEnglish(o.azimuth, "غير متاح بالعربية") : (o.azimuth || "شرق روی پهنه ایمن"), true);
    h += cell(stxt("مدارهای هدف اصلی", "Target Orbits", "المدارات المستهدفة"), isAr ? safeEnglish(o.target_orbits, "غير متاح بالعربية") : (o.target_orbits || "LEO, SSO"), true);
    h += '</div>';

    h += '<div class="site-metrics-grid">';
    h += '<div class="site-metric-card gold"><div class="lbl">' + stxt("تعداد کل پرتاب‌ها", "Total Launches", "إجمالي عمليات الإطلاق") + '</div><div class="val">' + statTot + '</div><div class="lbl">' + stxt("پرتاب مداری", "Orbital Flights", "إطلاقات مدارية") + '</div></div>';
    h += '<div class="site-metric-card green"><div class="lbl">' + stxt("نرخ موفقیت", "Success Rate", "معدل النجاح") + '</div><div class="val">' + statRate + '%</div><div class="lbl">' + statSucc + (isFa ? " موفق / " : (isAr ? " ناجحة / " : " ok / ")) + statFail + (isFa ? " ناموفق" : (isAr ? " إخفاق" : " failed")) + '</div></div>';
    h += '<div class="site-metric-card"><div class="lbl">' + stxt("ارتفاع از سطح دریا", "Elevation", "الارتفاع") + '</div><div class="val"><bdi>' + esc(isAr ? safeEnglish(o.alt || "50 m", "—") : (o.alt || "50 m")) + '</bdi></div><div class="lbl">' + stxt("متر", "meters", "متر") + '</div></div>';
    h += '<div class="site-metric-card"><div class="lbl">' + stxt("فاصله از خط استوا", "Equator Dist.", "المسافة عن خط الاستواء") + '</div><div class="val" style="font-size:12px; margin-top:5px;"><bdi>' + esc(isAr ? safeEnglish(o.equator_dist, "—") : (o.equator_dist || "0 km")) + '</bdi></div></div>';
    h += '</div>';

    var years = Object.keys(yearCounts).sort();
    var maxVal = 1;
    years.forEach(function (y) { if (yearCounts[y] > maxVal) maxVal = yearCounts[y]; });
    h += '<div class="site-chart-box">';
    h += '<div class="site-chart-head"><span>📊 ' + stxt("روند پرتاب‌های سالانه (سال میلادی)", "Annual Launches (Gregorian)", "عمليات الإطلاق السنوية (بالتقويم الميلادي)") + '</span><span style="font-size:9.5px; opacity:0.75;">' + stxt("استخراج خودکار", "Auto Calculated", "محسوب تلقائيًا") + '</span></div>';
    h += '<div class="site-chart-bars" style="direction: ltr;">';
    years.forEach(function (yr) {
      var cnt = yearCounts[yr];
      var pct = Math.max(Math.round((cnt / maxVal) * 100), 12);
      h += '<div class="site-bar-col"><div class="site-bar-fill" style="height:' + pct + '%;"><span class="site-bar-val">' + cnt + '</span></div><span class="site-bar-lbl">' + yr + '</span></div>';
    });
    h += '</div></div>';

    var rockets = o.rockets || [];
    if (rockets.length) {
      h += '<div class="sec-t">' + stxt("پرتابگرهای مورد استفاده", "Launch Vehicles", "مركبات الإطلاق") + '</div><div class="chips">' +
        rockets.map(function (x) { return '<span class="chip"><bdi>' + esc(isAr ? safeEnglish(x, "—") : x) + '</bdi></span>'; }).join("") + '</div>';
    }
    h += '</div>'; // end overview tab

    // TAB 2: launch history and analytical drawer.
    h += '<div id="siteTabLaunches" class="site-tab-content">';
    h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:6px;">' + stxt("💡 جهت مشاهده جزئیات فنی و تحلیل علت موفقیت/شکست روی هر پرتاب کلیک کنید:", "💡 Click on any launch row for technical details & analysis:", "💡 انقر على سجل الإطلاق لعرض التفاصيل الفنية وتحليل أسباب النجاح أو الإخفاق:") + '</div>';
    h += '<div class="site-launch-list" style="display:flex; flex-direction:column; gap:6px;">';
    launches.forEach(function (l, idx) {
      var resClass = l.success ? "badge-ok" : "badge-fail";
      var resText = l.success ? stxt("موفق", "Success", "نجاح") : stxt("ناموفق", "Failed", "إخفاق");
      var payloadText = isFa ? (l.payload || l.rocket) : (isAr ? safeArabic(l.payload_ar, "اسم الحمولة غير متاح بالعربية") : (l.payload || l.rocket));
      var rocketText = isAr ? safeEnglish(l.rocket, "مركبة إطلاق غير محددة") : (l.rocket || "—");
      var drawerId = "ldrawer_" + idx;
      h += '<div class="site-launch-item" style="background:var(--bg2); border:1px solid var(--line); border-radius:6px; overflow:hidden;">';
      h += '<div class="site-launch-row" onclick="toggleSiteLaunchDrawer(\'' + drawerId + '\')" style="padding:8px 10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:11px; user-select:none;">';
      h += '<div style="display:flex; align-items:center; gap:8px;">';
      h += '<span style="direction:ltr; font-family:monospace; color:var(--accent);"><bdi>' + esc(isAr ? safeEnglish(l.date, "—") : l.date) + '</bdi></span>';
      h += '<b><bdi>' + esc(payloadText) + ' (' + esc(rocketText) + ')</bdi></b>';
      h += '</div>';
      h += '<div><span class="' + resClass + '">' + resText + '</span> <span style="color:var(--accent); font-size:10px; margin-inline-start:4px;">▼</span></div>';
      h += '</div>';

      h += '<div id="' + drawerId + '" class="site-launch-drawer" style="display:none; padding:10px; background:color-mix(in srgb, var(--bg2) 80%, black); border-top:1px solid var(--line); flex-direction:column; gap:8px; font-size:11px;">';
      if (l.has_photo && l.photo_url) {
        h += '<img src="' + esc(l.photo_url) + '" alt="' + esc(payloadText) + '" style="width:100%; height:110px; object-fit:cover; border-radius:5px; border:1px solid var(--line);" />';
      } else {
        h += '<div style="background:rgba(255,255,255,0.03); border:1px dashed var(--line); padding:6px; text-align:center; border-radius:5px; color:var(--muted); font-size:10px;">📷 ' + stxt("تصویر اختصاصی برای این پرتاب ثبت نشده است", "No dedicated photo is available for this launch.", "لا تتوفر صورة مخصصة لهذا الإطلاق.") + '</div>';
      }

      h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; background:rgba(255,255,255,0.02); padding:6px; border-radius:4px; font-size:10.5px;">';
      h += '<div><span style="color:var(--muted);">' + stxt("زمان UTC:", "Time UTC:", "الوقت (UTC):") + '</span> <b><bdi>' + esc(isAr ? safeEnglish(l.time_utc || "12:00:00 UTC", "—") : (l.time_utc || "12:00:00 UTC")) + '</bdi></b></div>';
      h += '<div><span style="color:var(--muted);">' + stxt("جرم محموله:", "Payload Mass:", "كتلة الحمولة:") + '</span> <b><bdi>' + esc(isAr ? safeEnglish(l.mass_en || l.mass, "—") : (l.mass || "—")) + '</bdi></b></div>';
      h += '<div><span style="color:var(--muted);">' + stxt("نسخه پرتابگر:", "Rocket Variant:", "طراز مركبة الإطلاق:") + '</span> <b><bdi>' + esc(isAr ? safeEnglish(l.rocket_var || l.rocket, "—") : (l.rocket_var || l.rocket || "—")) + '</bdi></b></div>';
      h += '<div><span style="color:var(--muted);">' + stxt("شیب مداری:", "Inclination:", "الميل المداري:") + '</span> <b><bdi>' + esc(isAr ? safeEnglish(l.inc, "—") : (l.inc || "—")) + '</bdi></b></div>';
      h += '<div><span style="color:var(--muted);">' + stxt("مدت مأموریت:", "Duration:", "المدة:") + '</span> <b><bdi>' + esc(isAr ? safeEnglish(l.duration, "—") : (l.duration || "—")) + '</bdi></b></div>';
      h += '<div><span style="color:var(--muted);">' + stxt("مدار هدف:", "Orbit:", "المدار:") + '</span> <b><bdi>' + esc(isAr ? safeEnglish(l.orbit, "—") : (l.orbit || "LEO")) + '</bdi></b></div>';
      h += '</div>';

      h += '<div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:5px; padding:8px; font-size:11px; line-height:1.5; color:var(--amber);">';
      var analysisContent;
      if (isFa) {
        analysisContent = l.analysis_fa || l.analysis || "";
      } else if (isAr) {
        var arabicAnalysis = safeArabic(l.analysis_ar, "");
        analysisContent = arabicAnalysis
          ? (l.success ? "✅ <b>تحليل النجاح:</b> " : "❌ <b>تحليل الإخفاق:</b> ") + esc(arabicAnalysis)
          : esc("لا يتوفر وصف عربي لهذا الإطلاق حالياً.");
      } else {
        analysisContent = l.analysis_en || l.analysis || "";
      }
      h += analysisContent;
      h += '</div>';
      h += '</div></div>'; // drawer and launch item
    });
    h += '</div></div>'; // end tab 2

    // TAB 2.5: upcoming launches.
    h += '<div id="siteTabUpcoming" class="site-tab-content" data-site="' + esc(o.id) + '" data-isfa="' + (isFa ? "1" : "0") + '" data-isar="' + (isAr ? "1" : "0") + '">';
    h += buildUpcomingTabInner(o.id, isFa, isAr);
    h += '</div>';

    // TAB 3: geography and infrastructure.
    h += '<div id="siteTabAnalysis" class="site-tab-content">';
    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:6px; padding:10px;">';
    h += '<div style="font-size:12px; font-weight:bold; color:var(--amber); margin-bottom:6px;">🌍 ' + stxt("تحلیل دلایل انتخاب موقعیت جغرافیایی", "Geographical Positioning Analysis", "تحليل الموقع الجغرافي") + '</div>';
    var geoAnalysisText = isAr ? (o.geo_analysis_ar || "لا يتوفر تحليل جغرافي عربي موثّق لهذا الموقع بعد.") : (o.geo_analysis || "");
    h += '<div style="font-size:11px; color:var(--text); line-height:1.6; text-align:justify;">' + esc(geoAnalysisText) + '</div>';
    h += '</div>';

    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:6px; padding:10px;">';
    h += '<div style="font-size:12px; font-weight:bold; color:var(--accent); margin-bottom:8px;">🏗️ ' + stxt("چک‌لیست زیرساخت‌های پایگاه (۱۵ گانه)", "Site Infrastructure Checklist", "قائمة التحقق من بنية موقع الإطلاق") + '</div>';
    h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">';
    (o.infra || []).forEach(function (item) {
      var dotColor = item.active ? "#10b981" : "#ef4444";
      var statusLbl = item.active ? stxt("موجود", "Active", "متاح") : stxt("ناموجود", "Inactive", "غير متاح");
      h += '<div style="background:rgba(255,255,255,0.02); border:1px solid var(--line); padding:5px 7px; border-radius:4px; display:flex; align-items:center; justify-content:space-between; font-size:10.5px;">';
      h += '<span>' + esc(localizedInfraName(item, LANG)) + '</span>';
      h += '<span style="display:flex; align-items:center; gap:4px;"><small style="opacity:0.75;">' + statusLbl + '</small><i style="width:7px; height:7px; border-radius:50%; background:' + dotColor + '; display:inline-block;"></i></span>';
      h += '</div>';
    });
    h += '</div></div>';
    h += '</div>'; // end tab 3
    return h;
  }

  /* ============ upcoming launches per site (tab: پرتاب‌های پیشِ رو) ============ */
  var UPC = { data: null, live: null, liveOk: false };
  var UPL = { data: null };

  function loadSiteUpcomingData() {
    fetch("data/upcoming.json?v=" + (window.ORBITA_V || "1"))
      .then(function (r) { if (!r.ok) throw new Error("upcoming data unavailable"); return r.json(); })
      .then(function (j) { UPC.data = j; syncUpcomingLive(); })
      .catch(function (e) { console.warn("upcoming:", e.message); });
    fetch("data/upcoming_landings.json?v=" + (window.ORBITA_V || "1"))
      .then(function (r) { if (!r.ok) throw new Error("upcoming landings unavailable"); return r.json(); })
      .then(function (j) { UPL.data = j; })
      .catch(function (e) { console.warn("upcoming landings:", e.message); });
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

  function buildUpcomingTabInner(siteId, isFa, isAr) {
    var PREC_BADGE = {
      day: ["#10b981", "روز و ساعت مشخص", "Date & time set", "التاريخ والوقت محددان"],
      month: ["#f59e0b", "فقط ماه مشخص", "Month known", "الشهر محدد"],
      quarter: ["#f97316", "بازهٔ فصلی", "Quarterly window", "نافذة فصلية"],
      tbd: ["#94a3b8", "در انتظار اعلام", "Date TBA", "الموعد غير محدد"]
    };
    var ST_FA = { Go: "تأیید شده", TBC: "در انتظار تأیید", TBD: "زمان نامعین" };
    var ST_AR = { Go: "مؤكد", TBC: "بانتظار التأكيد", TBD: "الموعد غير محدد" };
    var h = "";
    var stxt = function (fa, en, ar) { return isFa ? fa : (isAr ? ar : en); };
    function safeEnglish(value, fallback) {
      var v = String(value == null ? "" : value).trim();
      if (!v) return fallback === undefined ? "—" : fallback;
      if (!/[\u0600-\u06FF]/.test(v)) return v;
      var clean = v.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, " ")
        .replace(/[،؛؟]/g, " ").replace(/\(\s*\)/g, " ")
        .replace(/\s*([/|·–—-])\s*$/g, "").replace(/\s+/g, " ").trim();
      return /[A-Za-z0-9]/.test(clean) ? clean : (fallback === undefined ? "—" : fallback);
    }
    function arabicOrEnglish(arabicValue, englishValue, fallback) {
      var a = String(arabicValue == null ? "" : arabicValue).trim();
      return a || safeEnglish(englishValue, fallback);
    }
    if (!UPC.data) {
      return '<div style="padding:14px; text-align:center; color:var(--muted); font-size:11px;">' + stxt("داده در حال آماده‌سازی است. لحظه‌ای بعد دوباره این زبانه را باز کنید.", "Data is loading; reopen this tab in a moment.", "يجري تحميل البيانات؛ أعد فتح علامة التبويب بعد لحظات.") + '</div>';
    }
    var covered = (UPC.data.sites_covered || []).indexOf(siteId) > -1;
    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:6px; padding:7px 10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; font-size:10px; color:var(--muted);">';
    h += '<span>🗓 ' + stxt("آخرین به‌روزرسانی دادهٔ محلی: ", "Local data updated: ", "آخر تحديث للبيانات المحلية: ") + '<b style="direction:ltr; font-family:monospace;">' + esc(UPC.data.updated || "—") + '</b></span>';
    h += '<span>' + (UPC.liveOk ? stxt("هم‌زمانی زندهٔ تاریخ‌ها: انجام شد ✅", "Live date sync: OK ✅", "مزامنة المواعيد المباشرة: تمت ✅") : stxt("هم‌زمانی زنده: در دسترس نیست", "Live sync: unavailable", "المزامنة المباشرة غير متاحة")) + '</span>';
    h += '</div>';
    if (!covered) {
      h += '<div style="background:rgba(255,255,255,0.03); border:1px dashed var(--line); padding:12px; text-align:center; border-radius:6px; color:var(--muted); font-size:11px;">' + stxt("دادهٔ پرتاب‌های پیشِ رو برای این پایگاه در گام‌های بعدی تکمیل می‌شود.", "Upcoming-launch data for this site will be added in the next phases.", "لم تُضف بيانات الإطلاقات القادمة لهذا الموقع بعد.") + '</div>';
      return h;
    }
    var rows = upcVisibleRows(siteId);
    if (!rows.length) {
      var note = (UPC.data.site_notes || {})[siteId];
      h += '<div style="background:rgba(255,255,255,0.03); border:1px dashed var(--line); padding:12px; text-align:center; border-radius:6px; color:var(--muted); font-size:11px;">' + stxt("پرتابی برای این پایگاه اعلام نشده است.", "No launches are announced for this site.", "لم يُعلن عن إطلاقات لهذا الموقع.");
      if (note) {
        var noteText = isFa ? note[0] : (isAr ? arabicOrEnglish(note[2], note[1], "لا تتوفر ملاحظة عربية لهذا الموقع.") : note[1]);
        h += '<div style="margin-top:7px; font-size:10.5px; line-height:1.7; color:var(--fg); opacity:0.85;">ℹ️ ' + esc(noteText) + '</div>';
      }
      h += '</div>';
      return h;
    }
    h += '<div style="font-size:10px; color:var(--muted); margin-bottom:6px;">' + stxt("💡 تاریخ‌ها طبق اعلام رسمی است و ممکن است جابه‌جا شود. پس از انجام هر پرتاب، ردیف آن حذف و به تاریخچه منتقل می‌شود.", "💡 Dates follow official announcements and may slip. Completed launches move to the history tab.", "💡 المواعيد وفق الإعلانات الرسمية وقد تتغير. بعد تنفيذ الإطلاق، ينتقل سجله إلى علامة تبويب السجل.") + '</div>';
    h += '<div style="display:flex; flex-direction:column; gap:6px;">';
    rows.forEach(function (p, idx) {
      var l = p.l, eff = p.eff;
      var bd = PREC_BADGE[eff.precision] || PREC_BADGE.tbd;
      var drawerId = "udrawer_" + idx;
      var payloadText = isFa ? l.payload_fa : (isAr ? arabicOrEnglish(l.payload_ar, l.payload_en, "اسم الحمولة غير متاح بالعربية") : l.payload_en);
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:6px; overflow:hidden;">';
      h += '<div onclick="toggleSiteLaunchDrawer(\'' + drawerId + '\')" style="padding:8px 10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:11px; user-select:none; gap:6px;">';
      h += '<div style="display:flex; align-items:center; gap:8px; min-width:0;">';
      h += '<span style="direction:ltr; font-family:monospace; color:var(--accent); white-space:nowrap;"><bdi>' + esc(isFa ? eff.dateFa : eff.dateEn) + '</bdi></span>';
      h += '<b style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><bdi>' + esc(payloadText) + '</bdi></b>';
      h += '</div>';
      h += '<span style="display:flex; align-items:center; gap:6px; white-space:nowrap;"><span style="border:1px solid ' + bd[0] + '; color:' + bd[0] + '; border-radius:10px; padding:1px 7px; font-size:9.5px;">' + (isFa ? bd[1] : (isAr ? bd[3] : bd[2])) + '</span><span style="color:var(--accent); font-size:10px;">▼</span></span>';
      h += '</div>';
      h += '<div id="' + drawerId + '" style="display:none; padding:10px; background:color-mix(in srgb, var(--bg2) 80%, black); border-top:1px solid var(--line); flex-direction:column; gap:8px; font-size:11px;">';
      h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; background:rgba(255,255,255,0.02); padding:6px; border-radius:4px; font-size:10.5px;">';
      h += '<div><span style="color:var(--muted);">' + stxt("راکت و پیکربندی:", "Rocket:", "الصاروخ والطراز:") + '</span> <b><bdi>' + esc(isFa ? l.rocket_fa : (isAr ? arabicOrEnglish(l.rocket_ar, l.rocket_en, "غير متاح بالعربية") : l.rocket_en)) + '</bdi></b></div>';
      h += '<div><span style="color:var(--muted);">' + stxt("مدار مقصد:", "Target orbit:", "المدار المستهدف:") + '</span> <b><bdi>' + esc(isFa ? l.orbit_fa : (isAr ? arabicOrEnglish(l.orbit_ar, l.orbit_en, "غير متاح بالعربية") : l.orbit_en)) + '</bdi></b></div>';
      h += '<div><span style="color:var(--muted);">' + stxt("نوع مأموریت:", "Mission type:", "نوع المهمة:") + '</span> <b><bdi>' + esc(isFa ? l.mtype_fa : (isAr ? arabicOrEnglish(l.mtype_ar, l.mtype_en, "غير متاح بالعربية") : l.mtype_en)) + '</bdi></b></div>';
      h += '<div><span style="color:var(--muted);">' + stxt("مشتری / بهره‌بردار:", "Customer:", "العميل / المشغّل:") + '</span> <b><bdi>' + esc(isFa ? l.customer_fa : (isAr ? arabicOrEnglish(l.customer_ar, l.customer_en, "غير متاح بالعربية") : l.customer_en)) + '</bdi></b></div>';
      h += '<div><span style="color:var(--muted);">' + stxt("زمان حدودی:", "Approx. time:", "الوقت التقريبي:") + '</span> <b><bdi>' + esc(isFa ? eff.timeFa : eff.timeEn) + (eff.updatedLive ? ' <span style="color:#10b981; font-size:9px;">' + stxt("(به‌روزشدهٔ زنده)", "(live update)", "(تحديث مباشر)") + '</span>' : '') + '</bdi></b></div>';
      h += '<div><span style="color:var(--muted);">' + stxt("وضعیت:", "Status:", "الحالة:") + '</span> <b>' + esc(isFa ? (ST_FA[eff.status] || eff.status) : (isAr ? (ST_AR[eff.status] || safeEnglish(eff.status, "غير محدد")) : eff.status)) + '</b></div>';
      h += '</div>';
      var descText = isFa ? l.desc_fa : (isAr ? arabicOrEnglish(l.desc_ar, l.desc_en, "لا يتوفر وصف عربي لهذا الإطلاق حالياً.") : l.desc_en);
      h += '<div style="background:rgba(0, 125, 145, 0.07); border:1px solid rgba(0, 125, 145, 0.3); border-radius:5px; padding:8px; font-size:11px; line-height:1.6; color:var(--accent-tx);">' + esc(descText) + '</div>';
      if (l.calendar_url || l.stream_url) {
        h += '<div style="display:flex; gap:8px; flex-wrap:wrap;">';
        if (l.calendar_url) h += '<a href="' + esc(l.calendar_url) + '" target="_blank" rel="noopener noreferrer" style="font-size:10px; color:var(--accent); text-decoration:none; border:1px solid var(--line); border-radius:5px; padding:4px 9px;">🗓 ' + stxt("گاه‌شمار رسمی", "Official schedule", "الجدول الرسمي") + ' ↗</a>';
        if (l.stream_url) h += '<a href="' + esc(l.stream_url) + '" target="_blank" rel="noopener noreferrer" style="font-size:10px; color:var(--accent); text-decoration:none; border:1px solid var(--line); border-radius:5px; padding:4px 9px;">📺 ' + stxt("پخش زندهٔ رسمی", "Official stream", "البث المباشر الرسمي") + ' ↗</a>';
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
        up.innerHTML = buildUpcomingTabInner(up.getAttribute("data-site"), up.getAttribute("data-isfa") === "1", up.getAttribute("data-isar") === "1");
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
    } else if (tabId === "cRecovery") {
      target = $("#compTabCRecovery");
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

  function renderAgencyCompanyArabic(p) {
    var o = p.o || p, h = "";
    var ORG_TYPE_AR = {
      "Government Space Agency": "وكالة فضاء حكومية",
      "International Space Agency": "وكالة فضاء دولية",
      "International Space Organization": "منظمة فضائية دولية"
    };
    var SECTOR_AR = {
      "Aerospace, Launch Vehicles & Satellites": "الطيران والفضاء ومركبات الإطلاق والأقمار الصناعية",
      "Orbital Exploration, Launch Systems, Earth Observation": "استكشاف المدار وأنظمة الإطلاق ورصد الأرض",
      "Aerospace Research, Propulsion Testing, Space Robotics": "أبحاث الطيران والفضاء واختبارات الدفع والروبوتات الفضائية",
      "Pressurized Space Modules, Launch Vehicles, Radar Constellations": "وحدات فضائية مضغوطة ومركبات إطلاق وكوكبات رادارية",
      "Small Satellites, Satellite Telecommunications, Vertical Launchports": "الأقمار الصغيرة واتصالات الأقمار ومواقع الإطلاق العمودية",
      "Space Robotics, Synthetic Aperture Radar, Planetary Science": "الروبوتات الفضائية والرادار ذي الفتحة الاصطناعية وعلوم الكواكب",
      "Lunar & Planetary Exploration, Application Satellites, International Cooperation": "استكشاف القمر والكواكب والأقمار التطبيقية والتعاون الدولي",
      "Remote Sensing, Communication Satellites, Upper-Atmosphere Science": "الاستشعار عن بعد وأقمار الاتصالات وعلوم الغلاف الجوي العلوي",
      "National Space Program, EO & Communication Satellites, Lunar Mission": "البرنامج الفضائي الوطني وأقمار رصد الأرض والاتصالات والبعثات القمرية",
      "Reconnaissance & Communication Satellites, Space Science, NewSpace": "أقمار الاستطلاع والاتصالات وعلوم الفضاء والقطاع الفضائي التجاري الناشئ",
      "Launch Regulation, Moon-to-Mars, Communications & PNT": "تنظيم الإطلاق ومبادرة القمر إلى المريخ والاتصالات والملاحة والتوقيت",
      "Observation & Reconnaissance Satellites, Satellite Launch Vehicles": "أقمار الرصد والاستطلاع ومركبات إطلاق الأقمار الصناعية",
      "National Space Coordination, EO, Communications, Private Launchers": "تنسيق البرنامج الفضائي الوطني ورصد الأرض والاتصالات ومركبات الإطلاق الخاصة",
      "Astronaut Program, Communication & EO Satellites, Space Economy": "برنامج رواد الفضاء وأقمار الاتصالات ورصد الأرض والاقتصاد الفضائي",
      "SAR Earth Observation, Science Satellites, Indigenous Launcher": "رصد الأرض بالرادار ذي الفتحة الاصطناعية والأقمار العلمية ومركبة الإطلاق المحلية"
    };
    var PRODUCT_TYPE_AR = {
      "Remote Sensing Satellite": "قمر صناعي للاستشعار عن بعد",
      "Hyperspectral Remote Sensing Satellite": "قمر للاستشعار عن بعد فائق الأطياف",
      "Heavy-Lift Orbital Rocket": "صاروخ مداري ثقيل الحمولة",
      "Crewed Orbital Spacecraft": "مركبة فضائية مدارية مأهولة",
      "Heavy-Lift Launch Vehicle": "مركبة إطلاق ثقيلة",
      "Lunar Surface Lander & Rover": "مركبة هبوط وجوال قمريان",
      "Next-Gen Heavy Rocket": "صاروخ ثقيل من الجيل الجديد",
      "Remote Sensing Microsatellite": "قمر مصغّر للاستشعار عن بعد",
      "Geostationary Communications Satellite": "قمر اتصالات ثابت بالنسبة إلى الأرض",
      "Earth Observation CubeSat": "قمر CubeSat لرصد الأرض",
      "SAR Satellite": "قمر راداري بتقنية الفتحة الاصطناعية (SAR)",
      "SAR Satellite Constellation": "كوكبة أقمار رادارية (SAR)",
      "Orbiters, Landers, Rovers & Sample-Return": "مدارات ومركبات هبوط وجوالات ومهمات إعادة عينات",
      "Interplanetary Probes": "مسابير بين كوكبية",
      "Experimental & Remote-Sensing Satellites": "أقمار تجريبية وأقمار للاستشعار عن بعد",
      "Domestic EO & Communications": "أقمار محلية لرصد الأرض والاتصالات",
      "Recon Satellites + Indigenous Light Launcher": "أقمار استطلاع ومركبة إطلاق خفيفة محلية",
      "Launch Regulation & Safety": "تنظيم الإطلاق وسلامته",
      "Observation & Reconnaissance": "الرصد والاستطلاع",
      "Three-stage Satellite Launchers": "مركبات إطلاق أقمار ثلاثية المراحل",
      "SAR & Secure Communications": "الرادار ذي الفتحة الاصطناعية والاتصالات الآمنة",
      "Communications & EO": "الاتصالات ورصد الأرض",
      "Science & SAR": "الأبحاث العلمية والرادار ذي الفتحة الاصطناعية"
    };
    var PRODUCT_CLASS_AR = {
      "LEO Earth Observation Satellite": "قمر لرصد الأرض في المدار الأرضي المنخفض",
      "Indigenous Orbital Space Bus": "منصة فضائية مدارية محلية الصنع",
      "Application Satellite": "قمر صناعي تطبيقي",
      "Crewed Interplanetary Capsule": "كبسولة مأهولة بين كوكبية",
      "Super Heavy Lunar Launch Vehicle": "مركبة إطلاق قمرية فائقة الثقل",
      "Infrared Flagship Space Observatory": "مرصد فضائي رئيسي يعمل بالأشعة تحت الحمراء",
      "Heavy Orbital Launch Vehicle": "مركبة إطلاق مدارية ثقيلة",
      "Cosmological Survey Space Probe": "مسبار لمسح الكون",
      "Orbital Crew Transport Vehicle": "مركبة مدارية لنقل الطواقم",
      "Lunar Polar Scientific Orbiter": "مركبة علمية مدارية لدراسة القطب القمري",
      "Indigenous LEO Remote Sensing Bus": "منصة محلية للاستشعار عن بعد في المدار الأرضي المنخفض",
      "Indigenous LEO Telecom Satellite": "قمر اتصالات محلي في المدار الأرضي المنخفض",
      "High-Resolution Optical Satellite Bus": "منصة قمر بصري عالي الدقة",
      "Autonomous Space Tug / Transfer Stage": "قاطرة فضائية ذاتية أو مرحلة نقل مدارية",
      "Heavy Suborbital Bio-Capsule": "كبسولة حيوية شبه مدارية ثقيلة",
      "LEO Earth Observation Microsatellite": "قمر مصغّر لرصد الأرض في المدار الأرضي المنخفض",
      "GEO Communications Satellite": "قمر اتصالات في المدار الثابت (GEO)",
      "LEO Earth Observation CubeSat": "قمر CubeSat لرصد الأرض في المدار الأرضي المنخفض",
      "LEO SAR Satellite": "قمر راداري (SAR) في المدار الأرضي المنخفض",
      "LEO SAR Constellation": "كوكبة رادارية (SAR) في المدار الأرضي المنخفض",
      "Lunar Exploration Probe": "مسبار لاستكشاف القمر",
      "Interplanetary Probe": "مسبار بين كوكبي",
      "Indigenous Application Satellite": "قمر تطبيقي محلي الصنع",
      "National Recon & Launch System": "منظومة وطنية للاستطلاع والإطلاق",
      "Regulatory Infrastructure": "بنية تحتية تنظيمية",
      "State Satellite": "قمر صناعي حكومي",
      "Satellite Launch Vehicle": "مركبة إطلاق أقمار صناعية",
      "National Application Satellite": "قمر صناعي وطني تطبيقي",
      "Advanced EO Satellite": "قمر متقدم لرصد الأرض"
    };
    var STATUS_AR = {
      "Operational": "قيد التشغيل",
      "In orbit": "في المدار",
      "In Orbit": "في المدار",
      "Operational (Artemis II Ready)": "قيد التشغيل (جاهز لمهمة Artemis II)",
      "Operational at Sun-Earth L2 Point": "قيد التشغيل عند نقطة لاغرانج L2 بين الشمس والأرض",
      "Operational at L2 Point": "قيد التشغيل عند نقطة لاغرانج L2",
      "Operational (Primary ISS Backbone)": "قيد التشغيل بوصفه مكوّناً رئيسياً لمحطة ISS",
      "In development; launch planned for 2028": "قيد التطوير؛ والإطلاق مخطط له في 2028",
      "Operational in 500km Orbit": "قيد التشغيل في مدار على ارتفاع 500 km",
      "In orbit; launched on Soyuz from Vostochny": "في المدار؛ أُطلق بصاروخ Soyuz من فوستوتشني",
      "In orbit; launched December 2025 on Soyuz": "في المدار؛ أُطلق بصاروخ Soyuz في ديسمبر 2025",
      "Successful Suborbital Flight Test": "اجتاز اختبار طيران شبه مداري بنجاح",
      "Successful Flight Test (130km Altitude)": "اجتاز اختبار طيران بنجاح على ارتفاع 130 km",
      "Under construction": "قيد الإنشاء",
      "Under Construction": "قيد الإنشاء",
      "Operational at 23 deg East": "قيد التشغيل عند خط طول 23 درجة شرقاً",
      "Operational / In Flight": "قيد التشغيل ومستخدم في الرحلات",
      "Operational / In Development": "قيد التشغيل مع استمرار التطوير",
      "Operational (Artemis Missions)": "قيد التشغيل ضمن مهمات Artemis",
      "Operational (Permanently Crewed)": "قيد التشغيل بطاقم دائم",
      "Test Flights / Launch Ready": "في اختبارات الطيران وجاهز للإطلاق",
      "Operational in Orbit": "قيد التشغيل في المدار",
      "Flight Tested / In Active R&D": "اختُبر في الطيران والبحث والتطوير مستمران",
      "Operational / In R&D": "قيد التشغيل والبحث والتطوير مستمران",
      "Operational Setup / In Development": "البنية التشغيلية قائمة وقيد التطوير",
      "Space weather centre operational; satellite under construction": "مركز طقس الفضاء قيد التشغيل والقمر الصناعي قيد الإنشاء",
      "Operational at 23°E GEO": "قيد التشغيل في المدار الثابت عند 23 درجة شرقاً",
      "Under Construction for Lunar Gateway": "قيد الإنشاء لصالح المحطة القمرية Gateway",
      "Accomplished (2024)": "أُنجز في 2024",
      "In Development": "قيد التطوير",
      "In Orbit (claimed operational)": "في المدار (حالة التشغيل وفق السجل)"
    };
    var COUNTRY_AR = {
      "United States": "الولايات المتحدة", "France": "فرنسا", "Europe": "أوروبا", "Russia": "روسيا",
      "China": "الصين", "India": "الهند", "Japan": "اليابان", "South Korea": "كوريا الجنوبية",
      "Iran": "إيران", "United Arab Emirates": "الإمارات العربية المتحدة", "Brazil": "البرازيل",
      "Egypt": "مصر", "African Union": "الاتحاد الأفريقي", "South Africa": "جنوب أفريقيا",
      "Nigeria": "نيجيريا", "Algeria": "الجزائر", "Angola": "أنغولا", "Ethiopia": "إثيوبيا",
      "Kenya": "كينيا", "Germany": "ألمانيا", "Italy": "إيطاليا", "United Kingdom": "المملكة المتحدة",
      "Canada": "كندا", "Pakistan": "باكستان", "Türkiye": "تركيا", "Israel": "إسرائيل",
      "Australia": "أستراليا", "North Korea": "كوريا الشمالية", "Spain": "إسبانيا",
      "Saudi Arabia": "السعودية", "Argentina": "الأرجنتين"
    };
    function latinDigits(value) {
      return String(value == null ? "" : value)
        .replace(/[۰-۹]/g, function (c) { return "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(c)]; })
        .replace(/[٠-٩]/g, function (c) { return "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(c)]; })
        .replace(/٪/g, "%");
    }
    function safeEnglish(value, fallback) {
      var v = latinDigits(value).trim();
      if (!v) return fallback === undefined ? "غير متاح" : fallback;
      var clean = v.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, " ")
        .replace(/[\u200C\u200D\uFEFF]/g, "").replace(/[،؛؟]/g, " ")
        .replace(/\(\s*\)/g, " ").replace(/\s*([/|·–—-])\s*$/g, "")
        .replace(/\s+/g, " ").trim();
      return /[A-Za-z0-9]/.test(clean) ? clean : (fallback === undefined ? "غير متاح" : fallback);
    }
    function arabicField(value, fallback) {
      var text = String(value == null ? "" : value).trim();
      return text && !/[پچژگکی]/.test(text) ? text : fallback;
    }
    function countryArabic(value) {
      return String(value || "").split(/\s*\/\s*/).map(function (part) {
        return COUNTRY_AR[part] || countryNameAr(part, null) || "غير محددة";
      }).join(" / ");
    }
    function statusArabic(value) { return STATUS_AR[value] || "حالة غير محددة"; }
    function timeframeArabic(value) { return safeEnglish(value, "").replace(/\bto\b/gi, "–").replace(/\bPresent\b/gi, "الآن"); }
    function orgTypeArabic(value) { return ORG_TYPE_AR[value] || "جهة فضائية حكومية"; }
    function sectorArabic(value) { return SECTOR_AR[value] || "الفضاء والأنشطة ذات الصلة"; }
    function productTypeArabic(value) { return PRODUCT_TYPE_AR[value] || "نوع المنتج غير محدد"; }
    function productClassArabic(value) { return PRODUCT_CLASS_AR[value] || "فئة المنتج غير محددة"; }
    function addTextCard(title, text, color) {
      text = arabicField(text, "");
      if (!text) return;
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:9px; margin-top:7px;">';
      h += '<div style="font-size:10.5px; font-weight:bold; color:' + (color || 'var(--accent)') + '; margin-bottom:4px;">' + title + '</div>';
      h += '<div style="font-size:10px; line-height:1.65; color:var(--text);">' + esc(text) + '</div></div>';
    }
    var localizedName = arabicField(o.ar, "وكالة أو مؤسسة فضائية");
    var officialName = safeEnglish(o.en, "");
    var profileDesc = arabicField(o.ar_d, "لا يتوفر وصف عربي موثّق لهذه الجهة حالياً.");
    var orgTypeStr = orgTypeArabic(o.org_type_en);
    var country = countryArabic(o.country);
    var city = arabicField(o.city_ar, "غير محدد");
    var logoSrc = o.logo_data || o.logo || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%2338bdf8' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%2338bdf8' text-anchor='middle'>🏛️</text></svg>";

    // Keep the exact Persian/English agency dossier structure; Arabic changes only the text and data fields.
    h += '<div class="d-head" style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-inline-end: 35px;">';
    h += '<div style="display:flex; gap:10px; align-items:center; flex:1;">';
    h += '<div style="width:48px; height:48px; border-radius:8px; background:#000; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; padding:2px;">';
    h += '<img src="' + esc(logoSrc) + '" alt="' + esc(localizedName) + '" style="max-width:100%; max-height:100%; object-fit:contain;" />';
    h += '</div>';
    h += '<div><div class="d-kicker">وكالات الفضاء</div>';
    h += '<h2 class="d-title" style="margin:0;">' + esc(localizedName) + '</h2></div></div>';
    h += '<span class="badge-gov" style="padding:3px 10px; border-radius:12px; font-size:10.5px; font-weight:bold; white-space:nowrap;">' + esc(orgTypeStr) + '</span>';
    h += '</div>';
    if (officialName) h += '<div class="d-sub" style="margin-top:4px;"><bdi>' + esc(officialName) + '</bdi></div>';
    h += '<div class="d-desc" style="margin-top:6px; line-height:1.6;">' + esc(profileDesc) + '</div>';

    h += '<div class="site-tabs" style="margin-top:10px;">';
    h += '<button class="site-tab-btn active" onclick="switchCompTab(\'overview\', this)">الملف التعريفي والبرامج الرئيسة</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'products\', this)">المنتجات والبرامج</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'timeline\', this)">التاريخ والشبكة</button>';
    h += '</div>';

    // TAB 1: OVERVIEW & CORE FLAGSHIPS — same order and card structure as the Persian template.
    h += '<div id="compTabOverview" class="site-tab-content active" style="display:block;">';
    h += '<div class="grid2" style="margin-top:8px;">';
    h += cell("سنة التأسيس", o.founded == null ? "—" : latinDigits(o.founded));
    h += cell("المقر الرئيسي", city);
    h += cell("الدولة أو النطاق", country);
    h += cell("مجالات العمل", sectorArabic(o.sectors_en), true);
    h += cell("نوع الجهة", orgTypeStr, true);
    h += cell("نطاق النشاط", "وطني / دولي", true);
    h += '</div>';

    var flagProdName = arabicField(o.flagship_product_ar, "منتج غير محدد");
    var flagProdStatus = statusArabic(o.flagship_prod_status_en);
    var flagProdExpl = arabicField(o.flagship_prod_expl_ar, "لا يتوفر وصف عربي موثّق لهذا المنتج حالياً.");
    if (flagProdName) {
      h += '<div style="background:linear-gradient(135deg, rgba(21, 38, 58, 0.92) 0%, rgba(9, 13, 22, 0.96) 100%); border:1px solid rgba(245, 158, 11, 0.4); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">';
      h += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">';
      h += '<span style="font-size:12px; font-weight:bold; color:#f59e0b;">🏆 المنتج البارز: <b><bdi style="color:#f2c649;">' + esc(flagProdName) + '</bdi></b></span>';
      h += '<span class="badge-gov" style="padding:2px 8px; border-radius:10px; font-size:10px; background:rgba(245, 158, 11, 0.2); border:1px solid rgba(245, 158, 11, 0.4); color:#f59e0b;">' + esc(flagProdStatus) + '</span>';
      h += '</div>';
      if (flagProdExpl) h += '<div style="font-size:10.5px; color:#4ec9d8; margin-top:4px; line-height:1.6;">' + esc(flagProdExpl) + '</div>';
      h += '</div>';
    }

    var flagProgName = arabicField(o.flagship_program_ar, "برنامج غير محدد");
    var flagProgTimeline = timeframeArabic(o.flagship_prog_timeline_en || "");
    var flagProgExpl = arabicField(o.flagship_prog_expl_ar, "لا يتوفر وصف عربي موثّق لهذا البرنامج حالياً.");
    if (flagProgName) {
      h += '<div style="background:linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 31, 51, 0.85) 100%); border:1px solid rgba(16, 185, 129, 0.4); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">';
      h += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">';
      h += '<span style="font-size:12px; font-weight:bold; color:#10b981;">🚀 البرنامج الرئيس: <b><bdi style="color:#f2c649;">' + esc(flagProgName) + '</bdi></b></span>';
      if (flagProgTimeline) h += '<span style="padding:2px 8px; border-radius:10px; font-size:10px; background:rgba(16, 185, 129, 0.2); border:1px solid rgba(16, 185, 129, 0.4); color:#10b981;">' + esc(flagProgTimeline) + '</span>';
      h += '</div>';
      if (flagProgExpl) h += '<div style="font-size:10.5px; color:#4ec9d8; margin-top:4px; line-height:1.6;">' + esc(flagProgExpl) + '</div>';
      h += '</div>';
    }

    // Official contacts retain the Persian template's stacked rows; only labels and localized data change.
    var agencyLinks = extractEntityLinks(o);
    var rawWeb = agencyLinks.webUrl;
    var webUrl = rawWeb ? (rawWeb.startsWith("http") ? rawWeb : "https://" + rawWeb) : "";
    var displayWebDomain = webUrl.replace("https://", "").replace("http://", "").replace("www.", "").replace(/\/$/, "");
    var rawLinkedin = o.linkedin || (o.contacts ? o.contacts.linkedin : null);
    var linkedinUrl = rawLinkedin ? (rawLinkedin.startsWith("http") ? rawLinkedin : "https://" + rawLinkedin) : "";
    var displayLinkedin = linkedinUrl.replace("https://", "").replace("http://", "").replace("www.", "").replace(/\/$/, "");
    var emailAddr = o.email || (o.contacts ? o.contacts.email : null) || "";
    if (webUrl || linkedinUrl || emailAddr) {
      h += '<div style="background:linear-gradient(135deg, rgba(15, 31, 51, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%); border:1px solid rgba(56, 189, 248, 0.35); border-radius:8px; padding:12px; margin-top:12px; box-shadow:0 6px 16px rgba(0,0,0,0.4); backdrop-filter:blur(8px);">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#f2c649; margin-bottom:10px; display:flex; align-items:center; gap:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px;">🌐 قنوات الاتصال الرسمية والموقع الإلكتروني:</div>';
      h += '<div style="display:flex; flex-direction:column; gap:8px;">';
      if (webUrl) {
        h += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(16, 185, 129, 0.3);">';
        h += '<span style="font-size:10.5px; color:#f2c649; font-weight:bold;">🌐 الموقع الرسمي:</span>';
        h += '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#10b981; font-weight:bold; text-decoration:none; background:rgba(16, 185, 129, 0.15); padding:4px 12px; border-radius:5px; border:1px solid rgba(16, 185, 129, 0.4); font-size:10.5px; font-family:monospace; display:flex; align-items:center; gap:4px;"><bdi>' + esc(displayWebDomain) + '</bdi> ↗</a>';
        h += '</div>';
      }
      if (linkedinUrl) {
        h += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(56, 189, 248, 0.3);">';
        h += '<span style="font-size:10.5px; color:#f2c649; font-weight:bold;">💼 صفحة LinkedIn الرسمية:</span>';
        h += '<a href="' + esc(linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-weight:bold; text-decoration:none; background:rgba(56, 189, 248, 0.15); padding:4px 12px; border-radius:5px; border:1px solid rgba(56, 189, 248, 0.4); font-size:10.5px; font-family:monospace; display:flex; align-items:center; gap:4px;"><bdi>' + esc(displayLinkedin) + '</bdi> ↗</a>';
        h += '</div>';
      }
      if (emailAddr) {
        h += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(245, 158, 11, 0.3);">';
        h += '<span style="font-size:10.5px; color:#f2c649; font-weight:bold;">📧 البريد الإلكتروني للتواصل:</span>';
        h += '<a href="mailto:' + esc(emailAddr) + '" style="color:#f59e0b; font-weight:bold; font-size:10.5px; font-family:monospace; background:rgba(245, 158, 11, 0.15); padding:4px 12px; border-radius:5px; border:1px solid rgba(245, 158, 11, 0.4); text-decoration:none;"><bdi>' + esc(emailAddr) + '</bdi></a>';
        h += '</div>';
      }
      h += '</div></div>';
    }
    h += '</div>'; // end TAB 1

    // TAB 2: PRODUCTS & UMBRELLA PROGRAMS — same accordions and static program cards as Persian.
    h += '<div id="compTabProducts" class="site-tab-content" style="display:none;">';
    var pList = Array.isArray(o.products_list_bilingual) ? o.products_list_bilingual : [];
    var prgList = Array.isArray(o.programs_list_bilingual) ? o.programs_list_bilingual : [];
    var notMissions = arabicField(o.notable_missions_detail_ar, "");

    if (pList.length) {
      h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:8px;">🛠️ لعرض الفئة الفيزيائية والمواصفات الفنية والدور التشغيلي، اضغط على المنتج:</div>';
      h += '<div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">';
      pList.forEach(function(item, idx) {
        var pName = arabicField(item.name_ar, "") || safeEnglish(item.name_en || item.name, "منتج غير محدد");
        var pClass = item.class_en ? productClassArabic(item.class_en) : (item.type_en ? productTypeArabic(item.type_en) : "منصة فضائية محلية");
        var pYear = latinDigits(item.first_flight_en || item.first_flight || "—");
        var pSt = statusArabic(item.status_en);
        var pSpecs = arabicField(item.specs_ar, "—");
        var pRole = arabicField(item.role_ar, "—");
        var openAttr = (idx === 0) ? " open" : "";
        h += '<details class="acc" ' + openAttr + ' style="background:linear-gradient(180deg, rgba(15,31,51,0.85) 0%, rgba(9,13,22,0.95) 100%); border:1px solid var(--line); border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:all 0.2s ease;">';
        h += '<summary style="padding:10px 12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; user-select:none; background:rgba(255,255,255,0.03); outline:none;">';
        h += '<div style="font-size:12px; font-weight:bold; color:#f2c649; flex:1; line-height:1.5;">📡 <bdi>' + esc(pName) + '</bdi></div>';
        h += '<span style="color:#8ba3c4; font-size:10px; opacity:0.8; margin-inline-start:8px;">▼</span>';
        h += '</summary>';
        h += '<div style="padding:12px; border-top:1px solid rgba(255,255,255,0.08); background:rgba(4,10,18,0.7); color:#e7f0fb; font-size:10.5px; display:flex; flex-direction:column; gap:8px;">';
        h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line); grid-column:span 2;"><b>الفئة الفيزيائية للنظام:</b> <bdi style="color:#38bdf8; font-weight:bold; margin-inline-start:4px;">' + esc(pClass) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>الحالة التشغيلية:</b> <br><bdi style="color:#10b981; font-weight:bold;">' + esc(pSt) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>سنة البناء / أول إطلاق:</b> <br><span style="color:#f59e0b; font-weight:bold;"><bdi>' + esc(pYear) + '</bdi></span></div>';
        h += '</div>';
        if (pSpecs && pSpecs !== "—") {
          h += '<div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.25); padding:8px 10px; border-radius:6px;">';
          h += '<div style="font-size:11px; font-weight:bold; color:#10b981; margin-bottom:3px; display:flex; align-items:center; gap:4px;">⚙️ المواصفات الفنية والمعايير:</div>';
          h += '<div style="font-size:10px; color:#4ec9d8; line-height:1.5;"><bdi>' + esc(pSpecs) + '</bdi></div>';
          h += '</div>';
        }
        if (pRole && pRole !== "—") {
          h += '<div style="background:rgba(15, 31, 51, 0.88); border:1px solid rgba(245, 158, 11, 0.35); border-radius:6px; padding:8px 10px;">';
          h += '<div style="font-size:11px; font-weight:bold; color:#f59e0b; margin-bottom:3px; display:flex; align-items:center; gap:4px;">🛠️ الدور التشغيلي والمهمة المدارية:</div>';
          h += '<div style="font-size:10px; color:#e7f0fb; line-height:1.5;"><bdi>' + esc(pRole) + '</bdi></div>';
          h += '</div>';
        }
        h += '</div></details>';
      });
      h += '</div>';
    }

    if (prgList.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--amber); margin-bottom:6px;">🚀 البرامج الجامعة والكوكبات الفضائية:</div>';
      h += '<div style="display:flex; flex-direction:column; gap:6px;">';
      prgList.forEach(function(prg) {
        var prgName = arabicField(prg.name_ar, "") || safeEnglish(prg.name_en || prg.name, "برنامج غير محدد");
        var prgObj = arabicField(prg.objective_ar, "");
        var prgNext = arabicField(prg.next_step_ar, "");
        h += '<div style="background:rgba(0,0,0,0.3); border-right:3px solid #f59e0b; padding:8px 10px; border-radius:6px; font-size:10.5px;">';
        h += '<b style="color:var(--text); font-size:11px;">🌌 <bdi>' + esc(prgName) + '</bdi></b>';
        if (prgObj) h += '<div style="color:var(--text); font-size:10px; margin-top:3px; line-height:1.5;"><b>الهدف العام:</b> <bdi>' + esc(prgObj) + '</bdi></div>';
        if (prgNext) h += '<div style="color:#38bdf8; font-size:9.5px; margin-top:3px;"><b>الخطوة التالية:</b> <bdi>' + esc(prgNext) + '</bdi></div>';
        h += '</div>';
      });
      h += '</div></div>';
    }

    if (notMissions) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:4px;">🎯 المهمات الفضائية البارزة:</div>';
      h += '<div style="font-size:10.5px; color:var(--text); line-height:1.6;">' + notMissions + '</div>';
      h += '</div>';
    }
    h += '</div>'; // end TAB 2

    // TAB 3: TIMELINE & NETWORK — same order as the Persian template.
    h += '<div id="compTabTimeline" class="site-tab-content" style="display:none;">';
    var timeline = Array.isArray(o.timeline_en) ? o.timeline_en : [];
    var futRoadmap = arabicField(o.future_roadmap_ar, "");
    var partners = arabicField(o.partnerships_detail_ar, "");
    if (timeline.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:8px;">⏳ التاريخ والخط الزمني</div>';
      h += '<div style="display:flex; flex-direction:column; gap:6px;">';
      timeline.forEach(function(item) {
        if (typeof item === "string") {
          h += '<div style="font-size:10.5px; color:var(--text);">• حدث تاريخي غير متوفر بالعربية حالياً.</div>';
        } else {
          var yr = latinDigits(item.year || item.date || "");
          var txt = arabicField(item.text_ar, "حدث تاريخي غير متوفر بالعربية حالياً.");
          h += '<div style="font-size:10.5px; color:var(--text); line-height:1.5;">';
          h += '<b style="color:var(--amber); font-family:monospace;"><bdi>' + esc(yr) + '</bdi>:</b> <bdi>' + esc(txt) + '</bdi>';
          h += '</div>';
        }
      });
      h += '</div></div>';
    }
    if (futRoadmap) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:4px;">🚀 خارطة الطريق الاستراتيجية للتطوير:</div>';
      h += '<div style="font-size:10.5px; color:var(--text); line-height:1.6;">' + esc(futRoadmap) + '</div>';
      h += '</div>';
    }
    if (partners) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#38bdf8; margin-bottom:4px;">🤝 الدبلوماسية الفضائية والشراكات الدولية:</div>';
      h += '<div style="font-size:10.5px; color:var(--text); line-height:1.6;">' + esc(partners) + '</div>';
      h += '</div>';
    }
    h += '</div>'; // end TAB 3

    return h;
  }

  function propulsionArabicLocale(p) {
    var o = p.o || p;
    var CATEGORY_AR = {
      "Solid Propulsion & Spacecraft Thrusters": "الدفع الصلب ودافعات المركبات الفضائية",
      "Orbital Micro-Propulsion, Cold Gas & Green Thrusters": "الدفع المداري الدقيق ودافعات الغاز البارد والوقود الأخضر",
      "Liquid, Solid & Electric Propulsion Systems": "أنظمة الدفع السائل والصلب والكهربائي",
      "Solid Motors & Boosters": "المحركات الصلبة والمعزّزات",
      "Launch & Hypersonic Engines": "محركات الإطلاق والسرعات فوق الصوتية",
      "Maneuverable Spacecraft & Their Engines": "المركبات الفضائية القابلة للمناورة ومحركاتها",
      "Lander & Spacecraft Thrusters": "دافعات المركبات الهابطة والمركبات الفضائية",
      "Satellite Electric Propulsion": "الدفع الكهربائي للأقمار الصناعية",
      "Green & Plasma Propulsion": "أنظمة الدفع الخضراء والبلازمية",
      "Classic Monopropellant Thrusters": "دافعات أحادية الوقود التقليدية",
      "Apogee & Hybrid Motors": "محركات الأوج والمحركات الهجينة",
      "Ariane Family Engines": "محركات عائلة أريان",
      "Miniature Hall Thrusters": "دافعات هول المصغّرة",
      "Iodine Ion Thrusters": "دافعات أيونية تعمل باليود",
      "Kerolox First-stage Engines": "محركات المرحلة الأولى العاملة بالكيروسين والأكسجين السائل",
      "Upper-stage Engines": "محركات المراحل العليا",
      "Cryogenic & In-Space Propulsion": "الدفع المبرد وأنظمة الدفع داخل الفضاء",
      "Liquid, Solid & Defense Propulsion": "أنظمة الدفع السائل والصلب والدفاعي",
      "Indian Satellite Propulsion": "أنظمة دفع الأقمار الصناعية الهندية",
      "Water-based Thrusters": "دافعات تعمل بالماء",
      "Green Bipropellant Propulsion": "الدفع الأخضر ثنائي الوقود",
      "Hybrid Motors & Sounding Rockets": "المحركات الهجينة وصواريخ السبر",
      "RF Plasma Thrusters": "دافعات بلازمية بترددات الراديو",
      "Electrospray Thrusters": "دافعات الرش الكهربائي",
      "Swedish Green Monopropellant": "دافعات أحادية الوقود الخضراء السويدية",
      "Italian Hall Thrusters": "دافعات هول الإيطالية",
      "Russian Hall Thrusters": "دافعات هول الروسية",
      "Indian National Launcher Engines": "محركات الإطلاق الوطنية الهندية",
      "Chinese National Launcher Engines": "محركات الإطلاق الوطنية الصينية",
      "Heavy Liquid & Solid Rocket Propulsion": "أنظمة الدفع الصاروخي السائل والصلب الثقيلة",
      "Medium & Heavy Launcher Engines": "محركات صواريخ الإطلاق المتوسطة والثقيلة",
      "Falcon & Starship Reusable Engines": "محركات فالكون وستارشيب القابلة لإعادة الاستخدام",
      "3D-printed Methalox Engines": "محركات ميثان وأكسجين مطبوعة ثلاثيّاً",
      "Chinese Liquid Engines (same as AALPT)": "محركات صينية سائلة (مطابقة لمدخل AALPT)",
      "Indium FEEP Thrusters": "دافعات انبعاث حقلي تعمل بالإنديوم (FEEP)",
      "German FEEP Thrusters": "دافعات انبعاث حقلي ألمانية (FEEP)",
      "Orbital Propulsion & Subsystems": "أنظمة الدفع المدارية ومكوّناتها الفرعية",
      "Micro Propulsion Systems": "أنظمة الدفع الدقيق",
      "Aircraft Engines (not a space-engine maker)": "محركات طيران (وليست جهة لتصنيع محركات فضائية)",
      "Rocket Engine Test Center": "مركز اختبار محركات الصواريخ",
      "Engine Test Services": "خدمات اختبار المحركات",
      "Thruster & Materials Test Center": "مركز اختبار الدافعات والمواد",
      "ISRO Engine Test Center": "مركز ISRO لاختبار المحركات"
    };
    var TYPE_AR = {
      "Solid motors & bipropellant thrusters": "محركات صلبة ودافعات ثنائية الوقود",
      "Cold-Gas ADCS Thrusters, Monopropellant & Hybrid Motors": "دافعات غاز بارد للتحكم المداري (ADCS)، ومحركات أحادية الوقود وهجينة",
      "Staged Combustion & Hypergolic Engines": "محركات احتراق مرحلي ووقود مفرط الاشتعال",
      "Composite-case solid propulsion": "أنظمة دفع صلبة بغلاف مركّب",
      "Oxygen-rich Staged Combustion": "احتراق مرحلي غني بالأكسجين",
      "Storable thrusters and kick-stage engine": "دافعات قابلة للتخزين ومحرك مرحلة دفع إضافية",
      "3D-printed bipropellant thrusters": "دافعات ثنائية الوقود مطبوعة ثلاثيّاً",
      "Hall-effect and ion thrusters": "دافعات تأثير هول والدافعات الأيونية",
      "Green bipropellant and metal plasma": "دفع أخضر ثنائي الوقود وبلازما معدنية",
      "Hydrazine thrusters and orbital systems": "دافعات هيدرازين وأنظمة مدارية",
      "Mono/bipropellant thrusters & hybrid motors": "دافعات أحادية أو ثنائية الوقود ومحركات هجينة",
      "Hydrogen gas-generator & expander engines": "محركات مولّد غاز وهيدروجين تمددي",
      "Cryogenic expander-cycle, monopropellant, bipropellant & electric propulsion": "دفع مبرد بدورة التمدد، ودفع أحادي وثنائي الوقود وكهربائي",
      "Staged-combustion liquid engines, solid motors & defense propulsion": "محركات سائلة باحتراق مرحلي ومحركات صلبة وأنظمة دفع دفاعية",
      "Hall thrusters for smallsats": "دافعات هول للأقمار الصغيرة",
      "Gridded ion thrusters with iodine propellant": "دافعات أيونية شبكية تعمل باليود",
      "Oxygen-rich staged combustion": "احتراق مرحلي غني بالأكسجين",
      "Kerolox staged combustion": "احتراق مرحلي بالكيروسين والأكسجين السائل",
      "Hall thrusters and green monopropellant": "دافعات هول ودفع أخضر أحادي الوقود",
      "Water-propellant propulsion": "أنظمة دفع تستخدم الماء مادة دافعة",
      "Nitrous oxide / propene thrusters": "دافعات أكسيد النيتروز والبروبين",
      "Hybrid propulsion": "أنظمة دفع هجينة",
      "Electrodeless plasma thrusters": "دافعات بلازمية بلا أقطاب",
      "Ionic-liquid electrospray propulsion": "دفع بالرش الكهربائي لسائل أيوني",
      "HPGP green monopropellant thrusters": "دافعات خضراء عالية الأداء أحادية الوقود (HPGP)",
      "Low- to high-power Hall thrusters": "دافعات هول من منخفضة القدرة إلى عالية القدرة",
      "Stationary plasma thrusters (SPT)": "دافعات بلازما ثابتة (SPT)",
      "Hypergolic & cryogenic hydrogen engines": "محركات تعمل بوقود مفرط الاشتعال وهيدروجين مبرد",
      "Kerolox staged combustion & hydrogen engines": "محركات احتراق مرحلي بالكيروسين والأكسجين السائل ومحركات هيدروجينية",
      "Gas-Generator LREs, Steering Thrusters & Solid Motors": "محركات صاروخية سائلة بمولّد غاز، ودافعات توجيه، ومحركات صلبة",
      "Oxygen-rich staged combustion (methalox) & hydrogen engines": "محركات احتراق مرحلي غني بالأكسجين للميثان أو الهيدروجين",
      "Kerolox gas-generator & full-flow staged-combustion methalox": "مولّد غاز بالكيروسين والأكسجين واحتراق مرحلي كامل التدفق للميثان والأكسجين",
      "Additively manufactured methalox engines": "محركات ميثان وأكسجين مصنّعة بالإضافة",
      "This entry is the same Xi'an organization as AALPT": "هذا السجل يطابق الجهة نفسها في شيآن المسجلة باسم AALPT",
      "Field-emission electric propulsion": "دفع كهربائي بالانبعاث الحقلي",
      "Gas-Generator Liquid Propulsion & Pressure Systems": "أنظمة دفع سائل بمولّد غاز وأنظمة ضغط",
      "Cold gas and integrated micro propulsion": "دفع دقيق متكامل بالغاز البارد",
      "GE's aviation subsidiary in Turin": "شركة GE التابعة للطيران في تورينو",
      "Static test stands (tests engines, builds none)": "منصات اختبار ثابتة للمحركات (تختبر ولا تصنّع)",
      "America's largest engine test site (builds none)": "أكبر موقع أمريكي لاختبار المحركات (لا يصنّعها)",
      "Independent testing for startups (no commercial engines)": "اختبارات مستقلة للشركات الناشئة (من دون إنتاج محركات تجارية)",
      "Storable-thruster and propellant-safety testing (builds none)": "اختبار الدافعات القابلة للتخزين وسلامة المواد الدافعة (من دون تصنيع)",
      "Mahendragiri test stands (engines built at sister LPSC)": "منصات اختبار ماهيندراغيري (تُصنّع المحركات في مركز LPSC الشقيق)"
    };
    var STATUS_AR = {
      "Operational": "قيد التشغيل",
      "Reported (source-limited)": "مذكور في تقارير عامة (المصدر محدود)",
      "Operational — serial delivery": "قيد التشغيل والتوريد التسلسلي",
      "In Development": "قيد التطوير",
      "Qualified": "مؤهل للاستخدام",
      "Flight production": "قيد الإنتاج للرحلات",
      "Flight-proven": "ثبتت صلاحيته في الطيران",
      "Flight Proven": "ثبتت صلاحيته في الطيران",
      "Operational / Flight Tested": "قيد التشغيل ومختبر في الطيران",
      "In Testing": "قيد الاختبار",
      "Ground Testing": "قيد الاختبار الأرضي",
      "Active": "نشط",
      "Transitioning to Epsilon S": "في طور الانتقال إلى Epsilon S",
      "Vacuum Testing Phase": "في مرحلة الاختبار الفراغي",
      "Tested — toward production": "اجتاز الاختبار والانتقال إلى الإنتاج جارٍ",
      "In development & testing": "قيد التطوير والاختبار",
      "In Development & Testing": "قيد التطوير والاختبار",
      "Historical": "تاريخي؛ لم يعد قيد الإنتاج",
      "Supply ended": "انتهى التوريد",
      "Operational & Proven": "قيد التشغيل ومثبت الأداء",
      "Operational in test flights": "قيد التشغيل في رحلات الاختبار",
      "Product listed; flight status not stated": "المنتج مُدرج؛ وحالة الطيران غير مذكورة"
    };
    var COUNTRY_AR = {
      "Australia": "أستراليا", "Austria": "النمسا", "China": "الصين", "France": "فرنسا",
      "Germany": "ألمانيا", "India": "الهند", "Iran": "إيران", "Italy": "إيطاليا",
      "Japan": "اليابان", "Netherlands": "هولندا", "New Zealand": "نيوزيلندا", "Norway": "النرويج",
      "Poland": "بولندا", "Russia": "روسيا", "Sweden": "السويد", "United Kingdom": "المملكة المتحدة",
      "United States": "الولايات المتحدة"
    };
    var PROPELLANT_AR = {
      "Composite solid propellant": "مادة دافعة صلبة مركّبة",
      "Hydrazine / MON": "هيدرازين / MON", "Gaseous Nitrogen (GN2) / Argon": "نيتروجين غازي (GN2) / أرغون",
      "Hydrazine / Green Liquid Propellant": "هيدرازين / مادة دافعة سائلة خضراء",
      "LOX / LH2": "أكسجين سائل / هيدروجين سائل (LOX / LH2)",
      "PBAN solid propellant": "مادة دافعة صلبة من PBAN", "LOX / Kerosene": "أكسجين سائل / كيروسين",
      "LOX / Methane": "أكسجين سائل / ميثان", "Nitrous oxide / Ethane": "أكسيد النيتروز / إيثان",
      "MON-25 / MMH": "MON-25 / MMH", "Xenon": "زينون", "Solid iodine": "يود صلب",
      "HTP / non-toxic fuel": "بيروكسيد الهيدروجين عالي الاختبار / وقود غير سام",
      "Solid molybdenum": "موليبدينوم صلب", "Hydrazine": "هيدرازين", "Storable propellants": "مواد دافعة قابلة للتخزين",
      "LOX / HTPB": "أكسجين سائل / HTPB", "HAN-based green propellant": "مادة دافعة خضراء أساسها HAN",
      "Water": "ماء", "Nitrous oxide / Propene": "أكسيد النيتروز / بروبين",
      "Paraffin / Nitrous oxide": "بارافين / أكسيد النيتروز", "Xenon / Krypton": "زينون / كريبتون",
      "Non-volatile ionic liquid": "سائل أيوني غير متطاير", "LMP-103S (ADN-based)": "LMP-103S (أساسه ADN)",
      "LMP-103S": "LMP-103S", "N2O4 / UDMH": "N2O4 / UDMH",
      "LOX/Kerosene or UDMH/N2O4": "أكسجين سائل / كيروسين أو UDMH / N2O4",
      "HTPB Composite Solid Propellant": "مادة دافعة صلبة مركّبة من HTPB",
      "HTPB Composite / Carbon Fiber Shell": "مركّب HTPB / غلاف من ألياف الكربون",
      "LOX / LNG": "أكسجين سائل / غاز طبيعي مسال", "LOX / RP-1": "أكسجين سائل / RP-1",
      "Storable hypergolics": "مواد دافعة مفرطة الاشتعال قابلة للتخزين",
      "Liquid indium": "إنديوم سائل", "Liquid metal (gallium)": "معدن سائل (غاليوم)",
      "R-236fa": "R-236fa", "Green monopropellant": "مادة دافعة خضراء أحادية الوقود",
      "LH2 / LOX": "هيدروجين سائل / أكسجين سائل", "Various propellants": "مواد دافعة متنوعة",
      "Customer propellants": "مواد دافعة يحددها العميل", "UDMH / N2O4": "UDMH / N2O4",
      "High-test peroxide (HTP)": "بيروكسيد الهيدروجين عالي التركيز (HTP)",
      "HTP + configuration-specific hydrocarbon fuel": "بيروكسيد الهيدروجين عالي التركيز + وقود هيدروكربوني وفق التهيئة",
      "87.5% H2O2 / HTPB": "بيروكسيد الهيدروجين بتركيز 87.5% / HTPB",
      "M20 / MON-3": "وقود M20 / مؤكسد MON-3",
      "Solid metallic propellant (exact metal not publicly specified)": "مادة دافعة معدنية صلبة (نوع المعدن غير محدد علناً)",
      "Hydrazine / N2O4 (NTO)": "هيدرازين / رباعي أكسيد النيتروجين (NTO)",
      "Not independently verified": "غير متحقق منه بصورة مستقلة"
    };
    var PRODUCT_TYPE_AR = {
      "Solid strap-on motor": "محرك صلب مساعد", "Three-stage solid motors": "محركات صلبة ثلاثية المراحل",
      "Bipropellant apogee thruster": "دافع ثنائي الوقود للأوج", "Cold Gas Micro-Propulsion": "دفع دقيق بالغاز البارد",
      "Monopropellant Catalytic Thruster": "دافع حفزي أحادي الوقود", "Staged Combustion Cycle": "دورة احتراق مرحلي",
      "Expander Cycle": "دورة تمددية", "Expander cycle": "دورة تمددية", "Large segmented solid motor": "محرك صلب كبير مجزّأ",
      "Solid upper-stage motor": "محرك صلب للمرحلة العليا", "Oxygen-rich staged combustion": "احتراق مرحلي غني بالأكسجين",
      "Methalox staged combustion": "احتراق مرحلي للميثان والأكسجين", "Storable thruster": "دافع قابل للتخزين",
      "Kick-stage engine": "محرك مرحلة دفع إضافية", "Storable bipropellant thruster": "دافع ثنائي الوقود قابل للتخزين",
      "6 kW Hall-effect thruster": "دافع تأثير هول بقدرة 6 kW", "RF ion thruster": "دافع أيوني بترددات الراديو",
      "Green bipropellant system": "نظام دفع أخضر ثنائي الوقود", "Metal-plasma thruster": "دافع بلازمي معدني",
      "Hydrazine monopropellant": "هيدرازين أحادي الوقود", "Apogee-class engine": "محرك فئة الأوج",
      "High-thrust bipropellant engine": "محرك ثنائي الوقود عالي الدفع",
      "Liquid engine cluster (cycle unconfirmed)": "مجموعة محركات سائلة (دورة التشغيل غير مؤكدة علناً)",
      "Hybrid rocket motor": "محرك صاروخي هجين",
      "Hydrogen gas-generator cycle": "دورة مولّد غاز هيدروجينية", "Low-power Hall thruster": "دافع هول منخفض القدرة",
      "Mid-power Hall thruster": "دافع هول متوسط القدرة", "Gridded ion thruster": "دافع أيوني شبكي",
      "Iodine cold-gas thruster": "دافع غاز بارد يعمل باليود", "Gas-generator cycle": "دورة مولّد الغاز",
      "Two-chamber ORSC": "احتراق مرحلي غني بالأكسجين بغرفتين (ORSC)",
      "Green monopropellant system": "نظام دفع أخضر أحادي الوقود", "Hall-effect thruster": "دافع بتأثير هول",
      "Water resistojet": "دافع مقاومي يعمل بالماء", "Water-propellant ion thruster": "دافع أيوني يعمل بالماء",
      "Green bipropellant thruster": "دافع أخضر ثنائي الوقود", "Small green bipropellant": "نظام دفع أخضر ثنائي الوقود للأقمار الصغيرة",
      "RF plasma thruster": "دافع بلازمي بترددات الراديو", "Electrospray thruster": "دافع بالرش الكهربائي",
      "Green monopropellant thruster": "دافع أخضر أحادي الوقود", "Higher-thrust green monoprop": "دافع أخضر أحادي الوقود عالي الدفع",
      "5 kW Hall thruster": "دافع هول بقدرة 5 kW", "1.35 kW Hall thruster": "دافع هول بقدرة 1.35 kW",
      "4.5 kW Hall thruster": "دافع هول بقدرة 4.5 kW", "Hypergolic gas-generator cycle": "دورة مولّد غاز ذاتية الاشتعال",
      "Hydrogen staged combustion": "احتراق مرحلي للهيدروجين", "Closed expander cycle": "دورة تمدد مغلقة",
      "Quad Gas-Generator Liquid Cluster": "مجموعة من أربعة محركات سائلة بمولّد غاز",
      "1.5m Diameter Solid Motor": "محرك صلب بقطر 1.5 m", "Solid Motor with Thrust Vector Control": "محرك صلب بتحكم في اتجاه الدفع",
      "Hydrogen open expander cycle": "دورة تمدد مفتوحة للهيدروجين", "Hydrogen dual-expander cycle": "دورة تمدد مزدوجة للهيدروجين",
      "Full-flow staged combustion": "احتراق مرحلي كامل التدفق", "Spacecraft thrusters": "دافعات المركبات الفضائية",
      "Methalox gas-generator cycle": "دورة مولّد غاز للميثان والأكسجين", "High-thrust methalox gas-generator": "مولّد غاز ميثان وأكسجين عالي الدفع",
      "Vacuum-optimized Aeon": "Aeon مهيأ للعمل في الفراغ", "FEEP thruster": "دافع بالانبعاث الحقلي (FEEP)",
      "Higher-power FEEP": "دافع FEEP أعلى قدرة", "Multi-emitter FEEP system": "نظام FEEP متعدد البواعث",
      "Gas-Generator Liquid Propulsion & Pressure Systems": "أنظمة دفع سائل بمولّد غاز وأنظمة ضغط",
      "Integrated cold-gas system": "نظام متكامل للغاز البارد", "Green chemical micro propulsion": "دفع كيميائي أخضر دقيق",
      "Aviation manufacturing (non-rocket)": "تصنيع للطيران (ليس صاروخياً)", "Main-stage engine test stand": "منصة اختبار لمحرك المرحلة الرئيسة",
      "Vacuum upper-stage test stand": "منصة اختبار فراغي لمحرك مرحلة عليا", "Full-stage test stand": "منصة اختبار مرحلة كاملة",
      "Single-engine test stand": "منصة اختبار لمحرك منفرد", "Commercial test stands": "منصات اختبار تجارية",
      "Static stands and instrumentation": "منصات ثابتة وأجهزة قياس", "Spacecraft thruster test stands": "منصات اختبار دافعات المركبات الفضائية",
      "Cryogenic engine test stand": "منصة اختبار محركات مبردة", "Liquid engine test stand": "منصة اختبار محركات سائلة"
    };
    function latinDigits(value) {
      return String(value == null ? "" : value)
        .replace(/[۰-۹]/g, function (c) { return "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(c)]; })
        .replace(/[٠-٩]/g, function (c) { return "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(c)]; })
        .replace(/٪/g, "%");
    }
    function safeEnglish(value, fallback) {
      var v = latinDigits(value).trim();
      if (!v) return fallback === undefined ? "غير متاح" : fallback;
      var clean = v.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, " ")
        .replace(/[\u200C\u200D\uFEFF]/g, "").replace(/[،؛؟]/g, " ")
        .replace(/\(\s*\)/g, " ").replace(/\s*([/|·–—-])\s*$/g, "")
        .replace(/\s+/g, " ").trim();
      return /[A-Za-z0-9]/.test(clean) ? clean : (fallback === undefined ? "غير متاح" : fallback);
    }
    function uniqueValues(values) {
      var seen = Object.create(null);
      return (Array.isArray(values) ? values : []).filter(function (value) {
        var text = String(value == null ? "" : value).trim(), key = text.toLowerCase();
        if (!text || seen[key]) return false;
        seen[key] = true;
        return true;
      });
    }
    function countryArabic(value) {
      return String(value || "").split(/\s*\/\s*/).map(function (part) {
        return COUNTRY_AR[part] || countryNameAr(part, null) || "غير محددة";
      }).join(" / ");
    }
    function orgTypeArabic(value) {
      var v = safeEnglish(value, "");
      if (/aviation|aircraft/i.test(v)) return "شركة متخصصة في مكوّنات محركات الطيران";
      if (/state|government|public/i.test(v)) return "مركز حكومي للبحث واختبار أنظمة الدفع الفضائي";
      if (/academic|research|university|lab/i.test(v)) return "مختبر أكاديمي للبحث والتطوير في الدفع الفضائي";
      if (/prime/i.test(v)) return "مقاول رئيسي لأنظمة الدفع الفضائي";
      if (/test|facility|center|centre/i.test(v) || /test/i.test(o.propulsion_category_en || "")) return "منشأة لاختبار وتأهيل أنظمة الدفع";
      return "جهة متخصصة في أنظمة الدفع الفضائي";
    }
    function statusArabic(value) { return STATUS_AR[value] || "حالة غير محددة"; }
    function categoryArabic(value) { return CATEGORY_AR[value] || "أنظمة الدفع الفضائي"; }
    function propulsionTypeArabic(value) { return TYPE_AR[value] || "أنظمة الدفع الفضائي"; }
    function propellantArabic(value) { return PROPELLANT_AR[value] || "غير متاح"; }
    function productTypeArabic(value) { return PRODUCT_TYPE_AR[value] || "نوع النظام غير محدد"; }
    function arabicText(value, fallback) {
      var text = latinDigits(value).trim();
      var hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
      return hasArabic && !/[پچژگکی]/.test(text) ? text : (fallback === undefined ? "" : fallback);
    }
    function technicalValueArabic(value) {
      var text = latinDigits(value).trim();
      if (!text || text === "—") return "";
      if (/[پچژگکی]/.test(text)) return "";
      if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) return text;
      return /^[~≈±\d.,+\-–—/() \u00B5µA-Za-z]+$/.test(text) && !/[A-Za-z]{4,}/.test(text) ? text : "";
    }
    function officialModelName(value) {
      var text = safeEnglish(value, "");
      return text && (/[0-9]/.test(text) || /[A-Z]{2,}/.test(text)) ? text : "";
    }
    var localizedName = arabicText(o.ar, "جهة متخصصة في أنظمة الدفع الفضائي");
    var officialName = safeEnglish(o.en, "");
    var profileDesc = arabicText(o.ar_d, "لا يتوفر وصف عربي موثّق لهذه الجهة حالياً.");
    return {
      localizedName: localizedName,
      officialName: officialName,
      profileDesc: profileDesc,
      orgType: orgTypeArabic(o.org_type_en),
      status: statusArabic(o.flagship_status_en),
      category: categoryArabic(o.propulsion_category_en),
      propulsionType: propulsionTypeArabic(o.propulsion_type_en),
      city: arabicText(o.city_ar, "غير محدد"),
      country: countryArabic(o.country),
      flagship: arabicText(o.flagship_engine_ar, "نظام الدفع الرئيس غير محدد"),
      application: arabicText(o.flagship_application_ar, ""),
      latinDigits: latinDigits,
      safeEnglish: safeEnglish,
      uniqueValues: uniqueValues,
      countryArabic: countryArabic,
      orgTypeArabic: orgTypeArabic,
      statusArabic: statusArabic,
      categoryArabic: categoryArabic,
      propulsionTypeArabic: propulsionTypeArabic,
      propellantArabic: propellantArabic,
      productTypeArabic: productTypeArabic,
      arabicText: arabicText,
      technicalValueArabic: technicalValueArabic,
      officialModelName: officialModelName,
      maps: { CATEGORY_AR: CATEGORY_AR, TYPE_AR: TYPE_AR, STATUS_AR: STATUS_AR,
        COUNTRY_AR: COUNTRY_AR, PROPELLANT_AR: PROPELLANT_AR, PRODUCT_TYPE_AR: PRODUCT_TYPE_AR }
    };
  }

  // Backward-compatible name; all locales now share the Persian dossier template.
  function renderPropulsionCompanyArabic(p) {
    return renderPropulsionDetail(p);
  }

  function renderLaunchCompanyArabic(p) {
    var o = p.o || p, h = "";
    var ORG_AR = {
      "Leading Commercial Launch Operator": "مشغّل إطلاق تجاري رائد",
      "Private Startup": "شركة ناشئة خاصة",
      "Commercial Spaceflight Company": "شركة رحلات فضائية تجارية",
      "Joint Venture (Boeing & Lockheed Martin)": "مشروع مشترك بين Boeing وLockheed Martin",
      "State Aerospace Industrial Enterprise": "مؤسسة حكومية للصناعات الفضائية",
      "State / Defense Sector": "جهة حكومية / قطاع دفاعي",
      "Private Aerospace & Defense Conglomerate": "تكتل خاص للطيران والفضاء والدفاع",
      "Private / Industrial Group Subsidiary": "شركة تابعة لمجموعة صناعية",
      "Private / Industrial Corporation": "شركة صناعية خاصة",
      "State-backed / Propulsion Technology": "شركة تقنيات دفع مدعومة حكوميًا"
    };
    var STATUS_AR = {
      "Active & Operational": "نشط وقيد التشغيل",
      "Active & Operational (750km Altitude Record Holder)": "نشط وقيد التشغيل وصاحب رقم قياسي بارتفاع 750 km",
      "Operational (100% Success Rate)": "قيد التشغيل (معدل نجاح 100%)",
      "In Development": "قيد التطوير",
      "R&D": "البحث والتطوير",
      "Active (suborbital) / Orbital in development": "نشط في الرحلات شبه المدارية؛ والإطلاق المداري قيد التطوير",
      "Operational": "قيد التشغيل",
      "Test-operational": "قيد الاختبار والتشغيل",
      "Ready for flight test": "جاهز لاختبار الطيران",
      "In Design": "في مرحلة التصميم",
      "Prototype": "نموذج أولي",
      "Transitioning to next generation": "الانتقال إلى الجيل التالي"
    };
    var MISSION_AR = {
      "Commercial Orbital Rideshare": "إطلاق تجاري مشترك إلى المدار",
      "National Security Space Launch": "إطلاق فضائي للأمن القومي",
      "Scientific Orbital Missions": "مهام علمية مدارية",
      "Orbital Space Missions": "مهام فضائية مدارية",
      "Remote Sensing & Observation": "الاستشعار عن بُعد ورصد الأرض",
      "Satellite Communications": "اتصالات الأقمار الصناعية",
      "Rocket Engine R&D Flight Testing": "البحث والتطوير واختبار محركات الصواريخ",
      "Government & Commercial Satellite Launch": "إطلاق أقمار حكومية وتجارية",
      "Earth Observation": "رصد الأرض",
      "Technology Demonstration": "إظهار التقنيات",
      "Smallsat Dedicated Launch": "إطلاق مخصص للأقمار الصغيرة",
      "Microsatellite Delivery": "إيصال الأقمار المصغّرة",
      "Heavy LEO Cargo": "شحنات ثقيلة إلى المدار الأرضي المنخفض",
      "Chinese Constellation Deployment": "نشر الكوكبات الصينية",
      "Scientific & Government Satellite Launch": "إطلاق أقمار علمية وحكومية",
      "Booster Supply": "توريد المعزّزات",
      "Suborbital Flight": "رحلة شبه مدارية",
      "Smallsat Launch (future)": "إطلاق أقمار صغيرة (مستقبلاً)",
      "Reusable Medium-lift Launch": "إطلاق متوسط الحمولة قابل لإعادة الاستخدام",
      "Constellation Deployment": "نشر كوكبة أقمار صناعية",
      "Smallsat Launch": "إطلاق أقمار صغيرة",
      "Satellite Manufacturing": "تصنيع الأقمار الصناعية",
      "Reusable Flight Research": "أبحاث الرحلات القابلة لإعادة الاستخدام",
      "Suborbital Flight (future goal)": "رحلة شبه مدارية (هدف مستقبلي)",
      "Hybrid Engine Development": "تطوير محركات هجينة",
      "Orbital Launch (future)": "إطلاق مداري (مستقبلاً)",
      "Sounding Rockets": "صواريخ سبرية"
    };
    var ORBIT_AR = {
      "LEO (500-750 km)": "LEO (مدار أرضي منخفض، 500–750 km)",
      "Sun-Synchronous Orbit (SSO)": "المدار المتزامن مع الشمس (SSO)",
      "Geostationary Transfer Orbit (GTO)": "مدار النقل إلى المدار الثابت بالنسبة إلى الأرض (GTO)",
      "GEO": "GEO",
      "LEO": "LEO",
      "SSO": "SSO",
      "Suborbital": "شبه مداري",
      "LEO (in development)": "LEO (قيد التطوير)",
      "Suborbital (2029 goal)": "شبه مداري (هدف 2029)",
      "اعماق فضا": "الفضاء السحيق",
      "زیرمداری زیستی": "رحلات شبه مدارية لأغراض بيولوجية"
    };
    var COUNTRY_AR = {
      "Australia": "أستراليا", "Canada": "كندا", "China": "الصين", "France": "فرنسا",
      "Europe": "أوروبا", "Germany": "ألمانيا", "India": "الهند", "Iran": "إيران",
      "Israel": "إسرائيل", "Italy": "إيطاليا", "Japan": "اليابان", "Russia": "روسيا",
      "South Africa": "جنوب أفريقيا", "South Korea": "كوريا الجنوبية", "Spain": "إسبانيا",
      "Türkiye": "تركيا", "Turkey": "تركيا", "Ukraine": "أوكرانيا", "United Kingdom": "المملكة المتحدة",
      "United States": "الولايات المتحدة", "New Zealand": "نيوزيلندا"
    };
    var CITY_AR = {
      "Alameda, California": "ألاميدا، كاليفورنيا",
      "Ankara": "أنقرة",
      "Arlington, Virginia": "أرلينغتون، فرجينيا",
      "Augsburg": "أوغسبورغ",
      "Beijing": "بكين",
      "Beijing / Huzhou": "بكين / هوتشو",
      "Bengaluru": "بنغالورو",
      "Cedar Park, Texas": "سيدار بارك، تكساس",
      "Centennial, Colorado": "سنتينيال، كولورادو",
      "Changwon": "تشانغوون",
      "Chennai": "تشيناي",
      "Colleferro": "كوليفيرو",
      "Daejeon": "دايجون",
      "Dnipro": "دنيبرو",
      "Dulles, Virginia": "داليس، فرجينيا",
      "Edinburgh": "إدنبرة",
      "El Segundo, California": "إل سيغوندو، كاليفورنيا",
      "Elche": "إلتشي",
      "Forres, Scotland": "فوريس، اسكتلندا",
      "Gold Coast, Queensland": "غولد كوست، كوينزلاند",
      "Guangzhou": "غوانغتشو",
      "Hawthorne, California": "هوثورن، كاليفورنيا",
      "Hyderabad": "حيدر آباد",
      "Istanbul": "إسطنبول",
      "Kent, Washington": "كِنت، واشنطن",
      "Korolyov": "كوروليوف",
      "Littleton, Colorado": "ليتلتون، كولورادو",
      "Lod": "اللد",
      "Long Beach, California": "لونغ بيتش، كاليفورنيا",
      "Louisville, Colorado": "لويزفيل، كولورادو",
      "Markham": "ماركهام",
      "Moscow": "موسكو",
      "Nantong": "نانتونغ",
      "Neuenstadt am Kocher": "نوينشتات آم كوخر",
      "Ottobrunn": "أوتوبرون",
      "Paris": "باريس",
      "Reims": "ريمس",
      "Samara": "سامارا",
      "Sejong": "سيجونغ",
      "Shanghai": "شنغهاي",
      "Somerset West": "سومرست ويست",
      "Stellenbosch": "ستيلينبوش",
      "Taiki, Hokkaido": "تايكي، هوكايدو",
      "Tehran": "طهران",
      "Tokyo": "طوكيو",
      "Tomioka": "توميوكا",
      "Tucson": "توسان",
      "Tustin, California": "توستن، كاليفورنيا",
      "Vernon": "فيرنون",
      "Wuhan": "ووهان",
      "Yantai": "يانتاي",
      "Évry-Courcouronnes": "إيفري كوركورون"
    };
    var CUSTOMER_AR = {
      "Armed Forces & Defense Agencies": "القوات المسلحة ووكالات الدفاع",
      "Canadian Government": "الحكومة الكندية",
      "Canadian Research Institutions": "مؤسسات بحثية كندية",
      "Chinese constellation market": "سوق الكوكبات الصينية",
      "Commercial & Government Entities": "جهات تجارية وحكومية",
      "Commercial Constellation Operators": "مشغّلو كوكبات الأقمار التجارية",
      "Commercial Operators": "مشغّلون تجاريون",
      "Constellation Operators": "مشغّلو الكوكبات",
      "Indian launch market": "سوق الإطلاق الهندي",
      "Internal program": "برنامج داخلي",
      "Iranian Space Agency (ISA)": "وكالة الفضاء الإيرانية (ISA)",
      "JAXA": "JAXA",
      "Japanese Government": "الحكومة اليابانية",
      "KARI": "KARI",
      "Korean Government": "الحكومة الكورية",
      "NASA & Civil Space Agencies": "NASA ووكالات الفضاء المدنية",
      "Research Centers & Universities": "مراكز الأبحاث والجامعات",
      "Research Institutes": "معاهد بحثية",
      "Smallsat Operators": "مشغّلو الأقمار الصغيرة",
      "Turkish Lunar Program": "البرنامج القمري التركي",
      "Turkish Space Agency": "وكالة الفضاء التركية",
      "US Government customers": "عملاء الحكومة الأمريكية"
    };
    var PARTNER_AR = {
      "Aerospace Industrial Partners": "شركاء صناعيون في قطاع الطيران والفضاء",
      "Aerospace Self-Sufficiency Industries": "صناعات الاكتفاء الذاتي في مجال الطيران والفضاء",
      "Canadian space & defense agencies": "وكالات الفضاء والدفاع الكندية",
      "Domestic Component Suppliers": "مورّدو مكوّنات محليون",
      "Indian & global technology investors": "مستثمرون تقنيون هنود وعالميون",
      "JAXA": "JAXA",
      "Korea Aerospace Research Institute (KARI)": "المعهد الكوري لأبحاث الفضاء (KARI)",
      "Mitsubishi Heavy Industries": "صناعات ميتسوبيشي الثقيلة",
      "National Aerospace Universities": "جامعات وطنية متخصصة في الطيران والفضاء",
      "Oriental Spaceport (Haiyang)": "ميناء هايانغ الفضائي",
      "Roketsan": "روكتسان",
      "Sea-launch and coastal pad partners": "شركاء الإطلاق البحري ومنصات الإطلاق الساحلية",
      "Taiki Town / Hokkaido Spaceport": "بلدة تايكي / ميناء هوكايدو الفضائي",
      "Turkish Space Agency": "وكالة الفضاء التركية",
      "US commercial engine suppliers": "مورّدو محركات تجاريون أمريكيون"
    };
    var TIMELINE_TITLE_AR = {
      "Atlantic Spaceport": "ميناء فضائي أطلسي",
      "Commercial Launch Entity": "جهة إطلاق تجاري",
      "Daytona Development": "تطوير صاروخ دايتونا",
      "Demo Flight": "رحلة تجريبية",
      "Early Tests": "الاختبارات الأولية",
      "First Experimental": "أول تجربة إطلاق",
      "First Orbit": "أول وصول إلى المدار",
      "First Rocket": "أول صاروخ",
      "First": "أول إطلاق",
      "First Epsilon": "أول إطلاق لصاروخ إبسيلون",
      "First Industry-led Launch": "أول إطلاق بقيادة القطاع الصناعي",
      "First Insertion Successful": "أول إدخال مداري ناجح",
      "First Landing Jan Rocket": "أول هبوط لصاروخ جان",
      "First Launch Goal": "هدف أول إطلاق",
      "Flight Plans": "خطط الطيران",
      "Founded": "تأسيس الشركة",
      "Founded Company": "تأسيس الشركة",
      "Funding": "التمويل",
      "Hanwha Aerospace": "هانوا إيروسبيس",
      "Honda Founded": "تأسيس هوندا",
      "Launch of First Military Satellite": "إطلاق أول قمر صناعي عسكري",
      "Lunar Program": "البرنامج القمري",
      "Nuri Commercialization": "تسويق صاروخ نوري",
      "Operations Rehearsal": "بروفة العمليات",
      "Orbital Goal": "هدف الوصول إلى المدار",
      "Orbital Spaceflight Launch": "إطلاق إلى المدار",
      "Origins": "الانطلاقة",
      "Record High Altitude Orbital Insertion (750 km)": "رقم قياسي للإدخال المداري على ارتفاع 750 km",
      "Satellite": "إطلاق قمر صناعي",
      "Sea Soft Landing": "هبوط بحري سلس",
      "Sixth Flight Failure": "فشل الرحلة السادسة",
      "Sounding Launches": "إطلاقات صواريخ السبر",
      "Space Program Revealed": "الكشف عن برنامج فضائي",
      "Steel Tanks": "خزانات فولاذية",
      "Suborbital Goal": "هدف رحلة شبه مدارية",
      "Successful Hop": "قفزة اختبارية ناجحة",
      "Successful Test of Rafe Solid Motor": "اختبار ناجح لمحرك رافع الصلب",
      "Test Campus": "مجمّع الاختبارات",
      "Toward Orbit": "التقدم نحو المدار",
      "World Record": "رقم قياسي عالمي"
    };
    var TIMELINE_DESC_AR = {
      "125-second hop ended with China's first soft sea landing.": "انتهت قفزة اختبارية استمرت 125 ثانية بأول هبوط بحري سلس في الصين.",
      "A suborbital flight is the program's next milestone.": "الرحلة شبه المدارية هي المرحلة التالية في البرنامج.",
      "Daytona launcher advanced using commercial off-the-shelf parts.": "تقدّم تطوير صاروخ دايتونا باستخدام مكوّنات تجارية جاهزة.",
      "Daytona's maiden flight is planned.": "خُطّط لتنفيذ الرحلة الأولى لصاروخ دايتونا.",
      "Demonstrator reached 271 m at Taiki and landed within 37 cm.": "بلغ النموذج التجريبي ارتفاع 271 m في تايكي وهبط ضمن مسافة 37 cm من الهدف.",
      "Elon Musk": "إيلون ماسك",
      "Epsilon's sixth flight failed; next-generation work accelerated.": "فشلت الرحلة السادسة لصاروخ إبسيلون، فتسارع العمل على الجيل التالي.",
      "Established at Teknopark Istanbul.": "تأسست الشركة في تكنوبارك إسطنبول.",
      "Established in Beijing.": "تأسست الشركة في بكين.",
      "Established in Bengaluru.": "تأسست الشركة في بنغالورو.",
      "Experimental Satellite.": "إطلاق تجريبي لقمر صناعي.",
      "First orbital attempt planned from a sea platform near Jeju.": "خُطّط لأول محاولة إطلاق مداري من منصة بحرية قرب جيجو.",
      "First stainless-steel propellant tanks manufactured.": "صُنعت أول خزانات وقود من الفولاذ المقاوم للصدأ.",
      "First technology demonstration flight planned.": "التخطيط لأول رحلة لإثبات التقنية.",
      "Fourth Nuri flight successfully conducted under Hanwha leadership.": "نجاح الرحلة الرابعة لصاروخ نوري بقيادة هانوا.",
      "Full wet dress rehearsal of the Blue Whale 0.4 vehicle.": "إجراء بروفة تشغيل كاملة مع التزويد بالوقود لمركبة Blue Whale 0.4.",
      "Honda announced reusable-rocket research.": "أعلنت هوندا أبحاثًا لتطوير صواريخ قابلة لإعادة الاستخدام.",
      "Hybrid engine development for Türkiye's Moon mission continued.": "استمر تطوير المحرك الهجين لمهمة تركيا إلى القمر.",
      "Hybrid sounding-rocket tests began from the Black Sea coast.": "بدأت اختبارات صاروخ السبر الهجين من ساحل البحر الأسود.",
      "Insertion 3 Satellite (2 1) Orbit 450 m.": "اختبار إدخال حمولة إلى المدار.",
      "Investment round closed to build engines.": "أُغلقت جولة تمويل لبناء المحركات.",
      "Jim Cantrell, an early SpaceX co-founder, founded the company in Tucson.": "أسّس جيم كانتريل الشركة في توسان؛ وكان من أوائل المشاركين في تأسيس SpaceX.",
      "Landing Stage Rocket 9.": "اختبار هبوط مرحلة صاروخية.",
      "Large manufacturing & test campus opening in Andhra Pradesh.": "افتتاح مجمّع كبير للتصنيع والاختبار في أندرا براديش.",
      "Maiden flight of the Epsilon launcher succeeded.": "نجاح الرحلة الأولى لصاروخ إبسيلون.",
      "Maiden orbital launch and recovery targeted by year-end.": "استهداف تنفيذ أول إطلاق مداري واستعادة الصاروخ قبل نهاية العام.",
      "Newfoundland launch complex advanced; first Taiga attempt scrubbed during countdown.": "تقدّم العمل في مجمّع الإطلاق بنيوفاوندلاند؛ وأُلغيت محاولة تايغا الأولى أثناء العدّ التنازلي.",
      "Nissan's aerospace division joined IHI Group, forming the company.": "انضم قسم الطيران والفضاء في نيسان إلى مجموعة IHI لتأسيس الشركة.",
      "Orbital Spaceflight Launch": "إطلاق إلى المدار.",
      "Rahul Goel founded the company in Ontario.": "أسّس راهول غويل الشركة في أونتاريو.",
      "Reorganized under the current name within Hanwha Group.": "أعيد تنظيم الشركة باسمها الحالي ضمن مجموعة هانوا.",
      "SS-520 became the smallest orbital launcher in history.": "أصبح SS-520 أصغر صاروخ مداري في التاريخ.",
      "Satellite Satellite 1B.": "إطلاق القمر الصناعي 1B.",
      "Selected to take over Korea's national Nuri launch vehicle.": "اختيرت الشركة لتولّي تطوير صاروخ نوري الوطني الكوري.",
      "Small demonstrator flown to prove key technologies.": "أُطلق نموذج تجريبي صغير لإثبات التقنيات الأساسية.",
      "Soichiro Honda established the parent company.": "أسّس سويتشيرو هوندا الشركة الأم.",
      "Spun out of KAIST in Daejeon.": "انبثقت الشركة عن معهد KAIST في دايجون.",
      "Started as an aircraft-engine maker in Korea.": "بدأت الشركة بصناعة محركات الطائرات في كوريا.",
      "Successful Rocket 5.": "نجاح اختبار الصاروخ.",
      "Successful insertion of Noor-1 satellite into 425 km orbit using Qased SLV.": "نجاح وضع القمر الصناعي نور-1 في مدار على ارتفاع 425 km باستخدام صاروخ قاصد.",
      "Successful insertion of Soraya satellite into 750 km LEO orbit.": "نجاح وضع القمر الصناعي ثريا في مدار أرضي منخفض على ارتفاع 750 km.",
      "Successful suborbital flight test of Qaem-100 rocket with composite Rafe motor.": "نجاح اختبار رحلة شبه مدارية لصاروخ قائم-100 بمحرك رافع المركّب.",
      "Taiga test flight and Terra Nova satellite on the schedule.": "جدولة الرحلة الاختبارية لصاروخ تايغا والقمر الصناعي تيرا نوفا.",
      "Work on an orbital micro launcher is underway.": "يجري العمل على تطوير صاروخ مداري صغير.",
      "Rocket 5.": "نجاح اختبار الصاروخ.",
      ".": "تفاصيل الحدث غير متاحة بالعربية حاليًا."
    };
    var REUSABILITY_AR = {
      "Expendable": "غير قابل لإعادة الاستخدام",
      "Reusable (vertical landing)": "قابل لإعادة الاستخدام (هبوط عمودي)",
      "Reusable (sea recovery)": "قابل لإعادة الاستخدام (استعادة بحرية)",
      "Partial reusability planned": "إعادة استخدام جزئية مخططة",
      "Full reusability (design goal)": "قابل لإعادة الاستخدام بالكامل (هدف تصميمي)"
    };
    var PROPELLANT_AR = {
      "LOX / Kerosene": "أكسجين سائل / كيروسين",
      "LOX / RP-1": "أكسجين سائل / RP-1",
      "LOX / Methane": "أكسجين سائل / ميثان",
      "LOX / Methane (stainless-steel body)": "أكسجين سائل / ميثان (هيكل من الفولاذ المقاوم للصدأ)",
      "Solid": "وقود صلب",
      "Liquid propellant": "وقود سائل",
      "Hybrid": "وقود هجين",
      "Hybrid (solid fuel + liquid oxidizer)": "وقود هجين (وقود صلب ومؤكسد سائل)",
      "Hybrid / Liquid Propellant (Liquid Stage 1 + Solid Salman Stage 2)": "وقود سائل في المرحلة 1 ووقود صلب في المرحلة 2",
      "Composite Solid Propellant (Rafe Stage 1)": "وقود صلب مركّب (المرحلة الأولى Rafe)"
    };
    var ENGINE_AR = {
      "2 Engine BE-4 + 2 Engine RL10C": "2 محرك BE-4 + 2 محرك RL10C",
      "27 Merlin 1D Engines": "27 محركًا Merlin 1D",
      "3 solid stages + optional PBS": "3 مراحل صلبة + وحدة PBS اختيارية",
      "33 Raptor 2 Engines (Booster) + 6 Raptor (Starship)": "33 محركًا Raptor 2 (المعزّز) + 6 محركات Raptor (Starship)",
      "4 Engine Stage + Engine": "4 محركات للمرحلة + محرك",
      "4x KRE-075 (first stage)": "4 × KRE-075 (المرحلة الأولى)",
      "9 Merlin 1D Engines (Stage 1) + 1 Merlin Vacuum (Stage 2)": "9 محركات Merlin 1D (المرحلة 1) + محرك Merlin Vacuum واحد (المرحلة 2)",
      "Chinese commercial methalox engines": "محركات ميثالوكس تجارية صينية",
      "Engine RD-180 + RL10": "محرك RD-180 + RL10",
      "First stage derived from H3 SRB-3": "المرحلة الأولى مشتقة من المعزّز H3 SRB-3",
      "In-house Honda engine": "محرك هوندا مطوّر داخليًا",
      "In-house engine": "محرك مطوّر داخليًا",
      "In-house engine in development": "محرك مطوّر داخليًا قيد التطوير",
      "In-house hybrid engines": "محركات هجينة مطوّرة داخليًا",
      "Liquid Rocket Motor with Steering Chambers": "محرك صاروخي سائل بغرف توجيه",
      "Rafe Solid Motor with Movable Carbon Composite Nozzle": "محرك رافع الصلب بفوهة متحركة من مركّبات الكربون",
      "Salman Solid Motor with Thrust Vector Control (TVC)": "محرك سلمان الصلب مع التحكم في اتجاه الدفع (TVC)",
      "Scaled hybrid engine": "محرك هجين مُصغّر",
      "Stallion 1.2 MN booster + Pegasus 80 kN upper": "معزّز Stallion بقوة 1.2 MN + المرحلة العليا Pegasus بقوة 80 kN",
      "Ursa Major Hadley engines": "محركات Hadley من Ursa Major"
    };
    var PAYLOAD_AR = {
      "24,800 kg expendable / 8,000 kg fully reusable": "24,800 kg (غير قابل لإعادة الاستخدام) / 8,000 kg (قابل لإعادة الاستخدام بالكامل)",
      "Suborbital: 50 kg above Karman line": "شبه مداري: 50 kg فوق خط كارمان",
      "Not applicable": "غير قابل للتطبيق"
    };
    var LAST_FLIGHT_AR = {
      "2020s (multiple test flights)": "عشرينيات القرن 21 (رحلات اختبارية متعددة)",
      "2025 (hop test)": "2025 (اختبار قفزة)",
      "Oct 2023 (Noor-3 Launch)": "أكتوبر 2023 (إطلاق Noor-3)",
      "Sept 2024 (Chamran-1 Launch)": "سبتمبر 2024 (إطلاق Chamran-1)"
    };

    function safeEnglish(value, fallback) {
      var v = String(value == null ? "" : value).trim();
      if (!v) return fallback === undefined ? "غير متاح" : fallback;
      var clean = v.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, " ")
        .replace(/[\u200C\u200D\uFEFF]/g, "").replace(/[،؛؟]/g, " ")
        .replace(/\(\s*\)/g, " ").replace(/\s*([/|·–—-])\s*$/g, "").replace(/\s+/g, " ").trim();
      return /[A-Za-z0-9]/.test(clean) ? clean : (fallback === undefined ? "غير متاح" : fallback);
    }
    function latinDigits(value) {
      return String(value == null ? "" : value)
        .replace(/[۰-۹]/g, function (c) { return "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(c)]; })
        .replace(/[٠-٩]/g, function (c) { return "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(c)]; })
        .replace(/٪/g, "%");
    }
    function arabicText(value) {
      var text = String(value == null ? "" : value).trim();
      if (!text || !/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text) || /[پچژگکی]/.test(text)) return "";
      return text;
    }
    function normalizeSource(value) {
      return String(value == null ? "" : value).replace(/[\u200C\u200D\uFEFF]/g, " ").replace(/\s+/g, " ")
        .replace(/\s+([.,;:!?])/g, "$1").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").trim();
    }
    function arabicCountry(value) {
      return String(value || "").split(/\s*\/\s*/).map(function (part) {
        var raw = part.trim(), mapped = arabicText(raw) || COUNTRY_AR[raw];
        if (!mapped && typeof countryNameAr === "function") mapped = arabicText(countryNameAr(raw, null));
        return mapped || "غير محددة";
      }).join(" / ");
    }
    function arabicCity(value) {
      return arabicText(value) || CITY_AR[safeEnglish(value, "")] || "غير محدد";
    }
    function arabicStatus(value) {
      var text = arabicText(value);
      if (text) return text;
      var raw = normalizeSource(value);
      return STATUS_AR[raw] || "غير محدد";
    }
    function missionLabel(value) {
      return arabicText(value) || MISSION_AR[normalizeSource(value)] || "غير محدد";
    }
    function orbitLabel(value) {
      return arabicText(value) || ORBIT_AR[normalizeSource(value)] || "غير محدد";
    }
    function namedTag(value, dictionary) {
      return arabicText(value) || dictionary[normalizeSource(value)] || "غير محدد";
    }
    function uniqueValues(values) {
      var seen = Object.create(null);
      return (Array.isArray(values) ? values : []).filter(function (value) {
        var text = String(value == null ? "" : value).trim(), key = text.toLowerCase();
        if (!text || seen[key]) return false;
        seen[key] = true;
        return true;
      });
    }
    function personValue(value) {
      var text = arabicText(value);
      if (text) return text;
      var v = safeEnglish(value, "");
      if (!v || /^(commercial launch entity|unknown|n\/?a|jan|—)$/i.test(v)) return "غير متاح";
      return latinDigits(v);
    }
    function techValue(value, kind) {
      var text = arabicText(value);
      if (text) return text;
      var v = normalizeSource(value);
      if (!v || /^(—|n\/?a|commercial launch entity)$/i.test(v)) return "";
      if (kind === "propellant") return PROPELLANT_AR[v] || "غير محدد";
      if (kind === "reusability") return REUSABILITY_AR[v] || "غير محدد";
      if (kind === "engine") {
        if (ENGINE_AR[v]) return ENGINE_AR[v];
        if (/^engine\b/i.test(v)) return "محرك غير محدد";
        return "غير محدد";
      }
      if (kind === "payload") return PAYLOAD_AR[v] || latinDigits(v);
      if (kind === "applicability" && /^not applicable$/i.test(v)) return "غير قابل للتطبيق";
      return latinDigits(v);
    }
    function timelineTitle(value) {
      var text = arabicText(value);
      if (text) return text;
      return TIMELINE_TITLE_AR[normalizeSource(value)] || "محطة تاريخية";
    }
    function timelineDescription(value) {
      var text = arabicText(value);
      if (text) return text;
      return TIMELINE_DESC_AR[normalizeSource(value)] || "تفاصيل الحدث غير متاحة بالعربية حاليًا.";
    }
    function lastFlight(value) {
      var text = arabicText(value);
      if (text) return latinDigits(text);
      var raw = normalizeSource(value);
      if (!raw || raw === "—") return "—";
      return LAST_FLIGHT_AR[raw] || latinDigits(raw);
    }
    function siteByAlias(siteId) {
      var aliases = {
        "ksc39a": "ksc39a", "ksc39b": "ksc39b", "ccafsslc40": "ccsfs", "ccafsslc41": "ccsfs",
        "vandenbergslc4e": "vandenberg", "vandenbergslc3w": "vandenberg", "starbase": "starbase",
        "mahia": "mahia", "ma hia lc1": "mahia", "wallopsmars": "wallops", "marswallops": "wallops"
      };
      var raw = String(siteId || ""), key = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
      var target = aliases[key] || key;
      var all = (typeof DATA !== "undefined" && DATA.sites) ? DATA.sites : [];
      return all.find(function (site) {
        var id = String(site.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return id === target || id === key || (site.en && site.en.toLowerCase().replace(/[^a-z0-9]/g, "").indexOf(key) > -1);
      }) || null;
    }

    var defaultLogoSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%2338bdf8' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%2338bdf8' text-anchor='middle'>🚀</text></svg>";
    var logoSrc = o.logo_data || o.logo || defaultLogoSvg;
    var orgTypeStr = ORG_AR[o.org_type_en] || arabicText(o.org_type_ar) || "شركة إطلاق فضائي";
    var stClass = "badge-private";
    if ((o.org_type_fa || "").indexOf("دولتی") > -1 || (o.org_type_fa || "").indexOf("حاکمیتی") > -1 || (o.org_type_en || "").indexOf("State") > -1 || (o.org_type_en || "").indexOf("Government") > -1) stClass = "badge-gov";
    var officialName = safeEnglish(o.en || o.fa, "");
    var profileDesc = arabicText(o.ar_d) || arabicText(desc(o)) || "لا يتوفر وصف عربي موثّق لهذه الجهة حاليًا.";

    // Header: same element order and layout as the Persian launch-company template.
    h += '<div class="d-head" style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-inline-end: 35px;">';
    h += '<div style="display:flex; gap:10px; align-items:center; flex:1;">';
    h += '<div style="width:48px; height:48px; border-radius:8px; background:#000; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; padding:2px;">';
    h += '<img src="' + esc(logoSrc) + '" alt="' + esc(name(o)) + '" onerror="this.onerror=null; this.src=defaultLogoSvg;" style="max-width:100%; max-height:100%; object-fit:contain;" />';
    h += '</div>';
    h += '<div><div class="d-kicker">' + esc(o.en || o.fa || "") + '</div>';
    h += '<h2 class="d-title" style="margin:0;">' + esc(name(o)) + '</h2></div></div>';
    h += '<span class="' + stClass + '" style="padding:3px 10px; border-radius:12px; font-size:10.5px; font-weight:bold; white-space:nowrap;">' + esc(orgTypeStr) + '</span>';
    h += '</div>';
    h += '<div class="d-sub" style="margin-top:4px;">' + esc(officialName) + '</div>';
    h += '<div class="d-desc" style="margin-top:6px; line-height:1.6;">' + esc(profileDesc) + '</div>';

    // The Arabic labels differ, while tabs and their order match the Persian template.
    h += '<div class="site-tabs" style="margin-top:10px;">';
    h += '<button class="site-tab-btn active" onclick="switchCompTab(\'overview\', this)">نظرة عامة وإحصاءات</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'vehicles\', this)">أسطول مركبات الإطلاق</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'timeline\', this)">التاريخ والشبكة</button>';
    h += '</div>';

    // TAB 1: OVERVIEW & STATS
    h += '<div id="compTabOverview" class="site-tab-content active" style="display:block;">';
    h += '<div class="grid2">';
    h += cell("سنة التأسيس", o.founded == null ? "—" : latinDigits(o.founded));
    h += cell("سنة أول إطلاق", o.first_launch_year == null ? "—" : latinDigits(o.first_launch_year));
    h += cell("المؤسس", personValue(o.founder_ar || o.founder_en || o.founder_fa));
    h += cell("الرئيس التنفيذي", personValue(o.ceo_ar || o.ceo_en || o.ceo_fa));
    h += cell("المقر الرئيسي", arabicCity(o.city_ar || o.city));
    h += cell(t("country"), arabicCountry(o.country_ar || o.country));
    h += '</div>';

    var stats = o.stats || { total_launches: 0, success_launches: 0, failed_launches: 0, success_rate: "100%", active_vehicles_count: 1 };
    var fleet = o.rockets_fleet || [];
    var activeVehicles = stats.active_vehicles_count == null ? fleet.length : stats.active_vehicles_count;
    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
    h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:8px;">📊 إحصاءات الأداء الرئيسية</div>';
    h += '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; text-align:center;">';
    h += '<div style="background:rgba(0,0,0,0.3); padding:6px; border-radius:6px; border:1px solid var(--line);">';
    h += '<div style="font-size:15px; font-weight:bold; color:var(--text);">' + esc(latinDigits(stats.total_launches == null ? 0 : stats.total_launches)) + '</div>';
    h += '<div style="font-size:9.5px; color:var(--muted);">الإجمالي</div>';
    h += '</div>';
    h += '<div style="background:rgba(16, 185, 129, 0.1); padding:6px; border-radius:6px; border:1px solid rgba(16, 185, 129, 0.3);">';
    h += '<div style="font-size:15px; font-weight:bold; color:#10b981;">' + esc(latinDigits(stats.success_launches == null ? 0 : stats.success_launches)) + '</div>';
    h += '<div style="font-size:9.5px; color:#10b981;">ناجحة</div>';
    h += '</div>';
    h += '<div style="background:rgba(239, 68, 68, 0.1); padding:6px; border-radius:6px; border:1px solid rgba(239, 68, 68, 0.3);">';
    h += '<div style="font-size:15px; font-weight:bold; color:#ef4444;">' + esc(latinDigits(stats.failed_launches == null ? 0 : stats.failed_launches)) + '</div>';
    h += '<div style="font-size:9.5px; color:#ef4444;">غير ناجحة</div>';
    h += '</div>';
    var srText = stats.success_rate ? latinDigits(stats.success_rate) : "95%";
    h += '<div style="background:rgba(245, 158, 11, 0.1); padding:6px; border-radius:6px; border:1px solid rgba(245, 158, 11, 0.3);">';
    h += '<div style="font-size:15px; font-weight:bold; color:var(--amber);">' + esc(srText) + '</div>';
    h += '<div style="font-size:9.5px; color:var(--amber);">معدل النجاح</div>';
    h += '</div>';
    h += '</div></div>';

    // Annual Launch Trend Chart (same chart structure as the Persian template).
    var trend = stats.annual_trend || [];
    if (trend.length) {
      var maxCount = 1;
      trend.forEach(function (item) { if (Number(item.count) > maxCount) maxCount = Number(item.count); });
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--amber); margin-bottom:8px;">📈 اتجاه الإطلاق السنوي</div>';
      h += '<div style="display:flex; align-items:flex-end; gap:8px; height:80px; padding-top:10px; border-bottom:1px solid var(--line); border-left:1px solid var(--line); padding-left:6px;">';
      trend.forEach(function (tItem) {
        var pct = Math.max(12, Math.round((Number(tItem.count) / maxCount) * 100));
        h += '<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; height:100%; justify-content:flex-end;">';
        h += '<small style="font-size:9px; color:#38bdf8; font-weight:bold;">' + esc(latinDigits(tItem.count)) + '</small>';
        h += '<div style="width:100%; max-width:20px; height:' + pct + '%; background:linear-gradient(180deg, #38bdf8, #0284c7); border-radius:3px 3px 0 0;" title="' + esc(latinDigits(tItem.year) + ': ' + latinDigits(tItem.count) + ' إطلاقات') + '"></div>';
        h += '<span style="font-size:9px; color:var(--muted); font-family:monospace;">' + esc(latinDigits(tItem.year)) + '</span>';
        h += '</div>';
      });
      h += '</div></div>';
    }

    // Mission Types & Orbital Capabilities
    var mTypes = uniqueValues(o.mission_types_ar || o.mission_types_en || ["Commercial Launch", "Scientific Missions", "Defense Space"]);
    var oCaps = uniqueValues(o.orbital_capabilities_ar || o.orbital_capabilities_en || ["LEO", "SSO", "GTO"]);
    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px; display:flex; flex-direction:column; gap:6px;">';
    h += '<div style="font-size:11px; font-weight:bold; color:var(--accent);">🎯 أنواع المهام والقدرات المدارية</div>';
    h += '<div style="display:flex; flex-wrap:wrap; gap:4px;">';
    mTypes.forEach(function (mission) {
      h += '<span style="background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.3); color:#38bdf8; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:bold;">' + esc(missionLabel(mission)) + '</span>';
    });
    oCaps.forEach(function (orbit) {
      h += '<span style="background:rgba(245, 158, 11, 0.12); border:1px solid rgba(245, 158, 11, 0.3); color:var(--amber); padding:2px 8px; border-radius:10px; font-size:10px; font-weight:bold;"><code>' + esc(orbitLabel(orbit)) + '</code></span>';
    });
    h += '</div></div>';

    // Associated Launch Sites
    var siteIds = o.site_ids || [];
    if (siteIds.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11px; font-weight:bold; color:#10b981; margin-bottom:6px;">📍 مواقع الإطلاق المستخدمة (اضغط للانتقال على الخريطة)</div>';
      h += '<div style="display:flex; flex-direction:column; gap:4px;">';
      siteIds.forEach(function (sid) {
        var matchedSite = siteByAlias(sid);
        var siteName = matchedSite ? (name(matchedSite) || safeEnglish(matchedSite.en, "موقع إطلاق غير محدد")) : safeEnglish(sid, "موقع إطلاق غير محدد");
        var targetId = matchedSite ? matchedSite.id : sid;
        h += '<button type="button" onclick="flyToLaunchSite(\'' + esc(targetId) + '\')" class="btn btn-sm country-btn-site" style="display:flex; justify-content:space-between; align-items:center; width:100%; text-align:right; font-size:10.5px; padding:6px 10px; cursor:pointer;">';
        h += '<span>🚀 ' + esc(siteName) + '</span>';
        h += '<span style="color:#10b981; font-weight:bold;">عرض الموقع على الخريطة ↗</span>';
        h += '</button>';
      });
      h += '</div></div>';
    }

    // Official Links Box
    var compLinks = extractEntityLinks(o);
    var webUrl = compLinks.webUrl;
    var displayWeb = compLinks.displayWeb || "الموقع الرسمي";
    var linkedinUrl = compLinks.linkedinUrl;
    var displayLinkedin = compLinks.displayLinkedin || "لينكدإن";
    if (/^LinkedIn$/i.test(displayLinkedin)) displayLinkedin = "لينكدإن";
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
    h += '<div id="compTabVehicles" class="site-tab-content" style="display:none;">';
    h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:6px;">🚀 المواصفات الفنية والتشغيلية لأسطول مركبات الإطلاق (المركبات النشطة: ' + esc(latinDigits(activeVehicles)) + '):</div>';
    fleet.forEach(function (v) {
      var rName = safeEnglish(v.name, "مركبة إطلاق غير مسماة");
      var stText = arabicStatus(v.status_ar || v.status_en || v.status_fa);
      var stBadge = "badge-private";
      var statusSource = String(v.status_fa || v.status_en || "Operational");
      if (statusSource.indexOf("عملیاتی") > -1 || statusSource.indexOf("Operational") > -1) stBadge = "badge-gov";

      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
      h += '<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line); padding-bottom:6px; margin-bottom:8px;">';
      h += '<div><span style="font-size:13px; font-weight:bold; color:var(--text);">🚀 <bdi>' + esc(rName) + '</bdi></span> <small style="color:var(--muted); font-size:10px;">(' + esc(latinDigits(v.maiden_flight || "—")) + ')</small></div>';
      h += '<span class="' + stBadge + '" style="padding:2px 8px; border-radius:10px; font-size:10px;"><bdi>' + esc(stText) + '</bdi></span>';
      h += '</div>';

      var rReu = techValue(v.reusability_ar || v.reusability_en || v.reusability_fa, "reusability") || "غير قابل لإعادة الاستخدام";
      var rProp = techValue(v.propellant_ar || v.propellant_en || v.propellant_fa, "propellant") || "—";
      var rEng = techValue(v.engine_type_ar || v.engine_type_en || v.engine_type_fa, "engine") || "—";
      var rThr = techValue(v.thrust_ar || v.thrust_en || v.thrust_fa) || "—";
      var rLeo = techValue(v.payload_leo_ar || v.payload_leo_en || v.payload_leo_fa, "payload") || "—";
      var rSso = techValue(v.payload_sso_ar || v.payload_sso_en || v.payload_sso_fa, "payload") || "—";
      var rGto = techValue(v.payload_gto_ar || v.payload_gto_en || v.payload_gto_fa, "applicability") || "—";
      var dimText = "الارتفاع: " + esc(techValue(v.height_ar || v.height_en || v.height_fa) || "—") + " | القطر: " + esc(techValue(v.diameter_ar || v.diameter_en || v.diameter_fa) || "—") + " | الكتلة: " + esc(techValue(v.mass_ar || v.mass_en || v.mass_fa) || "—");

      // Rocket Tech Specs Grid (same two-column card as the Persian template).
      h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:10.5px;">';
      h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>عدد المراحل:</b> ' + esc(latinDigits(v.stages || 2)) + '</div>';
      h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>قابلية إعادة الاستخدام:</b> <bdi>' + esc(rReu) + '</bdi></div>';
      h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px; grid-column:span 2;"><b>الدافع / الوقود:</b> <bdi>' + esc(rProp) + '</bdi></div>';
      var engSuppliers = (window.findEngineSuppliers) ? window.findEngineSuppliers(o.id, String(v.engine_type_fa || "") + " " + String(v.engine_type_en || "")) : [];
      h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px; grid-column:span 2;"><b>نوع المحرك:</b> <bdi>' + esc(rEng) + '</bdi>';
      if (engSuppliers.length) {
        h += '<span style="display:inline-flex; gap:4px; flex-wrap:wrap; margin-right:6px; vertical-align:middle;">';
        engSuppliers.forEach(function (sc) {
          var scName = arabicText(sc.ar) || safeEnglish(sc.en || sc.fa, "");
          h += '<a href="#" onclick="openDetailById(\'' + esc(sc.id) + '\', \'propulsion\'); return false;" title="فتح ملف الشركة المصنّعة للمحرك" style="color:var(--amber); font-size:9.5px; font-weight:bold; text-decoration:none; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.35); padding:1px 7px; border-radius:10px; cursor:pointer; white-space:nowrap;">⚙️ <bdi>' + esc(scName) + '</bdi> ↗</a>';
        });
        h += '</span>';
      }
      h += '</div>';
      h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>قوة الدفع:</b> <bdi>' + esc(rThr) + '</bdi></div>';
      h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>الحمولة إلى LEO:</b> <bdi>' + esc(rLeo) + '</bdi></div>';
      h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>الحمولة إلى SSO:</b> <bdi>' + esc(rSso) + '</bdi></div>';
      h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px;"><b>الحمولة إلى GTO:</b> <bdi>' + esc(rGto) + '</bdi></div>';
      h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px; grid-column:span 2;"><b>الأبعاد والكتلة:</b> <bdi>' + dimText + '</bdi></div>';
      h += '</div>';

      // Rocket Flights Record
      var flightsLabel = 'الإطلاقات: <b>' + esc(latinDigits(v.total_launches || 0)) + '</b> (ناجحة: <b style="color:#10b981;">' + esc(latinDigits(v.success_launches || 0)) + '</b> | غير ناجحة: <b style="color:#ef4444;">' + esc(latinDigits(v.failed_launches || 0)) + '</b>)';
      var lastFlightLabel = 'آخر إطلاق: <b>' + esc(lastFlight(v.last_launch_ar || v.last_launch_en || "—")) + '</b>';
      h += '<div style="margin-top:6px; background:rgba(56, 189, 248, 0.08); border:1px solid rgba(56, 189, 248, 0.2); padding:6px; border-radius:4px; font-size:10px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px;">';
      h += '<span>' + flightsLabel + '</span>';
      h += '<span>' + lastFlightLabel + '</span>';
      h += '</div>';
      h += '</div>'; // end rocket card
    });
    h += '</div>'; // end TAB 2

    // TAB 3: TIMELINE & NETWORK
    var timeline = o.timeline_ar || o.timeline_en || [];
    var customers = o.customers_ar || o.customers_en || [];
    var partners = o.partners_ar || o.partners_en || [];
    h += '<div id="compTabTimeline" class="site-tab-content" style="display:none;">';
    if (timeline.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--amber); margin-bottom:8px;">⏳ الخط الزمني للأحداث التاريخية الرئيسية</div>';
      h += '<div style="display:flex; flex-direction:column; gap:8px;">';
      timeline.forEach(function (item) {
        var title = timelineTitle(item.title_ar || item.title_en || item.title || item.title_fa);
        var detail = timelineDescription(item.desc_ar || item.desc_en || item.desc || item.desc_fa);
        h += '<div style="background:rgba(0,0,0,0.25); border-right:3px solid #f59e0b; padding:6px 10px; border-radius:4px; font-size:10.5px;">';
        h += '<div style="font-weight:bold; color:var(--text);"><span style="color:var(--amber); font-family:monospace;">' + esc(latinDigits(item.year)) + ':</span> ' + esc(title) + '</div>';
        h += '<div style="color:var(--muted); margin-top:2px; line-height:1.4;">' + esc(detail) + '</div>';
        h += '</div>';
      });
      h += '</div></div>';
    }

    // Customers & Partners Network
    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px;">';
    h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:6px;">🤝 شبكة العملاء والشركاء الصناعيين</div>';
    if (customers.length) {
      h += '<div style="font-size:10.5px; margin-bottom:4px;"><b>العملاء الرئيسيون:</b></div>';
      h += '<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">';
      customers.forEach(function (customer) {
        h += '<span style="background:rgba(255,255,255,0.05); border:1px solid var(--line); padding:2px 8px; border-radius:4px; font-size:10px;">' + esc(namedTag(customer, CUSTOMER_AR)) + '</span>';
      });
      h += '</div>';
    }
    if (partners.length) {
      h += '<div style="font-size:10.5px; margin-bottom:4px;"><b>الشركاء الصناعيون ومورّدو المحركات:</b></div>';
      h += '<div style="display:flex; flex-wrap:wrap; gap:4px;">';
      partners.forEach(function (partner) {
        h += '<span style="background:rgba(16, 185, 129, 0.12); border:1px solid rgba(16, 185, 129, 0.3); color:#10b981; padding:2px 8px; border-radius:4px; font-size:10px;">' + esc(namedTag(partner, PARTNER_AR)) + '</span>';
      });
      h += '</div>';
    }
    h += '</div>';
    h += '</div>'; // end TAB 3
    return h;
  }
  function renderCompanyDetail(p) {
    var o = p.o || p, h = "";
    if (LANG === "ar" && (p.cat === "agency" || p.kind === "agency" || o.cat === "agency")) return renderAgencyCompanyArabic(p);
    if (LANG === "ar" && (p.cat === "propulsion" || p.kind === "propulsion" || o.cat === "propulsion")) return renderPropulsionDetail(p);
    if (LANG === "ar" && (p.cat === "launch" || p.kind === "launch" || o.cat === "launch")) return renderLaunchCompanyArabic(p);
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
        h += '<b style="font-size:12px; color:var(--text);">' + esc(flagshipEngine) + '</b></div>';
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
          h += '<div style="font-size:12px; font-weight:bold; color:#f2c649; line-height:1.45; word-break:break-word; flex:1; min-width:180px;">⚙️ <bdi>' + esc(engName) + '</bdi></div>';
          h += '<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">';
          h += '<span style="color:#38bdf8; font-size:9.5px; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.3); padding:2px 7px; border-radius:12px; font-weight:bold;"><bdi>' + esc(engProp) + '</bdi></span>';
          h += '<span style="color:#10b981; font-weight:bold; font-size:9.5px; background:rgba(16, 185, 129, 0.12); border:1px solid rgba(16, 185, 129, 0.3); padding:2px 7px; border-radius:12px;"><bdi>' + esc(engSt) + '</bdi></span>';
          h += '<span style="color:#8ba3c4; font-size:10px; opacity:0.8;">▼</span>';
          h += '</div>';
          h += '</summary>';
          
          h += '<div style="padding:10px 12px; border-top:1px solid var(--line); background:rgba(0,0,0,0.2); font-size:10.5px; line-height:1.6; color:#e7f0fb;">';
          if (eng.thrust_fa || eng.thrust_en) {
            h += '<div><b>' + (isFa ? "رانش (Thrust):" : "Thrust:") + '</b> ' + esc(isFa ? (eng.thrust_fa || eng.thrust_en) : (eng.thrust_en || eng.thrust_fa)) + '</div>';
          }
          if (eng.isp_fa || eng.isp_en) {
            h += '<div><b>' + (isFa ? "تکانه ویژه (Isp):" : "Specific Impulse:") + '</b> ' + esc(isFa ? (eng.isp_fa || eng.isp_en) : (eng.isp_en || eng.isp_fa)) + '</div>';
          }
          if (eng.engineering_desc_fa || eng.engineering_desc_en) {
            h += '<div style="margin-top:4px; color:#8ba3c4;">' + esc(isFa ? (eng.engineering_desc_fa || eng.engineering_desc_en) : (eng.engineering_desc_en || eng.engineering_desc_fa)) + '</div>';
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
      h += '<div style="font-size:15px; font-weight:bold; color:var(--text);">' + esc(stats.total_launches) + '</div>';
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
      h += '<div style="font-size:15px; font-weight:bold; color:var(--amber);">' + esc(srText) + '</div>';
      h += '<div style="font-size:9.5px; color:var(--amber);">' + (isFa ? "نرخ موفقیت" : "Success Rate") + '</div>';
      h += '</div>';

      h += '</div></div>';

      // Annual Launch Trend Chart (HTML/CSS Bar Graph)
      var trend = stats.annual_trend || [];
      if (trend.length) {
        var maxCount = 1;
        trend.forEach(function(item) { if (item.count > maxCount) maxCount = item.count; });
        
        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
        h += '<div style="font-size:11.5px; font-weight:bold; color:var(--amber); margin-bottom:8px;">📈 ' + (isFa ? "نمودار سالانه تعداد پرتاب‌ها" : "Annual Launch Trend") + '</div>';
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
        h += '<span style="background:rgba(245, 158, 11, 0.12); border:1px solid rgba(245, 158, 11, 0.3); color:var(--amber); padding:2px 8px; border-radius:10px; font-size:10px; font-weight:bold;"><code>' + esc(ob) + '</code></span>';
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
        h += '<div><span style="font-size:13px; font-weight:bold; color:var(--text);">🚀 <bdi>' + esc(rName) + '</bdi></span> <small style="color:var(--muted); font-size:10px;">(' + esc(v.maiden_flight || "—") + ')</small></div>';
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
        var engSuppliers = (window.findEngineSuppliers) ? window.findEngineSuppliers(o.id, String(v.engine_type_fa || "") + " " + String(v.engine_type_en || "")) : [];
        h += '<div style="background:rgba(0,0,0,0.25); padding:5px 8px; border-radius:4px; grid-column:span 2;"><b>' + (isFa ? "نوع موتور:" : "Engine:") + '</b> <bdi>' + esc(rEng) + '</bdi>';
        if (engSuppliers.length) {
          h += '<span style="display:inline-flex; gap:4px; flex-wrap:wrap; margin-' + (isFa ? 'right' : 'left') + ':6px; vertical-align:middle;">';
          engSuppliers.forEach(function(sc) {
            var scName = isFa ? (sc.fa || sc.en) : (sc.en || sc.fa);
            h += '<a href="#" onclick="openDetailById(\'' + esc(sc.id) + '\', \'propulsion\'); return false;" title="' + (isFa ? 'باز کردن پروندهٔ سازندهٔ موتور' : 'Open engine maker dossier') + '" style="color:var(--amber); font-size:9.5px; font-weight:bold; text-decoration:none; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.35); padding:1px 7px; border-radius:10px; cursor:pointer; white-space:nowrap;">⚙️ <bdi>' + esc(scName) + '</bdi> ↗</a>';
          });
          h += '</span>';
        }
        h += '</div>';
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
        h += '<div style="font-size:11.5px; font-weight:bold; color:var(--amber); margin-bottom:8px;">⏳ ' + (isFa ? "خط زمانی رویدادهای کلیدی و تاریخی" : "Historical Timeline") + '</div>';
        h += '<div style="display:flex; flex-direction:column; gap:8px;">';
        
        timeline.forEach(function(item) {
          var tTitle = isFa ? (item.title || item.title_fa) : (item.title_en || item.title);
          var tDesc = isFa ? (item.desc || item.desc_fa) : (item.desc_en || item.desc);

          h += '<div style="background:rgba(0,0,0,0.25); border-right:3px solid #f59e0b; padding:6px 10px; border-radius:4px; font-size:10.5px;">';
          h += '<div style="font-weight:bold; color:var(--text);"><span style="color:var(--amber); font-family:monospace;">' + esc(item.year) + ':</span> ' + esc(tTitle) + '</div>';
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
    } else if (kind === "recovery") {
      var rs = (DATA.recoveries || []).find(function(x) { return x.id === id; });
      if (rs) openDetail({ kind: "recovery", cat: "recovery", o: rs });
    } else {
      var c = (DATA.companies || []).find(function(x) { return x.id === id; });
      if (c) openDetail({ kind: c.cat || "company", cat: c.cat || "launch", o: c });
    }
  };

  // ===== STEP3: Engine <-> Launch company cross-links (via used_by_ids) =====
  function compById(id) {
    if (typeof DATA === "undefined") return null;
    return (DATA.companies || []).find(function(x) { return x.id === id; }) || null;
  }
  window.compById = compById;

  function normEngTxt(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "");
  }

  // برای یک شرکت پرتاب و متن موتور یک موشک، شرکت‌های پیشرانشی سازنده را پیدا می‌کند.
  // فقط وقتی وصل می‌کند که نام واقعی موتور در متن «نوع موتور» همان موشک آمده باشد.
  window.findEngineSuppliers = function(launchId, vehicleEngineText) {
    var res = [];
    if (!launchId || typeof DATA === "undefined") return res;
    var txt = normEngTxt(vehicleEngineText);
    if (!txt) return res;
    (DATA.companies || []).forEach(function(c) {
      if (c.cat !== "propulsion" || c.id === launchId) return;
      var engs = c.engine_products_bilingual || [];
      var hit = false;
      engs.forEach(function(e) {
        if (hit) return;
        var u = e.used_by_ids || [];
        if (u.indexOf(launchId) < 0) return;
        var keys = [];
        var GENERIC = ["engine","engines","motor","motors","upper","stage","stages","solid","liquid","rocket","rockets","thruster","thrusters","booster","boosters","family","vacuum","cluster","stand","stands","test","complex","with","flexible","nozzle","payload","fairing","tanks","structures","hypergolic","cryogenic","cold","gas","five","segment","vernier","main","small","large","hybrid","ariane","آریان","موتور","موشک","مرحله","مرحلهٔ","جامد","مایع","بوستر","رانشگر","خوشه","خوشهٔ","نازل","متحرک","سکوی","آزمون","دماغه","دماغهٔ","مخزن","محموله","انعطاف"];
        [e.name_en, e.name_fa].forEach(function(n) {
          var raw = String(n || "");
          // کل نام (بدون فاصله) + تک‌واژه‌های خاص
          raw.split(/[\/&,،()]|\sو\s/).forEach(function(p) {
            var k = normEngTxt(p);
            if (k.length >= 3) keys.push(k);
          });
          raw.split(/[\s\/&,،().]+/).forEach(function(w) {
            var k = normEngTxt(w);
            if (k.length >= 3 && GENERIC.indexOf(k) < 0 && GENERIC.indexOf(w.toLowerCase()) < 0) keys.push(k);
          });
        });
        for (var i = 0; i < keys.length; i++) {
          if (txt.indexOf(keys[i]) > -1) { hit = true; break; }
        }
      });
      if (hit) res.push(c);
    });
    return res;
  };

  function isEntityInCountry(entity, targetEn, targetFa) {
    if (!entity) return false;
    var eCountryEn = (entity.country || "").trim().toLowerCase();
    var eCountryFa = (entity.country_fa || "").trim().toLowerCase();

    var tEn = (targetEn || "").trim().toLowerCase();
    var tFa = (targetFa || "").trim().toLowerCase();

    if (!tEn && !tFa) return false;

    var synMap = {
      "united states of america": ["united states", "usa", "us", "united states (coastal waters)", "ایالات متحده", "امریکایی", "آمریکا", "ایالات متحده آمریکا", "ایالات متحده (آب‌های ساحلی)"],
      "united states": ["united states of america", "usa", "us", "united states (coastal waters)", "ایالات متحده", "امریکایی", "آمریکا", "ایالات متحده آمریکا", "ایالات متحده (آب‌های ساحلی)"],
      "usa": ["united states of america", "united states", "us", "united states (coastal waters)", "ایالات متحده", "آمریکا", "ایالات متحده (آب‌های ساحلی)"],
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

  // ===================== Country dossier flags (2026-10-23f, full world pack) =====================
  // Data & map country strings -> SVG flag code(s): "cc" = single / "cc+cc" = dual / "globe" = neutral.
  // Self-hosted SVGs live at assets/img/flags/{code}.svg (185 files, see LICENSE-flags.txt).
  var FLAG_TABLE = {
    "Afghanistan":"af", "Albania":"al", "Algeria":"dz", "Angola":"ao", "Antarctica":"aq",
    "Argentina":"ar", "Armenia":"am", "Australia":"au", "Austria":"at", "Azerbaijan":"az",
    "Bangladesh":"bd", "Belarus":"by", "Belgium":"be", "Belize":"bz", "Benin":"bj",
    "Bhutan":"bt", "Bolivia":"bo", "Bosnia and Herzegovina":"ba", "Botswana":"bw", "Brazil":"br",
    "Brunei":"bn", "Bulgaria":"bg", "Burkina Faso":"bf", "Burundi":"bi", "Cambodia":"kh",
    "Cameroon":"cm", "Canada":"ca", "Central African Republic":"cf", "Chad":"td", "Chile":"cl",
    "China":"cn", "Colombia":"co", "Costa Rica":"cr", "Croatia":"hr", "Cuba":"cu",
    "Cyprus":"cy", "Czech Republic":"cz", "Democratic Republic of the Congo":"cd", "Denmark":"dk", "Djibouti":"dj",
    "Dominican Republic":"do", "East Timor":"tl", "Ecuador":"ec", "Egypt":"eg", "Egypt / African Union":"eg+african-union",
    "El Salvador":"sv", "Equatorial Guinea":"gq", "Eritrea":"er", "Estonia":"ee", "Eswatini":"sz",
    "Ethiopia":"et", "Falkland Islands":"fk", "Fiji":"fj", "Finland":"fi", "France":"fr",
    "France / Europe":"fr+eu", "France / Germany":"fr+de", "French Guiana":"gf", "French Southern and Antarctic Lands":"tf", "Gabon":"ga",
    "Georgia":"ge", "Germany":"de", "Germany / United States":"de+us", "Ghana":"gh", "Great Britain":"gb",
    "Greece":"gr", "Greenland":"gl", "Guatemala":"gt", "Guinea":"gn", "Guinea-Bissau":"gw",
    "Guyana":"gy", "Haiti":"ht", "Honduras":"hn", "Hungary":"hu", "Iceland":"is",
    "India":"in", "Indonesia":"id", "International / Pacific Ocean":"globe", "International waters":"globe", "Iran":"ir",
    "Iraq":"iq", "Ireland":"ie", "Israel":"il", "Italy":"it", "Ivory Coast":"ci",
    "Jamaica":"jm", "Japan":"jp", "Jordan":"jo", "Kazakhstan":"kz", "Kazakhstan (leased by Russia)":"kz",
    "Kenya":"ke", "Kosovo":"globe", "Kuwait":"kw", "Kyrgyzstan":"kg", "Laos":"la",
    "Latvia":"lv", "Lebanon":"lb", "Lesotho":"ls", "Liberia":"lr", "Libya":"ly",
    "Lithuania":"lt", "Luxembourg":"lu", "Madagascar":"mg", "Malawi":"mw", "Malaysia":"my",
    "Mali":"ml", "Marshall Islands":"mh", "Mauritania":"mr", "Mexico":"mx", "Moldova":"md",
    "Mongolia":"mn", "Montenegro":"me", "Morocco":"ma", "Mozambique":"mz", "Myanmar":"mm",
    "Namibia":"na", "Nepal":"np", "Netherlands":"nl", "New Caledonia":"nc", "New Zealand":"nz",
    "New Zealand / Netherlands":"nz+nl", "Nicaragua":"ni", "Niger":"ne", "Nigeria":"ng", "North Korea":"kp",
    "North Macedonia":"mk", "Northern Cyprus":"globe", "Norway":"no", "Oman":"om", "Pakistan":"pk",
    "Palestine":"ps", "Panama":"pa", "Papua New Guinea":"pg", "Paraguay":"py", "People's Republic of China":"cn",
    "Peru":"pe", "Philippines":"ph", "Poland":"pl", "Portugal":"pt", "Puerto Rico":"pr",
    "Qatar":"qa", "Republic of China":"tw", "Republic of the Congo":"cg", "Romania":"ro", "Russia":"ru",
    "Russian Federation":"ru", "Rwanda":"rw", "Saudi Arabia":"sa", "Senegal":"sn", "Serbia":"rs",
    "Sierra Leone":"sl", "Slovakia":"sk", "Slovenia":"si", "Solomon Islands":"sb", "Somalia":"so",
    "Somaliland":"globe", "South Africa":"za", "South Korea":"kr", "South Sudan":"ss", "Spain":"es",
    "Sri Lanka":"lk", "Sudan":"sd", "Suriname":"sr", "Sweden":"se", "Sweden / Netherlands":"se+nl",
    "Switzerland":"ch", "Syria":"sy", "Taiwan":"tw", "Tajikistan":"tj", "Tanzania":"tz",
    "Thailand":"th", "The Bahamas":"bs", "The Gambia":"gm", "Togo":"tg", "Trinidad and Tobago":"tt",
    "Tunisia":"tn", "Turkey":"tr", "Turkish Republic of Northern Cyprus":"globe", "Turkmenistan":"tm", "T\u00fcrkiye":"tr",
    "UAE":"ae", "UK":"gb", "USA":"us", "Uganda":"ug", "Ukraine":"ua",
    "United Arab Emirates":"ae", "United Kingdom":"gb", "United States":"us", "United States (coastal waters)":"us", "United States / New Zealand":"us+nz",
    "United States of America":"us", "Uruguay":"uy", "Uzbekistan":"uz", "Vanuatu":"vu", "Venezuela":"ve",
    "Vietnam":"vn", "Western Sahara":"eh", "Yemen":"ye", "Zambia":"zm", "Zimbabwe":"zw"
  };
  var FLAG_TABLE_LC = (function () {
    var m = {};
    for (var k in FLAG_TABLE) if (Object.prototype.hasOwnProperty.call(FLAG_TABLE, k)) m[k.toLowerCase()] = FLAG_TABLE[k];
    return m;
  })();
  // Whitelist of codes whose SVG exists in assets/img/flags/ (prevents any 404 for -99 / missing).
  var FLAG_CODES = {"ae":1,"af":1,"african-union":1,"al":1,"am":1,"ao":1,"aq":1,"ar":1,"at":1,"au":1,"az":1,"ba":1,"bd":1,"be":1,"bf":1,"bg":1,"bh":1,"bi":1,"bj":1,"bn":1,"bo":1,"br":1,"bs":1,"bt":1,"bw":1,"by":1,"bz":1,"ca":1,"cd":1,"cf":1,"cg":1,"ch":1,"ci":1,"cl":1,"cm":1,"cn":1,"co":1,"cr":1,"cu":1,"cy":1,"cz":1,"de":1,"dj":1,"dk":1,"do":1,"dz":1,"ec":1,"ee":1,"eg":1,"eh":1,"er":1,"es":1,"et":1,"eu":1,"fi":1,"fj":1,"fk":1,"fr":1,"ga":1,"gb":1,"ge":1,"gf":1,"gh":1,"gl":1,"globe":1,"gm":1,"gn":1,"gq":1,"gr":1,"gt":1,"gw":1,"gy":1,"hk":1,"hn":1,"hr":1,"ht":1,"hu":1,"id":1,"ie":1,"il":1,"in":1,"iq":1,"ir":1,"is":1,"it":1,"jm":1,"jo":1,"jp":1,"ke":1,"kg":1,"kh":1,"kp":1,"kr":1,"kw":1,"kz":1,"la":1,"lb":1,"lk":1,"lr":1,"ls":1,"lt":1,"lu":1,"lv":1,"ly":1,"ma":1,"mc":1,"md":1,"me":1,"mg":1,"mh":1,"mk":1,"ml":1,"mm":1,"mn":1,"mr":1,"mt":1,"mw":1,"mx":1,"my":1,"mz":1,"na":1,"nc":1,"ne":1,"ng":1,"ni":1,"nl":1,"no":1,"np":1,"nz":1,"om":1,"pa":1,"pe":1,"pg":1,"ph":1,"pk":1,"pl":1,"pr":1,"ps":1,"pt":1,"py":1,"qa":1,"ro":1,"rs":1,"ru":1,"rw":1,"sa":1,"sb":1,"sd":1,"se":1,"sg":1,"si":1,"sk":1,"sl":1,"sn":1,"so":1,"sr":1,"ss":1,"sv":1,"sy":1,"sz":1,"td":1,"tf":1,"tg":1,"th":1,"tj":1,"tl":1,"tm":1,"tn":1,"tr":1,"tt":1,"tw":1,"tz":1,"ua":1,"ug":1,"un":1,"us":1,"uy":1,"uz":1,"ve":1,"vn":1,"vu":1,"ye":1,"za":1,"zm":1,"zw":1};
  // Chain: 1) valid ISO-2 -> 2) exact / case-insensitive name table -> 3) neutral globe.svg fallback
  function flagCodesFor(cEn, iso) {
    if (iso) {
      var c = String(iso).trim().toLowerCase();
      if (c !== "globe" && FLAG_CODES[c]) return [c];
    }
    var key = typeof cEn === "string" ? cEn.trim() : "";
    var v = FLAG_TABLE[key] || FLAG_TABLE_LC[key.toLowerCase()];
    if (!v) {
      if (key && typeof console !== "undefined" && console.debug) console.debug("[flag] no mapping for country:", key);
      return ["globe"];
    }
    return v === "globe" ? ["globe"] : v.split("+");
  }

  function renderCountryProfile(p) {
    var isFa = (typeof LANG !== "undefined" && LANG === "fa");
    var isAr = (typeof LANG !== "undefined" && LANG === "ar");
    var tr = function (fa, en, ar) { return isFa ? fa : (isAr ? ar : en); };
    function activeEntitiesAr(n) {
      var mod100 = n % 100;
      if (n === 1) return "كيان فضائي نشط";
      if (n === 2) return "كيانان فضائيان نشطان";
      if (n === 0 || (mod100 >= 3 && mod100 <= 10)) return "كيانات فضائية نشطة";
      if (mod100 >= 11 && mod100 <= 99) return "كيانًا فضائيًا نشطًا";
      return "كيان فضائي نشط";
    }
    
    // Determine Country Name
    var cEn = p.country_en || (p.o ? p.o.country_en || p.o.country : null) || p.country || "Iran";
    var cFa = p.country_fa || (p.o ? p.o.country_fa : null) || countryOf(cEn) || cEn;
    var cIso = p.country_iso || (p.o ? p.o.country_iso : null) || null;
    var cAr = p.country_ar || (p.o ? p.o.country_ar : null) || countryNameAr(cEn, cIso) || cEn;

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

    // بخش «فرود و بازیابی» — پس از تأیید نمونه، برای همهٔ کشورها فعال است
    var showRecovery = true;
    var recoveryItems = [];
    if (typeof DATA !== "undefined" && Array.isArray(DATA.recoveries)) {
      recoveryItems = DATA.recoveries.filter(function(s) {
        return isEntityInCountry(s, cEn, cFa);
      });
      recoveryItems.sort(function(a, b) {
        return (a.fa || a.en || "").localeCompare(b.fa || b.en || "");
      });
    }

    var totalEntities = propulsionItems.length + launchItems.length + agencyItems.length + siteItems.length + recoveryItems.length;

    var h = "";

    // Header Title — country flag (ISO-first, name-table fallback); custom palette globe.svg fallback
    var _flagCodes = flagCodesFor(cEn, cIso);
    var _flagTitle = isFa ? cFa : (isAr ? cAr : cEn);
    var _flagAlt = tr("پرچم " + cFa, "Flag of " + cEn, "علم " + cAr);
    var _flagEl;
    if (_flagCodes.length === 1 && _flagCodes[0] !== "globe") {
      _flagEl = '<img class="d-flag" src="assets/img/flags/' + _flagCodes[0] + '.svg" alt="' + esc(_flagAlt) + '" title="' + esc(_flagTitle) + '" decoding="async">';
    } else if (_flagCodes.length === 2) {
      _flagEl = '<span class="d-flagset" role="img" aria-label="' + esc(_flagAlt) + '" title="' + esc(_flagTitle) + '">'
        + '<img class="d-flag d-flag--a" src="assets/img/flags/' + _flagCodes[0] + '.svg" alt="" decoding="async">'
        + '<img class="d-flag d-flag--b" src="assets/img/flags/' + _flagCodes[1] + '.svg" alt="" decoding="async">'
        + '</span>';
    } else {
      _flagEl = '<img class="d-flag d-flag--globe" src="assets/img/flags/globe.svg" alt="' + esc(_flagTitle) + '" title="' + esc(_flagTitle) + '" decoding="async">';
    }
    h += '<div class="d-head" style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-inline-end:35px;">';
    h += '<div style="display:flex; gap:10px; align-items:center; flex:1;">';
    h += _flagEl;
    h += '<div><div class="d-kicker">' + tr("شناسنامه جامع فضایی کشور", "National Space Dossier", "ملف الدولة الفضائي") + '</div>';
    h += '<h2 class="d-title" style="margin:0;">' + esc(isFa ? cFa : (isAr ? cAr : cEn)) + '</h2></div></div>';
    h += '<span class="badge-gov" style="padding:3px 10px; border-radius:12px; font-size:10.5px; font-weight:bold; white-space:nowrap;">' + (isFa ? (totalEntities + " مرکز فعال") : (isAr ? (totalEntities + " " + activeEntitiesAr(totalEntities)) : (totalEntities + " Active Entities"))) + '</span>';
    h += '</div>';

    h += '<div class="d-sub" style="margin-top:4px;">' + esc(isFa ? cEn : (isAr ? cEn : cFa)) + '</div>';

    // SECTION 1: SHARE & OVERVIEW 4-GRID BANNER (سهم و آمار فضایی کشور)
    h += '<div style="background:linear-gradient(135deg, rgba(15, 31, 51, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%); border:1px solid rgba(56, 189, 248, 0.35); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 16px rgba(0,0,0,0.4);">';
    h += '<div style="font-size:11.5px; font-weight:bold; color:#f2c649; margin-bottom:8px; display:flex; align-items:center; gap:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px;">📊 ' + tr("سهم و آمار توزیع زیرساخت‌های فضایی کشور:", "Space Infrastructure Share Distribution:", "توزيع البنية التحتية الفضائية في الدولة:") + '</div>';
    
    h += '<div style="display:grid; grid-template-columns:' + (showRecovery ? 'repeat(auto-fit, minmax(90px, 1fr))' : 'repeat(4, 1fr)') + '; gap:6px; text-align:center;">';
    
    // 1. Propulsion
    h += '<div style="background:rgba(245, 158, 11, 0.1); padding:8px 4px; border-radius:6px; border:1px solid rgba(245, 158, 11, 0.3);">';
    h += '<div style="font-size:16px; font-weight:bold; color:#f59e0b;">' + esc(propulsionItems.length) + '</div>';
    h += '<div style="font-size:9px; color:#f59e0b; margin-top:2px;">' + tr("پیشرانش", "Propulsion", "أنظمة الدفع") + '</div>';
    h += '</div>';

    // 2. Launch
    h += '<div style="background:rgba(16, 185, 129, 0.1); padding:8px 4px; border-radius:6px; border:1px solid rgba(16, 185, 129, 0.3);">';
    h += '<div style="font-size:16px; font-weight:bold; color:#10b981;">' + esc(launchItems.length) + '</div>';
    h += '<div style="font-size:9px; color:#10b981; margin-top:2px;">' + tr("پرتاب‌گرها", "Launch", "الإطلاق") + '</div>';
    h += '</div>';

    // 3. Agencies
    h += '<div style="background:rgba(56, 189, 248, 0.1); padding:8px 4px; border-radius:6px; border:1px solid rgba(56, 189, 248, 0.3);">';
    h += '<div style="font-size:16px; font-weight:bold; color:#38bdf8;">' + esc(agencyItems.length) + '</div>';
    h += '<div style="font-size:9px; color:#38bdf8; margin-top:2px;">' + tr("سازمان‌ها", "Agencies", "وكالات الفضاء") + '</div>';
    h += '</div>';

    // 4. Sites
    h += '<div style="background:rgba(239, 68, 68, 0.1); padding:8px 4px; border-radius:6px; border:1px solid rgba(239, 68, 68, 0.3);">';
    h += '<div style="font-size:16px; font-weight:bold; color:#ef4444;">' + esc(siteItems.length) + '</div>';
    h += '<div style="font-size:9px; color:#ef4444; margin-top:2px;">' + tr("پایگاه‌ها", "Spaceports", "مواقع الإطلاق") + '</div>';
    h += '</div>';

    // 5. Landing & Recovery (کشورهای نمونه)
    if (showRecovery) {
      h += '<div style="background:rgba(45, 212, 191, 0.1); padding:8px 4px; border-radius:6px; border:1px solid rgba(45, 212, 191, 0.3);">';
      h += '<div style="font-size:16px; font-weight:bold; color:#2dd4bf;">' + esc(recoveryItems.length) + '</div>';
      h += '<div style="font-size:9px; color:#2dd4bf; margin-top:2px;">' + tr("فرود و بازیابی", "Recovery", "الهبوط والاستعادة") + '</div>';
      h += '</div>';
    }

    h += '</div></div>';

    // SECTION 2: 4 DEDICATED TABS
    h += '<div class="site-tabs" style="margin-top:10px;">';
    h += '<button class="site-tab-btn active" onclick="switchCompTab(\'cPropulsion\', this)">' + tr("شرکت‌های پیشران", "Propulsion", "شركات أنظمة الدفع") + ' (' + propulsionItems.length + ')</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'cLaunch\', this)">' + tr("شرکت‌های پرتاب", "Launch", "شركات الإطلاق") + ' (' + launchItems.length + ')</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'cAgency\', this)">' + tr("سازمان‌های فضایی", "Agencies", "وكالات الفضاء") + ' (' + agencyItems.length + ')</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'cSite\', this)">' + tr("پایگاه‌های پرتاب", "Sites", "مواقع الإطلاق") + ' (' + siteItems.length + ')</button>';
    if (showRecovery) {
      h += '<button class="site-tab-btn" onclick="switchCompTab(\'cRecovery\', this)">' + tr("فرود و بازیابی", "Recovery", "الهبوط والاستعادة") + ' (' + recoveryItems.length + ')</button>';
    }
    h += '</div>';

    // TAB 1: PROPULSION CONTRACTORS
    h += '<div id="compTabCPropulsion" class="site-tab-content active" style="display:block;">';
    if (propulsionItems.length) {
      h += '<div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">';
      propulsionItems.forEach(function(item) {
        var nameStr = isFa ? (item.fa || item.en) : (isAr ? (item.ar || item.en || item.fa) : (item.en || item.fa));
        var cityStr = isFa ? (item.city_fa || item.city || "—") : (isAr ? (item.city_ar || item.city || item.city_fa || "—") : (item.city || item.city_fa || "—"));
        var catStr = isFa ? (item.propulsion_category_fa || item.propulsion_category_en || "پیشرانه فضایی") : (isAr ? (item.propulsion_category_ar || "أنظمة الدفع الفضائي") : (item.propulsion_category_en || "Propulsion"));
        var defaultLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%23f59e0b' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%23f59e0b' text-anchor='middle'>⚙️</text></svg>";
        var logoSrc = item.logo_data || item.logo || defaultLogo;

        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:flex; justify-content:space-between; align-items:center;">';
        h += '<div style="display:flex; align-items:center; gap:8px;">';
        h += '<img src="' + esc(logoSrc) + '" alt="" onerror="this.src=defaultLogo;" style="width:28px; height:28px; object-fit:contain; border-radius:4px; background:#000; padding:1px; border:1px solid var(--line);" />';
        h += '<div><b style="font-size:11.5px; color:var(--text);"><bdi>' + esc(nameStr) + '</bdi></b>';
        h += '<div style="font-size:9.5px; color:var(--muted);">📍 ' + esc(cityStr) + '</div></div>';
        h += '</div>';
        h += '<span style="font-size:9.5px; color:var(--amber); background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.3); padding:2px 6px; border-radius:10px;"><bdi>' + esc(catStr) + '</bdi></span>';
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
            h += '<a href="' + esc(links.webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.35); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">🌐 ' + esc(links.displayWeb || (isAr ? "موقع إلكتروني" : "Website")) + ' ↗</a>';
          }
          if (links.linkedinUrl) {
            h += '<a href="' + esc(links.linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(14, 118, 168, 0.18); border:1px solid rgba(14, 118, 168, 0.45); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">💼 ' + esc(links.displayLinkedin || "LinkedIn") + ' ↗</a>';
          }
          h += '</div>';
        }

        h += '<div style="display:flex; gap:6px; margin-top:4px;">';
        if (item.lat && item.lon) {
          h += '<button type="button" onclick="flyToCoords(' + item.lat + ',' + item.lon + ', 8)" class="btn btn-sm country-btn-fly" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer;">📍 ' + tr("مشاهده روی نقشه", "Fly on Map", "عرض الموقع على الخريطة") + '</button>';
        }
        h += '<button type="button" onclick="openDetailById(\'' + esc(item.id) + '\', \'propulsion\')" class="btn btn-sm country-btn-detail" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.4); color:#38bdf8;">📖 ' + tr("باز شدن جزئیات", "Open Details", "فتح التفاصيل") + '</button>';
        h += '</div>';

        h += '</div>'; // end entity card
      });
      h += '</div>';
    } else {
      h += '<div style="padding:16px; text-align:center; color:var(--muted); font-size:11px;">' + tr("هیچ مرکز پیشرانش ثبت‌شده‌ای برای این کشور یافت نشد.", "No registered propulsion contractors for this country.", "لا توجد جهات مسجلة لأنظمة الدفع في هذه الدولة.") + '</div>';
    }
    h += '</div>'; // end TAB 1

    // TAB 2: LAUNCH OPERATORS
    h += '<div id="compTabCLaunch" class="site-tab-content" style="display:none;">';
    if (launchItems.length) {
      h += '<div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">';
      launchItems.forEach(function(item) {
        var nameStr = isFa ? (item.fa || item.en) : (isAr ? (item.ar || item.en || item.fa) : (item.en || item.fa));
        var cityStr = isFa ? (item.city_fa || item.city || "—") : (isAr ? (item.city_ar || item.city || item.city_fa || "—") : (item.city || item.city_fa || "—"));
        var orgStr = isFa ? (item.org_type_fa || "شرکت پرتاب تجاری") : (isAr ? (item.org_type_ar || "الجهة المنفذة للإطلاق") : (item.org_type_en || "Launch Provider"));
        var defaultLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%2310b981' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%2310b981' text-anchor='middle'>🚀</text></svg>";
        var logoSrc = item.logo_data || item.logo || defaultLogo;

        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:flex; justify-content:space-between; align-items:center;">';
        h += '<div style="display:flex; align-items:center; gap:8px;">';
        h += '<img src="' + esc(logoSrc) + '" alt="" onerror="this.src=defaultLogo;" style="width:28px; height:28px; object-fit:contain; border-radius:4px; background:#000; padding:1px; border:1px solid var(--line);" />';
        h += '<div><b style="font-size:11.5px; color:var(--text);"><bdi>' + esc(nameStr) + '</bdi></b>';
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
            h += '<a href="' + esc(links.webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.35); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">🌐 ' + esc(links.displayWeb || (isAr ? "موقع إلكتروني" : "Website")) + ' ↗</a>';
          }
          if (links.linkedinUrl) {
            h += '<a href="' + esc(links.linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(14, 118, 168, 0.18); border:1px solid rgba(14, 118, 168, 0.45); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">💼 ' + esc(links.displayLinkedin || "LinkedIn") + ' ↗</a>';
          }
          h += '</div>';
        }

        h += '<div style="display:flex; gap:6px; margin-top:4px;">';
        if (item.lat && item.lon) {
          h += '<button type="button" onclick="flyToCoords(' + item.lat + ',' + item.lon + ', 8)" class="btn btn-sm country-btn-fly" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer;">📍 ' + tr("مشاهده روی نقشه", "Fly on Map", "عرض الموقع على الخريطة") + '</button>';
        }
        h += '<button type="button" onclick="openDetailById(\'' + esc(item.id) + '\', \'launch\')" class="btn btn-sm country-btn-detail" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.4); color:#38bdf8;">📖 ' + tr("باز شدن جزئیات", "Open Details", "فتح التفاصيل") + '</button>';
        h += '</div>';

        h += '</div>'; // end entity card
      });
      h += '</div>';
    } else {
      h += '<div style="padding:16px; text-align:center; color:var(--muted); font-size:11px;">' + tr("هیچ اپراتور پرتابی برای این کشور یافت نشد.", "No launch operators for this country.", "لا توجد جهات منفذة للإطلاق مسجلة في هذه الدولة.") + '</div>';
    }
    h += '</div>'; // end TAB 2

    // TAB 3: SPACE AGENCIES
    h += '<div id="compTabCAgency" class="site-tab-content" style="display:none;">';
    if (agencyItems.length) {
      h += '<div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">';
      agencyItems.forEach(function(item) {
        var nameStr = isFa ? (item.fa || item.en) : (isAr ? (item.ar || item.en || item.fa) : (item.en || item.fa));
        var cityStr = isFa ? (item.city_fa || item.city || "—") : (isAr ? (item.city_ar || item.city || item.city_fa || "—") : (item.city || item.city_fa || "—"));
        var orgStr = isFa ? (item.org_type_fa || "سازمان فضایی دولتی") : (isAr ? (item.org_type_ar || "وكالة فضاء") : (item.org_type_en || "Space Agency"));
        var defaultLogo = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%2338bdf8' stroke-width='3'/><text x='50' y='60' font-family='sans-serif' font-size='32' fill='%2338bdf8' text-anchor='middle'>🏛️</text></svg>";
        var logoSrc = item.logo_data || item.logo || defaultLogo;

        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:flex; justify-content:space-between; align-items:center;">';
        h += '<div style="display:flex; align-items:center; gap:8px;">';
        h += '<img src="' + esc(logoSrc) + '" alt="" onerror="this.src=defaultLogo;" style="width:28px; height:28px; object-fit:contain; border-radius:4px; background:#000; padding:1px; border:1px solid var(--line);" />';
        h += '<div><b style="font-size:11.5px; color:var(--text);"><bdi>' + esc(nameStr) + '</bdi></b>';
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
            h += '<a href="' + esc(links.webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.35); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">🌐 ' + esc(links.displayWeb || (isAr ? "موقع إلكتروني" : "Website")) + ' ↗</a>';
          }
          if (links.linkedinUrl) {
            h += '<a href="' + esc(links.linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(14, 118, 168, 0.18); border:1px solid rgba(14, 118, 168, 0.45); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">💼 ' + esc(links.displayLinkedin || "LinkedIn") + ' ↗</a>';
          }
          h += '</div>';
        }

        h += '<div style="display:flex; gap:6px; margin-top:4px;">';
        if (item.lat && item.lon) {
          h += '<button type="button" onclick="flyToCoords(' + item.lat + ',' + item.lon + ', 8)" class="btn btn-sm country-btn-fly" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer;">📍 ' + tr("مشاهده روی نقشه", "Fly on Map", "عرض الموقع على الخريطة") + '</button>';
        }
        h += '<button type="button" onclick="openDetailById(\'' + esc(item.id) + '\', \'agency\')" class="btn btn-sm country-btn-detail" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.4); color:#38bdf8;">📖 ' + tr("باز شدن جزئیات", "Open Details", "فتح التفاصيل") + '</button>';
        h += '</div>';

        h += '</div>'; // end entity card
      });
      h += '</div>';
    } else {
      h += '<div style="padding:16px; text-align:center; color:var(--muted); font-size:11px;">' + tr("هیچ سازمان فضایی برای این کشور ثبت نشده است.", "No space agency registered for this country.", "لا توجد وكالة فضاء مسجلة في هذه الدولة.") + '</div>';
    }
    h += '</div>'; // end TAB 3

    // TAB 4: LAUNCH SITES
    h += '<div id="compTabCSite" class="site-tab-content" style="display:none;">';
    if (siteItems.length) {
      h += '<div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">';
      siteItems.forEach(function(item) {
        var nameStr = isFa ? (item.fa || item.en) : (isAr ? (item.ar || item.en || item.fa) : (item.en || item.fa));
        var locStr = isFa ? (item.loc_fa || item.loc || "—") : (isAr ? (item.loc_ar || countryNameAr(item.loc, null) || item.loc || item.loc_fa || "—") : (item.loc || item.loc_fa || "—"));
        var stStr = isFa ? (item.status === "active" ? "فعال و عملیاتی" : "غیرفعال / تاریخی") : (isAr ? (item.status === "active" ? "قيد التشغيل" : "غير نشط / تاريخي") : (item.status === "active" ? "Active Spaceport" : "Inactive"));

        h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:flex; justify-content:space-between; align-items:center;">';
        h += '<div><b style="font-size:11.5px; color:var(--text);">📍 <bdi>' + esc(nameStr) + '</bdi></b>';
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
            h += '<a href="' + esc(links.webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.35); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">🌐 ' + esc(links.displayWeb || (isAr ? "موقع إلكتروني" : "Website")) + ' ↗</a>';
          }
          if (links.linkedinUrl) {
            h += '<a href="' + esc(links.linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; background:rgba(14, 118, 168, 0.18); border:1px solid rgba(14, 118, 168, 0.45); font-size:10px; font-weight:bold; font-family:monospace; padding:3px 8px; border-radius:4px; text-decoration:none; display:inline-flex; align-items:center; gap:3px; word-break:break-all;" onclick="event.stopPropagation();">💼 ' + esc(links.displayLinkedin || "LinkedIn") + ' ↗</a>';
          }
          h += '</div>';
        }

        h += '<div style="display:flex; gap:6px; margin-top:4px;">';
        if (item.lat && item.lon) {
          h += '<button type="button" onclick="flyToCoords(' + item.lat + ',' + item.lon + ', 8)" class="btn btn-sm country-btn-fly" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer;">📍 ' + tr("مشاهده روی نقشه", "Fly on Map", "عرض الموقع على الخريطة") + '</button>';
        }
        h += '<button type="button" onclick="openDetailById(\'' + esc(item.id) + '\', \'site\')" class="btn btn-sm country-btn-detail" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.4); color:#38bdf8;">📖 ' + tr("باز شدن جزئیات", "Open Details", "فتح التفاصيل") + '</button>';
        h += '</div>';

        h += '</div>'; // end site card
      });
      h += '</div>';
    } else {
      h += '<div style="padding:16px; text-align:center; color:var(--muted); font-size:11px;">' + tr("هیچ پایگاه پرتاب ثبت‌شده‌ای برای این کشور یافت نشد.", "No registered launch sites for this country.", "لا توجد مواقع إطلاق مسجلة في هذه الدولة.") + '</div>';
    }
    h += '</div>'; // end TAB 4

    // TAB 5: LANDING & RECOVERY SITES (کشورهای نمونه؛ همان کالبد کارت‌های دیگر)
    if (showRecovery) {
      var recTypeFa = { booster: "سکوی بوستر", capsule: "بازیابی کپسول", runway: "باند فرود", mixed: "کپسول و باند",
        tower: "برج گرفتن بوستر", droneship: "شناور فرود دریایی", splashdown_zone: "پهنهٔ آب‌نشینی" };
      var recTypeEn = { booster: "Booster landing", capsule: "Capsule recovery", runway: "Runway landing", mixed: "Capsule & runway",
        tower: "Booster catch tower", droneship: "Landing droneship", splashdown_zone: "Splashdown zone" };
      var recTypeAr = { booster: "هبوط المعزّز", capsule: "استعادة الكبسولة", runway: "الهبوط على المدرج", mixed: "كبسولة ومدرج",
        tower: "التقاط المعزّز بالبرج", droneship: "سفينة هبوط بحرية", splashdown_zone: "منطقة الهبوط المائي" };
      h += '<div id="compTabCRecovery" class="site-tab-content" style="display:none;">';
      if (recoveryItems.length) {
        h += '<div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">';
        recoveryItems.forEach(function(item) {
          var nameStr = isFa ? (item.fa || item.en) : (isAr ? (item.ar || item.en || item.fa) : (item.en || item.fa));
          var cityStr = isFa ? (item.city_fa || item.city || "—") : (isAr ? (item.city_ar || item.city || item.city_fa || "—") : (item.city || item.city_fa || "—"));
          var typeStr = isFa ? (recTypeFa[item.recovery_type] || "فرود و بازیابی") : (isAr ? (recTypeAr[item.recovery_type] || "الهبوط والاستعادة") : (recTypeEn[item.recovery_type] || "Recovery"));
          var recIcon = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%232dd4bf' stroke-width='3'/><text x='50' y='62' font-family='sans-serif' font-size='34' fill='%232dd4bf' text-anchor='middle'>🛬</text></svg>";

          h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px;">';
          h += '<div style="display:flex; justify-content:space-between; align-items:center;">';
          h += '<div style="display:flex; align-items:center; gap:8px;">';
          h += '<img src="' + recIcon + '" alt="" style="width:28px; height:28px; object-fit:contain; border-radius:4px; background:#000; padding:1px; border:1px solid var(--line);" />';
          h += '<div><b style="font-size:11.5px; color:var(--text);"><bdi>' + esc(nameStr) + '</bdi></b>';
          h += '<div style="font-size:9.5px; color:var(--muted);">📍 ' + esc(cityStr) + '</div></div>';
          h += '</div>';
          h += '<span style="font-size:9.5px; color:#2dd4bf; background:rgba(45,212,191,0.12); border:1px solid rgba(45,212,191,0.3); padding:2px 6px; border-radius:10px;"><bdi>' + esc(typeStr) + '</bdi></span>';
          h += '</div>';

          // Description Kicker
          var shortDesc = desc(item);
          if (shortDesc) {
            h += '<div style="font-size:10px; color:var(--text); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">' + esc(shortDesc) + '</div>';
          }

          h += '<div style="display:flex; gap:6px; margin-top:4px;">';
          if (item.lat && item.lon) {
            h += '<button type="button" onclick="flyToCoords(' + item.lat + ',' + item.lon + ', 8)" class="btn btn-sm country-btn-fly" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer;">📍 ' + tr("مشاهده روی نقشه", "Fly on Map", "عرض الموقع على الخريطة") + '</button>';
          }
          h += '<button type="button" onclick="openDetailById(\'' + esc(item.id) + '\', \'recovery\')" class="btn btn-sm country-btn-detail" style="flex:1; font-size:10px; padding:5px 8px; cursor:pointer; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.4); color:#38bdf8;">📖 ' + tr("باز شدن جزئیات", "Open Details", "فتح التفاصيل") + '</button>';
          h += '</div>';

          h += '</div>'; // end recovery card
        });
        h += '</div>';
      } else {
        h += '<div style="padding:16px; text-align:center; color:var(--muted); font-size:11px;">' + tr("هیچ پایگاه فرود و بازیابی ثبت‌شده‌ای برای این کشور یافت نشد.", "No registered landing & recovery sites for this country.", "لا توجد مواقع هبوط واستعادة مسجلة في هذه الدولة.") + '</div>';
      }
      h += '</div>'; // end TAB 5
    }

    return h;
  }
  window.isEntityInCountry = isEntityInCountry;
  window.getCountryAtLngLat = getCountryAtLngLat;
  window.renderCompanyDetail = renderCompanyDetail;
  window.renderCountryProfile = renderCountryProfile;
  window.bindCountryItemClicks = function() {};


  function renderAgencyDetail(p) {
    if (LANG === "ar") return renderAgencyCompanyArabic(p);
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
      h += '<div style="background:linear-gradient(135deg, rgba(21, 38, 58, 0.92) 0%, rgba(9, 13, 22, 0.96) 100%); border:1px solid rgba(245, 158, 11, 0.4); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">';
      h += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">';
      h += '<span style="font-size:12px; font-weight:bold; color:#f59e0b;">🏆 ' + (isFa ? "محصول شاخص:" : "Flagship Product:") + ' <b><bdi style="color:#f2c649;">' + esc(flagProdName) + '</bdi></b></span>';
      h += '<span class="badge-gov" style="padding:2px 8px; border-radius:10px; font-size:10px; background:rgba(245, 158, 11, 0.2); border:1px solid rgba(245, 158, 11, 0.4); color:#f59e0b;">' + esc(flagProdStatus) + '</span>';
      h += '</div>';
      if (flagProdExpl) {
        h += '<div style="font-size:10.5px; color:#4ec9d8; margin-top:4px; line-height:1.6;">' + esc(flagProdExpl) + '</div>';
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
      h += '<span style="font-size:12px; font-weight:bold; color:#10b981;">🚀 ' + (isFa ? "برنامه کلان شاخص:" : "Flagship Program:") + ' <b><bdi style="color:#f2c649;">' + esc(flagProgName) + '</bdi></b></span>';
      h += '<span style="padding:2px 8px; border-radius:10px; font-size:10px; background:rgba(16, 185, 129, 0.2); border:1px solid rgba(16, 185, 129, 0.4); color:#10b981;">' + esc(flagProgTimeline) + '</span>';
      h += '</div>';
      if (flagProgExpl) {
        h += '<div style="font-size:10.5px; color:#4ec9d8; margin-top:4px; line-height:1.6;">' + esc(flagProgExpl) + '</div>';
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
    h += '<div style="font-size:11.5px; font-weight:bold; color:#f2c649; margin-bottom:10px; display:flex; align-items:center; gap:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px;">🌐 ' + (isFa ? "درگاه‌های رسمی ارتباطی و وب‌سایت سازمان:" : "Official Communication Channels:") + '</div>';
    
    h += '<div style="display:flex; flex-direction:column; gap:8px;">';
    
    // Website Row (Displays actual domain URL text like isa.ir ↗)
    h += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(16, 185, 129, 0.3);">';
    h += '<span style="font-size:10.5px; color:#f2c649; font-weight:bold;">🌐 ' + (isFa ? "وب‌سایت رسمی:" : "Official Website:") + '</span>';
    h += '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#10b981; font-weight:bold; text-decoration:none; background:rgba(16, 185, 129, 0.15); padding:4px 12px; border-radius:5px; border:1px solid rgba(16, 185, 129, 0.4); font-size:10.5px; font-family:monospace; display:flex; align-items:center; gap:4px;"><bdi>' + esc(displayWebDomain) + '</bdi> ↗</a>';
    h += '</div>';

    // LinkedIn Row
    if (linkedinUrl && linkedinUrl !== "#") {
      h += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(56, 189, 248, 0.3);">';
      h += '<span style="font-size:10.5px; color:#f2c649; font-weight:bold;">💼 ' + (isFa ? "صفحه رسمی لینکدین:" : "Official LinkedIn:") + '</span>';
      h += '<a href="' + esc(linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-weight:bold; text-decoration:none; background:rgba(56, 189, 248, 0.15); padding:4px 12px; border-radius:5px; border:1px solid rgba(56, 189, 248, 0.4); font-size:10.5px; font-family:monospace; display:flex; align-items:center; gap:4px;"><bdi>' + esc(displayLinkedin) + '</bdi> ↗</a>';
      h += '</div>';
    }

    // Email Row
    if (emailAddr) {
      h += '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(245, 158, 11, 0.3);">';
      h += '<span style="font-size:10.5px; color:#f2c649; font-weight:bold;">📧 ' + (isFa ? "پست الکترونیک ارتباطی:" : "Contact Email:") + '</span>';
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
        h += '<div style="font-size:12px; font-weight:bold; color:#f2c649; flex:1; line-height:1.5;">📡 <bdi>' + esc(pName) + '</bdi></div>';
        h += '<span style="color:#8ba3c4; font-size:10px; opacity:0.8; margin-inline-start:8px;">▼</span>';
        h += '</summary>';

        // Sleek Collapsible Details Body
        h += '<div style="padding:12px; border-top:1px solid rgba(255,255,255,0.08); background:rgba(4,10,18,0.7); color:#e7f0fb; font-size:10.5px; display:flex; flex-direction:column; gap:8px;">';
        
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
          h += '<div style="font-size:10px; color:#4ec9d8; line-height:1.5;"><bdi>' + esc(pSpecs) + '</bdi></div>';
          h += '</div>';
        }

        // Operational Role Highlight Box
        if (pRole && pRole !== "—") {
          h += '<div style="background:rgba(15, 31, 51, 0.88); border:1px solid rgba(245, 158, 11, 0.35); border-radius:6px; padding:8px 10px;">';
          h += '<div style="font-size:11px; font-weight:bold; color:#f59e0b; margin-bottom:3px; display:flex; align-items:center; gap:4px;">🛠️ ' + (isFa ? "شرح کاربردی و مأموریت مداری:" : "Operational Role & Mission:") + '</div>';
          h += '<div style="font-size:10px; color:#e7f0fb; line-height:1.5;"><bdi>' + esc(pRole) + '</bdi></div>';
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
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--amber); margin-bottom:6px;">🚀 ' + (isFa ? "برنامه‌های کلان استراتژیک و منظومه‌ها:" : "Umbrella Programs & Space Constellations:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:6px;">';
      prgList.forEach(function(prg) {
        var prgName = isFa ? (prg.name_fa || prg.name) : (prg.name_en || prg.name);
        var prgAuth = isFa ? (prg.authority_fa || prg.authority) : (prg.authority_en || prg.authority);
        var prgObj = isFa ? (prg.objective_fa || prg.objective) : (prg.objective_en || prg.objective);
        var prgNext = isFa ? (prg.next_step_fa || prg.next_step) : (prg.next_step_en || prg.next_step);

        h += '<div style="background:rgba(0,0,0,0.3); border-right:3px solid #f59e0b; padding:8px 10px; border-radius:6px; font-size:10.5px;">';
        h += '<b style="color:var(--text); font-size:11px;">🌌 <bdi>' + esc(prgName) + '</bdi></b>';
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
          h += '<div style="font-size:10.5px; color:var(--text);">• ' + esc(item) + '</div>';
        } else {
          var yr = item.year || item.date || "";
          var txt = isFa ? (item.text || item.title || item.desc) : (item.text_en || item.title_en || item.desc_en || item.text || item.title);

          h += '<div style="font-size:10.5px; color:var(--text); line-height:1.5;">';
          h += '<b style="color:var(--amber); font-family:monospace;"><bdi>' + esc(yr) + '</bdi>:</b> <bdi>' + esc(txt) + '</bdi>';
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
    var isAr = (typeof LANG !== "undefined" && LANG === "ar");
    var ar = isAr ? propulsionArabicLocale(p) : null;
    function label(fa, en, arabic) { return isFa ? fa : isAr ? arabic : en; }

    var propCat = isAr ? ar.category : isFa ? (o.propulsion_category_fa || o.propulsion_category_en || "پیشرانه‌های فضایی") : (o.propulsion_category_en || o.propulsion_category_fa || "Space Propulsion");
    var propType = isAr ? ar.propulsionType : isFa ? (o.propulsion_type_fa || o.propulsion_type_en || "پیشرانه سوخت مایع") : (o.propulsion_type_en || o.propulsion_type_fa || "Liquid Propulsion");
    var orgTypeStr = isAr ? ar.orgType : isFa ? (o.org_type_fa || o.org_type_en || "مجتمع تخصصی پیشرانش") : (o.org_type_en || o.org_type_fa || "Propulsion Contractor");

    // Header with Title & Icon & Category Badge
    h += '<div class="d-head" style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-inline-end: 35px;">';
    h += '<div style="display:flex; gap:10px; align-items:center; flex:1;">';
    var ic = iconFor("propulsion", "active").replace(/width="3\d"/, 'width="34"').replace(/height="38"/, 'height="44"');
    h += '<div>' + ic + '</div>';
    h += '<div><div class="d-kicker">' + esc(isAr ? "أنظمة الدفع الفضائي" : t("cat_propulsion")) + '</div>';
    h += '<h2 class="d-title" style="margin:0;">' + esc(isAr ? ar.localizedName : name(o)) + '</h2></div></div>';
    h += '<span class="badge-private" style="padding:3px 10px; border-radius:12px; font-size:10.5px; font-weight:bold; white-space:nowrap;">' + esc(propCat) + '</span>';
    h += '</div>';

    var subtitle = isAr ? ar.officialName : (isFa ? (o.en || o.fa) : (o.fa || o.en));
    h += '<div class="d-sub" style="margin-top:4px;">' + esc(subtitle) + '</div>';
    h += '<div class="d-desc" style="margin-top:6px; line-height:1.6;">' + esc(isAr ? ar.profileDesc : desc(o)) + '</div>';

    // 3 Tabs
    h += '<div class="site-tabs" style="margin-top:10px;">';
    h += '<button class="site-tab-btn active" onclick="switchCompTab(\'overview\', this)">' + label("شناسنامه و معماری", "Overview & Architecture", "نظرة عامة والهندسة المعمارية") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'engines\', this)">' + label("موتورها و موشک مقصد", "Engines & Mission Link", "المحركات وربط المهام") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'testing\', this)">' + label("تست‌های گرم و نقشه راه", "Test History & Roadmap", "سجل الاختبارات وخارطة الطريق") + '</button>';
    h += '</div>';

    // TAB 1: OVERVIEW & ARCHITECTURE & FLAGSHIP (HIGH-CONTRAST BILINGUAL GLASSMOPHIC UI)
    h += '<div id="compTabOverview" class="site-tab-content active" style="display:block;">';
    
    // Executive 6-Grid Box
    h += '<div class="grid2" style="margin-top:8px;">';
    h += cell(label("سال تأسیس", "Founded", "سنة التأسيس"), isAr ? ar.latinDigits(o.founded == null ? "—" : o.founded) : (o.founded || "—"));
    h += cell(label("مقر اصلی", "Headquarters", "المقر الرئيسي"), isAr ? ar.city : (isFa ? (o.city_fa || o.city) : (o.city || o.city_fa)));
    h += cell(isAr ? "الدولة" : t("country"), isAr ? ar.country : (isFa ? (o.country_fa || o.country) : (o.country || o.country_fa)));
    h += cell(label("نوع نهاد", "Org Type", "نوع الجهة"), orgTypeStr, true);
    h += cell(label("رده پیشرانه", "Category", "مجال التخصص"), propCat, true);
    h += cell(label("نوع پیشرانه", "Propulsion Type", "نوع منظومة الدفع"), propType, true);
    h += '</div>';

    // SECTION 1: Flagship Engine Card (100% PURE BILINGUAL)
    var flagshipEngine = isAr ? ar.flagship : (isFa ? (o.flagship_engine_fa || o.flagship_engine_en) : (o.flagship_engine_en || o.flagship_engine_fa));
    var flagshipStatus = isAr ? ar.status : (isFa ? (o.flagship_status_fa || o.flagship_status_en || "عملیاتی") : (o.flagship_status_en || o.flagship_status_fa || "Operational"));
    var flagshipApp = isAr ? ar.application : (isFa ? (o.flagship_application_fa || o.flagship_application_en || "پرتابگرهای مداری") : (o.flagship_application_en || o.flagship_application_fa || "Orbital Launchers"));

    if (flagshipEngine) {
      h += '<div style="background:linear-gradient(135deg, rgba(21, 38, 58, 0.92) 0%, rgba(9, 13, 22, 0.96) 100%); border:1px solid rgba(56, 189, 248, 0.35); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.3);">';
      h += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">';
      h += '<span style="font-size:12px; font-weight:bold; color:#f2c649;">⚙️ ' + label("موتور پرچمدار و شاخص:", "Flagship Engine:", "محرك الدفع الرئيس:") + ' <b><bdi>' + esc(flagshipEngine) + '</bdi></b></span>';
      h += '<span class="badge-gov" style="padding:2px 8px; border-radius:10px; font-size:10px; background:rgba(16, 185, 129, 0.2); border:1px solid rgba(16, 185, 129, 0.4); color:#10b981;">' + esc(flagshipStatus) + '</span>';
      h += '</div>';
      h += '<div style="font-size:10.5px; color:#4ec9d8; margin-top:4px; line-height:1.5;">🚀 <b>' + label("کاربرد اصلی:", "Primary Application:", "الاستخدام الرئيس:") + '</b> <bdi>' + esc(flagshipApp) + '</bdi></div>';
      h += '</div>';
    }

    // SECTION 2: Company History Box
    var histText = isAr ? ar.arabicText(o.history_ar, "") : (isFa ? (o.history_fa || o.history_en || o.fa_d) : (o.history_en || o.history_fa || o.en_d));
    if (histText) {
      h += '<div style="background:rgba(15, 31, 51, 0.88); border:1px solid rgba(245, 158, 11, 0.35); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.25);">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#f59e0b; margin-bottom:6px; display:flex; align-items:center; gap:6px;">📜 ' + label("تاریخچه سازمانی و توسعه پیشرانه:", "Company & Propulsion History:", "تاريخ الشركة وتطوير أنظمة الدفع:") + '</div>';
      h += '<div style="font-size:10.5px; color:#4ec9d8; line-height:1.6;">' + esc(histText) + '</div>';
      h += '</div>';
    }

    // SECTION 3: Product Development History Box
    var prodHistText = isAr ? ar.arabicText(o.product_history_ar, "") : (isFa ? (o.product_history_fa || o.product_history_en) : (o.product_history_en || o.product_history_fa));
    if (prodHistText) {
      h += '<div style="background:rgba(15, 31, 51, 0.88); border:1px solid rgba(16, 185, 129, 0.35); border-radius:8px; padding:12px; margin-top:10px; box-shadow:0 4px 12px rgba(0,0,0,0.25);">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:6px; display:flex; align-items:center; gap:6px;">⚙️ ' + label("تاریخچه بومی‌سازی و ساخت محصولات:", "Product Development & Manufacturing:", "تاريخ تطوير المنتجات وتصنيعها:") + '</div>';
      h += '<div style="font-size:10.5px; color:var(--text); line-height:1.6;">' + esc(prodHistText) + '</div>';
      h += '</div>';
    }

    // Official Links Bar
    var compLinks = extractEntityLinks(o);
    var webUrl = compLinks.webUrl;
    var displayWeb = compLinks.displayWeb || (isAr ? "الموقع الرسمي" : (isFa ? "وب‌سایت رسمی" : "Website"));
    var linkedinUrl = compLinks.linkedinUrl;
    var displayLinkedin = compLinks.displayLinkedin || (isAr ? "لينكدإن" : "LinkedIn");

    if (webUrl || linkedinUrl || (o.lat && o.lon)) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:10.5px; flex-wrap:wrap; gap:8px;">';
      
      if (webUrl) {
        h += '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent); font-weight:bold; font-family:monospace; text-decoration:none; background:rgba(56, 189, 248, 0.12); padding:5px 12px; border-radius:6px; border:1px solid rgba(56, 189, 248, 0.3); word-break:break-all;" onclick="window.open(\'' + esc(webUrl) + '\', \'_blank\'); return false;">🌐 ' + esc(displayWeb) + ' ↗</a>';
      }
      
      if (linkedinUrl) {
        h += '<a href="' + esc(linkedinUrl) + '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8; font-weight:bold; font-family:monospace; text-decoration:none; background:rgba(14, 118, 168, 0.2); padding:5px 12px; border-radius:6px; border:1px solid rgba(14, 118, 168, 0.4); word-break:break-all;" onclick="window.open(\'' + esc(linkedinUrl) + '\', \'_blank\'); return false;">💼 ' + esc(displayLinkedin) + ' ↗</a>';
      }

      if (o.lat && o.lon) {
        h += '<button type="button" class="btn btn-sm country-btn-fly" onclick="flyToCoords(' + o.lat + ',' + o.lon + ', 8)" style="font-size:10px; padding:5px 10px; cursor:pointer;">📍 ' + label("پرواز به موقعیت روی نقشه ↗", "Fly to Location ↗", "الانتقال إلى الموقع على الخريطة ↗") + '</button>';
      }

      h += '</div>';
    }

    h += '</div>'; // end TAB 1

    // TAB 2: ENGINES CATALOG & MISSION RELATIONSHIP (REFINED ACCORDION WITH SPACEFLIGHT OPERATIONAL ROLE)
    h += '<div id="compTabEngines" class="site-tab-content" style="display:none;">';
    var engList = o.engine_products_bilingual || [];
    var prodList = isAr
      ? ar.uniqueValues(o.products || []).map(function (item) { return ar.officialModelName(item); }).filter(Boolean)
      : (o.products || []);
    var notMissions = isAr ? ar.uniqueValues(o.notable_missions_ar || []).map(function (item) { return ar.arabicText(item, ""); }).filter(Boolean)
      : (isFa ? (o.notable_missions_fa || o.notable_missions_en || []) : (o.notable_missions_en || o.notable_missions_fa || []));

    if (engList.length) {
      h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:8px;">⚙️ ' + label("برای مشاهده مشخصات فنی، شرح کارکرد عملیاتی در فضا و موشک مقصد روی هر موتور کلیک کنید:", "Click on any engine to expand specifications & spaceflight operational role:", "انقر على المحرك لعرض مواصفاته ودوره التشغيلي ومركبة الإطلاق المرتبطة به:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:8px;">';
      
      (Array.isArray(engList) ? engList : [engList]).forEach(function(eng, idx) {
        var engName = isAr ? ar.arabicText(eng.name_ar, "محرك غير مسمى") : (isFa ? (eng.name_fa || eng.name_en) : (eng.name_en || eng.name_fa));
        var engOfficialName = isAr ? ar.officialModelName(eng.name_en) : "";
        var engType = isAr ? ar.productTypeArabic(eng.type_en) : (isFa ? (eng.type_fa || eng.type_en || "پیشرانه موشک") : (eng.type_en || eng.type_fa || "Rocket Engine"));
        var engProp = isAr ? ar.propellantArabic(eng.propellant_en) : (isFa ? (eng.propellant_fa || eng.propellant_en || "—") : (eng.propellant_en || eng.propellant_fa || "—"));
        var engRocket = isAr ? ar.arabicText(eng.rocket_ar, "") : (isFa ? (eng.rocket_fa || eng.rocket_en || "پرتابگرهای مداری") : (eng.rocket_en || eng.rocket_fa || "Orbital Launchers"));
        var engThrust = isAr ? ar.technicalValueArabic(eng.thrust_ar) : (isFa ? (eng.thrust_fa || eng.thrust_en || "—") : (eng.thrust_en || eng.thrust_fa || "—"));
        var engIsp = isAr ? ar.technicalValueArabic(eng.isp_ar || eng.isp_en) : "";
        var engSt = isAr ? ar.statusArabic(eng.status_en) : (isFa ? (eng.status_fa || eng.status_en || "عملیاتی") : (eng.status_en || eng.status_fa || "Operational"));
        var engRole = isAr ? ar.arabicText(eng.engineering_desc_ar, "") : (isFa ? (eng.engineering_desc_fa || eng.engineering_desc_en || "") : (eng.engineering_desc_en || eng.engineering_desc_fa || ""));

        var openAttr = (idx === 0) ? " open" : "";
        h += '<details class="acc" ' + openAttr + ' style="background:linear-gradient(180deg, rgba(15,31,51,0.8) 0%, rgba(9,13,22,0.9) 100%); border:1px solid var(--line); border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:all 0.2s ease;">';
        
        // Summary Header Bar (FIXED FULL WRAP TITLE WITHOUT ELLIPSIS!)
        h += '<summary style="padding:10px 12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:10px; user-select:none; background:rgba(255,255,255,0.03); outline:none; flex-wrap:wrap;">';
        var engTitle = engName + (engOfficialName && engName.indexOf(engOfficialName) < 0 ? ' (' + engOfficialName + ')' : '');
        h += '<div style="font-size:12px; font-weight:bold; color:#f2c649; line-height:1.45; word-break:break-word; flex:1; min-width:180px;">⚙️ <bdi>' + esc(engTitle) + '</bdi></div>';
        h += '<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">';
        h += '<span style="color:#38bdf8; font-size:9.5px; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.3); padding:2px 7px; border-radius:12px; font-weight:bold;"><bdi>' + esc(engProp) + '</bdi></span>';
        h += '<span style="color:#10b981; font-weight:bold; font-size:9.5px; background:rgba(16, 185, 129, 0.12); border:1px solid rgba(16, 185, 129, 0.3); padding:2px 7px; border-radius:12px;"><bdi>' + esc(engSt) + '</bdi></span>';
        h += '<span style="color:#8ba3c4; font-size:10px; opacity:0.8;">▼</span>';
        h += '</div>';
        h += '</summary>';

        // Sleek Collapsible Details Body
        h += '<div style="padding:12px; border-top:1px solid rgba(255,255,255,0.08); background:rgba(4,10,18,0.7); color:#e7f0fb; font-size:10.5px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>' + label("چرخه / نوع احتراق:", "Cycle / Type:", "نوع المحرك / دورة الاحتراق:") + '</b> <br><bdi style="color:#f2c649;">' + esc(engType) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>' + label("ترکیب سوخت:", "Propellant:", "المادة الدافعة:") + '</b> <br><span style="color:#f59e0b; font-weight:bold;"><bdi>' + esc(engProp) + '</bdi></span></div>';
        h += '</div>';

        var engTechnicalValue = engThrust + (isAr && engIsp ? ' · الاندفاع النوعي: ' + engIsp : '');
        h += '<div style="color:#10b981; background:rgba(16, 185, 129, 0.08); padding:6px 8px; border-radius:4px; border:1px solid rgba(16, 185, 129, 0.2);"><b>' + label("مشخصات فنی و رانش:", "Specifications:", "المواصفات الفنية وقوة الدفع:") + '</b> <bdi>' + esc(engTechnicalValue) + '</bdi></div>';

        // SPACEFLIGHT OPERATIONAL ROLE BOX
        if (engRole) {
          h += '<div style="background:rgba(15, 31, 51, 0.88); border:1px solid rgba(245, 158, 11, 0.35); border-radius:6px; padding:8px 10px; margin-top:2px;">';
          h += '<div style="font-size:11px; font-weight:bold; color:#f59e0b; margin-bottom:3px; display:flex; align-items:center; gap:4px;">🛠️ ' + label("شرح کارکرد عملیاتی در فضا:", "Spaceflight Operational Role:", "الدور التشغيلي في الفضاء:") + '</div>';
          h += '<div style="font-size:10px; color:#e7f0fb; line-height:1.5;">' + esc(engRole) + '</div>';
          h += '</div>';
        }

        // Target Rocket / Mission Highlight Box
        h += '<div style="color:#4ec9d8; background:linear-gradient(90deg, rgba(78, 201, 216, 0.12) 0%, rgba(0, 125, 145, 0.06) 100%); border:1px solid rgba(78, 201, 216, 0.35); padding:8px 10px; border-radius:6px; margin-top:2px;">';
        h += '<div style="font-size:11px; font-weight:bold; color:#f2c649; margin-bottom:2px;">🚀 ' + label("موشک و مأموریت مقصد (Mission → Engine):", "Target Rocket / Mission:", "صاروخ الإطلاق / المهمة المرتبطة:") + '</div>';
        h += '<div style="font-size:10.5px;"><bdi>' + esc(engRocket || "غير محدد") + '</bdi></div>';
        var usedBy = eng.used_by_ids || [];
        if (usedBy.length && window.compById) {
          h += '<div style="display:flex; gap:5px; flex-wrap:wrap; margin-top:6px;">';
          usedBy.forEach(function(ubId) {
            var tc = window.compById(ubId);
            if (!tc) return;
            var tcName = isAr ? (tc.ar || tc.en || tc.fa) : (isFa ? (tc.fa || tc.en) : (tc.en || tc.fa));
            h += '<a href="#" onclick="openDetailById(\'' + esc(ubId) + '\', \'launch\'); return false;" title="' + (isAr ? 'فتح ملف الجهة المستخدمة لهذا المحرك' : (isFa ? 'باز کردن پروندهٔ بهره‌بردار این موتور' : 'Open the dossier of this engine\'s user')) + '" style="color:#2fd4a7; font-size:9.5px; font-weight:bold; text-decoration:none; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.35); padding:2px 8px; border-radius:10px; cursor:pointer; white-space:nowrap;">🚀 <bdi>' + esc(tcName) + '</bdi> ↗</a>';
          });
          h += '</div>';
        }
        h += '</div>';

        h += '</div>';
        h += '</details>';
      });
      h += '</div>';
    } else if (prodList.length) {
      h += '<div style="font-size:10.5px; color:var(--muted); margin-bottom:6px;">📦 ' + label("سبد محصولات و سامانه‌های پیشرانش:", "Products Portfolio:", "المنتجات وأنظمة الدفع:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:4px;">';
      (Array.isArray(prodList) ? prodList : [prodList]).forEach(function(pItem) {
        h += '<div style="background:var(--bg2); border:1px solid var(--line); padding:6px 10px; border-radius:4px; font-size:10.5px; color:var(--text);">⚙️ <bdi>' + esc(pItem) + '</bdi></div>';
      });
      h += '</div>';
    }

    if (notMissions.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:6px;">🎯 ' + label("مأموریت‌های برجسته صنعتی و فضایی:", "Notable Missions:", "المهام الفضائية البارزة:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:4px;">';
      (Array.isArray(notMissions) ? notMissions : [notMissions]).forEach(function(m) {
        h += '<div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.2); padding:6px; border-radius:4px; font-size:10.5px; color:var(--text);">🚀 ' + esc(m) + '</div>';
      });
      h += '</div></div>';
    }

    h += '</div>'; // end TAB 2

    // TAB 3: HOT-FIRE TESTING & ROADMAP (100% BILINGUAL GUARANTEED)
    h += '<div id="compTabTesting" class="site-tab-content" style="display:none;">';
    var testHist = isAr ? (o.test_history_en || []) : (isFa ? (o.test_history_fa || o.test_history_en || []) : (o.test_history_en || o.test_history_fa || []));
    var futPlans = isAr ? ar.uniqueValues(o.future_plans_ar || []).map(function (item) { return ar.arabicText(item, ""); }).filter(Boolean)
      : (isFa ? (o.future_plans_fa || o.future_plans_en || []) : (o.future_plans_en || o.future_plans_fa || []));

    if (testHist.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--amber); margin-bottom:6px;">🔥 ' + label("تاریخچه تست‌های گرم زمین‌پایه و آزمون‌های نازل:", "Static Hot-Fire Test Records & Nozzle Firing Tests:", "سجلات اختبارات الإشعال الأرضي واختبارات الفوهات:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:6px;">';
      (Array.isArray(testHist) ? testHist : [testHist]).forEach(function(tRecord) {
        if (typeof tRecord === "string") {
          var safeRecord = isAr ? ar.arabicText(tRecord, "") : tRecord;
          if (!safeRecord) return;
          h += '<div style="background:rgba(0,0,0,0.25); border-right:3px solid #f59e0b; padding:6px 8px; border-radius:4px; font-size:10.5px; color:var(--text);">• ' + esc(safeRecord) + '</div>';
        } else {
          var tYr = isAr ? ar.latinDigits(tRecord.year || "2023") : (tRecord.year || "2023");
          var tTitle = isAr ? ar.arabicText(tRecord.title_ar, "") : (isFa ? (tRecord.title_fa || tRecord.title || "") : (tRecord.title_en || tRecord.title || ""));
          var tDesc = isAr ? ar.arabicText(tRecord.desc_ar, "") : (isFa ? (tRecord.desc_fa || tRecord.desc || "") : (tRecord.desc_en || tRecord.desc || ""));
          if (isAr && !tTitle && !tDesc) return;

          h += '<div style="background:rgba(0,0,0,0.3); border-right:3px solid #f59e0b; padding:8px 10px; border-radius:6px; font-size:10.5px; border:1px solid rgba(245,158,11,0.2);">';
          h += '<b style="color:var(--text);"><code style="color:var(--amber); font-size:11px; font-family:monospace;"><bdi>' + esc(tYr) + '</bdi></code> — ' + esc(tTitle) + '</b>';
          if (tDesc) h += '<div style="color:var(--muted); font-size:10px; margin-top:3px; line-height:1.5;">' + esc(tDesc) + '</div>';
          h += '</div>';
        }
      });
      h += '</div></div>';
    }

    if (futPlans.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:6px;">🚀 ' + label("برنامه‌های آتی ارتقای توان رانش و نقشه راه:", "Future Thrust Scaling & Strategic Roadmap:", "خطط تطوير قدرات الدفع وخارطة الطريق المستقبلية:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:4px;">';
      (Array.isArray(futPlans) ? futPlans : [futPlans]).forEach(function(fPlan) {
        var safePlan = isAr ? ar.arabicText(fPlan, "") : fPlan;
        if (!safePlan) return;
        h += '<div style="background:rgba(56, 189, 248, 0.08); border:1px solid rgba(56, 189, 248, 0.2); padding:6px; border-radius:4px; font-size:10.5px; color:var(--text);">🎯 ' + esc(safePlan) + '</div>';
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
    var locale = LANG === "fa" ? "fa-IR-u-ca-gregory" : LANG === "ar" ? "ar-u-ca-gregory-nu-latn" : "en-GB";
    return new Date(date + "T12:00:00Z").toLocaleDateString(locale,
      { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  }
  function recoveryUi(fa, en, ar) { return LANG === "fa" ? fa : LANG === "ar" ? ar : en; }
  function recoveryArabicField(value) {
    var text = String(value == null ? "" : value).trim();
    return text && /[\u0600-\u06FF]/.test(text) && !/[پچژگکی]/.test(text) ? text : "";
  }
  function recoverySafeEnglish(value, fallback) {
    var text = String(value == null ? "" : value)
      .replace(/[۰-۹]/g, function (c) { return "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(c)]; })
      .replace(/[٠-٩]/g, function (c) { return "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(c)]; })
      .replace(/٪/g, "%").trim();
    if (!text) return fallback === undefined ? "" : fallback;
    var clean = text.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, " ")
      .replace(/[\u200C\u200D\uFEFF]/g, "").replace(/[،؛؟]/g, " ")
      .replace(/\(\s*\)/g, " ").replace(/\s+/g, " ").trim();
    return /[A-Za-z0-9\u3400-\u9FFF]/.test(clean) ? clean : (fallback === undefined ? "" : fallback);
  }
  function recoveryDisplay(faValue, enValue, arValue, fallback) {
    if (LANG === "fa") return String(faValue == null ? "" : faValue).trim() || "—";
    if (LANG === "ar") return recoveryArabicField(arValue) || recoverySafeEnglish(enValue, fallback === undefined ? "غير متاح" : fallback);
    return recoverySafeEnglish(enValue, "—") || String(faValue == null ? "" : faValue).trim() || "—";
  }
  function recoveryText(o, key) {
    return recoveryDisplay(o && o[key + "_fa"], o && o[key + "_en"], o && o[key + "_ar"], LANG === "ar" ? "غير متاح" : "—");
  }
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
        "کپی خودکار مجاز نشد. نشانی انتخاب شده است؛ از فرمان کپی مرورگر یا لمسِ طولانی استفاده کنید.") : LANG === "ar" ?
      (ok ? "تم نسخ الرابط. الصقه في شريط عنوان المتصفح." :
        "النسخ التلقائي غير متاح. تم تحديد العنوان؛ استخدم أمر النسخ في المتصفح أو اضغط مطولاً.") :
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
        "بازکردن زبانه همچنان مسدود است؛ از کپی نشانی استفاده کنید." : LANG === "ar" ?
        "ما زال فتح علامة تبويب جديدة محظوراً؛ انسخ العنوان بدلاً من ذلك." :
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
    var dialog = ensureExternalLinkDialog(), fa = LANG === "fa", ar = LANG === "ar";
    externalLinkUrl = url; externalLinkTrigger = trigger;
    $("#externalLinkTitle").textContent = fa ? "زبانهٔ جدید باز نشد" : ar ? "تعذر فتح علامة تبويب جديدة" : "The new tab did not open";
    $("#externalLinkExplanation").textContent = fa ?
      "پیش‌نمایش یا مرورگر اجازهٔ بازکردن پنجرهٔ جدید را نداد. نشانی منبع را کپی کنید و در مرورگر باز کنید؛ نقشه در همین‌جا باقی می‌ماند." : ar ?
      "لم تسمح المعاينة أو المتصفح بفتح نافذة جديدة. انسخ عنوان المصدر وافتحه في متصفحك؛ ستبقى الخريطة هنا." :
      "The preview or browser did not allow a new window. Copy the source address and open it in your browser; the map will stay here.";
    $("#externalLinkAddressLabel").textContent = fa ? "نشانی منبع" : ar ? "عنوان المصدر" : "Source address";
    $("#externalLinkAddress").value = url;
    $("#externalLinkStatus").textContent = "";
    $("#externalLinkStatus").removeAttribute("data-state");
    $("#externalLinkCopy").textContent = fa ? "کپی نشانی" : ar ? "نسخ الرابط" : "Copy link";
    $("#externalLinkRetry").textContent = fa ? "تلاش دوباره" : ar ? "حاول مجدداً" : "Try again";
    $("#externalLinkClose").textContent = fa ? "بستن" : ar ? "إغلاق" : "Close";
    // A top-level browser can offer ordinary same-tab navigation. Never replace an
    // embedded preview with YouTube/NASA, which can refuse iframe embedding.
    var current = $("#externalLinkCurrent"), embedded = true;
    try { embedded = window.top !== window; } catch (e) {}
    current.hidden = embedded;
    current.href = url;
    current.textContent = fa ? "خروج از برنامه و بازکردن منبع در همین زبانه" : ar ?
      "مغادرة التطبيق وفتح المصدر في علامة التبويب الحالية" : "Leave the app and open the source in this tab";
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
    var labels = isLanding ? {
      success: recoveryUi("فرود موفق", "Landing confirmed", "هبوط مؤكد"),
      failure: recoveryUi("فرود ناموفق", "Landing failed", "فشل الهبوط"),
      unknown: recoveryUi("نتیجهٔ فرود نامشخص", "Landing not verified", "الهبوط غير متحقق منه")
    } : {
      confirmed: recoveryUi("بازیابی تأییدشده", "Recovery confirmed", "الاستعادة مؤكدة"),
      partial: recoveryUi("بازیابی جزئی", "Partial recovery", "استعادة جزئية"),
      failed: recoveryUi("بازیابی ناموفق", "Recovery failed", "فشلت الاستعادة"),
      unknown: recoveryUi("بازیابی نامشخص", "Recovery unverified", "الاستعادة غير متحقق منها"),
      not_planned: recoveryUi("بازیابی در برنامه نبود", "Recovery not planned", "لم تُخطط الاستعادة")
    };
    if (isLanding && method === "tower_capture") {
      labels.success = recoveryUi("گرفتن با برج موفق", "Tower capture confirmed", "التقاط البرج مؤكد");
      labels.failure = recoveryUi("گرفتن با برج ناموفق", "Tower capture failed", "فشل الالتقاط بالبرج");
      labels.unknown = recoveryUi("نتیجهٔ گرفتن نامشخص", "Capture not verified", "الالتقاط غير متحقق منه");
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
  /* ============ SATELLITE & COMPONENT MAKERS DOSSIER (cat: satmaker) ============ */
  function renderSatmakerCompanyArabic(p) {
    var o = p.o || p, h = "";
    var COUNTRY_AR = {
      "Bulgaria": "بلغاريا", "China": "الصين", "Denmark": "الدنمارك", "Finland": "فنلندا",
      "France": "فرنسا", "Germany": "ألمانيا", "Japan": "اليابان", "Lithuania": "ليتوانيا",
      "Norway": "النرويج", "Russia": "روسيا", "South Africa": "جنوب أفريقيا", "Sweden": "السويد",
      "Switzerland": "سويسرا", "United Kingdom": "المملكة المتحدة", "United States": "الولايات المتحدة",
      "Uruguay": "أوروغواي"
    };
    var ORG_TYPE_AR = {
      "A Thales-Leonardo joint venture (France/Italy)": "مشروع مشترك بين Thales وLeonardo (فرنسا/إيطاليا)",
      "An Airbus subsidiary (United Kingdom)": "شركة تابعة لـAirbus (المملكة المتحدة)",
      "Family-led public company (Germany)": "شركة مساهمة عامة تديرها عائلة (ألمانيا)",
      "Family-owned private space company (Switzerland)": "شركة فضائية خاصة مملوكة لعائلة (سويسرا)",
      "Honeywell subsidiary (United States)": "شركة تابعة لـHoneywell (الولايات المتحدة)",
      "Private company (Bulgaria)": "شركة خاصة (بلغاريا)",
      "Private company (Finland)": "شركة خاصة (فنلندا)",
      "Private company under Kongsberg (Lithuania)": "شركة خاصة تابعة لمجموعة Kongsberg (ليتوانيا)",
      "Private company under RTX (USA)": "شركة خاصة تابعة لـRTX (الولايات المتحدة)",
      "Private company under the Advent fund (United States)": "شركة خاصة مملوكة لصندوق Advent (الولايات المتحدة)",
      "Private space component maker (France)": "شركة خاصة لتصنيع مكوّنات فضائية (فرنسا)",
      "Private space component maker (South Africa)": "شركة خاصة لتصنيع مكوّنات فضائية (جنوب أفريقيا)",
      "Private startup (United States)": "شركة ناشئة خاصة (الولايات المتحدة)",
      "Public company (Denmark)": "شركة مساهمة عامة (الدنمارك)",
      "Public company (Sweden)": "شركة مساهمة عامة (السويد)",
      "Public company (USA)": "شركة مساهمة عامة (الولايات المتحدة)",
      "Public company (United States)": "شركة مساهمة عامة (الولايات المتحدة)",
      "Public company (Uruguay/Argentina)": "شركة مساهمة عامة (أوروغواي/الأرجنتين)",
      "Public defense-space company (United States)": "شركة مساهمة عامة في قطاعي الدفاع والفضاء (الولايات المتحدة)",
      "Space arm of a heavy-industries group (Japan)": "الذراع الفضائية لمجموعة صناعات ثقيلة (اليابان)",
      "Space arm of the Airbus group (France/Europe)": "الذراع الفضائية لمجموعة Airbus (فرنسا/أوروبا)",
      "Space arm of the Kongsberg industrial group (Norway)": "الذراع الفضائية لمجموعة Kongsberg الصناعية (النرويج)",
      "State company under Roscosmos (Russia)": "شركة حكومية تابعة لـRoscosmos (روسيا)",
      "State institute under the CASC group (China)": "معهد حكومي تابع لمجموعة CASC (الصين)",
      "Wholly owned OHB subsidiary (Germany)": "شركة تابعة مملوكة بالكامل لـOHB (ألمانيا)"
    };
    var MAKER_CLASS_AR = {
      "Subsystem maker": "مصنّع أنظمة فرعية",
      "Full satellite manufacturer": "مصنّع أقمار صناعية متكامل",
      "Constellation builder and operator": "مُنشئ كوكبات الأقمار ومشغّلها",
      "Small-satellite manufacturer": "مصنّع أقمار صناعية صغيرة",
      "Small GEO satellite manufacturer": "مصنّع أقمار صغيرة للمدار الثابت (GEO)",
      "SAR constellation builder and operator": "مُنشئ كوكبات رادارية (SAR) ومشغّلها",
      "Satellite and spacecraft manufacturer": "مصنّع أقمار ومركبات فضائية",
      "Smallsat bus and component maker": "مصنّع منصات ومكوّنات للأقمار الصغيرة",
      "Nanosatellite subsystem and platform maker": "مصنّع أنظمة فرعية ومنصات للأقمار النانوية",
      "Modular nano and microsatellite bus maker": "مصنّع منصات معيارية للأقمار النانوية والمصغّرة",
      "Software-defined smallsat platform maker": "مصنّع منصات أقمار صغيرة معرّفة بالبرمجيات",
      "CubeSat subsystem and platform maker": "مصنّع أنظمة فرعية ومنصات CubeSat",
      "Space infrastructure component maker": "مصنّع مكوّنات البنية التحتية الفضائية"
    };
    var STATUS_AR = {
      "Operational": "قيد التشغيل",
      "Operational since 2025": "قيد التشغيل منذ 2025",
      "In production": "قيد الإنتاج",
      "In serial production": "قيد الإنتاج التسلسلي",
      "In development": "قيد التطوير",
      "Deploying": "قيد النشر",
      "Flight heritage": "سبق له الطيران",
      "Full heritage; Epsilon S upcoming": "إرث طيران كامل؛ والتطوير التالي Epsilon S",
      "Heritage; the first unit was lost": "سبق له الطيران؛ وفُقدت الوحدة الأولى"
    };
    var PRODUCT_TYPE_AR = {
      "Reaction wheel": "عجلة رد فعل", "Magnetic actuator": "مشغّل مغناطيسي",
      "Fine sun sensor": "حساس دقيق للشمس", "Fine sun & Earth sensor": "حساس دقيق للشمس والأرض",
      "Navigation payload": "حمولة ملاحية", "Navigation satellite": "قمر ملاحي",
      "Navigation satellites": "أقمار ملاحية", "Data service": "خدمة بيانات",
      "Electric thruster": "دافع كهربائي", "Composite fairing": "غطاء حمولة مركّب",
      "Payload fairing": "غطاء حمولة", "Cryogenic propellant tank": "خزان مادة دافعة مبردة",
      "Cryogenic tank segments": "مقاطع خزانات مبردة", "Launcher separation mechanism": "آلية فصل لمركبة الإطلاق",
      "Synthetic aperture radar": "رادار ذو فتحة اصطناعية", "High-resolution radar": "رادار عالي الدقة",
      "Small LEO bus": "منصة صغيرة للمدار الأرضي المنخفض", "Nanosatellite": "قمر نانوي",
      "Modular nanosatellite": "قمر نانوي معياري", "Modular CubeSat": "قمر CubeSat معياري",
      "GEO communications": "اتصالات المدار الثابت (GEO)", "GEO meteorology": "أرصاد جوية من المدار الثابت (GEO)",
      "Optical communications": "اتصالات بصرية", "Ground equipment": "معدات أرضية",
      "Ground facilities": "منشآت أرضية", "Flight components": "مكوّنات مؤهلة للطيران",
      "Flight structures": "هياكل مؤهلة للطيران", "Defense electronics": "إلكترونيات دفاعية",
      "Space-grade microcircuits": "دوائر دقيقة مؤهلة للفضاء", "Star tracker": "متعقّب نجوم",
      "Self-deploying antenna": "هوائي ذاتي النشر", "Payload interface structure": "هيكل ربط الحمولة",
      "Spacecraft mating hardware": "معدات وصل المركبات الفضائية", "Space power generation": "توليد الطاقة في الفضاء"
    };
    var PRODUCT_CLASS_AR = {
      "Small satellites": "أقمار صناعية صغيرة", "Small and mid-size satellites": "أقمار صغيرة ومتوسطة",
      "Small to mid-size satellites": "أقمار صغيرة إلى متوسطة", "CubeSats": "أقمار CubeSat",
      "CubeSats and microsats": "أقمار CubeSat وأقمار مصغّرة", "CubeSats and nanosats": "أقمار CubeSat وأقمار نانوية",
      "Nanosatellites": "أقمار نانوية", "Constellation satellites": "أقمار كوكبات",
      "Commercial and government satellites": "أقمار تجارية وحكومية",
      "Science and Earth observation satellites": "أقمار علمية وأقمار لرصد الأرض",
      "Science and telecom satellites": "أقمار علمية وأقمار اتصالات",
      "Government and commercial satellites": "أقمار حكومية وتجارية",
      "Satellites and defense platforms": "أقمار ومنصات دفاعية",
      "National defense programs": "برامج الدفاع الوطنية",
      "Japan's national launchers": "مركبات الإطلاق الوطنية اليابانية",
      "The International Space Station": "محطة الفضاء الدولية",
      "NASA's lunar Gateway": "محطة Gateway القمرية التابعة لـNASA"
    };

    // Arabic copy for legacy English narrative fields; official technical names remain secondary where useful.
    var SATMAKER_AR_COPY = renderSatmakerCompanyArabic._arCopy || {
  "newspace-systems": {
    "history": "تأسست NewSpace Systems عام 2013 كمشروع مشترك بين مجموعة SCS Aerospace Group في جنوب أفريقيا ومجموعة SSBV الهولندية. ويقع مقرها في سومرست ويست قرب كيب تاون. وفي 2020 حصلت لأول مرة على استثمار مؤسسي من Schauenburg Ventures، فتسارع نموها. وهي اليوم أكبر مصنّع تجاري لمكوّنات المركبات الفضائية في أفريقيا، وقد حلّقت مكوّناتها في أكثر من 2,500 مهمة فضائية. وافتتحت في مارس 2026 مصنعاً جديداً بمساحة 5,200 م² في سومرست ويست. ووصلت بعض منتجاتها إلى القمر وما وراءه في النظام الشمسي.",
    "productHistory": "بدأت الشركة بحساسات الشمس ومقاييس المجال المغناطيسي، ثم أضافت عجلات ردّ الفعل وأجهزة الإرسال. وجعلها الإنتاج الكمي لقضبان العزم المغناطيسي من أكبر مورّدي هذا المكوّن عالمياً.",
    "customers": {
      "OneWeb": "شركة OneWeb",
      "NASA and ESA": "وكالتا NASA وESA",
      "Over 60 prime contractors": "أكثر من 60 مقاولاً رئيسياً",
      "Customers in 39 countries": "عملاء في 39 دولة"
    },
    "missions": {
      "Over 1,000 magnetorquer rods for the OneWeb constellation": "تزويد كوكبة OneWeb بأكثر من 1,000 قضيب للعزم المغناطيسي",
      "Parts that have flown on lunar and deep-space missions": "مكوّنات حلّقت في مهمات إلى القمر والفضاء السحيق",
      "Supporting national space agencies and commercial constellations": "دعم وكالات الفضاء الوطنية والكوكبات التجارية"
    },
    "plans": {
      "Mass production for next-generation constellations": "الإنتاج الكمي لكوكبات الجيل التالي",
      "Rad-hard magnetometers in development with Bartington": "تطوير مقاييس مجال مغناطيسي مقاومة للإشعاع بالتعاون مع Bartington",
      "Scaling output at the new 5,200 m² plant": "زيادة الإنتاج في المصنع الجديد ذي المساحة 5,200 م²"
    },
    "milestones": {
      "2013|Founded": [
        "التأسيس",
        "تأسست كمشروع مشترك بين SCS Aerospace Group في جنوب أفريقيا ومجموعة SSBV في هولندا."
      ],
      "2016|OneWeb deal": [
        "اتفاق OneWeb",
        "بدأ توريد قضبان العزم المغناطيسي لكوكبة OneWeb؛ وتجاوز مجموع ما سُلّم 1,000 وحدة."
      ],
      "2018|Global exports": [
        "توسّع التصدير",
        "وصل التصدير إلى 19 دولة في 5 قارات، مع زيادة القدرة التقنية بنسبة 25%."
      ],
      "2020|First corporate round": [
        "أول استثمار مؤسسي",
        "استثمرت Schauenburg؛ فارتفعت الإيرادات السنوية 72% وتجاوز عدد كبار العملاء 60 جهة."
      ],
      "2026|5,200 m² factory": [
        "افتتاح مصنع 5,200 م²",
        "افتُتح مصنع سومرست ويست الجديد، بعد سجل تجاوز 2,500 مهمة وامتداد النشاط إلى 39 دولة."
      ]
    },
    "products": {
      "Magnetorquer Rods": [
        "قضبان العزم المغناطيسي",
        "مشغّل مغناطيسي",
        "من أقمار CubeSat إلى أقمار الكوكبات",
        "كوكبة OneWeb ومئات الأقمار الأخرى",
        "تُنتج بكميات كبيرة على خط مخصص مع اختبارات شبه آلية. سُلّمت أكثر من 1,000 وحدة إلى OneWeb وحدها."
      ],
      "LIBRA Reaction Wheels": [
        "عجلات LIBRA لردّ الفعل",
        "عجلة ردّ فعل",
        "الأقمار الصغيرة والمتوسطة",
        "مهمات تجارية وعلمية في القارات الست",
        "عجلات دقيقة بإلكترونيات مدمجة لتثبيت الأقمار على المحاور الثلاثة."
      ],
      "AQUILA Sun Sensors": [
        "حساسات AQUILA للشمس",
        "حساس دقيق للشمس",
        "الأقمار الصناعية الصغيرة",
        "مئات الأقمار التابعة للعملاء",
        "حساس رقمي دقيق يحدد متجه الشمس ضمن حلقة التحكم بالاتجاه."
      ],
      "Tri-axial Magnetometers": [
        "مقاييس مغناطيسية ثلاثية المحاور",
        "حساس المجال المغناطيسي",
        "الأقمار الصغيرة والمتوسطة",
        "مهمات الوكالات الوطنية والقطاع التجاري",
        "مجموعة من مقاييس المجال المغناطيسي الدقيقة. ويجري تطوير جيل مقاوم للإشعاع بالتعاون مع Bartington Instruments البريطانية."
      ],
      "GPS Receivers & Transmitters": [
        "مستقبلات GPS وأجهزة الإرسال",
        "أنظمة الملاحة والاتصالات",
        "الأقمار الصناعية الصغيرة",
        "أقمار رصد الأرض وإنترنت الأشياء",
        "مستقبلات وهوائيات GPS، إلى جانب أجهزة إرسال بنطاقات S وX وKa لإرسال البيانات إلى الأرض."
      ]
    }
  },
  "cubespace": {
    "history": "نشأت CubeSpace في مختبر الأنظمة الإلكترونية بجامعة ستيلينبوش؛ وبدأ فريقها العمل داخل الجامعة عام 2013. ووصلت أول أنظمة للتحكم في اتجاه الأقمار إلى المدار عام 2014 على أقمار QB50 التمهيدية. تأسست الشركة رسمياً عام 2017 وتخصصت في تحديد الاتجاه والتحكم فيه. وقد حلّقت أكثر من 500 منظومة متكاملة و6,500 مكوّن ضمن ما يزيد على 470 مهمة. وتخدم أكثر من 300 عميل في أكثر من 30 دولة، ولها مكتب أوروبي في دبلن وموظفو مبيعات في دنفر.",
    "productHistory": "تحولت من مشروع جامعي إلى جهة رائدة في التحكم باتجاه الأقمار الصغيرة. وظهر خط Gen 2 عام 2022، موسعاً نطاق المنتجات من الأقمار النانوية إلى المصغّرة.",
    "customers": {
      "300+ customers in 30 countries": "أكثر من 300 عميل في 30 دولة",
      "University of Hawai'i": "جامعة هاواي (University of Hawai'i)",
      "Multiple commercial constellations": "كوكبات تجارية متعددة",
      "Microsat builders up to 400 kg": "مصنّعو أقمار مصغّرة تصل كتلتها إلى 400 كغ"
    },
    "missions": {
      "HyTI: the University of Hawai'i 6U CubeSat with a thermal imager; deployed from the ISS in 2024": "HyTI: قمر CubeSat بحجم 6U لجامعة هاواي، مزود بمصوّر حراري؛ أُطلق من ISS عام 2024",
      "A 2018 lunar-orbit mission flew CubeSpace components": "مهمة إلى مدار القمر عام 2018 استخدمت مكوّنات CubeSpace",
      "More than 10 commercial constellations fly the company's systems": "تستخدم أكثر من 10 كوكبات تجارية أنظمة الشركة"
    },
    "plans": {
      "Integrating Sodern's Auriga star tracker for higher pointing accuracy": "دمج متعقّب النجوم Auriga من Sodern لزيادة دقة التوجيه",
      "Extending the range to satellites of about 1 ton": "توسيع نطاق المنتجات ليشمل أقماراً تقارب كتلتها طناً واحداً",
      "Series production for constellations": "الإنتاج التسلسلي للكوكبات"
    },
    "milestones": {
      "2014|First flight": [
        "أول رحلة مدارية",
        "وصل نظامان للتحكم في الاتجاه إلى المدار على أقمار QB50 التمهيدية."
      ],
      "2017|Formal incorporation": [
        "التأسيس الرسمي",
        "انفصلت الشركة عن الجامعة؛ وكانت قد بدأت التسليم إلى جميع القارات بحلول ذلك العام."
      ],
      "2018|Reaching the Moon": [
        "الوصول إلى القمر",
        "عملت مكوّنات CubeADCS في مهمة إلى مدار القمر."
      ],
      "2022|Gen 2": [
        "جيل Gen 2",
        "أُطلق خط Gen 2 ودخلت الشركة سوق الأقمار المصغّرة."
      ],
      "2023|200 kg microsat": [
        "قمر مصغّر بكتلة 200 كغ",
        "سُلّم أول نظام ADCS لقمر كتلته 200 كغ، ووُسّع نطاق العجلات أيضاً."
      ],
      "2024|New facility": [
        "منشأة جديدة",
        "افتُتحت منشأة بمساحة 1,350 م² في ستيلينبوش، فازدادت الطاقة الإنتاجية إلى الضعف، ووُقّع عقد لنظام ADCS لقمر بكتلة 400 كغ."
      ]
    },
    "products": {
      "CubeADCS Gen 2": [
        "منظومة CubeADCS Gen 2",
        "وحدة ADCS متكاملة",
        "أقمار CubeSat من 1U إلى 16U وأقمار مصغّرة حتى 400 كغ",
        "مئات المهمات الأكاديمية والتجارية في أكثر من 30 دولة",
        "تجمع في وحدة معيارية ما يصل إلى أربع عجلات ردّ فعل وسبعة حساسات، مع الحاسوب وخوارزميات التحكم. وتتكيف الواجهات الميكانيكية والكهربائية مع منصة العميل."
      ],
      "CubeWheel Reaction Wheels": [
        "عجلات CubeWheel لردّ الفعل",
        "عجلة ردّ فعل",
        "من أقمار CubeSat إلى أقمار بكتلة 400 كغ",
        "في المدار منذ 2014؛ وسُلّمت مئات الوحدات",
        "عائلة عجلات بأحجام متعددة. وأُعلن عام 2023 عن توسيع المجموعة لتشمل الأقمار المصغّرة."
      ],
      "CubeSense Sensor": [
        "حساس CubeSense",
        "حساس دقيق للشمس والأرض",
        "الأقمار الصناعية الصغيرة",
        "في المدار منذ 2014 ضمن عشرات المهمات",
        "حساس قائم على الكاميرا يحدد متجه الشمس وأفق الأرض بدقة عالية."
      ],
      "CubeStar Star Tracker": [
        "متعقّب النجوم CubeStar",
        "متعقّب نجوم",
        "أقمار CubeSat والأقمار المصغّرة",
        "في المدار منذ 2018",
        "متعقّب نجوم مدمج للتوجيه الدقيق. وبالشراكة مع Sodern الفرنسية، يُدمج متعقّب Auriga أيضاً ضمن حزم الشركة."
      ],
      "CubeTorquer Magnetorquers": [
        "مغناطيسات CubeTorquer",
        "مشغّل مغناطيسي",
        "أقمار CubeSat",
        "في المدار منذ 2014؛ وسُلّمت مئات الوحدات",
        "قضبان وملفات مغناطيسية لإزالة الدوران والتحكم فيه بالاستفادة من المجال المغناطيسي للأرض."
      ]
    }
  },
  "kongsberg-space": {
    "history": "تعود جذور Kongsberg إلى عام 1814، وهي أقدم شركة صناعية في النرويج. ويُعد قسم الفضاء والمراقبة لديها أكبر مورّد للمعدات الفضائية إلى ESA في إسكندنافيا. وقد صنع آليات لمركبات الإطلاق والأقمار الصناعية لأكثر من 30 عاماً؛ فمن تصميمها آليات تثبيت معززات Ariane 5 وفصلها، كما تصنع نقطة التثبيت الأمامية لمعززات Ariane 6. وفي 2024 اشترت حصة قدرها 77% في NanoAvionics الليتوانية، فدخلت مجال تصنيع الأقمار المتكامل. وتمتلك أيضاً نصف شركة محطات الاتصالات الأرضية KSAT. وفي 2025 أكملت أول كوكبة مملوكة لها، N3X، في المدار.",
    "productHistory": "بدأت بقطع دقيقة لمركبات Ariane، ثم آليات الأقمار، وانتهت إلى تشغيل كوكبتها الخاصة. وأكمل الاستحواذ على NanoAvionics سلسلة القيمة.",
    "customers": {
      "ArianeGroup": "مجموعة ArianeGroup",
      "ESA": "وكالة الفضاء الأوروبية (ESA)",
      "Norwegian Armed Forces": "القوات المسلحة النرويجية",
      "SpinLaunch": "شركة SpinLaunch"
    },
    "missions": {
      "The N3X constellation: three ARVAKER microsats for Norwegian maritime surveillance and dark-vessel hunting": "كوكبة N3X: ثلاثة أقمار ARVAKER مصغّرة لمراقبة الملاحة البحرية النرويجية ورصد السفن المخفية",
      "Decades of booster attach mechanisms on the Ariane family": "عقود من آليات تثبيت المعززات على عائلة Ariane",
      "Pointing mechanisms on European science and observation satellites": "آليات توجيه على أقمار أوروبية للعلوم ورصد الأرض"
    },
    "plans": {
      "The Meridian in-orbit demonstrator in 2026 and production of 280 microsats": "عرض Meridian المداري عام 2026 وإنتاج 280 قمراً مصغّراً",
      "Forward booster attachments for Ariane 6's rising flight rate": "تجهيزات التثبيت الأمامية لمعززات Ariane 6 مع زيادة وتيرة الإطلاق",
      "Further surveillance constellations for global customers": "تطوير كوكبات مراقبة إضافية للعملاء حول العالم"
    },
    "milestones": {
      "1814|Industrial roots": [
        "الجذور الصناعية",
        "تأسس مصنع Kongsberg للأسلحة، وهو أقدم شركة صناعية في النرويج."
      ],
      "1996|Ariane 5": [
        "مركبة Ariane 5",
        "دخلت آليات تثبيت المعززات وفصلها الخدمة مع الرحلات الأولى لمركبة Ariane 5."
      ],
      "2024|NanoAvionics purchase": [
        "الاستحواذ على NanoAvionics",
        "اشترت الشركة حصة 77% ووقّعت عقد مراقبة بحرية لخمس سنوات مع القوات المسلحة النرويجية."
      ],
      "2025|First own satellite": [
        "أول قمر مملوك للشركة",
        "أُطلق ARVAKER 1 في مارس على متن Transporter-13؛ وهو أول قمر تملكه الشركة وتشغّله."
      ],
      "2025|N3X complete": [
        "اكتمال N3X",
        "أُطلق ARVAKER 2 و3 في يونيو على متن Transporter-14؛ وبلغ عدد المهمات الفضائية للعام عشرة."
      ],
      "2025|Meridian contract": [
        "عقد Meridian",
        "استثمار بقيمة 12 مليون دولار في SpinLaunch؛ وأصبحت NanoAvionics المورّد الحصري لـ280 قمراً مصغّراً."
      ]
    },
    "products": {
      "Booster Attach & Release Mechanisms": [
        "آليات تثبيت المعززات وفصلها",
        "آلية فصل لمركبة الإطلاق",
        "مركبتا Ariane 5 وAriane 6",
        "جميع رحلات Ariane 5 ونقطة التثبيت الأمامية لمعزز Ariane 6",
        "تثبت المعززات بالمرحلة المركزية أثناء الإطلاق. وعند الفصل تقطع شحنات نارية نقطتي التثبيت الأماميتين وست دعامات، محررةً المعزز بدقة."
      ],
      "Satellite Mechanisms": [
        "آليات الأقمار الصناعية",
        "آليات الدوران والتوجيه",
        "أقمار العلوم ورصد الأرض",
        "أقمار أوروبية للعلوم ورصد الأرض",
        "تشمل محركات ألواح الطاقة الشمسية وآليات توجيه الهوائيات وإلكترونيات تشغيلها. ويخفض التصميم المعياري والأجزاء المؤهلة مسبقاً التكلفة."
      ],
      "N3X Constellation": [
        "كوكبة N3X",
        "قمر مصغّر للمراقبة البحرية",
        "ثلاثة أقمار ARVAKER مصغّرة",
        "مراقبة الملاحة البحرية للقوات والوكالات النرويجية",
        "تستخدم منصات NanoAvionics MP42 مستقبل AIS وكاشف رادار ملاحي لرصد السفن المخفية من انبعاثاتها الرادارية."
      ],
      "Meridian Constellation Contract": [
        "عقد كوكبة Meridian",
        "إنتاج متسلسل للأقمار المصغّرة",
        "280 قمراً مصغّراً للاتصالات عريضة النطاق",
        "كوكبة Meridian عريضة النطاق التابعة لـSpinLaunch",
        "عقد بقيمة 122.5 مليون يورو مع NanoAvionics لإنتاج 280 قمراً مصغّراً ونموذجين أوليين. ويُخطط لعرض مداري عام 2026."
      ]
    }
  },
  "kawasaki-prop": {
    "history": "تأسست Kawasaki عام 1896 وبدأت صناعة الطائرات عام 1918. وفي مجال الفضاء برزت مع برنامج H-II؛ وفازت عام 1988 بأول عقد لصنع غطاء حمولة، وسلّمت أول غطاء عام 1993. ومنذ ذلك الحين أصبحت الجهة اليابانية الوحيدة لصناعة أغطية الحمولات. تُصنع الأغطية في منشآت Gifu وتُجمع في Harima. وصممت الشركة أيضاً مجمع إطلاق H-II في تانيغاشيما. كما صممت آلية الالتحام للقمر الاختباري ETS-VII، الذي نفّذ أول التحام ذاتي للمركبات الفضائية في العالم. واليوم تصنع أغطية H3 وEpsilon S، وتشارك في روبوتات وحدة Kibo.",
    "productHistory": "انتقلت من غطاء H-II إلى H-IIA وH-IIB وEpsilon ثم H3؛ ومعظم أغطية الحمولات اليابانية خلال العقود الثلاثة الماضية خرجت من منشآتها.",
    "customers": {
      "Mitsubishi Heavy Industries": "شركة Mitsubishi للصناعات الثقيلة (Mitsubishi Heavy Industries)",
      "JAXA": "وكالة استكشاف الفضاء اليابانية (JAXA)",
      "IHI Aerospace": "شركة IHI Aerospace"
    },
    "missions": {
      "Fairings for every H-IIA flight until the 2025 retirement and every H3 flight": "أغطية كل رحلات H-IIA حتى تقاعدها عام 2025، وكل رحلات H3",
      "The world's first autonomous docking with the ETS-VII mechanism in 1998": "أول التحام ذاتي في العالم بآلية ETS-VII عام 1998",
      "Fairings for the HTV cargo craft serving the ISS": "أغطية مركبة الشحن HTV المتجهة إلى ISS"
    },
    "plans": {
      "Fairing production for H3's rising flight rate": "زيادة إنتاج أغطية H3 لمواكبة ارتفاع وتيرة الإطلاق",
      "The fairing of the new Epsilon S launcher": "تصنيع غطاء مركبة الإطلاق الجديدة Epsilon S",
      "Research into reusable space transportation": "البحث في وسائل نقل فضائي قابلة لإعادة الاستخدام"
    },
    "milestones": {
      "1918|Aviation begins": [
        "بداية الطيران",
        "أصبحت Kawasaki إحدى أوائل شركات صناعة الطائرات في اليابان."
      ],
      "1988|First fairing contract": [
        "أول عقد لأغطية الحمولات",
        "فازت بعقد أغطية H-II ودخلت قطاع الفضاء."
      ],
      "1993|First delivery": [
        "أول تسليم",
        "سُلّم أول غطاء H-II؛ ومنذ ذلك الحين صنعت Kawasaki معظم أغطية الحمولات اليابانية."
      ],
      "1998|World's first autonomous docking": [
        "أول التحام ذاتي في العالم",
        "حققت آلية صنعتها Kawasaki التحاماً ذاتياً لمركبتين فضائيتين ضمن ETS-VII."
      ],
      "2003|USERS recovery": [
        "استعادة USERS",
        "استُعيدت كبسولة عودة مزودة بواقٍ حراري من Kawasaki سليمةً بعد عام في المدار."
      ],
      "2023|H3 fairing": [
        "غطاء H3",
        "دخل الجيل الجديد من الأغطية الخدمة مع أول رحلة لـH3؛ وتقاعدت H-IIA عام 2025."
      ]
    },
    "products": {
      "H3 Payload Fairing": [
        "غطاء حمولة H3",
        "غطاء حمولة مركّب",
        "مركبة الإطلاق الثقيلة H3",
        "جميع رحلات H3 منذ 2023",
        "هيكل خفيف من طبقات مركّبة على هيئة خلايا نحل؛ يُصنع في Gifu ويُجمع في Harima."
      ],
      "H-IIA/H-IIB & Epsilon Fairings": [
        "أغطية H-IIA وH-IIB وEpsilon",
        "غطاء حمولة",
        "مركبات الإطلاق الوطنية اليابانية",
        "رحلات استمرت ثلاثة عقود حتى تقاعد H-IIA عام 2025",
        "تصاميم بحمولة واحدة أو اثنتين وبقطر يصل إلى 4 أمتار. وصُنع غطاء مركبة الشحن HTV ضمن هذا الخط أيضاً."
      ],
      "Payload Attach Fittings & Structures": [
        "وصلات وهياكل تثبيت الحمولة",
        "هيكل ربط الحمولة",
        "عائلتا H-IIA وH3",
        "فصل الأقمار عن المرحلة العليا في كل عملية إطلاق",
        "حلقة التثبيت وآلية فصل القمر. ويشمل سجل الشركة أيضاً تصميم مجمع الإطلاق في تانيغاشيما."
      ],
      "Space Robotics & Kibo Hardware": [
        "روبوتات الفضاء وتجهيزات Kibo",
        "روبوتات وهياكل مدارية",
        "محطة الفضاء الدولية",
        "وحدة Kibo اليابانية والقمر الاختباري ETS-VII",
        "أتاحت آلية الالتحام في ETS-VII أول التحام ذاتي لمركبتين فضائيتين في العالم."
      ],
      "Reentry Systems": [
        "أنظمة العودة",
        "هيكل ودرع حراري",
        "الحمولات القابلة للاستعادة",
        "كبسولة الاختبار USERS؛ أُطلقت عام 2002 واستُعيدت عام 2003",
        "هيكل ودرع حراري لكبسولة تجارب الجاذبية الصغرى، استُعيدت من المحيط سليمةً."
      ]
    }
  },
  "comat": {
    "history": "تأسست Comat عام 1977 قرب تولوز، وبدأت بتجهيزات الرحلات المأهولة ومعدات تجارب الجاذبية الصغرى. وعلى مدى أربعة عقود صنعت آليات دقيقة لصالح CNES وESA وكبرى الشركات المتعاقدة. وحلّقت معداتها على عربة Curiosity ومحطة الفضاء الدولية. ويعمل لديها نحو 100 شخص وهي جزء من مجموعة Agora الصناعية. وفي أواخر العقد الثاني من الألفية أطلقت خط منتجاتها للأقمار الصغيرة، الذي يشمل عجلات ردّ الفعل والهوائيات القابلة للنشر والدفع الكهربائي. وتستخدم كوكبة Kinéis الفرنسية عجلاتها وهوائياتها.",
    "productHistory": "انتقلت من معدات مخصصة للمهمات العلمية إلى منتجات جاهزة للكوكبات؛ وصنعت وحدها 100 عجلة ردّ فعل لكوكبة Kinéis.",
    "customers": {
      "CNES and ESA": "وكالتا CNES وESA",
      "Airbus and Thales Alenia": "Airbus وThales Alenia",
      "Kinéis and Hemeria": "Kinéis وHemeria",
      "U-Space and Dhruva Space": "U-Space وDhruva Space"
    },
    "missions": {
      "Kinéis: one hundred wheels and 25 deployable antennas for Europe's first IoT constellation": "Kinéis: مئة عجلة و25 هوائياً قابلاً للنشر لأول كوكبة إنترنت أشياء أوروبية",
      "Hardware on the Curiosity rover and the International Space Station": "معدات على عربة Curiosity ومحطة الفضاء الدولية",
      "Battery radiators for 648+ OneWeb satellites": "مشعات بطاريات لأكثر من 648 قمراً من OneWeb"
    },
    "plans": {
      "Expanding wheel and antenna sales to defense and export markets": "توسيع مبيعات العجلات والهوائيات لأسواق الدفاع والتصدير",
      "Developing the next generation of plasma electric propulsion": "تطوير الجيل التالي من الدفع الكهربائي بالبلازما",
      "High-volume production for future constellations": "الإنتاج الكمي للكوكبات المستقبلية"
    },
    "milestones": {
      "1977|Founded": [
        "التأسيس",
        "بدأت الشركة قرب تولوز بصناعة معدات الرحلات المأهولة وتجارب الجاذبية الصغرى."
      ],
      "2012|Reaching Mars": [
        "الوصول إلى المريخ",
        "وصلت معدات Comat إلى المريخ على متن عربة Curiosity التابعة لـNASA."
      ],
      "2021|Kinéis antenna tests": [
        "اختبارات هوائيات Kinéis",
        "اجتازت الهوائيات الثلاثية القابلة للنشر اختبارات التحقق لدى CNES."
      ],
      "2023|Dhruva Space deal": [
        "اتفاق Dhruva Space",
        "اتفاق لتوريد عجلات ومحركات ألواح شمسية وألواح طاقة إلى الشركة الهندية."
      ],
      "2024|Kinéis launch": [
        "إطلاق Kinéis",
        "حلقت الأقمار الخمسة الأولى مزودة بعجلات وهوائيات من Comat."
      ],
      "2025|Busy year": [
        "عام حافل",
        "حلّق القمران Pandore وSOAP بدفع وعجلات من Comat؛ كما خدمت عجلاتها مهمة دفاعية أمريكية."
      ]
    },
    "products": {
      "RW20–RW60 Reaction Wheels": [
        "عجلات ردّ الفعل RW20–RW60",
        "عجلة ردّ فعل",
        "أقمار نانوية حتى أقمار بكتلة 500 كغ",
        "أقمار Kinéis الـ25 ومهمة دفاعية أمريكية مصنفة وعملاء حول العالم",
        "عائلة من ثلاثة أحجام بعزوم زخم مختلفة. أُنتجت 100 وحدة تسلسلياً لصالح Kinéis."
      ],
      "Deployable UHF-S Antennas": [
        "هوائيات UHF-S القابلة للنشر",
        "هوائي ذاتي النشر",
        "الأقمار النانوية",
        "أقمار Kinéis الـ25، كتلة كل منها 28 كغ",
        "تنتشر ذاتياً بعد دقائق من انفصال القمر عن الصاروخ. تصميم حاصل على براءة بالتعاون مع Cobham، وطُوّر اعتماداً على أبحاث CNES."
      ],
      "Pointing Mechanisms & SADM": [
        "آليات التوجيه وSADM",
        "آلية دقيقة",
        "أقمار العلوم والاتصالات",
        "برامج CNES وESA واتفاق مع Dhruva Space الهندية",
        "تشمل آليات التوجيه والمحركات الدوارة والأذرع القابلة للنشر ومضخات الفضاء، مستندة إلى خبرة هندسية دقيقة تمتد 40 عاماً."
      ],
      "Plasma Jet Pack Electric Propulsion": [
        "حزمة Plasma Jet Pack للدفع الكهربائي",
        "دافع كهربائي",
        "أقمار CubeSat والأقمار النانوية",
        "قمرا U-Space من فئة 12U، Pandore وSOAP، منذ 2025",
        "دافع بلازمي مدمج للمناورات الدقيقة. وحلّق على القمرين مع عجلات Comat."
      ],
      "OneWeb Battery Radiators": [
        "مشعات بطاريات OneWeb",
        "معدات للتحكم الحراري",
        "أقمار الكوكبات",
        "أكثر من 648 قمراً على منصة Arrow التابعة لـAirbus",
        "مشعّ بطاريات لخط Airbus الإنتاجي في تولوز، ودليل على قدرة Comat على إنتاج مكوّنات طيران بكميات كبيرة."
      ]
    }
  },
  "mt-aerospace": {
    "history": "تعود جذور الشركة إلى ذراع MAN التقنية عام 1969. ومنذ بداية برنامج Ariane وهي تصنع خزانات عائلة الصواريخ. وفي 2005 اشترتها OHB وشريك استثماري فتحولت إلى MT Aerospace. وصُنعت في أوغسبورغ خزانات الهيدروجين والأكسجين لمئة صاروخ Ariane 5، وافتُتحت خطوط إنتاج Ariane 6 الجديدة عام 2018. وتبلغ مساهمة الشركة نحو 10% من مركبة الإطلاق كاملة. كما أنشأت شركتها التابعة MT Mechatronics تجهيزات منصة الإطلاق في كورو. وفي أكتوبر 2025 أصبحت OHB المساهم الوحيد.",
    "productHistory": "من خزانات أولى مركبات Ariane إلى سبيكة الألومنيوم والليثيوم في Ariane 6 والخزانات المركّبة بلا بطانة الداخلية لمشروع PHOEBUS.",
    "customers": {
      "ArianeGroup": "مجموعة ArianeGroup",
      "ESA": "وكالة الفضاء الأوروبية (ESA)",
      "Boeing and NASA": "Boeing وNASA",
      "CNES": "وكالة الفضاء الفرنسية (CNES)"
    },
    "missions": {
      "Tanks for one hundred Ariane 5s and every Ariane 6 flight": "خزانات مئة مركبة Ariane 5 وكل رحلات Ariane 6",
      "Tank domes for the SLS Moon rocket's upper stage": "قباب خزانات للمرحلة العليا من صاروخ القمر SLS",
      "Building the mechanical facilities of the Ariane 6 pad at Kourou": "إنشاء التجهيزات الميكانيكية لمنصة Ariane 6 في كورو"
    },
    "plans": {
      "PHOEBUS composite tanks for Ariane 6 Block 2": "خزانات PHOEBUS المركّبة للنسخة Ariane 6 Block 2",
      "Series production for 27 rockets through flight 42": "الإنتاج المتسلسل لـ27 صاروخاً حتى الرحلة 42",
      "High-pressure tanks for light methane launchers": "خزانات ضغط عالٍ لمركبات الإطلاق الخفيفة العاملة بالميثان"
    },
    "milestones": {
      "1969|MAN roots": [
        "جذور MAN",
        "بدأ ذراع MAN التقني تصنيع هياكل الفضاء، وأصبح مورّد خزانات عائلة Ariane."
      ],
      "2005|MT Aerospace born": [
        "تأسيس MT Aerospace",
        "اشترت OHB وشريك استثماري الشركة من مجموعة MAN."
      ],
      "2018|Ariane 6 lines": [
        "خطوط Ariane 6",
        "افتُتحت منشآت حديثة في أوغسبورغ وشُحنت أول خزان هيدروجين لـAriane 6 إلى بريمن."
      ],
      "2022|PHOEBUS contract": [
        "عقد PHOEBUS",
        "وُقّع عقد بقيمة 35 مليون يورو لتطوير خزانات مركّبة للمرحلة العليا."
      ],
      "2024|Ariane 6 maiden flight": [
        "الرحلة الأولى لـAriane 6",
        "حلّقت خزانات وهياكل أوغسبورغ في الإطلاق التاريخي الأول."
      ],
      "2025|27-rocket series": [
        "سلسلة من 27 صاروخاً",
        "وُقّع عقد إنتاج للرحلات 16–42، وأصبحت OHB المالك الوحيد."
      ]
    },
    "products": {
      "Ariane 6 Cryogenic Tanks": [
        "خزانات Ariane 6 المبردة",
        "خزان مادة دافعة مبردة",
        "المراحل المركزية والعليا لـAriane 6",
        "كل رحلات Ariane 6؛ ويغطي عقد الإنتاج الرحلات 16 إلى 42",
        "سبيكة خفيفة من الألومنيوم والليثيوم بدقة تصل إلى عُشر المليمتر. تُشكّل الأجزاء في أوغسبورغ وتُلحم في بريمن."
      ],
      "Launcher Metallic Structures": [
        "هياكل معدنية لمركبات الإطلاق",
        "هياكل مؤهلة للطيران",
        "مركبة Ariane 6",
        "هياكل ما بين الخزانات، وأغطية المعززات الأمامية والخلفية، وأجزاء من محرك Vulcain 2.1",
        "تشكيل المعادن مع المعالجة الذكية بالطرق الكروي. ويضبط الذكاء الاصطناعي الضربات للحفاظ على الأداء وخفض التكلفة."
      ],
      "PHOEBUS Composite Tanks": [
        "خزانات PHOEBUS المركّبة",
        "خزان مركّب بلا بطانة",
        "المرحلة العليا من الجيل التالي لـAriane 6",
        "النسخة المستقبلية Ariane 6 Block 2",
        "خزانات هيدروجين وأكسجين مصنوعة بالكامل من ألياف الكربون ومن دون بطانة معدنية داخلية. وُقّع عقد بقيمة 35 مليون يورو مع ArianeGroup عام 2022."
      ],
      "NASA SLS Tank Domes": [
        "قباب خزانات NASA SLS",
        "مقاطع خزانات مبردة",
        "المرحلة العليا للاستكشاف في SLS",
        "صاروخ القمر التابع لـNASA ضمن برنامج Artemis",
        "مقاطع قبة خزان الهيدروجين للمرحلة العليا للاستكشاف، بطلب من Boeing. وتعزز المشروعَ شراكةٌ عبر الأطلسي لصالح أوغسبورغ."
      ],
      "Launch Pad Equipment": [
        "معدات منصة الإطلاق",
        "منشآت أرضية",
        "منصة Ariane 6 في كورو",
        "مجمع الإطلاق ELA-4 منذ 2024",
        "أنشأت الشركة التابعة MT Mechatronics التجهيزات الميكانيكية للمنصة لصالح وكالة الفضاء الفرنسية."
      ]
    }
  },
  "coaes": {
    "history": "تعود جذور الشركة إلى Cobham البريطانية التي تأسست عام 1934، وكان لها ذراع للإلكترونيات المتقدمة في الولايات المتحدة. وفي 2020 اشترى صندوق Advent شركة Cobham، وتحول الذراع إلى شركة أمريكية مستقلة باسم CAES. وفي 2023 فُصلت وحدة الأنظمة الفضائية وبِيعت لشركة أخرى، وتركز نشاط CAES على إلكترونيات الترددات الراديوية والدوائر الدقيقة المقاومة للإشعاع. ولدى مركزها للدوائر الدقيقة في كولورادو سبرينغز خبرة طويلة في تصنيع الدوائر المؤهلة للفضاء. واشترت Honeywell الشركة كاملة في أغسطس 2024 مقابل 1.9 مليار دولار؛ وكان لديها حينها 2,200 موظف و13 منشأة في أمريكا الشمالية.",
    "productHistory": "تطورت من إلكترونيات الطيران والفضاء لدى Cobham إلى دوائر فضائية مقاومة للإشعاع وإدارة إشارات الترددات الراديوية تحت مظلة Honeywell.",
    "customers": {
      "US Department of Defense": "وزارة الدفاع الأمريكية",
      "US satellite primes": "المقاولون الرئيسيون للأقمار الأمريكية",
      "Commercial new-space programs": "برامج الفضاء التجارية الناشئة"
    },
    "missions": {
      "Colorado Springs rad-hard microcircuits on US satellites": "دوائر دقيقة مقاومة للإشعاع من مركز كولورادو سبرينغز على أقمار أمريكية",
      "RF electronics on the F-35 fighter and SPY-6 radar": "إلكترونيات RF لمقاتلة F-35 ورادار SPY-6",
      "Antennas and positioning electronics for the satellite industry": "هوائيات وإلكترونيات تحديد الموقع لقطاع الأقمار الصناعية"
    },
    "plans": {
      "Full integration into Honeywell's space and defense portfolio": "الاندماج الكامل ضمن محفظة Honeywell للفضاء والدفاع",
      "Expanding rad-hard circuits for commercial new space": "توسيع الدوائر المقاومة للإشعاع لسوق الفضاء التجاري",
      "Advancing end-to-end RF signal management": "تطوير إدارة متكاملة لإشارات RF من طرف إلى طرف"
    },
    "milestones": {
      "1934|Cobham roots": [
        "جذور Cobham",
        "تأسست الشركة الأم البريطانية Cobham."
      ],
      "2020|US standalone": [
        "الاستقلال في الولايات المتحدة",
        "بعد شراء Advent لشركة Cobham، أصبح ذراع الإلكترونيات المتقدمة شركة CAES مستقلة."
      ],
      "2023|Space unit carve-out": [
        "فصل وحدة الفضاء",
        "بِيعت وحدة الأنظمة الفضائية إلى Veritas، وركزت الشركة على إلكترونيات RF."
      ],
      "2024|Honeywell deal": [
        "اتفاق Honeywell",
        "أُعلن في يونيو عن صفقة استحواذ بقيمة 1.9 مليار دولار."
      ],
      "2024|Joining Honeywell": [
        "الانضمام إلى Honeywell",
        "أُغلقت الصفقة في 30 أغسطس، وانتقل 2,200 موظف و13 منشأة إلى المالك الجديد."
      ]
    },
    "products": {
      "Radiation-hardened Microelectronics": [
        "إلكترونيات دقيقة مقاومة للإشعاع",
        "دوائر دقيقة مؤهلة للفضاء",
        "الأقمار الحكومية والتجارية",
        "أقمار أمريكية، من الأنظمة الاستراتيجية إلى الفضاء التجاري الناشئ",
        "دوائر محصّنة ضد إشعاع المدار. ولدى مركز كولورادو سبرينغز خبرة تمتد عقوداً في هذه التقنية."
      ],
      "RF Technologies & Antennas": [
        "تقنيات RF والهوائيات",
        "إلكترونيات الترددات الراديوية (RF)",
        "الأقمار والمنصات الدفاعية",
        "أقمار الاتصالات وأنظمة الرادار",
        "هوائيات وسلسلة متكاملة لإدارة إشارات RF، من المستقبل إلى جهاز الإرسال."
      ],
      "Satellite Positioning Electronics": [
        "إلكترونيات تحديد موقع الأقمار",
        "إلكترونيات الأقمار الصناعية",
        "الأقمار التجارية والحكومية",
        "الأقمار الأمريكية وقطاع الطيران والفضاء الأوسع",
        "أنظمة تحديد الموقع ومنتجات كهربائية عالية الاعتمادية ومؤهلة للطيران."
      ],
      "Defense Platform Electronics": [
        "إلكترونيات المنصات الدفاعية",
        "إلكترونيات دفاعية",
        "الطائرات والصواريخ والرادارات",
        "مقاتلات F-35 وصواريخ AMRAAM ورادار SPY-6 البحري",
        "إلكترونيات RF لمنصات الدفاع الأمريكية الحيوية؛ ويأتي منها الجزء الأكبر من إيرادات الشركة."
      ]
    }
  },
  "apco-technologies": {
    "history": "أسس أندريه بوجان APCO عام 1992 في فيفي بسويسرا. وافتتحت الشركة مكتباً في كورو عام 1997، لتصبح أول شركة سويسرية لها موظفون دائمون في ميناء الفضاء الأوروبي. وانتقلت عام 2008 إلى منشآت صُممت خصيصاً لها في إيغل. وافتُتحت عام 2018 قاعة إنتاج سابعة مخصصة لـAriane 6. وتدير اليوم ورشاً بمساحة تقارب 12,000 م² تضم غرفاً نظيفة، فيما يجري الإنتاج كله في سويسرا. ويعمل لديها أكثر من 400 شخص في سويسرا وفرنسا وغويانا الفرنسية. وما زالت مملوكة لعائلة بوجان؛ وتتولى أود بوجان، من الجيل الثاني، منصب الرئيسة التنفيذية منذ 2017.",
    "productHistory": "بدأت بمعدات الدعم الأرضي لمركبات الإطلاق، ثم توسعت تدريجياً إلى هياكل الطيران. وتشارك اليوم في مركبات الإطلاق وأقمار العلوم الأوروبية.",
    "customers": {
      "ESA": "وكالة الفضاء الأوروبية (ESA)",
      "ArianeGroup": "مجموعة ArianeGroup",
      "Europe's satellite primes": "المقاولون الرئيسيون للأقمار الأوروبية",
      "Vega and US launcher programs": "برامج مركبات Vega والإطلاق الأمريكية"
    },
    "missions": {
      "Ariane 6 upper and lower booster attachments and nose caps on every flight": "وصلات المعززات العلوية والسفلية وأغطية المقدمة في كل رحلة لـAriane 6",
      "Structures for Biomass and Meteosat Third Generation": "هياكل لمهمتي Biomass وMeteosat الجيل الثالث",
      "Door mechanisms for Euclid's camera and Solar Orbiter's SPICE": "آليات أبواب كاميرا Euclid وأداة SPICE على Solar Orbiter"
    },
    "plans": {
      "Series production of booster attachments for Ariane 6's rising flight rate": "إنتاج متسلسل لوصلات المعززات لمواكبة ارتفاع وتيرة رحلات Ariane 6",
      "More satellite structures for Europe's Earth observation missions": "تصنيع مزيد من هياكل أقمار رصد الأرض الأوروبية",
      "Continued payload processing services at Kourou": "مواصلة خدمات تجهيز الحمولات في كورو"
    },
    "milestones": {
      "1992|Founded": [
        "التأسيس",
        "أسس أندريه بوجان الشركة في فيفي بسويسرا."
      ],
      "1997|Kourou presence": [
        "الحضور في كورو",
        "أصبحت أول شركة سويسرية بموظفين دائمين في ميناء الفضاء الأوروبي."
      ],
      "2008|Move to Aigle": [
        "الانتقال إلى إيغل",
        "افتُتحت منشآت صُممت خصيصاً للشركة في إيغل، وتوسعت مراراً منذ ذلك الحين."
      ],
      "2017|Second generation": [
        "الجيل الثاني",
        "أصبحت أود بوجان الرئيسة التنفيذية بعد أن شغلت منصب المديرة المالية ثمانية أعوام."
      ],
      "2018|Ariane 6 hall": [
        "قاعة Ariane 6",
        "دخلت قاعة الإنتاج السابعة المخصصة لـAriane 6 الخدمة، وبلغت مساحة الورش نحو 12,000 م²."
      ],
      "2024|Ariane 6 maiden flight": [
        "الرحلة الأولى لـAriane 6",
        "خدمت وصلات المعززات وأغطية المقدمة ومعدات الدعم الأرضي من APCO الرحلة الأولى."
      ]
    },
    "products": {
      "Ariane 6 Booster Attachments & Nose Cap": [
        "وصلات معززات Ariane 6 وغطاء المقدمة",
        "هيكل طيران لمركبة الإطلاق",
        "Ariane 6 بمعززين أو أربعة",
        "كل رحلات Ariane 6 منذ 2024",
        "تشمل وصلات المعززات الصلبة العلوية والسفلية وأغطية مقدمتها. ويوفر كل معزز قوة دفع تعادل أكثر من 35 محركاً نفاثاً."
      ],
      "Satellite Structures": [
        "هياكل الأقمار الصناعية",
        "هياكل وألواح أساسية",
        "أقمار رصد الأرض والاتصالات",
        "Biomass وMTG وSentinel-5P وغيرها",
        "هياكل خفيفة معدنية ومركّبة مع التوصيلات والتحكم الحراري، تُسلّم متكاملة إلى المقاولين الأوروبيين الرئيسيين."
      ],
      "Science Instrument Structures & Mechanisms": [
        "هياكل وآليات أجهزة العلوم",
        "هياكل لأجهزة دقيقة",
        "المهمات العلمية الأوروبية",
        "Euclid وEarthCARE وSolar Orbiter وSentinel-2 وSentinel-3",
        "هياكل للأجهزة وضفائر توصيل وتحكم حراري. كما صممت هذه الوحدة آليات أبواب كاميرا Euclid وأداة SPICE على Solar Orbiter."
      ],
      "Mechanical Ground Support Equipment": [
        "معدات الدعم الأرضي الميكانيكية",
        "معدات أرضية",
        "مركبات الإطلاق والأقمار الكبيرة",
        "Ariane 6 وVega وSoyuz وVulcan وAtlas 5، وأقمار مثل JUICE وEuclid",
        "حاويات نقل مضبوطة المناخ من أوروبا إلى كورو، ورصيف تغليف الحمولات ومقطورة الهياكل المركّبة العليا."
      ],
      "Kourou Spaceport Services": [
        "خدمات ميناء كورو الفضائي",
        "التشغيل والصيانة",
        "ميناء الفضاء الأوروبي",
        "منشآت تجهيز الحمولات منذ 1997",
        "تشغيل معدات تجهيز الحمولات وصيانتها في غويانا الفرنسية، بفضل وجود موظفين دائمين."
      ]
    }
  },
  "airbus-space": {
    "history": "تأسست Airbus Defence and Space عام 2014 بدمج وحدتي الفضاء والدفاع في مجموعة Airbus، مستندةً إلى إرث Astrium ورواد صناعة الفضاء الأوروبية. ويتركز تصنيع الأقمار في تولوز. وصنعت الشركة كامل الجيل الأول من أسطول OneWeb، كما أرسلت عائلة Eurostar عشرات أقمار الاتصالات الثقيلة إلى المدار. وفي ديسمبر 2024 فازت بطلب من Eutelsat لإنتاج 100 قمر إضافي لـOneWeb. وارتفع الطلب عام 2026 بمقدار 340 قمراً ليصل إلى 440، وافتُتح خط إنتاج تسلسلي جديد في تولوز. ومن المخطط أن تندمج أذرع الأقمار لدى Airbus وThales وLeonardo في مشروع مشترك واحد ابتداءً من 2027.",
    "productHistory": "انتقلت من عائلة Eurostar التقليدية إلى Eurostar Neo، ثم إلى OneSat القابل لإعادة التهيئة بالبرمجيات وإنتاج الأقمار للكوكبات على نطاق واسع.",
    "customers": {
      "Eutelsat and OneWeb": "Eutelsat وOneWeb",
      "ESA": "وكالة الفضاء الأوروبية (ESA)",
      "Inmarsat and global operators": "Inmarsat ومشغّلون عالميون",
      "European governments": "حكومات أوروبية"
    },
    "missions": {
      "Building the entire first OneWeb generation; 600+ satellites": "تصنيع كامل الجيل الأول من OneWeb، بأكثر من 600 قمر",
      "Prime contractor on several Copernicus Sentinel satellites": "المقاول الرئيسي لعدة أقمار Sentinel ضمن برنامج Copernicus",
      "Eurostar Neo under ESA's Neosat partnership project": "منصة Eurostar Neo ضمن شراكة Neosat مع ESA"
    },
    "plans": {
      "Delivering 440 next-gen OneWeb satellites from late 2026": "تسليم 440 قمراً من الجيل التالي لـOneWeb ابتداءً من أواخر 2026",
      "Building the first IRIS2 layer platforms by 2029": "بناء منصات الطبقة الأولى من IRIS2 بحلول 2029",
      "The Bromo joint venture with Thales and Leonardo from 2027": "إطلاق المشروع المشترك Bromo مع Thales وLeonardo ابتداءً من 2027"
    },
    "milestones": {
      "2014|Company formed": [
        "تأسيس الشركة",
        "اندماج وحدات الفضاء التابعة لمجموعة Airbus، مع انتقال إرث Astrium إليها."
      ],
      "2019|OneWeb fleet": [
        "أسطول OneWeb",
        "بدأ الإنتاج التسلسلي للجيل الأول من OneWeb؛ ووصل العدد النهائي إلى أكثر من 600 قمر."
      ],
      "2022|First Eurostar Neo": [
        "أول Eurostar Neo",
        "وصل Hotbird 13F إلى المدار بعد اختبارات كاملة في تولوز."
      ],
      "2024|100-satellite deal": [
        "عقد 100 قمر",
        "أسندت Eutelsat إلى Airbus توسيع أسطول OneWeb، مع بدء التسليم أواخر 2026."
      ],
      "2026|Jump to 440": [
        "التوسع إلى 440 قمراً",
        "أُضيف طلب لـ340 قمراً، وافتُتح خط إنتاج جديد في تولوز، وسُلّمت أول 32 وحدة."
      ],
      "2026|IRIS2 platforms": [
        "منصات IRIS2",
        "عقد لبناء ما لا يقل عن 66 قمراً من كوكبة أوروبا السيادية ودمجها."
      ]
    },
    "products": {
      "Eurostar Neo": [
        "منصة Eurostar Neo",
        "منصة اتصالات للمدار الثابت (GEO)",
        "أقمار اتصالات ثقيلة",
        "قمرا Eutelsat Hotbird 13F و13G منذ 2022",
        "جيل جديد طُوّر ضمن شراكة Neosat مع ESA. وأثبتت 16 طلبية لـNeosat قدرة أوروبا التنافسية."
      ],
      "OneSat": [
        "قمر OneSat",
        "قمر اتصالات معرّف بالبرمجيات",
        "اتصالات قابلة لإعادة التهيئة",
        "طلبيات من عدة مشغّلين دوليين",
        "يمكن ضبط التغطية والسعة والتردد من المدار؛ وهو استجابة Airbus لسوق سريع التغير."
      ],
      "OneWeb Series & Arrow Platform": [
        "إنتاج OneWeb ومنصة Arrow",
        "قمر صغير للكوكبات",
        "مدار أرضي منخفض (LEO)؛ إنتاج تسلسلي",
        "أكثر من 600 قمر من الجيل الأول و440 من الجيل التالي قيد الطلب",
        "صُممت منصة Arrow للإنتاج الكمي. ويضيف الجيل الجديد تكامل 5G وبنية متوافقة مع IRIS2."
      ],
      "Earth Observation Satellites": [
        "أقمار رصد الأرض",
        "أقمار للرصد والعلوم",
        "من Pléiades Neo إلى أقمار Sentinel",
        "برنامج Copernicus الأوروبي والعملاء الحكوميون",
        "المقاول الرئيسي لعدة أقمار Sentinel، ومصنّع كوكبة Pléiades Neo التجارية بدقة 30 سم."
      ],
      "IRIS2 Platforms": [
        "منصات IRIS2",
        "قمر لكوكبة سيادية",
        "الطبقة الأولى؛ 66 قمراً على الأقل",
        "كوكبة أوروبا الآمنة؛ التسليم ابتداءً من 2029",
        "بموجب عقد سبتمبر 2026، تصنع Airbus المنصات وتدمج حمولات Thales."
      ]
    }
  },
  "thales-alenia": {
    "history": "تأسست Thales Alenia Space عام 2007 من الشركة السابقة Alcatel Alenia؛ وتمتلك Thales الفرنسية 67% منها وLeonardo الإيطالية 33%. ويقع مقرها في كان ويعمل لديها نحو 8,500 موظف. وصنعت عدة وحدات مضغوطة لمحطة الفضاء الدولية، منها القبة الشهيرة Cupola ومختبر Columbus. ومنذ 1977 تولت دور المقاول الرئيسي لسبعة عشر قمراً للأرصاد من عائلة Meteosat، وظلت سنوات في صدارة سوق اتصالات GEO الأوروبية. كما تصنع هياكل الضغط لمركبات الشحن Cygnus. وفي 2026 تعاقدت على حمولات الاتصالات لـ330 قمراً من IRIS2، وتتولى أيضاً القيادة الصناعية لعربة ExoMars الجوالة.",
    "productHistory": "من Spacebus التقليدية إلى Spacebus Neo، ثم Space Inspire القابل لإعادة التهيئة من المدار.",
    "customers": {
      "ESA and EUMETSAT": "وكالتا ESA وEUMETSAT",
      "Eutelsat and global operators": "Eutelsat ومشغّلون عالميون",
      "NASA and Northrop Grumman": "NASA وNorthrop Grumman",
      "European governments": "حكومات أوروبية"
    },
    "missions": {
      "The ISS Cupola plus Harmony, Tranquility and Columbus": "قبة Cupola ووحدات Harmony وTranquility وColumbus في محطة الفضاء الدولية",
      "Seventeen Meteosat satellites since 1977": "17 قمراً من Meteosat منذ 1977",
      "The SWOT satellite revolutionizing oceanography with NASA and CNES": "القمر SWOT الذي أحدث نقلة في علم المحيطات بالتعاون مع NASA وCNES"
    },
    "plans": {
      "Delivering payloads for the 330 IRIS2 satellites": "تسليم حمولات لـ330 قمراً من IRIS2",
      "Completing Italy's IRIDE constellation with 13 satellites": "استكمال كوكبة IRIDE الإيطالية المكوّنة من 13 قمراً",
      "Launching the ExoMars rover in 2028; the Bromo merger from 2027": "إطلاق عربة ExoMars عام 2028 وبدء اندماج Bromo عام 2027"
    },
    "milestones": {
      "2007|Joint venture formed": [
        "تأسيس المشروع المشترك",
        "استحوذت Thales على حصة Alcatel، وبدأت بذلك Thales Alenia Space."
      ],
      "2010|Cupola delivered": [
        "تسليم Cupola",
        "وصلت القبة الشهيرة ذات النوافذ السبع إلى المدار."
      ],
      "2022|Record year": [
        "عام قياسي",
        "أُطلقت Konnect VHTS وأول مصوّر MTG وقمر SWOT لدراسة المحيطات."
      ],
      "2026|IRIS2 payloads": [
        "حمولات IRIS2",
        "وُقّع عقد لتوريد حمولات لـ330 قمراً؛ وأُطلق أيضاً Sentinel-3C وFLEX."
      ],
      "2026|Sentinel NG prime": [
        "المقاول الرئيسي لـSentinel NG",
        "حصلت الشركة على عقد المرحلة الأولى من ESA لقمرين من الجيل التالي لـSentinel-1."
      ],
      "2028|ExoMars ahead": [
        "الاستعداد لـExoMars",
        "تنطلق عربة أوروبا الجوالة، تحت القيادة الصناعية للشركة، من فلوريدا."
      ]
    },
    "products": {
      "Space Inspire": [
        "قمر Space Inspire",
        "قمر اتصالات معرّف بالبرمجيات",
        "مدار ثابت (GEO)؛ تصميم مدمج",
        "طلبيات مستمرة منذ 2022؛ وعقد Es'hailSat القطري عام 2026",
        "يعيد توزيع السعة والتغطية من المدار، عبر أي نطاق ترددي."
      ],
      "Spacebus Neo": [
        "منصة Spacebus Neo",
        "منصة اتصالات عالية السعة",
        "مدار ثابت (GEO)؛ دفع كهربائي",
        "Eutelsat Konnect VHTS، أقوى قمر أوروبي عام 2022",
        "صُممت لتوفير إنترنت سريع واسع التغطية، بما في ذلك المناطق الأوروبية غير المخدومة."
      ],
      "Meteosat Weather Satellites": [
        "أقمار Meteosat للأرصاد",
        "أرصاد جوية من المدار الثابت (GEO)",
        "ثلاثة أجيال؛ 17 قمراً",
        "يتواصل نشر الجيل الثالث؛ وأُطلق المصوّر الثاني في يوليو 2026",
        "المقاول الرئيسي منذ أول قمر Meteosat عام 1977 وحتى الأقمار الستة للجيل الثالث."
      ],
      "ISS Pressurized Modules": [
        "وحدات مضغوطة لمحطة الفضاء الدولية",
        "هياكل مأهولة",
        "محطة الفضاء الدولية",
        "Cupola وHarmony وTranquility وColumbus وهياكل ضغط Cygnus",
        "ثاني أكبر مورّد صناعي للمحطة بعد Boeing. وما زالت جميع هياكل Cygnus تُصنع في تورينو."
      ],
      "IRIS2 Payloads": [
        "حمولات IRIS2",
        "حمولات اتصالات آمنة",
        "330 قمراً في المدار الأرضي المنخفض (LEO)",
        "كوكبة أوروبا السيادية؛ حزمة بنحو 500 مليون يورو",
        "تورّد جميع حمولات Ka الحكومية والحمولات المزدوجة Ku/Ka."
      ]
    }
  },
  "ohb": {
    "history": "بدأت جذور OHB في متجر لمعدات الملاحة البحرية في بريمن لم يتجاوز موظفوه خمسة أشخاص. واشترته عائلة Fuchs عام 1981 ووجهته نحو الفضاء. وحلّق القمر الصغير BremSat على مكوك Discovery عام 1994. وتمثلت رؤية مانفرد Fuchs في أقمار أصغر وأقل تكلفة. واشترت الشركة MT Aerospace عام 2005، وفازت بعقد SmallGEO من ESA عام 2007. وفي 2010 فازت بعقد قيمته 566 مليون يورو لإنتاج 14 قمراً من Galileo؛ وانتهى بها الأمر إلى تصنيع الأقمار الـ34 للجيل التشغيلي الأول. ويعمل لديها اليوم نحو 3,600 موظف في 15 موقعاً، وتجاوزت إيراداتها 1.2 مليار يورو عام 2025. وما زالت عائلة Fuchs تقود الشركة.",
    "productHistory": "انتقلت من أقمار جامعية صغيرة إلى الملاحة عبر Galileo، ثم أقمار الطقس من الجيل الثالث وأقمار الاستطلاع الراداري.",
    "customers": {
      "ESA": "وكالة الفضاء الأوروبية (ESA)",
      "The German government and military": "الحكومة والجيش الألمانيان",
      "EUMETSAT": "منظمة EUMETSAT",
      "Hispasat and operators": "Hispasat ومشغّلون آخرون"
    },
    "missions": {
      "All 34 first-generation operational Galileo satellites": "جميع أقمار Galileo التشغيلية الـ34 من الجيل الأول",
      "The platforms of Europe's third-generation weather satellites": "منصات أقمار الطقس الأوروبية من الجيل الثالث",
      "The SARah radar reconnaissance system for the German military": "منظومة الاستطلاع الراداري SARah للجيش الألماني"
    },
    "plans": {
      "Completing deployment of the six MTG satellites": "استكمال نشر الأقمار الستة من MTG",
      "Competing in Galileo's second generation and Europe's security programs": "المنافسة على الجيل الثاني من Galileo وبرامج الأمن الأوروبية",
      "Expanding production with full MT Aerospace ownership since 2025": "توسيع الإنتاج بعد تملك MT Aerospace بالكامل منذ 2025"
    },
    "milestones": {
      "1981|The Fuchs family arrives": [
        "وصول عائلة Fuchs",
        "اشترت Christa Fuchs المتجر الصغير في بريمن، وبدأ مسار الشركة في الفضاء."
      ],
      "1994|BremSat in orbit": [
        "BremSat في المدار",
        "حلّق أحد أوائل الأقمار الألمانية الصغيرة على متن مكوك Discovery."
      ],
      "2005|MT Aerospace purchase": [
        "الاستحواذ على MT Aerospace",
        "انضمت إلى المجموعة الشركة المصنّعة لخزانات عائلة Ariane."
      ],
      "2010|Galileo contract": [
        "عقد Galileo",
        "عقد بقيمة 566 مليون يورو لإنتاج 14 قمراً؛ ثم تولت الشركة تصنيع أقمار الجيل الأول الـ34 جميعها."
      ],
      "2017|First SmallGEO": [
        "أول SmallGEO",
        "وصل القمر Hispasat 36W-1 إلى المدار، مثبتاً نجاح المنصة المعيارية."
      ],
      "2022|EnMAP launched": [
        "إطلاق EnMAP",
        "دخل قمر ألمانيا فائق الأطياف الخدمة بعد سنوات من التطوير."
      ]
    },
    "products": {
      "Galileo FOC Satellites": [
        "أقمار Galileo التشغيلية",
        "قمر ملاحي",
        "34 قمراً في مدار متوسط الارتفاع (MEO)",
        "العمود الفقري لنظام الملاحة الأوروبي",
        "تولت OHB المقاولة الرئيسية، فيما صنعت SSTL حمولات الملاحة."
      ],
      "SmallGEO Platform": [
        "منصة SmallGEO",
        "منصة معيارية للمدار الثابت (GEO)",
        "فئة 3 أطنان",
        "Hispasat 36W-1 وقمر الترحيل EDRS-C والقمر Heinrich Hertz",
        "يقلل التصميم المعياري زمن الدمج؛ وجاء الطراز Electra بنظام دفع كهربائي بالكامل."
      ],
      "Meteosat Third Generation": [
        "أقمار Meteosat من الجيل الثالث",
        "أرصاد جوية من المدار الثابت (GEO)",
        "ستة أقمار بالتعاون مع Thales Alenia",
        "التنبؤ بالطقس في أوروبا حتى أربعينيات هذا القرن",
        "تُبنى المنصات في بريمن والأجهزة ضمن شراكة أوروبية."
      ],
      "Earth Observation & EnMAP": [
        "رصد الأرض وقمر EnMAP",
        "أقمار رصد علمي",
        "الأقمار الوطنية الألمانية",
        "EnMAP فائق الأطياف منذ 2022 وقمر الطقس القطبي السويدي",
        "يرصد EnMAP التركيب الكيميائي لسطح الأرض من المدار؛ وصنعت OHB Sweden قمر الطقس القطبي."
      ],
      "SARah Reconnaissance": [
        "نظام الاستطلاع SARah",
        "قمر راداري عسكري",
        "منظومة من ثلاثة أقمار",
        "استطلاع الجيش الألماني وخلافة SAR-Lupe",
        "فازت الشركة عام 2013 بالعقد الرئيسي لتطوير الجيل التالي من الاستطلاع الراداري الألماني."
      ]
    }
  },
  "maxar": {
    "history": "يرجع إرث Maxar في تصنيع الأقمار إلى Space Systems/Loral في بالو ألتو وخبرتها الممتدة عقوداً. وظهر اسم Maxar عام 2017 بعد اندماج شركات. وتُعد منصة 1300 من أكثر منصات GEO مبيعاً في التاريخ. وفي 2019 عهدت NASA إلى الشركة بتصنيع أول عنصر لمحطة Gateway القمرية. واشترى صندوق Advent الشركة وحولها إلى ملكية خاصة عام 2023 مقابل نحو 6.4 مليارات دولار. وفي العام نفسه انقسمت إلى وحدة لتصنيع الأقمار في بالو ألتو وأخرى للتصوير في كولورادو. وأُطلقت كوكبة WorldView Legion بدقة 30 سم ابتداءً من 2024، واكتملت الدفعة الأولى عام 2025.",
    "productHistory": "من أقمار GEO العملاقة على منصة 1300 إلى منصة Legion المتوسطة وأقمار أصغر لكوكبات الدفاع.",
    "customers": {
      "NASA": "وكالة NASA",
      "SES and Intelsat": "SES وIntelsat",
      "US defense primes": "المقاولون الرئيسيون للدفاع الأمريكي",
      "Global operators": "مشغّلون حول العالم"
    },
    "missions": {
      "The Gateway Power and Propulsion Element; the lunar station's first piece": "عنصر الطاقة والدفع لمحطة Gateway؛ أول مكوّن للمحطة القمرية",
      "The 30 cm WorldView Legion constellation": "كوكبة WorldView Legion بدقة 30 سم",
      "Dozens of 1300-series satellites in global fleets": "عشرات الأقمار من سلسلة 1300 ضمن الأساطيل العالمية"
    },
    "plans": {
      "Delivering and launching the Gateway PPE": "تسليم وإطلاق عنصر PPE لمحطة Gateway",
      "Selling the 500 bus into imaging and defense markets": "تسويق منصة 500 لأسواق التصوير والدفاع",
      "Raising the production rate of small constellation buses": "زيادة معدل إنتاج منصات الأقمار الصغيرة للكوكبات"
    },
    "milestones": {
      "1957|Palo Alto heritage": [
        "إرث بالو ألتو",
        "تعود جذور المصنع إلى فجر عصر الفضاء وشركة Space Systems/Loral."
      ],
      "2017|The Maxar name": [
        "ظهور اسم Maxar",
        "تأسست الشركة نتيجة اندماج عدة شركات للفضاء والتصوير."
      ],
      "2019|Gateway contract": [
        "عقد Gateway",
        "عهدت NASA إلى الشركة بتصنيع أول عنصر للمحطة القمرية مقابل 375 مليون دولار."
      ],
      "2023|Private and split": [
        "التحول إلى الملكية الخاصة والانقسام",
        "اشترى Advent الشركة مقابل 6.4 مليارات دولار، وأصبح تصنيع الأقمار وحدة مستقلة."
      ],
      "2024|Legion launch": [
        "إطلاق Legion",
        "وصلت أول أقمار WorldView Legion إلى المدار على صاروخ Falcon 9."
      ],
      "2025|Block 1 complete": [
        "اكتمال الدفعة الأولى",
        "أُطلق آخر زوج من أقمار Legion في فبراير، وأصبحت الأقمار الستة تشغيلية."
      ]
    },
    "products": {
      "Maxar 1300 Bus": [
        "منصة Maxar 1300",
        "منصة GEO للاتصالات",
        "أقمار ثقيلة",
        "أساطيل SES وIntelsat ومشغّلين عالميين",
        "من أكثر المنصات استخداماً في التاريخ، بخبرة تمتد عقوداً ونسخ تعمل بالدفع الكهربائي."
      ],
      "Gateway Power & Propulsion Element": [
        "عنصر الطاقة والدفع لمحطة Gateway",
        "مركبة فضائية عالية القدرة بالدفع الكهربائي",
        "محطة Gateway القمرية التابعة لـNASA",
        "أول عنصر في Gateway ضمن برنامج Artemis",
        "مبني على منصة 1300 ومزوّد بدفع كهربائي قوي. وُقّع عقد بقيمة 375 مليون دولار عام 2019."
      ],
      "Maxar 500 & Legion Bus": [
        "منصتا Maxar 500 وLegion",
        "منصة تصوير متوسطة",
        "مدارات أرضية منخفضة ومتوسطة",
        "أقمار WorldView Legion الستة بدقة 30 سم",
        "صُممت لإتاحة ما يصل إلى 15 زيارة تصوير يومياً، وتُطرح الآن أيضاً لقطاع الدفاع."
      ],
      "Small Constellation Buses": [
        "منصات الأقمار الصغيرة للكوكبات",
        "منصة صغيرة للمدار الأرضي المنخفض",
        "كوكبات دفاعية واسعة الانتشار",
        "أقمار تتبع الصواريخ للمقاولين الرئيسيين للدفاع الأمريكي",
        "تصل القدرة الإنتاجية في بالو ألتو إلى منصتين شهرياً، ثم تُرسل المنصات إلى خطوط تجميع الشركاء."
      ]
    }
  },
  "sstl": {
    "history": "في جامعة سري، طرح مارتن سويتينغ فكرة جريئة: تصنيع أقمار باستخدام مكوّنات تجارية عادية. وحلّق القمر UoSAT-1 عام 1981 من ركن في مختبر جامعي، وعمل خمس سنوات بعد العمر التصميمي. وانفصلت الشركة عن الجامعة عام 1985. ومنذ ذلك الحين صنعت أكثر من 70 قمراً لـ22 دولة. وكان القمر GIOVE-A، أول أقمار Galileo، من صنعها. وبين 2010 و2020 سلّمت حمولات الملاحة للأقمار الـ34 من الجيل الأول للنظام. وأصبحت تابعة لـAirbus منذ 2009 مع احتفاظها بهويتها. ومن المفارقات أن Elon Musk امتلك حصة صغيرة فيها عام 2004، ثم اشترتها Airbus لاحقاً.",
    "productHistory": "انتقلت من أقمار جامعية مصغّرة إلى كوكبة مراقبة الكوارث وحمولات Galileo، وصولاً إلى الاتصالات القمرية.",
    "customers": {
      "ESA": "وكالة الفضاء الأوروبية (ESA)",
      "NASA": "وكالة NASA",
      "Governments of 22 countries": "حكومات 22 دولة",
      "OHB (Galileo payloads)": "OHB (حمولات Galileo)"
    },
    "missions": {
      "GIOVE-A: the first Galileo satellite in orbit": "GIOVE-A: أول قمر من Galileo يصل إلى المدار",
      "All 34 first-generation Galileo navigation payloads": "حمولات الملاحة لجميع أقمار Galileo الـ34 من الجيل الأول",
      "Lunar Pathfinder: a lunar comms relay for NASA and ESA": "Lunar Pathfinder: مرحّل اتصالات قمري لـNASA وESA"
    },
    "plans": {
      "Completing and launching Lunar Pathfinder": "استكمال Lunar Pathfinder وإطلاقه",
      "A role in the Moonlight lunar comms and navigation constellation": "المشاركة في كوكبة Moonlight للملاحة والاتصالات القمرية",
      "Eight spacecraft in build for global customers": "ثماني مركبات فضائية قيد التصنيع لعملاء حول العالم"
    },
    "milestones": {
      "1981|UoSAT-1": [
        "القمر الجامعي UoSAT-1",
        "حلّق القمر الجامعي المصنوع من مكوّنات تجارية، وتجاوز عمره التصميمي بخمس سنوات."
      ],
      "1985|Company founded": [
        "تأسيس الشركة",
        "انفصلت عن جامعة سري لتسويق خبرتها في هندسة الأقمار الصغيرة."
      ],
      "2005|GIOVE-A": [
        "قمر الملاحة GIOVE-A",
        "صُنع وأُطلق أول قمر لنظام Galileo الملاحي."
      ],
      "2009|Joining Airbus": [
        "الانضمام إلى Airbus",
        "اشترت Astrium حصة الجامعة، وبقيت الشركة ضمن مجموعة Airbus."
      ],
      "2018|RemoveDEBRIS": [
        "مهمة RemoveDEBRIS",
        "نجحت تجربة إزالة الحطام الفضائي باستخدام شبكة وخطاف."
      ],
      "2020|Galileo deliveries end": [
        "اكتمال تسليم Galileo",
        "شُحنت حمولة الملاحة الرابعة والثلاثون بعد عقد من العمل."
      ]
    },
    "products": {
      "Small Satellite Platforms": [
        "منصات الأقمار الصغيرة",
        "أقمار مصغّرة ومتناهية الصغر",
        "كتلة من 10 إلى 500 كغ",
        "أكثر من 70 مهمة لصالح 22 دولة",
        "استخدام مكوّنات تجارية منخفضة التكلفة مع هندسة مبتكرة غيّر اقتصاديات الوصول إلى الفضاء."
      ],
      "Galileo Navigation Payloads": [
        "حمولات Galileo الملاحية",
        "حمولة ملاحية",
        "34 قمراً تشغيلياً",
        "جميع أقمار Galileo التي بنتها OHB",
        "ساعات ذرية وسلسلة إشارة الملاحة، سُلّمت باستمرار على مدى عقد كامل."
      ],
      "Lunar Pathfinder": [
        "القمر Lunar Pathfinder",
        "قمر مرحّل للاتصالات القمرية",
        "قمر يدور حول القمر",
        "ترحيل البيانات لمهمات الجانب البعيد والقطب الجنوبي للقمر",
        "مشروع مشترك بين NASA وESA، وخطوة تمهيدية لكوكبة اتصالات وملاحة قمرية."
      ],
      "Earth Observation Constellations": [
        "كوكبات رصد الأرض",
        "أقمار تصوير صغيرة",
        "كوكبات متعددة الدول",
        "كوكبة مراقبة الكوارث وعشرات الأقمار الوطنية",
        "أتاحت للدول ذات الميزانيات المحدودة امتلاك أقمارها. ويشمل سجلها أيضاً تجربة RemoveDEBRIS لإزالة الحطام."
      ]
    }
  },
  "reshetnev": {
    "history": "تأسست الشركة عام 1959 فرعاً شرقياً لمكتب تصميم سيرغي كوروليوف. وأنشأ ميخائيل ريشتنيوف مقرها في مدينة كراسنويارسك-26 المغلقة، زيلينوغورسك حالياً. وأسست خلال عقدها الأول عدة فروع لهندسة الأقمار السوفيتية. وصُمم نظام GLONASS العالمي للملاحة هنا. ودخل GLONASS الخدمة عام 1993 مع 12 قمراً. وتصنع الشركة أيضاً أسطول Ekspress الروسي للاتصالات في المدار الثابت. وعلى امتداد تاريخها بنت أكثر من 1,300 قمر ضمن 27 منظومة فضائية. ويعمل لديها نحو 8,500 شخص تحت مظلة Roscosmos.",
    "productHistory": "من أقمار الاتصالات السوفيتية الأولى إلى Glonass-K ومنصتي Ekspress-1000 وEkspress-2000.",
    "customers": {
      "Roscosmos": "وكالة Roscosmos",
      "The Russian state and military": "الدولة والجيش الروسيان",
      "The Russian Satellite Communications Company": "شركة الاتصالات الفضائية الروسية"
    },
    "missions": {
      "Designing and building the entire GLONASS system": "تصميم منظومة GLONASS كاملة وبناؤها",
      "Over 1,300 satellites across six decades": "أكثر من 1,300 قمر عبر ستة عقود",
      "The Ekspress comms fleet and the Gonets constellation": "أسطول اتصالات Ekspress وكوكبة Gonets"
    },
    "plans": {
      "A new GLONASS generation with all-domestic parts": "جيل جديد من GLONASS بمكوّنات محلية بالكامل",
      "The Marathon IoT constellation under the Sfera program": "كوكبة Marathon لإنترنت الأشياء ضمن برنامج Sfera",
      "Continued renewal of the Ekspress fleet": "مواصلة تجديد أسطول Ekspress"
    },
    "milestones": {
      "1959|Founded": [
        "التأسيس",
        "الفرع الشرقي لمكتب كوروليوف في مدينة سيبيرية مغلقة، بقيادة ميخائيل ريشتنيوف."
      ],
      "1966|Design independence": [
        "الاستقلال في التصميم",
        "أصبحت مكتب Applied Mechanics وبدأت إنشاء عائلات أقمارها الخاصة."
      ],
      "1982|GLONASS begins": [
        "بداية GLONASS",
        "أُطلق أول قمر اختباري لمنظومة الملاحة العالمية."
      ],
      "1993|GLONASS operational": [
        "بدء تشغيل GLONASS",
        "دخلت المنظومة الخدمة رسمياً مع 12 قمراً."
      ],
      "2015|Ekspress fleet": [
        "أسطول Ekspress",
        "أكمل القمر Ekspress-AM8 وأقرانه تغطية روسيا في المدار الثابت."
      ],
      "2020|Glonass-K": [
        "قمر Glonass-K",
        "انضم القمر الثالث من جيل K بعمر تشغيلي أطول وإشارات أكثر."
      ]
    },
    "products": {
      "GLONASS Satellites": [
        "أقمار GLONASS",
        "قمر ملاحي",
        "ثلاثة أجيال في المدار المتوسط (MEO)",
        "شبكة من 24 قمراً في ثلاثة مستويات مدارية",
        "يضيف الجيل K عمراً تشغيلياً يصل إلى عشر سنوات وإشارات إضافية على منصة Ekspress-1000K غير المضغوطة."
      ],
      "Ekspress Comsats": [
        "أقمار اتصالات Ekspress",
        "اتصالات في المدار الثابت (GEO)",
        "الأسطول الوطني الروسي",
        "التغطية الروسية وأسواق التصدير",
        "تستخدم منصتي Ekspress-1000 وEkspress-2000؛ واعتمدت سابقاً حمولات أوروبية، أما الآن فبمكوّنات محلية."
      ],
      "Gonets Constellation": [
        "كوكبة Gonets",
        "اتصالات بالتخزين وإعادة الإرسال",
        "مدار أرضي منخفض (LEO)",
        "مراسلات المناطق النائية الروسية منذ 1992",
        "امتداد لأقمار المراسلات العسكرية السوفيتية، مع تكييفها للاستخدام المدني."
      ],
      "Military & Geodesy Satellites": [
        "أقمار عسكرية وجيوديسية",
        "اتصالات عسكرية وقياس جيوديسي",
        "عدة عائلات منذ ستينيات القرن العشرين",
        "عائلة Raduga والمنظومات الحكومية",
        "ستة عقود في قلب أنظمة الاتصالات والقياس الجيوديسي السوفيتية والروسية."
      ]
    }
  },
  "planet": {
    "history": "أسس ثلاثة علماء سابقين في NASA الشركة عام 2010 بفكرة بسيطة: أقمار رخيصة بحجم علبة أحذية، لكن بأعداد كبيرة. وحلّقت أول أقمار Dove عام 2013. وفي 2017 اكتملت التغطية اليومية لليابسة على الأرض، واشترت الشركة أسطول SkySat من Google. وأُدرجت أسهمها في بورصة نيويورك في ديسمبر 2021. وتُصنع الأقمار في قلب سان فرانسيسكو بمعدل يصل إلى 40 قمراً من SuperDove أسبوعياً. وافتُتح مصنع ثانٍ في برلين في سبتمبر 2025. وبحلول أواخر 2025 تحولت الشركة إلى الربحية، وتجاوزت الطلبات المتراكمة 900 مليون دولار في مارس 2026. وأسهم عقد حكومي ألماني بقيمة 240 مليون يورو في هذا التحول.",
    "productHistory": "بدأت بأقمار Dove من فئة 3U، ثم SuperDove، تلتها أقمار Pelican عالية الدقة وTanager فائقة الأطياف على منصة مشتركة.",
    "customers": {
      "The German government and NATO": "الحكومة الألمانية وحلف NATO",
      "US intelligence agencies": "وكالات الاستخبارات الأمريكية",
      "Japan's JSAT": "JSAT اليابانية",
      "Global agriculture and insurance": "قطاعات الزراعة والتأمين حول العالم"
    },
    "missions": {
      "Uninterrupted daily imaging of Earth's landmass since 2017": "تصوير يومي متواصل لليابسة منذ 2017",
      "Tanager: hunting methane leaks with NASA and Carbon Mapper": "Tanager: رصد تسربات الميثان بالتعاون مع NASA وCarbon Mapper",
      "A dedicated ten-Pelican constellation for Japan's JSAT": "كوكبة خاصة من عشرة أقمار Pelican لصالح JSAT اليابانية"
    },
    "plans": {
      "Completing 32 Pelicans and the 30 cm second generation": "استكمال 32 قمراً من Pelican والجيل الثاني بدقة 30 سم",
      "Doubling output with the Berlin factory": "مضاعفة الإنتاج بفضل مصنع برلين",
      "The next-gen Owl constellation on the 2027-2028 horizon": "التحضير لكوكبة Owl من الجيل التالي خلال 2027–2028"
    },
    "milestones": {
      "2010|Founded": [
        "التأسيس",
        "بدأ ثلاثة علماء سابقين في NASA الشركة في سان فرانسيسكو."
      ],
      "2013|First Doves": [
        "أول أقمار Dove",
        "وصلت الأقمار الأولى بحجم علبة الأحذية إلى المدار."
      ],
      "2017|Full daily scan": [
        "اكتمال التصوير اليومي",
        "أُطلق 88 قمراً على صاروخ واحد، واشترت الشركة أسطول SkySat من Google."
      ],
      "2021|Going public": [
        "الإدراج في البورصة",
        "أُدرجت الشركة في بورصة نيويورك تحت الرمز PL."
      ],
      "2025|Golden year": [
        "عام ذهبي",
        "عقود بقيمة 230 مليون دولار مع اليابان و240 مليون يورو مع ألمانيا؛ وافتتاح مصنع برلين وتحقيق أول ربح."
      ],
      "2026|Pelican fleet": [
        "أسطول Pelican",
        "وصل تسعة أقمار Pelican إلى المدار، وتجاوزت الطلبات المتراكمة 900 مليون دولار."
      ]
    },
    "products": {
      "SuperDove": [
        "قمر SuperDove",
        "قمر تصوير CubeSat من فئة 3U",
        "كوكبة تضم نحو 200 قمر",
        "مسح يومي للأرض بدقة 3.7 م منذ 2017",
        "يصل الإنتاج إلى 40 وحدة أسبوعياً. وسُجل عام 2017 إطلاق 88 قمراً على صاروخ واحد."
      ],
      "Pelican": [
        "قمر Pelican",
        "قمر عالي الدقة وسريع المناورة",
        "أسطول مستهدف من 32 قمراً",
        "تسعة أقمار في المدار بحلول مايو 2026، وجيل ثانٍ بدقة 30 سم قيد التطوير",
        "يعالج معالج ذكاء اصطناعي من NVIDIA البيانات في المدار قبل إرسالها إلى الأرض، مع ما يصل إلى 30 زيارة يومية للمناطق متوسطة خطوط العرض."
      ],
      "SkySat": [
        "قمر SkySat",
        "قمر بدقة دون المتر",
        "أسطول من 21 قمراً",
        "تصوير موجّه بدقة 50 سم وتصوير فيديو مداري",
        "يرجع إرثه إلى Skybox؛ اشترته Google ثم باعته إلى Planet عام 2017."
      ],
      "Tanager Hyperspectral": [
        "قمر Tanager فائق الأطياف",
        "قمر فائق الأطياف",
        "أكثر من 400 نطاق طيفي",
        "رصد تسربات الميثان وثاني أكسيد الكربون على مستوى المنشآت منذ 2024",
        "بُني بالتعاون مع مختبر الدفع النفاث التابع لـNASA وتحالف Carbon Mapper، بتكلفة تعادل واحداً من خمسين من تقدير NASA."
      ]
    }
  },
  "york-space": {
    "history": "تأسست York في دنفر عام 2015 على مبدأ بسيط: تصنيع مركبات فضائية معيارية منخفضة التكلفة بدلاً من التصاميم المخصصة الباهظة. وأثبتت منصة S-CLASS جدارتها عام 2019 في مهمة Harbinger التابعة للجيش الأمريكي. واختارتها وكالة تطوير الفضاء في وزارة الدفاع مقاولاً رئيسياً لطبقة Transport Layer إلى جانب Lockheed وNorthrop. ووصلت عشرة أقمار من Tranche 0 إلى المدار عام 2023. وفي سبتمبر 2025 وضعت أول 21 قمراً من Tranche 1 في المدار خلال ساعات، لتكون أول مقاول رئيسي ينجز ذلك. وتبني الشركة 136 قمراً ضمن ثلاث دفعات. وانضمت إلى بورصة نيويورك في يناير 2026 بطرح أولي جمع 629 مليون دولار، ثم اشترت بعد شهرين شركة Orbion لصناعة دافعات البلازما.",
    "productHistory": "تطورت من منصة S-CLASS بكتلة 85 كغ إلى M-CLASS وLX-CLASS المخصصتين لحمولات أثقل.",
    "customers": {
      "The Pentagon's SDA": "وكالة تطوير الفضاء التابعة للبنتاغون (SDA)",
      "The US Space Force": "قوة الفضاء الأمريكية",
      "NASA": "وكالة NASA",
      "The US Army": "الجيش الأمريكي"
    },
    "missions": {
      "Deploying 21 Tranche 1 satellites on one launch; September 2025": "نشر 21 قمراً من Tranche 1 في إطلاق واحد في سبتمبر 2025",
      "Harbinger: proving the commercial bus for the Army in 2019": "Harbinger: إثبات كفاءة المنصة التجارية للجيش عام 2019",
      "The BARD comms satellite for NASA in 2025": "قمر الاتصالات BARD لصالح NASA عام 2025"
    },
    "plans": {
      "Building 62 Tranche 2 Alpha satellites and ten Gammas": "بناء 62 قمراً من Tranche 2 Alpha وعشرة أقمار Gamma",
      "Integrating Orbion thrusters into S-CLASS and M-CLASS lines": "دمج دافعات Orbion في خطوط S-CLASS وM-CLASS",
      "The Tranche 2 launch campaign from 2026 onward": "تنفيذ حملة إطلاق Tranche 2 ابتداءً من 2026"
    },
    "milestones": {
      "2015|Founded": [
        "التأسيس",
        "بدأت الشركة في دنفر بفكرة تصنيع مركبات فضائية معيارية على خطوط إنتاج متسلسلة."
      ],
      "2019|Harbinger": [
        "مهمة Harbinger",
        "حلّقت أول منصة S-CLASS لصالح الجيش الأمريكي وأثبتت صلاحية التصميم."
      ],
      "2023|Tranche 0": [
        "الدفعة الأولى (Tranche 0)",
        "وصلت عشرة أقمار تجريبية لطبقة Transport Layer إلى المدار."
      ],
      "2025|Tranche 1 record": [
        "رقم قياسي لـTranche 1",
        "نُشر 21 قمراً خلال ساعات، لتكون الشركة أول مقاول رئيسي ينجز هذه الخطوة."
      ],
      "2026|IPO": [
        "الطرح العام الأولي",
        "جمع الطرح الأولي في بورصة نيويورك 629 مليون دولار."
      ],
      "2026|Orbion purchase": [
        "الاستحواذ على Orbion",
        "اشترت الشركة مصنّع دافعات البلازما لتعزيز تكامل سلسلة التوريد."
      ]
    },
    "products": {
      "S-CLASS Platform": [
        "منصة S-CLASS",
        "منصة أقمار صغيرة معيارية",
        "فئة حمولة 85 كغ",
        "من مهمة Harbinger عام 2019 إلى أقمار Transport Layer",
        "إنتاج تسلسلي بتكوين ثابت؛ ويضيف العميل حمولته فقط."
      ],
      "SDA Transport Layer Satellites": [
        "أقمار طبقة Transport Layer التابعة لـSDA",
        "قمر اتصالات عسكري",
        "136 قمراً ضمن ثلاث دفعات",
        "Tranche 0 عام 2023؛ و21 قمراً من Tranche 1 في سبتمبر 2025",
        "توفر شبكة ليزرية مترابطة نقل البيانات حول الأرض. بلغت قيمة عقد Tranche 1 نحو 382 مليون دولار لـ42 قمراً، ثم أضيف 62 قمراً في Tranche 2."
      ],
      "M-CLASS & LX-CLASS": [
        "منصتا M-CLASS وLX-CLASS",
        "منصات متوسطة الحجم",
        "حمولات أثقل",
        "مهمات الاستخبارات والمراقبة والاستطلاع والطقس والاتصالات",
        "الفلسفة المعيارية نفسها بحجم أكبر، مع توافق مع طيف واسع من مركبات الإطلاق."
      ],
      "Specialized Government Missions": [
        "مهمات حكومية متخصصة",
        "مركبات فضائية حكومية مخصصة",
        "مهمات تجريبية وفريدة",
        "Dragoon لصالح SDA وBARD لصالح NASA عام 2025",
        "نُفذت خمس مهمات في 2025 وحده، وهو أكثر أعوام الشركة نشاطاً."
      ]
    }
  },
  "astranis": {
    "history": "أسس جون غيدمارك وريان ماكلينكو الشركة عام 2015 بفكرة تخالف السائد: بدلاً من أقمار GEO الضخمة متعددة الأطنان، قمر رخيص بكتلة 400 كغ يخدم دولة أو عميلاً واحداً. وحلّق قمر تجريبي عام 2018. وأُطلق Arcturus لصالح ألاسكا عام 2023؛ وقد حدّ عطل في محرك الألواح الشمسية من الخدمة، لكنه أثبت كفاءة المنصة. وفي ديسمبر 2024 أُطلقت أربعة أقمار Block 2 على صاروخ Falcon 9 مخصص. ويمتد العملاء من بيرو والفلبين إلى تايلاند وتايوان. وفي 2025 اجتازت الشركة عرضاً لموجة Resilient GPS لصالح قوة الفضاء الأمريكية. أما الجيل التالي Omega، ذو القدرة الخماسية، فتبدأ إطلاقاته في 2026.",
    "productHistory": "من الجيل الأول MicroGEO إلى القمر متعدد المهام UtilitySat، ثم Omega بكتلة 600 كغ وسعة تتجاوز 50 غيغابت في الثانية.",
    "customers": {
      "Operators in Alaska, Peru and the Philippines": "مشغّلون في ألاسكا وبيرو والفلبين",
      "Thailand's Thaicom": "Thaicom التايلاندية",
      "The US Space Force": "قوة الفضاء الأمريكية",
      "Taiwan": "تايوان"
    },
    "missions": {
      "Arcturus: the first dedicated small GEO for Alaska": "Arcturus: أول قمر GEO صغير مخصص لألاسكا",
      "Four satellites on one dedicated launch in 2024": "إطلاق أربعة أقمار في مهمة واحدة مخصصة عام 2024",
      "Nexus as a candidate in America's Resilient GPS architecture": "ترشيح Nexus لبنية Resilient GPS الأمريكية"
    },
    "plans": {
      "First Omegas from 2026, scaling toward 24 a year": "إطلاق أول أقمار Omega من 2026، والتوسع نحو 24 قمراً سنوياً",
      "A 2027 Impulse Space mission lifting satellites from LEO to GEO": "مهمة مع Impulse Space عام 2027 لنقل الأقمار من LEO إلى GEO",
      "Competing in the Resilient GPS program": "المنافسة ضمن برنامج Resilient GPS"
    },
    "milestones": {
      "2015|Founded": [
        "التأسيس",
        "أطلق مهندسان شابان فكرة الأقمار الصغيرة للمدار الثابت."
      ],
      "2018|Demo satellite": [
        "قمر تجريبي",
        "أثبتت منصة اختبار صغيرة كفاءة الراديو البرمجي في المدار."
      ],
      "2023|Arcturus": [
        "قمر Arcturus",
        "أُطلق أول قمر MicroGEO لألاسكا؛ وعملت المنصة رغم عطل في الألواح الشمسية."
      ],
      "2024|Block 2": [
        "الجيل Block 2",
        "اتجهت أربعة أقمار إلى المدار على متن Falcon 9 مخصص."
      ],
      "2025|Resilient GPS": [
        "برنامج Resilient GPS",
        "أُجري عرض لموجة ملاحية لصالح قوة الفضاء، وأُبرمت صفقة بقيمة 115 مليون دولار مع تايوان."
      ],
      "2026|The Omega era": [
        "عصر Omega",
        "أُعدت أقمار الجيل الأول من Omega للإطلاق."
      ]
    },
    "products": {
      "MicroGEO": [
        "قمر MicroGEO",
        "قمر اتصالات صغير",
        "نحو 400 كغ؛ مدار ثابت (GEO)",
        "ألاسكا وبيرو والفلبين وتايلاند والمكسيك",
        "يستخدم راديو برمجياً خاصاً لضبط الترددات من المدار. وقد أُطلق ستة أقمار حتى الآن."
      ],
      "UtilitySat": [
        "قمر UtilitySat",
        "قمر متعدد المهام",
        "نطاقات Ka وKu وQ/V",
        "أُطلق عام 2024؛ وأعاق عطل دفع وصوله من مدار الانتقال",
        "منصة متعددة الاستخدامات للمهمات القصيرة وزيادة السعة مؤقتاً. ويستمر العمل على بدائل بعد فقدان أول وحدة."
      ],
      "Omega": [
        "قمر Omega",
        "جيل جديد للمدار الثابت (GEO)",
        "600 كغ؛ أكثر من 50 غيغابت/ثانية",
        "أول إطلاقات من 2026، مع نسخة عسكرية بنطاق X",
        "تستبدل مضخمات الحالة الصلبة أنابيب التفريغ، ويُصنع 70% من القمر داخلياً."
      ],
      "Nexus for Resilient GPS": [
        "Nexus لنظام Resilient GPS",
        "قمر ملاحي صغير",
        "برنامج لقوة الفضاء الأمريكية",
        "طبقة احتياطية للملاحة الأمريكية",
        "اجتاز الراديو البرمجي عرضاً ناجحاً لموجة GPS في مارس 2025."
      ]
    }
  },
  "iceye": {
    "history": "أسس طالبان من جامعة آلتو الشركة عام 2014. وشكك القطاع في إمكانية وضع رادار ذي فتحة اصطناعية (SAR) على قمر تقل كتلته عن 100 كغ. لكن ICEYE-X1 أثبت ذلك في يناير 2018، وكان أيضاً أول قمر تجاري لفنلندا. وفي 2019 حققت الشركة دقة دون المتر، وفي 2020 نفذت أول تصوير راداري بالفيديو. ولا تتأثر الرادارات بالليل أو السحب، ما يجعلها مناسبة لمراقبة الفيضانات والنزاعات. وانضمت الشركة إلى برنامج Copernicus الأوروبي عام 2021. وتبلغ دقة الجيل الرابع 16 سم. وفي أواخر 2025 جمعت تمويلاً عند تقييم 2.4 مليار يورو وأصبحت مورّداً للبيانات إلى NATO. ووصل إنتاجها إلى قمر واحد أسبوعياً.",
    "productHistory": "انتقلت من X1 بدقة عشرة أمتار إلى الجيل الرابع بدقة 16 سم خلال ثمانية أعوام وأربعة أجيال.",
    "customers": {
      "NATO and allied governments": "NATO والحكومات الحليفة",
      "ESA (Copernicus)": "وكالة الفضاء الأوروبية (ESA) عبر Copernicus",
      "Global insurers": "شركات تأمين عالمية",
      "Ukraine and defense programs": "أوكرانيا وبرامج دفاعية"
    },
    "missions": {
      "X1: the world's first small SAR satellite in 2018": "X1: أول قمر راداري صغير في العالم عام 2018",
      "Global flood monitoring for the insurance industry": "مراقبة الفيضانات عالمياً لصالح قطاع التأمين",
      "Battlefield radar data over Ukraine since 2022": "بيانات رادارية لساحات القتال فوق أوكرانيا منذ 2022"
    },
    "plans": {
      "One hundred satellites built a year by late 2027": "إنتاج 100 قمر سنوياً بحلول أواخر 2027",
      "Sub-15-minute revisit with a full Gen4 constellation": "خفض زمن إعادة الزيارة إلى أقل من 15 دقيقة بكوكبة Gen4 كاملة",
      "More sovereign fleets for more governments": "إنشاء أساطيل سيادية إضافية لمزيد من الحكومات"
    },
    "milestones": {
      "2014|Founded": [
        "التأسيس",
        "انفصلت الشركة عن أبحاث الراديو في جامعة آلتو بمدينة إسبو."
      ],
      "2018|X1: breaking impossible": [
        "X1: إثبات المستحيل",
        "أُطلق أول قمر SAR في العالم بكتلة دون 100 كغ، وأول قمر تجاري لفنلندا."
      ],
      "2019|Sub-meter": [
        "دقة دون المتر",
        "التُقطت أول صورة SAR صغيرة بدقة دون المتر في تاريخ قطاع الفضاء التجاري الجديد."
      ],
      "2021|Joining Copernicus": [
        "الانضمام إلى Copernicus",
        "أدخل عقد مع ESA أسطول الأقمار ضمن برنامج رصد البيئة الأوروبي."
      ],
      "2025|A €2.4B valuation": [
        "تقييم بقيمة 2.4 مليار يورو",
        "جُمِع 150 مليون يورو، وأُطلق 62 قمراً، وأصبحت الشركة مورّداً للبيانات إلى NATO."
      ],
      "2026|The 80-satellite mark": [
        "بلوغ نحو 80 قمراً",
        "رفعت رحلات Transporter المنتظمة عدد الأقمار المطلقة إلى نحو 80."
      ]
    },
    "products": {
      "X-band SAR Microsatellites": [
        "أقمار رادارية مصغّرة بنطاق X",
        "رادار ذو فتحة اصطناعية (SAR)",
        "أقل من 100 كغ",
        "نحو 80 قمراً أُطلق منذ 2018",
        "هوائي قابل للنشر ورادار مدمج بكتلة تعادل عُشر الأنظمة التقليدية. وتقل فترة إعادة زيارة المواقع عالمياً عن ست ساعات."
      ],
      "Generation 4": [
        "الجيل الرابع",
        "رادار عالي الدقة",
        "دقة تصل إلى 16 سم",
        "رحلات Transporter منتظمة مع SpaceX منذ 2025",
        "أعلى دقة تجارية متاحة لأقمار SAR الصغيرة. والهدف إنتاج 100 قمر سنوياً بحلول أواخر 2027."
      ],
      "Sovereign Missions": [
        "مهمات سيادية",
        "أقمار وطنية مخصصة",
        "برامج الدفاع الوطنية",
        "أساطيل مخصصة لعدة دول وتوريد بيانات إلى NATO",
        "تشتري الدول أقمارها الرادارية الوطنية، وتتولى ICEYE بناءها وتشغيلها."
      ],
      "Flood & Disaster Analytics": [
        "تحليلات الفيضانات والكوارث",
        "خدمة بيانات",
        "التأمين وإدارة الأزمات",
        "مراقبة مئات أحداث الفيضانات سنوياً لشركات التأمين العالمية",
        "يخترق الرادار الظلام والسحب، ويتيح لشركات التأمين الحصول على خرائط الفيضانات خلال ساعات."
      ]
    }
  },
  "satellogic": {
    "history": "أسس إميليانو كارغيمان وخيراردو ريتشارتي الشركة عام 2010، وبدأت جذورها في بوينس آيرس فيما تشكل التصنيع في مونتيفيديو. ومهّد النموذج الأولي BugSat الطريق عام 2014. وتزن أقمار NewSat نحو 40 كغ وتلتقط صوراً دون المتر بعُشر أسعار المنافسين. وأُدرجت الشركة في Nasdaq عام 2022. وفي العام نفسه حصلت ألبانيا على قمرين يحملان اسمها ضمن نموذج الكوكبة الوطنية المخصصة، ثم مُدّد الاتفاق عام 2026. وأصبح بيع الأقمار مباشرةً نموذجاً جديداً للشركة: اشترت البرتغال قمرين من Mark V، وتسلم عميل دفاعي قمراً NewSat في المدار. وأُطلق القمران NewSats 53 و54 في مارس 2026.",
    "productHistory": "انتقلت من منصة BugSat التجريبية إلى NewSat Mark V بدقة 50 سم، ثم إلى مفهوم كوكبة Merlin الدفاعية.",
    "customers": {
      "The government of Albania": "حكومة ألبانيا",
      "Portugal's CEiiA": "CEiiA البرتغالية",
      "Defense and intelligence customers": "عملاء الدفاع والاستخبارات",
      "Latin American agriculture and governments": "الزراعة والحكومات في أمريكا اللاتينية"
    },
    "missions": {
      "Albania-1 and 2: the world's first national dedicated constellation": "Albania-1 وAlbania-2: أول كوكبة وطنية مخصصة في العالم",
      "Over 50 NewSats on launchers from three continents": "أكثر من 50 قمراً من NewSat أُطلقت على صواريخ من ثلاث قارات",
      "An in-orbit satellite handover to a defense customer in 2026": "تسليم قمر إلى عميل دفاعي أثناء وجوده في المدار عام 2026"
    },
    "plans": {
      "Building the Merlin defense constellation": "بناء كوكبة Merlin الدفاعية",
      "Delivering Portugal's two Mark Vs in 2026": "تسليم قمري Mark V للبرتغال عام 2026",
      "Expanding outright satellite sales to more governments": "توسيع البيع المباشر للأقمار إلى مزيد من الحكومات"
    },
    "milestones": {
      "2010|Founded": [
        "التأسيس",
        "بدأ المشروع رائدَا أعمال أرجنتينيان."
      ],
      "2014|BugSat": [
        "النموذج الأولي BugSat",
        "اختبر النموذج الأولي تقنيات التصوير من المدار."
      ],
      "2016|First NewSats": [
        "أول أقمار NewSat",
        "أرسل خط مونتيفيديو أقماراً تشغيلية إلى المدار."
      ],
      "2022|Nasdaq and Albania": [
        "Nasdaq وألبانيا",
        "أُدرجت الشركة في Nasdaq وأبرمت مع ألبانيا أول صفقة كوكبة وطنية مخصصة في العالم."
      ],
      "2026|In-orbit sales": [
        "بيع أقمار في المدار",
        "سُلّم قمر NewSat في المدار إلى عميل دفاعي، وبِيعت وحدتا Mark V إلى البرتغال."
      ],
      "2026|Merlin unveiled": [
        "الكشف عن Merlin",
        "كُشف عن مفهوم كوكبة دفاعية تعتمد الذكاء الاصطناعي، بالتزامن مع نمو الإيرادات 80%."
      ]
    },
    "products": {
      "NewSat (Aleph-1) Constellation": [
        "كوكبة NewSat (Aleph-1)",
        "قمر تصوير صغير",
        "نحو 40 كغ",
        "أكثر من 50 قمراً على صواريخ صينية وأوروبية وأمريكية",
        "تصوير في النطاقين المرئي وتحت الأحمر، مع فيديو مداري. ويمكن لكل قمر التقاط ما يصل إلى ألف مشهد يومياً."
      ],
      "Constellation-as-a-Service": [
        "الكوكبة بوصفها خدمة",
        "خدمة سيادية",
        "أقمار تحمل اسم العميل",
        "يراقب القمران Albania-1 وAlbania-2 ألبانيا منذ 2022",
        "تمنح الخدمة الحكومات قدرة وطنية على التصوير بالأقمار دون الحاجة إلى بناء برنامج فضائي كامل."
      ],
      "Space Systems Sales": [
        "بيع الأنظمة الفضائية",
        "بيع الأقمار مباشرةً",
        "Mark V بدقة 50 سم",
        "قمران لصالح CEiiA البرتغالية وتسليم قمر في المدار إلى عميل دفاعي",
        "تنتقل الملكية والسيطرة إلى المشتري؛ وبلغت قيمة الصفقة البرتغالية 18 مليون دولار."
      ],
      "Merlin Constellation Concept": [
        "مفهوم كوكبة Merlin",
        "كوكبة دفاعية قائمة على الذكاء الاصطناعي",
        "الجيل التالي",
        "سوق الدفاع والاستخبارات الأمريكية",
        "كُشف عنها عام 2026 مع منتج Aleph Observer للتحليل الذكي للبيانات في المدار."
      ]
    }
  },
  "cast": {
    "history": "تأسست الأكاديمية في 20 فبراير 1968. وبعد عامين بنت أول قمر صيني، Dong Fang Hong-1، فأصبحت الصين خامس دولة تصل إلى عصر الأقمار الصناعية. وهي اليوم المركز الصيني الرئيسي لتصميم المركبات الفضائية وإنتاجها، ويعمل فيها أكثر من عشرة آلاف شخص. وتشكل منصات DFH المدارية أساس أقمار الاتصالات الصينية وطلبات التصدير. كما تصنع مركبات Shenzhou المأهولة ووحدات محطة Tiangong، وأقمار Chang'e القمرية ومهمة Tianwen-1 إلى المريخ. وأنتجت أيضاً حصة كبيرة من أقمار الملاحة Beidou. وتتبع الأكاديمية مجموعة CASC المملوكة للدولة.",
    "productHistory": "من Dong Fang Hong-1 إلى منصتي DFH-4 وDFH-5، ومركبات Shenzhou ومحطة Tiangong والمسابير الكوكبية.",
    "customers": {
      "China's space program": "برنامج الفضاء الصيني",
      "The CASC group": "مجموعة CASC",
      "The Chinese military": "الجيش الصيني",
      "Export customers in Asia, Africa and Latin America": "عملاء تصدير في آسيا وأفريقيا وأمريكا اللاتينية"
    },
    "missions": {
      "Dong Fang Hong-1: China's first satellite in 1970": "Dong Fang Hong-1: أول قمر صيني عام 1970",
      "The Shenzhou fleet and the three-module Tiangong station": "أسطول Shenzhou ومحطة Tiangong ذات الوحدات الثلاث",
      "Chang'e-6: the unprecedented far-side sample return": "Chang'e-6: أول إعادة عينات من الجانب البعيد للقمر"
    },
    "plans": {
      "A new-generation crewed spacecraft for LEO and the Moon": "مركبة مأهولة جديدة للمدار الأرضي المنخفض والقمر",
      "Continued Shenzhou and Tianzhou production for Tiangong": "مواصلة إنتاج Shenzhou وTianzhou لمحطة Tiangong",
      "Future Chang'e probes toward the lunar south pole": "مهمات Chang'e مستقبلية نحو القطب الجنوبي للقمر"
    },
    "milestones": {
      "1968|Founded": [
        "التأسيس",
        "تأسست الأكاديمية في بكين في ذروة سباق الفضاء."
      ],
      "1970|Dong Fang Hong-1": [
        "القمر Dong Fang Hong-1",
        "جعل أول أقمار CAST الصينَ خامس دولة فضائية."
      ],
      "2003|First taikonaut": [
        "أول رائد فضاء صيني",
        "حملت Shenzhou-5 أول مواطن صيني إلى المدار."
      ],
      "2007|The lunar road": [
        "الطريق إلى القمر",
        "أصبح Chang'e-1 أول مسبار صيني يدور حول القمر."
      ],
      "2021|Tiangong": [
        "محطة Tiangong",
        "أرست الوحدة الأساسية Tianhe قاعدة المحطة الوطنية."
      ],
      "2024|The Moon's far side": [
        "الجانب البعيد للقمر",
        "أعاد Chang'e-6 إلى الأرض أول عينات مأخوذة من الجانب البعيد للقمر."
      ]
    },
    "products": {
      "DFH GEO Platforms": [
        "منصات DFH للمدار الثابت",
        "منصة اتصالات",
        "DFH-4 وDFH-5",
        "أقمار الاتصالات الصينية وعملاء تصدير في قارات عدة",
        "منصة معيارية عالية القدرة وطويلة العمر، وتشكل أساس صادرات الصين من الأقمار."
      ],
      "Shenzhou Crewed Spacecraft": [
        "مركبة Shenzhou المأهولة",
        "مركبة فضائية مأهولة",
        "ثلاثة رواد فضاء؛ كتلة 7.8 أطنان",
        "كل الرحلات الصينية المأهولة منذ 2003",
        "تصميم من ثلاث وحدات ينتمي إلى عائلة Soyuz، لكنه أكبر حجماً ومصنوع في الصين."
      ],
      "Tiangong Station Modules": [
        "وحدات محطة Tiangong",
        "وحدات محطة مدارية",
        "محطة من ثلاث وحدات",
        "الوحدة Tianhe ومختبران مداريان منذ 2021",
        "تكامل موائل فضائية للرحلات الطويلة، بحجم يقارب محطة الفضاء الدولية المبكرة."
      ],
      "Lunar & Planetary Probes": [
        "المسابير القمرية والكوكبية",
        "مسابير علمية",
        "Chang'e وTianwen",
        "إعادة عينات قمرية والهبوط على المريخ",
        "من أول مسبار صيني يدور حول القمر عام 2007 إلى إعادة عينات من جانبه البعيد عام 2024."
      ],
      "Beidou Navigation Satellites": [
        "أقمار الملاحة Beidou",
        "أقمار ملاحية",
        "كوكبة عالمية",
        "ملاحة عالمية مستقلة للصين منذ 2020",
        "تتولى CAST الحصة الرئيسية من بناء Beidou-3 بالتعاون مع معاهد أخرى في CASC."
      ]
    }
  },
  "blue-canyon": {
    "history": "تأسست Blue Canyon عام 2008 في لافاييت بولاية كولورادو، وتصنع أقماراً صغيرة كاملة ومكوّنات دقيقة للتحكم بالاتجاه. وقد حلّقت عجلات ردّ الفعل ومتعقّبات النجوم التي تنتجها في مئات المهمات. واشترتها شركة Raytheon الدفاعية أواخر 2020، وأصبحت تابعة لـRTX. ووصل عدد المركبات التي أُطلقت من خطوطها إلى أكثر من 90. وفي يناير 2026 حملت منصتها Saturn-200 مهمة Pandora التابعة لـNASA إلى المدار لدراسة أجواء الكواكب الخارجية. وفي يونيو 2026 وافقت MDA Space الكندية على شراء الشركة نقداً مقابل 620 مليون دولار، بانتظار موافقة الجهات التنظيمية قبل نهاية العام.",
    "productHistory": "تطورت من أقمار CubeSat بحجم 3U إلى أقمار Saturn المصغّرة؛ سبع عائلات من المنصات وأكثر من 3,800 مكوّن حلّق في الفضاء.",
    "customers": {
      "NASA": "وكالة NASA",
      "US Space Force": "قوة الفضاء الأمريكية",
      "National labs and universities": "مختبرات وجامعات وطنية",
      "Commercial operators": "مشغّلون تجاريون"
    },
    "missions": {
      "Pandora: NASA exoplanet atmosphere probe in 2026": "Pandora: مسبار NASA لدراسة أجواء الكواكب الخارجية عام 2026",
      "Dozens of US science and defense CubeSats": "عشرات أقمار CubeSat الأمريكية للعلوم والدفاع",
      "Flight components aboard hundreds of other makers' satellites": "مكوّنات طيران على أقمار مئات المصنّعين الآخرين"
    },
    "plans": {
      "Close the MDA sale by the end of 2026": "إتمام صفقة البيع إلى MDA قبل نهاية 2026",
      "Scale up attitude-control component production": "توسيع إنتاج مكوّنات التحكم بالاتجاه",
      "Larger buses for defense constellations": "تطوير منصات أكبر لكوكبات الدفاع"
    },
    "milestones": {
      "2008|Founded": [
        "التأسيس",
        "بدأت الشركة في لافاييت بولاية كولورادو، متخصصةً بمكوّنات التحكم بالاتجاه."
      ],
      "2020|Joined Raytheon": [
        "الانضمام إلى Raytheon",
        "استحوذت الشركة الدفاعية الأمريكية على Blue Canyon؛ ثم أصبحت ضمن علامة RTX."
      ],
      "2026|Pandora launch": [
        "إطلاق Pandora",
        "حملت منصة Saturn-200 مهمة NASA لدراسة الكواكب الخارجية؛ وكانت المركبة رقم 87 للشركة."
      ],
      "2026|Wheel production expanded": [
        "توسيع إنتاج العجلات",
        "زادت الشركة الطاقة التصنيعية لعجلات ردّ الفعل."
      ],
      "2026|MDA sale agreed": [
        "اتفاق بيع MDA",
        "صفقة نقدية بقيمة 620 مليون دولار، بانتظار الموافقات التنظيمية."
      ]
    },
    "products": {
      "Satellite Buses": [
        "منصات الأقمار الصناعية",
        "من CubeSat إلى قمر مصغّر",
        "سبع عائلات من 3U حتى ESPA-Grande",
        "أُطلق أكثر من 90 مركبة فضائية",
        "توفر توجيهاً بالغ الدقة ضمن أحجام صغيرة. وحملت Saturn-200 أكبر تلسكوب أرسلته الشركة حتى الآن."
      ],
      "Reaction Wheels & Star Trackers": [
        "عجلات ردّ الفعل ومتعقّبات النجوم",
        "مكوّنات التحكم بالاتجاه",
        "أكثر من 3,800 مكوّن حلّق في الفضاء",
        "مئات الأقمار التجارية والحكومية",
        "من أكثر منتجات الشركة مبيعاً؛ وتوسع إنتاج عجلات ردّ الفعل عام 2026."
      ],
      "Control Moment Gyroscopes": [
        "جيروسكوبات التحكم بالعزم",
        "مشغّل للمناورة السريعة",
        "لأقمار التصوير السريعة المناورة",
        "مهمات تتطلب تغيير اتجاه سريعاً",
        "تتيح تغيير الاتجاه أسرع عدة مرات من عجلات ردّ الفعل، فترفع قيمة كل مرور مداري."
      ]
    }
  },
  "gomspace": {
    "history": "بدأ طلبة دكتوراه في جامعة ألبورغ شركة GomSpace عام 2007، واختاروا لها اسماً مستمداً من لقب مازح أطلقوه على أنفسهم. وأصبحت من رواد CubeSat في أوروبا، وتشحن أكثر من 2,000 منتج مؤهل للطيران سنوياً إلى عملاء في أكثر من 60 دولة. وتُتداول أسهمها في Nasdaq Stockholm منذ 2016. وفي 2025 فازت بأكبر طلبية في تاريخها: 18 قمراً خلال 12 شهراً. وفي العام نفسه انضمت إلى اتحاد أوروبي لتطوير أقمار عسكرية في مدارات منخفضة جداً. وحققت في السنة المالية 2025 نمواً بلغ 72% وأول أرباح سنوية. وفي 2026 كُلفت ببرمجيات التحكم بالاتجاه لقمر CubeSat سيهبط على الكويكب Apophis.",
    "productHistory": "انتقلت من أجهزة راديو CubeSat إلى تسليم مجموعات كاملة من عدة أقمار؛ مع خبرة تمتد 19 عاماً في الأقمار النانوية.",
    "customers": {
      "ESA": "وكالة الفضاء الأوروبية (ESA)",
      "Unseenlabs (France)": "Unseenlabs الفرنسية",
      "European Defence Agency": "وكالة الدفاع الأوروبية",
      "Customers in 60+ countries": "عملاء في أكثر من 60 دولة"
    },
    "missions": {
      "Unseenlabs ship-tracking constellation since 2022": "كوكبة Unseenlabs لتعقب السفن منذ 2022",
      "Participant in Blue Origin's project Oasis": "المشاركة في مشروع Oasis التابع لـBlue Origin",
      "Apophis asteroid lander CubeSat for 2029": "قمر CubeSat للهبوط على الكويكب Apophis عام 2029"
    },
    "plans": {
      "Deliver the RF monitoring cluster by mid-2028": "تسليم مجموعة مراقبة الترددات الراديوية بحلول منتصف 2028",
      "Two new Unseenlabs CubeSats in 2027": "قمران جديدان لـUnseenlabs عام 2027",
      "Grow its share of Europe's defense market": "زيادة حصتها في سوق الدفاع الأوروبي"
    },
    "milestones": {
      "2007|Founded": [
        "التأسيس",
        "انبثقت الشركة من جامعة ألبورغ في الدنمارك."
      ],
      "2016|Stock listing": [
        "الإدراج في البورصة",
        "أُدرجت الشركة في Nasdaq Stockholm تحت الرمز GOMX."
      ],
      "2025|Largest order": [
        "أكبر طلبية",
        "18 قمراً بقيمة 19.5 مليون يورو خلال 12 شهراً."
      ],
      "2025|EU defense consortium": [
        "اتحاد دفاعي أوروبي",
        "اختيرت للمشاركة في مفهوم أوروبي لكوكبة عسكرية في مدار منخفض جداً."
      ],
      "2026|First annual profit": [
        "أول ربح سنوي",
        "نمو الإيرادات 72% في 2025 وتحقيق دخل تشغيلي موجب."
      ],
      "2026|Apophis mission": [
        "مهمة Apophis",
        "كُلّفت ببرمجيات التحكم بالاتجاه لقمر CubeSat من مهمة Don Quijote."
      ]
    },
    "products": {
      "CubeSat Platforms": [
        "منصات CubeSat",
        "قمر نانوي معياري",
        "حزم جاهزة للطيران",
        "أسطول Unseenlabs المؤلف من 16 قمراً وعشرات المهمات الأخرى",
        "منصات معيارية مجرّبة تقلل تعقيد الدمج والوقت اللازم لإنجاز المهمة."
      ],
      "Subsystems & Radios": [
        "الأنظمة الفرعية وأجهزة الراديو",
        "مكوّنات مؤهلة للطيران",
        "أكثر من 2,000 منتج سنوياً",
        "عملاء في أكثر من 60 دولة",
        "تُعد أجهزة الراديو وحواسيب الطيران من GomSpace بين الأكثر مبيعاً في سوق CubeSat."
      ],
      "RF Monitoring Clusters": [
        "مجموعات مراقبة RF",
        "كوكبة دفاعية",
        "عقد بقيمة 7.6 ملايين يورو في 2026",
        "التسليم في النصف الأول من 2028 لمراقبة الطيف من المدار",
        "مجموعة أقمار ترصد بيئة الترددات الراديوية للأرض لاستخدامها في الحرب الإلكترونية."
      ]
    }
  },
  "nanoavionics": {
    "history": "انفصلت NanoAvionics عن جامعة فيلنيوس عام 2014. وجعلت منصاتها المعيارية بناء الكوكبات أسرع وأقل تكلفة. واشترت مجموعة Kongsberg النرويجية 77% منها عام 2024. وفي مارس 2025 حلّق أول قمر نرويجي للمراقبة البحرية على منصة MP42 من تصنيعها. وفي أبريل وقّعت عقداً حصرياً لبناء 280 قمراً لكوكبة Meridian للاتصالات، كما ضاعف مصنع جديد في فيلنيوس الطاقة الإنتاجية. وفي أغسطس 2026 كشفت عن عائلة MP42 Gen-2، وعلى رأسها منصة بكتلة 500 كغ لا تخضع لقيود ITAR. وكانت قد بنت أو سلّمت خمس منصات من الجيل الثاني قبل الكشف عنها.",
    "productHistory": "من أقمار CubeSat على منصة M6P إلى MP42D بكتلة 500 كغ؛ اثنا عشر عاماً وجيلان من المنصات.",
    "customers": {
      "Kongsberg and the Norwegian Armed Forces": "Kongsberg والقوات المسلحة النرويجية",
      "SpinLaunch (USA)": "SpinLaunch الأمريكية",
      "Satlantis and SuperSharp": "Satlantis وSuperSharp",
      "NATO defense customers": "عملاء دفاعيون ضمن NATO"
    },
    "missions": {
      "Norway's maritime surveillance constellation since 2025": "كوكبة المراقبة البحرية النرويجية منذ 2025",
      "SuperSharp's thermal infrared telescope on Gen-2": "تلسكوب SuperSharp الحراري تحت الأحمر على منصة Gen-2",
      "The 280-satellite Meridian constellation in work": "العمل على كوكبة Meridian للاتصالات المؤلفة من 280 قمراً"
    },
    "plans": {
      "First Gen-2 launches from late 2026": "بدء إطلاق أقمار Gen-2 في أواخر 2026",
      "Three more Norwegian fleet satellites by early 2027": "إضافة ثلاثة أقمار أخرى للأسطول النرويجي بحلول أوائل 2027",
      "Growth in the NATO defense market": "النمو في سوق الدفاع لدى NATO"
    },
    "milestones": {
      "2014|Founded": [
        "التأسيس",
        "انفصلت الشركة عن جامعة فيلنيوس في ليتوانيا."
      ],
      "2024|Kongsberg ownership": [
        "ملكية Kongsberg",
        "استحوذت المجموعة النرويجية على 77% من الأسهم."
      ],
      "2025|ARVAKER I launch": [
        "إطلاق ARVAKER I",
        "بدأت كوكبة المراقبة البحرية النرويجية باستخدام منصة MP42."
      ],
      "2025|Meridian contract": [
        "عقد Meridian",
        "أصبحت الشركة المصنّع الحصري لـ280 قمراً للاتصالات لصالح SpinLaunch."
      ],
      "2026|Gen-2 MP42": [
        "MP42 من الجيل الثاني",
        "كُشف عن MP42D بكتلة 500 كغ؛ وكانت خمس وحدات قد بُنيت أو سُلّمت بالفعل."
      ]
    },
    "products": {
      "Nanosatellite Buses": [
        "منصات الأقمار النانوية",
        "منصة CubeSat معيارية",
        "عائلتا M6P وM12",
        "عشرات المهمات التجارية والأكاديمية",
        "منصات مدمجة مسبقاً؛ ولا يضيف العميل سوى الحمولة."
      ],
      "MP42 Microsatellite": [
        "القمر المصغّر MP42",
        "منصة للكوكبات",
        "حمولة تصل إلى 100 كغ في Gen-2",
        "كوكبة النرويج البحرية و280 قمراً من Meridian",
        "عماد أكبر طلبيات الشركة، بعمر تشغيلي يصل إلى سبع سنوات."
      ],
      "Gen-2 MP42D": [
        "منصة Gen-2 MP42D",
        "منصة أقمار من فئة 500 كغ",
        "حمولة تصل إلى 250 كغ",
        "أولى الإطلاقات ابتداءً من أواخر 2026",
        "أول منصة أوروبية من فئتها لا تخضع لقيود ITAR، وتستوعب حمولات SAR وSIGINT مع ألواح شمسية بقدرة كيلوواطية."
      ]
    }
  },
  "endurosat": {
    "history": "أسس رايتشو رايتشيف EnduroSat في صوفيا عام 2015 بهدف إنتاج الأقمار بكميات كبيرة كما تُنتج الطائرات المسيّرة. وأصبح EnduroSat One أول CubeSat بلغاري يصل إلى المدار عام 2018. ووصل أكثر من 100 قمر للشركة إلى المدار، وسُلّم أكثر من 200 قمر. وفي مايو 2025 جمعت 43 مليون يورو لتمويل جيلها الثالث. وفي أكتوبر من العام نفسه افتتحت أكبر مصنع فضائي في البلقان بصوفيا، وجمعت 104 ملايين دولار إضافية، مستهدفةً إنتاج قمرين من فئة ESPA يومياً. وفي سبتمبر 2026 تجاوز تقييمها مليار دولار بعد جولة تمويل بقيمة 205 ملايين دولار، لتصبح شركة يونيكورن. ويتوسع خط FRAME نحو أقمار بكتلة خمسة أطنان، مع التخطيط لإنشاء مصنع في الولايات المتحدة.",
    "productHistory": "من أقمار CubeSat بحجم 1U إلى خط FRAME من فئة ESPA؛ والهدف التالي أساطيل تصل كتلتها إلى خمسة أطنان.",
    "customers": {
      "Commercial constellation operators": "مشغّلو الكوكبات التجارية",
      "European and US defense customers": "عملاء الدفاع في أوروبا والولايات المتحدة",
      "Universities and research institutes": "الجامعات ومعاهد البحث",
      "European Innovation Council among investors": "مجلس الابتكار الأوروبي من بين المستثمرين"
    },
    "missions": {
      "EnduroSat One: Bulgaria's first CubeSat in 2018": "EnduroSat One: أول CubeSat بلغاري عام 2018",
      "Over one hundred customer satellites in orbit": "أكثر من 100 قمر لعملاء الشركة في المدار",
      "The FRAME line targeting two satellites a day": "خط FRAME المستهدف إنتاج قمرين يومياً"
    },
    "plans": {
      "A high-volume US factory": "إنشاء مصنع أمريكي للإنتاج واسع النطاق",
      "Standardized satellites up to five tons": "أقمار معيارية تصل كتلتها إلى خمسة أطنان",
      "Driving space data cost below one euro per gigabyte": "خفض تكلفة بيانات الفضاء إلى أقل من يورو واحد لكل غيغابايت"
    },
    "milestones": {
      "2015|Founded": [
        "التأسيس",
        "بدأ رايتشو رايتشيف الشركة في صوفيا."
      ],
      "2018|EnduroSat One": [
        "قمر EnduroSat One",
        "وصل أول CubeSat بلغاري إلى المدار."
      ],
      "2025|Gen3 funding": [
        "تمويل Gen3",
        "جُمِع 43 مليون يورو بقيادة Founders Fund."
      ],
      "2025|Sofia Space Center": [
        "مركز صوفيا الفضائي",
        "افتُتح أكبر مصنع فضائي في البلقان، بالتزامن مع جمع 104 ملايين دولار."
      ],
      "2026|Unicorn status": [
        "صفة يونيكورن",
        "دفعت جولة بقيمة 205 ملايين دولار تقييم الشركة إلى أكثر من مليار دولار."
      ]
    },
    "products": {
      "Software-defined CubeSats": [
        "أقمار CubeSat معرّفة بالبرمجيات",
        "قمر نانوي",
        "من 1U إلى 16U",
        "أكثر من 100 قمر في المدار",
        "تتيح تحديثات البرمجيات من المدار إضافة وظائف جديدة إلى القمر."
      ],
      "FRAME ESPA-class Line": [
        "خط FRAME من فئة ESPA",
        "قمر صغير معياري",
        "حمولة من 70 إلى 300 كغ",
        "خط صوفيا يستهدف إنتاج قمرين يومياً",
        "قابلية تكرار تصنيع بمستوى الطائرات المسيّرة، مع أسعار واضحة وتسليم سريع."
      ],
      "Satellite Subsystems": [
        "الأنظمة الفرعية للأقمار",
        "مكوّنات مؤهلة للطيران",
        "الطاقة والاتصالات والحواسيب المدمجة",
        "عملاء CubeSat حول العالم",
        "تُباع في السوق المفتوحة الوحدات نفسها التي تستخدمها الشركة في خط إنتاجها."
      ]
    }
  },
  "aac-clyde": {
    "history": "تعود جذور الشركة إلى شركتين ناشئتين تأسستا عام 2005: ÅAC Microtec في أوبسالا بالسويد وClyde Space في غلاسكو باسكتلندا. وأنتج اندماجهما عام 2018 الاسم الحالي. وأسهمت Clyde Space منذ زمن في تشغيل أقمار CubeSat حول العالم. واليوم تبني الشركة المنصات والمكوّنات وتبيع بيانات بحرية. وفي 2025 أرسل قمرها YMIR-1 من المدار أول رسالة وفق معيار تبادل البيانات البحرية الجديد. وفي العام نفسه أطلق Sedna-1 خدمة استخبارات بحرية، وسُلّمت أولى محطات الليزر CubeCAT. وفي 2026 وقّعت أكبر عقد في تاريخها لتصنيع حمولات أقمار الطقس القطبية الأوروبية، مع تسليمات تمتد حتى 2035. كما وصل قمرا رصد الأرض VIREON 1 و2 إلى المدار في مارس 2026.",
    "productHistory": "انتقلت من بطاريات وطاقة أقمار CubeSat إلى حمولات تشغيلية لأقمار الطقس الأوروبية، بعد عقدين من مكوّنات الطيران.",
    "customers": {
      "EUMETSAT": "منظمة EUMETSAT",
      "ESA": "وكالة الفضاء الأوروبية (ESA)",
      "UK Space Agency": "وكالة الفضاء البريطانية",
      "The shipping industry": "قطاع الشحن البحري"
    },
    "missions": {
      "YMIR-1: pioneer of the new maritime data standard in 2025": "YMIR-1: رائد معيار تبادل البيانات البحرية الجديد عام 2025",
      "Europe's polar weather payloads into 2035": "حمولات الطقس القطبية الأوروبية حتى 2035",
      "The Sedna and VIREON maritime data fleet": "أسطول البيانات البحرية Sedna وVIREON"
    },
    "plans": {
      "Deliver the first six Sterna sounders by end of 2028": "تسليم أول ستة أجهزة سبر Sterna بحلول نهاية 2028",
      "Launch Sedna-3 and 4 in early 2027": "إطلاق Sedna-3 وSedna-4 في أوائل 2027",
      "The next phase of Europe's maritime intelligence program": "المرحلة التالية من برنامج الاستخبارات البحرية الأوروبي"
    },
    "milestones": {
      "2005|Twin roots": [
        "جذران متوازيان",
        "تأسست Clyde Space في غلاسكو وÅAC Microtec في أوبسالا."
      ],
      "2018|Merger": [
        "الاندماج",
        "اندماج الشركتين؛ وأصبح المقر الرئيسي في أوبسالا والإنتاج في غلاسكو."
      ],
      "2025|YMIR-1": [
        "القمر YMIR-1",
        "أول قمر تشغيلي في العالم وفق معيار تبادل البيانات البحرية الجديد."
      ],
      "2025|Sedna-1 operational": [
        "بدء تشغيل Sedna-1",
        "أطلقت الشركة خدمة الاستخبارات البحرية الخاصة بها."
      ],
      "2026|Sterna contract": [
        "عقد Sterna",
        "أكبر عقد للشركة حتى الآن لحمولات أقمار الطقس القطبية الأوروبية."
      ],
      "2026|VIREON 1 & 2": [
        "VIREON 1 و2",
        "وصل قمرا الشركة لرصد الأرض إلى المدار في رحلة مشاركة واحدة."
      ]
    },
    "products": {
      "CubeSat Platforms & Subsystems": [
        "منصات وأنظمة CubeSat الفرعية",
        "أنظمة الطاقة والبطاريات وإلكترونيات الطيران",
        "خبرة طيران لمئات المهمات",
        "أقمار CubeSat حول العالم منذ العقد الأول من الألفية",
        "تُعد أنظمة الطاقة من Clyde Space من أكثر مكوّنات CubeSat تحليقاً في تاريخ القطاع."
      ],
      "CubeCAT Laser Terminal": [
        "محطة CubeCAT للاتصالات الليزرية",
        "اتصالات بصرية",
        "للأقمار الصناعية الصغيرة",
        "سُلّمت الوحدات الأولى عام 2025",
        "تستبدل وصلات الليزر عالية السرعة الاتصالات الراديوية لإرسال البيانات إلى الأرض."
      ],
      "Space-based Maritime Data": [
        "بيانات بحرية من الفضاء",
        "خدمة بيانات",
        "أسطول YMIR وSedna وVIREON",
        "القمر YMIR-1، أول أقمار معيار التبادل البحري الجديد",
        "تبيع أقمار الشركة بياناتها؛ ويجري بناء Sedna-3 وSedna-4 لإطلاقهما عام 2027."
      ]
    }
  },
  "redwire": {
    "history": "تأسست Redwire في يونيو 2020 باندماج شركات فضاء ذات خبرة، رتّبته AE Industrial Partners. ويقع مقرها في جاكسونفيل بفلوريدا، وتُتداول أسهمها في بورصة نيويورك منذ يناير 2021. ومن أشهر منتجاتها ألواح ROSA الشمسية القابلة للتمدد، وهي الألواح التي زادت قدرة محطة الفضاء الدولية. وأدخل شراء QinetiQ Space البلجيكية عام 2022 إرث أقمار Proba الأوروبية إلى الشركة. كما تضم محفظتها الطباعة ثلاثية الأبعاد والأدوية المصنّعة في الفضاء. وفي يونيو 2025 أتمت شراء Edge Autonomy مقابل 925 مليون دولار ودخلت مجال الطائرات الدفاعية المسيّرة. ومنذ 2026 تنتظم أنشطتها ضمن قطاعين: الفضاء وتقنيات الدفاع.",
    "productHistory": "من ألواح ROSA إلى آليات الالتحام القمرية؛ محفظة بُنيت عبر اندماج اثنتي عشرة شركة.",
    "customers": {
      "NASA": "وكالة NASA",
      "Thales Alenia Space": "شركة Thales Alenia Space",
      "ESA": "وكالة الفضاء الأوروبية (ESA)",
      "The US Army and allies": "الجيش الأمريكي وحلفاؤه"
    },
    "missions": {
      "ROSA arrays boosting the ISS's power": "ألواح ROSA التي زادت قدرة محطة الفضاء الدولية",
      "The docking mechanism for the lunar I-Hab": "آلية الالتحام لوحدة I-Hab القمرية",
      "Dozens of microgravity pharma experiments": "عشرات تجارب الأدوية في الجاذبية الصغرى"
    },
    "plans": {
      "ROSA arrays for Axiom's commercial station": "توفير ألواح ROSA لمحطة Axiom التجارية",
      "Next-gen ROSA and very-low-orbit satellites": "تطوير الجيل التالي من ROSA وأقمار المدار المنخفض جداً",
      "Defense growth with long-range drones": "النمو الدفاعي عبر الطائرات المسيّرة بعيدة المدى"
    },
    "milestones": {
      "2020|Formation": [
        "التأسيس",
        "اندماج Adcole Space وDeep Space Systems، ثم شراء Made In Space بعد ذلك بوقت قصير."
      ],
      "2021|NYSE and ROSA": [
        "الإدراج في NYSE وROSA",
        "أُدرجت الشركة في البورصة واستحوذت على مصنّع الألواح الشمسية القابلة للتمدد."
      ],
      "2022|QinetiQ Space": [
        "شركة QinetiQ Space",
        "اشترت الذراع البلجيكية بما تحمله من إرث أقمار Proba."
      ],
      "2025|Edge Autonomy": [
        "شركة Edge Autonomy",
        "فتح استحواذ بقيمة 925 مليون دولار سوق الطائرات الدفاعية المسيّرة."
      ],
      "2026|Brand unification": [
        "توحيد العلامة",
        "جُمعت الأنشطة كلها تحت قطاعين: الفضاء وتقنيات الدفاع."
      ]
    },
    "products": {
      "Roll-Out Solar Arrays": [
        "ألواح شمسية قابلة للتمدد",
        "توليد الطاقة في الفضاء",
        "من الأقمار الصغيرة حتى محطات الفضاء",
        "محطة الفضاء الدولية؛ وطلبية لمحطة Axiom",
        "تُفتح الألواح مثل السجادة، وهي أخف وأكثر إحكاماً من الألواح ذات المفصلات."
      ],
      "Docking & Berthing Mechanisms": [
        "آليات الالتحام والربط",
        "معدات وصل المركبات الفضائية",
        "المحطات والموائل القمرية",
        "وحدة I-Hab القمرية ومركبة Nyx",
        "تستند إلى إرث الشركة البلجيكي، وتوفر وصلات معيارية للهياكل المأهولة."
      ],
      "In-Space Manufacturing & Pharma": [
        "التصنيع والأدوية في الفضاء",
        "الطباعة ثلاثية الأبعاد وتبلور الأدوية",
        "إرث Made In Space",
        "طابعات محطة الفضاء الدولية وعشرات تجارب الأدوية",
        "انبثقت أول طابعة ثلاثية الأبعاد مدارية من هذه العائلة؛ وأصبحت صناعة الأدوية في الجاذبية الصغرى سوقاً جديدة."
      ]
    }
  }
};

    renderSatmakerCompanyArabic._arCopy = SATMAKER_AR_COPY;

    function latinDigits(value) {
      return String(value == null ? "" : value)
        .replace(/[۰-۹]/g, function (c) { return "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(c)]; })
        .replace(/[٠-٩]/g, function (c) { return "0123456789"["٠١٢٣٤٥٦٧٨٩".indexOf(c)]; })
        .replace(/٪/g, "%");
    }
    function safeEnglish(value, fallback) {
      var v = latinDigits(value).trim();
      if (!v) return fallback === undefined ? "" : fallback;
      var clean = v.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, " ")
        .replace(/[\u200C\u200D\uFEFF]/g, "").replace(/[،؛؟]/g, " ")
        .replace(/\(\s*\)/g, " ").replace(/\s+/g, " ").trim();
      return /[A-Za-z0-9]/.test(clean) ? clean : (fallback === undefined ? "" : fallback);
    }
    function arabicField(value, fallback) {
      var text = String(value == null ? "" : value).trim();
      return text && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text) && !/[پچژگکی]/.test(text) ? text : (fallback || "");
    }
    function countryArabic(value) {
      return String(value || "").split(/\s*\/\s*/).map(function (part) {
        return COUNTRY_AR[part] || (typeof countryNameAr === "function" ? countryNameAr(part, null) : null) || safeEnglish(part, "غير محدد");
      }).join(" / ");
    }
    function orgTypeArabic(value, fallback) { return ORG_TYPE_AR[value] || arabicField(o.org_type_ar, "") || fallback || "شركة فضائية"; }
    function statusArabic(value) { return STATUS_AR[value] || arabicField(value, "") || "حالة غير محددة"; }
    function productTypeArabic(value) { return PRODUCT_TYPE_AR[value] || "نوع المنتج غير محدد بالعربية حالياً."; }
    function productClassArabic(value) { return PRODUCT_CLASS_AR[value] || "فئة المنتج غير محددة بالعربية حالياً."; }

    var orgTypeStr = orgTypeArabic(o.org_type_en, "جهة فضائية");
    var stClass = "badge-private";
    if ((o.org_type_fa || "").indexOf("دولتی") > -1 || (o.org_type_en || "").indexOf("State") > -1 || (o.org_type_en || "").indexOf("Government") > -1) stClass = "badge-gov";
    var defaultLogoSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%23a3e635' stroke-width='3'/><text x='50' y='62' font-family='sans-serif' font-size='34' fill='%23a3e635' text-anchor='middle'>🛰</text></svg>";
    var logoSrc = o.logo_data || o.logo || defaultLogoSvg;

    var localizedName = arabicField(o.ar, "شركة فضائية");
    var profileDesc = arabicField(o.ar_d, "") || safeEnglish(o.en_d, "لا يتوفر وصف عربي موثّق لهذا المصنّع حالياً.");
    var makerClass = arabicField(o.maker_class_ar, "") || MAKER_CLASS_AR[o.maker_class_en] || "جهة فضائية";
    var specialty = arabicField(o.specialty_ar, "") || safeEnglish(o.specialty_en, "غير محدد");
    var country = countryArabic(o.country_ar || o.country);
    var city = arabicField(o.city_ar, "") || safeEnglish(o.city, "غير محدد");
    var founded = latinDigits(o.founded || "—");
    var flagship = arabicField(o.flagship_product_ar, "") || safeEnglish(o.flagship_product_en, "منتج غير محدد");
    var flagshipOfficial = safeEnglish(o.flagship_product_en, "");
    var flagshipDisplay = flagship;
    if (flagshipOfficial && flagshipOfficial.toLowerCase() !== flagship.toLowerCase()) flagshipDisplay += " (" + flagshipOfficial + ")";
    var flagshipStatus = statusArabic(o.flagship_product_status_en);
    var application = arabicField(o.flagship_product_app_ar, "") || safeEnglish(o.flagship_product_app_en, "");
    var buildRecord = arabicField(o.satellites_built_ar, "") || safeEnglish(o.satellites_built_en, "لا تتوفر معلومات مؤكدة عن سجل التصنيع.");
    var productLines = Array.isArray(o.product_lines_bilingual) ? o.product_lines_bilingual : [];
    var copy = SATMAKER_AR_COPY[o.id] || {};

    // Header follows the Persian dossier structure and order.
    h += '<div class="d-head" style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-inline-end:35px;">';
    h += '<div style="display:flex; gap:10px; align-items:center; flex:1;">';
    h += '<div style="width:48px; height:48px; border-radius:8px; background:#000; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; padding:2px;">';
    h += '<img src="' + esc(logoSrc) + '" alt="' + esc(localizedName) + '" style="max-width:100%; max-height:100%; object-fit:contain;" /></div>';
    h += '<div><div class="d-kicker">' + esc(safeEnglish(o.en || o.fa, "")) + '</div>';
    h += '<h2 class="d-title" style="margin:0;">' + esc(localizedName) + '</h2></div></div>';
    h += '<span class="' + stClass + '" style="padding:3px 10px; border-radius:12px; font-size:10.5px; font-weight:bold; white-space:nowrap;"><bdi>' + esc(orgTypeStr) + '</bdi></span>';
    h += '</div>';
    h += '<div class="d-desc" style="margin-top:6px; line-height:1.6;">' + esc(profileDesc) + '</div>';

    // Three dossier tabs, matching the Persian IDs and order.
    h += '<div class="site-tabs" style="margin-top:10px;">';
    h += '<button class="site-tab-btn active" onclick="switchCompTab(\'overview\', this)">نظرة عامة والتخصص</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'products\', this)">المنتجات والعملاء</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'timeline\', this)">الإنجازات والخطط</button>';
    h += '</div>';

    // TAB 1: OVERVIEW
    var mClass = makerClass;
    var spec = specialty;
    h += '<div id="compTabOverview" class="site-tab-content active" style="display:block;">';
    h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:8px; font-size:10.5px;">';
    h += '<div style="background:var(--bg2); border:1px solid var(--line); padding:7px 9px; border-radius:6px;"><b style="color:var(--accent);">الفئة:</b><br><bdi style="color:var(--text);">' + esc(mClass) + '</bdi></div>';
    h += '<div style="background:var(--bg2); border:1px solid var(--line); padding:7px 9px; border-radius:6px;"><b style="color:var(--accent);">التخصص:</b><br><bdi style="color:var(--text);">' + esc(spec) + '</bdi></div>';
    h += '<div style="background:var(--bg2); border:1px solid var(--line); padding:7px 9px; border-radius:6px;"><b>الدولة / المدينة:</b> <bdi>' + esc((country || "—") + " / " + (city || "—")) + '</bdi></div>';
    h += '<div style="background:var(--bg2); border:1px solid var(--line); padding:7px 9px; border-radius:6px;"><b>سنة التأسيس:</b> ' + esc(founded) + '</div>';
    h += '</div>';

    // Flagship product box uses the Persian template's card hierarchy.
    var flagP = flagshipDisplay;
    if (flagP) {
      var flagSt = flagshipStatus || "قيد التشغيل";
      var flagApp = application;
      h += '<div style="background:linear-gradient(135deg, rgba(21, 38, 58, 0.92) 0%, rgba(9, 13, 22, 0.96) 100%); border:1px solid rgba(163, 230, 53, 0.4); border-radius:8px; padding:10px 12px; margin-top:8px;">';
      h += '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">';
      h += '<span style="font-size:12px; font-weight:bold; color:#a3e635;">🛰 المنتج الرئيس: <b><bdi style="color:#f2c649;">' + esc(flagP) + '</bdi></b></span>';
      h += '<span class="badge-gov" style="padding:2px 8px; border-radius:10px; font-size:10px;"><bdi>' + esc(flagSt) + '</bdi></span></div>';
      if (flagApp) h += '<div style="font-size:10.5px; color:#4ec9d8; margin-top:4px; line-height:1.5;">🎯 <b>الاستخدام الأساسي:</b> <bdi>' + esc(flagApp) + '</bdi></div>';
      h += '</div>';
    }

    var historyText = arabicField(o.history_ar, "") || copy.history || "لا تتوفر نبذة تاريخية عربية لهذا المصنّع حالياً.";
    var productHistory = arabicField(o.product_history_ar, "") || copy.productHistory || "";
    if (productHistory) historyText = historyText ? historyText + " — تطور المنتجات: " + productHistory : productHistory;
    if (historyText) {
      h += '<div style="background:rgba(15, 31, 51, 0.88); border:1px solid rgba(163, 230, 53, 0.3); border-radius:8px; padding:12px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#a3e635; margin-bottom:6px;">📜 نبذة تاريخية ومكانة صناعية:</div>';
      h += '<div style="font-size:10.5px; color:#4ec9d8; line-height:1.6;">' + esc(historyText) + '</div></div>';
    }

    var webUrl = o.site || o.website || "";
    if (webUrl) {
      var displayWeb = String(webUrl).replace(/^https?:\/\//, "").replace(/\/$/, "");
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px; font-size:10.5px;">';
      h += '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent-2); font-weight:bold; font-family:monospace; text-decoration:none; background:rgba(56,189,248,0.12); padding:5px 12px; border-radius:6px; border:1px solid rgba(56,189,248,0.3); word-break:break-all;">🌐 ' + esc(displayWeb) + ' ↗</a></div>';
    }
    h += '</div>'; // end TAB 1

    // TAB 2: PRODUCTS & CUSTOMERS
    h += '<div id="compTabProducts" class="site-tab-content" style="display:none;">';
    if (productLines.length) {
      h += '<div style="font-size:10.5px; color:var(--muted); margin:8px 0 6px;">🛰 اضغط على خط المنتج لعرض تفاصيله:</div>';
      h += '<div style="display:flex; flex-direction:column; gap:8px;">';
      productLines.forEach(function (pr, idx) {
        var rawName = safeEnglish(pr.name_en, "");
        var productCopy = (copy.products || {})[rawName] || [];
        var isFlagship = Boolean(rawName && flagshipOfficial && rawName.toLowerCase() === flagshipOfficial.toLowerCase());
        var translatedName = arabicField(pr.name_ar, "") || productCopy[0] || (isFlagship ? flagship : "");
        var prName = translatedName || "منتج غير محدد";
        if (translatedName && rawName && translatedName.toLowerCase() !== rawName.toLowerCase()) prName += " (" + rawName + ")";
        var prType = arabicField(pr.type_ar, "") || productCopy[1] || productTypeArabic(pr.type_en || pr.type_fa || "—");
        var prClass = arabicField(pr.class_ar, "") || productCopy[2] || productClassArabic(pr.class_en || pr.class_fa || "—");
        var prSt = arabicField(pr.status_ar, "") || statusArabic(pr.status_en || pr.status_fa);
        var prUsed = arabicField(pr.used_on_ar, "") || productCopy[3] || "معلومات الاستخدام غير متاحة بالعربية حالياً.";
        var prDesc = arabicField(pr.engineering_desc_ar, "") || productCopy[4] || "لا يتوفر وصف هندسي عربي لهذا المنتج حالياً.";
        h += '<details class="acc"' + (idx === 0 ? " open" : "") + ' style="background:linear-gradient(180deg, rgba(15,31,51,0.8) 0%, rgba(9,13,22,0.9) 100%); border:1px solid var(--line); border-radius:8px; overflow:hidden;">';
        h += '<summary style="padding:10px 12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; user-select:none; background:rgba(255,255,255,0.03);">';
        h += '<div style="font-size:12px; font-weight:bold; color:#f2c649; flex:1; min-width:160px; line-height:1.45;">🛰 <bdi>' + esc(prName) + '</bdi></div>';
        h += '<span style="color:#10b981; font-size:9.5px; font-weight:bold; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); padding:2px 7px; border-radius:12px;"><bdi>' + esc(prSt) + '</bdi></span>';
        h += '<span style="color:#8ba3c4; font-size:10px; opacity:0.8;">▼</span></summary>';
        h += '<div style="padding:12px; border-top:1px solid rgba(255,255,255,0.08); background:rgba(4,10,18,0.7); color:#e7f0fb; font-size:10.5px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>نوع المنتج:</b><br><bdi style="color:#f2c649;">' + esc(prType) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>الفئة:</b><br><bdi style="color:#f2c649;">' + esc(prClass) + '</bdi></div></div>';
        if (prDesc) h += '<div style="background:rgba(15, 31, 51, 0.88); border:1px solid rgba(163,230,53,0.3); border-radius:6px; padding:8px 10px;"><b style="color:#a3e635;">🛠️ الوصف الهندسي:</b> <span style="color:#4ec9d8;">' + esc(prDesc) + '</span></div>';
        h += '<div style="color:#4ec9d8; background:linear-gradient(90deg, rgba(78, 201, 216, 0.12) 0%, rgba(0, 125, 145, 0.06) 100%); border:1px solid rgba(78, 201, 216, 0.35); padding:8px 10px; border-radius:6px;">';
        h += '<div style="font-size:11px; font-weight:bold; color:#a3e635; margin-bottom:2px;">🎯 يُستخدم في:</div>';
        h += '<div style="font-size:10.5px;"><bdi>' + esc(prUsed) + '</bdi></div>';
        var cids = pr.customer_ids || [];
        if (cids.length && window.compById) {
          h += '<div style="display:flex; gap:5px; flex-wrap:wrap; margin-top:6px;">';
          cids.forEach(function (cid2) {
            var tc = window.compById(cid2);
            if (!tc) return;
            var customerName = arabicField(tc.ar, "") || safeEnglish(tc.en || tc.fa, "");
            h += '<a href="#" onclick="openDetailById(\'' + esc(cid2) + '\', \'launch\'); return false;" style="color:#2fd4a7; font-size:9.5px; font-weight:bold; text-decoration:none; background:rgba(47,212,167,0.12); border:1px solid rgba(47,212,167,0.35); padding:2px 8px; border-radius:10px; cursor:pointer; white-space:nowrap;">🤝 <bdi>' + esc(customerName) + '</bdi> ↗</a>';
          });
          h += '</div>';
        }
        h += '</div></div></details>';
      });
      h += '</div>';
    } else {
      h += '<div style="background:rgba(255,255,255,0.03); border:1px dashed var(--line); padding:12px; text-align:center; border-radius:6px; color:var(--muted); font-size:11px; margin-top:8px;">لا توجد خطوط منتجات مسجلة.</div>';
    }
    var custs = o.customers_ar && o.customers_ar.length ? o.customers_ar :
      Object.keys(copy.customers || {}).map(function (key) { return copy.customers[key]; });
    if (custs.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:6px;">🤝 العملاء الرئيسيون:</div>';
      h += '<div style="display:flex; gap:5px; flex-wrap:wrap;">';
      custs.forEach(function (cu) { h += '<span style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); padding:3px 9px; border-radius:10px; font-size:10px; color:var(--text);"><bdi>' + esc(arabicField(cu, "عميل غير محدد")) + '</bdi></span>'; });
      h += '</div></div>';
    }
    h += '</div>'; // end TAB 2

    // TAB 3: TRACK RECORD & FUTURE
    h += '<div id="compTabTimeline" class="site-tab-content" style="display:none;">';
    var built = buildRecord;
    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px; font-size:10.5px;"><b style="color:#a3e635;">📦 سجل الأقمار والمكوّنات:</b> <bdi style="color:var(--text);">' + esc(built) + '</bdi></div>';
    var mils = o.milestones_ar || o.milestones_en || [];
    if (mils.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--amber); margin-bottom:6px;">🏁 محطات بارزة:</div>';
      h += '<div style="display:flex; flex-direction:column; gap:6px;">';
      mils.forEach(function (ms, idx) {
        var milestoneKey = String(ms.year || "") + "|" + String(ms.title_en || ms.title || "");
        var milestoneCopy = (copy.milestones || {})[milestoneKey] || [];
        var year = latinDigits(ms.year || "");
        var title = arabicField(ms.title_ar, "") || milestoneCopy[0] || "محطة بارزة";
        var detail = arabicField(ms.desc_ar, "") || milestoneCopy[1] || "";
        if (!year && !title && !detail) return;
        h += '<div style="background:rgba(0,0,0,0.18); border-right:3px solid #a3e635; padding:7px 9px; border-radius:5px; font-size:10.5px;">';
        h += '<b style="color:var(--text);"><code style="color:var(--amber); font-family:monospace;"><bdi>' + esc(year) + '</bdi></code> — ' + esc(title) + '</b>';
        if (detail) h += '<div style="color:var(--muted); margin-top:3px; line-height:1.5;">' + esc(detail) + '</div>';
        h += '</div>';
      });
      h += '</div></div>';
    }
    var notable = o.notable_missions_ar && o.notable_missions_ar.length ? o.notable_missions_ar :
      Object.keys(copy.missions || {}).map(function (key) { return copy.missions[key]; });
    if (notable.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:6px;">🎯 المشاريع البارزة:</div>';
      notable.forEach(function (m) { h += '<div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); padding:6px; border-radius:4px; font-size:10.5px; color:var(--text); margin-bottom:4px;">🛰 ' + esc(arabicField(m, "مهمة غير محددة")) + '</div>'; });
      h += '</div>';
    }
    var futs = o.future_plans_ar && o.future_plans_ar.length ? o.future_plans_ar :
      Object.keys(copy.plans || {}).map(function (key) { return copy.plans[key]; });
    if (futs.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:6px;">🚀 الخطط المستقبلية المعلنة:</div>';
      futs.forEach(function (f) { h += '<div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.2); padding:6px; border-radius:4px; font-size:10.5px; color:var(--text); margin-bottom:4px;">▫️ ' + esc(arabicField(f, "خطة غير محددة")) + '</div>'; });
      h += '</div>';
    }
    h += '</div>'; // end TAB 3

    return h;
  }
  function renderSatmakerDetail(p) {
    if (LANG === "ar") return renderSatmakerCompanyArabic(p);
    var o = p.o || p, h = "";
    var isFa = (typeof LANG !== "undefined" && LANG === "fa");

    var orgTypeStr = isFa ? (o.org_type_fa || o.org_type_en || "شرکت فضایی") : (o.org_type_en || o.org_type_fa || "Space company");
    var stClass = "badge-private";
    if ((o.org_type_fa || "").indexOf("دولتی") > -1 || (o.org_type_en || "").indexOf("State") > -1 || (o.org_type_en || "").indexOf("Government") > -1) stClass = "badge-gov";

    var defaultLogoSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23090d16' stroke='%23a3e635' stroke-width='3'/><text x='50' y='62' font-family='sans-serif' font-size='34' fill='%23a3e635' text-anchor='middle'>🛰</text></svg>";
    var logoSrc = o.logo_data || o.logo || defaultLogoSvg;

    h += '<div class="d-head" style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-inline-end:35px;">';
    h += '<div style="display:flex; gap:10px; align-items:center; flex:1;">';
    h += '<div style="width:48px; height:48px; border-radius:8px; background:#000; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; flex:0 0 auto; overflow:hidden; padding:2px;">';
    h += '<img src="' + esc(logoSrc) + '" alt="' + esc(name(o)) + '" style="max-width:100%; max-height:100%; object-fit:contain;" /></div>';
    h += '<div><div class="d-kicker">' + esc(isFa ? (o.en || o.fa) : (o.en || o.fa)) + '</div>';
    h += '<h2 class="d-title" style="margin:0;">' + esc(name(o)) + '</h2></div></div>';
    h += '<span class="' + stClass + '" style="padding:3px 10px; border-radius:12px; font-size:10.5px; font-weight:bold; white-space:nowrap;"><bdi>' + esc(orgTypeStr) + '</bdi></span>';
    h += '</div>';
    h += '<div class="d-desc" style="margin-top:6px; line-height:1.6;">' + esc(desc(o)) + '</div>';

    // 3 tabs
    h += '<div class="site-tabs" style="margin-top:10px;">';
    h += '<button class="site-tab-btn active" onclick="switchCompTab(\'overview\', this)">' + (isFa ? "شناسنامه و تخصص" : "Overview & Specialty") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'products\', this)">' + (isFa ? "محصولات و مشتری‌ها" : "Products & Customers") + '</button>';
    h += '<button class="site-tab-btn" onclick="switchCompTab(\'timeline\', this)">' + (isFa ? "کارنامه و آینده" : "Track Record & Future") + '</button>';
    h += '</div>';

    /* ---- TAB 1: OVERVIEW ---- */
    h += '<div id="compTabOverview" class="site-tab-content active" style="display:block;">';
    var mClass = isFa ? (o.maker_class_fa || o.maker_class_en || "—") : (o.maker_class_en || o.maker_class_fa || "—");
    var spec = isFa ? (o.specialty_fa || o.specialty_en || "—") : (o.specialty_en || o.specialty_fa || "—");
    h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:8px; font-size:10.5px;">';
    h += '<div style="background:var(--bg2); border:1px solid var(--line); padding:7px 9px; border-radius:6px;"><b style="color:var(--accent);">' + (isFa ? "زیرگونه:" : "Class:") + '</b><br><bdi style="color:var(--text);">' + esc(mClass) + '</bdi></div>';
    h += '<div style="background:var(--bg2); border:1px solid var(--line); padding:7px 9px; border-radius:6px;"><b style="color:var(--accent);">' + (isFa ? "حوزهٔ تخصص:" : "Specialty:") + '</b><br><bdi style="color:var(--text);">' + esc(spec) + '</bdi></div>';
    h += '<div style="background:var(--bg2); border:1px solid var(--line); padding:7px 9px; border-radius:6px;"><b>' + (isFa ? "کشور / شهر:" : "Country / City:") + '</b> <bdi>' + esc(isFa ? ((o.country_fa || "—") + " / " + (o.city_fa || "—")) : ((o.country || o.country_fa || "—") + " / " + (o.city || o.city_fa || "—"))) + '</bdi></div>';
    h += '<div style="background:var(--bg2); border:1px solid var(--line); padding:7px 9px; border-radius:6px;"><b>' + (isFa ? "سال تأسیس:" : "Founded:") + '</b> ' + esc(o.founded || "—") + '</div>';
    h += '</div>';

    // Flagship product box (dark island → explicit light text only)
    var flagP = isFa ? (o.flagship_product_fa || o.flagship_product_en) : (o.flagship_product_en || o.flagship_product_fa);
    if (flagP) {
      var flagSt = isFa ? (o.flagship_product_status_fa || "عملیاتی") : (o.flagship_product_status_en || "Operational");
      var flagApp = isFa ? (o.flagship_product_app_fa || "") : (o.flagship_product_app_en || "");
      h += '<div style="background:linear-gradient(135deg, rgba(21, 38, 58, 0.92) 0%, rgba(9, 13, 22, 0.96) 100%); border:1px solid rgba(163, 230, 53, 0.4); border-radius:8px; padding:10px 12px; margin-top:8px;">';
      h += '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">';
      h += '<span style="font-size:12px; font-weight:bold; color:#a3e635;">🛰 ' + (isFa ? "محصول شاخص:" : "Flagship Product:") + ' <b><bdi style="color:#f2c649;">' + esc(flagP) + '</bdi></b></span>';
      h += '<span class="badge-gov" style="padding:2px 8px; border-radius:10px; font-size:10px;"><bdi>' + esc(flagSt) + '</bdi></span></div>';
      if (flagApp) h += '<div style="font-size:10.5px; color:#4ec9d8; margin-top:4px; line-height:1.5;">🎯 <b>' + (isFa ? "کاربرد اصلی:" : "Primary Use:") + '</b> <bdi>' + esc(flagApp) + '</bdi></div>';
      h += '</div>';
    }

    // History box (dark island → explicit light text)
    var histText = isFa ? (o.history_fa || o.history_en || o.fa_d) : (o.history_en || o.history_fa || o.en_d);
    if (histText) {
      h += '<div style="background:rgba(15, 31, 51, 0.88); border:1px solid rgba(163, 230, 53, 0.3); border-radius:8px; padding:12px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#a3e635; margin-bottom:6px;">📜 ' + (isFa ? "تاریخچه و جایگاه صنعتی:" : "History & Standing:") + '</div>';
      h += '<div style="font-size:10.5px; color:#4ec9d8; line-height:1.6;">' + esc(histText) + '</div></div>';
    }

    // Website
    var webUrl = o.site || o.website || "";
    if (webUrl) {
      var displayWeb = String(webUrl).replace(/^https?:\/\//, "").replace(/\/$/, "");
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px; font-size:10.5px;">';
      h += '<a href="' + esc(webUrl) + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent-2); font-weight:bold; font-family:monospace; text-decoration:none; background:rgba(56,189,248,0.12); padding:5px 12px; border-radius:6px; border:1px solid rgba(56,189,248,0.3); word-break:break-all;">🌐 ' + esc(displayWeb) + ' ↗</a></div>';
    }
    h += '</div>'; // end TAB 1

    /* ---- TAB 2: PRODUCTS & CUSTOMERS ---- */
    h += '<div id="compTabProducts" class="site-tab-content" style="display:none;">';
    var pl = o.product_lines_bilingual || [];
    if (pl.length) {
      h += '<div style="font-size:10.5px; color:var(--muted); margin:8px 0 6px;">🛰 ' + (isFa ? "برای مشاهدهٔ مشخصات هر خط محصول روی آن کلیک کنید:" : "Click a product line for details:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:8px;">';
      pl.forEach(function (pr, idx) {
        var prName = isFa ? (pr.name_fa || pr.name_en) : (pr.name_en || pr.name_fa);
        var prType = isFa ? (pr.type_fa || pr.type_en || "—") : (pr.type_en || pr.type_fa || "—");
        var prClass = isFa ? (pr.class_fa || pr.class_en || "—") : (pr.class_en || pr.class_fa || "—");
        var prSt = isFa ? (pr.status_fa || "عملیاتی") : (pr.status_en || "Operational");
        var prUsed = isFa ? (pr.used_on_fa || pr.used_on_en || "—") : (pr.used_on_en || pr.used_on_fa || "—");
        var prDesc = isFa ? (pr.engineering_desc_fa || "") : (pr.engineering_desc_en || "");
        h += '<details class="acc"' + (idx === 0 ? " open" : "") + ' style="background:linear-gradient(180deg, rgba(15,31,51,0.8) 0%, rgba(9,13,22,0.9) 100%); border:1px solid var(--line); border-radius:8px; overflow:hidden;">';
        h += '<summary style="padding:10px 12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; user-select:none; background:rgba(255,255,255,0.03);">';
        h += '<div style="font-size:12px; font-weight:bold; color:#f2c649; flex:1; min-width:160px; line-height:1.45;">🛰 <bdi>' + esc(prName) + '</bdi></div>';
        h += '<span style="color:#10b981; font-size:9.5px; font-weight:bold; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); padding:2px 7px; border-radius:12px;"><bdi>' + esc(prSt) + '</bdi></span>';
        h += '<span style="color:#8ba3c4; font-size:10px; opacity:0.8;">▼</span></summary>';
        h += '<div style="padding:12px; border-top:1px solid rgba(255,255,255,0.08); background:rgba(4,10,18,0.7); color:#e7f0fb; font-size:10.5px; display:flex; flex-direction:column; gap:6px;">';
        h += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>' + (isFa ? "نوع محصول:" : "Type:") + '</b><br><bdi style="color:#f2c649;">' + esc(prType) + '</bdi></div>';
        h += '<div style="background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:4px; border:1px solid var(--line);"><b>' + (isFa ? "کلاس / رده:" : "Class:") + '</b><br><bdi style="color:#f2c649;">' + esc(prClass) + '</bdi></div></div>';
        if (prDesc) h += '<div style="background:rgba(15, 31, 51, 0.88); border:1px solid rgba(163,230,53,0.3); border-radius:6px; padding:8px 10px;"><b style="color:#a3e635;">🛠️ ' + (isFa ? "شرح مهندسی:" : "Engineering:") + '</b> <span style="color:#4ec9d8;">' + esc(prDesc) + '</span></div>';
        h += '<div style="color:#4ec9d8; background:linear-gradient(90deg, rgba(78, 201, 216, 0.12) 0%, rgba(0, 125, 145, 0.06) 100%); border:1px solid rgba(78, 201, 216, 0.35); padding:8px 10px; border-radius:6px;">';
        h += '<div style="font-size:11px; font-weight:bold; color:#a3e635; margin-bottom:2px;">🎯 ' + (isFa ? "به‌کاررفته در:" : "Used on:") + '</div>';
        h += '<div style="font-size:10.5px;"><bdi>' + esc(prUsed) + '</bdi></div>';
        var cids = pr.customer_ids || [];
        if (cids.length && window.compById) {
          h += '<div style="display:flex; gap:5px; flex-wrap:wrap; margin-top:6px;">';
          cids.forEach(function (cid2) {
            var tc = window.compById(cid2);
            if (!tc) return;
            h += '<a href="#" onclick="openDetailById(\'' + esc(cid2) + '\', \'launch\'); return false;" style="color:#2fd4a7; font-size:9.5px; font-weight:bold; text-decoration:none; background:rgba(47,212,167,0.12); border:1px solid rgba(47,212,167,0.35); padding:2px 8px; border-radius:10px; cursor:pointer; white-space:nowrap;">🤝 <bdi>' + esc(isFa ? (tc.fa || tc.en) : (tc.en || tc.fa)) + '</bdi> ↗</a>';
          });
          h += '</div>';
        }
        h += '</div></div></details>';
      });
      h += '</div>';
    } else {
      h += '<div style="background:rgba(255,255,255,0.03); border:1px dashed var(--line); padding:12px; text-align:center; border-radius:6px; color:var(--muted); font-size:11px; margin-top:8px;">' + (isFa ? "خط محصول ثبت نشده است." : "No product lines recorded.") + '</div>';
    }
    var custs = isFa ? (o.customers_fa || []) : (o.customers_en || o.customers_fa || []);
    if (custs.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:6px;">🤝 ' + (isFa ? "مشتریان اصلی:" : "Key Customers:") + '</div>';
      h += '<div style="display:flex; gap:5px; flex-wrap:wrap;">';
      custs.forEach(function (cu) { h += '<span style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); padding:3px 9px; border-radius:10px; font-size:10px; color:var(--text);"><bdi>' + esc(cu) + '</bdi></span>'; });
      h += '</div></div>';
    }
    h += '</div>'; // end TAB 2

    /* ---- TAB 3: TRACK RECORD & FUTURE ---- */
    h += '<div id="compTabTimeline" class="site-tab-content" style="display:none;">';
    var built = isFa ? (o.satellites_built_fa || "—") : (o.satellites_built_en || o.satellites_built_fa || "—");
    h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px; font-size:10.5px;"><b style="color:#a3e635;">📦 ' + (isFa ? "کارنامهٔ ساخت:" : "Build Record:") + '</b> <bdi style="color:var(--text);">' + esc(built) + '</bdi></div>';
    var mils = isFa ? (o.milestones_fa || []) : (o.milestones_en || o.milestones_fa || []);
    if (mils.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--amber); margin-bottom:6px;">🏁 ' + (isFa ? "نقاط عطف:" : "Milestones:") + '</div>';
      h += '<div style="display:flex; flex-direction:column; gap:6px;">';
      mils.forEach(function (ms) {
        h += '<div style="background:rgba(0,0,0,0.18); border-right:3px solid #a3e635; padding:7px 9px; border-radius:5px; font-size:10.5px;">';
        h += '<b style="color:var(--text);"><code style="color:var(--amber); font-family:monospace;"><bdi>' + esc(ms.year || "") + '</bdi></code> — ' + esc(ms.title || "") + '</b>';
        if (ms.desc) h += '<div style="color:var(--muted); margin-top:3px; line-height:1.5;">' + esc(ms.desc) + '</div>';
        h += '</div>';
      });
      h += '</div></div>';
    }
    var notable = isFa ? (o.notable_missions_fa || []) : (o.notable_missions_en || o.notable_missions_fa || []);
    if (notable.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:#10b981; margin-bottom:6px;">🎯 ' + (isFa ? "پروژه‌های شاخص:" : "Notable Projects:") + '</div>';
      notable.forEach(function (m) { h += '<div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); padding:6px; border-radius:4px; font-size:10.5px; color:var(--text); margin-bottom:4px;">🛰 ' + esc(m) + '</div>'; });
      h += '</div>';
    }
    var futs = isFa ? (o.future_plans_fa || []) : (o.future_plans_en || o.future_plans_fa || []);
    if (futs.length) {
      h += '<div style="background:var(--bg2); border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">';
      h += '<div style="font-size:11.5px; font-weight:bold; color:var(--accent); margin-bottom:6px;">🚀 ' + (isFa ? "برنامه‌های آینده:" : "Future Plans:") + '</div>';
      futs.forEach(function (f) { h += '<div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.2); padding:6px; border-radius:4px; font-size:10.5px; color:var(--text); margin-bottom:4px;">▫️ ' + esc(f) + '</div>'; });
      h += '</div>';
    }
    h += '</div>'; // end TAB 3

    return h;
  }
  window.renderSatmakerDetail = renderSatmakerDetail;

  function renderRecoveryVideos(event) {
    var seen = {}, videos = (Array.isArray(event.videos) ? event.videos : []).filter(function (video) {
      if (!validRecoveryVideo(video, event.id) || seen[video.url]) return false;
      seen[video.url] = true; return true;
    });
    if (!videos.length) return "";
    var labels = {
      landing: recoveryUi("تماشای ویدئوی فرود", "Watch landing video", "مشاهدة فيديو الهبوط"),
      recovery: recoveryUi("تماشای عملیات بازیابی", "Watch recovery footage", "مشاهدة لقطات الاستعادة"),
      return_coverage: recoveryUi("تماشای پوشش بازگشت", "Watch return coverage", "مشاهدة تغطية العودة"),
      mission_recap: recoveryUi("تماشای گزارش ویدئویی", "Watch video report", "مشاهدة التقرير المصور")
    };
    var openLabel = recoveryUi("بازشدن در زبانهٔ جدید", "opens in a new tab", "يفتح في علامة تبويب جديدة");
    var sectionLabel = recoveryUi("ویدئوی همین رویداد", "Video of this event", "فيديو مرتبط بهذا الحدث");
    var h = '<section class="recovery-media" aria-label="' + esc(sectionLabel) + '">';
    videos.forEach(function (video) {
      var title = recoveryDisplay(video.title_fa, video.title_en, video.title_ar, "");
      var provider = recoveryDisplay(video.provider_fa, video.provider_en, video.provider_ar, "");
      var label = labels[video.kind] || recoveryUi("گزارش ویدئویی", "Video report", "تقرير مصور");
      h += '<a class="recovery-video-link" href="' + esc(video.url) + '" target="_blank" rel="noopener noreferrer"' +
        ' data-video-id="' + esc(video.id) + '" data-video-kind="' + esc(video.kind) + '" aria-label="' +
        esc(label + ' — ' + title + ' — ' + openLabel) + '">' +
        '<span class="recovery-play" aria-hidden="true">▶</span><span class="recovery-video-copy"><strong>' + esc(label) +
        '</strong><span><bdi>' + esc(title) + '</bdi></span></span><span aria-hidden="true">↗</span></a>' +
        '<div class="recovery-video-meta"><span><bdi>' + esc(provider) + '</bdi></span><span>' +
        recoveryUi("بررسی پیوند: ", "Link checked: ", "تاريخ التحقق من الرابط: ") + esc(recoveryDate(video.verified_on)) + '</span></div>';
    });
    return h + '<p class="recovery-video-note">' +
      recoveryUi("ویدئو در سایت مرجع باز می‌شود. پوشش آرشیوی ممکن است طولانی باشد؛ پخش به شرایط دسترسی سایت مقصد وابسته است.",
        "Opens on the source website. Archived coverage may be long; playback depends on the destination’s access conditions.",
        "يُفتح الفيديو على موقع المصدر. قد تكون المادة الأرشيفية طويلة، ويعتمد تشغيلها على شروط الوصول لدى الموقع المستهدف.") + '</p></section>';
  }

  /* ============ فرودهای پیشِ رو — نمونهٔ آزمایشی روی چند پایگاه ============ */
  function recoveryUpcomingRows(o) {
    if (!UPL.data || !Array.isArray(UPL.data.landings)) return null;
    var sample = UPL.data.sample_site_ids || [];
    if (sample.length && sample.indexOf(o.id) < 0) return null;
    var rows = UPL.data.landings.filter(function (r) { return r.site_id === o.id; });
    rows.sort(function (a, b) {
      if (a.date && b.date) return a.date.localeCompare(b.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });
    return rows;
  }
  function recoveryUpcomingTabButton(o, fa, ar) {
    var rows = recoveryUpcomingRows(o);
    if (rows === null) return "";
    return '<button type="button" id="recoveryUpcomingTab" role="tab" aria-selected="false" aria-controls="recoveryUpcoming" tabindex="-1" data-recovery-tab="upcoming">' +
      recoveryUi("فرودهای پیشِ رو", "Upcoming landings", "حالات الهبوط القادمة") + (rows.length ? " (" + fmtNum(rows.length) + ")" : "") + '</button>';
  }
  function renderRecoveryUpcomingPanel(o, fa, ar) {
    var rows = recoveryUpcomingRows(o);
    if (rows === null) return "";
    var types = {
      asds: recoveryUi("فرود روی شناور دریایی", "Droneship landing", "هبوط على سفينة بحرية"),
      rtls: recoveryUi("فرود زمینی کنار سکوی پرتاب", "Return to launch site", "عودة إلى موقع الإطلاق"),
      runway: recoveryUi("فرود افقی روی باند", "Runway landing", "هبوط على مدرج"),
      parachute: recoveryUi("فرود چتری روی خشکی", "Parachute land landing", "هبوط بالمظلة على اليابسة")
    };
    var statuses = {
      go: recoveryUi("زمان‌بندی قطعی", "Scheduled", "مجدول"),
      tbc: recoveryUi("در انتظار تأیید", "To be confirmed", "بانتظار التأكيد"),
      queued: recoveryUi("در صف — تاریخ نامشخص", "Queued — date TBD", "في قائمة الانتظار — الموعد غير محدد")
    };
    var h = '<section id="recoveryUpcoming" class="recovery-tab-panel" role="tabpanel" aria-labelledby="recoveryUpcomingTab" tabindex="0" hidden>';
    var sourceNote = recoveryDisplay(UPL.data.source_note_fa, UPL.data.source_note_en, UPL.data.source_note_ar, "");
    h += '<div class="recovery-coverage"><div><strong>' + recoveryUi("فرودهای در انتظار", "Pending landings", "حالات الهبوط المنتظرة") + '</strong><span>' +
      recoveryUi("غیرزنده", "Not live", "بيانات غير مباشرة") + '</span></div><p>' + esc(sourceNote) + '</p></div>';
    var fieldDefs = [
      ["mtype", recoveryUi("نوع مأموریت", "Mission type", "نوع المهمة")],
      ["customer", recoveryUi("مشتری و بهره‌بردار", "Customer & operator", "العميل والمشغّل")],
      ["time", recoveryUi("زمان حدودی", "Approximate time", "الوقت التقريبي")],
      ["origin", recoveryUi("مبدأ بازگشت", "Return origin", "موقع الانطلاق")],
      ["booster", recoveryUi("بوستر", "Booster", "المعزّز")],
      ["downrange", recoveryUi("فاصلهٔ محل فرود", "Landing distance", "المسافة إلى موقع الهبوط")]
    ];
    function uplVal(r, key) {
      var value = recoveryDisplay(r[key + "_fa"], r[key + "_en"], r[key + "_ar"], "");
      if (value === "غير متاح" || value === "—") value = "";
      if (value && key === "time") {
        var precision = recoveryDisplay(r.precision_fa, r.precision_en, r.precision_ar, "");
        if (precision && precision !== "غير متاح" && precision !== "—") value += " · " + precision;
      }
      return value;
    }
    var lifted = {}, liftedPartial = {};
    if (rows.length > 1) {
      fieldDefs.forEach(function (field) {
        var values = rows.map(function (row) { return uplVal(row, field[0]); }).filter(Boolean);
        if (values.length < 2) return;
        if (values.every(function (value) { return value === values[0]; })) {
          lifted[field[0]] = values[0]; liftedPartial[field[0]] = values.length < rows.length;
        }
      });
    }
    var shared = (UPL.data.site_shared || {})[o.id];
    var sharedFacts = [];
    if (shared) {
      var tplus = recoveryDisplay(shared.tplus_fa, shared.tplus_en, shared.tplus_ar, "");
      if (tplus && tplus !== "غير متاح" && tplus !== "—") {
        sharedFacts.push('<div><dt>' + recoveryUi("زمان فرود نسبت به پرتاب", "Landing time after liftoff", "الفترة من الإقلاع إلى الهبوط") +
          '</dt><dd>' + esc(tplus) + '</dd></div>');
      }
    }
    fieldDefs.forEach(function (field) {
      if (!lifted[field[0]]) return;
      var label = field[1] + (liftedPartial[field[0]] ? recoveryUi(" (ردیف‌های دارای این داده)", " (rows with this data)", " (في الصفوف التي تتوفر فيها المعلومة)") : "");
      sharedFacts.push('<div><dt>' + label + '</dt><dd>' + esc(lifted[field[0]]) + '</dd></div>');
    });
    if (rows.length && sharedFacts.length) {
      h += '<div class="recovery-section-label">' + recoveryUi("ویژگی‌های مشترک این فهرست", "Shared traits of this list", "سمات مشتركة في هذه القائمة") +
        '</div><dl class="recovery-facts">' + sharedFacts.join("") + '</dl>';
    }
    if (!rows.length) {
      h += '<p class="recovery-description">' + recoveryUi("در پنجرهٔ فعلی داده، فرود برنامه‌ریزی‌شده‌ای برای این محل ثبت نشده است.",
        "No planned landing is recorded for this location in the current data window.",
        "لا توجد عملية هبوط مجدولة لهذا الموقع ضمن الفترة الحالية للبيانات.") + '</p>';
    }
    rows.forEach(function (row) {
      var mission = recoveryDisplay(row.mission_fa, row.mission, row.mission_ar, "");
      var vehicle = recoveryDisplay(row.vehicle_fa, row.vehicle_en, row.vehicle_ar, "");
      var operator = recoveryDisplay(row.operator_fa, row.operator_en, row.operator_ar, "");
      var note = recoveryDisplay(row.note_fa, row.note_en, row.note_ar, "");
      h += '<article class="recovery-event" data-landing-outcome="upcoming">' +
        '<div class="recovery-event-top">' +
        (row.date ? '<time datetime="' + esc(row.date) + '">' + esc(recoveryDate(row.date)) + '</time>' :
          '<span class="recovery-type">' + recoveryUi("در صف", "Queued", "في قائمة الانتظار") + '</span>') + '</div>' +
        '<h3><bdi>' + esc(mission) + '</bdi></h3>' +
        '<p class="recovery-vehicle"><bdi>' + esc(vehicle) + '</bdi> · <bdi>' + esc(operator) + '</bdi></p>' +
        '<div class="recovery-outcomes"><span class="recovery-type">' + esc(types[row.ltype] || recoveryUi("نوع نامشخص", "Type unavailable", "النوع غير متاح")) + '</span>' +
        '<span class="recovery-type">' + esc(statuses[row.status] || recoveryUi("در انتظار تأیید", "To be confirmed", "بانتظار التأكيد")) + '</span></div>';
      if (note && note !== "غير متاح" && note !== "—") h += '<p class="recovery-event-brief"><bdi>' + esc(note) + '</bdi></p>';
      var facts = [];
      fieldDefs.forEach(function (field) {
        if (lifted[field[0]]) return;
        var value = uplVal(row, field[0]);
        if (value) facts.push('<div><dt>' + field[1] + '</dt><dd><bdi>' + esc(value) + '</bdi></dd></div>');
      });
      if (facts.length || row.calendar_url || row.stream_url) {
        h += '<details class="recovery-event-details"><summary><span>' +
          recoveryUi("جزئیات مأموریت و پیوندهای رسمی", "Mission details and official links", "تفاصيل المهمة والروابط الرسمية") +
          '</span><span class="recovery-expand" aria-hidden="true"></span></summary><div class="recovery-event-reading">';
        if (facts.length) h += '<dl class="recovery-facts">' + facts.join("") + '</dl>';
        if (row.calendar_url) {
          h += '<div class="recovery-evidence-heading">' + recoveryUi("گاه‌شمار رسمی", "Official schedule", "الجدول الرسمي") + '</div>' +
            '<div class="recovery-primary-source"><a href="' + esc(row.calendar_url) +
            '" target="_blank" rel="noopener noreferrer" style="font-size:10px; color:var(--accent); border:1px solid var(--line); border-radius:5px; padding:4px 9px; text-decoration:none; display:inline-block;">🗓 ' +
            recoveryUi("صفحهٔ زمان‌بندی اپراتور", "Operator schedule page", "صفحة جدول المشغّل") + ' ↗</a></div>';
        }
        if (row.stream_url) {
          h += '<div class="recovery-evidence-heading">' + recoveryUi("پخش زندهٔ رسمی", "Official live stream", "البث المباشر الرسمي") + '</div>' +
            '<div class="recovery-primary-source">' + recoverySource(row.stream_url,
              recoveryUi("پخش رسمی رویداد", "Official webcast", "البث الرسمي للحدث")) + '</div>';
        }
        h += '</div></details>';
      }
      h += '</article>';
    });
    h += '<p class="recovery-small">' + recoveryUi(
      "تاریخ‌ها از منبع داده می‌آیند و ممکن است جابه‌جا شوند؛ پیش از تماشا منبع رسمی را ببینید. آخرین برداشت: ",
      "Dates come from the data source and may shift; check the official source before watching. Snapshot: ",
      "المواعيد من مصدر البيانات وقد تتغير؛ راجع المصدر الرسمي قبل المتابعة. تاريخ آخر تحديث: ") +
      esc(recoveryDate(UPL.data.updated)) + '</p></section>';
    return h;
  }
  function renderRecoveryDetail(o) {
    var fa = LANG === "fa", ar = LANG === "ar";
    var events = (o.events || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    if (!events.length) return '<div class="recovery-dossier"><p class="recovery-description">' +
      recoveryUi("برای این محل رویداد مستندی ثبت نشده است.", "No documented events are recorded for this location.", "لا توجد أحداث موثقة مسجلة لهذا الموقع.") + '</p></div>';
    var types = {
      booster: recoveryUi("سکوی فرود بوستر", "Booster landing site", "موقع هبوط المعزز"),
      capsule: recoveryUi("محل بازیابی کپسول", "Capsule recovery site", "موقع استعادة الكبسولة"),
      runway: recoveryUi("باند فرود", "Runway", "مدرج هبوط"),
      mixed: recoveryUi("محل کپسول و باند فرود", "Capsule and runway site", "موقع للكبسولة ومدرج هبوط"),
      tower: recoveryUi("برج گرفتن بوستر", "Booster-catch tower", "برج التقاط المعزز"),
      droneship: recoveryUi("شناور فرود دریایی", "Landing droneship", "سفينة هبوط بحرية"),
      splashdown_zone: recoveryUi("منطقهٔ فرود آبی", "Splashdown zone", "منطقة هبوط مائي")
    };
    var basis = {
      utc: recoveryUi("زمان جهانی هماهنگ (UTC)", "UTC", "التوقيت العالمي المنسق (UTC)"),
      australia: recoveryUi("تاریخ محلی استرالیا", "Australian local date", "التاريخ المحلي في أستراليا"),
      japan: recoveryUi("تاریخ محلی ژاپن", "Japanese local date", "التاريخ المحلي في اليابان"),
      us_eastern: recoveryUi("تاریخ منطقهٔ شرقی آمریکا", "U.S. Eastern date", "التاريخ المحلي للمنطقة الشرقية في الولايات المتحدة"),
      china: recoveryUi("تاریخ محلی چین", "Chinese local date", "التاريخ المحلي في الصين"),
      kazakhstan: recoveryUi("تاریخ محلی قزاقستان", "Kazakhstan local date", "التاريخ المحلي في كازاخستان")
    };
    var publishers = {
      "NASA": "ناسا", "JAXA": "وكالة استكشاف الفضاء اليابانية (JAXA)", "JAXA / ISAS": "JAXA / ISAS",
      "Australian Space Agency": "وكالة الفضاء الأسترالية", "U.S. Space Force": "قوة الفضاء الأمريكية",
      "Space.com": "Space.com", "U.S. Air Force": "القوات الجوية الأمريكية", "Rocket Lab": "Rocket Lab",
      "SpaceX": "SpaceX", "CMSA": "وكالة الفضاء المأهول الصينية (CMSA)", "CNSA": "الإدارة الوطنية الصينية للفضاء (CNSA)",
      "China State Council / Xinhua": "مجلس الدولة الصيني / شينخوا", "Ars Technica": "Ars Technica",
      "CNN": "CNN", "Everyday Astronaut": "Everyday Astronaut", "NASASpaceflight.com": "NASASpaceflight.com",
      "Public TV English": "Public TV English", "SpaceNews": "SpaceNews", "Spaceflight Now": "Spaceflight Now",
      "Wikipedia": "ويكيبيديا"
    };
    var publishersFa = {
      "NASA": "ناسا", "JAXA": "سازمان فضایی ژاپن", "JAXA / ISAS": "سازمان فضایی ژاپن",
      "Australian Space Agency": "سازمان فضایی استرالیا", "U.S. Space Force": "نیروی فضایی آمریکا",
      "Space.com": "رسانهٔ اسپیس", "U.S. Air Force": "نیروی هوایی آمریکا", "Rocket Lab": "راکت‌لب",
      "SpaceX": "اسپیس‌ایکس", "CMSA": "برنامهٔ فضایی سرنشین‌دار چین", "CNSA": "سازمان فضایی چین",
      "China State Council / Xinhua": "درگاه دولت چین و شین‌هوا"
    };
    function sourcePublisher(value) {
      if (ar) return publishers[value] || recoverySafeEnglish(value, "المصدر الرسمي");
      if (fa) return publishersFa[value] || recoverySafeEnglish(value, "منبع رویداد");
      return recoverySafeEnglish(value, "Event source");
    }
    var locationName = name(o);
    var city = recoveryDisplay(o.city_fa, o.city, o.city_ar, ar ? "غير محدد" : "—");
    var mobility = recoveryUi("سکوی متحرك", "Mobile platform", "منصة متحركة");
    var reference = recoveryUi("موقعیت مرجع", "Reference location", "موقع مرجعي");
    var notLive = recoveryUi("غیرزنده", "Not live", "بيانات غير مباشرة");
    var latest = events[0];
    var h = '<div class="recovery-dossier"><header class="recovery-header">' +
      '<div class="recovery-heading"><span class="recovery-heading-icon">' + svgRecovery(C.recovery) + '</span><div>' +
      '<div class="d-kicker">' + t("cat_recovery") + '</div><h2 class="d-title">' + esc(locationName) + '</h2>' +
      '<p class="recovery-location">' + esc(city) + '</p></div></div>' +
      '<div class="recovery-tags"><span class="recovery-type">' + esc(types[o.recovery_type] || recoveryUi("نوع نامشخص", "Type unavailable", "النوع غير متاح")) + '</span><span>' +
      (o.mobility === "mobile" ? mobility : reference) + '</span><span>' + notLive + '</span></div></header>' +
      '<div class="recovery-summary"><div><span>' + recoveryUi("رویدادهای این فهرست", "Events in this list", "الأحداث في هذه القائمة") + '</span><strong>' +
      fmtNum(events.length) + '</strong></div><div><span>' + recoveryUi("آخرین رویداد ثبت‌شده", "Latest recorded event", "أحدث حدث مسجل") +
      '</span><strong class="recovery-summary-date">' + esc(recoveryDate(latest.date)) + '</strong></div></div>' +
      '<div class="recovery-tabs" role="tablist" aria-label="' + esc(recoveryUi("اطلاعات محل", "Location details", "تفاصيل الموقع")) + '">' +
      '<button type="button" id="recoveryOverviewTab" role="tab" aria-selected="true" aria-controls="recoveryOverview" data-recovery-tab="overview">' +
      recoveryUi("معرفی محل", "Overview", "نظرة عامة") + '</button>' +
      '<button type="button" id="recoveryHistoryTab" role="tab" aria-selected="false" aria-controls="recoveryHistory" tabindex="-1" data-recovery-tab="history">' +
      recoveryUi("تاریخچهٔ فرود و بازیابی", "Landing & recovery history", "سجل الهبوط والاستعادة") + '</button>' +
      recoveryUpcomingTabButton(o, fa, ar) + '</div>' +
      '<section id="recoveryOverview" class="recovery-tab-panel" role="tabpanel" aria-labelledby="recoveryOverviewTab" tabindex="0">';
    if (o.image) {
      var caption = recoveryDisplay(o.image.caption_fa, o.image.caption_en, o.image.caption_ar, ar ? "صورة للموقع" : "");
      var credit = recoveryDisplay(o.image.credit_fa, o.image.credit_en, o.image.credit_ar, ar ? "" : "");
      h += '<figure class="recovery-hero"><img src="' + esc(o.image.file) + '" alt="' + esc(caption) + '" loading="lazy" decoding="async">' +
        '<figcaption><span class="recovery-hero-caption">' + esc(caption) + '</span><span class="recovery-hero-credit">' +
        recoveryUi("عکس: ", "Photo: ", "الصورة: ") + '<bdi>' + esc(credit) + '</bdi> · <bdi>' + esc(o.image.license || "") + '</bdi>' +
        (o.image.source_url ? ' · ' + recoverySource(o.image.source_url, recoveryUi("منبع تصویر", "Image source", "مصدر الصورة")) : '') +
        '</span></figcaption></figure>';
    }
    var activity = recoveryText(o, "activity");
    if (activity === "غير متاح" || activity === "—") activity = recoveryUi(
      "سابقهٔ مستند؛ وضعیت آمادگی کنونی محل از این فهرست استنباط نمی‌شود.",
      "Documented history; this dossier does not infer current operational readiness.",
      "سجل موثق؛ ولا يستنتج هذا الملف الجاهزية التشغيلية الحالية للمنشأة.");
    h += '<div class="recovery-section-label">' + recoveryUi("شناسنامهٔ محل", "Facility profile", "ملف الموقع") + '</div>' +
      '<p class="recovery-description">' + esc(desc(o)) + '</p><dl class="recovery-facts">' +
      '<div><dt>' + recoveryUi("کشور محل بازگشت", "Return-location country", "بلد موقع العودة") + '</dt><dd>' + esc(recoveryText(o, "country")) + '</dd></div>' +
      '<div><dt>' + recoveryUi("نوع محل", "Facility type", "نوع المنشأة") + '</dt><dd>' + esc(types[o.recovery_type] || recoveryUi("نامشخص", "Unavailable", "غير محدد")) + '</dd></div>' +
      '<div class="recovery-fact-wide"><dt>' + recoveryUi("بهره‌بردار و گروه مرتبط", "Operator / associated teams", "المشغّل والجهات المرتبطة") + '</dt><dd>' + esc(recoveryText(o, "op")) + '</dd></div>' +
      '<div class="recovery-fact-wide"><dt>' + recoveryUi("روش فرود و بازیابی", "Landing and recovery method", "طريقة الهبوط والاستعادة") + '</dt><dd>' + esc(recoveryText(o, "method")) + '</dd></div>' +
      '<div class="recovery-fact-wide"><dt>' + recoveryUi("وضعیت و دامنهٔ اطلاعات", "Status and information scope", "الحالة ونطاق المعلومات") + '</dt><dd>' + esc(activity) + '</dd></div></dl>';
    if (o.mobility === "mobile" && (o.mobility_note_fa || o.mobility_note_en || o.mobility_note_ar)) {
      var mobileNote = recoveryDisplay(o.mobility_note_fa, o.mobility_note_en, o.mobility_note_ar,
        ar ? "تفاصيل الحركة غير متاحة بالعربية." : "");
      h += '<p class="recovery-location-disclosure recovery-mobility-note"><strong>' +
        recoveryUi("این سکو ثابت نیست.", "This platform is not fixed.", "هذه المنصة غير ثابتة.") + '</strong><span>' +
        esc(mobileNote) + '</span></p>';
    }
    h += '<div class="recovery-position"><div class="recovery-section-label">' + recoveryUi("موقعیت و دقت مکانی", "Position & precision", "الموقع والدقة الجغرافية") + '</div><p>' +
      esc(recoveryText(o, "coordinate_note")) + '</p><div class="recovery-position-bottom"><bdi class="recovery-coordinates">' +
      String(o.lat) + ', ' + String(o.lon) + '</bdi>' + recoverySource(o.coordinate_source_url,
      recoveryUi("مرجع موقعیت", "Location reference", "مرجع الموقع")) + '</div>' +
      (o.coordinate_supporting_sources || []).map(function (source) {
        var label = recoveryDisplay(source.fa, source.en, source.ar, ar ? "مرجع إضافي" : "Supporting reference");
        return '<div class="recovery-position-support">' + recoverySource(source.url, label) + '</div>';
      }).join("") +
      (o.coordinate_audit ? '<p class="recovery-position-audit">' + esc(recoveryDisplay(o.coordinate_audit.fa, o.coordinate_audit.en,
        o.coordinate_audit.ar, ar ? "مراجعة مرجعية للموقع." : "")) + '</p>' : '') + '</div>' +
      '<p class="recovery-small">' + recoveryUi(
        "نقطهٔ مرجع، مختصات دقیق تماس یا مرز ایمنی نیست و مجوز ورود به محل محسوب نمی‌شود.",
        "Reference points are not exact touchdown positions, safety boundaries or access permissions.",
        "النقطة المرجعية ليست موضع تماس دقيقاً ولا حدوداً للسلامة، ولا تمنح إذناً بدخول الموقع.") + '</p></section>' +
      '<section id="recoveryHistory" class="recovery-tab-panel" role="tabpanel" aria-labelledby="recoveryHistoryTab" tabindex="0" hidden>';
    (function () {
      var complete = o.history_coverage === "complete";
      var registry = o.landing_registry;
      var chip = complete ? recoveryUi("پوشش کامل", "Complete coverage", "تغطية مكتملة") :
        recoveryUi("در حال تکمیل", "In progress", "قيد الاستكمال");
      var text;
      if (complete && registry) text = recoveryUi(
        "رویدادهای برجسته در خط زمان روایت شده‌اند و فهرست کامل فرودها در انتهای همین زبانه آمده است.",
        "Key events are narrated on the timeline; the complete landing list appears at the end of this tab.",
        "تُروى الأحداث البارزة في الخط الزمني، وترد قائمة الهبوط الكاملة في نهاية علامة التبويب.");
      else if (complete) text = recoveryUi(
        "بر پایهٔ منابع بررسی‌شده، همهٔ بازگشت‌های مداری ثبت‌شدهٔ این محل در همین فهرست آمده‌اند.",
        "Per the reviewed sources, every recorded orbital return at this location is listed here.",
        "وفق المصادر التي تمت مراجعتها، تسجل هذه القائمة جميع عودات المدار الموثقة في هذا الموقع.");
      else if (registry) text = recoveryUi(
        "خط زمان، رویدادهای منتخب را روایت می‌کند و فهرست انتهای زبانه نیز هنوز کامل نیست؛ دامنهٔ آن در همان‌جا اعلام شده است.",
        "The timeline narrates selected events and the list at the end of this tab is itself not yet complete; its scope is stated there.",
        "يسرد الخط الزمني أحداثاً مختارة، كما أن القائمة في نهاية علامة التبويب غير مكتملة؛ ويُذكر نطاقها هناك.");
      else text = recoveryUi("این فهرست منتخب است؛ نه تاریخچهٔ کامل همهٔ فرودهای محل.",
        "Selected, sourced events — not a complete history of this location.",
        "هذه أحداث مختارة موثقة، وليست سجلاً كاملاً لكل عمليات الهبوط في الموقع.");
      h += '<div class="recovery-coverage' + (complete ? ' is-complete' : '') + '"><div><strong>' +
        recoveryUi("رویدادهای مستند", "Documented events", "الأحداث الموثقة") + '</strong><span>' + esc(chip) + '</span></div><p>' + esc(text) + '</p></div>';
    })();
    if (o.coverage_start && o.coverage_end) {
      h += '<p class="recovery-coverage-range">' + recoveryUi("بازهٔ رویدادهای این فهرست: ", "Events in this list: ", "نطاق تواريخ الأحداث: ") +
        esc(recoveryDate(o.coverage_start)) + recoveryUi(" تا ", " to ", " إلى ") + esc(recoveryDate(o.coverage_end)) + '</p>';
    }
    h += '<div class="recovery-timeline">';
    var lastYear = "";
    events.forEach(function (e) {
      var year = e.date.slice(0, 4);
      if (year !== lastYear) {
        var yearLocale = fa ? "fa-IR" : ar ? "ar-u-nu-latn" : "en";
        h += '<div class="recovery-year">' + Number(year).toLocaleString(yearLocale, { useGrouping: false }) + '</div>';
        lastYear = year;
      }
      var eventTitle = fa ? e.fa : recoverySafeEnglish(e.en, "—");
      h += '<article class="recovery-event" data-event-id="' + esc(e.id) + '" data-landing-outcome="' + esc(e.landing_outcome) + '">' +
        '<div class="recovery-event-top"><time datetime="' + esc(e.date) + '">' + esc(recoveryDate(e.date)) + '</time></div>' +
        '<h3><bdi>' + esc(eventTitle) + '</bdi></h3><p class="recovery-vehicle"><bdi>' + esc(recoveryText(e, "vehicle")) + '</bdi></p>';
      if (e.summary_fa || e.summary_en || e.summary_ar) h += '<p class="recovery-event-brief">' + esc(recoveryText(e, "summary")) + '</p>';
      h += '<div class="recovery-outcomes">' + recoveryOutcome(e.landing_outcome, true, e.landing_method) + recoveryOutcome(e.recovery_outcome, false) + '</div>';
      if (e.site_role === "intended_target") {
        var actual = recoveryDisplay(e.actual_location_fa, e.actual_location_en, e.actual_location_ar, ar ? "الموقع الفعلي غير محدد في هذا السجل." : "");
        h += '<p class="recovery-location-disclosure"><strong>' +
          recoveryUi("این محل فقط مقصد برنامه‌ریزی‌شده بود؛ فرود در جای دیگری رخ داد.", "This site was the intended target; touchdown occurred elsewhere.", "كان هذا الموقع الهدف المخطط؛ ولم يحدث الهبوط فيه.") +
          '</strong><span>' + esc(actual) + '</span></p>';
      }
      if (e.recovery_scope_fa || e.recovery_scope_en || e.recovery_scope_ar) {
        var scope = recoveryDisplay(e.recovery_scope_fa, e.recovery_scope_en, e.recovery_scope_ar,
          ar ? "يوضح هذا السجل نطاق نتيجة الاستعادة." : "");
        h += '<p class="recovery-scope-note">' + esc(scope) + '</p>';
      }
      h += '<details class="recovery-event-details"><summary><span>' + recoveryUi("جزئیات و منبع رویداد", "Event details and sources", "تفاصيل الحدث ومصادره") +
        '</span><span class="recovery-expand" aria-hidden="true"></span></summary><div class="recovery-event-reading">';
      [["context", "Mission context", "سياق المهمة"], ["sequence", "Landing & recovery sequence", "تسلسل الهبوط والاستعادة"],
        ["significance", "Outcome & significance", "النتيجة والأهمية"]].forEach(function (part) {
        var value = ar ? recoveryArabicField(e[part[0] + "_ar"]) : recoveryText(e, part[0]);
        if (value) h += '<section class="recovery-story-section"><h4>' + recoveryUi(
          part[0] === "context" ? "زمینهٔ مأموریت" : part[0] === "sequence" ? "روند فرود و بازیابی" : "نتیجه و اهمیت",
          part[1], part[2]) + '</h4><p>' + esc(value) + '</p></section>';
      });
      h += renderRecoveryVideos(e);
      h += '<div class="recovery-evidence"><div class="recovery-evidence-heading">' + recoveryUi("منابع و یادداشت ثبت", "Sources & record notes", "المصادر وملاحظات السجل") +
        '</div><div class="recovery-primary-source">' + recoverySource(e.source_url, (fa ? "گزارش " : ar ? "تقرير " : "") +
          sourcePublisher(e.source_publisher || "") + (fa || ar ? "" : " report")) + '</div>';
      (e.supporting_sources || []).forEach(function (source) {
        var sourceName = recoveryDisplay(source.fa, source.en, source.ar, ar ? "مصدر داعم" : "Supporting source");
        h += '<div class="recovery-supporting-source">' + recoverySource(source.url, sourceName) + '</div>';
      });
      h += '<dl class="recovery-evidence-meta"><div><dt>' + recoveryUi("مبنای تاریخ", "Date basis", "أساس التاريخ") + '</dt><dd>' +
        esc(basis[e.date_basis] || basis.utc) + '</dd></div><div><dt>' + recoveryUi("بررسی ثبت‌شده", "Recorded review", "تاريخ المراجعة المسجل") + '</dt><dd>' +
        esc(recoveryDate(e.verified_on || o.reviewed_on)) + '</dd></div></dl><p class="recovery-record-note">' +
        esc(recoveryText(e, "note")) + '</p></div></div></details></article>';
    });
    h += '</div>' + renderRecoveryRegistry(o) + '<p class="recovery-small">' + recoveryUi(
      "«بازیابی نامشخص» یعنی تأیید مستقل آن در منبع ثبت نشده است؛ نه اینکه بازیابی شکست خورده باشد.",
      "Unverified recovery means a separate confirmation is not recorded in the source; it does not mean recovery failed.",
      "تعني «استعادة غير متحقق منها» أن المصدر لا يسجل تأكيداً مستقلاً، ولا تعني فشل الاستعادة.") +
      '</p></section>' + renderRecoveryUpcomingPanel(o, fa, ar) +
      '<footer class="recovery-footer"><span>' + recoveryUi("آخرین بررسی منابع", "Sources reviewed", "تاريخ مراجعة المصادر") + '</span><span>' +
      esc(recoveryDate(o.reviewed_on)) + '</span></footer></div>';
    return h;
  }
  function renderRecoveryRegistry(o) {
    var reg = o.landing_registry;
    if (!reg || !Array.isArray(reg.entries) || !reg.entries.length) return "";
    var fa = LANG === "fa", ar = LANG === "ar";
    var statusLabels = {
      success: recoveryUi("ناجح", "Success", "ناجح"),
      failure: recoveryUi("ناموفق", "Failed", "فشل"),
      partial: recoveryUi("جزئي", "Partial", "جزئي"),
      no_attempt: recoveryUi("بدون تلاش", "No attempt", "لم تُجر محاولة")
    };
    var rows = "";
    reg.entries.forEach(function (r) {
      var note = recoveryDisplay(r.n_fa, r.n_en, r.n_ar, ar ? "" : "");
      rows += '<tr><td class="recovery-registry-date"><time datetime="' + esc(r.d) + '">' + esc(recoveryDate(r.d)) + '</time></td>' +
        '<td class="recovery-registry-mission"><bdi>' + esc(recoverySafeEnglish(r.m, "—")) + '</bdi>' +
        (r.v ? '<span class="recovery-registry-vehicle"><bdi>' + esc(recoverySafeEnglish(r.v, "")) + '</bdi></span>' : '') +
        (note && note !== "غير متاح" && note !== "—" ? '<span class="recovery-registry-note">' + esc(note) + '</span>' : '') + '</td>' +
        '<td class="recovery-registry-status"><span class="recovery-registry-dot ' + esc(r.o) + '"></span>' +
        esc(statusLabels[r.o] || (ar ? "غير محدد" : recoverySafeEnglish(r.o, "—"))) + '</td></tr>';
    });
    var scope = recoveryDisplay(reg.scope_fa, reg.scope_en, reg.scope_ar, ar ? "نطاق القائمة موضح في المصدر." : "");
    var basis = recoveryDisplay(reg.basis_fa, reg.basis_en, reg.basis_ar, ar ? "التواريخ وفق المصدر." : "");
    return '<details class="recovery-registry"><summary><span>' +
      recoveryUi("فهرست کامل فرودها (" + fmtNum(reg.entries.length) + " مورد)",
        "Full landing list (" + fmtNum(reg.entries.length) + " entries)",
        "قائمة الهبوط الكاملة (" + fmtNum(reg.entries.length) + " عملية)") +
      '</span><span class="recovery-expand" aria-hidden="true"></span></summary><div class="recovery-registry-body">' +
      '<p class="recovery-registry-scope">' + esc(scope) + '</p>' +
      (!reg.complete ? '<p class="recovery-registry-partial">' + recoveryUi(
        "این فهرست هنوز کامل نیست و در گام‌های بعدی تکمیل می‌شود.",
        "This list is not yet complete and will be extended in later steps.",
        "هذه القائمة غير مكتملة بعد، وستُستكمل في مراحل لاحقة.") + '</p>' : '') +
      '<table class="recovery-registry-table"><thead><tr><th>' + recoveryUi("تاریخ", "Date", "التاريخ") + '</th><th>' +
      recoveryUi("مأموریت / وسیله", "Mission / vehicle", "المهمة / المركبة") + '</th><th>' + recoveryUi("نتیجه", "Result", "النتيجة") +
      '</th></tr></thead><tbody>' + rows + '</tbody></table><p class="recovery-registry-basis">' + esc(basis) + '</p>' +
      '<div class="recovery-registry-source">' + recoverySource(reg.source_url, recoveryUi("منبع فهرست", "List source", "مصدر القائمة")) +
      '<span>' + recoveryUi("بررسی پیوند: ", "Checked: ", "تاريخ التحقق من الرابط: ") + esc(recoveryDate(reg.verified_on)) + '</span>' +
      '</div></div></details>';
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

    /* ORBITA custom palette: entity-coded dossier rail (org = teal, site/recovery = gold) */
    var __de = document.getElementById("detail");
    if (__de) __de.setAttribute("data-ent", (cat === "site" || kind === "site" || cat === "recovery" || kind === "recovery") ? "site" : "org");

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



    if (cat === "satmaker" || (p.o && p.o.cat === "satmaker")) {
      $("#detailBody").innerHTML = renderSatmakerDetail(p);
      $("#detail").classList.add("open");
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
    var projectLabel = $("#projectCountLabel");
    if (projectLabel) {
      var count = list.length;
      projectLabel.textContent = LANG !== "ar" ? t("project")
        : count === 0 ? "مشاريع" : count === 1 ? "مشروع" : count === 2 ? "مشروعان"
        : count <= 10 ? "مشاريع" : "مشروعًا";
    }
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
    var locale = LANG === "fa" ? "fa-IR-u-ca-gregory" : LANG === "ar" ? "ar-u-ca-gregory-nu-latn" : "en-GB";
    return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
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

  function fmtNum(n) {
    var locale = LANG === "fa" ? "fa-IR" : LANG === "ar" ? "ar-u-nu-latn" : "en-US";
    return Number(n).toLocaleString(locale);
  }

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

  /* ================= boot: نقشه فوری، داده‌ها لایه‌لایه ================= */
  var LAYER_STATE = { sites: "loading", companies: "loading", recoveries: "idle", missions: "loading" };
  function refreshMapUI() { buildLayerBar(); renderMarkers(); renderList(); }
  function loadLayer(key, url, assign, after) {
    LAYER_STATE[key] = "loading";
    return fetch(url)
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) { assign(j); LAYER_STATE[key] = "ready"; (after || refreshMapUI)(); })
      .catch(function (e) {
        console.warn("layer " + key + ":", e);
        LAYER_STATE[key] = "error"; buildLayerBar();
        setTimeout(function () { if (LAYER_STATE[key] === "error") BOOT_LOADERS[key](); }, 6000);
      });
  }
  var BOOT_LOADERS = {
    sites: function () {
      return loadLayer("sites", "data/sites.json?v=" + (window.ORBITA_V || "1"), function (j) { DATA.sites = j; });
    },
    recoveries: function () {
      return loadLayer("recoveries", "data/recovery_sites.json", function (j) {
        DATA.recoveries = j && Array.isArray(j.sites) ? j.sites.filter(validRecoverySite) : [];
      });
    },
    missions: function () {
      return loadLayer("missions", "data/missions.json?v=" + (window.ORBITA_V || "1"), function (j) { DATA.missions = j; },
        function () { buildFilters(); renderMissions(); });
    },
    companies: function () {
      return loadLayer("companies", "data/companies.json?v=" + (window.ORBITA_V || "1"), function (j) { DATA.companies = j; },
        function () { refreshMapUI(); buildFilters(); });
    }
  };
  window.retryLayer = function (k) { if (BOOT_LOADERS[k]) BOOT_LOADERS[k](); };
  applyI18n();
  initMap(); buildLayerBar(); renderList(); buildFilters(); renderMissions();
  BOOT_LOADERS.sites().then(function () {
    BOOT_LOADERS.missions(); BOOT_LOADERS.companies();
    /* تماس‌های غیرحیاتی پس از نقش‌بستن نقشه — پهنای باند نگاه اول مال نقشه */
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 900); };
    idle(function () { loadUpcoming(); loadNextLaunch(); loadLiveLaunches(); loadSiteUpcomingData(); }, { timeout: 2500 });
  });
})();
