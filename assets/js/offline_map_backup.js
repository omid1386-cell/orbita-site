/* ================= OFFLINE MAP BACKUP =================
 * This backup preserves the offline vector map code (countries.json GeoJSON & custom styles).
 * To restore offline vector map capability, copy offlineStyle() back into app.js.
 */

function offlineStyleBackup() {
  var dark = THEME === "navy";
  return {
    version: 8,
    sources: {
      countries: { type: "geojson", data: "assets/geo/countries.json?_t=" + Date.now() }
    },
    layers: [
      { id: "ocean", type: "background", paint: { "background-color": dark ? "#08131f" : "#dbe7f3" } },
      { id: "country-fill", type: "fill", source: "countries", paint: { "fill-color": dark ? "#16283d" : "#f7fafc", "fill-opacity": 1 } },
      { id: "country-hover", type: "fill", source: "countries", filter: ["==", ["get", "NAME"], ""], paint: { "fill-color": dark ? "#1f3c5b" : "#e4eefb" } },
      { id: "country-select", type: "fill", source: "countries", filter: ["==", ["get", "NAME"], ""], paint: { "fill-color": dark ? "#254d75" : "#cbe2f8", "fill-opacity": 0.85 } },
      { id: "country-select-outline", type: "line", source: "countries", filter: ["==", ["get", "NAME"], ""], paint: { "line-color": dark ? "#00d2ff" : "#0077ff", "line-width": 1.4, "line-opacity": 1 } },
      { id: "country-line", type: "line", source: "countries", paint: { "line-color": dark ? "#2b4a6e" : "#b9c9dc", "line-width": 0.7, "line-opacity": 0.9 } }
    ]
  };
}
