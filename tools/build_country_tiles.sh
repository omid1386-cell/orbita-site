#!/usr/bin/env bash
# Rebuild the local PMTiles country-boundary archive from the attributed source GeoJSON.
# Requirements: tippecanoe >= 2.53 and go-pmtiles CLI >= 1.31.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

command -v tippecanoe >/dev/null 2>&1 || { echo "Missing dependency: tippecanoe" >&2; exit 1; }
command -v pmtiles >/dev/null 2>&1 || { echo "Missing dependency: pmtiles CLI" >&2; exit 1; }

SOURCE="assets/geo/countries.json"
OUTPUT="assets/geo/countries.pmtiles"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/orbita-country-tiles.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

# Low zooms are simplified for fast world-scale rendering; zoom 10 retains the
# current Terrae low-detail source geometry as closely as vector-tile quantization allows.
tippecanoe \
  --output="$TMP/countries.mbtiles" \
  --name="ORBITA country boundaries" \
  --description="Terrae 2026.10 OSM-derived ADM0 polygons, tiled for ORBITA" \
  --attribution="© OpenStreetMap contributors; Terrae (ODbL-1.0)" \
  --layer=countries \
  --minimum-zoom=0 \
  --maximum-zoom=10 \
  --no-feature-limit \
  --no-tiny-polygon-reduction-at-maximum-zoom \
  --detect-shared-borders \
  --simplification-at-maximum-zoom=0.5 \
  --quiet \
  "$SOURCE"

pmtiles convert -q "$TMP/countries.mbtiles" "$TMP/countries.pmtiles"

# Refuse to replace the working archive with an empty or implausibly large build.
SIZE="$(wc -c < "$TMP/countries.pmtiles")"
if [ "$SIZE" -lt 1000000 ] || [ "$SIZE" -gt 99000000 ]; then
  echo "Unexpected PMTiles size: ${SIZE} bytes" >&2
  exit 1
fi

mv "$TMP/countries.pmtiles" "$OUTPUT"
printf 'Built %s (%s bytes)\n' "$OUTPUT" "$SIZE"
