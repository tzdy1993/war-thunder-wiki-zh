'use strict';
// 错翻检测：从构建产物读全部词典，报告同键不同译的冲突
const core = require('./wt-wiki-zh.user.js');
const fixed = core.FIXED_TRANSLATIONS;
const unit = core.UNIT_NAME_TRANSLATIONS;
const term = core.TERM_TRANSLATIONS;

// wiki 载具显示名自带的分组/国籍/特殊标记前缀（非译名内容，比较时剥离）
const MARKER_CHARS = '▂▃▄▅▀◄◔◘◊◗◥◐◌◍◡◢○⋠␗␙␠☢“\uf059';
const strip = (v) => (v ? v.replace(new RegExp(`^[${MARKER_CHARS}]+`), '') : v);

// 已人工定夺的上下文分流（运行时按上下文处理，非错翻）
const INTENTIONAL = {
  Air: { f: '空中', o: '气冷', why: 'FIXED 用于 Air/Ground/Naval 表头；飞行控制 Air brake 已由代码整词规则处理' },
  Displacement: { f: '排水量', o: '排气量', why: 'wiki 只出现在舰船特性表（排水量）；引擎排气量为官方 mod 词但页面无此语境' },
  Flares: { f: '热焰', o: '热焰弹', why: '两种译名都是官方词条；页面出现处均在受保护的文章正文' },
  Mobility: { f: '机动性', o: '机动改装', why: '特性块=机动性、改装树标题=机动改装，代码已按 DOM 上下文区分' },
  SB: { f: '全真', o: 'SB', why: 'FIXED 用于 BR 行模式标签；UNIT_NAME 保留官方载具名 SB（图波列夫轰炸机）' },
  Shenyang: { f: '沈阳', o: '歼-5', why: 'FIXED 用于制造商列表；UNIT_NAME 为官方载具名' },
  A6M: { f: '零战', o: '零战二一型', why: 'FIXED 用于裸文本泛称；链接走 slug 词典得整名' },
  'P-61A-11': { f: 'P-61A-11 黑寡妇', o: 'P-61A-11', why: 'FIXED 用于全名展示；UNIT_NAME 为官方简写' },
  'Meteor F Mk 8 G.41K': { f: '流星 F.8 (格罗斯特 G.41K)', o: '流星 F.8 G.41K', why: 'FIXED 为带制造商全名；UNIT_NAME 为官方简写' },
  'M4A3 (76) W': { f: 'M4A3 (76) W', o: 'M4A3E8', why: 'FIXED 用于 Wiki 页面载具原名；UNIT_NAME 映射至官方代号' },
  'Chi-Ha Kai TD': { f: '九七式中战车改 TD', o: '九七式中战车改 (TD)', why: '括号格式变体，两者均指向同款载具' },
  'Launch range': { f: '发射距离', o: '作战距离', why: '导弹发射参数与雷达参数语境分流' },
  'Installation of pontoons': { f: '安装浮筒，从而获得水上浮渡能力。', o: '浮筒', why: 'FIXED 为改装件说明长句，TERM 为改装件名称' },
  'Machine Gun': { f: '机枪', o: '防空机枪', why: 'FIXED 用于 Wiki 武器类别标题；UNIT_NAME 为官方单位特定名' },
  'Machine Guns': { f: '机枪', o: '防空机枪', why: 'FIXED 用于 Wiki 武器类别标题；UNIT_NAME 为官方单位特定名' },
  'Boat': { f: '小艇', o: '渔船', why: 'FIXED 用于 Wiki 舰船分类；UNIT_NAME 为官方地图单位渔船' },
  'boat': { f: '小艇', o: '渔船', why: 'FIXED 用于 Wiki 舰船分类；UNIT_NAME 为官方地图单位渔船' },
};

const conflicts = [];
for (const [key, fv] of Object.entries(fixed)) {
  const uv = unit[key];
  const tv = term[key];
  if (uv && strip(uv) !== strip(fv)) conflicts.push(['FIXED vs UNIT', key, fv, uv]);
  if (tv && strip(tv) !== strip(fv)) conflicts.push(['FIXED vs TERM', key, fv, tv]);
}
console.log(`=== 词典冲突: ${conflicts.length} ===`);
for (const [kind, key, mine, other] of conflicts) {
  const known = INTENTIONAL[key];
  if (known && known.f === mine && known.o === strip(other)) {
    console.log(`[已确认·${kind}] ${key}  固定词: ${mine}  其他:   ${other}\n  ↳ ${known.why}`);
  } else {
    console.log(`[需定夺·${kind}] ${key}\n  固定词: ${mine}\n  其他:   ${other}`);
  }
}

// 制造商名单 vs UNIT_NAME
const makers = ['Shenyang','Harbin','Nanchang',"Xi'an",'CAC','HAIG','Hongdu','Changhe','Hafei','Shijiazhuang','Shaanxi','AVIC','CATIC','NORINCO','Sukhoi','Yakovlev','Mikoyan','Ilyushin','Tupolev','Bell','Boeing','Grumman','Lockheed','Northrop','Hawker','Supermarine','Gloster','Mitsubishi','Kawasaki','Nakajima','Dornier','Heinkel','Junkers','Focke-Wulf','Messerschmitt','Dassault','MiG','Mil','Kamov','Sikorsky','Hughes','Agusta','Eurocopter','Panavia','SEPECAT','Saab','SAAB','BAe','British Aerospace'];
const makerHits = [];
for (const mk of makers) {
  const uv = unit[mk];
  const fv = fixed[mk];
  if (uv && uv !== mk && fv !== '沈阳' && fv !== mk) makerHits.push([mk, uv, fv]);
}
console.log(`\n=== 制造商 vs 载具名: ${makerHits.length} ===`);
for (const [mk, uv, fv] of makerHits) console.log(`${mk}: UNIT=${uv} FIXED=${fv || '(无)'}`);
