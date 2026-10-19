#!/usr/bin/env python3
"""全站爬虫：下载 wiki.warthunder.com 全部页面 HTML 到本地，并提取文本供审计。

用法: python war-thunder-zh/crawler.py [--limit N] [--workers 10] [--kind units,posts,...]
"""

from __future__ import annotations

import argparse
import hashlib
import html as html_mod
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

HERE = Path(__file__).resolve().parent
SITE_DIR = HERE / "test" / "site"
TEXT_OUT = HERE / "test" / "site-texts.md"
URLS = HERE / "test" / "all-urls.txt"

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def fetch(url: str, timeout: int = 30) -> str | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception:
        return None


def extract_text(page: str) -> list[str]:
    page = re.sub(r"<script.*?</script>", " ", page, flags=re.S | re.I)
    page = re.sub(r"<style.*?</style>", " ", page, flags=re.S | re.I)
    page = re.sub(r"<!--.*?-->", " ", page, flags=re.S)
    page = re.sub(r"<svg.*?</svg>", " ", page, flags=re.S | re.I)
    texts = re.findall(r">([^<>]{2,})<", page)
    lines = []
    for t in texts:
        t = html_mod.unescape(t)
        t = re.sub(r"\s+", " ", t).strip()
        if t and re.search(r"[A-Za-z]", t):
            lines.append(f"- generic: {t}")
    return lines


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int)
    parser.add_argument("--workers", type=int, default=10)
    parser.add_argument("--kind", help="逗号分隔: units,posts,collections,categories,main")
    args = parser.parse_args()

    urls = URLS.read_text(encoding="utf-8").splitlines()
    if args.kind:
        kinds = set(args.kind.split(","))
        urls = [u for u in urls if any(f"/{k}/" in u or u.rstrip("/").endswith("/" + k) for k in kinds) or u == "https://wiki.warthunder.com/"]
    if args.limit:
        urls = urls[: args.limit]

    SITE_DIR.mkdir(parents=True, exist_ok=True)
    done = 0
    failed = 0
    start = time.time()

    def work(url: str) -> tuple[str, str | None]:
        raw = fetch(url)
        return url, raw

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(work, u): u for u in urls}
        for fut in as_completed(futures):
            url, raw = fut.result()
            done += 1
            if raw is None or len(raw) < 2000:
                failed += 1
                print(f"[{done}/{len(urls)}] FAIL {url}", file=sys.stderr)
                continue
            slug = hashlib.md5(url.encode()).hexdigest()[:16]
            (SITE_DIR / f"{slug}.html").write_text(raw, encoding="utf-8")
            lines = extract_text(raw)
            with TEXT_OUT.open("a", encoding="utf-8") as f:
                f.write(f"\n===== PAGE: {url} =====\n")
                f.write("\n".join(lines) + "\n")
            if done % 50 == 0:
                el = time.time() - start
                print(f"[{done}/{len(urls)}] ok, {el:.0f}s", file=sys.stderr)

    print(f"done {done}, failed {failed}, {time.time()-start:.0f}s", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
