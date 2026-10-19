'use strict';

const assert = require('node:assert/strict');
const {
  translateFixedText,
  translateUnitHref,
  translateNodeText,
  shouldSkipElement,
  scheduleTask,
  scan,
  translateElementAttributes,
  MAIN_BUTTON_TITLES,
  translateMainButtons,
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
assert.equal(translateFixedText('at 6,096 m'), '在 6,096 米高度');
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
assert.equal(translateFixedText('34 km/h'), '34 公里/小时');
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
assert.equal(translateFixedText('290 / 462 / 495 km/h'), '290 / 462 / 495 公里/小时');
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
assert.equal(translateFixedText('Operator USSR'), '使用国 苏联');
assert.equal(translateFixedText('Vehicles by updates Aircraft CBT'), '按版本更新的载具 飞机封闭测试');
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

console.log('core tests passed');
