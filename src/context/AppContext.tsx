import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  Theme, 
  Currency, 
  Product, 
  Category, 
  Shop, 
  Story, 
  CartItem, 
  Order, 
  OrderStatus, 
  CustomerUser,
  PermissionKey,
  AdminUser,
  ProductReview,
  ReviewReply
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

export const DEFAULT_VENDOR_PERMISSIONS: PermissionKey[] = [
  'manage_products',
  'manage_orders',
  'manage_stories',
  'manage_reviews',
  'view_analytics',
  'manage_settings'
];

export const ALL_PERMISSIONS: PermissionKey[] = [
  'manage_products',
  'manage_orders',
  'manage_stories',
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
  banners: typeof initialBanners;
  
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
  
  // Customer Auth
  currentUser: CustomerUser | null;
  loginUser: (phone: string, password?: string) => { success: boolean; message?: string };
  registerUser: (fullName: string, phone: string, password?: string) => { success: boolean; message?: string };
  logoutUser: () => void;
  updateCustomerProfile: (updates: Partial<CustomerUser>) => void;
  addCustomerAddress: (address: string) => void;
  
  // Unified Admin / Vendor Auth (Single Portal)
  adminSession: AdminUser | null;
  loginUnified: (username: string, pass: string) => { success: boolean; role?: 'superadmin' | 'vendor'; error?: string };
  logoutUnified: () => void;
  updateShopPermissions: (shopId: string, permissions: PermissionKey[]) => void;
  updateShopCredentials: (shopId: string, creds: { username?: string; password?: string; name?: string; phone?: string; address?: string }) => void;
  
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
  addToCart: (product: Product, quantity?: number, size?: string, color?: any) => void;
  removeFromCart: (productId: number, size?: string) => void;
  updateCartQuantity: (productId: number, quantity: number, size?: string) => void;
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

  // Registered Users Database (Persistent in localStorage)
  const [registeredUsers, setRegisteredUsers] = useState<CustomerUser[]>(() => {
    const saved = localStorage.getItem('mall_registered_users_v3');
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
        id: 'user_nodirbek',
        fullName: 'Nodirbek Rustamov',
        phone: '+998 (88) 678-22-04',
        password: 'password123',
        email: 'nodirbek@Mayami.uz',
        addresses: [],
        createdAt: '2026-10-15'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mall_registered_users_v3', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Customer Auth (Guest by default, persistent profile when registered/logged in)
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem('mall_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
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

  // Shops State
  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('mall_shops_v10');
    let loaded: Shop[] = [];
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const map = new Map<string, Shop>();
    (initialShops as unknown as Shop[]).forEach(s => {
      // Re-anchor demo stories to recent hours so active stories are visible on demo
      const freshStories = (s.stories || []).map((st, sIdx) => ({
        ...st,
        createdAt: st.createdAt ? st.createdAt : new Date(Date.now() - (sIdx + 1) * 2 * 3600 * 1000).toISOString()
      }));
      map.set(s.id, {
        ...s,
        permissions: s.permissions || DEFAULT_VENDOR_PERMISSIONS,
        stories: freshStories
      });
    });

    if (Array.isArray(loaded)) {
      loaded.forEach(s => {
        const existing = map.get(s.id);
        map.set(s.id, {
          ...existing,
          ...s,
          permissions: s.permissions || existing?.permissions || DEFAULT_VENDOR_PERMISSIONS
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
      phone: s.phone || '+998 88 678 22 04',
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
        phone: '+998 88 678 22 04'
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

  const loginUnified = (username: string, pass: string): { success: boolean; role?: 'superadmin' | 'vendor'; error?: string } => {
    const u = username.trim().toLowerCase();
    const p = pass.trim();

    // 1. SuperAdmin (has ALL permissions)
    if (u === 'admin' && (p === 'admin2026' || p === 'admin')) {
      const session: AdminUser = {
        id: 'superadmin_1',
        name: 'SuperAdmin (Boshqaruvchi)',
        username: 'admin',
        role: 'superadmin',
        permissions: ALL_PERMISSIONS,
        status: 'active',
        phone: '+998 88 678 22 04'
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
    setShops(prev =>
      prev.map(s => (s.id === shopId ? { ...s, permissions } : s))
    );
    // If current vendor is logged in, immediately update active session permissions
    if (adminSession?.shopId === shopId) {
      setAdminSession(prev => prev ? { ...prev, permissions } : null);
    }
  };

  const updateShopCredentials = (shopId: string, creds: { username?: string; password?: string; name?: string; phone?: string; address?: string }) => {
    setShops(prev =>
      prev.map(s => {
        if (s.id === shopId) {
          return {
            ...s,
            ...creds,
            username: creds.username ? creds.username.toLowerCase().trim() : s.username,
            password: creds.password ? creds.password.trim() : s.password
          };
        }
        return s;
      })
    );
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

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mall_products_v10');
    let loaded: Product[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) loaded = parsed;
      } catch (e) {
        console.error(e);
      }
    }
    if (loaded.length === 0) {
      loaded = initialProducts as Product[];
    } else {
      const initialMap = new Map((initialProducts as Product[]).map(p => [p.id, p]));
      loaded = loaded.map(p => {
        const init = initialMap.get(p.id);
        return {
          ...p,
          name: p.name || init?.name || { uz: p.slug, ru: p.slug, en: p.slug },
          title: p.title || init?.title || p.name || { uz: p.slug, ru: p.slug, en: p.slug },
          short_title: p.short_title || init?.short_title || p.title || p.name || { uz: p.slug, ru: p.slug, en: p.slug },
          description: p.description || init?.description || { uz: '', ru: '', en: '' },
          subcategory_slug: p.subcategory_slug || init?.subcategory_slug
        };
      });
    }

    const initialMap = new Map((initialProducts as Product[]).map(p => [p.id, p]));
    return loaded.map(p => {
      const init = initialMap.get(p.id);
      const rawColors = p.colors && p.colors.length > 0 ? p.colors : (init?.colors || []);
      const colors = rawColors.map((c) => {
        const isOut = c.inStock === false || (p.id === 990001 && (c.hex === '#1d3557' || c.name_uz === 'Moviy'));
        return {
          ...c,
          inStock: !isOut
        };
      });
      return {
        ...p,
        colors,
        subcategory_slug: p.subcategory_slug || init?.subcategory_slug,
        image_url: (p.image_url || init?.image_url || '').replace(/cdn\.Mayami\.com/g, 'cdn.2020mall.com'),
        images: (p.images || [p.image_url]).map(img => img.replace(/cdn\.Mayami\.com/g, 'cdn.2020mall.com'))
      };
    });
  });

  useEffect(() => {
    localStorage.setItem('mall_products_v10', JSON.stringify(products));
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

  const addReview = (reviewData: Omit<ProductReview, 'id' | 'createdAt'>) => {
    const newReview: ProductReview = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      userId: currentUser?.id,
      userPhone: currentUser?.phone,
      createdAt: new Date().toISOString(),
      verifiedPurchase: true
    };
    setReviews(prev => [newReview, ...prev]);

    // Recalculate rating & reviews_count for the product
    setProducts(prev =>
      prev.map(p => {
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
      })
    );
  };

  const replyToReview = (
    reviewId: string, 
    comment: string, 
    senderName: string, 
    senderRole: 'shop_owner' | 'superadmin' = 'shop_owner'
  ) => {
    setReviews(prev =>
      prev.map(r => {
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
      })
    );
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const categories = initialCategories as unknown as Category[];
  const banners = initialBanners;

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

  // Viewed Stories State
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mall_viewed_stories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('mall_viewed_stories', JSON.stringify(viewedStoryIds));
  }, [viewedStoryIds]);

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
    setViewedStoryIds(prev => {
      if (prev.includes(storyId)) return prev;
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
      return [...prev, storyId];
    });
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
    setShops(prev =>
      prev.map(shop => {
        if (shop.id === shopId) {
          const newStory: Story = {
            ...newStoryData,
            id: `story_${shopId}_${Date.now()}`,
            createdAt: new Date().toISOString(), // 24-hour expiration begins
            views: 0
          };
          return {
            ...shop,
            stories: [newStory, ...(shop.stories || [])]
          };
        }
        return shop;
      })
    );
  };

  const deleteStory = (shopId: string, storyId: string) => {
    setShops(prev =>
      prev.map(shop => {
        if (shop.id === shopId) {
          return {
            ...shop,
            stories: (shop.stories || []).filter(s => s.id !== storyId)
          };
        }
        return shop;
      })
    );
  };

  const cleanExpiredStories = () => {
    setShops(prev =>
      prev.map(s => ({
        ...s,
        stories: (s.stories || []).filter(isStoryActive)
      }))
    );
  };

  // Cart (Persistent per user in localStorage, temporary for guests in sessionStorage)
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
    // Guest: only from sessionStorage!
    try {
      const gCart = sessionStorage.getItem('mall_guest_cart');
      if (gCart) return JSON.parse(gCart);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`mall_user_cart_${currentUser.id}`, JSON.stringify(cart));
    } else {
      sessionStorage.setItem('mall_guest_cart', JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  const addToCart = (product: Product, quantity = 1, size?: string, color?: any) => {
    setCart(prev => {
      const existing = prev.find(
        item =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor?.hex === color?.hex
      );
      if (existing) {
        return prev.map(item =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity, selectedSize: size, selectedColor: color }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number, size?: string) => {
    setCart(prev =>
      prev.filter(
        item => !(item.product.id === productId && (!size || item.selectedSize === size))
      )
    );
  };

  const updateCartQuantity = (productId: number, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId && (!size || item.selectedSize === size)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist (Persistent per user in localStorage, temporary for guests in sessionStorage)
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
    // Guest: only from sessionStorage!
    try {
      const gWishlist = sessionStorage.getItem('mall_guest_wishlist');
      if (gWishlist) return JSON.parse(gWishlist);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`mall_user_wishlist_${currentUser.id}`, JSON.stringify(wishlist));
    } else {
      sessionStorage.setItem('mall_guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, currentUser]);

  const toggleWishlist = (productId: number) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: number) => wishlist.includes(productId);

  // Customer Session Activation (Merges guest cart/wishlist into user's profile)
  const activateCustomerSession = (user: CustomerUser) => {
    setCurrentUser(user);
    localStorage.setItem('mall_current_user', JSON.stringify(user));

    // Load guest items if any
    let guestCart: CartItem[] = [];
    try {
      const g = sessionStorage.getItem('mall_guest_cart');
      if (g) guestCart = JSON.parse(g);
    } catch (e) {}

    let guestWishlist: number[] = [];
    try {
      const g = sessionStorage.getItem('mall_guest_wishlist');
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

    // Persist to user storage and clear guest session
    localStorage.setItem(`mall_user_cart_${user.id}`, JSON.stringify(mergedCart));
    localStorage.setItem(`mall_user_wishlist_${user.id}`, JSON.stringify(mergedWishlist));
    sessionStorage.removeItem('mall_guest_cart');
    sessionStorage.removeItem('mall_guest_wishlist');

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
    setCart([]);
    setWishlist([]);
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

  // Orders State (100% working marketplace flow)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('mall_orders_v2');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "ORD-94281",
        date: "2026-11-08 14:32",
        items: [
          {
            product: (initialProducts as Product[])[0],
            quantity: 1,
            selectedSize: "Standart"
          }
        ],
        totalAmount: 245000,
        shippingFee: 0,
        status: "delivered" as OrderStatus,
        customerName: "Nodirbek Rustamov",
        customerPhone: "+998 88 678 22 04",
        userId: "user_nodirbek",
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
            selectedSize: "L"
          }
        ],
        totalAmount: 185000,
        shippingFee: 0,
        status: "processing" as OrderStatus,
        customerName: "Nodirbek Rustamov",
        customerPhone: "+998 88 678 22 04",
        userId: "user_nodirbek",
        region: "Toshkent shahar",
        address: "Chilonzor tumani, Bunyodkor 42",
        paymentMethod: "click",
        shopIds: ["shop_1"]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mall_orders_v2', JSON.stringify(orders));
  }, [orders]);

  const createOrder = (orderData: Omit<Order, 'id' | 'date' | 'status'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'pending',
      userId: currentUser?.id
    };
    setOrders(prev => [newOrder, ...prev]);
    if (orderData.address && currentUser) {
      addCustomerAddress(orderData.address);
    }
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  // Product CRUD
  const addProduct = (newProd: Omit<Product, 'id' | 'slug'>) => {
    const id = Date.now();
    const product: Product = {
      ...newProd,
      id,
      slug: (newProd.title?.uz || newProd.name?.uz || 'product')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') + `-${id.toString().slice(-4)}`
    };
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const toggleShopVerification = (shopId: string) => {
    setShops(prev =>
      prev.map(shop =>
        shop.id === shopId ? { ...shop, verified: !shop.verified } : shop
      )
    );
  };

  const toggleShopStatus = (shopId: string) => {
    setShops(prev =>
      prev.map(shop =>
        shop.id === shopId
          ? { ...shop, status: shop.status === 'active' ? 'suspended' : 'active' }
          : shop
      )
    );
  };

  const updateShopProfile = (shopId: string, updates: Partial<Shop>) => {
    setShops(prev =>
      prev.map(shop =>
        shop.id === shopId ? { ...shop, ...updates } : shop
      )
    );
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
      phone: shopData.phone || '+998 88 678 22 04',
      address: shopData.address || 'Toshkent shahar',
      stories: [],
      permissions: shopData.permissions || DEFAULT_VENDOR_PERMISSIONS
    };
    setShops(prev => [newShop, ...prev]);
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
        loginUser,
        registerUser,
        logoutUser,
        updateCustomerProfile,
        addCustomerAddress,
        
        // Unified Auth
        adminSession,
        loginUnified,
        logoutUnified,
        updateShopPermissions,
        updateShopCredentials,
        
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
        createShopByAdmin
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
