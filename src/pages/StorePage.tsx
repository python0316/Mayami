import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { 
  Store, 
  CheckCircle, 
  Star, 
  MapPin, 
  Phone, 
  Flame, 
  Package, 
  Clock, 
  ArrowLeft,
  Share2
} from 'lucide-react';
import { StoryRing } from '../components/StoryRing';

export const StorePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { 
    shops, 
    products, 
    openStoryViewer, 
    getFirstUnviewedStoryIndex, 
    isStoryViewed, 
    isStoryActive,
    language, 
    t 
  } = useApp();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const shop = shops.find(s => s.slug === slug) || shops[0];
  const activeShopStories = (shop.stories || []).filter(isStoryActive);
  const shopProducts = products.filter(p => p.shopId === shop.id);
  const shopsWithStories = shops
    .map(s => ({
      ...s,
      stories: (s.stories || []).filter(isStoryActive)
    }))
    .filter(s => s.stories.length > 0 && s.status !== 'suspended');
  const shopIndex = shopsWithStories.findIndex(s => s.id === shop.id);

  const filteredProducts = selectedCat 
    ? shopProducts.filter(p => p.category_slug === selectedCat)
    : shopProducts;

  const desc = shop[`description_${language}` as keyof typeof shop] as string || shop.description_uz;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-brand-teal flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Bosh sahifa</span>
        </Link>
        <span>/</span>
        <span className="text-neutral-400">Do'konlar</span>
        <span>/</span>
        <span className="text-neutral-900 dark:text-white font-bold">{shop.name}</span>
      </div>

      {/* Store Hero Banner & Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white">
        {/* Banner Image */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img
            src={shop.banner}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Store Profile Info Overlay */}
        <div className="relative p-4 sm:p-8 -mt-12 sm:-mt-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 sm:gap-6">
          <div className="flex items-start sm:items-center space-x-4 sm:space-x-6">
            <div className="relative shrink-0">
              {activeShopStories && activeShopStories.length > 0 ? (
                <div 
                  onClick={() => openStoryViewer(shopIndex >= 0 ? shopIndex : 0, getFirstUnviewedStoryIndex(shop))}
                  className="cursor-pointer group transform hover:scale-105 transition-all"
                  title="Hikoyalarni ko'rish"
                >
                  <StoryRing
                    stories={activeShopStories}
                    className="w-20 h-20 sm:w-28 sm:h-28"
                    strokeWidth={3.8}
                  >
                    <img
                      src={shop.avatar}
                      alt={shop.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </StoryRing>
                  <button
                    className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-teal-500 via-sky-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1"
                  >
                    <Flame className="w-3 h-3 fill-amber-300" />
                    <span>Story</span>
                  </button>
                </div>
              ) : (
                <div className="p-1 rounded-2xl bg-white dark:bg-[#141414] shadow-2xl">
                  <img
                    src={shop.avatar}
                    alt={shop.name}
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-white">{shop.name}</h1>
                {shop.verified && (
                  <CheckCircle className="w-5 h-5 text-brand-teal fill-brand-teal/20" />
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
                {desc}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{shop.rating} ({shop.reviewsCount} ta sharh)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Javob berish vaqti: {shop.responseTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{shop.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info & Share */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Do'kon havolasi nusxalandi!");
              }}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Do'kon havolasini ulashish"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Shop Stories Section if any */}
      {activeShopStories && activeShopStories.length > 0 && (
        <div className="space-y-3 p-5 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Do'kon hikoyalari ({activeShopStories.length} ta)
              </h3>
            </div>
            <button
              onClick={() => openStoryViewer(shopIndex >= 0 ? shopIndex : 0, 0)}
              className="text-xs font-bold text-brand-teal hover:underline"
            >
              Barchasini ko'rish →
            </button>
          </div>
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
            {activeShopStories.map((st, sIdx) => {
              const viewed = isStoryViewed(st.id);
              return (
                <div
                  key={st.id}
                  onClick={() => openStoryViewer(shopIndex >= 0 ? shopIndex : 0, sIdx)}
                  className={`relative w-28 h-40 rounded-xl overflow-hidden cursor-pointer group shrink-0 border-2 transition-all shadow-sm ${
                    viewed
                      ? 'border-neutral-300 dark:border-neutral-800 opacity-75'
                      : 'border-brand-teal ring-2 ring-brand-teal/20'
                  }`}
                >
                  <img src={st.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-2 right-2">
                    {viewed ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-neutral-300 text-[9px] font-bold">
                        Ko'rilgan
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-teal-500 to-rose-500 text-white text-[9px] font-black shadow-sm">
                        Yangi
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 text-[10px] font-bold text-white line-clamp-2">
                    {st.caption_uz}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shop Products Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-teal" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Do'kon vitrinasi ({filteredProducts.length} ta mahsulot)
            </h2>
          </div>

          {/* Filter by Category */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedCat(null)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCat === null
                  ? 'bg-brand-dark dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-teal'
              }`}
            >
              Barchasi
            </button>
            {shop.category_slugs.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all capitalize ${
                  selectedCat === c
                    ? 'bg-brand-teal text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-brand-teal'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-neutral-400 text-xs">
            Ushbu bo'limda mahsulotlar mavjud emas.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
