import json
import re

with open('wt-wiki-zh.user.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if re.search(r'["\']t["\']\s*:', line):
        print(f"Line {i+1}: {line.strip()}")
