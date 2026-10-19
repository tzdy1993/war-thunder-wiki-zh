#!/usr/bin/env python3
"""页面采样器：抓取代表页面 HTML，提取可见文本，追加快照供审计。

用法: python war-thunder-zh/fetch_pages.py [--pages 1,2,3] [--limit N]
"""

from __future__ import annotations

import argparse
import html
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "test" / "snapshots-all.md"

PAGES = [
    # 首页与分类
    "https://wiki.warthunder.com/",
    "https://wiki.warthunder.com/aviation",
    "https://wiki.warthunder.com/ground",
    "https://wiki.warthunder.com/helicopters",
    "https://wiki.warthunder.com/ships",
    "https://wiki.warthunder.com/boats",
    "https://wiki.warthunder.com/collections",
    "https://wiki.warthunder.com/new",
    "https://wiki.warthunder.com/popular",
    # 资料页：各载具类型
    "https://wiki.warthunder.com/unit/meteor_fmk3",            # 早期喷气
    "https://wiki.warthunder.com/unit/ussr_kv_2_1939",         # 重坦
    "https://wiki.warthunder.com/unit/germ_battleship_gneisenau_380mm",  # 战列舰
    "https://wiki.warthunder.com/unit/ussr_pr_206",            # 鱼雷艇
    "https://wiki.warthunder.com/unit/mi_24v",                 # 武装直升机
    "https://wiki.warthunder.com/unit/fa_18c_early",           # 现代喷气
    "https://wiki.warthunder.com/unit/us_m1a1_hc_usmc",        # 现代坦克
    "https://wiki.warthunder.com/unit/ussr_battlecruiser_sevastopol",  # 战列巡洋舰
    "https://wiki.warthunder.com/unit/spitfire_f22",           # 螺旋桨
    "https://wiki.warthunder.com/unit/ussr_t34_85_1944",       # 中型坦克
    "https://wiki.warthunder.com/unit/germ_leopard_2a5",       # 德系现代坦克
    "https://wiki.warthunder.com/unit/ussr_t80bvm",            # 俄系现代坦克
    "https://wiki.warthunder.com/unit/jp_a5m4",                # 日系战机
    "https://wiki.warthunder.com/unit/us_m4a1",                # 谢尔曼
    "https://wiki.warthunder.com/unit/fr_amx_30_1972",         # 法系
    "https://wiki.warthunder.com/unit/cn_type_99a",            # 中系
    # 文章页（攻略型 + 历史型）
    "https://wiki.warthunder.com/8920-marat-a-naval-stronghold-to-defend-leningrad",
    "https://wiki.warthunder.com/8862-kv-1e-the-soviet-steel-wall",
    "https://wiki.warthunder.com/8538-the-bmpt-terminator-a-guide",
    # 功能页
    "https://wiki.warthunder.com/author_guide",
    "https://wiki.warthunder.com/collections/weapon/20mm_hispano_404",
    "https://wiki.warthunder.com/collections/family/meteor",
    "https://wiki.warthunder.com/collections/update/cbt_aviation",
    # 标签页与视频页
    "https://wiki.warthunder.com/tag/fleet",
    "https://wiki.warthunder.com/video/9001-f-101-voodoo-fighter-that-outlived-its-concept",
]

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def fetch(url: str) -> str:
    result = subprocess.run(
        ["curl", "-s", "-L", "--max-time", "40", "-A", UA, url],
        capture_output=True,
        text=True,
        errors="ignore",
    )
    return result.stdout


def extract_text(page: str) -> list[str]:
    page = re.sub(r"<script.*?</script>", " ", page, flags=re.S | re.I)
    page = re.sub(r"<style.*?</style>", " ", page, flags=re.S | re.I)
    page = re.sub(r"<!--.*?-->", " ", page, flags=re.S)
    page = re.sub(r"<svg.*?</svg>", " ", page, flags=re.S | re.I)
    texts = re.findall(r">([^<>]{2,})<", page)
    lines = []
    for t in texts:
        t = html.unescape(t)
        t = re.sub(r"\s+", " ", t).strip()
        if t and re.search(r"[A-Za-z]", t):
            lines.append(f"- generic: {t}")
    return lines


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pages", help="逗号分隔的页面序号，仅抓取这些")
    parser.add_argument("--limit", type=int, help="抓取前 N 个页面")
    args = parser.parse_args()

    selected = list(enumerate(PAGES))
    if args.pages:
        idx = {int(x) for x in args.pages.split(",")}
        selected = [(i, url) for i, url in selected if i in idx]
    if args.limit:
        selected = selected[: args.limit]

    fetched = 0
    for index, url in selected:
        print(f"[{index}] {url}", file=sys.stderr, flush=True)
        raw = fetch(url)
        if not raw or len(raw) < 2000:
            print(f"  !! fetch failed or too small ({len(raw)})", file=sys.stderr)
            continue
        lines = extract_text(raw)
        with OUT.open("a", encoding="utf-8") as f:
            f.write(f"\n===== PAGE: {url} =====\n")
            f.write("\n".join(lines) + "\n")
        fetched += 1
        print(f"  +{len(lines)} lines", file=sys.stderr)
    print(f"fetched {fetched} pages -> {OUT}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
