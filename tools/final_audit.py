import sys
import json
import csv
import re

sys.stdout.reconfigure(encoding='utf-8')

# 1. Audit tools/all_wiki_mined_official_matches.json
with open('tools/all_wiki_mined_official_matches.json', 'r', encoding='utf-8') as f:
    mined = json.load(f)

print('=== 1. AUDIT tools/all_wiki_mined_official_matches.json ===')
print(f'Total items: {len(mined)}')
tabs = [k for k, v in mined.items() if any(c in k or c in v for c in ['\t', '\\t', '\r', '\\r', '\n', '\\n'])]
print(f'Tabs/newlines count: {len(tabs)}')
broken = [k for k, v in mined.items() if len(k) <= 1 or k.lower() in {'t', 't kal alef', 't kal dalet', 't kal gimel'}]
print(f'Broken keys count: {len(broken)}')
kana = [k for k, v in mined.items() if any('\u3040' <= c <= '\u309f' or '\u30a0' <= c <= '\u30ff' for c in v)]
print(f'Japanese kana count: {len(kana)}')
kanji = [k for k, v in mined.items() if any(c in v for c in '弾砲対戦砕焼夷徹')]
print(f'Japanese kanji count: {len(kanji)}')
tc = [k for k, v in mined.items() if any(c in v for c in '彈裝藥穩脫殼奧兒燒')]
print(f'Traditional Chinese count: {len(tc)}')
french = [k for k, v in mined.items() if any(fw in v.lower() for fw in ['blindage', 'vitesse', 'munitions', 'recherche', 'achat', 'portée', 'viseur', 'furtif'])]
print(f'French count: {len(french)}')

# 2. Audit data/popover_terms.json
with open('data/popover_terms.json', 'r', encoding='utf-8') as f:
    popover = json.load(f)

print('\n=== 2. AUDIT data/popover_terms.json ===')
print(f'Total items: {len(popover)}')
p_tabs = [k for k, v in popover.items() if any(c in k or c in v for c in ['\t', '\\t', '\r', '\\r', '\n', '\\n'])]
print(f'Tabs/newlines count: {len(p_tabs)}')
p_broken = [k for k, v in popover.items() if len(k) <= 1 or k.lower() in {'t', 't kal alef', 't kal dalet', 't kal gimel'}]
print(f'Broken keys count: {len(p_broken)}')
p_kana = [k for k, v in popover.items() if any('\u3040' <= c <= '\u309f' or '\u30a0' <= c <= '\u30ff' for c in v)]
print(f'Japanese kana count: {len(p_kana)}')
p_kanji = [k for k, v in popover.items() if any(c in v for c in '弾砲対戦砕焼夷徹')]
print(f'Japanese kanji count: {len(p_kanji)}')
p_tc = [k for k, v in popover.items() if any(c in v for c in '彈裝藥穩脫殼奧兒燒')]
print(f'Traditional Chinese count: {len(p_tc)}')
p_french = [k for k, v in popover.items() if any(fw in v.lower() for fw in ['blindage', 'vitesse', 'munitions', 'recherche', 'achat', 'portée', 'viseur', 'furtif'])]
print(f'French count: {len(p_french)}')

# 3. Audit wt-zh-all.csv
print('\n=== 3. AUDIT wt-zh-all.csv ===')
with open('wt-zh-all.csv', 'r', encoding='utf-8') as f:
    r = csv.reader(f)
    csv_rows = list(r)

print(f'Total CSV rows (including header): {len(csv_rows)}')
bad_cols = [i for i, row in enumerate(csv_rows) if len(row) != 4]
print(f'Rows with column count != 4: {len(bad_cols)}')
csv_tabs = [i for i, row in enumerate(csv_rows) if any('\t' in c or '\\t' in c for c in row)]
print(f'Rows with tabs: {len(csv_tabs)}')

# 4. Audit wt-wiki-zh.user.js
print('\n=== 4. AUDIT wt-wiki-zh.user.js ===')
with open('wt-wiki-zh.user.js', 'r', encoding='utf-8') as f:
    ujs = f.read()

# Check translation table lines for literal \t
tab_translations = []
for line in ujs.splitlines():
    if line.strip().startswith('"') and (r'\t' in line or '\t' in line):
        tab_translations.append(line.strip())
print(f'Translation dictionary entries with \\t: {len(tab_translations)}')
ujs_real_tab = '\t' in ujs
print(f'Contains real \\t in user.js: {ujs_real_tab}')
ujs_broken_t = bool(re.search(r'"t"\s*:\s*"[^"]+"', ujs))
print(f'Contains broken "t": ... in user.js: {ujs_broken_t}')
ujs_french = [fw for fw in ['Furtif', 'Blindage', 'Vitesse', 'Munitions', 'Recherche', 'Achat', 'Portée', 'Viseur'] if fw in ujs]
print(f'Contains French test words in user.js: {ujs_french}')

