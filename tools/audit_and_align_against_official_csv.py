import os
import glob
import re
import csv
import json

print("=================================================================")
print("=== 官方中文权威审计与校准：地毯式排查所有错译、臆造与漏翻 ===")
print("=================================================================")

# 1. 完整加载官方 54 个 CSV 字典，构建权威基准库
LANG_DIR = r'E:\SteamLibrary\steamapps\common\War Thunder\lang'
csv_files = glob.glob(os.path.join(LANG_DIR, '*.csv'))

def clean_tag(s):
    if not s:
        return ''
    # 去除 <color=...> 等标签
    t = re.sub(r'<[^>]+>', '', s)
    # 去除制表符与格式符
    t = t.replace('\\t', '').replace('\t', '').replace('\\r', '').replace('\r', '').strip()
    return re.sub(r'\s{2,}', ' ', t)

official_exact = {}      # en -> zh
official_lower = {}      # en.lower() -> zh
official_by_cat = {}     # category -> {en: zh}

for fpath in csv_files:
    cat = os.path.basename(fpath)
    official_by_cat[cat] = {}
    try:
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f, delimiter=';')
            for row in reader:
                if len(row) < 3:
                    continue
                en_raw = row[1].strip()
                if not en_raw:
                    continue
                clean_en = clean_tag(en_raw)
                if not clean_en:
                    continue

                # 寻找中文列（包含汉字）
                clean_zh = ''
                for col in row[2:]:
                    if any('\u4e00' <= c <= '\u9fff' for c in col):
                        clean_zh = clean_tag(col)
                        break
                
                if clean_zh:
                    official_exact[clean_en] = clean_zh
                    official_lower[clean_en.lower()] = clean_zh
                    official_by_cat[cat][clean_en] = clean_zh
    except Exception as e:
        print(f"Error reading {fpath}: {e}")

print(f"已加载官方权威词条总数: {len(official_exact)} 条")

# 2. 深度审查现有的词典：popover_terms.json, collections_categories.json, official_events.json, wt-zh-all.csv
DATA_DIR = 'data'
dict_files = glob.glob(os.path.join(DATA_DIR, '*.json'))

mismatched_with_official = []  # 项目翻译 != 官方翻译（自创/错译）
non_official_translations = [] # 官方没有收录但被翻译的
cleaned_and_corrected = {}     # 修正后的词表

for df in dict_files:
    fname = os.path.basename(df)
    try:
        with open(df, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, dict):
                continue
            
            for k, current_zh in data.items():
                if not isinstance(k, str) or not isinstance(current_zh, str):
                    continue
                k_clean = k.strip()
                cur_zh_clean = current_zh.strip()

                # 检查官方是否有确切对照
                matched_official = official_exact.get(k_clean) or official_lower.get(k_clean.lower())
                
                if matched_official:
                    # 如果当前翻译与官方翻译不一致
                    if cur_zh_clean != matched_official:
                        mismatched_with_official.append({
                            "file": fname,
                            "key": k_clean,
                            "current": cur_zh_clean,
                            "official": matched_official
                        })
    except Exception as e:
        print(f"Error checking {df}: {e}")

print(f"\n[A] 发现项目现有翻译与官方战雷中文不一致（错译/自创/繁体）: {len(mismatched_with_official)} 处！")
print("部分严重不一致案例（前面是项目内自作主张/繁体翻译，后面是官方正统中文）：")
for m in mismatched_with_official[:25]:
    print(f"  [{m['file']}] '{m['key']}'")
    print(f"      当前(错误/非官方): {m['current']}")
    print(f"      官方(正统简体):   {m['official']}")

# 保存详细对比审查清单
with open('tools/official_alignment_audit.json', 'w', encoding='utf-8') as f:
    json.dump(mismatched_with_official, f, ensure_ascii=False, indent=2)

print("\n完整对齐审计结果已保存至 tools/official_alignment_audit.json")
