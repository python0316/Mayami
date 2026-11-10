export type Language = 'uz' | 'ru' | 'en';
export type Theme = 'light' | 'dark';
export type Currency = 'UZS' | 'USD' | 'RUB';
export type UserRole = 'customer' | 'shop_owner' | 'admin';

export type PermissionKey = 
  | 'manage_products'    // Mahsulotlar qo'shish, tahrirlash, o'chirish
  | 'manage_orders'      // Buyurtmalarni qabul qilish va holatini o'zgartirish
  | 'manage_stories'     // 24 soatlik Stories (hikoyalar) joylash
  | 'manage_reviews'     // Sharhlarni o'qish va munosabat (javob) bildirish
  | 'manage_shops'       // Do'konlarni boshqarish (SuperAdmin)
  | 'manage_users'       // Rollar va sotuvchilar login/parolini boshqarish (SuperAdmin)
  | 'manage_categories'  // Kategoriyalar (SuperAdmin)
  | 'view_analytics'     // Statistika va tahlil
  | 'manage_settings';   // Do'kon sozlamalari (profil, manzil, telefon)

export interface MultiLangString {
  uz: string;
  ru: string;
  en: string;
}

export interface ColorOption {
  name_uz: string;
  name_ru: string;
  name_en: string;
  hex: string;
  inStock?: boolean;
  image_url?: string;
}

export interface Product {
  id: number;
  slug: string;
  category_id: number;
  category_slug: string;
  subcategory_slug?: string;
  shopId: string;
  image_url: string;
  images: string[];
  price: number; // Stored in UZS
  old_price: number;
  discount: number;
  currency: string;
  rating: number;
  reviews_count: number;
  delivery_days: number;
  stock_count: number;
  gender: string;
  name: MultiLangString; // Mahsulot nomi (Product Name)
  title: MultiLangString; // Sarlavha
  short_title: MultiLangString;
  description: MultiLangString; // Mahsulot haqida / Tavsif
  sizes: string[];
  colors: ColorOption[];
}

export interface Story {
  id: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  caption_uz: string;
  caption_ru: string;
  caption_en: string;
  categorySlug?: string;
  categoryName?: string;
  productId?: number;
  createdAt: string; // ISO string
  views: number;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  username: string; // for vendor login
  password: string; // for vendor login
  status: 'active' | 'suspended';
  sellerType: 'official_retailer' | 'business' | 'individual';
  rating: number;
  reviewsCount: number;
  avatar: string;
  banner: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  verified: boolean;
  category_slugs: string[];
  followersCount: number;
  responseTime: string;
  phone: string;
  address: string;
  stories: Story[];
  permissions?: PermissionKey[]; // SuperAdmin bergan maxsus huquqlar
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'superadmin' | 'vendor';
  shopId?: string; // If role is vendor
  permissions: PermissionKey[];
  status: 'active' | 'suspended';
  phone?: string;
  createdAt?: string;
}

export interface ReviewReply {
  id: string;
  senderName: string;
  senderRole: 'shop_owner' | 'superadmin';
  comment: string;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: number;
  shopId: string;
  userId?: string;
  userName: string;
  userPhone?: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string;
  reply?: ReviewReply; // Sotuvchi yoki SuperAdmin javobi
  verifiedPurchase?: boolean;
}

export interface Subcategory {
  id: number;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
}

export interface Category {
  id: number;
  slug: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  icon: string;
  image: string;
  subcategories: Subcategory[];
}

export interface Banner {
  id: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  subtitle_uz: string;
  subtitle_ru: string;
  subtitle_en: string;
  cta_uz: string;
  cta_ru: string;
  cta_en: string;
  bg_gradient: string;
  image: string;
  badge_uz: string;
  badge_ru: string;
  badge_en: string;
  linkCategory: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: ColorOption;
  selectedImage?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId?: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  shippingFee: number;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  region: string;
  address: string;
  paymentMethod: 'click' | 'payme' | 'uzum' | 'cash';
  shopIds: string[];
}

export interface CustomerUser {
  id: string;
  fullName: string;
  phone: string;
  password?: string;
  email?: string;
  addresses: string[];
  createdAt?: string;
}
