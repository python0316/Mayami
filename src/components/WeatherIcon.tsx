import React from 'react';
import { 
  Sun, 
  Moon, 
  CloudSun, 
  CloudMoon, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning 
} from 'lucide-react';
import { WeatherIconType } from '../services/weatherService';

interface WeatherIconProps {
  type: WeatherIconType | string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ type, className = "w-6 h-6", size }) => {
  const iconProps = { className, size };

  switch (type) {
    case 'sun':
      return <Sun {...iconProps} className={`${className} text-amber-500`} />;
    case 'moon':
      return <Moon {...iconProps} className={`${className} text-indigo-400`} />;
    case 'cloud-sun':
      return <CloudSun {...iconProps} className={`${className} text-amber-500`} />;
    case 'cloud-moon':
      return <CloudMoon {...iconProps} className={`${className} text-indigo-300`} />;
    case 'cloud':
      return <Cloud {...iconProps} className={`${className} text-slate-400`} />;
    case 'cloud-fog':
      return <CloudFog {...iconProps} className={`${className} text-slate-400`} />;
    case 'cloud-drizzle':
      return <CloudDrizzle {...iconProps} className={`${className} text-cyan-500`} />;
    case 'cloud-rain':
      return <CloudRain {...iconProps} className={`${className} text-blue-500`} />;
    case 'cloud-snow':
      return <CloudSnow {...iconProps} className={`${className} text-sky-300`} />;
    case 'cloud-lightning':
      return <CloudLightning {...iconProps} className={`${className} text-violet-500`} />;
    default:
      return <Sun {...iconProps} className={`${className} text-amber-500`} />;
  }
};
