const VERCEL_URL = 'https://aiblog.fuluckai.com';

export function getAudioUrl(filename: string): string {
  return `${VERCEL_URL}/audio/${filename}`;
}

export function getIllustrationUrl(name: string): string {
  // Use relative path so both dev (localhost) and prod (Vercel) serve from /public
  return `/covers/illustrations/${name}.jpg?v=4`;
}

export function getAvatarUrl(name: string): string {
  return `/covers/avatars/${name}.png?v=1`;
}
