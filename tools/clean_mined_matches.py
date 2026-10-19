import sys
import json
import re
import collections

sys.stdout.reconfigure(encoding='utf-8')

with open('tools/all_wiki_mined_official_matches.json', 'r', encoding='utf-8') as f:
    mined = json.load(f)

# Cleaning & conversion map for known Traditional Chinese
TC_TO_SC = {
    '尾翼穩定脱殼穿甲彈': '尾翼稳定脱壳穿甲弹',
    '尾翼穩定脫殼穿甲彈': '尾翼稳定脱壳穿甲弹',
    '高速空射火箭彈（HVAR）': '高速空射火箭弹 (HVAR)',
    '高速航空火箭彈(HVAR)': '高速航空火箭弹 (HVAR)',
    '空射火箭彈（AR）': '空射火箭弹 (AR)',
    '高爆彈': '高爆弹',
    '尾翼稳定反坦克高爆彈': '尾翼稳定破甲弹',
    '穿甲燃燒彈': '穿甲燃烧弹',
    'AMASE（“阿帕奇”模塊化航空器生存能力裝置）': 'AMASE（“阿帕奇”模块化航空器生存能力装置）',
    'OKFOL-20 炸藥': 'OKFOL-20 炸药',
    'OKFOL（鈍化奧克托今）': 'OKFOL（钝化奥克托今）',
    'A-IX-2（含鋁鈍化黑索金）': 'A-IX-2（含铝钝化黑索金）',
    'HBX（含鋁鈍化黑索金 加 TNT）': 'HBX（含铝钝化黑索金 加 TNT）',
    'HTA（含鋁黑索金 加 TNT）': 'HTA（含铝黑索金 加 TNT）',
    'PBXN-102（聚酯樹脂黏結含鋁奧克托今）': 'PBXN-102（聚酯树脂粘结含铝奥克托今）',
}

# Bad collision keys to drop
COLLISION_BAD_KEYS = {
    'Name', 'SAP', 'AHEAD', 'APC', 'Commander', 'Gunner', 'Track',
    'External tank (100 gal.)', 'External tank (180 gal.)',
    'Laser Warning System', 'Default', 'Armored targets',
    'SA', 'GB', 'IT'
}

# French check words
FRENCH_WORDS = ['blindage', 'vitesse', 'munitions', 'recherche', 'achat', 'portée', 'viseur', 'furtif']

cleaned = {}
filtered = []

for raw_k, raw_v in mined.items():
    k = raw_k.strip().replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
    v = raw_v.strip().replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
    # replace newlines in value with space
    v = re.sub(r'[\r\n]+', ' ', v)
    v = re.sub(r'\s{2,}', ' ', v).strip()

    # 1. Broken keys
    if len(k) <= 1 or k.lower() in {'t', 't kal alef', 't kal dalet', 't kal gimel'}:
        filtered.append((k, v, 'broken_key'))
        continue

    # 2. Dangerous short keys & collisions
    if k in COLLISION_BAD_KEYS:
        filtered.append((k, v, 'bad_collision_or_dangerous_short_key'))
        continue

    # 3. Japanese Kana in value
    if any('\u3040' <= c <= '\u309f' or '\u30a0' <= c <= '\u30ff' for c in v):
        filtered.append((k, v, 'japanese_kana'))
        continue

    # 4. Japanese Kanji / shell patterns
    if any(c in v for c in '弾砲対戦砕焼夷徹') or v.endswith('への改造') or v.endswith('弾') or v.endswith('砲弾'):
        filtered.append((k, v, 'japanese_kanji'))
        continue

    # 5. French check
    if any(fw in v.lower() for fw in FRENCH_WORDS):
        filtered.append((k, v, 'french'))
        continue

    # 6. Check traditional Chinese conversion
    if v in TC_TO_SC:
        v = TC_TO_SC[v]

    if '中华民国' in v:
        v = v.replace('中华民国', '中國')

    tc_remain = [c for c in v if c in '彈裝藥穩脫殼奧兒燒']
    if tc_remain:
        filtered.append((k, v, f"unconverted_traditional_{''.join(tc_remain)}"))
        continue

    # 7. Pure numbers or punctuation
    if not re.search(r'[a-zA-Z\u4e00-\u9fff]', k):
        filtered.append((k, v, 'pure_num_or_punct'))
        continue

    # 8. Must have at least one Chinese character in value
    if not any('\u4e00' <= c <= '\u9fff' for c in v):
        filtered.append((k, v, 'no_chinese_in_value'))
        continue

    cleaned[k] = v

print(f'Total raw: {len(mined)}')
print(f'Cleaned valid: {len(cleaned)}')
print(f'Filtered out: {len(filtered)}')
print('\nFiltered summary by reason:')
reasons = collections.Counter(r for k, v, r in filtered)
for r, c in reasons.most_common():
    print(f'  {r}: {c}')

print('\nSample filtered items:')
for k, v, r in filtered[:20]:
    print(f'  [{r}] {k!r} -> {v!r}')
