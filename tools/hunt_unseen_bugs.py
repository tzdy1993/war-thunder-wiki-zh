import os
import re
import json
import csv
import glob
from collections import Counter

print("=================================================================")
print("=== 主动缺陷雷达：全方位深挖系统潜伏的未知 Bug、荒谬词与繁体字 ===")
print("=================================================================")

# 1. 扫描所有词库中的“荒谬误伤词”
# 常见普通英文单词表 (如果这些普通词被直接映射成了具体载具或怪异中文，就会造成大面积误伤)
COMMON_WORDS = {
    't', 'm', 's', 'h', 'km', 'kg', 'mm', 'n', 'c', 'v', 'a', 'b', 'd', 'e', 'f', 'g', 'i', 'l', 'o', 'p', 'r', 'u', 'w', 'x', 'y', 'z',
    'in', 'on', 'at', 'to', 'for', 'by', 'with', 'from', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during',
    'type', 'class', 'mark', 'model', 'no', 'series', 'mod', 'project', 'version', 'edition',
    'tank', 'plane', 'ship', 'boat', 'gun', 'cannon', 'armor', 'speed', 'engine', 'mass', 'weight', 'rate', 'time', 'range', 'turn',
    'high', 'low', 'max', 'min', 'fast', 'slow', 'heavy', 'medium', 'light', 'good', 'bad', 'top', 'bottom',
    'air', 'ground', 'sea', 'water', 'fire', 'hit', 'damage', 'pen', 'reload', 'crew', 'hull', 'turret'
}

suspicious_mappings = []
traditional_chinese_terms = []
escape_corruptions = []

# 繁体特征字
TRADITIONAL_CHARS = set('彈機砲裝甲飛行戰鬥艦車發動機護甲損壞雷達視角導彈發射載具')
# 对应简体：弹机炮装甲飞行战斗舰车发动机护甲损坏雷达视角导弹发射载具

def audit_dict(source_name, dictionary):
    for k, v in dictionary.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        k_clean = k.strip()
        v_clean = v.strip()
        
        # 1. 检查普通词被映射为荒谬载具/非通用词
        if k_clean.lower() in COMMON_WORDS:
            suspicious_mappings.append((source_name, k_clean, v_clean))
            
        # 2. 检查繁体字污染
        has_trad = any(c in TRADITIONAL_CHARS for c in v_clean)
        if has_trad:
            traditional_chinese_terms.append((source_name, k_clean, v_clean))
            
        # 3. 检查转义符/乱码/HTML实体残留
        if any(bad in v_clean for bad in ['\\t', '\t', '\\n', '\\r', '&quot;', '&amp;', '&#', 'NaN', 'undefined', 'null']):
            escape_corruptions.append((source_name, k_clean, v_clean))

# 检查 data/*.json
for jf in glob.glob('data/*.json'):
    with open(jf, 'r', encoding='utf-8') as f:
        try:
            d = json.load(f)
            if isinstance(d, dict):
                audit_dict(os.path.basename(jf), d)
        except Exception:
            pass

# 检查 wt-zh-all.csv
if os.path.exists('wt-zh-all.csv'):
    with open('wt-zh-all.csv', 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        csv_dict = {}
        for row in reader:
            if len(row) >= 2:
                csv_dict[row[0]] = row[1]
        audit_dict('wt-zh-all.csv', csv_dict)

print(f"\n[A] 发现的高危/荒谬普通词映射 ({len(suspicious_mappings)} 个):")
for src, k, v in suspicious_mappings[:30]:
    print(f"    [{src}] '{k}' -> '{v}'")

print(f"\n[B] 发现的非大陆官方简中（繁体字）污染 ({len(traditional_chinese_terms)} 个):")
for src, k, v in traditional_chinese_terms[:30]:
    print(f"    [{src}] '{k}' -> '{v}'")

print(f"\n[C] 发现的转义符/实体/代码碎屑污染 ({len(escape_corruptions)} 个):")
for src, k, v in escape_corruptions[:30]:
    print(f"    [{src}] '{k}' -> {repr(v)}")

# 保存主动挖掘报告
with open('tools/unseen_bugs_report.json', 'w', encoding='utf-8') as f:
    json.dump({
        "suspicious_mappings": suspicious_mappings,
        "traditional_chinese_terms": traditional_chinese_terms,
        "escape_corruptions": escape_corruptions
    }, f, ensure_ascii=False, indent=2)

print("\n结果已写入 tools/unseen_bugs_report.json")
