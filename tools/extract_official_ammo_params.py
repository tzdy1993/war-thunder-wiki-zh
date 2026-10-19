import glob, csv, re, json

lang_dir = r'E:\SteamLibrary\steamapps\common\War Thunder\lang'
terms = [
    'Armor penetration', 'Belt', 'Belt filling', 'Thermal imager', 'Slot', 'Weight',
    'Armor-piercing', 'Tracer', 'Incendiary', 'High-explosive fragmentation', 'Ballistic computer',
    'Night vision', 'Laser rangefinder', 'Smoke grenade'
]
matches = {}
for cf in glob.glob(lang_dir + '/*.csv'):
    with open(cf, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f, delimiter=';')
        for row in reader:
            if len(row) < 3: continue
            en = row[1].strip()
            for t in terms:
                if t.lower() in en.lower():
                    for col in row[2:]:
                        if any('\u4e00' <= c <= '\u9fff' for c in col):
                            clean_zh = col.replace('\\t', '').replace('\t', '').replace('\\r', '').replace('\r', '').strip()
                            clean_zh = re.sub(r'<[^>]+>', '', clean_zh)
                            matches[en] = clean_zh
                            break

with open('tools/official_ammo_param_matches.json', 'w', encoding='utf-8') as f:
    json.dump(matches, f, ensure_ascii=False, indent=2)

print(f"找到 {len(matches)} 条官方技术与弹药词汇，已写入 tools/official_ammo_param_matches.json")
