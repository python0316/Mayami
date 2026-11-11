import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Camera, 
  Heart, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  CloudSun, 
  Compass, 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  Store, 
  ShieldCheck, 
  Footprints, 
  Shirt, 
  Watch, 
  Sparkles,
  Phone,
  HelpCircle,
  LogOut,
  Coins
} from 'lucide-react';
import { Language, Currency } from '../types';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { 
    language, 
    setLanguage, 
    theme, 
    toggleTheme, 
    currency,
    setCurrency,
    formatPrice,
    t, 
    cartCount, 
    cartTotal, 
    wishlist, 
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategorySlug,
    setSelectedCategorySlug,
    setIsVisualSearchOpen,
    setIsAuthModalOpen,
    currentUser,
    logoutUser,
    authenticatedShop,
    adminSession
  } = useApp();

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState<string | null>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const catalogRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const currRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);
  const mobileCurrRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or outside touch
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!target) return;

      if (catalogRef.current && !catalogRef.current.contains(target)) {
        setIsCatalogOpen(false);
      }

      const isInsideLang = (langRef.current && langRef.current.contains(target)) || 
                           (mobileLangRef.current && mobileLangRef.current.contains(target));
      if (!isInsideLang) {
        setIsLangDropdownOpen(false);
      }

      const isInsideCurr = (currRef.current && currRef.current.contains(target)) || 
                           (mobileCurrRef.current && mobileCurrRef.current.contains(target));
      if (!isInsideCurr) {
        setIsCurrencyDropdownOpen(false);
      }

      if (userRef.current && !userRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'shoes': return <Footprints className="w-5 h-5 text-brand-teal" />;
      case 'clothing': return <Shirt className="w-5 h-5 text-brand-teal" />;
      case 'accessories': return <Watch className="w-5 h-5 text-brand-teal" />;
      case 'beauty-and-personal-care': return <Sparkles className="w-5 h-5 text-brand-teal" />;
      case 'islamic-items': return <Compass className="w-5 h-5 text-emerald-500" />;
      default: return <Store className="w-5 h-5 text-brand-teal" />;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0A0A0A] border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Top Utility Bar */}
      <div className="hidden md:block bg-neutral-100 dark:bg-[#141414] text-xs text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800/60 py-1.5 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Location & Support */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5 font-medium text-neutral-800 dark:text-neutral-200">
              <MapPin className="w-3.5 h-3.5 text-brand-teal" />
              <span>{t.common.location}, {t.common.country}</span>
            </div>
            <a 
              href="#how-to-buy" 
              onClick={(e) => { e.preventDefault(); alert("Mayami orqali to'lovlar Payme, Click va naqd pulda 100% xavfsiz amalga oshiriladi!"); }}
              className="hover:text-brand-teal flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.common.howToBuy}</span>
            </a>
            <div className="flex items-center space-x-1.5 hover:text-brand-teal transition-colors">
              <Phone className="w-3.5 h-3.5 text-brand-teal" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">+998 88 678 22 04</span>
            </div>
            <Link
              to="/weather"
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:text-brand-teal transition-all border border-neutral-200 dark:border-neutral-700 shadow-2xs font-semibold group"
              title="Real vaqtdagi ob-havo ma'lumotlari"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>{t.common.weather || "Ob-havo"}</span>
              <span className="text-[10px] text-brand-teal font-black px-1.5 py-0.2 rounded-full bg-brand-teal/10">
                LIVE
              </span>
            </Link>
            <Link
              to="/prayer"
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:text-emerald-500 transition-all border border-neutral-200 dark:border-neutral-700 shadow-2xs font-semibold group"
              title="Namoz vaqtlari, Qibla va Tasbeh"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500 group-hover:rotate-45 transition-transform" />
              <span>{t.common.prayer || "Namoz"}</span>
            </Link>

            {adminSession && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1.5 px-3 py-0.5 rounded-full border text-[11px] font-bold transition-all shadow-xs shrink-0 ${
                  adminSession.role === 'superadmin'
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/25'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                }`}
                title="Boshqaruv paneliga o'tish"
              >
                {adminSession.role === 'superadmin' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                    <span>🛡️ SuperAdmin</span>
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate max-w-[130px]">{adminSession.name} Paneli</span>
                  </>
                )}
              </Link>
            )}
          </div>

          {/* Controls: Currency (UZS, USD, RUB), Theme, Language */}
          <div className="flex items-center space-x-4">
            {/* Multi-Currency Selector (UZS, USD, RUB) */}
            <div className="relative" ref={currRef}>
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 font-bold uppercase text-neutral-800 dark:text-neutral-200 transition-colors"
                title="Valyutani tanlang"
              >
                <Coins className="w-3.5 h-3.5 text-brand-teal" />
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#171717] rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1 z-50 animate-in fade-in">
                  <button
                    onClick={() => { setCurrency('UZS'); setIsCurrencyDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 ${currency === 'UZS' ? 'text-brand-teal font-black' : ''}`}
                  >
                    UZS (so'm)
                  </button>
                  <button
                    onClick={() => { setCurrency('USD'); setIsCurrencyDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 ${currency === 'USD' ? 'text-brand-teal font-black' : ''}`}
                  >
                    USD ($)
                  </button>
                  <button
                    onClick={() => { setCurrency('RUB'); setIsCurrencyDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 ${currency === 'RUB' ? 'text-brand-teal font-black' : ''}`}
                  >
                    RUB (₽)
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 p-1 px-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
              title={theme === 'dark' ? t.common.themeLight : t.common.themeDark}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{t.common.themeLight}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-neutral-600" />
                  <span>{t.common.themeDark}</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 font-semibold uppercase px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>{language === 'uz' ? "O'zbekcha" : language === 'ru' ? 'Русский' : 'English'}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#171717] rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1 z-50 animate-in fade-in">
                  <button
                    onClick={() => { setLanguage('uz'); setIsLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 ${language === 'uz' ? 'text-brand-teal font-bold' : ''}`}
                  >
                    🇺🇿 O'zbekcha
                  </button>
                  <button
                    onClick={() => { setLanguage('ru'); setIsLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 ${language === 'ru' ? 'text-brand-teal font-bold' : ''}`}
                  >
                    🇷🇺 Русский
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 ${language === 'en' ? 'text-brand-teal font-bold' : ''}`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Header (md:hidden) */}
      <div className="md:hidden px-3 pt-2.5 pb-2 space-y-2">
        {/* Row 1: Logo & Controls (Location, Weather, Currency, Theme, Language) */}
        <div className="flex items-center justify-between gap-2">
          <Link 
            to="/" 
            onClick={() => { setSelectedCategorySlug(null); setSearchQuery(''); }}
            className="flex items-center select-none shrink-0"
          >
            <img 
              src={theme === 'dark' ? '/icons/logo-white.svg' : '/icons/logo-dark.svg'} 
              alt="Mayami" 
              className="h-7 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-1.5 text-xs">
            {/* Weather chip */}
            <Link
              to="/weather"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-[11px]"
              title="Ob-havo"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xs:inline">Ob-havo</span>
            </Link>

            {/* Prayer chip */}
            <Link
              to="/prayer"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]"
              title="Namoz vaqtlari"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden xs:inline">Namoz</span>
            </Link>

            {/* Currency selector */}
            <div className="relative" ref={mobileCurrRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen);
                  setIsLangDropdownOpen(false);
                }}
                className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-black text-xs active:scale-95 transition-all select-none"
                aria-label="Valyutani tanlash"
              >
                <span>{currency}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCurrencyDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-[#1A1A1E] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700/80 py-1.5 z-[70] animate-in fade-in slide-in-from-top-1 divide-y divide-neutral-100 dark:divide-neutral-800"
                >
                  {(['UZS', 'USD', 'RUB'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { 
                        setCurrency(c); 
                        setIsCurrencyDropdownOpen(false); 
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors flex items-center justify-between active:bg-neutral-100 dark:active:bg-neutral-800 ${
                        currency === c 
                          ? 'text-brand-teal bg-brand-teal/5 font-black' 
                          : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <span>{c === 'UZS' ? "UZS (so'm)" : c === 'USD' ? 'USD ($)' : 'RUB (₽)'}</span>
                      {currency === c && <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 active:scale-95 transition-all"
              title={theme === 'dark' ? t.common.themeLight : t.common.themeDark}
              aria-label="Mavzuni almashtirish"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
            </button>

            {/* Language Switcher */}
            <div className="relative" ref={mobileLangRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                  setIsCurrencyDropdownOpen(false);
                }}
                className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold uppercase text-xs active:scale-95 transition-all select-none"
                aria-label="Tilni tanlash"
              >
                <span>{language === 'uz' ? 'UZ' : language === 'ru' ? 'RU' : 'EN'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#1A1A1E] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700/80 py-1.5 z-[70] animate-in fade-in slide-in-from-top-1 divide-y divide-neutral-100 dark:divide-neutral-800"
                >
                  <button
                    type="button"
                    onClick={() => { setLanguage('uz'); setIsLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between active:bg-neutral-100 dark:active:bg-neutral-800 ${
                      language === 'uz' 
                        ? 'text-brand-teal bg-brand-teal/5 font-black' 
                        : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <span>🇺🇿 O'zbekcha</span>
                    {language === 'uz' && <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLanguage('ru'); setIsLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between active:bg-neutral-100 dark:active:bg-neutral-800 ${
                      language === 'ru' 
                        ? 'text-brand-teal bg-brand-teal/5 font-black' 
                        : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <span>🇷🇺 Русский</span>
                    {language === 'ru' && <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between active:bg-neutral-100 dark:active:bg-neutral-800 ${
                      language === 'en' 
                        ? 'text-brand-teal bg-brand-teal/5 font-black' 
                        : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <span>🇬🇧 English</span>
                    {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Full-width Mobile Search Bar (Uzum Market Style) */}
        <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.common.searchPlaceholder}
            className="w-full h-10 pl-10 pr-20 rounded-xl bg-neutral-100 dark:bg-[#161618] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 border border-transparent focus:border-brand-teal focus:bg-white dark:focus:bg-[#1C1C20] focus:outline-none transition-all text-xs"
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsVisualSearchOpen(true)}
              className="p-1.5 text-neutral-500 hover:text-brand-teal transition-colors"
              title={t.common.searchByImage}
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="h-7 px-2.5 rounded-lg bg-brand-teal text-white hover:bg-brand-teal-hover flex items-center justify-center text-xs font-bold transition-colors shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Desktop Main Navigation Bar */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 lg:px-8 py-3.5 items-center justify-between gap-4">
        {/* Logo Mayami */}
        <Link 
          to="/" 
          onClick={() => { setSelectedCategorySlug(null); setSearchQuery(''); }}
          className="flex items-center select-none shrink-0"
        >
          <img 
            src={theme === 'dark' ? '/icons/logo-white.svg' : '/icons/logo-dark.svg'} 
            alt="Mayami" 
            className="h-8 w-auto object-contain transition-transform hover:scale-105"
          />
        </Link>

        {/* Catalog Button */}
        <div className="relative" ref={catalogRef}>
          <button
            onClick={() => {
              if (!isCatalogOpen && categories.length > 0) {
                setHoveredCategorySlug(selectedCategorySlug || categories[0].slug);
              }
              setIsCatalogOpen(!isCatalogOpen);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#020106] dark:bg-white text-white dark:text-neutral-900 font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            {isCatalogOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-brand-teal" />}
            <span>{t.common.catalog}</span>
          </button>

          {/* Catalog Mega Menu Dropdown */}
          {isCatalogOpen && (
            <div className="absolute left-0 mt-3 w-80 sm:w-[580px] lg:w-[680px] bg-white dark:bg-[#171717] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row gap-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-800">
                {/* Left Column: Categories List */}
                <div className="sm:w-60 shrink-0 space-y-1">
                  <div className="font-black text-xs uppercase tracking-wider px-3 py-1.5 text-neutral-400">
                    {t.common.allCategories}
                  </div>
                  {categories.map((cat) => {
                    const title = language === 'uz' ? cat.title_uz : language === 'ru' ? cat.title_ru : cat.title_en;
                    const isSelected = (hoveredCategorySlug || categories[0]?.slug) === cat.slug;
                    return (
                      <div
                        key={cat.id}
                        onMouseEnter={() => setHoveredCategorySlug(cat.slug)}
                        onClick={() => {
                          setHoveredCategorySlug(cat.slug);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`p-1.5 rounded-xl transition-colors ${
                            isSelected ? 'bg-white/20 dark:bg-black/10' : 'bg-neutral-100 dark:bg-neutral-800 text-brand-teal'
                          }`}>
                            {getCategoryIcon(cat.slug)}
                          </div>
                          <span className="font-bold text-xs truncate">{title}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isSelected ? 'translate-x-0.5 text-brand-teal' : 'text-neutral-400 group-hover:translate-x-0.5'
                        }`} />
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Active Category Subcategories */}
                <div className="sm:flex-1 pt-3 sm:pt-0 sm:pl-4 space-y-3">
                  {(() => {
                    const activeCat = categories.find(c => c.slug === (hoveredCategorySlug || categories[0]?.slug)) || categories[0];
                    if (!activeCat) return null;
                    const activeTitle = language === 'uz' ? activeCat.title_uz : language === 'ru' ? activeCat.title_ru : activeCat.title_en;

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-neutral-900 dark:text-white">{activeTitle}</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedCategorySlug(activeCat.slug);
                              navigate(`/category/${activeCat.slug}`);
                              setIsCatalogOpen(false);
                            }}
                            className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
                          >
                            <span>{t.common.viewAll}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeCat.subcategories.map((sub) => {
                            const subTitle = language === 'uz' ? sub.title_uz : language === 'ru' ? sub.title_ru : sub.title_en;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  setSelectedCategorySlug(activeCat.slug);
                                  navigate(`/category/${activeCat.slug}?sub=${sub.slug}`);
                                  setIsCatalogOpen(false);
                                }}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-brand-teal/10 hover:border-brand-teal/30 border border-transparent transition-all text-left group"
                              >
                                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-brand-teal">
                                  {subTitle}
                                </span>
                                <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:text-brand-teal group-hover:translate-x-0.5 transition-all" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Big Search Bar with Visual Search camera button */}
        <div className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
            <div className="relative w-full flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.common.searchPlaceholder}
                className="w-full h-11 pl-4 pr-24 rounded-xl bg-neutral-100 dark:bg-[#141414] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 border border-transparent focus:border-brand-teal focus:bg-white dark:focus:bg-[#171717] focus:outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setIsVisualSearchOpen(true)}
                title={t.common.searchByImage}
                className="absolute right-12 p-2 text-neutral-500 hover:text-brand-teal transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="absolute right-1.5 h-8 px-3 rounded-lg bg-brand-teal text-white hover:bg-brand-teal-hover flex items-center justify-center transition-colors shadow-sm"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Section: Customer Login/Register (xuddi Mayami dek!), Wishlist, Cart */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Customer Auth Button: "Kirish / Ro'yxatdan o'tish" like Mayami.com */}
          {currentUser ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-teal/20 text-brand-teal font-black text-xs flex items-center justify-center">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-neutral-400 leading-tight">Mening profilim</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden lg:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#171717] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-2 z-50 animate-in fade-in">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <User className="w-4 h-4 text-brand-teal" />
                    <span>Mening profilim</span>
                  </Link>
                  <button
                    onClick={() => { logoutUser(); setIsUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.common.signOut}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/profile"
                className="h-9 px-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all flex items-center gap-1.5"
                title="Shaxsiy Mehmon Kabineti"
              >
                <User className="w-3.5 h-3.5 text-brand-teal" />
                <span className="hidden xl:inline">Kabinet</span>
              </Link>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="h-9 px-3.5 sm:px-4 rounded-full bg-[#020106] dark:bg-white text-white dark:text-neutral-900 text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.common.signInOrRegister}</span>
              </button>
            </div>
          )}

          {/* Wishlist Button */}
          <Link
            to="/profile"
            className="relative p-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={t.common.wishlist}
          >
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute 1 -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 transition-all active:scale-95"
            title={t.common.cart}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-brand-teal" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-teal text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold leading-none">{t.common.cart}</span>
              <span className="text-xs font-bold leading-tight mt-0.5">{formatPrice(cartTotal)}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Category Ribbon / Subheader */}
      <div className="bg-neutral-50 dark:bg-[#121212] border-t border-neutral-200 dark:border-neutral-800/80 px-4 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap">
          <Link
            to="/"
            onClick={() => { setSelectedCategorySlug(null); setSearchQuery(''); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedCategorySlug === null
                ? 'bg-[#020106] dark:bg-white text-white dark:text-neutral-900 font-bold shadow-sm'
                : 'text-neutral-700 dark:text-neutral-300 hover:text-brand-teal hover:bg-neutral-200/50 dark:hover:bg-neutral-800'
            }`}
          >
            {t.common.allCategories}
          </Link>

          {categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            const title = language === 'uz' ? cat.title_uz : language === 'ru' ? cat.title_ru : cat.title_en;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={() => setSelectedCategorySlug(cat.slug)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-brand-teal text-white font-bold shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-brand-teal hover:bg-neutral-200/50 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{title}</span>
              </Link>
            );
          })}

          {/* Real-time Weather Section Link */}
          <Link
            to="/weather"
            onClick={() => setSelectedCategorySlug(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/10 transition-all border border-amber-500/20 group"
          >
            <CloudSun className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>{t.common.weather || "Ob-havo"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </Link>

          {/* Prayer Section Link */}
          <Link
            to="/prayer"
            onClick={() => setSelectedCategorySlug(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/10 transition-all border border-emerald-500/20 group"
          >
            <Compass className="w-4 h-4 text-emerald-500 group-hover:rotate-45 transition-transform" />
            <span>{t.common.prayer || "Namoz"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
