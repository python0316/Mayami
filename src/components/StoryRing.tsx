import React, { useId } from 'react';
import { useApp } from '../context/AppContext';
import { Story } from '../types';

interface StoryRingProps {
  stories?: Story[];
  className?: string; // e.g. "w-16 h-16 sm:w-20 sm:h-20"
  strokeWidth?: number; // relative to 100 viewBox (default 3.6)
  children: React.ReactNode;
}

export const StoryRing: React.FC<StoryRingProps> = ({
  stories = [],
  className = 'w-16 h-16 sm:w-20 sm:h-20',
  strokeWidth = 3.8,
  children
}) => {
  const { isStoryViewed } = useApp();
  const gradId = useId().replace(/:/g, '_');

  const total = stories.length;
  const size = 100;
  const radius = (size - strokeWidth) / 2;
  const cx = 50;
  const cy = 50;

  // Telegram-style gap sizes in degrees between segments
  const getGapDegrees = (count: number) => {
    if (count <= 1) return 0;
    if (count === 2) return 16;
    if (count === 3) return 12;
    if (count <= 5) return 8;
    if (count <= 8) return 6;
    if (count <= 12) return 4.5;
    return 3;
  };

  const gapDeg = getGapDegrees(total);
  const segmentDeg = total > 0 ? 360 / total : 360;
  const arcDeg = Math.max(1, segmentDeg - gapDeg);

  // Viewed color: neutral subtle gray that does not shimmer
  const viewedColor = 'currentColor';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Segmented SVG Ring */}
      {total > 0 && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible text-neutral-300 dark:text-neutral-700"
        >
          <defs>
            {/* Vivid Telegram-style gradient for UNSEEN stories */}
            <linearGradient id={`story-grad-${gradId}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00A896" />
              <stop offset="35%" stopColor="#0EA5E9" />
              <stop offset="70%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {total === 1 ? (
            (() => {
              const viewed = isStoryViewed(stories[0].id);
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={viewed ? viewedColor : `url(#story-grad-${gradId})`}
                  strokeWidth={strokeWidth}
                  className="transition-colors duration-300"
                />
              );
            })()
          ) : (
            stories.map((story, i) => {
              const viewed = isStoryViewed(story.id);

              // Angles starting at 12 o'clock (-90 deg)
              const startAngle = -90 + i * segmentDeg + gapDeg / 2;
              const endAngle = startAngle + arcDeg;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = cx + radius * Math.cos(startRad);
              const y1 = cy + radius * Math.sin(startRad);
              const x2 = cx + radius * Math.cos(endRad);
              const y2 = cy + radius * Math.sin(endRad);

              const largeArcFlag = arcDeg > 180 ? 1 : 0;
              const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

              return (
                <path
                  key={story.id || i}
                  d={pathData}
                  fill="none"
                  stroke={viewed ? viewedColor : `url(#story-grad-${gradId})`}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className="transition-colors duration-300"
                />
              );
            })
          )}
        </svg>
      )}

      {/* Inner Avatar with comfortable inset gap */}
      <div className="w-[84%] h-[84%] rounded-full overflow-hidden p-0.5 bg-white dark:bg-[#0A0A0A] flex items-center justify-center shadow-inner">
        {children}
      </div>
    </div>
  );
};
