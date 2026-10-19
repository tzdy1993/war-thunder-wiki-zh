import csv, pathlib, json, sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HERE = pathlib.Path(__file__).resolve().parent
base = pathlib.Path(r'E:\SteamLibrary\steamapps\common\War Thunder\lang')
updates = {}
if (base / 'menu.csv').exists():
    with (base / 'menu.csv').open(encoding='utf-8', newline='', errors='ignore') as f:
        for row in csv.reader(f, delimiter=';'):
            if len(row) < 11: continue
            uid = row[0].strip('"')
            if not uid.startswith('workshop/'): continue
            en = row[1].replace('\\t', ' ').replace('\t', ' ').replace('\\n', ' ').replace('\n', ' ').replace('\u200b', '').strip()
            cn = row[10].replace('\\t', '').replace('\t', '').replace('\\n', ' ').replace('\n', ' ').replace('\u200b', '').strip()
            if not en or not cn: continue
            en = en.strip("'").strip('"')
            updates[en] = cn
print('total workshop entries:', len(updates))
out = HERE / 'test' / 'official-updates.json'
out.parent.mkdir(parents=True, exist_ok=True)
json.dump(updates, out.open('w', encoding='utf-8'), ensure_ascii=False, indent=1)
