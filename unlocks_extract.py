import csv, pathlib, json, re, sys
from collections import defaultdict, Counter

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HERE = pathlib.Path(__file__).resolve().parent
base = pathlib.Path(r'E:\SteamLibrary\steamapps\common\War Thunder\lang')
files = ['unlocks_skins.csv', 'unlocks_decals.csv', 'unlocks_medals.csv', 'unlocks_conditions.csv', 'unlocks_challenges.csv', 'unlocks_achievements.csv', 'unlocks_attachables.csv']
by_en = defaultdict(Counter)
for fn in files:
    p = base / fn
    if not p.exists():
        continue
    try:
        with p.open(encoding='utf-8', newline='', errors='ignore') as f:
            for row in csv.reader(f, delimiter=';'):
                if len(row) < 11: continue
                en = row[1].replace('\\t', ' ').replace('\t', ' ').replace('\\n', ' ').replace('\n', ' ').replace('\u200b', '').replace('\u00a0', ' ').strip()
                cn = row[10].replace('\\t', '').replace('\t', '').replace('\\n', ' ').replace('\n', ' ').replace('\u200b', '').replace('\u00a0', ' ').strip()
                if not en or not cn or en == cn: continue
                if len(en) > 60 or len(cn) > 60: continue
                by_en[en][cn] += 1
    except Exception:
        pass
result = {}
for en, counts in by_en.items():
    top, n = counts.most_common(1)[0]
    if n == 1 and len(counts) > 1:
        continue
    result[en] = top
print('entries:', len(result))
out = HERE / 'test' / 'official-unlocks.json'
out.parent.mkdir(parents=True, exist_ok=True)
json.dump(result, out.open('w', encoding='utf-8'), ensure_ascii=False)
