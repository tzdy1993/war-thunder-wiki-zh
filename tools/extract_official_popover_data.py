import csv
import glob
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

lang_dir = r"E:\SteamLibrary\steamapps\common\War Thunder\lang"

with open("missing_popover_terms.json", "r", encoding="utf-8") as f:
    missing_dict = json.load(f)

missing_keys = set(missing_dict.keys())
print(f"Target missing keys to search: {len(missing_keys)}")

# 建立从英文到中文的官方映射
official_map = {}

# 遍历客户端所有 CSV 文件
csv_files = glob.glob(os.path.join(lang_dir, "*.csv"))
for filepath in csv_files:
    filename = os.path.basename(filepath)
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.reader(f, delimiter=";")
            for row in reader:
                if len(row) > 2:
                    key = row[0].strip()
                    en = row[1].strip()
                    cn = row[2].strip()
                    if not en or not cn:
                        continue
                    # 归一化后比对
                    if en in missing_keys and en not in official_map:
                        official_map[en] = cn
                    
                    # 清除控制字符与标签后再试
                    clean_en = re.sub(r"<[^>]+>", "", en).strip()
                    clean_cn = re.sub(r"<[^>]+>", "", cn).strip()
                    if clean_en in missing_keys and clean_en not in official_map:
                        official_map[clean_en] = clean_cn
    except Exception as e:
        print(f"Error reading {filename}: {e}")

print(f"Direct official matches found: {len(official_map)}")

# 保存匹配到的官方翻译
with open("matched_official_popover.json", "w", encoding="utf-8") as f:
    json.dump(official_map, f, ensure_ascii=False, indent=2)

print("Saved to matched_official_popover.json")

# 查看未匹配但频次最高的条目
remaining = {k: missing_dict[k] for k in missing_keys if k not in official_map}
print(f"Remaining unmatched keys: {len(remaining)}")

print("\n--- Top 30 Remaining Keys ---")
for k in sorted(remaining, key=lambda x: -remaining[x])[:30]:
    print(f"[{remaining[k]:5d}] {k}")
