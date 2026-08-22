export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400';

export const DEFAULT_PROCEDURE_PHOTO =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600';

export const DEFAULT_GALLERY_PHOTO =
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800';

/**
 * Returns a valid non-empty image URL or the fallback image URL.
 * Guarantees that an empty string ("") is never passed to an <img src> attribute.
 */
export function getSafeImageUrl(
  url: string | undefined | null,
  fallback: string = DEFAULT_PROCEDURE_PHOTO
): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  return url.trim();
}
