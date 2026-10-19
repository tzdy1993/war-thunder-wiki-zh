#!/usr/bin/env python3
"""Build the standalone War Thunder Wiki Violentmonkey/Tampermonkey script."""

from __future__ import annotations

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

UNIT_MARKER_START = "  // BEGIN GENERATED UNIT TRANSLATIONS"
UNIT_MARKER_END = "  // END GENERATED UNIT TRANSLATIONS"
TERM_MARKER_START = "  // BEGIN GENERATED TERM TRANSLATIONS"
TERM_MARKER_END = "  // END GENERATED TERM TRANSLATIONS"


MARKER_CHARS = '▂▃▄▅▀◄◔◘◊◗◥◐◌◍◡◢○⋠␗␙␠☢“\uf059'
CLEAN_PATTERN = re.compile(r'[\u2580-\u259f\u25a0-\u25ff\u2400-\u243f\u2622\uf000-\uf8ff\ue000-\uf8ff\u22e0]')


def clean(value: str) -> str:
    if not value:
        return ""
    # 彻底清除字面量反斜杠+t以及真实制表符、回车
    v = value.replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
    v = v.replace("\u00a0", " ").replace("\u200b", "")
    return " ".join(v.split()).strip()


def strip_all_markers(value: str) -> str:
    """彻底剥离客户端国别标记、控制字符、制表符与私有区Unicode字符"""
    v = CLEAN_PATTERN.sub('', value)
    v = v.replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
    return v.strip(MARKER_CHARS).strip()


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


def pick_cn(counter: "collections.Counter[str]") -> str | None:
    """加权归一选择最佳中文译名：无候选返回 None。"""
    if not counter:
        return None
    counts: Counter[str] = Counter()
    for chinese, n in counter.items():
        counts[norm_cn_stripped(chinese)] += n
    top, n = counts.most_common(1)[0]
    candidates = [cn for cn in counter if norm_cn_stripped(cn) == top]
    # 优先无国别前缀、加权票数最高、最标准简短的表示
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


BASELINE_PATH = HERE / "release" / "wt-wiki-zh-v1.1.0.user.js"


def extract_baseline(code: str, name: str) -> dict[str, str]:
    m = re.search(rf'const {name} = Object\.freeze\((\{{[\s\S]*?\}})\);', code)
    if not m:
        return {}
    res = {}
    for kv in re.finditer(r'["\']([^"\']+)["\']\s*:\s*["\']([^"\']*)["\']', m.group(1)):
        res[kv.group(1)] = kv.group(2)
    return res


def main() -> None:
    unit_index, unit_name_index, term_index = load_indexes()
    unlocks = {}

    if BASELINE_PATH.exists():
        base_code = BASELINE_PATH.read_text(encoding="utf-8")
        base_units = extract_baseline(base_code, "UNIT_TRANSLATIONS")
        base_unit_names = extract_baseline(base_code, "UNIT_NAME_TRANSLATIONS")
        base_terms = extract_baseline(base_code, "TERM_TRANSLATIONS")
        base_unlocks = extract_baseline(base_code, "UNLOCKS_TRANSLATIONS")

        # 彻底剿灭历史遗留的残破键（如 Sho't 引发的 "t": "绍特"）
        BROKEN_KEYS = {'t', 't Kal Alef', 't Kal Dalet', 't Kal Gimel'}
        for bk in BROKEN_KEYS:
            base_unit_names.pop(bk, None)
            base_terms.pop(bk, None)

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
        import json as _json
        CHINESE_MANUFACTURERS = _json.loads(mfg_json_path.read_text(encoding="utf-8"))
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
            'Shaanxi': '航空工业陕飞',
            'Guizhou': '航空工业贵飞',
            'NORINCO': '中国兵器工业集团',
            'Norinco': '中国兵器工业集团',
            '北方工业': '中国兵器工业集团',
        }
    for m_k, m_v in CHINESE_MANUFACTURERS.items():
        if m_k in term_index:
            term_index[m_k] = m_v
        if m_k in unit_name_index:
            unit_name_index[m_k] = m_v

    term_index['Republic of China'] = '中国'
    unit_name_index['Republic of China'] = '中国'
    term_index['ROCA ORDC'] = '中国陆军兵工署'
    unit_name_index['ROCA ORDC'] = '中国陆军兵工署'

    popover_json_path = HERE / "data" / "popover_terms.json"
    if popover_json_path.exists():
        import json as _json
        popover_terms = _json.loads(popover_json_path.read_text(encoding="utf-8"))
        for p_k, p_v in popover_terms.items():
            clean_k = strip_all_markers(p_k)
            clean_v = strip_all_markers(p_v)
            clean_k = clean_k.replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
            clean_v = clean_v.replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
            clean_v = re.sub(r'\s{2,}', ' ', clean_v)
            if "中华民国" in clean_v:
                clean_v = clean_v.replace("中华民国", "中国")
            if clean_k and clean_v:
                term_index[clean_k] = clean_v

    BROKEN_KEYS = {
        't', 't Kal Alef', 't Kal Dalet', 't Kal Gimel',
        'type', 'mod', 'GB', 'SA', 'id', 'CLIPPED_LANG_KEEP_IT_ALWAYS_FIRST'
    }
    for d in (unit_index, unit_name_index, term_index):
        for k in list(d.keys()):
            # 彻底禁止单字母、危险短键或残破键进入字典
            if len(k.strip()) <= 1 or k in BROKEN_KEYS or k.startswith('t Kal '):
                d.pop(k, None)
                continue
            v = d[k]
            # 彻底清洗所有反斜杠+t与真实制表符
            cleaned_v = v.replace(r'\t', '').replace('\t', '').replace(r'\r', '').replace('\r', '')
            cleaned_v = re.sub(r'\s{2,}', ' ', cleaned_v)
            if "中华民国" in cleaned_v:
                cleaned_v = cleaned_v.replace("中华民国", "中国")
            TRAD_MAP = {
                '副翼': '副翼', '升降舵': '升降舵', '方向舵': '方向舵', '襟翼': '襟翼',
                '減速板': '减速板', '雷達': '雷达', '導彈': '导弹', '裝甲': '装甲',
                '飛機': '飞机', '戰鬥機': '战斗机', '魚雷': '鱼雷', '發動機': '发动机',
                '魚': '鱼', '戰': '战', '機': '机', '彈': '弹', '裝': '装', '減': '减'
            }
            for t_k, t_v in TRAD_MAP.items():
                if t_k in cleaned_v:
                    cleaned_v = cleaned_v.replace(t_k, t_v)
            d[k] = cleaned_v

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
    if UNLOCKS_PATH.exists():
        import json as _json
        unlocks_raw = _json.loads(UNLOCKS_PATH.read_text(encoding="utf-8"))
        for k, v in unlocks_raw.items():
            clean_k = k.replace(r'\t', ' ').replace('\t', ' ').replace(r'\n', ' ').replace('\n', ' ').strip()
            clean_v = v.replace(r'\t', '').replace('\t', '').replace(r'\n', ' ').replace('\n', ' ').replace('\r', '').strip()
            clean_k = strip_all_markers(clean_k)
            clean_v = strip_all_markers(clean_v)
            for t_k, t_v in TRAD_MAP.items():
                if t_k in clean_v:
                    clean_v = clean_v.replace(t_k, t_v)
            if clean_k and clean_v:
                unlocks[clean_k] = clean_v
        for k in list(unlocks.keys()):
            if "中华民国" in unlocks[k]:
                unlocks[k] = unlocks[k].replace("中华民国", "中國")
        core = replace_between(
            core,
            "  // BEGIN GENERATED UNLOCKS TRANSLATIONS",
            "  // END GENERATED UNLOCKS TRANSLATIONS",
            js_object("UNLOCKS_TRANSLATIONS", unlocks),
        )
        print(f"unlock entries: {len(unlocks)}")

    # 严密反外语污染校验
    french_test_words = ['Furtif', 'Blindage', 'Vitesse', 'Munitions', 'Recherche', 'Achat', 'Portée', 'Viseur']
    for fw in french_test_words:
        if fw in core:
            print(f"WARNING: Detected French pollution word '{fw}' in generated core, sanitizing...")
            core = re.sub(rf'["\'][^"\']*{fw}[^"\']*["\']', '""', core)

    header = """// ==UserScript==
// @name         战争雷霆维基汉化 (War Thunder Wiki)
// @namespace    https://github.com/tzdy1993/war-thunder-wiki-zh
// @version      1.2.5
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

    # 同步更新 release 目录下的成品脚本
    release_dir = HERE / "release"
    if release_dir.exists():
        (release_dir / "wt-wiki-zh.user.js").write_text(full_script, encoding="utf-8", newline="\n")
        (release_dir / "wt-wiki-zh-v1.2.5.user.js").write_text(full_script, encoding="utf-8", newline="\n")
        print(f"synced to {release_dir / 'wt-wiki-zh.user.js'}")

    print(f"unit entries: {len(unit_index)}")
    print(f"unit name entries: {len(unit_name_index)}")
    print(f"weapon/mod entries: {len(term_index)}")
    print(f"bytes: {OUTPUT_PATH.stat().st_size}")


if __name__ == "__main__":
    main()
