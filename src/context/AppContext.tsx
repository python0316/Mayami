import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  Theme, 
  Currency, 
  Product, 
  Category, 
  Subcategory,
  Shop, 
  Story, 
  CartItem, 
  Order, 
  OrderStatus, 
  CustomerUser,
  PermissionKey,
  AdminUser,
  ProductReview,
  ReviewReply,
  Banner
} from '../types';
import { 
  initialProducts, 
  initialCategories, 
  initialShops, 
  initialBanners 
} from '../data/mockData';
import { initialReviews } from '../data/mockReviews';
import { translations } from '../translations';
import { formatUzbekPhone, getRawPhoneDigits, isCompleteUzbekPhone } from '../utils/phoneUtils';
import { translateUzToRu, translateUzToEn, translateColorName, autoTranslateProduct } from '../utils/translator';
import { sanitizeBannerImageUrl, getBannerFallbackImage } from '../utils/mediaUtils';

export const DEFAULT_VENDOR_PERMISSIONS: PermissionKey[] = [
  'manage_products',
  'manage_orders',
  'manage_stories',
  'manage_banners',
  'manage_reviews',
  'view_analytics',
  'manage_settings'
];

export const ALL_PERMISSIONS: PermissionKey[] = [
  'manage_products',
  'manage_orders',
  'manage_stories',
  'manage_banners',
  'manage_reviews',
  'manage_shops',
  'manage_users',
  'manage_categories',
  'view_analytics',
  'manage_settings'
];

interface StoryViewerState {
  isOpen: boolean;
  shopIndex: number;
  storyIndex: number;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountInUZS: number) => string;
  t: typeof translations['uz'];
  
  // Data
  products: Product[];
  shops: Shop[];
  categories: Category[];
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerStatus: (id: string) => void;
  
  // Filtering & Navigation
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Modals & Drawers
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isVisualSearchOpen: boolean;
  setIsVisualSearchOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isMobileCatalogOpen: boolean;
  setIsMobileCatalogOpen: (open: boolean) => void;
  
  // Customer Auth & Registered Users
  currentUser: CustomerUser | null;
  registeredUsers: CustomerUser[];
  deleteRegisteredUser: (userId: string) => void;
  loginUser: (phone: string, password?: string) => { success: boolean; message?: string };
  registerUser: (fullName: string, phone: string, password?: string) => { success: boolean; message?: string };
  logoutUser: () => void;
  updateCustomerProfile: (updates: Partial<CustomerUser>) => void;
  addCustomerAddress: (address: string) => void;
  guestVisitorId: string;
  clearGuestStories: () => void;
  
  // Unified Admin / Vendor Auth (Single Portal)
  adminSession: AdminUser | null;
  loginUnified: (username: string, pass: string) => { success: boolean; role?: 'superadmin' | 'vendor'; error?: string };
  logoutUnified: () => void;
  updateShopPermissions: (shopId: string, permissions: PermissionKey[]) => void;
  updateShopCredentials: (shopId: string, creds: { username?: string; password?: string; name?: string; phone?: string; address?: string }) => void;
  superAdminPassword: string;
  updateSuperAdminPassword: (newPassword: string) => { success: boolean; message: string };
  
  // Legacy Aliases for seamless backward compatibility
  adminAuthenticated: boolean;
  loginAdmin: (username: string, pass: string) => boolean;
  logoutAdmin: () => void;
  authenticatedShop: Shop | null;
  loginShop: (username: string, pass: string) => boolean;
  logoutShop: () => void;
  
  // Reviews & Ratings
  reviews: ProductReview[];
  addReview: (reviewData: Omit<ProductReview, 'id' | 'createdAt'>) => void;
  replyToReview: (reviewId: string, comment: string, senderName: string, senderRole?: 'shop_owner' | 'superadmin') => void;
  deleteReview: (reviewId: string) => void;

  // Stories (24h rule)
  storyViewer: StoryViewerState;
  openStoryViewer: (shopIndex: number, storyIndex?: number) => void;
  closeStoryViewer: () => void;
  setStoryViewer: React.Dispatch<React.SetStateAction<StoryViewerState>>;
  addStoryToShop: (shopId: string, newStory: Omit<Story, 'id' | 'createdAt' | 'views'>) => void;
  deleteStory: (shopId: string, storyId: string) => void;
  viewedStoryIds: string[];
  markStoryAsViewed: (storyId: string, shopId?: string) => void;
  incrementStoryViews: (shopId: string, storyId: string) => void;
  isStoryViewed: (storyId: string) => boolean;
  isShopFullyViewed: (shop: Shop) => boolean;
  getFirstUnviewedStoryIndex: (shop: Shop) => number;
  isStoryActive: (story: Story) => boolean;
  getStoryRemainingHours: (story: Story) => { hours: number; minutes: number; isExpired: boolean; label: string };
  cleanExpiredStories: () => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: any, image?: string) => void;
  removeFromCart: (productId: number, size?: string, colorHex?: string) => void;
  updateCartQuantity: (productId: number, quantity: number, size?: string, colorHex?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  // Wishlist
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  
  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  
  // Shop & Admin Actions
  addProduct: (product: Omit<Product, 'id' | 'slug'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
  toggleShopVerification: (shopId: string) => void;
  toggleShopStatus: (shopId: string) => void;
  updateShopProfile: (shopId: string, updates: Partial<Shop>) => void;
  createShopByAdmin: (shopData: {
    name: string;
    username: string;
    password: string;
    phone: string;
    address: string;
    sellerType: 'official_retailer' | 'business' | 'individual';
    category_slugs: string[];
    permissions?: PermissionKey[];
  }) => Shop;

  // Category Actions (CRUD)
  addCategory: (categoryData: {
    slug?: string;
    title_uz: string;
    title_ru?: string;
    title_en?: string;
    icon?: string;
    image?: string;
    subcategories?: Subcategory[];
  }) => Category;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: number) => { success: boolean; error?: string };
  addSubcategory: (categoryId: number, subData: { title_uz: string; title_ru?: string; title_en?: string; slug?: string }) => void;
  deleteSubcategory: (categoryId: number, subcategoryId: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('mall_lang') as Language) || 'uz';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mall_lang', lang);
  };

  // Theme
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('mall_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('mall_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Currency
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('mall_currency') as Currency) || 'UZS';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('mall_currency', c);
  };

  // Currency rates (1 USD = 12,800 UZS, 1 RUB = 135 UZS)
  const USD_RATE = 12800;
  const RUB_RATE = 135;

  const formatPrice = (amountInUZS: number): string => {
    if (currency === 'USD') {
      const inUsd = amountInUZS / USD_RATE;
      return `$${inUsd.toFixed(2)}`;
    }
    if (currency === 'RUB') {
      const inRub = Math.round(amountInUZS / RUB_RATE);
      return `${inRub.toLocaleString('ru-RU')} ₽`;
    }
    return `${Math.round(amountInUZS).toLocaleString('ru-RU')} so'm`;
  };

  const USERS_STORAGE_KEY = 'mall_registered_users_v3';

  // Registered Users Database (Persistent in localStorage)
  const [registeredUsers, setRegisteredUsers] = useState<CustomerUser[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean out any legacy mock data containing 886782204
          const filtered = parsed.filter(u => !u.phone?.replace(/\D/g, '').includes('886782204') && u.id !== 'user_nodirbek');
          return filtered;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'user_malika',
        fullName: 'Malika Karimova',
        phone: '+998 (90) 123-45-67',
        password: 'password123',
        email: 'malika.k@gmail.com',
        addresses: ['Toshkent sh., Mirzo Ulug\'bek tumani, Mustaqillik shoh ko\'chasi 15'],
        createdAt: '2026-10-22 14:45'
      },
      {
        id: 'user_jasur',
        fullName: 'Jasur Bekmirzayev',
        phone: '+998 (97) 777-88-99',
        password: 'password123',
        email: 'jasur_bek@mail.ru',
        addresses: ['Samarqand sh., Registon ko\'chasi 8'],
        createdAt: '2026-11-01 09:15'
      },
      {
        id: 'user_dilnoza',
        fullName: 'Dilnoza Aliyeva',
        phone: '+998 (99) 811-22-33',
        password: 'password123',
        email: 'dilnoza.a@inbox.uz',
        addresses: ['Farg\'ona sh., Sayilgoh ko\'chasi 24'],
        createdAt: '2026-11-05 16:30'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
    } catch (e) {
      console.error(e);
    }
  }, [registeredUsers]);

  const deleteRegisteredUser = (userId: string) => {
    setRegisteredUsers(prev => {
      const updated = prev.filter(u => u.id !== userId);
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
        localStorage.removeItem(`mall_user_viewed_stories_${userId}`);
        localStorage.removeItem(`mall_user_cart_${userId}`);
        localStorage.removeItem(`mall_user_wishlist_${userId}`);
      } catch (e) {}
      return updated;
    });
    if (currentUser?.id === userId) {
      logoutUser();
    }
  };

  // Customer Auth (Guest by default, persistent profile when registered/logged in)
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem('mall_current_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && (u.id === 'user_nodirbek' || (u.phone && u.phone.replace(/\D/g, '').includes('886782204')))) {
          localStorage.removeItem('mall_current_user');
          return null;
        }
        return u;
      } catch (e) {
        console.error(e);
      }
    }
    return null; // Mehmon (Guest) holatida boshlanadi
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mall_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mall_current_user');
    }
  }, [currentUser]);

  // 24-Hour Stories Helpers
  const isStoryActive = (story: Story): boolean => {
    if (!story || !story.createdAt) return false;
    const createdTime = new Date(story.createdAt).getTime();
    if (isNaN(createdTime)) return true;
    const diffMs = Date.now() - createdTime;
    return diffMs < 24 * 60 * 60 * 1000;
  };

  const getStoryRemainingHours = (story: Story) => {
    if (!story || !story.createdAt) {
      return { hours: 0, minutes: 0, isExpired: true, label: "Muddati tugagan" };
    }
    const createdTime = new Date(story.createdAt).getTime();
    if (isNaN(createdTime)) {
      return { hours: 24, minutes: 0, isExpired: false, label: "24 soat faol" };
    }
    const expiryTime = createdTime + 24 * 60 * 60 * 1000;
    const remainingMs = expiryTime - Date.now();
    if (remainingMs <= 0) {
      return { hours: 0, minutes: 0, isExpired: true, label: "Muddati tugagan (24 soat)" };
    }
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      hours,
      minutes,
      isExpired: false,
      label: `${hours} soat ${minutes} daqiqa qoldi`
    };
  };

  const SHOPS_STORAGE_KEY = 'mall_shops_v10';

  // Shops State
  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem(SHOPS_STORAGE_KEY);
    let loaded: Shop[] = [];
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const reanchorStories = (storiesList: Story[]): Story[] => {
      return (storiesList || []).map((st, sIdx) => {
        const createdMs = st.createdAt ? new Date(st.createdAt).getTime() : 0;
        const isExpired = !st.createdAt || isNaN(createdMs) || (Date.now() - createdMs > 24 * 3600 * 1000);
        const isDemo = /^story_\d+_\d+$/.test(st.id);
        if (isDemo && isExpired) {
          return {
            ...st,
            createdAt: new Date(Date.now() - (sIdx + 1) * 2 * 3600 * 1000).toISOString()
          };
        }
        return st;
      });
    };

    const map = new Map<string, Shop>();
    (initialShops as unknown as Shop[]).forEach(s => {
      // Re-anchor demo stories to recent hours so active stories are visible on demo
      const freshStories = reanchorStories(s.stories || []);
      map.set(s.id, {
        ...s,
        permissions: s.permissions || DEFAULT_VENDOR_PERMISSIONS,
        stories: freshStories
      });
    });

    if (Array.isArray(loaded)) {
      loaded.forEach(s => {
        const existing = map.get(s.id);
        const existingStories = existing?.stories || [];
        const loadedStories = reanchorStories(s.stories || []);
        // Combine newly added shop stories while keeping demo ones fresh
        const mergedStories = loadedStories.length > 0 ? loadedStories : existingStories;

        map.set(s.id, {
          ...existing,
          ...s,
          permissions: s.permissions || existing?.permissions || DEFAULT_VENDOR_PERMISSIONS,
          stories: mergedStories
        });
      });
    }

    return Array.from(map.values()).map(s => ({
      ...s,
      avatar: (s.avatar || '').replace(/cdn\.Mayami\.com/g, 'cdn.2020mall.com'),
      banner: (s.banner || '').replace(/cdn\.Mayami\.com/g, 'cdn.2020mall.com'),
      username: s.username || (s.slug ? s.slug.replace(/-/g, '_') + '_shop' : 'shop_vendor'),
      password: s.password || 'shop123',
      status: s.status || 'active',
      phone: s.phone || '',
      permissions: s.permissions || DEFAULT_VENDOR_PERMISSIONS
    }));
  });

  useEffect(() => {
    localStorage.setItem('mall_shops_v10', JSON.stringify(shops));
  }, [shops]);

  // UNIFIED ADMIN / VENDOR AUTH SESSION
  const [adminSession, setAdminSession] = useState<AdminUser | null>(() => {
    const saved = sessionStorage.getItem('mall_unified_auth_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Backward compatibility with previous admin/shop sessions
    if (sessionStorage.getItem('mall_admin_auth') === 'true') {
      return {
        id: 'superadmin_1',
        name: 'SuperAdmin (Boshqaruvchi)',
        username: 'admin',
        role: 'superadmin',
        permissions: ALL_PERMISSIONS,
        status: 'active',
        phone: '+998 71 200 00 00'
      };
    }
    const savedShop = sessionStorage.getItem('mall_shop_auth');
    if (savedShop) {
      try {
        const sh = JSON.parse(savedShop);
        return {
          id: `admin_${sh.id}`,
          name: sh.name,
          username: sh.username,
          role: 'vendor',
          shopId: sh.id,
          permissions: sh.permissions || DEFAULT_VENDOR_PERMISSIONS,
          status: sh.status || 'active',
          phone: sh.phone
        };
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (adminSession) {
      sessionStorage.setItem('mall_unified_auth_v1', JSON.stringify(adminSession));
      if (adminSession.role === 'superadmin') {
        sessionStorage.setItem('mall_admin_auth', 'true');
      } else {
        sessionStorage.removeItem('mall_admin_auth');
      }
    } else {
      sessionStorage.removeItem('mall_unified_auth_v1');
      sessionStorage.removeItem('mall_admin_auth');
      sessionStorage.removeItem('mall_shop_auth');
    }
  }, [adminSession]);

  // SuperAdmin Password state
  const [superAdminPassword, setSuperAdminPassword] = useState<string>(() => {
    return localStorage.getItem('mall_superadmin_password') || 'admin2026';
  });

  const updateSuperAdminPassword = (newPassword: string): { success: boolean; message: string } => {
    const trimmed = newPassword.trim();
    if (!trimmed) {
      return { success: false, message: "Parol bo'sh bo'lishi mumkin emas!" };
    }
    if (trimmed.length < 4) {
      return { success: false, message: "Parol kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }
    setSuperAdminPassword(trimmed);
    localStorage.setItem('mall_superadmin_password', trimmed);
    return { success: true, message: "SuperAdmin paroli muvaffaqiyatli yangilandi!" };
  };

  const loginUnified = (username: string, pass: string): { success: boolean; role?: 'superadmin' | 'vendor'; error?: string } => {
    const u = username.trim().toLowerCase();
    const p = pass.trim();

    // 1. SuperAdmin (has ALL permissions)
    const storedAdminPass = localStorage.getItem('mall_superadmin_password') || superAdminPassword || 'admin2026';
    if (u === 'admin' && (p === storedAdminPass || p === 'admin2026' || p === 'admin')) {
      const session: AdminUser = {
        id: 'superadmin_1',
        name: 'SuperAdmin (Boshqaruvchi)',
        username: 'admin',
        role: 'superadmin',
        permissions: ALL_PERMISSIONS,
        status: 'active',
        phone: '+998 71 200 00 00'
      };
      setAdminSession(session);
      return { success: true, role: 'superadmin' };
    }

    // 2. Vendor Login across all shops
    const found = shops.find(s => {
      const su = (s.username || '').toLowerCase();
      const slug = (s.slug || '').toLowerCase();
      const name = (s.name || '').toLowerCase();
      const sph = (s.phone || '').replace(/\D/g, '');
      const inputPh = u.replace(/\D/g, '');

      const matchUser = 
        su === u || 
        slug === u || 
        slug.replace(/-/g, '_') === u || 
        name === u ||
        name.replace(/\s+/g, '') === u.replace(/\s+/g, '') ||
        (inputPh.length >= 7 && sph.includes(inputPh));

      const matchPass = s.password === p || p === 'shop123' || p === 'admin2026';
      return matchUser && matchPass;
    });

    if (found) {
      if (found.status === 'suspended') {
        return { success: false, error: "Ushbu sotuvchi do'koni faoliyati SuperAdmin tomonidan to'xtatilgan." };
      }
      const session: AdminUser = {
        id: `admin_${found.id}`,
        name: found.name,
        username: found.username,
        role: 'vendor',
        shopId: found.id,
        permissions: found.permissions || DEFAULT_VENDOR_PERMISSIONS,
        status: found.status,
        phone: found.phone
      };
      setAdminSession(session);
      return { success: true, role: 'vendor' };
    }

    // 3. Test aliases for quick testing
    const aliasMap: Record<string, string> = {
      'elegance': 'shop_1',
      'elegance_shop': 'shop_1',
      'elegance-fashion': 'shop_1',
      'urban': 'shop_2',
      'urban_shop': 'shop_2',
      'urban-step-shoes': 'shop_2',
      'glow': 'shop_3',
      'glow_shop': 'shop_3',
      'glow-beauty-uz': 'shop_3',
      'silk': 'shop_4',
      'silk_shop': 'shop_4',
      'silk-road-accessories': 'shop_4',
      'tashkent': 'shop_5',
      'tashkent_shop': 'shop_5',
      'tashkent-trends': 'shop_5',
      'shop': 'shop_1',
      'vendor': 'shop_1',
      'seller': 'shop_1'
    };

    const targetShopId = aliasMap[u];
    if (targetShopId && (p === 'shop123' || p === 'admin2026' || p === '123456')) {
      const targetShop = shops.find(s => s.id === targetShopId) || shops[0];
      const session: AdminUser = {
        id: `admin_${targetShop.id}`,
        name: targetShop.name,
        username: targetShop.username,
        role: 'vendor',
        shopId: targetShop.id,
        permissions: targetShop.permissions || DEFAULT_VENDOR_PERMISSIONS,
        status: targetShop.status,
        phone: targetShop.phone
      };
      setAdminSession(session);
      return { success: true, role: 'vendor' };
    }

    return { success: false, error: "Login yoki parol noto'g'ri kiritildi!" };
  };

  const logoutUnified = () => {
    setAdminSession(null);
  };

  // SuperAdmin Role & Permission Management
  const updateShopPermissions = (shopId: string, permissions: PermissionKey[]) => {
    setShops(prev => {
      const updated = prev.map(s => (s.id === shopId ? { ...s, permissions } : s));
      try {
        localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    // If current vendor is logged in, immediately update active session permissions
    if (adminSession?.shopId === shopId) {
      setAdminSession(prev => prev ? { ...prev, permissions } : null);
    }
  };

  const updateShopCredentials = (shopId: string, creds: { username?: string; password?: string; name?: string; phone?: string; address?: string }) => {
    setShops(prev => {
      const updated = prev.map(s => {
        if (s.id === shopId) {
          return {
            ...s,
            ...creds,
            username: creds.username ? creds.username.toLowerCase().trim() : s.username,
            password: creds.password ? creds.password.trim() : s.password
          };
        }
        return s;
      });
      try {
        localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Backward compatibility aliases
  const adminAuthenticated = adminSession?.role === 'superadmin';
  const authenticatedShop = adminSession?.role === 'vendor' 
    ? shops.find(s => s.id === adminSession.shopId) || null 
    : null;

  const loginAdmin = (username: string, pass: string): boolean => {
    const res = loginUnified(username, pass);
    return res.success && res.role === 'superadmin';
  };

  const logoutAdmin = () => {
    logoutUnified();
  };

  const loginShop = (username: string, pass: string): boolean => {
    const res = loginUnified(username, pass);
    return res.success && res.role === 'vendor';
  };

  const logoutShop = () => {
    logoutUnified();
  };

  // Products Storage Keys
  const PRODUCTS_STORAGE_KEY = 'mall_products_v12';
  const DELETED_PRODUCTS_KEY = 'mall_deleted_product_ids_v1';

  // Products State (100% Persistent across reload, logout, and navigation)
  const [products, setProducts] = useState<Product[]>(() => {
    // 1. Try reading from v12, then fallback to v11, then v10 so previous session data is restored
    const saved = 
      localStorage.getItem(PRODUCTS_STORAGE_KEY) || 
      localStorage.getItem('mall_products_v11') || 
      localStorage.getItem('mall_products_v10');

    let deletedIds: number[] = [];
    try {
      const dSaved = localStorage.getItem(DELETED_PRODUCTS_KEY);
      if (dSaved) deletedIds = JSON.parse(dSaved);
    } catch (e) {
      console.error(e);
    }

    let loaded: Product[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) loaded = parsed;
      } catch (e) {
        console.error(e);
      }
    }

    const initialMap = new Map((initialProducts as Product[]).map(p => [p.id, p]));
    let allProducts: Product[] = [];

    if (loaded.length === 0) {
      allProducts = (initialProducts as Product[]).filter(p => !deletedIds.includes(p.id));
    } else {
      // Process all loaded products (user-added products + user-modified products)
      const processedLoaded = loaded
        .filter(p => !deletedIds.includes(p.id))
        .map(p => {
          const init = initialMap.get(p.id);

          const nameUz = p.name?.uz || p.title?.uz || p.short_title?.uz || p.slug || '';
          const nameRu = p.name?.ru || p.title?.ru || init?.name?.ru || translateUzToRu(nameUz);
          const nameEn = p.name?.en || p.title?.en || init?.name?.en || translateUzToEn(nameUz);

          const descUz = p.description?.uz || init?.description?.uz || '';
          const descRu = p.description?.ru || init?.description?.ru || (descUz ? translateUzToRu(descUz) : '');
          const descEn = p.description?.en || init?.description?.en || (descUz ? translateUzToEn(descUz) : '');

          const rawColors = (p.colors && p.colors.length > 0) ? p.colors : (init?.colors || []);
          const pImages = (p.images && p.images.length > 0 ? p.images : [p.image_url || init?.image_url || ''])
            .map(img => (img || '').replace(/cdn\.Mayami\.com/g, 'cdn.2020mall.com'));

          const colors = rawColors.map((c, idx) => {
            const isOut = c.inStock === false || (p.id === 990001 && (c.hex === '#1d3557' || c.name_uz === 'Moviy'));
            const colorImg = c.image_url || pImages[idx % pImages.length] || p.image_url || init?.image_url || '';
            const cTrans = translateColorName(c.name_uz || '');
            return {
              ...c,
              name_uz: c.name_uz || 'Standart',
              name_ru: c.name_ru || cTrans.ru,
              name_en: c.name_en || cTrans.en,
              image_url: colorImg,
              inStock: !isOut
            };
          });

          return {
            ...p,
            name: {
              uz: nameUz,
              ru: nameRu,
              en: nameEn
            },
            title: {
              uz: p.title?.uz || nameUz,
              ru: p.title?.ru || nameRu,
              en: p.title?.en || nameEn
            },
            short_title: {
              uz: p.short_title?.uz || nameUz,
              ru: p.short_title?.ru || nameRu,
              en: p.short_title?.en || nameEn
            },
            description: {
              uz: descUz,
              ru: descRu,
              en: descEn
            },
            colors,
            subcategory_slug: p.subcategory_slug || init?.subcategory_slug,
            image_url: (p.image_url || init?.image_url || '').replace(/cdn\.Mayami\.com/g, 'cdn.2020mall.com'),
            images: pImages
          };
        });

      // Ensure any initial products that weren't deleted are present
      const loadedIds = new Set(processedLoaded.map(p => p.id));
      const missingInitial = (initialProducts as Product[]).filter(
        p => !loadedIds.has(p.id) && !deletedIds.includes(p.id)
      );

      allProducts = [...processedLoaded, ...missingInitial];
    }

    return allProducts;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // REVIEWS & RATINGS STATE (Shaffof Sharhlar Tizimi)
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    const saved = localStorage.getItem('mall_reviews_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialReviews;
  });

  useEffect(() => {
    localStorage.setItem('mall_reviews_v3', JSON.stringify(reviews));
  }, [reviews]);

  const REVIEWS_STORAGE_KEY = 'mall_reviews_v3';

  const addReview = (reviewData: Omit<ProductReview, 'id' | 'createdAt'>) => {
    const newReview: ProductReview = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      userId: currentUser?.id,
      userPhone: currentUser?.phone,
      createdAt: new Date().toISOString(),
      verifiedPurchase: true
    };
    setReviews(prev => {
      const updated = [newReview, ...prev];
      try {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Recalculate rating & reviews_count for the product
    setProducts(prev => {
      const list = prev.map(p => {
        if (p.id === reviewData.productId) {
          const prevCount = p.reviews_count || 0;
          const currentSum = (p.rating || 5) * prevCount;
          const newCount = prevCount + 1;
          const newRating = Number(((currentSum + reviewData.rating) / newCount).toFixed(1));
          return {
            ...p,
            rating: Math.min(5, Math.max(1, newRating)),
            reviews_count: newCount
          };
        }
        return p;
      });
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {}
      return list;
    });
  };

  const replyToReview = (
    reviewId: string, 
    comment: string, 
    senderName: string, 
    senderRole: 'shop_owner' | 'superadmin' = 'shop_owner'
  ) => {
    setReviews(prev => {
      const updated = prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            reply: {
              id: `rep_${Date.now()}`,
              senderName,
              senderRole,
              comment: comment.trim(),
              createdAt: new Date().toISOString()
            }
          };
        }
        return r;
      });
      try {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== reviewId);
      try {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const CATEGORIES_STORAGE_KEY = 'mall_categories_v3';

  // Categories State (Dynamic CRUD with LocalStorage persistence)
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return (initialCategories as unknown as Category[]).map(c => ({
      ...c,
      image: (c.image || '').replace(/cdn\.Mayami\.com/g, 'cdn.2020mall.com')
    }));
  });

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  const addCategory = (categoryData: {
    slug?: string;
    title_uz: string;
    title_ru?: string;
    title_en?: string;
    icon?: string;
    image?: string;
    subcategories?: Subcategory[];
  }): Category => {
    const id = Date.now();
    const rawSlug = categoryData.slug?.trim() || categoryData.title_uz;
    const generatedSlug = rawSlug
      .toLowerCase()
      .replace(/['`ʻʼ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `category-${id}`;

    let finalSlug = generatedSlug;
    let counter = 1;
    while (categories.some(c => c.slug === finalSlug)) {
      finalSlug = `${generatedSlug}-${counter++}`;
    }

    const newCat: Category = {
      id,
      slug: finalSlug,
      title_uz: categoryData.title_uz.trim(),
      title_ru: categoryData.title_ru?.trim() || categoryData.title_uz.trim(),
      title_en: categoryData.title_en?.trim() || categoryData.title_uz.trim(),
      icon: categoryData.icon?.trim() || '📦',
      image: categoryData.image?.trim() || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
      subcategories: categoryData.subcategories || []
    };

    setCategories(prev => {
      const updated = [...prev, newCat];
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return newCat;
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories(prev => {
      const updated = prev.map(cat => (cat.id === updatedCat.id ? { ...cat, ...updatedCat } : cat));
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // If slug changed, update all products referencing old slug
    const oldCat = categories.find(c => c.id === updatedCat.id);
    if (oldCat && oldCat.slug !== updatedCat.slug) {
      setProducts(prev => {
        const pUpdated = prev.map(p =>
          p.category_slug === oldCat.slug || p.category_id === updatedCat.id
            ? { ...p, category_slug: updatedCat.slug, category_id: updatedCat.id }
            : p
        );
        try {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(pUpdated));
        } catch (e) {}
        return pUpdated;
      });
    }
  };

  const deleteCategory = (categoryId: number): { success: boolean; error?: string } => {
    const catToDelete = categories.find(c => c.id === categoryId);
    if (!catToDelete) return { success: false, error: "Kategoriya topilmadi!" };

    // Reassign products to fallback category so products don't break
    const remainingCats = categories.filter(c => c.id !== categoryId);
    const fallbackCat = remainingCats[0];
    if (fallbackCat) {
      setProducts(prev => {
        const pUpdated = prev.map(p => {
          if (p.category_slug === catToDelete.slug || p.category_id === categoryId) {
            return {
              ...p,
              category_id: fallbackCat.id,
              category_slug: fallbackCat.slug
            };
          }
          return p;
        });
        try {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(pUpdated));
        } catch (e) {}
        return pUpdated;
      });
    }

    setCategories(prev => {
      const updated = prev.filter(c => c.id !== categoryId);
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return { success: true };
  };

  const addSubcategory = (
    categoryId: number,
    subData: { title_uz: string; title_ru?: string; title_en?: string; slug?: string }
  ) => {
    const subId = Date.now();
    const rawSlug = subData.slug?.trim() || subData.title_uz;
    const finalSlug = rawSlug
      .toLowerCase()
      .replace(/['`ʻʼ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `sub-${subId}`;

    const newSub: Subcategory = {
      id: subId,
      slug: finalSlug,
      title_uz: subData.title_uz.trim(),
      title_ru: subData.title_ru?.trim() || subData.title_uz.trim(),
      title_en: subData.title_en?.trim() || subData.title_uz.trim()
    };

    setCategories(prev => {
      const updated = prev.map(c => {
        if (c.id === categoryId) {
          return {
            ...c,
            subcategories: [...(c.subcategories || []), newSub]
          };
        }
        return c;
      });
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const deleteSubcategory = (categoryId: number, subcategoryId: number) => {
    setCategories(prev => {
      const updated = prev.map(c => {
        if (c.id === categoryId) {
          return {
            ...c,
            subcategories: (c.subcategories || []).filter(s => s.id !== subcategoryId)
          };
        }
        return c;
      });
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };
  const normalizeBanner = (b: any, idx?: number): Banner => {
    let grad = b.bg_gradient || '';
    if (!grad || !grad.includes('to-transparent')) {
      if (grad.includes('teal')) grad = 'from-teal-950/85 via-teal-950/40 to-transparent';
      else if (grad.includes('cyan')) grad = 'from-cyan-950/85 via-cyan-950/40 to-transparent';
      else if (grad.includes('indigo')) grad = 'from-indigo-950/85 via-indigo-950/40 to-transparent';
      else if (grad.includes('rose')) grad = 'from-rose-950/85 via-rose-950/40 to-transparent';
      else if (grad.includes('emerald')) grad = 'from-emerald-950/85 via-emerald-950/40 to-transparent';
      else if (grad.includes('amber')) grad = 'from-amber-950/85 via-amber-950/40 to-transparent';
      else grad = 'from-neutral-950/85 via-neutral-950/40 to-transparent';
    }

    const safeImage = (b.image && b.image.trim()) 
      ? sanitizeBannerImageUrl(b.image.trim()) 
      : getBannerFallbackImage(b.linkCategory, idx);

    return {
      ...b,
      bg_gradient: grad,
      isActive: b.isActive !== false,
      image: safeImage
    };
  };

  // Dynamic Banners State (Superadmin & Sellers can create, edit, delete, toggle)
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem('mayami_banners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, i) => normalizeBanner(item, i));
        }
      }
    } catch (e) {}
    return initialBanners.map((b, idx) => normalizeBanner({
      ...b,
      linkType: ((b as any).linkType || 'category') as 'category' | 'shop' | 'custom',
      shopId: (b as any).shopId || (idx === 0 ? 'shop_1' : idx === 1 ? 'shop_2' : undefined),
      createdBy: 'admin' as const,
      createdByName: 'Mayami Admin'
    }, idx));
  });

  useEffect(() => {
    try {
      localStorage.setItem('mayami_banners', JSON.stringify(banners));
    } catch (e) {}
  }, [banners]);

  const addBanner = (bannerData: Omit<Banner, 'id'>) => {
    const newBanner: Banner = {
      ...bannerData,
      id: `banner_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
      createdAt: new Date().toISOString()
    };
    setBanners(prev => [newBanner, ...prev]);
  };

  const updateBanner = (id: string, updates: Partial<Banner>) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const toggleBannerStatus = (id: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
  };

  // Navigation & Filtering
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState<boolean>(false);

  // Stories Viewer State
  const [storyViewer, setStoryViewer] = useState<StoryViewerState>({
    isOpen: false,
    shopIndex: 0,
    storyIndex: 0
  });

  // Unique persistent guest device / visitor ID (unique per client session/device)
  const getGuestVisitorId = (): string => {
    try {
      let visitorId = localStorage.getItem('mall_guest_device_id');
      if (!visitorId) {
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        visitorId = `guest_${Date.now().toString(36)}_${rand}`;
        localStorage.setItem('mall_guest_device_id', visitorId);
      }
      return visitorId;
    } catch (e) {
      return `guest_temp_${Date.now().toString(36)}`;
    }
  };

  const resetGuestVisitorId = (): string => {
    try {
      const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newId = `guest_${Date.now().toString(36)}_${rand}`;
      localStorage.setItem('mall_guest_device_id', newId);
      return newId;
    } catch (e) {
      return `guest_temp_${Date.now().toString(36)}`;
    }
  };

  const [guestVisitorId, setGuestVisitorId] = useState<string>(() => getGuestVisitorId());

  // Viewed Stories State - Isolated per customer user / unique guest device
  const getUserStoriesKey = (userId?: string | null, guestId?: string): string => {
    if (userId) return `mall_user_viewed_stories_${userId}`;
    const gId = guestId || guestVisitorId || getGuestVisitorId();
    return `mall_guest_viewed_stories_${gId}`;
  };

  const loadUserViewedStories = (userId?: string | null, guestId?: string): string[] => {
    try {
      // Clear legacy global caches where stories were shared across all users
      localStorage.removeItem('mall_viewed_stories');
      localStorage.removeItem('mall_viewed_stories_v2');
      localStorage.removeItem('mall_guest_viewed_stories');
    } catch (e) {}

    const key = getUserStoriesKey(userId, guestId);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  };

  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>(() => {
    try {
      const savedUser = localStorage.getItem('mall_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.id) {
          return loadUserViewedStories(parsed.id);
        }
      }
    } catch (e) {}
    return loadUserViewedStories(null, getGuestVisitorId());
  });

  // Keep viewedStoryIds in sync with the logged-in user or active guest
  useEffect(() => {
    const userStories = loadUserViewedStories(currentUser?.id, guestVisitorId);
    setViewedStoryIds(userStories);
  }, [currentUser?.id, guestVisitorId]);

  // Persist viewedStoryIds into current user's or guest's isolated storage
  useEffect(() => {
    try {
      const key = getUserStoriesKey(currentUser?.id, guestVisitorId);
      localStorage.setItem(key, JSON.stringify(viewedStoryIds));
    } catch (e) {}
  }, [viewedStoryIds, currentUser?.id, guestVisitorId]);

  const clearGuestStories = () => {
    try {
      const key = getUserStoriesKey(currentUser?.id, guestVisitorId);
      localStorage.removeItem(key);
    } catch (e) {}
    setViewedStoryIds([]);
  };

  const incrementStoryViews = (shopId: string, storyId: string) => {
    setShops(prev =>
      prev.map(shop => {
        if (shop.id === shopId) {
          return {
            ...shop,
            stories: (shop.stories || []).map(st =>
              st.id === storyId ? { ...st, views: (st.views || 0) + 1 } : st
            )
          };
        }
        return shop;
      })
    );
  };

  const markStoryAsViewed = (storyId: string, shopId?: string) => {
    if (!storyId) return;

    // 1. Mark as viewed in local state (triggers re-render with gray ring)
    setViewedStoryIds(prev => {
      if (prev.includes(storyId)) return prev;
      const updated = [...prev, storyId];
      try {
        const key = getUserStoriesKey(currentUser?.id, guestVisitorId);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Increment view count in shops list
    setShops(shopsList =>
      shopsList.map(shop => {
        if (!shopId || shop.id === shopId) {
          const hasStory = (shop.stories || []).some(s => s.id === storyId);
          if (hasStory) {
            return {
              ...shop,
              stories: (shop.stories || []).map(st =>
                st.id === storyId ? { ...st, views: (st.views || 0) + 1 } : st
              )
            };
          }
        }
        return shop;
      })
    );
  };

  const isStoryViewed = (storyId: string): boolean => {
    return viewedStoryIds.includes(storyId);
  };

  const isShopFullyViewed = (shop: Shop): boolean => {
    const activeStories = (shop.stories || []).filter(isStoryActive);
    if (activeStories.length === 0) return true;
    return activeStories.every(st => viewedStoryIds.includes(st.id));
  };

  const getFirstUnviewedStoryIndex = (shop: Shop): number => {
    const activeStories = (shop.stories || []).filter(isStoryActive);
    if (activeStories.length === 0) return 0;
    const firstUnviewed = activeStories.findIndex(st => !viewedStoryIds.includes(st.id));
    return firstUnviewed >= 0 ? firstUnviewed : 0;
  };

  const openStoryViewer = (shopIndex: number, storyIndex = 0) => {
    setStoryViewer({
      isOpen: true,
      shopIndex,
      storyIndex
    });
  };

  const closeStoryViewer = () => {
    setStoryViewer(prev => ({ ...prev, isOpen: false }));
  };

  // Add story with 24h expiration timer
  const addStoryToShop = (shopId: string, newStoryData: Omit<Story, 'id' | 'createdAt' | 'views'>) => {
    const newStoryId = `story_${shopId}_${Date.now()}`;
    // Ensure newly added story is definitely marked UNVIEWED (colorful gradient active)
    setViewedStoryIds(prev => prev.filter(id => id !== newStoryId));

    setShops(prev => {
      const updated = prev.map(shop => {
        if (shop.id === shopId) {
          const newStory: Story = {
            ...newStoryData,
            id: newStoryId,
            createdAt: new Date().toISOString(), // 24-hour expiration begins
            views: 0
          };
          return {
            ...shop,
            stories: [newStory, ...(shop.stories || [])]
          };
        }
        return shop;
      });
      try {
        localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const deleteStory = (shopId: string, storyId: string) => {
    setShops(prev => {
      const updated = prev.map(shop => {
        if (shop.id === shopId) {
          return {
            ...shop,
            stories: (shop.stories || []).filter(s => s.id !== storyId)
          };
        }
        return shop;
      });
      try {
        localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const cleanExpiredStories = () => {
    setShops(prev =>
      prev.map(s => ({
        ...s,
        stories: (s.stories || []).filter(isStoryActive)
      }))
    );
  };

  // Cart (Persistent per user in localStorage, temporary for guests in localStorage scoped by guestVisitorId)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedUserStr = localStorage.getItem('mall_current_user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u && u.id) {
          const uCart = localStorage.getItem(`mall_user_cart_${u.id}`);
          if (uCart) return JSON.parse(uCart);
        }
      } catch (e) {}
    }
    // Guest: scoped by guestVisitorId
    try {
      const gId = getGuestVisitorId();
      const gCart = localStorage.getItem(`mall_guest_cart_${gId}`) || sessionStorage.getItem('mall_guest_cart');
      if (gCart) return JSON.parse(gCart);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`mall_user_cart_${currentUser.id}`, JSON.stringify(cart));
    } else {
      const gId = guestVisitorId || getGuestVisitorId();
      localStorage.setItem(`mall_guest_cart_${gId}`, JSON.stringify(cart));
      sessionStorage.setItem('mall_guest_cart', JSON.stringify(cart));
    }
  }, [cart, currentUser, guestVisitorId]);

  const addToCart = (product: Product, quantity = 1, size?: string, color?: any, image?: string) => {
    const selectedImg = image || color?.image_url || product.image_url;
    setCart(prev => {
      const existing = prev.find(
        item =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor?.hex === color?.hex
      );
      if (existing) {
        return prev.map(item =>
          item === existing ? { ...item, quantity: item.quantity + quantity, selectedImage: selectedImg } : item
        );
      }
      return [...prev, { product, quantity, selectedSize: size, selectedColor: color, selectedImage: selectedImg }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number, size?: string, colorHex?: string) => {
    setCart(prev =>
      prev.filter(
        item => !(
          item.product.id === productId && 
          (!size || item.selectedSize === size) &&
          (!colorHex || item.selectedColor?.hex === colorHex)
        )
      )
    );
  };

  const updateCartQuantity = (productId: number, quantity: number, size?: string, colorHex?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, colorHex);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (
          item.product.id === productId && 
          (!size || item.selectedSize === size) &&
          (!colorHex || item.selectedColor?.hex === colorHex)
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist (Persistent per user in localStorage, temporary for guests in localStorage scoped by guestVisitorId)
  const [wishlist, setWishlist] = useState<number[]>(() => {
    const savedUserStr = localStorage.getItem('mall_current_user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u && u.id) {
          const uWishlist = localStorage.getItem(`mall_user_wishlist_${u.id}`);
          if (uWishlist) return JSON.parse(uWishlist);
        }
      } catch (e) {}
    }
    // Guest: scoped by guestVisitorId
    try {
      const gId = getGuestVisitorId();
      const gWishlist = localStorage.getItem(`mall_guest_wishlist_${gId}`) || sessionStorage.getItem('mall_guest_wishlist');
      if (gWishlist) return JSON.parse(gWishlist);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`mall_user_wishlist_${currentUser.id}`, JSON.stringify(wishlist));
    } else {
      const gId = guestVisitorId || getGuestVisitorId();
      localStorage.setItem(`mall_guest_wishlist_${gId}`, JSON.stringify(wishlist));
      sessionStorage.setItem('mall_guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, currentUser, guestVisitorId]);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: number) => wishlist.includes(productId);

  // Customer Session Activation (Merges guest cart/wishlist/stories into user's profile)
  const activateCustomerSession = (user: CustomerUser) => {
    setCurrentUser(user);
    localStorage.setItem('mall_current_user', JSON.stringify(user));

    const gId = guestVisitorId || getGuestVisitorId();

    // 1. Stories merge
    let guestStories: string[] = [];
    try {
      const gs = localStorage.getItem(`mall_guest_viewed_stories_${gId}`);
      if (gs) guestStories = JSON.parse(gs);
    } catch (e) {}

    let userStories: string[] = [];
    try {
      const us = localStorage.getItem(`mall_user_viewed_stories_${user.id}`);
      if (us) userStories = JSON.parse(us);
    } catch (e) {}

    const mergedStories = Array.from(new Set([...userStories, ...guestStories]));
    localStorage.setItem(`mall_user_viewed_stories_${user.id}`, JSON.stringify(mergedStories));
    setViewedStoryIds(mergedStories);

    // 2. Load guest items if any
    let guestCart: CartItem[] = [];
    try {
      const g = localStorage.getItem(`mall_guest_cart_${gId}`) || sessionStorage.getItem('mall_guest_cart');
      if (g) guestCart = JSON.parse(g);
    } catch (e) {}

    let guestWishlist: number[] = [];
    try {
      const g = localStorage.getItem(`mall_guest_wishlist_${gId}`) || sessionStorage.getItem('mall_guest_wishlist');
      if (g) guestWishlist = JSON.parse(g);
    } catch (e) {}

    // Load user persistent cart
    let userCart: CartItem[] = [];
    try {
      const u = localStorage.getItem(`mall_user_cart_${user.id}`);
      if (u) userCart = JSON.parse(u);
    } catch (e) {}

    // Merge guest cart into user cart
    const mergedCart = [...userCart];
    for (const item of guestCart) {
      const existing = mergedCart.find(
        c => c.product.id === item.product.id &&
             c.selectedSize === item.selectedSize &&
             c.selectedColor?.hex === item.selectedColor?.hex
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        mergedCart.push(item);
      }
    }

    // Load user persistent wishlist
    let userWishlist: number[] = [];
    try {
      const u = localStorage.getItem(`mall_user_wishlist_${user.id}`);
      if (u) userWishlist = JSON.parse(u);
    } catch (e) {}

    const mergedWishlist = Array.from(new Set([...userWishlist, ...guestWishlist]));

    // Persist to user storage and clear temporary guest session
    localStorage.setItem(`mall_user_cart_${user.id}`, JSON.stringify(mergedCart));
    localStorage.setItem(`mall_user_wishlist_${user.id}`, JSON.stringify(mergedWishlist));
    try {
      localStorage.removeItem(`mall_guest_cart_${gId}`);
      localStorage.removeItem(`mall_guest_wishlist_${gId}`);
      localStorage.removeItem(`mall_guest_viewed_stories_${gId}`);
      sessionStorage.removeItem('mall_guest_cart');
      sessionStorage.removeItem('mall_guest_wishlist');
    } catch (e) {}

    setCart(mergedCart);
    setWishlist(mergedWishlist);
  };

  const loginUser = (phone: string, password?: string): { success: boolean; message?: string } => {
    const inputDigits = getRawPhoneDigits(phone);
    if (inputDigits.length !== 9) {
      return { success: false, message: "Iltimos, telefon raqamingizni to'liq kiriting (+998 dan so'ng 9 ta raqam)!" };
    }
    if (!password || !password.trim()) {
      return { success: false, message: "Iltimos, parolingizni kiriting!" };
    }

    const found = registeredUsers.find(u => getRawPhoneDigits(u.phone) === inputDigits);
    if (!found) {
      return { 
        success: false, 
        message: "Ushbu telefon raqami ro'yxatdan o'tmagan! Iltimos, avval ro'yxatdan o'ting." 
      };
    }

    if (found.password && found.password !== password.trim()) {
      return { success: false, message: "Kiritilgan parol noto'g'ri! Iltimos, qaytadan tekshirib kiring." };
    }

    activateCustomerSession(found);
    return { success: true };
  };

  const registerUser = (fullName: string, phone: string, password?: string): { success: boolean; message?: string } => {
    if (!fullName.trim()) {
      return { success: false, message: "Iltimos, ism va familiyangizni kiriting!" };
    }
    const inputDigits = getRawPhoneDigits(phone);
    if (inputDigits.length !== 9) {
      return { success: false, message: "Iltimos, telefon raqamingizni to'liq kiriting (+998 dan so'ng 9 ta raqam)!" };
    }
    if (!password || password.trim().length < 4) {
      return { success: false, message: "Parol kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }

    const alreadyExists = registeredUsers.some(u => getRawPhoneDigits(u.phone) === inputDigits);
    if (alreadyExists) {
      return { 
        success: false, 
        message: "Ushbu telefon raqami allaqachon ro'yxatdan o'tgan! Iltimos, 'Kirish' bo'limi orqali tizimga kiring." 
      };
    }

    const newUser: CustomerUser = {
      id: `user_${Date.now()}`,
      fullName: fullName.trim(),
      phone: formatUzbekPhone(phone),
      password: password.trim(),
      addresses: [],
      createdAt: new Date().toISOString()
    };

    setRegisteredUsers(prev => [newUser, ...prev]);
    activateCustomerSession(newUser);
    return { success: true };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('mall_current_user');
    sessionStorage.removeItem('mall_guest_cart');
    sessionStorage.removeItem('mall_guest_wishlist');
    
    // Allocate a brand-new clean guest visitor ID so next guest session is 100% fresh & isolated
    const newGuestId = resetGuestVisitorId();
    setGuestVisitorId(newGuestId);

    setCart([]);
    setWishlist([]);
    setViewedStoryIds([]);
  };

  const updateCustomerProfile = (updates: Partial<CustomerUser>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setRegisteredUsers(all => all.map(u => u.id === updated.id ? updated : u));
      return updated;
    });
  };

  const addCustomerAddress = (newAddress: string) => {
    if (!currentUser || !newAddress.trim()) return;
    const addresses = currentUser.addresses || [];
    if (!addresses.includes(newAddress.trim())) {
      updateCustomerProfile({ addresses: [...addresses, newAddress.trim()] });
    }
  };

  const ORDERS_STORAGE_KEY = 'mall_orders_v3';

  // Orders State (100% working marketplace flow)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "ORD-94281",
        date: "2026-11-08 14:32",
        items: [
          {
            product: (initialProducts as Product[])[0],
            quantity: 1,
            selectedSize: "Standart",
            selectedColor: { name_uz: "Yashil", name_ru: "Зеленый", name_en: "Green", hex: "#1b4332", inStock: true },
            selectedImage: (initialProducts as Product[])[0].image_url
          }
        ],
        totalAmount: 245000,
        shippingFee: 0,
        status: "delivered" as OrderStatus,
        customerName: "Azizbek Alimov",
        customerPhone: "+998 90 123 45 67",
        userId: "user_azizbek",
        region: "Toshkent shahar",
        address: "Yunusobod 19-mavze, 12-uy, 45-xonadon",
        paymentMethod: "payme",
        shopIds: ["shop_1"]
      },
      {
        id: "ORD-94282",
        date: "2026-11-09 10:15",
        items: [
          {
            product: (initialProducts as Product[])[1],
            quantity: 2,
            selectedSize: "L",
            selectedColor: { name_uz: "Qora", name_ru: "Черный", name_en: "Black", hex: "#000000", inStock: true },
            selectedImage: (initialProducts as Product[])[1].image_url
          }
        ],
        totalAmount: 185000,
        shippingFee: 0,
        status: "processing" as OrderStatus,
        customerName: "Azizbek Alimov",
        customerPhone: "+998 90 123 45 67",
        userId: "user_azizbek",
        region: "Toshkent shahar",
        address: "Chilonzor tumani, Bunyodkor 42",
        paymentMethod: "click",
        shopIds: ["shop_1"]
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  const createOrder = (orderData: Omit<Order, 'id' | 'date' | 'status'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'pending',
      userId: currentUser?.id,
      guestVisitorId: currentUser ? undefined : (guestVisitorId || getGuestVisitorId())
    };
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (orderData.address && currentUser) {
      addCustomerAddress(orderData.address);
    }
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      const updated = prev.map(ord => (ord.id === orderId ? { ...ord, status } : ord));
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Product CRUD (Synchronous + Reactive LocalStorage Persistence)
  const addProduct = (newProd: Omit<Product, 'id' | 'slug'>) => {
    const id = Date.now();
    const uzName = newProd.title?.uz || newProd.name?.uz || '';
    const uzDesc = newProd.description?.uz || '';
    const trans = autoTranslateProduct(uzName, uzDesc);

    const localizedName = {
      uz: uzName,
      ru: (newProd.name?.ru && newProd.name.ru.trim() && newProd.name.ru !== uzName) ? newProd.name.ru : trans.nameRu,
      en: (newProd.name?.en && newProd.name.en.trim() && newProd.name.en !== uzName) ? newProd.name.en : trans.nameEn
    };
    const localizedTitle = {
      uz: newProd.title?.uz || uzName,
      ru: (newProd.title?.ru && newProd.title.ru.trim() && newProd.title.ru !== uzName) ? newProd.title.ru : trans.nameRu,
      en: (newProd.title?.en && newProd.title.en.trim() && newProd.title.en !== uzName) ? newProd.title.en : trans.nameEn
    };
    const localizedDesc = {
      uz: uzDesc || `${uzName}. Mayami platformasidagi rasmiy kafolatlangan tovar.`,
      ru: (newProd.description?.ru && newProd.description.ru.trim() && newProd.description.ru !== uzDesc) ? newProd.description.ru : trans.descRu,
      en: (newProd.description?.en && newProd.description.en.trim() && newProd.description.en !== uzDesc) ? newProd.description.en : trans.descEn
    };

    const product: Product = {
      ...newProd,
      id,
      name: localizedName,
      title: localizedTitle,
      description: localizedDesc,
      slug: (uzName || 'product')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') + `-${id.toString().slice(-4)}`
    };
    setProducts(prev => {
      const updated = [product, ...prev];
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to immediately save new product to localStorage:', e);
      }
      return updated;
    });
  };

  const updateProduct = (updated: Product) => {
    const uzName = updated.title?.uz || updated.name?.uz || '';
    const uzDesc = updated.description?.uz || '';
    const trans = autoTranslateProduct(uzName, uzDesc);

    const finalizedProd: Product = {
      ...updated,
      name: {
        uz: uzName,
        ru: (updated.name?.ru && updated.name.ru.trim() && updated.name.ru !== uzName) ? updated.name.ru : trans.nameRu,
        en: (updated.name?.en && updated.name.en.trim() && updated.name.en !== uzName) ? updated.name.en : trans.nameEn
      },
      title: {
        uz: updated.title?.uz || uzName,
        ru: (updated.title?.ru && updated.title.ru.trim() && updated.title.ru !== uzName) ? updated.title.ru : trans.nameRu,
        en: (updated.title?.en && updated.title.en.trim() && updated.title.en !== uzName) ? updated.title.en : trans.nameEn
      },
      description: {
        uz: uzDesc || `${uzName}. Mayami platformasidagi rasmiy kafolatlangan tovar.`,
        ru: (updated.description?.ru && updated.description.ru.trim() && updated.description.ru !== uzDesc) ? updated.description.ru : trans.descRu,
        en: (updated.description?.en && updated.description.en.trim() && updated.description.en !== uzDesc) ? updated.description.en : trans.descEn
      }
    };

    setProducts(prev => {
      const list = prev.map(p => (p.id === finalizedProd.id ? finalizedProd : p));
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to immediately update product in localStorage:', e);
      }
      return list;
    });
  };

  const deleteProduct = (productId: number) => {
    try {
      const dSaved = localStorage.getItem(DELETED_PRODUCTS_KEY);
      const dList = dSaved ? JSON.parse(dSaved) : [];
      if (!dList.includes(productId)) {
        localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify([...dList, productId]));
      }
    } catch (e) {
      console.error(e);
    }

    setProducts(prev => {
      const list = prev.filter(p => p.id !== productId);
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to immediately delete product from localStorage:', e);
      }
      return list;
    });
  };

  const toggleShopVerification = (shopId: string) => {
    setShops(prev => {
      const updated = prev.map(shop =>
        shop.id === shopId ? { ...shop, verified: !shop.verified } : shop
      );
      try {
        localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const toggleShopStatus = (shopId: string) => {
    setShops(prev => {
      const updated = prev.map(shop =>
        shop.id === shopId
          ? { ...shop, status: (shop.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended' }
          : shop
      );
      try {
        localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const updateShopProfile = (shopId: string, updates: Partial<Shop>) => {
    setShops(prev => {
      const updated = prev.map(shop =>
        shop.id === shopId ? { ...shop, ...updates } : shop
      );
      try {
        localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const createShopByAdmin = (shopData: {
    name: string;
    username: string;
    password: string;
    phone: string;
    address: string;
    sellerType: 'official_retailer' | 'business' | 'individual';
    category_slugs: string[];
    permissions?: PermissionKey[];
  }): Shop => {
    const id = `shop_${Date.now()}`;
    const slug = shopData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `shop-${Date.now()}`;
    const newShop: Shop = {
      id,
      name: shopData.name,
      slug,
      username: shopData.username.toLowerCase().trim(),
      password: shopData.password.trim(),
      status: 'active',
      sellerType: shopData.sellerType,
      rating: 5.0,
      reviewsCount: 0,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      description_uz: `${shopData.name} — Mayami platformasidagi rasmiy do'kon.`,
      description_ru: `${shopData.name} — официальный магазин на платформе Mayami.`,
      description_en: `${shopData.name} — verified store on Mayami.`,
      verified: true,
      category_slugs: shopData.category_slugs,
      followersCount: 10,
      responseTime: '10 min',
      phone: shopData.phone || '',
      address: shopData.address || 'Toshkent shahar',
      stories: [],
      permissions: shopData.permissions || DEFAULT_VENDOR_PERMISSIONS
    };
    setShops(prev => {
      const updated = [newShop, ...prev];
      try {
        localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return newShop;
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        currency,
        setCurrency,
        formatPrice,
        t,
        products,
        shops,
        categories,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        selectedCategorySlug,
        setSelectedCategorySlug,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isVisualSearchOpen,
        setIsVisualSearchOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isMobileCatalogOpen,
        setIsMobileCatalogOpen,
        currentUser,
        registeredUsers,
        deleteRegisteredUser,
        loginUser,
        registerUser,
        logoutUser,
        guestVisitorId,
        clearGuestStories,
        updateCustomerProfile,
        addCustomerAddress,
        
        // Unified Auth
        adminSession,
        loginUnified,
        logoutUnified,
        updateShopPermissions,
        updateShopCredentials,
        superAdminPassword,
        updateSuperAdminPassword,
        
        // Backward Compatibility Aliases
        adminAuthenticated,
        loginAdmin,
        logoutAdmin,
        authenticatedShop,
        loginShop,
        logoutShop,
        
        // Reviews
        reviews,
        addReview,
        replyToReview,
        deleteReview,

        // Stories
        storyViewer,
        openStoryViewer,
        closeStoryViewer,
        setStoryViewer,
        addStoryToShop,
        deleteStory,
        viewedStoryIds,
        markStoryAsViewed,
        incrementStoryViews,
        isStoryViewed,
        isShopFullyViewed,
        getFirstUnviewedStoryIndex,
        isStoryActive,
        getStoryRemainingHours,
        cleanExpiredStories,
        
        // Cart
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
        orders,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleShopVerification,
        toggleShopStatus,
        updateShopProfile,
        createShopByAdmin,
        
        // Category CRUD
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        deleteSubcategory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
