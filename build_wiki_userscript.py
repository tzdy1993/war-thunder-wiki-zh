#!/usr/bin/env python3
"""Build the standalone War Thunder Wiki Violentmonkey/Tampermonkey script."""

from __future__ import annotations

import base64
import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
CSV_PATH = HERE / "wt-zh-all.csv"
CORE_PATH = HERE / "wt-wiki-zh.core.js"
OUTPUT_PATH = HERE / "wt-wiki-zh.user.js"

UNLOCKS_PATH = HERE / "test" / "official-unlocks.json"
BASELINE_PATH = HERE / "release" / "wt-wiki-zh-v1.1.0.user.js"

UNIT_MARKER_START = "  // BEGIN GENERATED UNIT TRANSLATIONS"
UNIT_MARKER_END = "  // END GENERATED UNIT TRANSLATIONS"
TERM_MARKER_START = "  // BEGIN GENERATED TERM TRANSLATIONS"
TERM_MARKER_END = "  // END GENERATED TERM TRANSLATIONS"
MAIN_BTN_MARKER_START = "  // BEGIN GENERATED MAIN BUTTON IMAGES"
MAIN_BTN_MARKER_END = "  // END GENERATED MAIN BUTTON IMAGES"

VERSION = "1.3.6"

MARKER_CHARS = '▂▃▄▅▀◄◔◘◊◗◥◐◌◍◡◢○⋠␗␙␠☢“\uf059'
CLEAN_PATTERN = re.compile(r'[\u2580-\u259f\u25a0-\u25ff\u2400-\u243f\u2622\uf000-\uf8ff\ue000-\uf8ff\u22e0]')

# 全面简繁归一映射（防止官方词典或基线里混入繁体字/异体字）
TRAD_MAP = {
    '減速板': '减速板', '雷達': '雷达', '導彈': '导弹', '裝甲': '装甲',
    '飛機': '飞机', '戰鬥機': '战斗机', '魚雷': '鱼雷', '發動機': '发动机',
    '國': '国', '陸': '陆', '軍': '军', '艦': '舰', '掛': '挂', '複': '复',
    '體': '体', '車': '车', '壓': '压', '砲': '炮', '彈': '弹', '弾': '弹',
    '魚': '鱼', '戰': '战', '機': '机', '裝': '装', '減': '减',
}

# 撇号/正则切分历史遗留碎片黑名单与前缀识别
BROKEN_KEYS = {
    't', 't Kal Alef', 't Kal Dalet', 't Kal Gimel',
    'type', 'mod', 'GB', 'SA', 'id', 'CLIPPED_LANG_KEEP_IT_ALWAYS_FIRST',
    'am Sagol', 'll Repair Everything!', 're used.',
}
# 历史 extract_baseline 双引号正则在包含未转义/嵌套引号时的断片特征
QUOTE_FRAG_PREFIX_RE = re.compile(r'^(?:s|d|t|ll|ve|re|am)\s+[A-Za-z]', re.IGNORECASE)
LEADING_SPACE_FRAG_RE = re.compile(r'^\s+')


def clean(value: str) -> str:
    if not value:
        return ""
    v = value.replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
    v = v.replace("\u00a0", " ").replace("\u200b", "")
    return " ".join(v.split()).strip()


def strip_all_markers(value: str) -> str:
    """彻底剥离客户端国别标记、控制字符、制表符与私有区Unicode字符"""
    v = CLEAN_PATTERN.sub('', value)
    v = v.replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
    return v.strip(MARKER_CHARS).strip()


def normalize_cn_text(value: str) -> str:
    v = strip_all_markers(value)
    v = v.replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
    v = v.replace('\n', ' ').replace(r'\n', ' ')
    v = re.sub(r'\s{2,}', ' ', v).strip()
    # 先用占位符保护刻意使用繁体区分的中华民国/ROC 专名，避免被后续 TRAD_MAP 误伤
    v = v.replace("中國陸軍兵工署", "__WT_ROC_ORDC__")
    v = v.replace("中华民国陆军兵工署", "__WT_ROC_ORDC__")
    v = v.replace("中華民國陸軍兵工署", "__WT_ROC_ORDC__")
    v = v.replace("中國空軍", "__WT_ROC_AF__")
    v = v.replace("中华民国", "__WT_ROC_ZH__")
    v = v.replace("中華民國", "__WT_ROC_ZH__")
    v = v.replace("中國", "__WT_ROC_ZH__")
    for t_k, t_v in TRAD_MAP.items():
        if t_k in v:
            v = v.replace(t_k, t_v)
    v = v.replace("__WT_ROC_ORDC__", "中國陸軍兵工署")
    v = v.replace("__WT_ROC_AF__", "中國空軍")
    v = v.replace("__WT_ROC_ZH__", "中國")
    return v


def norm_cn_stripped(value: str) -> str:
    """中文归一：去标记符号与标点差异后比较一致性。"""
    v = strip_all_markers(value)
    return "".join(
        v.replace("\u00a0", " ")
        .replace("\u200b", "")
        .replace("“", "")
        .replace("”", "")
        .replace('"', "")
        .replace("（", "(")
        .replace("）", ")")
        .split()
    )


def pick_cn(counter: "Counter[str]") -> str | None:
    """加权归一选择最佳中文译名：无候选返回 None。"""
    if not counter:
        return None
    counts: Counter[str] = Counter()
    for chinese, n in counter.items():
        counts[norm_cn_stripped(chinese)] += n
    top, _n = counts.most_common(1)[0]
    candidates = [cn for cn in counter if norm_cn_stripped(cn) == top]
    candidates.sort(key=lambda cn: (
        len(cn) != len(strip_all_markers(cn)),
        -counter[cn],
        len(cn)
    ))
    return strip_all_markers(candidates[0])


def clean_english(value: str) -> str:
    value = strip_all_markers(value)
    return re.sub(r"\bMk\.\s*", "Mk ", clean(value), flags=re.IGNORECASE)


def unit_slug(identifier: str) -> str:
    slug = identifier.rsplit("/", 1)[-1].lower()
    return re.sub(r"_(?:shop|\d+)$", "", slug)


def load_indexes() -> tuple[dict[str, str], dict[str, str], dict[str, str]]:
    units: dict[str, list[tuple[int, str]]] = defaultdict(list)
    unit_names: dict[str, Counter] = defaultdict(Counter)
    terms: dict[str, Counter] = defaultdict(Counter)

    with CSV_PATH.open(newline="", encoding="utf-8") as stream:
        for row in csv.DictReader(stream):
            chinese = clean(row["cn"])
            english = clean_english(row["en"])
            if not chinese:
                continue
            if row["type"] == "unit":
                priority = 0 if row["id"].endswith("_shop") else 1
                units[unit_slug(row["id"])].append((priority, chinese))
                if english:
                    weight = 3 if row["id"].endswith("_shop") else 1
                    unit_names[english][chinese] += weight
            elif row["type"] in {"weapon", "mod"} and english:
                weight = 2 if not row["id"].endswith("/short") else 1
                terms[english][chinese] += weight

    unit_index = {
        slug: strip_all_markers(sorted(values, key=lambda item: (item[0], item[1]))[0][1])
        for slug, values in sorted(units.items())
    }
    unit_name_index = {
        english: strip_all_markers(cn)
        for english, values in sorted(unit_names.items())
        if (cn := pick_cn(values)) is not None
    }
    term_index = {
        english: strip_all_markers(cn)
        for english, values in sorted(terms.items())
        if (cn := pick_cn(values)) is not None
    }
    return unit_index, unit_name_index, term_index


def js_object(name: str, values: dict[str, str]) -> str:
    lines = [f"  const {name} = Object.freeze({{"]
    for k, v in sorted(values.items()):
        clean_k = json.dumps(k, ensure_ascii=False)
        clean_v = json.dumps(v, ensure_ascii=False)
        lines.append(f"    {clean_k}: {clean_v},")
    lines.append("  });")
    return "\n".join(lines)


def replace_between(source: str, start: str, end: str, body: str) -> str:
    start_index = source.index(start)
    end_index = source.index(end, start_index) + len(end)
    return source[:start_index] + start + "\n" + body + "\n" + source[end_index:]


def is_broken_fragment_key(k: str) -> bool:
    if not k or len(k.strip()) <= 1:
        return True
    if k in BROKEN_KEYS or k.startswith("t Kal "):
        return True
    if QUOTE_FRAG_PREFIX_RE.match(k):
        return True
    if LEADING_SPACE_FRAG_RE.match(k):
        return True
    return False


def extract_baseline(code: str, name: str) -> dict[str, str]:
    """用标准 JSON 解析基线脚本中的 Object.freeze 字典，彻底消除正则切分导致的单引号碎片键。"""
    m = re.search(rf'const {name} = Object\.freeze\((\{{[\s\S]*?\}})\);', code)
    if not m:
        m = re.search(rf'const {name} = (\{{[\s\S]*?\}});\n', code)
    if not m:
        return {}
    raw_obj = re.sub(r',\s*\}$', '\n}', m.group(1).strip())
    try:
        parsed = json.loads(raw_obj)
    except json.JSONDecodeError:
        return {}
    res = {}
    for k, v in parsed.items():
        if not isinstance(k, str) or not isinstance(v, str):
            continue
        if is_broken_fragment_key(k):
            continue
        res[k] = v
    return res


def sanitize_dict(d: dict[str, str], label: str) -> None:
    french_test_words = {'Furtif', 'Blindage', 'Vitesse', 'Munitions', 'Recherche', 'Achat', 'Portée', 'Viseur'}
    has_han_re = re.compile(r'[\u4e00-\u9fff]')
    for k in list(d.keys()):
        if is_broken_fragment_key(k):
            d.pop(k, None)
            continue
        cleaned_v = normalize_cn_text(d[k])
        if not cleaned_v:
            d.pop(k, None)
            continue
        # 仅在词条 value 上检查法语污染（若含法语词且无任何汉字，丢弃并告警，不破坏源码）
        if not has_han_re.search(cleaned_v) and any(fw in cleaned_v for fw in french_test_words):
            print(f"WARNING: Dropped French-polluted entry in {label}: {k!r} -> {cleaned_v!r}")
            d.pop(k, None)
            continue
        d[k] = cleaned_v


def main() -> None:
    unit_index, unit_name_index, term_index = load_indexes()
    unlocks: dict[str, str] = {}

    if BASELINE_PATH.exists():
        base_code = BASELINE_PATH.read_text(encoding="utf-8")
        base_units = extract_baseline(base_code, "UNIT_TRANSLATIONS")
        base_unit_names = extract_baseline(base_code, "UNIT_NAME_TRANSLATIONS")
        base_terms = extract_baseline(base_code, "TERM_TRANSLATIONS")
        base_unlocks = extract_baseline(base_code, "UNLOCKS_TRANSLATIONS")

        full_units = dict(base_units)
        full_units.update(unit_index)
        unit_index = full_units

        full_unit_names = dict(base_unit_names)
        full_unit_names.update(unit_name_index)
        unit_name_index = full_unit_names

        full_terms = dict(base_terms)
        full_terms.update(term_index)
        term_index = full_terms

        unlocks.update(base_unlocks)

    mfg_json_path = HERE / "data" / "manufacturers.json"
    if mfg_json_path.exists():
        CHINESE_MANUFACTURERS = json.loads(mfg_json_path.read_text(encoding="utf-8"))
    else:
        CHINESE_MANUFACTURERS = {
            'Chengdu': '航空工业成飞',
            'CAIG': '航空工业成飞',
            'Shenyang': '航空工业沈飞',
            "Xi'an": '航空工业西飞',
            'Hongdu': '航空工业洪都',
            'Nanchang': '航空工业洪都',
            'Hafei': '航空工业哈飞',
            'Harbin': '航空工业哈飞',
            'Changhe': '航空工业昌飞',
            'CAIC': '航空工业昌飞',
            'Shaanxi': '航空工业陕飞',
            'Guizhou': '航空工业贵飞',
            'Shijiazhuang': '航空工业通飞华北',
            'AVIC': '中国航空工业集团',
            'Avic': '中国航空工业集团',
            'NORINCO': '中国兵器工业集团',
            'Norinco': '中国兵器工业集团',
            '北方工业': '中国兵器工业集团',
        }
    for m_k, m_v in CHINESE_MANUFACTURERS.items():
        if m_k in term_index:
            term_index[m_k] = m_v
        if m_k in unit_name_index:
            unit_name_index[m_k] = m_v

    term_index['Republic of China'] = '中國'
    unit_name_index['Republic of China'] = '中國'
    term_index['Republic of China Air Force'] = '中國空軍'
    term_index['ROCA ORDC'] = '中國陸軍兵工署'
    unit_name_index['ROCA ORDC'] = '中國陸軍兵工署'

    popover_json_path = HERE / "data" / "popover_terms.json"
    if popover_json_path.exists():
        popover_terms = json.loads(popover_json_path.read_text(encoding="utf-8"))
        for p_k, p_v in popover_terms.items():
            clean_k = strip_all_markers(p_k)
            clean_v = normalize_cn_text(p_v)
            if clean_k and clean_v:
                term_index[clean_k] = clean_v

    if UNLOCKS_PATH.exists():
        unlocks_raw = json.loads(UNLOCKS_PATH.read_text(encoding="utf-8"))
        for k, v in unlocks_raw.items():
            clean_k = strip_all_markers(
                k.replace(r'\t', ' ').replace('\t', ' ').replace(r'\n', ' ').replace('\n', ' ').strip()
            )
            clean_v = normalize_cn_text(v)
            if clean_k and clean_v:
                unlocks[clean_k] = clean_v

    sanitize_dict(unit_index, "UNIT_TRANSLATIONS")
    sanitize_dict(unit_name_index, "UNIT_NAME_TRANSLATIONS")
    sanitize_dict(term_index, "TERM_TRANSLATIONS")
    sanitize_dict(unlocks, "UNLOCKS_TRANSLATIONS")

    # 确保 Sho't 系列载具正确映射
    unit_name_index["Sho't"] = "绍特"
    unit_name_index["Sho't Kal Alef"] = "绍特卡尔 A"
    unit_name_index["Sho't Kal Dalet"] = "绍特卡尔 D"
    unit_name_index["Sho't Kal Gimel"] = "绍特卡尔 C"

    core = CORE_PATH.read_text(encoding="utf-8")
    core = replace_between(
        core,
        UNIT_MARKER_START,
        UNIT_MARKER_END,
        js_object("UNIT_TRANSLATIONS", unit_index) + "\n" + js_object("UNIT_NAME_TRANSLATIONS", unit_name_index),
    )
    core = replace_between(
        core,
        TERM_MARKER_START,
        TERM_MARKER_END,
        js_object("TERM_TRANSLATIONS", term_index),
    )
    if unlocks:
        core = replace_between(
            core,
            "  // BEGIN GENERATED UNLOCKS TRANSLATIONS",
            "  // END GENERATED UNLOCKS TRANSLATIONS",
            js_object("UNLOCKS_TRANSLATIONS", unlocks),
        )
        print(f"unlock entries: {len(unlocks)}")

    main_btn_files = {
        "/aviation": "main_button_aircraft_zh.webp",
        "/helicopters": "main_button_helicopter_zh.webp",
        "/ground": "main_button_tank_zh.webp",
        "/ships": "main_button_ship_zh.webp",
        "/boats": "main_button_boat_zh.webp",
    }
    main_btn_images: dict[str, str] = {}
    main_btn_dir = HERE / "assets" / "main_button"
    for route, fname in main_btn_files.items():
        fpath = main_btn_dir / fname
        if fpath.exists():
            b64 = base64.b64encode(fpath.read_bytes()).decode("ascii")
            main_btn_images[route] = f"data:image/webp;base64,{b64}"
    core = replace_between(
        core,
        MAIN_BTN_MARKER_START,
        MAIN_BTN_MARKER_END,
        js_object("MAIN_BUTTON_IMAGES", main_btn_images),
    )
    print(f"main button images: {len(main_btn_images)}")

    header = f"""// ==UserScript==
// @name         战争雷霆维基汉化 (War Thunder Wiki)
// @namespace    https://github.com/tzdy1993/war-thunder-wiki-zh
// @version      {VERSION}
// @description  为 War Thunder 维基提供界面、科技树与载具武器参数的简体中文汉化，支持双向切换。
// @author       tzdy1993
// @tag          战争雷霆
// @tag          War Thunder
// @license      MIT
// @match        https://wiki.warthunder.com/*
// @updateURL    https://raw.githubusercontent.com/tzdy1993/war-thunder-wiki-zh/main/wt-wiki-zh.user.js
// @downloadURL  https://raw.githubusercontent.com/tzdy1993/war-thunder-wiki-zh/main/wt-wiki-zh.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

"""
    full_script = header + core
    OUTPUT_PATH.write_text(full_script, encoding="utf-8", newline="\n")
    print(f"wrote {OUTPUT_PATH}")

    release_dir = HERE / "release"
    if release_dir.exists():
        (release_dir / "wt-wiki-zh.user.js").write_text(full_script, encoding="utf-8", newline="\n")
        (release_dir / f"wt-wiki-zh-v{VERSION}.user.js").write_text(full_script, encoding="utf-8", newline="\n")
        print(f"synced to {release_dir / 'wt-wiki-zh.user.js'} & {release_dir / f'wt-wiki-zh-v{VERSION}.user.js'}")

    print(f"unit entries: {len(unit_index)}")
    print(f"unit name entries: {len(unit_name_index)}")
    print(f"weapon/mod entries: {len(term_index)}")
    print(f"bytes: {OUTPUT_PATH.stat().st_size}")


if __name__ == "__main__":
    main()
