export const STORAGE_BASE = 'https://tafbypudxuksfwrkfbxv.supabase.co/storage/v1/object/public';

export function getCoverUrl(slug: string): string {
  return `${STORAGE_BASE}/covers/${slug}.jpg`;
}

export function getAudioUrl(filename: string): string {
  return `${STORAGE_BASE}/audio/${filename}`;
}