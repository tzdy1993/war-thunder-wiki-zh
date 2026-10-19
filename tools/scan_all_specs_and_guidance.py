import glob
import re
import sys
import json
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('test/site/*.html')
print(f'Checking weapon spec tables and guidance in {len(files)} files...')

spec_keys = Counter()
guidance_contexts = Counter()

# Regex to match table headers or key-value rows
row_pattern = re.compile(r'<tr[^>]*>\s*<th[^>]*>(.*?)</th>\s*<td[^>]*>(.*?)</td>', re.IGNORECASE | re.DOTALL)
tag_clean = re.compile(r'<[^>]+>')

for f in files:
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
            if 'Guidance' in content or 'guidance' in content or 'data-feature-popover' in content:
                for th, td in row_pattern.findall(content):
                    c_th = re.sub(r'\s+', ' ', tag_clean.sub('', th)).strip()
                    c_td = re.sub(r'\s+', ' ', tag_clean.sub('', td)).strip()
                    if c_th and len(c_th) < 50 and re.search(r'[a-zA-Z]', c_th):
                        spec_keys[c_th] += 1
                        if 'guidance' in c_th.lower() or 'seeker' in c_th.lower():
                            guidance_contexts[f'{c_th} => {c_td}'] += 1
    except Exception:
        pass

print(f'\nTop 60 weapon / vehicle table keys:')
for k, count in spec_keys.most_common(60):
    print(f'[{count:4d}] {k}')

print(f'\nTop 40 guidance pairs (Key => Value):')
for pair, count in guidance_contexts.most_common(40):
    print(f'[{count:4d}] {pair}')

with open('tools/table_spec_keys.json', 'w', encoding='utf-8') as fp:
    json.dump(dict(spec_keys.most_common()), fp, ensure_ascii=False, indent=2)

with open('tools/guidance_pairs.json', 'w', encoding='utf-8') as fp:
    json.dump(dict(guidance_contexts.most_common()), fp, ensure_ascii=False, indent=2)
