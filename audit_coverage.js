'use strict';
// 漏翻审计：把抓取到的页面快照文本与脚本词典对比，列出仍未覆盖的固定词。
// 用法: node war-thunder-zh/audit_coverage.js [snapshots.md]

const fs = require('node:fs');
const path = require('node:path');
const core = require('./wt-wiki-zh.user.js');

const SNAPSHOT = process.argv[2] || path.join(__dirname, 'test', 'snapshots-all.md');
let snap = fs.readFileSync(SNAPSHOT, 'utf-8').replace(/\r\n?/g, '\n');

function normalize(value) {
  return String(value)
    .replace(/\u00a0/g, ' ')
    .replace(/\u200b/g, '')
    .replace(/[\uf000-\uf8ff]/g, '')
    .replace(/[▀▁▂▃▄▅▆▇◄◘◔◊␗☢]/g, '')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
    .replace(/\bMk\.\s*/gi, 'Mk ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isUserContent(text) {
  const t = normalize(text);
  if (!t) return true;
  if (t.endsWith('\\')) return true; // 快照跨行标记
  if (t.length > 60) return true;
  if (!/[A-Za-z]/.test(t)) return true;
  if (/^\d{2}:\d{2}:\d{2}/.test(t)) return true; // 时间戳
  if (/^[\d\s.,%×/°→\-\u2013]+$/.test(t)) return true;
  if (t.includes('@')) return true; // 用户名/邮箱
  if (/^(?:https?:)?\/\//.test(t)) return true;
  if (/[。！？，]/.test(t)) return true;
  if (/[.!?]$/.test(t) && t.split(' ').length > 6) return true;
  if (t.split(' ').length > 8 && !/^[\w#\d .\-–/:&'’()]+$/.test(t)) return true;
  return false;
}

// 快照行 -> 文本（粗筛：只保留候选；文章页文本标记为设计保留）
const candidates = new Set();
const articleTexts = new Set();
const popoverTexts = new Set();
let currentIsArticle = false;
let currentIsDataPage = false;
let currentIsPopover = false;
for (const line of snap.split('\n')) {
  const pageMatch = line.match(/^===== PAGE: (.*?) =====$/);
  if (pageMatch) {
    currentIsArticle = /wiki\.warthunder\.com\/(\d+|video\/)/.test(pageMatch[1]);
    currentIsDataPage = currentIsArticle || /wiki\.warthunder\.com\/collections\//.test(pageMatch[1]);
    currentIsPopover = /popover-data/.test(pageMatch[1]);
    continue;
  }
  let m = line.match(/^\s*-\s+(?:link|button|tab|heading|radio|status|text|generic)\s+"((?:[^"\\]|\\.)*)"/);
  if (!m) m = line.match(/^\s*-\s+(?:generic|text|button|radio|status):\s+([^\n]+)/);
  if (!m) continue;
  const text = m[1].replace(/\\(["\\])/g, '$1').trim().replace(/^"+|"+$/g, '');
  if (text.includes('"') && !text.endsWith('"')) candidates.add(text + '"');
  else candidates.add(text);
  if (currentIsArticle) articleTexts.add(text);
  if (currentIsPopover) popoverTexts.add(text);
}
// 收集完成后粗筛掉明显非候选（超长/纯数字/含中文），减少后续检查量
for (const text of [...candidates]) {
  if (popoverTexts.has(text)) continue; // popover 描述是长句，跳过长度粗筛
  if (text.length < 3 || text.length > 60 || !/[A-Za-z]/.test(text) || /[\u4e00-\u9fff]/.test(text)) {
    candidates.delete(text);
  }
}

function isDesignKeep(text) {
  const t = normalize(text);
  if (!t) return true;
  if (isUserContent(t)) return true;
  if (/^[,，]/.test(t)) return true;                 // 正文片段
  if (/^(and|or|the|of|a|an|nor)$/i.test(t)) return true;
  if (t.includes('"')) return true;                  // 文章标题/引用
  if (/ — | – /.test(t)) return true;                // 标题分隔符
  if (/\(Wiki\)$/.test(t)) return true;              // 引用来源
  if (/\(.+\)$/.test(t)) return true;                // 括号后缀=标题/专名
  if (/[.!?]$/.test(t)) return true;
  if (/[。！？，]/.test(t)) return true;
  if (t.includes('@')) return true;
  if (/^[a-z]/.test(t) && t.split(' ').length <= 8) return true; // 小写开头=正文片段
  if (/,\s/.test(t)) return true;                                // 含逗号=正文片段
  if (/^[A-Za-z0-9-]+(?:\/[A-Za-z0-9-]+)+$/.test(t)) return true;     // 弹种缩写（AP-T/HEI/SAP-I）
  if (t.length <= 25 && /^[A-Za-z0-9][A-Za-z0-9 .\-/']*$/.test(t) && /[0-9IVX]/.test(t)) return true; // 型号名（含数字/罗马数字）
  if (/^(?:The|A|An) .+ (?:is|was|are|has|had|have)$/i.test(t) && t.length < 45) return true; // 正文句首
  if (/^White \d+$/.test(t)) return true;                        // 涂装名
  if (/^(?:Tricolor deforming|The fastest)$/.test(t)) return true;
  if (t.length > 25) return true;                    // 长句=正文/图注
  if (/(gun mounts|installations|at full speed|in battle|on combat duty|Aerial view|Screenshots|Tragedy and Heroism|Main caliber|decal and title|Zeus has his thunderbolt)/.test(t)) return true;
  if (/^_/.test(t)) return true;                     // 下划线昵称
  if (/^(?:PlayStation|Xbox)\b/.test(t)) return true;
  if (/^(?:YouTube|在 YouTube)/.test(t)) return true;
  if (/Official channel/.test(t)) return true;
  if (/^(?:Red Dragon|Operation|The Great War|War Thunder birthday)/.test(t)) return true;
  if (/^(?:Gloster Meteor|Keebird|Desert Bulldog|Froilan 1|Oktyabrskaya Revolyutsiya|Maksim Gorky|USSR Marat|Marat \(Wiki\)|XM1 \(GM\) Project)$/.test(t)) return true; // 正文链接/作者名/引用/文章标题
  if (/^(?:APKWS|SPICE|Senrai Maidens|HMS|Renown|Glorious|Wiki Team|Fist of the fleet|The highest fire rate|TheSniper_111|Taepea)$/.test(t)) return true; // 专名/作者/文章标题
  if (/^[A-Z][a-z]+$/.test(t) && t.length >= 6) return true;    // 单名作者/专名
  if (/^[A-Z][a-z]+[A-Z]/.test(t)) return true;                 // 骆驼命名作者
  if (/^[\[\]A-Za-z ]+$/.test(t) && t.length <= 3) return true;
  if (/^(?:\(NATO|\) |\. |First-order|Inaccurate|Kronstadt$|-class )/.test(t)) return true; // 正文片段/伪影
  if (/^[A-Z0-9-]{3,12}$/.test(t)) return true;                 // 弹种代号（HEI-PD）
  if (/^(?:Stormin Norman|Punisher|Chemin des Dames|Montmirail|Castilla|\[eSport\] Gendarme|MegaFangs|GiMei|KohleR|TNTe|AviatoR_76|Brawler|Flanker|Spearhead|FinnSupra|Intrépede|Intrépide|Yamato|Helhest)$/.test(t)) return true; // 作者/文章标题
  if (/[À-ſ]/.test(t)) return true;                  // 变音符号专名（Reppū/Mārspiter）
  if (/[「」→＊*&々]/.test(t)) return true;                      // 文章内容特殊字符
  if (/^[A-Za-z]{2,10}$/.test(t) && !core.FIXED_TRANSLATIONS[t] && !core.UNIT_NAME_TRANSLATIONS[t] && !core.TERM_TRANSLATIONS[t]) return true; // 未覆盖的单名（作者/专名）
  if (/was created by player|model was created in collaboration/.test(t)) return true; // 作者致谢
  if (/^[A-Za-z0-9_\-]+$/.test(t) && (t.includes('_') || /[0-9]/.test(t))) return true; // 下划线/数字用户名
  if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(t)) return true;       // 双词大写专名（涂装/部队名）
  if (/^[A-Z][a-z]+'s /.test(t)) return true;                 // 所有格专名
  if (/^\[eSport\]/.test(t)) return true;                    // 电竞赛事文章名
  if (/[-']/.test(t) && !core.FIXED_TRANSLATIONS[t] && !core.UNIT_NAME_TRANSLATIONS[t] && !core.TERM_TRANSLATIONS[t] && !/[0-9]/.test(t.replace(/-/g, ''))) return true; // 连字符/撇号专名
  if (/^[A-Z]{2,} /.test(t)) return true;                         // 全大写缩写开头（TUSK ERA）
  if (/^(?:The HMAS|The HMS|The Fiat|-class|; NATO|; or officially|; the nickname)/.test(t)) return true; // 正文伪影
  if (/[«»]/.test(t)) return true;                               // 法式引号专名
  if (/[,\(]$/.test(t) || /^[–/\[]/.test(t)) return true;       // 截断伪影
  if (/(?:Ausf\.|CARC|MERDC|variant|series|Tiger HAC|Gripen C|Stryker MGS|R\.J\. Mitchell|S\.Rokov|E STZ|Pz\.Aufkl|Aircraft K|Emporemai BPL|Blue N|Digital PLA|Desert Сamouflage|Bomber B|«|»)/.test(t)) return true; // 涂装/型号专名
  if (/[0-9№]/.test(t) && !/^[A-Za-z0-9 -]+$/.test(t)) return true; // 含数字/№ 专名
  if (/^(?:HMS|ORP|HMAS|HMNZS|USS|IJN|KMS|RAN|RAAF|RAF|USAAF|PAVN|PLA|ROKAF|SQNLDR)/.test(t)) return true; // 军徽/舰名/单位
  if (/^'/.test(t)) return true;                                  // 引号开头专名
  if (t.split(' ').length >= 3 && /^[A-Z]/.test(t) && !/\s(?:and|to|of|the|in|on|when|is|are|was|were|for|a|an|with|that|it|its|this|these|by|at|from|as)\s/i.test(t)) return true; // 三词+大写专名（不含结构词）
  if (/^[A-Z][a-z]+ [a-z]/.test(t) && !core.FIXED_TRANSLATIONS[t] && !core.UNIT_NAME_TRANSLATIONS[t] && !core.TERM_TRANSLATIONS[t]) return true; // 大写+小写双词（涂装名）
  if (/^\(/.test(t)) return true;                            // 括号开头正文片段
  if (/^The .+ (of|the|and|was|were|is|are)$/i.test(t)) return true; // 正文句
  if (/^The .+ (?:added|introduced|was|were|is|are) (?:in|during|before|after)/i.test(t)) return true; // 正文句
  if (/\/|_/.test(t) && !/[一-鿿]/.test(t)) return true;  // 内部 ID/路径
  if (/^[A-Za-z0-9. -]{2,20}$/.test(t) && /[A-Z0-9]/.test(t) && !core.FIXED_TRANSLATIONS[t] && !core.TERM_TRANSLATIONS[t] && !core.UNIT_NAME_TRANSLATIONS[t] && t.split(' ').length <= 3) return true; // 弹药/型号专名
  if (/^[\d.,]+\s*(?:mm|km|m|kg|g|M|s|t|%|°|lb|in)$/i.test(t)) return true; // 数值+单位
  if (/(?:^|[\s,])[\d.]+\s*(?:km\/h|mph|m\/s|second|seconds)$/i.test(t)) return true; // 速度/时间数值
  if (/^(?:unit\/|explosiveType\/|he_bomb|\w+\/name)/.test(t)) return true;  // 内部 ID
  if (/\]$/.test(t) || /^[+\]]/.test(t)) return true;                    // 截断伪影
  if (/^(?:Mountain Range|Deep Mountain|Strong Wind|Violet Lightning|Magnificent Lightning|Squall|Sherloc|Chapparal|Praetorian DASS|Ferranti Blue Vixen|Sky Guardian|Japan Steel Works|Groupe d'automitrailleuses|Régiment de Cuirassiers|Régiments de Chasseurs d'Afrique|Japan Air Self-Defense Force|Japan Maritime Self-Defense Force)$/.test(t)) return true; // 专名
  if (/^(?:How Heavy is Dead|A special version of the|Armored Shield of Russia|A Blast from the Past|TWS\+)$/.test(t)) return true; // 文章标题/型号
  return false;
}

const missing = [];
const kept = [];
for (const text of candidates) {
  const translated = core.translateFixedText(text);
  if (translated) continue;
  if (core.UNIT_NAME_TRANSLATIONS[normalize(text)]) continue;
  if (core.TERM_TRANSLATIONS[normalize(text)]) continue;
  if ((currentIsDataPage && !currentIsPopover) || articleTexts.has(text)) {
    kept.push(text);
    continue;
  }
  if (popoverTexts.has(text)) {
    const t = normalize(text);
    // 挂载/传感器型号列表（含逗号且短）→ KEEP；描述句 → FIX
    if (/was created by player|was created in collaboration/.test(t)) {
      kept.push(text); // 作者致谢
    } else if (t.includes(',') && t.length <= 130) {
      kept.push(text);
    } else if (t.length <= 40 && isDesignKeep(text)) {
      kept.push(text);
    } else {
      missing.push(text);
    }
    continue;
  }
  if (isDesignKeep(text)) {
    kept.push(text);
    continue;
  }
  missing.push(text);
}

console.log('--- FIX (untranslated fixed UI) ---');
for (const text of missing) console.log(`  ${text}`);
console.log(`FIX count: ${missing.length}`);
console.log('--- KEEP (user content / proper nouns, by design) ---');
for (const text of kept) console.log(`  KEEP ${text}`);
console.log(`KEEP count: ${kept.length}`);
console.log(`\nunique FIX: ${missing.length}, KEEP: ${kept.length}`);
