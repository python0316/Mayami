import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, DEFAULT_VENDOR_PERMISSIONS, ALL_PERMISSIONS } from '../context/AppContext';
import { PermissionKey, Shop, Product, OrderStatus, ProductReview } from '../types';
import { parseStoryMedia } from '../utils/mediaUtils';
import { 
  ShieldCheck, 
  Store, 
  Package, 
  ShoppingBag, 
  Flame, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  Star, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Key, 
  Lock, 
  Phone, 
  MapPin, 
  DollarSign, 
  FolderTree,
  Send,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Upload,
  Video,
  Image as ImageIcon,
  Tag,
  Play
} from 'lucide-react';

export const UnifiedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    adminSession,
    logoutUnified,
    shops,
    products,
    orders,
    reviews,
    categories,
    formatPrice,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    addStoryToShop,
    deleteStory,
    getStoryRemainingHours,
    openStoryViewer,
    isStoryActive,
    replyToReview,
    deleteReview,
    updateShopPermissions,
    updateShopCredentials,
    toggleShopVerification,
    toggleShopStatus,
    updateShopProfile,
    createShopByAdmin,
    t
  } = useApp();

  const isSuperAdmin = adminSession?.role === 'superadmin';
  const currentShopId = adminSession?.shopId;
  const currentShop = shops.find(s => s.id === currentShopId);

  const shopsWithStories = useMemo(() => {
    return shops
      .map(s => ({
        ...s,
        stories: (s.stories || []).filter(isStoryActive)
      }))
      .filter(s => s.stories.length > 0 && s.status !== 'suspended');
  }, [shops, isStoryActive]);

  // Permission Checker
  const hasPermission = (key: PermissionKey): boolean => {
    if (isSuperAdmin) return true;
    return adminSession?.permissions?.includes(key) ?? false;
  };

  // SuperAdmin Store Filter (superadmin can view platform-wide or filter by specific store)
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('all');

  // Determine active shop scope
  const activeScopeShopId = isSuperAdmin 
    ? (selectedShopFilter === 'all' ? null : selectedShopFilter)
    : currentShopId;

  // Active Tab State (defaults to first permitted tab)
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (isSuperAdmin) return 'overview';
    if (hasPermission('view_analytics')) return 'overview';
    if (hasPermission('manage_products')) return 'products';
    if (hasPermission('manage_orders')) return 'orders';
    if (hasPermission('manage_stories')) return 'stories';
    if (hasPermission('manage_reviews')) return 'reviews';
    if (hasPermission('manage_settings')) return 'settings';
    return 'overview';
  });

  // Filtered Products
  const scopedProducts = useMemo(() => {
    if (!activeScopeShopId) return products;
    return products.filter(p => p.shopId === activeScopeShopId);
  }, [products, activeScopeShopId]);

  // Filtered Orders
  const scopedOrders = useMemo(() => {
    if (!activeScopeShopId) return orders;
    return orders.filter(o => o.shopIds?.includes(activeScopeShopId));
  }, [orders, activeScopeShopId]);

  // Filtered Reviews
  const scopedReviews = useMemo(() => {
    if (!activeScopeShopId) return reviews;
    return reviews.filter(r => r.shopId === activeScopeShopId);
  }, [reviews, activeScopeShopId]);

  // Filtered Stories
  const scopedStoriesShops = useMemo(() => {
    if (!activeScopeShopId) return shops;
    return shops.filter(s => s.id === activeScopeShopId);
  }, [shops, activeScopeShopId]);

  // --- MODAL STATES ---
  // Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    nameUz: '',
    nameRu: '',
    nameEn: '',
    price: 99000,
    oldPrice: 120000,
    discount: 15,
    stockCount: 50,
    deliveryDays: 2,
    gender: 'unisex',
    imageUrl: '',
    categorySlug: 'clothing',
    shopId: activeScopeShopId || 'shop_1',
    descriptionUz: '',
    sizes: 'M, L, XL',
    colors: 'Qora:#000000, Oq:#FFFFFF'
  });

  // Story Modal
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [storyMediaType, setStoryMediaType] = useState<'image' | 'video'>('image');
  const [storyCaptionUz, setStoryCaptionUz] = useState('');
  const [storyCaptionRu, setStoryCaptionRu] = useState('');
  const [storyCaptionEn, setStoryCaptionEn] = useState('');
  const [storyCategorySlug, setStoryCategorySlug] = useState<string>('');
  const [storyProductId, setStoryProductId] = useState<number | undefined>(undefined);
  const [storyShopId, setStoryShopId] = useState<string>(activeScopeShopId || currentShopId || 'shop_1');
  const [storyFilePreview, setStoryFilePreview] = useState<string | null>(null);
  const [storyFileName, setStoryFileName] = useState<string | null>(null);

  const storyShopProducts = useMemo(() => {
    return products.filter(p => !storyShopId || p.shopId === storyShopId);
  }, [products, storyShopId]);

  // Permissions Edit Modal (SuperAdmin)
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [permTargetShop, setPermTargetShop] = useState<Shop | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<PermissionKey[]>([]);

  // Password / Credentials Modal (SuperAdmin)
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [credsTargetShop, setCredsTargetShop] = useState<Shop | null>(null);
  const [credsUsername, setCredsUsername] = useState('');
  const [credsPassword, setCredsPassword] = useState('');

  // Create Shop Modal (SuperAdmin)
  const [isCreateShopModalOpen, setIsCreateShopModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopUsername, setNewShopUsername] = useState('');
  const [newShopPassword, setNewShopPassword] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('+998 ');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopSellerType, setNewShopSellerType] = useState<'official_retailer' | 'business' | 'individual'>('official_retailer');
  const [newShopPerms, setNewShopPerms] = useState<PermissionKey[]>(DEFAULT_VENDOR_PERMISSIONS);

  // Review Reply State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Order Status Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const filteredOrdersList = scopedOrders.filter(o => 
    orderStatusFilter === 'all' ? true : o.status === orderStatusFilter
  );

  // Reviews Filter
  const [reviewFilterTab, setReviewFilterTab] = useState<'all' | 'unreplied' | 'replied'>('all');
  const filteredReviewsList = scopedReviews.filter(r => {
    if (reviewFilterTab === 'unreplied') return !r.reply;
    if (reviewFilterTab === 'replied') return !!r.reply;
    return true;
  });

  // Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      nameUz: '',
      nameRu: '',
      nameEn: '',
      price: 120000,
      oldPrice: 150000,
      discount: 20,
      stockCount: 40,
      deliveryDays: 2,
      gender: 'unisex',
      imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80',
      categorySlug: categories[0]?.slug || 'clothing',
      shopId: activeScopeShopId || currentShopId || 'shop_1',
      descriptionUz: '',
      sizes: 'S, M, L, XL',
      colors: 'Qora:#1A1A1A, Moviy:#2563EB'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      nameUz: prod.name?.uz || prod.title?.uz || '',
      nameRu: prod.name?.ru || prod.title?.ru || '',
      nameEn: prod.name?.en || prod.title?.en || '',
      price: prod.price,
      oldPrice: prod.old_price,
      discount: prod.discount,
      stockCount: prod.stock_count,
      deliveryDays: prod.delivery_days,
      gender: prod.gender || 'unisex',
      imageUrl: prod.image_url,
      categorySlug: prod.category_slug,
      shopId: prod.shopId,
      descriptionUz: prod.description?.uz || '',
      sizes: (prod.sizes || []).join(', '),
      colors: (prod.colors || []).map(c => `${c.name_uz}:${c.hex}`).join(', ')
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = prodForm.sizes.split(',').map(s => s.trim()).filter(Boolean);
    const colorsArray = prodForm.colors.split(',').map(item => {
      const parts = item.split(':');
      const name = parts[0]?.trim() || 'Rang';
      const hex = parts[1]?.trim() || '#111827';
      return {
        name_uz: name,
        name_ru: name,
        name_en: name,
        hex,
        inStock: true
      };
    }).filter(c => c.hex);

    const descUz = prodForm.descriptionUz || `${prodForm.nameUz}. Mayami platformasidagi rasmiy kafolatlangan tovar.`;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        category_slug: prodForm.categorySlug,
        shopId: prodForm.shopId,
        image_url: prodForm.imageUrl,
        images: [prodForm.imageUrl, ...(editingProduct.images || []).slice(1)],
        price: Number(prodForm.price),
        old_price: Number(prodForm.oldPrice),
        discount: Number(prodForm.discount),
        stock_count: Number(prodForm.stockCount),
        delivery_days: Number(prodForm.deliveryDays),
        gender: prodForm.gender,
        name: {
          uz: prodForm.nameUz,
          ru: prodForm.nameRu || prodForm.nameUz,
          en: prodForm.nameEn || prodForm.nameUz
        },
        title: {
          uz: prodForm.nameUz,
          ru: prodForm.nameRu || prodForm.nameUz,
          en: prodForm.nameEn || prodForm.nameUz
        },
        short_title: {
          uz: prodForm.nameUz,
          ru: prodForm.nameRu || prodForm.nameUz,
          en: prodForm.nameEn || prodForm.nameUz
        },
        description: {
          uz: descUz,
          ru: `${prodForm.nameRu || prodForm.nameUz}. Официальный товар на платформе Mayami.`,
          en: `${prodForm.nameEn || prodForm.nameUz}. Verified product on Mayami.`
        },
        sizes: sizesArray.length ? sizesArray : ['Standart'],
        colors: colorsArray.length ? colorsArray : [{ name_uz: 'Standart', name_ru: 'Стандарт', name_en: 'Standard', hex: '#111827', inStock: true }]
      });
    } else {
      addProduct({
        category_id: 1,
        category_slug: prodForm.categorySlug,
        subcategory_slug: undefined,
        shopId: prodForm.shopId,
        image_url: prodForm.imageUrl,
        images: [prodForm.imageUrl],
        price: Number(prodForm.price),
        old_price: Number(prodForm.oldPrice),
        discount: Number(prodForm.discount),
        currency: 'UZS',
        rating: 5.0,
        reviews_count: 0,
        delivery_days: Number(prodForm.deliveryDays),
        stock_count: Number(prodForm.stockCount),
        gender: prodForm.gender,
        name: {
          uz: prodForm.nameUz,
          ru: prodForm.nameRu || prodForm.nameUz,
          en: prodForm.nameEn || prodForm.nameUz
        },
        title: {
          uz: prodForm.nameUz,
          ru: prodForm.nameRu || prodForm.nameUz,
          en: prodForm.nameEn || prodForm.nameUz
        },
        short_title: {
          uz: prodForm.nameUz,
          ru: prodForm.nameRu || prodForm.nameUz,
          en: prodForm.nameEn || prodForm.nameUz
        },
        description: {
          uz: descUz,
          ru: `${prodForm.nameRu || prodForm.nameUz}. Официальный товар на платформе Mayami.`,
          en: `${prodForm.nameEn || prodForm.nameUz}. Verified product on Mayami.`
        },
        sizes: sizesArray.length ? sizesArray : ['Standart'],
        colors: colorsArray.length ? colorsArray : [{ name_uz: 'Standart', name_ru: 'Стандарт', name_en: 'Standard', hex: '#111827', inStock: true }]
      });
    }
    setIsProductModalOpen(false);
  };

  const handleStoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStoryFileName(file.name);
    if (file.type.startsWith('video/')) {
      setStoryMediaType('video');
    } else {
      setStoryMediaType('image');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setStoryFilePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMedia = (storyFilePreview || storyMediaUrl).trim();
    if (!finalMedia) {
      alert("Iltimos, rasm yoki video faylini tanlang yoki URL manzilini kiriting!");
      return;
    }

    const matchedCat = categories.find(c => c.slug === storyCategorySlug);

    addStoryToShop(storyShopId, {
      mediaType: storyMediaType,
      mediaUrl: finalMedia,
      caption_uz: storyCaptionUz || '🔥 Yangi 24-soatlik eksklyuziv mahsulot!',
      caption_ru: storyCaptionRu || '🔥 Эксклюзивный товар со скидкой!',
      caption_en: storyCaptionEn || '🔥 Exclusive item with fast delivery!',
      categorySlug: storyCategorySlug || undefined,
      categoryName: matchedCat?.title_uz,
      productId: storyProductId
    });

    setIsStoryModalOpen(false);
    setStoryMediaUrl('');
    setStoryFilePreview(null);
    setStoryFileName(null);
    setStoryCaptionUz('');
    setStoryCaptionRu('');
    setStoryCaptionEn('');
    setStoryCategorySlug('');
    setStoryProductId(undefined);
  };

  const handleOpenPermsModal = (shop: Shop) => {
    setPermTargetShop(shop);
    setSelectedPerms(shop.permissions || DEFAULT_VENDOR_PERMISSIONS);
    setIsPermModalOpen(true);
  };

  const handleTogglePermCheckbox = (perm: PermissionKey) => {
    setSelectedPerms(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSavePerms = () => {
    if (permTargetShop) {
      updateShopPermissions(permTargetShop.id, selectedPerms);
      setIsPermModalOpen(false);
    }
  };

  const handleOpenCredsModal = (shop: Shop) => {
    setCredsTargetShop(shop);
    setCredsUsername(shop.username || '');
    setCredsPassword(shop.password || 'shop123');
    setIsCredsModalOpen(true);
  };

  const handleSaveCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (credsTargetShop && credsUsername && credsPassword) {
      updateShopCredentials(credsTargetShop.id, {
        username: credsUsername.trim(),
        password: credsPassword.trim()
      });
      setIsCredsModalOpen(false);
    }
  };

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim() || !newShopUsername.trim() || !newShopPassword.trim()) return;

    createShopByAdmin({
      name: newShopName.trim(),
      username: newShopUsername.trim(),
      password: newShopPassword.trim(),
      phone: newShopPhone.trim(),
      address: newShopAddress.trim(),
      sellerType: newShopSellerType,
      category_slugs: ['clothing', 'shoes'],
      permissions: newShopPerms
    });

    setIsCreateShopModalOpen(false);
    setNewShopName('');
    setNewShopUsername('');
    setNewShopPassword('');
  };

  const handleSubmitReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    const senderName = isSuperAdmin ? 'Mayami SuperAdmin (Boshqaruv)' : (currentShop?.name || 'Do\'kon ma\'muriyati');
    const senderRole = isSuperAdmin ? 'superadmin' : 'shop_owner';
    replyToReview(reviewId, replyText.trim(), senderName, senderRole);
    setReplyingReviewId(null);
    setReplyText('');
  };

  // Permission Label Map
  const permLabels: Record<PermissionKey, { title: string; desc: string; icon: any }> = {
    manage_products: { title: "Mahsulotlar Katalogi", desc: "Mahsulot qo'shish, tahrirlash va o'chirish", icon: Package },
    manage_orders: { title: "Buyurtmalar Boshqaruvi", desc: "Buyurtmalarni qabul qilish va holatini yetkazildiga o'tkazish", icon: ShoppingBag },
    manage_stories: { title: "24-Soatlik Stories", desc: "24 soatlik marketing hikoyalari joylash", icon: Flame },
    manage_reviews: { title: "Sharhlar va Fikrlar", desc: "Xaridorlar sharhlarini o'qish va munosabat (javob) bildirish", icon: MessageSquare },
    view_analytics: { title: "Savdo va Tahlil", desc: "Daromad, buyurtmalar grafigi va umumiy statistika", icon: BarChart3 },
    manage_settings: { title: "Do'kon Sozlamalari", desc: "Logotip, banner, manzil va telefonni o'zgartirish", icon: Settings },
    manage_shops: { title: "Do'konlar (SuperAdmin)", desc: "Barcha do'konlarni verifikatsiya qilish va boshqarish", icon: Store },
    manage_users: { title: "Rollar va Ruxsatlar", desc: "Sotuvchilar uchun login/parol yaratish va ruxsat berish", icon: Users },
    manage_categories: { title: "Kategoriyalar (SuperAdmin)", desc: "Katalog bo'limlarini boshqarish", icon: FolderTree }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0D0D11] text-neutral-900 dark:text-neutral-100 pb-16">
      
      {/* 1. TOP HEADER & IDENTITY BAR */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#141418]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Brand & Active Role Badge */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-teal to-emerald-400 text-white flex items-center justify-center font-black shadow-md shadow-brand-teal/20">
                M
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-neutral-900 dark:text-white">Mayami</span>
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-teal/10 text-brand-teal">
                  Boshqaruv Portali
                </span>
              </div>
            </Link>

            {/* Role Chip */}
            {isSuperAdmin ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-black animate-pulse">
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                <span>SuperAdmin (Barcha Huquqlar)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                <Store className="w-4 h-4 text-amber-500" />
                <span className="truncate max-w-[150px]">{currentShop?.name || 'Sotuvchi'}</span>
              </div>
            )}
          </div>

          {/* Right: Store Switcher (if SuperAdmin) + Quick Actions + Logout */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end overflow-x-auto">
            {isSuperAdmin && (
              <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs">
                <Filter className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-bold text-neutral-500 hidden sm:inline">Filtr:</span>
                <select
                  value={selectedShopFilter}
                  onChange={(e) => setSelectedShopFilter(e.target.value)}
                  className="bg-transparent font-bold text-neutral-900 dark:text-white focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all">🌐 Barcha Do'konlar (Platforma)</option>
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>🏪 {s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Visit Storefront if vendor */}
            {!isSuperAdmin && currentShop && (
              <Link
                to={`/store/${currentShop.slug}`}
                target="_blank"
                className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-all text-neutral-700 dark:text-neutral-300"
                title="Do'koningizning xaridorlarga ko'rinishi"
              >
                <span>Do'konim</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Main Marketplace Home */}
            <Link
              to="/"
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-all text-neutral-700 dark:text-neutral-300"
            >
              <span>Saytga</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Logout */}
            <button
              onClick={() => {
                logoutUnified();
                navigate('/admin');
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-6">

        {/* Banner with Active Scope & Granted Permissions Indicator */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white shadow-xl border border-neutral-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black">
                {isSuperAdmin 
                  ? (selectedShopFilter === 'all' ? "Mayami Boshqaruv Markazi (SuperAdmin)" : `${shops.find(s=>s.id===selectedShopFilter)?.name} boshqaruvi`)
                  : `${currentShop?.name || 'Sotuvchi'} Boshqaruv Kabineti`}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/30">
                100% Faol
              </span>
            </div>
            <p className="text-xs text-neutral-300">
              {isSuperAdmin 
                ? "Barcha huquqlar sizga tegishli: mahsulotlar, buyurtmalar, stories, sharhlar, do'konlar va sotuvchilarga rol/parol berish."
                : "SuperAdmin tomonidan sizga ajratilgan ruxsatlar asosidagi xavfsiz boshqaruv paneli."}
            </p>
          </div>

          {/* Active Permission Badges for Vendor */}
          {!isSuperAdmin && (
            <div className="flex flex-wrap items-center gap-1.5 max-w-md">
              <span className="text-[11px] font-bold text-neutral-400">Ruxsatlar:</span>
              {(adminSession?.permissions || []).map(pKey => (
                <span key={pKey} className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-bold">
                  ✓ {permLabels[pKey]?.title.split(' ')[0]}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. DYNAMIC PERMISSION-AWARE TABS */}
        <div className="flex items-center space-x-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
          
          {hasPermission('view_analytics') && (
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
                  : 'bg-white dark:bg-[#18181C] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tahlil & Statistika</span>
            </button>
          )}

          {hasPermission('manage_products') && (
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
                  : 'bg-white dark:bg-[#18181C] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Mahsulotlar ({scopedProducts.length})</span>
            </button>
          )}

          {hasPermission('manage_orders') && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
                  : 'bg-white dark:bg-[#18181C] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buyurtmalar ({scopedOrders.length})</span>
            </button>
          )}

          {hasPermission('manage_stories') && (
            <button
              onClick={() => setActiveTab('stories')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'stories'
                  ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
                  : 'bg-white dark:bg-[#18181C] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>24h Stories</span>
            </button>
          )}

          {hasPermission('manage_reviews') && (
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
                  : 'bg-white dark:bg-[#18181C] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-rose-500" />
              <span>Sharhlar & Javoblar ({scopedReviews.length})</span>
            </button>
          )}

          {/* SUPERADMIN SPECIFIC TABS */}
          {isSuperAdmin && (
            <>
              <button
                onClick={() => setActiveTab('roles')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'roles'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-[#18181C] text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-purple-200 dark:border-purple-900/40'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Rollar & Ruxsatlar</span>
              </button>

              <button
                onClick={() => setActiveTab('shops')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'shops'
                    ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
                    : 'bg-white dark:bg-[#18181C] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Do'konlar ({shops.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
                    : 'bg-white dark:bg-[#18181C] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800'
                }`}
              >
                <FolderTree className="w-4 h-4" />
                <span>Kategoriyalar</span>
              </button>
            </>
          )}

          {hasPermission('manage_settings') && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
                  : 'bg-white dark:bg-[#18181C] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Do'kon Sozlamalari</span>
            </button>
          )}

        </div>

        {/* =========================================================================
            TAB 1: 📊 OVERVIEW & ANALYTICS
        ========================================================================= */}
        {activeTab === 'overview' && hasPermission('view_analytics') && (
          <div className="space-y-6 animate-in fade-in">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold">Jami Savdo</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                  {formatPrice(scopedOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0))}
                </div>
                <span className="text-[11px] font-bold text-emerald-500">
                  {scopedOrders.length} ta buyurtma asosida
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold">Mahsulotlar</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                  {scopedProducts.length} ta
                </div>
                <span className="text-[11px] font-bold text-neutral-400">
                  Barcha kategoriyalar bo'yicha
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold">Mijozlar Sharhlari</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                  {scopedReviews.length} ta
                </div>
                <span className="text-[11px] font-bold text-amber-500">
                  O'rtacha reyting: 4.9 ★
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-neutral-500">
                  <span className="text-xs font-bold">Faol 24h Stories</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                  {scopedStoriesShops.reduce((sum, s) => sum + (s.stories?.length || 0), 0)} ta
                </div>
                <span className="text-[11px] font-bold text-rose-500">
                  24 soatlik avto-taymer bilan
                </span>
              </div>

            </div>

            {/* Quick Actions & Recent Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Orders (2 cols) */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base">Oxirgi Buyurtmalar</h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
                  >
                    <span>Barchasini ko'rish</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {scopedOrders.slice(0, 3).map(ord => (
                    <div key={ord.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs">{ord.id}</span>
                          <span className="text-xs text-neutral-400">• {ord.date}</span>
                        </div>
                        <div className="font-bold text-xs mt-1 text-neutral-800 dark:text-neutral-200">
                          {ord.customerName} ({ord.customerPhone})
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {ord.items.length} ta mahsulot • {formatPrice(ord.totalAmount)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          ord.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-500' :
                          ord.status === 'shipped' ? 'bg-purple-500/15 text-purple-500' :
                          ord.status === 'processing' ? 'bg-blue-500/15 text-blue-500' :
                          ord.status === 'cancelled' ? 'bg-rose-500/15 text-rose-500' :
                          'bg-amber-500/15 text-amber-500'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions (1 col) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
                <h3 className="font-black text-base">Tezkor Amallar</h3>
                <div className="space-y-2.5">
                  {hasPermission('manage_products') && (
                    <button
                      onClick={handleOpenAddProduct}
                      className="w-full p-3.5 rounded-2xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Yangi Mahsulot Qo'shish</span>
                    </button>
                  )}

                  {hasPermission('manage_stories') && (
                    <button
                      onClick={() => setIsStoryModalOpen(true)}
                      className="w-full p-3.5 rounded-2xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Flame className="w-4 h-4" />
                      <span>24-Soatlik Story Joylash</span>
                    </button>
                  )}

                  {isSuperAdmin && (
                    <button
                      onClick={() => setIsCreateShopModalOpen(true)}
                      className="w-full p-3.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Users className="w-4 h-4" />
                      <span>Yangi Sotuvchi & Login Ochish</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: 📦 PRODUCTS CATALOG
        ========================================================================= */}
        {activeTab === 'products' && hasPermission('manage_products') && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#141418] p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <div>
                <h2 className="font-black text-lg">Mahsulotlar Katalogi</h2>
                <p className="text-xs text-neutral-500">Jami {scopedProducts.length} ta faol mahsulot</p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center gap-2 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Mahsulot</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-[#141418] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="p-4 font-bold">Mahsulot</th>
                      <th className="p-4 font-bold">Do'kon</th>
                      <th className="p-4 font-bold">Narxi</th>
                      <th className="p-4 font-bold">Ombor</th>
                      <th className="p-4 font-bold">Reyting</th>
                      <th className="p-4 font-bold text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {scopedProducts.map(prod => {
                      const prodShop = shops.find(s => s.id === prod.shopId);
                      return (
                        <tr key={prod.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={prod.image_url} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-700" />
                            <div>
                              <Link to={`/product/${prod.id}`} target="_blank" className="font-bold text-neutral-900 dark:text-white hover:text-brand-teal transition-colors line-clamp-1 max-w-xs">
                                {prod.name?.uz || prod.title?.uz}
                              </Link>
                              <div className="text-[11px] text-neutral-400 mt-0.5">
                                Kategoriya: {prod.category_slug}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-neutral-600 dark:text-neutral-300">
                            {prodShop?.name || prod.shopId}
                          </td>
                          <td className="p-4 font-bold text-brand-teal">
                            {formatPrice(prod.price)}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                              {prod.stock_count} dona
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              <span>{prod.rating || 5.0}</span>
                              <span className="text-[10px] text-neutral-400">({prod.reviews_count || 0})</span>
                            </div>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 transition-colors"
                              title="Tahrirlash"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Rostdan ham "${prod.name?.uz || prod.title?.uz}" mahsulotini o'chirmoqchimisiz?`)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: 📑 ORDERS MANAGEMENT
        ========================================================================= */}
        {activeTab === 'orders' && hasPermission('manage_orders') && (
          <div className="space-y-4 animate-in fade-in">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'all', label: 'Barchasi', count: scopedOrders.length },
                { id: 'pending', label: 'Kutilmoqda', count: scopedOrders.filter(o => o.status === 'pending').length },
                { id: 'processing', label: 'Tayyorlanmoqda', count: scopedOrders.filter(o => o.status === 'processing').length },
                { id: 'shipped', label: 'Yetkazilmoqda', count: scopedOrders.filter(o => o.status === 'shipped').length },
                { id: 'delivered', label: 'Yetkazildi', count: scopedOrders.filter(o => o.status === 'delivered').length },
                { id: 'cancelled', label: 'Bekor qilindi', count: scopedOrders.filter(o => o.status === 'cancelled').length }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setOrderStatusFilter(st.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    orderStatusFilter === st.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                      : 'bg-white dark:bg-[#141418] text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  {st.label} ({st.count})
                </button>
              ))}
            </div>

            {/* Orders Cards List */}
            <div className="space-y-4">
              {filteredOrdersList.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs">
                  Ushbu holatda buyurtmalar mavjud emas.
                </div>
              ) : (
                filteredOrdersList.map(ord => (
                  <div key={ord.id} className="p-6 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-xl">
                          {ord.id}
                        </span>
                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{ord.date}</span>
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-500">Holat:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className={`font-black text-xs px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all ${
                            ord.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' :
                            ord.status === 'shipped' ? 'bg-purple-500/15 text-purple-600 border-purple-500/30' :
                            ord.status === 'processing' ? 'bg-blue-500/15 text-blue-600 border-blue-500/30' :
                            ord.status === 'cancelled' ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' :
                            'bg-amber-500/15 text-amber-600 border-amber-500/30'
                          }`}
                        >
                          <option value="pending">🟡 Kutilmoqda (Pending)</option>
                          <option value="processing">🔵 Tayyorlanmoqda (Processing)</option>
                          <option value="shipped">🟣 Yetkazilmoqda (Shipped)</option>
                          <option value="delivered">🟢 Yetkazildi (Delivered)</option>
                          <option value="cancelled">🔴 Bekor qilindi (Cancelled)</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                      <div>
                        <span className="text-neutral-400 font-bold block">Xaridor:</span>
                        <span className="font-bold text-neutral-900 dark:text-white">{ord.customerName}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-bold block">Telefon:</span>
                        <a href={`tel:${ord.customerPhone}`} className="font-bold text-brand-teal hover:underline flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{ord.customerPhone}</span>
                        </a>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-bold block">Manzil:</span>
                        <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{ord.address}</span>
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-neutral-500">Buyurtma qilingan mahsulotlar:</span>
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800">
                          <div className="flex items-center gap-3">
                            <img src={it.product.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700" />
                            <div>
                              <div className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1">
                                {it.product.name?.uz || it.product.title?.uz}
                              </div>
                              <div className="text-[11px] text-neutral-400 mt-0.5">
                                {it.selectedSize && `O'lcham: ${it.selectedSize} • `}
                                {it.quantity} dona x {formatPrice(it.product.price)}
                              </div>
                            </div>
                          </div>
                          <div className="font-black text-xs text-neutral-900 dark:text-white">
                            {formatPrice(it.product.price * it.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer Total */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                      <span className="text-neutral-500 font-bold">To'lov usuli: <strong className="text-neutral-900 dark:text-white uppercase">{ord.paymentMethod}</strong></span>
                      <div className="text-right">
                        <span className="text-neutral-400 text-xs mr-2">Jami summa:</span>
                        <span className="text-base font-black text-brand-teal">{formatPrice(ord.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: ⚡ 24-HOUR STORIES MANAGEMENT
        ========================================================================= */}
        {activeTab === 'stories' && hasPermission('manage_stories') && (
          <div className="space-y-5 animate-in fade-in">
            {/* 24-hour Explanatory Header */}
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-sm text-neutral-900 dark:text-white">24-Soatlik Avtomatik Stories Qoidasi</h3>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  Har bir yangi hikoya (Story) e'lon qilingan vaqtdan boshlab <strong>aynan 24 soat</strong> davomida xaridorlarga faol ko'rinadi. 24 soat o'tgach, tizim uni avtomatik tarzda o'chiradi.
                </p>
              </div>

              <button
                onClick={() => setIsStoryModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-all flex items-center gap-2 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi 24h Story</span>
              </button>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {scopedStoriesShops.flatMap(s => (s.stories || []).map(st => ({ ...st, shopName: s.name, shopId: s.id }))).map(story => {
                const timer = getStoryRemainingHours(story);
                return (
                  <div key={story.id} className="rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
                    {/* Media Thumbnail */}
                    {(() => {
                      const parsed = parseStoryMedia(story.mediaUrl, story.mediaType);
                      return (
                        <div 
                          onClick={() => {
                            const shopIdx = shopsWithStories.findIndex(s => s.id === story.shopId);
                            if (shopIdx !== -1) {
                              const sIdx = (shopsWithStories[shopIdx]?.stories || []).findIndex(st => st.id === story.id);
                              openStoryViewer(shopIdx, sIdx >= 0 ? sIdx : 0);
                            }
                          }}
                          className="relative aspect-[9/16] max-h-72 bg-neutral-900 overflow-hidden cursor-pointer group"
                          title="Story'ni to'liq ko'rish uchun bosing"
                        >
                          {parsed.isYouTube ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-neutral-900">
                              <img 
                                src={parsed.thumbnailUrl} 
                                alt="" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'; }}
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                          ) : parsed.isDirectVideo || story.mediaType === 'video' ? (
                            <div className="relative w-full h-full">
                              <video 
                                src={story.mediaUrl} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={story.mediaUrl} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'; }}
                            />
                          )}
                          
                          {/* Remaining Timer Badge */}
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-black flex items-center gap-1.5 shadow-md">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{timer.label}</span>
                          </div>

                          {/* Views Badge */}
                          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                            <Eye className="w-3 h-3 text-brand-teal" />
                            <span>{story.views || 0} ta</span>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Ushbu story'ni o'chirmoqchimisiz?")) {
                                deleteStory(story.shopId, story.id);
                              }
                            }}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-md z-10"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })()}

                    {/* Caption & Shop */}
                    <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-400 text-[10px] uppercase truncate max-w-[130px]">{story.shopName}</span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{story.views || 0} ta ko'rildi</span>
                          </span>
                        </div>
                        <p className="font-bold text-neutral-800 dark:text-neutral-200 line-clamp-2">
                          {story.caption_uz}
                        </p>

                        {/* Badges for Tagged Category & Tagged Product */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {story.categorySlug && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center gap-1">
                              <FolderTree className="w-3 h-3" />
                              <span>{story.categoryName || story.categorySlug}</span>
                            </span>
                          )}
                          {story.productId && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>Bog'langan tovar</span>
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-[10px] font-bold">
                            {story.mediaType === 'video' ? '🎬 Video (1m)' : '🖼️ Rasm (10s)'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Clock className="w-3 h-3" />
                          <span>Soat {story.createdAt ? new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hozir'} da joylangan</span>
                        </span>
                        <span className="text-emerald-500 font-black">Faol (24h)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: ⭐ REVIEWS & REPLIES (SHAFFOF SHARHLAR TIZIMI)
        ========================================================================= */}
        {activeTab === 'reviews' && hasPermission('manage_reviews') && (
          <div className="space-y-4 animate-in fade-in">
            {/* Header info */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-teal" />
                  <h3 className="font-black text-base text-neutral-900 dark:text-white">
                    Xaridorlar Sharhlari va Munosabat (Javob) Bildirish
                  </h3>
                </div>
                <p className="text-xs text-neutral-500">
                  Xaridorlar mahsulotlar haqida qoldirgan sharhlarini o'qing. Sizning javobingiz mahsulot sahifasida barcha foydalanuvchilarga shaffof tarzda ko'rinadi.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl text-xs font-bold shrink-0">
                <button
                  onClick={() => setReviewFilterTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    reviewFilterTab === 'all' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Barchasi ({scopedReviews.length})
                </button>
                <button
                  onClick={() => setReviewFilterTab('unreplied')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    reviewFilterTab === 'unreplied' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Javob berilmagan ({scopedReviews.filter(r => !r.reply).length})
                </button>
                <button
                  onClick={() => setReviewFilterTab('replied')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    reviewFilterTab === 'replied' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Javob berilgan ({scopedReviews.filter(r => !!r.reply).length})
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviewsList.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs">
                  Sharhlar topilmadi.
                </div>
              ) : (
                filteredReviewsList.map(rev => {
                  const prod = products.find(p => p.id === rev.productId);
                  const isReplying = replyingReviewId === rev.id;

                  return (
                    <div key={rev.id} className="p-6 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
                      
                      {/* Product Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                        {prod && (
                          <Link to={`/product/${prod.id}`} target="_blank" className="flex items-center gap-3 group">
                            <img src={prod.image_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700" />
                            <div>
                              <div className="font-bold text-xs text-neutral-900 dark:text-white group-hover:text-brand-teal transition-colors line-clamp-1">
                                {prod.name?.uz || prod.title?.uz}
                              </div>
                              <span className="text-[10px] text-neutral-400">Do'kon: {shops.find(s=>s.id===rev.shopId)?.name}</span>
                            </div>
                          </Link>
                        )}

                        <div className="flex items-center gap-1.5">
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                if (confirm("Ushbu sharhni o'chirmoqchimisiz?")) {
                                  deleteReview(rev.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Sharhni o'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <span className="text-[11px] text-neutral-400">
                            {new Date(rev.createdAt).toLocaleDateString()} {new Date(rev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Customer Review Body */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-neutral-900 dark:text-white">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                                ✓ Xarid qilingan
                              </span>
                            )}
                          </div>

                          {/* Stars */}
                          <div className="flex items-center text-amber-400 text-xs">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-neutral-700 dark:text-neutral-300">
                          {rev.comment}
                        </p>
                      </div>

                      {/* Official Seller Reply */}
                      {rev.reply ? (
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5 animate-in fade-in">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-black text-emerald-600 dark:text-emerald-400">
                              <Store className="w-3.5 h-3.5" />
                              <span>{rev.reply.senderName} rasmiy javobi:</span>
                            </div>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(rev.reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-800 dark:text-neutral-200 pl-5 border-l-2 border-emerald-500/40">
                            "{rev.reply.comment}"
                          </p>
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setReplyingReviewId(rev.id);
                                setReplyText(rev.reply?.comment || '');
                              }}
                              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              Javobni tahrirlash
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {!isReplying ? (
                            <button
                              onClick={() => {
                                setReplyingReviewId(rev.id);
                                setReplyText('');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal font-bold text-xs flex items-center gap-1.5 transition-all"
                            >
                              <Send className="w-3 h-3" />
                              <span>Munosabat (Javob) bildirish</span>
                            </button>
                          ) : (
                            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-brand-teal/30 space-y-3 animate-in fade-in">
                              <span className="font-bold text-xs text-neutral-800 dark:text-white block">
                                Rasmiy javob yozish:
                              </span>
                              <textarea
                                rows={2}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Xaridorga minnatdorchilik bildiring yoki savoliga javob bering..."
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setReplyingReviewId(null)}
                                  className="px-3 py-1.5 rounded-xl text-neutral-500 hover:bg-neutral-200 text-xs font-bold"
                                >
                                  Bekor qilish
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSubmitReply(rev.id)}
                                  className="px-4 py-1.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal-hover transition-all flex items-center gap-1.5"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Javobni saqlash va e'lon qilish</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: 👥 ROLES & PERMISSIONS MANAGEMENT (SUPERADMIN ONLY)
        ========================================================================= */}
        {activeTab === 'roles' && isSuperAdmin && (
          <div className="space-y-5 animate-in fade-in">
            {/* Explanatory Header */}
            <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-black text-sm text-neutral-900 dark:text-white">SuperAdmin Ruxsatlar & Rollar Markazi</h3>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  Sotuvchilar uchun login/parol belgilang va ularga alohida ruxsatlar (permissions) taqdim eting. Ruxsati olib tashlangan bo'limlar sotuvchi kabinetida ko'rinmaydi.
                </p>
              </div>

              <button
                onClick={() => setIsCreateShopModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all flex items-center gap-2 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Sotuvchi & Login Yaratish</span>
              </button>
            </div>

            {/* Sellers Accounts Table */}
            <div className="bg-white dark:bg-[#141418] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 font-black text-sm">
                Barcha Sotuvchilar Hisoblari ({shops.length} ta do'kon)
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {shops.map(shop => {
                  const shopPerms = shop.permissions || DEFAULT_VENDOR_PERMISSIONS;
                  return (
                    <div key={shop.id} className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      {/* Shop identity */}
                      <div className="flex items-center gap-3.5">
                        <img src={shop.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-700" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-neutral-900 dark:text-white">{shop.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              shop.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {shop.status === 'active' ? 'Faol' : 'Bloklangan'}
                            </span>
                          </div>

                          {/* Login Credentials preview */}
                          <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 font-mono">
                            <span>Login: <strong className="text-neutral-900 dark:text-white">{shop.username}</strong></span>
                            <span>• Parol: <strong className="text-neutral-900 dark:text-white">{shop.password}</strong></span>
                            <span>• Tel: {shop.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Active Permissions Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                        {ALL_PERMISSIONS.map(pKey => {
                          const isGranted = shopPerms.includes(pKey);
                          if (!isGranted) return null;
                          return (
                            <span key={pKey} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                              ✓ {permLabels[pKey]?.title.split(' ')[0]}
                            </span>
                          );
                        })}
                      </div>

                      {/* SuperAdmin Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenPermsModal(shop)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Ruxsatlarni belgilash</span>
                        </button>

                        <button
                          onClick={() => handleOpenCredsModal(shop)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Login/Parol</span>
                        </button>

                        <button
                          onClick={() => toggleShopStatus(shop.id)}
                          className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                            shop.status === 'active' 
                              ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                          }`}
                          title={shop.status === 'active' ? "Bloklash" : "Faollashtirish"}
                        >
                          {shop.status === 'active' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: 🏪 SHOPS DIRECTORY (SUPERADMIN ONLY)
        ========================================================================= */}
        {activeTab === 'shops' && isSuperAdmin && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between bg-white dark:bg-[#141418] p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <div>
                <h3 className="font-black text-base">Barcha Do'konlar va B2B Hamkorlar</h3>
                <p className="text-xs text-neutral-500">Platformadagi barcha do'konlarni verifikatsiya qilish va faoliyatini boshqarish</p>
              </div>

              <button
                onClick={() => setIsCreateShopModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Do'kon Ochish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map(shop => (
                <div key={shop.id} className="p-5 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={shop.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700" />
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-sm">
                          <span>{shop.name}</span>
                          {shop.verified && <CheckCircle className="w-4 h-4 text-brand-teal fill-brand-teal/20" />}
                        </div>
                        <span className="text-[11px] text-neutral-400">{shop.phone}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {shop.description_uz}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <button
                      onClick={() => toggleShopVerification(shop.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        shop.verified ? 'bg-brand-teal/15 text-brand-teal' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {shop.verified ? '✓ Tasdiqlangan' : 'Verifikatsiya qilish'}
                    </button>

                    <Link
                      to={`/store/${shop.slug}`}
                      target="_blank"
                      className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
                    >
                      <span>Ko'rish</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 8: 📂 CATEGORIES DIRECTORY (SUPERADMIN ONLY)
        ========================================================================= */}
        {activeTab === 'categories' && isSuperAdmin && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#141418] p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
              <h3 className="font-black text-base">Platforma Katalog Kategoriyalari ({categories.length} ta)</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Saytdagi barcha asosiy bo'limlar va ularga tegishli subkategoriyalar tuzilmasi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => {
                const count = products.filter(p => p.category_slug === cat.slug).length;
                return (
                  <div key={cat.id} className="p-5 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{cat.icon || '📦'}</span>
                        <div>
                          <div className="font-black text-sm">{cat.title_uz}</div>
                          <span className="text-[11px] text-neutral-400">{cat.slug}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold">
                        {count} ta mahsulot
                      </span>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-[11px] font-bold text-neutral-400">Subkategoriyalar:</span>
                      <div className="flex flex-wrap gap-1">
                        {(cat.subcategories || []).map(sub => (
                          <span key={sub.id} className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-medium">
                            {sub.title_uz}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 9: ⚙️ SETTINGS
        ========================================================================= */}
        {activeTab === 'settings' && hasPermission('manage_settings') && (
          <div className="max-w-2xl bg-white dark:bg-[#141418] p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4 animate-in fade-in">
            <h3 className="font-black text-base">Do'kon Sozlamalari va Rekvizitlari</h3>
            <p className="text-xs text-neutral-500">
              Ushbu ma'lumotlar do'kon sahifasida (`/store/:slug`) va mahsulotlar kartasida xaridorlarga ko'rinadi.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Do'kon sozlamalari muvaffaqiyatli saqlandi!");
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Do'kon Nomi</label>
                <input
                  type="text"
                  defaultValue={currentShop?.name || ''}
                  onChange={(e) => currentShop && updateShopProfile(currentShop.id, { name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Telefon raqam</label>
                  <input
                    type="text"
                    defaultValue={currentShop?.phone || '+998 88 678 22 04'}
                    onChange={(e) => currentShop && updateShopProfile(currentShop.id, { phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Manzil</label>
                  <input
                    type="text"
                    defaultValue={currentShop?.address || 'Toshkent shahar'}
                    onChange={(e) => currentShop && updateShopProfile(currentShop.id, { address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Do'kon Tavsifi</label>
                <textarea
                  rows={3}
                  defaultValue={currentShop?.description_uz || ''}
                  onChange={(e) => currentShop && updateShopProfile(currentShop.id, { description_uz: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all shadow-md"
              >
                O'zgarishlarni Saqlash
              </button>
            </form>
          </div>
        )}

      </main>

      {/* =========================================================================
          MODALS
      ========================================================================= */}

      {/* 1. Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141418] max-w-2xl w-full rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-black text-base text-neutral-900 dark:text-white">
                {editingProduct ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot Qo'shish"}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1.5 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Mahsulot Nomi (O'zbekcha) *</label>
                <input
                  type="text"
                  required
                  value={prodForm.nameUz}
                  onChange={(e) => setProdForm({ ...prodForm, nameUz: e.target.value })}
                  placeholder="Masalan: Erkaklar klassik qora kostyumi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Sotuv Narxi (so'm) *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Eski Narxi (so'm)</label>
                  <input
                    type="number"
                    value={prodForm.oldPrice}
                    onChange={(e) => setProdForm({ ...prodForm, oldPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Ombor Qoldig'i (dona) *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.stockCount}
                    onChange={(e) => setProdForm({ ...prodForm, stockCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Kategoriya</label>
                  <select
                    value={prodForm.categorySlug}
                    onChange={(e) => setProdForm({ ...prodForm, categorySlug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.title_uz}</option>
                    ))}
                  </select>
                </div>

                {isSuperAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Tegishli Do'kon</label>
                    <select
                      value={prodForm.shopId}
                      onChange={(e) => setProdForm({ ...prodForm, shopId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer"
                    >
                      {shops.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Rasm URL Manzili *</label>
                <input
                  type="url"
                  required
                  value={prodForm.imageUrl}
                  onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">O'lchamlar (vergul bilan)</label>
                  <input
                    type="text"
                    value={prodForm.sizes}
                    onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })}
                    placeholder="S, M, L, XL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Ranglar (Nomi:HEX)</label>
                  <input
                    type="text"
                    value={prodForm.colors}
                    onChange={(e) => setProdForm({ ...prodForm, colors: e.target.value })}
                    placeholder="Qora:#000000, Oq:#FFFFFF"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Batafsil Tavsif</label>
                <textarea
                  rows={3}
                  value={prodForm.descriptionUz}
                  onChange={(e) => setProdForm({ ...prodForm, descriptionUz: e.target.value })}
                  placeholder="Mahsulot haqida batafsil ma'lumot..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all shadow-md"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add 24h Story Modal */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#141418] max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-base text-neutral-900 dark:text-white">Yangi 24-Soatlik Story Joylash</h3>
              </div>
              <button onClick={() => setIsStoryModalOpen(false)} className="p-1.5 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="space-y-4">
              
              {/* Media Type Toggle: Rasm (10s) vs Video (1m) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-500">Story turi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStoryMediaType('image')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      storyMediaType === 'image'
                        ? 'border-brand-teal bg-brand-teal/10 text-brand-teal shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Rasm (10 sekund)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryMediaType('video')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      storyMediaType === 'video'
                        ? 'border-brand-teal bg-brand-teal/10 text-brand-teal shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video (Maks 1 minut)</span>
                  </button>
                </div>
              </div>

              {/* File Upload & URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500">
                  {storyMediaType === 'video' ? 'Video fayli (Maks 1 minut) *' : 'Rasm fayli (10 sekund) *'}
                </label>

                {/* Real File Picker */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-2.5 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-brand-teal bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 transition-colors">
                      <Upload className="w-4 h-4 text-brand-teal" />
                      <span>{storyFileName ? storyFileName : 'Qurilmadan faylni tanlash (Rasm / Video)'}</span>
                    </div>
                    <input
                      type="file"
                      accept={storyMediaType === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleStoryFileUpload}
                      className="hidden"
                    />
                  </label>
                  {storyFilePreview && (
                    <button
                      type="button"
                      onClick={() => { setStoryFilePreview(null); setStoryFileName(null); }}
                      className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors text-xs font-bold"
                      title="Bekor qilish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* OR Direct URL Input */}
                <div className="pt-1">
                  <input
                    type="url"
                    value={storyMediaUrl}
                    onChange={(e) => {
                      setStoryMediaUrl(e.target.value);
                      if (e.target.value.includes('youtu.be') || e.target.value.includes('youtube.com') || /\.(mp4|webm|mov)(\?.*)?$/i.test(e.target.value)) {
                        setStoryMediaType('video');
                      }
                    }}
                    placeholder="Yoki to'g'ridan-to'g'ri URL manzilini kiriting (https://...)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>

                {/* Live Media Preview */}
                {(storyFilePreview || storyMediaUrl) && (
                  <div className="relative w-full h-36 rounded-2xl bg-black overflow-hidden border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                    {storyMediaType === 'video' ? (
                      <video
                        src={storyFilePreview || storyMediaUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={storyFilePreview || storyMediaUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      {storyMediaType === 'video' ? '🎬 Video (boshidagi 1m)' : '🖼️ Rasm (10s)'}
                    </span>
                  </div>
                )}
              </div>

              {/* 1. Category Tagging ("Aynan qaysi kategoriya uchun") */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">
                  Aynan qaysi kategoriya uchun (Ixtiyoriy)
                </label>
                <select
                  value={storyCategorySlug}
                  onChange={(e) => setStoryCategorySlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                >
                  <option value="">Kategoriya tanlang (Ixtiyoriy)</option>
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>
                      {c.title_uz || c.slug}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Product / Clothing Tagging ("Aynan qaysi kiyim / tovar uchun") */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">
                  Aynan qaysi kiyim / tovar uchun (Ixtiyoriy)
                </label>
                <select
                  value={storyProductId || ''}
                  onChange={(e) => setStoryProductId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                >
                  <option value="">Tovarni tanlang (Ixtiyoriy)</option>
                  {storyShopProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name?.uz || p.title?.uz} — {formatPrice(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Story Caption / Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Story Sarlavhasi / Tavsifi</label>
                <input
                  type="text"
                  value={storyCaptionUz}
                  onChange={(e) => setStoryCaptionUz(e.target.value)}
                  placeholder="🔥 Yangi kolleksiya yetib keldi! Chegirma -30%"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                />
              </div>

              {/* SuperAdmin Shop Selector */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Do'kon</label>
                  <select
                    value={storyShopId}
                    onChange={(e) => setStoryShopId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  >
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Duration and 24h Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {storyMediaType === 'video'
                      ? 'Video davomiyligi: Maksimal 1 minut (uzun video bo\'lsa ham boshidan 1 minut olinadi)'
                      : 'Rasm davomiyligi: Har bir rasm storiesda aynan 10 sekund ko\'rinadi'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  ⏳ Story qo'yilgan vaqtdan boshlab 24 soat faol bo'ladi va avtomatik ravishda o'chadi. Ko'rishlar soni va joylangan aniq vaqt barchaga ko'rinadi.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsStoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-all shadow-md"
                >
                  Joylash (24 soat)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Permissions Edit Modal (SuperAdmin) */}
      {isPermModalOpen && permTargetShop && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141418] max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-black text-base text-neutral-900 dark:text-white">Ruxsatlarni Belgilash</h3>
                <p className="text-xs text-neutral-400">{permTargetShop.name} uchun huquqlar</p>
              </div>
              <button onClick={() => setIsPermModalOpen(false)} className="p-1.5 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              {ALL_PERMISSIONS.map(pKey => {
                const info = permLabels[pKey];
                const isChecked = selectedPerms.includes(pKey);
                const Icon = info?.icon || Package;

                return (
                  <label
                    key={pKey}
                    onClick={() => handleTogglePermCheckbox(pKey)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isChecked 
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-900 dark:text-purple-200' 
                        : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{info?.title}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {info?.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsPermModalOpen(false)}
                className="px-4 py-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSavePerms}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md"
              >
                Ruxsatlarni Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Credentials Edit Modal (SuperAdmin) */}
      {isCredsModalOpen && credsTargetShop && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141418] max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-black text-base text-neutral-900 dark:text-white">Login & Parol</h3>
                <p className="text-xs text-neutral-400">{credsTargetShop.name}</p>
              </div>
              <button onClick={() => setIsCredsModalOpen(false)} className="p-1.5 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreds} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Sotuvchi Logini (Username) *</label>
                <input
                  type="text"
                  required
                  value={credsUsername}
                  onChange={(e) => setCredsUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Yangi Parol *</label>
                <input
                  type="text"
                  required
                  value={credsPassword}
                  onChange={(e) => setCredsPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCredsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all shadow-md"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create New Shop & Vendor Account Modal (SuperAdmin) */}
      {isCreateShopModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141418] max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-black text-base text-neutral-900 dark:text-white">Yangi Sotuvchi & Do'kon Ochish</h3>
                <p className="text-xs text-neutral-400">Login, parol va huquqlarni bir zumda belgilang</p>
              </div>
              <button onClick={() => setIsCreateShopModalOpen(false)} className="p-1.5 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Do'kon Nomi *</label>
                <input
                  type="text"
                  required
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  placeholder="Masalan: Samarqand Ipak Brezlari"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Login (Username) *</label>
                  <input
                    type="text"
                    required
                    value={newShopUsername}
                    onChange={(e) => setNewShopUsername(e.target.value)}
                    placeholder="samarqand_shop"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Maxfiy Parol *</label>
                  <input
                    type="text"
                    required
                    value={newShopPassword}
                    onChange={(e) => setNewShopPassword(e.target.value)}
                    placeholder="shop123"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={newShopPhone}
                    onChange={(e) => setNewShopPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Manzil</label>
                  <input
                    type="text"
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Permissions Checkboxes for new vendor */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 block">
                  Ushbu sotuvchiga beriladigan huquqlar (rollar):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {DEFAULT_VENDOR_PERMISSIONS.map(pKey => {
                    const isChecked = newShopPerms.includes(pKey);
                    return (
                      <label
                        key={pKey}
                        onClick={() => setNewShopPerms(prev => prev.includes(pKey) ? prev.filter(p => p !== pKey) : [...prev, pKey])}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${
                          isChecked ? 'bg-purple-500/10 border-purple-500/30 font-bold text-purple-700 dark:text-purple-300' : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-500'
                        }`}
                      >
                        <input type="checkbox" checked={isChecked} onChange={() => {}} className="rounded text-purple-600" />
                        <span>{permLabels[pKey]?.title.split(' ')[0]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateShopModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md"
                >
                  Do'konni Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
