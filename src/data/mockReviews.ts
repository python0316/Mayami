import { ProductReview } from '../types';

export const initialReviews: ProductReview[] = [
  {
    id: "rev_1",
    productId: 990001,
    shopId: "shop_1",
    userName: "Rustam Tursunov",
    userPhone: "+998 90 123 45 67",
    rating: 5,
    comment: "Juda ajoyib sifatda ekan! Baxmali qalin va yumshoq, tizzaga juda qulay. Toshkentga 1 kunda yetib keldi. Mayami va Elegance Fashion jamoasiga rahmat!",
    createdAt: "2026-11-07T14:22:00Z",
    verifiedPurchase: true,
    reply: {
      id: "rep_1",
      senderName: "Elegance Fashion Store",
      senderRole: "shop_owner",
      comment: "Assalomu alaykum, Rustam aka! Xaridingizdan mamnun bo'lganingizdan juda xursandmiz. Namozlaringiz ijobat bo'lsin, doimo xizmatingizdamiz!",
      createdAt: "2026-11-07T15:40:00Z"
    }
  },
  {
    id: "rev_2",
    productId: 990001,
    shopId: "shop_1",
    userName: "Madina Alimova",
    userPhone: "+998 97 765 43 21",
    rating: 5,
    comment: "Onamga sovg'a qilib oldim, juda ham xursand bo'ldilar. Ranglari yorqin va naqshlari nihoyatda chiroyli ishlangan.",
    createdAt: "2026-11-08T09:15:00Z",
    verifiedPurchase: true,
    reply: {
      id: "rep_2",
      senderName: "Elegance Fashion Store",
      senderRole: "shop_owner",
      comment: "Assalomu alaykum! Onaxonimizga muborak bo'lsin. Fikringiz biz uchun juda qadrli!",
      createdAt: "2026-11-08T10:05:00Z"
    }
  },
  {
    id: "rev_3",
    productId: 1016993,
    shopId: "shop_1",
    userName: "Dilshod Karimov",
    userPhone: "+998 93 555 88 99",
    rating: 5,
    comment: "Aynan rasmda ko'rsatilgandek keldi. O'lchami ham to'liq mos tushdi. Tikilishi sifatli.",
    createdAt: "2026-11-08T11:45:00Z",
    verifiedPurchase: true,
    reply: {
      id: "rep_3",
      senderName: "Elegance Fashion Store",
      senderRole: "shop_owner",
      comment: "Dilshodbek, xaridingiz muborak bo'lsin! Keyingi buyurtmalaringizda ham mamnuniyat bilan xizmat qilamiz.",
      createdAt: "2026-11-08T12:20:00Z"
    }
  },
  {
    id: "rev_4",
    productId: 1016992,
    shopId: "shop_1",
    userName: "Shahnoza Yusupova",
    userPhone: "+998 91 333 44 22",
    rating: 4,
    comment: "Sifati yaxshi, matosi yoqdi. Faqat yetkazib berish 1 kun kechikdi, lekin kuryer xushmuomala edi.",
    createdAt: "2026-11-08T18:30:00Z",
    verifiedPurchase: true,
    reply: {
      id: "rep_4",
      senderName: "Elegance Fashion Store",
      senderRole: "shop_owner",
      comment: "Shahnozaxon, sharhingiz uchun rahmat! Yetkazib berish xizmatini yanada tezlashtirish ustida ishlayapmiz.",
      createdAt: "2026-11-08T19:10:00Z"
    }
  },
  {
    id: "rev_5",
    productId: 1016990,
    shopId: "shop_2",
    userName: "Bobur Mirzayev",
    userPhone: "+998 94 444 11 00",
    rating: 5,
    comment: "Oyoq kiyim juda yengil va qulay! Kun bo'yi kiyganda ham oyoqni charchatmaydi. Urban Step do'koniga 5 yulduz!",
    createdAt: "2026-11-09T08:00:00Z",
    verifiedPurchase: true,
    reply: {
      id: "rep_5",
      senderName: "Urban Step Shoes",
      senderRole: "shop_owner",
      comment: "Bobur, ijobiy fikringiz uchun katta rahmat! Sizga qulaylik yaratganimizdan xursandmiz.",
      createdAt: "2026-11-09T08:45:00Z"
    }
  },
  {
    id: "rev_6",
    productId: 1016988,
    shopId: "shop_3",
    userName: "Zilola Rahimova",
    userPhone: "+998 90 999 77 11",
    rating: 5,
    comment: "Yuz kremi ajoyib! Terini mayin qiladi, xushbo'y hidli. Asl original mahsulot ekan.",
    createdAt: "2026-11-09T10:10:00Z",
    verifiedPurchase: true
  }
];
