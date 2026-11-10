import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CustomerPanel } from '../components/CustomerPanel';
import { ProductCard } from '../components/ProductCard';
import { User, LogIn, Heart } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const { currentUser, wishlist, products, setIsAuthModalOpen, t } = useApp();

  // If not logged in, but user is viewing Wishlist
  if (!currentUser && tabParam === 'wishlist') {
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));

    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-in fade-in">
        {/* Guest Wishlist Header */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                {t.common.wishlist} ({wishlistProducts.length})
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Saqlab qo'yilgan yoqimli mahsulotlaringiz
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sevimlilarni saqlab qolish uchun kiring</span>
          </button>
        </div>

        {/* Wishlist Items Grid */}
        {wishlistProducts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-3">
            <Heart className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <div className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
              Sevimlilar ro'yxatingiz bo'sh
            </div>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              O'zingizga yoqqan mahsulotlarga yurakcha belgisini bosing va ular bu yerda saqlanadi!
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal-hover transition-all"
            >
              Mahsulotlarni ko'rish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {wishlistProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#141414] rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 text-brand-teal mx-auto flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">
              Shaxsiy kabinetga kirish
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Buyurtmalaringizni kuzatish va sevimlilaringizni boshqarish uchun profilingizga kiring.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3 px-6 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>{t.common.signInOrRegister}</span>
          </button>
        </div>
      </div>
    );
  }

  return <CustomerPanel />;
};
