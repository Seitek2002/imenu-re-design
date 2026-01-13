/** Route-based tablet mode helpers (no React/DOM) */

/** Tablet mode is enabled when venue slug ends with 'd' */
export function isTabletVenueSlug(slug?: string | null): boolean {
  if (!slug) return false;
  return /d$/i.test(slug);
}

/** Remove trailing 'd' from venue slug to get canonical backend slug */
export function canonicalizeVenueSlug(slug: string): string {
  if (!slug) return slug;
  return slug.replace(/d$/i, '');
}

/** Extract first path segment (venue) from pathname like "/venue/..." */
export function getVenueFromPath(pathname: string): string | null {
  if (!pathname) return null;
  const m = pathname.replace(/^\//, '').match(/^([^/]+)/);
  return m ? m[1] : null;
}

/** Check tablet mode from full pathname by inspecting first path segment */
export function isTabletRoutePath(pathname: string | undefined): boolean {
  if (!pathname) return false;
  const venue = getVenueFromPath(pathname);
  return isTabletVenueSlug(venue);
}

/** Get canonical (no 'd' suffix) venue from full pathname */
export function getCanonicalVenueFromPath(
  pathname: string | undefined
): string | null {
  if (!pathname) return null;
  const venue = getVenueFromPath(pathname);
  return venue ? canonicalizeVenueSlug(venue) : null;
}

/** Kiosk mode: path pattern "/[venue]/d" (second segment is exactly 'd') */
export function isKioskRoutePath(pathname: string | undefined): boolean {
  if (!pathname) return false;
  // Kiosk mode if path contains "/d" as a distinct segment anywhere
  // Examples: "/venue/d", "/venue/123/d", "/d" -> true
  // Avoid matching words like "/orders" (ensure segment boundaries)
  return /(^|\/)d(\/?|$)/i.test(pathname);
}
