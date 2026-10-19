import os
import glob
import csv
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

lang_dir = r'E:\SteamLibrary\steamapps\common\War Thunder\lang'

# 1. 扫描所有客户端 CSV，提取所有 英文 -> 官方简体中文 映射
csv_files = glob.glob(os.path.join(lang_dir, '*.csv'))
print(f'Loading {len(csv_files)} official CSV files from {lang_dir}...')

official_dict = {}

def is_chinese(text):
    return any('\u4e00' <= char <= '\u9fff' for char in text)

def clean_zh(text):
    # 清除战雷内部制表符和格式化标记
    t = text.replace('\t', '').replace('\r', '').strip()
    # 替换中文括号内部的异常空格
    t = re.sub(r'([（(])\s+', r'\1', t)
    t = re.sub(r'\s+([）)])', r'\1', t)
    return t

for filepath in csv_files:
    filename = os.path.basename(filepath)
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f, delimiter=';')
            for row in reader:
                if len(row) < 3:
                    continue
                en = row[1].strip()
                if not en:
                    continue
                # 在第 3 列之后寻找第一个包含中文字符的列（通常是 row[10] 或 row[11]）
                zh_cand = ''
                for col in row[2:]:
                    if is_chinese(col):
                        zh_cand = clean_zh(col)
                        break
                if zh_cand and en:
                    # 严禁将英文字符存为翻译结果
                    if not is_chinese(zh_cand):
                        continue
                    clean_en = re.sub(r'<[^>]+>', '', en).strip()
                    if clean_en:
                        official_dict[clean_en] = zh_cand
                        # 兼容小写
                        official_dict[clean_en.lower()] = zh_cand
    except Exception as e:
        print(f'Error reading {filename}: {e}')

print(f'Total valid Chinese official term pairs extracted: {len(official_dict)}')

# 2. 核心战术与辅助设备标准术语（100% 官方对齐）
AUTHORITATIVE_TERMS = {
    # 弹链（核心修正）
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

    # 制导方式（核心修正）
    "Guidance": "制导方式",
    "Guidance:": "制导方式：",
    "Guidance system type:": "制导方式：",
    "Guidance system type": "制导方式",
    "Missile guidance time": "导弹制导时长",
    "Missile guidance time:": "导弹制导时长：",
    "Lock range in rear-aspect": "尾后攻击锁定距离",
    "Lock range in all-aspect": "全向攻击锁定距离",
    "Lock range": "锁定距离",
    "Launch range": "发射距离",
    "Firing range": "射程",
    "Maximum range": "最大射程",
    "Aspect": "目标迎角/探测相位",
    "All-aspect": "全向",
    "All-aspects": "全向",
    "Rear-aspect": "尾后",
    "Head-on": "迎头",
    "Tail-on": "尾追",
    "Beam riding": "驾束制导",
    "Manual (MCLOS)": "人工指令瞄准线 (MCLOS)",
    "Semi-Automatic (SACLOS)": "半自动指令瞄准线 (SACLOS)",
    "Semi-automatic": "半自动制导",
    "Hand aiming": "人工制导",
    "SARH": "半主动雷达寻的",
    "SARH+IOG": "半主动雷达寻的 + IOG",
    "SARH+IOG+DL": "半主动雷达寻的 + IOG + 数据链",
    "ARH": "主动雷达寻的",
    "ARH+IOG": "主动雷达寻的 + IOG",
    "ARH+IOG+DL": "主动雷达寻的 + IOG + 数据链",
    "ARH+IOG+GNSS+DL": "主动雷达寻的 + IOG + 卫星制导 + 数据链",
    "Laser": "激光制导",
    "Laser+IOG": "激光制导 + IOG",
    "Laser+IOG+GNSS": "激光制导 + IOG + 卫星制导",
    "IR": "红外",
    "IR+IOG": "红外 + IOG",
    "IR+IOG+DL": "红外 + IOG + 数据链",
    "IR+IOG+GNSS": "红外 + IOG + 卫星制导",
    "IR+IOG+GNSS+DL": "红外 + IOG + 卫星制导 + 数据链",
    "IRCCM": "红外抗干扰 (IRCCM)",
    "IRCM": "红外对抗 (IRCM)",
    "GNSS": "全球导航卫星系统 (GNSS)",
    "Optical director": "光学指挥仪",
    "TV": "电视制导",
    "Seeker": "导引头",

    # 辅助设备与卡片
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
    "Look-down/shoot-down": "下视/下射能力",
    "Ground clutter": "地面杂波",
    "Azimuth": "方位角",
    "Elevation": "俯仰角",
    "Scan sector": "扫描扇区",
    "Search pattern": "搜索样式",
    "Detection range": "探测距离",
    "Tracking range": "跟踪距离",
    "Band": "波段",
    "Model": "型号",
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
    "Maximum speed": "最大速度",
    "Maximum overload": "最大过载",
    "Engine Power": "发动机功率",
    "Cooling type": "冷却类型",
    "Type": "类型",
    "Research:": "研发所需：",
    "Purchase:": "购买价格：",
}

# 3. 读取 5706 个本地 HTML 提取出的所有卡片原始文本
raw_strings_path = 'tools/feature_popover_raw_strings.json'
with open(raw_strings_path, 'r', encoding='utf-8') as fp:
    raw_strings = json.load(fp)

final_popover_dict = {}

# 先填入权威官方术语
for k, v in AUTHORITATIVE_TERMS.items():
    final_popover_dict[k] = v

# 从官方 CSV 中匹配
for raw_text, count in raw_strings.items():
    if raw_text in final_popover_dict:
        continue
    
    # 检查直接匹配
    if raw_text in official_dict:
        final_popover_dict[raw_text] = official_dict[raw_text]
        continue
    
    # 检查小写匹配
    if raw_text.lower() in official_dict:
        final_popover_dict[raw_text] = official_dict[raw_text.lower()]
        continue
    
    # 检查冒号结尾
    if raw_text.endswith(':'):
        base = raw_text[:-1].strip()
        if base in final_popover_dict:
            final_popover_dict[raw_text] = final_popover_dict[base] + '：'
            continue
        if base in official_dict:
            final_popover_dict[raw_text] = official_dict[base] + '：'
            continue

print(f'Total terms resolved for popovers: {len(final_popover_dict)}')

# 绝对审查：确保每一个 value 都是中文，绝无法语/英文字符串作为中文！
clean_final_dict = {}
french_or_bad = 0
for k, v in final_popover_dict.items():
    if is_chinese(v):
        clean_final_dict[k] = v
    else:
        french_or_bad += 1

print(f'Excluded {french_or_bad} non-Chinese or polluted entries.')
print(f'Clean final Chinese popover entries: {len(clean_final_dict)}')

# 保存为 data/popover_terms.json
with open('data/popover_terms.json', 'w', encoding='utf-8') as fp:
    json.dump(clean_final_dict, fp, ensure_ascii=False, indent=2)

print('Saved successfully to data/popover_terms.json!')
