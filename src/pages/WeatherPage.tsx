import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  CityInfo, 
  WeatherData, 
  UZBEKISTAN_CITIES, 
  WORLD_CITIES, 
  ALL_PRESET_CITIES,
  searchCities, 
  fetchWeather, 
  detectUserCity 
} from '../services/weatherService';
import { WeatherIcon } from '../components/WeatherIcon';
import { ProductCard } from '../components/ProductCard';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  Sunrise, 
  Sunset, 
  RefreshCw, 
  Sparkles, 
  ChevronRight, 
  Calendar, 
  Clock, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const WeatherPage: React.FC = () => {
  const { language, products, t } = useApp();

  const [selectedCity, setSelectedCity] = useState<CityInfo>(UZBEKISTAN_CITIES[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityInfo[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch weather when selected city changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchWeather(selectedCity).then(data => {
      if (isMounted) {
        setWeatherData(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Handle search typing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchCities(searchQuery).then(results => {
        setSearchResults(results);
        setIsSearchOpen(true);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Detect location
  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const detected = await detectUserCity();
      setSelectedCity(detected);
    } finally {
      setIsDetecting(false);
    }
  };

  // Temperature converter
  const formatTemp = (celsius: number) => {
    if (unit === 'F') {
      const fahr = Math.round((celsius * 9) / 5 + 32);
      return `${fahr}°F`;
    }
    return `${celsius > 0 ? `+${celsius}` : celsius}°C`;
  };

  // Localized city name
  const getCityName = (city: CityInfo) => {
    if (language === 'uz') return city.name_uz || city.name;
    if (language === 'ru') return city.name_ru || city.name;
    return city.name;
  };

  // Weather-based product recommendations
  const weatherRecommendations = useMemo(() => {
    if (!weatherData) return products.slice(0, 4);

    const temp = weatherData.current.temperature;
    const code = weatherData.current.weatherCode;

    // Rainy or snowy weather
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 71 && code <= 86)) {
      return products.filter(p => 
        p.category_slug === 'clothing' || 
        p.category_slug === 'shoes'
      ).slice(0, 4);
    }

    // Warm weather (>= 20°C)
    if (temp >= 20) {
      return products.filter(p => 
        p.category_slug === 'clothing' || 
        p.category_slug === 'accessories' ||
        p.category_slug === 'beauty-and-personal-care'
      ).slice(0, 4);
    }

    // Mild/Cool weather (< 20°C)
    return products.filter(p => 
      p.category_slug === 'clothing' || 
      p.category_slug === 'shoes' ||
      p.category_slug === 'accessories'
    ).slice(0, 4);
  }, [weatherData, products]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-neutral-500">
        <Link to="/" className="hover:text-brand-teal font-medium">Bosh sahifa</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-900 dark:text-white font-bold">
          {t.weather?.pageTitle || "Ob-havo"}
        </span>
      </nav>

      {/* Hero Header & Search Controls */}
      <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-[#0e1626] text-white shadow-2xl border border-neutral-800">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mayami Real-Time Weather</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {t.weather?.pageTitle || "Ob-havo Markazi"}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">
            {t.weather?.pageSubtitle || "O'zbekiston viloyatlari va dunyo bo'ylab eng so'nggi real vaqtdagi ob-havo, soatlik va 7 kunlik prognozlar."}
          </p>

          {/* Search Bar & Location Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search input with autocomplete */}
            <div className="relative flex-1" ref={searchRef}>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setIsSearchOpen(true); }}
                  placeholder={t.weather?.searchPlaceholder || "Shahar yoki viloyat nomini kiriting..."}
                  className="w-full h-11 pl-10 pr-4 rounded-2xl bg-neutral-800/90 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:border-brand-teal text-xs sm:text-sm font-medium transition-all shadow-inner"
                />
              </div>

              {/* Suggestions Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-neutral-800">
                  {searchResults.map((city, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedCity(city);
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-brand-teal shrink-0" />
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white">
                            {getCityName(city)}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {city.country} {city.country_code ? `(${city.country_code})` : ''}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detect Location Button */}
            <button
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="h-11 px-4 rounded-2xl bg-brand-teal hover:bg-brand-teal-hover text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95 disabled:opacity-60 shadow-lg shadow-teal-950/50"
              title="Mening joylashuvimni aniqlash"
            >
              <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? (t.weather?.detectingLocation || "Aniqlanmoqda...") : (t.weather?.useMyLocation || "Joylashuvim")}</span>
            </button>

            {/* Unit Switcher (°C / °F) */}
            <div className="flex items-center p-1 rounded-2xl bg-neutral-800 border border-neutral-700 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setUnit('C')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  unit === 'C' ? 'bg-brand-teal text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setUnit('F')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  unit === 'F' ? 'bg-brand-teal text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-cyan-600/15 via-teal-500/10 to-transparent pointer-events-none blur-3xl" />
      </div>

      {/* Quick Region Selector Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-teal" />
            <span>{t.weather?.uzbekistanRegions || "O'zbekiston viloyatlari"}</span>
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
                    ? 'bg-brand-teal text-white shadow-md scale-102'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {getCityName(city)}
              </button>
            );
          })}
        </div>

        {/* Global Cities Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-neutral-400 shrink-0 mr-1">
            {t.weather?.worldCities || "Dunyo"}:
          </span>
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
                {getCityName(city)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Weather Display */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center space-y-4 text-center">
          <RefreshCw className="w-8 h-8 text-brand-teal animate-spin" />
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            {t.weather?.loadingWeather || "Ob-havo ma'lumotlari yuklanmoqda..."}
          </p>
        </div>
      ) : weatherData ? (
        <div className="space-y-6">
          {/* Main Weather Hero Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Big Card: Current Temp & Condition */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 text-white border border-neutral-800 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-teal" />
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {getCityName(selectedCity)}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-neutral-300">
                      {selectedCity.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Oxirgi yangilanish: {weatherData.current.time}</span>
                  </div>
                </div>

                {/* Weather condition badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                  <WeatherIcon type={weatherData.current.condition.icon} className="w-5 h-5" />
                  <span className="text-xs font-bold text-white">
                    {weatherData.current.condition[language as keyof typeof weatherData.current.condition] || weatherData.current.condition.uz}
                  </span>
                </div>
              </div>

              {/* Big Temperature & Icon Center */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10 py-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl sm:text-7xl font-black tracking-tight text-white font-mono">
                    {formatTemp(weatherData.current.temperature)}
                  </span>
                  <div className="text-xs text-neutral-400 space-y-0.5">
                    <div>{t.weather?.feelsLike || "His qilinishi"}:</div>
                    <div className="text-base font-bold text-white font-mono">
                      {formatTemp(weatherData.current.feelsLike)}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-4">
                  <WeatherIcon type={weatherData.current.condition.icon} className="w-16 h-16" />
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white">
                      {weatherData.current.condition[language as keyof typeof weatherData.current.condition] || weatherData.current.condition.uz}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {weatherData.current.isDay ? "Kunduzgi vaqt" : "Tungi vaqt"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Atmospheric Mini Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-800/80 relative z-10">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold">{t.weather?.humidity || "Namlik"}</div>
                    <div className="text-xs font-bold text-white">{weatherData.current.humidity}%</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Wind className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold">{t.weather?.windSpeed || "Shamol"}</div>
                    <div className="text-xs font-bold text-white">{weatherData.current.windSpeed} km/soat</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Gauge className="w-4 h-4 text-violet-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold">{t.weather?.pressure || "Bosim"}</div>
                    <div className="text-xs font-bold text-white">{weatherData.current.pressure} hPa</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold">{t.weather?.uvIndex || "UV indeksi"}</div>
                    <div className="text-xs font-bold text-white">
                      {weatherData.daily[0]?.uvIndex ?? 3} (O'rtacha)
                    </div>
                  </div>
                </div>
              </div>

              {/* Ambient Glow */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Right Card: Sunrise / Sunset & Location Summary */}
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sunrise className="w-4 h-4 text-amber-500" />
                  <span>Quyosh jadvali</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {getCityName(selectedCity)} koordinatalari: {selectedCity.latitude.toFixed(2)}°N, {selectedCity.longitude.toFixed(2)}°E
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                      <Sunrise className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-neutral-400 font-bold uppercase">{t.weather?.sunrise || "Quyosh chiqishi"}</div>
                      <div className="text-sm font-black text-neutral-900 dark:text-white">{weatherData.daily[0]?.sunrise || "06:45"}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">Tong</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Sunset className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-neutral-400 font-bold uppercase">{t.weather?.sunset || "Quyosh botishi"}</div>
                      <div className="text-sm font-black text-neutral-900 dark:text-white">{weatherData.daily[0]?.sunset || "17:35"}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">Oqshom</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 text-xs text-brand-teal font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Open-Meteo Global xalqaro meteo-stansiyalari orqali 100% aniqlikda uzatiladi.</span>
              </div>
            </div>
          </div>

          {/* 24-Hour Hourly Timeline */}
          {weatherData.hourly && weatherData.hourly.length > 0 && (
            <div className="p-6 rounded-3xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-teal" />
                  <span>{t.weather?.hourlyForecast || "24 soatlik soatbay prognoz"}</span>
                </h3>
                <span className="text-xs text-neutral-500">Soatlik harorat</span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {weatherData.hourly.map((hour, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 min-w-[80px] rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-between space-y-2 shrink-0 hover:border-brand-teal transition-all text-center"
                  >
                    <span className="text-xs font-bold text-neutral-500">{hour.time}</span>
                    <WeatherIcon type={hour.condition.icon} className="w-6 h-6 my-1" />
                    <span className="text-sm font-black text-neutral-900 dark:text-white font-mono">
                      {formatTemp(hour.temperature)}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate max-w-[70px]">
                      {hour.condition[language as keyof typeof hour.condition] || hour.condition.uz}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Weekly Forecast */}
          {weatherData.daily && weatherData.daily.length > 0 && (
            <div className="p-6 rounded-3xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-teal" />
                  <span>{t.weather?.dailyForecast || "7 kunlik ob-havo prognozi"}</span>
                </h3>
                <span className="text-xs text-neutral-500">Haftalik ko'rinish</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {weatherData.daily.map((day, idx) => {
                  const dayTitle = day.dayName[language as keyof typeof day.dayName] || day.dayName.uz;
                  const isToday = idx === 0;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isToday 
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-md' 
                          : 'bg-white dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:border-brand-teal'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black truncate">{isToday ? "Bugun" : dayTitle}</span>
                        <span className={`text-[10px] font-semibold ${isToday ? 'opacity-80' : 'text-neutral-400'}`}>
                          {day.date.slice(5)}
                        </span>
                      </div>

                      <div className="flex items-center justify-center py-2">
                        <WeatherIcon type={day.condition.icon} className="w-8 h-8" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                          <span className={isToday ? 'text-teal-300 dark:text-teal-700' : 'text-neutral-900 dark:text-white'}>
                            {formatTemp(day.tempMax)}
                          </span>
                          <span className={isToday ? 'opacity-70' : 'text-neutral-400'}>
                            {formatTemp(day.tempMin)}
                          </span>
                        </div>
                        <div className={`text-[10px] truncate ${isToday ? 'opacity-80' : 'text-neutral-400'}`}>
                          {day.condition[language as keyof typeof day.condition] || day.condition.uz}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weather-Appropriate Shopping Recommendations from Mayami */}
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-100 dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-teal" />
                  <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                    {t.weather?.recommendedForWeather || "Bugungi ob-havoga mos sara tovarlar"}
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {t.weather?.recommendedSubtitle || "Mayami dan ushbu ob-havo sharoitiga mos tavsiya etilgan tovarlar"}
                </p>
              </div>

              <Link
                to="/category/clothing"
                className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Barcha kiyimlarni ko'rish</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {weatherRecommendations.map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
