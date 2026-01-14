/**
 * Simple, reliable image handling
 * Uses category-based stock images - no complex proxying
 */

// Reliable stock images by category from Unsplash
const CATEGORY_IMAGES = {
  Food: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  ],
  Retail: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
    'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
  ],
  Services: [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
    'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80',
  ],
  Entertainment: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80',
  ],
  Health: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80',
  ],
  Other: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  ],
};

export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';

/**
 * Get a reliable image URL for a business
 * @param {string} url - Original image URL (may be null/invalid)
 * @param {string} category - Business category for fallback
 * @param {string} name - Business name for consistent selection
 */
export function getBusinessImage(url, category = 'Other', name = '') {
  // If we have a valid URL, use it
  if (url && typeof url === 'string') {
    const trimmed = url.trim();

    // Accept Unsplash URLs directly
    if (trimmed.includes('unsplash.com')) {
      return trimmed;
    }

    // Accept Google Places photo URLs
    if (trimmed.includes('googleapis.com/maps/api/place/photo')) {
      return trimmed;
    }

    // Accept any valid https URL
    if (trimmed.startsWith('https://')) {
      return trimmed;
    }

    // Accept http://localhost URLs (for local dev)
    if (trimmed.startsWith('http://localhost')) {
      return trimmed;
    }
  }

  // Use category-based stock image as fallback
  return getCategoryImage(category, name);
}

/**
 * Get a consistent category image based on business name
 */
export function getCategoryImage(category, name = '') {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Other;

  // Use name to pick a consistent image (so same business always gets same image)
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % images.length;

  return images[index];
}

/**
 * Legacy function for backwards compatibility
 */
export function normalizeImageUrl(url, category = 'Other', name = '') {
  return getBusinessImage(url, category, name);
}
