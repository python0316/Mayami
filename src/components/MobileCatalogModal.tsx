import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Search, 
  ChevronRight, 
  Footprints, 
  Shirt, 
  Watch, 
  Sparkles, 
  Compass, 
  Store, 
  CloudSun,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const MobileCatalogModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isMobileCatalogOpen, 
    setIsMobileCatalogOpen, 
    categories, 
    setSelectedCategorySlug, 
    language, 
    t 
  } = useApp();

  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(categories[0]?.slug || 'shoes');
  const [filterQuery, setFilterQuery] = useState('');

  if (!isMobileCatalogOpen) return null;

  const getCategoryIcon = (slug: string, className = "w-5 h-5") => {
    switch (slug) {
      case 'shoes': return <Footprints className={className} />;
      case 'clothing': return <Shirt className={className} />;
      case 'accessories': return <Watch className={className} />;
      case 'beauty-and-personal-care': return <Sparkles className={className} />;
      case 'islamic-items': return <Compass className={className} />;
      default: return <Store className={className} />;
    }
  };

  const activeCategory = categories.find(c => c.slug === activeCategorySlug) || categories[0];
  const activeTitle = activeCategory 
    ? (language === 'uz' ? activeCategory.title_uz : language === 'ru' ? activeCategory.title_ru : activeCategory.title_en)
    : '';

  const filteredCategories = filterQuery.trim()
    ? categories.filter(c => {
        const uz = c.title_uz.toLowerCase();
        const ru = c.title_ru.toLowerCase();
        const en = c.title_en.toLowerCase();
        const q = filterQuery.toLowerCase();
        const hasSub = c.subcategories.some(s => 
          s.title_uz.toLowerCase().includes(q) || 
          s.title_ru.toLowerCase().includes(q) || 
          s.title_en.toLowerCase().includes(q)
        );
        return uz.includes(q) || ru.includes(q) || en.includes(q) || hasSub;
      })
    : categories;

  const handleSelectSub = (catSlug: string, subSlug?: string) => {
    setSelectedCategorySlug(catSlug);
    setIsMobileCatalogOpen(false);
    if (subSlug) {
      navigate(`/category/${catSlug}?sub=${subSlug}`);
    } else {
      navigate(`/category/${catSlug}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white animate-in slide-in-from-bottom-4 duration-300">
      {/* Top Header */}
      <div className="px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-[#121212] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black leading-tight">
              {t.common.catalog}
            </h2>
            <p className="text-[11px] text-neutral-400 leading-none mt-0.5">
              Barcha bo'limlar va toifalar
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileCatalogOpen(false)}
          className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search inside catalog */}
      <div className="p-3 bg-neutral-50 dark:bg-[#141416] border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Bo'lim yoki toifa qidirish..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs font-medium placeholder-neutral-400 focus:outline-none focus:border-brand-teal"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-3 text-xs text-neutral-400 hover:text-neutral-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Catalog Body: Split Pane (Uzum Market Style) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Category Sidebar */}
        <div className="w-28 sm:w-36 bg-neutral-50 dark:bg-[#101014] border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto py-2 shrink-0 select-none scrollbar-none">
          {filteredCategories.map((cat) => {
            const isSelected = cat.slug === activeCategorySlug;
            const title = language === 'uz' ? cat.title_uz : language === 'ru' ? cat.title_ru : cat.title_en;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`w-full px-2 py-3 flex flex-col items-center text-center gap-1.5 transition-all relative ${
                  isSelected
                    ? 'bg-white dark:bg-[#1A1A20] text-brand-teal font-extrabold shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-teal rounded-r" />
                )}
                <div className={`p-2 rounded-2xl transition-all ${
                  isSelected 
                    ? 'bg-brand-teal/15 text-brand-teal scale-110' 
                    : 'bg-neutral-200/50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}>
                  {getCategoryIcon(cat.slug, "w-5 h-5")}
                </div>
                <span className="text-[10px] sm:text-xs leading-tight line-clamp-2">
                  {title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Pane: Subcategories and Quick Actions */}
        <div className="flex-1 bg-white dark:bg-[#0A0A0A] overflow-y-auto p-4 space-y-4">
          {activeCategory && (
            <>
              {/* Category Header Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-teal/10 via-brand-teal/5 to-transparent border border-brand-teal/20 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white">
                    {activeTitle}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {activeCategory.subcategories.length} ta kichik toifa
                  </p>
                </div>
                <button
                  onClick={() => handleSelectSub(activeCategory.slug)}
                  className="px-3 py-1.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal-hover transition-all flex items-center gap-1 shadow-sm shrink-0"
                >
                  <span>Barchasi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subcategories Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                  Bo'limlar
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCategory.subcategories.map((sub) => {
                    const subTitle = language === 'uz' ? sub.title_uz : language === 'ru' ? sub.title_ru : sub.title_en;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSelectSub(activeCategory.slug, sub.slug)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-[#141418] hover:bg-brand-teal/10 hover:border-brand-teal/30 border border-neutral-100 dark:border-neutral-800/80 transition-all text-left group"
                      >
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-brand-teal transition-colors">
                          {subTitle}
                        </span>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-brand-teal group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Quick Helpful Services */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
              Foydali xizmatlar
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setIsMobileCatalogOpen(false); navigate('/weather'); }}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold text-left hover:scale-[1.02] transition-transform"
              >
                <CloudSun className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Ob-havo LIVE</span>
              </button>

              <button
                onClick={() => { setIsMobileCatalogOpen(false); navigate('/prayer'); }}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-left hover:scale-[1.02] transition-transform"
              >
                <Compass className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Namoz va Qibla</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};