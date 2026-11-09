import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  Star, 
  ShoppingBag, 
  Zap, 
  Truck, 
  ShieldCheck, 
  Check, 
  Minus, 
  Plus, 
  Store, 
  ArrowLeft,
  Share2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { ProductReviewsSection } from '../components/ProductReviewsSection';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    products, 
    shops, 
    categories, 
    formatPrice, 
    language, 
    addToCart, 
    isInWishlist, 
    toggleWishlist, 
    setIsCheckoutOpen, 
    setIsAuthModalOpen,
    currentUser,
    t 
  } = useApp();

  const product = products.find(p => p.id === Number(id)) || products[0];
  const shop = shops.find(s => s.id === product.shopId) || shops[0];
  const category = categories.find(c => c.slug === product.category_slug);

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Standard');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'shop'>('desc');
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setSelectedImg(0);
    setSelectedSize(product.sizes?.[0] || 'Standard');
    const firstInStock = product.colors?.find(c => c.inStock !== false) || product.colors?.[0];
    setSelectedColor(firstInStock);
    setQuantity(1);
  }, [product.id]);

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const inWishlist = isInWishlist(product.id);

  const productName = product.name?.[language] || product.short_title?.[language] || product.title[language] || product.slug;
  const productTitle = product.title[language] || '';
  const description = product.description[language] || product.description.uz;
  const categoryTitle = category ? (category[`title_${language}` as keyof typeof category] as string || category.title_uz) : product.category_slug;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-500 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link to="/" className="hover:text-brand-teal font-medium">Bosh sahifa</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <Link to={`/category/${product.category_slug}`} className="hover:text-brand-teal font-medium capitalize">
          {categoryTitle}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-900 dark:text-white font-bold truncate max-w-xs sm:max-w-md">
          {productName}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Images Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-100 dark:bg-[#1B1B1F] border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <img
              src={images[selectedImg] || product.image_url}
              alt={productName}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-rose-500 text-white font-black text-xs shadow-md">
                -{product.discount}%
              </div>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm shadow hover:scale-110 active:scale-95 transition-all"
            >
              <Heart
                className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : 'text-neutral-500'}`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImg === idx 
                      ? 'border-brand-teal shadow-md scale-105' 
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Rating, Reviews & Article ID */}
          <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                <span>{product.rating}</span>
              </div>
              <span>•</span>
              <span className="hover:text-brand-teal cursor-pointer">
                {product.reviews_count} {t.common.reviews}
              </span>
            </div>
            <div className="text-neutral-400">
              Artikul: <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300">#{product.id}</span>
            </div>
          </div>

          {/* Explicit Prominent Product Title Heading */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-teal px-2.5 py-0.5 rounded-md bg-brand-teal/10">
                {t.common.productName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white leading-tight">
              {productName}
            </h1>
            {productTitle && productTitle !== productName && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {productTitle}
              </p>
            )}
          </div>

          {/* Price with Currency support */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151518] border border-neutral-200 dark:border-neutral-800/80 flex items-baseline gap-4">
            <span className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.old_price > product.price && (
              <span className="text-base text-neutral-400 line-through">
                {formatPrice(product.old_price)}
              </span>
            )}
            {product.discount > 0 && (
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 font-extrabold text-xs">
                Chegirma -{product.discount}%
              </span>
            )}
          </div>

          {/* Shop / Vendor card */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#18181C] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <img
                src={shop.avatar}
                alt={shop.name}
                className="w-12 h-12 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {shop.name}
                  </span>
                  {shop.verified && (
                    <ShieldCheck className="w-4 h-4 text-brand-teal" />
                  )}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {shop.rating} ★ • {shop.responseTime} javob berish vaqti
                </div>
              </div>
            </div>

            <Link
              to={`/store/${shop.slug}`}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-xs font-bold text-brand-teal border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 flex items-center gap-1 shadow-sm transition-all"
            >
              <span>{t.common.visitStore}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center justify-between">
                <span>
                  {t.common.colors}: <span className="font-bold text-neutral-900 dark:text-white">{selectedColor?.[`name_${language}` as keyof typeof selectedColor] || selectedColor?.name_uz}</span>
                </span>
                {selectedColor?.inStock === false ? (
                  <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full">
                    Omborda tugagan
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                    Mavjud
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2.5">
                {product.colors.map((c, i) => {
                  const isOutOfStock = c.inStock === false;
                  const isSelected = selectedColor?.name_uz === c.name_uz;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedColor(c);
                        if (c.image_url) {
                          const foundIdx = images.indexOf(c.image_url);
                          if (foundIdx !== -1) setSelectedImg(foundIdx);
                        }
                      }}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all p-0.5 flex items-center justify-center ${
                        isSelected 
                          ? 'border-brand-teal scale-110 shadow-md ring-2 ring-brand-teal/20' 
                          : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400'
                      } ${isOutOfStock ? 'opacity-35 cursor-pointer' : ''}`}
                      title={`${c[`name_${language}` as keyof typeof c] || c.name_uz} ${isOutOfStock ? "(Omborda tugagan)" : "(Mavjud)"}`}
                    >
                      <div 
                        className="w-full h-full rounded-full relative overflow-hidden" 
                        style={{ backgroundColor: c.hex }} 
                      >
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[1.5px] bg-rose-600 rotate-45 transform shadow-xs" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                {t.common.sizes}: <span className="font-bold text-brand-teal">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedSize === sz
                        ? 'bg-brand-teal text-white border-brand-teal shadow-md'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Buttons */}
          <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Miqdor:
              </span>
              <div className="flex items-center rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-l-xl transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-r-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>{t.common.inStock} ({product.stock_count} dona)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAddToCart}
                className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                  isAdded ? 'bg-emerald-600 text-white' : 'bg-brand-teal text-white hover:bg-brand-teal-hover'
                }`}
              >
                {isAdded ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                <span>{isAdded ? t.common.addedToCart : t.common.addToCart}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl font-bold text-sm bg-brand-dark dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>{t.common.buyNow}</span>
              </button>
            </div>

            {/* Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-[#151518] text-xs text-neutral-600 dark:text-neutral-300">
                <Truck className="w-4 h-4 text-brand-teal" />
                <span>{t.common.fastDelivery}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-[#151518] text-xs text-neutral-600 dark:text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{t.common.genuineProduct}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Characteristics, Reviews, Seller Info */}
      <div className="mt-12 rounded-3xl bg-neutral-50 dark:bg-[#141417] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6">
        <div className="flex space-x-6 border-b border-neutral-200 dark:border-neutral-800 pb-3 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'desc' 
                ? 'border-brand-teal text-brand-teal' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {t.common.description}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'specs' 
                ? 'border-brand-teal text-brand-teal' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {t.common.characteristics}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'reviews' 
                ? 'border-brand-teal text-brand-teal' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {t.common.reviews} ({product.reviews_count})
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`pb-2 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'shop' 
                ? 'border-brand-teal text-brand-teal' 
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {t.common.sellerInfo}
          </button>
        </div>

        <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {activeTab === 'desc' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                {productName} — To'liq tavsif
              </h3>
              <p>{description}</p>
              <p>
                Mayami do'konidagi har bir mahsulot sifat standartlariga muvofiq qat'iy tekshiruvdan o'tkazilgan. Ishlab chiqaruvchi kafolati mavjud.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="p-3 rounded-xl bg-white dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800 flex justify-between">
                <span className="text-neutral-500">Mahsulot nomi:</span>
                <span className="font-bold">{productName}</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800 flex justify-between">
                <span className="text-neutral-500">Kategoriya:</span>
                <span className="font-bold capitalize">{product.category_slug}</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800 flex justify-between">
                <span className="text-neutral-500">Mavsum:</span>
                <span className="font-bold">2026 Yangi kolleksiya</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800 flex justify-between">
                <span className="text-neutral-500">Yetkazib berish:</span>
                <span className="font-bold">{product.delivery_days} kun</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ProductReviewsSection product={product} />
          )}

          {activeTab === 'shop' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center space-x-4">
                <img src={shop.avatar} className="w-14 h-14 rounded-full object-cover" alt="" />
                <div>
                  <h4 className="font-bold text-base text-neutral-900 dark:text-white">{shop.name}</h4>
                  <p className="text-xs text-neutral-500">{shop.address} • {shop.phone}</p>
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                {shop[`description_${language}` as keyof typeof shop] as string || shop.description_uz}
              </p>
              <Link
                to={`/store/${shop.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all"
              >
                <span>{t.common.visitStore}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
