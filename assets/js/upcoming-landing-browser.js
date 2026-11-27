/* ORBITA — worldwide upcoming landing browser (Steps 5–6)
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
  var dialog = $("#globalLandingDialog");
  var openButton = $("#upcomingLandingsBtn");
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
    countryQuery: ""
  };

  var COPY = {
    fa: {
      open: "فرودهای پیش‌رو", eyebrow: "پایش جهانی فرودها", title: "فهرست فرودهای پیش‌رو",
      intro: "فرودهای اعلام‌شده را بر اساس زمان و یک یا چند کشور فیلتر کنید؛ پوشش جهانی هنوز کامل نیست.", close: "بستن",
      time: "بازه زمانی", d7: "۱ هفته آینده", d14: "۲ هفته آینده", d30: "۱ ماه آینده", d120: "۴ ماه آینده",
      country: "فیلتر کشورها", all: "همه کشورها", selected: "کشور انتخاب‌شده", selectedPlural: "کشور انتخاب‌شده",
      countrySearch: "جستجوی کشور…", basis: "مبنای انتساب کشور", operator: "کشور اپراتور فرود", site: "کشور جغرافیایی محل بازیابی",
      basisNote: "کشور اپراتور با کشور محل فرود یکسان نیست. برای شناورهای اقیانوسی و محل‌های فاقد داده معتبر، کشور نامشخص باقی می‌ماند.",
      results: "نتیجه", landings: "فرود", landingsPlural: "فرود", loading: "در حال دریافت اطلاعات فرودها…",
      waiting: "بانک جهانی فرودها هنوز نخستین همگام‌سازی موفق را دریافت نکرده است.",
      error: "دریافت اطلاعات فرودها انجام نشد.", noResults: "در این بازه و کشورها فرودی در داده‌های موجود ثبت نشده است.",
      noCountries: "کشوری پیدا نشد.", retry: "تلاش دوباره", updated: "آخرین به‌روزرسانی", stale: "بانک فرودها بیش از ۲۴ ساعت به‌روزرسانی نشده است.",
      source: "منبع: Launch Library 2 و برنامه‌های گردآوری‌شده ORBITA · پوشش ناقص است؛ زمان فرود قطعی نیست.",
      refreshFailed: "به‌روزرسانی ناموفق بود؛ آخرین داده معتبر نمایش داده می‌شود.",
      mission: "مأموریت", vehicle: "وسیله", operatorName: "اپراتور", landingSite: "محل فرود / بازیابی", landingType: "نوع فرود",
      operatorCountry: "کشور اپراتور", siteCountry: "کشور محل بازیابی", precision: "دقت زمان", status: "وضعیت",
      confirmed: "اعلام‌شده", tentative: "برنامه‌ریزی‌شده/تأییدنشده", unscheduled: "زمان نامشخص", hold: "متوقف", cancelled: "لغوشده", unknown: "نامشخص",
      noDate: "تاریخ معتبر ندارد", dateBasisLaunch: "روز پرتاب مرتبط؛ نه ساعت فرود", dateBasisMission: "تاریخ پایان مأموریت؛ تخمینی", dateBasisCurated: "تاریخ ثبت‌شده در بانک قبلی؛ نیازمند بازبینی",
      unknownCountry: "نامشخص", chooseCountry: "برای محدودکردن فهرست، چند کشور انتخاب کنید.", allCount: "همه کشورها",
      syncPending: "در انتظار نخستین به‌روزرسانی", fresh: "داده تازه", staleLabel: "نیازمند به‌روزرسانی", syncInvalid: "زمان به‌روزرسانی نامعتبر", reset: "پاک‌کردن فیلترها", emptyTip: "بازه زمانی یا کشورهای انتخابی را تغییر دهید.", timeLabelLaunch: "ساعت فقط برای زمان‌های دارای دقت کافی نمایش داده می‌شود؛ همه ساعت‌ها UTC هستند.", timeLabelLanding: "تاریخ‌های فرود فقط روز را نشان می‌دهند؛ ساعت دقیق فرود از این داده‌ها قابل استنباط نیست.", notExactLanding: "این تاریخ، ساعت تأییدشده فرود نیست.", dateBasisLabel: "تاریخ مرجع"
    },
    en: {
      open: "Upcoming landings", eyebrow: "Worldwide landing monitor", title: "Upcoming landings",
      intro: "Filter reported landings by time and country. Global coverage is not yet complete.", close: "Close",
      time: "Time window", d7: "Next 7 days", d14: "Next 14 days", d30: "Next 30 days", d120: "Next 120 days",
      country: "Country filters", all: "All countries", selected: "country selected", selectedPlural: "countries selected",
      countrySearch: "Search countries…", basis: "Country attribution", operator: "Landing operator country", site: "Recovery location country",
      basisNote: "Operator and recovery country can differ. Offshore vessels and locations without verified attribution remain unknown.",
      results: "Results", landings: "landing", landingsPlural: "landings", loading: "Loading landing data…",
      waiting: "The worldwide landing index is awaiting its first successful sync.",
      error: "Unable to load landing data.", noResults: "No recorded landing matches the selected filters.",
      noCountries: "No matching country.", retry: "Retry", updated: "Data last updated", stale: "Landing data is more than 24 hours old.",
      source: "Source: Launch Library 2 and ORBITA curated entries · Coverage is partial; landing times are not confirmed.",
      refreshFailed: "Refresh failed; showing last validated data.",
      mission: "Mission", vehicle: "Vehicle", operatorName: "Operator", landingSite: "Landing / recovery location", landingType: "Landing type",
      operatorCountry: "Operator country", siteCountry: "Recovery location country", precision: "Time precision", status: "Status",
      confirmed: "Reported", tentative: "Planned / unconfirmed", unscheduled: "Unscheduled", hold: "On hold", cancelled: "Cancelled", unknown: "Unknown",
      noDate: "No verified date", dateBasisLaunch: "Associated launch date; not landing time", dateBasisMission: "Estimated mission end date", dateBasisCurated: "Legacy schedule date; recheck needed",
      unknownCountry: "Unknown", chooseCountry: "Select one or more countries to filter.", allCount: "All countries",
      syncPending: "Awaiting first update", fresh: "Up to date", staleLabel: "Update overdue", syncInvalid: "Invalid update timestamp", reset: "Clear filters", emptyTip: "Try a different time window or country selection.", timeLabelLaunch: "Clock times appear only when the source provides sufficient precision; all shown times are UTC.", timeLabelLanding: "Landing dates indicate the calendar day only; no exact landing time is inferred.", notExactLanding: "This is not a verified landing time.", dateBasisLabel: "Reference date"
    },
    ar: {
      open: "الهبوطات القادمة", eyebrow: "متابعة عمليات الهبوط", title: "عمليات الهبوط القادمة",
      intro: "تصفية عمليات الهبوط حسب الفترة والدول. التغطية العالمية غير مكتملة بعد.", close: "إغلاق",
      time: "الفترة الزمنية", d7: "الأسبوع القادم", d14: "الأسبوعان القادمان", d30: "الشهر القادم", d120: "الأشهر الأربعة القادمة",
      country: "تصفية الدول", all: "جميع الدول", selected: "دولة محددة", selectedPlural: "دول محددة",
      countrySearch: "بحث عن دولة…", basis: "أساس الدولة", operator: "دولة المشغّل", site: "دولة موقع الاستعادة",
      basisNote: "قد تختلف دولة المشغل عن دولة الهبوط. لا نُسند جنسية للسفن البحرية أو للمواقع غير المحددة.",
      results: "النتائج", landings: "هبوط", landingsPlural: "هبوطات", loading: "جارٍ تحميل بيانات الهبوط…",
      waiting: "بانتظار أول مزامنة ناجحة لبيانات الهبوط.", error: "تعذر تحميل عمليات الهبوط.",
      noResults: "لا توجد عمليات هبوط مسجلة تطابق التصفية.", noCountries: "لم يتم العثور على دولة.", retry: "إعادة المحاولة",
      updated: "آخر تحديث", stale: "بيانات الهبوط أقدم من 24 ساعة.",
      source: "المصدر: Launch Library 2 وسجلات ORBITA · التغطية جزئية وأوقات الهبوط غير مؤكدة.",
      refreshFailed: "فشل التحديث؛ تظهر آخر بيانات موثقة.",
      mission: "المهمة", vehicle: "المركبة", operatorName: "المشغّل", landingSite: "موقع الهبوط / الاستعادة", landingType: "نوع الهبوط",
      operatorCountry: "دولة المشغّل", siteCountry: "دولة موقع الاستعادة", precision: "دقة الوقت", status: "الحالة",
      confirmed: "معلن", tentative: "مخطط / غير مؤكد", unscheduled: "غير مجدول", hold: "معلّق", cancelled: "ملغى", unknown: "غير معروف",
      noDate: "لا موعد مؤكداً", dateBasisLaunch: "يوم الإطلاق المرتبط؛ وليس وقت الهبوط", dateBasisMission: "تاريخ انتهاء المهمة التقريبي", dateBasisCurated: "تاريخ جدول سابق يحتاج للمراجعة",
      unknownCountry: "غير معروف", chooseCountry: "اختر دولة واحدة أو أكثر للتصفية.", allCount: "جميع الدول",
      syncPending: "في انتظار أول تحديث", fresh: "بيانات حديثة", staleLabel: "تحديث متأخر", syncInvalid: "وقت التحديث غير صالح", reset: "مسح المرشحات", emptyTip: "جرّب تغيير الفترة الزمنية أو الدول المختارة.", timeLabelLaunch: "لا تظهر الساعة إلا عند توافر دقة كافية؛ جميع الأوقات المعروضة بتوقيت UTC.", timeLabelLanding: "تُعرض تواريخ الهبوط باليوم فقط؛ لا يمكن استنتاج ساعة هبوط دقيقة من هذه البيانات.", notExactLanding: "هذا ليس توقيت هبوط مؤكداً.", dateBasisLabel: "تاريخ مرجعي"
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
  function formatNet(event) { return Display.landingDate(event, lang(), tr("noDate")).text; }
  function formatUpdated(value) { return Display.updatedAt(value, lang(), tr("syncPending")); }
  function statusKey(value) {
    var s = String(value || "").toLowerCase();
    if (s === "go" || s === "confirmed") return "confirmed";
    if (s === "planned") return "tentative";
    if (s === "tbc" || s === "tentative") return "tentative";
    if (s === "tbd" || s === "unscheduled") return "unscheduled";
    if (s === "hold" || s === "on_hold") return "hold";
    if (/cancel|abort|scrub/.test(s)) return "cancelled";
    return "unknown";
  }
  function statusClass(key) {
    return key === "confirmed" ? "is-confirmed" : key === "tentative" ? "is-tentative" : key === "hold" ? "is-hold" : key === "cancelled" ? "is-cancelled" : "is-unknown";
  }
  function activeData() {
    return state.data && state.data.coverage_status === "partial_source_coverage" && Array.isArray(state.data.landings);
  }

  function loadCountries() {
    if (state.countriesPromise) return state.countriesPromise;
    state.countriesPromise = fetch("data/country_codes.json?v=" + encodeURIComponent(window.ORBITA_UPCOMING_LANDINGS_V || "20261121-step3-4"))
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

  function loadLandingData(force) {
    if (state.data && !force) return Promise.resolve(state.data);
    if (state.dataPromise) return state.dataPromise;
    state.loading = true;
    state.error = "";
    renderResults();
    var version = window.ORBITA_UPCOMING_LANDINGS_V || window.ORBITA_V || "1";
    state.dataPromise = fetch("data/upcoming_global_landings.json?v=" + encodeURIComponent(version), { cache: "no-store" })
      .then(function (response) { if (!response.ok) throw new Error("HTTP " + response.status); return response.json(); })
      .then(function (doc) {
        if (!doc || doc.schema_version !== 1 || !Array.isArray(doc.landings) || doc.count !== doc.landings.length) {
          throw new Error("Invalid global landing snapshot");
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
    openButton.textContent = "";
    var icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "🛬";
    var label = document.createElement("span");
    label.textContent = tr("open");
    openButton.appendChild(icon);
    openButton.appendChild(label);
    // UX V21: the matching navy mission-room labels follow the active locale.
    var parityLabels = {
      fa: ["تنظیمات رصد", "جریان فرودها"],
      en: ["Mission filters", "Landing feed"],
      ar: ["مرشحات المهمة", "سجل الهبوط"]
    };
    var parity = parityLabels[language] || parityLabels.fa;
    var filterHeading = $("#raspehrLandingFilterHeading");
    var feedLabel = $("#raspehrLandingFeedLabel");
    if (filterHeading) filterHeading.textContent = parity[0];
    if (feedLabel) feedLabel.textContent = parity[1];
    var textMap = {
      "#globalLandingEyebrow": "eyebrow", "#globalLandingTitle": "title", "#globalLandingIntro": "intro",
      "#globalLandingTimeLabel": "time", "#globalLandingCountryLabel": "country",
      "#globalLandingCountrySearchLabel": "countrySearch", "#globalLandingBasisLabel": "basis",
      "#globalLandingBasisNote": "basisNote", "#globalLandingAllCountries": "all", "#globalLandingReload": "retry"
    };
    Object.keys(textMap).forEach(function (selector) {
      var el = $(selector); if (el) el.textContent = tr(textMap[selector]);
    });
    var close = $("#globalLandingClose");
    if (close) { close.textContent = "×"; close.setAttribute("aria-label", tr("close")); close.title = tr("close"); }
    var basis = $("#globalLandingCountryBasis");
    if (basis) {
      basis.options[0].textContent = tr("operator");
      basis.options[1].textContent = tr("site");
      basis.value = state.countryBasis;
    }
    var search = $("#globalLandingCountrySearch");
    if (search) search.placeholder = tr("countrySearch");
    $$(".global-launch-period").forEach(function (button) {
      var days = button.getAttribute("data-days");
      button.textContent = tr(days === "7" ? "d7" : days === "14" ? "d14" : days === "120" ? "d120" : "d30");
      button.setAttribute("aria-pressed", String(Number(days) === state.days));
      button.classList.toggle("is-active", Number(days) === state.days);
    });
    var note = $("#globalLandingCountryHelp");
    if (note) note.textContent = tr("chooseCountry");
    renderCountrySelection();
    renderCountryOptions();
    renderResults();
  }
  function $$(selector) { return Array.prototype.slice.call(dialog.querySelectorAll(selector)); }

  function countryList() {
    return (state.countries || []).slice().sort(function (a, b) {
      return String(a[lang()] || a.en || a.code).localeCompare(String(b[lang()] || b.en || b.code), lang());
    });
  }
  function renderCountrySelection() {
    var box = $("#globalLandingSelectedCountries");
    var all = $("#globalLandingAllCountries");
    var count = $("#globalLandingCountryCount");
    if (!box || !all || !count) return;
    var selected = state.selectedCountries;
    all.classList.toggle("is-active", selected.length === 0);
    all.setAttribute("aria-pressed", String(selected.length === 0));
    if (!selected.length) {
      count.textContent = tr("allCount");
      box.innerHTML = '<span class="global-launch-selected-chip is-all">' + esc(tr("allCount")) + '</span>';
      return;
    }
    count.textContent = number(selected.length) + " " + (selected.length === 1 ? tr("selected") : tr("selectedPlural"));
    box.innerHTML = selected.map(function (code) {
      return '<span class="global-launch-selected-chip">' + esc(countryName(code)) + '</span>';
    }).join("");
  }
  function renderCountryOptions() {
    var list = $("#globalLandingCountryOptions");
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
    var updated = $("#globalLandingUpdated");
    var freshness = $("#globalLandingFreshness");
    var coverage = $("#globalLandingCoverageNote");
    var clock = $("#globalLandingClockNote");
    var stamp = state.data && state.data.updated_utc;
    var condition = Display.freshness(stamp, Date.now());
    if (updated) updated.textContent = tr("updated") + ": " + formatUpdated(stamp);
    if (freshness) {
      freshness.className = "event-display-freshness is-" + condition;
      freshness.textContent = tr(condition === "fresh" ? "fresh" : condition === "stale" ? "staleLabel" : condition === "invalid" ? "syncInvalid" : "syncPending");
    }
    if (coverage) coverage.textContent = tr("source");
    if (clock) clock.textContent = tr("timeLabelLanding");
  }

  function renderResults() {
    var results = $("#globalLandingResults");
    var countEl = $("#globalLandingResultCount");
    var updatedEl = $("#globalLandingUpdated");
    var stateEl = $("#globalLandingFeedState");
    if (!results || !countEl || !updatedEl || !stateEl) return;
    updateFeedMeta();

    var reloadButton = $("#globalLandingReload");
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
    if (!state.data || state.data.coverage_status !== "partial_source_coverage") {
      countEl.textContent = "—";
      stateEl.className = "global-launch-feed-state is-pending";
      stateEl.textContent = tr("waiting");
      results.innerHTML = renderEmpty(tr("waiting"), "waiting");
      return;
    }

    var rows = Filters.filterEvents(state.data.landings, {
      days: state.days,
      countryBasis: state.countryBasis,
      countryCodes: state.selectedCountries,
      aliases: state.aliases,
      now: Date.now()
    });
    countEl.textContent = number(rows.length) + " " + (rows.length === 1 ? tr("landings") : tr("landingsPlural"));
    var feedHealth = Display.freshness(state.data.updated_utc, Date.now());
    var feedHealthText = tr(feedHealth === "fresh" ? "fresh" : feedHealth === "stale" ? "stale" : feedHealth === "invalid" ? "syncInvalid" : "syncPending");
    stateEl.className = "global-launch-feed-state is-ready" + (feedHealth === "fresh" && !state.refreshError ? "" : " is-stale");
    stateEl.textContent = (state.refreshError ? tr("refreshFailed") + " · " : "") + feedHealthText;
    if (!rows.length) {
      results.innerHTML = renderEmpty(tr("noResults"), "empty", true);
      return;
    }
    results.innerHTML = rows.map(renderLandingCard).join("");
  }

  function renderEmpty(message, kind, showReset) {
    return '<div class="global-launch-empty event-display-empty is-' + esc(kind) + '">' +
      '<span class="event-display-empty-symbol" aria-hidden="true">◉</span>' +
      '<p>' + esc(message) + '</p>' +
      (showReset ? '<p class="event-display-empty-tip">' + esc(tr("emptyTip")) + '</p><button type="button" class="event-display-reset" data-step7-reset>' + esc(tr("reset")) + '</button>' : '') +
      '</div>';
  }

  function renderLandingCard(event) {
    var key = statusKey(event.status);
    var basis = event.date_basis === "associated_launch_date_not_landing_time" ? "dateBasisLaunch" :
      event.date_basis === "spacecraft_mission_end_estimate" ? "dateBasisMission" : "dateBasisCurated";
    var title = event.mission_name || (lang() === "fa" ? "فرود بدون عنوان" : "Untitled landing");
    var fields = [];
    if (event.vehicle_name) fields.push('<span><small>' + esc(tr("vehicle")) + '</small><bdi>' + esc(event.vehicle_name) + '</bdi></span>');
    if (event.landing_type) fields.push('<span><small>' + esc(tr("landingType")) + '</small><bdi>' + esc(event.landing_type) + '</bdi></span>');
    return '<article class="global-launch-card">' +
      '<div class="global-launch-card-top"><div class="global-launch-card-title"><span class="global-launch-status ' + statusClass(key) + '">' + esc(tr(key)) +
      '</span><strong><bdi>' + esc(title) + '</bdi></strong></div>' +
      '<div class="global-launch-card-date event-display-date"><span class="event-display-date-caption">' + esc(tr("dateBasisLabel")) + '</span><bdi>' + esc(formatNet(event)) + '</bdi><small class="event-display-date-basis">' + esc(tr(basis)) + '</small></div></div>' +
      (fields.length ? '<div class="global-launch-card-fields">' + fields.join('') + '</div>' : '') +
      '<div class="global-launch-card-meta"><span><small>' + esc(tr("operatorName")) + '</small><bdi>' + esc(event.operator_name || '—') + '</bdi></span>' +
      '<span><small>' + esc(tr("landingSite")) + '</small><bdi>' + esc(event.recovery_location_name || '—') + '</bdi></span></div>' +
      '<div class="global-launch-card-countries"><span>' + esc(tr("operatorCountry")) + ': <bdi>' + esc(countryName(event.operator_country_code)) + '</bdi></span>' +
      '<span>' + esc(tr("siteCountry")) + ': <bdi>' + esc(countryName(event.recovery_country_code)) + '</bdi></span></div></article>';
  }

  function openDialog() {
    if (!dialog.open) dialog.showModal();
    renderChrome();
    if (!state.countriesPromise) loadCountries().then(renderChrome);
    if (!state.data && !state.dataPromise) loadLandingData(!!state.error);
  }

  openButton.addEventListener("click", openDialog);
  $("#globalLandingClose").addEventListener("click", function () { dialog.close(); });
  $("#globalLandingReload").addEventListener("click", function () { loadLandingData(true); });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", function () { openButton.setAttribute("aria-expanded", "false"); });
  dialog.addEventListener("cancel", function () { openButton.setAttribute("aria-expanded", "false"); });
  dialog.addEventListener("close", function () { openButton.blur(); });
  openButton.addEventListener("click", function () { openButton.setAttribute("aria-expanded", "true"); });

  $("#globalLandingPeriods").addEventListener("click", function (event) {
    var button = event.target.closest("button[data-days]");
    if (!button) return;
    state.days = Number(button.getAttribute("data-days"));
    renderChrome();
  });
  $("#globalLandingCountryBasis").addEventListener("change", function (event) {
    state.countryBasis = event.target.value === "site" ? "site" : "operator";
    renderCountrySelection();
    renderCountryOptions();
    renderResults();
  });
  $("#globalLandingCountrySearch").addEventListener("input", function (event) {
    state.countryQuery = event.target.value || "";
    renderCountryOptions();
  });
  $("#globalLandingAllCountries").addEventListener("click", function () {
    state.selectedCountries = [];
    renderCountrySelection();
    renderCountryOptions();
    renderResults();
  });
  $("#globalLandingCountryOptions").addEventListener("click", function (event) {
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
  $("#globalLandingResults").addEventListener("click", function (event) {
    var button = event.target.closest("[data-step7-reset]");
    if (!button) return;
    state.days = 30;
    state.selectedCountries = [];
    state.countryQuery = "";
    var search = $("#globalLandingCountrySearch");
    if (search) search.value = "";
    renderChrome();
  });
  var langButton = $("#langBtn");
  if (langButton) langButton.addEventListener("click", function () { setTimeout(renderChrome, 0); });
  renderChrome();
})();
