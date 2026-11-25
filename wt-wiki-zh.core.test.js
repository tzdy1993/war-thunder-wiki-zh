'use strict';

const assert = require('node:assert/strict');
const {
  preserveWhitespace,
  translateFixedText,
  translateUnitHref,
  translateNodeText,
  shouldSkipElement,
  scheduleTask,
  scan,
  translateElementAttributes,
  MAIN_BUTTON_TITLES,
  MAIN_BUTTON_IMAGES,
  ensureMainButtonStyles,
  translateMainButtons,
  setZhMode,
} = require('./wt-wiki-zh.core.js');

function element(tagName, attributes = {}) {
  return {
    nodeType: 1,
    tagName,
    parentElement: null,
    hasAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attributes, name);
    },
    setAttribute(name, value) {
      attributes[name] = String(value);
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attributes, name)
        ? attributes[name]
        : null;
    },
    closest() {
      return null;
    },
  };
}

function textNode(value, parent) {
  return {
    nodeType: 3,
    nodeValue: value,
    parentElement: parent,
    ownerDocument: { defaultView: {} },
  };
}

function documentFragment() {
  return {
    nodeType: 11,
    ownerDocument: null,
    querySelectorAll() {
      return [];
    },
    createTreeWalker() {
      return { nextNode: () => null };
    },
  };
}

assert.equal(translateFixedText('  Battle rating  '), '  战斗权重  ');
assert.equal(translateFixedText('BR'), '战斗权重');
assert.equal(translateFixedText('AB'), '街机');
assert.equal(translateFixedText('RB'), '历史');
assert.equal(translateFixedText('SB'), '全真');
assert.equal(translateFixedText('Unknown article prose'), null);
assert.equal(translateFixedText('Armaments'), '武器装备');
assert.equal(translateFixedText('Weaponry'), '武器配置');
assert.equal(translateFixedText('Offensive armament'), '前射武器');
assert.equal(translateFixedText('Secondary weapon'), '挂载');
assert.equal(translateFixedText('Research country'), '研发科技树');
assert.equal(translateFixedText('Reference'), '完全体');
assert.equal(translateFixedText('Repair cost'), '维修费');
assert.equal(translateFixedText('Realistic'), '历史');
assert.equal(translateFixedText('Research'), '研发');
assert.equal(translateFixedText('Arcade'), '街机');
assert.equal(translateFixedText('Rank VIII'), '等级 VIII');
assert.equal(translateFixedText('Basic → Reference'), '基础 → 完全体');
assert.equal(translateFixedText('AB / RB / SB'), '街机 / 历史 / 全真');
assert.equal(translateFixedText('1 person'), '1 人');
assert.equal(translateFixedText('31 ratings all time'), '31 次评分（总计）');
assert.equal(translateFixedText('14 August'), '8月14日');
assert.equal(translateFixedText('at 6,096 m'), '高度 6,096 米');
assert.equal(translateFixedText('720 rounds'), '720 发');
assert.equal(translateFixedText('600 shots/min'), '600 发/分钟');
assert.equal(translateFixedText('22.5 m/s'), '22.5 米/秒');
assert.equal(translateFixedText('20 s'), '20 秒');
assert.equal(translateFixedText('Landing flaps'), '着陆襟翼');
assert.equal(translateFixedText('Take-off flaps'), '起飞襟翼');
assert.equal(translateFixedText('Combat flaps'), '战斗襟翼');
assert.equal(translateFixedText('Air brake'), '减速板');
assert.equal(translateFixedText('L / T / C'), '着陆 / 起飞 / 战斗');
assert.equal(translateFixedText('2 × Derwent 1'), '2 × 德温特 1');
assert.equal(translateFixedText('Setup 1'), '方案 1');
assert.equal(translateFixedText('Flight performance:'), '飞行性能：');
assert.equal(translateFixedText('2 × 1000 lb H.E. M.C. Mk.13 bomb'), '2 × 1,000 磅 HE MC Mk 13 炸弹');
assert.equal(translateFixedText('6 persons'), '6 人');
assert.equal(translateFixedText('basic crew → aces'), '基础乘员 → 王牌');
assert.equal(translateFixedText('31.2 → 24 s'), '31.2 → 24 秒');
assert.equal(translateFixedText('4.2 → 6 °/s'), '4.2 → 6 度/秒');
assert.equal(translateFixedText('1.9x–3.5x'), '1.9–3.5 倍');
assert.equal(translateFixedText('See all'), '查看全部');
assert.equal(translateFixedText('See all 42'), '查看全部 42');
assert.equal(translateFixedText('9 hours ago'), '9 小时前');
assert.equal(translateFixedText('1,200 rounds'), '1,200 发');
assert.equal(translateFixedText('6 °/s'), '6 度/秒');
assert.equal(translateFixedText('34 km/h'), '34 千米/小时');
assert.equal(translateFixedText('600 hp'), '600 马力');
assert.equal(translateFixedText('11.5 hp/t'), '11.5 马力/吨');
assert.equal(translateFixedText('52.4 t'), '52.4 吨');
assert.equal(translateFixedText('4 comments'), '4 条评论');
assert.equal(translateFixedText('442 vehicles'), '442 辆载具');
assert.equal(translateFixedText('453 collections'), '453 个收藏');
assert.equal(translateFixedText('AB / RB'), '街机 / 历史');
assert.equal(translateFixedText('Go to slide 2'), '转到第 2 张幻灯片');
assert.equal(translateFixedText('Status'), '状态');
assert.equal(translateFixedText('Battle Rating'), '战斗权重');
assert.equal(translateFixedText('Scout plane'), '侦察机');
assert.equal(translateFixedText('Main Battery'), '主炮');
assert.equal(translateFixedText('No comments yet'), '暂无评论');
assert.equal(translateFixedText('12,500 m'), '12,500 米');
assert.equal(translateFixedText('161 kg/m²'), '161 千克/平方米');
assert.equal(translateFixedText('1.2 t (34m)'), '1.2 吨（34 分钟）');
assert.equal(translateFixedText('0.83 M'), '0.83 马赫');
assert.equal(translateFixedText('≈ -5/10 G'), '约 -5/10 G');
assert.equal(translateFixedText('290 / 462 / 495 km/h'), '290 / 462 / 495 千米/小时');
assert.equal(translateFixedText('330 / 230 / 90 mm'), '330 / 230 / 90 毫米');
assert.equal(translateFixedText('25 mm (steel)'), '25 毫米（钢）');
assert.equal(translateFixedText('2 x (450 / 600) %'), '2 ×（450 / 600）%');
assert.equal(translateFixedText('2 x Derwent 1'), '2 × 德温特 1');
assert.equal(translateFixedText('Update 2.47 "Leviathans"'), '更新 2.47「利维坦」');
assert.equal(translateFixedText('Update 1.41'), '更新 1.41');
assert.equal(translateFixedText('AH-64 "Apache"'), 'AH-64“阿帕奇”');
assert.equal(translateFixedText('M4 "Sherman"'), 'M4“谢尔曼”');
assert.equal(translateFixedText('A.41 "Centurion"'), 'A.41“百夫长”');
assert.equal(translateFixedText('Vehicle families'), '载具家族');
assert.equal(translateFixedText('Number of vehicles'), '载具数量');
assert.equal(translateUnitHref('/collections/family/m4_tank', 'M4 "Sherman"'), 'M4“谢尔曼”');
assert.equal(translateUnitHref('/collections/family/spitfire', 'Spitfire'), '“喷火”');
assert.equal(translateUnitHref('/collections/family/leopard_2_mbt', 'Leopard 2'), '豹 2');
assert.equal(translateFixedText('Game roles Fighter'), '游戏角色 战斗机');
assert.equal(translateFixedText('Operator USSR'), '使用国家 苏联');
assert.equal(translateFixedText('Vehicles by updates Aircraft CBT'), '版本更新 飞机封闭测试');
assert.equal(translateFixedText('Vehicles by events'), '活动载具');
assert.equal(translateFixedText('Spitfire 32 vehicles'), '喷火 32 辆载具');
assert.equal(translateFixedText('V'), 'V 级');
assert.equal(translateFixedText('Like'), '喜欢');
assert.equal(translateFixedText('USA'), '美国');
assert.equal(translateFixedText('Aircraft CBT'), '飞机封闭测试');
assert.equal(translateFixedText('Scharnhorst-class battleships'), '沙恩霍斯特级战列舰');
assert.equal(translateFixedText('Report'), '举报');
assert.equal(translateFixedText('Become a War Thunder Wiki author!'), '成为战争雷霆 Wiki 作者！');
assert.equal(translateFixedText('We may deny publication or request corrections'), '我们可能拒绝发布或要求修改');
assert.equal(translateFixedText('Screenshots author —'), '截图作者：');
assert.equal(translateFixedText('Scharnhorst-class battleship'), '沙恩霍斯特级战列舰');
assert.equal(translateFixedText('Note #5740'), '提示 #5740');
assert.equal(translateFixedText('20:43:31 14.08.2026 (UTC)'), '2026年8月14日 20:43:31（UTC）');
assert.equal(translateFixedText('Update 1.79 "Project X"'), '更新 1.79「X 计划」');
assert.equal(translateFixedText('Not enough ratings'), '暂无足够评分');
assert.equal(translateFixedText('No articles about this vehicle yet'), '暂无关于该载具的文章');
assert.equal(translateFixedText('This space is currently empty'), '此区域当前为空');
assert.equal(translateFixedText('Share them!'), '分享它们！');
assert.equal(translateFixedText('Close'), '关闭');
assert.equal(translateFixedText('Light'), '浅色');
assert.equal(translateFixedText('Dark'), '深色');
assert.equal(translateFixedText('Belt'), '弹链');
assert.equal(translateFixedText('Belt filling'), '弹链组成');
assert.equal(translateFixedText('Armor penetration (mm) at a distance:'), '不同距离装甲穿透力（毫米）：');
assert.equal(translateFixedText('Default'), '默认');
assert.equal(translateFixedText('Offensive 20 mm belts'), '20 毫米前射武器弹链');
assert.equal(translateFixedText('Participation rules'), '参与规则');
assert.equal(translateFixedText('Go to editor'), '前往编辑器');
assert.equal(translateFixedText('Arcade'), '街机');
assert.equal(translateFixedText('Arcade'), '街机');
const requiredFixedTerms = {
  'Aviation': '空军',
  'Bluewater Fleet': '远洋海军',
  'Coastal Fleet': '近岸海军',
  'Collections': '套装收藏',
  'Fleet': '海军',
  'Fighter': '战斗机',
  'Jet fighter': '喷气战斗机',
  'Great Britain': '英国',
  'Camouflages': '涂装',
  'Research Aces': '研发王牌',
  'Aerial combat:': '空战：',
  'Ground attack:': '对地攻击：',
  'Research order:': '研发顺序：',
  'User content': '用户内容',
  'Loading...': '加载中……',
  'All': '全部',
  'Comments': '评论',
};
for (const [english, chinese] of Object.entries(requiredFixedTerms)) {
  assert.equal(translateFixedText(english), chinese, english);
}
assert.equal(
  translateUnitHref('/unit/meteor_fmk3', 'Meteor F Mk 3'),
  '流星 F.3',
);
assert.equal(
  translateUnitHref('/unit/meteor_fmk3_0', 'Meteor F Mk 3'),
  '流星 F.3',
);
assert.equal(
  translateUnitHref('/unit/not-in-local-dictionary', 'Unknown vehicle'),
  null,
);
assert.equal(
  translateUnitHref('/unit/shop/group/meteor_fmk3?tab=stats#general', 'Meteor F Mk 3'),
  '流星 F.3',
);
assert.equal(
  translateUnitHref('/unit/meteor_fmk3', '   \n  '),
  null,
);
let fallbackScheduled = false;
scheduleTask(() => {
  fallbackScheduled = true;
}, { Promise: undefined, setTimeout: (callback) => callback() });
assert.equal(fallbackScheduled, true);

const fixedParent = element('DIV');
const fixedText = textNode('General information', fixedParent);
assert.equal(translateNodeText(fixedText), '通用信息');
assert.equal(fixedText.nodeValue, 'General information');

const weaponLink = element('A', { href: '/collections/weapon/20mm_hispano_404' });
assert.equal(
  translateNodeText(textNode('20 mm Hispano Mk.II cannon', weaponLink)),
  '20 毫米 西斯帕诺 Mk II 机炮',
);

const fixedRoleText = textNode('Fighter', fixedParent);
assert.equal(translateNodeText(fixedRoleText), '战斗机');
const genericUnitName = textNode('Meteor F Mk 3', fixedParent);
assert.equal(translateNodeText(genericUnitName), '流星 F.3');
const reviewTag = textNode('#review', fixedParent);
assert.equal(translateNodeText(reviewTag), '#评测');
const ww2Tag = textNode('#ww2', fixedParent);
assert.equal(translateNodeText(ww2Tag), '#二战');

const uiParagraph = element('P');
const uiParagraphText = textNode('General information', uiParagraph);
assert.equal(translateNodeText(uiParagraphText), '通用信息');

const articleParent = element('P');
articleParent.closest = (selector) =>
  selector.includes('article p') ? articleParent : null;
const articleText = textNode('General information', articleParent);
assert.equal(translateNodeText(articleText), null);
assert.equal(articleText.nodeValue, 'General information');

const articleButton = element('BUTTON');
articleButton.closest = () => null;
assert.equal(translateNodeText(textNode('Load more…', articleButton)), '加载更多…');

const inputParent = element('INPUT');
const inputText = textNode('Search…', inputParent);
assert.equal(shouldSkipElement(inputParent), true);
assert.equal(translateNodeText(inputText), null);
assert.equal(inputText.nodeValue, 'Search…');

const inputWithLabel = element('INPUT', { 'aria-label': 'Search…' });
translateElementAttributes(inputWithLabel);
assert.equal(inputWithLabel.getAttribute('aria-label'), '搜索…');
assert.equal(inputWithLabel.getAttribute('value'), null);

const preWithLabel = element('PRE', { title: 'Battle rating' });
translateElementAttributes(preWithLabel);
assert.equal(preWithLabel.getAttribute('title'), 'Battle rating');

const directDynamic = textNode('Battle rating', fixedParent);
scan(directDynamic);
assert.equal(directDynamic.nodeValue, '战斗权重');

const alreadyTranslated = textNode('战斗权重', fixedParent);
// 卡片结构与空白节点防误伤测试
assert.equal(translateFixedText('UAE'), '阿联酋');
assert.equal(translateFixedText('United Arab Emirates'), '阿拉伯联合酋长国');
assert.equal(translateFixedText('We gathered vehicle collections for you by various themes.'), '我们为您按不同主题整理了各类载具收藏。');
assert.equal(translateFixedText('51 vehicles'), '51 辆载具');

const collectionCardA = element('A', { href: '/collections/family/m4_tank', class: 'unit-collection-card' });
const cardWhitespace = textNode('\n    ', collectionCardA);
assert.equal(translateNodeText(cardWhitespace), null);

const cardCover = element('DIV', { class: 'unit-collection-card_cover' });
cardCover.parentElement = collectionCardA;
const coverWhitespace = textNode('\n      ', cardCover);
assert.equal(translateNodeText(coverWhitespace), null);

const cardTitleDiv = element('DIV', { class: 'unit-collection-card_title' });
cardTitleDiv.parentElement = collectionCardA;
const cardTitleText = textNode('M4 "Sherman"', cardTitleDiv);
assert.equal(translateNodeText(cardTitleText), 'M4“谢尔曼”');

const cardStatDiv = element('DIV', { class: 'unit-collection-card_stat' });
cardStatDiv.parentElement = collectionCardA;
const cardStatText = textNode('51 vehicles', cardStatDiv);
assert.equal(translateNodeText(cardStatText), '51 辆载具');

// 首页核心五大板块横幅汉化标志测试
assert.equal(MAIN_BUTTON_TITLES['/aviation'], '空军');
assert.equal(MAIN_BUTTON_TITLES['/helicopters'], '直升机');
assert.equal(MAIN_BUTTON_TITLES['/ground'], '地面载具');
assert.equal(MAIN_BUTTON_TITLES['/ships'], '远洋海军');
assert.equal(MAIN_BUTTON_TITLES['/boats'], '近岸海军');

// —— 战雷自创特殊符号与载具汉化保留测试 ——
// 1. preserveWhitespace 符号保留单元测试
assert.equal(preserveWhitespace('▀T 34 747 (r)', '747 (r) 坦克'), '▀747 (r) 坦克');
assert.equal(preserveWhitespace('  ▀Bf 109 F-4  ', 'Bf 109 F-4 战斗机'), '  ▀Bf 109 F-4 战斗机  ');
assert.equal(preserveWhitespace(' ▀ Bf 109 F-4 ', 'Bf 109 F-4 战斗机'), ' ▀ Bf 109 F-4 战斗机 ');
assert.equal(preserveWhitespace(' ▅ Multiple Gun Motor Carriage M16 ', '四联机枪运载车 M16'), ' ▅ 四联机枪运载车 M16 ');
assert.equal(preserveWhitespace('☢Canberra B Mk 6', '堪培拉 B Mk 6'), '☢堪培拉 B Mk 6');
assert.equal(preserveWhitespace('F-86F-30 ▅', 'F-86F-30'), 'F-86F-30 ▅');
assert.equal(preserveWhitespace('  F-86F-40 ▅  ', 'F-86F-40'), '  F-86F-40 ▅  ');
assert.equal(preserveWhitespace('M4A2', 'M4A2 坦克'), 'M4A2 坦克');
assert.equal(preserveWhitespace('  Sherman Firefly  ', '谢尔曼 萤火虫'), '  谢尔曼 萤火虫  ');
assert.equal(preserveWhitespace('▀747 (r) 坦克', '▀747 (r) 坦克'), '▀747 (r) 坦克');
assert.equal(preserveWhitespace('␗F-86F-30', 'F-86F-30'), '␗F-86F-30');
assert.equal(preserveWhitespace('␙Challenger 2', '挑战者 2'), '␙挑战者 2');
assert.equal(preserveWhitespace('◄Centauro', '半人马座'), '◄半人马座');

// 2. translateFixedText 直接翻译与符号保留
assert.equal(translateFixedText('▀T 34 747 (r)'), '▀747 (r) 坦克');
assert.equal(translateFixedText('  ▀T 34 747 (r)  '), '  ▀747 (r) 坦克  ');
assert.equal(translateFixedText('▅Multiple Gun Motor Carriage M16'), '▅四联机枪运载车 M16');
assert.equal(translateFixedText('☢Canberra B Mk 6'), '☢堪培拉 B Mk 6');
assert.equal(translateFixedText('F-86F-30 ▅'), 'F-86F-30 ▅');
assert.equal(translateFixedText('  F-86F-30 ▅  '), '  F-86F-30 ▅  ');

// 3. translateUnitHref 超链接翻译与符号保留
assert.equal(translateUnitHref('/unit/germ_t_34_747', '▀T 34 747 (r)'), '▀747 (r) 坦克');
assert.equal(translateUnitHref('/unit/canberra_bimk6_killstreak', '☢Canberra B Mk 6'), '☢堪培拉 B Mk 6');
assert.equal(translateUnitHref('/unit/unknown_slug', '▀T 34 747 (r)'), '▀747 (r) 坦克'); // cleanText fallback

// 4. translateNodeText DOM 节点翻译与符号保留
const vehicleDiv = element('DIV');
const vehicleTextNode = textNode('▀T 34 747 (r)', vehicleDiv);
assert.equal(translateNodeText(vehicleTextNode), '▀747 (r) 坦克');

const vehicleLink = element('A', { href: '/unit/germ_t_34_747' });
const linkTextNode = textNode('▀T 34 747 (r)', vehicleLink);
assert.equal(translateNodeText(linkTextNode), '▀747 (r) 坦克');

// 5. 中华民国繁体区分规范化断言（统一为繁体“中國”）
assert.equal(translateFixedText('Republic of China'), '中國');
assert.equal(translateFixedText('中华民国'), '中國');
assert.equal(translateFixedText('ROCA ORDC'), '中國陸軍兵工署');
assert.equal(translateFixedText('Republic of China Air Force'), '中國空軍');
assert.equal(translateFixedText('Operator Republic of China'), '使用国家 中國');

// 6. 弹药弹链、武器规格参数与单位防错乱专项测试
assert.equal(translateFixedText('11 km'), '11 千米');
assert.equal(translateFixedText('3 km'), '3 千米');
assert.equal(translateFixedText('18 km'), '18 千米');
assert.equal(translateFixedText('30 G'), '30 G');
assert.equal(translateFixedText('14 August'), '8月14日');
assert.equal(translateFixedText('Belt filling: HEF-I/API-T/AP-I/SAPHEI'), '弹链组成：HEF-I/API-T/AP-I/SAPHEI');
assert.equal(translateFixedText('Belt filling: HEF-I/HEF-I/API-T/HEF-I/HEF-I/AP-I'), '弹链组成：HEF-I/HEF-I/API-T/HEF-I/HEF-I/AP-I');
assert.equal(translateFixedText('HEF-I: High-explosive fragmentation incendiary shell'), 'HEF-I：高爆燃烧破片弹');
assert.equal(translateFixedText('API-T: Armor-piercing incendiary tracer shell'), 'API-T：穿甲燃烧曳光弹');
assert.equal(translateFixedText('AP-I: Armor-piercing incendiary shell'), 'AP-I：穿甲燃烧弹');
assert.equal(translateFixedText('SAPHEI: Semi armor-piercing high-explosive incendiary shell'), 'SAPHEI：半穿甲高爆燃烧弹');
assert.equal(translateFixedText('Projectile Mass'), '弹头质量');
assert.equal(translateFixedText('Explosive Type'), '装药类型');
assert.equal(translateFixedText('Explosive Mass'), '装药质量');
assert.equal(translateFixedText('TNT equivalent'), 'TNT 当量');
assert.equal(translateFixedText('Missile Approach Warning system'), '导弹逼近告警系统');
assert.equal(translateFixedText('Flares/Chaff'), '热焰弹/干扰箔');

// 7. 复合语法与挂载弹药正则规则增强专项测试
// A. 挂载数量倍数与武器组装
assert.equal(translateFixedText('2 × PL-12'), '2 × 霹雳-12');
assert.equal(translateFixedText('4 x AIM-120A'), '4 × AIM-120A');
assert.equal(translateFixedText('20 × S-8KO rockets'), '20 × S-8KO 火箭弹');
assert.equal(translateFixedText('1 x 250 kg bomb'), '1 × 250 千克 炸弹');
assert.equal(translateFixedText('16 × 50 kg FAB-50 bombs'), '16 × 50 千克 FAB-50 炸弹');
assert.equal(translateFixedText('AIM-120A air-to-air missiles'), 'AIM-120A 空对空导弹');
assert.equal(translateFixedText('S-8KO rockets'), 'S-8KO 火箭弹');
assert.equal(translateFixedText('Kh-29L missiles'), 'Kh-29L 导弹');
assert.equal(translateFixedText('Type 23 SNEB rockets'), 'Type 23 SNEB 火箭弹');

// B. 弹药链前缀与预设（严格对齐官方 CSV：对空、对地、穿甲）
assert.equal(translateFixedText('Default: HEF-I / AP-I / HEF-I / T'), '默认：HEF-I / AP-I / HEF-I / T');
assert.equal(translateFixedText('Air targets: AP-I / HEI'), '对空：AP-I / HEI');
assert.equal(translateFixedText('Ground targets: AP / T'), '对地：AP / T');
assert.equal(translateFixedText('Armoured targets'), '穿甲');
assert.equal(translateFixedText('Air targets'), '对空');
assert.equal(translateFixedText('Ground targets'), '对地');
assert.equal(translateFixedText('Belt'), '弹链');
assert.equal(translateFixedText('Belt filling'), '弹链组成');
assert.equal(translateFixedText('Belt filling: AP/T'), '弹链组成：AP/T');
assert.equal(translateFixedText('Belt filling: HEI/SAP-I/T'), '弹链组成：HEI/SAP-I/T');
assert.equal(translateFixedText('HEF-I/HEF-I/API-T/HEF-I/HEF-I/AP-I'), null); // 弹链缩写保持完整，不拆碎

// C. 弹药定义与口径复合
assert.equal(translateFixedText('AP: M2 Armor-piercing bullet'), 'AP：M2 穿甲弹');
assert.equal(translateFixedText('I: M1 Incendiary bullet'), 'I：M1 燃烧弹');
assert.equal(translateFixedText('AP-I(c): Armor-piercing incendiary bullet (cermet core)'), 'AP-I(c)：穿甲燃烧弹（金属陶瓷核心）');
assert.equal(translateFixedText('APCR - Armor-piercing composite rigid shell'), 'APCR - 硬芯穿甲弹');
assert.equal(translateFixedText('APHEBC - Armor-piercing high explosive with ballistic cap shell'), 'APHEBC - 风帽穿甲高爆弹');
assert.equal(translateFixedText('HESH - High-explosive squash head shell'), 'HESH - 碎甲弹');
assert.equal(translateFixedText('HEATFS - High explosive anti-tank fin stabilized shell'), 'HEATFS - 尾翼稳定破甲弹');
assert.equal(translateFixedText('20 mm AP-T'), '20 毫米 穿甲曳光弹');
assert.equal(translateFixedText('.50 API-T'), '.50 穿甲燃烧曳光弹');
assert.equal(translateFixedText('25 mm HEI-T'), '25 毫米 高爆燃烧曳光弹');
assert.equal(translateFixedText('APCBC'), '被帽风帽穿甲弹');

// D. 性能与单位
assert.equal(translateFixedText('at 8,500 m'), '高度 8,500 米');
assert.equal(translateFixedText('1,200 km/h'), '1,200 千米/小时');
assert.equal(translateFixedText('750 km/h'), '750 千米/小时');
assert.equal(translateFixedText('750 km / h'), '750 千米/小时');
assert.equal(translateFixedText('35 m/s'), '35 米/秒');
assert.equal(translateFixedText('24.5 s'), '24.5 秒');
assert.equal(translateFixedText('0.001 s'), '0.001 秒');
assert.equal(translateFixedText('1,000 lbs'), '1,000 磅');
assert.equal(translateFixedText('531 lbs'), '531 磅');
assert.equal(translateFixedText('50 g'), '50 克');
assert.equal(translateFixedText('800x600'), '800×600');
assert.equal(translateFixedText('or 310'), '或 310');
assert.equal(translateFixedText('Engine Thrust (0 m / 0 km/h)'), '发动机推力（0 米 / 0 千米/小时）');

// E. 传感器、航电与飞行状态
assert.equal(translateFixedText('Helmet-mounted display'), '头盔显示器');
assert.equal(translateFixedText('Laser designator'), '激光指示器');
assert.equal(translateFixedText('Focus sensor'), '关注焦点传感器');
assert.equal(translateFixedText('Ballistic computer'), '弹道计算机');
assert.equal(translateFixedText('CCIP'), '连续计算命中点 (CCIP)');
assert.equal(translateFixedText('Gunner: TVD'), '炮手：热成像');
assert.equal(translateFixedText('Auto tracker'), '自动跟踪');
assert.equal(translateFixedText('AN/APG-83, AN/ASQ-213, Auto tracker'), 'AN/APG-83, AN/ASQ-213, 自动跟踪');
assert.equal(translateFixedText('AN/APG-79, AGM-88 HAS, Auto tracker'), 'AN/APG-79, AGM-88 HAS, 自动跟踪');
// 雷达频段与波段代号必须完整保留原样，杜绝被拆分误翻为'小时'或'燃烧弹'
assert.equal(translateFixedText('C, D, E, F, G, H, I, J, K'), null);
assert.equal(translateFixedText('I, E'), null);
assert.equal(translateFixedText('I, J'), null);
assert.equal(translateFixedText('X, Ka'), null);
// 大写字母保护
assert.equal(translateFixedText('H'), null);
assert.equal(translateFixedText('T'), null);
assert.equal(translateFixedText('S'), null);
assert.equal(translateFixedText('M'), null);
assert.equal(translateFixedText('Combat'), '战斗');
assert.equal(translateFixedText('Air brake'), '减速板');
assert.equal(translateFixedText('Separate antennas'), '独立天线');
assert.equal(translateFixedText('TWS ESA + Separate antennas'), '边扫描边跟踪（相控阵）+ 独立天线');
assert.equal(translateFixedText('Commander: TVD'), '车长：热成像');
assert.equal(translateFixedText('Driver: NVD'), '驾驶员：夜视设备');
assert.equal(translateFixedText('One-plane stabilizer'), '单向稳定器');
assert.equal(translateFixedText('Two-plane stabilizer'), '双向稳定器');

// F. 改件升级描述与发动机类型
assert.equal(
  translateFixedText('Set of 20 mm belts for offensive weapons.'),
  '为 20 毫米前射武器提供更多可选弹链配置。'
);
assert.equal(
  translateFixedText("The 20 mm cannons' worn barrels, trigger and striking mechanisms are replaced with new ones, to improve fire density and to decrease the chance of seizure."),
  '为 20 毫米机炮更换新的炮管、扳机和击发装置，从而改善弹道散布并降低卡弹几率。'
);
assert.equal(translateFixedText('Inline, 12-cylinder'), '直列 12 缸');
assert.equal(translateFixedText('Radial, 14-cylinder'), '星型 14 缸');
assert.equal(translateFixedText('Allows the use of smoke screen system.'), '可释放烟雾。');

// H. 改装件科技树分类表头、基础改装件与浮层属性
assert.equal(translateFixedText('Survivability'), '生存能力');
assert.equal(translateFixedText('Protection'), '防御改装');
assert.equal(translateFixedText('Seakeeping'), '适航性能');
assert.equal(translateFixedText('Unsinkability'), '抗沉能力');
assert.equal(translateFixedText('Cover'), '蒙皮');
assert.equal(translateFixedText('Compressor'), '增压器');
assert.equal(translateFixedText('Fuselage repair'), '维修机身');
assert.equal(translateFixedText('Wings repair'), '维修机翼');
assert.equal(translateFixedText('Airframe'), '机体翻新');
assert.equal(translateFixedText('Filters'), '滤清器');
assert.equal(translateFixedText('Transmission'), '传动装置');
assert.equal(translateFixedText('Artillery Support'), '火炮支援');
assert.equal(translateFixedText('Tracks'), '履带');
assert.equal(translateFixedText('Radiator'), '散热器');
assert.equal(translateFixedText('Engine injection'), '喷油系统');
assert.equal(translateFixedText('Band'), '频段');
assert.equal(translateFixedText('Type'), '类型');
assert.equal(translateFixedText('Model'), '型号');
assert.equal(translateFixedText('Radar'), '雷达');
assert.equal(translateFixedText('IFF'), '敌我识别');
assert.equal(translateFixedText('IR'), '红外');
assert.equal(translateFixedText('Engine Power'), '发动机输出功率');
assert.equal(translateFixedText('Cooling type'), '冷却方式');
assert.equal(translateFixedText('WEP'), '加力');
assert.equal(translateFixedText('TWS+'), '边扫描边跟踪+');
assert.equal(translateFixedText('TWS+ + Separate antennas'), '边扫描边跟踪+ + 独立天线');

// I. 弹药架说明、自毁弹药与挂载规则
assert.equal(
  translateFixedText('40 mm cannon shell rack filled with HEFI-T/HEFI-T/HEFI-T/AP-T shells'),
  '40 毫米 机炮使用 HEFI-T/HEFI-T/HEFI-T/AP-T 弹药'
);
assert.equal(
  translateFixedText('20 mm cannon shell rack filled with HEF-T/HEF-I/AP-T/HEF-I shells'),
  '20 毫米 机炮使用 HEF-T/HEF-I/AP-T/HEF-I 弹药'
);
assert.equal(
  translateFixedText('HEF-T* - High-explosive fragmentation tracer shell (self-destroying)'),
  'HEF-T* - 高爆破片曳光弹（自毁）'
);
assert.equal(
  translateFixedText('API-T - M20 Armor-piercing incendiary tracer bullet'),
  'API-T - M20 穿甲燃烧曳光弹'
);
assert.equal(
  translateFixedText('Allows the installation of GBU laser guided bombs:'),
  '可挂载 GBU 激光制导炸弹：'
);

// G. 严格反污染校验（无 \t、无 //）
const allTestSamples = [
  '2 × PL-12', '4 x AIM-120A', '20 × S-8KO rockets', '1 x 250 kg bomb',
  'Default: HEF-I / AP-I / HEF-I / T', 'Armoured targets', 'Air targets', 'Ground targets',
  'at 8,500 m', '1,200 km/h', '750 km/h', '35 m/s', '24.5 s',
  'Helmet-mounted display', 'Laser designator', 'Focus sensor', 'Ballistic computer',
  'CCIP', 'AIM-120A air-to-air missiles', 'S-8KO rockets', 'Engine Thrust (0 m / 0 km/h)'
];
for (const sample of allTestSamples) {
  const result = translateFixedText(sample);
  assert(result, `Failed to translate sample: ${sample}`);
  assert(!result.includes('\t') && !result.includes('\\t'), `Sample contains tab character: ${sample} -> ${result}`);
  assert(!result.includes('//'), `Sample contains double slash: ${sample} -> ${result}`);
}


// H. 关键专项缺陷回归防护测试 (v1.2.8)
// 1. 分辨率紧凑化（杜绝空格折行错位）
assert.equal(translateFixedText('800x600'), '800×600');
assert.equal(translateFixedText('1024x768'), '1024×768');
assert.equal(translateFixedText('1920x1080'), '1920×1080');

// 2. 雷达波段与单字母严格保护（杜绝 '小时'、'燃烧弹'、'I 级'）
assert.equal(translateFixedText('I'), 'I 级');
assert.equal(translateFixedText('T'), null);
assert.equal(translateFixedText('H'), null);
assert.equal(translateFixedText('C, D, E, F, G, H, I, J, K'), null);
assert.equal(translateFixedText('I, E'), null);
assert.equal(translateFixedText('X, Ka'), null);

// 3. 复合列表与雷达模式
assert.equal(translateFixedText('AN/APG-79, AGM-88 HAS, Auto tracker'), 'AN/APG-79, AGM-88 HAS, 自动跟踪');
assert.equal(translateFixedText('TWS ESA + Separate antennas'), '边扫描边跟踪（相控阵）+ 独立天线');

// 4. 载具武器属性卡片备弹量
assert.equal(translateFixedText('Ammunition'), '备弹量');

// 5. 浮层预处理不产生重复 style 属性，且保留原属性与紧凑分辨率
const dummyElem = {
  nodeType: 1,
  tagName: 'BUTTON',
  attributes: {
    'data-feature-popover': '<div class="gunit_specs-table_row mt-1" style="font-size:.9em"><div>800x600</div><div>800x600</div><div>—</div></div>'
  },
  hasAttribute(name) { return name in this.attributes; },
  getAttribute(name) { return this.attributes[name]; },
  setAttribute(name, val) { this.attributes[name] = val; },
  removeAttribute(name) { delete this.attributes[name]; },
  isConnected: true,
};
translateElementAttributes(dummyElem);
const popResult = dummyElem.getAttribute('data-feature-popover');
assert(!/style="[^"]*"[^>]*style="/i.test(popResult), 'Must not emit duplicate style attribute');
assert(popResult.includes('style="font-size:.9em"'), 'Must preserve original style');
assert(popResult.includes('800×600'));

// I. v1.3.0 全面审查回归测试（2.61 更新 + 官方对齐 + 反贪婪误伤 + 双向无损还原）
// 1. 2.61 鹰之暗影 / 2.59 长空奥德赛 / 2.45 黄蜂之蜇 & Wiki 新增特征
assert.equal(translateFixedText('Update 2.61 "Eagle\'s Shadow"'), '更新 2.61「鹰之暗影」');
assert.equal(translateFixedText('Update 2.59 "Sky Odyssey"'), '更新 2.59「长空奥德赛」');
assert.equal(translateFixedText('Update 2.45 "Hornet\'s Sting"'), '更新 2.45「黄蜂之蜇」');
assert.equal(translateFixedText('The Great War!'), '第一次世界大战！');
assert.equal(translateFixedText('Dynamic BR'), '动态战斗权重');
assert.equal(translateFixedText('Infantry Fighting Vehicle'), '步兵战车');
assert.equal(translateFixedText('ARH+IOG+GNSS+DL'), '主动雷达寻的 + 惯导 + 卫星导航 + 数据链');
assert.equal(translateFixedText('IR+IOG+GNSS+DL'), '红外 + 惯导 + 卫星导航 + 数据链');

// 2. 高频单位与弹链句式
assert.equal(translateFixedText('17,000 kgf'), '17,000 千克力');
assert.equal(translateFixedText('45.5 kN'), '45.5 千牛');
assert.equal(translateFixedText('360 mph'), '360 英里/小时');
assert.equal(translateFixedText('33 knots'), '33 节');
assert.equal(translateFixedText('Allows the use of belts PzGr.'), '可使用 PzGr 弹链。');

// 3. 反贪婪正则防误伤（杜绝 'Tri - 颜色' 和文章标题末尾 '坦克'）
assert.equal(translateFixedText('Tri-color'), null);
assert.equal(translateFixedText('T1E1(90) - A Big Gun on a Big Tank'), null);
assert.equal(translateFixedText('Battle-Seasoned Fighter'), null);

// 4. 官方 CSV 术语统一验证
assert.equal(translateFixedText('Adjustment of Fire'), '校准主炮');
assert.equal(translateFixedText('Parts'), '维修套件');
assert.equal(translateFixedText('FPE'), '灭火套件');
assert.equal(translateFixedText('EFS'), '引擎灭火系统');
assert.equal(translateFixedText('Brake System'), '刹车装置');

// 5. ensureMainButtonStyles 注入 .gunit_specs-table_row 防折行 CSS
const appendedStyles = [];
const mockDoc = {
  head: { appendChild(el) { appendedStyles.push(el.textContent); } },
  body: { classList: { add() {}, remove() {}, contains() { return false; } }, querySelectorAll(sel) { return mockDoc.querySelectorAll(sel); } },
  getElementById() { return null; },
  createElement() { return { id: '', textContent: '' }; },
  createTreeWalker() { return { nextNode: () => null }; },
  querySelectorAll(sel) {
    const m = String(sel || '').match(/^\[([^\]]+)\]$/);
    if (m) return dummyElem.hasAttribute(m[1]) ? [dummyElem] : [];
    if (String(sel || '').includes('data-feature-popover')) return dummyElem.hasAttribute('data-feature-popover') ? [dummyElem] : [];
    return [];
  },
};
mockDoc.body.ownerDocument = mockDoc;
ensureMainButtonStyles(mockDoc);
assert(appendedStyles.some((css) =>
  css.includes('.gunit_specs-table_row')
  && css.includes('white-space: nowrap')
  && !css.includes('.wt-zh-btn-overlay')
  && !css.includes('.wt-zh-btn-title')
  && !css.includes('.wt-zh-btn-accent')
  && !css.includes('container-type')
));

// 6. 双向切换无损还原属性测试
const origDoc = global.document;
global.document = mockDoc;
setZhMode(false);
assert.equal(dummyElem.getAttribute('data-feature-popover'), '<div class="gunit_specs-table_row mt-1" style="font-size:.9em"><div>800x600</div><div>800x600</div><div>—</div></div>');
assert.equal(dummyElem.hasAttribute('data-wt-zh-original-feature-popover'), false);
setZhMode(true);
assert(dummyElem.getAttribute('data-feature-popover').includes('800×600'));
global.document = origDoc;

// J. v1.3.1 历史要求全面恢复回归测试
assert.equal(translateFixedText('PLAY'), '游玩');
assert.equal(translateFixedText('Play'), '游玩');

// 左下角语言切换栏：无论 <span> 还是 <a> 都绝不翻译
const langSpan = element('SPAN', { class: 'dropdown-item active' });
assert.equal(translateNodeText(textNode('English', langSpan)), null);
const langLink = element('A', { class: 'dropdown-item', href: '/?from=ru_lang' });
assert.equal(translateNodeText(textNode('Русский', langLink)), null);

// data-bs-title tooltip 翻译与 Cooling type: Air 保护
const coolingPopoverEl = {
  nodeType: 1,
  tagName: 'BUTTON',
  attributes: {
    'data-feature-popover': '<div><div>Cooling type</div><div>Air</div></div>'
  },
  hasAttribute(name) { return name in this.attributes; },
  getAttribute(name) { return this.attributes[name]; },
  setAttribute(name, val) { this.attributes[name] = val; },
  removeAttribute(name) { delete this.attributes[name]; },
  isConnected: true,
};
translateElementAttributes(coolingPopoverEl);
assert(coolingPopoverEl.getAttribute('data-feature-popover').includes('冷却方式'));
assert(coolingPopoverEl.getAttribute('data-feature-popover').includes('气冷'));
assert.equal(translateFixedText('Air'), '空中');

const bsTooltipEl = {
  nodeType: 1,
  tagName: 'SPAN',
  attributes: {
    'data-bs-toggle': 'tooltip',
    'data-bs-title': 'With full filling of main tanks'
  },
  hasAttribute(name) { return name in this.attributes; },
  getAttribute(name) { return this.attributes[name]; },
  setAttribute(name, val) { this.attributes[name] = val; },
  removeAttribute(name) { delete this.attributes[name]; },
  isConnected: true,
};
translateElementAttributes(bsTooltipEl);
assert.equal(bsTooltipEl.getAttribute('data-bs-title'), '主油箱满油状态下');

const origDoc2 = global.document;
const bsMockDoc = {
  body: { classList: { add() {}, remove() {}, contains() { return false; } }, querySelectorAll(sel) { return bsMockDoc.querySelectorAll(sel); } },
  createTreeWalker() { return { nextNode: () => null }; },
  querySelectorAll(sel) {
    const m = String(sel || '').match(/^\[([^\]]+)\]$/);
    if (m) return bsTooltipEl.hasAttribute(m[1]) ? [bsTooltipEl] : [];
    if (String(sel || '').includes('data-bs-title')) return bsTooltipEl.hasAttribute('data-bs-title') ? [bsTooltipEl] : [];
    return [];
  },
};
bsMockDoc.body.ownerDocument = bsMockDoc;
global.document = bsMockDoc;
setZhMode(false);
assert.equal(bsTooltipEl.getAttribute('data-bs-title'), 'With full filling of main tanks');
assert.equal(bsTooltipEl.hasAttribute('data-wt-zh-original-bs-title'), false);
setZhMode(true);
assert.equal(bsTooltipEl.getAttribute('data-bs-title'), '主油箱满油状态下');
global.document = origDoc2;

// 排名页 & 高度
assert.equal(translateFixedText('Four more'), '其余 4 个');
assert.equal(translateFixedText('Two more...'), '其余 2 个');
assert.equal(translateFixedText('12 more'), '其余 12 个');
assert.equal(translateFixedText('1st place'), '第 1 名');
assert.equal(translateFixedText('at 0 m'), '海平面 (0 米)');
assert.equal(translateFixedText('at 5 km'), '高度 5 千米');
assert.equal(translateFixedText('5 km'), '5 千米');

// 制造商
assert.equal(translateFixedText('US Army Ordnance Department/Corps'), '美国陆军军械部/军械兵团');
assert.equal(translateFixedText('CAIC'), '航空工业昌飞');
assert.equal(translateFixedText('Shijiazhuang'), '航空工业通飞华北');
assert.equal(translateFixedText('AVIC'), '中国航空工业集团');

// 用户菜单 & Show in game 弹窗
assert.equal(translateFixedText('Profile'), '个人主页');
assert.equal(translateFixedText('Profile settings'), '个人设置');
assert.equal(translateFixedText('Logout'), '退出登录');
assert.equal(translateFixedText('Notifications'), '通知');
assert.equal(translateFixedText('Drafts'), '草稿');
assert.equal(translateFixedText('Bookmarks'), '书签');
assert.equal(translateFixedText('How to view the vehicle in the game:'), '如何在游戏中查看载具：');
assert.equal(translateFixedText('Log in to Wiki'), '登录 Wiki');

// K. v1.3.2 首页五大入口无框矢量排版 & 双向图片还原测试
assert.equal(typeof MAIN_BUTTON_IMAGES, 'object');
const origBannerSrcset = '/static/main_button/main_button_aircraft_en.webp';
const origBannerSrc = '/static/main_button/main_button_aircraft_en.png';
function makeMockEl(tag, initAttrs = {}, initClass = '') {
  const attrs = { ...initAttrs };
  const children = [];
  return {
    nodeType: 1,
    tagName: tag,
    className: initClass,
    children,
    dataset: {},
    style: {},
    classList: {
      contains(c) { return String(this.className || '').split(/\s+/).includes(c); },
      add() {}, remove() {},
    },
    hasAttribute(k) { return Object.prototype.hasOwnProperty.call(attrs, k); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null; },
    setAttribute(k, v) { attrs[k] = String(v); },
    removeAttribute(k) { delete attrs[k]; },
    appendChild(child) { children.push(child); return child; },
    querySelector(sel) {
      if (sel === 'img') return children.flatMap((c) => c.tagName === 'PICTURE' ? c.children : [c]).find((c) => c.tagName === 'IMG') || null;
      if (sel === '.wt-zh-btn-overlay') return children.find((c) => c.className === 'wt-zh-btn-overlay') || null;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === 'source') return children.flatMap((c) => c.tagName === 'PICTURE' ? c.children : [c]).filter((c) => c.tagName === 'SOURCE');
      return [];
    },
  };
}
const bannerBtn = makeMockEl('A', { href: '/aviation' }, 'main-button_item');
bannerBtn.classList.contains = (c) => c === 'main-button_item';
const picEl = makeMockEl('PICTURE');
const srcEl = makeMockEl('SOURCE', { srcset: origBannerSrcset });
const imgEl = makeMockEl('IMG', { src: origBannerSrc });
picEl.appendChild(srcEl);
picEl.appendChild(imgEl);
bannerBtn.appendChild(picEl);

const bannerDoc = {
  head: { appendChild() {} },
  body: {
    classList: { add() {}, remove() {}, contains() { return false; } },
    querySelectorAll(sel) {
      if (sel === '.main-button_item source[data-wt-zh-orig-srcset]') return srcEl.hasAttribute('data-wt-zh-orig-srcset') ? [srcEl] : [];
      if (sel === '.main-button_item img[data-wt-zh-orig-src]') return imgEl.hasAttribute('data-wt-zh-orig-src') ? [imgEl] : [];
      if (sel === '.main-button_item[data-wt-zh-btn-done]') return bannerBtn.dataset.wtZhBtnDone ? [bannerBtn] : [];
      if (sel === '.main-button_item') return [bannerBtn];
      return [];
    },
  },
  getElementById() { return { id: 'wt-zh-main-btn-styles' }; },
  createElement(tag) { return makeMockEl(tag.toUpperCase()); },
  createTreeWalker() { return { nextNode: () => null }; },
  querySelectorAll(sel) { return this.body.querySelectorAll(sel); },
};
bannerDoc.body.ownerDocument = bannerDoc;
bannerBtn.ownerDocument = bannerDoc;
translateMainButtons(bannerBtn);
assert.equal(bannerBtn.children.length, 1);
assert.equal(bannerBtn.children.filter((c) => c.className === 'wt-zh-btn-overlay').length, 0);
const origDoc3 = global.document;
global.document = bannerDoc;
setZhMode(false);
assert.equal(Boolean(bannerBtn.dataset.wtZhBtnDone), false);
setZhMode(true);
assert.equal(bannerBtn.children.length, 1);
global.document = origDoc3;

// L. v1.3.6 全站 5706 页深层弹窗漏翻与反中英混翻回归测试
assert.equal(translateFixedText('Protects against IR-guided missiles'), '防御红外制导导弹');
assert.equal(translateFixedText('Ball: Omni-purpose bullet'), 'Ball：通用弹');
assert.equal(translateFixedText('AP - Armor-piercing bullet'), 'AP - 穿甲弹');
assert.equal(translateFixedText('T - Tracer bullet'), 'T - 曳光弹');
assert.equal(translateFixedText('I - Incendiary bullet'), 'I - 燃烧弹');
assert.equal(
  translateFixedText('ATGM (tandem) - Anti-Tank Guided Missile (tandem-charge)'),
  'ATGM (串联) - 反坦克导弹（串联装药）'
);
assert.equal(
  translateFixedText('HEAT MP - High explosive Anti-Tank, Multi-purpose shell'),
  'HEAT MP - 多用途破甲弹'
);
assert.equal(
  translateFixedText('PELE-T: Armor-piercing fragmentation tracer shell with enhanced lateral effect'),
  'PELE-T：横向效应增强型穿甲破片曳光弹'
);
assert.equal(translateFixedText('AC shell - Anti-concrete shell'), 'AC 弹 - 混凝土破坏弹');
assert.equal(translateFixedText('Inline, 12-cylinder'), '直列 12 缸');
assert.equal(translateFixedText('Turret 12.7 mm belts'), '12.7 毫米炮塔弹链');
assert.equal(translateFixedText('Vertical Take-Off and Landing'), '垂直起降');
assert.equal(translateFixedText('TWS ESA'), '边扫描边跟踪（相控阵）');
assert.equal(translateFixedText('Allows the installation of LS-6 guided bombs:'), '可挂载 LS-6 制导炸弹：');
assert.equal(translateFixedText('Allows the installation of GB laser guided bombs.'), '可挂载 GB 激光制导炸弹。');
assert.equal(translateFixedText('Allows the installation of satellite guided bombs:'), '可挂载卫星制导炸弹：');
assert.equal(translateFixedText('1,600 lb AN-Mk 1 armor-piercing bomb'), '1,600 磅 AN-Mk 1 穿甲炸弹');

// 反中英混翻守卫
assert.equal(translateFixedText('In Air Battles'), null);
assert.equal(translateFixedText('Turret armor cheeks are near-impenetrable'), null);
assert.equal(translateFixedText('Switch selected weapon to missiles'), null);
assert.equal(translateFixedText('Did you know? // Thrust Vectoring Missiles'), null);

console.log('core tests passed');
