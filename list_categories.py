import json
import re

with open('src/data/mockData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const initialCategories = (\[.*?\]);', text, re.DOTALL)
cats = json.loads(m.group(1))

for c in cats:
    print(f"=== Category: {c['slug']} ({c['title_uz']}) ===")
    for sub in c.get('subcategories', []):
        print(f"  - id: {sub['id']} | slug: '{sub['slug']}' | uz: '{sub['title_uz']}' | ru: '{sub.get('title_ru')}'")
