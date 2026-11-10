import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { getLocalizedProductText } from '../utils/translator';
import { Heart, Star, ShoppingBag, Check, Truck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const DEFAULT_FALLBACK_IMAGES: Record<string, string> = {
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  clothing: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
  accessories: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80',
  'beauty-and-personal-care': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { 
    language, 
    t, 
    formatPrice,
    isInWishlist, 
    toggleWishlist, 
    addToCart, 
    setSelectedProduct 
  } = useApp();

  const [isAdded, setIsAdded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const productName = getLocalizedProductText(product, 'name', language);
  const productSubtitle = getLocalizedProductText(product, 'title', language);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative flex flex-col justify-between bg-white dark:bg-[#141414] rounded-2xl p-2 sm:p-3 border border-neutral-200/80 dark:border-neutral-800/80 hover:shadow-mall-hover transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Top Image Section */}
      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#1B1B1F] mb-2.5">
        <img
          src={product.image_url}
          alt={productName}
          loading="lazy"
          onError={(e) => {
            const fallback = DEFAULT_FALLBACK_IMAGES[product.category_slug] || DEFAULT_FALLBACK_IMAGES.shoes;
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            }
          }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-500 text-white font-extrabold text-[10px] tracking-tight shadow">
            -{product.discount}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm hover:scale-110 active:scale-90 transition-all shadow-sm z-10"
          title={t.common.wishlist}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              inWishlist ? 'fill-rose-500 text-rose-500' : 'text-neutral-500 dark:text-neutral-300'
            }`}
          />
        </button>

        {/* Fast Delivery Badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 dark:bg-[#111]/90 backdrop-blur-sm text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-700/50">
          <Truck className="w-3 h-3 text-brand-teal" />
          <span>{product.delivery_days} {language === 'uz' ? 'kun' : language === 'ru' ? 'дней' : 'days'}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        {/* Price Section with Multi-Currency */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
          </div>
          {product.old_price > product.price && (
            <div className="text-[11px] text-neutral-400 line-through">
              {formatPrice(product.old_price)}
            </div>
          )}
        </div>

        {/* Product Title / Name */}
        <div className="space-y-0.5">
          <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white line-clamp-2 leading-snug group-hover:text-brand-teal transition-colors">
            {productName}
          </h3>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 leading-tight">
            {productSubtitle}
          </p>
        </div>

        {/* Colors Preview Dots */}
        {product.colors && product.colors.length > 1 && (
          <div className="flex items-center gap-1 pt-0.5">
            {product.colors.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 ${
                  c.inStock === false ? 'opacity-30' : ''
                }`}
                style={{ backgroundColor: c.hex }}
                title={`${c[`name_${language}` as keyof typeof c] || c.name_uz}${c.inStock === false ? ' (Tugagan)' : ' (Mavjud)'}`}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[9px] text-neutral-400 font-bold">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-neutral-800 dark:text-neutral-200">{product.rating}</span>
            <span className="text-[11px] text-neutral-400">({product.reviews_count})</span>
          </div>

          {/* Quick Add To Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`p-2 rounded-xl transition-all duration-200 active:scale-95 shadow-sm ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-brand-teal hover:text-white dark:hover:bg-brand-teal dark:hover:text-white'
            }`}
            title={t.common.addToCart}
          >
            {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
