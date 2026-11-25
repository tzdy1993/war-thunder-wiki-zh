# -*- coding: utf-8 -*-
"""从最新客户端 lang.vromfs.bin（降级到本地 lang/menu.csv）提取官方版本/活动 workshop 词条。"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from vromfs_lang import clean_text, load_csv

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = Path(__file__).resolve().parent


def main() -> None:
    updates = {}
    _hdr, zh_idx, rows = load_csv("menu.csv")
    if zh_idx >= 0:
        for row in rows:
            if len(row) <= zh_idx:
                continue
            uid = row[0].strip('"')
            if not uid.startswith("workshop/"):
                continue
            en = clean_text(row[1].replace("\\n", " ").replace("\n", " ")).strip("'\"")
            cn = clean_text(row[zh_idx].replace("\\n", " ").replace("\n", " "))
            if not en or not cn:
                continue
            updates[en] = cn

    print("total workshop entries:", len(updates))
    out = HERE / "test" / "official-updates.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        json.dump(updates, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
