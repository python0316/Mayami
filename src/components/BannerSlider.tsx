import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Sparkles, Store, ArrowRight } from 'lucide-react';
import { sanitizeBannerImageUrl, getBannerFallbackImage, handleBannerImageError } from '../utils/mediaUtils';

export const BannerSlider: React.FC = () => {
  const navigate = useNavigate();
  const { banners, shops, language, setSelectedCategorySlug } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Filter only active banners
  const activeBanners = useMemo(() => {
    const list = banners.filter(b => b.isActive !== false);
    return list.length > 0 ? list : banners;
  }, [banners]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  // Reset index if it exceeds array length
  useEffect(() => {
    if (currentIndex >= activeBanners.length) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  if (activeBanners.length === 0) return null;

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      nextBanner();
    } else if (diff < -50) {
      prevBanner();
    }
    setTouchStart(null);
  };

  const current = activeBanners[currentIndex] || activeBanners[0];
  if (!current) return null;

  // Associated Shop (if banner belongs to a seller or was created for a shop)
  const currentShop = current.shopId ? shops.find(s => s.id === current.shopId) : null;

  const title = language === 'uz' ? current.title_uz : language === 'ru' ? current.title_ru : current.title_en;
  const subtitle = language === 'uz' ? current.subtitle_uz : language === 'ru' ? current.subtitle_ru : current.subtitle_en;
  const cta = language === 'uz' ? current.cta_uz : language === 'ru' ? current.cta_ru : current.cta_en;
  const badge = language === 'uz' ? current.badge_uz : language === 'ru' ? current.badge_ru : current.badge_en;

  const getSafeGradient = (gradient?: string): string => {
    if (!gradient) return 'from-neutral-950/85 via-neutral-950/40 to-transparent';
    if (gradient.includes('to-transparent')) return gradient;
    if (gradient.includes('teal')) return 'from-teal-950/85 via-teal-950/40 to-transparent';
    if (gradient.includes('cyan')) return 'from-cyan-950/85 via-cyan-950/40 to-transparent';
    if (gradient.includes('indigo')) return 'from-indigo-950/85 via-indigo-950/40 to-transparent';
    if (gradient.includes('rose')) return 'from-rose-950/85 via-rose-950/40 to-transparent';
    if (gradient.includes('emerald')) return 'from-emerald-950/85 via-emerald-950/40 to-transparent';
    if (gradient.includes('amber')) return 'from-amber-950/85 via-amber-950/40 to-transparent';
    return 'from-neutral-950/85 via-neutral-950/40 to-transparent';
  };

  const handleCtaClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (current.linkType === 'shop' && currentShop) {
      navigate(`/store/${currentShop.slug}`);
    } else if (current.linkType === 'custom' && current.customUrl) {
      if (current.customUrl.startsWith('http')) {
        window.open(current.customUrl, '_blank');
      } else {
        navigate(current.customUrl);
      }
    } else if (current.linkCategory) {
      setSelectedCategorySlug(current.linkCategory);
      navigate(`/category/${current.linkCategory}`);
    } else if (currentShop) {
      navigate(`/store/${currentShop.slug}`);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 my-3 sm:my-4 select-none">
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => handleCtaClick()}
        className="relative w-full h-52 sm:h-72 md:h-84 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl group cursor-pointer bg-gradient-to-r from-neutral-950 via-teal-950/70 to-neutral-900"
      >
        {/* Background Image with eager loading, stable key, referrerPolicy and 2-step proxy retry */}
        <img
          key={current.id || `banner_${currentIndex}`}
          src={sanitizeBannerImageUrl(current.image)}
          alt={title}
          referrerPolicy="no-referrer"
          loading="eager"
          onError={(e) => {
            handleBannerImageError(
              e.currentTarget,
              sanitizeBannerImageUrl(current.image)
            );
          }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Dynamic Gradient Overlay: dark on left, 100% transparent on right */}
        <div className={`absolute inset-0 bg-gradient-to-r ${getSafeGradient(current.bg_gradient)} flex items-center p-4 sm:p-12 md:p-16`}>
          <div className="max-w-xl text-white space-y-2.5 sm:space-y-4">
            {/* Top Badges & Shop Tag */}
            <div className="flex flex-wrap items-center gap-2">
              {badge && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-brand-teal text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow">
                  <Sparkles className="w-3 h-3" />
                  <span>{badge}</span>
                </div>
              )}

              {/* Shop Badge (if associated with a seller/shop) */}
              {currentShop && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/store/${currentShop.slug}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-[10px] sm:text-xs tracking-wide shadow transition-all hover:scale-105 cursor-pointer border border-white/25"
                  title={`${currentShop.name} do'koniga o'tish`}
                >
                  <Store className="w-3 h-3 text-amber-300" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{currentShop.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-3xl md:text-4xl font-extrabold leading-tight text-white drop-shadow">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-[11px] sm:text-sm md:text-base text-neutral-200 line-clamp-2 max-w-lg drop-shadow leading-relaxed">
                {subtitle}
              </p>
            )}

            {/* CTA Button */}
            <div className="pt-1 sm:pt-2">
              <button
                type="button"
                onClick={handleCtaClick}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-white text-neutral-900 font-bold text-xs sm:text-sm hover:bg-neutral-100 active:scale-95 transition-all shadow-md cursor-pointer group/btn"
              >
                <span>{cta || "Xarid qilish"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Arrows (Visible on hover on desktop, always visible on mobile) */}
        {activeBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevBanner();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-opacity opacity-70 md:opacity-0 md:group-hover:opacity-100 z-10 cursor-pointer shadow-md"
              title="Oldingi reklama"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextBanner();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-opacity opacity-70 md:opacity-0 md:group-hover:opacity-100 z-10 cursor-pointer shadow-md"
              title="Keyingi reklama"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Indicator Dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-10">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-brand-teal' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                title={`${idx + 1}-reklama`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
