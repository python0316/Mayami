import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { 
  ChevronRight, 
  ArrowUpDown, 
  Filter, 
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Package,
  Layers,
  Sparkles,
  Store,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Product } from '../types';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, products, language, currency, formatPrice, t } = useApp();

  // Search params sync
  const initialSub = searchParams.get('sub');
  const initialMinPrice = searchParams.get('min');
  const initialMaxPrice = searchParams.get('max');
  const initialSort = searchParams.get('sort') || 'popular';
  const initialInStock = searchParams.get('in_stock') === 'true';
  const initialDiscount = searchParams.get('discount') === 'true';

  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(initialSub);
  const [minPriceInput, setMinPriceInput] = useState<string>(initialMinPrice || '');
  const [maxPriceInput, setMaxPriceInput] = useState<string>(initialMaxPrice || '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(initialInStock);
  const [discountOnly, setDiscountOnly] = useState<boolean>(initialDiscount);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>(
    (initialSort as any) || 'popular'
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state if URL changes (e.g. navigation)
  useEffect(() => {
    setSelectedSubcat(searchParams.get('sub'));
    setMinPriceInput(searchParams.get('min') || '');
    setMaxPriceInput(searchParams.get('max') || '');
    setInStockOnly(searchParams.get('in_stock') === 'true');
    setDiscountOnly(searchParams.get('discount') === 'true');
    if (searchParams.get('sort')) {
      setSortBy(searchParams.get('sort') as any);
    }
  }, [searchParams, slug]);

  const category = useMemo(() => {
    return categories.find(c => c.slug === slug) || categories[0];
  }, [categories, slug]);

  const catTitle = useMemo(() => {
    if (!category) return slug;
    return (category[`title_${language}` as keyof typeof category] as string) || category.title_uz;
  }, [category, language, slug]);

  // Currency conversion helpers
  const currencyRate = useMemo(() => {
    if (currency === 'USD') return 12800;
    if (currency === 'RUB') return 138;
    return 1;
  }, [currency]);

  const currencySymbol = useMemo(() => {
    if (currency === 'USD') return '$';
    if (currency === 'RUB') return '₽';
    return language === 'ru' ? 'сум' : language === 'en' ? 'UZS' : "so'm";
  }, [currency, language]);

  const toCurrentCurrency = (uzsVal: number) => {
    if (currency === 'USD') return Math.round((uzsVal / 12800) * 100) / 100;
    if (currency === 'RUB') return Math.round(uzsVal / 138);
    return Math.round(uzsVal);
  };

  const toUZS = (currVal: number) => {
    return Math.round(currVal * currencyRate);
  };

  // Base products for this category
  const baseCategoryProducts = useMemo(() => {
    return products.filter(p => p.category_slug === (category?.slug || slug));
  }, [products, category, slug]);

  // Compute category min and max price in current currency
  const { minCategoryPrice, maxCategoryPrice } = useMemo(() => {
    if (baseCategoryProducts.length === 0) return { minCategoryPrice: 0, maxCategoryPrice: 1000000 };
    const prices = baseCategoryProducts.map(p => toCurrentCurrency(p.price));
    return {
      minCategoryPrice: Math.floor(Math.min(...prices)),
      maxCategoryPrice: Math.ceil(Math.max(...prices))
    };
  }, [baseCategoryProducts, currency]);

  // Subcategory matching helper
  const matchesSubcategory = (product: Product, subSlug: string | null) => {
    if (!subSlug) return true;
    if (product.subcategory_slug === subSlug) return true;
    
    // Fallback matching logic based on gender/category
    if (subSlug === 'mens-footwear' && product.category_slug === 'shoes' && product.gender === 'men') return true;
    if (subSlug === 'womens-shoes' && product.category_slug === 'shoes' && product.gender === 'women') return true;
    if (subSlug === 'boys-shoes' && product.category_slug === 'shoes' && (product.gender === 'boys' || product.gender === 'kids')) return true;
    if (subSlug === 'girls-shoes' && product.category_slug === 'shoes' && product.gender === 'girls') return true;
    
    if (subSlug === 'mens-clothing' && product.category_slug === 'clothing' && product.gender === 'men') return true;
    if (subSlug === 'womens-clothing' && product.category_slug === 'clothing' && product.gender === 'women') return true;
    if (subSlug === 'clothes-for-boys' && product.category_slug === 'clothing' && product.gender === 'boys') return true;
    if (subSlug === 'clothes-for-girls' && product.category_slug === 'clothing' && product.gender === 'girls') return true;

    return false;
  };

  // Count products per subcategory
  const subcategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (category?.subcategories) {
      category.subcategories.forEach(sub => {
        counts[sub.slug] = baseCategoryProducts.filter(p => matchesSubcategory(p, sub.slug)).length;
      });
    }
    return counts;
  }, [category, baseCategoryProducts]);

  // Update URL search parameters
  const updateUrlParams = (newParams: Record<string, string | null>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    setSearchParams(updated, { replace: true });
  };

  const handleSubcategorySelect = (subSlug: string | null) => {
    const nextSub = selectedSubcat === subSlug ? null : subSlug;
    setSelectedSubcat(nextSub);
    updateUrlParams({ sub: nextSub });
  };

  const handlePriceApply = () => {
    updateUrlParams({
      min: minPriceInput ? minPriceInput : null,
      max: maxPriceInput ? maxPriceInput : null
    });
  };

  const handleClearPrice = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    updateUrlParams({ min: null, max: null });
  };

  const handleClearAllFilters = () => {
    setSelectedSubcat(null);
    setMinPriceInput('');
    setMaxPriceInput('');
    setInStockOnly(false);
    setDiscountOnly(false);
    setSortBy('popular');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Quick price preset handler
  const handleQuickPreset = (min: number | null, max: number | null) => {
    const minStr = min !== null ? min.toString() : '';
    const maxStr = max !== null ? max.toString() : '';
    setMinPriceInput(minStr);
    setMaxPriceInput(maxStr);
    updateUrlParams({
      min: minStr || null,
      max: maxStr || null
    });
  };

  // Filter & sort pipeline
  const filteredProducts = useMemo(() => {
    let result = [...baseCategoryProducts];

    // 1. Subcategory filter
    if (selectedSubcat) {
      result = result.filter(p => matchesSubcategory(p, selectedSubcat));
    }

    // 2. Price filter
    const minVal = minPriceInput ? parseFloat(minPriceInput) : null;
    const maxVal = maxPriceInput ? parseFloat(maxPriceInput) : null;

    if (minVal !== null && !isNaN(minVal)) {
      const minUZS = toUZS(minVal);
      result = result.filter(p => p.price >= minUZS);
    }
    if (maxVal !== null && !isNaN(maxVal)) {
      const maxUZS = toUZS(maxVal);
      result = result.filter(p => p.price <= maxUZS);
    }

    // 3. In stock only
    if (inStockOnly) {
      result = result.filter(p => p.stock_count > 0);
    }

    // 4. Discounted only
    if (discountOnly) {
      result = result.filter(p => (p.discount && p.discount > 0) || (p.old_price && p.old_price > p.price));
    }

    // 5. Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else {
      result.sort((a, b) => b.reviews_count - a.reviews_count);
    }

    return result;
  }, [baseCategoryProducts, selectedSubcat, minPriceInput, maxPriceInput, inStockOnly, discountOnly, sortBy, currencyRate]);

  // Active filter count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSubcat) count++;
    if (minPriceInput || maxPriceInput) count++;
    if (inStockOnly) count++;
    if (discountOnly) count++;
    return count;
  }, [selectedSubcat, minPriceInput, maxPriceInput, inStockOnly, discountOnly]);

  // Get active subcategory title
  const activeSubcatObj = category?.subcategories?.find(s => s.slug === selectedSubcat);
  const activeSubcatTitle = activeSubcatObj 
    ? ((activeSubcatObj[`title_${language}` as keyof typeof activeSubcatObj] as string) || activeSubcatObj.title_uz)
    : null;

  // Preset definitions according to currency
  const pricePresets = useMemo(() => {
    if (currency === 'USD') {
      return [
        { label: language === 'uz' ? 'Barchasi' : language === 'ru' ? 'Все' : 'All', min: null, max: null },
        { label: '< $15', min: null, max: 15 },
        { label: '$15 - $30', min: 15, max: 30 },
        { label: '$30 - $60', min: 30, max: 60 },
        { label: '$60+', min: 60, max: null }
      ];
    } else if (currency === 'RUB') {
      return [
        { label: language === 'uz' ? 'Barchasi' : language === 'ru' ? 'Все' : 'All', min: null, max: null },
        { label: '< 1 500 ₽', min: null, max: 1500 },
        { label: '1 500 - 3 000 ₽', min: 1500, max: 3000 },
        { label: '3 000 - 6 000 ₽', min: 3000, max: 6000 },
        { label: '6 000+ ₽', min: 6000, max: null }
      ];
    } else {
      return [
        { label: language === 'uz' ? 'Barchasi' : language === 'ru' ? 'Все' : 'All', min: null, max: null },
        { label: '< 150 000', min: null, max: 150000 },
        { label: '150 000 - 300 000', min: 150000, max: 300000 },
        { label: '300 000 - 600 000', min: 300000, max: 600000 },
        { label: '600 000+', min: 600000, max: null }
      ];
    }
  }, [currency, language]);

  // Sidebar Filter Component (reused on Desktop & Mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Subcategories section */}
      {category?.subcategories && category.subcategories.length > 0 && (
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-teal" />
              <span>{t.common.subcategories || "Kichik bo'limlar"}</span>
            </h3>
            {selectedSubcat && (
              <button 
                onClick={() => handleSubcategorySelect(null)}
                className="text-[11px] text-brand-teal hover:underline font-semibold"
              >
                {t.common.clear || "Tozalash"}
              </button>
            )}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleSubcategorySelect(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSubcat === null
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
              }`}
            >
              <span>{language === 'uz' ? "Barcha mahsulotlar" : language === 'ru' ? "Все товары" : "All Products"}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedSubcat === null ? 'bg-white/20 dark:bg-black/20 text-white dark:text-neutral-900' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
              }`}>
                {baseCategoryProducts.length}
              </span>
            </button>

            {category.subcategories.map(sub => {
              const subTitle = (sub[`title_${language}` as keyof typeof sub] as string) || sub.title_uz;
              const isSelected = selectedSubcat === sub.slug;
              const count = subcategoryCounts[sub.slug] || 0;

              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubcategorySelect(sub.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                    isSelected
                      ? 'bg-brand-teal text-white shadow-sm'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                  }`}
                >
                  <span className="truncate text-left">{subTitle}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ml-2 ${
                    isSelected 
                      ? 'bg-white/25 text-white' 
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-brand-teal" />
            <span>{t.common.priceRange || "Narx oralig'i"} ({currencySymbol})</span>
          </h3>
          {(minPriceInput || maxPriceInput) && (
            <button 
              onClick={handleClearPrice}
              className="text-[11px] text-brand-teal hover:underline font-semibold"
            >
              {t.common.clear || "Tozalash"}
            </button>
          )}
        </div>

        {/* Min / Max inputs */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
              {t.common.from || "dan"} ({currencySymbol})
            </label>
            <input
              type="number"
              placeholder={minCategoryPrice.toString()}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePriceApply(); }}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
              {t.common.to || "gacha"} ({currencySymbol})
            </label>
            <input
              type="number"
              placeholder={maxCategoryPrice.toString()}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePriceApply(); }}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-brand-teal"
            />
          </div>
        </div>

        {/* Quick price presets */}
        <div className="mb-3">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5">
            {t.common.quickRanges || "Tezkor filtr"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {pricePresets.map((preset, idx) => {
              const isActive = (preset.min === null && preset.max === null && !minPriceInput && !maxPriceInput) ||
                (minPriceInput === (preset.min?.toString() || '') && maxPriceInput === (preset.max?.toString() || ''));

              return (
                <button
                  key={idx}
                  onClick={() => handleQuickPreset(preset.min, preset.max)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    isActive 
                      ? 'bg-brand-teal text-white shadow-xs' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apply button */}
        <button
          onClick={handlePriceApply}
          className="w-full py-2 rounded-xl bg-[#020106] dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 active:scale-98 transition-all"
        >
          {t.common.apply || "Qo'llash"}
        </button>
      </div>

      {/* Availability / Special offers */}
      <div className="space-y-3 pb-5 border-b border-neutral-200 dark:border-neutral-800">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
          {language === 'uz' ? "Mavjudlik va Chegirmalar" : language === 'ru' ? "Наличие и скидки" : "Availability & Deals"}
        </h3>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              const val = e.target.checked;
              setInStockOnly(val);
              updateUrlParams({ in_stock: val ? 'true' : null });
            }}
            className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
          />
          <span>{t.common.inStockOnly || "Faqat sotuvda borlari"}</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => {
              const val = e.target.checked;
              setDiscountOnly(val);
              updateUrlParams({ discount: val ? 'true' : null });
            }}
            className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
          />
          <span>{t.common.discountedOnly || "Chegirmadagi mahsulotlar"}</span>
        </label>
      </div>

      {/* Clear All button */}
      {activeFiltersCount > 0 && (
        <button
          onClick={handleClearAllFilters}
          className="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
          <span>{t.common.clearAll || "Barchasini tozalash"} ({activeFiltersCount})</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-500 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link to="/" className="hover:text-brand-teal font-medium">Bosh sahifa</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <Link to={`/category/${category?.slug || slug}`} onClick={() => handleSubcategorySelect(null)} className="hover:text-brand-teal font-medium">
          {catTitle}
        </Link>
        {activeSubcatTitle && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="text-neutral-900 dark:text-white font-bold">{activeSubcatTitle}</span>
          </>
        )}
      </nav>

      {/* Category Banner / Header Card */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/20 text-brand-teal text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Mayami Rasmiy Katalogi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {catTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300">
            {language === 'uz' 
              ? `Jami ${baseCategoryProducts.length} ta sara tovarlar rasmiy B2B do'konlardan. Butun O'zbekiston bo'ylab tez yetkazish va xavfsiz to'lov.`
              : language === 'ru' 
              ? `Всего ${baseCategoryProducts.length} отборных товаров от официальных B2B магазинов. Быстрая доставка по всему Узбекистану.`
              : `Total ${baseCategoryProducts.length} verified products from official B2B sellers with express delivery across Uzbekistan.`}
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-teal/20 to-transparent pointer-events-none blur-2xl" />
      </div>

      {/* Top Horizontal Subcategories Scroll Pills */}
      {category?.subcategories && category.subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleSubcategorySelect(null)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
              selectedSubcat === null
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md scale-102'
                : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {language === 'uz' ? "Barchasi" : language === 'ru' ? "Все" : "All"} ({baseCategoryProducts.length})
          </button>

          {category.subcategories.map(sub => {
            const subTitle = (sub[`title_${language}` as keyof typeof sub] as string) || sub.title_uz;
            const isSelected = selectedSubcat === sub.slug;
            const count = subcategoryCounts[sub.slug] || 0;

            return (
              <button
                key={sub.id}
                onClick={() => handleSubcategorySelect(sub.slug)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-brand-teal text-white shadow-md scale-102'
                    : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                <span>{subTitle}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Layout: Left Sidebar + Right Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Left Sidebar (1 col) */}
        <div className="hidden lg:block lg:col-span-1 p-5 rounded-3xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 sticky top-24">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-teal" />
              <span className="font-bold text-sm text-neutral-900 dark:text-white">
                {t.common.filter || "Filtrlar"}
              </span>
            </div>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-teal text-white text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>

          <FilterContent />
        </div>

        {/* Right Section: Sort Bar + Active Chips + Products Grid (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Control Bar (Mobile filter button + Product count + Sort selector) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-xs">
            {/* Mobile Filter Drawer Trigger */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold transition-all shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-teal" />
                <span>{t.common.filter || "Filtrlar"}</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-brand-teal text-white text-[10px]">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                {filteredProducts.length} {t.common.foundProducts || "ta mahsulot"}
              </span>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-neutral-400 hidden sm:inline">{t.common.sortBy || "Saralash"}:</span>
              <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const nextSort = e.target.value as any;
                    setSortBy(nextSort);
                    updateUrlParams({ sort: nextSort === 'popular' ? null : nextSort });
                  }}
                  className="bg-transparent text-neutral-800 dark:text-neutral-200 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="popular">{t.common.sortPopular || "Ommabopligi"}</option>
                  <option value="price_asc">{t.common.sortPriceAsc || "Narxi: arzondan qimmatga"}</option>
                  <option value="price_desc">{t.common.sortPriceDesc || "Narxi: qimmatdan arzonga"}</option>
                  <option value="rating">{t.common.sortRating || "Reyting bo'yicha"}</option>
                  <option value="newest">{language === 'uz' ? "Eng yangi" : language === 'ru' ? "Сначала новые" : "Newest"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-dashed border-neutral-300 dark:border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
                Faol filtrlar:
              </span>

              {activeSubcatTitle && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-teal/10 text-brand-teal font-semibold text-xs border border-brand-teal/20">
                  <span>{activeSubcatTitle}</span>
                  <button onClick={() => handleSubcategorySelect(null)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(minPriceInput || maxPriceInput) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-xs">
                  <span>
                    {minPriceInput ? `${minPriceInput} ${currencySymbol}` : `0 ${currencySymbol}`} - {maxPriceInput ? `${maxPriceInput} ${currencySymbol}` : '∞'}
                  </span>
                  <button onClick={handleClearPrice} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-xs">
                  <span>{t.common.inStockOnly || "Faqat sotuvda borlari"}</span>
                  <button onClick={() => { setInStockOnly(false); updateUrlParams({ in_stock: null }); }} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {discountOnly && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-xs">
                  <span>{t.common.discountedOnly || "Chegirmadagi mahsulotlar"}</span>
                  <button onClick={() => { setDiscountOnly(false); updateUrlParams({ discount: null }); }} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearAllFilters}
                className="text-[11px] font-bold text-red-500 hover:underline ml-auto"
              >
                {t.common.clearAll || "Barchasini tozalash"}
              </button>
            </div>
          )}

          {/* Products Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {t.common.noProductsFound || "Mos keluvchi mahsulot topilmadi"}
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  {t.common.tryChangingFilters || "Filtr parametrlarini o'zgartirib ko'ring yoki boshqa narx oralig'ini tanlang."}
                </p>
              </div>
              <button
                onClick={handleClearAllFilters}
                className="px-5 py-2.5 rounded-2xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all shadow-md inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.common.clearAll || "Barcha filtrlarni tozalash"}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-white dark:bg-[#171717] p-5 shadow-2xl flex flex-col z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-teal" />
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  {t.common.filter || "Filtrlar"}
                </h2>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <FilterContent />
            </div>

            <div className="pt-4 mt-6 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-2xl bg-brand-teal text-white font-bold text-xs shadow-md"
              >
                {filteredProducts.length} {t.common.foundProducts || "ta mahsulotni ko'rish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
