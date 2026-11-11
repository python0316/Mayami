import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Truck, 
  CheckCircle, 
  Clock, 
  Package, 
  ArrowRight,
  ExternalLink,
  LogOut,
  Plus,
  Check,
  Star,
  Sparkles,
  Flame,
  RotateCcw,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { getLocalizedProductText, getLocalizedColorName } from '../utils/translator';

export const CustomerPanel: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser,
    logoutUser,
    setIsAuthModalOpen,
    guestVisitorId,
    clearGuestStories,
    viewedStoryIds,
    cart,
    setIsCartOpen,
    orders, 
    wishlist, 
    products, 
    language, 
    t, 
    setSelectedProduct,
    addCustomerAddress,
    updateOrderStatus
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'cart' | 'stories' | 'addresses'>(
    tabParam === 'wishlist' ? 'wishlist' : 
    tabParam === 'addresses' ? 'addresses' : 
    tabParam === 'cart' ? 'cart' : 
    tabParam === 'stories' ? 'stories' : 'orders'
  );

  useEffect(() => {
    if (tabParam === 'wishlist' || tabParam === 'addresses' || tabParam === 'orders' || tabParam === 'cart' || tabParam === 'stories') {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);
  const [newAddressText, setNewAddressText] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Filter only this specific user's or guest's orders (isolated session)
  const userOrders = useMemo(() => {
    if (currentUser) {
      const cleanCurrentPhone = currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, '').slice(-9) : '';
      return orders.filter(ord => {
        if (ord.userId && ord.userId === currentUser.id) return true;
        if (cleanCurrentPhone && ord.customerPhone) {
          const cleanOrdPhone = ord.customerPhone.replace(/[^0-9]/g, '').slice(-9);
          if (cleanOrdPhone && cleanOrdPhone === cleanCurrentPhone) return true;
        }
        return false;
      });
    }
    // Guest orders are strictly filtered by unique guest device ID
    return orders.filter(ord => ord.guestVisitorId === guestVisitorId);
  }, [orders, currentUser, guestVisitorId]);

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;
    addCustomerAddress(newAddressText.trim());
    setNewAddressText('');
    setIsAddingAddress(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400';
      case 'shipped': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
      case 'processing': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
      default: return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return t.panels.orderDelivered;
      case 'shipped': return t.panels.orderShipped;
      case 'processing': return t.panels.orderProcessing;
      case 'cancelled': return t.panels.orderCancelled;
      default: return t.panels.orderPending;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Profile Overview Card: Dynamic for Registered User OR Clean Uzum-style Personal Guest Session */}
      {currentUser ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white shadow-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-teal/20 text-brand-teal flex items-center justify-center font-black text-2xl border border-brand-teal/30 shrink-0">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                currentUser.fullName.trim().charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">{currentUser.fullName}</h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {currentUser.phone} {currentUser.email ? `• ${currentUser.email}` : ''}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-brand-teal">
                  Mayami Xaridori
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats & Logout */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-white/10 text-center">
                <div className="text-lg font-black text-white">{userOrders.length}</div>
                <div className="text-[10px] text-neutral-400 uppercase">Buyurtmalar</div>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-white/10 text-center">
                <div className="text-lg font-black text-rose-400">{wishlist.length}</div>
                <div className="text-[10px] text-neutral-400 uppercase">Sevimlilar</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      ) : (
        /* Uzum Market-style Personal Cabinet Header for Guest Visitor */
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white shadow-xl border border-neutral-800 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-teal/20 text-brand-teal flex items-center justify-center font-black text-2xl border border-brand-teal/30 shrink-0">
                <User className="w-8 h-8 text-brand-teal" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black">Shaxsiy kabinet</h1>
                <p className="text-xs text-neutral-400 mt-1 max-w-lg">
                  Buyurtmalaringizni kuzatish va xaridlarni to'liq boshqarish uchun profilingizga kiring.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-neutral-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-brand-teal" />
                    Shaxsiy qurilma seansi
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <User className="w-4 h-4" />
              <span>Kirish / Ro'yxatdan o'tish</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-800">
            <div 
              onClick={() => setActiveTab('wishlist')}
              className={`p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${activeTab === 'wishlist' ? 'ring-2 ring-brand-teal' : ''}`}
            >
              <div className="text-xl font-black text-rose-400">{wishlist.length}</div>
              <div className="text-[11px] text-neutral-400 font-bold uppercase mt-0.5">Sevimlilar</div>
            </div>
            <div 
              onClick={() => setActiveTab('cart')}
              className={`p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${activeTab === 'cart' ? 'ring-2 ring-brand-teal' : ''}`}
            >
              <div className="text-xl font-black text-amber-400">{cart.length}</div>
              <div className="text-[11px] text-neutral-400 font-bold uppercase mt-0.5">Savatchada</div>
            </div>
            <div 
              onClick={() => setActiveTab('stories')}
              className={`p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${activeTab === 'stories' ? 'ring-2 ring-brand-teal' : ''}`}
            >
              <div className="text-xl font-black text-teal-400">{viewedStoryIds.length}</div>
              <div className="text-[11px] text-neutral-400 font-bold uppercase mt-0.5">Ko'rilgan stories</div>
            </div>
            <div 
              onClick={() => setActiveTab('orders')}
              className={`p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer ${activeTab === 'orders' ? 'ring-2 ring-brand-teal' : ''}`}
            >
              <div className="text-xl font-black text-white">{userOrders.length}</div>
              <div className="text-[11px] text-neutral-400 font-bold uppercase mt-0.5">Buyurtmalar</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-brand-teal text-white shadow'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.panels.myOrders} ({userOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'wishlist'
              ? 'bg-brand-teal text-white shadow'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-400" />
          <span>{t.panels.myWishlist} ({wishlistProducts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'cart'
              ? 'bg-brand-teal text-white shadow'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Package className="w-4 h-4 text-amber-400" />
          <span>Savatcham ({cart.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'stories'
              ? 'bg-brand-teal text-white shadow'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Flame className="w-4 h-4 text-teal-400" />
          <span>Ko'rilgan storieslar ({viewedStoryIds.length})</span>
        </button>
        {currentUser && (
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-brand-teal text-white shadow'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{t.panels.myAddresses} ({currentUser.addresses?.length || 0})</span>
          </button>
        )}
      </div>

      {/* 1. Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-3">
              <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
              <div className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                Sizda hali buyurtmalar mavjud emas
              </div>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Mayami keng assortimentidan o'zingizga yoqqan mahsulotlarni tanlab, buyurtma bering!
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal-hover transition-all cursor-pointer"
              >
                Xaridni boshlash
              </button>
            </div>
          ) : (
            userOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                      {ord.id}
                    </span>
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {ord.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ord.status === 'shipped' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'delivered')}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Tovarni kuryerdan yoki yetkazish punktidan oldim"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Tovarni qabul qildim</span>
                      </button>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(ord.status)}`}>
                      {getStatusText(ord.status)}
                    </span>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="py-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 mb-1.5">
                    <span className={ord.status === 'pending' || ord.status === 'processing' || ord.status === 'shipped' || ord.status === 'delivered' ? 'text-brand-teal font-bold' : ''}>
                      1. Qabul qilindi
                    </span>
                    <span className={ord.status === 'processing' || ord.status === 'shipped' || ord.status === 'delivered' ? 'text-brand-teal font-bold' : ''}>
                      2. Qadoqlanmoqda
                    </span>
                    <span className={ord.status === 'shipped' || ord.status === 'delivered' ? 'text-brand-teal font-bold' : ''}>
                      3. Kuryer yo'lda
                    </span>
                    <span className={ord.status === 'delivered' ? 'text-emerald-500 font-bold' : ''}>
                      4. Yetkazildi
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-teal rounded-full transition-all duration-500"
                      style={{ 
                        width: ord.status === 'delivered' ? '100%' : ord.status === 'shipped' ? '75%' : ord.status === 'processing' ? '45%' : '15%'
                      }}
                    />
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-2 pt-1">
                  {ord.items.map((it, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedProduct(it.product)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={it.selectedImage || it.selectedColor?.image_url || it.product.image_url}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-neutral-900 dark:text-white max-w-sm truncate">
                            {getLocalizedProductText(it.product, 'title', language)}
                          </div>
                          <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            <span>Miqdor: {it.quantity} dona</span>
                            {it.selectedSize && <span>• O'lcham: <b className="text-neutral-700 dark:text-neutral-300">{it.selectedSize}</b></span>}
                            {it.selectedColor && (
                              <span className="flex items-center gap-1">
                                • Rang: 
                                <span className="w-2.5 h-2.5 rounded-full inline-block border border-neutral-300 dark:border-neutral-600" style={{ backgroundColor: it.selectedColor.hex }} />
                                <b className="text-neutral-700 dark:text-neutral-300">{getLocalizedColorName(it.selectedColor, language)}</b>
                              </span>
                            )}
                          </div>
                          {ord.status === 'delivered' ? (
                            <Link
                              to={`/product/${it.product.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(it.product);
                              }}
                              className="mt-1 text-[11px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
                            >
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>Baho berish va sharh qoldirish</span>
                            </Link>
                          ) : (
                            <div className="mt-1 text-[10px] text-neutral-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              <span>Tovarni qo'lga olgach baholash mumkin</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
                        {(it.product.price * it.quantity).toLocaleString('ru-RU')} {t.common.currency}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Address & Payment Total */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <div className="text-neutral-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                    <span>{ord.region}, {ord.address}</span>
                  </div>
                  <div className="font-extrabold text-neutral-900 dark:text-white">
                    Jami to'lov: <span className="text-brand-teal text-sm">{ord.totalAmount.toLocaleString('ru-RU')} {t.common.currency}</span> ({ord.paymentMethod.toUpperCase()})
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs space-y-2">
              <Heart className="w-10 h-10 text-rose-300 mx-auto" />
              <div className="font-bold text-neutral-700 dark:text-neutral-300">Sevimlilar ro'yxatingiz bo'sh</div>
              <p>O'zingizga yoqqan mahsulotlarga yurakcha belgisini bosing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {wishlistProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Cart Tab */}
      {activeTab === 'cart' && (
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs space-y-2">
              <ShoppingBag className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
              <div className="font-bold text-neutral-700 dark:text-neutral-300">Savatchangiz bo'sh</div>
              <p>O'zingizga yoqqan mahsulotlarni savatchaga qo'shing!</p>
              <button
                onClick={() => navigate('/')}
                className="mt-2 px-5 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs cursor-pointer"
              >
                Katalogga o'tish
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-sm font-bold text-neutral-900 dark:text-white">Savatchadagi tovarlar ({cart.length})</span>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-4 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Savatchani ochish va xarid qilish</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cart.map((it, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 flex items-center gap-3">
                    <img src={it.selectedImage || it.product.image_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">{getLocalizedProductText(it.product, 'title', language)}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">Miqdor: {it.quantity} dona</div>
                      <div className="text-xs font-black text-brand-teal mt-1">{(it.product.price * it.quantity).toLocaleString('ru-RU')} {t.common.currency}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Stories Tab */}
      {activeTab === 'stories' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Siz ko'rgan storieslar tarixi ({viewedStoryIds.length} ta)
                </h3>
                <p className="text-xs text-neutral-500">
                  Ushbu ro'yxat faqat sizning qurilmangizga tegishli va boshqa foydalanuvchilar bilan aralashmaydi.
                </p>
              </div>
            </div>

            {viewedStoryIds.length > 0 && (
              <button
                type="button"
                onClick={clearGuestStories}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-brand-teal" />
                <span>Storieslarni qayta rangli qilish</span>
              </button>
            )}
          </div>

          {viewedStoryIds.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Eye className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto" />
              <p className="text-xs text-neutral-500 font-medium">Siz hali birorta ham stories ko'rmagansiz. Barcha storieslar rangli halqa bilan turibdi!</p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
              Siz {viewedStoryIds.length} ta do'kon storiesini tomosha qildingiz. Agar ularni yana rangli ko'rishni xohlasangiz, yuqoridagi <b>"Storieslarni qayta rangli qilish"</b> tugmasini bosing.
            </div>
          )}
        </div>
      )}

      {/* 5. Saved Addresses Tab (Only for Logged-In User) */}
      {currentUser && activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Yetkazib berish manzillari ({currentUser.addresses?.length || 0})
            </h3>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-3 py-1.5 rounded-xl bg-brand-teal text-white text-xs font-bold flex items-center gap-1.5 hover:bg-brand-teal-hover transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi manzil qo'shish</span>
            </button>
          </div>

          {isAddingAddress && (
            <form onSubmit={handleSaveNewAddress} className="p-4 rounded-2xl bg-white dark:bg-[#141414] border border-brand-teal/40 space-y-3 animate-in fade-in">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Yangi manzilni kiriting:
              </label>
              <input
                type="text"
                required
                value={newAddressText}
                onChange={(e) => setNewAddressText(e.target.value)}
                placeholder="Masalan: Toshkent sh., Chilonzor 5-mavze, 14-uy, 2-xonadon"
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-teal"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-teal text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Saqlash</span>
                </button>
              </div>
            </form>
          )}

          {(!currentUser.addresses || currentUser.addresses.length === 0) ? (
            <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs space-y-2">
              <MapPin className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto" />
              <div>Sizda hali saqlangan manzil mavjud emas.</div>
              <p className="text-[11px] text-neutral-400">Buyurtma berganingizda manzilingiz avtomatik tarzda ushbu ro'yxatga saqlanadi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentUser.addresses.map((addr, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-[#141414] border-2 border-brand-teal/40 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal text-[10px] font-bold">
                      {idx === 0 ? "Asosiy manzil" : `Manzil #${idx + 1}`}
                    </span>
                    <MapPin className="w-4 h-4 text-brand-teal" />
                  </div>
                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 pt-1">
                    {addr}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
