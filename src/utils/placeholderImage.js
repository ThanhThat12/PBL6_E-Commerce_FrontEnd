/**
 * Utility to get product images with Cloudinary fallbacks
 * Now using real Cloudinary default images instead of SVG placeholders
 */

import { 
  DEFAULT_PRODUCT_IMAGE, 
  DEFAULT_AVATAR_IMAGE, 
  DEFAULT_SHOP_LOGO, 
  DEFAULT_SHOP_BANNER,
  handleImageError 
} from './imageDefaults';

/**
 * Generate inline SVG placeholder image (legacy - kept for compatibility)
 * @param {string} text - Text to display in placeholder
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} bgColor - Background color (hex without #)
 * @param {string} textColor - Text color (hex without #)
 * @returns {string} Data URI for inline SVG
 */
export const generatePlaceholder = (text, width, height, bgColor, textColor) => {
  const finalText = text || 'No Image';
  const finalWidth = width || 400;
  const finalHeight = height || 400;
  const finalBgColor = bgColor || 'e5e7eb';
  const finalTextColor = textColor || '9ca3af';
  
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + finalWidth + '" height="' + finalHeight + '">' +
    '<rect fill="#' + finalBgColor + '" width="' + finalWidth + '" height="' + finalHeight + '"/>' +
    '<text fill="#' + finalTextColor + '" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%" y="50%" text-anchor="middle">' +
    finalText + '</text>' +
    '</svg>';

  // Encode SVG for data URI
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
};

/**
 * Default product placeholder - now uses Cloudinary
 */
export const PRODUCT_PLACEHOLDER = DEFAULT_PRODUCT_IMAGE;

/**
 * Get product image with fallback to Cloudinary default
 * Priority: mainImage > productMainImage > image > productImage > Cloudinary default
 * @param {Object} product - Product object (or item with product data)
 * @returns {string} Image URL or Cloudinary default
 */
export const getProductImage = (product) => {
  return product?.mainImage 
    || product?.productMainImage 
    || product?.image 
    || product?.productImage 
    || DEFAULT_PRODUCT_IMAGE;
};

/**
 * Get user avatar with fallback to Cloudinary default
 * @param {Object} user - User object
 * @returns {string} Avatar URL or Cloudinary default
 */
export const getUserAvatar = (user) => {
  return user?.avatar 
    || user?.avatarUrl 
    || user?.userAvatarUrl 
    || DEFAULT_AVATAR_IMAGE;
};

/**
 * Get shop logo with fallback to Cloudinary default
 * @param {Object} shop - Shop object
 * @returns {string} Logo URL or Cloudinary default
 */
export const getShopLogo = (shop) => {
  return shop?.logo 
    || shop?.logoUrl 
    || shop?.shopLogo 
    || DEFAULT_SHOP_LOGO;
};

/**
 * Get shop banner with fallback to Cloudinary default
 * @param {Object} shop - Shop object
 * @returns {string} Banner URL or Cloudinary default
 */
export const getShopBanner = (shop) => {
  return shop?.banner 
    || shop?.bannerUrl 
    || shop?.shopBanner 
    || DEFAULT_SHOP_BANNER;
};

// Re-export handleImageError for convenience
export { handleImageError };

// Re-export default images for direct use
export {
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_AVATAR_IMAGE,
  DEFAULT_SHOP_LOGO,
  DEFAULT_SHOP_BANNER
};

