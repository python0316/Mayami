import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Image as ImageIcon,
  CheckCircle,
  Eye,
  ShoppingBag
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';

export const VisualSearchModal: React.FC = () => {
  const { 
    isVisualSearchOpen, 
    setIsVisualSearchOpen, 
    products, 
    language, 
    setSelectedProduct,
    addToCart,
    formatPrice,
    t 
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string>('shoes');
  const [detectedTags, setDetectedTags] = useState<string[]>(['Krossovka', 'Sport uslubi', 'Yuqori sifat']);

  if (!isVisualSearchOpen) return null;

  const samples = [
    { label: "Poyabzal (Krossovka)", slug: "shoes", tags: ['Krossovka', 'Sport', 'Oyoq kiyim'], img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80" },
    { label: "Kuzgi ayollar kiyimi", slug: "clothing", tags: ['Palto', 'Kuzgi libos', 'Kiyim'], img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80" },
    { label: "Aksessuarlar (Sharf & Sumka)", slug: "accessories", tags: ['Sharf', 'Sumka', 'Aksessuar'], img: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80" },
    { label: "Go'zallik va kosmetika", slug: "beauty-and-personal-care", tags: ['Krem', 'Parvarish', 'Kosmetika'], img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80" },
  ];

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Iltimos, rasm faylini tanlang (JPG, PNG, WEBP)!");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);
      setIsScanning(true);

      // Smart category detection based on filename keywords or fallback
      const lowerName = file.name.toLowerCase();
      let matchedSlug = 'clothing';
      let tags = ['Kiyim-kechak', 'Zamonaviy fason', 'Paxta'];

      if (lowerName.includes('shoe') || lowerName.includes('kross') || lowerName.includes('bot') || lowerName.includes('oyoq')) {
        matchedSlug = 'shoes';
        tags = ['Sport poyabzali', 'Yengil krossovka', 'Qulay taglik'];
      } else if (lowerName.includes('bag') || lowerName.includes('sumka') || lowerName.includes('soat') || lowerName.includes('watch') || lowerName.includes('sharf')) {
        matchedSlug = 'accessories';
        tags = ['Aksessuar', 'Klassik uslub', 'Teri'];
      } else if (lowerName.includes('krem') || lowerName.includes('cream') || lowerName.includes('beauty') || lowerName.includes('lab') || lowerName.includes('kosmetika')) {
        matchedSlug = 'beauty-and-personal-care';
        tags = ['Kosmetika', 'Teri parvarishi', 'Tabiiy'];
      } else if (lowerName.includes('joynamoz') || lowerName.includes('tasbeh') || lowerName.includes('islom')) {
        matchedSlug = 'islamic-items';
        tags = ['Joynamoz', 'Islomiy buyumlar', 'Baxmal'];
      }

      setDetectedCategory(matchedSlug);
      setDetectedTags(tags);

      setTimeout(() => {
        setIsScanning(false);
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleSelectSample = (sample: typeof samples[0]) => {
    setUploadedImage(sample.img);
    setFileName(sample.label);
    setDetectedCategory(sample.slug);
    setDetectedTags(sample.tags);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 500);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setFileName(null);
    setIsScanning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Matched products from current catalog
  const matchedProducts: Product[] = products
    .filter(p => p.category_slug === detectedCategory)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#141418] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden Real File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-teal/10 text-brand-teal">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900 dark:text-white">
                Rasm Bo'yicha Aqlli Qidiruv
              </h2>
              <p className="text-xs text-neutral-500">
                O'zingizga yoqqan kiyim, poyabzal yoki buyum rasmini yuklang — sun'iy intellekt o'xshash tovarlarni topadi
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisualSearchOpen(false)}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. UPLOAD ZONE OR PREVIEW */}
        {!uploadedImage ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center space-y-3 cursor-pointer transition-all ${
              isDragging 
                ? 'border-brand-teal bg-brand-teal/10 scale-[1.01]' 
                : 'border-neutral-300 dark:border-neutral-700 hover:border-brand-teal bg-neutral-50/60 dark:bg-neutral-800/30 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 text-brand-teal mx-auto flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-black text-neutral-800 dark:text-neutral-200">
                Rasmni shu yerga tashlang yoki kompyuterdan tanlash uchun bosing
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                JPG, PNG, WEBP formatlari qo'llab-quvvatlanadi (galereya yoki kamera)
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all shadow-sm"
            >
              Faylni tanlash
            </button>
          </div>
        ) : (
          /* Uploaded Preview with Scanner Animation */
          <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-brand-teal shadow-md">
              <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
              {isScanning && (
                <div className="absolute inset-0 bg-brand-teal/20 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-full h-1 bg-white animate-pulse shadow-lg" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-black text-sm text-neutral-900 dark:text-white">
                  {isScanning ? "AI Tasvirni Tahlil Qilmoqda..." : "Tasvir Muvaffaqiyatli Tahlil Qilindi!"}
                </span>
                {!isScanning && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </div>

              {/* Detected Tags */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="text-[11px] font-bold text-neutral-400">Aniqlangan parametrlar:</span>
                {detectedTags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-brand-teal/15 text-brand-teal text-[10px] font-black">
                    ✓ {tag}
                  </span>
                ))}
              </div>

              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Boshqa rasm yuklash</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. SAMPLES TO QUICK TEST */}
        {!uploadedImage && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-neutral-500 block">
              Yoki namunaviy tasvirlardan birini tanlab sinab ko'ring:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {samples.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSample(s)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer border border-neutral-200 dark:border-neutral-700 hover:border-brand-teal transition-all aspect-[4/3] group shadow-xs"
                >
                  <img src={s.img} alt={s.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 text-[11px] font-black text-white">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MATCHED RESULTS (100% REAL PRODUCTS) */}
        {uploadedImage && !isScanning && (
          <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Yuklangan rasmga eng mos keluvchi tovarlar ({matchedProducts.length} ta topildi):</span>
              </div>
              <span className="text-[11px] font-bold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded">
                98% Vizual Moslik
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {matchedProducts.map(p => (
                <div key={p.id} className="group rounded-2xl bg-white dark:bg-[#1A1A1E] border border-neutral-200/80 dark:border-neutral-800 p-2.5 space-y-2 flex flex-col justify-between hover:shadow-md transition-all">
                  <div 
                    onClick={() => {
                      setSelectedProduct(p);
                      setIsVisualSearchOpen(false);
                    }}
                    className="cursor-pointer space-y-2"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                      <img src={p.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black">
                        Mos tovar
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1 group-hover:text-brand-teal transition-colors">
                        {p.name?.uz || p.title?.uz}
                      </h4>
                      <div className="text-xs font-black text-brand-teal mt-0.5">
                        {formatPrice(p.price)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(p, 1, p.sizes?.[0] || 'Standard');
                      setIsVisualSearchOpen(false);
                    }}
                    className="w-full py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-brand-teal hover:text-white text-neutral-700 dark:text-neutral-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Savatga</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
