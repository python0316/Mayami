# Mayami — E-Commerce & B2B Marketplace Platform

Mayami — zamonaviy, to'liq funksional B2B & B2C elektron tijorat platformasi. SuperAdmin, B2B Sotuvchilar (Vendors) va Xaridorlar uchun yagona ekotizim.

---

## 🌟 Tizim Arxitekturasi va Yangi Imkoniyatlar

### 1. 🛡️ Yagona Boshqaruv Markazi (Unified Portal: `/admin` & `/shop`)
Admin va sotuvchilar uchun alohida tarqoq panellar o'rniga **bitta yagona, intellektual boshqaruv portali** yaratildi:
* **SuperAdmin (Barcha Huquqlar)**:
  * Login: `admin` | Parol: `admin2026`
  * Platformadagi barcha do'konlar, tovarlar, buyurtmalar, hikoyalar va sharhlarni nazorat qiladi.
  * Har bir do'konni alohida yoki butun platforma bo'yicha tahlil qilish uchun qulay do'kon filtri mavjud.
* **Granular Rollar va Ruxsatlar Tizimi (RBAC)**:
  * SuperAdmin istalgan sotuvchi uchun login/parol yaratadi va unga maxsus huquqlar (permissions) beradi:
    - ✅ `manage_products` — Mahsulotlar (qo'shish, narx, o'lcham, ranglar, ombor)
    - ✅ `manage_orders` — Buyurtmalar (qabul qilish va holatini yetkazildiga o'tkazish)
    - ✅ `manage_stories` — 24-Soatlik Stories (hikoyalar joylash va o'chirish)
    - ✅ `manage_reviews` — Sharhlar (mijozlar fikrlarini o'qish va rasmiy javob qaytarish)
    - ✅ `view_analytics` — Savdo va daromad statistikasi
    - ✅ `manage_settings` — Do'kon sozlamalari (profil, manzil, telefon)
  * **Dinamik interfeys**: Sotuvchi o'z login-paroli bilan kirganda, u ham shu yagona boshqaruv portaliga kiradi, lekin **faqat SuperAdmin unga ruxsat bergan bo'limlar** ko'rinadi va ishlaydi!

---

### 2. ⭐ Shaffof Sharhlar va Reytinglar Tizimi (1-5 Yulduzcha & Sotuvchi Javobi)
* **Xaridor uchun**:
  * Mahsulot sahifasida (`/product/:id`) va mahsulot modalida (`ProductDetailModal`) mijozlar qoldirgan barcha sharhlar ochiq va shaffof ko'rinadi.
  * Mahsulotni xarid qilgach (yoki profilidagi buyurtmalar tarixidan), xaridor 1 dan 5 gacha yulduzcha tanlab, o'z fikrini qoldirishi mumkin.
  * O'rtacha reyting va sharhlar soni bir zumda qayta hisoblanadi.
* **Sotuvchi va SuperAdmin uchun**:
  * Boshqaruv portalida **"Sharhlar & Javoblar"** bo'limi mavjud.
  * Sotuvchi o'z tovarlariga kelgan sharhlarni ko'radi va har bir sharh ostida **"Javob qaytarish"** orqali rasmiy munosabat bildiradi.
  * Sotuvchining rasmiy javobi (masalan: *"🏪 Elegance Fashion rasmiy javobi: 'Fikringiz uchun rahmat!' "*) mahsulot sahifasida barcha xaridorlarga shaffof tarzda ko'rinadi.

---

### 3. ⚡ 24-Soatlik Faol Stories (Avtomatik O'chish Tizimi)
* Sotuvchi yoki SuperAdmin hikoya (Story) joylaganda, tizim avtomatik tarzda `createdAt` vaqtini qayd etadi.
* **24-soatlik qoida**: Story aynan 24 soat davomida butun platformadagi xaridorlarga ko'rinadi va 24 soat o'tgach **avtomatik ravishda o'chib ketadi**.
* Boshqaruv panelida har bir hikoyaning qolgan vaqti jonli hisoblab ko'rsatiladi (masalan: `⏳ 23 soat 45 daqiqa qoldi`).
* 24 soatdan oshgan hikoyalar xaridorlar lentasida (`StoriesReel` va `StoryViewerModal`) ko'rsatilmaydi.

---

### 4. 🛒 100% Ishlaydigan Oldi-Sotdi Tizimi (E-Commerce Flow)
* Mahsulotni tanlash ➔ O'lcham va rang tanlash ➔ Savatga qo'shish ➔ Buyurtmani rasmiylashtirish (Checkout).
* Yangi buyurtma darhol sotuvchining (va SuperAdmin) boshqaruv panelidagi **"Buyurtmalar"** bo'limida paydo bo'ladi.
* Sotuvchi buyurtma holatini bosqichma-bosqich o'zgartiradi:
  `Kutilmoqda (Pending)` ➔ `Tayyorlanmoqda (Processing)` ➔ `Yetkazilmoqda (Shipped)` ➔ `Yetkazildi (Delivered)` yoki `Bekor qilindi (Cancelled)`.
* Xaridor o'z shaxsiy profilida (`/profile`) real vaqtda buyurtmasining yangilangan holatini ko'radi.

---

## 🚀 Ishga Tushirish va Sinab Ko'rish

```bash
cd D:\2026mall

# Dasturchi rejimi
npm run dev

# Ishlab chiqarishga yig'ish
npm run build

# Preview server
npm run preview
```

### 🔑 Sinov Uchun Login/Parollar:

| Rol | Login | Parol | Huquqlar |
|---|---|---|---|
| **🛡️ SuperAdmin** | `admin` | `admin2026` | **Barcha huquqlar** (barcha do'konlar, rollar, tovarlar, sharhlar) |
| **🏪 Elegance Fashion** | `elegance_shop` | `shop123` | Mahsulotlar, Buyurtmalar, Stories, Sharhlar, Tahlil, Sozlamalar |
| **👟 Urban Step Shoes** | `urban_shop` | `shop123` | Mahsulotlar, Buyurtmalar, Stories, Sharhlar, Tahlil, Sozlamalar |
| **💄 Glow Beauty** | `glow_shop` | `shop123` | Mahsulotlar, Buyurtmalar, Stories, Sharhlar, Tahlil, Sozlamalar |

*(SuperAdmin portalda xohlagan vaqtda yangi sotuvchi ochishi yoki mavjud sotuvchining ruxsatlarini birgina checkbox orqali o'zgartirishi mumkin).*
