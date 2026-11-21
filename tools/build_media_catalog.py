#!/usr/bin/env python3
"""One-time repeatable generator. Never overwrites existing registry unless --force."""
import argparse
import json
from pathlib import Path


def from_inventory(inventory):
    entities=[]
    for item in inventory['entities']:
        legacy = {
            'gallery_count': item.get('existing_gallery_items', 0),
            'profile_photo': item.get('existing_profile_photo'),
            'profile_photo_source_url': item.get('existing_photo_source_url'),
            'logo_exists': bool(item.get('existing_logo')),
            'event_video_link_count': item.get('existing_event_video_links', 0),
        }
        entities.append({
            'entity_type': item['entity_type'],
            'category': item['category'],
            'entity_id': item['id'],
            'entity_key': item['entity_type']+':'+item['category']+':'+item['id'],
            'names': {'fa': item.get('fa',''), 'en': item.get('en','')},
            'source_data_file': item['source_data_file'],
            'preserve_current_hero_photo': bool(item.get('preserve_current_hero_photo',False)),
            'review_status': 'pending',
            'legacy_media': legacy,
            'media': []
        })
    return {
        'schema_version': '1.0.0',
        'catalog_kind': 'orbita_entity_media',
        'snapshot_on': '2026-11-21',
        'total_entities': len(entities),
        'description': 'Verified gallery media registry; legacy media references are audit-only, never republished automatically.',
        'entities': entities,
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--inventory',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--force',action='store_true')
    a=p.parse_args()
    if a.output.exists() and not a.force:
        p.error('Output exists; --force required to overwrite')
    cat=from_inventory(json.loads(a.inventory.read_text(encoding='utf-8')))
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(cat,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f"Wrote {a.output}: {cat['total_entities']} entities")

if __name__=='__main__':
    main()
