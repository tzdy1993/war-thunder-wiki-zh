'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const USER_JS_PATH = path.join(ROOT_DIR, 'wt-wiki-zh.user.js');
const CORE_JS_PATH = path.join(ROOT_DIR, 'wt-wiki-zh.core.js');
const SITE_DIR = path.join(__dirname, 'site');

// 加载翻译插件
const userJs = require(USER_JS_PATH);
const coreJs = require(CORE_JS_PATH);

// 常见法语污染单词列表（作为独立单词或翻译片段出现）
const FRENCH_POLLUTION_WORDS = [
  'Blindage', 'Canon', 'Vitesse', 'Munitions', 'Recherche',
  'Achat', 'Portée', 'Portee', 'Viseur', 'Furtif', 'Blindages'
];

// 解码 HTML 实体
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;|\u00a0/g, ' ');
}

// 允许包含“绍特”的合法载具白名单（含常见变体及连字符）
const VALID_SHOT_VEHICLES = [
  "sho't", "shot", "sho't kal", "shot kal", "kal alef", "kal dalet", "kal gimel"
];

// 判断是否为载具名称本身
function isShoTVehicleName(text) {
  const norm = decodeHtmlEntities(text).replace(/[\u2018\u2019`]/g, "'").toLowerCase();
  return VALID_SHOT_VEHICLES.some(v => norm.includes(v));
}

// 判断是否为需要审计的 UI/参数/装备短语（排除长篇正文叙述）
function isAuditableUIText(text) {
  if (!text) return false;
  const t = text.trim();
  if (t.length < 2 || t.length > 80) return false;
  if (!/[a-zA-Z]/.test(t)) return false;
  // 纯数字或数字+符号
  if (/^[\d\s.,%×/°→\-\u2013+()]+$/.test(t)) return false;
  // 网址或邮箱
  if (/(?:https?:\/\/|@)/.test(t)) return false;
  // 句末标点且单词多于5个（正文叙述句）
  if (/[.!?。！？]$/.test(t) && t.split(' ').length > 5) return false;
  // 小写开头且单词多于4个（正文句中片段）
  if (/^[a-z]/.test(t) && t.split(' ').length > 4) return false;
  return true;
}

// MiniNode 类
class MiniNode {
  constructor(type, name = '', value = '') {
    this.nodeType = type; // 1: Element, 3: Text
    this.tagName = name.toUpperCase();
    this.nodeValue = value;
    this.attributes = Object.create(null);
    this.childNodes = [];
    this.parentElement = null;
    this.nextSibling = null;
    this.previousSibling = null;
    this._dataset = null;
  }

  getAttribute(name) {
    const val = this.attributes[name.toLowerCase()];
    return val !== undefined ? val : null;
  }

  setAttribute(name, value) {
    this.attributes[name.toLowerCase()] = String(value);
  }

  hasAttribute(name) {
    return this.attributes[name.toLowerCase()] !== undefined;
  }

  get className() {
    return this.attributes['class'] || '';
  }

  get classList() {
    return {
      contains: (cls) => (this.attributes['class'] || '').split(/\s+/).includes(cls)
    };
  }

  get dataset() {
    if (!this._dataset) {
      this._dataset = new Proxy(this.attributes, {
        get: (target, prop) => {
          const attr = 'data-' + String(prop).replace(/([A-Z])/g, '-$1').toLowerCase();
          return target[attr];
        },
        set: (target, prop, val) => {
          const attr = 'data-' + String(prop).replace(/([A-Z])/g, '-$1').toLowerCase();
          target[attr] = String(val);
          return true;
        }
      });
    }
    return this._dataset;
  }

  get textContent() {
    let text = '';
    for (const c of this.childNodes) {
      text += c.nodeType === 3 ? c.nodeValue : c.textContent;
    }
    return text;
  }

  closest(selector) {
    let curr = this;
    const parts = selector.split(',').map(s => s.trim().toLowerCase());
    while (curr && curr.nodeType === 1) {
      const tag = curr.tagName.toLowerCase();
      const cls = (curr.attributes['class'] || '').toLowerCase();
      for (const p of parts) {
        if (p.startsWith('.')) {
          if (cls.split(/\s+/).includes(p.slice(1))) return curr;
        } else if (p.startsWith('[')) {
          const attr = p.slice(1, -1).split('=')[0].trim();
          if (curr.hasAttribute(attr)) return curr;
        } else if (p.includes(' ')) {
          const sub = p.split(/\s+/);
          if (sub.length === 2 && curr.tagName.toLowerCase() === sub[1]) {
            let pCurr = curr.parentElement;
            while (pCurr) {
              if (pCurr.tagName.toLowerCase() === sub[0]) return curr;
              pCurr = pCurr.parentElement;
            }
          }
        } else if (tag === p) {
          return curr;
        }
      }
      curr = curr.parentElement;
    }
    return null;
  }
}

const VOID_TAGS = new Set([
  'AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT',
  'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'
]);

// 健壮的高性能 HTML 解析器
function parseHTMLToMiniDOM(html) {
  const root = new MiniNode(1, 'ROOT');
  let current = root;
  let pos = 0;
  const len = html.length;

  while (pos < len) {
    if (html[pos] === '<') {
      if (html.startsWith('<!--', pos)) {
        const end = html.indexOf('-->', pos + 4);
        pos = end === -1 ? len : end + 3;
        continue;
      }

      const scriptOrStyle = html.slice(pos, pos + 8).match(/^<(script|style)/i);
      if (scriptOrStyle) {
        const tag = scriptOrStyle[1].toLowerCase();
        let tagEnd = pos;
        let inQuote = false;
        let quoteChar = '';
        while (tagEnd < len) {
          const ch = html[tagEnd];
          if (inQuote) {
            if (ch === quoteChar) inQuote = false;
          } else {
            if (ch === '"' || ch === "'") {
              inQuote = true;
              quoteChar = ch;
            } else if (ch === '>') {
              break;
            }
          }
          tagEnd++;
        }
        pos = tagEnd + 1;
        const closeIdx = html.toLowerCase().indexOf('</' + tag + '>', pos);
        pos = closeIdx === -1 ? len : closeIdx + 3 + tag.length;
        continue;
      }

      if (html[pos + 1] === '/') {
        const end = html.indexOf('>', pos + 2);
        const tag = end === -1 ? '' : html.slice(pos + 2, end).trim().toUpperCase();
        pos = end === -1 ? len : end + 1;
        if (tag) {
          let p = current;
          while (p && p !== root && p.tagName !== tag) {
            p = p.parentElement;
          }
          if (p && p !== root) {
            current = p.parentElement || root;
          }
        }
        continue;
      }

      let inQuote = false;
      let quoteChar = '';
      let tagEnd = pos + 1;
      while (tagEnd < len) {
        const ch = html[tagEnd];
        if (inQuote) {
          if (ch === quoteChar) inQuote = false;
        } else {
          if (ch === '"' || ch === "'") {
            inQuote = true;
            quoteChar = ch;
          } else if (ch === '>') {
            break;
          }
        }
        tagEnd++;
      }

      const tagContent = html.slice(pos + 1, tagEnd).trim();
      pos = tagEnd + 1;

      if (!tagContent) continue;
      const isSelfClosing = tagContent.endsWith('/') || VOID_TAGS.has(tagContent.split(/\s+/)[0].toUpperCase());
      const cleanContent = tagContent.endsWith('/') ? tagContent.slice(0, -1).trim() : tagContent;

      const spaceIdx = cleanContent.search(/\s/);
      const tagName = (spaceIdx === -1 ? cleanContent : cleanContent.slice(0, spaceIdx)).toUpperCase();
      const rawAttrs = spaceIdx === -1 ? '' : cleanContent.slice(spaceIdx).trim();

      const elem = new MiniNode(1, tagName);
      elem.parentElement = current;

      if (rawAttrs) {
        const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        let aMatch;
        while ((aMatch = attrRegex.exec(rawAttrs)) !== null) {
          const k = aMatch[1].toLowerCase();
          const v = aMatch[2] !== undefined ? aMatch[2] : (aMatch[3] !== undefined ? aMatch[3] : (aMatch[4] || ''));
          elem.attributes[k] = v;
        }
      }

      if (current.childNodes.length > 0) {
        const prev = current.childNodes[current.childNodes.length - 1];
        prev.nextSibling = elem;
        elem.previousSibling = prev;
      }
      current.childNodes.push(elem);

      if (!isSelfClosing && tagName !== '!DOCTYPE') {
        current = elem;
      }
    } else {
      const nextTag = html.indexOf('<', pos);
      const textEnd = nextTag === -1 ? len : nextTag;
      const rawText = html.slice(pos, textEnd);
      pos = textEnd;

      if (rawText) {
        const textNode = new MiniNode(3, '', rawText);
        textNode.parentElement = current;
        if (current.childNodes.length > 0) {
          const prev = current.childNodes[current.childNodes.length - 1];
          prev.nextSibling = textNode;
          textNode.previousSibling = prev;
        }
        current.childNodes.push(textNode);
      }
    }
  }

  return root;
}

// 审计单个 HTML 页面
function auditWikiPage(html, fileName) {
  const root = parseHTMLToMiniDOM(html);

  const issues = {
    literalTab: [],
    shotWeightBug: [],
    frenchPollution: [],
    doubleSlash: [],
    atAltitudeBug: [],
    untranslatedUI: [],
    untranslatedPopover: [],
    totalTextNodesChecked: 0,
    totalTranslatedNodes: 0,
  };

  function visit(node) {
    if (node.nodeType === 3) {
      const orig = node.nodeValue;
      if (!orig || !orig.trim()) return;

      const parent = node.parentElement;
      if (!parent) return;

      // 跳过脚本跳过的元素及保护区域
      if (userJs.shouldSkipElement(parent)) return;

      issues.totalTextNodesChecked++;

      // 运行插件翻译逻辑
      const translated = userJs.translateNodeText(node);
      if (translated) issues.totalTranslatedNodes++;
      const effectiveText = (translated !== null && translated !== undefined) ? translated : orig;

      // 痛点 1: 检查未清除的 \t（字面量或不可见控制符）
      if (effectiveText.includes('\\t') || effectiveText.includes('\t')) {
        if (/[\u4e00-\u9fff]\s*(?:\\t|\t)/.test(effectiveText) || /(?:\\t|\t)\s*[\u4e00-\u9fff]/.test(effectiveText)) {
          issues.literalTab.push({ text: effectiveText, orig, loc: `${fileName} <${parent.tagName}>` });
        }
      }

      // 痛点 2: 检查重量等把 "t" 翻译成 "绍特"（排除 Sho't 载具自身）
      if (effectiveText.includes('绍特')) {
        if (!isShoTVehicleName(orig)) {
          // 判定是否是单位、重量、数字等被误翻
          if (/\d+\s*绍特/.test(effectiveText) || /重量.*绍特/.test(effectiveText) || effectiveText.trim() === '绍特' || /\bshort t\b/i.test(orig)) {
            issues.shotWeightBug.push({ text: effectiveText, orig, loc: `${fileName} <${parent.tagName}>` });
          }
        }
      }

      // 痛点 3: 检查法语污染
      // 必须排除德语专有名词（如 Munitions-Schlepper、Munitionsträger）和正文历史火炮全名（Canon de ...）
      for (const fw of FRENCH_POLLUTION_WORDS) {
        if (effectiveText.includes(fw)) {
          // 排除德语专名
          if (effectiveText.includes('Munitions-') || effectiveText.includes('Munitionsträger')) continue;
          // 如果发生在 UI 标签内
          const cls = parent.className || '';
          if (cls.includes('game-unit') || cls.includes('layout') || ['BUTTON', 'TH', 'H1', 'H2', 'H3', 'SPAN'].includes(parent.tagName)) {
            issues.frenchPollution.push({ word: fw, text: effectiveText, orig, loc: `${fileName} <${parent.tagName}>` });
          }
        }
      }

      // 痛点 4: 检查参数中的双斜杠 // 与 at 8,500 米
      if (effectiveText.includes('//') && !/(?:https?:)?\/\//i.test(effectiveText)) {
        issues.doubleSlash.push({ text: effectiveText, orig, loc: `${fileName} <${parent.tagName}>` });
      }
      // 检查参数表中的 at 高度未翻
      const parentCls = parent.className || '';
      if (parentCls.includes('game-unit_chars') || parent.closest('.game-unit_chars')) {
        if (/\bat\s+[\d,]+\s*(?:m|米)/i.test(effectiveText)) {
          issues.atAltitudeBug.push({ text: effectiveText, orig, loc: `${fileName} <${parent.tagName}>` });
        }
      }

      // 痛点 5: 统计未翻译 UI 词汇
      if (isAuditableUIText(orig)) {
        const hasChinese = /[\u4e00-\u9fff]/.test(effectiveText);
        if (!hasChinese && !translated) {
          const cls = parent.className || '';
          const tag = parent.tagName;
          if (cls.includes('game-unit') || cls.includes('layout') || ['BUTTON', 'TH', 'H1', 'H2', 'H3', 'H4'].includes(tag)) {
            issues.untranslatedUI.push({ text: orig.trim(), loc: `${fileName} <${tag} class="${cls}">` });
          }
        }
      }
    } else if (node.nodeType === 1) {
      // 检查属性与 popover 浮层
      if (node.hasAttribute('data-feature-popover')) {
        const popoverHtml = node.getAttribute('data-feature-popover');
        if (popoverHtml) {
          const translatedHtml = popoverHtml.replace(/>([^<]+)</g, (match, textContent) => {
            const trimmed = textContent.replace(/\xa0/g, ' ').trim();
            if (!trimmed || !/[a-zA-Z]/.test(trimmed)) return match;
            const rep = userJs.translateFixedText(trimmed);
            if (rep && rep !== trimmed) {
              return '>' + textContent.replace(trimmed, rep) + '<';
            }
            if (isAuditableUIText(trimmed) && !rep) {
              issues.untranslatedPopover.push(trimmed);
            }
            return match;
          });

          if (/[\u4e00-\u9fff]\s*(?:\\t|\t)/.test(translatedHtml) || /(?:\\t|\t)\s*[\u4e00-\u9fff]/.test(translatedHtml)) {
            issues.literalTab.push({ text: translatedHtml.slice(0, 80), orig: 'data-feature-popover', loc: fileName });
          }
          if (translatedHtml.includes('绍特') && !isShoTVehicleName(popoverHtml)) {
            if (/\d+\s*绍特/.test(translatedHtml) || /重量.*绍特/.test(translatedHtml)) {
              issues.shotWeightBug.push({ text: translatedHtml.slice(0, 80), orig: 'data-feature-popover', loc: fileName });
            }
          }
          for (const fw of FRENCH_POLLUTION_WORDS) {
            if (translatedHtml.includes(fw) && !translatedHtml.includes('Munitions-')) {
              issues.frenchPollution.push({ word: fw, text: translatedHtml.slice(0, 80), orig: 'data-feature-popover', loc: fileName });
            }
          }
          if (translatedHtml.includes('//') && !translatedHtml.includes('://')) {
            issues.doubleSlash.push({ text: translatedHtml.slice(0, 80), orig: 'data-feature-popover', loc: fileName });
          }
        }
      }

      for (const attr of ['title', 'aria-label', 'data-bs-content']) {
        const val = node.getAttribute(attr);
        if (val && val.trim()) {
          if (attr === 'title' && node.classList.contains('game-unit_camo')) continue;
          const rep = userJs.translateFixedText(val);
          const effectiveAttr = rep || val;
          if (effectiveAttr.includes('\\t') && /[\u4e00-\u9fff]/.test(effectiveAttr)) {
            issues.literalTab.push({ text: effectiveAttr, orig: val, loc: `${fileName} [${attr}]` });
          }
          if (effectiveAttr.includes('//') && !effectiveAttr.includes('://')) {
            issues.doubleSlash.push({ text: effectiveAttr, orig: val, loc: `${fileName} [${attr}]` });
          }
        }
      }

      for (const child of node.childNodes) {
        visit(child);
      }
    }
  }

  visit(root);
  return issues;
}

// 批量全量/抽样审查
async function runFullOrSampleAudit(maxPages = 0) {
  const allFiles = fs.readdirSync(SITE_DIR).filter(f => f.endsWith('.html'));
  const totalCount = allFiles.length;
  const targetFiles = (maxPages > 0 && maxPages < totalCount) ? allFiles.slice(0, maxPages) : allFiles;

  console.log(`\n====================================================`);
  console.log(`   COMMENCING DEEP AUDIT ON ${targetFiles.length} WIKI PAGES   `);
  console.log(`====================================================`);

  const startTime = Date.now();
  const summary = {
    totalScanned: 0,
    totalTextNodes: 0,
    totalTranslatedNodes: 0,
    literalTab: [],
    shotWeightBug: [],
    frenchPollution: [],
    doubleSlash: [],
    atAltitudeBug: [],
    untranslatedUIMap: new Map(),
    untranslatedPopoverMap: new Map(),
  };

  for (let i = 0; i < targetFiles.length; i++) {
    const file = targetFiles[i];
    const html = fs.readFileSync(path.join(SITE_DIR, file), 'utf-8');
    const res = auditWikiPage(html, file);

    summary.totalScanned++;
    summary.totalTextNodes += res.totalTextNodesChecked;
    summary.totalTranslatedNodes += res.totalTranslatedNodes;

    if (res.literalTab.length) summary.literalTab.push(...res.literalTab);
    if (res.shotWeightBug.length) summary.shotWeightBug.push(...res.shotWeightBug);
    if (res.frenchPollution.length) summary.frenchPollution.push(...res.frenchPollution);
    if (res.doubleSlash.length) summary.doubleSlash.push(...res.doubleSlash);
    if (res.atAltitudeBug.length) summary.atAltitudeBug.push(...res.atAltitudeBug);

    for (const item of res.untranslatedUI) {
      summary.untranslatedUIMap.set(item.text, (summary.untranslatedUIMap.get(item.text) || 0) + 1);
    }
    for (const popText of res.untranslatedPopover) {
      summary.untranslatedPopoverMap.set(popText, (summary.untranslatedPopoverMap.get(popText) || 0) + 1);
    }

    if ((i + 1) % 500 === 0 || i + 1 === targetFiles.length) {
      process.stdout.write(`  Processed ${i + 1}/${targetFiles.length} pages (${((i + 1) / targetFiles.length * 100).toFixed(1)}%)...\r`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n\nAudit Completed in ${durationSec}s! Average speed: ${(durationSec / targetFiles.length * 1000).toFixed(1)} ms/page.\n`);

  console.log('====================================================');
  console.log('                  QUALITY METRICS                   ');
  console.log('====================================================');
  console.log(`Total Text Nodes Inspected:     ${summary.totalTextNodes}`);
  console.log(`Total Nodes Translated to ZH:   ${summary.totalTranslatedNodes} (${(summary.totalTranslatedNodes / Math.max(1, summary.totalTextNodes) * 100).toFixed(1)}%)`);
  console.log('----------------------------------------------------');

  console.log(`1. Literal \\t Corruption:       ${summary.literalTab.length} issues`);
  if (summary.literalTab.length > 0) {
    summary.literalTab.slice(0, 10).forEach(e => console.log(`   [FAIL] ${e.loc}: ${e.text}`));
  } else {
    console.log('   ✓ PERFECT: 0 literal \\t corrupted strings across all scanned pages.');
  }

  console.log(`2. "t" -> "绍特" Translation Bug: ${summary.shotWeightBug.length} issues`);
  if (summary.shotWeightBug.length > 0) {
    summary.shotWeightBug.slice(0, 10).forEach(e => console.log(`   [FAIL] ${e.loc}: ${e.text}`));
  } else {
    console.log('   ✓ PERFECT: 0 weight/time units corrupted by "绍特".');
  }

  console.log(`3. French Pollution Contamination: ${summary.frenchPollution.length} issues`);
  if (summary.frenchPollution.length > 0) {
    summary.frenchPollution.slice(0, 10).forEach(e => console.log(`   [FAIL] ${e.loc}: "${e.word}" in ${e.text}`));
  } else {
    console.log('   ✓ PERFECT: 0 French vocabulary leaks detected in UI elements.');
  }

  console.log(`4. Double Slash (//) in Parameters: ${summary.doubleSlash.length} issues`);
  if (summary.doubleSlash.length > 0) {
    summary.doubleSlash.slice(0, 10).forEach(e => console.log(`   [FAIL] ${e.loc}: ${e.text}`));
  } else {
    console.log('   ✓ PERFECT: 0 parameter strings with double slashes (//).');
  }

  console.log(`5. "at 8,500 m" Altitude Leaks:     ${summary.atAltitudeBug.length} issues`);
  if (summary.atAltitudeBug.length > 0) {
    summary.atAltitudeBug.slice(0, 10).forEach(e => console.log(`   [FAIL] ${e.loc}: ${e.text}`));
  } else {
    console.log('   ✓ PERFECT: 0 "at ... m" altitude strings leaked in parameter tables.');
  }

  console.log('\n====================================================');
  console.log('         UNTRANSLATED UI & POPOVER ANALYSIS         ');
  console.log('====================================================');
  console.log(`- Unique Untranslated UI Items:      ${summary.untranslatedUIMap.size}`);
  console.log(`- Unique Untranslated Popover Items: ${summary.untranslatedPopoverMap.size}`);

  const sortedUI = [...summary.untranslatedUIMap.entries()].sort((a, b) => b[1] - a[1]);
  console.log('\nTop 25 Frequent Untranslated UI Items:');
  sortedUI.slice(0, 25).forEach(([t, count]) => {
    console.log(`   (${count}x) "${t}"`);
  });

  const sortedPop = [...summary.untranslatedPopoverMap.entries()].sort((a, b) => b[1] - a[1]);
  console.log('\nTop 25 Frequent Untranslated Popover Items:');
  sortedPop.slice(0, 25).forEach(([t, count]) => {
    console.log(`   (${count}x) "${t}"`);
  });

  // 保存详尽报告
  const reportPath = path.join(ROOT_DIR, 'test', 'deep_audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    totalPagesScanned: summary.totalScanned,
    durationSeconds: parseFloat(durationSec),
    metrics: {
      totalTextNodes: summary.totalTextNodes,
      totalTranslatedNodes: summary.totalTranslatedNodes,
      literalTabIssues: summary.literalTab.length,
      shotWeightBugIssues: summary.shotWeightBug.length,
      frenchPollutionIssues: summary.frenchPollution.length,
      doubleSlashIssues: summary.doubleSlash.length,
      atAltitudeBugIssues: summary.atAltitudeBug.length,
    },
    detailShotWeightBugs: summary.shotWeightBug,
    detailFrenchPollution: summary.frenchPollution,
    detailAtAltitudeBugs: summary.atAltitudeBug.slice(0, 10),
    topUntranslatedUI: sortedUI.slice(0, 100),
    topUntranslatedPopover: sortedPop.slice(0, 100),
  }, null, 2), 'utf-8');

  console.log(`\n✓ Full JSON report generated at: ${reportPath}`);
}

module.exports = { MiniNode, parseHTMLToMiniDOM, auditWikiPage, runFullOrSampleAudit };

if (require.main === module) {
  const pagesArg = parseInt(process.argv[2] || '0', 10);
  runFullOrSampleAudit(pagesArg).catch(console.error);
}
