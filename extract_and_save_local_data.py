#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
保存官方数据资产到本地 data/ 目录
包含：战斗通行证、活动、国内军工制造商、载具家族、合集分类等
"""

import os
import re
import csv
import json
import urllib.request
import html as pyhtml

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# 1. 军工制造厂商官方与指定全称数据
MANUFACTURERS = {
    # 中国国内军工厂商（严格遵循指定规范）
    "Chengdu": "航空工业成飞",
    "CAIG": "航空工业成飞",
    "Shenyang": "航空工业沈飞",
    "Xi'an": "航空工业西飞",
    "Hongdu": "航空工业洪都",
    "Nanchang": "航空工业洪都",
    "Hafei": "航空工业哈飞",
    "Harbin": "航空工业哈飞",
    "Changhe": "航空工业昌飞",
    "Shaanxi": "航空工业陕飞",
    "Guizhou": "航空工业贵飞",
    "NORINCO": "中国兵器工业集团",
    "Norinco": "中国兵器工业集团",
    "北方工业": "中国兵器工业集团",
    # 国际主流制造厂商
    "Mitsubishi": "三菱",
    "Fiat": "菲亚特",
    "BFW / Messerschmitt": "BFW / 梅塞施密特",
    "Messerschmitt": "梅塞施密特",
    "US Army Ordnance Department/Corps": "美国陆军军械部/兵种",
    "Chrysler": "克莱斯勒",
    "General Dynamics": "通用动力",
    "Boeing": "波音",
    "Lockheed": "洛克希德",
    "Lockheed Martin": "洛克希德·马丁",
    "Grumman": "格鲁曼",
    "North American": "北美航空",
    "Republic": "共和航空",
    "Bell": "贝尔",
    "Curtiss": "柯蒂斯",
    "Douglas": "道格拉斯",
    "Vought": "沃特",
    "Supermarine": "超级马林",
    "Hawker": "霍克",
    "Avro": "阿芙罗",
    "Gloster": "格罗斯特",
    "de Havilland": "德哈维兰",
    "Focke-Wulf": "福克-沃尔夫",
    "Junkers": "容克斯",
    "Heinkel": "亨克尔",
    "Henschel": "亨舍尔",
    "Dornier": "多尼尔",
    "Mikoyan-Gurevich": "米高扬-格列维奇",
    "Sukhoi": "苏霍伊",
    "Yakovlev": "雅克夫列夫",
    "Lavochkin": "拉沃契金",
    "Ilyushin": "伊柳辛",
    "Tupolev": "图波列夫",
    "Kamov": "卡莫夫",
    "Mil": "米尔"
}

with open(os.path.join(DATA_DIR, "manufacturers.json"), "w", encoding="utf-8") as f:
    json.dump(MANUFACTURERS, f, ensure_ascii=False, indent=2)
print("1. Saved manufacturers.json")

# 2. 战斗通行证（Battle Pass 1~25 全赛季）官方权威中英对照数据
BATTLE_PASS_SEASONS = {
    "1": {"en": "75th Anniversary of the Great Victory", "zh": "二战胜利 75 周年", "wiki_title": "Battle Pass: Season I, 75th Anniversary of the Great Victory"},
    "2": {"en": "Steel Centurion", "zh": "铁血百夫长", "wiki_title": "Battle Pass: Season II, \"Steel Centurion\""},
    "3": {"en": "Strength athletics", "zh": "大力士竞技赛", "wiki_title": "Battle Pass: Season III, \"Strength athletics\""},
    "4": {"en": "Fearless Voltigeur", "zh": "无畏腾跃兵", "wiki_title": "Battle Pass: Season IV, \"Fearless Voltigeur\""},
    "5": {"en": "River Hunter", "zh": "河道猎手", "wiki_title": "Battle Pass: Season V, \"River Hunter\""},
    "6": {"en": "Firepower", "zh": "火力全开", "wiki_title": "Battle Pass: Season VI, \"Firepower\""},
    "7": {"en": "Armoured Elephant", "zh": "重装巨象", "wiki_title": "Battle Pass: Season VII, \"Armoured Elephant\""},
    "8": {"en": "Field Testing", "zh": "全面测试", "wiki_title": "Battle Pass: Season VIII, \"Field Testing\""},
    "9": {"en": "Smell of Victory", "zh": "胜利之息", "wiki_title": "Battle Pass: Season IX, \"Smell of Victory\""},
    "10": {"en": "Royal Guard", "zh": "皇家护卫", "wiki_title": "Battle Pass: Season X, \"Royal Guard\""},
    "11": {"en": "Her Majesty's Hussar", "zh": "禁卫骠骑兵", "wiki_title": "Battle Pass: Season XI, \"Her Majesty's Hussar\""},
    "12": {"en": "Armour Breaking Ambusher", "zh": "破甲刀斧手", "wiki_title": "Battle Pass: Season XII, \"Armour Breaking Ambusher\""},
    "13": {"en": "Tropical Storm", "zh": "热带风暴", "wiki_title": "Battle Pass: Season XIII, \"Tropical Storm\""},
    "14": {"en": "Airborne General", "zh": "空降神兵", "wiki_title": "Battle Pass: Season XIV, \"Airborne General\""},
    "15": {"en": "Northern King", "zh": "北境之王", "wiki_title": "Battle Pass: Season XV, \"Northern King\""},
    "16": {"en": "Skilled Marksman", "zh": "历战神射手", "wiki_title": "Battle Pass: Season XVI, \"Skilled Marksman\""},
    "17": {"en": "Guided Fury", "zh": "引领天火", "wiki_title": "Battle Pass: Season XVII, \"Guided Fury\""},
    "18": {"en": "The Last Legionnaire", "zh": "最后的军团战士", "wiki_title": "Battle Pass: Season XVIII, The Last Legionnaire\""},
    "19": {"en": "First Sample", "zh": "引路先驱", "wiki_title": "Battle Pass: Season XIX, \"First Sample\""},
    "20": {"en": "Flying Dragon", "zh": "天降神龙", "wiki_title": "Battle Pass: Season XX, \"Flying Dragon\""},
    "21": {"en": "Brave Archer", "zh": "英勇射手", "wiki_title": "Battle Pass: Season XXI, \"Brave Archer\""},
    "22": {"en": "The Elusive Musketeer", "zh": "神秘火枪手", "wiki_title": "Battle Pass: Season XXII, \"The Elusive Musketeer\""},
    "23": {"en": "Apollo’s Chariot", "zh": "阿波罗战车", "wiki_title": "Battle Pass: Season XXIII, \"Apollo’s Chariot\""},
    "24": {"en": "Do It Yourself", "zh": "自己动手", "wiki_title": "Battle Pass: Season XXIV, \"Do It Yourself\""},
    "25": {"en": "Steel Fury", "zh": "钢铁狂怒", "wiki_title": "Battle Pass: Season XXV, \"Steel Fury\""}
}

with open(os.path.join(DATA_DIR, "official_battle_pass.json"), "w", encoding="utf-8") as f:
    json.dump(BATTLE_PASS_SEASONS, f, ensure_ascii=False, indent=2)
print("2. Saved official_battle_pass.json")

# 3. 历年重大活动官方权威名称数据
OFFICIAL_EVENTS = {
    "Regular events": "常规活动",
    "Twitch Drops": "Twitch 直播掉落",
    "The Great War! (1 April 2025)": "第一次世界大战！（2025年4月1日）",
    "Battlefield Engineer (2019)": "战场工程师（2019年）",
    "Operation F.R.O.S.T. (2019)": "“严寒”行动（2019年）",
    "Operation H.E.A.T. (2019)": "“炽焰”行动（2019年）",
    "Operation S.U.M.M.E.R. (2016)": "“夏日总动员”（2016年）",
    "Operation S.U.M.M.E.R. (2017)": "“夏日总动员”（2017年）",
    "Operation S.U.M.M.E.R. (2018)": "“夏日总动员”（2018年）",
    "Operation S.U.M.M.E.R. (2020)": "“夏日总动员”（2020年）",
    "Operation W.I.N.T.E.R. (2020)": "“冬日总动员”（2020年）",
    "Operation W.I.N.T.E.R. (2021)": "“冬日总动员”（2021年）",
    "Summer Landing (2021)": "“夏季登陆战”（2021年）",
    "Thunder League (2015)": "雷霆联赛（2015年）",
    "YouTube Cup (2019)": "YouTube 杯（2019年）",
    "Chronicles of World War II (2016)": "二战编年史（2016年）",
    "Chronicles of World War II (2017)": "二战编年史（2017年）",
    "Chronicles of World War II (2018)": "二战编年史（2018年）",
    "Export Order (2021)": "“外贸订单”（2021年）",
    "Festive Quest (2017)": "节日大探险（2017年）",
    "Festive Quest (2018)": "节日大探险（2018年）",
    "Future Technology (2021)": "“未来科技”（2021年）",
    "Operation “Shipyard” (2019)": "“造船厂”行动（2019年）",
    "Operation \"Shipyard\" (2019)": "“造船厂”行动（2019年）",
    "Project “Overpowered” (2022)": "“力量过载”工程（2022年）",
    "Project \"Overpowered\" (2022)": "“力量过载”工程（2022年）",
    "Repair Factory (2023)": "“修配厂”（2023年）",
    "Space Race (2020)": "“太空竞赛”（2020年）",
    "Summer Extreme (2023)": "“夏日狂飙”（2023年）",
    "Summer Quest (2022)": "“夏日大冒险”（2022年）",
    "The Battle for Arachis (2022)": "“厄拉科斯之战”（2022年）",
    "Tokushu Heiki (2023)": "“特殊兵装”（2023年）",
    "Wargame “Strategist” (2020)": "沙盘兵棋“战略家”（2020年）",
    "Wargame \"Strategist\" (2020)": "沙盘兵棋“战略家”（2020年）",
    "Winter Concert (2025)": "冬日音乐会（2025年）",
    "Winter Extreme (2023)": "“冰暴狂潮”（2023年）",
    "Winter Holiday (2014)": "冬季节假日（2014年）",
    "Winter Holiday (2016)": "冬季节假日（2016年）",
    "Winter Magic (2013)": "冬季魔力（2013年）",
    "Winter Quest (2022)": "“冬日大冒险”（2022年）",
    "Winter Tales (2024)": "“冬日传说”（2024年）",
    "Good Old S.U.M.M.E.R (2018)": "“夏日好回忆”（2018年）",
    "Victory day (2020)": "胜利日（2020年）",
    "War Thunder birthday (2014)": "《战争雷霆》周年庆（2014年）",
    "War Thunder's 5th anniversary (2017)": "《战争雷霆》5 周年庆（2017年）",
    "War Thunder Mobile": "战争雷霆手游",
    "Flying Serpent, Crouching Tiger (2018)": "飞蛇在天、伏虎踞山！（2018年）",
    "Nuclear Thunder (1 April 2026)": "“核雷霆”（2026年4月1日）",
    "Sea Voyage (2019)": "“扬帆起航”（2019年）",
    "World War season 1: Recon under fire (2019)": "世界大战第一赛季：浴火尖兵（2019年）",
    "World War season 2: Attack from the Sea (2020)": "世界大战第二赛季：逐梦深蓝（2020年）",
    "World War season 3: Road to the West": "世界大战第三赛季：西方之路"
}

with open(os.path.join(DATA_DIR, "official_events.json"), "w", encoding="utf-8") as f:
    json.dump(OFFICIAL_EVENTS, f, ensure_ascii=False, indent=2)
print("3. Saved official_events.json")

# 4. 合集首页分类四字规范
COLLECTIONS_CATEGORIES = {
    "Vehicle families": "载具家族",
    "Game roles": "游戏角色",
    "Operator": "使用国家",
    "Weaponry": "武器配置",
    "Features": "载具特性",
    "Manufacturers": "制造厂商",
    "Vehicles by events": "活动载具",
    "Vehicles by updates": "版本更新"
}

with open(os.path.join(DATA_DIR, "collections_categories.json"), "w", encoding="utf-8") as f:
    json.dump(COLLECTIONS_CATEGORIES, f, ensure_ascii=False, indent=2)
print("4. Saved collections_categories.json")

# 5. 载具家族（Vehicle Families）官方中文与 HTML 实体对照库
nickname_map = {
    "Sherman": "谢尔曼", "Centurion": "百夫长", "Fighting Falcon": "战隼",
    "Sabre": "佩刀", "Mustang": "野马", "Apache": "阿帕奇", "Würger": "屠夫鸟",
    "Phantom II": "鬼怪 II", "Abrams": "艾布拉姆斯", "Stuart": "斯图亚特",
    "Patton III": "巴顿 III", "Thunderbolt": "雷电", "Thunderjet": "雷霆喷气",
    "Tiger II": "虎 II", "Corsair": "海盗", "Panther": "黑豹", "Spaviero": "食雀鹰",
    "Cobra": "眼镜蛇", "Starfighter": "星战士", "Hornet": "大黄蜂", "Pershing": "潘兴",
    "Hien": "飞燕", "Churchill": "丘吉尔", "Eagle": "鹰", "Stuka": "斯图卡",
    "Hawk": "鹰", "Lightning": "闪电", "Challenger 2": "挑战者 2", "Hellcat": "地狱猫",
    "Warhawk": "战鹰", "Kingcobra": "眼镜王蛇", "Tiger I": "虎 I", "Skyhawk": "天鹰",
    "Cromwell": "克伦威尔", "Mitchell": "米切尔", "Toryū": "屠龙", "Schwalbe": "燕子",
    "Hornisse": "大黄蜂", "Airacobra": "飞蛇", "Vautour": "秃鹰", "Viggen": "雷",
    "Gripen": "鹰狮", "Huey": "休伊", "Corsair II": "海盗 II", "Tiger": "虎",
    "Chieftain": "酋长", "Jackson": "杰克逊", "Grach": "白嘴鸦", "Osa": "黄蜂",
    "Invader": "侵略者", "Flying Fortress": "飞行堡垒", "Tomcat": "雄猫",
    "Raiden": "雷电", "Hayabusa": "隼", "Shoki": "钟馗", "Walker Bulldog": "华克猛犬",
    "Catalina": "卡特琳娜", "Falco I": "猎鹰 I", "Draken": "龙", "Helldiver": "地狱俯冲者",
    "Tor": "道尔", "Mangusta": "猫鼬", "Liberator": "解放者", "Superfortress": "超级堡垒",
    "Super Sabre": "超级佩刀", "Buffalo": "水牛", "Challenger 1": "挑战者 1",
    "Freccia": "箭", "Centauro": "半人马", "Donryū": "吞龙", "Hayate": "疾风",
    "Saetta": "闪电", "Folgore": "雷电", "Duster": "除尘者", "Patton II": "巴顿 II",
    "Ouragan": "暴风", "Mystère": "神秘", "Super Mystère": "超神秘",
    "Kyofū": "强风", "Shiden": "紫电", "Falco II": "猎鹰 II", "Tunnan": "飞桶",
    "Vindicator": "辩护者", "Thunderbolt II": "雷电 II", "Matilda II": "玛蒂尔达 II",
    "Comet": "彗星", "Tenzan": "天山", "Suisei": "彗星", "Aardvark": "土豚",
    "Crusader II": "十字军 II", "Wildcat": "野猫", "Bearcat": "熊猫",
    "Choctaw": "乔克托", "Hiryū": "飞龙", "Veltro": "猎犬", "Bradley": "布雷德利",
    "Scott": "斯考特", "Komet": "彗星", "Bombardiere": "轰炸机", "Privateer": "私掠者",
    "Mariner": "水手", "Keiun": "景云", "Alouette II": "云雀 II", "Gazelle": "小羚羊",
    "Lansen": "长矛", "Hudson": "哈德逊", "Ventura": "文图拉", "Goshawk": "苍鹰",
    "Capraia": "卡普拉亚", "Kürassier": "胸甲骑兵", "Black Hawk": "黑鹰"
}

with open(os.path.join(DATA_DIR, "vehicle_nicknames.json"), "w", encoding="utf-8") as f:
    json.dump(nickname_map, f, ensure_ascii=False, indent=2)
print("5. Saved vehicle_nicknames.json")

print("\nAll local official reference data saved successfully in data/ directory!")
