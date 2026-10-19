import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== Starting Comprehensive Codebase Audit & Sanitization ===")

# 1. 检查所有法国/外语污染模式
FRENCH_PATTERNS = [
    r'\bFurtif\b', r'\bBlindage\b', r'\bVitesse\b', r'\bMunitions\b', 
    r'\bRecherche\b', r'\bAchat\b', r'\bPortée\b', r'\bViseur\b',
    r'\bLeurres\b', r'\bpaillettes\b', r'\brâteliers\b', r'\bSystème\b'
]
compiled_french = [re.compile(p, re.IGNORECASE) for p in FRENCH_PATTERNS]

def has_french_pollution(text):
    if not text:
        return False
    return any(p.search(text) for p in compiled_french)

def is_chinese_or_safe(text):
    # 必须包含中文，或者完全是数字/度量衡单位/纯标点
    if not text:
        return True
    has_cn = any('\u4e00' <= char <= '\u9fff' for char in text)
    if has_cn:
        # 如果包含中文，但又包含法语污染，则不合格
        return not has_french_pollution(text)
    # 如果没有中文，检查是否属于合法纯符号/数字（比如 "12.7 mm", "100 kg"）
    pure_symbol_or_number = bool(re.match(r'^[\d\s\.,/%+xX\-–—()（）/°\'\"#]+$', text))
    return pure_symbol_or_number

# 2. 审查与清洗 data/popover_terms.json
popover_path = 'data/popover_terms.json'
if os.path.exists(popover_path):
    with open(popover_path, 'r', encoding='utf-8') as f:
        p_data = json.load(f)
    cleaned_p = {}
    removed_count = 0
    for k, v in p_data.items():
        if is_chinese_or_safe(v) and not has_french_pollution(v):
            cleaned_p[k] = v
        else:
            print(f"Purging polluted popover term: [{k}] -> [{v}]")
            removed_count += 1
    
    # 强制修正高频重点条目
    cleaned_p["Stealth"] = "匿踪"
    cleaned_p["Stealth:"] = "匿踪："
    cleaned_p["Universal"] = "通用"
    cleaned_p["Universal:"] = "通用："
    cleaned_p["Tracers"] = "曳光"
    cleaned_p["Tracers:"] = "曳光："
    cleaned_p["Air targets"] = "对空"
    cleaned_p["Air targets:"] = "对空："
    cleaned_p["Ground targets"] = "对地"
    cleaned_p["Ground targets:"] = "对地："
    cleaned_p["Armored targets"] = "对装甲目标"
    cleaned_p["Armored targets:"] = "对装甲目标："
    cleaned_p["Default"] = "默认"
    cleaned_p["Default:"] = "默认："
    cleaned_p["Guidance"] = "制导方式"
    cleaned_p["Guidance:"] = "制导方式："
    cleaned_p["Missile guidance time"] = "导弹制导时长"
    cleaned_p["Beam riding"] = "驾束制导"

    with open(popover_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_p, f, ensure_ascii=False, indent=2)
    print(f"data/popover_terms.json sanitized. Purged {removed_count} items. Remaining: {len(cleaned_p)}")

# 3. 审查与清洗 data/terms.json（如果存在）
terms_path = 'data/terms.json'
if os.path.exists(terms_path):
    with open(terms_path, 'r', encoding='utf-8') as f:
        t_data = json.load(f)
    cleaned_t = {}
    for k, v in t_data.items():
        if is_chinese_or_safe(v) and not has_french_pollution(v):
            cleaned_t[k] = v
        else:
            print(f"Purging polluted term: [{k}] -> [{v}]")
    with open(terms_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_t, f, ensure_ascii=False, indent=2)

print("=== Audit & Sanitization Completed Successfully ===")
