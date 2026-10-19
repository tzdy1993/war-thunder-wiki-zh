import os
import glob
import re
import html
import json
import csv
import sys
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

print("=========================================================")
print("=== STARTING FULL-SCALE EXHAUSTIVE WIKI MINING & AUDIT ===")
print("=========================================================")

# 1. 加载官方客户端所有 CSV 词库（彻底清洗反斜杠+t与制表符）
lang_dir = r'E:\SteamLibrary\steamapps\common\War Thunder\lang'
csv_files = glob.glob(os.path.join(lang_dir, '*.csv'))
print(f"Loading {len(csv_files)} official CSV files from {lang_dir}...")

official_dict = {}

def clean_official_zh(text):
    if not text:
        return ''
    # 彻底清除字面量 \t、真实制表符 \t、\r
    t = text.replace('\\t', '').replace('\t', '').replace('\\r', '').replace('\r', '').strip()
    t = re.sub(r'\s{2,}', ' ', t)
    return t

for filepath in csv_files:
    filename = os.path.basename(filepath)
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f, delimiter=';')
            for row in reader:
                if len(row) < 3:
                    continue
                en = row[1].strip()
                if not en:
                    continue
                # 寻找中文列（包含汉字）
                zh_cand = ''
                for col in row[2:]:
                    if any('\u4e00' <= char <= '\u9fff' for char in col):
                        zh_cand = clean_official_zh(col)
                        break
                if zh_cand and en:
                    clean_en = re.sub(r'<[^>]+>', '', en).strip()
                    if clean_en:
                        official_dict[clean_en] = zh_cand
                        official_dict[clean_en.lower()] = zh_cand
    except Exception as e:
        pass

print(f"Total pure Chinese official terms indexed: {len(official_dict)}")

# 2. 扫描 5706 个本地全量维基 HTML 页面，提取所有角落的文本
html_files = glob.glob('test/site/*.html')
print(f"Scanning {len(html_files)} offline wiki pages for all untranslated technical texts...")

untranslated_counter = Counter()

# 正则匹配浮层卡片、数据表格、武器挂载、特性
feature_popover_pat = re.compile(r'data-feature-popover=([\'"])(.*?)\1', re.DOTALL)
tag_pat = re.compile(r'<[^>]+>')
svg_pat = re.compile(r'<svg.*?</svg>', re.DOTALL)

# 挂载武器、参数表格行正则
table_row_pat = re.compile(r'<tr[^>]*>(.*?)</tr>', re.DOTALL | re.IGNORECASE)
cell_pat = re.compile(r'<t[dh][^>]*>(.*?)</t[dh]>', re.DOTALL | re.IGNORECASE)

scanned = 0
for f in html_files:
    scanned += 1
    if scanned % 1000 == 0:
        print(f"  Processed {scanned}/{len(html_files)} files...")
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            c = fp.read()

        # A. 提取 data-feature-popover 中的全部技术文本
        if 'data-feature-popover' in c:
            for _, raw_pop in feature_popover_pat.findall(c):
                dec = html.unescape(raw_pop)
                dec = svg_pat.sub('', dec)
                text_clean = tag_pat.sub('\n', dec)
                for line in text_clean.split('\n'):
                    line = line.replace('\xa0', ' ').strip()
                    line = re.sub(r'\s+', ' ', line)
                    if line and len(line) > 1 and re.search(r'[a-zA-Z]', line):
                        untranslated_counter[line] += 1

        # B. 提取所有参数表格单元格文本（性能、武器、挂载）
        if 'game-unit' in c or 'wikitable' in c:
            for row_html in table_row_pat.findall(c):
                cells = cell_pat.findall(row_html)
                for cell in cells:
                    cell_text = tag_pat.sub('', html.unescape(cell)).replace('\xa0', ' ').strip()
                    cell_text = re.sub(r'\s+', ' ', cell_text)
                    if cell_text and len(cell_text) > 1 and len(cell_text) < 100 and re.search(r'[a-zA-Z]', cell_text):
                        # 过滤掉已经是中文或纯数字链接的文本
                        if not any('\u4e00' <= char <= '\u9fff' for char in cell_text):
                            untranslated_counter[cell_text] += 1

    except Exception:
        pass

print(f"Scan complete. Total unique raw candidate texts mined: {len(untranslated_counter)}")

# 3. 将挖掘出的文本与官方词典做全量对齐
aligned_dict = {}
for text, freq in untranslated_counter.most_common():
    # 纯英文数字判断
    if text in official_dict:
        aligned_dict[text] = official_dict[text]
    elif text.lower() in official_dict:
        aligned_dict[text] = official_dict[text.lower()]
    elif text.endswith(':') and text[:-1].strip() in official_dict:
        aligned_dict[text] = official_dict[text[:-1].strip()] + '：'

print(f"Directly matched {len(aligned_dict)} untranslated terms against official War Thunder client!")

# 保存匹配结果
with open('tools/all_wiki_mined_official_matches.json', 'w', encoding='utf-8') as f:
    json.dump(aligned_dict, f, ensure_ascii=False, indent=2)

# 保存未匹配但高频的条目以供模式规则分析
unmatched = {t: c for t, c in untranslated_counter.most_common(1000) if t not in aligned_dict}
with open('tools/top_unmatched_wiki_terms.json', 'w', encoding='utf-8') as f:
    json.dump(unmatched, f, ensure_ascii=False, indent=2)

print("Saved mined official matches to tools/all_wiki_mined_official_matches.json")
print("Top 50 high-frequency unmatched terms saved to tools/top_unmatched_wiki_terms.json for rule enhancement.")
