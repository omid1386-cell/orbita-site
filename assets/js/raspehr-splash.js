/* RASPEHR: short branded reveal; the map continues loading behind it. */
(function () {
  'use strict';
  var splash = document.getElementById('raspehrSplash');
  if (!splash) return;

  var startedAt = (window.performance && performance.now) ? performance.now() : Date.now();
  var MIN_VISIBLE_MS = 750;
  var MAX_VISIBLE_MS = 2300;
  var finished = false;
  var mapFrameReady = false;
  var finishTimer = 0;

  function finishSplash() {
    if (finished) return;
    finished = true;
    if (finishTimer) window.clearTimeout(finishTimer);
    if (window.performance && performance.mark) performance.mark('raspehr-map-visible');
    splash.classList.add('raspehr-complete');
    splash.setAttribute('aria-hidden', 'true');
    window.setTimeout(function () {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 340);
  }

  function markMapFrameReady() {
    if (finished) return;
    mapFrameReady = true;
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    var elapsed = now - startedAt;
    var remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    if (finishTimer) window.clearTimeout(finishTimer);
    finishTimer = window.setTimeout(finishSplash, remaining);
  }

  // Called after the first map frame. Basemap tiles and secondary layers
  // continue loading after the overlay has disappeared.
  window.RASPEHR_READY = markMapFrameReady;

  var skip = document.getElementById('raspehrSkip');
  if (skip) skip.addEventListener('click', finishSplash);

  var notice = document.getElementById('raspehrLongLoad');
  window.setTimeout(function () {
    if (!finished && !mapFrameReady && notice) notice.hidden = false;
    if (!finished && !mapFrameReady && skip) skip.hidden = false;
  }, 1500);

  // Hard limit: never keep visitors behind the brand screen for longer than
  // 2.3 seconds. The map status stays visible if the style is still pending.
  window.setTimeout(function () {
    if (!finished) finishSplash();
  }, MAX_VISIBLE_MS);
})();
