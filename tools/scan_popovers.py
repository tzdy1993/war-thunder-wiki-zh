import json
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")

# 获取当前 core.js 翻译能力
res = subprocess.run(
    ["node", "-e", "const c = require('./wt-wiki-zh.core.js'); console.log(JSON.stringify(Object.keys(c.FIXED_TRANSLATIONS)));"],
    capture_output=True,
    text=True,
    encoding="utf-8"
)
fixed_keys = set(json.loads(res.stdout))

popover_path = "test/popover-texts.md"
from collections import Counter
untranslated = Counter()

# 用 node translateFixedText 进行实际模拟翻译
test_script = """
const c = require('./wt-wiki-zh.core.js');
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    const res = c.translateFixedText(line);
    if (!res) {
        console.log(line);
    }
});
"""

with open(popover_path, "r", encoding="utf-8", errors="ignore") as f:
    for line in f:
        line = line.strip()
        if line.startswith("- generic:"):
            text = line[len("- generic:"):].strip()
            if text and len(text) < 120 and re.search(r"[a-zA-Z]{2,}", text):
                untranslated[text] += 1

print(f"Total unique raw popover lines: {len(untranslated)}")

# 对 top 200 跑实际 translateFixedText 过滤
proc = subprocess.Popen(["node", "-e", test_script], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, encoding="utf-8")
top_candidates = [t for t, _ in untranslated.most_common(500)]
out, _ = proc.communicate("\n".join(top_candidates))
truly_untranslated = [line.strip() for line in out.splitlines() if line.strip()]

print(f"Truly untranslated in Top 500: {len(truly_untranslated)}")
print("\n--- Truly untranslated Top 60 ---")
for t in truly_untranslated[:60]:
    print(f"[{untranslated[t]:3d}] {t}")
