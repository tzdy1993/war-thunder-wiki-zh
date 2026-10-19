import json
import os
import csv
import re

print("=========================================================")
print("=== 执行官方对齐与纯正简体化：消灭所有错译、自创与繁体 ===")
print("=========================================================")

# 繁简字严格映射字典（针对战雷高频军事术语）
TRAD_TO_SIMP = {
    '彈': '弹',
    '砲': '炮',
    '裝': '装',
    '甲': '甲',
    '護': '护',
    '損': '损',
    '壞': '坏',
    '視': '视',
    '導': '导',
    '射': '射',
    '機': '机',
    '艦': '舰',
    '車': '车',
    '發': '发',
    '動': '动',
    '飛': '飞',
    '行': '行',
    '戰': '战',
    '鬥': '斗',
    '雷': '雷',
    '達': '达',
    '角': '角',
    '載': '载',
    '具': '具',
    '魚': '鱼',
    '蹤': '踪',
    '測': '测',
    '距': '距',
    '儀': '仪',
    '線': '线',
    '電': '电',
    '腦': '脑',
    '統': '统',
    '準': '准',
    '穩': '稳',
    '定': '定',
    '標': '标',
    '簽': '签',
    '組': '组',
    '込': '入',
    '榴弾': '榴弹',
    'ポンド': '磅',
}

def to_simplified(text):
    if not isinstance(text, str):
        return text
    res = text
    for trad, simp in TRAD_TO_SIMP.items():
        res = res.replace(trad, simp)
    return res

# 1. 修复 popover_terms.json
popover_path = 'data/popover_terms.json'
with open(popover_path, 'r', encoding='utf-8') as f:
    popover = json.load(f)

# 官方对齐字典（直接采用战雷官方客户端官方中文，替换自创词）
OFFICIAL_OVERRIDE = {
    "Armored targets": "穿甲",
    "Air targets": "对空",
    "Ground targets": "对地",
    "Stealth": "匿踪",
    "Default": "默认",
    "Guidance system type:": "制导方式：",
    "Aspect": "攻击能力",
    "All-aspect": "全向攻击",
    "All-aspects": "全向攻击",
    "Rear-aspect": "尾后攻击",
    "Head-on": "迎头攻击",
    "Laser": "激光",
    "Laser+IOG": "激光 + IOG",
    "IR+IOG": "红外+IOG",
    "IRCCM": "反红外对抗措施",
    "IRCM": "红外对抗措施",
    "GNSS": "全球导航卫星系统",
    "Optical director": "光学火炮指挥仪",
    "TV": "电视",
    "Auto tracker": "自动跟踪",
    "IRST": "红外搜索跟踪系统",
    "Laser Warning System": "激光告警系统",
    "CCIP": "连续计算命中点",
    "CCRP": "连续计算投放点",
    "IFF": "敌我识别",
    "TWS": "边扫描边跟踪",
    "Band": "频段",
    "Fuze Delay": "引信延迟",
    "Muzzle Velocity": "出膛速度",
    "Projectile Mass": "弹头质量",
    "TNT equivalent": "TNT 当量",
    "Engine Power": "发动机输出功率",
    "Cooling type": "冷却方式",
    "EEGS": "增强型航迹射击瞄具",
    "Cannons": "机炮",
    "Rockets": "火箭弹",
    "Mass": "载具质量",
    "Helmet-mounted display": "头盔显示器",
    "Focus sensor": "关注焦点传感器",
    "Laser designator": "激光测距指示器",
    "Ballistic computer": "弹道计算机"
}

# 物理剔除高危短键与调试垃圾
POISON_KEYS = {'type', 'mod', 'GB', 'SA', 't', 't Kal Alef', 't Kal Dalet', 't Kal Gimel'}

clean_popover = {}
for k, v in popover.items():
    if k in POISON_KEYS or (len(k) <= 2 and k.isalpha() and k not in {'HE', 'AP', 'IR'}):
        continue
    # 转简体
    v_simp = to_simplified(v)
    # 官方基准对齐
    if k in OFFICIAL_OVERRIDE:
        v_simp = OFFICIAL_OVERRIDE[k]
    # 清理反斜杠t
    v_clean = v_simp.replace('\\t', '').replace('\t', '').replace('\\r', '').replace('\r', '').strip()
    clean_popover[k] = v_clean

# 确保官方键全部收录
for ok, ov in OFFICIAL_OVERRIDE.items():
    clean_popover[ok] = ov

with open(popover_path, 'w', encoding='utf-8') as f:
    json.dump(clean_popover, f, ensure_ascii=False, indent=2)
print(f"已校准并净化 data/popover_terms.json，现有条目数: {len(clean_popover)}")

# 2. 修复 vehicle_nicknames.json 与 manufacturers.json
nick_path = 'data/vehicle_nicknames.json'
if os.path.exists(nick_path):
    with open(nick_path, 'r', encoding='utf-8') as f:
        nicks = json.load(f)
    nicks_override = {
        "Bradley": "布拉德利",
        "Flying Fortress": "空中堡垒",
        "Scott": "斯科特",
        "Hudson": "哈德森",
        "Crusader II": "十字军 Mk II",
        "Raiden": "雷电"
    }
    for k, v in nicks_override.items():
        nicks[k] = v
    clean_nicks = {k: to_simplified(v) for k, v in nicks.items() if k not in POISON_KEYS}
    with open(nick_path, 'w', encoding='utf-8') as f:
        json.dump(clean_nicks, f, ensure_ascii=False, indent=2)
    print("已校准 data/vehicle_nicknames.json（消除布雷德利、飞行堡垒等错译）")

mfg_path = 'data/manufacturers.json'
if os.path.exists(mfg_path):
    with open(mfg_path, 'r', encoding='utf-8') as f:
        mfgs = json.load(f)
    mfgs["de Havilland"] = "德·哈维兰"
    clean_mfgs = {k: to_simplified(v) for k, v in mfgs.items() if k not in POISON_KEYS}
    with open(mfg_path, 'w', encoding='utf-8') as f:
        json.dump(clean_mfgs, f, ensure_ascii=False, indent=2)
    print("已校准 data/manufacturers.json（消除德哈维兰等错译）")

# 3. 修复 wt-zh-all.csv
csv_path = 'wt-zh-all.csv'
if os.path.exists(csv_path):
    cleaned_rows = []
    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) < 2:
                continue
            k, v = row[0].strip(), row[1].strip()
            if k in POISON_KEYS or (len(k) <= 2 and k.isalpha() and k not in {'HE', 'AP', 'IR'}):
                continue
            # 过滤内部调试值
            if 'CLIPPED_LANG' in v or v == 'id':
                continue
            v_simp = to_simplified(v).replace('\\t', '').replace('\t', '').replace('\\r', '').replace('\r', '').strip()
            if k in OFFICIAL_OVERRIDE:
                v_simp = OFFICIAL_OVERRIDE[k]
            cleaned_rows.append([k, v_simp])
            
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(cleaned_rows)
    print(f"已彻底净化 wt-zh-all.csv，剔除调试垃圾与毒瘤键，保留纯净词条: {len(cleaned_rows)}")

print("\n全量官方对齐与纯正简体化修复完毕！")
