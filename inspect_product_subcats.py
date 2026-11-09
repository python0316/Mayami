import json
import re

with open('src/data/mockData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const initialProducts = (\[.*?\]);', text, re.DOTALL)
prods = json.loads(m.group(1))

for idx, p in enumerate(prods):
    title = p.get('title', {}).get('uz', '')[:40]
    cat = p.get('category_slug')
    gender = p.get('gender')
    subcat = p.get('subcategory_slug')
    print(f"#{idx+1:02d} Cat:{cat:10s} Gender:{str(gender):8s} Subcat:{str(subcat):12s} Title:{title}")
