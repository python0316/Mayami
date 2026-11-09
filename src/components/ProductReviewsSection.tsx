import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { 
  Star, 
  Send, 
  Store, 
  CheckCircle, 
  ShieldCheck, 
  ShieldAlert, 
  MessageSquare, 
  Plus, 
  Trash2, 
  AlertCircle,
  Truck,
  LogIn,
  ShoppingBag,
  Clock
} from 'lucide-react';

interface ProductReviewsSectionProps {
  product: Product;
  compact?: boolean;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ product, compact = false }) => {
  const { 
    reviews, 
    addReview, 
    replyToReview, 
    deleteReview, 
    currentUser, 
    adminSession, 
    shops,
    orders,
    setIsAuthModalOpen,
    addToCart
  } = useApp();

  const productReviews = reviews.filter(r => r.productId === product.id);
  const shop = shops.find(s => s.id === product.shopId);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  // Seller reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const isSellerOfProduct = adminSession?.role === 'superadmin' || adminSession?.shopId === product.shopId;

  // Clean current user phone digits (last 9 digits)
  const cleanUserPhone = useMemo(() => {
    return currentUser ? currentUser.phone.replace(/[^0-9]/g, '').slice(-9) : '';
  }, [currentUser]);

  // Check if current user has an order with status 'delivered' containing this product ("qo'liga olgan / yetkazilgan")
  const deliveredOrder = useMemo(() => {
    if (!currentUser) return null;
    return orders.find(order => {
      const isUserOrder =
        (order.userId && order.userId === currentUser.id) ||
        (order.customerPhone && order.customerPhone.replace(/[^0-9]/g, '').slice(-9) === cleanUserPhone);
      if (!isUserOrder) return false;
      if (order.status !== 'delivered') return false;
      return order.items.some(item => item.product.id === product.id);
    });
  }, [orders, currentUser, cleanUserPhone, product.id]);

  // Check if current user has an order for this product that is still pending/processing/shipped (hali qo'liga olmagan)
  const pendingOrder = useMemo(() => {
    if (!currentUser || deliveredOrder) return null;
    return orders.find(order => {
      const isUserOrder =
        (order.userId && order.userId === currentUser.id) ||
        (order.customerPhone && order.customerPhone.replace(/[^0-9]/g, '').slice(-9) === cleanUserPhone);
      if (!isUserOrder) return false;
      if (order.status === 'delivered') return false;
      return order.items.some(item => item.product.id === product.id);
    });
  }, [orders, currentUser, cleanUserPhone, product.id, deliveredOrder]);

  // Check if current user already submitted a review for this product
  const userReview = useMemo(() => {
    if (!currentUser) return null;
    return productReviews.find(r =>
      (r.userId && r.userId === currentUser.id) ||
      r.userName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase()
    );
  }, [productReviews, currentUser]);

  // Only delivered buyers who haven't reviewed yet can submit a review
  const canLeaveReview = !!currentUser && !!deliveredOrder && !userReview;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !currentUser || !deliveredOrder) return;

    addReview({
      productId: product.id,
      shopId: product.shopId,
      userId: currentUser.id,
      userPhone: currentUser.phone,
      userName: currentUser.fullName.trim(),
      rating,
      comment: comment.trim(),
      verifiedPurchase: true
    });

    setComment('');
    setSuccessMsg(true);
    setIsFormOpen(false);
    setTimeout(() => setSuccessMsg(false), 5000);
  };

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    const senderName = adminSession?.role === 'superadmin' ? 'Mayami SuperAdmin' : (shop?.name || "Do'kon ma'muriyati");
    const senderRole = adminSession?.role === 'superadmin' ? 'superadmin' : 'shop_owner';
    replyToReview(reviewId, replyText.trim(), senderName, senderRole);
    setReplyingReviewId(null);
    setReplyText('');
  };

  // Average Rating
  const avgRating = productReviews.length 
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : (product.rating || 5.0).toFixed(1);

  const starLabels: Record<number, string> = {
    1: "Juda yomon",
    2: "Qoniqarsiz",
    3: "O'rtacha",
    4: "Yaxshi",
    5: "A'lo darajada!"
  };

  return (
    <div className="space-y-4 max-w-2xl">
      
      {/* 1. Header & Rating Overview */}
      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black text-neutral-900 dark:text-white flex items-baseline gap-1">
            <span>{avgRating}</span>
            <span className="text-xs text-neutral-400 font-bold">/ 5.0</span>
          </div>
          <div>
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-neutral-500 font-bold block mt-0.5">
              {productReviews.length} ta xaridor sharhi
            </span>
          </div>
        </div>

        {/* Action Button: Opens review form only if user is verified buyer */}
        {canLeaveReview && (
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Star className="w-3.5 h-3.5 fill-white" />
            <span>{isFormOpen ? 'Bekor qilish' : 'Baho va sharh qoldirish'}</span>
          </button>
        )}
      </div>

      {/* 2. Uzum Market Style Verification Notices */}

      {/* Case A: Guest (Not logged in) */}
      {!currentUser && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Faqat mahsulotni xarid qilib, qo'liga olgan xaridorlar sharh qoldira oladi
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Uzum Market kabi xolis tizim: barcha tashrif buyuruvchilar sharhlarni erkin o'qiy oladi. Baho va sharh qoldirish uchun xarid qilingan profilingizga kiring.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs shrink-0 hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5 text-brand-teal" />
            <span>Tizimga kirish</span>
          </button>
        </div>
      )}

      {/* Case B: Logged in, but has not purchased this product */}
      {currentUser && !deliveredOrder && !pendingOrder && (
        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-neutral-900 dark:text-white">
                Ushbu tovarni xarid qilib, qabul qilib olmaguningizcha sharh qoldirib bo'lmaydi
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Uzum Market qoidasi kabi: sharhlar va 1-5 yulduzli baholar faqat tovarni real sotib olib, qo'liga olgan xaridorlar tomonidan qoldiriladi. Siz hali bu tovarni xarid qilib topshirib olmagansiz.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="px-4 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs shrink-0 hover:bg-brand-teal-hover transition-all flex items-center gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Savatga qo'shish</span>
          </button>
        </div>
      )}

      {/* Case C: Logged in, purchased, but order is still pending/processing/shipped (hali qo'liga olmagan) */}
      {currentUser && pendingOrder && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-3 animate-in fade-in">
          <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
              Buyurtmangiz yo'lda (#{pendingOrder.id})
            </div>
            <div className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Siz ushbu mahsulotni buyurtma qilgansiz. Tovarni yetkazib berish punktida yoki kuryerdan o'z qo'lingizga olib, qabul qilganingizdan ('Yetkazildi') so'ng baho va sharh qoldirish imkoniyati ochiladi.
            </div>
          </div>
        </div>
      )}

      {/* Case D: Delivered buyer already reviewed */}
      {currentUser && deliveredOrder && userReview && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Siz ushbu mahsulotni xarid qilib, o'z bahoingiz va sharhingizni qoldirgansiz!
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Fikringiz boshqa xaridorlar uchun juda foydali bo'ldi. Rahmat!
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-black shrink-0">
            {userReview.rating} ★ Bahoingiz
          </span>
        </div>
      )}

      {/* Case E: Delivered buyer eligible to review */}
      {canLeaveReview && !isFormOpen && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-bold text-emerald-900 dark:text-emerald-200">
              ✓ Tasdiqlangan xarid — Mahsulot sizga yetkazilgan (#{deliveredOrder.id})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Star className="w-3.5 h-3.5 fill-white" />
            <span>Baho va sharh qoldirish</span>
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Rahmat! Sharhingiz va bahoingiz tasdiqlangan xaridor sifatida muvaffaqiyatli chop etildi.</span>
        </div>
      )}

      {/* 3. Write Review Interactive Form (Only for verified buyers who received product) */}
      {canLeaveReview && isFormOpen && (
        <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-white dark:bg-[#18181C] border-2 border-brand-teal/40 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Mahsulotni baholash va sharh yozish</span>
            </h4>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Tasdiqlangan xarid
            </span>
          </div>

          {/* Interactive Star Picker (1-5 stars) */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Bahoingiz (1 dan 5 gacha yulduzchani tanlang): *
            </label>
            <div className="flex items-center gap-1.5 cursor-pointer">
              {Array.from({ length: 5 }).map((_, i) => {
                const starVal = i + 1;
                const isLit = hoverRating ? starVal <= hoverRating : starVal <= rating;
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starVal)}
                    className="p-1 focus:outline-none transform hover:scale-125 transition-transform"
                    title={`${starVal} yulduzcha`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isLit ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-600'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-3 font-black text-xs text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                {hoverRating || rating} / 5 — {starLabels[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Verified Customer Name (from profile) */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 mb-1">Xaridor</label>
            <div className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              <span>{currentUser.fullName}</span>
              <span className="text-[10px] text-emerald-500 font-bold">✓ Shaxsiy profil</span>
            </div>
          </div>

          {/* Review Textarea */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 mb-1">Sharh matni *</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Mahsulot sifati, o'lchami, yetkazib berilishi va taassurotlaringiz haqida xolis fikr yozing..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium focus:outline-none focus:border-brand-teal transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Sharhni e'lon qilish</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Reviews List (Transparent for everyone to read) */}
      <div className="space-y-3">
        {productReviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200/60 dark:border-neutral-800 text-neutral-400 text-xs space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-neutral-400" />
            <p className="font-bold text-neutral-600 dark:text-neutral-300">Hozircha sharhlar mavjud emas</p>
            <p className="text-[11px]">Mahsulotni birinchi bo'lib xarid qilib, topshirib olganingizdan so'ng birinchi sharhni qoldirishingiz mumkin!</p>
          </div>
        ) : (
          productReviews.map(rev => (
            <div key={rev.id} className="p-4 rounded-2xl bg-white dark:bg-[#1A1A1E] border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-2.5">
              
              {/* Reviewer Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-teal/20 text-brand-teal font-black text-xs flex items-center justify-center shrink-0">
                    {rev.userName[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-neutral-900 dark:text-white">{rev.userName}</span>
                    {rev.verifiedPurchase && (
                      <span className="ml-1.5 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        ✓ Tasdiqlangan xarid
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400 text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-xs text-neutral-700 dark:text-neutral-300 pl-9">
                {rev.comment}
              </p>

              {/* Official Seller Response */}
              {rev.reply && (
                <div className="ml-9 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      <Store className="w-3.5 h-3.5" />
                      <span>{rev.reply.senderName} rasmiy javobi:</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(rev.reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-800 dark:text-neutral-200 pl-4 border-l-2 border-emerald-500/40">
                    "{rev.reply.comment}"
                  </p>
                </div>
              )}

              {/* Seller Quick Reply Action (if logged in seller/admin and no reply yet) */}
              {isSellerOfProduct && !rev.reply && (
                <div className="pl-9 pt-1">
                  {replyingReviewId !== rev.id ? (
                    <button
                      onClick={() => {
                        setReplyingReviewId(rev.id);
                        setReplyText('');
                      }}
                      className="text-[11px] font-bold text-brand-teal hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Sotuvchi sifatida javob qaytarish</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-brand-teal/40 space-y-2 mt-2 animate-in fade-in">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                        Rasmiy javob yozish:
                      </span>
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Xaridorga javob yozing..."
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs font-bold focus:outline-none focus:border-brand-teal"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyingReviewId(null)}
                          className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-700 font-bold"
                        >
                          Bekor qilish
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(rev.id)}
                          className="px-3.5 py-1 bg-brand-teal text-white text-xs font-bold rounded-lg hover:bg-brand-teal-hover transition-all"
                        >
                          Yuborish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
};
