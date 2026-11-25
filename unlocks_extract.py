# -*- coding: utf-8 -*-
"""从最新客户端 lang.vromfs.bin（降级到本地 lang/）提取解锁/涂装/贴花/勋章官方简中词条。"""

from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

from vromfs_lang import clean_text, load_csv

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = Path(__file__).resolve().parent
FILES = [
    "unlocks_skins.csv",
    "unlocks_decals.csv",
    "unlocks_medals.csv",
    "unlocks_conditions.csv",
    "unlocks_challenges.csv",
    "unlocks_achievements.csv",
    "unlocks_attachables.csv",
]


def main() -> None:
    by_en: dict[str, Counter[str]] = defaultdict(Counter)
    for fn in FILES:
        _hdr, zh_idx, rows = load_csv(fn)
        if zh_idx < 0:
            continue
        for row in rows:
            if len(row) <= zh_idx:
                continue
            en = clean_text(row[1].replace("\\n", " ").replace("\n", " "))
            cn = clean_text(row[zh_idx].replace("\\n", " ").replace("\n", " "))
            if "中华民国" in cn:
                cn = cn.replace("中华民国", "中国")
            if "中華民國" in cn:
                cn = cn.replace("中華民國", "中国")
            if not en or not cn or en == cn:
                continue
            if len(en) > 60 or len(cn) > 60:
                continue
            by_en[en][cn] += 1

    result = {}
    for en, counts in by_en.items():
        top, n = counts.most_common(1)[0]
        if n == 1 and len(counts) > 1:
            continue
        result[en] = top

    print("entries:", len(result))
    out = HERE / "test" / "official-unlocks.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
