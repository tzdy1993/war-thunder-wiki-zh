import glob
import re
import html
import sys
import json
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob('test/site/*.html')
print(f'Scanning {len(files)} files for data-feature-popover...')

all_strings = Counter()
files_with_features = 0

pattern = re.compile(r'data-feature-popover=([\'"])(.*?)\1', re.DOTALL)
tag_pattern = re.compile(r'<[^>]+>')
svg_pattern = re.compile(r'<svg.*?</svg>', re.DOTALL)

for f in files:
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
            if 'data-feature-popover' not in content:
                continue
            matches = pattern.findall(content)
            if matches:
                files_with_features += 1
                for _, raw_pop in matches:
                    dec = html.unescape(raw_pop)
                    dec_nosvg = svg_pattern.sub('', dec)
                    clean = tag_pattern.sub('\n', dec_nosvg)
                    for line in clean.split('\n'):
                        line = line.replace('\xa0', ' ').strip()
                        # normalize spaces
                        line = re.sub(r'\s+', ' ', line)
                        if line and len(line) > 1 and re.search(r'[a-zA-Z]', line):
                            all_strings[line] += 1
    except Exception as e:
        pass

print(f'Scanned {len(files)} files. Files with features: {files_with_features}')
print(f'Total unique text lines in popovers: {len(all_strings)}')

# Save all strings to json for further processing
with open('tools/feature_popover_raw_strings.json', 'w', encoding='utf-8') as fp:
    json.dump(dict(all_strings.most_common()), fp, ensure_ascii=False, indent=2)

print('\nTop 100 most common strings in feature popovers:')
for s, count in all_strings.most_common(100):
    print(f'[{count:4d}] {s}')
