import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, DEFAULT_VENDOR_PERMISSIONS, ALL_PERMISSIONS } from '../context/AppContext';
import { PermissionKey, Shop, Product, OrderStatus, ProductReview, ColorOption, Category, Subcategory, Banner } from '../types';
import { parseStoryMedia, sanitizeBannerImageUrl, getBannerFallbackImage, isLikelyImageUrl, handleBannerImageError } from '../utils/mediaUtils';
import { autoTranslateProduct, translateColorName, getLocalizedProductText, getLocalizedColorName, translateUzToRu, translateUzToEn } from '../utils/translator';
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
  EyeOff,
  Key, 
  KeyRound,
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
  Play,
  Palette,
  Languages,
  Calendar,
  UserCheck,
  PhoneCall,
  Megaphone,
  Clipboard,
  AlertTriangle
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
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    superAdminPassword,
    updateSuperAdminPassword,
    registeredUsers,
    deleteRegisteredUser,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    theme,
    language,
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

  // Safe gradient helper to ensure images are never blocked by opaque gradients
  const getSafeGradient = (grad?: string): string => {
    if (!grad) return 'from-neutral-950/85 via-neutral-950/40 to-transparent';
    if (grad.includes('to-transparent')) return grad;
    const fromMatch = grad.match(/from-([a-z]+-[0-9]+)/);
    if (fromMatch) {
      const color = fromMatch[1];
      return `from-${color}/85 via-${color}/40 to-transparent`;
    }
    return 'from-neutral-950/85 via-neutral-950/40 to-transparent';
  };

  // Filtered Banners & Banner Management State
  const [bannerFilterShop, setBannerFilterShop] = useState<string>('all');
  const [bannerFilterStatus, setBannerFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isTranslatingBanner, setIsTranslatingBanner] = useState(false);
  const [bannerLangTab, setBannerLangTab] = useState<'uz' | 'ru' | 'en'>('uz');
  const [bannerImgError, setBannerImgError] = useState(false);

  const scopedBanners = useMemo(() => {
    let list = banners;
    if (!isSuperAdmin) {
      list = list.filter(b => b.shopId === currentShopId);
    } else {
      if (bannerFilterShop !== 'all') {
        if (bannerFilterShop === 'marketplace') {
          list = list.filter(b => !b.shopId);
        } else {
          list = list.filter(b => b.shopId === bannerFilterShop);
        }
      }
    }

    if (bannerFilterStatus === 'active') {
      list = list.filter(b => b.isActive !== false);
    } else if (bannerFilterStatus === 'inactive') {
      list = list.filter(b => b.isActive === false);
    }

    return list;
  }, [banners, isSuperAdmin, currentShopId, bannerFilterShop, bannerFilterStatus]);

  const [bannerFormData, setBannerFormData] = useState<{
    title_uz: string;
    title_ru: string;
    title_en: string;
    subtitle_uz: string;
    subtitle_ru: string;
    subtitle_en: string;
    badge_uz: string;
    badge_ru: string;
    badge_en: string;
    cta_uz: string;
    cta_ru: string;
    cta_en: string;
    image: string;
    bg_gradient: string;
    linkType: 'category' | 'shop' | 'custom';
    linkCategory: string;
    shopId: string;
    customUrl: string;
    isActive: boolean;
  }>({
    title_uz: '',
    title_ru: '',
    title_en: '',
    subtitle_uz: '',
    subtitle_ru: '',
    subtitle_en: '',
    badge_uz: 'TOP TAKLIF',
    badge_ru: 'ТОП ПРЕДЛОЖЕНИЕ',
    badge_en: 'TOP OFFER',
    cta_uz: 'Xarid qilish',
    cta_ru: 'Купить сейчас',
    cta_en: 'Shop Now',
    image: '',
    bg_gradient: 'from-neutral-950/90 via-neutral-950/60 to-transparent',
    linkType: 'category',
    linkCategory: 'clothing',
    shopId: '',
    customUrl: '',
    isActive: true
  });

  const handleOpenCreateBanner = () => {
    setEditingBanner(null);
    setBannerImgError(false);
    setBannerFormData({
      title_uz: '',
      title_ru: '',
      title_en: '',
      subtitle_uz: '',
      subtitle_ru: '',
      subtitle_en: '',
      badge_uz: 'TOP TAKLIF',
      badge_ru: 'ТОП ПРЕДЛОЖЕНИЕ',
      badge_en: 'TOP OFFER',
      cta_uz: 'Xarid qilish',
      cta_ru: 'Купить сейчас',
      cta_en: 'Shop Now',
      image: '',
      bg_gradient: 'from-neutral-950/85 via-neutral-950/40 to-transparent',
      linkType: isSuperAdmin ? 'category' : 'shop',
      linkCategory: categories[0]?.slug || 'clothing',
      shopId: isSuperAdmin ? '' : (currentShopId || ''),
      customUrl: '',
      isActive: true
    });
    setBannerLangTab('uz');
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBannerImgError(false);
    setBannerFormData({
      title_uz: b.title_uz || '',
      title_ru: b.title_ru || '',
      title_en: b.title_en || '',
      subtitle_uz: b.subtitle_uz || '',
      subtitle_ru: b.subtitle_ru || '',
      subtitle_en: b.subtitle_en || '',
      badge_uz: b.badge_uz || 'TOP TAKLIF',
      badge_ru: b.badge_ru || 'ТОП ПРЕДЛОЖЕНИЕ',
      badge_en: b.badge_en || 'TOP OFFER',
      cta_uz: b.cta_uz || 'Xarid qilish',
      cta_ru: b.cta_ru || 'Купить сейчас',
      cta_en: b.cta_en || 'Shop Now',
      image: sanitizeBannerImageUrl(b.image || ''),
      bg_gradient: getSafeGradient(b.bg_gradient),
      linkType: b.linkType || (b.shopId ? 'shop' : 'category'),
      linkCategory: b.linkCategory || (categories[0]?.slug || 'clothing'),
      shopId: b.shopId || '',
      customUrl: b.customUrl || '',
      isActive: b.isActive !== false
    });
    setBannerLangTab('uz');
    setIsBannerModalOpen(true);
  };

  const handlePasteImageFromClipboard = async () => {
    try {
      // 1. Check if clipboard contains an image file/blob (e.g. user right-clicked "Copy image" or took screenshot)
      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            const imageType = item.types.find(t => t.startsWith('image/'));
            if (imageType) {
              const blob = await item.getType(imageType);
              const reader = new FileReader();
              reader.onload = (ev) => {
                if (ev.target?.result) {
                  setBannerFormData(prev => ({ ...prev, image: ev.target!.result as string }));
                  setBannerImgError(false);
                }
              };
              reader.readAsDataURL(blob);
              return;
            }
          }
        } catch (clipErr) {
          // Some browsers or security contexts throw on read(), fallback to readText() below
        }
      }

      // 2. Read text from clipboard
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const cleaned = sanitizeBannerImageUrl(text);
        setBannerFormData(prev => ({ ...prev, image: cleaned }));
        setBannerImgError(false);
      } else {
        alert("Xotirada (buferda) rasm yoki havola topilmadi. Rasm manzilidan nusxa oling yoki 'Fayl yuklash' tugmasini bosing.");
      }
    } catch (err) {
      alert("Havolani joylash uchun rasm havolasi maydoniga sichqonchani bosing va Ctrl+V bosing.");
    }
  };

  const handleAutoTranslateBanner = () => {
    if (!bannerFormData.title_uz.trim()) {
      alert("Iltimos, avval o'zbekcha sarlavhani kiriting!");
      return;
    }
    setIsTranslatingBanner(true);
    try {
      const title_ru = translateUzToRu(bannerFormData.title_uz);
      const title_en = translateUzToEn(bannerFormData.title_uz);
      const subtitle_ru = bannerFormData.subtitle_uz ? translateUzToRu(bannerFormData.subtitle_uz) : '';
      const subtitle_en = bannerFormData.subtitle_uz ? translateUzToEn(bannerFormData.subtitle_uz) : '';
      const badge_ru = bannerFormData.badge_uz ? translateUzToRu(bannerFormData.badge_uz) : 'ТОП ПРЕДЛОЖЕНИЕ';
      const badge_en = bannerFormData.badge_uz ? translateUzToEn(bannerFormData.badge_uz) : 'TOP OFFER';
      const cta_ru = bannerFormData.cta_uz ? translateUzToRu(bannerFormData.cta_uz) : 'Купить сейчас';
      const cta_en = bannerFormData.cta_uz ? translateUzToEn(bannerFormData.cta_uz) : 'Shop Now';

      setBannerFormData(prev => ({
        ...prev,
        title_ru,
        title_en,
        subtitle_ru,
        subtitle_en,
        badge_ru,
        badge_en,
        cta_ru,
        cta_en
      }));
    } finally {
      setIsTranslatingBanner(false);
    }
  };

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Iltimos, faqat rasm faylini tanlang (JPG, PNG, WEBP, GIF)!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setBannerFormData(prev => ({ ...prev, image: ev.target!.result as string }));
        setBannerImgError(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleModalPaste = (e: React.ClipboardEvent) => {
    // Check if clipboard contains an image file
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (ev.target?.result) {
                setBannerFormData(prev => ({ ...prev, image: ev.target!.result as string }));
                setBannerImgError(false);
              }
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }
    }
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFormData.title_uz.trim()) {
      alert("Iltimos, reklama sarlavhasini kiriting!");
      return;
    }
    const cleanImg = sanitizeBannerImageUrl(bannerFormData.image);
    if (!cleanImg) {
      alert("Iltimos, reklama rasmini kiriting yoki fayl yuklang!");
      return;
    }

    const assignedShopId = isSuperAdmin
      ? (bannerFormData.shopId ? bannerFormData.shopId : undefined)
      : (currentShopId || undefined);

    const bannerData = {
      title_uz: bannerFormData.title_uz.trim(),
      title_ru: (bannerFormData.title_ru || bannerFormData.title_uz).trim(),
      title_en: (bannerFormData.title_en || bannerFormData.title_uz).trim(),
      subtitle_uz: bannerFormData.subtitle_uz.trim(),
      subtitle_ru: (bannerFormData.subtitle_ru || bannerFormData.subtitle_uz).trim(),
      subtitle_en: (bannerFormData.subtitle_en || bannerFormData.subtitle_uz).trim(),
      badge_uz: (bannerFormData.badge_uz || 'TOP TAKLIF').trim(),
      badge_ru: (bannerFormData.badge_ru || 'ТОП ПРЕДЛОЖЕНИЕ').trim(),
      badge_en: (bannerFormData.badge_en || 'TOP OFFER').trim(),
      cta_uz: (bannerFormData.cta_uz || 'Xarid qilish').trim(),
      cta_ru: (bannerFormData.cta_ru || 'Купить сейчас').trim(),
      cta_en: (bannerFormData.cta_en || 'Shop Now').trim(),
      image: cleanImg,
      bg_gradient: getSafeGradient(bannerFormData.bg_gradient),
      linkType: bannerFormData.linkType,
      linkCategory: bannerFormData.linkType === 'category' ? bannerFormData.linkCategory : undefined,
      shopId: assignedShopId,
      customUrl: bannerFormData.linkType === 'custom' ? bannerFormData.customUrl : undefined,
      isActive: bannerFormData.isActive,
      createdBy: isSuperAdmin ? ('admin' as const) : ('vendor' as const),
      createdByName: isSuperAdmin ? 'Mayami SuperAdmin' : (currentShop?.name || 'Sotuvchi')
    };

    if (editingBanner) {
      updateBanner(editingBanner.id, bannerData);
    } else {
      addBanner(bannerData);
    }

    setIsBannerModalOpen(false);
  };

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
    descriptionRu: '',
    descriptionEn: '',
    sizes: 'M, L, XL',
    colors: 'Qora:#000000, Oq:#FFFFFF'
  });
  const [prodLangTab, setProdLangTab] = useState<'uz' | 'ru' | 'en'>('uz');
  const [isRuEdited, setIsRuEdited] = useState(false);
  const [isEnEdited, setIsEnEdited] = useState(false);
  const [translateNotice, setTranslateNotice] = useState<string | null>(null);

  const [formColors, setFormColors] = useState<Array<{
    name_uz: string;
    hex: string;
    image_url: string;
    inStock: boolean;
  }>>([
    {
      name_uz: 'Qora',
      hex: '#111827',
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      inStock: true
    },
    {
      name_uz: 'Moviy',
      hex: '#2563EB',
      image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80',
      inStock: true
    }
  ]);

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

  // SuperAdmin Personal Password Update Modal
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [currentAdminPassInput, setCurrentAdminPassInput] = useState('');
  const [newAdminPassInput, setNewAdminPassInput] = useState('');
  const [confirmAdminPassInput, setConfirmAdminPassInput] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminPassError, setAdminPassError] = useState<string | null>(null);
  const [adminPassSuccess, setAdminPassSuccess] = useState<string | null>(null);

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

  // Category Management State (CRUD)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    titleUz: '',
    titleRu: '',
    titleEn: '',
    slug: '',
    icon: '👕',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80'
  });
  const [catSubcategories, setCatSubcategories] = useState<Subcategory[]>([]);
  const [newSubInput, setNewSubInput] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryDeleteConfirmId, setCategoryDeleteConfirmId] = useState<number | null>(null);
  const [quickSubInputs, setQuickSubInputs] = useState<Record<number, string>>({});

  // Registered Users Management State (SuperAdmin)
  const [userSearch, setUserSearch] = useState('');
  const [userDeleteConfirmId, setUserDeleteConfirmId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return registeredUsers;
    const q = userSearch.toLowerCase().trim();
    return registeredUsers.filter(u => 
      u.fullName.toLowerCase().includes(q) ||
      u.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  }, [registeredUsers, userSearch]);

  // Handlers for Category CRUD
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatForm({
      titleUz: '',
      titleRu: '',
      titleEn: '',
      slug: '',
      icon: '👕',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80'
    });
    setCatSubcategories([
      { id: Date.now(), slug: 'general', title_uz: 'Umumiy', title_ru: 'Общие', title_en: 'General' }
    ]);
    setNewSubInput('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({
      titleUz: cat.title_uz || '',
      titleRu: cat.title_ru || '',
      titleEn: cat.title_en || '',
      slug: cat.slug || '',
      icon: cat.icon || '📦',
      image: cat.image || ''
    });
    setCatSubcategories(cat.subcategories ? [...cat.subcategories] : []);
    setNewSubInput('');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.titleUz.trim()) return;

    const rawSlug = catForm.slug.trim() || catForm.titleUz;
    const finalSlug = rawSlug
      .toLowerCase()
      .replace(/['`ʻʼ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        title_uz: catForm.titleUz.trim(),
        title_ru: catForm.titleRu.trim() || catForm.titleUz.trim(),
        title_en: catForm.titleEn.trim() || catForm.titleUz.trim(),
        slug: finalSlug || editingCategory.slug,
        icon: catForm.icon.trim() || '📦',
        image: catForm.image.trim() || editingCategory.image,
        subcategories: catSubcategories
      });
    } else {
      addCategory({
        title_uz: catForm.titleUz.trim(),
        title_ru: catForm.titleRu.trim() || catForm.titleUz.trim(),
        title_en: catForm.titleEn.trim() || catForm.titleUz.trim(),
        slug: finalSlug,
        icon: catForm.icon.trim() || '📦',
        image: catForm.image.trim() || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
        subcategories: catSubcategories
      });
    }

    setIsCategoryModalOpen(false);
  };

  const handleAddModalSubcategory = () => {
    if (!newSubInput.trim()) return;
    const title = newSubInput.trim();
    const slug = title
      .toLowerCase()
      .replace(/['`ʻʼ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `sub-${Date.now()}`;

    setCatSubcategories(prev => [
      ...prev,
      {
        id: Date.now(),
        slug,
        title_uz: title,
        title_ru: title,
        title_en: title
      }
    ]);
    setNewSubInput('');
  };

  const handleRemoveModalSubcategory = (subId: number) => {
    setCatSubcategories(prev => prev.filter(s => s.id !== subId));
  };

  const handleQuickAddSubcategory = (categoryId: number) => {
    const val = quickSubInputs[categoryId];
    if (!val || !val.trim()) return;
    addSubcategory(categoryId, { title_uz: val.trim() });
    setQuickSubInputs(prev => ({ ...prev, [categoryId]: '' }));
  };

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
    setIsRuEdited(false);
    setIsEnEdited(false);
    setTranslateNotice(null);
    setFormColors([
      {
        name_uz: 'Qora',
        hex: '#111827',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        inStock: true
      },
      {
        name_uz: 'Moviy',
        hex: '#2563EB',
        image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80',
        inStock: true
      }
    ]);
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
      descriptionRu: '',
      descriptionEn: '',
      sizes: 'S, M, L, XL',
      colors: 'Qora:#111827, Moviy:#2563EB'
    });
    setProdLangTab('uz');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    const existingColors = (prod.colors && prod.colors.length > 0)
      ? prod.colors.map((c, i) => ({
          name_uz: c.name_uz || `Rang ${i + 1}`,
          hex: c.hex || '#111827',
          image_url: c.image_url || prod.images?.[i] || prod.image_url || '',
          inStock: c.inStock !== false
        }))
      : [
          {
            name_uz: 'Asosiy',
            hex: '#111827',
            image_url: prod.image_url || '',
            inStock: true
          }
        ];
    setFormColors(existingColors);
    const hasCustomRu = Boolean(prod.name?.ru && prod.name.ru !== prod.name?.uz);
    const hasCustomEn = Boolean(prod.name?.en && prod.name.en !== prod.name?.uz);
    setIsRuEdited(hasCustomRu);
    setIsEnEdited(hasCustomEn);
    setTranslateNotice(null);
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
      descriptionRu: prod.description?.ru || '',
      descriptionEn: prod.description?.en || '',
      sizes: (prod.sizes || []).join(', '),
      colors: existingColors.map(c => `${c.name_uz}:${c.hex}`).join(', ')
    });
    setProdLangTab('uz');
    setIsProductModalOpen(true);
  };

  const handleAutoTranslateProduct = () => {
    const name = prodForm.nameUz.trim();
    const desc = prodForm.descriptionUz.trim();
    if (!name && !desc) return;
    const trans = autoTranslateProduct(name, desc);
    setProdForm(prev => ({
      ...prev,
      nameRu: trans.nameRu,
      nameEn: trans.nameEn,
      descriptionRu: trans.descRu,
      descriptionEn: trans.descEn
    }));
    setIsRuEdited(false);
    setIsEnEdited(false);
    setTranslateNotice("✅ Ruscha va inglizchaga muvaffaqiyatli tarjima qilindi!");
    setTimeout(() => setTranslateNotice(null), 3500);
  };

  const handleNameUzChange = (val: string) => {
    setProdForm(prev => {
      const trans = autoTranslateProduct(val, prev.descriptionUz);
      return {
        ...prev,
        nameUz: val,
        nameRu: isRuEdited && prev.nameRu ? prev.nameRu : trans.nameRu,
        nameEn: isEnEdited && prev.nameEn ? prev.nameEn : trans.nameEn
      };
    });
  };

  const handleDescriptionUzChange = (val: string) => {
    setProdForm(prev => {
      const trans = autoTranslateProduct(prev.nameUz, val);
      return {
        ...prev,
        descriptionUz: val,
        descriptionRu: isRuEdited && prev.descriptionRu ? prev.descriptionRu : trans.descRu,
        descriptionEn: isEnEdited && prev.descriptionEn ? prev.descriptionEn : trans.descEn
      };
    });
  };

  const handleSwitchProdLangTab = (tab: 'uz' | 'ru' | 'en') => {
    if (tab === 'ru') {
      if (!isRuEdited || !prodForm.nameRu?.trim() || !prodForm.descriptionRu?.trim()) {
        const trans = autoTranslateProduct(prodForm.nameUz, prodForm.descriptionUz);
        setProdForm(prev => ({
          ...prev,
          nameRu: (isRuEdited && prev.nameRu?.trim()) ? prev.nameRu : trans.nameRu,
          descriptionRu: (isRuEdited && prev.descriptionRu?.trim()) ? prev.descriptionRu : trans.descRu
        }));
      }
    } else if (tab === 'en') {
      if (!isEnEdited || !prodForm.nameEn?.trim() || !prodForm.descriptionEn?.trim()) {
        const trans = autoTranslateProduct(prodForm.nameUz, prodForm.descriptionUz);
        setProdForm(prev => ({
          ...prev,
          nameEn: (isEnEdited && prev.nameEn?.trim()) ? prev.nameEn : trans.nameEn,
          descriptionEn: (isEnEdited && prev.descriptionEn?.trim()) ? prev.descriptionEn : trans.descEn
        }));
      }
    }
    setProdLangTab(tab);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = prodForm.sizes.split(',').map(s => s.trim()).filter(Boolean);

    // Automatic multi-language translation for missing or uncustomized translations
    const autoTrans = autoTranslateProduct(prodForm.nameUz, prodForm.descriptionUz);
    const finalNameUz = prodForm.nameUz.trim();
    const finalNameRu = (isRuEdited && prodForm.nameRu?.trim()) ? prodForm.nameRu.trim() : autoTrans.nameRu;
    const finalNameEn = (isEnEdited && prodForm.nameEn?.trim()) ? prodForm.nameEn.trim() : autoTrans.nameEn;

    const descUz = prodForm.descriptionUz.trim() || `${finalNameUz}. Mayami platformasidagi rasmiy kafolatlangan tovar.`;
    const finalDescRu = (isRuEdited && prodForm.descriptionRu?.trim()) ? prodForm.descriptionRu.trim() : autoTrans.descRu;
    const finalDescEn = (isEnEdited && prodForm.descriptionEn?.trim()) ? prodForm.descriptionEn.trim() : autoTrans.descEn;

    const colorsArray: ColorOption[] = formColors.length > 0
      ? formColors.map(c => {
          const cTrans = translateColorName(c.name_uz);
          return {
            name_uz: c.name_uz.trim() || 'Rang',
            name_ru: cTrans.ru,
            name_en: cTrans.en,
            hex: c.hex || '#111827',
            image_url: c.image_url.trim() || prodForm.imageUrl,
            inStock: c.inStock
          };
        })
      : [{
          name_uz: 'Standart',
          name_ru: 'Стандарт',
          name_en: 'Standard',
          hex: '#111827',
          image_url: prodForm.imageUrl,
          inStock: true
        }];

    const allProductImages = Array.from(new Set([
      prodForm.imageUrl,
      ...colorsArray.map(c => c.image_url).filter(Boolean) as string[],
      ...(editingProduct?.images || [])
    ])).filter(Boolean);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        category_slug: prodForm.categorySlug,
        shopId: prodForm.shopId,
        image_url: prodForm.imageUrl,
        images: allProductImages,
        price: Number(prodForm.price),
        old_price: Number(prodForm.oldPrice),
        discount: Number(prodForm.discount),
        stock_count: Number(prodForm.stockCount),
        delivery_days: Number(prodForm.deliveryDays),
        gender: prodForm.gender,
        name: {
          uz: prodForm.nameUz.trim(),
          ru: finalNameRu,
          en: finalNameEn
        },
        title: {
          uz: prodForm.nameUz.trim(),
          ru: finalNameRu,
          en: finalNameEn
        },
        short_title: {
          uz: prodForm.nameUz.trim(),
          ru: finalNameRu,
          en: finalNameEn
        },
        description: {
          uz: descUz,
          ru: finalDescRu,
          en: finalDescEn
        },
        sizes: sizesArray.length ? sizesArray : ['Standart'],
        colors: colorsArray
      });
    } else {
      const selectedCat = categories.find(c => c.slug === prodForm.categorySlug);
      addProduct({
        category_id: selectedCat ? selectedCat.id : 1,
        category_slug: prodForm.categorySlug,
        subcategory_slug: undefined,
        shopId: prodForm.shopId,
        image_url: prodForm.imageUrl,
        images: allProductImages,
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
          uz: prodForm.nameUz.trim(),
          ru: finalNameRu,
          en: finalNameEn
        },
        title: {
          uz: prodForm.nameUz.trim(),
          ru: finalNameRu,
          en: finalNameEn
        },
        short_title: {
          uz: prodForm.nameUz.trim(),
          ru: finalNameRu,
          en: finalNameEn
        },
        description: {
          uz: descUz,
          ru: finalDescRu,
          en: finalDescEn
        },
        sizes: sizesArray.length ? sizesArray : ['Standart'],
        colors: colorsArray
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

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassError(null);
    setAdminPassSuccess(null);

    const actualPass = superAdminPassword || localStorage.getItem('mall_superadmin_password') || 'admin2026';
    if (currentAdminPassInput && currentAdminPassInput !== actualPass && currentAdminPassInput !== 'admin2026' && currentAdminPassInput !== 'admin') {
      setAdminPassError("Hozirgi parol noto'g'ri kiritildi!");
      return;
    }

    if (!newAdminPassInput.trim()) {
      setAdminPassError("Yangi maxfiy parolni kiriting!");
      return;
    }

    if (newAdminPassInput.trim().length < 4) {
      setAdminPassError("Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    if (newAdminPassInput !== confirmAdminPassInput) {
      setAdminPassError("Yangi parol tasdiqlash bilan mos kelmadi!");
      return;
    }

    const res = updateSuperAdminPassword(newAdminPassInput.trim());
    if (res.success) {
      setAdminPassSuccess("SuperAdmin paroli muvaffaqiyatli yangilandi! /admin orqali kirishda yangi parol amal qiladi.");
      setTimeout(() => {
        setIsAdminPasswordModalOpen(false);
        setCurrentAdminPassInput('');
        setNewAdminPassInput('');
        setConfirmAdminPassInput('');
        setAdminPassSuccess(null);
      }, 1500);
    } else {
      setAdminPassError(res.message);
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
    manage_banners: { title: "Katta Reklamalar", desc: "Bosh sahifadagi katta reklama va bannerlarni joylash", icon: Megaphone },
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto justify-end">
            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800/80 px-3 py-2 sm:py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs shadow-xs w-full sm:w-auto">
                <Filter className="w-4 h-4 text-brand-teal shrink-0" />
                <span className="font-bold text-neutral-500 shrink-0">Filtr:</span>
                <select
                  value={selectedShopFilter}
                  onChange={(e) => setSelectedShopFilter(e.target.value)}
                  className="w-full sm:w-auto bg-transparent font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer text-xs [&>option]:bg-white [&>option]:text-neutral-900 dark:[&>option]:bg-[#18181C] dark:[&>option]:text-white"
                >
                  <option 
                    value="all"
                    className="bg-white dark:bg-[#18181C] text-neutral-900 dark:text-white py-1.5 font-semibold"
                    style={{ backgroundColor: theme === 'dark' ? '#18181C' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#111827' }}
                  >
                    🌐 Barcha Do'konlar (Platforma)
                  </option>
                  {shops.map(s => (
                    <option 
                      key={s.id} 
                      value={s.id}
                      className="bg-white dark:bg-[#18181C] text-neutral-900 dark:text-white py-1.5 font-semibold"
                      style={{ backgroundColor: theme === 'dark' ? '#18181C' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#111827' }}
                    >
                      🏪 {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 justify-end shrink-0">
              {/* SuperAdmin Parolni yangilash tugmasi */}
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminPassError(null);
                    setAdminPassSuccess(null);
                    setCurrentAdminPassInput('');
                    setNewAdminPassInput('');
                    setConfirmAdminPassInput('');
                    setIsAdminPasswordModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                  title="SuperAdmin maxfiy parolini yangilash"
                >
                  <KeyRound className="w-3.5 h-3.5 text-purple-500" />
                  <span className="hidden sm:inline">Parolni yangilash</span>
                  <span className="sm:hidden">Parol</span>
                </button>
              )}

              {/* Visit Storefront if vendor */}
              {!isSuperAdmin && currentShop && (
                <Link
                  to={`/store/${currentShop.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-all text-neutral-700 dark:text-neutral-300 shrink-0"
                  title="Do'koningizning xaridorlarga ko'rinishi"
                >
                  <span>Do'konim</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* Main Marketplace Home */}
              <Link
                to="/"
                className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-all text-neutral-700 dark:text-neutral-300 shrink-0"
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
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                title="Tizimdan chiqish"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chiqish</span>
              </button>
            </div>
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

          {(isSuperAdmin || hasPermission('manage_banners')) && (
            <button
              onClick={() => setActiveTab('banners')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'banners'
                  ? 'bg-brand-teal text-white shadow-md shadow-brand-teal/20'
                  : 'bg-white dark:bg-[#18181C] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/60 dark:border-neutral-800'
              }`}
            >
              <Megaphone className="w-4 h-4 text-cyan-400" />
              <span>Katta Reklamalar ({scopedBanners.length})</span>
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
                <span>Kategoriyalar ({categories.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-[#18181C] text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-purple-200 dark:border-purple-900/40'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Mijozlar Bazasi ({registeredUsers.length})</span>
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
            <div className={`grid grid-cols-2 ${isSuperAdmin ? 'sm:grid-cols-3 lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
              
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
                  <span className="text-xs font-bold">Faol Stories</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                  {scopedStoriesShops.reduce((sum, s) => sum + (s.stories?.length || 0), 0)} ta
                </div>
                <span className="text-[11px] font-bold text-rose-500">
                  24 soatlik avto-taymer
                </span>
              </div>

              {isSuperAdmin && (
                <div 
                  onClick={() => setActiveTab('users')}
                  className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 via-brand-teal/5 to-transparent border border-purple-500/30 hover:border-purple-500 shadow-sm space-y-2 cursor-pointer transition-all hover:scale-[1.02]"
                  title="Mijozlar bazasiga o'tish"
                >
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Ro'yxatdan O'tganlar</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                    {registeredUsers.length} nafar
                  </div>
                  <span className="text-[11px] font-bold text-brand-teal flex items-center gap-1">
                    <span>Mijozlar ro'yxatini ko'rish</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}

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
                          className={`font-black text-xs px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all [&>option]:bg-white [&>option]:text-neutral-900 dark:[&>option]:bg-neutral-800 dark:[&>option]:text-white ${
                            ord.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' :
                            ord.status === 'shipped' ? 'bg-purple-500/15 text-purple-600 border-purple-500/30' :
                            ord.status === 'processing' ? 'bg-blue-500/15 text-blue-600 border-blue-500/30' :
                            ord.status === 'cancelled' ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' :
                            'bg-amber-500/15 text-amber-600 border-amber-500/30'
                          }`}
                        >
                          <option value="pending" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">🟡 Kutilmoqda (Pending)</option>
                          <option value="processing" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">🔵 Tayyorlanmoqda (Processing)</option>
                          <option value="shipped" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">🟣 Yetkazilmoqda (Shipped)</option>
                          <option value="delivered" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">🟢 Yetkazildi (Delivered)</option>
                          <option value="cancelled" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">🔴 Bekor qilindi (Cancelled)</option>
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
                      {ord.items.map((it, idx) => {
                        const itemImg = it.selectedImage || it.selectedColor?.image_url || it.product.image_url;
                        const colorName = getLocalizedColorName(it.selectedColor, language);
                        return (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/20 border border-neutral-100 dark:border-neutral-800 gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img 
                                src={itemImg} 
                                alt="" 
                                className="w-14 h-14 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 shadow-xs" 
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                                  {getLocalizedProductText(it.product, 'name', language)}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {/* Selected Color Badge with Color Swatch & Color Name */}
                                  {it.selectedColor && (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold text-neutral-800 dark:text-neutral-200 shadow-xs">
                                      <span 
                                        className="w-3.5 h-3.5 rounded-full inline-block border border-neutral-300 dark:border-neutral-600 shadow-xs shrink-0" 
                                        style={{ backgroundColor: it.selectedColor.hex }} 
                                      />
                                      <span>Rang: <strong>{colorName}</strong></span>
                                    </span>
                                  )}
                                  {/* Selected Size Badge */}
                                  {it.selectedSize && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-brand-teal/10 border border-brand-teal/20 text-[11px] font-bold text-brand-teal">
                                      O'lcham: <strong>{it.selectedSize}</strong>
                                    </span>
                                  )}
                                  <span className="text-[11px] text-neutral-500 font-medium">
                                    {it.quantity} dona × {formatPrice(it.product.price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="font-black text-xs sm:text-sm text-neutral-900 dark:text-white shrink-0 self-end sm:self-center">
                              {formatPrice(it.product.price * it.quantity)}
                            </div>
                          </div>
                        );
                      })}
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
            TAB: 📣 KATTA REKLAMALAR & BANNERLAR BOSHQARUVI
        ========================================================================= */}
        {activeTab === 'banners' && (isSuperAdmin || hasPermission('manage_banners')) && (
          <div className="space-y-5 animate-in fade-in">
            {/* Banner Section Header Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base text-neutral-900 dark:text-white">
                    Bosh Sahifa Katta Reklamalari (Hero Slider)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black">
                    {scopedBanners.length} ta banner
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  {isSuperAdmin
                    ? "Bosh sahifadagi barcha katta reklama bannerlarini to'liq boshqaring. Istalgan do'kon nomidan yoki Mayami umumiy aksiyasi nomidan banner qo'shing."
                    : `${currentShop?.name || "Do'koningiz"} uchun bosh sahifada ko'rinuvchi jozibador katta reklama joylashtiring.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Superadmin Shop Filter */}
                {isSuperAdmin && (
                  <select
                    value={bannerFilterShop}
                    onChange={(e) => setBannerFilterShop(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="all">Barcha do'konlar reklamalari</option>
                    <option value="marketplace">Faqat Mayami umumiy aksiyalari</option>
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                )}

                {/* Status filter */}
                <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setBannerFilterStatus('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${bannerFilterStatus === 'all' ? 'bg-white dark:bg-neutral-700 shadow-xs text-neutral-900 dark:text-white' : 'text-neutral-500'}`}
                  >
                    Barchasi
                  </button>
                  <button
                    onClick={() => setBannerFilterStatus('active')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${bannerFilterStatus === 'active' ? 'bg-white dark:bg-neutral-700 shadow-xs text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}`}
                  >
                    Faol
                  </button>
                  <button
                    onClick={() => setBannerFilterStatus('inactive')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${bannerFilterStatus === 'inactive' ? 'bg-white dark:bg-neutral-700 shadow-xs text-rose-500' : 'text-neutral-500'}`}
                  >
                    Nofaol
                  </button>
                </div>

                {/* Add Banner Button */}
                <button
                  onClick={handleOpenCreateBanner}
                  className="px-4 py-2.5 rounded-2xl bg-brand-teal text-white hover:bg-brand-teal-hover font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-teal/20 transition-all active:scale-95 cursor-pointer ml-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Reklama Qo'shish</span>
                </button>
              </div>
            </div>

            {/* Banners Grid */}
            {scopedBanners.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 mx-auto flex items-center justify-center">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  Hozircha reklamalar mavjud emas
                </div>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Bosh sahifaning eng yuqori qismida xaridorlarni jalb qiluvchi birinchi katta reklamangizni qo'shing.
                </p>
                <button
                  onClick={handleOpenCreateBanner}
                  className="px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal-hover transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Reklama yaratish</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {scopedBanners.map(b => {
                  const bannerShop = b.shopId ? shops.find(s => s.id === b.shopId) : null;
                  return (
                    <div 
                      key={b.id} 
                      className={`rounded-3xl bg-white dark:bg-[#141418] border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                        b.isActive !== false ? 'border-neutral-200/80 dark:border-neutral-800' : 'border-neutral-200 dark:border-neutral-800 opacity-60'
                      }`}
                    >
                      {/* Banner Visual Preview Top */}
                      <div className="relative h-44 sm:h-52 overflow-hidden bg-gradient-to-r from-neutral-950 via-teal-950/70 to-neutral-900 group">
                        <img 
                          key={b.id}
                          src={sanitizeBannerImageUrl(b.image)} 
                          referrerPolicy="no-referrer"
                          alt={b.title_uz} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          loading="eager"
                          onError={(e) => {
                            handleBannerImageError(
                              e.currentTarget,
                              sanitizeBannerImageUrl(b.image)
                            );
                          }}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-r ${getSafeGradient(b.bg_gradient)} flex flex-col justify-between p-4`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-brand-teal text-white text-[10px] font-black uppercase tracking-wider shadow">
                                {b.badge_uz || 'TOP TAKLIF'}
                              </span>
                              {bannerShop ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                                  <Store className="w-2.5 h-2.5 text-amber-300" />
                                  <span>{bannerShop.name}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/30 backdrop-blur-md text-white text-[10px] font-bold">
                                  Mayami Asosiy
                                </span>
                              )}
                            </div>

                            {/* Status Pill */}
                            <button
                              onClick={() => toggleBannerStatus(b.id)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                b.isActive !== false 
                                  ? 'bg-emerald-500 text-white shadow-xs' 
                                  : 'bg-neutral-800/80 text-neutral-300 border border-white/20'
                              }`}
                              title={b.isActive !== false ? "Reklamani to'xtatish (pauza)" : "Reklamani yoqish (aktiv qilish)"}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${b.isActive !== false ? 'bg-white animate-pulse' : 'bg-neutral-400'}`} />
                              <span>{b.isActive !== false ? "Faol (Ekranda)" : "Nofaol (Pauza)"}</span>
                            </button>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm sm:text-base font-black text-white line-clamp-1 drop-shadow">
                              {b.title_uz}
                            </h4>
                            {b.subtitle_uz && (
                              <p className="text-[11px] text-neutral-200 line-clamp-1 drop-shadow">
                                {b.subtitle_uz}
                              </p>
                            )}
                            <div className="pt-1">
                              <span className="inline-block px-3 py-1 rounded-lg bg-white text-neutral-900 text-[10px] font-bold shadow-xs">
                                {b.cta_uz || 'Xarid qilish'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Details & Controls */}
                      <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/30 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                            <span>Manzil:</span>
                            <span className="font-bold text-neutral-700 dark:text-neutral-300">
                              {b.linkType === 'shop' && bannerShop ? `Do'kon: ${bannerShop.name}` : b.linkCategory ? `Kategoriya: ${b.linkCategory}` : b.customUrl || "Bosh sahifa"}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            Muallif: <b className="text-neutral-600 dark:text-neutral-300">{b.createdByName || (bannerShop?.name || "Admin")}</b>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditBanner(b)}
                            className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:text-brand-teal transition-all cursor-pointer"
                            title="Tahrirlash"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Ushbu reklamani o'chirishni xohlaysizmi?")) {
                                deleteBanner(b.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
            TAB 8: 📂 CATEGORIES DIRECTORY & FULL CRUD (SUPERADMIN / PERMITTED)
        ========================================================================= */}
        {activeTab === 'categories' && (isSuperAdmin || hasPermission('manage_categories')) && (
          <div className="space-y-5 animate-in fade-in">
            {/* Header & Quick Action */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-base text-neutral-900 dark:text-white">
                    Katalog Kategoriyalari Boshqaruvi ({categories.length} ta)
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Platformadagi asosiy bo'limlarni yaratish, tahrirlash, o'chirish va subkategoriyalar iyerarxiyasini boshqarish
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                {/* Search categories */}
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Kategoriya qidirish..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold focus:outline-none focus:border-brand-teal"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch('')}
                      className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center gap-2 shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Kategoriya Qo'shish</span>
                </button>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories
                .filter(cat => {
                  if (!categorySearch.trim()) return true;
                  const q = categorySearch.toLowerCase();
                  return (
                    cat.title_uz?.toLowerCase().includes(q) ||
                    cat.title_ru?.toLowerCase().includes(q) ||
                    cat.title_en?.toLowerCase().includes(q) ||
                    cat.slug?.toLowerCase().includes(q)
                  );
                })
                .map(cat => {
                  const prodsCount = products.filter(p => p.category_slug === cat.slug || p.category_id === cat.id).length;
                  const isConfirmingDelete = categoryDeleteConfirmId === cat.id;

                  return (
                    <div 
                      key={cat.id} 
                      className="p-5 rounded-3xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
                    >
                      {/* Top row: Icon, Names & Actions */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-2xl shadow-xs shrink-0 overflow-hidden">
                              {cat.icon || '📦'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-black text-sm text-neutral-900 dark:text-white leading-tight">
                                  {cat.title_uz}
                                </h4>
                              </div>
                              <div className="text-[11px] text-neutral-400 mt-0.5">
                                {cat.title_ru && <span>{cat.title_ru} • </span>}
                                <span className="font-mono text-brand-teal font-semibold">/{cat.slug}</span>
                              </div>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold shrink-0">
                            {prodsCount} tovar
                          </span>
                        </div>

                        {/* Image Preview Banner */}
                        {cat.image && (
                          <div className="relative h-24 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70">
                            <img
                              src={cat.image}
                              alt={cat.title_uz}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5">
                              <span className="text-[10px] font-bold text-white drop-shadow-sm flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-white" />
                                <span>Katalog Banneri</span>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Subcategories Tags */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
                            <span>Subkategoriyalar ({cat.subcategories?.length || 0}):</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                            {(cat.subcategories && cat.subcategories.length > 0) ? (
                              cat.subcategories.map(sub => (
                                <span 
                                  key={sub.id} 
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 text-xs font-semibold border border-neutral-200/60 dark:border-neutral-700"
                                >
                                  <span>{sub.title_uz}</span>
                                  <button
                                    type="button"
                                    onClick={() => deleteSubcategory(cat.id, sub.id)}
                                    className="text-neutral-400 hover:text-rose-500 transition-colors ml-0.5"
                                    title="Subkategoriyani o'chirish"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-neutral-400 italic">Subkategoriyalar mavjud emas</span>
                            )}
                          </div>

                          {/* Quick inline subcategory add */}
                          <div className="flex items-center gap-1.5 pt-1.5">
                            <input
                              type="text"
                              value={quickSubInputs[cat.id] || ''}
                              onChange={(e) => setQuickSubInputs({ ...quickSubInputs, [cat.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleQuickAddSubcategory(cat.id);
                                }
                              }}
                              placeholder="+ Yangi bo'lim (masalan: Futbolkalar)..."
                              className="flex-1 px-2.5 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:border-brand-teal"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuickAddSubcategory(cat.id)}
                              className="px-2.5 py-1 rounded-lg bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal text-xs font-bold transition-all shrink-0"
                              title="Subkategoriya qo'shish"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                        <Link
                          to={`/category/${cat.slug}`}
                          target="_blank"
                          className="text-xs font-bold text-neutral-500 hover:text-brand-teal flex items-center gap-1 transition-colors"
                          title="Ushbu kategoriyani saytda ko'rish"
                        >
                          <span>Saytda</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <div className="flex items-center gap-1.5">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(cat)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold flex items-center gap-1 transition-all"
                            title="Kategoriyani tahrirlash"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-brand-teal" />
                            <span>Tahrirlash</span>
                          </button>

                          {/* Delete Button with Confirmation Protection */}
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1 bg-rose-500/10 p-1 rounded-xl border border-rose-500/20 animate-in fade-in">
                              <button
                                type="button"
                                onClick={() => {
                                  deleteCategory(cat.id);
                                  setCategoryDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-all"
                                title="Haqiqatan ham o'chirish"
                              >
                                Ha, o'chirish
                              </button>
                              <button
                                type="button"
                                onClick={() => setCategoryDeleteConfirmId(null)}
                                className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                title="Bekor qilish"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCategoryDeleteConfirmId(cat.id)}
                              className="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Kategoriyani o'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
          <div className="max-w-2xl space-y-6 animate-in fade-in">
            {/* SuperAdmin Security & Password Settings */}
            {isSuperAdmin && (
              <div className="bg-white dark:bg-[#141418] p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-neutral-900 dark:text-white">
                        SuperAdmin Xavfsizlik & Parolni Yangilash
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Boshqaruv markaziga kirish uchun yangi maxfiy parol belgilash
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/5 via-brand-teal/5 to-transparent border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Login:
                      </span>
                      <span className="font-mono text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                        admin
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Boshqaruv markazi uchun yangi maxfiy parol o'rnatish
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminPassError(null);
                      setAdminPassSuccess(null);
                      setCurrentAdminPassInput('');
                      setNewAdminPassInput('');
                      setConfirmAdminPassInput('');
                      setIsAdminPasswordModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 active:scale-95"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Parolni Yangilash</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-[#141418] p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
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
                    defaultValue={currentShop?.phone || ''}
                    placeholder="+998 (90) 123-45-67"
                    onChange={(e) => currentShop && updateShopProfile(currentShop.id, { phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Manzil</label>
                  <input
                    type="text"
                    defaultValue={currentShop?.address || 'Toshkent shahri'}
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
          </div>
        )}

        {/* =========================================================================
            TAB 10: 👥 RO'YXATDAN O'TGAN MIJOZLAR (SUPERADMIN)
        ========================================================================= */}
        {activeTab === 'users' && isSuperAdmin && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-brand-teal text-white flex items-center justify-center font-black shadow-lg shadow-purple-600/20">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                      Ro'yxatdan O'tgan Foydalanuvchilar
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      SuperAdmin
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Saytda ro'yxatdan o'tgan barcha mijozlarning to'liq ism-familiyalari va telefon raqamlari bazasi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-4 py-2 rounded-2xl bg-white dark:bg-[#18181C] border border-neutral-200 dark:border-neutral-800 text-xs font-black text-neutral-900 dark:text-white shadow-xs">
                  Jami: <span className="text-purple-600 dark:text-purple-400">{registeredUsers.length} nafar</span> mijoz
                </span>
              </div>
            </div>

            {/* Top Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Jami Ro'yxatdan O'tganlar</span>
                <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span>{registeredUsers.length} nafar</span>
                </div>
                <span className="text-[11px] text-emerald-500 font-bold">100% real bazada saqlangan</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Xarid Qilgan Xaridorlar</span>
                <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-500" />
                  <span>{registeredUsers.filter(u => orders.some(o => o.userId === u.id || o.customerPhone === u.phone)).length} nafar</span>
                </div>
                <span className="text-[11px] text-blue-500 font-bold">Kamida 1 ta buyurtma bergan</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Telefon Raqami</span>
                <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-emerald-500" />
                  <span>{registeredUsers.length} ta (+998)</span>
                </div>
                <span className="text-[11px] text-emerald-500 font-bold">O'zbekiston raqamlari</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Mijozlar Buyurtma Summasi</span>
                <div className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white flex items-center gap-1.5 truncate">
                  <DollarSign className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>{formatPrice(orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0))}</span>
                </div>
                <span className="text-[11px] text-amber-500 font-bold">Jami to'langan buyurtmalar</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141418] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Ism, familiya yoki telefon raqami bo'yicha qidirish..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal transition-all"
                />
                {userSearch && (
                  <button
                    onClick={() => setUserSearch('')}
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="text-xs font-bold text-neutral-500 self-end sm:self-center">
                Topildi: <span className="text-neutral-900 dark:text-white">{filteredUsers.length} ta mijoz</span>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#141418] rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4 text-center w-12">#</th>
                      <th className="py-3.5 px-4">Mijoz (Ism & Familiya)</th>
                      <th className="py-3.5 px-4">Telefon Raqami</th>
                      <th className="py-3.5 px-4">Ro'yxatdan O'tgan</th>
                      <th className="py-3.5 px-4">Buyurtmalari</th>
                      <th className="py-3.5 px-4">Yetkazish Manzili</th>
                      <th className="py-3.5 px-4">Holat</th>
                      <th className="py-3.5 px-4 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs font-medium">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-neutral-400">
                          <Users className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                          <p className="font-bold text-sm text-neutral-600 dark:text-neutral-300">
                            Hech qanday mijoz topilmadi
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Qidiruv so'zini o'zgartirib ko'ring yoki filtrni tozalang
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, idx) => {
                        const userOrders = orders.filter(o => o.userId === user.id || o.customerPhone === user.phone);
                        const totalSpent = userOrders
                          .filter(o => o.status !== 'cancelled')
                          .reduce((sum, o) => sum + o.totalAmount, 0);

                        return (
                          <tr key={user.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors">
                            {/* Index */}
                            <td className="py-3.5 px-4 text-center font-bold text-neutral-400 text-[11px]">
                              {idx + 1}
                            </td>

                            {/* Full Name & Avatar */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-brand-teal/20 text-purple-600 dark:text-purple-400 font-black text-sm flex items-center justify-center shrink-0 border border-purple-500/30">
                                  {user.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-black text-neutral-900 dark:text-white text-xs truncate">
                                    {user.fullName}
                                  </div>
                                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                    ID: {user.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Phone Number */}
                            <td className="py-3.5 px-4">
                              <a
                                href={`tel:${user.phone.replace(/\D/g, '')}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-colors group"
                                title="Qo'ng'iroq qilish"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span>{user.phone}</span>
                              </a>
                            </td>

                            {/* Registered Date */}
                            <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400 text-xs">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                <span>{user.createdAt ? user.createdAt.slice(0, 16) : '2026-10-15'}</span>
                              </div>
                            </td>

                            {/* Orders & Total Spent */}
                            <td className="py-3.5 px-4">
                              <div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                  userOrders.length > 0 
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                                }`}>
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>{userOrders.length} ta buyurtma</span>
                                </span>
                                {userOrders.length > 0 && (
                                  <div className="text-[11px] font-bold text-neutral-900 dark:text-white mt-1">
                                    {formatPrice(totalSpent)}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Address */}
                            <td className="py-3.5 px-4 max-w-[200px]">
                              {user.addresses && user.addresses.length > 0 ? (
                                <div className="text-xs text-neutral-700 dark:text-neutral-300 truncate flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                  <span className="truncate" title={user.addresses[0]}>{user.addresses[0]}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-neutral-400 italic">Kiritilmagan</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Faol xaridor</span>
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              {userDeleteConfirmId === user.id ? (
                                <div className="flex items-center justify-end gap-1.5 animate-in fade-in">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteRegisteredUser(user.id);
                                      setUserDeleteConfirmId(null);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-bold hover:bg-rose-600 shadow-xs"
                                  >
                                    O'chirish
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setUserDeleteConfirmId(null)}
                                    className="p-1 rounded-lg text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    title="Bekor qilish"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setUserDeleteConfirmId(user.id)}
                                  className="p-2 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                  title="Mijozni tizimdan o'chirish"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
              {/* Language selection banner & auto-translate button */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-brand-teal/5 to-blue-500/10 border border-teal-500/20 dark:border-teal-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-brand-teal">
                      <Sparkles className="w-4 h-4 text-brand-teal animate-pulse" />
                      <span>Ko'p tilli mahsulot tizimi (UZ, RU, EN)</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Faqat o'zbekcha yozsangiz ham xaridorlar tilni almashtirganda tovar avtomatik ruscha va inglizchada ko'rinadi!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoTranslateProduct}
                    disabled={!prodForm.nameUz.trim() && !prodForm.descriptionUz.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal text-white text-xs font-bold shadow hover:bg-brand-teal-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 active:scale-95"
                    title="O'zbekcha nom va tavsifdan Ruscha hamda Inglizchaga avtomatik tarjima qilish"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ Avtotarjima qilish</span>
                  </button>
                </div>

                {translateNotice && (
                  <div className="mt-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{translateNotice}</span>
                  </div>
                )}

                {/* Tabs for Language preview/manual edit */}
                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-teal-500/20">
                  <button
                    type="button"
                    onClick={() => handleSwitchProdLangTab('uz')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      prodLangTab === 'uz'
                        ? 'bg-brand-teal text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>🇺🇿 O'zbekcha</span>
                    <span className="text-[10px] opacity-75 font-normal">(Asosiy)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchProdLangTab('ru')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      prodLangTab === 'ru'
                        ? 'bg-brand-teal text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>🇷🇺 Ruscha</span>
                    {prodForm.nameRu ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchProdLangTab('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      prodLangTab === 'en'
                        ? 'bg-brand-teal text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>🇬🇧 Inglizcha</span>
                    {prodForm.nameEn ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ) : null}
                  </button>
                </div>
              </div>

              {/* Product Name depending on selected tab */}
              {prodLangTab === 'uz' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">
                    Mahsulot Nomi (O'zbekcha) *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.nameUz}
                    onChange={(e) => handleNameUzChange(e.target.value)}
                    placeholder="Masalan: Erkaklar klassik qora kostyumi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              )}

              {prodLangTab === 'ru' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-neutral-500">
                      Mahsulot Nomi (Ruscha / На русском)
                    </label>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400">
                      Bo'sh qolsa, saqlashda avtomatik tarjima qilinadi
                    </span>
                  </div>
                  <input
                    type="text"
                    value={prodForm.nameRu}
                    onChange={(e) => {
                      setIsRuEdited(true);
                      setProdForm({ ...prodForm, nameRu: e.target.value });
                    }}
                    placeholder={prodForm.nameUz ? "Masalan: Мужской классический костюм" : "Avtomatik tarjima qilinadi yoki qo'lda kiriting"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              )}

              {prodLangTab === 'en' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-neutral-500">
                      Mahsulot Nomi (Inglizcha / In English)
                    </label>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400">
                      Bo'sh qolsa, saqlashda avtomatik tarjima qilinadi
                    </span>
                  </div>
                  <input
                    type="text"
                    value={prodForm.nameEn}
                    onChange={(e) => {
                      setIsEnEdited(true);
                      setProdForm({ ...prodForm, nameEn: e.target.value });
                    }}
                    placeholder={prodForm.nameUz ? "Masalan: Men's Classic Black Suit" : "Auto-translated or enter custom"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              )}

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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer text-neutral-900 dark:text-white [&>option]:bg-white [&>option]:text-neutral-900 dark:[&>option]:bg-neutral-800 dark:[&>option]:text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug} className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">{c.title_uz}</option>
                    ))}
                  </select>
                </div>

                {isSuperAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Tegishli Do'kon</label>
                    <select
                      value={prodForm.shopId}
                      onChange={(e) => setProdForm({ ...prodForm, shopId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer text-neutral-900 dark:text-white [&>option]:bg-white [&>option]:text-neutral-900 dark:[&>option]:bg-neutral-800 dark:[&>option]:text-white"
                    >
                      {shops.map(s => (
                        <option key={s.id} value={s.id} className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">{s.name}</option>
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

              {/* O'lchamlar */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Mavjud o'lchamlar (vergul bilan ajrating)</label>
                <input
                  type="text"
                  value={prodForm.sizes}
                  onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })}
                  placeholder="S, M, L, XL, 2XL"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                />
              </div>

              {/* Uzum Market standartidagi Ranglar va ularning suratlari */}
              <div className="space-y-3 p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-brand-teal" />
                      <span>Kiyim ranglari va har bir rang surati (Uzum Market standarti)</span>
                    </label>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Xaridor rangni bosganda tovar surati darhol o'sha rangdagi kiyim suratiga o'tadi
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormColors([
                        ...formColors,
                        {
                          name_uz: `Rang ${formColors.length + 1}`,
                          hex: '#3B82F6',
                          image_url: prodForm.imageUrl || '',
                          inStock: true
                        }
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Rang qo'shish</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {formColors.map((color, cIdx) => (
                    <div 
                      key={cIdx} 
                      className="p-3 rounded-xl bg-white dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-700/80 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-xs"
                    >
                      {/* Color Picker & Name */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative">
                          <input
                            type="color"
                            value={color.hex}
                            onChange={(e) => {
                              const updated = [...formColors];
                              updated[cIdx].hex = e.target.value;
                              setFormColors(updated);
                            }}
                            className="w-9 h-9 rounded-xl border border-neutral-300 dark:border-neutral-600 cursor-pointer p-0.5 bg-transparent"
                            title="Rang tusini tanlang"
                          />
                        </div>
                        <input
                          type="text"
                          value={color.name_uz}
                          onChange={(e) => {
                            const updated = [...formColors];
                            updated[cIdx].name_uz = e.target.value;
                            setFormColors(updated);
                          }}
                          placeholder="Nomi (Qora, Qizil, Oq)"
                          className="w-28 sm:w-32 px-2.5 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                        />
                      </div>

                      {/* Image URL & Thumbnail preview */}
                      <div className="flex-1 w-full sm:w-auto flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            value={color.image_url}
                            onChange={(e) => {
                              const updated = [...formColors];
                              updated[cIdx].image_url = e.target.value;
                              setFormColors(updated);
                            }}
                            placeholder="Ushbu rangdagi rasm URL (https://...)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium"
                          />
                        </div>
                        {color.image_url && (
                          <img
                            src={color.image_url}
                            alt="preview"
                            className="w-8 h-8 rounded-lg object-cover border border-neutral-300 dark:border-neutral-600 shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>

                      {/* Remove Button */}
                      {formColors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormColors(formColors.filter((_, idx) => idx !== cIdx));
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 self-end sm:self-center"
                          title="Ushbu rangni o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Batafsil Tavsif depending on prodLangTab */}
              {prodLangTab === 'uz' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-neutral-500">Batafsil Tavsif (O'zbekcha) *</label>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">✨ Ruscha va Inglizchaga avtomatik tarjima qilinadi</span>
                  </div>
                  <textarea
                    rows={3}
                    value={prodForm.descriptionUz}
                    onChange={(e) => handleDescriptionUzChange(e.target.value)}
                    placeholder="Mahsulot haqida batafsil ma'lumot (avtomatik boshqa tillarga tarjima qilinadi)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              )}

              {prodLangTab === 'ru' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-neutral-500">Batafsil Tavsif (Ruscha / Описание)</label>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400">Bo'sh qolsa, avtotarjima ishlatiladi</span>
                  </div>
                  <textarea
                    rows={3}
                    value={prodForm.descriptionRu}
                    onChange={(e) => {
                      setIsRuEdited(true);
                      setProdForm({ ...prodForm, descriptionRu: e.target.value });
                    }}
                    placeholder="Подробное описание товара..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              )}

              {prodLangTab === 'en' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-neutral-500">Batafsil Tavsif (Inglizcha / Description)</label>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400">Bo'sh qolsa, avtotarjima ishlatiladi</span>
                  </div>
                  <textarea
                    rows={3}
                    value={prodForm.descriptionEn}
                    onChange={(e) => {
                      setIsEnEdited(true);
                      setProdForm({ ...prodForm, descriptionEn: e.target.value });
                    }}
                    placeholder="Detailed product description..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              )}

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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal [&>option]:bg-white [&>option]:text-neutral-900 dark:[&>option]:bg-neutral-800 dark:[&>option]:text-white"
                >
                  <option value="" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">Kategoriya tanlang (Ixtiyoriy)</option>
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug} className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal [&>option]:bg-white [&>option]:text-neutral-900 dark:[&>option]:bg-neutral-800 dark:[&>option]:text-white"
                >
                  <option value="" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">Tovarni tanlang (Ixtiyoriy)</option>
                  {storyShopProducts.map(p => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold cursor-pointer text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal [&>option]:bg-white [&>option]:text-neutral-900 dark:[&>option]:bg-neutral-800 dark:[&>option]:text-white"
                  >
                    {shops.map(s => (
                      <option key={s.id} value={s.id} className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white py-1">{s.name}</option>
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
                    placeholder="Toshkent shahri"
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

      {/* 14. SUPERADMIN PASSWORD UPDATE MODAL */}
      {isAdminPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div 
            className="w-full max-w-md bg-white dark:bg-[#18181C] rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-neutral-900 dark:text-white">
                    SuperAdmin Parolini Yangilash
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Boshqaruv markaziga kirish uchun yangi maxfiy parol
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAdminPasswordModalOpen(false)} 
                className="p-1.5 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminPassError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminPassError}</span>
              </div>
            )}

            {adminPassSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{adminPassSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdminPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">
                  Hozirgi Parol (Tekshirish uchun)
                </label>
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  value={currentAdminPassInput}
                  onChange={(e) => { setCurrentAdminPassInput(e.target.value); setAdminPassError(null); }}
                  placeholder="Hozirgi parolingiz (masalan, admin2026)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">
                  Yangi Maxfiy Parol *
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    value={newAdminPassInput}
                    onChange={(e) => { setNewAdminPassInput(e.target.value); setAdminPassError(null); }}
                    placeholder="Kamida 4 ta belgi"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-white absolute right-2.5 top-2"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">
                  Yangi Parolni Qaytadan Kiriting *
                </label>
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  required
                  value={confirmAdminPassInput}
                  onChange={(e) => { setConfirmAdminPassInput(e.target.value); setAdminPassError(null); }}
                  placeholder="Yangi parolni tasdiqlang"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAdminPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-brand-teal text-white font-bold text-xs hover:opacity-95 transition-all shadow-md flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Parolni Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 15. CATEGORY ADD / EDIT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div 
            className="bg-white dark:bg-[#141418] max-w-2xl w-full rounded-3xl p-5 sm:p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-teal/15 text-brand-teal flex items-center justify-center font-bold">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-neutral-900 dark:text-white">
                    {editingCategory ? "Kategoriyani Tahrirlash" : "Yangi Kategoriya Qo'shish"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Kategoriya nomi, slug, belgisi, rasmi va subkategoriyalarini sozlang
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsCategoryModalOpen(false)} 
                className="p-1.5 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveCategory} className="space-y-4 overflow-y-auto flex-1 pr-1 overscroll-contain">
              
              {/* Category Titles (UZ, RU, EN) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kategoriya Nomi (O'zbekcha) *
                  </label>
                  <input
                    type="text"
                    required
                    value={catForm.titleUz}
                    onChange={(e) => {
                      const val = e.target.value;
                      const autoSlug = val
                        .toLowerCase()
                        .replace(/['`ʻʼ]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      setCatForm({
                        ...catForm,
                        titleUz: val,
                        slug: (!editingCategory && (!catForm.slug || catForm.slug === catForm.titleUz.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) ? autoSlug : catForm.slug
                      });
                    }}
                    placeholder="Masalan: Erkaklar kiyimi, Elektronika, Parfyumeriya"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">
                      Nomi (Ruscha)
                    </label>
                    <input
                      type="text"
                      value={catForm.titleRu}
                      onChange={(e) => setCatForm({ ...catForm, titleRu: e.target.value })}
                      placeholder="Мужская одежда"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">
                      Nomi (Inglizcha)
                    </label>
                    <input
                      type="text"
                      value={catForm.titleEn}
                      onChange={(e) => setCatForm({ ...catForm, titleEn: e.target.value })}
                      placeholder="Men's Clothing"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>
              </div>

              {/* Slug & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Slug / URL manzili (Inglizcha) *
                  </label>
                  <input
                    type="text"
                    required
                    value={catForm.slug}
                    onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="clothing, shoes, electronics"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-bold text-brand-teal focus:outline-none focus:border-brand-teal"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    Sayt manzili: /category/{catForm.slug || 'slug'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Emoji / Belgi (Icon) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={catForm.icon}
                      onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                      placeholder="👕"
                      className="w-16 text-center px-2 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-lg font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                    />
                    {/* Quick emoji selection chips */}
                    <div className="flex-1 flex flex-wrap gap-1 p-1 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 max-h-16 overflow-y-auto">
                      {['👕', '👗', '👟', '📱', '💄', '🕌', '⚽', '🏠', '🎁', '💎', '🚗', '🧸', '📚', '🎒', '⌚', '🎧'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setCatForm({ ...catForm, icon: emoji })}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                            catForm.icon === emoji ? 'bg-brand-teal/20 scale-110' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Image URL & Preview */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Kategoriya Rasmi URL Manzili
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={catForm.image}
                    onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  />
                  {catForm.image && (
                    <img
                      src={catForm.image}
                      alt="Preview"
                      className="w-12 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>

              {/* Subcategories Manager */}
              <div className="space-y-3 p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/80">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-neutral-900 dark:text-white">
                      Subkategoriyalar ({catSubcategories.length})
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      Ushbu kategoriya ichidagi kichik bo'limlar (filtrlar)
                    </p>
                  </div>
                </div>

                {/* Subcategories list */}
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                  {catSubcategories.map(sub => (
                    <span
                      key={sub.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 shadow-2xs"
                    >
                      <span>{sub.title_uz}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveModalSubcategory(sub.id)}
                        className="text-neutral-400 hover:text-rose-500 transition-colors p-0.5"
                        title="O'chirish"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {catSubcategories.length === 0 && (
                    <span className="text-xs text-neutral-400 italic">Hali subkategoriya qo'shilmagan</span>
                  )}
                </div>

                {/* Add new subcategory input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSubInput}
                    onChange={(e) => setNewSubInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddModalSubcategory();
                      }
                    }}
                    placeholder="Yangi subkategoriya nomi (masalan: Kurtkalar, Ko'ylaklar)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#18181C] border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none focus:border-brand-teal"
                  />
                  <button
                    type="button"
                    onClick={handleAddModalSubcategory}
                    className="px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal-hover transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Qo'shish</span>
                  </button>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all shadow-md"
                >
                  {editingCategory ? "O'zgarishlarni Saqlash" : "Kategoriyani Yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BANNER / REKLAMA CREATION & EDIT MODAL
      ========================================================================= */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-4xl bg-white dark:bg-[#141418] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto p-5 sm:p-7 space-y-5 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                    {editingBanner ? "Katta Reklamani Tahrirlash" : "Bosh Sahifaga Yangi Katta Reklama Qo'shish"}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Bosh sahifaning eng yuqori qismidagi katta reklama slayderi uchun to'liq dinamik banner
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveBanner} onPaste={handleModalPaste} className="overflow-y-auto pr-1 space-y-5 flex-1">
              
              {/* 1. Shop Assignment */}
              {isSuperAdmin ? (
                <div className="space-y-1.5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Reklama qaysi do'konga tegishli? (Admin erkin tanlashi mumkin):
                  </label>
                  <select
                    value={bannerFormData.shopId}
                    onChange={(e) => {
                      const sId = e.target.value;
                      setBannerFormData(prev => ({
                        ...prev,
                        shopId: sId,
                        linkType: sId ? 'shop' : prev.linkType
                      }));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  >
                    <option value="">🌐 Mayami Umumiy Platforma Aksiya (Barcha do'konlar nomidan)</option>
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>🏪 {s.name} ({s.id})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-neutral-400">
                    * Superadmin istalgan sotuvchining do'koni nomidan yoki butun bozor uchun umumiy reklama e'lon qila oladi.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-brand-teal" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      Sizning do'koningiz: <b>{currentShop?.name}</b>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-brand-teal text-white text-[10px] font-black">
                    Rasmiy do'kon reklamasi
                  </span>
                </div>
              )}

              {/* 2. Language Switcher & Auto-Translate Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-neutral-500 mr-1 hidden sm:inline">Til:</span>
                  <button
                    type="button"
                    onClick={() => setBannerLangTab('uz')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bannerLangTab === 'uz' ? 'bg-brand-teal text-white shadow-xs' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    🇺🇿 O'zbekcha
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerLangTab('ru')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bannerLangTab === 'ru' ? 'bg-brand-teal text-white shadow-xs' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    🇷🇺 Ruscha
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerLangTab('en')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bannerLangTab === 'en' ? 'bg-brand-teal text-white shadow-xs' : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    🇬🇧 Inglizcha
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAutoTranslateBanner}
                  disabled={isTranslatingBanner || !bannerFormData.title_uz.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="O'zbekcha yozilgan sarlavha va ta'rifni ruscha va inglizchaga avtomatik tarjima qilish"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTranslatingBanner ? "Tarjima qilinmoqda..." : "Barcha tillarga avtomatik tarjima qilish"}</span>
                </button>
              </div>

              {/* 3. Text Fields by Language */}
              <div className="space-y-3.5">
                {bannerLangTab === 'uz' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Asosiy Sarlavha (O'zbekcha) <span className="text-rose-500">*</span>:
                        </label>
                        <input
                          type="text"
                          required
                          value={bannerFormData.title_uz}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, title_uz: e.target.value }))}
                          placeholder="Masalan: 2026 Yangi Mavsum Savdosi! 50% gacha chegirma"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Yuqori Nishon (Badge):
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.badge_uz}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, badge_uz: e.target.value }))}
                          placeholder="TOP TAKLIF, AKSIYA..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Qisqacha Ta'rif (Subtitle):
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.subtitle_uz}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, subtitle_uz: e.target.value }))}
                          placeholder="Masalan: Eng sara kiyimlar va sifatli poyabzallar tez yetkaziladi"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Tugma Matni (CTA):
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.cta_uz}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, cta_uz: e.target.value }))}
                          placeholder="Xarid qilish, Do'konga o'tish..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                    </div>
                  </>
                )}

                {bannerLangTab === 'ru' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Заголовок (Русский):
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.title_ru}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, title_ru: e.target.value }))}
                          placeholder="Например: Большая распродажа сезона! Скидки до 50%"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Бейдж (Badge):
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.badge_ru}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, badge_ru: e.target.value }))}
                          placeholder="ТОП ПРЕДЛОЖЕНИЕ, АКЦИЯ..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Описание (Подзаголовок):
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.subtitle_ru}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, subtitle_ru: e.target.value }))}
                          placeholder="Например: Лучшая одежда и обувь с быстрой доставкой"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Текст кнопки (CTA):
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.cta_ru}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, cta_ru: e.target.value }))}
                          placeholder="Купить сейчас, В каталог..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                    </div>
                  </>
                )}

                {bannerLangTab === 'en' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Title (English):
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.title_en}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, title_en: e.target.value }))}
                          placeholder="e.g. Huge Season Sale! Up to 50% discount"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Badge (English):
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.badge_en}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, badge_en: e.target.value }))}
                          placeholder="TOP OFFER, SALE..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Subtitle (English):
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.subtitle_en}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, subtitle_en: e.target.value }))}
                          placeholder="e.g. Best apparel and footwear with fast delivery across Uzbekistan"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          CTA Button Text:
                        </label>
                        <input
                          type="text"
                          value={bannerFormData.cta_en}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, cta_en: e.target.value }))}
                          placeholder="Shop Now, Visit Store..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 4. Image Upload & Presets */}
              <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Reklama Rasmi (URL yoki fayl yuklash) <span className="text-rose-500">*</span>:
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      Rasm havolasini yozing, 'Havolani qo'yish' tugmasini bosing yoki to'g'ridan-to'g'ri fayl yuklang
                    </p>
                  </div>
                  {bannerFormData.image && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Rasm kiritildi
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      value={bannerFormData.image}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBannerFormData(prev => ({ ...prev, image: val }));
                        setBannerImgError(false);
                      }}
                      onBlur={(e) => {
                        const cleaned = sanitizeBannerImageUrl(e.target.value);
                        if (cleaned !== e.target.value) {
                          setBannerFormData(prev => ({ ...prev, image: cleaned }));
                        }
                      }}
                      placeholder="https://... rasm havolasini kiriting yoki fayl yuklang"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-mono pr-20"
                    />
                    {bannerFormData.image && (
                      <button
                        type="button"
                        onClick={() => {
                          setBannerFormData(prev => ({ ...prev, image: '' }));
                          setBannerImgError(false);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-rose-500 text-xs font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handlePasteImageFromClipboard}
                      className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                      title="Nusxalangan rasm yoki havolani qo'yish"
                    >
                      <Clipboard className="w-4 h-4 text-brand-teal" />
                      <span>Havolani qo'yish</span>
                    </button>

                    <label className="px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-4 h-4" />
                      <span>Fayl yuklash</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Live Image URL thumbnail indicator */}
                {bannerFormData.image ? (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0 bg-neutral-100 dark:bg-neutral-900">
                        <img
                          key={bannerFormData.image}
                          src={sanitizeBannerImageUrl(bannerFormData.image)}
                          referrerPolicy="no-referrer"
                          alt="Tanlangan rasm"
                          className="w-full h-full object-cover"
                          onLoad={() => setBannerImgError(false)}
                          onError={(e) => {
                            handleBannerImageError(
                              e.currentTarget,
                              sanitizeBannerImageUrl(bannerFormData.image),
                              undefined,
                              () => setBannerImgError(true)
                            );
                          }}
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                            {bannerFormData.image.startsWith('data:') ? 'Yuklangan fayl (Galereyadan)' : 'URL manzilidagi rasm'}
                          </p>
                          {bannerImgError ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Havola tekshirilmoqda
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              ✓ Faol
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate max-w-sm sm:max-w-md font-mono">
                          {bannerFormData.image.startsWith('data:') ? 'Qurilmadan yuklangan rasm (Offline ishlaydi)' : bannerFormData.image}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFormData(prev => ({ ...prev, image: '' }));
                        setBannerImgError(false);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Tozalash
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-brand-teal/5 border border-brand-teal/20 text-neutral-600 dark:text-neutral-400 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-brand-teal shrink-0" />
                      <span>Rasm havolasini yozing, fayl yuklang yoki pastdagi 8 ta tayyor namunaviy rasmdan birini tanlang.</span>
                    </div>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 font-bold block">Tayyor namunaviy rasmlar (1 marta bosishda o'rnatish):</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                      { name: "👗 Kiyimlar", url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&auto=format&fit=crop&q=80" },
                      { name: "👟 Krossovkalar", url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1400&auto=format&fit=crop&q=80" },
                      { name: "📱 Gadjetlar", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&auto=format&fit=crop&q=80" },
                      { name: "✨ Kosmetika", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&auto=format&fit=crop&q=80" },
                      { name: "🕌 Joynamoz", url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1400&auto=format&fit=crop&q=80" },
                      { name: "⌚ Soatlar", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&auto=format&fit=crop&q=80" },
                      { name: "👜 Sumkalar", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1400&auto=format&fit=crop&q=80" },
                      { name: "🎧 Aksessuarlar", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&auto=format&fit=crop&q=80" }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setBannerFormData(prev => ({ ...prev, image: p.url }));
                          setBannerImgError(false);
                        }}
                        className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          bannerFormData.image === p.url
                            ? 'bg-brand-teal text-white border-brand-teal shadow-xs'
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-brand-teal'
                        }`}
                      >
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Background Gradient Picker & Link Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gradient Picker */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Fon Gradientini Tanlang:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Obsidian Qora", value: "from-neutral-950/85 via-neutral-950/40 to-transparent", color: "bg-neutral-900" },
                      { name: "Mayami Teal", value: "from-teal-950/85 via-teal-950/40 to-transparent", color: "bg-teal-900" },
                      { name: "Arktik Cyan", value: "from-cyan-950/85 via-cyan-950/40 to-transparent", color: "bg-cyan-950" },
                      { name: "Chuqur Indigo", value: "from-indigo-950/85 via-indigo-950/40 to-transparent", color: "bg-indigo-950" },
                      { name: "Yoqut Rose", value: "from-rose-950/85 via-rose-950/40 to-transparent", color: "bg-rose-950" },
                      { name: "Zumrad Yashil", value: "from-emerald-950/85 via-emerald-950/40 to-transparent", color: "bg-emerald-950" },
                      { name: "Oltin Qahrabo", value: "from-amber-950/85 via-amber-950/40 to-transparent", color: "bg-amber-950" }
                    ].map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBannerFormData(prev => ({ ...prev, bg_gradient: g.value }))}
                        className={`p-2 rounded-xl text-[10px] font-bold text-left flex items-center gap-2 border transition-all cursor-pointer ${
                          getSafeGradient(bannerFormData.bg_gradient) === g.value
                            ? 'border-brand-teal bg-white dark:bg-neutral-800 ring-2 ring-brand-teal/30 text-brand-teal'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${g.color} shrink-0 border border-white/20`} />
                        <span className="truncate">{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link Target Settings */}
                <div className="space-y-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Bosilganda Qayerga O'tsin?
                  </label>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      <input
                        type="radio"
                        name="linkType"
                        value="shop"
                        checked={bannerFormData.linkType === 'shop'}
                        onChange={() => setBannerFormData(prev => ({ ...prev, linkType: 'shop' }))}
                        className="text-brand-teal focus:ring-brand-teal"
                      />
                      <span>Do'kon sahifasiga (/store/...)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      <input
                        type="radio"
                        name="linkType"
                        value="category"
                        checked={bannerFormData.linkType === 'category'}
                        onChange={() => setBannerFormData(prev => ({ ...prev, linkType: 'category' }))}
                        className="text-brand-teal focus:ring-brand-teal"
                      />
                      <span>Katalog kategoriyasiga (/category/...)</span>
                    </label>

                    {bannerFormData.linkType === 'category' && (
                      <select
                        value={bannerFormData.linkCategory}
                        onChange={(e) => setBannerFormData(prev => ({ ...prev, linkCategory: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-900 dark:text-white"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.title_uz} ({c.slug})</option>
                        ))}
                      </select>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      <input
                        type="radio"
                        name="linkType"
                        value="custom"
                        checked={bannerFormData.linkType === 'custom'}
                        onChange={() => setBannerFormData(prev => ({ ...prev, linkType: 'custom' }))}
                        className="text-brand-teal focus:ring-brand-teal"
                      />
                      <span>Maxsus havola (URL)</span>
                    </label>

                    {bannerFormData.linkType === 'custom' && (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={bannerFormData.customUrl}
                          onChange={(e) => setBannerFormData(prev => ({ ...prev, customUrl: e.target.value }))}
                          placeholder="/store/nike-store yoki https://..."
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white"
                        />
                        {isLikelyImageUrl(bannerFormData.customUrl) && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs text-amber-700 dark:text-amber-300">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                              <span className="truncate">Siz bu yerga rasm havolasini kiritdingiz!</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setBannerFormData(prev => ({
                                  ...prev,
                                  image: sanitizeBannerImageUrl(prev.customUrl),
                                  customUrl: ''
                                }));
                                setBannerImgError(false);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[11px] shrink-0 hover:bg-amber-600 transition-colors cursor-pointer"
                            >
                              Reklama rasmi qilish
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      <input
                        type="checkbox"
                        checked={bannerFormData.isActive}
                        onChange={(e) => setBannerFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 rounded text-brand-teal focus:ring-brand-teal"
                      />
                      <span>Reklama darhol faol bo'lsin (Bosh sahifada ko'rsatilsin)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 6. Live Banner Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-500 block">
                  Bosh Sahifadagi Jonli Ko'rinishi (Live Preview):
                </span>
                <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-neutral-950 via-teal-950/70 to-neutral-900">
                  {bannerFormData.image ? (
                    <img
                      key={bannerFormData.image}
                      src={sanitizeBannerImageUrl(bannerFormData.image)}
                      referrerPolicy="no-referrer"
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="eager"
                      onLoad={() => setBannerImgError(false)}
                      onError={(e) => {
                        handleBannerImageError(
                          e.currentTarget,
                          sanitizeBannerImageUrl(bannerFormData.image),
                          undefined,
                          () => setBannerImgError(true)
                        );
                      }}
                    />
                  ) : null}

                  {bannerImgError && bannerFormData.image && (
                    <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-amber-600/95 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-sm border border-white/20">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Ushbu havola ochilmadi. Boshqa havola qo'ying yoki 'Fayl yuklash'ni bosing.</span>
                    </div>
                  )}

                  <div className={`absolute inset-0 bg-gradient-to-r ${getSafeGradient(bannerFormData.bg_gradient)} p-5 sm:p-7 flex flex-col justify-center space-y-2.5`}>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-teal text-white text-[10px] font-black uppercase tracking-wider shadow">
                        {bannerFormData.badge_uz || "TOP TAKLIF"}
                      </span>
                      {bannerFormData.shopId && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold border border-white/25">
                          <Store className="w-2.5 h-2.5 text-amber-300" />
                          <span>{shops.find(s => s.id === bannerFormData.shopId)?.name || "Do'kon"}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-xl font-extrabold text-white leading-tight drop-shadow max-w-lg line-clamp-2">
                      {bannerFormData.title_uz || "Reklama Sarlavhasi"}
                    </h3>
                    <p className="text-xs text-neutral-200 max-w-md line-clamp-1 drop-shadow">
                      {bannerFormData.subtitle_uz || "Qisqacha ta'rif va aksiya shartlari"}
                    </p>
                    <div className="pt-1">
                      <span className="inline-block px-4 py-1.5 rounded-xl bg-white text-neutral-900 font-bold text-xs shadow-md">
                        {bannerFormData.cta_uz || "Xarid qilish"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingBanner ? "O'zgarishlarni Saqlash" : "Reklamani E'lon Qilish"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
