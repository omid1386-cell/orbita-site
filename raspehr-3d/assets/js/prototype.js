/* RASPEHR Stage-03: Stage-01 globe + Stage-02 locations + Stage-03 explorer. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const error = $('errorBox');
  const loader = $('loading');
  const intro = $('sceneIntro');
  let engine;
  let markers;
  let stage3;
  let selectedEntity;

  function showEntity(row) {
    selectedEntity = row;
    const categories = window.RaspehrEntityData.CATEGORIES;
    $('entityCard').hidden = false;
    $('entityLabel').textContent = row.fa;
    $('entityEn').textContent = row.en !== row.fa ? row.en : '';
    $('entityCat').textContent = 'دسته‌ها: ' + row.categories.map(key => categories[key].fa).join('، ');
    $('entityLocation').textContent = [row.cityFa || row.city, row.countryFa || row.country].filter(Boolean).join('، ') || 'مکان اداری ثبت نشده';
    $('entityCoord').textContent = row.lat.toFixed(row.precision && row.precision.startsWith('approximate') ? 2 : 6) + '°, ' + row.lon.toFixed(row.precision && row.precision.startsWith('approximate') ? 2 : 6) + '°' + (row.precision && row.precision.startsWith('approximate') ? ' (نماینده محدوده)' : '');
    const accuracy = row.precision || 'دقت مختصات در رکورد مشخص نشده';
    $('entityPrecision').textContent = 'دقت/یادداشت مختصات: ' + (row.coordinateNote || accuracy);
    $('entityId').textContent = row.key;
    intro.classList.add('is-faded');
    if (window.RaspehrStage4) window.RaspehrStage4.select(row);
  }

  function addLegend(catalog) {
    const legend = $('entityLegend');
    legend.replaceChildren();
    const defs = window.RaspehrEntityData.CATEGORIES;
    Object.keys(defs).forEach(cat => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      const dot = document.createElement('span');
      dot.className = 'legend-dot';
      dot.style.setProperty('--dot', '#' + defs[cat].color.toString(16).padStart(6,'0'));
      const label = document.createElement('span');
      label.textContent = defs[cat].fa + ' (' + (catalog.roles[cat]||0).toLocaleString('fa-IR') + ')';
      item.append(dot,label);
      legend.appendChild(item);
    });
  }

  function loadEntityMarkers() {
    $('markerToggle').disabled = true;
    window.RaspehrEntityData.load().then(catalog => {
      if (engine.stopped) return;
      markers = new window.RaspehrEntityMarkers.EntityMarkers(engine,catalog,row => {
        if(row.isCluster){if(stage3)stage3.showCluster(row);}
        else{if(stage3)stage3.hideCluster();showEntity(row);}
      });
      stage3 = new window.RaspehrStage3.Controller(engine,markers,catalog,showEntity);
      if (window.RaspehrStage4) window.RaspehrStage4.setCatalog(catalog);
      if (window.RaspehrStage5Child) window.RaspehrStage5Child.mount(engine,stage3,catalog);
      markers.setVisible($('markerToggle').checked);
      $('markerToggle').disabled = false;
      $('markerStatus').textContent = catalog.counts.markers.toLocaleString('fa-IR') + ' مکان دارای مختصات، از مجموع ' + catalog.counts.total.toLocaleString('fa-IR') + ' شناسنامه. ' + catalog.counts.missing.toLocaleString('fa-IR') + ' رکورد بدون مختصات معتبر نمایش داده نمی‌شود. برای ۲۳ مورد، نقطه مرجع تقریبی استفاده شده است؛ محل دقیق آن‌ها تأیید نشده.';
      // Stage 03 owns the interactive category controls and counts.
    }).catch(err => {
      console.error('[RASPEHR Stage 02] Entity data:',err);
      $('markerStatus').textContent = 'بارگذاری مکان‌های رسپهر موفق نبود: ' + err.message;
    });
  }


  function reportFailure(err) {
    console.error('[RASPEHR / 3D]', err);
    loader.classList.add('is-hidden');
    $('errorMessage').textContent = 'نمای سه‌بعدی اجرا نشد: ' + (err && err.message ? err.message : 'خطای ناشناخته') + ' — دسترسی به WebGL و فایل‌های اصلی رسپهر را بررسی کنید.';
    if(window.RaspehrStage5Child)window.RaspehrStage5Child.fail(err);
    error.hidden = false;
    $('retryBtn').hidden = false;
    $('engineStatus').textContent = 'خطا در آماده‌سازی';
  }

  function statusChanged(status) {
    if (!status) return;
    if (status.type === 'loading') {
      $('engineStatus').textContent = status.message || 'در حال بارگذاری...';
      if (!loader.classList.contains('is-hidden')) $('loadingDetail').textContent = status.message || 'در حال آماده‌سازی';
      else $('qualityStatus').textContent = status.message || 'در حال آماده‌سازی';
    } else if (status.type === 'ready') {
      loader.classList.add('is-hidden');
      const detail = status.surfaceMode === 'multilevel'
        ? ('چندسطحی · ' + (status.imageryLevel || 'z0'))
        : (status.surfaceMode === 'single-fallback' ? 'پشتیبان تک‌تکه' : 'آماده');
      $('engineStatus').textContent = 'Three.js محلی · ' + detail + ' · ' + (status.quality === 'high' ? '۸K' : status.quality === 'low' ? '۲K' : '۴K');
      $('qualityStatus').textContent = status.errors && status.errors.length
        ? 'برخی بافت‌ها با مسیر پشتیبان یا سطح دیگر بارگذاری شدند'
        : ('هرم تصویری فعال است' + (status.pyramid ? ' — ' + status.pyramid : ''));
    } else if (status.type === 'terrain-ready' || status.type === 'terrain-loading' || status.type === 'terrain-warning' || status.type === 'terrain-off') {
      $('terrainStatus').textContent = status.message || '';
      $('terrainRetry').hidden = status.type !== 'terrain-warning';
      if (status.type === 'terrain-warning') console.warn('[RASPEHR / Terrain]', status.message);
    } else if (status.type === 'context-lost') {
      $('engineStatus').textContent = 'ارتباط گرافیکی قطع شد';
      $('qualityStatus').textContent = status.message;
    } else if (status.type === 'context-restored') {
      $('engineStatus').textContent = 'در حال بازیابی گرافیک';
      $('qualityStatus').textContent = status.message;
    } else if (status.type === 'performance') {
      $('performanceStatus').textContent = status.message;
      if ($('quality').value !== engine.options.quality) $('quality').value = engine.options.quality;
    } else if (status.type === 'warning') {
      $('qualityStatus').textContent = status.message || 'هشدار در بارگذاری';
      if (engine && $('quality').value !== engine.options.quality) $('quality').value = engine.options.quality;
      console.warn('[RASPEHR / 3D]', status.message);
    }
  }

  try {
    if (!window.THREE) throw new Error('کتابخانه Three.js در مسیر assets/vendor/three.min.js موجود نیست.');
    engine = new window.RaspehrGlobe.GlobeEngine($('globeMount'), metrics => {
      $('fps').textContent = metrics.fps.toLocaleString('fa-IR') + ' FPS';
      $('altitude').textContent = metrics.altitudeKm.toLocaleString('fa-IR') + ' km';
      $('sunPoint').textContent = metrics.sunLat.toFixed(1) + '° / ' + metrics.sunLon.toFixed(1) + '°';
    }, statusChanged);

    $('quality').value = engine.options.quality;
    const policy = engine.perfPolicy;
    $('performanceStatus').textContent = 'حالت خودکار: '+(policy.mode==='economy'?'کم‌مصرف':policy.mode==='balanced'?'متعادل':'جزئیات بالا')+' · '+policy.fps+' فریم هدف';
    $('performanceMode').addEventListener('change', event => {
      engine.setPerformanceMode(event.target.value);
      $('quality').value = engine.options.quality;
    });
    $('markerToggle').addEventListener('change', event => {
      if (markers) markers.setVisible(event.target.checked);
    });
    $('markerFocusBtn').addEventListener('click', () => {
      if (markers && selectedEntity) markers.select(selectedEntity,true);
    });
    loadEntityMarkers();

    const nameFor = Object.fromEntries(Object.entries(window.RaspehrGlobe.PRESETS).map(([key, value]) => [key, value.name]));
    document.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      engine.preset(preset);
      $('viewName').textContent = nameFor[preset] || 'جهانی';
      document.querySelectorAll('[data-preset]').forEach(other => other.classList.toggle('is-active', other === btn));
      intro.classList.add('is-faded');
    }));

    for (const option of ['lighting', 'clouds', 'rotation', 'stars', 'grid', 'relief', 'terrain']) {
      $(option).addEventListener('change', event => engine.setOption(option, event.target.checked));
    }
    $('terrainExaggeration').addEventListener('change', event => engine.setOption('terrainExaggeration', Number(event.target.value)));
    $('terrainRetry').addEventListener('click', () => {
      if (!$('terrain').checked) { $('terrain').checked = true; engine.setOption('terrain', true); }
      else engine.enableTerrain();
    });
    $('quality').addEventListener('change', event => {
      engine.setOption('quality', event.target.value);
      $('qualityStatus').textContent = 'در حال آماده‌سازی کیفیت و هرم تصویری جدید...';
    });
    $('zoomIn').addEventListener('click', () => engine.zoomBy(0.77));
    $('zoomOut').addEventListener('click', () => engine.zoomBy(1.30));
    $('resetBtn').addEventListener('click', () => {
      document.querySelector('[data-preset="world"]').click();
      const defaults = {lighting:true, clouds:true, rotation:false, stars:true, grid:false, relief:true, terrain:true};
      $('terrainExaggeration').value = '1';
      engine.setOption('terrainExaggeration', 1);
      Object.entries(defaults).forEach(([key, value]) => {
        $(key).checked = value;
        engine.setOption(key, value);
      });
      intro.classList.remove('is-faded');
    });
    $('retryBtn').addEventListener('click', () => globalThis.location.reload());

    window.addEventListener('keydown', event => {
      const tag = (event.target && event.target.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select', 'button', 'a'].includes(tag)) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const step = 0.10;
        engine.turn(event.key === 'ArrowRight' ? -step : event.key === 'ArrowLeft' ? step : 0,
          event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0);
      } else if (event.key === '+' || event.key === '=') { event.preventDefault(); engine.zoomBy(0.86); }
      else if (event.key === '-') { event.preventDefault(); engine.zoomBy(1.16); }
      else if (event.key === 'Home') { event.preventDefault(); $('resetBtn').click(); }
    });
    $('globeMount').addEventListener('pointerdown', () => {
      intro.classList.add('is-faded');
      document.querySelectorAll('[data-preset]').forEach(button => button.classList.remove('is-active'));
    });

    engine.ready.then(result => {
      $('quality').disabled = false;
      loader.classList.add('is-hidden');
      if (result.errors && result.errors.length) console.warn('[RASPEHR / 3D] optional texture warnings:', result.errors);
    }).catch(reportFailure);
    window.addEventListener('pagehide', () => { if(stage3)stage3.dispose(); if(markers)markers.dispose(); if(engine)engine.dispose(); }, {once:true});
  } catch (err) { reportFailure(err); }
})();
