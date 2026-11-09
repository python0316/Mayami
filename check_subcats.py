import json
import re

with open('src/data/mockData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const initialProducts = (\[.*?\]);', text, re.DOTALL)
prods = json.loads(m.group(1))

# Check fields of products in shoes
shoes = [p for p in prods if p.get('category_slug') == 'shoes']
print(f"Total shoes: {len(shoes)}")
for i, p in enumerate(shoes[:10]):
    print(f"#{i+1} ID:{p['id']} gender:{p.get('gender')} cat_id:{p.get('category_id')} title_uz:{p.get('title',{}).get('uz')[:50]}")

m2 = re.search(r'export const initialCategories = (\[.*?\]);', text, re.DOTALL)
cats = json.loads(m2.group(1))
for c in cats:
    print(f"\nCategory {c['slug']}:")
    for sub in c.get('subcategories', []):
        print(f"  sub: id:{sub['id']} slug:{sub['slug']} title_uz:{sub['title_uz']}")
