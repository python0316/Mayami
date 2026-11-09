import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  CityInfo, 
  UZBEKISTAN_CITIES, 
  WORLD_CITIES, 
  detectUserCity 
} from '../services/weatherService';
import { 
  PrayerData, 
  Mosque, 
  fetchPrayerTimes, 
  calculateQibla, 
  calculateDistance, 
  UZBEKISTAN_MOSQUES 
} from '../services/prayerService';
import { QiblaCompass } from '../components/QiblaCompass';
import { ProductCard } from '../components/ProductCard';
import { 
  Compass, 
  Clock, 
  MapPin, 
  Navigation, 
  Sunrise, 
  Sunset, 
  Sun, 
  Moon, 
  Sparkles, 
  ChevronRight, 
  Search, 
  ExternalLink, 
  Calendar, 
  ShoppingBag, 
  Volume2, 
  ShieldCheck,
  Building,
  RotateCcw
} from 'lucide-react';

export const PrayerPage: React.FC = () => {
  const { language, products, t } = useApp();

  const [selectedCity, setSelectedCity] = useState<CityInfo>(UZBEKISTAN_CITIES[0]);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'timings' | 'qibla' | 'mosques'>('timings');

  // Mosque search query
  const [mosqueSearch, setMosqueSearch] = useState<string>('');

  // Fetch prayer times on city change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPrayerTimes(selectedCity).then(data => {
      if (isMounted) {
        setPrayerData(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Periodic refresh for prayer countdown (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (prayerData) {
        fetchPrayerTimes(selectedCity).then(data => {
          setPrayerData(data);
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedCity, prayerData]);

  // Handle GPS location detection
  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const detected = await detectUserCity();
      setSelectedCity(detected);
    } finally {
      setIsDetecting(false);
    }
  };

  // Compute Qibla
  const qiblaInfo = useMemo(() => {
    return calculateQibla(selectedCity.latitude, selectedCity.longitude);
  }, [selectedCity]);

  // City display name
  const cityName = useMemo(() => {
    if (language === 'uz') return selectedCity.name_uz || selectedCity.name;
    if (language === 'ru') return selectedCity.name_ru || selectedCity.name;
    return selectedCity.name;
  }, [selectedCity, language]);

  // Filter and sort mosques by distance to chosen city
  const mosquesList = useMemo(() => {
    let list = UZBEKISTAN_MOSQUES.map(m => {
      const distance = calculateDistance(
        selectedCity.latitude,
        selectedCity.longitude,
        m.latitude,
        m.longitude
      );
      return { ...m, distanceKm: distance };
    });

    // Sort by proximity
    list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    if (mosqueSearch.trim()) {
      const q = mosqueSearch.toLowerCase().trim();
      list = list.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.region.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCity, mosqueSearch]);

  // Relevant Islamic marketplace items
  const islamicProducts = useMemo(() => {
    const direct = products.filter(p => p.category_slug === 'islamic-items');
    if (direct.length > 0) return direct;
    return products.slice(0, 4);
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-brand-teal font-medium">Bosh sahifa</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-900 dark:text-white font-bold">
          {t.prayer?.title || "Namoz vaqtlari"}
        </span>
      </nav>

      {/* Hero Banner Card */}
      <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-950 via-neutral-900 to-neutral-950 text-white shadow-2xl border border-emerald-900/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mayami Islomiy Xizmatlar Markazi</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {cityName} uchun Namoz Vaqtlari
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">
            {t.prayer?.subtitle || "O'zbekiston Musulmonlari Idorasi va xalqaro me'yorlarga asoslangan aniq namoz vaqtlari, Qibla yo'nalishi va yaqin masjidlar."}
          </p>

          {/* Hijri & Gregorian Date pill */}
          {prayerData && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {prayerData.hijri.day} {prayerData.hijri.monthEn} {prayerData.hijri.year} {prayerData.hijri.designation}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{prayerData.gregorianDate}</span>
              </div>
            </div>
          )}

          {/* Detect Location Button */}
          <div className="pt-2">
            <button
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-emerald-950/60"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? "Aniqlanmoqda..." : "Mening joylashuvim bo'yicha aniqlash"}</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-emerald-600/20 via-teal-500/10 to-transparent pointer-events-none blur-3xl" />
      </div>

      {/* Region Selector Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>O'zbekiston viloyatlari</span>
          </span>
          <span className="text-[11px] text-neutral-400">14 ta hudud</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {UZBEKISTAN_CITIES.map((city, idx) => {
            const isSelected = selectedCity.name === city.name;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md scale-102'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {city.name_uz || city.name}
              </button>
            );
          })}
        </div>

        {/* Global Hubs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-neutral-400 shrink-0 mr-1">Xalqaro:</span>
          {WORLD_CITIES.map((city, idx) => {
            const isSelected = selectedCity.name === city.name;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {city.name_uz || city.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Tabs (Namoz Vaqtlari | Qibla | Masjidlar) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('timings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'timings'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Namoz Vaqtlari</span>
        </button>

        <button
          onClick={() => setActiveTab('qibla')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'qibla'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Qibla Kompas</span>
        </button>

        <button
          onClick={() => setActiveTab('mosques')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'mosques'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Yaqin Masjidlar</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white">
            {mosquesList.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PRAYER TIMINGS */}
      {activeTab === 'timings' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-16 rounded-3xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center space-y-3 text-center">
              <RotateCcw className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm font-semibold text-neutral-500">Namoz vaqtlari hisoblanmoqda...</p>
            </div>
          ) : prayerData ? (
            <>
              {/* Countdown Next Prayer Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 to-neutral-900 text-white border border-emerald-800/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      {t.prayer?.nextPrayer || "Keyingi namoz"}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white font-mono">
                    {prayerData.nextPrayer.nameUz}: {prayerData.nextPrayer.time}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    {t.prayer?.timeRemaining || "Namozgacha qoldi"}: <strong className="text-emerald-400">{prayerData.nextPrayer.remainingText}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
                  <Clock className="w-10 h-10 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <div className="text-neutral-300 font-bold">Hozirgi vaqt:</div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 Main Prayer Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Bomdod */}
                <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  prayerData.activePrayer === 'fajr'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl ring-2 ring-emerald-500/20 scale-102'
                    : 'bg-white dark:bg-[#141414] border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider opacity-80">Bomdod</span>
                    <Sunrise className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                      {prayerData.timings.fajr}
                    </div>
                    <div className="text-[11px] opacity-70 mt-0.5">Tonggi namoz</div>
                  </div>
                </div>

                {/* 2. Quyosh */}
                <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  prayerData.activePrayer === 'sunrise'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl ring-2 ring-emerald-500/20 scale-102'
                    : 'bg-white dark:bg-[#141414] border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider opacity-80">Quyosh</span>
                    <Sun className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                      {prayerData.timings.sunrise}
                    </div>
                    <div className="text-[11px] opacity-70 mt-0.5">Chiqish vaqti</div>
                  </div>
                </div>

                {/* 3. Peshin */}
                <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  prayerData.activePrayer === 'dhuhr'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl ring-2 ring-emerald-500/20 scale-102'
                    : 'bg-white dark:bg-[#141414] border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider opacity-80">Peshin</span>
                    <Sun className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                      {prayerData.timings.dhuhr}
                    </div>
                    <div className="text-[11px] opacity-70 mt-0.5">Tushki namoz</div>
                  </div>
                </div>

                {/* 4. Asr */}
                <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  prayerData.activePrayer === 'asr'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl ring-2 ring-emerald-500/20 scale-102'
                    : 'bg-white dark:bg-[#141414] border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider opacity-80">Asr</span>
                    <Sunset className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                      {prayerData.timings.asr}
                    </div>
                    <div className="text-[11px] opacity-70 mt-0.5">Asr namozi</div>
                  </div>
                </div>

                {/* 5. Shom */}
                <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  prayerData.activePrayer === 'maghrib'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl ring-2 ring-emerald-500/20 scale-102'
                    : 'bg-white dark:bg-[#141414] border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider opacity-80">Shom</span>
                    <Sunset className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                      {prayerData.timings.maghrib}
                    </div>
                    <div className="text-[11px] opacity-70 mt-0.5">Iftor / Shom</div>
                  </div>
                </div>

                {/* 6. Xufton */}
                <div className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  prayerData.activePrayer === 'isha'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl ring-2 ring-emerald-500/20 scale-102'
                    : 'bg-white dark:bg-[#141414] border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider opacity-80">Xufton</span>
                    <Moon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                      {prayerData.timings.isha}
                    </div>
                    <div className="text-[11px] opacity-70 mt-0.5">Tungi namoz</div>
                  </div>
                </div>
              </div>

              {/* Extra Info: Saharlik & Yarim tun */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Saharlik (Imsok):</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                      {prayerData.timings.imsak}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Yarim tun:</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                      {prayerData.timings.midnight}
                    </span>
                  </div>
                </div>

                <div className="text-neutral-500 text-[11px]">
                  * O'zbekiston Musulmonlari Idorasi va xalqaro Hanafi hisob-kitob me'yorlari asosida.
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* TAB 2: QIBLA COMPASS */}
      {activeTab === 'qibla' && (
        <div className="space-y-6">
          <QiblaCompass qibla={qiblaInfo} cityName={cityName} />
        </div>
      )}

      {/* TAB 3: NEARBY MOSQUES */}
      {activeTab === 'mosques' && (
        <div className="space-y-6">
          {/* Mosques Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={mosqueSearch}
                onChange={(e) => setMosqueSearch(e.target.value)}
                placeholder="Masjid nomi yoki tuman bo'yicha qidirish..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <a
              href={`https://maps.google.com/?q=masjid+near+${encodeURIComponent(cityName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Xaritalarda ko'rish</span>
            </a>
          </div>

          {/* Mosques Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mosquesList.map(mosque => (
              <div
                key={mosque.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 transition-all shadow-xs flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {mosque.region}
                    </span>
                    {mosque.distanceKm !== undefined && (
                      <span className="text-[11px] font-bold text-neutral-500 font-mono">
                        ~{mosque.distanceKm} km
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-black text-neutral-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {mosque.name}
                  </h4>

                  <div className="text-xs text-neutral-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{mosque.district}, {mosque.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>Sig'imi: {mosque.capacity}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={mosque.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-emerald-600 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Xaritada ochish (Navigatsiya)</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Islamic Shopping Products on Mayami */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                {t.prayer?.prayerProductsTitle || "Ibodat uchun sara mahsulotlar"}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {t.prayer?.prayerProductsSubtitle || "Mayami da sifatli joynamozlar, elektron tasbehlar va islomiy buyumlar"}
            </p>
          </div>

          <Link
            to="/category/islamic-items"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Barchasini ko'rish</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {islamicProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
};
