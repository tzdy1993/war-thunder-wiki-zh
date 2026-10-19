import json
import os

print("=== 正在将高频遗漏技术参数与弹药词汇注入官方对齐词库 ===")

popover_path = 'data/popover_terms.json'
with open(popover_path, 'r', encoding='utf-8') as f:
    popover = json.load(f)

# 来自官方 CSV 与战雷维基表格的高频技术参数权威对齐
NEW_TECHNICAL_TERMS = {
    # 穿甲与弹药带表格
    "Armor penetration (max.)": "最大穿甲威力",
    "Armor penetration": "穿甲威力",
    "Armor penetration (mm) at a distance:": "不同距离上的穿甲威力 (毫米)：",
    "Belt": "弹链",
    "Belt filling": "弹链构成",
    "Slot": "栏位",
    "Weight": "重量",
    "Search": "搜索",
    
    # 机炮与机枪弹药
    "AP: Armor-piercing bullet": "穿甲弹（AP）",
    "AP-T: Armor-piercing tracer shell": "穿甲曳光弹（AP-T）",
    "AP-T: Armor-piercing tracer bullet": "穿甲曳光弹（AP-T）",
    "T: Tracer bullet": "曳光弹（T）",
    "AP-I: Armor-piercing incendiary bullet": "穿甲燃烧弹（AP-I）",
    "AP-I: Armor-piercing incendiary shell": "穿甲燃烧弹（AP-I）",
    "HEF-I: High-explosive fragmentation incendiary shell": "高爆破片燃烧弹（HEF-I）",
    "API-T: Armor-piercing incendiary tracer bullet": "穿甲燃烧曳光弹（API-T）",
    "API-T: Armor-piercing incendiary tracer shell": "穿甲燃烧曳光弹（API-T）",
    "HEI: High-explosive incendiary shell": "高爆燃烧弹（HEI）",
    "HEF: High-explosive fragmentation shell": "高爆破片弹（HEF）",
    "APHE: Armor-piercing high-explosive shell": "穿甲高爆弹（APHE）",
    "HEFI-T: High-explosive fragmentation incendiary tracer shell": "高爆破片燃烧曳光弹（HEFI-T）",
    "HEF-T: High-explosive fragmentation tracer shell": "高爆破片曳光弹（HEF-T）",
    "FI-T: Fragmentation incendiary tracer shell": "破片燃烧曳光弹（FI-T）",
    "I: Incendiary bullet": "燃烧弹（I）",
    "IAI: Immediate-action incendiary bullet": "瞬发燃烧弹（IAI）",
    "AI: Adjustment incendiary bullet": "试射燃烧弹（AI）",
    "IT: Incendiary tracer shell": "燃烧曳光弹（IT）",
    "AP: M2 Armor-piercing bullet": "M2 穿甲弹（AP）",
    "I: M1 Incendiary bullet": "M1 燃烧弹（I）",
    "API-T: M20 Armor-piercing incendiary tracer bullet": "M20 穿甲燃烧曳光弹（API-T）",
    "AP-I: M8 Armor-piercing incendiary bullet": "M8 穿甲燃烧弹（AP-I）",

    # 夜视、热成像与防护
    "Thermal imager": "热成像仪",
    "Night vision device": "夜视设备",
    "Visualizes thermal radiation from heat signatures in both day and night conditions": "昼夜均可通过捕获热源辐射以高亮显示目标",
    "Improves low light visibility by enhancing natural light or active illumination": "通过增强自然光或主动照明改善微光环境下的能见度",
    "Ability to create smoke screens using smoke grenades": "使用烟雾弹施放烟幕",
    "Allows the use of smoke screen system.": "允许使用发烟系统。",

    # 飞行动力学与指标
    "Power-to-Weight ratio:": "功重比：",
    "Thrust-to-Weight ratio:": "推重比：",
    "Weight of the airplane divided by the area of the wing.": "飞机质量与翼面积之比。",
    "The ratio of engine power to the weight of the airplane.": "发动机输出功率与飞机质量之比。",
    "The ratio of engine thrust to the weight of the airplane.": "发动机推力与飞机质量之比。",
    "Max armor penetration high-explosive action": "最大高爆穿透威力",
    "no tracers": "不含曳光"
}

added_count = 0
for k, v in NEW_TECHNICAL_TERMS.items():
    if k not in popover or popover[k] != v:
        popover[k] = v
        added_count += 1

with open(popover_path, 'w', encoding='utf-8') as f:
    json.dump(popover, f, ensure_ascii=False, indent=2)

print(f"成功注入 {added_count} 条高频技术参数与弹药官方中文！当前总条目数: {len(popover)}")
