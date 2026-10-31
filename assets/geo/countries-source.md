# Country-boundary geometry: source and licence

`countries.json` is the attributed source GeoJSON for `countries.pmtiles`, the app's runtime vector source for country hover, click, and the persistent blue selection outline. The archive is used by the three online styles and the offline style, so both paths share exactly the same country geometry and feature IDs. The former Natural Earth 1:110m polygons could visibly drift from the OSM-derived boundary lines in the online basemaps; the source coordinates have therefore been replaced with OpenStreetMap-derived polygons from **Terrae 2026.10**.

## Dataset and processing

- Source: [Terrae — Open administrative boundaries from OpenStreetMap](https://github.com/p-rubi/terrae), release 2026.10.
- OSM snapshot: 28 September 2026.
- Geometry: level 0, low-detail polygons (about 1,500 m generalisation), WGS 84 / EPSG:4326.
- The 177 ORBITA feature records, IDs, names, translations, ISO codes, and display metadata are retained. Polygon geometry is matched to Terrae units by ISO/name; the **de facto** view is used where available so disputed/administered areas follow the OSM-based map more closely. Somaliland and Northern Cyprus use their Terrae de-facto authority features. Morocco and Western Sahara use the paired Terrae reference polygons: Western Sahara is not a separate unit in the de-facto layer, and using the pair keeps the interactive country polygons non-overlapping.
- Source vertices are retained without extra simplification, and per-feature bounding boxes are recalculated. The 177 selected polygons were checked for valid geometry and overlaps.
- Source packages and SHA-256 checksums:
  - [Low-detail reference polygons](https://huggingface.co/buckets/geodataset/terrae/resolve/adm0/2026.10/world/terrae-adm0-2026.10-low-reference-polygons.gpkg) — `4fd0dc8c582dd972354ed875567d752825c5acf3731ed816df586456f89af99f`
  - [Low-detail de-facto polygons](https://huggingface.co/buckets/geodataset/terrae/resolve/adm0/2026.10/world/terrae-adm0-2026.10-low-de_facto-polygons.gpkg) — `f8c61cf2563b5b3f1817b22a0a6c03d53a14bf416a292c0079d5268dd191b8b0`

## Vector tiles and build

- Runtime archive: `countries.pmtiles` (23.9 MB, vector tiles, zooms 0–10, `countries` source-layer). The same archive and `NAME`-based feature IDs serve all three online map styles and the offline style.
- The 9.6 MB GeoJSON remains as the editable/build source and is not fetched by the browser. MapLibre retrieves only tile byte-ranges needed by the current view through the vendored PMTiles v4.5.0 protocol.
- Rebuild from the repository root with `tools/build_country_tiles.sh` after installing Tippecanoe 2.53+ and the PMTiles CLI 1.31+. The script converts a temporary MBTiles file and replaces the archive only after a size sanity check.
- `serve.py` includes HTTP `Range`/`206 Partial Content` support for local preview. Static hosts must support byte-range requests for PMTiles; the app's archive is served from the same origin.
- PMTiles JS implementation copyright/license is retained in `assets/vendor/PMTILES-LICENSE.txt` (BSD-3-Clause). The PMTiles file format specification is public domain/CC0 as applicable.

## Attribution and licence

The OSM-derived boundary database is distributed under the [Open Database License 1.0 (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/). Attribution: **© OpenStreetMap contributors; Terrae**. The map's attribution control includes this credit; the map providers' own attribution is retained as well.

These boundaries are geographic reference data, not authoritative legal boundaries. Different basemap releases, zoom-level generalisation, and disputed-border styling can still produce small differences; the change replaces a coarse, independently sourced outline with recent OSM-derived geometry so it follows all three OSM-based styles much more closely.
