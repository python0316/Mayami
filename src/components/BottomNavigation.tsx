import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  Layers, 
  ShoppingBag, 
  Heart, 
  User, 
  ShieldCheck, 
  Store 
} from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    cartCount, 
    wishlist, 
    setIsCartOpen, 
    setIsAuthModalOpen, 
    isMobileCatalogOpen,
    setIsMobileCatalogOpen,
    currentUser, 
    adminSession,
    setSelectedCategorySlug,
    setSearchQuery,
    selectedCategorySlug,
    searchQuery,
    t 
  } = useApp();

  const searchParams = new URLSearchParams(location.search);
  const isHomeActive = location.pathname === '/' && !selectedCategorySlug && !searchQuery && !isMobileCatalogOpen;
  const isCatalogActive = isMobileCatalogOpen || location.pathname.startsWith('/category');
  const isWishlistActive = location.pathname === '/profile' && searchParams.get('tab') === 'wishlist';
  const isProfileActive = (location.pathname === '/profile' && searchParams.get('tab') !== 'wishlist') || (!currentUser && !adminSession && false);
  const isAdminActive = location.pathname === '/admin';

  const handleHomeClick = () => {
    setSelectedCategorySlug(null);
    setSearchQuery('');
    setIsMobileCatalogOpen(false);
    navigate('/');
  };

  const handleCatalogClick = () => {
    setIsMobileCatalogOpen(!isMobileCatalogOpen);
  };

  const handleCartClick = () => {
    setIsMobileCatalogOpen(false);
    setIsCartOpen(true);
  };

  const handleWishlistClick = () => {
    setIsMobileCatalogOpen(false);
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    navigate('/profile?tab=wishlist');
  };

  const handleProfileClick = () => {
    setIsMobileCatalogOpen(false);
    if (currentUser) {
      navigate('/profile');
    } else if (adminSession) {
      navigate('/admin');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // Safe area bottom inset class for modern iPhones
  return (
    <nav 
      aria-label="Pastki navigatsiya"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-xl border-t border-neutral-200/90 dark:border-neutral-800/90 px-2 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] shadow-[0_-4px_25px_rgba(0,0,0,0.08)] transition-colors select-none"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
        {/* 1. Bosh sahifa */}
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all group ${
            isHomeActive
              ? 'text-brand-teal font-extrabold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform duration-200 ${isHomeActive ? 'scale-110 stroke-[2.5]' : 'group-hover:scale-105'}`} />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-teal" />
            )}
          </div>
          <span className="text-[10px] leading-tight mt-1 truncate max-w-[64px]">
            Bosh sahifa
          </span>
        </button>

        {/* 2. Katalog */}
        <button
          onClick={handleCatalogClick}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all group ${
            isCatalogActive
              ? 'text-brand-teal font-extrabold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Layers className={`w-5 h-5 transition-transform duration-200 ${isCatalogActive ? 'scale-110 stroke-[2.5]' : 'group-hover:scale-105'}`} />
            {isCatalogActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-teal" />
            )}
          </div>
          <span className="text-[10px] leading-tight mt-1 truncate max-w-[64px]">
            {t.common.catalog}
          </span>
        </button>

        {/* 3. Savat */}
        <button
          onClick={handleCartClick}
          className="flex flex-col items-center justify-center py-1 px-1 transition-all text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white group relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 h-4 min-w-[16px] rounded-full bg-brand-teal text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight mt-1 truncate max-w-[64px]">
            {t.common.cart}
          </span>
        </button>

        {/* 4. Sevimlilar */}
        <button
          onClick={handleWishlistClick}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all group relative ${
            isWishlistActive
              ? 'text-brand-teal font-extrabold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
              wishlist.length > 0 || isWishlistActive ? 'fill-rose-500 text-rose-500' : ''
            }`} />
            {isWishlistActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-teal" />
            )}
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 h-4 min-w-[16px] rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                {wishlist.length > 99 ? '99+' : wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight mt-1 truncate max-w-[64px]">
            {t.common.wishlist}
          </span>
        </button>

        {/* 5. Profil / Kabinet / Admin */}
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all group ${
            isProfileActive || isAdminActive
              ? 'text-brand-teal font-extrabold'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            {adminSession ? (
              adminSession.role === 'superadmin' ? (
                <ShieldCheck className="w-5 h-5 text-purple-500" />
              ) : (
                <Store className="w-5 h-5 text-amber-500" />
              )
            ) : currentUser ? (
              <div className="w-5 h-5 rounded-full bg-brand-teal/20 text-brand-teal font-black text-[11px] flex items-center justify-center border border-brand-teal/40">
                {currentUser.fullName.trim().charAt(0).toUpperCase()}
              </div>
            ) : (
              <User className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
            )}
            {adminSession && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
            )}
          </div>
          <span className="text-[10px] leading-tight mt-1 truncate max-w-[64px]">
            {currentUser 
              ? (currentUser.fullName.split(' ')[0] || 'Profil') 
              : adminSession 
                ? (adminSession.role === 'superadmin' ? 'SuperAdmin' : 'Sotuvchi') 
                : 'Kabinet'}
          </span>
        </button>
      </div>
    </nav>
  );
};