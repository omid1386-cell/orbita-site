/* ORBITA — Step 7 common presentation helpers for launch and landing feeds.
 * No network, no mutation of source data, no guessed event times.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ORBITAUpcomingEventDisplay = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var locales = { fa: "fa-IR-u-ca-gregory", en: "en-GB", ar: "ar-u-ca-gregory-nu-latn" };
  function locale(lang) { return locales[lang] || locales.fa; }
  function validDate(value) {
    if (!value || typeof value !== "string") return null;
    var date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  function dateParts(date, lang, opts) {
    try { return new Intl.DateTimeFormat(locale(lang), Object.assign({timeZone:"UTC"}, opts)).format(date); }
    catch (e) { return date.toISOString().slice(0,10); }
  }
  function precision(value) {
    var raw = String(value || "").toLowerCase();
    if (/second|sec/.test(raw)) return "sec";
    if (/minute|min/.test(raw)) return "min";
    if (/hour|hr/.test(raw)) return "hour";
    if (/day/.test(raw)) return "day";
    if (/month/.test(raw)) return "month";
    if (/quarter/.test(raw)) return "quarter";
    if (/year/.test(raw)) return "year";
    return "tbd";
  }
  function number(value, lang) {
    try {return new Intl.NumberFormat(lang === "fa" ? "fa-IR" : lang === "ar" ? "ar-u-nu-latn" : "en-GB").format(value);}
    catch (e) {return String(value);}
  }
  function launchTime(event, lang, noDate) {
    var d = validDate(event && event.net);
    if (!d) return {text:noDate, precision:"tbd", timeKnown:false};
    var key = precision(event.net_precision);
    if (key === "year") return {text:dateParts(d,lang,{year:"numeric"}),precision:key,timeKnown:false};
    if (key === "quarter") {
      var q = number(Math.floor(d.getUTCMonth()/3)+1,lang);
      return {text:(lang === "fa" ? "سه‌ماههٔ " : lang === "ar" ? "الربع " : "Q") + q + " " + dateParts(d,lang,{year:"numeric"}),precision:key,timeKnown:false};
    }
    if (key === "month") return {text:dateParts(d,lang,{month:"long",year:"numeric"}),precision:key,timeKnown:false};
    var opts = {day:"numeric",month:"short",year:"numeric"};
    var hasClock = key === "sec" || key === "min" || key === "hour";
    if (hasClock) {
      opts.hour = "2-digit";
      if (key !== "hour") opts.minute = "2-digit";
      if (key === "sec") opts.second = "2-digit";
      opts.hourCycle = "h23";
    }
    return {text:dateParts(d,lang,opts) + (hasClock ? " UTC" : ""),precision:key,timeKnown:hasClock};
  }
  function landingDate(event, lang, noDate) {
    var raw = String(event && event.date_utc || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return {text:noDate,timeKnown:false};
    var date = validDate(raw + "T00:00:00Z");
    if (!date || date.toISOString().slice(0,10) !== raw) return {text:noDate,timeKnown:false};
    return {text:dateParts(date,lang,{day:"numeric",month:"short",year:"numeric"}),timeKnown:false};
  }
  function updatedAt(value, lang, fallback) {
    var d = validDate(value);
    if (!d) return fallback || "—";
    return dateParts(d,lang,{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}) + " UTC";
  }
  function freshness(value, now) {
    var d = validDate(value);
    if (!d) return "missing";
    var n = Number.isFinite(now) ? now : Date.now();
    if (d.getTime() > n + 5 * 60000) return "invalid";
    return n - d.getTime() > 86400000 ? "stale" : "fresh";
  }
  return Object.freeze({launchTime:launchTime,landingDate:landingDate,updatedAt:updatedAt,freshness:freshness,precision:precision});
});
