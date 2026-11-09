# -*- coding: utf-8 -*-
import json
import re

with open('src/data/mockData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'export const initialProducts = (\[.*?\]);', text, re.DOTALL)
prods = json.loads(m.group(1))

# Let's inspect each product and determine its subcategory
# Category 1: shoes (20 items)
# Subcategories:
#   - mens-footwear (Erkaklar poyabzallari)
#   - womens-shoes (Ayollar poyabzallari)
#   - boys-shoes (O'g'il bolalar poyabzallari)
#   - girls-shoes (Qizlar poyabzallari)

# Category 2: clothing (20 items)
# Subcategories:
#   - mens-clothing (Erkaklar kiyimi)
#   - womens-clothing (Ayollar kiyimi)
#   - clothes-for-boys (O'g'il bolalar kiyimi)
#   - clothes-for-girls (Qizlar kiyimi)

# Category 3: accessories (20 items)
# Subcategories:
#   - mens-accessories (Erkaklar aksessuarlari)
#   - womens-accessories (Ayollar aksessuarlari)
#   - headwear-scarves (Bosh kiyimlar va sharflar)
#   - belts (Kamarlar va belbog'lar)

# Category 4: beauty-and-personal-care (20 items)
# Subcategories:
#   - makeup (Makiyaj va bezaklar)
#   - nail-art (Ulama tirnoqlar va nakleykalar)
#   - face-care (Yuz parvarishi)
#   - personal-hygiene (Shaxsiy gigiyena)

subcat_mapping = {
    # Shoes
    981876: "girls-shoes",
    981782: "girls-shoes",
    981772: "boys-shoes",
    978878: "boys-shoes",
    978870: "girls-shoes",
    978867: "boys-shoes",
    978859: "girls-shoes",
    978855: "girls-shoes",
    978842: "girls-shoes",
    972421: "mens-footwear",
    969733: "girls-shoes",
    966421: "girls-shoes",
    966403: "boys-shoes",
    956856: "mens-footwear",
    951472: "womens-shoes",
    951471: "womens-shoes",
    951470: "womens-shoes",
    951469: "womens-shoes",
    951468: "mens-footwear",
    951467: "mens-footwear",

    # Clothing (20 items)
    1016993: "mens-clothing",
    1016992: "mens-clothing",
    1016991: "mens-clothing",
    1016990: "mens-clothing",
    1016989: "mens-clothing",
    1016988: "mens-clothing",
    1016987: "mens-clothing",
    1016985: "mens-clothing",
    1016984: "mens-clothing",
    1016983: "mens-clothing",
    1016982: "mens-clothing",
    1016981: "womens-clothing",
    1016980: "mens-clothing",
    1016979: "clothes-for-boys",
    1016978: "mens-clothing",
    1016977: "womens-clothing",
    1016976: "mens-clothing",
    1016975: "clothes-for-girls",
    1016974: "clothes-for-boys",
    1016973: "mens-clothing",

    # Accessories (20 items)
    1014237: "mens-accessories",
    1014234: "mens-accessories",
    1014204: "mens-accessories",
    996533: "womens-accessories",
    995779: "womens-accessories",
    995776: "womens-accessories",
    995429: "womens-accessories",
    995428: "womens-accessories",
    995072: "headwear-scarves",
    993603: "headwear-scarves",
    993596: "womens-accessories",
    992364: "headwear-scarves",
    988937: "womens-accessories",
    988845: "headwear-scarves",
    987702: "belts",
    987188: "headwear-scarves",
    986909: "mens-accessories",
    984046: "belts",
    984036: "belts",
    983117: "belts",

    # Beauty (20 items)
    887235: "nail-art",
    883363: "makeup",
    883361: "makeup",
    883357: "makeup",
    883335: "nail-art",
    883314: "nail-art",
    883308: "makeup",
    883299: "makeup",
    883290: "nail-art",
    881982: "nail-art",
    879888: "makeup",
    879883: "nail-art",
    879881: "nail-art",
    879879: "makeup",
    877170: "nail-art",
    877114: "face-care",
    877107: "nail-art",
    877106: "nail-art",
    877057: "makeup",
    876895: "nail-art"
}

# Assign subcategory_slug to each product
counts = {}
for p in prods:
    pid = p['id']
    sub = subcat_mapping.get(pid)
    if not sub:
        # fallback based on category
        cat = p.get('category_slug')
        if cat == 'shoes':
            sub = 'girls-shoes' if p.get('gender') == 'girls' else 'boys-shoes' if p.get('gender') == 'boys' else 'mens-footwear'
        elif cat == 'clothing':
            sub = 'mens-clothing'
        elif cat == 'accessories':
            sub = 'womens-accessories'
        else:
            sub = 'nail-art'
    p['subcategory_slug'] = sub
    counts[sub] = counts.get(sub, 0) + 1

print("Subcategory distribution:")
for sub, cnt in sorted(counts.items()):
    print(f"  {sub:22s}: {cnt} items")

# Clean initialCategories to have standard subcategories with clean Russian, Uzbek and English titles
clean_categories = [
  {
    "id": 2783,
    "slug": "shoes",
    "title_uz": "Poyabzallar",
    "title_ru": "Обувь",
    "title_en": "Shoes",
    "icon": "Footprints",
    "image": "https://cdn.2020mall.com/uploads/2026/11/02/ZL3qVZhJXCnXbvad.webp",
    "subcategories": [
      {
        "id": 2788,
        "slug": "mens-footwear",
        "title_uz": "Erkaklar poyabzallari",
        "title_ru": "Мужская обувь",
        "title_en": "Men's footwear"
      },
      {
        "id": 2792,
        "slug": "womens-shoes",
        "title_uz": "Ayollar poyabzallari",
        "title_ru": "Женская обувь",
        "title_en": "Women's shoes"
      },
      {
        "id": 2790,
        "slug": "boys-shoes",
        "title_uz": "O'g'il bolalar poyabzallari",
        "title_ru": "Обувь для мальчиков",
        "title_en": "Boys' shoes"
      },
      {
        "id": 2791,
        "slug": "girls-shoes",
        "title_uz": "Qizlar poyabzallari",
        "title_ru": "Обувь для девочек",
        "title_en": "Girls' shoes"
      }
    ]
  },
  {
    "id": 2784,
    "slug": "clothing",
    "title_uz": "Kiyim-kechak",
    "title_ru": "Одежда",
    "title_en": "Clothing",
    "icon": "Shirt",
    "image": "https://cdn.2020mall.com/uploads/2026/11/02/VpPj49vKHL68tAXV.webp",
    "subcategories": [
      {
        "id": 2786,
        "slug": "mens-clothing",
        "title_uz": "Erkaklar kiyimi",
        "title_ru": "Мужская одежда",
        "title_en": "Men's clothing"
      },
      {
        "id": 2789,
        "slug": "womens-clothing",
        "title_uz": "Ayollar kiyimi",
        "title_ru": "Женская одежда",
        "title_en": "Women's clothing"
      },
      {
        "id": 2794,
        "slug": "clothes-for-boys",
        "title_uz": "O'g'il bolalar kiyimi",
        "title_ru": "Одежда для мальчиков",
        "title_en": "Clothes for boys"
      },
      {
        "id": 2793,
        "slug": "clothes-for-girls",
        "title_uz": "Qizlar kiyimi",
        "title_ru": "Одежда для девочек",
        "title_en": "Clothes for girls"
      }
    ]
  },
  {
    "id": 3438,
    "slug": "accessories",
    "title_uz": "Aksessuarlar",
    "title_ru": "Аксессуары",
    "title_en": "Accessories",
    "icon": "Watch",
    "image": "https://cdn.2020mall.com/uploads/2026/11/02/Q6t9F76N08Kz8fLd.webp",
    "subcategories": [
      {
        "id": 3642,
        "slug": "mens-accessories",
        "title_uz": "Erkaklar aksessuarlari",
        "title_ru": "Мужские аксессуары",
        "title_en": "Men's accessories"
      },
      {
        "id": 3536,
        "slug": "womens-accessories",
        "title_uz": "Ayollar aksessuarlari",
        "title_ru": "Женские аксессуары",
        "title_en": "Women's accessories"
      },
      {
        "id": 3483,
        "slug": "headwear-scarves",
        "title_uz": "Bosh kiyimlar va sharflar",
        "title_ru": "Головные уборы и шарфы",
        "title_en": "Headwear & Scarves"
      },
      {
        "id": 3484,
        "slug": "belts",
        "title_uz": "Kamarlar va belbog'lar",
        "title_ru": "Ремни и пояса",
        "title_en": "Belts"
      }
    ]
  },
  {
    "id": 3818,
    "slug": "beauty-and-personal-care",
    "title_uz": "Goʻzallik va parvarish",
    "title_ru": "Красота и уход",
    "title_en": "Beauty & Personal care",
    "icon": "Sparkles",
    "image": "https://cdn.2020mall.com/uploads/2026/11/03/KNtdNhRF2nPIGwh3.webp",
    "subcategories": [
      {
        "id": 3819,
        "slug": "makeup",
        "title_uz": "Makiyaj va bezaklar",
        "title_ru": "Макияж и декор",
        "title_en": "Makeup & Decor"
      },
      {
        "id": 3845,
        "slug": "nail-art",
        "title_uz": "Ulama tirnoqlar va stikerlar",
        "title_ru": "Накладные ногти и стикеры",
        "title_en": "Nail Art & Stickers"
      },
      {
        "id": 3827,
        "slug": "face-care",
        "title_uz": "Yuz va tana parvarishi",
        "title_ru": "Уход за лицом и телом",
        "title_en": "Face & Body care"
      },
      {
        "id": 3836,
        "slug": "personal-hygiene",
        "title_uz": "Shaxsiy gigiyena",
        "title_ru": "Личная гигиена",
        "title_en": "Personal hygiene"
      }
    ]
  }
]

# Update in text
new_prods_json = json.dumps(prods, ensure_ascii=False, indent=2)
text = text[:m.start(1)] + new_prods_json + text[m.end(1):]

m_cat = re.search(r'export const initialCategories = (\[.*?\]);', text, re.DOTALL)
if m_cat:
    new_cats_json = json.dumps(clean_categories, ensure_ascii=False, indent=2)
    text = text[:m_cat.start(1)] + new_cats_json + text[m_cat.end(1):]

with open('src/data/mockData.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated mockData.ts with clean subcategories and assigned subcategory_slug to all products!")
