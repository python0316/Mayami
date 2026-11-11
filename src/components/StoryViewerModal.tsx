import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { parseStoryMedia } from '../utils/mediaUtils';
import { getLocalizedProductText } from '../utils/translator';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ShoppingBag, 
  CheckCircle, 
  ExternalLink,
  Eye,
  Clock,
  Tag,
  Check,
  FolderTree
} from 'lucide-react';

export const StoryViewerModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    storyViewer, 
    closeStoryViewer, 
    setStoryViewer, 
    shops, 
    products, 
    categories,
    formatPrice,
    setSelectedProduct, 
    setSelectedCategorySlug,
    addToCart,
    language, 
    t,
    markStoryAsViewed,
    isStoryActive,
    getStoryRemainingHours
  } = useApp();

  const shopsWithStories = shops
    .map(s => ({
      ...s,
      stories: (s.stories || []).filter(isStoryActive)
    }))
    .filter(s => s.stories.length > 0 && s.status !== 'suspended');

  const currentShop = shopsWithStories[storyViewer.shopIndex];
  const stories = currentShop ? currentShop.stories : [];
  const currentStory = stories[storyViewer.storyIndex];

  const parsedMedia = parseStoryMedia(currentStory?.mediaUrl || '', currentStory?.mediaType);

  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(60);
  const [addedToCartToast, setAddedToCartToast] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const holdTimeoutRef = useRef<number | null>(null);

  // Exact Posting Time helper
  const getStoryTimeDetails = (createdAt: string) => {
    if (!createdAt) return { exactTime: 'Hozir', relative: 'Yangi', remaining: '24 soat qoldi' };
    const d = new Date(createdAt);
    const exactTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const now = Date.now();
    const diffMs = Math.max(0, now - d.getTime());
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (3600 * 1000));

    let relative = '';
    if (diffMins < 1) relative = 'Hozir';
    else if (diffMins < 60) relative = `${diffMins} daqiqa oldin`;
    else if (diffHours < 24) relative = `${diffHours} soat oldin`;
    else relative = '1 kun oldin';

    const rem = currentStory ? getStoryRemainingHours(currentStory) : null;
    const remaining = rem ? rem.label : '24 soat qoldi';

    return { exactTime, relative, remaining };
  };

  // Mark viewed & increment view counter ONLY when story viewer is ACTUALLY OPEN
  useEffect(() => {
    if (!storyViewer.isOpen || !currentStory || !currentShop) return;

    setProgress(0);
    setVideoCurrentTime(0);
    setAddedToCartToast(false);
    markStoryAsViewed(currentStory.id, currentShop.id);
  }, [storyViewer.isOpen, storyViewer.shopIndex, storyViewer.storyIndex, currentStory?.id, currentShop?.id]);

  // Main Timer & Progress Engine
  // Rule 1: Images show for exactly 10 seconds (10,000ms)
  // Rule 2: Videos show for max 1 minute (60,000ms); if longer, automatically cap at 60s
  useEffect(() => {
    if (!storyViewer.isOpen || isPaused || !currentStory) return;

    const isDirectVideo = parsedMedia.isDirectVideo;
    const isYouTube = parsedMedia.isYouTube;

    if (isDirectVideo) {
      // Direct video handles its own progress through onTimeUpdate and caps at 60 seconds
      return;
    }

    // Images: exactly 10 seconds (10000 ms)
    // YouTube: max 60 seconds (60000 ms)
    const durationMs = isYouTube ? 60000 : 10000;
    const intervalMs = 50;
    const increment = (intervalMs / durationMs) * 100;

    timerRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [storyViewer.isOpen, isPaused, storyViewer.shopIndex, storyViewer.storyIndex, currentStory, parsedMedia.isDirectVideo, parsedMedia.isYouTube]);

  // Handle direct video playback sync
  const handleVideoLoadedMetadata = () => {
    if (!videoRef.current) return;
    const rawDur = videoRef.current.duration || 60;
    // Cap video duration at maximum 60 seconds
    const capped = Math.min(60, rawDur);
    setVideoDuration(capped);
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || isPaused) return;
    const cur = videoRef.current.currentTime;
    setVideoCurrentTime(cur);

    // Rule: Maksimal 1 minut (60 soniya)
    if (cur >= 60 || (videoDuration > 0 && cur >= videoDuration)) {
      videoRef.current.pause();
      handleNextStory();
      return;
    }

    const maxDur = Math.min(60, videoDuration || 60);
    setProgress((Math.min(cur, maxDur) / maxDur) * 100);
  };

  const handleVideoEnded = () => {
    handleNextStory();
  };

  // Sync video pause/play with state
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPaused) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isPaused, storyViewer.storyIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!storyViewer.isOpen) return;
      if (e.key === 'Escape') closeStoryViewer();
      if (e.key === 'ArrowRight') handleNextStory();
      if (e.key === 'ArrowLeft') handlePrevStory();
      if (e.key === ' ') setIsPaused(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [storyViewer.isOpen, storyViewer.shopIndex, storyViewer.storyIndex]);

  if (!storyViewer.isOpen || !currentShop || !currentStory) return null;

  const handleNextStory = () => {
    if (storyViewer.storyIndex < stories.length - 1) {
      setStoryViewer(prev => ({ ...prev, storyIndex: prev.storyIndex + 1 }));
    } else if (storyViewer.shopIndex < shopsWithStories.length - 1) {
      setStoryViewer({
        isOpen: true,
        shopIndex: storyViewer.shopIndex + 1,
        storyIndex: 0
      });
    } else {
      closeStoryViewer();
    }
  };

  const handlePrevStory = () => {
    if (storyViewer.storyIndex > 0) {
      setStoryViewer(prev => ({ ...prev, storyIndex: prev.storyIndex - 1 }));
    } else if (storyViewer.shopIndex > 0) {
      const prevShopIndex = storyViewer.shopIndex - 1;
      const prevShopStories = shopsWithStories[prevShopIndex].stories;
      setStoryViewer({
        isOpen: true,
        shopIndex: prevShopIndex,
        storyIndex: Math.max(0, prevShopStories.length - 1)
      });
    }
  };

  // Hold to pause support
  const handleTouchStart = () => {
    holdTimeoutRef.current = window.setTimeout(() => {
      setIsPaused(true);
    }, 150);
  };

  const handleTouchEnd = () => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    setIsPaused(false);
  };

  const linkedProduct = currentStory.productId 
    ? products.find(p => p.id === currentStory.productId)
    : null;

  const linkedCategory = currentStory.categorySlug
    ? categories.find(c => c.slug === currentStory.categorySlug)
    : null;

  const caption = language === 'uz' 
    ? currentStory.caption_uz 
    : language === 'ru' 
    ? currentStory.caption_ru 
    : currentStory.caption_en;

  const timeInfo = getStoryTimeDetails(currentStory.createdAt);

  const handleProductClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!linkedProduct) return;
    setSelectedProduct(linkedProduct);
    closeStoryViewer();
    navigate(`/product/${linkedProduct.id}`);
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStory.categorySlug) return;
    setSelectedCategorySlug(currentStory.categorySlug);
    closeStoryViewer();
    navigate(`/category/${currentStory.categorySlug}`);
  };

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!linkedProduct) return;
    addToCart(linkedProduct, 1, linkedProduct.sizes?.[0] || 'Standard');
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none animate-in fade-in duration-200">
      
      {/* Close Button */}
      <button
        onClick={closeStoryViewer}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        title={t.common.close}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev Shop Button */}
      {storyViewer.shopIndex > 0 && (
        <button
          onClick={handlePrevStory}
          className="hidden md:flex absolute left-8 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title={t.stories.previousShop}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next Shop Button */}
      {storyViewer.shopIndex < shopsWithStories.length - 1 && (
        <button
          onClick={handleNextStory}
          className="hidden md:flex absolute right-8 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title={t.stories.nextShop}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Story Card Container */}
      <div 
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-sm sm:max-w-md h-[94vh] sm:h-[90vh] rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
      >
        {/* Background Media */}
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
          {parsedMedia.isYouTube && parsedMedia.youTubeId ? (
            <div className="w-full h-full relative flex items-center justify-center">
              <iframe
                key={parsedMedia.youTubeId}
                src={`https://www.youtube.com/embed/${parsedMedia.youTubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${parsedMedia.youTubeId}&modestbranding=1&playsinline=1&rel=0`}
                title="Story YouTube video"
                className="w-full h-full object-cover border-0 pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : parsedMedia.isDirectVideo ? (
            <div className="w-full h-full relative flex items-center justify-center">
              <video
                ref={videoRef}
                key={currentStory.mediaUrl}
                src={currentStory.mediaUrl}
                autoPlay
                playsInline
                muted={isMuted}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                className="w-full h-full object-cover"
              />
              {/* Video Max 1 Minute Badge */}
              <div className="absolute top-24 right-4 z-20 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/90 font-bold border border-white/10">
                {Math.floor(videoCurrentTime)}s / {Math.floor(videoDuration)}s (Maks 1m)
              </div>
            </div>
          ) : (
            <img
              key={currentStory.mediaUrl}
              src={parsedMedia.thumbnailUrl || currentStory.mediaUrl}
              alt="Story media"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80';
              }}
            />
          )}

          {/* Gradients for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
        </div>

        {/* Top Header & Progress Bars */}
        <div className="relative z-20 p-4 space-y-2.5">
          {/* Progress Segment Bars */}
          <div className="flex items-center space-x-1.5">
            {stories.map((st, i) => {
              let barFill = 0;
              if (i < storyViewer.storyIndex) barFill = 100;
              else if (i === storyViewer.storyIndex) barFill = progress;
              else barFill = 0;

              return (
                <div key={st.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                    style={{ width: `${barFill}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Shop Avatar, Name, Exact Time Posted, and Views */}
          <div className="flex items-center justify-between">
            <Link
              to={`/store/${currentShop.slug}`}
              onClick={closeStoryViewer}
              className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity"
            >
              <img
                src={currentShop.avatar}
                alt={currentShop.name}
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow"
              />
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-bold text-white shadow-sm leading-tight">
                    {currentShop.name}
                  </span>
                  {currentShop.verified && (
                    <CheckCircle className="w-3.5 h-3.5 text-brand-teal fill-brand-teal/20" />
                  )}
                </div>

                {/* EXACT TIME POSTED & VIEWS COUNT (Talab bo'yicha) */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-white/90 font-medium mt-0.5">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Soat {timeInfo.exactTime} da joylangan
                  </span>
                  <span>•</span>
                  <span className="text-white/70">
                    {timeInfo.relative}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded">
                    <Eye className="w-3 h-3" />
                    {currentStory.views || 0} ta ko'rildi
                  </span>
                </div>
              </div>
            </Link>

            {/* Play/Pause & Sound controls */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }}
                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                title={isPaused ? "Ijro etish" : "Pauza"}
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tap areas for Prev / Next story */}
        <div className="absolute inset-0 z-10 flex pointer-events-none">
          <div 
            onClick={handlePrevStory}
            className="w-1/4 h-3/4 cursor-pointer pointer-events-auto"
            title="Oldingi story"
          />
          <div className="w-2/4 h-3/4 pointer-events-none" />
          <div 
            onClick={handleNextStory}
            className="w-1/4 h-3/4 cursor-pointer pointer-events-auto"
            title="Keyingi story"
          />
        </div>

        {/* Toast when added to cart */}
        {addedToCartToast && (
          <div className="relative z-30 mx-4 p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xl animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Mahsulot savatga muvaffaqiyatli qo'shildi!</span>
          </div>
        )}

        {/* Bottom Section: Caption & Interactive Product / Category Badges */}
        <div className="relative z-20 p-4 space-y-2.5">
          {caption && (
            <p className="text-white text-xs sm:text-sm font-medium drop-shadow-md bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 leading-relaxed">
              {caption}
            </p>
          )}

          {/* 1. Category Tag Link (Aynan qaysi kategoriya uchun) */}
          {currentStory.categorySlug && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCategoryClick}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md border border-white/30 flex items-center gap-1.5 transition-all shadow-md"
              >
                <FolderTree className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {linkedCategory?.title_uz || currentStory.categoryName || currentStory.categorySlug} toifasiga o'tish
                </span>
                <ExternalLink className="w-3 h-3 text-white/70" />
              </button>
            </div>
          )}

          {/* 2. Linked Product Card (Aynan qaysi tovar/kiyim uchun) */}
          {linkedProduct && (
            <div 
              onClick={handleProductClick}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-[#1A1A1E]/95 text-neutral-900 dark:text-white backdrop-blur-md shadow-2xl border border-white/20 cursor-pointer hover:bg-white dark:hover:bg-[#222] transition-all transform hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={linkedProduct.image_url}
                  alt={getLocalizedProductText(linkedProduct, 'title', language)}
                  className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                />
                <div className="max-w-[150px] sm:max-w-[190px]">
                  <span className="text-[10px] font-bold text-brand-teal uppercase block">
                    Belgilangan mahsulot
                  </span>
                  <div className="text-xs font-bold truncate">
                    {getLocalizedProductText(linkedProduct, 'name', language)}
                  </div>
                  <div className="text-xs font-black text-brand-teal mt-0.5">
                    {formatPrice(linkedProduct.price)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleQuickAddToCart}
                  className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-brand-teal hover:text-white text-neutral-700 dark:text-neutral-200 transition-colors"
                  title="Savatga qo'shish"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleProductClick}
                  className="px-3 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal-hover transition-all shadow-md flex items-center gap-1"
                >
                  <span>Xarid qilish</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Remaining 24h timer reminder badge */}
          <div className="text-center text-[10px] font-bold text-white/60 pt-0.5">
            ⏳ {timeInfo.remaining} • Mayami 24-soatlik eksklyuziv stories
          </div>
        </div>

      </div>
    </div>
  );
};
