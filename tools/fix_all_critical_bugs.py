import json
import re
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

print("=== Fixing All Critical Bugs (Sho't, \\t pollution, HMD) ===")

# 1. 彻底清洗 data/popover_terms.json 中的 \\t 与 \t 污染
popover_path = 'data/popover_terms.json'
with open(popover_path, 'r', encoding='utf-8') as f:
    popover_data = json.load(f)

cleaned_popover = {}
tab_cleaned_count = 0

for k, v in popover_data.items():
    # 彻底剥离字面量 \t 以及真实的制表符 \t 和多余空格
    clean_k = k.replace('\\t', '').replace('\t', '').strip()
    clean_v = v.replace('\\t', '').replace('\t', '').strip()
    # 修复中间多余的双空格
    clean_v = re.sub(r'\s{2,}', ' ', clean_v)
    if clean_v != v or clean_k != k:
        tab_cleaned_count += 1
    cleaned_popover[clean_k] = clean_v

# 补全头盔显示器与弹道计算机相关条目
ADDITIONAL_FIXES = {
    "Helmet-mounted display": "头盔显示器",
    "Helmet-Mounted display": "头盔显示器",
    "Helmet-Mounted Display": "头盔显示器",
    "Helmet mounted display": "头盔显示器",
    "Helmet Mounted Display": "头盔显示器",
    "HMD": "头盔显示器 (HMD)",
    "Ballistic computer": "弹道计算机",
    "Ballistic Computer": "弹道计算机",
    "CCIP": "连续计算落点 (CCIP)",
    "CCRP": "连续计算投放点 (CCRP)",
    "Guns/Cannons": "枪/炮",
    "Cannons": "机炮",
    "Guns": "机枪/机炮",
    "Rockets": "火箭弹",
    "Bombs": "炸弹",
    "EEGS": "增强型航迹射击瞄具 (EEGS)",
    "Enhanced Envelope Gunsight": "增强型航迹射击瞄具",
    "Focus sensor": "关注焦点传感器",
    "Laser designator": "激光测距指示器",
    "Base weight": "基础重量",
    "Base weight:": "基础重量：",
    "Mass": "质量",
    "Mass:": "质量：",
    "Main fuel tanks": "主油箱燃料",
    "Main fuel tanks:": "主油箱燃料：",
}

for k, v in ADDITIONAL_FIXES.items():
    cleaned_popover[k] = v

with open(popover_path, 'w', encoding='utf-8') as f:
    json.dump(cleaned_popover, f, ensure_ascii=False, indent=2)

print(f"data/popover_terms.json cleaned: purged {tab_cleaned_count} tab-polluted entries. Total: {len(cleaned_popover)}")

# 验证清理结果
for k in ["Helmet-mounted display", "Cannons", "Focus sensor", "EEGS", "Stealth"]:
    print(f"  [{k}] -> {cleaned_popover.get(k)}")

print("=== Step 1 complete ===")
