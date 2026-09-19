/* ================= ONLINE MAP BACKUP =================
 * This backup preserves the Carto Online Basemap integration code.
 * To restore online map capability, copy these functions back into app.js.
 */

function onlineStyleBackup() {
  return THEME === "navy"
    ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
}

/*
  on("#baseBtn", "click", function () {
    BASEMODE = BASEMODE === "offline" ? "online" : "offline";
    localStorage.setItem("orbita_base", BASEMODE);
    var bb = $("#baseBtn"); if (bb) bb.querySelector("span").textContent = t(BASEMODE === "offline" ? "base_offline" : "base_online");
    if (map) { map.setStyle(mapStyle()); setTimeout(function () { renderMarkers(); buildLabels(); buildCityLabels(); }, 400); }
  });
*/
