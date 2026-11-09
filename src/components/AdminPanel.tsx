import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Store, 
  Flame, 
  Package, 
  CheckCircle, 
  Trash2, 
  ExternalLink,
  Ban,
  Check,
  Eye,
  EyeOff,
  Layers,
  Star,
  Plus,
  Pencil,
  X,
  AlertTriangle,
  Search
} from 'lucide-react';
import { Product } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    shops, 
    products, 
    categories,
    toggleShopVerification, 
    toggleShopStatus,
    deleteStory, 
    addProduct,
    updateProduct,
    deleteProduct, 
    formatPrice,
    language, 
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'shops' | 'categories' | 'stories' | 'products'>('shops');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [showPasswordIds, setShowPasswordIds] = useState<Record<string, boolean>>({});

  // Product CRUD states in Admin
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nameUz: '',
    nameRu: '',
    nameEn: '',
    shopId: 'shop_1',
    categorySlug: 'islamic-items',
    subcategorySlug: 'prayer-mats',
    price: 150000,
    oldPrice: 180000,
    stockCount: 50,
    deliveryDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
    descriptionUz: '',
    sizes: 'Universal'
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nameUz: '',
      nameRu: '',
      nameEn: '',
      shopId: shops[0]?.id || 'shop_1',
      categorySlug: 'islamic-items',
      subcategorySlug: 'prayer-mats',
      price: 150000,
      oldPrice: 180000,
      stockCount: 50,
      deliveryDays: 3,
      imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
      descriptionUz: '',
      sizes: 'Universal'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      nameUz: p.name?.uz || p.title?.uz || '',
      nameRu: p.name?.ru || p.title?.ru || '',
      nameEn: p.name?.en || p.title?.en || '',
      shopId: p.shopId || shops[0]?.id || 'shop_1',
      categorySlug: p.category_slug || 'clothing',
      subcategorySlug: p.subcategory_slug || '',
      price: p.price,
      oldPrice: p.old_price || Math.round(p.price * 1.2),
      stockCount: p.stock_count || 10,
      deliveryDays: p.delivery_days || 3,
      imageUrl: p.image_url,
      descriptionUz: p.description?.uz || '',
      sizes: (p.sizes || []).join(', ') || 'Universal'
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameUz.trim() || !formData.imageUrl.trim() || formData.price <= 0) return;

    const discountVal = formData.oldPrice > formData.price
      ? Math.round(((formData.oldPrice - formData.price) / formData.oldPrice) * 100)
      : 0;

    const sizesArray = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        shopId: formData.shopId,
        category_slug: formData.categorySlug,
        subcategory_slug: formData.subcategorySlug,
        image_url: formData.imageUrl,
        price: Number(formData.price),
        old_price: Number(formData.oldPrice),
        discount: discountVal,
        stock_count: Number(formData.stockCount),
        delivery_days: Number(formData.deliveryDays),
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
        sizes: sizesArray.length ? sizesArray : ['Universal']
      });
      setAdminSuccessMsg("Mahsulot ma'lumotlari yangilandi!");
    } else {
      addProduct({
        category_id: formData.categorySlug === 'islamic-items' ? 4001 : 2784,
        category_slug: formData.categorySlug,
        subcategory_slug: formData.subcategorySlug,
        shopId: formData.shopId,
        image_url: formData.imageUrl,
        images: [formData.imageUrl],
        price: Number(formData.price),
        old_price: Number(formData.oldPrice),
        discount: discountVal,
        currency: 'UZS',
        rating: 5.0,
        reviews_count: 1,
        delivery_days: Number(formData.deliveryDays),
        stock_count: Number(formData.stockCount),
        gender: 'unisex',
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
          uz: formData.descriptionUz || `${formData.nameUz}. Mayami platformasidagi rasmiy kafolatlangan tovar.`,
          ru: `${formData.nameRu || formData.nameUz}. Официальный товар на платформе Mayami.`,
          en: `${formData.nameEn || formData.nameUz}. Verified product on Mayami.`
        },
        sizes: sizesArray.length ? sizesArray : ['Universal'],
        colors: [
          { name_uz: "Standart", name_ru: "Стандарт", name_en: "Standard", hex: "#111111" }
        ]
      });
      setAdminSuccessMsg("Yangi mahsulot admin tomonidan qo'shildi!");
    }

    setIsProductModalOpen(false);
    setTimeout(() => setAdminSuccessMsg(null), 3000);
  };

  const handleDeleteProduct = () => {
    if (deletingProductId !== null) {
      deleteProduct(deletingProductId);
      setDeletingProductId(null);
      setAdminSuccessMsg("Mahsulot o'chirildi.");
      setTimeout(() => setAdminSuccessMsg(null), 3000);
    }
  };

  const togglePasswordVisibility = (shopId: string) => {
    setShowPasswordIds(prev => ({
      ...prev,
      [shopId]: !prev[shopId]
    }));
  };

  const allStories = shops.flatMap(s => 
    (s.stories || []).map(st => ({ ...st, shop: s }))
  );

  const filteredShops = shops.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Admin Header & Stats */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white shadow-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-black">{t.panels.adminTitle}</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Mayami platformasini boshqarish, yangi B2B do'konlar ochish, login/parollar berish va hikoyalarni nazorat qilish markazi.
          </p>
        </div>

        {/* KPI Counter badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white/10 text-center">
            <div className="text-base font-extrabold text-brand-teal">{shops.length}</div>
            <div className="text-[10px] text-neutral-400 uppercase">Do'konlar</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/10 text-center">
            <div className="text-base font-extrabold text-amber-400">{allStories.length}</div>
            <div className="text-[10px] text-neutral-400 uppercase">Stories</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/10 text-center">
            <div className="text-base font-extrabold text-white">{products.length}</div>
            <div className="text-[10px] text-neutral-400 uppercase">Mahsulotlar</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-neutral-200 dark:border-neutral-800 pb-3 text-xs font-bold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('shops')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'shops'
              ? 'bg-[#020106] dark:bg-white text-white dark:text-neutral-900 shadow'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{t.panels.shopsManagement} ({shops.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-[#020106] dark:bg-white text-white dark:text-neutral-900 shadow'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4 text-brand-teal" />
          <span>Kategoriyalar ({categories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'stories'
              ? 'bg-brand-teal text-white shadow'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-300" />
          <span>{t.panels.storiesModeration} ({allStories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-[#020106] dark:bg-white text-white dark:text-neutral-900 shadow'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t.panels.allProductsAdmin} ({products.length})</span>
        </button>
      </div>

      {/* 1. Shops Management Tab */}
      {activeTab === 'shops' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              B2B Do'konlar va Sotuvchilar Akkountlari
            </h3>
            <input
              type="text"
              placeholder="Do'kon yoki login qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white border border-transparent focus:border-brand-teal focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px]">
                  <th className="pb-3">Do'kon</th>
                  <th className="pb-3">Kategoriyalar</th>
                  <th className="pb-3">Turi / Reyting</th>
                  <th className="pb-3">Sotuvchi Logini</th>
                  <th className="pb-3">Paroli</th>
                  <th className="pb-3">Stories</th>
                  <th className="pb-3">Holati</th>
                  <th className="pb-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 flex items-center gap-3">
                      <img 
                        src={shop.avatar} 
                        alt="" 
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'; }}
                        className="w-10 h-10 rounded-full object-cover" 
                      />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-neutral-900 dark:text-white">
                          <span>{shop.name}</span>
                          {shop.verified && (
                            <CheckCircle className="w-3.5 h-3.5 text-brand-teal fill-brand-teal/20" />
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400">{shop.phone}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1 max-w-[130px]">
                        {shop.category_slugs?.map(cat => (
                          <span key={cat} className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                        {shop.sellerType === 'official_retailer' ? 'Rasmiy do\'kon' : 'Biznes'}
                      </div>
                      <div className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{shop.rating}</span>
                        <span className="text-neutral-400 font-normal">({shop.reviewsCount})</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-neutral-800 dark:text-neutral-200">
                      {shop.username}
                    </td>
                    <td className="py-3 font-mono text-neutral-500">
                      <div className="flex items-center gap-2">
                        <span>
                          {showPasswordIds[shop.id] ? shop.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(shop.id)}
                          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                          title={showPasswordIds[shop.id] ? "Yashirish" : "Ko'rish"}
                        >
                          {showPasswordIds[shop.id] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-amber-500 font-bold">{shop.stories?.length || 0} ta</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        shop.status === 'active' 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' 
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                      }`}>
                        {shop.status === 'active' ? 'Faol' : 'To‘xtatilgan'}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <Link
                        to={`/store/${shop.slug}`}
                        className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold text-brand-teal hover:bg-neutral-200 inline-flex items-center gap-1"
                      >
                        <span>Sahifasi</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => toggleShopVerification(shop.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          shop.verified
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                            : 'bg-brand-teal text-white'
                        }`}
                      >
                        {shop.verified ? 'Verifikatsiyani olish' : 'Verifikatsiya berish'}
                      </button>
                      <button
                        onClick={() => toggleShopStatus(shop.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          shop.status === 'active'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                        }`}
                      >
                        {shop.status === 'active' ? 'To‘xtatish' : 'Faollashtirish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Categories Moderation Tab */}
      {activeTab === 'categories' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Platformadagi asosiy tovar kategoriyalari ({categories.length} ta)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Kategoriyalar va ulardagi mahsulotlar soni
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const catProds = products.filter(p => p.category_slug === cat.slug);
              return (
                <div 
                  key={cat.id}
                  className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#19191D] border border-neutral-200 dark:border-neutral-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={cat.image} 
                        alt="" 
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80'; }}
                        className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                          {cat[`title_${language}` as keyof typeof cat] as string || cat.title_uz}
                        </h4>
                        <div className="text-[11px] text-brand-teal font-semibold">
                          Slug: /{cat.slug} • {catProds.length} ta mahsulot
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/category/${cat.slug}`}
                      className="p-2 rounded-xl bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-brand-teal transition-colors"
                      title="Kategoriyani ko'rish"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5">
                      Subkategoriyalar:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subcategories?.map(sub => (
                        <span key={sub.id} className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 font-medium border border-neutral-200 dark:border-neutral-700">
                          {sub[`title_${language}` as keyof typeof sub] as string || sub.title_uz}
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

      {/* 3. Stories Moderation Tab */}
      {activeTab === 'stories' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
            Barcha faol hikoyalar (Stories) moderatsiyasi
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allStories.map((st) => (
              <div
                key={st.id}
                className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#18181C] flex flex-col justify-between"
              >
                <div className="relative aspect-[9/12] overflow-hidden bg-black">
                  <img src={st.mediaUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px]">
                    <img src={st.shop.avatar} className="w-3.5 h-3.5 rounded-full" alt="" />
                    <span>{st.shop.name}</span>
                  </div>
                </div>

                <div className="p-2.5 space-y-2">
                  <p className="text-[11px] text-neutral-700 dark:text-neutral-300 line-clamp-2">
                    {st.caption_uz}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-400">{st.views} ko'rilgan</span>
                    <button
                      onClick={() => deleteStory(st.shop.id, st.id)}
                      className="p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg text-xs"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Products Moderation Tab */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Platforma mahsulotlari ({products.length} ta)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Barcha sotuvchilar va do'konlarning tovarlari monitoringi va boshqaruvi
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yangi mahsulot qo'shish</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold pt-1">
            <button
              onClick={() => setSelectedCategoryFilter(null)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                selectedCategoryFilter === null
                  ? 'bg-[#020106] dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              Barchasi ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.category_slug === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.slug)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    selectedCategoryFilter === cat.slug
                      ? 'bg-brand-teal text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                  }`}
                >
                  {cat[`title_${language}` as keyof typeof cat] as string || cat.title_uz} ({count})
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px]">
                  <th className="pb-3">Mahsulot</th>
                  <th className="pb-3">Kategoriya</th>
                  <th className="pb-3">Narxi</th>
                  <th className="pb-3">Do'kon</th>
                  <th className="pb-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {(selectedCategoryFilter ? products.filter(p => p.category_slug === selectedCategoryFilter) : products).slice(0, 50).map((p) => {
                  const shop = shops.find(s => s.id === p.shopId);
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="py-2.5 flex items-center gap-3">
                        <img 
                          src={p.image_url} 
                          alt="" 
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80'; }}
                          className="w-9 h-9 rounded-lg object-cover" 
                        />
                        <span className="font-semibold text-neutral-900 dark:text-white max-w-sm truncate">
                          {p.name?.[language] || p.title[language] || p.title.uz}
                        </span>
                      </td>
                      <td className="py-2.5 text-neutral-500 capitalize">{p.category_slug}</td>
                      <td className="py-2.5 font-bold text-brand-teal">
                        {formatPrice(p.price)}
                      </td>
                      <td className="py-2.5 text-neutral-500 font-medium">{shop?.name || p.shopId}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-brand-teal hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                            title="Tahrirlash"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#171717] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-teal" />
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  {editingProduct ? "Admin: Mahsulotni tahrirlash" : "Admin: Yangi mahsulot qo'shish"}
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
              <div>
                <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Mahsulot nomi (O'zbekcha) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameUz}
                  onChange={(e) => setFormData({ ...formData, nameUz: e.target.value })}
                  placeholder="Mahsulot nomi"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Do'kon (Sotuvchi)
                  </label>
                  <select
                    value={formData.shopId}
                    onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal cursor-pointer font-semibold"
                  >
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal cursor-pointer font-semibold"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>
                        {cat[`title_${language}` as keyof typeof cat] as string || cat.title_uz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Narxi (so'm) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Ombordagi soni
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Rasm URL manzili *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 font-bold text-neutral-600 dark:text-neutral-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-bold shadow-md"
                >
                  {editingProduct ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation */}
      {deletingProductId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#171717] rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-black text-neutral-900 dark:text-white">
                Mahsulotni butunlay o'chirish
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Ushbu tovar platforma bazasidan o'chiriladi.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="w-1/2 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeleteProduct}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
