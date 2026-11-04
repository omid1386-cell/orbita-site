const { chromium } = require('playwright');

const ORIGIN = 'http://127.0.0.1:5173';
const browserArgs = ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

(async () => {
  const browser = await chromium.launch({ headless: true, args: browserArgs });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, ignoreHTTPSErrors: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/basemaps\.cartocdn\.com/, route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ version: 8, name: 'Pan diagnostic', sources: {}, layers: [
        { id: 'diag-background', type: 'background', paint: { 'background-color': '#102030' } }
      ] })
    }));
    await page.route(/ll\.thespacedevs\.com/, route => route.abort());
    await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.map && typeof window.map.loaded === 'function' && window.map.loaded() && window.DATA && DATA.sites.length === 64, { timeout: 30000 });
    await page.locator('.recovery-chip').click();
    await page.waitForFunction(() => DATA.recoveries.length === 20, { timeout: 15000 });
    const target = await page.evaluate(() => DATA.recoveries.find(site => site.id === 'recovery-utah'));
    await page.evaluate(({ lon, lat }) => map.jumpTo({ center: [lon, lat], zoom: 6 }), { lon: target.lon, lat: target.lat });
    const marker = page.locator('[data-recovery-id="recovery-utah"]');
    await marker.waitFor({ timeout: 10000 });
    await page.waitForTimeout(200);

    async function samplePan(withTransition) {
      // Recreate the old rule inline for the control run, since the stylesheet now scopes
      // hover animation to the inner SVG. The treatment run disables it on the root.
      if (withTransition) await marker.evaluate(element => { element.style.transition = 'transform 0.14s ease'; });
      else await marker.evaluate(element => { element.style.transition = 'none'; });
      await page.evaluate(({ lon, lat }) => map.jumpTo({ center: [lon, lat], zoom: 6 }), { lon: target.lon, lat: target.lat });
      await page.waitForTimeout(220);
      return page.evaluate(async ({ lon, lat, withTransition }) => {
        const element = document.querySelector('[data-recovery-id="recovery-utah"]');
        const canvasRect = map.getCanvas().getBoundingClientRect();
        const intervals = [], errors = [];
        let lastRender = 0;
        const onRender = () => {
          const now = performance.now();
          if (lastRender) intervals.push(now - lastRender);
          lastRender = now;
        };
        map.on('render', onRender);
        const start = performance.now();
        map.easeTo({ center: [lon + 10, lat], zoom: 6, duration: 1600, essential: true });
        const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
        while (performance.now() - start < 1750) {
          await nextFrame();
          const rect = element.getBoundingClientRect();
          const projected = map.project([lon, lat]);
          const dx = rect.left + rect.width / 2 - (canvasRect.left + projected.x);
          const dy = rect.bottom - (canvasRect.top + projected.y);
          errors.push(Math.hypot(dx, dy));
        }
        map.off('render', onRender);
        const sorted = errors.slice().sort((a, b) => a - b);
        const transition = getComputedStyle(element).transition;
        await new Promise(resolve => setTimeout(resolve, 220));
        const finalRect = element.getBoundingClientRect();
        const finalPoint = map.project([lon, lat]);
        return {
          withTransition,
          transition,
          frames: errors.length,
          maxDriftPx: Number(Math.max(...errors).toFixed(2)),
          p95DriftPx: Number(sorted[Math.floor(sorted.length * 0.95)].toFixed(2)),
          maxRenderIntervalMs: Number(Math.max(...intervals).toFixed(2)),
          finalDriftPx: Number(Math.hypot(
            finalRect.left + finalRect.width / 2 - (canvasRect.left + finalPoint.x),
            finalRect.bottom - (canvasRect.top + finalPoint.y)
          ).toFixed(2))
        };
      }, { lon: target.lon, lat: target.lat, withTransition });
    }

    const withTransition = await samplePan(true);
    const withoutTransition = await samplePan(false);
    console.log(JSON.stringify({ target: { id: target.id, lon: target.lon, lat: target.lat }, withTransition, withoutTransition, errors }, null, 2));
    await context.close();
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
