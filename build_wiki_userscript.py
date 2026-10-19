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
    return " ".join(value.replace("\u00a0", " ").replace("\u200b", "").split()).strip()


def strip_all_markers(value: str) -> str:
    """彻底剥离客户端国别标记、控制字符与私有区Unicode字符"""
    v = CLEAN_PATTERN.sub('', value)
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
            if clean_k and clean_v:
                unlocks[clean_k] = clean_v
        core = replace_between(
            core,
            "  // BEGIN GENERATED UNLOCKS TRANSLATIONS",
            "  // END GENERATED UNLOCKS TRANSLATIONS",
            js_object("UNLOCKS_TRANSLATIONS", unlocks),
        )
        print(f"unlock entries: {len(unlocks)}")

    header = """// ==UserScript==
// @name         战争雷霆维基汉化 (War Thunder Wiki)
// @namespace    https://github.com/tzdy1993/war-thunder-wiki-zh
// @version      1.2.1
// @description  为 War Thunder 维基提供界面、科技树与载具武器参数的简体中文汉化，支持双向切换。
// @author       tzdy1993
// @tag          战争雷霆
// @license      MIT
// @match        https://wiki.warthunder.com/*
// @updateURL    https://raw.githubusercontent.com/tzdy1993/war-thunder-wiki-zh/main/wt-wiki-zh.user.js
// @downloadURL  https://raw.githubusercontent.com/tzdy1993/war-thunder-wiki-zh/main/wt-wiki-zh.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

"""
    OUTPUT_PATH.write_text(header + core, encoding="utf-8", newline="\n")
    print(f"wrote {OUTPUT_PATH}")
    print(f"unit entries: {len(unit_index)}")
    print(f"unit name entries: {len(unit_name_index)}")
    print(f"weapon/mod entries: {len(term_index)}")
    print(f"bytes: {OUTPUT_PATH.stat().st_size}")


if __name__ == "__main__":
    main()
