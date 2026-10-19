import csv, pathlib, re, collections, json
base = pathlib.Path(r'E:\SteamLibrary\steamapps\common\War Thunder\lang')
found = collections.defaultdict(list)
for p in base.glob('*.csv'):
    try:
        with p.open(encoding='utf-8', newline='') as f:
            for row in csv.reader(f, delimiter=';'):
                if len(row) < 11:
                    continue
                en = row[1].replace('\t', ' ').replace('\n', ' ').replace('\u200b', '').strip()
                cn = row[10].replace('\t', '').replace('\n', ' ').replace('\u200b', '').strip()
                if cn and 'update' in en.lower() and re.match(r'^[A-Za-z0-9 .\-"“”]+$', en):
                    found[en].append((cn, p.name, row[0]))
    except UnicodeDecodeError:
        pass
print('unique update keys:', len(found))
for en, vals in list(found.items())[:60]:
    uniq = list(dict.fromkeys(v[0] for v in vals))
    print(repr(en), '->', uniq[:3])
