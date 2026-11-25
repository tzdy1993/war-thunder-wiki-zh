# -*- coding: utf-8 -*-
"""全量导出战雷语言包官方简中译名 → wt-zh-all.csv
数据源优先级：E:\\SteamLibrary\\steamapps\\common\\War Thunder\\lang.vromfs.bin (最新 2.61+) → 本机 lang/
列: type(unit/weapon/mod), id, en, cn
用法: python export_all.py
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path

from vromfs_lang import clean_text, load_csv

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = Path(__file__).resolve().parent
OUT = HERE / "wt-zh-all.csv"


def dump(fn: str, ctype: str) -> list[tuple[str, str, str, str]]:
    out = []
    _hdr, zh_idx, rows = load_csv(fn)
    if zh_idx < 0:
        return out
    for row in rows:
        if len(row) <= zh_idx:
            continue
        out.append((ctype, row[0], clean_text(row[1]), clean_text(row[zh_idx])))
    return out


def main() -> None:
    rows = []
    rows += dump("units.csv", "unit")
    rows += dump("units_weaponry.csv", "weapon")
    rows += dump("units_modifications.csv", "mod")
    with OUT.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["type", "id", "en", "cn"])
        w.writerows(rows)
    print(f"OK -> {OUT}: {len(rows)} 词条")


if __name__ == "__main__":
    main()
