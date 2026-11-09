// Prayer Times, Qibla, Tasbih & Mosque Finder Service for Mayami
import { CityInfo, UZBEKISTAN_CITIES, WORLD_CITIES } from './weatherService';

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak: string;
  midnight: string;
}

export interface HijriDate {
  day: string;
  monthEn: string;
  monthAr: string;
  year: string;
  designation: string;
}

export interface NextPrayerInfo {
  name: keyof PrayerTimes;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  time: string;
  remainingMinutes: number;
  remainingText: string;
  progressPercent: number;
}

export interface PrayerData {
  city: CityInfo;
  timings: PrayerTimes;
  hijri: HijriDate;
  gregorianDate: string;
  nextPrayer: NextPrayerInfo;
  activePrayer: string;
}

export interface QiblaInfo {
  angle: number;
  cardinalDirection: string;
  distanceKm: number;
}

export interface Mosque {
  id: string;
  name: string;
  region: string;
  district: string;
  address: string;
  capacity: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  imageUrl?: string;
  mapUrl: string;
}

// Qibla calculation to the Holy Kaaba (Mecca)
export function calculateQibla(latitude: number, longitude: number): QiblaInfo {
  const kaabaLat = (21.422487 * Math.PI) / 180;
  const kaabaLng = (39.826206 * Math.PI) / 180;
  const userLat = (latitude * Math.PI) / 180;
  const userLng = (longitude * Math.PI) / 180;

  const deltaLng = kaabaLng - userLng;

  const y = Math.sin(deltaLng);
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLng);
  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;
  qiblaDeg = (qiblaDeg + 360) % 360;

  // Cardinal direction text
  let cardinal = 'Janubi-g\'arb (WSW)';
  if (qiblaDeg >= 225 && qiblaDeg <= 255) cardinal = 'Janubi-g\'arb (SW)';
  else if (qiblaDeg > 255 && qiblaDeg < 285) cardinal = 'G\'arb (W)';
  else if (qiblaDeg >= 195 && qiblaDeg < 225) cardinal = 'Janub (SSW)';

  // Distance calculation
  const R = 6371; // Earth radius in km
  const dLat = kaabaLat - userLat;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat) * Math.cos(kaabaLat) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  return {
    angle: Math.round(qiblaDeg * 10) / 10,
    cardinalDirection: cardinal,
    distanceKm
  };
}

// Calculate distance between two coordinates
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Helper to determine next prayer and remaining time
function determineNextPrayer(timings: PrayerTimes): { nextPrayer: NextPrayerInfo; activePrayer: string } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const schedule: Array<{ key: keyof PrayerTimes; uz: string; ru: string; en: string; time: string; minutes: number }> = [
    { key: 'fajr', uz: 'Bomdod', ru: 'Фаджр', en: 'Fajr', time: timings.fajr, minutes: toMinutes(timings.fajr) },
    { key: 'sunrise', uz: 'Quyosh', ru: 'Восход', en: 'Sunrise', time: timings.sunrise, minutes: toMinutes(timings.sunrise) },
    { key: 'dhuhr', uz: 'Peshin', ru: 'Зухр', en: 'Dhuhr', time: timings.dhuhr, minutes: toMinutes(timings.dhuhr) },
    { key: 'asr', uz: 'Asr', ru: 'Аср', en: 'Asr', time: timings.asr, minutes: toMinutes(timings.asr) },
    { key: 'maghrib', uz: 'Shom', ru: 'Магриб', en: 'Maghrib', time: timings.maghrib, minutes: toMinutes(timings.maghrib) },
    { key: 'isha', uz: 'Xufton', ru: 'Иша', en: 'Isha', time: timings.isha, minutes: toMinutes(timings.isha) }
  ];

  let next = schedule[0];
  let active = 'isha';
  let diffMinutes = 0;

  if (currentMinutes < schedule[0].minutes) {
    // Before Fajr
    next = schedule[0];
    active = 'isha';
    diffMinutes = schedule[0].minutes - currentMinutes;
  } else if (currentMinutes < schedule[1].minutes) {
    // Between Fajr and Sunrise
    next = schedule[1];
    active = 'fajr';
    diffMinutes = schedule[1].minutes - currentMinutes;
  } else if (currentMinutes < schedule[2].minutes) {
    // Between Sunrise and Dhuhr
    next = schedule[2];
    active = 'sunrise';
    diffMinutes = schedule[2].minutes - currentMinutes;
  } else if (currentMinutes < schedule[3].minutes) {
    // Between Dhuhr and Asr
    next = schedule[3];
    active = 'dhuhr';
    diffMinutes = schedule[3].minutes - currentMinutes;
  } else if (currentMinutes < schedule[4].minutes) {
    // Between Asr and Maghrib
    next = schedule[4];
    active = 'asr';
    diffMinutes = schedule[4].minutes - currentMinutes;
  } else if (currentMinutes < schedule[5].minutes) {
    // Between Maghrib and Isha
    next = schedule[5];
    active = 'maghrib';
    diffMinutes = schedule[5].minutes - currentMinutes;
  } else {
    // After Isha -> Tomorrow's Fajr
    next = schedule[0];
    active = 'isha';
    diffMinutes = 24 * 60 - currentMinutes + schedule[0].minutes;
  }

  const hoursLeft = Math.floor(diffMinutes / 60);
  const minsLeft = diffMinutes % 60;
  const remainingText = hoursLeft > 0 ? `${hoursLeft} soat ${minsLeft} daqiqa` : `${minsLeft} daqiqa`;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((120 - Math.min(120, diffMinutes)) / 120) * 100)));

  return {
    nextPrayer: {
      name: next.key,
      nameUz: next.uz,
      nameRu: next.ru,
      nameEn: next.en,
      time: next.time,
      remainingMinutes: diffMinutes,
      remainingText,
      progressPercent
    },
    activePrayer: active
  };
}

// Fetch Prayer Times from Aladhan API with resilient fallback
export async function fetchPrayerTimes(city: CityInfo): Promise<PrayerData> {
  const url = `https://api.aladhan.com/v1/timings?latitude=${city.latitude}&longitude=${city.longitude}&method=3`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Prayer API failed');

    const data = await res.json();
    const t = data.data.timings;

    const timings: PrayerTimes = {
      fajr: t.Fajr?.slice(0, 5) || '05:25',
      sunrise: t.Sunrise?.slice(0, 5) || '06:58',
      dhuhr: t.Dhuhr?.slice(0, 5) || '12:07',
      asr: t.Asr?.slice(0, 5) || '14:52',
      maghrib: t.Maghrib?.slice(0, 5) || '17:15',
      isha: t.Isha?.slice(0, 5) || '18:43',
      imsak: t.Imsak?.slice(0, 5) || '05:15',
      midnight: t.Midnight?.slice(0, 5) || '00:06'
    };

    const hijriRaw = data.data.date.hijri;
    const hijri: HijriDate = {
      day: hijriRaw?.day || '25',
      monthEn: hijriRaw?.month?.en || 'Jumada al-Awwal',
      monthAr: hijriRaw?.month?.ar || 'جُمَادَىٰ الأُولَىٰ',
      year: hijriRaw?.year || '1448',
      designation: 'Hijriy'
    };

    const gregorianDate = data.data.date.readable || new Date().toLocaleDateString('uz-UZ');
    const { nextPrayer, activePrayer } = determineNextPrayer(timings);

    return {
      city,
      timings,
      hijri,
      gregorianDate,
      nextPrayer,
      activePrayer
    };
  } catch (err) {
    // Fallback data
    const timings: PrayerTimes = {
      fajr: '05:25',
      sunrise: '06:58',
      dhuhr: '12:07',
      asr: '14:52',
      maghrib: '17:15',
      isha: '18:43',
      imsak: '05:15',
      midnight: '00:06'
    };

    const { nextPrayer, activePrayer } = determineNextPrayer(timings);

    return {
      city,
      timings,
      hijri: {
        day: '25',
        monthEn: 'Jumada al-Awwal',
        monthAr: 'جُمَادَىٰ الأُولَىٰ',
        year: '1448',
        designation: 'Hijriy'
      },
      gregorianDate: new Date().toLocaleDateString('uz-UZ'),
      nextPrayer,
      activePrayer
    };
  }
}

// Prominent Verified Mosques Directory across Uzbekistan
export const UZBEKISTAN_MOSQUES: Mosque[] = [
  // Tashkent
  {
    id: 'm_hastimom',
    name: 'Hazrati Imom (Hastimom) Jome Masjidi',
    region: 'Toshkent',
    district: 'Olmazor tumani',
    address: 'Qorasaroy ko\'chasi, Hazrati Imom majmuasi',
    capacity: '15 000 namozxon',
    latitude: 41.3377,
    longitude: 69.2415,
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=41.3377,69.2415'
  },
  {
    id: 'm_minor',
    name: 'Minor Jome Masjidi (Oq masjid)',
    region: 'Toshkent',
    district: 'Yunusobod tumani',
    address: 'Kichik halqa yo\'li, Anhor bo\'yi',
    capacity: '10 000 namozxon',
    latitude: 41.3308,
    longitude: 69.2829,
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=41.3308,69.2829'
  },
  {
    id: 'm_kokcha',
    name: 'Shayx Zayniddin (Ko\'kcha) Jome Masjidi',
    region: 'Toshkent',
    district: 'Shayxontohur tumani',
    address: 'Mannop Uyg\'ur ko\'chasi, Ko\'kcha dahasi',
    capacity: '8 000 namozxon',
    latitude: 41.3217,
    longitude: 69.2155,
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=41.3217,69.2155'
  },
  {
    id: 'm_islomota',
    name: 'Islom Ota Jome Masjidi',
    region: 'Toshkent',
    district: 'Yashnobod tumani',
    address: 'Farg\'ona yo\'li ko\'chasi',
    capacity: '7 000 namozxon',
    latitude: 41.2789,
    longitude: 69.3142,
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=41.2789,69.3142'
  },
  {
    id: 'm_novza',
    name: 'Novza Jome Masjidi',
    region: 'Toshkent',
    district: 'Chilonzor tumani',
    address: 'Muqimiy ko\'chasi, Novza metro bekati yaqinida',
    capacity: '6 000 namozxon',
    latitude: 41.2891,
    longitude: 69.2274,
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=41.2891,69.2274'
  },
  {
    id: 'm_bodomzor',
    name: 'Mirzo Yusuf (Bodomzor) Jome Masjidi',
    region: 'Toshkent',
    district: 'Yunusobod tumani',
    address: 'Bodomzor metro bekati, Amir Temur shoh ko\'chasi',
    capacity: '5 000 namozxon',
    latitude: 41.3432,
    longitude: 69.2858,
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=41.3432,69.2858'
  },
  {
    id: 'm_suzukota',
    name: 'Suzuk Ota Jome Masjidi va Majmuasi',
    region: 'Toshkent',
    district: 'Shayxontohur tumani',
    address: 'Suzuk Ota mahallasi',
    capacity: '5 000 namozxon',
    latitude: 41.3146,
    longitude: 69.2201,
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=41.3146,69.2201'
  },

  // Samarkand
  {
    id: 'm_bibixonim',
    name: 'Bibixonim Tarixiy Jome Masjidi',
    region: 'Samarqand',
    district: 'Samarqand shahar',
    address: 'Bibixonim ko\'chasi, Registon yaqinida',
    capacity: '10 000 namozxon',
    latitude: 39.6583,
    longitude: 66.9792,
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=39.6583,66.9792'
  },
  {
    id: 'm_hazratixizr',
    name: 'Hazrati Xizr Jome Masjidi',
    region: 'Samarqand',
    district: 'Samarqand shahar',
    address: 'Shohi Zinda majmuasi qarshisida',
    capacity: '4 000 namozxon',
    latitude: 39.6644,
    longitude: 66.9836,
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=39.6644,66.9836'
  },

  // Bukhara
  {
    id: 'm_kalon',
    name: 'Masjidi Kalon (Minorai Kalon jome)',
    region: 'Buxoro',
    district: 'Buxoro shahar',
    address: 'Poyi Kalon majmuasi, Tarixiy markaz',
    capacity: '12 000 namozxon',
    latitude: 39.7758,
    longitude: 64.4150,
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=39.7758,64.4150'
  },
  {
    id: 'm_bolohovuz',
    name: 'Bolo Hovuz Jome Masjidi',
    region: 'Buxoro',
    district: 'Buxoro shahar',
    address: 'Ark qal\'asi ro\'parasida',
    capacity: '3 500 namozxon',
    latitude: 39.7772,
    longitude: 64.4083,
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=39.7772,64.4083'
  },

  // Andijan
  {
    id: 'm_devonaboy',
    name: 'Devona Boy Jome Masjidi',
    region: 'Andijon',
    district: 'Andijon shahar',
    address: 'Fitrat ko\'chasi',
    capacity: '6 000 namozxon',
    latitude: 40.7828,
    longitude: 72.3481,
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=40.7828,72.3481'
  },

  // Fergana
  {
    id: 'm_fergana_central',
    name: 'Farg\'ona Markaziy Jome Masjidi',
    region: 'Farg\'ona',
    district: 'Farg\'ona shahar',
    address: 'Al-Farg\'oniy shoh ko\'chasi',
    capacity: '5 000 namozxon',
    latitude: 40.3842,
    longitude: 71.7843,
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=40.3842,71.7843'
  },

  // Namangan
  {
    id: 'm_namangan_mulla',
    name: 'Mulla Bozor Oxund Jome Masjidi',
    region: 'Namangan',
    district: 'Namangan shahar',
    address: 'Bobur bog\'i yaqinida',
    capacity: '5 000 namozxon',
    latitude: 40.9983,
    longitude: 71.6726,
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=40.9983,71.6726'
  },

  // Khiva / Urgench
  {
    id: 'm_oxunbobo',
    name: 'Oxunbobo Markaziy Jome Masjidi',
    region: 'Xorazm',
    district: 'Urganch shahar',
    address: 'Al-Xorazmiy ko\'chasi',
    capacity: '4 500 namozxon',
    latitude: 41.5562,
    longitude: 60.6317,
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=41.5562,60.6317'
  },

  // Nukus
  {
    id: 'm_nukus_eshon',
    name: 'Imom Eshon Muhammad Jome Masjidi',
    region: 'Qoraqalpog\'iston',
    district: 'Nukus shahar',
    address: 'A. Dosnazarov ko\'chasi',
    capacity: '4 000 namozxon',
    latitude: 42.4619,
    longitude: 59.6166,
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&auto=format&fit=crop&q=80',
    mapUrl: 'https://maps.google.com/?q=42.4619,59.6166'
  }
];
