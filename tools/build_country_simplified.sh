#!/usr/bin/env bash
# Build the compact map/interaction GeoJSON from the full attributed boundary data.
# Requirements: Node.js/npx and mapshaper (downloaded on demand by npx).
# The full countries.json remains untouched and is still used for exact click fallback.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

npx --yes mapshaper assets/geo/countries.json \
  -simplify 15% keep-shapes \
  -o format=geojson assets/geo/countries_simplified.json

python - <<'PY'
import json
from pathlib import Path
full = json.loads(Path("assets/geo/countries.json").read_text(encoding="utf-8"))
small_path = Path("assets/geo/countries_simplified.json")
small = json.loads(small_path.read_text(encoding="utf-8"))
full_names = {f.get("properties", {}).get("NAME") for f in full.get("features", [])}
small_names = {f.get("properties", {}).get("NAME") for f in small.get("features", [])}
if len(full_names) != 177 or small_names != full_names:
    raise SystemExit("Simplified geometry must retain all 177 named country features")
if small_path.stat().st_size >= Path("assets/geo/countries.json").stat().st_size * 0.5:
    raise SystemExit("Simplified GeoJSON did not meet the 50% size-reduction check")
print(f"Validated {len(small_names)} country features ({small_path.stat().st_size:,} bytes)")
PY
