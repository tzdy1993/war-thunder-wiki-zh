#!/usr/bin/env python3
"""
Clean and fuse mined official terms into data/popover_terms.json and wt-zh-all.csv.
Adheres strictly to War Thunder Steam client official Chinese terms.
"""

import os
import glob
import csv
import json
import re
import sys
from pathlib import Path
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
LANG_DIR = Path(r"E:\SteamLibrary\steamapps\common\War Thunder\lang")
MINED_JSON_PATH = ROOT / "tools" / "all_wiki_mined_official_matches.json"
POPOVER_JSON_PATH = ROOT / "data" / "popover_terms.json"
CSV_PATH = ROOT / "wt-zh-all.csv"

# 1. 基础工具函数
def clean_str(t: str) -> str:
    if not t:
        return ""
    t = t.replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
    t = re.sub(r'[\r\n]+', ' ', t)
    t = re.sub(r'\s{2,}', ' ', t).strip()
    return t

# 繁简体转换表
TRAD_TO_SIMP = {
    '彈': '弹', '裝': '装', '藥': '药', '穩': '稳', '脫': '脱', '殻': '壳', '奧': '奥',
    '兒': '儿', '燒': '烧', '護': '护', '門': '门', '發': '发', '體': '体', '擊': '击',
    '戰': '战', '術': '术', '備': '备', '統': '统', '聯': '联', '經': '经', '質': '质',
    '員': '员', '國': '国', '權': '权', '機': '机', '飛': '飞', '艦': '舰', '輛': '辆',
    '壓': '压', '輪': '轮', '線': '线', '儀': '仪', '視': '视', '離': '离', '連': '连',
    '輕': '轻', '轉': '转', '點': '点', '號': '号', '導': '导', '內': '内', '傷': '伤',
    '補': '补', '損': '损', '塊': '块', '組': '组', '側': '侧', '級': '级', '開': '开',
    '關': '关', '電': '电', '測': '测', '距': '距', '鈍': '钝', '鋁': '铝', '黏': '粘',
    '蠟': '蜡', '蘭': '兰', '樹': '树', '脂': '脂'
}

def to_simplified(text: str) -> str:
    if not text:
        return ""
    res = []
    for ch in text:
        res.append(TRAD_TO_SIMP.get(ch, ch))
    t = "".join(res)
    if "中华民国" in t:
        t = t.replace("中华民国", "中国")
    if "中華民國" in t:
        t = t.replace("中華民國", "中国")
    return t

# 常见日语汉字或特征词
JP_KANJI_SET = set('弾砲対戦砕焼夷徹')
JP_KANJI_WORDS = ['装弾筒', '通常弾', 'への改造']

# 法语特征词
FRENCH_TEST_WORDS = ['blindage', 'vitesse', 'munitions', 'recherche', 'achat', 'portée', 'viseur', 'furtif']

# 危险短键与严重歧义/错译条目
COLLISION_BAD_KEYS = {
    # 危险 2 字母缩写
    'SA', 'GB', 'IT', 'DD', 'M8', 'AR',
    # 破坏性语境错译
    'Name', 'SAP', 'AHEAD', 'APC',
    'External tank (100 gal.)', 'External tank (180 gal.)',
    'Sniper', 'Mortar', 'Ammunition', 'SC1000'
}

# 必须纠正为标准官方中文的核心词条 (覆盖误匹配)
OVERRIDE_CORRECTIONS = {
    'Default': '默认',
    'Default:': '默认：',
    'Gunner': '炮手',
    'Commander': '车长',
    'Track': '跟踪',
    'Cannons': '机炮',
    'Rockets': '火箭弹',
    'Armored targets': '穿甲',
    'Armored targets:': '对装甲目标：',
    'Air targets': '对空',
    'Air targets:': '对空：',
    'Ground targets': '对地',
    'Ground targets:': '对地：',
    'Stealth': '匿踪',
    'Stealth:': '匿踪：',
    'Tracers': '曳光',
    'Tracers:': '曳光：',
    'Universal': '通用',
    'Universal:': '通用：',
    'Laser Warning System': '激光告警系统 (LWS)',
    'HE': '高爆弹',
    'HEAT': '破甲弹',
    'APFSDS': '尾翼稳定脱壳穿甲弹',
    'HVAR': '高速航空火箭弹 (HVAR)',
    'HVAR rockets': '高速空射火箭弹 (HVAR)',
    'API': '穿甲燃烧弹',
    'TNT': 'TNT（三硝基甲苯）',
    'OKFOL-20': 'OKFOL-20 炸药',
    'OKFOL': 'OKFOL（钝化奥克托今）',
    'A-IX-1': 'A-IX-1（钝化黑索金）',
    'A-IX-2': 'A-IX-2（含铝钝化黑索金）',
    'HBX': 'HBX（含铝钝化黑索金 加 TNT）',
    'HTA': 'HTA（含铝黑索金 加 TNT）',
    'PBXN-102': 'PBXN-102（聚酯树脂粘结含铝奥克托今）',
    'AMASE': 'AMASE（“阿帕奇”模块化航空器生存能力装置）',
    '76/62 APFSDS': '尾翼稳定脱壳穿甲弹',
    '152 mm HE': '高爆弹',
    '152 mm HEAT-FS': '尾翼稳定破甲弹',
    'MILAN': '米兰',
    'TOW': '“陶”式',
    'HOT': '“霍特”',
}


def load_authoritative_official_csv() -> tuple[dict[str, str], dict[str, str]]:
    """加载 Steam 战雷官方客户端 CSV 中的严格 <Chinese> 列"""
    print(f"Loading authoritative official CSVs from {LANG_DIR}...")
    csv_files = glob.glob(str(LANG_DIR / "*.csv"))
    # 优先载入界面、载具武器、改装件与提示
    ordered_files = sorted(csv_files, key=lambda f: (
        0 if any(k in os.path.basename(f) for k in [
            'menu.csv', 'units_modifications.csv', 'units_weaponry.csv',
            'hud.csv', 'menu_options.csv', 'units.csv'
        ]) else 1
    ))
    
    strict_dict = {}
    lower_dict = {}
    for cf in ordered_files:
        try:
            with open(cf, 'r', encoding='utf-8', errors='ignore') as fp:
                r = csv.reader(fp, delimiter=';')
                header = next(r, None)
                if not header:
                    continue
                try:
                    zh_idx = header.index('<Chinese>')
                except ValueError:
                    continue
                for row in r:
                    if len(row) > zh_idx:
                        en = clean_str(row[1])
                        zh = clean_str(row[zh_idx])
                        clean_en = re.sub(r'<[^>]+>', '', en).strip()
                        clean_zh = re.sub(r'<[^>]+>', '', zh).strip()
                        if clean_en and clean_zh and any('\u4e00' <= c <= '\u9fff' for c in clean_zh):
                            clean_zh = to_simplified(clean_zh)
                            if clean_en not in strict_dict:
                                strict_dict[clean_en] = clean_zh
                            if clean_en.lower() not in lower_dict:
                                lower_dict[clean_en.lower()] = clean_zh
        except Exception as e:
            print(f"Error reading {cf}: {e}")
            
    print(f"Loaded {len(strict_dict)} official terms directly from <Chinese> columns.")
    return strict_dict, lower_dict


def audit_and_clean_entry(raw_k: str, raw_v: str, official_strict: dict[str, str], official_lower: dict[str, str]) -> tuple[str, str, str | None]:
    """审查并清洗单个词条，返回 (clean_k, clean_v, filter_reason)"""
    k = clean_str(raw_k)
    v = clean_str(raw_v)
    
    # 1. 残破键检测
    if len(k) <= 1 or k.lower() in {'t', 't kal alef', 't kal dalet', 't kal gimel'} or k.startswith('t Kal '):
        return k, v, "broken_key"
        
    # 2. 危险短键与破坏性错译检测
    if k in COLLISION_BAD_KEYS:
        return k, v, f"dangerous_or_bad_collision_{k}"
        
    # 3. 核心权威词条纠偏
    if k in OVERRIDE_CORRECTIONS:
        v = OVERRIDE_CORRECTIONS[k]
        return k, v, None

    # 4. 检查是否完全匹配官方 <Chinese> 列
    if k in official_strict:
        v = official_strict[k]
    elif k.endswith(':') and k[:-1].strip() in official_strict:
        v = official_strict[k[:-1].strip()] + '：'
    elif k.lower() in official_lower:
        v = official_lower[k.lower()]
    elif k.endswith(':') and k[:-1].strip().lower() in official_lower:
        v = official_lower[k[:-1].strip().lower()] + '：'

    # 5. 日语假名检测
    if any('\u3040' <= c <= '\u309f' or '\u30a0' <= c <= '\u30ff' for c in v):
        return k, v, "japanese_kana"
        
    # 6. 日语专用汉字与炮弹格式检测
    if any(c in v for c in JP_KANJI_SET) or any(w in v for w in JP_KANJI_WORDS) or v.endswith('弾') or v.endswith('砲弾'):
        return k, v, "japanese_kanji"

    # 7. 法语污染检测
    if any(fw in v.lower() for fw in FRENCH_TEST_WORDS):
        return k, v, "french_word"

    # 8. 繁简转换
    v = to_simplified(v)
    
    # 检查是否还有残存繁体字
    tc_left = [c for c in v if c in '彈裝藥穩脫殼奧兒燒']
    if tc_left:
        return k, v, f"unconverted_traditional_{''.join(tc_left)}"

    # 9. 纯数字/符号过滤
    if not re.search(r'[a-zA-Z\u4e00-\u9fff]', k):
        return k, v, "pure_num_or_punct"

    # 10. 翻译值必须包含中文字符
    if not any('\u4e00' <= c <= '\u9fff' for c in v):
        return k, v, "no_chinese_in_value"

    return k, v, None


def main():
    print("=========================================================")
    print("=== 全量词库审查、清洗与多维融合管道启动 ===")
    print("=========================================================")

    # 1. 加载官方严格 CSV 字典
    official_strict, official_lower = load_authoritative_official_csv()

    # 2. 审查与清洗 tools/all_wiki_mined_official_matches.json
    print(f"\n[1] 正在审查与清洗 {MINED_JSON_PATH}...")
    with open(MINED_JSON_PATH, 'r', encoding='utf-8') as f:
        mined_raw = json.load(f)

    cleaned_mined = {}
    filtered_items = []

    for r_k, r_v in mined_raw.items():
        ck, cv, reason = audit_and_clean_entry(r_k, r_v, official_strict, official_lower)
        if reason:
            filtered_items.append((r_k, r_v, reason))
        else:
            cleaned_mined[ck] = cv

    print(f"  - 原始条目数: {len(mined_raw)}")
    print(f"  - 清洗后纯净有效条目数: {len(cleaned_mined)}")
    print(f"  - 过滤排除的异常词条数: {len(filtered_items)}")

    reason_counts = Counter(r for _, _, r in filtered_items)
    print("  - 异常原因统计:")
    for r, cnt in reason_counts.most_common():
        print(f"      * {r}: {cnt} 条")

    # 写回清洗后的 tools/all_wiki_mined_official_matches.json
    with open(MINED_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(cleaned_mined, f, ensure_ascii=False, indent=2)
    print(f"  - 已将纯净词典写回 {MINED_JSON_PATH}")

    # 3. 清洗并融合到 data/popover_terms.json
    print(f"\n[2] 正在清洗并融合到 {POPOVER_JSON_PATH}...")
    with open(POPOVER_JSON_PATH, 'r', encoding='utf-8') as f:
        popover_raw = json.load(f)

    popover_cleaned = {}
    popover_filtered = []

    # 先清洗原有 popover_terms.json
    for p_k, p_v in popover_raw.items():
        ck, cv, reason = audit_and_clean_entry(p_k, p_v, official_strict, official_lower)
        if reason:
            popover_filtered.append((p_k, p_v, reason))
        else:
            popover_cleaned[ck] = cv

    print(f"  - 原 popover 词表清理: 保留 {len(popover_cleaned)} 条，清除污染 {len(popover_filtered)} 条")

    # 融合 cleaned_mined 中的条目
    new_merged_to_popover = 0
    updated_in_popover = 0
    for mk, mv in cleaned_mined.items():
        if mk not in popover_cleaned:
            popover_cleaned[mk] = mv
            new_merged_to_popover += 1
        else:
            if popover_cleaned[mk] != mv:
                # 优先保留高精度的官方对齐
                popover_cleaned[mk] = mv
                updated_in_popover += 1

    # 最终确保 OVERRIDE_CORRECTIONS 绝对置顶
    for ok, ov in OVERRIDE_CORRECTIONS.items():
        popover_cleaned[ok] = ov

    with open(POPOVER_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(popover_cleaned, f, ensure_ascii=False, indent=2)

    print(f"  - popover_terms.json 融合完成:")
    print(f"      * 新增词条: {new_merged_to_popover} 条")
    print(f"      * 更新对齐: {updated_in_popover} 条")
    print(f"      * 融合后总词条数: {len(popover_cleaned)} 条")

    # 4. 融合到 wt-zh-all.csv
    print(f"\n[3] 正在融合到 {CSV_PATH}...")
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or ['type', 'id', 'en', 'cn']
        rows = list(reader)

    print(f"  - wt-zh-all.csv 当前总行数: {len(rows)}")

    # 建立英文检索索引
    existing_by_en = {}
    for idx, r in enumerate(rows):
        if r['en']:
            existing_by_en.setdefault(r['en'], []).append(idx)

    csv_updated = 0
    csv_added = 0

    # A. 纠正现有行中存在空翻、未翻译或错译的情况
    for mk, mv in cleaned_mined.items():
        if mk in existing_by_en:
            for idx in existing_by_en[mk]:
                curr_cn = clean_str(rows[idx]['cn'])
                # 如果当前为空、未翻译（cn==en）、或者当前有繁体
                if not curr_cn or curr_cn == mk or any(c in '彈裝藥穩脫殼奧兒燒' for c in curr_cn):
                    rows[idx]['cn'] = mv
                    csv_updated += 1
                elif '・' in curr_cn:
                    rows[idx]['cn'] = curr_cn.replace('・', '·')
                    csv_updated += 1

    # B. 对 cleaned_mined 中完全未在 wt-zh-all.csv 出现过的词条进行追加
    for mk, mv in sorted(cleaned_mined.items()):
        if mk not in existing_by_en:
            # 判断类型与 ID 前缀
            row_type = 'mod'
            slug = re.sub(r'[^a-zA-Z0-9_]+', '_', mk.lower()).strip('_')
            row_id = f"wiki/term/{slug}"
            rows.append({
                'type': row_type,
                'id': row_id,
                'en': mk,
                'cn': mv
            })
            existing_by_en[mk] = [len(rows) - 1]
            csv_added += 1

    # 写入规范化 CSV
    with open(CSV_PATH, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            # 清除所有潜在制表符与残余
            r['cn'] = clean_str(r.get('cn', ''))
            r['en'] = clean_str(r.get('en', ''))
            if '・' in r['cn']:
                r['cn'] = r['cn'].replace('・', '·')
            r['cn'] = to_simplified(r['cn'])
            writer.writerow(r)

    print(f"  - wt-zh-all.csv 融合完成:")
    print(f"      * 更新/补全已有未翻译行: {csv_updated} 次")
    print(f"      * 新增全量官方技术词条行: {csv_added} 条")
    print(f"      * 最终行数: {len(rows)}")

    # 5. 生成报告并提示构建
    print("\n[4] 词库清洗与融合全部执行完毕！")


if __name__ == '__main__':
    main()
