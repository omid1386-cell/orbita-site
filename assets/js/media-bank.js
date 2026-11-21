/* ORBITA media bank v1 — read-only, lazy loader for future Stage 3 gallery.
   This module does not change existing profile renderers or fetch on startup. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ORBITA_MEDIA_BANK = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var ALLOWED_RIGHTS = ['public_domain', 'permission_granted', 'attribution_required', 'link_only'];
  var KNOWN_CATS = [
    'agency', 'launch', 'propulsion', 'satmaker', 'components', 'ground_station',
    'university_space', 'inspace_services', 'test_facility', 'mission_control',
    'ground_services', 'payloads'
  ];
  var memo = null;
  var inFlight = null;

  function keyFor(cat, id) {
    if (typeof id !== 'string' || !id || /[\/:]/.test(id)) return null;
    if (cat === 'site' || cat === 'launch_site') return 'launch_site:launch_site:' + id;
    if (cat === 'recovery' || cat === 'recovery_site') return 'recovery_site:recovery_site:' + id;
    if (KNOWN_CATS.indexOf(cat) !== -1) return 'company_or_organization:' + cat + ':' + id;
    return null;
  }

  function isAllowed(asset) {
    if (!asset || !asset.verification || !asset.rights || !asset.source) return false;
    if (asset.verification.status !== 'verified' ||
        asset.verification.identity_match !== 'confirmed' ||
        asset.verification.source_verified !== true) return false;
    if (ALLOWED_RIGHTS.indexOf(asset.rights.usage) < 0) return false;
    if (asset.kind === 'image' && asset.rights.usage === 'link_only') return false;
    if (asset.rights.usage === 'attribution_required' && (!asset.rights.credit || !asset.rights.license)) return false;
    if (asset.rights.usage === 'public_domain' && !asset.rights.proof_url && !asset.rights.license) return false;
    if (asset.rights.usage === 'permission_granted' && !asset.rights.proof_url) return false;
    if (!asset.rights.checked_on || !asset.verification.reviewed_on ||
        !asset.verification.reviewer || !asset.verification.reviewer.trim()) return false;
    if (typeof asset.source.url !== 'string' || !/^https:\/\//.test(asset.source.url)) return false;
    if (asset.file_path && !/^assets\/media\/(?!.*(?:^|\/)\.\.?\/)/.test(asset.file_path)) return false;
    if (asset.external_url && !/^https:\/\//.test(asset.external_url)) return false;
    if (!asset.file_path && !asset.external_url) return false;
    return true;
  }

  function byKey(catalog, entityKey) {
    if (!catalog || catalog.schema_version !== '1.0.0' || !Array.isArray(catalog.entities)) return null;
    for (var i = 0; i < catalog.entities.length; i++) {
      if (catalog.entities[i].entity_key === entityKey) return catalog.entities[i];
    }
    return null;
  }

  function published(catalog, entityKey) {
    var entity = byKey(catalog, entityKey);
    return entity && Array.isArray(entity.media) ? entity.media.filter(isAllowed) : [];
  }

  function clearCache() { memo = null; inFlight = null; }

  function load(url, fetcher) {
    if (memo) return Promise.resolve(memo);
    if (inFlight) return inFlight;
    var resource = url || 'data/media/catalog.v1.json';
    var runFetch = fetcher || (typeof fetch === 'function' ? fetch : null);
    if (!runFetch) return Promise.reject(new Error('No fetch function available'));
    inFlight = Promise.resolve().then(function () { return runFetch(resource); }).then(function (res) {
      if (!res || !res.ok) throw new Error('Media catalog fetch failed');
      return res.json();
    }).then(function (data) {
      if (!data || data.schema_version !== '1.0.0' || !Array.isArray(data.entities))
        throw new Error('Media catalog structure invalid');
      memo = data;
      return data;
    }).catch(function (err) {
      inFlight = null; // allow retry after transient failure
      throw err;
    });
    return inFlight;
  }

  return Object.freeze({keyFor:keyFor, byKey:byKey, published:published,
                        load:load, clearCache:clearCache});
}));
