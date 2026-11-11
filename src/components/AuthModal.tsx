import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Phone, 
  Lock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  ShoppingBag,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatUzbekPhone, isCompleteUzbekPhone } from '../utils/phoneUtils';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    loginUser, 
    registerUser, 
    cart, 
    setIsCheckoutOpen,
    t 
  } = useApp();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('+998 ');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Guarantee empty and clean inputs whenever modal is opened
  useEffect(() => {
    if (isAuthModalOpen) {
      setPhone('+998 ');
      setFullName('');
      setPassword('');
      setError(null);
      setSuccess(null);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUzbekPhone(e.target.value);
    setPhone(formatted);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isCompleteUzbekPhone(phone)) {
      setError("Iltimos, telefon raqamingizni to'liq kiriting (+998 dan so'ng 9 ta raqam)!");
      return;
    }

    if (!password.trim()) {
      setError("Iltimos, parolingizni kiriting!");
      return;
    }

    if (tab === 'register') {
      if (!fullName.trim()) {
        setError("Iltimos, ism va familiyangizni kiriting!");
        return;
      }
      if (password.trim().length < 4) {
        setError("Parol kamida 4 ta belgidan iborat bo'lishi kerak!");
        return;
      }

      const res = registerUser(fullName, phone, password);
      if (!res.success) {
        setError(res.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
        return;
      }

      setSuccess(`Xush kelibsiz, ${fullName}! Ro'yxatdan muvaffaqiyatli o'tdingiz.`);
      setTimeout(() => {
        setSuccess(null);
        setIsAuthModalOpen(false);
        if (cart.length > 0) {
          setIsCheckoutOpen(true);
        }
      }, 1000);
    } else {
      const res = loginUser(phone, password);
      if (!res.success) {
        setError(res.message || "Kirishda xatolik yuz berdi");
        return;
      }

      setSuccess("Tizimga muvaffaqiyatli kirdingiz!");
      setTimeout(() => {
        setSuccess(null);
        setIsAuthModalOpen(false);
        if (cart.length > 0) {
          setIsCheckoutOpen(true);
        }
      }, 1000);
    }
  };

  const handleTabChange = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setError(null);
    setPassword('');
    setPhone('+998 ');
    setFullName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-[calc(70px+env(safe-area-inset-bottom,6px))] md:pb-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => { setIsAuthModalOpen(false); setError(null); }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mayami</span>
          </div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            {tab === 'login' ? 'Tizimga kirish' : "Ro'yxatdan o'tish"}
          </h2>

          {cart.length > 0 ? (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-2 justify-center">
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Xaridni rasmiylashtirish uchun tizimga kiring</span>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              Shaxsiy kabinet, buyurtmalar tarixi va chegirmalardan foydalaning
            </p>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-[#202025] text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-white dark:bg-[#202025] text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{error}</p>
              {error.includes("allaqachon") && (
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="mt-1 underline font-black text-rose-800 dark:text-rose-200"
                >
                  Kirish bo'limiga o'tish →
                </button>
              )}
              {error.includes("ro'yxatdan o'tmagan") && (
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="mt-1 underline font-black text-rose-800 dark:text-rose-200"
                >
                  Yangi hisob yaratish →
                </button>
              )}
            </div>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center space-y-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 animate-in zoom-in-95">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="font-bold text-sm text-emerald-800 dark:text-emerald-200">
              {success}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Ism va familiyangiz *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masalan: Azizbek Alimov"
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-neutral-50 dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                  Telefon raqamingiz *
                </label>
                <span className="text-[10px] text-neutral-400 font-semibold">
                  Format: +998 (XX) XXX-XX-XX
                </span>
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  autoComplete="off"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+998 (90) 123-45-67"
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-neutral-50 dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                Maxfiy parol *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-neutral-50 dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 absolute right-3 top-2.5 transition-colors"
                  title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>{tab === 'login' ? 'Tizimga kirish' : "Ro'yxatdan o'tish"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
