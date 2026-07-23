/**
 * Cloudinary's standard poster-frame convention: a JPG of a video's first
 * frame, derived from its delivery URL with no extra API call. Safe to
 * import from Client Components (unlike src/lib/cloudinary.ts, which pulls
 * in the server-only Cloudinary SDK).
 */
export function getVideoThumbnailUrl(url: string): string {
  return url.replace("/video/upload/", "/video/upload/so_0/").replace(/\.[^./]+$/, ".jpg");
}
