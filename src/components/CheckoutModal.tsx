import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCircle, 
  CreditCard, 
  Banknote, 
  MapPin, 
  Phone, 
  User, 
  Truck, 
  ShoppingBag,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { formatUzbekPhone, isCompleteUzbekPhone } from '../utils/phoneUtils';

export const CheckoutModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    setIsAuthModalOpen,
    cart, 
    cartTotal, 
    formatPrice,
    createOrder, 
    currentUser,
    t 
  } = useApp();

  // Inputs MUST start completely clean (no hardcoded or auto-filled data)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'payme' | 'click' | 'uzum' | 'cash'>('payme');
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Whenever modal opens, guarantee clean and fresh empty inputs
  useEffect(() => {
    if (isCheckoutOpen) {
      setFullName('');
      setPhone('+998 ');
      setRegion('');
      setAddress('');
      setError(null);
      setOrderSuccessId(null);
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  // Enforce customer login before checkout
  if (!currentUser) {
    setIsCheckoutOpen(false);
    setIsAuthModalOpen(true);
    return null;
  }

  const FREE_SHIPPING_THRESHOLD = 300000;
  const shippingFee = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15000;
  const finalTotal = cartTotal + shippingFee;

  const regions = [
    'Toshkent shahar',
    'Toshkent viloyati',
    'Samarqand viloyati',
    'Farg‘ona viloyati',
    'Andijon viloyati',
    'Namangan viloyati',
    'Buxoro viloyati',
    'Xorazm viloyati',
    'Qashqadaryo viloyati',
    'Surxondaryo viloyati',
    'Jizzax viloyati',
    'Sirdaryo viloyati',
    'Navoiy viloyati',
    'Qoraqalpog‘iston Respublikasi'
  ];

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError("Iltimos, ism va familiyangizni to'liq kiriting!");
      return;
    }

    if (!isCompleteUzbekPhone(phone)) {
      setError("Iltimos, telefon raqamingizni to'liq kiriting (+998 dan so'ng 9 ta raqam)!");
      return;
    }

    if (!region || !region.trim()) {
      setError("Iltimos, yetkazib berish viloyati yoki shahrini tanlang!");
      return;
    }

    if (!address.trim() || address.trim().length < 4) {
      setError("Iltimos, aniq yetkazib berish manzilingizni (tuman, ko'cha, uy raqami) kiriting!");
      return;
    }

    const shopIds = Array.from(new Set(cart.map(c => c.product.shopId)));

    const newOrder = createOrder({
      items: [...cart],
      totalAmount: finalTotal,
      shippingFee,
      customerName: fullName.trim(),
      customerPhone: formatUzbekPhone(phone),
      region: region.trim(),
      address: address.trim(),
      paymentMethod,
      shopIds
    });

    setOrderSuccessId(newOrder.id);
  };

  const handleFinish = () => {
    setOrderSuccessId(null);
    setIsCheckoutOpen(false);
    navigate('/profile');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="w-5 h-5 text-brand-teal" />
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              {t.checkout.title}
            </h2>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderSuccessId ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                {t.checkout.orderSuccess}
              </h3>
              <p className="text-xs text-neutral-500">
                {t.checkout.orderId}: <span className="font-bold text-brand-teal">{orderSuccessId}</span>
              </p>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              {t.checkout.orderTrackingText}
            </p>

            <button
              onClick={handleFinish}
              className="px-6 py-3 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all shadow-md inline-flex items-center gap-2"
            >
              <span>{t.checkout.goToOrders}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Delivery Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-teal" />
                <span>{t.checkout.deliveryInfo}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                    {t.checkout.fullName} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setError(null);
                      }}
                      placeholder="Ism va familiyangizni kiriting *"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                    {t.checkout.phone} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(formatUzbekPhone(e.target.value));
                        setError(null);
                      }}
                      placeholder="+998 (__) ___-__-__ *"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal font-mono font-bold transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                    {t.checkout.region} *
                  </label>
                  <select
                    required
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal transition-all"
                  >
                    <option value="" disabled>Viloyat / Shaharni tanlang *</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                    {t.checkout.address} *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setError(null);
                      }}
                      placeholder="Tuman, ko'cha, uy va xonadon raqamini kiriting *"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1E1E22] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-teal" />
                <span>{t.checkout.paymentMethod}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div
                  onClick={() => setPaymentMethod('payme')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                    paymentMethod === 'payme'
                      ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xs font-extrabold text-[#00CCCC]">Payme</span>
                  <span className="text-[10px] text-neutral-400">Uzcard / Humo</span>
                </div>

                <div
                  onClick={() => setPaymentMethod('click')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                    paymentMethod === 'click'
                      ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xs font-extrabold text-[#0073FF]">Click Up</span>
                  <span className="text-[10px] text-neutral-400">Uzcard / Humo</span>
                </div>

                <div
                  onClick={() => setPaymentMethod('uzum')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                    paymentMethod === 'uzum'
                      ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xs font-extrabold text-[#7000FF]">Uzum Bank</span>
                  <span className="text-[10px] text-neutral-400">0% komissiya</span>
                </div>

                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                    paymentMethod === 'cash'
                      ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px] font-bold">Naqd / Karta</span>
                  <span className="text-[10px] text-neutral-400">Yetkazilganda</span>
                </div>
              </div>
            </div>

            {/* 3. Summary & Submit */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1E] border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>{t.cart.itemsTotal} ({cart.length} ta)</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>{t.cart.deliveryFee}</span>
                <span className="font-semibold text-emerald-500">
                  {shippingFee === 0 ? t.cart.freeDelivery : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span>{t.cart.total}</span>
                <span className="text-brand-teal text-base">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-brand-teal text-white font-bold text-sm hover:bg-brand-teal-hover active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>{t.checkout.confirmOrder} ({formatPrice(finalTotal)})</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
