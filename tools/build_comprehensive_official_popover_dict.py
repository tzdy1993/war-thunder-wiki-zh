import os
import glob
import csv
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

lang_dir = r'E:\SteamLibrary\steamapps\common\War Thunder\lang'
raw_strings_path = 'tools/feature_popover_raw_strings.json'

print(f'Loading raw feature strings from {raw_strings_path}...')
with open(raw_strings_path, 'r', encoding='utf-8') as fp:
    raw_strings = json.load(fp)

print(f'Total raw strings to match: {len(raw_strings)}')

# Load all CSV files in official lang
csv_files = glob.glob(os.path.join(lang_dir, '*.csv'))
print(f'Found {len(csv_files)} official lang CSV files.')

official_en_to_zh = {}

def clean_zh(text):
    if not text:
        return ''
    # remove tab and strange game delimiters
    t = text.replace('\t', '').replace('\r', '').strip()
    return t

for cpath in csv_files:
    try:
        with open(cpath, 'r', encoding='utf-8', errors='ignore') as fp:
            reader = csv.reader(fp, delimiter=';')
            for row in reader:
                if not row or len(row) < 11:
                    continue
                key = row[0]
                en = row[1].strip()
                if not en:
                    continue
                # Chinese is usually column 10, 11, or 12
                zh = ''
                for col in row[10:13]:
                    if any('\u4e00' <= char <= '\u9fff' for char in col):
                        zh = clean_zh(col)
                        break
                if zh and en:
                    # store exact match
                    official_en_to_zh[en] = zh
                    # also case-insensitive if needed
                    official_en_to_zh[en.lower()] = zh
    except Exception as e:
        pass

print(f'Indexed {len(official_en_to_zh)} official string pairs.')

matched = {}
unmatched = {}

# Specific manual high-priority official alignment for radar, features, avionics
MANUAL_OFFICIAL_ALIGNMENT = {
    "Stealth": "匿踪",
    "Stealth:": "匿踪：",
    "Tracers": "曳光",
    "Tracers:": "曳光：",
    "Universal": "通用",
    "Universal:": "通用：",
    "Air targets": "对空",
    "Air targets:": "对空：",
    "Ground targets": "对地",
    "Ground targets:": "对地：",
    "Armored targets": "对装甲目标",
    "Armored targets:": "对装甲目标：",
    "Default": "默认",
    "Default:": "默认：",
    "Flares/Chaff": "热焰弹/干扰箔",
    "Flares/Chaff + MAW": "热焰弹/干扰箔 + 导弹逼近告警",
    "Missile Approach Warning system": "导弹逼近告警系统 (MAW)",
    "Alerts when an incoming missile is detected, and automatically deploys countermeasures": "探测到来袭导弹时发出告警，并自动投放对抗措施",
    "Countermeasures to distract IR- and radar-seekers": "用于干扰红外与雷达导引头的对抗措施",
    "Optical Detection": "光学探测系统",
    "Auto tracker": "自动跟踪器",
    "IRST": "红外搜索与跟踪系统 (IRST)",
    "Radar Warning System": "雷达告警系统 (RWR)",
    "Radar Warning Receiver": "雷达告警接收器 (RWR)",
    "Notifies about the vehicle's exposure to radar emissions": "提示载具暴露在敌方雷达辐射之下",
    "Ballistic Computer": "弹道计算机",
    "Night vision device": "夜视设备",
    "Improves low light visibility by enhancing natural light or active illumination": "通过增强微光或主动红外照明提高弱光环境下的视野",
    "Thermal imager": "热成像仪",
    "Helmet Mounted Display": "头盔显示器 (HMD)",
    "Voice Warning System": "语音告警系统",
    "Laser rangefinder": "激光测距仪",
    "Laser Warning System": "激光告警系统 (LWS)",
    "CCIP": "连续计算落点 (CCIP)",
    "CCRP": "连续计算投放点 (CCRP)",
    "Continuously Computed Impact Point": "连续计算落点 (CCIP)",
    "Continuously Computed Release Point": "连续计算投放点 (CCRP)",
    "IFF": "敌我识别 (IFF)",
    "Search": "搜索",
    "Track": "跟踪",
    "Track While Scan (TWS)": "边扫描边跟踪 (TWS)",
    "TWS": "边扫描边跟踪 (TWS)",
    "Pulse Doppler": "脉冲多普勒",
    "BVR": "视距外 (BVR)",
    "ACM": "空战机动模式 (ACM)",
    "Dogfight": "近距格斗",
    "Head-on": "迎头",
    "Tail-on": "尾追",
    "All-aspects": "全向",
    "All-aspect": "全向",
    "Rear-aspect": "尾后",
    "Look-down/shoot-down": "下视/下射能力",
    "Ground clutter": "地面杂波",
    "Azimuth": "方位角",
    "Elevation": "俯仰角",
    "Scan sector": "扫描扇区",
    "Search pattern": "搜索样式",
    "Detection range": "探测距离",
    "Tracking range": "跟踪距离",
    "Lock range in rear-aspect": "尾后锁定距离",
    "Lock range in all-aspect": "全向锁定距离",
    "Band": "波段",
    "Model": "型号",
    "Aspect": "目标迎角/探测相位",
    "Range": "距离",
    "Resolution": "分辨率",
    "Generation 1": "第 1 代",
    "Generation 2": "第 2 代",
    "Generation 3": "第 3 代",
    "Gunner": "炮手",
    "Commander": "车长",
    "Driver": "驾驶员",
    "Sight": "瞄具",
    "Targeting pod": "瞄准吊舱",
    "Fuze Sensitivity": "引信灵敏度",
    "Fuze Delay": "引信延时",
    "Muzzle Velocity": "炮口初速",
    "Projectile Mass": "弹丸质量",
    "Explosive Type": "装药类型",
    "Explosive Mass": "装药质量",
    "TNT equivalent": "TNT 等效质量",
    "Armor penetration (max.)": "最大装甲穿透深度",
    "Missile guidance time": "导弹导引时间",
    "Launch range": "发射距离",
    "Maximum speed": "最大速度",
    "Maximum overload": "最大过载",
    "Engine Power": "发动机功率",
    "Cooling type": "冷却类型",
    "Guidance": "制导模式",
    "Type": "类型",
    "Research:": "研发所需：",
    "Purchase:": "购买价格：",
}

for s, count in raw_strings.items():
    # 1. Check manual alignment
    if s in MANUAL_OFFICIAL_ALIGNMENT:
        matched[s] = MANUAL_OFFICIAL_ALIGNMENT[s]
        continue
    
    # 2. Check exact match in official CSV
    if s in official_en_to_zh:
        matched[s] = official_en_to_zh[s]
        continue
    
    # 3. Check lowercase match
    if s.lower() in official_en_to_zh:
        matched[s] = official_en_to_zh[s.lower()]
        continue
    
    # 4. Check if ends with colon
    if s.endswith(':') and s[:-1] in MANUAL_OFFICIAL_ALIGNMENT:
        matched[s] = MANUAL_OFFICIAL_ALIGNMENT[s[:-1]] + '：'
        continue
    if s.endswith(':') and s[:-1] in official_en_to_zh:
        matched[s] = official_en_to_zh[s[:-1]] + '：'
        continue

    unmatched[s] = count

print(f'Matched {len(matched)} strings directly against official data.')
print(f'Remaining unmatched strings: {len(unmatched)}')

# Save matched
with open('tools/matched_feature_popovers.json', 'w', encoding='utf-8') as fp:
    json.dump(matched, fp, ensure_ascii=False, indent=2)

# Save unmatched top 200
with open('tools/unmatched_feature_popovers.json', 'w', encoding='utf-8') as fp:
    json.dump(unmatched, fp, ensure_ascii=False, indent=2)

print('\nTop 50 unmatched feature strings (by frequency):')
for s, count in list(unmatched.items())[:50]:
    print(f'[{count:4d}] {s}')
