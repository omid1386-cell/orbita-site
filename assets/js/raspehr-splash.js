/* RASPEHR: keep the branded intro until a fully painted, usable map is ready. */
(function () {
  'use strict';
  var splash = document.getElementById('raspehrSplash');
  if (!splash) return;
  var status = splash.querySelector('.raspehr-status');
  var createdAt = (window.performance && performance.now) ? performance.now() : Date.now();
  var minBrandMs = 1050; // allow the complete ESPASH identity to be seen
  var done = false;
  var queued = false;

  function dismiss() {
    if (done) return;
    done = true;
    if (window.performance && performance.mark) performance.mark('raspehr-map-visible');
    splash.classList.add('raspehr-complete');
    splash.setAttribute('aria-hidden', 'true');
    window.setTimeout(function () {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 340);
  }

  window.RASPEHR_READY = function () {
    if (done || queued) return;
    queued = true;
    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    window.setTimeout(dismiss, Math.max(0, minBrandMs - (now - createdAt)));
  };

  // No skip button, no early exit, no arbitrary maximum duration.
  // If the map takes longer, show a factual loading status rather than a blank map.
  window.setTimeout(function () {
    if (!done && status) status.textContent = 'در حال تکمیل نقشه و نشانگرهای فضایی…';
  }, 4500);
})();
