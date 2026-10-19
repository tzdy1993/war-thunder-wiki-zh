'use strict';

(function init(factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const api = factory();
    globalThis.WTWikiZh = api;
    const startAfterHydration = () => {
      setTimeout(() => api.start(document), 800);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startAfterHydration, { once: true });
    } else {
      startAfterHydration();
    }
  }
})(function createApi() {
  const FIXED_TRANSLATIONS = Object.freeze({
    'PLAY': '播放',
    'Search…': '搜索…',
    'Login': '登录',
    'VEHICLES': '载具',
    'Aviation': '空军',
    'Helicopters': '直升机',
    'Ground Vehicles': '地面载具',
    'Bluewater Fleet': '远洋海军',
    'Coastal Fleet': '近岸海军',
    'Collections': '套装收藏',
    'WAR THUNDER': 'War Thunder',
    'Official Website': '官方网站',
    'Store': '商店',
    'Market': '市场',
    'WT Live Portal': 'WT Live 门户',
    'Forum': '论坛',
    'Author Support Program': '作者支持计划',
    'Terms and Conditions': '条款与条件',
    'Terms of Service': '服务条款',
    'Privacy Policy': '隐私政策',
    'Cookie Settings': 'Cookie 设置',
    'Contribution Agreement': '贡献协议',
    'Theme:': '主题：',
    'System': '系统',
    'Beginners': '新手',
    'Mechanics': '机制',
    'Weaponry': '武器配置',
    'Discover': '探索',
    'Content creation': '内容创作',
    'Crew': '乘员组',
    'Vehicle modules': '载具模块',
    'Controls': '按键设置',
    'Game modes': '游戏模式',
    'Battle activity': '战斗活动',
    'New': '最新',
    'Popular': '热门',
    'Rating': '评分',
    'Popular now': '当前热门',
    'Popular vehicle': '热门载具',
    'Fleet': '海军',
    '#review': '#评测',
    '#article': '#文章',
    '#ww2': '#二战',
    '#battleships': '#战列舰',
    '#history': '#历史',
    '#ussr': '#苏联',
    '#groundvehicles': '#地面载具',
    '#heavy_tanks': '#重型坦克',
    '#gameplay': '#游戏玩法',
    '#76mm': '#76毫米',
    '#video': '#视频',
    '#youtube': '#YouTube',
    '#strike_aircraft': '#攻击机',
    '#jets': '#喷气机',
    '#usa': '#美国',
    '#MBTs': '#主战坦克',
    '#105mm': '#105毫米',
    '#britain': '#英国',
    '#jet_fighters': '#喷气式战斗机',
    '#tank_destroyers': '#坦克歼击车',
    'Fighter': '战斗机',
    'Jet fighter': '喷气战斗机',
    'Great Britain': '英国',
    'USSR': '苏联',
    'USA': '美国',
    'Germany': '德国',
    'Japan': '日本',
    'China': '中国',
    'Italy': '意大利',
    'France': '法国',
    'Sweden': '瑞典',
    'Israel': '以色列',
    'Russia': '俄罗斯',
    'FRG': '联邦德国',
    'Great Britain': '英国',
    'Heavy tank': '重型坦克',
    'Medium tank': '中型坦克',
    'Light tank': '轻型坦克',
    'KV tank': 'KV 坦克',
    'Leningrad Kirov Plant': '列宁格勒基洛夫工厂',
    'Ground CBT': '陆战封闭测试',
    'Aircraft CBT': '飞机封闭测试',
    'Vehicles by events': '按活动划分的载具',
    'Scharnhorst-class battleships': '沙恩霍斯特级战列舰',
    'Armament': '武器',
    'Rangefinder': '测距仪',
    'Like': '喜欢',
    'Report': '举报',
    'Send': '发送',
    'Spitfire': '喷火',
    'Vampire': '吸血鬼',
    'Gloster': '格洛斯特',
    'Meteor': '流星',
    'BFW / Messerschmitt': 'BFW / 梅塞施密特',
    'Mikoyan-Gurevich': '米高扬-格列维奇',
    'Mitsubishi': '三菱',
    'SAAB': '萨博',
    'North American Aviation': '北美航空',
    'Supermarine': '超级马林',
    'Westland': '韦斯特兰',
    'Boeing': '波音',
    'Aérospatiale': '法国宇航',
    'Bell': '贝尔',
    'McDonnell Douglas': '麦克唐纳-道格拉斯',
    'Mil': '米里',
    'Fiat': '菲亚特',
    'US Army Ordnance Department/Corps': '美国陆军军械部/兵种',
    'War Thunder birthday (2014)': '战争雷霆生日（2014）',
    'Battlefield Engineer (2019)': '战场工程师（2019）',
    'Chronicles of World War II (2016)': '二战编年史（2016）',
    'Chronicles of World War II (2017)': '二战编年史（2017）',
    'Chronicles of World War II (2018)': '二战编年史（2018）',
    'Mi-24 / Mi-35': '米-24 / 米-35',
    'Bö 105': 'Bö 105',
    '500 lb Mk 82 bomb': '500 磅 Mk 82 炸弹',
    '1,000 lb Mk 83 bomb': '1,000 磅 Mk 83 炸弹',
    '1,000 lb AN-M65A1 bomb': '1,000 磅 AN-M65A1 炸弹',
    'AGM-114 Hellfire missile': 'AGM-114 地狱火导弹',
    'Hydra 70 rocket': '九头蛇 70 火箭弹',
    'FIM-92 Stinger missile': 'FIM-92 毒刺导弹',
    'FFAR Mighty Mouse rocket': 'FFAR 太空飞鼠火箭弹',
    '500 kg FAB-500 bomb': '500 千克 FAB-500 炸弹',
    '7.62 mm M1919 Browning machine gun': '7.62 毫米 M1919 勃朗宁机枪',
    '#fighters': '#战斗机',
    'Load more…': '加载更多…',
    'Rank': '等级',
    'Battle rating': '战斗权重',
    'BR': '战斗权重',
    'AB': '街机',
    'RB': '历史',
    'SB': '全真',
    'Research country': '研发科技树',
    'Main role': '主要职能',
    'Research': '研发',
    'Purchase': '购买',
    'Compare': '比较',
    'Show in game': '在游戏中查看',
    'General information': '通用信息',
    'Expand...': '展开……',
    'Specification': '规格',
    'Rating by players': '玩家评分',
    'Features & Facts': '特性与事实',
    'Articles': '文章',
    'Camouflages': '涂装',
    'Search on WT Live': '在 WT Live 上搜索',
    'Game roles': '游戏角色',
    'Vehicle families': '载具系列',
    'Operator': '使用国',
    'Manufacturers': '制造商',
    'Vehicles by updates': '按版本更新的载具',
    'Flight performance': '飞行性能',
    'Max speed': '最大速度',
    'Rate of Climb': '爬升率',
    'Turn time': '转弯时间',
    'Max altitude': '最大高度',
    'Takeoff Run': '起飞滑跑',
    'Survivability and armour': '生存能力与装甲',
    'Armour': '装甲',
    'Armor': '装甲',
    'front / side / back': '正面 / 侧面 / 背面',
    'Hull': '车体',
    'Turret': '炮塔',
    'Visibility': '战场辨识度',
    'Mobility': '机动性',
    'Forward': '前进',
    'Backward': '倒退',
    'Power-to-weight ratio': '功重比',
    'Engine power': '发动机输出功率',
    'Weight': '重量',
    'Optics': '观瞄设备',
    'Optics zoom': '观瞄放大倍率',
    'Gunner': '炮手',
    'Commander': '车长',
    'Driver': '驾驶员',
    'Reload': '装填',
    'Vertical guidance': '垂直引导范围',
    'Turret Rotation Speed': '炮塔旋转速度',
    'Horizontal': '水平',
    'Vertical': '垂直',
    'Available ammunition': '可用弹药',
    'Armor protection:': '装甲防护：',
    'Armament:': '武器：',
    'Mobility:': '机动性：',
    'Landing': '降落',
    'flaps': '襟翼',
    'Take-off': '起飞',
    'Combat': '空战',
    'Air': '空中',
    'brake': '制动器',
    'Landing flaps': '着陆襟翼',
    'Take-off flaps': '起飞襟翼',
    'Combat flaps': '战斗襟翼',
    'Air brake': '减速板',
    'L / T / C': '着陆 / 起飞 / 战斗',
    'General characteristics': '一般特性',
    'Engine': '发动机',
    'Length': '长度',
    'Wingspan': '翼展',
    'Wing Loading': '翼载',
    'Weight:': '重量：',
    'Base weight': '基础重量',
    'Fuel in main tanks': '主油箱燃料',
    'Limits:': '限制：',
    'Max Speed Limit (IAS)': '最大速度限制（指示空速）',
    'Mach Number Limit': '马赫数限制',
    'G limit': 'G 力限制',
    'Flap Speed Limit (IAS)': '襟翼速度限制（指示空速）',
    'Gear Speed Limit (IAS)': '起落架速度限制（指示空速）',
    'Offensive armament': '前射武器',
    'Armaments': '武器装备',
    'Secondary weapon': '挂载',
    'Ammunition': '弹种',
    'Fire rate': '射速',
    'One-second Burst Mass': '一秒齐射质量',
    'Available belts': '可用弹链',
    'Suspended armament': '挂载',
    'Setup': '方案',
    'Flight performance:': '飞行性能：',
    'Economy': '经济',
    'Repair cost': '维修费',
    'Crew training': '乘员训练',
    'Experts': '专家',
    'Aces': '王牌',
    'Research Aces': '研发王牌',
    'Reward multiplier': '奖励倍率',
    'Total cost of modifications': '改装件总价',
    'Talisman cost': '护身符价格',
    'Research order:': '研发顺序：',
    'Modifications': '改装件',
    'Like:': '喜欢：',
    'players': '玩家',
    'all time': '总计',
    'Survivability:': '生存能力：',
    'Aerial combat:': '空战：',
    'Ground attack:': '对地攻击：',
    'Balance:': '平衡：',
    'User content': '用户内容',
    'Settings': '设置',
    'Characteristics:': '特性：',
    'Realistic': '历史',
    'Arcade': '街机',
    'Modification:': '改装：',
    'Reference': '完全体',
    'Basic': '基础',
    'Loading...': '加载中……',
    'Weapon modifications': '武器改装件',
    'Tier bonus': '等级奖励',
    'Max speed at': '最大速度（高度）',
    'Derwent 1': '德温特 1',
    'All mods researched': '已研发所有改装件',
    'All': '全部',
    'Comments': '评论',
    'BUY': '购买',
    'See all': '查看全部',
    'Save to bookmarks': '保存书签',
    'War Thunder Video': '战争雷霆视频',
    'Tree': '树形',
    'List': '列表',
    'Status': '状态',
    'Features': '特性',
    'Vehicle Collections': '载具收藏',
    'Country': '国家',
    'Roles': '角色',
    'Battle Rating': '战斗权重',
    'Scout plane': '侦察机',
    'Battlecruiser': '战列巡洋舰',
    'Premium vehicle': '高级载具',
    'Belt capacity': '弹链容量',
    'Book of Records': '记录之书',
    'Random vehicle': '随机载具',
    'Introduced in': '引入于',
    'Where to purchase': '购买渠道',
    'Citadel': '装甲盒区域',
    'Main fire tower': '主炮塔装甲',
    'Superstructure': '上层建筑',
    'Number of sections': '舱段数量',
    'Displacement': '排水量',
    'Primary armament': '主武器',
    'Secondary armament': '副武器',
    'Anti-aircraft armament': '防空武器',
    'Additional Armament': '附加武器',
    'Main Battery': '主炮',
    'Secondary Armament': '副炮',
    'Anti-Aircraft Armament': '防空武器',
    'All modifications are unlocked': '所有改装件已解锁',
    'Night vision device': '夜视设备',
    'Thermal imager': '热成像仪',
    'Radar/Optical Detection': '雷达/光学探测',
    'RWR': '雷达告警接收器',
    'Ballistic Computer': '弹道计算机',
    'LWS': '激光告警系统',
    'Three-Plane Stabilizers': '三轴稳定器',
    'Voice warning system': '语音告警系统',
    'Attack helicopters': '攻击直升机',
    'Utility helicopters': '通用直升机',
    'Attack helicopter': '攻击直升机',
    'Main rotor diameter': '主旋翼直径',
    'Max weight': '最大重量',
    'Wing loading': '翼载荷',
    'left / right': '左 / 右',
    'Maximum': '最大',
    'Max. difference': '最大差值',
    'Defensive capabilities:': '防御能力：',
    'List of available weapons': '可用武器列表',
    'Experimental': '试验型',
    'Mi-24D': '米-24D',
    'Hind-A': '雌鹿-A',
    'Hind-D': '雌鹿-D',
    'Mexican Navy': '墨西哥海军',
    'Republic of Belarus': '白俄罗斯',
    'Additional armament': '附加武器',
    'Heavy boat': '重型艇',
    'Motor torpedo gun boat': '鱼雷炮艇',
    'Pr. 206-class motor boat': '206 型摩托艇',
    'Yaroslavl Shipyard No.345': '雅罗斯拉夫尔造船厂 345 号',
    'Pr. 206': 'Pr.206',
    'Bomber': '轰炸机',
    'Tank destroyer': '坦克歼击车',
    'P-61C-1': 'P-61C-1',
    'P-61A-11': 'P-61A-11 黑寡妇',
    'F4U-4B VMF-214': 'F4U-4B (VMF-214 中队)',
    'FJ-4B VMF-232': 'FJ-4B (VMF-232 中队)',
    'Meteor F Mk 8 G.41K': '流星 F.8 (格罗斯特 G.41K)',
    'Meteor F Mk 8 Reaper': '流星 F.8 收割者',
    'Spitfire Mk IXc': '喷火 Mk IXC',
    'Meteor NF.13': '流星 NF.13',
    'Meteor F.8': '流星 F.8',
    'Meteor FR.9': '流星 FR.9',
    'Article Feed': '文章动态',
    'NAVIGATION': '导航',
    'General Information': '通用信息',
    'Vehicle List': '载具列表',
    'What we write about': '我们写什么',
    'How to get started': '如何开始',
    'Open editor': '打开编辑器',
    'No recent searches': '暂无最近搜索',
    'Not enough ratings': '暂无足够评分',
    'You must play more than 3 battles for the last week and more than 10 battles in a vehicle to rate it.': '您需要在上周进行超过 3 场战斗，并在该载具中战斗超过 10 场才能评分。',
    'This space is currently empty': '此区域当前为空',
    'Do you know any interesting vehicle features?': '你知道这辆载具有哪些有趣的特点吗？',
    'Share them!': '分享它们！',
    'No articles about this vehicle yet': '暂无关于该载具的文章',
    'Become the first author and get rewards!': '成为第一位作者并获得奖励！',
    'Write a guide, tell about interesting historical facts, make a tutorial or simply an interesting post.': '撰写指南、讲述有趣的历史事实、制作教程或发布一篇有趣的文章。',
    'No more content': '没有更多内容了',
    'Participation rules': '参与规则',
    'Go to editor': '前往编辑器',
    'Close': '关闭',
    'Light': '浅色',
    'Dark': '深色',
    'English': '英语',
    'Belt': '弹链',
    'Belt filling': '弹链组成',
    'Armor penetration (mm) at a distance:': '不同距离装甲穿透力（毫米）：',
    'Default': '默认',
    'HEI: High-explosive incendiary shell': 'HEI：高爆燃烧弹',
    'SAP-I: Semi-armor-piercing incendiary shell': 'SAP-I：半穿甲燃烧弹',
    'T: Tracer shell': 'T：曳光弹',
    'Become a War Thunder Wiki author!': '成为战争雷霆 Wiki 作者！',
    'We may deny publication or request corrections': '我们可能拒绝发布或要求修改',
    'Screenshots author —': '截图作者：',
    'Scharnhorst-class battleship': '沙恩霍斯特级战列舰',
    'Description': '描述',
    'General info': '通用信息',
    'General Information': '通用信息',
    'Pros and cons': '优缺点',
    'Pros': '优点',
    'Cons': '缺点',
    'History': '历史',
    'Usage in battles': '战斗运用',
    'Media': '媒体',
    'See also': '另见',
    'External links': '外部链接',
    'References': '参考资料',
    'Main article:': '主条目：',
    'In-game description': '游戏内描述',
    'Firepower': '武器改装',
    'Combat tactics': '战斗战术',
    'Suggested modifications': '推荐改装件',
    'Tactics': '战术',
    'Matchmaking': '匹配',
    'Rewards': '奖励',
    'Battle Pass': '战斗通行证',
    'Game mechanics': '游戏机制',
    'Guns': '机炮',
    'Rockets & Missiles': '火箭弹与导弹',
    'Torpedoes': '鱼雷',
    'Other': '其他',
    'History of updates': '更新历史',
    'Random article': '随机文章',
    'Our Authors': '我们的作者',
    'Popular topics': '热门话题',
    'Wiki News': 'Wiki 新闻',
    'War Thunder CDK': 'War Thunder CDK',
    'Mission creation': '任务创建',
    'Location creation': '地图创建',
    'Sight creation': '瞄准具创建',
    'Hangar creation': '机库创建',
    'Camouflage creation': '涂装创建',
    'Sound modifications': '音效改装',
    'Localization creation': '本地化创建',
    'Any': '任意',
    'From +10': '从 +10',
    'Vehicle filter': '载具筛选',
    'Naval aircraft': '海军飞机',
    'Frontline bomber': '前线轰炸机',
    'Torpedo bomber': '鱼雷轰炸机',
    'Long Range bomber': '远程轰炸机',
    'Dive bomber': '俯冲轰炸机',
    'Interceptor': '截击机',
    'Light bomber': '轻型轰炸机',
    'Jet bomber': '喷气式轰炸机',
    'Air Defence fighter': '防空战斗机',
    'Strike UCAV': '攻击无人机',
    'Arcade Battles': '街机模式',
    'Realistic Battles': '历史模式',
    'Simulator Battles': '全真模式',
    'Regular vehicle': '常规载具',
    'Squadron vehicle': '联队载具',
    'Found:': '找到：',
    'Vehicle collections': '载具收藏',
    'Apply': '应用',
    'Researchable vehicles': '可研发载具',
    'Premium vehicles': '高级载具',
    'Period': '时间范围',
    'Month': '月',
    'Year': '年',
    'All time': '全部时间',
    '°/s': '度/秒',
    'Slot': '栏位',
    'Note:': '注意：',
    'New first': '最新优先',
    'Old first': '最早优先',
    'Report a mistake': '报告错误',
    'Selection:': '选择：',
    'Describe the problem:': '描述问题：',
    'Cancel': '取消',
    'Credit:': '致谢：',
    'In a nutshell:': '简而言之：',
    'Subscribe': '订阅',
    'Unsubscribe': '取消订阅',
    'Weapons': '武器',
    'Page not found': '页面未找到',
    'Go to Main': '返回主页',
    'L / T': '着陆 / 起飞',
    'Horizontal guidance': '水平引导范围',
    'Light tanks': '轻型坦克',
    'Medium tanks': '中型坦克',
    'Heavy tanks': '重型坦克',
    'Tank destroyers': '坦克歼击车',
    'Destroyers': '驱逐舰',
    'Light cruisers': '轻巡洋舰',
    'Heavy cruisers': '重巡洋舰',
    'Battlecruisers': '战列巡洋舰',
    'Battleships': '战列舰',
    'Barges': '驳船',
    'Boats': '小艇',
    'Frigates': '护卫舰',
    'Utility helicopter': '通用直升机',
    'ATGM vehicle': '反坦克导弹载具',
    'Armored gun boat': '装甲炮艇',
    'Naval ferry barge': '海军渡轮驳船',
    'Swing wing': '变后掠翼',
    'Boosters': '助推器',
    'VTOL': '垂直起降',
    'HMD': '头盔显示器',
    'ERA': '爆炸反应装甲',
    'APS': '主动防护系统',
    'Amphibious': '两栖',
    'Controlled suspension': '可控悬挂',
    'Dual control': '双操控',
    'Composite armour': '复合装甲',
    'Support systems': '支援系统',
    'Smoke grenades': '烟雾弹',
    'Optical device': '光学设备',
    'Fuel dumping': '放油',
    'Arrestor gear': '拦阻钩',
    'Fuel in drop tanks': '副油箱燃料',
    'Reverse gearbox': '倒挡变速箱',
    'Low reverse speed': '低倒车速度',
    'Large crew size': '大乘员组',
    'Table Of Contents': '目录',
    'Usage In Battle': '战斗运用',
    'Notable Enemies': '值得注意的敌人',
    'Armor Location': '装甲位置',
    'Notes': '备注',
    'Main Armament': '主武器',
    'Loadout': '挂载配置',
    'Shells': '炮弹',
    'Penetration at 100m': '100 米穿透力',
    'Usage': '运用',
    'Playstyle': '玩法风格',
    'Armour and survivability': '装甲与生存能力',
    'Armor and survivability': '装甲与生存能力',
    'Turret Front': '炮塔正面',
    'Turret Sides': '炮塔侧面',
    'Turret Rear': '炮塔后部',
    'Hull Front': '车体正面',
    'Hull Sides': '车体侧面',
    'Hull Rear': '车体后部',
    'Top': '顶部',
    'Very thick': '非常厚',
    'Great armor': '优秀装甲',
    'Great rear armor': '优秀的后部装甲',
    'Great side armor': '优秀的侧面装甲',
    'Outstanding rear armor': '出色的后部装甲',
    'Lots of TNTe filler': '大量炸药',
    'Long reload': '长装填',
    'Decent penetration': '不错的穿透力',
    'No smoke grenades': '无烟雾弹',
    'Limited gun depression': '有限的俯角',
    'Wide variety of shells': '多种炮弹',
    'Good armour': '良好装甲',
    'Terrible reverse speed': '糟糕的倒车速度',
    'Great mobility': '极佳机动性',
    'Wide variety of armaments': '多种武器',
    'Awesome survivability': '优秀生存能力',
    'Vertical Armor:': '垂直装甲：',
    'Horizontal Armor:': '水平装甲：',
    'Speed:': '速度：',
    'Maneuverability:': '机动性：',
    '#germany': '#德国',
    '#light_tanks': '#轻型坦克',
    '#75mm': '#75毫米',
    '#france': '#法国',
    '#belgium': '#比利时',
    '#30mm': '#30毫米',
    '#SPG': '#自行火炮',
    '#russia': '#俄罗斯',
    '#fleet': '#海军',
    '#coastalfleet': '#沿海舰队',
    '#patrolboat': '#巡逻艇',
    '#aircraft_carrier': '#航空母舰',
    '#naval_aircraft': '#海军飞机',
    '#100mm': '#100毫米',
    'Dance of Dragons update': '龙之舞更新',
    'Tusk Force update': '獠牙部队更新',
    'Offensive 12.7 mm belts': '12.7 毫米前射武器弹链',
    'Sukhoi': '苏霍伊',
    'Yakovlev': '雅科夫列夫',
    'Nakajima': '中岛',
    'Hawker': '霍克',
    'Douglas': '道格拉斯',
    'Grumman': '格鲁曼',
    'Polikarpov': '波利卡波夫',
    'Kawasaki': '川崎',
    'Heinkel': '亨克尔',
    'Lavochkin': '拉沃奇金',
    'Lockheed': '洛克希德',
    'Vought': '沃特',
    'Ilyushin': '伊留申',
    'Tupolev': '图波列夫',
    'Dornier': '道尼尔',
    'Junkers': '容克斯',
    'Northrop': '诺斯罗普',
    'McDonnell': '麦克唐纳',
    'Macchi': '马基',
    'Panavia': '帕纳维亚',
    'Reggiane': '雷贾内',
    'Martin': '马丁',
    'Dewoitine': '德瓦蒂纳',
    'Petlyakov': '佩特利亚科夫',
    'Consolidated': '联合飞机',
    'Kawanishi': '川西',
    'British Aerospace': '英国宇航',
    'SNCASO': '法国西南航空制造公司',
    'Yokosuka Naval Arsenal': '横须贺海军工厂',
    'CAIG': '成飞',
    'Eurofighter': '欧洲战斗机',
    'Fairey': '费尔雷',
    'Hawker Siddeley': '霍克·西德利',
    'Henschel': '亨舍尔',
    'Yermolaev': '叶尔莫拉耶夫',
    'Avro': '阿弗罗',
    'Beriev': '别里耶夫',
    'Blackburn': '布莱克本',
    'Bristol': '布里斯托尔',
    'Handley Page': '汉德利·佩奇',
    'SABCA': '比利时航空制造公司',
    'SEPECAT': '英法联合飞机公司',
    'Valtion Lentokonetehdas': '国家飞机制造厂',
    'Arado': '阿拉多',
    'Brewster': '布鲁斯特',
    'Canadair': '加拿大飞机',
    'English Electric': '英国电气',
    'LTV': 'LTV',
    'Nanchang': '南昌',
    'Short Brothers': '肖特兄弟',
    'Vultee': '瓦尔蒂',
    "Xi'an": '西安',
    'Arsenal': '阿森纳',
    'Blohm & Voss': '布洛姆-福斯',
    'Breda': '布雷达',
    'CAC': '联邦飞机公司',
    'Fairchild': '费尔柴德',
    'IAR': '罗马尼亚航空工业',
    'IMAM': 'IMAM',
    'Piaggio': '比亚乔',
    'AMX International': 'AMX 国际',
    'Aerfer': 'Aerfer',
    'Aeritalia': '意大利航空',
    'FFVS': '瑞典皇家空军维修厂',
    'Manfréd Weiss': '曼弗雷德·魏斯',
    'MÁVAG': '匈牙利皇家铁路机车厂',
    'SNCAC': 'SNCAC',
    'ACL': 'ACL',
    'Armstrong Whitworth': '阿姆斯特朗·惠特沃斯',
    'BAC': 'BAC',
    'Harbin': '哈尔滨',
    'K+W': 'K+W 图恩',
    'Loire Shipyards': '卢瓦尔造船厂',
    'Morozov': '莫罗佐夫',
    'NORINCO': '北方工业',
    'Chelyabinsk Tractor Plant': '车里雅宾斯克拖拉机厂',
    'Uralvagonzavod': '乌拉尔车辆厂',
    'Ansaldo': '安萨尔多',
    'IDF Ordnance Corps': '以色列国防军军械部队',
    'Landsverk': '兰德斯维克',
    'Chrysler': '克莱斯勒',
    'OTO / OTO Melara': '奥托·梅莱拉',
    'GAZ': 'GAZ',
    'FMC': 'FMC',
    'Mantak': 'Mantak',
    'BAE Systems': 'BAE 系统',
    'CIO': 'CIO',
    'MAN': 'MAN',
    'Krupp': '克虏伯',
    'Nuffield': '纳菲尔德',
    'OKMO': 'OKMO',
    'Renault': '雷诺',
    'Cadillac': '凯迪拉克',
    'Panhard': '庞阿尔',
    'Alkett': '阿尔凯特',
    'GIAT / Nexter': 'GIAT / 奈克斯特',
    'Leyland': '利兰',
    'Vauxhall': '沃克斯豪尔',
    'Volgograd Tractor Plant': '伏尔加格勒拖拉机厂',
    'Bofors': '博福斯',
    'Hägglunds': '赫格隆',
    'KMW': 'KMW',
    'Kurganmashzavod': '库尔干机械厂',
    'ČKD / BMM': 'ČKD / BMM',
    'Büssing-NAG': '比辛-NAG',
    'General Motors': '通用汽车',
    'Montreal Locomotive Works': '蒙特利尔机车厂',
    'Uraltransmash': '乌拉尔运输机械厂',
    'BRC&W': 'BRC&W',
    'Buick': '别克',
    'Hanomag': '哈诺马格',
    'Uralmash': '乌拉尔重型机械厂',
    'ZiS': 'ZiS',
    'Komatsu': '小松',
    'Nudelman': '努德尔曼',
    'Porsche': '保时捷',
    'Rock Island Arsenal': '岩岛兵工厂',
    'Alvis': '阿尔维斯',
    'Deutsche Eisenwerk': '德意志钢铁厂',
    'MIAG': 'MIAG',
    'Omsktransmash': '鄂木斯克运输机械厂',
    'ROCA ORDC': '中华民国陆军兵工署',
    'Rheinstahl': '莱茵钢铁',
    'Royal Arsenal Woolwich': '伍尔维奇皇家兵工厂',
    'White Motor Company': '怀特汽车公司',
    'Škoda': '斯柯达',
    'AAI': 'AAI',
    'ARMSCOR': '南非军械公司',
    'Eisenwerk Weserhütte': '威悉钢铁厂',
    'FCM': 'FCM',
    'Ford': '福特',
    'GKN': 'GKN',
    'General Electric': '通用电气',
    'Hino Motors': '日野汽车',
    'Hitachi': '日立',
    'Hotchkiss': '霍奇基斯',
    'MVEE': 'MVEE',
    'Malyshev Factory': '马雷舍夫工厂',
    'Oerlikon': '厄利孔',
    'SOMUA': 'SOMUA',
    'Shipunov': '希普诺夫',
    'AEC': 'AEC',
    'ARL': 'ARL',
    'Denel': '德内尔',
    'Kharkiv Tractor Plant': '哈尔科夫拖拉机厂',
    'Toyota': '丰田',
    'Sasebo Naval Arsenal': '佐世保海军工厂',
    'Kingdom of Italy': '意大利王国',
    'Republic of China': '中华民国',
    'Hungary': '匈牙利',
    'Finland': '芬兰',
    'Thailand': '泰国',
    'GDR': '东德',
    'Romania': '罗马尼亚',
    'The Netherlands': '荷兰',
    'Australia': '澳大利亚',
    'Belgium': '比利时',
    'Switzerland': '瑞士',
    'Norway': '挪威',
    'India': '印度',
    'Malaysia': '马来西亚',
    'Pakistan': '巴基斯坦',
    'Canada': '加拿大',
    'Czechia': '捷克',
    'Argentina': '阿根廷',
    'Austria': '奥地利',
    'Brazil': '巴西',
    'Colombia': '哥伦比亚',
    'Cuba': '古巴',
    'Denmark': '丹麦',
    'Egypt': '埃及',
    'Greece': '希腊',
    'Indonesia': '印度尼西亚',
    'Iran': '伊朗',
    'Kazakhstan': '哈萨克斯坦',
    'New Zealand': '新西兰',
    'North Korea': '朝鲜',
    'Philippines': '菲律宾',
    'Portugal': '葡萄牙',
    'Saudi Arabia': '沙特阿拉伯',
    'Serbia': '塞尔维亚',
    'South Africa': '南非',
    'Syria': '叙利亚',
    'Türkiye': '土耳其',
    'Venezuela': '委内瑞拉',
    'Bangladesh': '孟加拉国',
    'Poland': '波兰',
    'Vietnam': '越南',
    'Jordan': '约旦',
    'Kuwait': '科威特',
    'Lithuania': '立陶宛',
    'Oman': '阿曼',
    'Russian Empire': '俄罗斯帝国',
    'Singapore': '新加坡',
    'Slovakia': '斯洛伐克',
    'Somalia': '索马里',
    'Spain': '西班牙',
    'Ireland': '爱尔兰',
    'South Vietnam': '南越',
    'Weimar Republic': '魏玛共和国',
    'German Empire': '德意志帝国',
    'Bethlehem Steel': '伯利恒钢铁',
    'Deschimag': '德希马格',
    'New York Ship': '纽约造船',
    'Brest Arsenal': '布雷斯特兵工厂',
    'Bath Iron Works': '巴斯钢铁厂',
    'Fairfields': '费尔菲尔德',
    'John Brown & Company': '约翰·布朗公司',
    'Kure Naval Arsenal': '吴海军工厂',
    'Maizuru Naval Arsenal': '舞鹤海军工厂',
    'Marti Shipyard No.198': '马尔蒂造船厂 198 号',
    'Newport News Shipbuilding': '纽波特纽斯造船',
    'Zhdanov Shipyard No.190': '日丹诺夫造船厂 190 号',
    'Admiralty Shipyards': '海军部造船厂',
    'Brooklyn Navy Yard': '布鲁克林海军船坞',
    'ACF': 'ACF',
    'Cammell Laird': '坎默尔·莱尔德',
    'HM Dockyard Portsmouth': '朴次茅斯皇家船坞',
    'Hawthorn Leslie': '霍桑·莱斯利',
    'Lorient Arsenal': '洛里昂兵工厂',
    'Penhoët Shipyards': '佩诺埃特造船厂',
    'Thornycroft': '索尼克罗夫特',
    'William Cramp & Sons': '威廉·克兰普父子公司',
    'Fujinagata Shipyards': '藤永田造船所',
    'Germaniawerft': '日耳曼尼亚船厂',
    'HMD Chatham': '查塔姆皇家船坞',
    'Uraga Dock Company': '浦贺船渠',
    'Harland & Wolff': '哈兰-沃尔夫',
    'CRDA': 'CRDA',
    'Philadelphia Navy Yard': '费城海军船坞',
    'Lürssen': '吕尔森',
    'Vospers': '沃斯珀',
    'Fairmile Marine': '费尔迈尔海事',
    'Elco': '埃尔科',
    'Baglietto': '巴列托',
    'Higgins': '希金斯',
    'Krasny Metallist': '红色冶金工人',
    'Yokohama Yacht Company': '横滨游艇公司',
    'Yantar Shipyard': '琥珀造船厂',
    'H. C. Stülcken Sohn': 'H. C. 斯图尔肯父子',
    'More Shipyard No.831': '莫雷造船厂 831 号',
    'Novorossiysk Shipyard': '新罗西斯克造船厂',
    'Sosnovka Shipyard No.640': '索斯诺夫卡造船厂 640 号',
    'Vladivostok Shipyard': '符拉迪沃斯托克造船厂',
    'Meulan Shipbuilding': '默朗造船',
    'Eurofighter Typhoon': '欧洲战斗机台风',
    'General Dynamics': '通用动力',
    'War Thunder Mobile': '战争雷霆移动版',
    'Schräge Musik': '斜乐曲',
    'AASM Hammer': 'AASM 锤',
    '3D model creation': '3D 模型创建',
    'Sea Hawk': '海鹰',
    'Sea Fury': '海怒',
    'Bloch / Dassault': '布洛克 / 达索',
    'Seversky / Republic': '塞维斯基 / 共和',
    'Name': '名称',
    'A6M': '零战',
    'AD Skyraider': 'AD 空中袭击者',
    'Mirage 5': '幻影 5',
    'Mirage F1': '幻影 F1',
    'SAAB 21': '萨博 21',
    'SAAB 17': '萨博 17',
    'SAAB 18': '萨博 18',
    'SAAB 105': '萨博 105',
    'Curtiss-Wright': '柯蒂斯-莱特',
    'Focke-Wulf': '福克-沃尔夫',
    'Savoia-Marchetti': '萨沃亚-马尔凯蒂',
    'Morane-Saulnier': '莫拉纳-索尼耶',
    'General Dynamics': '通用动力',
    'Pz. IV': '四号坦克',
    'Pz. III': '三号坦克',
    'Pz. II': '二号坦克',
    'Pz. I': '一号坦克',
    'Magach': '马加奇',
    'Merkava': '梅卡瓦',
    'Crusader': '十字军',
    'Valentine': '瓦伦丁',
    'StuG III': '三号突击炮',
    'Turán': '图兰',
    'Boxer': '拳师犬',
    'Ram': '公羊',
    'Rooikat': '猞猁',
    'MT-LB': 'MT-LB',
    'U-SH': 'U-SH',
    'VAB': 'VAB',
    'Wiesel': '鼬鼠',
    'GAZ-AA': 'GAZ-AA',
    'Panhard EBR': '庞阿尔 EBR',
    'Ratel': '獾',
    'SARC': 'SARC',
    'Hedgehog mortar': '刺猬炮',
    'Multi-Vehicle system': '多车系统',
    'Electro-optical APS': '光电主动防护系统',
    'Anti-aircraft vehicles': '防空车辆',
    'Krauss-Maffei': '克劳斯-玛菲',
    'Daimler-Benz': '戴姆勒-奔驰',
    'Thyssen-Henschel': '蒂森-亨舍尔',
    'Sandock-Austral': '桑多克-南方',
    'Marmon-Herrington': '马蒙-赫灵顿',
    'Scania-Vabis': '斯堪尼亚-瓦比斯',
    'Batignolles-Chatillon': '巴蒂尼奥勒-沙蒂永',
    'Hispano-Suiza': '伊斯帕诺-絮扎',
    'Agusta': '阿古斯塔',
    'Eurocopter': '欧洲直升机',
    'Fuji Heavy Industries': '富士重工',
    'MBB': 'MBB',
    'Sikorsky': '西科斯基',
    'Hughes': '休斯',
    'Kamov': '卡莫夫',
    'CAIC': '昌河飞机工业',
    'Hurricane Mk.I/L FAA M': '飓风 Mk I 后期型 (第 800 中队“M”号)',
    'Spitfire Mk IX': '喷火 Mk IX',
    'F-15I Ra’am': 'F-15I',
    'M4A3 (76) W': 'M4A3 (76) W',
    'Matilda III': '玛蒂尔达 III',
    'Chi-Ha Kai TD': '九七式中战车改 TD',
    'Hurricane Mk I/L FAA M': '飓风 Mk I 后期型 (第 800 中队“M”号)',
    'Barge': '驳船',
    'Sub-chaser': '猎潜艇',
    'Sub-chasers': '猎潜艇',
    'S-boot': 'S 艇',
    'R-boot': 'R 艇',
    'M-boot': 'M 艇',
    'Anti-air ferry': '防空渡轮',
    'Fairmile D': '费尔迈尔 D 型',
    'Schichau-Werke': '希肖船厂',
    'Saunders-Roe': '桑德斯-罗',
    'Hind-E': '雌鹿-E',
    'Two-plane stabilizer': '双轴稳定器',
    'Notice:': '注意：',
    'Heavy Tanks': '重型坦克',
    'Medium Tanks': '中型坦克',
    'Light Tanks': '轻型坦克',
    'Renault YR': '雷诺 YR',
    'Renault ACG': '雷诺 ACG',
    'Tornado IDS SLE': '狂风 IDS SLE',
    'Kusentei-type subchaser': '九三式特型猎潜艇',
    'Dark Aggressor TD': '黑暗侵略者 (TD)',
    'Pz.II C TD': '二号坦克 C 型 (TD)',
    'WZ1001(E) LCT': 'WZ1001(E)/长炮',
    'Flares & Chaff': '热焰弹/干扰箔',
    'Allows use of night vision devices.': '可使用夜视设备。',
    'Flares': '热焰',
    'Chaff': '干扰箔',
    'Filters:': '筛选：',
    'Year developed': '研发年份',
    'Editorial Note': '编者按',
    'Cold War': '冷战',
    'Modern Day': '现代',
    'Post-War Generation': '战后一代',
    'National Safety Force': '国家安全部队',
    'Air Realistic Battles': '空战历史模式',
    'Air Arcade Battles': '空战街机模式',
    'Enduring Confrontation': '持久对抗',
    'Air Assault': '空战突击',
    'Ground Assault': '陆战突击',
    '#japan': '#日本',
    'Table of Contents': '目录',
    'Nicknames:': '绰号：',
    'Examples:': '示例：',
    'Notes:': '备注：',
    'Role': '角色',
    'Large': '大型',
    'Order': '顺序',
    'Mitsubishi Aircraft': '三菱飞机',
    'Yakovlev Aircraft': '雅科夫列夫飞机',
    'North American': '北美',
    'Panther Family': '黑豹系列',
    'Tiger Family': '虎式系列',
    'Centurion Family': '百夫长系列',
    'Assault Mode': '突击模式',
    'Japanese Navy': '日本海军',
    'Japanese Offensive': '日本进攻',
    'Japanese Defensive': '日本防御',
    'Tank designations': '坦克命名',
    'Ship naming': '舰船命名',
    'Official name designation': '官方命名',
    'Literal Translation': '直译',
    'Carrier-based dive bomber': '舰载俯冲轰炸机',
    'Land-based attack bomber': '陆基攻击轰炸机',
    'Flying boat': '水上飞机',
    'Land-based fighter plane': '陆基战斗机',
    'Special purpose': '特殊用途',
    'Fighter hydroplane': '水上战斗机',
    'Land-based bomber': '陆基轰炸机',
    'Patrol plane': '巡逻机',
    'Night fighter': '夜间战斗机',
    'Torpedo boats': '鱼雷艇',
    'Gun Manufacturer/Designer': '火炮制造商/设计师',
    'BT series': 'BT 系列',
    'Ho-Ri series': 'Ho-Ri 系列',
    'Chi-Ha Long Gun': 'Chi-Ha 长炮',
    'Main Gun': '主炮',
    'Drop bomb': '投弹',
    'High-explosive shell': '高爆弹',
    'Smoke shell': '烟雾弹',
    'Zero-in the gun': '校射机炮',
    'Firing the Gun': '开火',
    'Fast firing cannon': '速射机炮',
    'Japanese Manucturer': '日本制造商',
    'Foreign Manufacturer': '外国制造商',
    'Foreign Example': '外国示例',
    'Testing grounds': '试验场',
    'Optical Detection': '光学探测',
    '#rocket': '#火箭弹',
    '#crew': '#乘员',
    'Shoulder stabilizer': '肩部稳定器',
    'Fire on the move': '行进射击',
    'TOP GUN': '顶级王牌',
    'Hired Gun': '雇佣枪手',
    'Aberdeen proving ground': '阿伯丁试验场',
    'School of Armour': '装甲学校',
    'Tribal chief': '部落酋长',
    'Turret —': '炮塔 —',
    'Special armament': '特殊武器',
    'Drogue parachute': '阻力伞',
    'Flares/Chaff + MAW': '热焰弹/干扰箔 + 导弹逼近告警',
    'Fairmile A': '费尔迈尔 A 型',
    'Fairmile B': '费尔迈尔 B 型',
    'Fairmile C': '费尔迈尔 C 型',
    'Fairmile D-class': '费尔迈尔 D 级',
    'T-34-85 (S-53) Model 1944': 'T-34-85 (S-53) 1944 型',
    'M4A4 (SA50) Sherman': 'M4A4 (SA50) 谢尔曼',
    'CAC Wirraway': '联邦飞机公司 维拉威',
    'F-4J(UK)/Phantom F.3': 'F-4J(UK)/鬼怪 F.3',
    'AV-8B+': 'AV-8B+',
    'PBY Catalinas': 'PBY 卡塔琳娜',
    '#aviation': '#航空',
    '#helicopters': '#直升机',
    '#battlepass': '#战斗通行证',
    '#controls': '#按键设置',
    '#gamemode': '#游戏模式',
    '#ammunition': '#弹种',
    '#bombs': '#炸弹',
    '#modules': '#模块',
    '#world_war': '#世界大战',
    '#economics': '#经济',
    'D-Day': '登陆日',
    'US version': '美版',
    'German version': '德版',
    'Soviet version': '苏版',
    'Picked-up Armor': '附加装甲',
    'Fishbed-C': '鱼窝-C',
    'Flanker-B': '侧卫-B',
    'Countermeasures to distract IR- and radar-seekers': '对抗措施，用于干扰红外和雷达导引头',
    'Alerts when an incoming missile is detected, and automatically deploys countermeasures': '检测到来袭导弹时发出警报，并自动释放对抗措施',
    'Missile Approach Warning System': '导弹逼近告警系统',
    "Notifies about the vehicle's exposure to radar emissions": '提示载具被雷达辐射照射',
    "Notifies about the vehicle's exposure to laser emissions": '提示载具被激光照射',
    'Improves low light visibility by enhancing natural light or active illumination': '通过增强自然光或主动照明改善低光能见度',
    'Visualizes thermal radiation from heat signatures in both day and night conditions': '在昼夜条件下可视化热信号的热辐射',
    "Projects an interface on the pilot's helmet visor and allows to aim weapons in the direction of view.": '在飞行员头盔面罩上投射界面，可沿视线方向瞄准武器',
    'A computer calculating parameters to aid targeting for better accuracy.': '计算参数以辅助瞄准、提高精度的计算机',
    'Reduces braking distance when landing on any runway': '在任何跑道降落时缩短制动距离',
    'Ability to vary the wing position to improve flight performance at different speeds': '可改变机翼位置以在不同速度下改善飞行性能',
    'Ability to create smoke screens using smoke grenades': '可使用烟雾弹制造烟幕',
    'Replacement of damaged elements of fuselage skinning, removal of openings, and surface finish to reduce air drag.': '更换机身蒙皮、修复结构破损及打磨接缝起伏，从而减小空气阻力。',
    'Replacement of damaged elements of wing skin, removal of openings, and surface finish to reduce air drag.': '更换机翼蒙皮、修复结构破损及打磨接缝起伏，从而减小空气阻力。',
    'Allows partial protection of the crew from fragmentation effect of flak and aerial shells.': '防破片服覆盖机组成员身体部位提高防护能力，减轻地面与空中火力对乘员的威胁。',
    'Replacement of damaged airframe elements increases overall durability and flight performance due to weight reduction.': '更换受损的机体组件，提高结构强度的同时减去冗余重量，从而改善飞行性能。',
    'Allows the installation of additional TDA unguided rockets.': '可携带额外的 TDA 火箭弹。',
    'Allows the installation of HOT-3 missiles.': '可携带 HOT-3 反坦克导弹。',
    'Allows the installation of AIM-92 Stinger missiles.': '可携带 AIM-92“毒刺”空对空导弹。',
    'Allows the installation of 2 x 100 lb bombs.': '可携带 2 枚 100 磅炸弹。',
    'Allows the installation of 2 x 50 kg bombs.': '可携带 2 枚 50 千克炸弹。',
    'Allows the installation of 50 kg bombs.': '可携带 50 千克炸弹。',
    'Allows the installation of 100 kg bombs.': '可携带 100 千克炸弹。',
    'Allows the installation of 150 kg bombs.': '可携带 150 千克炸弹。',
    'Allows the installation of 500 kg bombs.': '可携带 500 千克炸弹。',
    'Allows the installation of 1000 lb bombs.': '可携带 1,000 磅炸弹。',
    'Allows the installation of torpedo.': '可携带鱼雷。',
    'Set of Countermeasures': '干扰套件',
    'Engine Fire System.': '机载引擎灭火系统。',
    'Armor penetration (max.)': '最大穿透力',
    'Distance / Angle of attack': '距离 / 攻击角度',
    'Share': '分享',
    'Empty weight + oil + crew': '空重 + 油料 + 乘员',
    'Research:': '研发：',
    'Purchase:': '购买：',
    'Search': '搜索',
    'Radar Warning System': '雷达告警系统',
    'Launch range': '发射距离',
    'Radar gunsight': '雷达瞄准具',
    'Afterburner': '加力燃烧室',
    'Kinetic': '动能弹',
    'Cumulative jet': '聚能破甲弹',
    'Fuze Delay': '引信延迟',
    'Fuze Sensitivity': '引信灵敏度',
    'Explosive Reactive Armour': '爆炸反应装甲',
    'Optics resolution': '观瞄分辨率',
    'Commander: NVD': '车长：夜视设备',
    'Driver: NVD': '驾驶员：夜视设备',
    'Separate antennas': '独立天线',
    'Armed Forces of Greece': '希腊武装部队',
    'CVR(T) family of vehicles': 'CVR(T) 载具家族',
    'Radial, 14-cylinder': '星形，14 缸',
    'Radial, 18-cylinder': '星形，18 缸',
    'Installation of pontoons': '安装浮筒，从而获得水上浮渡能力。',
    'Electro-optical Active Protection System': '光电主动防护系统',
    'Semi-Armour Piercing': '半穿甲',
    'Semi-armour piercing': '半穿甲',
    'Medium-range SAM': '中程防空导弹',
    'short-range SAM': '近程防空导弹',
    'Cannon & Artillery': '机炮与火炮',
    'Destroyer Escort': '护航驱逐舰',
    'Reconnaissance Combat Vehicle': '侦察战斗车',
    'Maneuver Combat Vehicle': '机动战斗车',
    'Airborne Assault Vehicle': '空降突击车',
    'Armored Reconnaissance': '装甲侦察',
    'Gun Motor Carriage': '自行火炮',
    'Active Electronically Scanned Array': '有源相控阵',
    'Active Radar-Homing': '主动雷达制导',
    'Hunt Cruiser': '猎潜巡洋舰',
    'Chaff countermeasures': '干扰箔',
    'Commander can drive': '车长可驾驶',
    'P: Practice shell': 'P：练习弹',
    '+ Separate antennas': '+ 独立天线',
    'Radial, 9-cylinder': '星形，9 缸',
    'Radial, 28-cylinder': '星形，28 缸',
    'Radial, 5-cylinder': '星形，5 缸',
    'Destroyer Anti-Submarine': '反潜驱逐舰',
    'Medium Extended Air Defense System': '中程增程防空系统',
    'Cleaning the ship’s bottom from seashells and algae. Increases maximum forward speed.': '在干船坞对舰船进行维护，清理船体上附着的贝类和海藻，从而提升最大前进航速。',
    'Reduces the swing of the gun in two planes while moving': '减少行进中火炮在双平面上的摆动',
    'The ability to quickly reduce aircraft weight by dumping fuel from the main tanks': '可从主油箱放油以快速降低飞机重量',
    'Reduces the swing of the gun in one plane while moving': '减少行进中火炮在单平面上的摆动',
    'Vocally announces the pilot about dangerous situations': '向飞行员语音播报危险情况',
    'The design allows you to swim and control movement in the water': '该设计允许在水中浮渡并控制移动',
    'API-T: M20 Armor-piercing incendiary tracer bullet': 'API-T：M20 穿甲燃烧曳光弹',
    'Allows you to join an air battle activated by an ally on bomber or attacker (for example, in Tank Arcade Battles).': '可加入友军轰炸机或攻击机发起的空战（例如在坦克街机模式中）。',
    'In modes with respawn points, you can additionally reduce the aircraft spawn cost for each scouted player killed by an ally (for example, in Tank Realistic Battles).': '在带重生点的模式中，友军击杀你侦察到的玩家可额外降低飞机重生成本（例如在坦克历史模式中）。',
    'Layered composite material arrays to better absorb the energy of incoming projectiles': '多层复合材料阵列，更好吸收来袭弹丸的能量',
    'Enhanced protection using high explosives to deflect or destroy impacting projectiles': '利用高爆炸药偏转或摧毁来袭弹丸，提供增强防护',
    'Ability to lay a smoke screen behind the vehicle through the exhaust': '可通过排气在车后施放烟幕',
    'Creation of ramparts and trenches in soft ground': '可在松软地面构筑壁垒与壕沟',
    'A crew member can take on the role of an out-of-action crew member without having to spend time moving': '乘员可接替失去战斗力的乘员岗位，无需花费时间移动',
    'Determines the distance to a point and automatically calibrates the gun sight': '测定目标距离并自动校准火炮瞄准具',
    'Automatically feeds projectiles into the breech. The speed does not depend on the skills of the loader': '自动将弹丸送入炮膛，装填速度不受装填手技能影响',
    'Accelerates braking by grabbing the brake cable on the deck of the aircraft carrier': '通过钩住航母甲板拦阻索加速制动',
    'Allows launching a remotely piloted aircraft from the ship deck.': '可从舰艇甲板放飞遥控飞机。',
    'Reduces the error and increases the maximum measurable distance of the rangefinder': '降低误差并提高测距仪最大可测距离',
    'AP-I: M8 Armor-piercing incendiary bullet': 'AP-I：M8 穿甲燃烧弹',
    'Forward and backward movement is possible at the same maximum speed': '前进与后退均可达到相同最大速度',
    'Detects projectiles flying towards the vehicle and destroys them with a counter-aimed shot.': '检测飞向载具的弹丸并用反向瞄准射击将其摧毁。',
    'Allows launching an uncrewed aerial vehicle for terrain reconnaissance.': '可放飞无人机进行地形侦察。',
    'It is possible to adjust the ground clearance or more complex suspension positions': '可调节离地间隙或更复杂的悬挂位置',
    'The ability to take off and land vertically without a takeoff run': '无需滑跑即可垂直起降',
    'Prevents guidance of antitank guided missiles and diverts them from target vehicle.': '阻止反坦克导弹制导并将其引离目标载具。',
    "To differentiate from the 'Type 2 Twin-Seat' Ki-45": '用于与“双座二型”Ki-45 区分',
    'Scientific Research Institute of Artillery': '炮兵科学研究所',
    'Allows the installation of guided anti-ship missiles:': '可携带反舰导弹：',
    'Allows the installation of anti-radiation missiles:': '可携带反辐射导弹：',
    'Allows the installation of AGM-65 missiles:': '可携带 AGM-65 导弹：',
    'Additional rocket engines that increase thrust briefly during takeoff or combat': '附加火箭发动机，可在起飞或战斗时短暂增加推力',
    'Allows the installation of bombs of up to 250 kg': '可携带 2 枚二五番二号爆弹或九八式二五番爆弹。',
    'HEAT: High explosive anti-tank projectile': 'HEAT：高爆反坦克弹',
    'Classified as a heavy tank in Hungary due to its cannon calibre': '因主炮口径在匈牙利被归类为重型坦克',
    'Allows the use of belts Perforante mod.35.': '可使用 Perforante 35 型弹链。',
    'Central Aerohydrodynamic Institute of Moscow': '莫斯科中央空气流体动力研究院',
    'Countermeasures to distract radar-seekers': '对抗措施，用于干扰雷达导引头',
    'Upgrading the BMP-2 by enhancing its side armor.': '通过加强侧装甲升级 BMP-2。',
    'The BMP-2D lost its ability to cross rivers by swimming due to the increased mass.': 'BMP-2D 因质量增加而丧失浮渡能力。',
    'elevated panoramic HOT launch module on rotating turret': '旋转炮塔上的高置全景 HOT 发射模块',
    'Allows the installation of TV guided missiles:': '可携带电视制导导弹：',
    'Modification of the Su-24M2 allowing the installation 500 kg bombs:': 'Su-24M2 可携带 500 千克炸弹的改装：',
    'Anti-Char Rapide Autopropulsé; Self-Propelled Rapid Anti-Tank': '快速自行反坦克炮',
    'Allows the installation of 128 mm unguided rockets:': '可携带 128 毫米无制导火箭弹：',
    'Allows the use of belts Perforante mod.35.': '可使用 Perforante 35 型弹链。',
    "Cleaning the ship's bottom from seashells and algae. Increases maximum forward speed.": '清理船底贝类与藻类，提高最大前进速度。',
    'To differentiate from the Type 2 Twin-Seat Ki-45': '用于与“双座二型”Ki-45 区分',
    'Shenyang': '沈阳',
    'rating': '评分',
    'articles': '文章',
    'article': '文章',
    'usually': '通常',
    'provinces': '省份',
    'key': '关键',
    'three': '三',
    'one': '一',
    'two': '二',
    'achievements': '成就',
    'wagers': '赌注',
    'challenges': '挑战',
    'camouflages': '涂装',
    'decals': '贴花',
    'decorators': '装饰件',
    'selected': '已选择',
    'strictly': '严格',
    'spawnable': '可生成',
    'never': '从不',
    'sound': '声音',
    'link': '链接',
    'tracking': '追踪',
    'search': '搜索',
    'weight': '重量',
    'rotation': '旋转',
    'tag': '标签',
    'effect': '效果',
    'here': '这里',
    'time': '时间',
    'models': '模型',
    'type': '类型',
    'real': '真实',
    'ballistics': '弹道',
    'bullet': '子弹',
    'off': '关',
    'open': '打开',
    'speed': '速度',
    'empty': '空',
    'fuel': '燃料',
    'text': '文本',
    'color': '颜色',
    'track': '履带',
    'options': '选项',
    'yes': '是',
    'value': '数值',
    'add': '添加',
    'count': '数量',
    'manual': '手动',
    'category': '类别',
    'enabled': '已启用',
    'standard': '标准',
    'name': '名称',
    'content': '内容',
    'radar': '雷达',
    'premium': '高级',
    'mass': '质量',
    'video': '视频',
    'first': '第一',
    'title': '标题',
    'crew': '乘员',
    'image': '图像',
    'engine': '发动机',
    'all': '全部',
    'page': '页面',
    'Ships': '舰艇',
    'Hydroplane': '水上飞机',
    'Designer': '设计师',
    'plating': '装甲板',
    'Training': '训练',
    'Conversion': '改造',
    'Unit': '单位',
    'Assignment': '指派',
    'ML': 'ML',
    'unknown': '未知',
    'Prototype': '原型',
    'Fokker': '福克',
    'storage': '储存',
    'depot': '仓库',
    'MFD': '多功能显示器',
    'NVD': '夜视仪',
    'Redouts': '红视',
    'Blackouts': '黑视',
    'Fighters': '战斗机',
    'Strike aircraft': '攻击机',
    'Bombers': '轰炸机',
    'Jet aircraft': '喷气式飞机',
    'UCAVs': '无人机',
    'Medium tank': '中型坦克',
    'Light tank': '轻型坦克',
    'Armor and survivability': '装甲与生存能力',
    'Use in combat': '作战运用',
    'Historical background': '历史背景',
    'Design and construction': '设计与建造',
    'The fate of the ship': '舰船命运',
    'Sources': '资料来源',
    'Rules': '规则',
    'Formatting help': '格式帮助',
    'Popular first': '热门优先',
    'Update': '更新',
    'Categories:': '分类：',
    'Vehicles mentioned:': '提及的载具：',
    'Recommendation feed': '推荐流',
    'No comments yet': '暂无评论',
    'Be the first to write one!': '成为第一个评论的人！',
    'Regular events': '常规活动',
    'Twitch Drops': 'Twitch 掉落',
    '#review': '#评测',
    '#history': '#历史',
    '#weapon': '#武器',
    '#mechanics': '#机制',
    '#video': '#视频',
    '#article': '#文章',
    // ===== 自动装弹机 / 同轴武器 / 观瞄稳定系统 =====
    'Autoloader': '自动装弹机',
    'autoloader': '自动装弹机',
    'Coaxial': '同轴',
    'coaxial': '同轴',
    'Coaxial machine gun': '同轴机枪',
    'coaxial machine gun': '同轴机枪',
    'Coaxial machine guns': '同轴机枪',
    'coaxial machine guns': '同轴机枪',
    'Coaxial Machine Gun': '同轴机枪',
    'Coaxial Machine Guns': '同轴机枪',
    'Machine Gun': '机枪',
    'Machine gun': '机枪',
    'Machine Guns': '机枪',
    'Machine guns': '机枪',
    'Machine gun armament': '机枪配置',
    'Machine gun doctrine': '机枪条令',
    'Two-plane stabilizer': '双向稳定器',
    'two-plane stabilizer': '双向稳定器',
    'Vertical stabilizer': '单向稳定器',
    'vertical stabilizer': '单向稳定器',
    'Single-plane stabilizer': '单向稳定器',
    'Shoulder rest': '肩托稳定器',
    'Stabilizer': '火炮稳定器',
    'stabilizer': '稳定器',
    'First-order': '第一弹药架',
    'First-order ammo rack': '第一弹药架',
    'first-order ammo rack': '第一弹药架',
    'First stage stowage': '第一备弹架',
    'Ready rack': '第一备弹架',
    'Ready rack ammo capacity': '第一备弹架容量',
    'Laser rangefinder': '激光测距仪',
    'Laser Rangefinder': '激光测距仪',
    'Laser range finder': '激光测距仪',
    'Self-entrenching equipment': '自掘设备',
    'Dozer Blade': '推土铲',
    'Dozer blade': '推土铲',
    'Brake System': '刹车装置',
    'Suspension': '悬挂系统',
    'Horizontal Drive': '方向机',
    'Elevation Mechanism': '高低机',
    'Adjustment of Fire': '校准主炮',
    'Improved Parts': '进阶维修套件',
    'Improved FPE': '进阶灭火套件',
    'Crew Replenishment': '补充乘员',
    'NVD upgrade': '改进夜视设备',
    'Defensive armament': '自卫武器配置',
    'Defensive Armament': '自卫武器配置',
    'Defensive capability': '防御能力',
    'Defensive capabilities': '防御能力',
    'Wing area': '翼面积',
    'Empty mass': '空重',
    'Service ceiling': '实用升限',
    'Bomb load': '载弹量',
    'Width': '宽度',
    'Height': '高度',
    // ===== 界面与经济字段 =====
    'Free': '免费',
    'free': '免费',
    'Source': '来源',
    'source': '来源',
    'Source.': '来源。',
    'left': '左',
    'right': '右',
    'Both': '两者',
    'both': '两者',
    'Yes': '是',
    'yes': '是',
    'No': '否',
    'no': '否',
    'Silver Lions': '银狮',
    'Golden Eagles': '金鹰',
    'Warbonds': '作战物资债券',
    'Research Points': '研发点',
    'Silver Lions (SL)': '银狮 (SL)',
    'Golden Eagles (GE)': '金鹰 (GE)',
    'Warbonds (WB)': '作战物资债券 (WB)',
    'Research Points (RP)': '研发点 (RP)',
    'RP Booster': '研发点加成卡',
    'RP Booster': '研发点加成卡',
    'SL Booster': '银狮加成卡',
    'SL Booster': '银狮加成卡',
    'RP Booster pack': '研发点加成卡包',
    'SL Booster pack': '银狮加成卡包',
    'Universal back-ups': '通用备用载具',
    'Universal back-up': '通用备用载具',
    'Wager': '作战指令',
    'Pros:': '优点：',
    'Cons:': '缺点：',
    'Stealth:': '隐蔽：',
    'Default:': '默认：',
    'Warning:': '警告：',
    'Legend:': '图例：',
    'Level': '等级',
    'Prize': '奖励',
    'Battle Pass levels': '战斗通行证等级',
    'Battle Pass levels chart': '战斗通行证等级表',
    'Season challenges': '赛季挑战',
    'Season challenges chart': '赛季挑战表',
    'Premium account': '高级账号',
    'premium account': '高级账号',
    'No penalty': '无惩罚',
    'Service History': '服役历史',
    'Development and Production': '研发与生产',
    'Development': '研发历程',
    'Modifications and modules': '改装件与模块',
    'Table of contents': '目录',
    'Bibliography': '参考书目',
    'Pages of History': '历史篇章',
    'Hotline': '热线',
    'Ammunitions': '弹药',
    'No articles on this topic yet': '暂无关于该主题的文章',
    'We have nothing to recommend to you at the moment :(': '我们目前没有可向您推荐的内容 :(',
    'Aircraft effects': '航空战损效果',
    'Ground explosions': '地面爆炸效果',
    'Naval effects': '舰艇战损效果',
    'Object crash': '物体撞击',
    'Wiki Team': '百科团队',
    'Wiki team': '百科团队',
    'The Wiki team': '百科团队',
    'The Wiki Team': '百科团队',
    '[Wiki Team]': '[百科团队]',
    '[Wiki team]': '[百科团队]',
    // ===== 舰船与载具分类 =====
    'Boat': '小艇',
    'boat': '小艇',
    'Light cruiser': '轻巡洋舰',
    'Light Cruiser': '轻巡洋舰',
    'Heavy cruiser': '重巡洋舰',
    'Heavy Cruiser': '重巡洋舰',
    'Frigate': '护卫舰',
    'frigate': '护卫舰',
    'Motor torpedo boat': '鱼雷艇',
    'Motor Torpedo Boat': '鱼雷艇',
    'Motor gun boat': '机动炮艇',
    'Motor Gun Boat': '机动炮艇',
    'Sub-chaser': '猎潜艇',
    'Subchaser': '猎潜艇',
    'Sub-chasers': '猎潜艇',
    'Subchasers': '猎潜艇',
    'Barge': '驳船',
    'Barges': '驳船',
    'Armored gun boat': '装甲炮艇',
    'Armoured gun boat': '装甲炮艇',
    'Minelayer': '布雷舰',
    'Minelayers': '布雷舰',
    'Minesweeper': '扫雷艇',
    'Minesweepers': '扫雷艇',
    'Gunboat': '炮艇',
    'Gun boat': '炮艇',
    'Gunboats': '炮艇',
    'Patrol boat': '巡逻艇',
    'Patrol Boat': '巡逻艇',
    'Patrol boats': '巡逻艇',
    'Fast attack craft': '快速攻击艇',
    'Hydrofoil': '水翼艇',
    'Hydrofoils': '水翼艇',
    'Dreadnought': '无畏舰',
    'Dreadnoughts': '无畏舰',
    'Tank Destroyer': '坦克歼击车',
    'Tank Destroyers': '坦克歼击车',
    'Tank destroyers': '坦克歼击车',
    'Light Tank': '轻型坦克',
    'Light Tanks': '轻型坦克',
    'Light tanks': '轻型坦克',
    'Medium Tank': '中型坦克',
    'Medium Tanks': '中型坦克',
    'Medium tanks': '中型坦克',
    'Heavy Tank': '重型坦克',
    'Heavy Tanks': '重型坦克',
    'Heavy tanks': '重型坦克',
    'Strike aircraft': '对地攻击机',
    'Strike Aircraft': '对地攻击机',
    'Interceptor': '截击机',
    'Interceptors': '截击机',
    'Dive bomber': '俯冲轰炸机',
    'Dive Bomber': '俯冲轰炸机',
    'Dive bombers': '俯冲轰炸机',
    'Torpedo bomber': '鱼雷轰炸机',
    'Torpedo Bomber': '鱼雷轰炸机',
    'Torpedo bombers': '鱼雷轰炸机',
    'Flying boat': '水上飞机',
    'Flying Boat': '水上飞机',
    'Flying boats': '水上飞机',
    'Floatplane': '水上飞机',
    'Floatplanes': '水上飞机',
    'Jet fighter': '喷气战斗机',
    'Jet Fighter': '喷气战斗机',
    'Jet fighters': '喷气战斗机',
    'Turboprop': '涡桨',
    'Turboprops': '涡桨',
    // ===== 界面交互、标签与属性 =====
    'Write a comment...': '写下评论...',
    'Comment': '评论',
    'Comments': '评论',
    'Delete': '删除',
    'Air Battles': '空战',
    'Ground Battles': '陆战',
    'Naval Battles': '海战',
    'Sort': '排序',
    'Useful': '有用',
    'Funny': '有趣',
    "Don't like": '不喜欢',
    'Name…': '名称...',
    'Name...': '名称...',
    'subscribers': '位订阅者',
    'Conclusion': '结语',
    'Early Development': '早期研发',
    'Positioning': '站位技巧',
    'Strategy': '作战策略',
    'Plane Characteristics': '飞机性能特性',
    'Secondary Armaments': '次要武器配置',
    'Armor and Survivability': '装甲与生存性',
    'Fuel for additional engines': '辅助引擎燃料',
    'Explosive mass (TNTe)': '装药量 (TNT当量)',
    'Max armour': '最大装甲厚度',
    'Gun calibre': '主炮口径',
    'Battle Pass bonus pack (RP Boosters, Back-ups, Silver Lions)': '战斗通行证加成包（研发点加成卡、备用载具、银狮）',
    'Battle Pass bonus pack (RP\xa0Boosters, Back-ups, Silver Lions)': '战斗通行证加成包（研发点加成卡、备用载具、银狮）',
    'Battle Pass bonus pack (SL Boosters, Back-ups, Silver Lions)': '战斗通行证加成包（银狮加成卡、备用载具、银狮）',
    'Battle Pass bonus pack (SL\xa0Boosters, Back-ups, Silver Lions)': '战斗通行证加成包（银狮加成卡、备用载具、银狮）',
    'Purchase a special bundle from the store': '从商店购买特殊礼包',
    ': Purchase a special bundle from the store': '：从商店购买特殊礼包',
    'From the moment of receipt to the end of the season': '自获取时起至赛季结束',
    'Camouflage:': '涂装：',
    'Camouflage net': '伪装网',
    'camouflage net': '伪装网',
    'Camouflage trophy': '涂装物资箱',
    'Custom skins': '自定义涂装',
    'Working with Camouflage Nets': '使用伪装网',
    'Deforming': '变形迷彩',
    'Digital': '数码迷彩',
    'Bicolor summer': '双色夏季迷彩',
    'Tricolor summer': '三色夏季迷彩',
    'Bicolor desert': '双色沙漠迷彩',
    'Tricolor desert': '三色沙漠迷彩',
    'Winter': '冬季迷彩',
    'Summer': '夏季迷彩',
    'Desert': '沙漠迷彩',
    'Forest': '森林迷彩',
    'Unicolor': '单色迷彩',
    'Bicolor': '双色迷彩',
    'Tricolor': '三色迷彩',
    'Monochrome': '单色',
    'Spotted': '斑点迷彩',
    'Striped': '条纹迷彩',
    '(heavy tank)': '（重型坦克）',
    '(medium tank)': '（中型坦克）',
    '(light tank)': '（轻型坦克）',
    '(tank destroyer)': '（坦克歼击车）',
    '(SPAA)': '（防空车）',
    '(coaxial)': '（同轴）',
    '(pintle)': '（枪架）',
    '(roof)': '（车顶）',
    '(bow)': '（航向）',
    '(hull)': '（车体）',
    '(turret)': '（炮塔）',
    '(rear)': '（后部）',
    '(fixed)': '（固定）',
    '(flexible)': '（活动）',
    '(optional)': '（可选）',
    '(tandem)': '（串联）',
    'Flight Performance': '飞行性能',
    'Flight performance': '飞行性能',
    'Flight characteristics': '飞行特性',
    'Air-to-Air Capabilities': '空空作战能力',
    'Air-to-ground capabilities': '对地攻击能力',
    'Defensive systems': '防御系统',
    'Sensors and radars': '传感器与雷达',
    'Sources:': '参考资料：',
    'Usage in Battles': '作战使用指南',
    'Usage in battle': '作战使用指南',
    'Usage in Battles:': '作战使用指南：',
    'Availability': '获取途径',
    'Ground vehicles': '地面载具',
    'Requirements': '要求',
    'Background': '背景',
    'Time to complete (DD.MM)': '完成时间（日.月）',
    'Design': '设计',
    'Maneuverability': '机动性',
    'Gameplay': '游戏玩法',
    'Front': '正面',
    'Rear': '后部',
    'Side': '侧面',
    'Top': '顶部',
    'Bottom': '底部',
    'Action': '操作',
    'Pros & Cons': '优缺点',
    'Pros and Cons': '优缺点',
    'Armor layout': '装甲布局',
    'Bomb': '炸弹',
    'Bombs': '炸弹',
    'Rocket': '火箭弹',
    'Rockets': '火箭弹',
    'Torpedo': '鱼雷',
    'Torpedoes': '鱼雷',
    'Depth charge': '深水炸弹',
    'Depth charges': '深水炸弹',
    'Mine': '水雷',
    'Mines': '水雷',
    'Variants:': '型号变种：',
    'Variants': '型号变种',
    'Standard': '标准',
    'Operational history': '服役历史',
    'Builder': '造船厂',
    'Credit': '鸣谢',
    'Credits': '鸣谢',
    'Challenge': '挑战',
    'Challenges': '挑战',
    'Ground Realistic Battles': '陆战历史模式',
    'Ground Arcade Battles': '陆战街机模式',
    'Ground Simulator Battles': '陆战全真模式',
    'Air Realistic Battles': '空战历史模式',
    'Air Arcade Battles': '空战街机模式',
    'Air Simulator Battles': '空战全真模式',
    'Naval Realistic Battles': '海战历史模式',
    'Naval Arcade Battles': '海战街机模式',
    'Miscellaneous': '其他',
    'IRCM': '红外干扰系统',
    'Image credit:': '图片来源：',
    'Image Credit:': '图片来源：',
    '[Source]': '[来源]',
    'premium pack': '高级礼包',
    'Premium pack': '高级礼包',
    'Aircraft explosions': '航空爆炸效果',
    'Naval explosions': '舰艇爆炸效果',
    'Same as standard mode.': '与标准模式相同。',
    'Receive a specified number of streaks': '获得指定数量的连续作战奖励',
    'Receive a specified number of the streaks': '获得指定数量的连续作战奖励',
    'Unknown functionality': '未知功能',
    'test-drive': '试驾/试飞',
    'Test drive': '试驾/试飞',
    'Test-drive': '试驾/试飞',
    'SP only': '仅限单人模式',
    'Good mobility': '良好的机动性',
    'Destroy or help allied players destroy the specified number of player vehicles': '击毁或协助队友击毁指定数量的敌方玩家载具',
    'Destroy the specified number of player vehicles': '击毁指定数量的敌方玩家载具',
    'Main armament': '主要武器',
    'Top Speed': '最高速度',
    'Launch': '发射',
    'World War Trophy': '世界大战作战物资箱',
    'Decommissioned': '已退役',
    'Camera control': '视角控制',
    'Movement': '移动控制',
    'RP boosters set': '研发点加成卡组',
    'SL boosters set': '银狮加成卡组',
    'Recommended loadout': '推荐挂载',
    'Updated textures and 3D model:': '更新纹理与3D模型：',
  });

  // BEGIN GENERATED UNIT TRANSLATIONS
  const UNIT_TRANSLATIONS = {
    meteor_fmk3: '流星 F.3',
  };
  const UNIT_NAME_TRANSLATIONS = {
    'Meteor F Mk 3': '流星 F.3',
  };
  // END GENERATED UNIT TRANSLATIONS

  // BEGIN GENERATED TERM TRANSLATIONS
  const TERM_TRANSLATIONS = {
    '20 mm Hispano Mk II cannon': '20 毫米 西斯帕诺 Mk II 机炮',
    '1000 lb H.E. M.C. Mk 13 bomb': '1,000 磅 HE MC Mk 13 炸弹',
  };
  // END GENERATED TERM TRANSLATIONS

  // BEGIN GENERATED UNLOCKS TRANSLATIONS
  const UNLOCKS_TRANSLATIONS = {};
  // END GENERATED UNLOCKS TRANSLATIONS

  const NICKNAMES = Object.freeze({
    'Apache': '阿帕奇',
    'Cobra': '眼镜蛇',
    'Huey': '休伊',
    'Tiger': '虎',
    'Sherman': '谢尔曼',
    'Mustang': '野马',
    'Sabre': '佩刀',
    'Würger': '屠夫鸟',
    'Fighting Falcon': '战隼',
    'Leviathans': '利维坦',
    'Night Vision': '夜视',
    'The Valkyries': '女武神',
    'Drone Age': '智械纪元',
    'Wind of Change': '变迁之风',
    'Danger Zone': '危险地带',
    'Sons of Attila': '阿提拉之子',
    'Winged Lions': '展翼雄狮',
    'Regia Aeronautica': '意大利皇家空军',
    'Vive la France': '法兰西万岁',
    'Northern Wind': '北风',
    'Viking Fury': '维京之怒',
    'Starfighters': '星战士',
    'Intellectual': '智力',
    'Project X': 'X 计划',
    'Sidewinder': '响尾蛇',
    'Maverick': '小牛',
    'Sparrow': '麻雀',
    'Paveway': '宝石路',
    'Zuni': '祖尼',
    'Vikhr': '旋风',
    'Hellfire': '地狱火',
    'Tiny Tim': '小蒂姆',
    'Havoc': '浩劫',
    'Catalina': '卡塔琳娜',
    'Peashooter': '豌豆射手',
    'Skyraider': '空中袭击者',
    'Phantom II': '鬼怪 II',
    'Typhoon': '台风',
    'Hammer': '锤',
    'Albatros': '信天翁',
  });

  const UPDATE_NAMES = Object.freeze({
    'Active Search': '主动搜索',
    'Advancing Storm': '风暴来临',
    'Air Superiority': '空中霸权',
    'Alpha Strike': '阿尔法出击',
    'Apex Predators': '终极捕食者',
    'Apex Predators.': '终极捕食者',
    'Assault': '突击',
    'Battle March': '战斗进行曲',
    'Battlefield Engineer': '战场工程师',
    'Big Guns': '巨炮',
    'Black Shark': '黑鲨',
    'Cold Steel': '冷钢',
    'Dance of Dragons': '飞龙在天',
    'Dance of the Dragons': '飞龙在天',
    'Danger Zone': '危险地带',
    'Desert Hunters': '沙漠猎手',
    'Direct Hit': '直接命中',
    'Drone Age': '智械纪元',
    'Festive Quest': '节日大探险',
    'Fire Storm': '火焰风暴',
    'Fire and Ice': '火与冰',
    'Firebirds': '浴火飞鸟',
    'Firestorm': '火风暴',
    'Flaming Arrows': '烈焰之箭',
    'Ground Breaking': '开天辟地',
    'Heavy Cavalry': '重装骑兵',
    "Hornet's Sting": '黄蜂之蜇',
    'Hornet’s Sting': '黄蜂之蜇',
    "Wasp's Sting": '黄蜂之蜇',
    'Hot Tracks': '炽热轨迹',
    'Imperial Fleet': '帝国舰队',
    'Imperial Navy': '帝国海军',
    'Ixwa Strike': '祖鲁之矛',
    'Kings of Battle': '战争之王',
    'La Royale': '贵族胄裔',
    'La Royale.': '贵族胄裔',
    'La Résistance': '抵抗运动',
    'Leviathans': '利维坦',
    'The Leviathans': '利维坦',
    'Line of Contact': '火线交锋',
    'Locked On': '锁定目标',
    'Locked on!': '锁定目标！',
    'Masters of the Sea': '海洋霸主',
    'New E.R.A': '新时代',
    'New E.R.A.': '新时代',
    'New Power': '新征程',
    'Night Vision': '夜视',
    'Ninth Wave': '问鼎九天',
    'Northern Wind': '北风',
    'Northern wind': '北风',
    'Operation H.E.A.T.': '炽焰行动',
    'Operation S.U.M.M.E.R.': '夏日总动员',
    'Project X': 'X 计划',
    'Project-X': 'X 计划',
    'Raining Fire': '焰雨',
    'Red Skies': '赤色长空',
    'Regia Aeronautica': '意大利皇家空军',
    'Regia Marina': '意大利皇家海军',
    'Regina Marina': '意大利皇家海军',
    'Regio Aeronautica': '意大利皇家空军',
    'Road to Glory': '荣耀之路',
    'Royal Armor': '皇家装甲',
    'Royal Armour': '皇家装甲',
    'Seek & Destroy': '寻猎者',
    'Seek and Destroy': '寻猎者',
    'Shark Attack': '鲨鱼出击',
    'Sky Guardians': '天空卫士',
    'Sons of Attila': '阿提拉之子',
    'Spearhead': '进攻矛头',
    'Starfighters': '星战士',
    'Steel Generals': '钢铁将军',
    'Storm Warning': '风暴来袭',
    'Supersonic': '超音速',
    'The Valkyries': '女武神',
    'Trophy Exchange': '作战物资兑换',
    'Tusk Force': '战象先锋',
    'Valkyrie': '空中女武神',
    'Viking Fury': '维京之怒',
    'Viking Fury (test)': '维京之怒（测试）',
    'Vive la France': '法兰西万岁',
    'Vive la France.': '法兰西万岁',
    'Way of the Samurai': '武士之道',
    'Weapons of Victory': '胜利武器',
    'Wind of Change': '变迁之风',
    'Winged Lions': '展翼雄狮',
    'World War': '世界大战',
    'eSport': '电竞赛事',
    'eSport II': '电竞赛事·第二季',
    'eSport III': '电竞赛事·第三季',
  });

  const BATTLE_PASS_SEASONS = Object.freeze({
    '75th Anniversary of the Great Victory': '伟大胜利75周年',
    '75th Anniversary of the Victory in the Great Patriotic War': '卫国战争胜利75周年',
    '75th Anniversary of Victory in the Great Patriotic War': '卫国战争胜利75周年',
    'Brave Archer': '英勇射手',
    "Her Majesty's Hussar": '近卫骠骑兵',
    'Her Majesty’s Hussar': '近卫骠骑兵',
    'Tropical Storm': '热带风暴',
    'Armoured Elephant': '重装巨象',
    'Armored Elephant': '重装巨象',
    'Fearless Voltigeur': '无畏掷弹兵',
    'Smell of Victory': '胜利的气息',
    'Royal Guard': '皇家卫队',
    'Airborne General': '伞兵将军',
    'River Hunter': '内河猎手',
    'Guided Fury': '精确打击',
    'Northern King': '北境之王',
    'Field Test': '野外实测',
    'Seasoned Marksman': '历战神射手',
    'Guiding Heavenly Fire': '引领天火',
    'The Last Legionnaire': '最后的军团战士',
    'Mysterious Musketeer': '神秘火枪手',
    "Apollo's Chariot": '阿波罗战车',
    'Apollo’s Chariot': '阿波罗战车',
    'Do It Yourself': '自己动手',
  });

  const SHELL_TYPES = Object.freeze({
    'Armor-piercing tracer bullet': '穿甲曳光弹',
    'Armor-piercing bullet': '穿甲弹',
    'Armor-piercing incendiary bullet': '穿甲燃烧弹',
    'Armor-piercing incendiary tracer bullet': '穿甲燃烧曳光弹',
    'Immediate-action incendiary bullet': '瞬爆燃烧弹',
    'Incendiary bullet': '燃烧弹',
    'Incendiary tracer bullet': '燃烧曳光弹',
    'Omni-purpose bullet': '通用弹',
    'Tracer bullet': '曳光弹',
    'High-explosive incendiary shell': '高爆燃烧弹',
    'High-explosive fragmentation shell': '高爆破片弹',
    'High-explosive fragmentation tracer shell': '高爆曳光弹',
    'High-explosive fragmentation incendiary shell': '高爆燃烧破片弹',
    'High-explosive fragmentation incendiary tracer shell': '高爆燃烧曳光破片弹',
    'High-explosive fragmentation incendiary tracer shell (self-destroying)': '高爆燃烧曳光破片弹（自毁）',
    'Semi-armor-piercing incendiary shell': '半穿甲燃烧弹',
    'Tracer shell': '曳光弹',
    'Armor-piercing high-explosive shell': '穿甲高爆弹',
    'Armor-piercing high explosive shell': '穿甲高爆弹',
    'Armor-piercing capped shell': '被帽穿甲弹',
    'Armor-piercing capped ballistic capped shell': '被帽风帽穿甲弹',
    'Semi-armor-piercing capped ballistic capped shell': '半穿甲被帽风帽弹',
    'Semi-armor-piercing ballistic capped shell': '半穿甲风帽弹',
    'Semi-armor-piercing flat-nosed ballistic capped shell': '半穿甲平头风帽弹',
    'Semi-armor-piercing shell': '半穿甲弹',
    'High-explosive with time fuze': '时间引信高爆弹',
    'High-explosive with base fuze': '底部引信高爆弹',
    'High-explosive variable time fuze shell': '可变时间引信高爆弹',
    'Armor-piercing discarding sabot shell': '脱壳穿甲弹',
    'Armor-Piercing Fin-Stabilized Discarding Sabot shot': '尾翼稳定脱壳穿甲弹',
    'Common shell': '普通弹',
    'Special common shell': '特种普通弹',
    'Smoke Shell': '烟雾弹',
    'Smoke - Smoke Shell': '烟雾弹',
    'High explosive anti-tank shell': '高爆反坦克弹',
    'Fragmentation incendiary shell': '破片燃烧弹',
    'Armor-piercing shell': '穿甲弹',
    'Armor-piercing tracer shell': '穿甲曳光弹',
    'High-explosive tracer shell': '高爆曳光弹',
    'High-explosive incendiary tracer shell': '高爆燃烧曳光弹',
  });

  const SKIP_TAGS = new Set([
    'SCRIPT',
    'STYLE',
    'NOSCRIPT',
    'TEXTAREA',
    'INPUT',
    'SELECT',
    'OPTION',
    'PRE',
    'CODE',
  ]);

  function normalizeText(value) {
    return String(value)
      .replace(/\u00a0/g, ' ')
      .replace(/\u200b/g, '')
      .replace(/[\uf000-\uf8ff]/g, '')
      .replace(/[▀▁▂▃▄▅▆▇◄◘◔◊␗☢]/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#0?39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\bMk\.\s*/gi, 'Mk ')
      .replace(/\t/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function preserveWhitespace(original, replacement) {
    const match = String(original).match(/^(\s*)([\s\S]*?)(\s*)$/);
    return `${match[1]}${replacement}${match[3]}`;
  }

  function officialOrRule(text) {
    const n = normalizeText(text);
    const official = FIXED_TRANSLATIONS[n] || UNIT_NAME_TRANSLATIONS[n] || TERM_TRANSLATIONS[n];
    return official || translateFixedText(text) || text;
  }

  function nickname(text) {
    const n = normalizeText(text);
    return NICKNAMES[n] || UNIT_NAME_TRANSLATIONS[n] || TERM_TRANSLATIONS[n] || text;
  }

  function translateFixedText(text) {
    const normalized = normalizeText(text);
    if (!normalized) return null;
    // SSR 多模式值拼接伪影（如 755692797715 km/h），不翻译
    if (/(?:^|\D)\d{9,}(?:\D|$)/.test(normalized)) return null;
    const replacement = FIXED_TRANSLATIONS[normalized];
    if (replacement) return preserveWhitespace(text, replacement);
    const termReplacement = TERM_TRANSLATIONS[normalized];
    if (termReplacement) return preserveWhitespace(text, termReplacement);
    const unlocksReplacement = UNLOCKS_TRANSLATIONS[normalized];
    if (unlocksReplacement) return preserveWhitespace(text, unlocksReplacement);

    const compoundRules = [
      [/^Rank\s+([IVX]+)$/i, '等级 $1'],
      [/^([IVX]{1,5})$/i, '$1 级'],
      [/^Basic\s*→\s*Reference$/i, '基础 → 完全体'],
      [/^basic\s+crew\s*→\s*aces$/i, '基础乘员 → 王牌'],
      [/^AB\s*\/\s*RB\s*\/\s*SB$/i, '街机 / 历史 / 全真'],
      [/^AB\s*\/\s*RB$/i, '街机 / 历史'],
      [/^Setup\s+(\d+)$/i, '方案 $1'],
      [/^See all(?:\s+(\d+))?$/i, (match) => (match[1] ? `查看全部 ${match[1]}` : '查看全部')],
      [/^(\d+)\s+hours?\s+ago$/i, '$1 小时前'],
      [/^([\d,]+)\s+persons?$/i, '$1 人'],
      [/^([\d,]+)\s+ratings\s+all\s+time$/i, '$1 次评分（总计）'],
      [/^at\s+([\d,]+)\s+m$/i, '在 $1 米高度'],
      [/^([\d,]+(?:\.\d+)?)\s+m$/, '$1 米'],
      [/^([\d,]+)\s+rounds$/i, '$1 发'],
      [/^([\d,]+)\s+shots\/min$/i, '$1 发/分钟'],
      [/^([\d,]+(?:\.\d+)?)\s+m\/s$/i, '$1 米/秒'],
      [/^([\d,]+(?:\.\d+)?)\s+kg\/m²$/i, '$1 千克/平方米'],
      [/^([\d,]+(?:\.\d+)?)\s+kg$/i, '$1 千克'],
      [/^([\d,]+(?:\.\d+)?)\s+t\s*\((\d+)m\)$/i, '$1 吨（$2 分钟）'],
      [/^([\d,]+(?:\.\d+)?)\s+t$/i, '$1 吨'],
      [/^([\d.]+)\s+M$/, '$1 马赫'],
      [/^≈\s*(-?[\d./]+)\s*G$/i, '约 $1 G'],
      [/^([\d,]+(?:\.\d+)?)\s+s$/i, '$1 秒'],
      [/^([\d.,]+)\s*→\s*([\d.,]+)\s+s$/i, '$1 → $2 秒'],
      [/^([\d.,]+)\s*→\s*([\d.,]+)\s*°\/s$/i, '$1 → $2 度/秒'],
      [/^([\d.,]+)\s*°\/s$/i, '$1 度/秒'],
      [/^([\d,]+)\s*km\/h$/i, '$1 公里/小时'],
      [/^((?:[\d.,]+(?:\s*\/\s*)?)+)\s*km\/h$/i, '$1 公里/小时'],
      [/^([\d.,]+)\s*hp\/t$/i, '$1 马力/吨'],
      [/^([\d.,]+)\s*hp$/i, '$1 马力'],
      [/^((?:[\d.,]+(?:\s*\/\s*)?)+)\s*mm$/i, '$1 毫米'],
      [/^([\d.,]+)\s*mm\s*\((steel)\)$/i, '$1 毫米（钢）'],
      [/^([\d.,]+)x\s*–\s*([\d.,]+)x$/i, '$1–$2 倍'],
      [/^(km\/h|mph|m\/s|hp\/t|kg\/m2|kg\/m²|kgf|kN|rpm|shots\/min|rounds|hp|kg|t|mm|cm|m|s|min|h|lb|in)$/i, (match) => ({
        'km/h': '公里/小时', 'mph': '英里/小时', 'm/s': '米/秒', 'hp/t': '马力/吨',
        'kg/m2': '千克/平方米', 'kg/m²': '千克/平方米', 'kgf': '千克力', 'kN': '千牛',
        'rpm': '转/分钟', 'shots/min': '发/分钟', 'rounds': '发', 'hp': '马力', 'kg': '千克',
        't': '吨', 'mm': '毫米', 'cm': '厘米', 'm': '米', 's': '秒', 'min': '分钟',
        'h': '小时', 'lb': '磅', 'in': '英寸',
      }[match[0].toLowerCase()])],
      [/^New\s+([\d.,]+\s*mm)\s+(cannons?|MGs?|machine guns?|guns?)$/i, (m) => `新 ${m[1]} ${m[2].toLowerCase().startsWith('c') ? '机炮' : '机枪'}`],
      [/^(?:The\s+)?highest fire rate$/i, '最高射速'],
      [/^(?:The\s+)?lowest fire rate$/i, '最低射速'],
      [/^(?:The\s+)?biggest crew$/i, '最多乘员'],
      [/^(?:The\s+)?smallest crew$/i, '最少乘员'],
      [/^(?:The\s+)?fastest\s*\(forward\)$/i, '最快前进速度'],
      [/^(?:The\s+)?slowest\s*\(forward\)$/i, '最慢前进速度'],
      [/^(?:The\s+)?fastest\s*\(backwards\)$/i, '最快倒车速度'],
      [/^(?:The\s+)?slowest\s*\(backwards\)$/i, '最慢倒车速度'],
      [/^(?:The\s+)?fastest$/i, '最快速度'],
      [/^(?:The\s+)?slowest$/i, '最慢速度'],
      [/^(?:The\s+)?biggest caliber$/i, '最大口径'],
      [/^(?:The\s+)?smallest caliber$/i, '最小口径'],
      [/^(?:The\s+)?heaviest\s*\(base\)$/i, '最重（基础）'],
      [/^(?:The\s+)?lightest\s*\(base\)$/i, '最轻（基础）'],
      [/^(?:The\s+)?heaviest$/i, '最重'],
      [/^(?:The\s+)?lightest$/i, '最轻'],
      [/^(?:The\s+)?smallest wingspan$/i, '最小翼展'],
      [/^(?:The\s+)?largest wingspan$/i, '最大翼展'],
      [/^(?:The\s+)?biggest displacement$/i, '最大排水量'],
      [/^(?:The\s+)?smallest displacement$/i, '最小排水量'],
      [/^(?:The\s+)?smallest rotor diameter$/i, '最小旋翼直径'],
      [/^(?:The\s+)?largest rotor diameter$/i, '最大旋翼直径'],
      [/^(?:The\s+)?most numerous\s+(defensive|offensive|primary|secondary)?\s*armaments?$/i, (m) => `最多${m[1] === 'defensive' ? '自卫' : m[1] === 'offensive' ? '前向' : m[1] === 'primary' ? '主要' : m[1] === 'secondary' ? '次要' : ''}武器`],
      [/^(?:The\s+)?largest caliber ammunition$/i, '最大口径弹药'],
      [/^(?:The\s+)?smallest caliber ammunition$/i, '最小口径弹药'],
      [/^(\d+)\s*x$/i, '$1 ×'],
      [/^up to\s+([\d.,]+)\s*(km\/h|mph|m\/s|m)$/i, (m) => `最高 ${m[1]} ${m[2] === 'km/h' ? '千米/时' : m[2] === 'm/s' ? '米/秒' : m[2] === 'mph' ? '英里/时' : '米'}`],
      [/^Access to the (first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth) season challenge$/i, (m) => {
        const ord = {
          'first': '一', 'second': '二', 'third': '三', 'fourth': '四', 'fifth': '五',
          'sixth': '六', 'seventh': '七', 'eighth': '八', 'ninth': '九', 'tenth': '十',
          'eleventh': '十一', 'twelfth': '十二', 'thirteenth': '十三', 'fourteenth': '十四'
        }[m[1].toLowerCase()] || m[1];
        return `解锁第${ord}项赛季挑战`;
      }],
      [/^([\d,]+)\s+WB[,\s]+Warbond shop level\s+([IVXLCDM\d]+)$/i, '$1 作战物资债券，作战物资商店等级 $2'],
      [/^Premium account\s+\((\d+)\s+days?\)$/i, '高级账号（$1 天）'],
      [/^(?:Vehicle activated on the account|Coupon for vehicle, non-tradable|Vehicle coupon, non-tradable)\s*\($/i, (m) => m[0].includes('activated') ? '载具直接激活至账号（' : '载具兑换券（不可交易，'],
      [/^([\d,]+)\s+Mission Score$/i, '$1 任务得分'],
      [/^(\d+)\s+upwards$/i, '$1 级及以上'],
      [/^\((\d+)h\s*(\d+)m\)$/i, '（$1 小时 $2 分钟）'],
      [/^\((\d+)m\)$/i, '（$1 分钟）'],
      [/^\[eSport\]\s+(.+?)\s+Team$/i, '[电竞] $1 战队'],
      [/^\[eSport\]\s+(.+)$/i, '[电竞] $1'],
      [/^(\d+)\s+comments?$/i, '$1 条评论'],
      [/^([\d,]+)\s+vehicles?$/i, '$1 辆载具'],
      [/^([\d,]+)\s+collections?$/i, '$1 个收藏'],
      [/^(\d+)\s+x\s*\((.+)\)\s*%$/i, '$1 ×（$2）%'],
      [/^(\d+)\s+x\s*([\d.,]+)\s*%$/i, '$1 × $2 %'],
      [/^(\d+)\s+x\s+(.+)$/i, (match) => `${match[1]} × ${officialOrRule(match[2])}`],
      [/^(\d+)\s*×\s*(.+)$/i, (match) => `${match[1]} × ${officialOrRule(match[2])}`],
      [/^Go to slide (\d+)$/i, '转到第 $1 张幻灯片'],
      [/^Note #(\d+)$/i, '提示 #$1'],
      // 挂载位置后缀：如 "7.62 mm PKT machine gun (coaxial)" -> "7.62 毫米 PKT 机枪（同轴）"
      [/^(.+?)\s*\((coaxial|pintle|roof|anti-aircraft|bow|hull|turret|rear|fixed|flexible|optional|tandem)\)$/i, (m) => {
        const base = officialOrRule(m[1]);
        const pos = {
          'coaxial': '同轴', 'pintle': '枪架', 'roof': '车顶', 'anti-aircraft': '防空',
          'bow': '航向', 'hull': '车体', 'turret': '炮塔', 'rear': '后部',
          'fixed': '固定', 'flexible': '活动', 'optional': '可选', 'tandem': '串联'
        }[m[2].toLowerCase()] || m[2];
        return `${base}（${pos}）`;
      }],
      // 挂载位置前缀：如 "Coaxial 7.62 mm PKT machine gun" -> "同轴 7.62 毫米 PKT 机枪"
      [/^(Coaxial|Pintle|Anti-aircraft|Roof|Bow|Hull|Turret|Rear|Fixed)\s+(.+)$/i, (m) => {
        const pos = {
          'coaxial': '同轴', 'pintle': '枪架', 'roof': '车顶', 'anti-aircraft': '防空',
          'bow': '航向', 'hull': '车体', 'turret': '炮塔', 'rear': '后部', 'fixed': '固定'
        }[m[1].toLowerCase()] || m[1];
        return `${pos} ${officialOrRule(m[2])}`;
      }],
      [/^Offensive ([\d.,]+) mm belts$/i, (m) => `${m[1]} 毫米前射武器弹链`],
      [/^Turret ([\d.,]+) mm belts$/i, (m) => `${m[1]} 毫米炮塔弹链`],
      [/^New ([\d.,]+) mm MGs \(turret\)$/i, (m) => `新 ${m[1]} 毫米机枪（炮塔）`],
      [/^New ([\d.,]+) mm cannons \(turret\)$/i, (m) => `新 ${m[1]} 毫米机炮（炮塔）`],
      [/^Omni-purpose ([\d.,]+) mm ammunition belt$/i, (m) => `通用 ${m[1]} 毫米弹药弹链`],
      [/^([\d.,]+) mm ammunition belt with (.+) shells$/i, (m) => `${m[1]} 毫米弹药弹链（${SHELL_TYPES[m[2]] || m[2]}）`],
      [/^([\d.,]+) mm\/(\d+) (.+) cannon$/i, (m) => `${m[1]} 毫米/${m[2]} ${nickname(m[3])} 机炮`],
      [/^([\d.,]+) mm (.+) cannon$/i, (m) => `${m[1]} 毫米 ${nickname(m[2])} 机炮`],
      [/^([\d.,]+) mm (.+) machine gun$/i, (m) => `${m[1]} 毫米 ${nickname(m[2])} 机枪`],
      [/^([\d.,]+) (.+) machine gun$/i, (m) => `${m[1]} ${nickname(m[2])} 机枪`],
      [/^([\d.,]+ kg) (.+)$/i, (m) => `${m[1]} ${nickname(m[2])}`],
      [/^(.+) missiles?$/i, (m) => `${nickname(m[1])} 导弹`],
      [/^(.+) ATGM$/i, (m) => `${nickname(m[1])} 反坦克导弹`],
      [/^([\d.,]+ mm) (.+)$/i, (m) => `${m[1]} ${nickname(m[2])}`],
      [/^Type (\d+) (tank|MBT|APC|IFV|MCV)$/i, (m) => `${m[1]} 式${m[2] === 'tank' ? '坦克' : m[2] === 'MBT' ? '主战坦克' : m[2] === 'APC' ? '装甲运兵车' : m[2] === 'IFV' ? '步兵战车' : '机动战斗车'}`],
      [/^(.+) tank$/i, (m) => `${nickname(m[1])} 坦克`],
      [/^(.+) (APC|IFV|MBT|MCV|howitzer|half-track)$/i, (m) => `${nickname(m[1])} ${m[2] === 'APC' ? '装甲运兵车' : m[2] === 'IFV' ? '步兵战车' : m[2] === 'MBT' ? '主战坦克' : m[2] === 'MCV' ? '机动战斗车' : m[2] === 'howitzer' ? '榴弹炮' : '半履带车'}`],
      [/^(.+?)-class$/i, (m) => `${nickname(m[1])} 级`],
      [/^Allows the installation of (.+?)\.$/i, (m) => `可携带 ${m[1]}。`],
      [/^Allows the use of shell (.+?)\.$/i, (m) => `可使用炮弹 ${m[1]}。`],
      [/^Allows the use of shell (.+?)\. (.+?) - (.+)$/i, (m) => `可使用炮弹 ${m[1]}。${m[2]} - ${SHELL_TYPES[m[3]] || m[3]}`],
      [/^Allows usage of (.+?) fuel\.?\s*(.*)$/i, (m) => `可使用 ${m[1]} 燃料。${m[2] ? SHELL_TYPES[m[2]] || m[2] : ''}`],
      [/^(.+?) (machine gun|cannon) Ammunition ([\d,]+) rounds$/i, (m) => `${m[1]} ${m[2] === 'machine gun' ? '机枪' : '机炮'} 弹药 ${m[3]} 发`],
      [/^(.+?) - (.+)$/i, (m) => `${m[1]} - ${SHELL_TYPES[m[2]] || m[2]}`],
      [/^Type (\d+)-class (destroyer|battlecruiser|cruiser|battleship|frigate|subchaser|gun boat|motor boat|corvette|gunboat|escort ship)s?$/i, (m) => `${m[1]} 型${m[2] === 'destroyer' ? '驱逐舰' : m[2] === 'battlecruiser' ? '战列巡洋舰' : m[2] === 'cruiser' ? '巡洋舰' : m[2] === 'battleship' ? '战列舰' : m[2] === 'frigate' ? '护卫舰' : m[2] === 'subchaser' ? '猎潜艇' : m[2] === 'gun boat' ? '炮艇' : m[2] === 'corvette' ? '护卫舰' : m[2] === 'gunboat' ? '炮艇' : m[2] === 'escort ship' ? '护航舰' : '摩托艇'}`],
      [/^(.+?)\s*-class\s+(destroyers?|battlecruisers?|cruisers?|battleships?|frigates?|subchaser|sub-chasers?|gun boat|gunboat|motor boat|corvette|escort ship|hydrofoil)s?$/i, (m) => `${nickname(m[1])} 级${(m[2].replace(/s$/, '') === 'destroyer') ? '驱逐舰' : (m[2].replace(/s$/, '') === 'battlecruiser') ? '战列巡洋舰' : (m[2].replace(/s$/, '') === 'cruiser') ? '巡洋舰' : (m[2].replace(/s$/, '') === 'battleship') ? '战列舰' : (m[2].replace(/s$/, '') === 'frigate') ? '护卫舰' : (m[2].replace(/s$/, '') === 'subchaser' || m[2].replace(/s$/, '') === 'sub-chaser') ? '猎潜艇' : (m[2].replace(/s$/, '') === 'gun boat' || m[2].replace(/s$/, '') === 'gunboat') ? '炮艇' : (m[2].replace(/s$/, '') === 'corvette') ? '护卫舰' : (m[2].replace(/s$/, '') === 'escort ship') ? '护航舰' : (m[2].replace(/s$/, '') === 'hydrofoil') ? '水翼艇' : '摩托艇'}`],
      [/^(.+) \| War Thunder Wiki$/i, (m) => `${translateFixedText(m[1]) || m[1]} | War Thunder Wiki`],
      [/^(\d{2}:\d{2}:\d{2}) (\d{2})\.(\d{2})\.(\d{4}) \(UTC\)$/i, (match) => `${match[4]}年${Number(match[3])}月${Number(match[2])}日 ${match[1]}（UTC）`],
      [/^Battle Pass:\s+Season\s+([IVXLCDM\d]+)[,\s]+["“](.+?)["”]$/i, (m) => {
        const name = BATTLE_PASS_SEASONS[normalizeText(m[2])] || m[2];
        return `战斗通行证：第 ${m[1]} 赛季「${name}」`;
      }],
      [/^Battle Pass\s+Season\s+([IVXLCDM\d]+)$/i, '战斗通行证第 $1 赛季'],
      [/^Update\s+["“](.+?)["”][,.]?$/i, (match) => {
        const name = normalizeText(match[1]).replace(/[,.]*$/, '');
        return `更新「${UPDATE_NAMES[name] || name}」`;
      }],
      [/^Update\s+(\d+(?:\.\d+)+)(?:[,\s]+["“](.+?)["”])?[,.]?$/i, (match) => {
        if (!match[2]) return `更新 ${match[1]}`;
        const name = normalizeText(match[2]).replace(/[,.]*$/, '');
        return `更新 ${match[1]}「${UPDATE_NAMES[name] || name}」`;
      }],
      [/^(.+) Phantom II$/i, (m) => `${nickname(m[1])} 鬼怪 II`],
      [/^(.+?) \/ (.+)$/i, (match) => {
        const a = translateFixedText(match[1]);
        const b = translateFixedText(match[2]);
        return (a && b && a !== match[1] && b !== match[2]) ? `${a} / ${b}` : null;
      }],
      [/^(.+?) "(.+)"$/i, (match) => `${translateFixedText(match[1]) || UNIT_NAME_TRANSLATIONS[normalizeText(match[1])] || match[1]}「${NICKNAMES[match[2]] || match[2]}」`],
      [/^(Game roles|Vehicle families|Operator|Manufacturers|Vehicles by updates|Vehicles by events) (.+)$/i, (match) => `${translateFixedText(match[1])} ${translateFixedText(match[2]) || UNIT_NAME_TRANSLATIONS[normalizeText(match[2])] || TERM_TRANSLATIONS[normalizeText(match[2])] || match[2]}`],
      [/^(.+?)\s+([\d,]+)\s+vehicles?$/i, (match) => `${translateFixedText(match[1]) || UNIT_NAME_TRANSLATIONS[normalizeText(match[1])] || TERM_TRANSLATIONS[normalizeText(match[1])] || match[1]} ${match[2]} 辆载具`],
      [/^(\d{1,2})\s+([A-Z][a-z]+)$/i, (match) => `${monthName(match[2])}${match[1]}日`],
      [/^(.+?) (.+)$/i, (match) => {
        const a = translateFixedText(match[1]);
        const b = translateFixedText(match[2]);
        return (a && b && a !== match[1] && b !== match[2]) ? `${a} ${b}` : null;
      }],
    ];
    for (const [pattern, output] of compoundRules) {
      const match = normalized.match(pattern);
      if (!match) continue;
      const translated = typeof output === 'function' ? output(match) : normalized.replace(pattern, output);
      if (translated === null) continue;
      return preserveWhitespace(text, translated);
    }
    return null;
  }

  function monthName(month) {
    const names = {
      january: '1月', february: '2月', march: '3月', april: '4月',
      may: '5月', june: '6月', july: '7月', august: '8月',
      september: '9月', october: '10月', november: '11月', december: '12月',
    };
    return names[String(month).toLowerCase()] || `${month} `;
  }

  function hrefSlug(href) {
    const match = String(href || '').match(/(?:^|\/)unit\/([^?#]+)/i);
    if (!match) return null;
    const segments = match[1].split('/').filter(Boolean);
    if (!segments.length) return null;
    return decodeURIComponent(segments[segments.length - 1])
      .toLowerCase()
      .replace(/_(?:shop|\d+)$/, '');
  }

  function scheduleTask(callback, host = globalThis) {
    if (host && typeof host.queueMicrotask === 'function') {
      return host.queueMicrotask(callback);
    }
    if (host && typeof host.Promise === 'function') {
      return host.Promise.resolve().then(callback);
    }
    return host.setTimeout(callback, 0);
  }

  function translateUnitHref(href, fallbackText) {
    const slug = hrefSlug(href);
    if (!slug) return null;
    if (!normalizeText(fallbackText || '')) return null;
    const replacement = UNIT_TRANSLATIONS[slug];
    return replacement ? preserveWhitespace(fallbackText, replacement) : null;
  }

  function isProtectedContext(element) {
    if (!element || typeof element.closest !== 'function') return false;
    return Boolean(element.closest(
      'article p, [data-article-body], [data-comment-body], [data-comment-content], [data-user-content], [contenteditable="true"]',
    ));
  }

  function shouldSkipElement(element) {
    if (!element || element.nodeType !== 1) return true;
    if (SKIP_TAGS.has(String(element.tagName || '').toUpperCase())) return true;
    return isProtectedContext(element);
  }

  // —— 原文/翻译切换 ——
  let zhMode = true;                     // 当前显示模式：true=中文，false=英文原文
  let zhObserver = null;                 // MutationObserver 实例（start 时赋值）
  const zhOriginalTexts = new Map();     // 被翻译的文本节点 → 原文
  const zhOriginalCombined = new Map();  // 被合并翻译的容器 → [{node, original}]

  function restoreOriginalTexts() {
    for (const [node, original] of zhOriginalTexts) {
      if (node.isConnected) node.nodeValue = original;
    }
    for (const [element, entries] of zhOriginalCombined) {
      if (!element.isConnected) continue;
      for (const { node, original } of entries) {
        if (node.isConnected) node.nodeValue = original;
      }
    }
    if (typeof document !== 'undefined' && document.querySelectorAll) {
      for (const el of document.querySelectorAll('[data-wt-zh-original-title]')) {
        el.setAttribute('title', el.getAttribute('data-wt-zh-original-title'));
      }
    }
  }

  function setZhMode(mode) {
    if (mode === zhMode) return;
    if (mode) {
      zhMode = true;
      scan((typeof document !== 'undefined' && document.body) || null);
      if (zhObserver && typeof MutationObserver !== 'undefined') {
        zhObserver.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
      }
    } else {
      zhMode = false;
      if (zhObserver) zhObserver.disconnect();
      restoreOriginalTexts();
    }
  }

  function createToggleButton(doc) {
    try {
      const btn = doc.createElement('button');
      btn.id = 'wt-zh-toggle';
      btn.textContent = '原文';
      btn.setAttribute('title', '切换显示英文原文 / 中文翻译');
      const style = btn.style;
      style.position = 'fixed';
      style.right = '16px';
      style.bottom = '16px';
      style.zIndex = '2147483000';
      style.padding = '6px 14px';
      style.borderRadius = '6px';
      style.border = '1px solid rgba(128,128,128,.5)';
      style.background = 'rgba(32,32,32,.92)';
      style.color = '#fff';
      style.fontSize = '13px';
      style.cursor = 'pointer';
      style.boxShadow = '0 2px 10px rgba(0,0,0,.4)';
      style.fontFamily = 'system-ui, -apple-system, sans-serif';
      style.lineHeight = '1.4';
      btn.addEventListener('click', () => {
        if (zhMode) {
          setZhMode(false);
          btn.textContent = '中文';
        } else {
          setZhMode(true);
          btn.textContent = '原文';
        }
      });
      doc.body.appendChild(btn);
    } catch (e) {
      /* 按钮创建失败不影响翻译 */
    }
  }

  // 飞行控制两行标签（<div>Air<br>brake</div> 等）：按整词翻译，术语与官方客户端一致
  const FLIGHT_CONTROL_PAIRS = {
    'Landing flaps': '着陆襟翼',
    'Take-off flaps': '起飞襟翼',
    'Combat flaps': '战斗襟翼',
    'Air brake': '减速板',
    'Gear control': '起落架收放',
  };

  // 文章页（URL 数字开头 = 文章，video/ = 视频文章，tips/ = 攻略）：页面标题保持原文
  function isArticlePageUrl() {
    const p = (typeof location !== 'undefined' ? location.pathname : '') || '';
    return /^\/(?:\d+(?:-\S*)?|video\/|tips\/)/.test(p);
  }

  function translateNodeText(node) {
    if (!zhMode) return null;
    if (!node || node.nodeType !== 3 || !node.parentElement) return null;
    const parent = node.parentElement;
    if (shouldSkipElement(parent)) return null;
    if (parent.dataset?.wtZhPairDone) return null;
    // 模式切换值控件（show-char-*）由页面 JS 管理，文本不翻译、不被合并
    if (typeof parent.className === 'string' && parent.className.includes('show-char')) return null;
    if (isArticlePageUrl() && parent.tagName === 'H1') return null;

    const firstSegment = normalizeText(node.nodeValue);
    const br = node.nextSibling;
    if (br && br.nodeName === 'BR' && br.nextSibling && br.nextSibling.nodeType === 3) {
      const pairReplacement = FLIGHT_CONTROL_PAIRS[firstSegment + ' ' + normalizeText(br.nextSibling.nodeValue)];
      if (pairReplacement) {
        br.nextSibling.nodeValue = '';
        br.remove?.();
        if (parent.dataset) parent.dataset.wtZhPairDone = '1';
        return preserveWhitespace(node.nodeValue, pairReplacement);
      }
    }

    // 改装树分区标题按官方术语（特性块的 Mobility 仍走 FIXED 机动性）
    if (firstSegment === 'Mobility' && parent.closest?.('table.game-unit_mods-table')) {
      return preserveWhitespace(node.nodeValue, '机动改装');
    }

    if (parent.tagName === 'A') {
      if (parent.getAttribute('data-wt-zh-done')) return null;
      const hrefReplacement = translateUnitHref(
        parent.getAttribute('href'),
        node.nodeValue,
      );
      if (hrefReplacement) {
        parent.setAttribute('data-wt-zh-done', '1');
        return hrefReplacement;
      }
    }

    const fixedReplacement = translateFixedText(node.nodeValue);
    if (fixedReplacement) return fixedReplacement;

    // 数值容器：整串不命中时拆分尾部单位翻译（"27.22451.842.1 hp/t" → "…马力/吨"）
    if (parent.classList?.contains('game-unit_chars-value')) {
      const um = firstSegment.match(/^(.*?)(\s*)(km\/h|mph|m\/s|hp\/t|kg\/m2|kg\/m²|kgf|kN|rpm|shots\/min|rounds|hp|kg|t|mm|cm|m|s|min|h|lb|in)$/i);
      if (um && um[1]) {
        const unitZh = translateFixedText(um[3]);
        if (unitZh) return preserveWhitespace(node.nodeValue, um[1] + um[2] + unitZh);
      }
    }

    const unitNameReplacement = UNIT_NAME_TRANSLATIONS[normalizeText(node.nodeValue)];
    if (unitNameReplacement) {
      return preserveWhitespace(node.nodeValue, unitNameReplacement);
    }

    const href = parent.tagName === 'A' ? String(parent.getAttribute('href') || '') : '';
    const isDataLink = /\/(?:collections\/weapon|collections\/modification|modification|weapon)\//i.test(href);
    const termReplacement = TERM_TRANSLATIONS[normalizeText(node.nodeValue)];
    if (termReplacement && (isDataLink || parent.closest?.('main, [data-vehicle-page], [data-specification]'))) {
      return preserveWhitespace(node.nodeValue, termReplacement);
    }
    if (!isDataLink) return null;

    return termReplacement
      ? preserveWhitespace(node.nodeValue, termReplacement)
      : null;
  }

  function translateCombinedText(element) {
    if (!zhMode) return;
    if (!element || element.nodeType !== 1 || shouldSkipElement(element)) return;
    const tag = String(element.tagName || '').toUpperCase();
    if (['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'PRE', 'CODE', 'SCRIPT', 'STYLE'].includes(tag)) return;
    if (element.getClientRects) {
      let visible = false;
      try {
        visible = element.getClientRects().length > 0;
      } catch (e) {
        visible = true;
      }
      if (!visible) return;
    }
    const texts = [];
    for (const child of element.childNodes) {
      if (child.nodeType === 3) texts.push(child);
      else if (child.nodeType === 1 && (!child.getClientRects || child.getClientRects().length > 0)) {
        // 模式切换值控件（show-char-*）由页面 JS 管理显隐，脚本不收集其文本
        if (typeof child.className === 'string' && child.className.includes('show-char')) continue;
        for (const cc of child.childNodes) if (cc.nodeType === 3) texts.push(cc);
      }
    }
    if (texts.length < 2) return;
    const combined = texts.map((n) => n.nodeValue).join('');
    if (combined.length > 80) return;
    const replacement = translateFixedText(combined);
    if (!replacement) return;
    zhOriginalCombined.set(element, texts.map((n) => ({ node: n, original: n.nodeValue })));
    texts[0].nodeValue = replacement;
    for (let i = 1; i < texts.length; i++) texts[i].nodeValue = '';
    if (!element.hasAttribute('data-wt-zh-original')) {
      element.setAttribute('data-wt-zh-original', combined);
    }
  }

  function translateElementAttributes(element) {
    if (!zhMode) return;
    if (!element || element.nodeType !== 1) return;
    const tag = String(element.tagName || '').toUpperCase();
    if (SKIP_TAGS.has(tag) && !['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(tag)) return;
    if (isProtectedContext(element)) return;
    for (const name of ['title', 'aria-label']) {
      // 涂装名保留原文（UGC/市场涂装，与游戏内显示一致）
      if (name === 'title' && (element.classList?.contains('game-unit_camo') || element.closest?.('.game-unit_camo-list'))) continue;
      const value = element.getAttribute(name);
      const replacement = translateFixedText(value);
      if (replacement && replacement !== value) {
        if (!element.hasAttribute('data-wt-zh-original-' + name)) {
          element.setAttribute('data-wt-zh-original-' + name, value);
        }
        element.setAttribute(name, replacement);
      }
    }
  }

  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      const replacement = translateNodeText(root);
      if (replacement && replacement !== root.nodeValue) {
        zhOriginalTexts.set(root, root.nodeValue);
        if (!root.parentElement.hasAttribute('data-wt-zh-original')) {
          root.parentElement.setAttribute('data-wt-zh-original', root.nodeValue);
        }
        root.nodeValue = replacement;
      }
      return;
    }

    const document = root.ownerDocument || root;
    const walker = document.createTreeWalker(
      root,
      (typeof NodeFilter === 'undefined' ? 4 : NodeFilter.SHOW_TEXT),
    );
    const textNodes = [];
    let current;
    while ((current = walker.nextNode())) textNodes.push(current);

    for (const node of textNodes) {
      const replacement = translateNodeText(node);
      if (replacement && replacement !== node.nodeValue) {
        zhOriginalTexts.set(node, node.nodeValue);
        if (!node.parentElement.hasAttribute('data-wt-zh-original')) {
          node.parentElement.setAttribute('data-wt-zh-original', node.nodeValue);
        }
        node.nodeValue = replacement;
      }
    }

    const elements = root.querySelectorAll
      ? root.querySelectorAll('[title], [aria-label]')
      : [];
    for (const element of elements) translateElementAttributes(element);
    if (root.nodeType === 1) translateElementAttributes(root);

    if (root.querySelectorAll) {
      const containers = root.querySelectorAll('span, div, td, th');
      for (const element of containers) translateCombinedText(element);
    }
  }

  function start(document) {
    if (!document || !document.body || document.documentElement.dataset.wtZhStarted) {
      return;
    }
    document.documentElement.dataset.wtZhStarted = '1';
    document.documentElement.lang = 'zh-CN';
    scan(document.body);
    createToggleButton(document);

    if (typeof MutationObserver === 'undefined') return;
    let scheduled = false;
    const pending = new Set();
    const flush = () => {
      scheduled = false;
      const roots = Array.from(pending);
      pending.clear();
      const topLevelRoots = roots.filter((root) =>
        !roots.some((other) => other !== root && other.contains && other.contains(root)),
      );
      for (const root of topLevelRoots) scan(root);
    };
    const observer = new MutationObserver((records) => {
      if (!zhMode) return;
      for (const record of records) {
        if (record.type === 'characterData' && record.target.parentElement) {
          pending.add(record.target.parentElement);
        }
        for (const node of record.addedNodes) {
          if (node.nodeType === 1 || node.nodeType === 3) pending.add(node);
        }
      }
      if (!scheduled && pending.size) {
        scheduled = true;
        scheduleTask(flush);
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    zhObserver = observer;
  }

  return {
    FIXED_TRANSLATIONS,
    UNIT_TRANSLATIONS,
    UNIT_NAME_TRANSLATIONS,
    TERM_TRANSLATIONS,
    normalizeText,
    translateFixedText,
    translateUnitHref,
    scheduleTask,
    translateNodeText,
    translateElementAttributes,
    shouldSkipElement,
    scan,
    start,
  };
});
