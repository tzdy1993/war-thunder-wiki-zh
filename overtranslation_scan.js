'use strict';
// 过度翻译检测：不该翻译却翻译了的内容全站扫描。
//
// 保护清单（以下内容应保持原文，命中词典即告警）：
//   1. 涂装名（game-unit_camo 的 title 属性）——UGC/市场涂装保留原文
//      （运行时已豁免：translateElementAttributes 跳过 .game-unit_camo，本项为豁免回归监控）
//   2. 文章页标题（h1）——运行时已按 URL 保护（/数字-xxx、/video/、/tips/），本项为回归监控
//   3. 文章正文段落（<article> 内 <p>/<h2>/<h3>）——运行时 isProtectedContext 保护
//   4. 评论/用户内容（data-comment-* 容器）
//   5. 收藏页条目名（unit-collection-card_title）——收藏页列出载具/武器/制造商/更新名，
//      官方有词条者该翻（此类别命中多为正常翻译，仅报告供甄别）
//
// 输出分级：camo/article/comment = 确凿过度翻译（修复后应为 0）；
//           h1 = 需按页面类型甄别（载具/收藏页标题该翻，文章页已保护）；
//           collection = 收藏条目（该翻为主，仅报告）。
//
// 用法: node war-thunder-zh/overtranslation_scan.js [页面目录]
const fs = require('node:fs');
const path = require('node:path');
const core = require('./wt-wiki-zh.user.js');

const DIR = process.argv[2] || path.join(__dirname, 'test', 'site');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.html'));
console.log(`扫描页面数: ${files.length}`);

// 回归守护：运行时豁免/保护代码是否存在
const coreSrc = fs.readFileSync(path.join(__dirname, 'wt-wiki-zh.core.js'), 'utf-8');
const guard = {
  camoExempt: coreSrc.includes("game-unit_camo"),
  articleH1Protected: coreSrc.includes("isArticlePageUrl"),
  articleBodyProtected: coreSrc.includes("isProtectedContext"),
};
console.log(`运行时保护检查: 涂装豁免=${guard.camoExempt} 文章页H1保护=${guard.articleH1Protected} 正文保护=${guard.articleBodyProtected}`);

// 提取标签内文本（去标签/实体）
function innerText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const reports = { camo: [], h1: [], article: [], comment: [], collection: [] };

for (const file of files) {
  const s = fs.readFileSync(path.join(DIR, file), 'utf-8');

  // 1. 涂装名 title 属性
  for (const m of s.matchAll(/game-unit_camo[^>]*title="([^"]*)"/g)) {
    const t = innerText(m[1]);
    if (!t) continue;
    const r = core.translateFixedText(t);
    if (r && r !== t) reports.camo.push({ file, text: t, translated: r });
  }

  // 2. h1 标题
  for (const m of s.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)) {
    const t = innerText(m[1]);
    if (!t || t.length > 80) continue;
    const r = core.translateFixedText(t);
    if (r && r !== t) reports.h1.push({ file, text: t, translated: r });
  }

  // 3. 文章正文段落（article 内的 p/h2/h3）
  const articleMatch = s.match(/<article[\s\S]*?<\/article>/i);
  if (articleMatch) {
    const art = articleMatch[0];
    for (const m of art.matchAll(/<(?:p|h2|h3)[^>]*>([\s\S]*?)<\/(?:p|h2|h3)>/gi)) {
      const t = innerText(m[1]);
      if (!t || t.length > 80) continue;
      const r = core.translateFixedText(t);
      if (r && r !== t) reports.article.push({ file, text: t, translated: r });
    }
  }

  // 4. 评论/用户内容
  for (const m of s.matchAll(/data-comment-(?:body|content)="([^"]*)"/g)) {
    const t = innerText(m[1]);
    if (!t || t.length > 80) continue;
    const r = core.translateFixedText(t);
    if (r && r !== t) reports.comment.push({ file, text: t, translated: r });
  }

  // 5. 收藏页条目名
  for (const m of s.matchAll(/unit-collection-card_title">([^<]*)</g)) {
    const t = innerText(m[1]);
    if (!t) continue;
    const r = core.translateFixedText(t);
    if (r && r !== t) reports.collection.push({ file, text: t, translated: r });
  }
}

let total = 0;
for (const [key, items] of Object.entries(reports)) {
  console.log(`\n=== ${key}: ${items.length} 处过度翻译 ===`);
  const seen = new Set();
  for (const it of items.slice(0, 60)) {
    const k = it.text + '=>' + it.translated;
    if (seen.has(k)) continue;
    seen.add(k);
    console.log(`  ${path.basename(it.file)}  ${JSON.stringify(it.text)} → ${JSON.stringify(it.translated)}`);
  }
  if (items.length > 60) console.log(`  …共 ${items.length} 处`);
  total += items.length;
}
console.log(`\n总计: ${total} 处过度翻译告警`);
process.exit(total === 0 ? 0 : 1);
