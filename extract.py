# -*- coding: utf-8 -*-
"""从战雷客户端语言包提取官方简中译名，生成对照表。
用法: python extract.py [输出md路径]
数据源: E:\SteamLibrary\steamapps\common\War Thunder\lang\*.csv (列0=ID, 列1=EN, 列10=Chinese)
ID 规律: _0=全名带绰号, _shop=商店短名, _1/_2=短名/家族名
标记符号: ☢=核弹型(killstreak), ▄=子分支, ␗=中国, ◔=?
"""
import csv
import os
import re
import sys

BASE = 'latest'  # gszabi99 解包的 2.57.1.85 语言数据
if not os.path.isdir(BASE):
    BASE = 'E:/SteamLibrary/steamapps/common/War Thunder/lang'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'official-names.md'

# 关键词列表（连字符/下划线两种形式都匹配）: (关键词, 中文说明)
UNIT_KEYS = [
    ('kurnass', 'F-4E 重锤 2000（以色列）'),
    ('f-4e', 'F-4E 鬼怪 II 系列'),
    ('a-4n', 'A-4N 天鹰（以色列）'),
    ('a-6e_tram', 'A-6E TRAM 入侵者'),
    ('a-7e', 'A-7E 海盗 II'),
    ('f-105', 'F-105 雷公'),
    ('f-111a', 'F-111A 土豚'),
    ('buccaneer', '掠夺者系列'),
    ('jaguar_a', '美洲虎 A'),
    ('su-22m3', '苏-22M3'),
    ('tornado_gr', '狂风 GR 系列'),
    ('f-16a_block_15_adf', 'F-16A ADF'),
    ('f-16a_block_20', 'F-16A Block 20（中国）'),
    ('f-16d_block_40', 'F-16D Block 40 闪电 II'),
    ('mig-29smt', '米格-29SMT'),
    ('iar-81', 'I.A.R. 81 系列'),
    ('f-2a', '日本 F-2A'),
    ('b_cht', '泰国 A-7E（B.ChT.1K）'),
]

WPN_KEYS = [
    ('agm-45', 'AGM-45 百舌鸟'),
    ('as-37', 'AS 37 马特尔'),
    ('armat', 'AS 37 ARMAT'),
    ('kh-27', 'Kh-27PS'),
    ('kh-58', 'Kh-58'),
    ('kh-31', 'Kh-31'),
    ('vyuga', 'L-086 暴风雪吊舱'),
    ('pyton', 'Python 怪蛇（ID 拼写 pyton）'),
    ('shafrir', 'Shafrir 蜻蜓'),
    ('agm-62', 'AGM-62 白星眼'),
    ('agm-12', 'AGM-12 小斗犬'),
    ('agm-65', 'AGM-65 小牛'),
    ('gbu-8', 'GBU-8'),
    ('gbu-15', 'GBU-15'),
    ('gbu-24', 'GBU-24'),
    ('gbu', 'GBU 宝石路系列'),
    ('aim-9l', 'AIM-9L 响尾蛇'),
    ('mk118', 'Mk118（未找到）'),
]

MOD_KEYS = [
    ('g_suit', '抗荷服'),
    ('new_cover', '蒙皮 Cover'),
    ('new_compressor', '增压器/压缩机'),
    ('belt_pack', '弹链'),
    ('countermeasures_belt', '热焰弹/干扰箔'),
    ('new_engine_injection', '喷油系统'),
    ('new_engine_throttle', '节流阀'),
    ('fuselage', '机体维修/翻新（语言包无）'),
    ('airframe', 'Airframe（语言包无）'),
    ('efs', 'EFS（内部组名，语言包无）'),
]


def load_rows(fn):
    with open(BASE + '/' + fn, newline='', encoding='utf-8') as f:
        r = csv.reader(f, delimiter=';')
        next(r)
        for row in r:
            if row:
                yield row


def norm(k):
    """把关键词转成连字符/下划线通吃形式"""
    return k.replace('_', '-')


def clean(s):
    return s.replace('\\t', '').replace('\t', '').strip()


def main():
    lines = []
    lines.append('# 战争雷霆官方简中译名对照表（语言包提取）\n')
    lines.append('> 来源：`E:\\SteamLibrary\\steamapps\\common\\War Thunder\\lang\\*.csv` 列 10 `<Chinese>`（官方简中，国际服游戏内文本）\n')
    lines.append('> 提取时间：2026-08-12，对应正式服版本 2.57.1.84。dev server 新词条（AGM-45B-10/AS 37/Kh-27PS 等 2.57.1.85 内容）未发布，查不到。\n')
    lines.append('> 标记：☢=核弹型（词条 _killstreak/_missile_test）、▄=子分支、␗=中国、◔=匈牙利\n')
    lines.append('> 注：① ARM 反辐射改装件、AGM-45/AS 37/Kh-27PS、L-086 吊舱为 2.57.1.85 dev server 新增，正式服语言包暂无词条；② 部分通用改装件显示名（机体维修/翻新、Airframe、EFS 等）不在语言包 CSV（代码模板/内部组名），查不到属正常；③ 日本 F-2A、Mk118、泰国 A-7E 词条 ID 特殊，不在主文件。\n')

    unit_rows = list(load_rows('units.csv'))
    wpn_rows = list(load_rows('units_weaponry.csv'))
    mod_rows = list(load_rows('units_modifications.csv'))

    lines.append('\n## 载具（units.csv）\n')
    lines.append('| 词条 ID | 英文 | 官方简中 |')
    lines.append('|---|---|---|')
    for key, label in UNIT_KEYS:
        kn = norm(key)
        rows = [r for r in unit_rows if kn in norm(r[0])]
        if not rows:
            lines.append(f'| *(未找到)* `{key}` | — | — |')
            continue
        seen = set()
        for r in rows:
            uid = r[0]
            if uid.lower().endswith(('_shop', '_0')):
                base = re.sub(r'_(shop|\d+)$', '', uid)
                if base in seen:
                    continue
                seen.add(base)
                lines.append(f'| `{uid}` | {clean(r[1])} | {clean(r[10])} |')

    lines.append('\n## 武器（units_weaponry.csv）\n')
    lines.append('| 词条 ID | 英文 | 官方简中 |')
    lines.append('|---|---|---|')
    for key, label in WPN_KEYS:
        kn = norm(key)
        rows = [r for r in wpn_rows if kn in norm(r[0])]
        if not rows:
            lines.append(f'| *(未找到)* `{key}` | — | — |')
        else:
            shown = 0
            for r in rows:
                if r[0].endswith('/short'):
                    continue  # 只显示全名
                lines.append(f'| `{r[0]}` | {clean(r[1])} | {clean(r[10])} |')
                shown += 1
                if shown >= 3:
                    break

    lines.append('\n## 改装件（units_modifications.csv）\n')
    lines.append('| 词条 ID | 英文 | 官方简中 |')
    lines.append('|---|---|---|')
    for key, label in MOD_KEYS:
        rows = [r for r in mod_rows if key in r[0].lower()]
        if not rows:
            lines.append(f'| *(未找到)* `{key}` | — | — |')
        for r in rows[:3]:
            lines.append(f'| `{r[0]}` | {clean(r[1])} | {clean(r[10])} |')

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('OK ->', OUT)


if __name__ == '__main__':
    main()
