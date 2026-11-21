/* ORBITA — shared upcoming-event filter engine (Steps 3–4)
 * Pure functions for launch and landing snapshots; used by the UI and tests.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ORBITAUpcomingLaunchFilters = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var PRESETS = Object.freeze([
    Object.freeze({ id: "7", days: 7 }),
    Object.freeze({ id: "14", days: 14 }),
    Object.freeze({ id: "30", days: 30 }),
    Object.freeze({ id: "120", days: 120 })
  ]);

  function validEpoch(value) {
    if (typeof value !== "string" || !value.trim()) return NaN;
    var n = Date.parse(value);
    return Number.isFinite(n) ? n : NaN;
  }

  function eventEpoch(event) {
    if (!event || typeof event !== "object") return NaN;
    var exact = validEpoch(event.net || event.net_utc);
    if (Number.isFinite(exact)) return exact;
    var date = String(event.date_utc || event.date || "").trim();
    if (/^\d{4}-\d\d-\d\d$/.test(date)) {
      // Use the start for stable ordering; the filter below handles the full day.
      return Date.parse(date + "T00:00:00.000Z");
    }
    return validEpoch(date);
  }

  function eventWithinWindow(event, now, end) {
    var exact = validEpoch(event && (event.net || event.net_utc));
    if (Number.isFinite(exact)) return exact >= now && exact < end;
    var date = String(event && (event.date_utc || event.date) || "").trim();
    if (/^\d{4}-\d\d-\d\d$/.test(date)) {
      var start = Date.parse(date + "T00:00:00.000Z");
      var dayEnd = start + 86400000;
      return Number.isFinite(start) && dayEnd > now && start < end;
    }
    var fallback = validEpoch(date);
    return Number.isFinite(fallback) && fallback >= now && fallback < end;
  }

  function normalizeCountryCode(value, aliases) {
    var code = String(value == null ? "" : value).trim().toUpperCase();
    if (!code || ["UNK", "UNKNOWN", "TBD", "N/A", "NONE", "NULL"].includes(code)) return "";
    return aliases && aliases[code] ? String(aliases[code]).toUpperCase() : code;
  }

  function countryCodeFor(event, basis, aliases) {
    if (!event || typeof event !== "object") return "";
    // The shared event contract uses site_country for both launch and
    // recovery locations. The global LL2 launch feed uses launch_country_code.
    var raw = basis === "site"
      ? (event.site_country || event.launch_country_code || event.recovery_country_code || event.landing_country_code)
      : (event.operator_country_code || event.operator_country);
    return normalizeCountryCode(raw, aliases);
  }

  function filterEvents(events, options) {
    options = options || {};
    var rows = Array.isArray(events) ? events : [];
    var days = Number(options.days);
    if (![7, 14, 30, 120].includes(days)) days = 30;
    var now = options.now instanceof Date ? options.now.getTime() : Number(options.now);
    if (!Number.isFinite(now)) now = Date.now();
    var end = now + days * 86400000;
    var selected = Array.isArray(options.countryCodes)
      ? options.countryCodes.map(function (x) { return normalizeCountryCode(x, options.aliases); }).filter(Boolean)
      : [];
    var selectedSet = new Set(selected);
    var basis = options.countryBasis === "site" ? "site" : "operator";
    var query = String(options.query || "").trim().toLocaleLowerCase();

    return rows.filter(function (event) {
      if (!event || typeof event !== "object") return false;
      var epoch = eventEpoch(event);
      if (!Number.isFinite(epoch) || !eventWithinWindow(event, now, end)) return false;
      if (selectedSet.size) {
        var code = countryCodeFor(event, basis, options.aliases);
        if (!code || !selectedSet.has(code)) return false;
      }
      if (query) {
        var haystack = [event.launch_name, event.mission_name, event.rocket_name,
          event.operator_name, event.pad_name, event.location_name,
          event.operator_country_code, event.launch_country_code,
          event.event_id, event.source_id]
          .filter(Boolean).join(" ").toLocaleLowerCase();
        if (haystack.indexOf(query) < 0) return false;
      }
      return true;
    }).sort(function (a, b) {
      var delta = eventEpoch(a) - eventEpoch(b);
      if (delta) return delta;
      return String(a.ll2_id || a.event_id || "").localeCompare(String(b.ll2_id || b.event_id || ""));
    });
  }

  function filterLaunches(events, options) {
    return filterEvents((Array.isArray(events) ? events : []).filter(function (event) {
      var kind = event && (event.event_kind || event.kind);
      return !kind || kind === "launch";
    }), options);
  }

  function availableCountryCodes(events, basis, aliases) {
    var set = new Set();
    (Array.isArray(events) ? events : []).forEach(function (event) {
      var code = countryCodeFor(event, basis, aliases);
      if (code) set.add(code);
    });
    return Array.from(set).sort();
  }

  return Object.freeze({
    PRESETS: PRESETS,
    validEpoch: validEpoch,
    eventEpoch: eventEpoch,
    eventWithinWindow: eventWithinWindow,
    normalizeCountryCode: normalizeCountryCode,
    countryCodeFor: countryCodeFor,
    filterEvents: filterEvents,
    filterLaunches: filterLaunches,
    availableCountryCodes: availableCountryCodes
  });
});
