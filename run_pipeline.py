#!/usr/bin/env python3
"""war-thunder-zh 汉化管线一键执行：数据源 → 采样 → 审计 → 构建 → 验证。

用法:
  python war-thunder-zh/run_pipeline.py           # 全流程
  python war-thunder-zh/run_pipeline.py --audit   # 仅审计+构建
  python war-thunder-zh/run_pipeline.py --fetch   # 重新爬取全站
  python war-thunder-zh/run_pipeline.py --verify  # 官方译名核对
"""

import html as html_mod
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

HERE = Path(__file__).resolve().parent


def run(cmd: list[str], label: str) -> int:
    print(f"\n=== {label} ===", flush=True)
    result = subprocess.run(cmd, cwd=HERE, encoding='utf-8', errors='replace')
    if result.returncode != 0:
        print(f"!! {label} 失败 (exit {result.returncode})", file=sys.stderr)
    return result.returncode


def extract_popover_data() -> None:
    site = HERE / 'test' / 'site'
    out = HERE / 'test' / 'popover-texts.md'
    count = 0
    if not site.exists():
        print('site 目录不存在，跳过弹窗提取')
        return
    with out.open('w', encoding='utf-8') as f:
        for p in site.glob('*.html'):
            try:
                t = p.read_text(encoding='utf-8', errors='ignore')
            except Exception:
                continue
            for attr in ['data-feature-popover', 'data-bs-content', 'data-bs-title']:
                for m in re.finditer(attr + r'="([^"]*)"', t):
                    content = m.group(1)
                    for _ in range(4):
                        content = html_mod.unescape(content)
                        if '&nbsp;' in content:
                            content = content.replace('&nbsp;', ' ')
                    for part in re.split(r'<[^>]+>', content):
                        part = re.sub(r'\s+', ' ', part).strip()
                        if part and re.search(r'[A-Za-z]{3}', part) and len(part) < 300:
                            f.write(f"- generic: {part}\n")
                            count += 1
    sitef = HERE / 'test' / 'site-texts.md'
    if sitef.exists():
        text = sitef.read_text(encoding='utf-8')
        start = text.find('===== PAGE: https://wiki.warthunder.com/popover-data =====')
        if start != -1:
            text = text[:start]
        text += '\n===== PAGE: https://wiki.warthunder.com/popover-data =====\n' + out.read_text(encoding='utf-8')
        sitef.write_text(text, encoding='utf-8')
    print('popover texts:', count)


def main() -> int:
    args = set(sys.argv[1:])
    only_audit = '--audit' in args
    do_fetch = '--fetch' in args or not (HERE / 'test' / 'site-texts.md').exists()
    do_verify = '--verify' in args or not only_audit

    if do_fetch:
        # 1. 官方数据源（游戏更新后执行）
        if (HERE / 'updates_full.py').exists():
            run([sys.executable, str(HERE / 'updates_full.py')], '提取官方更新名')
        if (HERE / 'unlocks_extract.py').exists():
            run([sys.executable, str(HERE / 'unlocks_extract.py')], '提取官方涂装/贴花词条')
        # 2. 全站爬取（新载具/新内容页）
        if (HERE / 'crawler.py').exists():
            run([sys.executable, str(HERE / 'crawler.py')], '全站爬取')
        # 3. 弹窗数据提取
        print("\n=== 提取弹窗数据 ===")
        extract_popover_data()

    # 4. 构建最新脚本
    if run([sys.executable, str(HERE / 'build_wiki_userscript.py')], '构建脚本') != 0:
        return 1

    # 5. 全量审计（FIX 必须为 0）
    audit = subprocess.run(
        ['node', str(HERE / 'audit_coverage.js'), str(HERE / 'test' / 'site-texts.md')],
        capture_output=True, text=True, cwd=HERE, encoding='utf-8', errors='replace',
    )
    if audit.stdout:
        print(audit.stdout[-2000:])
    if not audit.stdout or 'unique FIX: 0' not in audit.stdout:
        print('!! 审计未归零：请先补词典（官方词条或 add_fixed.py 人工表）', file=sys.stderr)
        return 1

    if do_verify:
        # 6. 官方译名核对（自译 vs 官方差异）
        if run([sys.executable, str(HERE / 'verify_official.py')], '官方译名核对') != 0:
            return 1
        # 6b. 词典冲突检测（Python & JS 双版本）
        if run([sys.executable, str(HERE / 'check_conflicts.py')], '词典冲突检测 (Python)') != 0:
            return 1
        if run(['node', str(HERE / 'check_conflicts.js')], '词典冲突检测 (JS)') != 0:
            return 1

    # 7. 核心测试
    if run(['node', str(HERE / 'wt-wiki-zh.core.test.js')], '核心测试') != 0:
        return 1
    # 8. 语法检查
    if run(['node', '--check', str(HERE / 'wt-wiki-zh.user.js')], '语法检查') != 0:
        return 1
    # 9. 复制成品到工作区根目录
    try:
        shutil.copy(HERE / 'wt-wiki-zh.user.js', HERE.parent / 'wt-wiki-zh.user.js')
    except Exception as e:
        print(f"复制成品到根目录失败: {e}", file=sys.stderr)
    print('\n=== 全部通过，成品已更新 ===')
    return 0


if __name__ == '__main__':
    sys.exit(main())
