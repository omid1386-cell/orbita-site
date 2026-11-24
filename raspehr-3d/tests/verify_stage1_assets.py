#!/usr/bin/env python3
"""Verify the complete standalone imagery pyramid and optional root dependencies."""
from pathlib import Path
import json
import re
from PIL import Image
root=Path(__file__).resolve().parent.parent
manifest=json.loads((root/'assets/tex-tiles/manifest.multilevel.json').read_text(encoding='utf-8'))
levels=manifest['levels']
expected=[('z0',1,2),('z1',2,4),('z2',4,8)]
assert len(levels)==3
count=0
for item,(lid,rows,cols) in zip(levels,expected):
    assert item['id']==lid and item['rows']==rows and item['cols']==cols
    assert item['effective_global_width']==cols*1024 and item['effective_global_height']==rows*1024
    for side in ['day','night']:
        for r in range(rows):
            for c in range(cols):
                fp=root/f'assets/tex-tiles/{lid}/{side}/{side}_{lid}_r{r}_c{c}.jpg'
                assert fp.is_file(),fp
                with Image.open(fp) as im:
                    assert im.format=='JPEG' and im.size==(1024,1024),(fp,im.size,im.format)
                    im.verify()
                count+=1
assert count==84,count
# The runtime-relative URL must stay inside the 3D module (not ../assets).
code=(root/'assets/js/globe-engine.js').read_text(encoding='utf-8')
assert '`assets/tex-tiles/${level.id}/day/' in code
assert '`../assets/tex-tiles/' not in code
# Base imagery and Three.js are existing app dependencies, not redistributed.
site=root.parent
for rel in ['assets/vendor/three.min.js','assets/tex/earth_day.jpg','assets/tex/earth_night.jpg','assets/tex/earth_clouds.jpg','assets/tex/earth_normal.jpg','assets/tex/earth_spec.jpg']:
    if (site/rel).is_file():
        assert (site/rel).stat().st_size>0
print(f'PASS RASPEHR Stage-1 R7 assets: {count} valid 1024x1024 JPEG tiles, 3 actual LOD resolutions, local URL paths and dependency checks')
