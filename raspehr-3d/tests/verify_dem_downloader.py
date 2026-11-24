#!/usr/bin/env python3
"""Test Terrarium downloader validation with a locally generated PNG; no network."""
from pathlib import Path
from PIL import Image
from io import BytesIO
import importlib.util
modpath=Path(__file__).resolve().parent.parent/'tools/fetch_dem_z2.py'
spec=importlib.util.spec_from_file_location('fetch_dem_z2',modpath)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
im=Image.new('RGB',(256,256),(135,208,0))
with BytesIO() as f:
    im.save(f,format='PNG'); payload=f.getvalue()
assert mod.inspect_png(payload)==(256,256)
for invalid in [b'garbage',payload[:50]]:
    try:mod.inspect_png(invalid)
    except ValueError:pass
    else:raise AssertionError('Invalid/incomplete PNG incorrectly accepted')
print('PASS RASPEHR Terrarium offline downloader: 256x256 PNG and truncated data validation')
