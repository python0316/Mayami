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
