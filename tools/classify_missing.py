import json
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

with open("missing_popover_terms.json", "r", encoding="utf-8") as f:
    missing = json.load(f)

print(f"Total missing: {len(missing)}")

# 1. Belt filling
belt_fillings = [t for t in missing if t.startswith("Belt filling:")]
# 2. Abbr: Full name
bullet_abbrs = [t for t in missing if re.match(r"^[A-Za-z0-9/-]+:\s+[A-Za-z]", t) and not t.startswith("Belt filling:")]
# 3. Numeric with unit
num_units = [t for t in missing if re.match(r"^[\d,]+(?:\.\d+)?\s*(?:km|m|kg|t|mm|cm|s|min|h|hp|hp/t|rpm|shots/min|rounds|M|G|°/s|°|%)", t, re.IGNORECASE)]
# 4. Short property headers (<= 30 chars, no colon, no punctuation)
headers = [t for t in missing if len(t) <= 35 and not re.search(r"[:\.\?!,]", t) and t not in belt_fillings and t not in bullet_abbrs and t not in num_units]
# 5. Long descriptions (> 35 chars or sentences)
descriptions = [t for t in missing if t not in belt_fillings and t not in bullet_abbrs and t not in num_units and t not in headers]

print(f"1. Belt filling patterns: {len(belt_fillings)} (Total occurrences: {sum(missing[t] for t in belt_fillings)})")
print(f"2. Shell/Bullet 'Abbr: Full': {len(bullet_abbrs)} (Total occurrences: {sum(missing[t] for t in bullet_abbrs)})")
print(f"3. Pure Number + Unit: {len(num_units)} (Total occurrences: {sum(missing[t] for t in num_units)})")
print(f"4. Property Headers & Short Terms: {len(headers)} (Total occurrences: {sum(missing[t] for t in headers)})")
print(f"5. Sentences & Descriptions: {len(descriptions)} (Total occurrences: {sum(missing[t] for t in descriptions)})")

print("\n--- Top 20 Shell Abbr ---")
for t in sorted(bullet_abbrs, key=lambda x: -missing[x])[:20]:
    print(f"  [{missing[t]:4d}] {t}")

print("\n--- Top 25 Property Headers ---")
for t in sorted(headers, key=lambda x: -missing[x])[:25]:
    print(f"  [{missing[t]:4d}] {t}")

print("\n--- Top 15 Descriptions ---")
for t in sorted(descriptions, key=lambda x: -missing[x])[:15]:
    print(f"  [{missing[t]:4d}] {t}")
