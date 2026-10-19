'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');
const USER_JS_PATH = path.join(ROOT_DIR, 'wt-wiki-zh.user.js');
const CORE_JS_PATH = path.join(ROOT_DIR, 'wt-wiki-zh.core.js');
const CSV_PATH = path.join(ROOT_DIR, 'wt-zh-all.csv');
const SITE_DIR = path.join(__dirname, 'site');

const userJs = require(USER_JS_PATH);

const MARKER_CHARS = '▂▃▄▅▀◄◔◘◊◗◥◐◌◍◡◢○⋠␗␙␠☢“\uf059';
const CLEAN_PATTERN = /[\u2580-\u259f\u25a0-\u25ff\u2400-\u243f\u2622\uf000-\uf8ff\ue000-\uf8ff\u22e0]/g;

function cleanString(str) {
  if (!str) return '';
  return str
    .replace(CLEAN_PATTERN, '')
    .replace(/\t|\\t|\r|\\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\u200b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeChinese(val) {
  let v = cleanString(val);
  for (const c of MARKER_CHARS) {
    v = v.split(c).join('');
  }
  return v.replace(/[（）]/g, (m) => m === '（' ? '(' : ')').replace(/\s+/g, '').trim();
}

// 1. 加载官方语言包
function loadOfficialDictionary() {
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.split(/\r?\n/);
  const official = new Map(); // en -> Set of cn
  const officialExact = new Map(); // en -> best cn

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    // 简易 CSV 分割
    const parts = line.split(',');
    if (parts.length < 4) continue;
    const type = parts[0];
    const en = cleanString(parts[2]);
    const cn = cleanString(parts.slice(3).join(','));
    if (!en || !cn) continue;

    if (!official.has(en)) official.set(en, new Set());
    official.get(en).add(cn);

    // 优先保留非截断、标准译名
    if (!officialExact.has(en) || officialExact.get(en).length < cn.length) {
      officialExact.set(en, cn);
    }
  }
  return { official, officialExact };
}

// 2. 检查错译（偏离官方中文）
function auditDeviationsFromOfficial(official) {
  const deviations = [];

  // 意图保留的特殊词（维基专用，如游戏模式、特殊标签等）
  const INTENTIONAL = new Set([
    'Air', 'Displacement', 'Flares', 'Mobility', 'SB', 'AB', 'RB',
    'Machine Gun', 'Machine Guns', 'Boat', 'boat', 'Rank',
    'Republic of China', 'ROCA ORDC'
  ]);

  const dictsToCheck = [
    ['FIXED_TRANSLATIONS', userJs.FIXED_TRANSLATIONS],
    ['TERM_TRANSLATIONS', userJs.TERM_TRANSLATIONS],
  ];

  for (const [dictName, dict] of dictsToCheck) {
    if (!dict) continue;
    for (const [enKey, myCn] of Object.entries(dict)) {
      if (INTENTIONAL.has(enKey)) continue;
      if (!official.has(enKey)) continue;

      const officialCns = official.get(enKey);
      const myNorm = normalizeChinese(myCn);

      let matched = false;
      for (const ocn of officialCns) {
        if (myNorm === normalizeChinese(ocn)) {
          matched = true;
          break;
        }
      }

      if (!matched) {
        // 如果包含英文缩写扩展说明（如 "连续计算落点 (CCIP)" 与 "连续计算落点"）视为一致
        let extendedMatch = false;
        for (const ocn of officialCns) {
          const oNorm = normalizeChinese(ocn);
          if (myNorm.startsWith(oNorm) || oNorm.startsWith(myNorm)) {
            extendedMatch = true;
            break;
          }
        }
        if (!extendedMatch) {
          deviations.push({
            dict: dictName,
            en: enKey,
            current: myCn,
            official: Array.from(officialCns),
          });
        }
      }
    }
  }

  return deviations;
}

// 3. 检查非规范繁体字（除合法国别）
function auditTraditionalChinese() {
  const tradMap = {
    '飛機': '飞机', '裝甲': '装甲', '導彈': '导弹', '戰鬥機': '战斗机',
    '轟炸機': '轰炸机', '魚雷': '鱼雷', '彈藥': '弹药', '載具': '载具',
    '發動機': '发动机', '機槍': '机枪', '機炮': '机炮', '火箭彈': '火箭弹',
    '穿甲彈': '穿甲弹', '高爆彈': '高爆弹', '減速板': '减速板', '雷達': '雷达',
    '魚': '鱼', '戰': '战'
  };

  const tradFound = [];
  const checkString = (str, loc) => {
    for (const [trad, simp] of Object.entries(tradMap)) {
      if (str.includes(trad)) {
        tradFound.push({ loc, trad, simp, str });
      }
    }
  };

  const userJsSrc = fs.readFileSync(USER_JS_PATH, 'utf-8');
  for (const [trad, simp] of Object.entries(tradMap)) {
    const matches = userJsSrc.match(new RegExp(trad, 'g'));
    if (matches) {
      tradFound.push({ loc: 'wt-wiki-zh.user.js', trad, simp, count: matches.length });
    }
  }

  return tradFound;
}

// 4. 运行全量维基 HTML 审查（技术表格、挂载配置、弹药带、火控设备）
function auditWikiHTMLPages(official, maxPages = 0) {
  const { auditWikiPage } = require('./deep_audit_random_wiki_pages.js');
  const allFiles = fs.readdirSync(SITE_DIR).filter(f => f.endsWith('.html'));
  const targetFiles = (maxPages > 0 && maxPages < allFiles.length) ? allFiles.slice(0, maxPages) : allFiles;

  console.log(`\n====================================================`);
  console.log(`   FULL WIKI SITE SCAN (${targetFiles.length} PAGES)   `);
  console.log(`====================================================`);

  const startTime = Date.now();
  let totalTextNodes = 0;
  let totalTranslatedNodes = 0;

  const bugs = {
    literalTab: [],
    shotWeightBug: [],
    frenchPollution: [],
    doubleSlash: [],
    atAltitudeBug: [],
    untranslatedTechParams: new Map(),
    untranslatedWeapons: new Map(),
    untranslatedAvionics: new Map(),
    untranslatedGeneral: new Map(),
  };

  for (let i = 0; i < targetFiles.length; i++) {
    const file = targetFiles[i];
    const html = fs.readFileSync(path.join(SITE_DIR, file), 'utf-8');
    const res = auditWikiPage(html, file);

    totalTextNodes += res.totalTextNodesChecked;
    totalTranslatedNodes += res.totalTranslatedNodes;

    if (res.literalTab.length) bugs.literalTab.push(...res.literalTab);
    if (res.shotWeightBug.length) bugs.shotWeightBug.push(...res.shotWeightBug);
    if (res.frenchPollution.length) bugs.frenchPollution.push(...res.frenchPollution);
    if (res.doubleSlash.length) bugs.doubleSlash.push(...res.doubleSlash);
    if (res.atAltitudeBug.length) bugs.atAltitudeBug.push(...res.atAltitudeBug);

    for (const item of res.untranslatedUI) {
      const text = item.text;
      const loc = item.loc;
      if (loc.includes('game-unit_chars') || loc.includes('TH') || text.includes('mass') || text.includes('speed') || text.includes('armor') || text.includes('penetration')) {
        bugs.untranslatedTechParams.set(text, (bugs.untranslatedTechParams.get(text) || 0) + 1);
      } else if (loc.includes('weapons') || text.includes('missile') || text.includes('bomb') || text.includes('rocket') || text.includes('cannon') || text.includes('belt') || text.includes('loadout')) {
        bugs.untranslatedWeapons.set(text, (bugs.untranslatedWeapons.get(text) || 0) + 1);
      } else if (text.includes('Computer') || text.includes('Radar') || text.includes('Vision') || text.includes('Laser') || text.includes('sensor') || text.includes('warning') || text.includes('HMD')) {
        bugs.untranslatedAvionics.set(text, (bugs.untranslatedAvionics.get(text) || 0) + 1);
      } else {
        bugs.untranslatedGeneral.set(text, (bugs.untranslatedGeneral.get(text) || 0) + 1);
      }
    }

    if ((i + 1) % 500 === 0 || i + 1 === targetFiles.length) {
      process.stdout.write(`  Scanned ${i + 1}/${targetFiles.length} pages (${((i + 1) / targetFiles.length * 100).toFixed(1)}%)...\r`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n\nScan completed in ${durationSec}s! Average: ${(durationSec / targetFiles.length * 1000).toFixed(1)} ms/page.\n`);

  return {
    totalScanned: targetFiles.length,
    totalTextNodes,
    totalTranslatedNodes,
    bugs,
    durationSec,
  };
}

async function main() {
  console.log('=== WAR THUNDER WIKI COMPREHENSIVE QUALITY AUDIT ===\n');

  // 1. 加载官方语言包
  console.log('Loading official language pack (wt-zh-all.csv)...');
  const { official, officialExact } = loadOfficialDictionary();
  console.log(`✓ Loaded ${official.size} unique official English terms.\n`);

  // 2. 检查错译（偏离官方）
  console.log('--- 1. AUDITING TRANSLATION DEVIATIONS FROM OFFICIAL TERMS ---');
  const deviations = auditDeviationsFromOfficial(official);
  console.log(`Found ${deviations.length} terms deviating from official game translations:`);
  deviations.slice(0, 15).forEach((d) => {
    console.log(`  [DEVIATION] "${d.en}" => Current: "${d.current}" | Official: [${d.official.join(', ')}]`);
  });

  // 3. 检查繁体字污染
  console.log('\n--- 2. AUDITING TRADITIONAL CHINESE CONTAMINATION ---');
  const tradIssues = auditTraditionalChinese();
  if (tradIssues.length === 0) {
    console.log('✓ PERFECT: Zero traditional Chinese contamination in core terms.');
  } else {
    console.log(`Found ${tradIssues.length} traditional Chinese occurrences:`);
    tradIssues.forEach(t => console.log(`  [TRAD] "${t.trad}" -> should be "${t.simp}" (${t.count || 1}x)`));
  }

  // 4. 全量维基页面深度 DOM 审计
  console.log('\n--- 3. EXHAUSTIVE DOM TRANSLATION AUDIT (5,706 WIKI PAGES) ---');
  const scanResult = auditWikiHTMLPages(official, 0); // 0 = 全量 5706 页

  console.log('====================================================');
  console.log('             FINAL COMPREHENSIVE SUMMARY            ');
  console.log('====================================================');
  console.log(`Total HTML Pages Scanned:       ${scanResult.totalScanned}`);
  console.log(`Total DOM Text Nodes Checked:   ${scanResult.totalTextNodes}`);
  console.log(`Total Nodes Translated to ZH:   ${scanResult.totalTranslatedNodes} (${(scanResult.totalTranslatedNodes / Math.max(1, scanResult.totalTextNodes) * 100).toFixed(1)}%)`);
  console.log('----------------------------------------------------');
  console.log(`1. Literal \\t Corruption:       ${scanResult.bugs.literalTab.length} issues`);
  console.log(`2. "t" -> "绍特" Weight Errors:  ${scanResult.bugs.shotWeightBug.length} issues`);
  console.log(`3. French Pollution Leaks:      ${scanResult.bugs.frenchPollution.length} issues`);
  console.log(`4. Double Slash (//) Bugs:      ${scanResult.bugs.doubleSlash.length} issues`);
  console.log(`5. "at 8,500 m" Altitude Leaks: ${scanResult.bugs.atAltitudeBug.length} issues`);
  console.log(`6. Official Term Deviations:    ${deviations.length} terms`);

  console.log('\n--- TOP UNTRANSLATED TECHNICAL PARAMETERS ---');
  const sortedParams = [...scanResult.bugs.untranslatedTechParams.entries()].sort((a, b) => b[1] - a[1]);
  sortedParams.slice(0, 20).forEach(([k, v]) => console.log(`  (${v}x) "${k}"`));

  console.log('\n--- TOP UNTRANSLATED WEAPONRY / LOADOUTS / BELTS ---');
  const sortedWeapons = [...scanResult.bugs.untranslatedWeapons.entries()].sort((a, b) => b[1] - a[1]);
  sortedWeapons.slice(0, 20).forEach(([k, v]) => console.log(`  (${v}x) "${k}"`));

  console.log('\n--- TOP UNTRANSLATED AVIONICS / FIRE CONTROL / DEVICES ---');
  const sortedAvionics = [...scanResult.bugs.untranslatedAvionics.entries()].sort((a, b) => b[1] - a[1]);
  sortedAvionics.slice(0, 20).forEach(([k, v]) => console.log(`  (${v}x) "${k}"`));

  // 输出保存报告
  const fullReportPath = path.join(ROOT_DIR, 'test', 'comprehensive_audit_report.json');
  fs.writeFileSync(fullReportPath, JSON.stringify({
    totalPagesScanned: scanResult.totalScanned,
    durationSeconds: parseFloat(scanResult.durationSec),
    textNodesTotal: scanResult.totalTextNodes,
    textNodesTranslated: scanResult.totalTranslatedNodes,
    coverageRate: (scanResult.totalTranslatedNodes / Math.max(1, scanResult.totalTextNodes) * 100).toFixed(1) + '%',
    metrics: {
      literalTab: scanResult.bugs.literalTab.length,
      shotWeightBug: scanResult.bugs.shotWeightBug.length,
      frenchPollution: scanResult.bugs.frenchPollution.length,
      doubleSlash: scanResult.bugs.doubleSlash.length,
      atAltitudeBug: scanResult.bugs.atAltitudeBug.length,
      deviationsFromOfficial: deviations.length,
      traditionalChinese: tradIssues.length,
    },
    topDeviations: deviations.slice(0, 50),
    topUntranslatedParams: sortedParams.slice(0, 50),
    topUntranslatedWeapons: sortedWeapons.slice(0, 50),
    topUntranslatedAvionics: sortedAvionics.slice(0, 50),
  }, null, 2), 'utf-8');

  console.log(`\n✓ Full JSON report generated at: ${fullReportPath}`);
}

module.exports = {
  loadOfficialDictionary,
  auditDeviationsFromOfficial,
  auditTraditionalChinese,
  auditWikiHTMLPages,
  main,
};

if (require.main === module) {
  main().catch(console.error);
}
