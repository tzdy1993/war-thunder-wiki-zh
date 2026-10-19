# -*- coding: utf-8 -*-
"""全量导出战雷语言包官方简中译名 → wt-zh-all.csv
数据源优先级：latest/（gszabi99 解包的 2.57.1.85 语言数据）→ 本机客户端 lang/
列: type(unit/weapon/mod), id, en, cn
用法: python export_all.py
"""
import csv
import os

BASE = 'latest'  # gszabi99 War-Thunder-Datamine 解包数据（2.57.1.85，最新）
if not os.path.isdir(BASE):
    BASE = 'E:/SteamLibrary/steamapps/common/War Thunder/lang'  # 本机客户端（可能旧）
OUT = 'wt-zh-all.csv'


def clean(s):
    # 清理排版分隔符：\t 与零宽空格 U+200B（gszabi99 数据用 U+200B 分隔中文）
    return s.replace('\\t', '').replace('\t', '').replace('\u200b', '').strip()


def dump(fn, ctype):
    out = []
    with open(BASE + '/' + fn, newline='', encoding='utf-8') as f:
        r = csv.reader(f, delimiter=';')
        next(r)
        for row in r:
            if len(row) < 11:
                continue
            out.append((ctype, row[0], clean(row[1]), clean(row[10])))
    return out


def main():
    rows = []
    rows += dump('units.csv', 'unit')
    rows += dump('units_weaponry.csv', 'weapon')
    rows += dump('units_modifications.csv', 'mod')
    with open(OUT, 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['type', 'id', 'en', 'cn'])
        w.writerows(rows)
    print(f'OK -> {OUT}: {len(rows)} 词条')


if __name__ == '__main__':
    main()
