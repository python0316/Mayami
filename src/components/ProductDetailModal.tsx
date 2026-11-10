import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Heart, 
  Star, 
  ShoppingBag, 
  Zap, 
  Truck, 
  ShieldCheck, 
  Check, 
  Minus, 
  Plus, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ProductReviewsSection } from './ProductReviewsSection';
import { getLocalizedProductText, getLocalizedColorName } from '../utils/translator';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    language, 
    formatPrice,
    t, 
    addToCart, 
    isInWishlist, 
    toggleWishlist, 
    shops, 
    openStoryViewer,
    setIsCheckoutOpen,
    setIsAuthModalOpen,
    currentUser
  } = useApp();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setSelectedImageIndex(0);
      setSelectedSize(selectedProduct.sizes?.[0] || '');
      const firstInStock = selectedProduct.colors?.find(c => c.inStock !== false) || selectedProduct.colors?.[0] || null;
      setSelectedColor(firstInStock);
      setQuantity(1);
    }
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  // Set defaults if not selected yet
  const currentSize = selectedSize || selectedProduct.sizes?.[0] || 'Standard';
  const currentColor = selectedColor || selectedProduct.colors?.[0];
  const rawImages = selectedProduct.images && selectedProduct.images.length > 0 
    ? selectedProduct.images 
    : [selectedProduct.image_url];
  const colorImages = (selectedProduct.colors || []).map(c => c.image_url).filter(Boolean) as string[];
  const images = Array.from(new Set([...rawImages, ...colorImages]));
  
  const shop = shops.find(s => s.id === selectedProduct.shopId) || shops[0];
  const inWishlist = isInWishlist(selectedProduct.id);

  const productName = getLocalizedProductText(selectedProduct, 'name', language);
  const productTitle = getLocalizedProductText(selectedProduct, 'title', language);
  const description = getLocalizedProductText(selectedProduct, 'description', language);
  const activeImage = images[selectedImageIndex] || currentColor?.image_url || selectedProduct.image_url;

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, currentSize, currentColor, activeImage);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity, currentSize, currentColor, activeImage);
    setSelectedProduct(null);
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 pb-[calc(70px+env(safe-area-inset-bottom,6px))] md:pb-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 backdrop-blur-xs transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-8">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#1B1B1F] border border-neutral-200 dark:border-neutral-800">
              <img
                src={images[selectedImageIndex] || selectedProduct.image_url}
                alt={productName}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              {selectedProduct.discount > 0 && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-500 text-white font-extrabold text-xs shadow-md">
                  -{selectedProduct.discount}%
                </div>
              )}
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm shadow hover:scale-110 active:scale-95 transition-all"
              >
                <Heart
                  className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : 'text-neutral-500'}`}
                />
              </button>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx 
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

          {/* Right: Product Details & Purchase Form */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Rating and Stock */}
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                    <span>{selectedProduct.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{selectedProduct.reviews_count} {t.common.reviews}</span>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.common.inStock} ({selectedProduct.stock_count} dona)</span>
                </div>
              </div>

              {/* Distinct Product Title / Name Heading */}
              <div className="space-y-1.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-teal px-2 py-0.5 rounded bg-brand-teal/10">
                    {t.common.productName}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                  {productName}
                </h2>
                {productTitle && productTitle !== productName && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug">
                    {productTitle}
                  </p>
                )}
              </div>

              {/* Price with Currency support */}
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                  {formatPrice(selectedProduct.price)}
                </span>
                {selectedProduct.old_price > selectedProduct.price && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(selectedProduct.old_price)}
                  </span>
                )}
              </div>

              {/* Shop / B2B Vendor Box */}
              {shop && (
                <div className="mt-3 p-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <Link
                    to={`/store/${shop.slug}`}
                    onClick={() => setSelectedProduct(null)}
                    className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={shop.avatar}
                      alt={shop.name}
                      className="w-10 h-10 rounded-full object-cover border border-brand-teal/40"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {shop.name}
                        </span>
                        {shop.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {shop.rating} ★ • {shop.responseTime} javob berish vaqti
                      </div>
                    </div>
                  </Link>

                  <Link
                    to={`/store/${shop.slug}`}
                    onClick={() => setSelectedProduct(null)}
                    className="text-[11px] font-bold text-brand-teal hover:underline flex items-center gap-0.5"
                  >
                    <span>Do'kon</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Color Selector */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
                    <span>
                      {t.common.colors}: <span className="font-bold text-neutral-900 dark:text-white">{getLocalizedColorName(currentColor, language)}</span>
                    </span>
                    {currentColor?.inStock === false ? (
                      <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                        Omborda tugagan
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        Mavjud
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedProduct.colors.map((c, i) => {
                      const isOutOfStock = c.inStock === false;
                      const isSelected = currentColor?.name_uz === c.name_uz;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedColor(c);
                            const targetImg = c.image_url || images[i % images.length];
                            if (targetImg) {
                              const foundIdx = images.indexOf(targetImg);
                              if (foundIdx !== -1) {
                                setSelectedImageIndex(foundIdx);
                              } else {
                                setSelectedImageIndex(0);
                              }
                            }
                          }}
                          className={`relative w-8 h-8 rounded-full border-2 transition-all p-0.5 flex items-center justify-center ${
                            isSelected 
                              ? 'border-brand-teal scale-110 shadow-md ring-2 ring-brand-teal/20' 
                              : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400'
                          } ${isOutOfStock ? 'opacity-35 cursor-pointer' : ''}`}
                          title={`${getLocalizedColorName(c, language)} ${isOutOfStock ? "(Omborda tugagan)" : "(Mavjud)"}`}
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
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {t.common.sizes}: <span className="font-bold text-brand-teal">{currentSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          currentSize === sz
                            ? 'bg-brand-teal text-white border-brand-teal shadow-sm'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-3 flex items-center space-x-3">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Miqdor:
                </span>
                <div className="flex items-center rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                    isAdded ? 'bg-emerald-600 text-white' : 'bg-brand-teal text-white hover:bg-brand-teal-hover'
                  }`}
                >
                  {isAdded ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                  <span>{isAdded ? t.common.addedToCart : t.common.addToCart}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-brand-dark dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>{t.common.buyNow}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-brand-teal" />
                  {t.common.fastDelivery}
                </span>
                <Link
                  to={`/product/${selectedProduct.id}`}
                  onClick={() => setSelectedProduct(null)}
                  className="text-brand-teal font-semibold hover:underline flex items-center gap-0.5"
                >
                  <span>Batafsil sahifa</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tabs: Description, Characteristics, Reviews */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-6 sm:px-8 py-4 bg-neutral-50/50 dark:bg-[#101014]">
          <div className="flex space-x-6 border-b border-neutral-200 dark:border-neutral-800 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === 'desc' 
                  ? 'border-brand-teal text-brand-teal' 
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.common.description}
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === 'specs' 
                  ? 'border-brand-teal text-brand-teal' 
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.common.characteristics}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 transition-colors border-b-2 ${
                activeTab === 'reviews' 
                  ? 'border-brand-teal text-brand-teal' 
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.common.reviews} ({selectedProduct.reviews_count})
            </button>
          </div>

          <div className="py-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {activeTab === 'desc' && (
              <p>{description}</p>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <span className="text-neutral-500">Mahsulot nomi:</span>
                <span className="font-semibold">{productName}</span>
                <span className="text-neutral-500">Kategoriya:</span>
                <span className="font-semibold">{selectedProduct.category_slug}</span>
                <span className="text-neutral-500">Mavsum:</span>
                <span className="font-semibold">2026 Yangi To'plam</span>
                <span className="text-neutral-500">Yetkazib berish:</span>
                <span className="font-semibold">{selectedProduct.delivery_days} kun ichida</span>
                <span className="text-neutral-500">Kafolat:</span>
                <span className="font-semibold">100% Original mahsulot</span>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ProductReviewsSection product={selectedProduct} compact />
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
