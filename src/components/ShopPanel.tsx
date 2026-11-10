import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { parseStoryMedia } from '../utils/mediaUtils';
import { 
  Store, 
  Flame, 
  Package, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Pencil,
  Eye, 
  CheckCircle, 
  ExternalLink,
  Search,
  Filter,
  X,
  Video,
  Image as ImageIcon,
  Sparkles,
  Layers,
  AlertTriangle,
  Tag,
  Play,
  Percent,
  Palette,
  Check,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight
} from 'lucide-react';
import { ColorOption, OrderStatus, Product } from '../types';
import { Link } from 'react-router-dom';
import { getLocalizedProductText, getLocalizedColorName } from '../utils/translator';

const POPULAR_COLORS: ColorOption[] = [
  { name_uz: "Qora", name_ru: "Черный", name_en: "Black", hex: "#111111", inStock: true },
  { name_uz: "Oq", name_ru: "Белый", name_en: "White", hex: "#FFFFFF", inStock: true },
  { name_uz: "Ko'k", name_ru: "Синий", name_en: "Blue", hex: "#1E40AF", inStock: true },
  { name_uz: "Qizil", name_ru: "Красный", name_en: "Red", hex: "#DC2626", inStock: true },
  { name_uz: "Yashil", name_ru: "Зеленый", name_en: "Green", hex: "#16A34A", inStock: true },
  { name_uz: "Jigarrang", name_ru: "Коричневый", name_en: "Brown", hex: "#78350F", inStock: true },
  { name_uz: "Kulrang", name_ru: "Серый", name_en: "Grey", hex: "#6B7280", inStock: true },
  { name_uz: "Bej", name_ru: "Бежевый", name_en: "Beige", hex: "#D4B996", inStock: true },
  { name_uz: "Zumrad", name_ru: "Бирюзовый", name_en: "Teal", hex: "#0D9488", inStock: true },
  { name_uz: "Binafsha", name_ru: "Фиолетовый", name_en: "Purple", hex: "#7C3AED", inStock: true },
  { name_uz: "Pushti", name_ru: "Розовый", name_en: "Pink", hex: "#DB2777", inStock: true }
];

export const ShopPanel: React.FC = () => {
  const { 
    authenticatedShop,
    shops, 
    products, 
    categories,
    orders, 
    updateOrderStatus, 
    addStoryToShop, 
    deleteStory, 
    openStoryViewer,
    addProduct, 
    updateProduct,
    deleteProduct, 
    formatPrice,
    language, 
    t 
  } = useApp();

  const currentShop = authenticatedShop || shops[0];
  const shopsWithStories = shops.filter(s => s.stories && s.stories.length > 0 && s.status !== 'suspended');
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'products' | 'orders'>('overview');

  // Stories Form State
  const [storyMediaType, setStoryMediaType] = useState<'image' | 'video'>('image');
  const [newStoryMedia, setNewStoryMedia] = useState('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80');
  const [newStoryCaptionUz, setNewStoryCaptionUz] = useState('Yangi islomiy buyumlar va sara kolleksiya yetib keldi! Chegirma bilan xarid qiling.');
  const [newStoryCaptionRu, setNewStoryCaptionRu] = useState('Новая коллекция уже в наличии! Скидки на все позиции.');
  const [newStoryCaptionEn, setNewStoryCaptionEn] = useState('New collection has arrived! Special discounts.');
  const [newStoryProductId, setNewStoryProductId] = useState<number | undefined>(undefined);
  const [storySuccess, setStorySuccess] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);

  // In-Panel Product Quick View Modal State (Sotuvchi shop paneldan chiqib ketmasligi uchun)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [viewingImageIdx, setViewingImageIdx] = useState(0);

  // Product CRUD Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [productSuccessMsg, setProductSuccessMsg] = useState<string | null>(null);

  // Custom Color Input State
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#2563EB');

  // Product Form Fields
  const [formData, setFormData] = useState<{
    nameUz: string;
    nameRu: string;
    nameEn: string;
    categorySlug: string;
    subcategorySlug: string;
    price: number;
    oldPrice: number;
    discountPercent: number;
    stockCount: number;
    deliveryDays: number;
    imageUrl: string;
    additionalImages: string;
    descriptionUz: string;
    descriptionRu: string;
    descriptionEn: string;
    sizes: string;
    gender: string;
    colors: ColorOption[];
  }>({
    nameUz: '',
    nameRu: '',
    nameEn: '',
    categorySlug: 'islamic-items',
    subcategorySlug: 'prayer-mats',
    price: 170000,
    oldPrice: 200000,
    discountPercent: 15,
    stockCount: 50,
    deliveryDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
    additionalImages: '',
    descriptionUz: '',
    descriptionRu: '',
    descriptionEn: '',
    sizes: 'Universal',
    gender: 'unisex',
    colors: [
      { name_uz: "Qora", name_ru: "Черный", name_en: "Black", hex: "#111111", inStock: true },
      { name_uz: "Yashil", name_ru: "Зеленый", name_en: "Green", hex: "#16A34A", inStock: true }
    ]
  });

  // Product Filter State in Shop Panel
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Shop filtered data
  const shopProducts = useMemo(() => {
    return products.filter(p => p.shopId === currentShop.id);
  }, [products, currentShop.id]);

  const filteredShopProducts = useMemo(() => {
    return shopProducts.filter(p => {
      if (selectedCategoryFilter !== 'all' && p.category_slug !== selectedCategoryFilter) {
        return false;
      }
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase().trim();
        const inUz = p.name?.uz?.toLowerCase().includes(q) || p.title?.uz?.toLowerCase().includes(q);
        const inRu = p.name?.ru?.toLowerCase().includes(q) || p.title?.ru?.toLowerCase().includes(q);
        const inEn = p.name?.en?.toLowerCase().includes(q) || p.title?.en?.toLowerCase().includes(q);
        if (!inUz && !inRu && !inEn) return false;
      }
      return true;
    });
  }, [shopProducts, selectedCategoryFilter, productSearch]);

  const shopOrders = orders.filter(o => o.shopIds.includes(currentShop.id));
  const totalRevenue = shopOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalStoryViews = (currentShop.stories || []).reduce((sum, s) => sum + (s.views || 0), 0);

  // Subcategories of selected form category
  const currentCategoryObj = useMemo(() => {
    return categories.find(c => c.slug === formData.categorySlug) || categories[0];
  }, [categories, formData.categorySlug]);

  // Open Create Product Modal
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nameUz: '',
      nameRu: '',
      nameEn: '',
      categorySlug: 'islamic-items',
      subcategorySlug: 'prayer-mats',
      price: 170000,
      oldPrice: 200000,
      discountPercent: 15,
      stockCount: 50,
      deliveryDays: 3,
      imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
      additionalImages: '',
      descriptionUz: '',
      descriptionRu: '',
      descriptionEn: '',
      sizes: 'Universal',
      gender: 'unisex',
      colors: [
        { name_uz: "Qora", name_ru: "Черный", name_en: "Black", hex: "#111111", inStock: true },
        { name_uz: "Yashil", name_ru: "Зеленый", name_en: "Green", hex: "#16A34A", inStock: true }
      ]
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    const oldP = p.old_price && p.old_price > p.price ? p.old_price : Math.round(p.price * 1.2);
    const discPct = p.discount || (oldP > p.price ? Math.round(((oldP - p.price) / oldP) * 100) : 0);
    const pColors = p.colors && p.colors.length > 0 
      ? p.colors.map(c => ({ ...c, inStock: c.inStock !== false }))
      : [{ name_uz: "Qora", name_ru: "Черный", name_en: "Black", hex: "#111111", inStock: true }];

    setFormData({
      nameUz: p.name?.uz || p.title?.uz || '',
      nameRu: p.name?.ru || p.title?.ru || '',
      nameEn: p.name?.en || p.title?.en || '',
      categorySlug: p.category_slug || 'clothing',
      subcategorySlug: p.subcategory_slug || '',
      price: p.price,
      oldPrice: oldP,
      discountPercent: discPct,
      stockCount: p.stock_count || 10,
      deliveryDays: p.delivery_days || 3,
      imageUrl: p.image_url,
      additionalImages: (p.images || []).filter(img => img !== p.image_url).join(', '),
      descriptionUz: p.description?.uz || '',
      descriptionRu: p.description?.ru || '',
      descriptionEn: p.description?.en || '',
      sizes: (p.sizes || []).join(', ') || 'Universal',
      gender: p.gender || 'unisex',
      colors: pColors
    });
    setIsProductModalOpen(true);
  };

  // Discount & Price calculation handlers
  const handleOldPriceChange = (val: number) => {
    const validOld = Math.max(0, val);
    const pct = formData.discountPercent;
    const newPrice = pct > 0 ? Math.round(validOld * (1 - pct / 100)) : validOld;
    setFormData(prev => ({
      ...prev,
      oldPrice: validOld,
      price: newPrice
    }));
  };

  const handleDiscountPercentChange = (pct: number) => {
    const clampedPct = Math.max(0, Math.min(95, pct));
    const baseOld = formData.oldPrice > 0 ? formData.oldPrice : formData.price;
    const newPrice = clampedPct > 0 ? Math.round(baseOld * (1 - clampedPct / 100)) : baseOld;
    setFormData(prev => ({
      ...prev,
      oldPrice: baseOld,
      discountPercent: clampedPct,
      price: newPrice
    }));
  };

  const handlePriceChange = (val: number) => {
    const validPrice = Math.max(0, val);
    let newOldPrice = formData.oldPrice;
    let newDiscount = 0;

    if (newOldPrice > validPrice && newOldPrice > 0) {
      newDiscount = Math.round(((newOldPrice - validPrice) / newOldPrice) * 100);
    } else {
      newOldPrice = validPrice;
      newDiscount = 0;
    }

    setFormData(prev => ({
      ...prev,
      price: validPrice,
      oldPrice: newOldPrice,
      discountPercent: newDiscount
    }));
  };

  // Color options management
  const handleAddPopularColor = (col: ColorOption) => {
    if (formData.colors.some(c => c.hex.toLowerCase() === col.hex.toLowerCase() || c.name_uz.toLowerCase() === col.name_uz.toLowerCase())) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { ...col, inStock: true }]
    }));
  };

  const handleToggleColorStock = (index: number) => {
    setFormData(prev => {
      const updated = [...prev.colors];
      updated[index] = {
        ...updated[index],
        inStock: updated[index].inStock === false ? true : false
      };
      return { ...prev, colors: updated };
    });
  };

  const handleRemoveColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customColorName.trim()) return;
    const newCol: ColorOption = {
      name_uz: customColorName.trim(),
      name_ru: customColorName.trim(),
      name_en: customColorName.trim(),
      hex: customColorHex,
      inStock: true
    };
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, newCol]
    }));
    setCustomColorName('');
  };

  // Submit Product (Create or Update)
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameUz.trim() || !formData.imageUrl.trim() || formData.price <= 0) return;

    const discountVal = formData.oldPrice > formData.price
      ? Math.round(((formData.oldPrice - formData.price) / formData.oldPrice) * 100)
      : 0;

    const imagesArray = formData.additionalImages.trim()
      ? [formData.imageUrl, ...formData.additionalImages.split(',').map(s => s.trim()).filter(Boolean)]
      : [formData.imageUrl];

    const sizesArray = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
    const colorsArray = formData.colors.length > 0 
      ? formData.colors 
      : [{ name_uz: "Qora", name_ru: "Черный", name_en: "Black", hex: "#111111", inStock: true }];

    if (editingProduct) {
      // UPDATE
      const updated: Product = {
        ...editingProduct,
        category_slug: formData.categorySlug,
        subcategory_slug: formData.subcategorySlug,
        image_url: formData.imageUrl,
        images: imagesArray,
        price: Number(formData.price),
        old_price: Number(formData.oldPrice),
        discount: discountVal,
        stock_count: Number(formData.stockCount),
        delivery_days: Number(formData.deliveryDays),
        gender: formData.gender,
        colors: colorsArray,
        name: {
          uz: formData.nameUz,
          ru: formData.nameRu || formData.nameUz,
          en: formData.nameEn || formData.nameUz
        },
        title: {
          uz: formData.nameUz,
          ru: formData.nameRu || formData.nameUz,
          en: formData.nameEn || formData.nameUz
        },
        description: {
          uz: formData.descriptionUz || `${formData.nameUz}. Mayami platformasidagi rasmiy kafolatlangan tovar.`,
          ru: formData.descriptionRu || `${formData.nameRu || formData.nameUz}. Официальный товар с гарантией на Mayami.`,
          en: formData.descriptionEn || `${formData.nameEn || formData.nameUz}. Genuine guaranteed product on Mayami.`
        },
        sizes: sizesArray.length ? sizesArray : ['Universal']
      };

      updateProduct(updated);
      setProductSuccessMsg("Mahsulot ma'lumotlari muvaffaqiyatli yangilandi!");
    } else {
      // CREATE
      addProduct({
        category_id: formData.categorySlug === 'islamic-items' ? 4001 : formData.categorySlug === 'shoes' ? 2783 : formData.categorySlug === 'clothing' ? 2784 : 3438,
        category_slug: formData.categorySlug,
        subcategory_slug: formData.subcategorySlug,
        shopId: currentShop.id,
        image_url: formData.imageUrl,
        images: imagesArray,
        price: Number(formData.price),
        old_price: Number(formData.oldPrice),
        discount: discountVal,
        currency: 'UZS',
        rating: 5.0,
        reviews_count: 1,
        delivery_days: Number(formData.deliveryDays),
        stock_count: Number(formData.stockCount),
        gender: formData.gender,
        name: {
          uz: formData.nameUz,
          ru: formData.nameRu || formData.nameUz,
          en: formData.nameEn || formData.nameUz
        },
        title: {
          uz: formData.nameUz,
          ru: formData.nameRu || formData.nameUz,
          en: formData.nameEn || formData.nameUz
        },
        short_title: {
          uz: formData.nameUz.split(' ').slice(0, 2).join(' '),
          ru: (formData.nameRu || formData.nameUz).split(' ').slice(0, 2).join(' '),
          en: (formData.nameEn || formData.nameUz).split(' ').slice(0, 2).join(' ')
        },
        description: {
          uz: formData.descriptionUz || `${formData.nameUz}. Mayami platformasidagi rasmiy kafolatlangan tovar. Tez yetkazib berish.`,
          ru: formData.descriptionRu || `${formData.nameRu || formData.nameUz}. Официальный товар с гарантией качества на платформе Mayami.`,
          en: formData.descriptionEn || `${formData.nameEn || formData.nameUz}. Verified product on Mayami.`
        },
        sizes: sizesArray.length ? sizesArray : ['Universal'],
        colors: colorsArray
      });
      setProductSuccessMsg("Yangi mahsulot katalogga muvaffaqiyatli qo'shildi!");
    }

    setIsProductModalOpen(false);
    setTimeout(() => setProductSuccessMsg(null), 3000);
  };

  // Confirm Delete Product
  const handleDeleteProduct = () => {
    if (deletingProductId !== null) {
      deleteProduct(deletingProductId);
      setDeletingProductId(null);
      setProductSuccessMsg("Mahsulot muvaffaqiyatli o'chirildi.");
      setTimeout(() => setProductSuccessMsg(null), 3000);
    }
  };

  // Create Story Handler
  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryMedia.trim()) return;

    const parsed = parseStoryMedia(newStoryMedia.trim(), storyMediaType);

    addStoryToShop(currentShop.id, {
      mediaType: parsed.mediaType,
      mediaUrl: newStoryMedia.trim(),
      caption_uz: newStoryCaptionUz,
      caption_ru: newStoryCaptionRu,
      caption_en: newStoryCaptionEn,
      productId: newStoryProductId ? Number(newStoryProductId) : undefined
    });

    setStorySuccess(true);
    setNewStoryMedia('');
    setNewStoryCaptionUz('');
    setNewStoryCaptionRu('');
    setNewStoryCaptionEn('');
    setNewStoryProductId(undefined);
    setTimeout(() => setStorySuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Store Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentShop.avatar}
            alt={currentShop.name}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'; }}
            className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">
                {currentShop.name}
              </h2>
              {currentShop.verified && (
                <span className="px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-[10px]">
                  {t.common.verifiedShop}
                </span>
              )}
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-3 mt-1">
              <span>Login: <strong className="text-neutral-800 dark:text-neutral-200">{currentShop.username}</strong></span>
              <span>•</span>
              <span>Reyting: ★ {currentShop.rating}</span>
              <span>•</span>
              <span>Katalog: {shopProducts.length} ta mahsulot</span>
            </div>
          </div>
        </div>

        <Link
          to={`/store/${currentShop.slug}`}
          target="_blank"
          className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:text-brand-teal text-xs font-bold transition-all flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700"
        >
          <span>Do'kon sahifasini ko'rish</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Global Success Notification */}
      {productSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 border border-emerald-300 dark:border-emerald-800 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{productSuccessMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3 overflow-x-auto scrollbar-none text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-brand-teal text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{t.panels.shopStats || "Umumiy ko'rinish"}</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'products'
              ? 'bg-brand-teal text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.panels.manageProducts} ({shopProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'stories'
              ? 'bg-brand-teal text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>{t.panels.manageStories} ({currentShop.stories?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'bg-brand-teal text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.panels.manageOrders} ({shopOrders.length})</span>
        </button>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">{t.panels.totalRevenue}</span>
              <div className="text-xl sm:text-2xl font-black text-brand-teal font-mono">{formatPrice(totalRevenue)}</div>
              <span className="text-[10px] text-emerald-500 font-semibold">+18% o'tgan haftaga nisbatan</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">{t.panels.totalOrders}</span>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono">{shopOrders.length} ta</div>
              <span className="text-[10px] text-neutral-400">Buyurtmalar monitoringi</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">{t.panels.totalProducts}</span>
              <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-mono">{shopProducts.length} ta</div>
              <span className="text-[10px] text-brand-teal font-semibold">Faol katalog</span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">{t.panels.storyViews}</span>
              <div className="text-xl sm:text-2xl font-black text-amber-500 font-mono">{totalStoryViews} marta</div>
              <span className="text-[10px] text-amber-500 font-semibold">Stories auditoriyasi</span>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal text-[10px] font-bold uppercase">
                <Sparkles className="w-3 h-3" />
                <span>B2B Imtiyozlari</span>
              </div>
              <h3 className="text-lg font-bold">Yangi tovar qo'shing va Stories orqali sotuvni oshiring</h3>
              <p className="text-xs text-neutral-300">Islomiy buyumlar, kiyimlar, poyabzallar va aksessuarlarni sotuvga qo'ying.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tovar qo'shish</span>
              </button>
              <button
                onClick={() => setActiveTab('stories')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Story qo'yish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Products Management Tab (FULL CRUD) */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Category Filter, and Add Button */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Mahsulot nomi bo'yicha qidirish..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-medium"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-brand-teal cursor-pointer"
              >
                <option value="all">Barcha kategoriyalar ({shopProducts.length})</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>
                    {cat[`title_${language}` as keyof typeof cat] as string || cat.title_uz}
                  </option>
                ))}
              </select>
            </div>

            {/* Create Product Button */}
            <button
              onClick={handleOpenCreateModal}
              className="h-10 px-5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi mahsulot qo'shish</span>
            </button>
          </div>

          {/* Products Table (READ & CRUD actions) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="font-bold text-xs text-neutral-400 uppercase tracking-wider">
                Do'kon mahsulotlari ({filteredShopProducts.length} ta)
              </span>
            </div>

            {filteredShopProducts.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs space-y-3">
                <Package className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700" />
                <p>Ushbu filtr bo'yicha mahsulot topilmadi.</p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold"
                >
                  + Yangi mahsulot qo'shish
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px]">
                    <th className="pb-3">Mahsulot</th>
                    <th className="pb-3">Kategoriya</th>
                    <th className="pb-3">Narxi</th>
                    <th className="pb-3">Omborda</th>
                    <th className="pb-3">Reyting</th>
                    <th className="pb-3 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredShopProducts.map((p) => {
                    const catObj = categories.find(c => c.slug === p.category_slug);
                    const catTitle = catObj ? (catObj[`title_${language}` as keyof typeof catObj] as string || catObj.title_uz) : p.category_slug;

                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td 
                          className="py-3 flex items-center gap-3 cursor-pointer group"
                          onClick={() => {
                            setViewingProduct(p);
                            setViewingImageIdx(0);
                          }}
                          title="Shop panelida ko'rish"
                        >
                          <img 
                            src={p.image_url} 
                            alt="" 
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80'; }}
                            className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 group-hover:scale-105 transition-transform" 
                          />
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white max-w-sm truncate group-hover:text-brand-teal transition-colors">
                              {p.name?.[language] || p.title[language] || p.title.uz}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              ID: #{p.id} • {p.delivery_days} kunda yetkazish
                            </div>
                          </div>
                        </td>

                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                            {catTitle}
                          </span>
                        </td>

                        <td className="py-3">
                          <div className="font-bold text-brand-teal font-mono">
                            {formatPrice(p.price)}
                          </div>
                          {p.old_price && p.old_price > p.price && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-neutral-400 line-through">
                                {formatPrice(p.old_price)}
                              </span>
                              {p.discount > 0 && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 font-extrabold">
                                  -{p.discount}%
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stock_count > 10
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                              : p.stock_count > 0
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                          }`}>
                            {p.stock_count > 0 ? `${p.stock_count} dona` : 'Tugagan'}
                          </span>
                        </td>

                        <td className="py-3 text-neutral-500 font-semibold">
                          ★ {p.rating} ({p.reviews_count})
                        </td>

                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setViewingProduct(p);
                                setViewingImageIdx(0);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-brand-teal/10 hover:text-brand-teal text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1 font-semibold text-xs"
                              title="Shop panelidan chiqmasdan ko'rish"
                            >
                              <Eye className="w-4 h-4 text-brand-teal" />
                              <span className="hidden sm:inline">Ko'rish</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-brand-teal hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              title="Tahrirlash (Edit)"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeletingProductId(p.id)}
                              className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="O'chirish (Delete)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <Link
                              to={`/product/${p.id}`}
                              target="_blank"
                              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              title="Yangi oynada ochish (Mijoz sifatida)"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 3. Stories Studio Tab (Images & Videos) */}
      {activeTab === 'stories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Story Studio Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Yangi Hikoya (Story) yaratish
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Rasm yoki video yuklab, tovarlaringizni reklama qiling
              </p>
            </div>

            {storySuccess && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle className="w-4 h-4" />
                <span>Hikoyangiz muvaffaqiyatli joylashtirildi!</span>
              </div>
            )}

            <form onSubmit={handleCreateStory} className="space-y-4">
              {/* Media Type Toggle: Image or Video */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1.5">
                  Hikoya formati
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStoryMediaType('image')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      storyMediaType === 'image'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Rasm (Image)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStoryMediaType('video')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      storyMediaType === 'video'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-amber-500" />
                    <span>Video (MP4/WebM)</span>
                  </button>
                </div>
              </div>

              {/* Media URL Input */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                  {storyMediaType === 'video' ? 'Video URL manzili (YouTube Shorts / Video / MP4)' : 'Rasm URL manzili'}
                </label>
                <input
                  type="url"
                  required
                  value={newStoryMedia}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewStoryMedia(val);
                    const p = parseStoryMedia(val);
                    if (p.isYouTube || p.isDirectVideo) {
                      setStoryMediaType('video');
                    }
                  }}
                  placeholder="https://www.youtube.com/shorts/... yoki https://..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-mono"
                />

                {/* Quick Media Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-neutral-400 self-center">Namunalar:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStoryMediaType('image');
                      setNewStoryMedia('https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80');
                      setNewStoryCaptionUz('Haqiqiy baxmal joynamozlar va islomiy sovg\'alar to\'plami!');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-teal"
                  >
                    Joynamoz (Rasm)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStoryMediaType('image');
                      setNewStoryMedia('https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80');
                      setNewStoryCaptionUz('Elektron LED tasbehlar keldi. Maxsus narxda!');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-teal"
                  >
                    Tasbeh (Rasm)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStoryMediaType('video');
                      setNewStoryMedia('https://www.youtube.com/shorts/5kK218N2L4U');
                      setNewStoryCaptionUz('Yangi B2B liboslar kolleksiyasi video namoyishi!');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-red-600/10 text-red-600 dark:text-red-400 hover:bg-red-600/20 font-bold"
                  >
                    YouTube Shorts
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStoryMediaType('video');
                      setNewStoryMedia('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                      setNewStoryCaptionUz('Kafolatlangan sifatli mahsulotlar taqdimoti!');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-red-600/10 text-red-600 dark:text-red-400 hover:bg-red-600/20 font-bold"
                  >
                    YouTube Video
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStoryMediaType('video');
                      setNewStoryMedia('https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-neon-light-39875-large.mp4');
                      setNewStoryCaptionUz('Yangi moda kolleksiyasi to\'g\'ridan-to\'g\'ri MP4 video!');
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold"
                  >
                    MP4 Video
                  </button>
                </div>

                {/* Live Story Media Preview */}
                {newStoryMedia.trim() && (() => {
                  const previewMedia = parseStoryMedia(newStoryMedia.trim(), storyMediaType);
                  return (
                    <div className="mt-3 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                        <span>Jonli ko'rib chiqish (Preview):</span>
                        {previewMedia.isYouTube ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm">
                            <Video className="w-3 h-3" />
                            <span>YouTube ({previewMedia.youTubeId})</span>
                          </span>
                        ) : previewMedia.isDirectVideo ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold text-[10px]">
                            MP4 Video
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold text-[10px]">
                            Rasm
                          </span>
                        )}
                      </div>

                      <div className="relative aspect-[9/13] max-h-52 rounded-xl overflow-hidden bg-black mx-auto shadow-inner flex items-center justify-center">
                        {previewMedia.isYouTube ? (
                          <iframe
                            key={previewMedia.youTubeId}
                            src={previewMedia.embedUrl || ''}
                            title="Preview YouTube video"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : previewMedia.isDirectVideo ? (
                          <video src={newStoryMedia} controls className="w-full h-full object-cover" />
                        ) : (
                          <img
                            src={newStoryMedia}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'; }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Caption (Text description) */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Hikoya matni (Tavsif)
                </label>
                <textarea
                  rows={2}
                  required
                  value={newStoryCaptionUz}
                  onChange={(e) => setNewStoryCaptionUz(e.target.value)}
                  placeholder="Hikoyangiz haqida qisqacha ma'lumot..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal resize-none"
                />
              </div>

              {/* Linked Product selector */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Bog'langan mahsulot (Xarid tugmasi)
                </label>
                <select
                  value={newStoryProductId || ''}
                  onChange={(e) => setNewStoryProductId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal cursor-pointer"
                >
                  <option value="">-- Mahsulot bog'lanmagan --</option>
                  {shopProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name?.[language] || p.title[language] || p.title.uz} ({formatPrice(p.price)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Hikoyani e'lon qilish</span>
              </button>
            </form>
          </div>

          {/* Active Stories List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Faol hikoyalar ({currentShop.stories?.length || 0})
              </h3>
            </div>

            {(!currentShop.stories || currentShop.stories.length === 0) ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs space-y-2">
                <Flame className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto" />
                <p>Hozircha faol hikoyalar mavjud emas. Yangi hikoya e'lon qiling!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentShop.stories.map((st, sIdx) => {
                  const parsed = parseStoryMedia(st.mediaUrl, st.mediaType);
                  return (
                    <div
                      key={st.id}
                      className="relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] shadow-sm flex flex-col justify-between"
                    >
                      <div 
                        onClick={() => {
                          const shopIdx = shopsWithStories.findIndex(s => s.id === currentShop.id);
                          if (shopIdx !== -1) openStoryViewer(shopIdx, sIdx);
                        }}
                        className="relative aspect-[9/12] overflow-hidden bg-neutral-900 cursor-pointer group"
                      >
                        {parsed.isYouTube ? (
                          <div className="relative w-full h-full flex items-center justify-center bg-neutral-900">
                            <img 
                              src={parsed.thumbnailUrl} 
                              alt="YouTube Story" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'; }}
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 fill-white ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] text-white font-mono flex items-center gap-1">
                              <Video className="w-3 h-3 text-red-500" />
                              <span>YouTube Video</span>
                            </div>
                          </div>
                        ) : parsed.isDirectVideo ? (
                          <video 
                            src={st.mediaUrl} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            muted 
                            loop 
                            playsInline 
                            autoPlay 
                          />
                        ) : (
                          <img 
                            src={st.mediaUrl} 
                            alt="Story" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'; }}
                          />
                        )}

                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {parsed.mediaType === 'video' ? <Video className="w-3 h-3 text-amber-400" /> : <ImageIcon className="w-3 h-3 text-cyan-400" />}
                          <span>{parsed.isYouTube ? 'YouTube' : parsed.mediaType === 'video' ? 'Video' : 'Rasm'}</span>
                        </div>

                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px]">
                          <Eye className="w-3 h-3 text-brand-teal" />
                          <span>{st.views} marta</span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-2">
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium line-clamp-2">
                          {st.caption_uz}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                          <button
                            onClick={() => {
                              const shopIdx = shopsWithStories.findIndex(s => s.id === currentShop.id);
                              if (shopIdx !== -1) openStoryViewer(shopIdx, sIdx);
                            }}
                            className="text-xs text-brand-teal hover:underline flex items-center gap-1 font-bold"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Ko'rish (Play)</span>
                          </button>

                          <button
                            onClick={() => deleteStory(currentShop.id, st.id)}
                            className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>O'chirish</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Orders Management Tab */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-teal" />
              <span>Mijozlar buyurtmalari ({shopOrders.length})</span>
            </h3>
          </div>

          {shopOrders.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 text-xs">
              Ushbu do'konga tegishli yangi buyurtmalar mavjud emas.
            </div>
          ) : (
            <div className="space-y-4">
              {shopOrders.map((ord) => {
                const thisShopItems = ord.items.filter(it => it.product.shopId === currentShop.id);
                const thisShopSubtotal = thisShopItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

                return (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#171717] space-y-3"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-neutral-900 dark:text-white font-mono">
                            #{ord.id}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {ord.date}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                              : ord.status === 'shipped'
                              ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-600'
                              : ord.status === 'processing'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                          }`}>
                            {ord.status}
                          </span>
                        </div>

                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          Mijoz: <strong className="text-neutral-900 dark:text-white">{ord.customerName}</strong> ({ord.customerPhone})
                        </div>
                        <div className="text-xs text-neutral-500">
                          Manzil: {ord.region}, {ord.address}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-400">Do'kon hisobi:</div>
                          <div className="font-black text-brand-teal text-base font-mono">
                            {formatPrice(thisShopSubtotal > 0 ? thisShopSubtotal : ord.totalAmount)}
                          </div>
                        </div>

                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold focus:outline-none focus:border-brand-teal cursor-pointer"
                        >
                          <option value="pending">Kutilmoqda</option>
                          <option value="processing">Tayyorlanmoqda</option>
                          <option value="shipped">Yetkazilmoqda</option>
                          <option value="delivered">Yetkazildi</option>
                          <option value="cancelled">Bekor qilindi</option>
                        </select>
                      </div>
                    </div>

                    {/* Ordered items breakdown */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Buyurtma tarkibi ({thisShopItems.length || ord.items.length} ta mahsulot):
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(thisShopItems.length > 0 ? thisShopItems : ord.items).map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white dark:bg-[#1E1E22] border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3"
                          >
                            <img
                              src={item.product.image_url}
                              alt=""
                              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80'; }}
                              className="w-12 h-12 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                            />
                            <div className="flex-1 min-w-0 text-xs space-y-0.5">
                              <div className="font-bold text-neutral-900 dark:text-white truncate">
                                {getLocalizedProductText(item.product, 'name', language)}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                                <span>O'lcham: <strong className="text-neutral-700 dark:text-neutral-300">{item.selectedSize || 'Universal'}</strong></span>
                                {item.selectedColor && (
                                  <span className="flex items-center gap-1">
                                    <span>Rang:</span>
                                    <span
                                      className="w-3 h-3 rounded-full border border-neutral-300 dark:border-neutral-600 inline-block align-middle"
                                      style={{ backgroundColor: item.selectedColor.hex }}
                                    />
                                    <strong className="text-neutral-700 dark:text-neutral-300">
                                      {getLocalizedColorName(item.selectedColor, language)}
                                    </strong>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
                                <span>{item.quantity} dona × {formatPrice(item.product.price)}</span>
                                <span className="font-bold text-brand-teal">{formatPrice(item.product.price * item.quantity)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#171717] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-teal" />
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  {editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              {/* Product Name (Uzbek, Russian, English) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Nomi (O'zbekcha) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameUz}
                    onChange={(e) => setFormData({ ...formData, nameUz: e.target.value })}
                    placeholder="Masalan: Turkiya baxmalli joynamozi"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Nomi (Ruscha)
                  </label>
                  <input
                    type="text"
                    value={formData.nameRu}
                    onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                    placeholder="Турецкий молитвенный коврик"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Nomi (Inglizcha)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Turkish Velvet Prayer Mat"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Kategoriya *
                  </label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => {
                      const newCatSlug = e.target.value;
                      const matched = categories.find(c => c.slug === newCatSlug);
                      const firstSub = matched?.subcategories?.[0]?.slug || '';
                      setFormData({
                        ...formData,
                        categorySlug: newCatSlug,
                        subcategorySlug: firstSub
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal cursor-pointer font-semibold"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>
                        {cat[`title_${language}` as keyof typeof cat] as string || cat.title_uz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Kichik bo'lim (Subkategoriya)
                  </label>
                  <select
                    value={formData.subcategorySlug}
                    onChange={(e) => setFormData({ ...formData, subcategorySlug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal cursor-pointer"
                  >
                    {currentCategoryObj?.subcategories?.map(sub => (
                      <option key={sub.id} value={sub.slug}>
                        {sub[`title_${language}` as keyof typeof sub] as string || sub.title_uz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Narx va Chegirma boshqaruvi (Pricing & Discount Management) */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900 dark:text-white">
                    <Percent className="w-4 h-4 text-rose-500" />
                    <span>Narx va Chegirma berish (Chegirma kalkulyatori)</span>
                  </div>
                  {formData.discountPercent > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[10px] font-black animate-pulse">
                      -{formData.discountPercent}% CHEGIRMA
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                      Asl / Bozor narxi (so'm) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={formData.oldPrice}
                      onChange={(e) => handleOldPriceChange(Number(e.target.value))}
                      placeholder="Masalan: 200000"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-mono font-bold"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Saytda chizib ko'rsatiladigan narx (~~{formatPrice(formData.oldPrice)}~~)
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                      Chegirma foizi (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={95}
                      value={formData.discountPercent}
                      onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
                      placeholder="Masalan: 15"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500 font-mono font-bold text-rose-500"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      0 dan 95% gacha chegirma
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                      Sotuv narxi (so'm) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={formData.price}
                      onChange={(e) => handlePriceChange(Number(e.target.value))}
                      placeholder="Masalan: 170000"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-brand-teal text-neutral-900 dark:text-white focus:outline-none font-mono font-black text-brand-teal text-sm"
                    />
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      Mijoz to'laydigan haqiqiy narx
                    </span>
                  </div>
                </div>

                {/* Quick Discount Presets */}
                <div>
                  <div className="text-[11px] font-semibold text-neutral-500 mb-1.5 flex items-center justify-between">
                    <span>Tezkor chegirma foizlari:</span>
                    {formData.oldPrice > formData.price && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        Mijoz {formatPrice(formData.oldPrice - formData.price)} tejaydi!
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[0, 5, 10, 15, 20, 25, 30, 40, 50, 70].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleDiscountPercentChange(pct)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          formData.discountPercent === pct
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-rose-400'
                        }`}
                      >
                        {pct === 0 ? "Chegirmasiz" : `-${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Customer Preview */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Mijozga ko'rinishi:
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-neutral-900 dark:text-white font-mono">
                        {formatPrice(formData.price)}
                      </span>
                      {formData.oldPrice > formData.price && (
                        <span className="text-xs text-neutral-400 line-through font-mono">
                          {formatPrice(formData.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {formData.discountPercent > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 font-extrabold text-[10px]">
                        -{formData.discountPercent}% Chegirma
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        Tejamkorlik: {formatPrice(formData.oldPrice - formData.price)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ombordagi soni & Yetkazib berish */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Ombordagi umumiy soni (dona) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Yetkazib berish muddati (kun)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.deliveryDays}
                    onChange={(e) => setFormData({ ...formData, deliveryDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>
              </div>

              {/* Ranglar va ombordagi holati (Colors & Warehouse Availability) */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900 dark:text-white">
                    <Palette className="w-4 h-4 text-brand-teal" />
                    <span>Mahsulot ranglari va ombordagi holati</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {formData.colors.length} ta rang belgilangan
                  </span>
                </div>

                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Har bir rang yonidagi tugmani bosib uning omborda mavjud yoki tugaganligini belgilang. Agar rang <strong>"Tugagan"</strong> deb belgilansa, saytning o'zi avtomatik o'sha rangni <strong>ochroq (xira) va chizilgan</strong> qilib qo'yadi.
                </p>

                {/* Popular Color Chips to Add */}
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Ommabop ranglarni tezkor qo'shish:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_COLORS.map((col) => {
                      const isAdded = formData.colors.some(c => c.hex.toLowerCase() === col.hex.toLowerCase() || c.name_uz.toLowerCase() === col.name_uz.toLowerCase());
                      return (
                        <button
                          key={col.hex + col.name_uz}
                          type="button"
                          onClick={() => handleAddPopularColor(col)}
                          disabled={isAdded}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isAdded
                              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed opacity-50'
                              : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:border-brand-teal hover:scale-105'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-600 shadow-xs"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name_uz}</span>
                          {isAdded && <Check className="w-3 h-3 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Colors List */}
                <div className="space-y-2 pt-2 border-t border-neutral-200/80 dark:border-neutral-700/80">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Belgilangan ranglar va ombordagi holati:
                  </span>

                  {formData.colors.length === 0 ? (
                    <div className="text-xs text-neutral-400 italic py-2">
                      Hali birorta rang qo'shilmagan. Yuqoridagi tayyor ranglardan birini tanlang yoki yangi rang qo'shing.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.colors.map((col, idx) => {
                        const isOut = col.inStock === false;
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                              isOut
                                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                                : 'bg-white dark:bg-[#151518] border-neutral-200 dark:border-neutral-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-5 h-5 rounded-full border border-neutral-300 dark:border-neutral-600 relative overflow-hidden shrink-0 ${
                                  isOut ? 'opacity-40' : ''
                                }`}
                                style={{ backgroundColor: col.hex }}
                              >
                                {isOut && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-[1.5px] bg-rose-600 rotate-45 transform" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className={`font-bold text-xs truncate block ${
                                  isOut ? 'text-neutral-400 dark:text-neutral-500 line-through' : 'text-neutral-900 dark:text-white'
                                }`}>
                                  {col.name_uz}
                                </span>
                                <span className="text-[10px] font-mono text-neutral-400">
                                  {col.hex}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* In-Stock Toggle Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleColorStock(idx)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                                  isOut
                                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-200'
                                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                                }`}
                                title="Holatini o'zgartirish uchun bosing"
                              >
                                {isOut ? (
                                  <>
                                    <XCircle className="w-3 h-3 text-rose-500" />
                                    <span>Tugagan (Ochroq)</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Mavjud</span>
                                  </>
                                )}
                              </button>

                              {/* Remove Color */}
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(idx)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Rangni o'chirish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add Custom Color Mini Form */}
                <div className="pt-2 border-t border-neutral-200/80 dark:border-neutral-700/80 flex items-center gap-2">
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    title="Rangni tanlang"
                  />
                  <input
                    type="text"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    placeholder="Maxsus rang nomi (masalan: Xaki, Tillarang...)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold shrink-0 hover:opacity-90"
                  >
                    + Rang qo'shish
                  </button>
                </div>
              </div>

              {/* Image URL & Multiple images */}
              <div className="space-y-2">
                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Asosiy rasm URL manzili *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>

                {/* Quick Image Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-neutral-400">Rasm namunalari:</span>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
                      categorySlug: 'islamic-items',
                      subcategorySlug: 'prayer-mats'
                    })}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-teal"
                  >
                    Joynamoz
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80',
                      categorySlug: 'islamic-items',
                      subcategorySlug: 'tasbihs'
                    })}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-teal"
                  >
                    Tasbeh
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
                      categorySlug: 'clothing',
                      subcategorySlug: 'mens-clothing'
                    })}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-teal"
                  >
                    Kiyim
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
                      categorySlug: 'shoes',
                      subcategorySlug: 'mens-footwear'
                    })}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-teal"
                  >
                    Krossovka
                  </button>
                </div>
              </div>

              {/* Sizes & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    O'lchamlar (vergul bilan ajrating)
                  </label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="M, L, XL yoki 40, 41, 42 yoki Universal"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Jins (Gender)
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal cursor-pointer"
                  >
                    <option value="unisex">Unisex (Barchaga)</option>
                    <option value="men">Erkaklar uchun</option>
                    <option value="women">Ayollar uchun</option>
                    <option value="kids">Bolalar uchun</option>
                  </select>
                </div>
              </div>

              {/* Description (Uzbek) */}
              <div>
                <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Mahsulot tavsifi (O'zbekcha)
                </label>
                <textarea
                  rows={2}
                  value={formData.descriptionUz}
                  onChange={(e) => setFormData({ ...formData, descriptionUz: e.target.value })}
                  placeholder="Mahsulotning xususiyatlari, materiali va afzalliklari..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold shadow-md"
                >
                  {editingProduct ? "O'zgarishlarni saqlash" : "Mahsulotni qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-PANEL PRODUCT PREVIEW MODAL (Sotuvchi panelidan chiqmasdan to'liq ko'rish) */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#151518] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-h-[92vh] overflow-y-auto space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand-teal" />
                <div>
                  <h3 className="text-base font-black text-neutral-900 dark:text-white">
                    Mahsulot ma'lumotlari (Shop Paneli ichida)
                  </h3>
                  <div className="text-[11px] text-neutral-400">
                    ID: #{viewingProduct.id} • Do'kon: {currentShop.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/product/${viewingProduct.id}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-brand-teal hover:border-brand-teal transition-colors flex items-center gap-1.5"
                  title="Alohida oynada xaridor ko'rinishida ochish"
                >
                  <span>Mijoz sahifasi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setViewingProduct(null)}
                  className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Image Gallery */}
              <div className="space-y-3">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <img
                    src={(viewingProduct.images && viewingProduct.images[viewingImageIdx]) || viewingProduct.image_url}
                    alt=""
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'; }}
                    className="w-full h-full object-cover"
                  />
                  {viewingProduct.discount > 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-500 text-white font-black text-xs shadow-md">
                      -{viewingProduct.discount}% Chegirma
                    </div>
                  )}
                </div>

                {viewingProduct.images && viewingProduct.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {viewingProduct.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setViewingImageIdx(i)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          viewingImageIdx === i ? 'border-brand-teal scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Details & Pricing */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-brand-teal/10 text-brand-teal font-extrabold text-[10px] uppercase">
                      {viewingProduct.category_slug}
                    </span>
                    {viewingProduct.subcategory_slug && (
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold text-[10px]">
                        {viewingProduct.subcategory_slug}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white leading-tight">
                    {getLocalizedProductText(viewingProduct, 'name', language)}
                  </h2>
                </div>

                {/* Price Box */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Narxi va Chegirma:
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-black text-brand-teal font-mono">
                      {formatPrice(viewingProduct.price)}
                    </span>
                    {viewingProduct.old_price && viewingProduct.old_price > viewingProduct.price && (
                      <span className="text-sm text-neutral-400 line-through font-mono">
                        {formatPrice(viewingProduct.old_price)}
                      </span>
                    )}
                    {viewingProduct.discount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-black text-xs">
                        -{viewingProduct.discount}%
                      </span>
                    )}
                  </div>
                  {viewingProduct.old_price && viewingProduct.old_price > viewingProduct.price && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      Mijoz uchun tejamkorlik: {formatPrice(viewingProduct.old_price - viewingProduct.price)}
                    </div>
                  )}
                </div>

                {/* Stock & Delivery */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Omborda:</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-xs">
                      {viewingProduct.stock_count > 0 ? `${viewingProduct.stock_count} dona` : 'Tugagan'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400 block">Yetkazib berish:</span>
                    <span className="font-bold text-neutral-900 dark:text-white text-xs">
                      {viewingProduct.delivery_days} kun ichida
                    </span>
                  </div>
                </div>

                {/* Colors List with stock state */}
                <div>
                  <div className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Ranglar va ularning ombordagi holati:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.colors && viewingProduct.colors.length > 0 ? (
                      viewingProduct.colors.map((c, idx) => {
                        const isOut = c.inStock === false;
                        return (
                          <div
                            key={idx}
                            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                              isOut
                                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 opacity-50'
                                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-600 relative overflow-hidden inline-block ${
                                isOut ? 'opacity-40' : ''
                              }`}
                              style={{ backgroundColor: c.hex }}
                            >
                              {isOut && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-full h-[1.5px] bg-rose-600 rotate-45 transform" />
                                </div>
                              )}
                            </span>
                            <span className="font-bold text-neutral-900 dark:text-white">
                              {c[`name_${language}` as keyof typeof c] || c.name_uz}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isOut ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                            }`}>
                              {isOut ? "Tugagan (Ochroq)" : "Mavjud"}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-neutral-400">Standart rang</span>
                    )}
                  </div>
                </div>

                {/* Sizes */}
                {viewingProduct.sizes && viewingProduct.sizes.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Mavjud o'lchamlar:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingProduct.sizes.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <div className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Mahsulot tavsifi:
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
                    {viewingProduct.description?.[language] || viewingProduct.description?.uz || "Tavsif mavjud emas"}
                  </p>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => {
                      const p = viewingProduct;
                      setViewingProduct(null);
                      handleOpenEditModal(p);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Tahrirlash</span>
                  </button>

                  <button
                    onClick={() => setViewingProduct(null)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingProductId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#171717] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-black text-neutral-900 dark:text-white">
                Mahsulotni o'chirishni tasdiqlaysizmi?
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Ushbu amalni ortga qaytarib bo'lmaydi. Mahsulot katalogdan butunlay olib tashlanadi.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="w-1/2 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeleteProduct}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
