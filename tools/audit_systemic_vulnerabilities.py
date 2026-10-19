import os
import re
import json
import csv
import glob

print("=====================================================")
print("=== 全系统深度主动自检：排查所有潜在结构性与数据暗坑 ===")
print("=====================================================")

issues_found = []

# 1. 检查当前核心数据字典 data/*.json 和 wt-zh-all.csv
DATA_DIR = 'data'
json_files = glob.glob(os.path.join(DATA_DIR, '*.json'))

print(f"\n[1] 正在自检核心词表 ({len(json_files)} 个 JSON 文件)...")

dangerous_short_keys = {}
backslash_terms = {}
foreign_or_non_chinese = {}
suspicious_translations = {}

for jf in json_files:
    fname = os.path.basename(jf)
    try:
        with open(jf, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict):
                items = data.items()
            elif isinstance(data, list):
                items = [(x, x) for x in data if isinstance(x, str)]
            else:
                continue

            for k, v in items:
                if not isinstance(k, str) or not isinstance(v, str):
                    continue
                
                # A. 危险短键检测 (长度 <= 2 的字母键，极易在文本中造成灾难性误替换)
                if len(k.strip()) <= 2 and k.strip().isalpha():
                    dangerous_short_keys[f"{fname}:{k}"] = v

                # B. 反斜杠转义残余检测 (\t, \n, \r, \\)
                if '\\t' in v or '\t' in v or '\\n' in v or '\\r' in v:
                    backslash_terms[f"{fname}:{k}"] = v

                # C. 目标翻译非简体中文检测（检查是否混入法语、德语、意大利语或纯英文）
                # 如果英文键很长，但翻译值完全没有汉字且不等于键本身
                has_chinese = any('\u4e00' <= c <= '\u9fff' for c in v)
                if not has_chinese and len(k) > 3 and v != k:
                    # 排除纯数字或常规标点
                    if re.search(r'[a-zA-Z]{3,}', v):
                        foreign_or_non_chinese[f"{fname}:{k}"] = v

    except Exception as e:
        issues_found.append(f"读取 {jf} 异常: {e}")

print(f"  - 危险短键(长度<=2的字母)发现: {len(dangerous_short_keys)} 处")
for k, v in list(dangerous_short_keys.items())[:15]:
    print(f"      [警告短键] {k} -> {v}")

print(f"  - 反斜杠/制表符污染发现: {len(backslash_terms)} 处")
for k, v in list(backslash_terms.items())[:10]:
    print(f"      [反斜杠污染] {k} -> {repr(v)}")

print(f"  - 疑似外语/无中文有效翻译发现: {len(foreign_or_non_chinese)} 处")
for k, v in list(foreign_or_non_chinese.items())[:15]:
    print(f"      [疑似外语] {k} -> {repr(v)}")

# 2. 检查官方客户端 CSV 提取逻辑中的“法语陷阱”
print("\n[2] 正在审查本地战雷官方客户端 54 个 CSV 文件的列结构与提取逻辑...")
lang_dir = r'E:\SteamLibrary\steamapps\common\War Thunder\lang'
csv_files = glob.glob(os.path.join(lang_dir, '*.csv'))

french_pollution_count = 0
header_sample = {}
for cf in csv_files:
    cname = os.path.basename(cf)
    try:
        with open(cf, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f, delimiter=';')
            first_row = next(reader, None)
            if first_row and len(first_row) > 2:
                header_sample[cname] = first_row[:12]
    except Exception:
        pass

print("  官方 CSV 表头示例 (前几个文件):")
for cf, h in list(header_sample.items())[:3]:
    print(f"    {cf}: {h}")

# 3. 检查 wt-wiki-zh.core.js 中的核心 DOM 替换漏洞与边界处理
print("\n[3] 正在审查 core.js 中的替换引擎逻辑...")
core_path = 'wt-wiki-zh.core.js'
with open(core_path, 'r', encoding='utf-8') as f:
    core_text = f.read()

# 检查是否有容易误伤子串的非边界正则
potential_regex_flaws = []
if 'replaceAll' in core_text:
    potential_regex_flaws.append("core.js 中使用了 replaceAll，若词条未加单词边界 \\b，将导致单词内部被粗暴替换")

# 检查双斜杠来源
if 'km/h' in core_text or 'm/s' in core_text:
    print("  检查单位替换逻辑中的斜杠处理...")

# 输出综合体检结果报告
print("\n================ 自检发现的系统性隐患汇总 ================")
report = {
    "dangerous_short_keys": dangerous_short_keys,
    "backslash_terms": backslash_terms,
    "foreign_or_non_chinese": foreign_or_non_chinese,
    "flaws": potential_regex_flaws
}

with open('tools/systemic_audit_report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"自检完成，详细报告已写入 tools/systemic_audit_report.json")
