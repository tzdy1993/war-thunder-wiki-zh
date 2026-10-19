import json
import re
import subprocess
import sys
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8")

# 1. 启动 node 进程以测试 translateFixedText
test_worker = """
const c = require('./wt-wiki-zh.core.js');
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    line = line.trim();
    if (!line) return;
    const res = c.translateFixedText(line);
    if (!res || res === line) {
        console.log(line);
    }
});
"""

worker = subprocess.Popen(
    ["node", "-e", test_worker],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    text=True,
    encoding="utf-8"
)

# 2. 统计 popover-texts.md 中的条目
raw_counts = Counter()
with open("test/popover-texts.md", "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        line = line.strip()
        if line.startswith("- generic:"):
            text = line[len("- generic:"):].strip()
            # 过滤无效纯符号或纯数字
            if text and len(text) < 150 and re.search(r"[a-zA-Z]{2,}", text):
                raw_counts[text] += 1

print(f"Total extracted raw candidate texts: {len(raw_counts)}")

# 筛选出现 5 次以上的候选
candidates = [t for t, count in raw_counts.most_common() if count >= 3]
print(f"Candidates with count >= 3: {len(candidates)}")

out, _ = worker.communicate("\n".join(candidates))
untranslated_list = [l.strip() for l in out.splitlines() if l.strip()]

print(f"Truly untranslated candidates: {len(untranslated_list)}")

# 保存到 missing_popover_terms.json 供进一步处理
with open("missing_popover_terms.json", "w", encoding="utf-8") as f:
    json.dump({t: raw_counts[t] for t in untranslated_list}, f, ensure_ascii=False, indent=2)

print("Saved to missing_popover_terms.json")
