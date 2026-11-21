import csv, hashlib, json, unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
D=json.loads((ROOT/'data/media/catalog.v1.json').read_text(encoding='utf-8'))
M=json.loads((ROOT/'RELEASE_DOCS/STAGE6_OTHER92/ROUND4_MANIFEST.json').read_text(encoding='utf-8'))
bykey={x['entity_key']:x for x in D['entities']}

class Stage6Round4(unittest.TestCase):
    def test_420_entities_and_new_ids(self):
        self.assertEqual(D['total_entities'],420)
        self.assertEqual(len(bykey),420)
        self.assertEqual(len({m['media_id'] for e in D['entities'] for m in e['media']}),sum(len(e['media']) for e in D['entities']))

    def test_cumulative_round4_counts(self):
        with (ROOT/'RELEASE_DOCS/STAGE6_OTHER92/ALL_92_STATUS.csv').open(encoding='utf-8-sig',newline='') as f:
            rows=list(csv.DictReader(f))
        self.assertEqual(len(rows),92)
        self.assertEqual(sum(int(r['number_verified_media'])>0 for r in rows),73)
        self.assertEqual(sum(int(r['number_verified_media']) for r in rows),92)
        self.assertEqual(sum(int(r['number_verified_media'])==0 for r in rows),19)

    def test_manifest_and_new_records(self):
        self.assertEqual(len(M['new_entity_keys']),15)
        self.assertEqual(len(M['new_media_ids']),18)
        self.assertEqual(M['round4_new_video_links'],17)
        self.assertEqual(M['round4_new_images'],1)
        self.assertEqual(hashlib.sha256((ROOT/'data/media/catalog.v1.json').read_bytes()).hexdigest(),M['catalog_new_sha256'])
        all_media={m['media_id']:m for e in D['entities'] for m in e['media']}
        for mid in M['new_media_ids']:
            m=all_media[mid]
            self.assertEqual(m['verification']['status'],'verified')
            self.assertEqual(m['verification']['identity_match'],'confirmed')
            self.assertTrue(m['rights']['proof_url'].startswith('https://'))
            self.assertEqual(m['rights']['usage'],'link_only' if m['kind']=='video' else 'attribution_required')
            self.assertTrue(m['source']['publisher'])

    def test_prior_categories_do_not_receive_round4_records(self):
        for e in D['entities']:
            if e['category'] in ('agency','launch','propulsion','launch_site','recovery_site'):
                self.assertFalse(any(m['media_id'].startswith('med-stage6r4-') for m in e['media']))

    def test_research_ledger_exact_rows(self):
        with (ROOT/'RELEASE_DOCS/STAGE6_OTHER92/ROUND4_NEW_MEDIA.csv').open(encoding='utf-8-sig',newline='') as f:
            rows=list(csv.DictReader(f))
        self.assertEqual(len(rows),18)
        self.assertEqual({r['media_id'] for r in rows},set(M['new_media_ids']))

if __name__ == '__main__':unittest.main()
