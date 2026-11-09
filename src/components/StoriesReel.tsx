import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, CheckCircle, Flame } from 'lucide-react';
import { StoryRing } from './StoryRing';

export const StoriesReel: React.FC = () => {
  const { 
    shops, 
    openStoryViewer, 
    authenticatedShop,
    adminSession,
    getFirstUnviewedStoryIndex,
    isShopFullyViewed,
    isStoryActive,
    t 
  } = useApp();

  const canPostStory = adminSession?.role === 'superadmin' || adminSession?.permissions?.includes('manage_stories');

  const shopsWithStories = shops
    .map(s => ({
      ...s,
      stories: (s.stories || []).filter(isStoryActive)
    }))
    .filter(s => s.stories.length > 0 && s.status !== 'suspended');

  return (
    <section className="w-full my-4 py-2">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {t.stories.title}
            </h2>
          </div>
          {canPostStory && (
            <Link
              to="/admin"
              className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.stories.addStory}</span>
            </Link>
          )}
        </div>

        {/* Stories Horizontal Reel */}
        <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto pb-3 pt-1 scrollbar-none select-none">
          {/* Shop Owner Quick Story Add Circle */}
          {canPostStory && (
            <Link 
              to="/admin"
              className="flex flex-col items-center cursor-pointer group shrink-0"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-brand-teal flex items-center justify-center bg-brand-teal/5 group-hover:bg-brand-teal/15 transition-all transform group-hover:scale-105">
                <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center shadow-md">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-1.5 max-w-[70px] sm:max-w-[80px] truncate text-center">
                {t.stories.addStory}
              </span>
            </Link>
          )}

          {/* Shop Stories Circles with Telegram-style Segmented Ring */}
          {shopsWithStories.map((shop, index) => {
            const allViewed = isShopFullyViewed(shop);
            return (
              <div
                key={shop.id}
                onClick={() => {
                  const startIdx = getFirstUnviewedStoryIndex(shop);
                  openStoryViewer(index, startIdx);
                }}
                className="flex flex-col items-center cursor-pointer group shrink-0"
              >
                {/* Segmented Ring with individual story segments */}
                <div className="transform group-hover:scale-105 transition-all duration-300">
                  <StoryRing
                    stories={shop.stories}
                    className="w-16 h-16 sm:w-20 sm:h-20"
                    strokeWidth={3.8}
                  >
                    <img
                      src={shop.avatar}
                      alt={shop.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </StoryRing>
                </div>

                {/* Shop Name & Verified icon */}
                <div className="flex items-center gap-1 mt-1.5 max-w-[74px] sm:max-w-[84px]">
                  <span className={`text-[11px] sm:text-xs truncate ${
                    allViewed 
                      ? 'text-neutral-400 dark:text-neutral-500 font-normal' 
                      : 'text-neutral-800 dark:text-neutral-200 font-semibold'
                  }`}>
                    {shop.name}
                  </span>
                  {shop.verified && (
                    <CheckCircle className="w-3 h-3 text-brand-teal fill-brand-teal/20 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
