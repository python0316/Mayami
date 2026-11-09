import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const BannerSlider: React.FC = () => {
  const navigate = useNavigate();
  const { banners, language, setSelectedCategorySlug } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
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

  const current = banners[currentIndex];

  const title = language === 'uz' ? current.title_uz : language === 'ru' ? current.title_ru : current.title_en;
  const subtitle = language === 'uz' ? current.subtitle_uz : language === 'ru' ? current.subtitle_ru : current.subtitle_en;
  const cta = language === 'uz' ? current.cta_uz : language === 'ru' ? current.cta_ru : current.cta_en;
  const badge = language === 'uz' ? current.badge_uz : language === 'ru' ? current.badge_ru : current.badge_en;

  return (
    <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 my-3 sm:my-4 select-none">
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-48 sm:h-72 md:h-84 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg group"
      >
        {/* Background Image */}
        <img
          src={current.image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent flex items-center p-4 sm:p-12 md:p-16">
          <div className="max-w-xl text-white space-y-2 sm:space-y-4">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-brand-teal text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow">
              <Sparkles className="w-3 h-3" />
              <span>{badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-3xl md:text-4xl font-extrabold leading-tight text-white drop-shadow">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-sm md:text-base text-neutral-200 line-clamp-2 max-w-lg drop-shadow">
              {subtitle}
            </p>

            {/* CTA Button */}
            <div className="pt-1 sm:pt-2">
              <button
                onClick={() => {
                  setSelectedCategorySlug(current.linkCategory);
                  navigate(`/category/${current.linkCategory}`);
                }}
                className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-white text-neutral-900 font-bold text-xs sm:text-sm hover:bg-neutral-100 active:scale-95 transition-all shadow-md"
              >
                {cta}
              </button>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={prevBanner}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-opacity opacity-70 md:opacity-0 md:group-hover:opacity-100 z-10"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-opacity opacity-70 md:opacity-0 md:group-hover:opacity-100 z-10"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx ? 'w-6 bg-brand-teal' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
