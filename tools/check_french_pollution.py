import json
import re
import glob
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

check_files = [
    'wt-wiki-zh.core.js',
    'wt-wiki-zh.user.js',
    'data/popover_terms.json',
    'data/manufacturers.json',
    'data/unit_names.json',
    'data/terms.json',
    'tools/matched_official_popover.json',
    'tools/popover_patch.json',
]

french_words = ['Furtif', 'Blindage', 'Vitesse', 'Munitions', 'Recherche', 'Achat', 'Portée', 'Viseur', 'guidage', 'chaff', 'leurres', 'vision', 'thermique']

for path in check_files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
            found = []
            for w in french_words:
                matches = re.findall(rf'["\':]\s*["\']([^"\']*{w}[^"\']*)["\']', content, re.IGNORECASE)
                if matches:
                    found.extend(matches)
            if found:
                print(f'=== Found {len(found)} French pollution items in {path}: ===')
                for m in list(set(found))[:30]:
                    print('  *', m)
