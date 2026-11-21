/* ORBITA — worldwide upcoming launch browser (Step 4)
 * Uses the independently refreshed 120-day global snapshot; does not alter
 * the reviewed site-specific upcoming-launch tabs or the next-launch ticker.
 */
(function () {
  "use strict";

  var Display = window.ORBITAUpcomingEventDisplay;
  if (!Display) { console.error("ORBITA step 7 event display helper unavailable."); return; }
  var Filters = window.ORBITAUpcomingLaunchFilters;
  if (!Filters) {
    console.error("ORBITA upcoming-launch filter engine is unavailable.");
    return;
  }

  var $ = function (selector) { return document.querySelector(selector); };
  var dialog = $("#globalLaunchDialog");
  var openButton = $("#upcomingLaunchesBtn");
  if (!dialog || !openButton) return;

  var state = {
    data: null,
    countries: null,
    aliases: {},
    countryByCode: {},
    dataPromise: null,
    countriesPromise: null,
    loading: false,
    error: "",
    refreshError: "",
    days: 30,
    countryBasis: "operator",
    selectedCountries: [],
    countryQuery: "",
    countryListExpanded: false
  };

  var COPY = {
    fa: {
      open: "پرتاب‌های پیش‌رو", dockEyebrow: "رادار مأموریت", filterHeading: "تنظیمات رصد", quick: "کشورهای پرکاربرد", feedLabel: "جریان مأموریت‌ها", selectedRemove: "حذف کشور", summaryPrefix: "نمایش", showCountryList: "نمایش فهرست کشورها", hideCountryList: "بستن فهرست کشورها", jumpResults: "مشاهده پرتاب‌ها", eyebrow: "پایش جهانی پرتاب‌ها", title: "فهرست جهانی پرتاب‌های پیش‌رو",
      intro: "پرتاب‌های اعلام‌شده در سراسر جهان را بر اساس بازه زمانی و کشور فیلتر کنید.", close: "بستن",
      time: "بازه زمانی", d7: "۱ هفته آینده", d14: "۲ هفته آینده", d30: "۱ ماه آینده", d120: "۴ ماه آینده",
      country: "فیلتر کشورها", all: "همه کشورها", selected: "کشور انتخاب‌شده", selectedPlural: "کشور انتخاب‌شده",
      countrySearch: "جستجوی کشور…", basis: "مبنای انتساب کشور", operator: "کشور اپراتور / ارائه‌دهنده پرتاب", site: "کشور محل پرتاب",
      basisNote: "انتخاب اپراتور، کشور ارائه‌دهنده خدمت پرتاب را نشان می‌دهد؛ انتخاب محل پرتاب، کشور جغرافیایی پایگاه را. این دو لزوماً یکی نیستند و از آن‌ها ملیت مالک ماهواره استنباط نمی‌شود.",
      results: "نتیجه", launches: "پرتاب", launchesPlural: "پرتاب", loading: "در حال دریافت فهرست پرتاب‌های جهانی…",
      waiting: "بانک جهانی پرتاب‌ها هنوز نخستین همگام‌سازی موفق را دریافت نکرده است. پس از اجرای گردش‌کار به‌روزرسانی، فهرست اینجا نمایش داده می‌شود.",
      error: "دریافت اطلاعات پرتاب‌ها انجام نشد. اتصال را بررسی کنید و دوباره پنجره را باز کنید.",
      noResults: "با این ترکیب از فیلترها پرتابی پیدا نشد.", noCountries: "کشوری با این عبارت پیدا نشد.", retry: "تلاش دوباره",
      updated: "آخرین به‌روزرسانی داده", stale: "داده بیش از ۲۴ ساعت به‌روزرسانی نشده است.",
      source: "منبع: Launch Library 2 · برنامه‌ها ممکن است تغییر کنند؛ پوشش تابع داده‌های این منبع است.", refreshFailed: "به‌روزرسانی جدید ناموفق بود؛ آخرین snapshot معتبر نمایش داده می‌شود.",
      mission: "مأموریت", rocket: "پرتابگر", operatorName: "اپراتور", launchSite: "محل پرتاب",
      operatorCountry: "کشور اپراتور", siteCountry: "کشور محل پرتاب", precision: "دقت زمان", status: "وضعیت",
      confirmed: "تأییدشده", tentative: "در انتظار تأیید", unscheduled: "زمان نامشخص", hold: "در حالت توقف", cancelled: "لغوشده", unknown: "نامشخص",
      sec: "ثانیه‌ای", min: "دقیقه‌ای", hour: "ساعتی", day: "روز مشخص", month: "ماه تقریبی", quarter: "فصل تقریبی", year: "سال تقریبی", tbd: "دقت اعلام نشده",
      timeUtc: "به وقت جهانی (UTC)", unknownCountry: "کشور نامشخص", chooseCountry: "برای محدودکردن نتایج، یک یا چند کشور را انتخاب کنید.",
      allCount: "همه کشورها", countryCount: "کشور", noDate: "زمان معتبر در منبع ثبت نشده است.",
      syncPending: "در انتظار نخستین به‌روزرسانی", fresh: "داده تازه", staleLabel: "نیازمند به‌روزرسانی", syncInvalid: "زمان به‌روزرسانی نامعتبر", reset: "پاک‌کردن فیلترها", emptyTip: "بازه زمانی یا کشورهای انتخابی را تغییر دهید.", timeLabelLaunch: "ساعت فقط برای زمان‌های دارای دقت کافی نمایش داده می‌شود؛ همه ساعت‌ها UTC هستند.", dateBasisLabel: "زمان اعلام‌شده", timeLabelLanding: "تاریخ‌های فرود فقط روز را نشان می‌دهند؛ ساعت دقیق فرود از این داده‌ها قابل استنباط نیست.", notExactLanding: "این تاریخ، ساعت تأییدشده فرود نیست."
    },
    en: {
      open: "Upcoming launches", dockEyebrow: "Mission radar", filterHeading: "Mission filters", quick: "Quick selection", feedLabel: "Mission feed", selectedRemove: "Remove country", summaryPrefix: "Showing", showCountryList: "Browse all countries", hideCountryList: "Hide country list", jumpResults: "View launches", eyebrow: "Global launch monitor", title: "Worldwide upcoming launches",
      intro: "Filter announced launches worldwide by time window and country.", close: "Close",
      time: "Time window", d7: "Next 7 days", d14: "Next 14 days", d30: "Next 30 days", d120: "Next 120 days",
      country: "Country filters", all: "All countries", selected: "country selected", selectedPlural: "countries selected",
      countrySearch: "Search countries…", basis: "Country attribution", operator: "Launch provider / operator country", site: "Launch-site country",
      basisNote: "Provider country identifies the launch-service provider; launch-site country identifies the geographic country of the pad. They can differ. Neither establishes the payload owner's nationality.",
      results: "Results", launches: "launch", launchesPlural: "launches", loading: "Loading worldwide launch data…",
      waiting: "The global launch feed has not completed its first successful sync. The list will appear here after the refresh workflow runs.",
      error: "Launch data could not be loaded. Check your connection and reopen this panel.",
      noResults: "No launches match the selected filters.", noCountries: "No country matches this search.", retry: "Retry",
      updated: "Data last updated", stale: "The data snapshot has not been refreshed for more than 24 hours.",
      source: "Source: Launch Library 2 · Schedules may change; coverage depends on source reporting.", refreshFailed: "Refresh failed; showing the last validated snapshot.",
      mission: "Mission", rocket: "Launch vehicle", operatorName: "Operator", launchSite: "Launch site",
      operatorCountry: "Operator country", siteCountry: "Launch-site country", precision: "Time precision", status: "Status",
      confirmed: "Confirmed", tentative: "To be confirmed", unscheduled: "Unscheduled", hold: "On hold", cancelled: "Cancelled", unknown: "Unknown",
      sec: "Second-level", min: "Minute-level", hour: "Hour-level", day: "Day-level", month: "Approx. month", quarter: "Approx. quarter", year: "Approx. year", tbd: "Precision not stated",
      timeUtc: "UTC", unknownCountry: "Country unknown", chooseCountry: "Select one or more countries to narrow the list.",
      allCount: "All countries", countryCount: "country", noDate: "No valid time is recorded by the source.",
      syncPending: "Awaiting first update", fresh: "Up to date", staleLabel: "Update overdue", syncInvalid: "Invalid update timestamp", reset: "Clear filters", emptyTip: "Try a different time window or country selection.", timeLabelLaunch: "Clock times appear only when the source provides sufficient precision; all shown times are UTC.", dateBasisLabel: "Scheduled time", timeLabelLanding: "Landing dates indicate the calendar day only; no exact landing time is inferred.", notExactLanding: "This is not a verified landing time."
    },
    ar: {
      open: "الإطلاقات القادمة", dockEyebrow: "رادار المهام", filterHeading: "مرشحات الرصد", quick: "اختيار سريع", feedLabel: "سجل المهمات", selectedRemove: "إزالة الدولة", summaryPrefix: "عرض", showCountryList: "عرض قائمة الدول", hideCountryList: "إخفاء قائمة الدول", jumpResults: "عرض الإطلاقات", eyebrow: "متابعة الإطلاقات العالمية", title: "قائمة الإطلاقات القادمة حول العالم",
      intro: "صفِّ الإطلاقات المعلنة عالمياً حسب الفترة الزمنية والدولة.", close: "إغلاق",
      time: "الفترة الزمنية", d7: "الأيام السبعة القادمة", d14: "الأيام الأربعة عشر القادمة", d30: "الثلاثون يوماً القادمة", d120: "الأيام الـ120 القادمة",
      country: "تصفية الدول", all: "كل الدول", selected: "دولة محددة", selectedPlural: "دول محددة",
      countrySearch: "ابحث عن دولة…", basis: "أساس تصنيف الدولة", operator: "دولة مزوّد خدمة الإطلاق / المشغّل", site: "دولة موقع الإطلاق",
      basisNote: "تعرض دولة المشغّل بلد مزوّد خدمة الإطلاق، بينما تعرض دولة الموقع البلد الجغرافي لمنصة الإطلاق. وقد يختلفان؛ ولا يثبت أي منهما جنسية مالك الحمولة.",
      results: "النتائج", launches: "إطلاق", launchesPlural: "إطلاقات", loading: "جارٍ تحميل بيانات الإطلاقات العالمية…",
      waiting: "لم تكتمل المزامنة الأولى الناجحة لبيانات الإطلاقات العالمية بعد. ستظهر القائمة هنا بعد تشغيل التحديث.",
      error: "تعذر تحميل بيانات الإطلاقات. تحقق من الاتصال وأعد فتح هذه النافذة.",
      noResults: "لا توجد إطلاقات تطابق عوامل التصفية المحددة.", noCountries: "لا توجد دولة تطابق البحث.", retry: "إعادة المحاولة",
      updated: "آخر تحديث للبيانات", stale: "لم تُحدَّث البيانات منذ أكثر من 24 ساعة.",
      source: "المصدر: Launch Library 2 · قد تتغير الجداول؛ وتعتمد التغطية على بيانات المصدر.", refreshFailed: "فشل التحديث؛ تُعرض آخر نسخة تم التحقق منها.",
      mission: "المهمة", rocket: "مركبة الإطلاق", operatorName: "المشغّل", launchSite: "موقع الإطلاق",
      operatorCountry: "دولة المشغّل", siteCountry: "دولة موقع الإطلاق", precision: "دقة الموعد", status: "الحالة",
      confirmed: "مؤكد", tentative: "بانتظار التأكيد", unscheduled: "غير مجدول", hold: "معلّق", cancelled: "ملغى", unknown: "غير معروف",
      sec: "بدقة الثانية", min: "بدقة الدقيقة", hour: "بدقة الساعة", day: "اليوم محدد", month: "شهر تقريبي", quarter: "ربع سنة تقريبي", year: "سنة تقريبية", tbd: "الدقة غير محددة",
      timeUtc: "بتوقيت UTC", unknownCountry: "الدولة غير معروفة", chooseCountry: "اختر دولة واحدة أو أكثر لتصفية القائمة.",
      allCount: "كل الدول", countryCount: "دولة", noDate: "لا يوجد موعد صالح مسجل في المصدر.",
      syncPending: "في انتظار أول تحديث", fresh: "بيانات حديثة", staleLabel: "تحديث متأخر", syncInvalid: "وقت التحديث غير صالح", reset: "مسح المرشحات", emptyTip: "جرّب تغيير الفترة الزمنية أو الدول المختارة.", timeLabelLaunch: "لا تظهر الساعة إلا عند توافر دقة كافية؛ جميع الأوقات المعروضة بتوقيت UTC.", dateBasisLabel: "وقت الإعلان", timeLabelLanding: "تُعرض تواريخ الهبوط باليوم فقط؛ لا يمكن استنتاج ساعة هبوط دقيقة من هذه البيانات.", notExactLanding: "هذا ليس توقيت هبوط مؤكداً."
    }
  };

  function lang() {
    var value = "fa";
    try { value = localStorage.getItem("orbita_lang") || "fa"; } catch (e) {}
    return COPY[value] ? value : "fa";
  }
  function tr(key) { return COPY[lang()][key] || COPY.fa[key] || key; }
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function countryName(code) {
    var normalized = Filters.normalizeCountryCode(code, state.aliases);
    if (!normalized) return tr("unknownCountry");
    var item = state.countryByCode[normalized];
    if (!item) return String(code);
    return item[lang()] || item.en || normalized;
  }
  function number(value) {
    try { return new Intl.NumberFormat(lang() === "fa" ? "fa-IR" : lang() === "ar" ? "ar-u-nu-latn" : "en-GB").format(value); }
    catch (e) { return String(value); }
  }
  function precisionKey(value) { return Display.precision(value); }
  function formatNet(event) { return Display.launchTime(event, lang(), tr("noDate")).text; }
  function formatUpdated(value) { return Display.updatedAt(value, lang(), tr("syncPending")); }
  function statusKey(value) {
    var s = String(value || "").toLowerCase();
    if (s === "go" || s === "confirmed") return "confirmed";
    if (s === "tbc" || s === "tentative" || s === "planned") return "tentative";
    if (s === "tbd" || s === "unscheduled") return "unscheduled";
    if (s === "hold" || s === "on_hold") return "hold";
    if (/cancel|abort|scrub/.test(s)) return "cancelled";
    return "unknown";
  }
  function statusClass(key) {
    return key === "confirmed" ? "is-confirmed" : key === "tentative" ? "is-tentative" : key === "hold" ? "is-hold" : key === "cancelled" ? "is-cancelled" : "is-unknown";
  }
  function activeData() {
    return state.data && state.data.coverage_status === "complete_from_source_at_fetch_time" && Array.isArray(state.data.launches);
  }

  function loadCountries() {
    if (state.countriesPromise) return state.countriesPromise;
    state.countriesPromise = fetch("data/country_codes.json?v=" + encodeURIComponent(window.ORBITA_UPCOMING_GLOBAL_V || "20261121-step3-4"))
      .then(function (response) { if (!response.ok) throw new Error("country map HTTP " + response.status); return response.json(); })
      .then(function (doc) {
        state.countries = Array.isArray(doc.countries) ? doc.countries : [];
        state.aliases = doc.aliases && typeof doc.aliases === "object" ? doc.aliases : {};
        state.countryByCode = {};
        state.countries.forEach(function (item) {
          state.countryByCode[String(item.code).toUpperCase()] = item;
          if (item.alpha2) state.countryByCode[String(item.alpha2).toUpperCase()] = item;
        });
        return doc;
      })
      .catch(function (error) {
        console.warn("ORBITA country labels:", error.message);
        state.countries = [];
        state.countryByCode = {};
        return null;
      });
    return state.countriesPromise;
  }

  function loadLaunchData(force) {
    if (state.data && !force) return Promise.resolve(state.data);
    if (state.dataPromise) return state.dataPromise;
    state.loading = true;
    state.error = "";
    renderResults();
    var version = window.ORBITA_UPCOMING_GLOBAL_V || window.ORBITA_V || "1";
    state.dataPromise = fetch("data/upcoming_global.json?v=" + encodeURIComponent(version), { cache: "no-store" })
      .then(function (response) { if (!response.ok) throw new Error("HTTP " + response.status); return response.json(); })
      .then(function (doc) {
        if (!doc || doc.schema_version !== 1 || !Array.isArray(doc.launches) || doc.count !== doc.launches.length) {
          throw new Error("Invalid global launch snapshot");
        }
        state.data = doc;
        state.loading = false;
        state.error = "";
        state.refreshError = "";
        state.dataPromise = null;
        renderResults();
        return doc;
      })
      .catch(function (error) {
        state.loading = false;
        var message = error && error.message ? error.message : "load failed";
        if (activeData()) {
          state.refreshError = message;
          state.error = "";
        } else {
          state.error = message;
        }
        state.dataPromise = null;
        renderResults();
        return null;
      });
    return state.dataPromise;
  }

  function renderChrome() {
    var language = lang();
    var rtl = language !== "en";
    dialog.dir = rtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
    // Keep the custom SVG launch beacon intact when changing languages.
    var dockTitle = $("#launchMissionDockTitle");
    var dockEyebrow = $("#launchMissionDockEyebrow");
    if (dockTitle) dockTitle.textContent = tr("open");
    if (dockEyebrow) dockEyebrow.textContent = tr("dockEyebrow");
    openButton.setAttribute("aria-label", tr("open"));
    openButton.setAttribute("title", tr("open"));
    var textMap = {
      "#globalLaunchEyebrow": "eyebrow", "#globalLaunchTitle": "title", "#globalLaunchIntro": "intro",
      "#globalLaunchTimeLabel": "time", "#globalLaunchCountryLabel": "country",
      "#launchMissionFilterHeading": "filterHeading", "#launchMissionQuickLabel": "quick", "#launchMissionFeedLabel": "feedLabel",
      "#launchMissionJumpLabel": "jumpResults",
      "#globalLaunchCountrySearchLabel": "countrySearch", "#globalLaunchBasisLabel": "basis",
      "#globalLaunchBasisNote": "basisNote", "#globalLaunchAllCountries": "all", "#globalLaunchReload": "retry"
    };
    Object.keys(textMap).forEach(function (selector) {
      var el = $(selector); if (el) el.textContent = tr(textMap[selector]);
    });
    $("#globalLaunchClose").setAttribute("aria-label", tr("close"));
    $("#globalLaunchClose").setAttribute("title", tr("close"));
    var basis = $("#globalLaunchCountryBasis");
    if (basis) {
      basis.options[0].textContent = tr("operator");
      basis.options[1].textContent = tr("site");
      basis.value = state.countryBasis;
    }
    var search = $("#globalLaunchCountrySearch");
    if (search) search.placeholder = tr("countrySearch");
    $$(".global-launch-period").forEach(function (button) {
      var days = button.getAttribute("data-days");
      var periodLabel = button.querySelector(".launch-mission-period-label");
      if (periodLabel) periodLabel.textContent = tr(days === "7" ? "d7" : days === "14" ? "d14" : days === "120" ? "d120" : "d30");
      button.setAttribute("aria-pressed", String(Number(days) === state.days));
      button.classList.toggle("is-active", Number(days) === state.days);
    });
    var note = $("#globalLaunchCountryHelp");
    if (note) note.textContent = tr("chooseCountry");
    renderCountrySelection();
    renderCountryOptions();
    renderQuickCountries();
    renderCountryBrowserMode();
    renderResults();
  }
  function $$(selector) { return Array.prototype.slice.call(dialog.querySelectorAll(selector)); }

  function countryList() {
    return (state.countries || []).slice().sort(function (a, b) {
      return String(a[lang()] || a.en || a.code).localeCompare(String(b[lang()] || b.en || b.code), lang());
    });
  }
  function renderQuickCountries() {
    $$(".launch-mission-quick-countries [data-quick-country]").forEach(function (button) {
      var code = button.getAttribute("data-quick-country");
      var chosen = state.selectedCountries.indexOf(code) >= 0;
      button.classList.toggle("is-selected", chosen);
      button.setAttribute("aria-pressed", String(chosen));
      button.textContent = countryName(code);
    });
  }
  function renderCountryBrowserMode() {
    var list = $("#globalLaunchCountryOptions");
    var toggle = $("#launchMissionCountryToggle");
    var label = $("#launchMissionCountryToggleLabel");
    if (!list || !toggle || !label) return;
    list.classList.toggle("launch-mission-expanded", state.countryListExpanded);
    toggle.setAttribute("aria-expanded", String(state.countryListExpanded));
    label.textContent = tr(state.countryListExpanded ? "hideCountryList" : "showCountryList");
  }
  function renderFilterSummary() {
    var el = $("#globalLaunchFilterSummary");
    if (!el) return;
    var p = state.days === 7 ? "d7" : state.days === 14 ? "d14" : state.days === 120 ? "d120" : "d30";
    var places = state.selectedCountries.length
      ? state.selectedCountries.map(countryName).join(lang() === "en" ? ", " : "، ")
      : tr("allCount");
    el.textContent = tr("summaryPrefix") + " · " + tr(p) + " · " + places;
  }

  function renderCountrySelection() {
    var box = $("#globalLaunchSelectedCountries");
    var all = $("#globalLaunchAllCountries");
    var count = $("#globalLaunchCountryCount");
    if (!box || !all || !count) return;
    var selected = state.selectedCountries;
    all.classList.toggle("is-active", selected.length === 0);
    all.setAttribute("aria-pressed", String(selected.length === 0));
    if (!selected.length) {
      count.textContent = tr("allCount");
      box.innerHTML = '<span class="global-launch-selected-chip is-all">' + esc(tr("allCount")) + '</span>';
      renderQuickCountries();
      return;
    }
    count.textContent = number(selected.length) + " " + (selected.length === 1 ? tr("selected") : tr("selectedPlural"));
    box.innerHTML = selected.map(function (code) {
      return '<button type="button" class="global-launch-selected-chip" data-remove-country-code="' + esc(code) + '" aria-label="' + esc(tr("selectedRemove") + ": " + countryName(code)) + '"><span>' + esc(countryName(code)) + '</span><span class="launch-mission-chip-remove" aria-hidden="true">×</span></button>';
    }).join("");
    renderQuickCountries();
  }
  function renderCountryOptions() {
    var list = $("#globalLaunchCountryOptions");
    if (!list) return;
    var query = state.countryQuery.trim().toLocaleLowerCase();
    var rows = countryList().filter(function (item) {
      var label = String(item[lang()] || item.en || item.code).toLocaleLowerCase();
      return !query || label.indexOf(query) >= 0 || String(item.code).toLowerCase().indexOf(query) >= 0 || String(item.alpha2 || "").toLowerCase().indexOf(query) >= 0;
    });
    if (!rows.length) {
      list.innerHTML = '<div class="global-launch-country-empty">' + esc(tr("noCountries")) + '</div>';
      return;
    }
    list.innerHTML = rows.map(function (item) {
      var selected = state.selectedCountries.indexOf(item.code) >= 0;
      return '<button type="button" class="global-launch-country-option' + (selected ? ' is-selected' : '') + '" role="checkbox" aria-checked="' + String(selected) + '" data-country-code="' + esc(item.code) + '">' +
        '<span class="global-launch-country-check" aria-hidden="true">' + (selected ? '✓' : '') + '</span><span>' + esc(item[lang()] || item.en || item.code) + '</span><small dir="ltr">' + esc(item.alpha2 || item.code) + '</small></button>';
    }).join("");
  }
  function updateFeedMeta() {
    var updated = $("#globalLaunchUpdated");
    var freshness = $("#globalLaunchFreshness");
    var coverage = $("#globalLaunchCoverageNote");
    var clock = $("#globalLaunchClockNote");
    var stamp = state.data && state.data.updated_utc;
    var condition = Display.freshness(stamp, Date.now());
    if (updated) updated.textContent = tr("updated") + ": " + formatUpdated(stamp);
    if (freshness) {
      freshness.className = "event-display-freshness is-" + condition;
      freshness.textContent = tr(condition === "fresh" ? "fresh" : condition === "stale" ? "staleLabel" : condition === "invalid" ? "syncInvalid" : "syncPending");
    }
    if (coverage) coverage.textContent = tr("source");
    if (clock) clock.textContent = tr("timeLabelLaunch");
  }

  function renderResults() {
    var results = $("#globalLaunchResults");
    var countEl = $("#globalLaunchResultCount");
    var updatedEl = $("#globalLaunchUpdated");
    var stateEl = $("#globalLaunchFeedState");
    if (!results || !countEl || !updatedEl || !stateEl) return;
    updateFeedMeta();
    renderFilterSummary();
    var jumpCount = $("#launchMissionJumpCount");
    if (jumpCount) jumpCount.textContent = "—";

    var reloadButton = $("#globalLaunchReload");
    if (reloadButton) reloadButton.disabled = !!state.loading;
    if (state.loading) {
      countEl.textContent = "—";
      stateEl.className = "global-launch-feed-state is-loading";
      stateEl.textContent = tr("loading");
      results.innerHTML = renderEmpty(tr("loading"), "loading");
      return;
    }
    if (state.error && !activeData()) {
      countEl.textContent = "—";
      stateEl.className = "global-launch-feed-state is-error";
      stateEl.textContent = tr("error");
      results.innerHTML = renderEmpty(tr("error"), "error");
      return;
    }
    if (!state.data || state.data.coverage_status !== "complete_from_source_at_fetch_time") {
      countEl.textContent = "—";
      stateEl.className = "global-launch-feed-state is-pending";
      stateEl.textContent = tr("waiting");
      results.innerHTML = renderEmpty(tr("waiting"), "waiting");
      return;
    }

    var rows = Filters.filterLaunches(state.data.launches, {
      days: state.days,
      countryBasis: state.countryBasis,
      countryCodes: state.selectedCountries,
      aliases: state.aliases,
      now: Date.now()
    });
    countEl.textContent = number(rows.length) + " " + (rows.length === 1 ? tr("launches") : tr("launchesPlural"));
    if (jumpCount) jumpCount.textContent = number(rows.length);
    var feedHealth = Display.freshness(state.data.updated_utc, Date.now());
    var feedHealthText = tr(feedHealth === "fresh" ? "fresh" : feedHealth === "stale" ? "stale" : feedHealth === "invalid" ? "syncInvalid" : "syncPending");
    stateEl.className = "global-launch-feed-state is-ready" + (feedHealth === "fresh" && !state.refreshError ? "" : " is-stale");
    stateEl.textContent = (state.refreshError ? tr("refreshFailed") + " · " : "") + feedHealthText;
    if (!rows.length) {
      results.innerHTML = renderEmpty(tr("noResults"), "empty", true);
      return;
    }
    results.innerHTML = rows.map(renderLaunchCard).join("");
  }

  function renderEmpty(message, kind, showReset) {
    return '<div class="global-launch-empty launch-mission-empty is-' + esc(kind) + '">' +
      '<div class="launch-mission-empty-art" aria-hidden="true">' +
      '<svg viewBox="0 0 130 130" fill="none"><circle cx="65" cy="65" r="50" stroke="currentColor" stroke-opacity=".22" stroke-dasharray="4 6"/><circle cx="65" cy="65" r="31" stroke="currentColor" stroke-opacity=".34"/><path d="M65 25v80M25 65h80" stroke="currentColor" stroke-opacity=".24"/><path d="M45 89L84 39 78 80z" fill="currentColor" fill-opacity=".28" stroke="currentColor" stroke-width="1.6"/><circle cx="65" cy="65" r="5" fill="currentColor"/></svg></div>' +
      '<p>' + esc(message) + '</p>' + (showReset ? '<p class="event-display-empty-tip">' + esc(tr("emptyTip")) + '</p><button type="button" class="event-display-reset" data-step7-reset>' + esc(tr("reset")) + '</button>' : '') + '</div>';
  }

  function renderLaunchCard(event, index) {
    var key = statusKey(event.status);
    var status = tr(key);
    var precision = tr(precisionKey(event.net_precision));
    var opCountry = countryName(event.operator_country_code);
    var siteCountry = countryName(event.launch_country_code);
    var title = event.launch_name || event.mission_name || event.rocket_name || (lang() === "fa" ? "پرتاب بدون عنوان" : "Untitled launch");
    var date = formatNet(event);
    var fields = [];
    if (event.rocket_name) fields.push('<span><small>' + esc(tr("rocket")) + '</small><bdi>' + esc(event.rocket_name) + '</bdi></span>');
    if (event.mission_name) fields.push('<span><small>' + esc(tr("mission")) + '</small><bdi>' + esc(event.mission_name) + '</bdi></span>');
    var operator = event.operator_name ? esc(event.operator_name) : "—";
    var site = [event.pad_name, event.location_name].filter(Boolean).join(" · ");
    return '<article class="global-launch-card">' +
      '<div class="launch-mission-card-index"><span dir="ltr">FLIGHT / ' + esc(String(index + 1).padStart(2, "0")) + '</span><span class="launch-mission-card-index-line" aria-hidden="true"></span></div>' +
      '<div class="global-launch-card-top">' +
        '<div class="global-launch-card-title"><span class="global-launch-status ' + statusClass(key) + '">' + esc(status) + '</span><strong><bdi>' + esc(title) + '</bdi></strong></div>' +
        '<div class="global-launch-card-date event-display-date"><span class="event-display-date-caption">' + esc(tr("dateBasisLabel")) + '</span><bdi>' + esc(date) + '</bdi><small>' + esc(precision) + '</small></div>' +
      '</div>' +
      (fields.length ? '<div class="global-launch-card-fields">' + fields.join("") + '</div>' : '') +
      '<div class="global-launch-card-meta">' +
        '<span><small>' + esc(tr("operatorName")) + '</small><bdi>' + operator + '</bdi></span>' +
        '<span><small>' + esc(tr("launchSite")) + '</small><bdi>' + esc(site || "—") + '</bdi></span>' +
      '</div>' +
      '<div class="global-launch-card-countries">' +
        '<span>' + esc(tr("operatorCountry")) + ': <bdi>' + esc(opCountry) + '</bdi></span>' +
        '<span>' + esc(tr("siteCountry")) + ': <bdi>' + esc(siteCountry) + '</bdi></span>' +
      '</div>' +
    '</article>';
  }

  function openDialog() {
    if (!dialog.open) dialog.showModal();
    renderChrome();
    if (!state.countriesPromise) loadCountries().then(renderChrome);
    if (!state.data && !state.dataPromise) loadLaunchData(!!state.error);
  }

  openButton.addEventListener("click", openDialog);
  $("#globalLaunchClose").addEventListener("click", function () { dialog.close(); });
  $("#globalLaunchReload").addEventListener("click", function () { loadLaunchData(true); });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", function () { openButton.setAttribute("aria-expanded", "false"); });
  dialog.addEventListener("cancel", function () { openButton.setAttribute("aria-expanded", "false"); });
  dialog.addEventListener("close", function () { openButton.blur(); });
  openButton.addEventListener("click", function () { openButton.setAttribute("aria-expanded", "true"); });

  $("#globalLaunchPeriods").addEventListener("click", function (event) {
    var button = event.target.closest("button[data-days]");
    if (!button) return;
    state.days = Number(button.getAttribute("data-days"));
    renderChrome();
  });
  $("#globalLaunchCountryBasis").addEventListener("change", function (event) {
    state.countryBasis = event.target.value === "site" ? "site" : "operator";
    renderCountrySelection();
    renderCountryOptions();
    renderResults();
  });
  $("#globalLaunchCountrySearch").addEventListener("input", function (event) {
    state.countryQuery = event.target.value || "";
    if (state.countryQuery.trim()) state.countryListExpanded = true;
    renderCountryBrowserMode();
    renderCountryOptions();
  });
  $("#launchMissionCountryToggle").addEventListener("click", function () {
    state.countryListExpanded = !state.countryListExpanded;
    renderCountryBrowserMode();
  });
  $("#launchMissionJumpResults").addEventListener("click", function () {
    var target = $("#globalLaunchResultsHeading");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.focus({ preventScroll: true });
    }
  });
  $("#globalLaunchAllCountries").addEventListener("click", function () {
    state.selectedCountries = [];
    renderCountrySelection();
    renderCountryOptions();
    renderResults();
  });
  $(".launch-mission-quick-countries").addEventListener("click", function (event) {
    var button = event.target.closest("button[data-quick-country]");
    if (!button) return;
    var code = button.getAttribute("data-quick-country");
    var index = state.selectedCountries.indexOf(code);
    if (index >= 0) state.selectedCountries.splice(index, 1);
    else state.selectedCountries.push(code);
    state.selectedCountries.sort();
    renderCountrySelection();
    renderCountryOptions();
    renderResults();
  });
  $("#globalLaunchSelectedCountries").addEventListener("click", function (event) {
    var button = event.target.closest("button[data-remove-country-code]");
    if (!button) return;
    var code = button.getAttribute("data-remove-country-code");
    state.selectedCountries = state.selectedCountries.filter(function (c) { return c !== code; });
    renderCountrySelection();
    renderCountryOptions();
    renderResults();
  });
  $("#globalLaunchCountryOptions").addEventListener("click", function (event) {
    var button = event.target.closest("button[data-country-code]");
    if (!button) return;
    var code = button.getAttribute("data-country-code");
    var index = state.selectedCountries.indexOf(code);
    if (index >= 0) state.selectedCountries.splice(index, 1);
    else state.selectedCountries.push(code);
    state.selectedCountries.sort();
    renderCountrySelection();
    renderCountryOptions();
    renderResults();
  });
  $("#globalLaunchResults").addEventListener("click", function (event) {
    var button = event.target.closest("[data-step7-reset]");
    if (!button) return;
    state.days = 30;
    state.selectedCountries = [];
    state.countryQuery = "";
    var search = $("#globalLaunchCountrySearch");
    if (search) search.value = "";
    renderChrome();
  });
  var langButton = $("#langBtn");
  if (langButton) langButton.addEventListener("click", function () { setTimeout(renderChrome, 0); });
  renderChrome();
})();
