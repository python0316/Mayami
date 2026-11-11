import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StoriesReel } from '../components/StoriesReel';
import { BannerSlider } from '../components/BannerSlider';
import { ProductCard } from '../components/ProductCard';
import { 
  ArrowUpDown, 
  ChevronRight, 
  Footprints, 
  Shirt, 
  Watch, 
  Sparkles,
  Store,
  Compass
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';

  const { 
    products, 
    searchQuery, 
    setSearchQuery, 
    language, 
    t 
  } = useApp();

  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular');

  const effectiveQuery = (queryFromUrl || searchQuery).toLowerCase().trim();

  let filtered = products.filter(p => {
    if (effectiveQuery) {
      const inUz = p.title.uz?.toLowerCase().includes(effectiveQuery);
      const inRu = p.title.ru?.toLowerCase().includes(effectiveQuery);
      const inEn = p.title.en?.toLowerCase().includes(effectiveQuery);
      const inSlug = p.slug?.toLowerCase().includes(effectiveQuery);
      if (!inUz && !inRu && !inEn && !inSlug) return false;
    }
    return true;
  });

  if (sortBy === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else {
    filtered.sort((a, b) => b.reviews_count - a.reviews_count);
  }

  return (
    <div className="space-y-6">
      {/* Stories Reel & Banners (only show on unfiltered home) */}
      {!effectiveQuery && (
        <>
          <StoriesReel />
          <BannerSlider />
        </>
      )}

      {/* Main Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
              {effectiveQuery ? `"${effectiveQuery}" bo'yicha qidiruv natijalari` : 'Tavsiya etilgan mahsulotlar'}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-500">
              {filtered.length} ta
            </span>
          </div>

          {/* Sort selector */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold focus:outline-none cursor-pointer [&>option]:bg-white [&>option]:text-neutral-900 dark:[&>option]:bg-neutral-900 dark:[&>option]:text-white"
              >
                <option value="popular" className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white font-bold">{t.common.sortPopular}</option>
                <option value="price_asc" className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white font-bold">{t.common.sortPriceAsc}</option>
                <option value="price_desc" className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white font-bold">{t.common.sortPriceDesc}</option>
                <option value="rating" className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white font-bold">{t.common.sortRating}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-neutral-500 space-y-3">
              <p className="text-sm">So'rovingiz bo'yicha hech qanday mahsulot topilmadi.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal-hover transition-all"
              >
                Filtrlarni tozalash
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {filtered.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Showcase Sections (Home view only) */}
      {!effectiveQuery && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-14 space-y-12">
          {/* Shoes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-brand-teal" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {language === 'uz' ? "Poyabzallar kolleksiyasi" : language === 'ru' ? "Коллекция обуви" : "Footwear Collection"}
                </h3>
              </div>
              <Link
                to="/category/shoes"
                className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
              >
                <span>{t.common.viewAll}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products.filter(p => p.category_slug === 'shoes').slice(0, 5).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          {/* Clothing Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-brand-teal" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {language === 'uz' ? "Kiyim-kechaklar to'plami" : language === 'ru' ? "Коллекция одежды" : "Clothing Collection"}
                </h3>
              </div>
              <Link
                to="/category/clothing"
                className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
              >
                <span>{t.common.viewAll}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products.filter(p => p.category_slug === 'clothing').slice(0, 5).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          {/* Accessories Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Watch className="w-5 h-5 text-brand-teal" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {language === 'uz' ? "Zamonaviy aksessuarlar" : language === 'ru' ? "Стильные аксессуары" : "Trendy Accessories"}
                </h3>
              </div>
              <Link
                to="/category/accessories"
                className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
              >
                <span>{t.common.viewAll}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products.filter(p => p.category_slug === 'accessories').slice(0, 5).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          {/* Beauty Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-teal" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {language === 'uz' ? "Go'zallik va parvarish" : language === 'ru' ? "Красота и уход" : "Beauty & Personal Care"}
                </h3>
              </div>
              <Link
                to="/category/beauty-and-personal-care"
                className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
              >
                <span>{t.common.viewAll}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products.filter(p => p.category_slug === 'beauty-and-personal-care').slice(0, 5).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          {/* Islamic Essentials Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {language === 'uz' ? "Islomiy buyumlar va Ibodat to'plami" : language === 'ru' ? "Исламские товары и принадлежности для молитвы" : "Islamic & Worship Essentials"}
                </h3>
              </div>
              <Link
                to="/category/islamic-items"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{t.common.viewAll}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products.filter(p => p.category_slug === 'islamic-items').slice(0, 5).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
