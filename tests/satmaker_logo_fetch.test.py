import copy
import importlib.util
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from PIL import Image,ImageDraw

TOOL = Path(__file__).resolve().parents[1] / 'tools/fetch_satmaker_logos.py'
spec=importlib.util.spec_from_file_location('satmakerlogo',TOOL)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class SatelliteMakerLogoAudit(unittest.TestCase):
    def test_dataset_scope(self):
        sats=json.loads(mod.SAT_PATH.read_text(encoding='utf8'))
        companies=json.loads(mod.MERGED_PATH.read_text(encoding='utf8'))
        self.assertEqual(len(sats),37)
        self.assertEqual(len({c['id'] for c in sats}),37)
        self.assertEqual({c['id'] for c in sats},{c['id'] for c in companies if c['cat']=='satmaker'})
        self.assertTrue(set(mod.CURATED).issubset({c['id'] for c in sats}))

    def test_flat_legacy_placeholder_rejected(self):
        image=Image.new('RGB',(200,200),(9,13,22))
        buf=io.BytesIO();image.save(buf,'PNG')
        with self.assertRaisesRegex(ValueError,'placeholder'):
            mod._convert_image(buf.getvalue(),'image/png')

    def test_real_imagelike_content_normalizes_to_png(self):
        image=Image.new('RGBA',(400,150),'white')
        d=ImageDraw.Draw(image)
        d.rectangle((20,20,380,130),fill='#1265ad')
        d.ellipse((60,30,140,110),fill='#efc234')
        b=io.BytesIO();image.save(b,'PNG')
        raw, dimensions=mod._convert_image(b.getvalue(),'image/png')
        self.assertTrue(raw.startswith(b'\x89PNG'))
        self.assertEqual(dimensions,(400,150))

    def test_official_jsonld_logo_ranks_above_generic_site_icon(self):
        html='''<html><head><script type="application/ld+json">{"@type":"Organization","name":"Example Aerospace","logo":"https://example.org/brand/example-logo.png"}</script><link rel="apple-touch-icon" href="/icon.png"></head><body><header><img alt="Example Aerospace logo" src="/assets/logo-header.png"></header></body></html>'''
        candidates=mod._logo_candidates(html,'https://example.org/','Example Aerospace')
        self.assertEqual(candidates[0][1],'https://example.org/brand/example-logo.png')
        self.assertLess(candidates[-1][0],85)

    def test_apply_preserves_all_other_categories(self):
        oldroot=mod.ROOT
        with tempfile.TemporaryDirectory() as temp:
            r=Path(temp)
            (r/'data').mkdir();(r/'docs').mkdir()
            for rel in ('data/companies.json','data/companies_satmaker.json'):
                (r/rel).write_bytes((oldroot/rel).read_bytes())
            companies=json.loads((r/'data/companies.json').read_text(encoding='utf8'))
            baseline={x['id']:copy.deepcopy(x) for x in companies if x['cat']!='satmaker'}
            im=Image.new('RGBA',(300,150),'white');draw=ImageDraw.Draw(im);draw.rectangle((20,30,280,110),fill='#127bac')
            b=io.BytesIO();im.save(b,'PNG'); image_data=b.getvalue()
            def fake_request(sess,url,timeout=12):
                if 'logo.png' in url:return url,'image/png',image_data
                return url,'text/html',b'<html><header><img alt="Dragonfly Aerospace logo" src="/logo.png"></header></html>'
            with patch.object(mod,'ROOT',r),patch.object(mod,'SAT_PATH',r/'data/companies_satmaker.json'),patch.object(mod,'MERGED_PATH',r/'data/companies.json'),patch.object(mod,'LOGO_DIR',r/'assets/img/logos/satmaker'),patch.object(mod,'AUDIT_PATH',r/'docs/SATMAKER_LOGOS_AUDIT.csv'),patch.object(mod,'_request',side_effect=fake_request),patch.object(sys,'argv',['fetch_satmaker_logos.py','--apply','--only','dragonfly-space']):
                self.assertEqual(mod.main(),0)
            updated=json.loads((r/'data/companies.json').read_text(encoding='utf8'))
            self.assertEqual(baseline,{x['id']:x for x in updated if x['cat']!='satmaker'})
            new=next(x for x in updated if x['id']=='dragonfly-space')
            self.assertTrue((r/new['logo']).exists())
            self.assertTrue((r/'docs/SATMAKER_LOGOS_AUDIT.csv').exists())

if __name__=='__main__':unittest.main()
