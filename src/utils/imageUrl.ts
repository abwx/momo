/**
 * Encodes static asset URLs so non-ASCII image names load consistently.
 */
export function getImageUrl(url: string) {
  if (!url) return '';
  return encodeURI(url);
}
