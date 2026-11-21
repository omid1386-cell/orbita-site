"""Offline regression tests for ORBITA Stage 4 Round 4 agency media.
Does not imply live site, external CDN or video playback tests.
"""
import csv, hashlib, json, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CAT=json.loads((ROOT/'data/media/catalog.v1.json').read_text('utf8'))
MAN=json.loads((ROOT/'docs/AGENCY_MEDIA_ROUND4_MANIFEST.json').read_text('utf8'))
BASE=json.loads((ROOT/'docs/AGENCY_MEDIA_ROUND4_BASELINE_SHA256.json').read_text('utf8'))
AG=[e for e in CAT['entities'] if e['category']=='agency']
ALL={m['media_id']:m for e in AG for m in e['media']}

class Round4Tests(unittest.TestCase):
    def test_420_stable_entities(self):
        self.assertEqual(len(CAT['entities']),420)
        self.assertEqual(len(AG),96)
        self.assertEqual(len({e['entity_key'] for e in CAT['entities']}),420)
        self.assertEqual(133,sum(e['category'] in ('launch','propulsion') for e in CAT['entities']))

    def test_original_61_media_immutable(self):
        self.assertEqual(61,len(BASE))
        for mid, old_sha in BASE.items():
            self.assertIn(mid,ALL)
            sha=hashlib.sha256(json.dumps(ALL[mid],sort_keys=True,ensure_ascii=False).encode()).hexdigest()
            self.assertEqual(sha,old_sha,mid)

    def test_approved_and_candidate_counts(self):
        approved=[m for m in ALL.values() if m['verification']['status']=='verified']
        candidate=[m for m in ALL.values() if m['verification']['status']=='candidate']
        self.assertEqual(77,len(approved))
        self.assertEqual(4,len(candidate))
        self.assertEqual(MAN['approved_total'],len(approved))
        self.assertEqual(MAN['candidate_total'],len(candidate))
        self.assertEqual(51,sum(any(m['verification']['status']=='verified' for m in e['media']) for e in AG))
        self.assertEqual(45,MAN['remaining'])
        for m in approved:
            self.assertTrue(m['verification']['source_verified'])
            self.assertEqual('confirmed',m['verification']['identity_match'])
            self.assertIn(m['rights']['usage'],{'link_only','public_domain','attribution_required','permission_granted'})
        for m in candidate:
            self.assertNotEqual(m['rights']['usage'],'link_only')

    def test_round4_new_media(self):
        with (ROOT/'docs/AGENCY_MEDIA_ROUND4_APPROVED.csv').open(encoding='utf-8-sig') as f:
            records=list(csv.DictReader(f))
        self.assertEqual(19,len(records))
        self.assertEqual(17,sum(r['kind']=='video' for r in records))
        self.assertEqual(2,sum(r['kind']=='image' for r in records))
        for r in records:
            m=ALL[r['media_id']]
            self.assertEqual('verified',m['verification']['status'])
            self.assertTrue(m['external_url'].startswith('https://'))
            if m['kind']=='video': self.assertEqual('link_only',m['rights']['usage'])
            else:
                self.assertTrue(m['rights']['license'])
                self.assertTrue(m['rights']['credit'])

    def test_rosa_unreachable_candidate_withheld(self):
        m=ALL['med-rosa-prague-research-connection-video']
        self.assertEqual('candidate',m['verification']['status'])
        self.assertEqual('undetermined',m['rights']['usage'])
        self.assertFalse(m['verification']['source_verified'])
        self.assertIsNone(m['verification']['reviewed_on'])

    def test_rwanda_official_videos(self):
        for mid in ['med-rwanda-agency-podcast-2025','med-rwanda-agency-what-is-space-2023']:
            m=ALL[mid]
            self.assertEqual('verified',m['verification']['status'])
            self.assertIn('Rwanda Space Agency',m['source']['publisher'])
            self.assertEqual(m['external_url'],m['source']['url'])

    def test_current_queue_matches_real_missing(self):
        missing={e['entity_id'] for e in AG if not any(m['verification']['status']=='verified' for m in e['media'])}
        with (ROOT/'docs/AGENCY_MEDIA_REMAINING_CURRENT.csv').open(encoding='utf-8-sig') as f:
            actual={row['entity_id'] for row in csv.DictReader(f)}
        self.assertEqual(missing,actual)
        self.assertEqual(45,len(actual))

    def test_links_not_reused(self):
        urls=[m['external_url'] for m in ALL.values()]
        self.assertEqual(len(urls),len(set(urls)))

if __name__=='__main__':unittest.main()
