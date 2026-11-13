/* RASPEHR: instant, non-blocking identity reveal. No map network or data logic here. */
(function () {
  'use strict';
  var splash = document.getElementById('raspehrSplash');
  if (!splash) return;
  var finished = false;
  window.RASPEHR_READY = function () {
    if (finished) return;
    finished = true;
    if (window.performance && performance.mark) performance.mark('raspehr-map-visible');
    splash.classList.add('raspehr-complete');
    splash.setAttribute('aria-hidden', 'true');
    window.setTimeout(function () { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 450);
  };
  var skip = document.getElementById('raspehrSkip');
  if (skip) skip.addEventListener('click', window.RASPEHR_READY);
  // If MapLibre or the remote basemap fails, visitors can manually reveal
  // the local page. No arbitrary minimum delay is imposed on a ready map.
  var notice = document.getElementById('raspehrLongLoad');
  window.setTimeout(function () {
    if (!finished && notice) notice.hidden = false;
    if (!finished && skip) skip.hidden = false;
  }, 4500);
})();
