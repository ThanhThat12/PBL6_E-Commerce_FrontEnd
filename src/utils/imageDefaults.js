/**
 * Default Image URLs for fallback when images fail to load
 */

// Default product image (placeholder)
export const DEFAULT_PRODUCT_IMAGE = 'https://res.cloudinary.com/dggg8zvoo/image/upload/v1700000000/default-product.png';

// Default user avatar (generic avatar)
export const DEFAULT_AVATAR_IMAGE = 'https://res.cloudinary.com/dggg8zvoo/image/upload/v1700000000/default-avatar.png';

// Default shop logo (store icon)
export const DEFAULT_SHOP_LOGO = 'https://res.cloudinary.com/dggg8zvoo/image/upload/v1700000000/default-shop-logo.png';

// Default shop banner (generic banner)
export const DEFAULT_SHOP_BANNER = 'https://res.cloudinary.com/dggg8zvoo/image/upload/v1700000000/default-shop-banner.png';

// Default chat/message image
export const DEFAULT_CHAT_IMAGE = 'https://res.cloudinary.com/dggg8zvoo/image/upload/v1700000000/default-chat-image.png';

/**
 * Handle image error by setting default image
 * @param {Event} e - The error event
 * @param {string} defaultUrl - The default image URL to use
 */
export const handleImageError = (e, defaultUrl) => {
  if (e.target.src !== defaultUrl) {
    e.target.src = defaultUrl;
    // Prevent infinite loop if default also fails
    e.target.onerror = null;
  }
};

/**
 * Get appropriate default image based on type
 * @param {string} type - Type of image (product, avatar, logo, banner, chat)
 * @returns {string} Default image URL
 */
export const getDefaultImage = (type) => {
  switch (type) {
    case 'product':
      return DEFAULT_PRODUCT_IMAGE;
    case 'avatar':
      return DEFAULT_AVATAR_IMAGE;
    case 'logo':
      return DEFAULT_SHOP_LOGO;
    case 'banner':
      return DEFAULT_SHOP_BANNER;
    case 'chat':
      return DEFAULT_CHAT_IMAGE;
    default:
      return DEFAULT_PRODUCT_IMAGE;
  }
};
