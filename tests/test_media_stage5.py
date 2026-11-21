import json, unittest, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Stage5(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d=json.loads((ROOT/'data/media/catalog.v1.json').read_text(encoding='utf-8'))
        cls.m={e['entity_key']:e for e in cls.d['entities']}
    def test_exact_entity_count(self):
        self.assertEqual(420,len(self.d['entities']))
        self.assertEqual(133,sum(e['category'] in ('launch','propulsion') for e in self.d['entities']))
    def test_unique_keys(self):
        self.assertEqual(len(self.m),len(self.d['entities']))
    def test_unique_media_ids(self):
        a=[m['media_id'] for e in self.d['entities'] for m in e['media']]
        self.assertEqual(len(a),len(set(a)))
    def test_scope_has_verified_media(self):
        a=[e for e in self.d['entities'] if e['category'] in ('launch','propulsion') and e['media']]
        self.assertGreaterEqual(len(a),12)
    def test_no_protected_rights_in_verified(self):
        for e in self.d['entities']:
            for m in e['media']:
                if m['verification']['status']=='verified':
                    self.assertNotIn(m['rights']['usage'],('restricted','undetermined'))
    def test_video_link_only(self):
        for e in self.d['entities']:
            if e['category'] not in ('launch','propulsion'): continue
            for m in e['media']:
                if m['kind']=='video': self.assertEqual('link_only',m['rights']['usage'])
    def test_media_external_url_https(self):
        for e in self.d['entities']:
            if e['category'] not in ('launch','propulsion'): continue
            for m in e['media']:
                self.assertTrue(m['external_url'].startswith('https://'))
                self.assertTrue(m['source']['url'].startswith('https://'))
    def test_review_marked(self):
        for e in self.d['entities']:
            if e['category'] in ('launch','propulsion') and e['media']:
                self.assertEqual('in_progress',e['review_status'])
if __name__=='__main__': unittest.main()
