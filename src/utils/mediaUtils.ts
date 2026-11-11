// Media parsing utilities for Stories (YouTube, Direct Video, Image)

export interface ParsedMedia {
  isYouTube: boolean;
  youTubeId: string | null;
  embedUrl: string | null;
  thumbnailUrl: string;
  isDirectVideo: boolean;
  isImage: boolean;
  mediaType: 'image' | 'video';
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Handle youtu.be/<id>
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // Handle youtube.com/(watch|shorts|embed|live|v)/
  const standardMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/))([a-zA-Z0-9_-]{11})/i
  );
  if (standardMatch && standardMatch[1]) return standardMatch[1];

  // If user entered only the 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function parseStoryMedia(url: string, explicitType?: 'image' | 'video'): ParsedMedia {
  const trimmed = (url || '').trim();

  // YouTube detection
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return {
      isYouTube: true,
      youTubeId: ytId,
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&controls=1&loop=1&playlist=${ytId}&modestbranding=1&playsinline=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      isDirectVideo: false,
      isImage: false,
      mediaType: 'video'
    };
  }

  // Direct video file extension or data/blob check
  const isDirect = trimmed.startsWith('data:video/') || trimmed.startsWith('blob:') || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed);
  if (isDirect || explicitType === 'video') {
    return {
      isYouTube: false,
      youTubeId: null,
      embedUrl: null,
      thumbnailUrl: trimmed,
      isDirectVideo: true,
      isImage: false,
      mediaType: 'video'
    };
  }

  // Default to Image
  return {
    isYouTube: false,
    youTubeId: null,
    embedUrl: null,
    thumbnailUrl: trimmed || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    isDirectVideo: false,
    isImage: true,
    mediaType: 'image'
  };
}

// Banner Image Sanitization, Proxy & Multi-Tier Fallback Utilities
export const BANNER_FALLBACK_IMAGES: Record<string, string[]> = {
  clothing: [
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&auto=format&fit=crop&q=80'
  ],
  shoes: [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&auto=format&fit=crop&q=80'
  ],
  electronics: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeede?w=1400&auto=format&fit=crop&q=80'
  ],
  'beauty-and-personal-care': [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1400&auto=format&fit=crop&q=80'
  ],
  'islamic-items': [
    'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1400&auto=format&fit=crop&q=80'
  ],
  watches: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1400&auto=format&fit=crop&q=80'
  ],
  default: [
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&auto=format&fit=crop&q=80'
  ]
};

export function getBannerFallbackImage(category?: string, seed?: string | number): string {
  const cat = category && BANNER_FALLBACK_IMAGES[category] ? category : 'default';
  const list = BANNER_FALLBACK_IMAGES[cat] || BANNER_FALLBACK_IMAGES.default;
  if (!seed && seed !== 0) return list[0];
  let num = 0;
  if (typeof seed === 'number') {
    num = Math.abs(seed);
  } else {
    for (let i = 0; i < seed.length; i++) {
      num += seed.charCodeAt(i);
    }
  }
  return list[num % list.length];
}

export function sanitizeBannerImageUrl(raw: string): string {
  if (!raw) return '';
  let url = raw.trim();

  // Strip markdown image syntax: ![alt](url)
  const mdMatch = url.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    url = mdMatch[1].trim();
  }

  // Strip wrapping quotes or angle brackets
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'")) ||
    (url.startsWith('<') && url.endsWith('>'))
  ) {
    url = url.slice(1, -1).trim();
  }

  // Pass Data URLs and blob URLs directly
  if (url.startsWith('data:image/') || url.startsWith('blob:')) return url;

  // Extract from Google, Yandex, Bing image search result parameters if user pasted a search URL
  try {
    const isSearchEngine = /google\.|yandex\.|bing\./i.test(url);
    if (isSearchEngine) {
      const searchParamMatch = url.match(/[?&](?:imgurl|img_url|mediaurl|image_url|url)=([^&]+)/i);
      if (searchParamMatch && searchParamMatch[1]) {
        const decoded = decodeURIComponent(searchParamMatch[1]);
        if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
          url = decoded;
        }
      }
    }
  } catch (e) {}

  return url.trim();
}

/**
 * Robust image error handler with automatic proxy retry and non-blocking fallback.
 * Solves hotlink protection (403), CORS, and network issues without causing React re-renders.
 */
export function handleBannerImageError(
  imgElement: HTMLImageElement,
  originalUrl: string,
  fallbackUrl?: string,
  onErrorNotify?: () => void
): void {
  const cleanUrl = sanitizeBannerImageUrl(originalUrl);

  // 1. If not yet proxied and it's a valid remote HTTP/HTTPS URL, try wsrv.nl proxy
  if (
    cleanUrl &&
    cleanUrl.startsWith('http') &&
    !cleanUrl.includes('wsrv.nl') &&
    !imgElement.dataset.proxyTried
  ) {
    imgElement.dataset.proxyTried = 'true';
    imgElement.src = `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}`;
    return;
  }

  // 2. If proxy was already attempted or failed:
  if (fallbackUrl) {
    if (imgElement.src !== fallbackUrl) {
      imgElement.src = fallbackUrl;
    }
  } else {
    // If no fallback is desired, hide the broken img so underlying gradient shows cleanly
    imgElement.style.opacity = '0';
  }

  if (onErrorNotify) {
    onErrorNotify();
  }
}

export function isLikelyImageUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.startsWith('data:image/') ||
    clean.includes('images.unsplash.com') ||
    clean.includes('imgurl=') ||
    clean.includes('img_url=') ||
    clean.includes('mediaurl=') ||
    clean.includes('wsrv.nl') ||
    /\.(jpeg|jpg|png|webp|gif|svg|avif)(\?.*)?$/i.test(clean)
  );
}
