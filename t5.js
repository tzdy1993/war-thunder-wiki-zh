const fs = require('node:fs');
const snap = fs.readFileSync('war-thunder-zh/test/site-texts.md', 'utf-8');
let currentIsArticle = false;
let articleLines = 0, totalLines = 0;
let articleSample = [];
for (const line of snap.split('\n')) {
  const pageMatch = line.match(/^===== PAGE: (.*?) =====$/);
  if (pageMatch) {
    currentIsArticle = /wiki\.warthunder\.com\/(\d{3,}-|video\/)/.test(pageMatch[1]);
    continue;
  }
  totalLines++;
  if (currentIsArticle) { articleLines++; if (articleSample.length < 5) articleSample.push(line.slice(0, 80)); }
}
console.log({ totalLines, articleLines, sample: articleSample });
