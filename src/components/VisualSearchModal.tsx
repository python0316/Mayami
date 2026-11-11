import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  CheckCircle,
  ShoppingBag,
  Palette,
  SlidersHorizontal
} from 'lucide-react';
import { Product } from '../types';
import { 
  analyzeImageCanvas, 
  matchProductsByVisualAnalysis, 
  VisualAnalysisResult, 
  VisualMatchResult 
} from '../services/visualAiService';
import { getLocalizedProductText } from '../utils/translator';

export const VisualSearchModal: React.FC = () => {
  const { 
    isVisualSearchOpen, 
    setIsVisualSearchOpen, 
    products, 
    language, 
    setSelectedProduct,
    addToCart,
    formatPrice
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisualAnalysisResult | null>(null);
  const [allMatchedResults, setAllMatchedResults] = useState<VisualMatchResult[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null);

  if (!isVisualSearchOpen) return null;

  const samples = [
    { label: "Sport krossovkasi", slug: "shoes", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80" },
    { label: "Kuzgi ayollar libosi", slug: "clothing", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80" },
    { label: "Turkiya baxmal joynamozi", slug: "islamic-items", img: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&auto=format&fit=crop&q=80" },
    { label: "Teri parvarishi kremi", slug: "beauty-and-personal-care", img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80" },
  ];

  const processImageAnalysis = async (dataUrl: string, name?: string) => {
    setUploadedImage(dataUrl);
    setFileName(name || "Rasm");
    setIsScanning(true);
    setSelectedCategoryFilter('all');
    setSelectedColorFilter(null);

    try {
      // 1. Perform Real Canvas AI Analysis
      const analysis = await analyzeImageCanvas(dataUrl, name);
      setAnalysisResult(analysis);

      // 2. Visual Similarity Matching Against Catalog
      const matches = matchProductsByVisualAnalysis(analysis, products, language);
      setAllMatchedResults(matches);

      setIsScanning(false);
    } catch (e) {
      setIsScanning(false);
    }
  };

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Iltimos, rasm faylini tanlang (JPG, PNG, WEBP)!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      processImageAnalysis(dataUrl, file.name);
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
    processImageAnalysis(sample.img, sample.label);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setFileName(null);
    setIsScanning(false);
    setAnalysisResult(null);
    setAllMatchedResults([]);
    setSelectedCategoryFilter('all');
    setSelectedColorFilter(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setIsVisualSearchOpen(false);
  };

  // Filter matched results based on active user filter tabs
  const filteredMatches = allMatchedResults.filter(match => {
    const p = match.product;
    // Category tab filter
    if (selectedCategoryFilter !== 'all') {
      if (selectedCategoryFilter === 'shoes' && !p.category_slug.includes('shoe')) return false;
      if (selectedCategoryFilter === 'clothing' && !p.category_slug.includes('cloth') && !p.category_slug.includes('dress')) return false;
      if (selectedCategoryFilter === 'islamic-items' && p.category_slug !== 'islamic-items' && !p.slug.includes('joynamoz')) return false;
      if (selectedCategoryFilter === 'beauty-and-personal-care' && !p.category_slug.includes('beauty') && !p.category_slug.includes('parvarish')) return false;
    }

    // Color filter
    if (selectedColorFilter) {
      const pColors = p.colors || [];
      const hasColor = pColors.some(c => (c.name_uz || '').toLowerCase().includes(selectedColorFilter.toLowerCase()));
      if (!hasColor) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pb-[calc(70px+env(safe-area-inset-bottom,6px))] md:pb-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#141418] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto p-5 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
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
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                  Rasm Bo'yicha Aqlli Qidiruv
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Visual Search
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                O'zingizga yoqqan kiyim, poyabzal yoki buyum rasmini ko'rsating — rang, toifa va shakliga eng mos mahsulotlar topiladi
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            title="Yopish"
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
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-9 text-center space-y-3 cursor-pointer transition-all ${
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
                Rasmni shu yerga tashlang yoki faylni tanlang
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Kameradan suratga oling yoki galereyadan rasm yuklang (JPG, PNG, WEBP)
              </div>
            </div>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal-hover transition-all shadow-sm cursor-pointer"
            >
              Suratni tanlash / suratga olish
            </button>
          </div>
        ) : (
          /* Uploaded Preview with Live Visual Analysis Results */
          <div className="p-4 sm:p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-brand-teal shadow-md">
              <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
              {isScanning && (
                <div className="absolute inset-0 bg-brand-teal/20 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="w-full h-1 bg-white animate-pulse shadow-lg" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-black text-sm text-neutral-900 dark:text-white">
                  {isScanning ? "Tasvir tahlil qilinmoqda..." : "Tasvir muvaffaqiyatli tahlil qilindi!"}
                </span>
                {!isScanning && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </div>

              {analysisResult && !isScanning && (
                <div className="space-y-2 pt-1">
                  {/* Category and Confidence */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-teal/10 text-brand-teal font-black text-xs">
                      Toifa: {analysisResult.categoryTitle_uz}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      Aniqlik: {analysisResult.confidence}%
                    </span>
                  </div>

                  {/* Dominant Colors Found (Clickable Filter) */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    <span className="text-[11px] font-bold text-neutral-400 flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      Ranglar:
                    </span>
                    {analysisResult.dominantColors.map((col, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColorFilter(selectedColorFilter === col.name_uz ? null : col.name_uz)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer border ${
                          selectedColorFilter === col.name_uz
                            ? 'bg-brand-teal text-white border-brand-teal ring-2 ring-brand-teal/30'
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:border-brand-teal'
                        }`}
                        title={`${col.name_uz} rang bo'yicha saralash`}
                      >
                        <span className="w-2 h-2 rounded-full inline-block border border-black/10" style={{ backgroundColor: col.hex }} />
                        <span>{col.name_uz} ({col.weight}%)</span>
                      </button>
                    ))}
                    {selectedColorFilter && (
                      <button
                        type="button"
                        onClick={() => setSelectedColorFilter(null)}
                        className="text-[10px] font-bold text-rose-500 underline ml-1 cursor-pointer"
                      >
                        Rangni tozalash
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-1 flex items-center justify-center sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Boshqa rasm yuklash</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. QUICK SAMPLES */}
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

        {/* 3. MATCHED RESULTS (Ranked by AI Visual Similarity) */}
        {uploadedImage && !isScanning && (
          <div className="space-y-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in">
            {/* Filter Tabs Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Mos keluvchi tovarlar ({filteredMatches.length} ta):</span>
              </div>

              {/* Quick Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px]">
                {[
                  { id: 'all', label: 'Barchasi' },
                  { id: 'shoes', label: 'Poyabzallar' },
                  { id: 'clothing', label: 'Kiyim-kechak' },
                  { id: 'islamic-items', label: 'Islomiy' },
                  { id: 'beauty-and-personal-care', label: 'Kosmetika' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(tab.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      selectedCategoryFilter === tab.id
                        ? 'bg-brand-teal text-white shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {filteredMatches.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {filteredMatches.slice(0, 8).map(res => {
                  const p = res.product;
                  return (
                    <div 
                      key={p.id} 
                      className="group rounded-2xl bg-white dark:bg-[#1A1A1E] border border-neutral-200/80 dark:border-neutral-800 p-2.5 space-y-2 flex flex-col justify-between hover:shadow-lg transition-all"
                    >
                      <div 
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsVisualSearchOpen(false);
                        }}
                        className="cursor-pointer space-y-2"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                          <img src={p.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black shadow-xs">
                            {res.matchScore}% moslik
                          </span>
                          {p.discount && p.discount > 0 && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black">
                              -{p.discount}%
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1 group-hover:text-brand-teal transition-colors">
                            {getLocalizedProductText(p, 'title', language)}
                          </h4>
                          <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                            {res.reason_uz}
                          </p>
                          <div className="text-xs font-black text-brand-teal mt-1">
                            {formatPrice(p.price)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCart(p, 1, p.sizes?.[0] || 'Standard');
                          setIsVisualSearchOpen(false);
                        }}
                        className="w-full py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-brand-teal hover:text-white text-neutral-800 dark:text-neutral-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Savatga qo'shish</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-400">
                Ushbu filtr bo'yicha mos mahsulotlar topilmadi. Boshqa toifani tanlang.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
