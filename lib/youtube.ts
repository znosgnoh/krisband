const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

export function parseYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return parseYouTubeVideoId(url) !== null;
}

export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = parseYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = parseYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function getYouTubeWatchUrl(url: string): string | null {
  return normalizeYouTubeUrl(url);
}
