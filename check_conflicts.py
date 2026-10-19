#!/usr/bin/env python3
"""错翻检测：同一英文键在多个词典中译名不同 → 上下文冲突报告。

检测三类：
1. FIXED vs UNIT_NAME：人工固定词与载具名冲突（如 Shenyang：FIXED=沈阳 vs 载具名=歼5）
2. FIXED vs TERM：固定词与武器/改装件名冲突
3. 制造商名单（收藏页）与 UNIT_NAME 冲突：制造商标被载具名覆盖

输出需要人工定夺的冲突项；有意为之的上下文冲突（如 FIXED 优先）标记后忽略。
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

HERE = Path(__file__).resolve().parent
CORE = HERE / 'wt-wiki-zh.core.js'
USER = HERE / 'wt-wiki-zh.user.js'


def load_core_fixed() -> dict:
    """core.js 的 FIXED_TRANSLATIONS：单引号多行格式。"""
    src = CORE.read_text(encoding='utf-8')
    m = re.search(r'const FIXED_TRANSLATIONS = Object\.freeze\((\{.*?\})\);', src, re.S)
    if not m:
        m = re.search(r'const FIXED_TRANSLATIONS = (\{.*?\});', src, re.S)
    if not m:
        return {}
    return dict(re.findall(r"'([^']+)': '([^']*)'", m.group(1)))


def load_user_dict(name: str) -> dict:
    """user.js 的词典是单行 JSON 双引号格式，结束边界为 `};` + 换行。

    json.loads 成功后即确认 `.*?` 非贪婪匹配停在了真正的对象结尾
    （若字符串值里出现 `};` 会被 json 解析失败暴露）。
    """
    src = USER.read_text(encoding='utf-8')
    m = re.search(rf'const {name} = (\{{.*?\}});\n', src, re.S)
    if not m:
        return {}
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return {}


# wiki 载具显示名自带的分组/国籍/特殊标记前缀（非译名内容，比较时剥离）
MARKER_CHARS = '▂▃▄▅▀◄◔◘◊◗◥◐◌◍◡◢○⋠␗␙␠☢“\uf059'


def strip_markers(value: str) -> str:
    return value.lstrip(MARKER_CHARS)


# 已人工定夺的上下文分流（同一英文键在词典里译名不同但都有合法语境，运行时按上下文处理）
INTENTIONAL = {
    'Air': ('空中', '气冷', 'FIXED 用于 Air/Ground/Naval 表头；飞行控制 Air brake 已由代码整词规则处理'),
    'Displacement': ('排水量', '排气量', 'wiki 只出现在舰船特性表（排水量）；引擎排气量为官方 mod 词但页面无此语境'),
    'Flares': ('热焰', '热焰弹', '两种译名都是官方词条；页面出现处均在受保护的文章正文'),
    'Mobility': ('机动性', '机动改装', '特性块=机动性、改装树标题=机动改装，代码已按 DOM 上下文区分'),
    'SB': ('全真', 'SB', 'FIXED 用于 BR 行模式标签；UNIT_NAME 保留官方载具名 SB（图波列夫轰炸机）'),
    'Shenyang': ('沈阳', '歼-5', 'FIXED 用于制造商列表；UNIT_NAME 为官方载具名'),
    'A6M': ('零战', '零战二一型', 'FIXED 用于裸文本泛称；链接走 slug 词典得整名'),
    'P-61A-11': ('P-61A-11 黑寡妇', 'P-61A-11', 'FIXED 用于全名展示；UNIT_NAME 为官方简写'),
    'Meteor F Mk 8 G.41K': ('流星 F.8 (格罗斯特 G.41K)', '流星 F.8 G.41K', 'FIXED 为带制造商全名；UNIT_NAME 为官方简写'),
    'M4A3 (76) W': ('M4A3 (76) W', 'M4A3E8', 'FIXED 用于 Wiki 页面载具原名；UNIT_NAME 映射至官方代号'),
    'Chi-Ha Kai TD': ('九七式中战车改 TD', '九七式中战车改 (TD)', '括号格式变体，两者均指向同款载具'),
    'Launch range': ('发射距离', '作战距离', '导弹发射参数与雷达参数语境分流'),
    'Installation of pontoons': ('安装浮筒，从而获得水上浮渡能力。', '浮筒', 'FIXED 为改装件说明长句，TERM 为改装件名称'),
    'Machine Gun': ('机枪', '防空机枪', 'FIXED 用于 Wiki 武器类别标题；UNIT_NAME 为官方单位特定名'),
    'Machine Guns': ('机枪', '防空机枪', 'FIXED 用于 Wiki 武器类别标题；UNIT_NAME 为官方单位特定名'),
    'Boat': ('小艇', '渔船', 'FIXED 用于 Wiki 舰船分类；UNIT_NAME 为官方地图单位渔船'),
    'boat': ('小艇', '渔船', 'FIXED 用于 Wiki 舰船分类；UNIT_NAME 为官方地图单位渔船'),
}


def main() -> int:
    fixed = load_core_fixed()
    unit = load_user_dict('UNIT_NAME_TRANSLATIONS')
    term = load_user_dict('TERM_TRANSLATIONS')
    print(f'词典规模: FIXED={len(fixed)}  UNIT_NAME={len(unit)}  TERM={len(term)}')

    conflicts = []
    for key, fv in fixed.items():
        uv = unit.get(key)
        tv = term.get(key)
        if uv and strip_markers(uv) != strip_markers(fv):
            conflicts.append(('FIXED vs UNIT_NAME', key, fv, uv))
        if tv and strip_markers(tv) != strip_markers(fv):
            conflicts.append(('FIXED vs TERM', key, fv, tv))

    print(f'\n=== 词典冲突报告: {len(conflicts)} 项 ===')
    for kind, key, mine, other in sorted(conflicts):
        known = INTENTIONAL.get(key)
        if known and known[0] == mine and known[1] == strip_markers(other):
            print(f'  [已确认·{kind}] {key!r}  固定词: {mine!r}  另一词典: {other!r}\n      ↳ {known[2]}')
        else:
            print(f'  [需定夺·{kind}] {key!r}\n      固定词: {mine!r}\n      另一词典: {other!r}')

    # 制造商冲突：常见制造商标是否被载具名覆盖
    makers = ['Shenyang', 'Harbin', 'Nanchang', "Xi'an", 'CAC', 'HAIG', 'Hongdu',
              'Changhe', 'Hafei', 'Shijiazhuang', 'Shaanxi', 'AVIC', 'CATIC',
              'NORINCO', 'Sukhoi', 'Yakovlev', 'Mikoyan', 'Ilyushin', 'Tupolev',
              'Bell', 'Boeing', 'Grumman', 'Lockheed', 'Northrop', 'Hawker',
              'Supermarine', 'Gloster', 'Mitsubishi', 'Kawasaki', 'Nakajima',
              'Dornier', 'Heinkel', 'Junkers', 'Focke-Wulf', 'Messerschmitt']
    maker_conflicts = []
    for mk in makers:
        uv = unit.get(mk)
        fv = fixed.get(mk)
        if uv and uv != mk and fv != '沈阳' and fv != mk:
            maker_conflicts.append((mk, uv, fv))
    print(f'\n=== 制造商 vs 载具名冲突: {len(maker_conflicts)} 项（需人工确认） ===')
    for mk, uv, fv in maker_conflicts:
        print(f'  {mk}: UNIT_NAME={uv!r} FIXED={fv!r}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
