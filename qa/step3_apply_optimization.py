from pathlib import Path
file=Path(__file__).resolve().parents[1]/'assets/js/app.js'
s=file.read_text(encoding='utf-8')
def one(old,new,label):
 global s
 n=s.count(old)
 if n != 1: raise RuntimeError(f'{label} expected once, found {n}')
 s=s.replace(old,new,1)

one('  window.switchCompTab = function(tabId, el) {',
'''  // Step 3 (V19): materialize the selected country tab only when opened.
  // The existing dossier markup, style, data and tab order remain unchanged.
  var countryProfileDeferredTabs = Object.create(null);
  function materializeCountryProfileTab(tabId, panel) {
    var pending = countryProfileDeferredTabs[tabId];
    if (!panel || !pending) return;
    var holder = panel.querySelector('.country-profile-card-list');
    if (holder) holder.innerHTML = pending.items.map(function(item) {
      return pending.render(item, pending.def);
    }).join('');
    delete countryProfileDeferredTabs[tabId];
  }

  window.switchCompTab = function(tabId, el) {''','inject lazy rendering setup')
one('''    if (target) {
      target.classList.add("active");
      target.style.display = "block";
    }
  };''',
'''    if (target) {
      if (target.classList.contains('country-profile-panel')) materializeCountryProfileTab(tabId, target);
      target.classList.add("active");
      target.style.display = "block";
    }
  };''', 'hook tab switch')

one('''  window.openDetailById = function(id, kind) {
    if (!id || typeof DATA === "undefined") return;
    if (kind === "site") {
      var s = (DATA.sites || []).find(function(x) { return x.id === id; });
      if (s) openDetail({ kind: "site", cat: "site", o: s });
    } else if (kind === "recovery") {
      var rs = (DATA.recoveries || []).find(function(x) { return x.id === id; });
      if (rs) openDetail({ kind: "recovery", cat: "recovery", o: rs });
    } else {
      var c = (DATA.companies || []).find(function(x) { return x.id === id; });
      if (c) {
        var displayCategory = companyCategoryForDisplay(c, kind);
        openDetail({ kind: displayCategory, cat: displayCategory, o: c });
      }
    }
  };''',
'''  window.openDetailById = function(id, kind) {
    if (!id || typeof DATA === "undefined") return;
    var row = kind === 'site' ? (DATA.sites || []).find(function(x) { return x.id === id; }) :
      (kind === 'recovery' ? (DATA.recoveries || []).find(function(x) { return x.id === id; }) :
      (DATA.companies || []).find(function(x) { return x.id === id; }));
    if (row) {
      if (kind === 'site' || kind === 'recovery') openDetail({ kind:kind, cat:kind, o:row });
      else {
        var displayCategory = companyCategoryForDisplay(row, kind);
        openDetail({ kind:displayCategory, cat:displayCategory, o:row });
      }
      return;
    }
    // Country fast-index cards intentionally do not preload large full dossiers.
    // Fetch just this record's category when its "Open profile" button is used.
    var requestToken = openDetail._renderToken;
    ensureMapCategoryLoaded(kind).then(function(ok) {
      if (!ok || requestToken !== openDetail._renderToken) return;
      var records = kind === 'site' ? DATA.sites : kind === 'recovery' ? DATA.recoveries : DATA.companies;
      var full = (records || []).find(function(x) { return x.id === id; });
      if (full) {
        var cat = kind === 'site' || kind === 'recovery' ? kind : companyCategoryForDisplay(full,kind);
        openDetail({kind:cat,cat:cat,o:full});
      }
    }).catch(function(err){ console.warn('[RASPEHR country] dossier fetch:',err); });
  };''', 'on demand full details')

one('''  function renderCountryProfile(p) {
    var isFa =''',
'''  function renderCountryProfile(p) {
    countryProfileDeferredTabs = Object.create(null);
    var isFa =''', 'reset lazy map')
one('''    var allCompanies = (typeof DATA !== "undefined") ? canonicalCompanyRecords() : [];
    var allSites = (typeof DATA !== "undefined" && Array.isArray(DATA.sites)) ? DATA.sites : [];
    var allRecoveries = (typeof DATA !== "undefined" && Array.isArray(DATA.recoveries)) ? DATA.recoveries : [];''',
'''    // First-click source is a compact, local projection of the original dossiers.
    // If unavailable, fall back to the original data and original loading path.
    var fast = (typeof countryProfileFastData !== 'undefined') && countryProfileFastData;
    var allCompanies = fast ? fast.companies : ((typeof DATA !== "undefined") ? canonicalCompanyRecords() : []);
    var allSites = fast ? fast.sites : ((typeof DATA !== "undefined" && Array.isArray(DATA.sites)) ? DATA.sites : []);
    var allRecoveries = fast ? fast.recoveries : ((typeof DATA !== "undefined" && Array.isArray(DATA.recoveries)) ? DATA.recoveries : []);''', 'fast data selector')
one('''      if (items.length) {
        h += '<div class="country-profile-card-list">';
        items.forEach(function (item) { h += renderEntityCard(item, def); });
        h += '</div>';
      } else {''',
'''      if (items.length) {
        h += '<div class="country-profile-card-list">';
        if (index === 0) {
          items.forEach(function (item) { h += renderEntityCard(item, def); });
        } else {
          countryProfileDeferredTabs[tabId] = {items:items,def:def,render:renderEntityCard};
        }
        h += '</div>';
      } else {''', 'defer inactive cards')

# Unlike the 6MB full category JSONs, the tiny fast-index only includes fields
# used in the existing country card summaries. Kept in the same local repository.
start='''  function ensureCountryProfileData() {
    return Promise.all([
      BOOT_LOADERS.sites(),
      BOOT_LOADERS.recoveries()
    ].concat(COMPANY_CATEGORY_KEYS.map(loadCompanyCategory)));
  }
'''
replacement='''  var countryProfileFastData = null;
  var countryProfileFastPromise = null;
  function loadCountryProfileFastData() {
    if (countryProfileFastData) return Promise.resolve(true);
    if (countryProfileFastPromise) return countryProfileFastPromise;
    countryProfileFastPromise = fetch('data/country_profile_fast_v1.json?v=20261127-v19')
      .then(function(r) { if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(data) {
        if (!data || data.schema_version !== 1 ||
            !Array.isArray(data.companies) || !Array.isArray(data.sites) || !Array.isArray(data.recoveries) ||
            data.companies.length < 300 || data.sites.length < 70 || data.recoveries.length < 15) {
          throw new Error('Invalid country fast-index');
        }
        countryProfileFastData = data;
        return true;
      })
      .catch(function(error) {
        console.warn('[RASPEHR country] fast-index unavailable; using original data:',error);
        return false;
      })
      .finally(function() { countryProfileFastPromise = null; });
    return countryProfileFastPromise;
  }
  function ensureCountryProfileData() {
    return Promise.all([
      BOOT_LOADERS.sites(),
      BOOT_LOADERS.recoveries()
    ].concat(COMPANY_CATEGORY_KEYS.map(loadCompanyCategory)));
  }
'''
one(start,replacement,'fast loader')

old='''      var countryDataReady = LAYER_STATE.sites === "ready" && LAYER_STATE.recoveries === "ready" &&
        COMPANY_CATEGORY_KEYS.every(function (key) { return COMPANY_CATEGORY_STATE[key] === "ready"; });
      if (!countryDataReady) {
        var loadingNote = document.createElement("div");
        loadingNote.className = "up-empty";
        loadingNote.textContent = t("up_loading");
        countryBody.appendChild(loadingNote);
      }
      ensureCountryProfileData().then(function (results) {
        if (detailToken !== openDetail._renderToken || !countryPanel.classList.contains("open")) return;
        var selectedTab = activeDetailTabId(countryBody) || priorCountryTab;
        countryBody.innerHTML = applyCountrySpecificDisplay(renderCountryProfile(p), p);
        restoreDetailTab(countryBody, selectedTab);
        bindCountryItemClicks();
        if (!results.every(Boolean)) {
          var note = document.createElement("div");
          note.className = "up-empty";
          note.textContent = t("up_loading");
          countryBody.appendChild(note);
        }
      });'''
new='''      var countryDataReady = !!countryProfileFastData;
      if (!countryDataReady) {
        var loadingNote = document.createElement("div");
        loadingNote.className = "up-empty";
        loadingNote.textContent = t("up_loading");
        countryBody.appendChild(loadingNote);
      }
      loadCountryProfileFastData().then(function (ready) {
        if (detailToken !== openDetail._renderToken || !countryPanel.classList.contains("open")) return;
        if (!ready) {
          // Safe backward-compatible fallback if the compact file is missing.
          return ensureCountryProfileData().then(function (results) {
            if (detailToken !== openDetail._renderToken || !countryPanel.classList.contains("open")) return;
            var activeTab = activeDetailTabId(countryBody) || priorCountryTab;
            countryBody.innerHTML = applyCountrySpecificDisplay(renderCountryProfile(p), p);
            restoreDetailTab(countryBody, activeTab);
            if (!results.every(Boolean)) {
              var note = document.createElement('div'); note.className = 'up-empty';
              note.textContent = t('up_loading'); countryBody.appendChild(note);
            }
          });
        }
        var selectedTab = activeDetailTabId(countryBody) || priorCountryTab;
        countryBody.innerHTML = applyCountrySpecificDisplay(renderCountryProfile(p), p);
        restoreDetailTab(countryBody, selectedTab);
        bindCountryItemClicks();
      });'''
one(old,new,'country opening pipeline')
# Populate fast-index during first country hover, without blocking map interaction.
one('''    if (name) setCountryFeatureState(name, "hover", true);
  }
  function setSelectedCountry(name) {''',
'''    if (name) {
      setCountryFeatureState(name, "hover", true);
      // A single asynchronous lightweight request is shared by all hover/clicks.
      loadCountryProfileFastData();
    }
  }
  function setSelectedCountry(name) {''', 'prefetch on hover')

file.write_text(s,encoding='utf-8')
print('updated',file,len(s),'bytes')
