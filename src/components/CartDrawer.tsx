import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck 
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    setIsCheckoutOpen,
    setIsAuthModalOpen,
    currentUser,
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    cartTotal, 
    cartCount, 
    formatPrice,
    language, 
    t 
  } = useApp();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 300000;
  const progressToFreeShipping = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={() => setIsCartOpen(false)} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#141414] shadow-2xl flex flex-col justify-between border-l border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-teal" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {t.cart.title} ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                    {t.cart.emptyCart}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                    {t.cart.emptyCartSubtitle}
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all"
                >
                  {t.cart.startShopping}
                </button>
              </div>
            ) : (
              <>
                {/* Free Shipping Progress */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1B1B1F] border border-neutral-200/80 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                      <Truck className="w-4 h-4 text-brand-teal" />
                      {cartTotal >= FREE_SHIPPING_THRESHOLD ? (
                        <span className="text-emerald-500 font-bold">Yetkazib berish bepul!</span>
                      ) : (
                        <span>Bepul yetkazishgacha: {formatPrice(FREE_SHIPPING_THRESHOLD - cartTotal)}</span>
                      )}
                    </span>
                    <span className="text-brand-teal font-bold">{Math.round(progressToFreeShipping)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-brand-teal rounded-full transition-all duration-300"
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {cart.map((item, index) => {
                    const title = item.product.name?.[language] || item.product.short_title?.[language] || item.product.title[language] || item.product.title.uz;
                    return (
                      <div
                        key={`${item.product.id}-${item.selectedSize}-${index}`}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1E] border border-neutral-200/80 dark:border-neutral-800"
                      >
                        <img
                          src={item.product.image_url}
                          alt={title}
                          className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {title}
                          </h4>
                          <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                            {item.selectedSize && <span>O'lcham: <b>{item.selectedSize}</b></span>}
                            {item.selectedColor && (
                              <span className="flex items-center gap-1">
                                Rang: <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.selectedColor.hex }} />
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-extrabold text-brand-teal mt-1">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                        </div>

                        {/* Quantity Stepper & Delete */}
                        <div className="flex flex-col items-end justify-between space-y-2">
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                            className="text-neutral-400 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center bg-white dark:bg-[#252528] rounded-lg border border-neutral-200 dark:border-neutral-700">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-l-lg"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-r-lg"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#17171A] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>{t.cart.itemsTotal}</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>{t.cart.deliveryFee}</span>
                  <span className="font-semibold text-emerald-500">
                    {cartTotal >= FREE_SHIPPING_THRESHOLD ? t.cart.freeDelivery : formatPrice(15000)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <span>{t.cart.total}</span>
                  <span className="text-brand-teal text-base">
                    {formatPrice(cartTotal + (cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15000))}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-teal text-white font-bold text-sm hover:bg-brand-teal-hover active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>{t.cart.checkout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};