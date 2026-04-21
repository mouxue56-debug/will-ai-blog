// Vercel部署URL（静态文件用）
export const VERCEL_URL = 'https://aiblog.fuluckai.com';
export const STORAGE_BASE = 'https://tafbypudxuksfwrkfbxv.supabase.co/storage/v1/object/public';

export function getCoverUrl(slug: string): string {
  return `${VERCEL_URL}/covers/${slug}.jpg`;
}

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
