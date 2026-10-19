# -*- coding: utf-8 -*-
"""战雷官方简中译名查询工具（基于全量译名库 wt-zh-all.csv）
用法:
  python zhlookup.py <关键词>          # 模糊搜 ID 或英文名，显示官方简中
  python zhlookup.py <关键词> --cn     # 反向：搜中文名
  python zhlookup.py <关键词> --t      # 限定载具 unit
  python zhlookup.py <关键词> --w      # 限定武器 weapon
  python zhlookup.py <关键词> --m      # 限定改装件 mod
  python zhlookup.py <关键词> --all    # 显示全部匹配（默认前 20 条）
"""
import csv
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, 'wt-zh-all.csv')

TYPE_CN = {'unit': '载具', 'weapon': '武器', 'mod': '改装件'}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = set(a for a in sys.argv[1:] if a.startswith('--'))
    if not args:
        print(__doc__)
        return
    kw = args[0].lower()
    limit = None if '--all' in flags else 20
    tfilter = None
    if '--t' in flags:
        tfilter = 'unit'
    elif '--w' in flags:
        tfilter = 'weapon'
    elif '--m' in flags:
        tfilter = 'mod'

    n = 0
    with open(DB, newline='', encoding='utf-8') as f:
        r = csv.reader(f)
        next(r)
        for t, uid, en, cn in r:
            if tfilter and t != tfilter:
                continue
            if '--cn' in flags:
                hit = kw in cn.lower()
            else:
                hit = kw in uid.lower() or kw in en.lower()
            if hit:
                print(f'[{TYPE_CN.get(t, t)}] {uid} | EN: {en} | CN: {cn}')
                n += 1
                if limit and n >= limit:
                    break
    if n == 0:
        print(f'无匹配: {kw}')


if __name__ == '__main__':
    main()
