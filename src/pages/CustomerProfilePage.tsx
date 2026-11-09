import React from 'react';
import { useApp } from '../context/AppContext';
import { CustomerPanel } from '../components/CustomerPanel';
import { User, LogIn, Sparkles } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { currentUser, setIsAuthModalOpen, t } = useApp();

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
