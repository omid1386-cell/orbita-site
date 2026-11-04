'use strict';
// Headless pointer-drag check against the running ORBITA preview.
// Uses the real CARTO style/tiles when reachable; does not change application source.
const { chromium } = require('playwright');
const ORIGIN = 'http://127.0.0.1:5173';
const BROWSER_ARGS = ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const TARGET = { id: 'recovery-utah', lon: -113.25, lat: 41 };

function stats(values) {
  if (!values.length) return { count: 0, medianMs: null, p95Ms: null, maxMs: null };
  const sorted = values.slice().sort((a, b) => a - b);
  const q = p => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))];
  return {
    count: sorted.length,
    medianMs: Number(q(0.5).toFixed(2)),
    p95Ms: Number(q(0.95).toFixed(2)),
    maxMs: Number(sorted[sorted.length - 1].toFixed(2))
  };
}

async function openMap(browser, { mobile = false } = {}) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 950 },
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    ignoreHTTPSErrors: true,
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  const pageErrors = [], failedRequests = [], consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('requestfailed', request => {
    const url = request.url();
    if (!/ll\.thespacedevs\.com/.test(url)) failedRequests.push({ url, error: request.failure() && request.failure().errorText });
  });
  await page.route(/ll\.thespacedevs\.com/, route => route.abort());
  await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.map && typeof window.map.loaded === 'function' && window.map.loaded() &&
    window.DATA && DATA.sites && DATA.sites.length === 64, { timeout: 60000 });
  await page.waitForFunction(() => {
    const s = window.map && map.getStyle && map.getStyle();
    return s && map.getSource('orbita-data-markers') && map.getLayer('orbita-data-marker-icons') &&
      map.getSource('orbita-country-interaction');
  }, { timeout: 45000 });
  // Wait briefly for the real online style, but do not mistake an offline fallback for it.
  try {
    await page.waitForFunction(() => {
      const style = map.getStyle();
      return style && Object.keys(style.sources || {}).some(name => /protomaps|carto/i.test(name));
    }, { timeout: 20000 });
  } catch (e) {}
  await page.locator('.recovery-chip').click();
  await page.waitForFunction(() => DATA.recoveries && DATA.recoveries.length === 20, { timeout: 20000 });
  await page.evaluate(({ lon, lat }) => map.jumpTo({ center: [lon, lat], zoom: 5.5 }), TARGET);
  await page.locator('[data-recovery-id="recovery-utah"]').waitFor({ timeout: 15000 });
  await page.waitForFunction(() => !map.isMoving() && map.loaded(), { timeout: 30000 });
  await page.waitForTimeout(700);
  const environment = await page.evaluate(() => {
    const style = map.getStyle();
    const sources = Object.keys(style.sources || {});
    return {
      styleName: style.name || '(unnamed style)',
      styleLayers: (style.layers || []).length,
      onlineVectorSource: sources.some(name => /protomaps|carto/i.test(name)),
      sourceNames: sources,
      tilesLoaded: typeof map.areTilesLoaded === 'function' ? map.areTilesLoaded() : null,
      domMarkers: document.querySelectorAll('.maplibregl-marker').length,
      recoveryMarkers: document.querySelectorAll('[data-recovery-id]').length,
      viewport: { width: innerWidth, height: innerHeight, touch: matchMedia('(pointer: coarse)').matches }
    };
  });
  return { context, page, environment, pageErrors, failedRequests, consoleErrors };
}

async function startCapture(page, includeDrift) {
  await page.evaluate(({ includeDrift, target }) => {
    const marker = document.querySelector(`[data-recovery-id="${target.id}"]`);
    const canvas = map.getCanvas();
    const canvasRect = canvas.getBoundingClientRect();
    const state = {
      running: true, includeDrift,
      rafDeltas: [], movingRafDeltas: [], renderDeltas: [], moveDeltas: [],
      drift: [], longTasks: [],
      lastRaf: 0, lastMovingRaf: 0, lastRender: 0, lastMove: 0,
      start: performance.now(), rafId: 0
    };
    const onRender = () => {
      const t = performance.now();
      if (state.lastRender) state.renderDeltas.push(t - state.lastRender);
      state.lastRender = t;
    };
    const onMove = () => {
      const t = performance.now();
      if (state.lastMove) state.moveDeltas.push(t - state.lastMove);
      state.lastMove = t;
    };
    map.on('render', onRender);
    map.on('move', onMove);
    let observer = null;
    try {
      observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.startTime < state.start) continue;
          state.longTasks.push({
            durationMs: Number(entry.duration.toFixed(2)), startMs: Number((entry.startTime - state.start).toFixed(2))
          });
        }
      });
      observer.observe({ type: 'longtask', buffered: false });
    } catch (e) {}
    const tick = now => {
      if (!state.running) return;
      if (state.lastRaf) state.rafDeltas.push(now - state.lastRaf);
      state.lastRaf = now;
      if (map.isMoving()) {
        if (state.lastMovingRaf) state.movingRafDeltas.push(now - state.lastMovingRaf);
        state.lastMovingRaf = now;
      } else state.lastMovingRaf = 0;
      if (includeDrift && marker && marker.isConnected) {
        const rect = marker.getBoundingClientRect();
        const projected = map.project([target.lon, target.lat]);
        const dx = rect.left + rect.width / 2 - (canvasRect.left + projected.x);
        const dy = rect.bottom - (canvasRect.top + projected.y);
        state.drift.push(Math.hypot(dx, dy));
      }
      state.rafId = requestAnimationFrame(tick);
    };
    state.rafId = requestAnimationFrame(tick);
    window.__panCapture = {
      stop() {
        state.running = false;
        cancelAnimationFrame(state.rafId);
        map.off('render', onRender);
        map.off('move', onMove);
        if (observer) observer.disconnect();
        return {
          durationMs: Number((performance.now() - state.start).toFixed(2)),
          rafDeltas: state.rafDeltas,
          movingRafDeltas: state.movingRafDeltas,
          renderDeltas: state.renderDeltas,
          moveDeltas: state.moveDeltas,
          drift: state.drift,
          longTasks: state.longTasks,
          center: [map.getCenter().lng, map.getCenter().lat],
          zoom: map.getZoom(),
          idle: !map.isMoving()
        };
      }
    };
  }, { includeDrift, target: TARGET });
}

async function finishCapture(page) {
  const raw = await page.evaluate(() => window.__panCapture.stop());
  const driftSamples = raw.drift;
  const drift = driftSamples.slice().sort((a, b) => a - b);
  const q = p => drift.length ? drift[Math.min(drift.length - 1, Math.floor((drift.length - 1) * p))] : null;
  return {
    durationMs: raw.durationMs,
    raf: stats(raw.rafDeltas),
    whileMapMoving: stats(raw.movingRafDeltas),
    mapRender: stats(raw.renderDeltas),
    mapMoveEvents: stats(raw.moveDeltas),
    markerDriftPx: drift.length ? {
      samples: drift.length,
      max: Number(drift[drift.length - 1].toFixed(2)),
      p95: Number(q(0.95).toFixed(2)),
      final: Number(driftSamples[driftSamples.length - 1].toFixed(2))
    } : null,
    longTasksOver50ms: raw.longTasks,
    centerAfter: raw.center,
    zoomAfter: Number(raw.zoom.toFixed(2)),
    idleAfterRelease: raw.idle
  };
}

async function resetCamera(page) {
  await page.evaluate(({ lon, lat }) => map.jumpTo({ center: [lon, lat], zoom: 5.5 }), TARGET);
  await page.waitForFunction(() => !map.isMoving() && map.loaded(), { timeout: 20000 });
  await page.waitForTimeout(250);
}

async function setRootTransition(page, oldTransition) {
  await page.locator('[data-recovery-id="recovery-utah"]').evaluate((el, old) => {
    if (old) el.style.transition = 'transform 0.14s ease';
    else el.style.removeProperty('transition');
  }, oldTransition);
}

async function mouseDrag(page, { dx = -440, steps = 36, pauseMs = 16, oldTransition = false } = {}) {
  await setRootTransition(page, oldTransition);
  const box = await page.locator('#map').boundingBox();
  const x0 = box.x + box.width * 0.72;
  const y = box.y + box.height * 0.64;
  await page.mouse.move(x0, y);
  await page.waitForTimeout(100);
  await startCapture(page, true);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x0 + dx * i / steps, y);
    await page.waitForTimeout(pauseMs);
  }
  await page.mouse.up();
  await page.waitForFunction(() => !map.isMoving(), { timeout: 12000 });
  await page.waitForTimeout(120);
  return finishCapture(page);
}

async function touchDrag(page, { dx = -210, steps = 26, pauseMs = 18, oldTransition = false } = {}) {
  await setRootTransition(page, oldTransition);
  const cdp = await page.context().newCDPSession(page);
  const box = await page.locator('#map').boundingBox();
  const x0 = box.x + box.width * 0.76;
  const y = box.y + box.height * 0.63;
  const point = x => ({ x, y, id: 1, radiusX: 1, radiusY: 1, force: 1 });
  await startCapture(page, true);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(x0)] });
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [point(x0 + dx * i / steps)]
    });
    await page.waitForTimeout(pauseMs);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForFunction(() => !map.isMoving(), { timeout: 12000 });
  await page.waitForTimeout(120);
  const result = await finishCapture(page);
  await cdp.detach();
  return result;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: BROWSER_ARGS });
  const results = {};
  try {
    const desktop = await openMap(browser, { mobile: false });
    results.desktop = {
      environment: desktop.environment,
      oldTransitionControl: await mouseDrag(desktop.page, { dx: -440, steps: 36, pauseMs: 16, oldTransition: true }),
      actualCss: null,
      pageErrors: desktop.pageErrors,
      failedRequests: desktop.failedRequests.slice(0, 12),
      consoleErrors: desktop.consoleErrors.slice(0, 12)
    };
    await resetCamera(desktop.page);
    results.desktop.actualCss = await mouseDrag(desktop.page, { dx: -440, steps: 36, pauseMs: 16, oldTransition: false });
    await desktop.context.close();

    const mobile = await openMap(browser, { mobile: true });
    results.mobileTouch = {
      environment: mobile.environment,
      oldTransitionControl: await touchDrag(mobile.page, { dx: -210, steps: 26, pauseMs: 18, oldTransition: true }),
      actualCss: null,
      pageErrors: mobile.pageErrors,
      failedRequests: mobile.failedRequests.slice(0, 12),
      consoleErrors: mobile.consoleErrors.slice(0, 12)
    };
    await resetCamera(mobile.page);
    results.mobileTouch.actualCss = await touchDrag(mobile.page, { dx: -210, steps: 26, pauseMs: 18, oldTransition: false });
    await mobile.context.close();
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
