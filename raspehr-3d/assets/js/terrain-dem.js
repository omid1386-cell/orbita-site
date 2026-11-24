/* RASPEHR three-dimensional Earth — R6 terrain reliability and diagnostics.
 * DEM source: Mapzen/Terrain Tiles Terrarium PNG (AWS Open Data).
 * Attribution: https://registry.opendata.aws/terrain-tiles/
 * Raster DEM is a global/coarse preview, NOT local-resolution terrain.
 */
(function (root) {
  'use strict';
  const EARTH_RADIUS_METERS = 6371000;
  const DEFAULT_SOURCE_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/';
  const MERCATOR_MAX_LAT = 85.05112878;
  const TILE_SIZE = 256;
  const ZOOM = 2;
  const DEFAULT_TIMEOUT_MS = 15000;

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function mercatorPoint(lat, lon, zoom) {
    const n = 2 ** zoom;
    const phi = clamp(lat, -MERCATOR_MAX_LAT, MERCATOR_MAX_LAT) * Math.PI / 180;
    const x = (((lon + 180) / 360 * n) % n + n) % n;
    const y = clamp((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2 * n, 0, n - 1e-9);
    return {x, y, tx:Math.floor(x), ty:Math.floor(y)};
  }
  function terrariumMeters(r, g, b) { return r * 256 + g + b / 256 - 32768; }
  function readPixel(data, x, y) {
    const xx = clamp(x, 0, TILE_SIZE - 1);
    const yy = clamp(y, 0, TILE_SIZE - 1);
    const i = 4 * (yy * TILE_SIZE + xx);
    return terrariumMeters(data[i], data[i + 1], data[i + 2]);
  }

  class TerrariumElevation {
    constructor(zoom = ZOOM, options = {}) {
      if (!Number.isInteger(zoom) || zoom < 0 || zoom > 15) throw new Error('Invalid DEM zoom level');
      this.zoom = zoom;
      this.dimension = 2 ** zoom;
      this.tiles = new Map();
      const localOverride = root.RASPEHR_TERRAIN_URL;
      const base = options.baseUrl || (typeof localOverride === 'string' && localOverride) || DEFAULT_SOURCE_URL;
      this.baseUrl = base.endsWith('/') ? base : base + '/';
      this.timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    }
    key(x, y) { return `${x}/${y}`; }
    url(x, y) { return `${this.baseUrl}${this.zoom}/${x}/${y}.png`; }

    async fetchTile(x, y, signal) {
      const controller = new AbortController();
      const relayAbort = () => controller.abort();
      if (signal) {
        if (signal.aborted) controller.abort();
        else signal.addEventListener('abort', relayAbort, {once:true});
      }
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await fetch(this.url(x, y), {
          mode:'cors', credentials:'omit', signal:controller.signal, cache:'force-cache'
        });
        if (!response.ok) throw new Error(`DEM ${x}/${y}: HTTP ${response.status}`);
        const blob = await response.blob();
        let bitmap = null, element = null;
        if (typeof createImageBitmap === 'function') {
          bitmap = await createImageBitmap(blob);
          element = bitmap;
        } else {
          const objectUrl = URL.createObjectURL(blob);
          try {
            element = await new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error('DEM image decoding failed'));
              img.src = objectUrl;
            });
          } finally { URL.revokeObjectURL(objectUrl); }
        }
        try {
          if (element.width !== TILE_SIZE || element.height !== TILE_SIZE) throw new Error('DEM tile dimensions are not 256×256');
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = TILE_SIZE;
          const context = canvas.getContext('2d', {willReadFrequently:true});
          if (!context) throw new Error('2D canvas unavailable for DEM decoding');
          context.drawImage(element, 0, 0);
          return context.getImageData(0, 0, TILE_SIZE, TILE_SIZE).data;
        } finally { if (bitmap && bitmap.close) bitmap.close(); }
      } catch (error) {
        if (controller.signal.aborted && !(signal && signal.aborted)) {
          throw new Error(`DEM tile ${x}/${y} exceeded ${this.timeoutMs} ms timeout`);
        }
        throw error;
      } finally {
        clearTimeout(timer);
        if (signal) signal.removeEventListener('abort', relayAbort);
      }
    }

    async load(options = {}) {
      const {signal, onProgress, concurrency = 4} = options;
      const queue = [];
      for (let y = 0; y < this.dimension; y++) {
        for (let x = 0; x < this.dimension; x++) queue.push({x, y});
      }
      const controller = new AbortController();
      const abort = () => controller.abort();
      if (signal) {
        if (signal.aborted) controller.abort();
        else signal.addEventListener('abort', abort, {once:true});
      }
      const nextTiles = new Map();
      let next = 0, completed = 0;
      const worker = async () => {
        while (next < queue.length && !controller.signal.aborted) {
          const {x, y} = queue[next++];
          try {
            const data = await this.fetchTile(x, y, controller.signal);
            if (controller.signal.aborted) break;
            nextTiles.set(this.key(x,y), data);
            completed++;
            if (onProgress) onProgress(completed, queue.length);
          } catch (err) {
            controller.abort();
            throw err;
          }
        }
      };
      try {
        const count = Math.min(Math.max(Math.floor(concurrency) || 1, 1), queue.length);
        const results = await Promise.allSettled(Array.from({length:count}, worker));
        const failure = results.find(result => result.status === 'rejected');
        if (failure) throw failure.reason;
        if (controller.signal.aborted || (signal && signal.aborted)) throw new Error('DEM request canceled');
        if (nextTiles.size !== queue.length) throw new Error('DEM incomplete: expected ' + queue.length + ' tiles');
        this.tiles = nextTiles;
        return this;
      } catch (error) {
        this.tiles.clear();
        nextTiles.clear();
        throw error;
      } finally {
        if (signal) signal.removeEventListener('abort', abort);
      }
    }

    pixelAtGlobal(x, y) {
      const maxPixel = this.dimension * TILE_SIZE;
      const px = ((x % maxPixel) + maxPixel) % maxPixel;
      const py = clamp(y, 0, maxPixel - 1);
      const tx = Math.floor(px / TILE_SIZE), ty = Math.floor(py / TILE_SIZE);
      const tile = this.tiles.get(this.key(tx, ty));
      if (!tile) return null;
      return readPixel(tile, px % TILE_SIZE, py % TILE_SIZE);
    }

    meters(lat, lon) {
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return 0;
      if (Math.abs(lat) >= MERCATOR_MAX_LAT) return 0; // no polar coverage beyond Web Mercator
      const {x, y} = mercatorPoint(lat,lon,this.zoom);
      // Center-aligned global raster samples; neighbors cross tile boundaries smoothly.
      const fx = x * TILE_SIZE - 0.5, fy = y * TILE_SIZE - 0.5;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const dx = fx - x0, dy = fy - y0;
      const a = this.pixelAtGlobal(x0, y0), b = this.pixelAtGlobal(x0+1, y0);
      const c = this.pixelAtGlobal(x0, y0+1), d = this.pixelAtGlobal(x0+1, y0+1);
      if (a === null || b === null || c === null || d === null) return 0;
      return a * (1-dx) * (1-dy) + b * dx * (1-dy) + c * (1-dx) * dy + d * dx * dy;
    }
    clear() { this.tiles.clear(); }
  }

  function applyHeightToGeometry(geometry, elevation, radius, exaggeration = 1) {
    const attr = geometry.attributes.position;
    if (!geometry.userData) geometry.userData = {};
    const meta = geometry.userData;
    if (!meta.raspehrOriginalPositions) meta.raspehrOriginalPositions = Float32Array.from(attr.array);
    const baseline = meta.raspehrOriginalPositions;
    let displaced = 0, peak = 0;
    for (let i = 0; i < attr.count; i++) {
      const j = i * 3;
      const x=baseline[j], y=baseline[j+1], z=baseline[j+2];
      const len = Math.hypot(x,y,z);
      if (len < 1e-10) continue;
      const lat = Math.asin(clamp(y/len,-1,1)) * 180 / Math.PI;
      const lon = Math.atan2(-z,x) * 180 / Math.PI;
      const meters = elevation ? Math.max(0, elevation.meters(lat,lon)) : 0;
      const delta = (meters / EARTH_RADIUS_METERS) * radius * exaggeration;
      const finalRadius = len + delta;
      attr.array[j] = x/len * finalRadius;
      attr.array[j+1] = y/len * finalRadius;
      attr.array[j+2] = z/len * finalRadius;
      if (delta > 0) displaced++;
      peak = Math.max(peak, meters);
    }
    attr.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    if (geometry.boundingBox) geometry.computeBoundingBox();
    return {vertices:attr.count, displaced, maxElevationMeters:peak};
  }
  root.RaspehrTerrainDEM = {
    TerrariumElevation, mercatorPoint, terrariumMeters, applyHeightToGeometry,
    ZOOM, TILE_SIZE, EARTH_RADIUS_METERS, SOURCE_URL:DEFAULT_SOURCE_URL, MERCATOR_MAX_LAT
  };
})(window);
