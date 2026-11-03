#!/usr/bin/env python3
"""Build the small, lazy-loadable company category files from data/companies.json.

The source file remains the canonical, complete record set. This script writes only
companies_{launch,propulsion,agency,satmaker}.json and never changes the source.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "companies.json"
CATEGORIES = ("launch", "propulsion", "agency", "satmaker")

rows = json.loads(SOURCE.read_text(encoding="utf-8"))
if not isinstance(rows, list):
    raise SystemExit("data/companies.json must contain a JSON array")
ids = [row.get("id") for row in rows]
if any(not item for item in ids) or len(ids) != len(set(ids)):
    raise SystemExit("Company IDs must be present and unique")
unknown = sorted({row.get("cat") for row in rows} - set(CATEGORIES))
if unknown:
    raise SystemExit("Unknown company categories: " + ", ".join(map(str, unknown)))

counts = Counter(row["cat"] for row in rows)
for category in CATEGORIES:
    subset = [row for row in rows if row["cat"] == category]
    output = ROOT / "data" / f"companies_{category}.json"
    output.write_text(
        json.dumps(subset, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    canonical = sum(not row.get("alias_of_id") for row in subset)
    print(f"{output.relative_to(ROOT)}: {counts[category]} records, "
          f"{canonical} canonical, {output.stat().st_size:,} bytes")

if sum(counts.values()) != len(rows):
    raise SystemExit("Category split did not preserve every company record")
print(f"Total: {len(rows)} source records preserved across {len(CATEGORIES)} files")
