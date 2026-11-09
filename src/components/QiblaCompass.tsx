import React, { useState, useEffect } from 'react';
import { Compass, Navigation, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { QiblaInfo } from '../services/prayerService';

interface QiblaCompassProps {
  qibla: QiblaInfo;
  cityName: string;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ qibla, cityName }) => {
  const [heading, setHeading] = useState<number>(0);
  const [hasCompassSupport, setHasCompassSupport] = useState<boolean>(false);
  const [calibrating, setCalibrating] = useState<boolean>(false);

  useEffect(() => {
    let orientationHandler: ((e: DeviceOrientationEvent) => void) | null = null;

    if (window.DeviceOrientationEvent) {
      orientationHandler = (e: any) => {
        // webkitCompassHeading for iOS Safari, alpha for Android Chrome
        let currentHeading = 0;
        if (e.webkitCompassHeading !== undefined) {
          currentHeading = e.webkitCompassHeading;
          setHasCompassSupport(true);
        } else if (e.alpha !== null) {
          currentHeading = 360 - e.alpha;
          setHasCompassSupport(true);
        }
        setHeading(Math.round(currentHeading));
      };

      window.addEventListener('deviceorientation', orientationHandler, true);
    }

    return () => {
      if (orientationHandler) {
        window.removeEventListener('deviceorientation', orientationHandler, true);
      }
    };
  }, []);

  // Needle angle relative to phone's current facing direction
  const relativeAngle = (qibla.angle - heading + 360) % 360;
  const isAligned = Math.abs(relativeAngle) <= 3 || Math.abs(relativeAngle - 360) <= 3;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6">
      {/* Header Info */}
      <div className="space-y-1 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>Aniq Qibla Yo'nalishi</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          {cityName} uchun Qibla burchagi: <span className="text-emerald-400 font-mono">{qibla.angle}°</span>
        </h3>
        <p className="text-xs text-neutral-400 max-w-md mx-auto">
          {qibla.cardinalDirection} • Makkadagi Muqaddas Kaabagacha masofa: <span className="font-bold text-white font-mono">{qibla.distanceKm.toLocaleString('uz-UZ')} km</span>
        </p>
      </div>

      {/* Interactive Compass Dial */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none my-2">
        {/* Outer Glowing Ring */}
        <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-500 ${
          isAligned ? 'border-emerald-500 shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-500/20' : 'border-neutral-700'
        }`} />

        {/* Degree ticks dial */}
        <div 
          className="absolute inset-2 rounded-full border border-dashed border-neutral-700/80 transition-transform duration-300"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          {/* Cardinal Directions */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-black text-red-500">N (Shimol)</span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">E</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-neutral-400">S (Janub)</span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">W (G'arb)</span>
        </div>

        {/* Qibla Indicator Line & Kaaba Marker */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500 pointer-events-none"
          style={{ transform: `rotate(${qibla.angle - heading}deg)` }}
        >
          {/* Golden Kaaba Pointer Arrow */}
          <div className="absolute top-4 flex flex-col items-center">
            {/* Kaaba Badge */}
            <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 transition-all ${
              isAligned 
                ? 'bg-emerald-500 text-neutral-950 scale-110 shadow-emerald-500/50' 
                : 'bg-amber-400 text-neutral-950'
            }`}>
              <span>🕋 KAABA</span>
            </div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-400 mt-0.5" />
          </div>

          {/* Central Line */}
          <div className="w-0.5 h-44 bg-gradient-to-t from-transparent via-amber-400/40 to-amber-400 rounded-full" />
        </div>

        {/* Center Compass Pivot */}
        <div className={`w-16 h-16 rounded-full bg-neutral-800 border-2 flex items-center justify-center shadow-xl transition-all ${
          isAligned ? 'border-emerald-500 text-emerald-400 scale-105' : 'border-neutral-600 text-amber-400'
        }`}>
          <Navigation className="w-7 h-7" style={{ transform: `rotate(${qibla.angle - heading}deg)` }} />
        </div>
      </div>

      {/* Real-time status / Alignment helper */}
      <div className="space-y-2 relative z-10 w-full max-w-sm">
        {hasCompassSupport ? (
          <div className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
            isAligned
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : 'bg-neutral-800/80 border-neutral-700 text-neutral-300'
          }`}>
            {isAligned ? (
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                To'g'ri Qiblaga qarab turibsiz!
              </span>
            ) : (
              <span>Qurilmani aylantiring: farq {Math.round(relativeAngle)}°</span>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 text-xs flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Telefonni gorizontal tuting. Qibla yo'nalishi: <strong>{qibla.angle}° ({qibla.cardinalDirection})</strong></span>
          </div>
        )}
      </div>

      {/* Ambient background glow */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
