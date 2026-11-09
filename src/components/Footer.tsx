import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Phone, Send, Store, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { theme, t } = useApp();

  return (
    <footer className="w-full bg-neutral-100 dark:bg-[#0D0D0F] border-t border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs transition-colors mt-12">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Col 1: Logo & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/">
              <img
                src={theme === 'dark' ? '/icons/logo-white.svg' : '/icons/logo-dark.svg'}
                alt="Mayami"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs leading-relaxed max-w-sm text-neutral-500 dark:text-neutral-400">
              {t.footer.aboutCompany}
            </p>
            <div className="pt-2 flex items-center space-x-3 text-neutral-500">
              <a href="https://t.me/mall2026" target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white dark:bg-neutral-800 hover:text-brand-teal transition-colors shadow-sm">
                <Send className="w-4 h-4" />
              </a>
              <a href="tel:+998886782204" className="p-2 rounded-xl bg-white dark:bg-neutral-800 hover:text-brand-teal transition-colors shadow-sm">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: For Shoppers */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs tracking-wider uppercase">
              {t.footer.forShoppers}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-to-buy" onClick={(e) => { e.preventDefault(); alert("Mayami da xarid qilish juda oson: mahsulotni tanlang, savatga qo'shing va buyurtma bering!"); }} className="hover:text-brand-teal transition-colors">{t.footer.howToBuy}</a></li>
              <li><a href="#delivery" onClick={(e) => { e.preventDefault(); alert("Yetkazib berish Toshkent va butun O'zbekiston bo'ylab 3-5 kun ichida amalga oshiriladi."); }} className="hover:text-brand-teal transition-colors">{t.footer.deliveryAndPayment}</a></li>
              <li><a href="#returns" onClick={(e) => { e.preventDefault(); alert("Mahsulotni 14 kun ichida bepul qaytarish yoki almashtirish imkoniyati mavjud."); }} className="hover:text-brand-teal transition-colors">{t.footer.returns}</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); alert("Savollar va takliflar uchun: +998 88 678 22 04"); }} className="hover:text-brand-teal transition-colors">{t.footer.faq}</a></li>
              <li><Link to="/weather" className="hover:text-brand-teal transition-colors font-medium">🌤️ {t.common.weather || "Ob-havo"}</Link></li>
              <li><Link to="/prayer" className="hover:text-emerald-500 transition-colors font-medium">🕌 {t.common.prayer || "Namoz vaqtlari"}</Link></li>
            </ul>
          </div>

          {/* Col 3: For Sellers (B2B) */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs tracking-wider uppercase">
              {t.footer.forSellers}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/admin"
                  className="hover:text-brand-teal font-bold text-brand-teal flex items-center gap-1 transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{t.footer.sellerDashboard}</span>
                </Link>
              </li>
              <li><Link to="/admin" className="hover:text-brand-teal transition-colors">{t.footer.openShop}</Link></li>
              <li><a href="#rules" onClick={(e) => { e.preventDefault(); alert("Sotuvchilar faqat sifatli va original mahsulotlarni sotishlari shart."); }} className="hover:text-brand-teal transition-colors">{t.footer.sellerRules}</a></li>
              <li><Link to="/admin" className="hover:text-brand-teal transition-colors">{t.footer.storyMarketing}</Link></li>
            </ul>
          </div>

          {/* Col 4: Help & Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs tracking-wider uppercase">
              {t.footer.helpSupport}
            </h4>
            <div className="space-y-2">
              <div className="font-bold text-neutral-900 dark:text-white text-sm">
                +998 88 678 22 04
              </div>
              <div className="text-[11px] text-neutral-400">
                {t.footer.workHours}
              </div>
              <div className="pt-2">
                <span className="font-semibold block text-[11px] text-neutral-400 uppercase mb-1.5">
                  {t.footer.paymentsAccepted}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-extrabold text-[#00CCCC] text-[10px]">Payme</span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-extrabold text-[#0073FF] text-[10px]">Click</span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-extrabold text-[#7000FF] text-[10px]">Uzum</span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold text-[10px]">HUMO</span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold text-[10px]">UZCARD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <div>{t.footer.copyright}</div>
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-neutral-400 hover:text-purple-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal (/admin)</span>
            </Link>
            <span>•</span>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">Maxfiylik siyosati</a>
            <span>•</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline">Foydalanuvchi shartnomasi</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
