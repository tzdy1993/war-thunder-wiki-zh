"""核对 FIXED_TRANSLATIONS 与官方语言包：官方有词条的必须用官方译名。
输出差异报告。"""
import csv, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CORE = HERE / 'wt-wiki-zh.core.js'
CSV = HERE / 'wt-zh-all.csv'

MARKER_CHARS = '▂▃▄▅▀◄◔◘◊◗◥◐◌◍◡◢○⋠␗␙␠☢“\uf059'

INTENTIONAL = {
    'Air': '空中',
    'Displacement': '排水量',
    'Flares': '热焰',
    'Mobility': '机动性',
    'SB': '全真',
    'Shenyang': '沈阳',
    'M4A3 (76) W': 'M4A3 (76) W',
    'Machine Gun': '机枪',
    'Machine Guns': '机枪',
    'Boat': '小艇',
    'boat': '小艇',
}


def load_official():
    rows = list(csv.DictReader(open(CSV, encoding='utf-8')))
    official = {}
    for r in rows:
        en = r['en'].replace('\u00a0', ' ').replace('\u200b', '').strip()
        cn = r['cn'].replace('\u200b', '').replace('\u00a0', ' ').strip()
        if not en or not cn:
            continue
        official.setdefault(en, set()).add(cn)
    return official


def main():
    src = CORE.read_text(encoding='utf-8')
    m = re.search(r'const FIXED_TRANSLATIONS = Object\.freeze\((\{.*?\})\);', src, re.S)
    if not m:
        m = re.search(r'const FIXED_TRANSLATIONS = (\{.*?\});', src, re.S)
    keys = re.findall(r"'([^']+)':\s*'([^']*)'", m.group(1)) if m else []
    official = load_official()
    diffs = []
    no_official = 0
    for en, cn in keys:
        if en in INTENTIONAL and INTENTIONAL[en] == cn:
            continue
        if en in official:
            matching = False
            for ocn in official[en]:
                norm_mine = cn.lstrip(MARKER_CHARS).replace(' ', '').replace('（', '(').replace('）', ')')
                norm_official = ocn.lstrip(MARKER_CHARS).replace(' ', '').replace('（', '(').replace('）', ')')
                if norm_mine == norm_official:
                    matching = True
                    break
            if not matching:
                diffs.append((en, cn, official[en]))
        else:
            no_official += 1
    print(f'FIXED total: {len(keys)}, 官方无词条: {no_official}')
    print(f'=== 差异（官方有但译名不同，需修正）: {len(diffs)} ===')
    for en, mine, ocns in sorted(diffs):
        print(f'  {en!r}\n    我的: {mine}\n    官方: {sorted(ocns)}')
    return 0 if len(diffs) == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
