/**
 * Utility to generate placeholder images
 */

/**
 * Generate inline SVG placeholder image
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
 * Default product placeholder
 */
export const PRODUCT_PLACEHOLDER = generatePlaceholder('No Image', 400, 400);

/**
 * Get product image with fallback
 * @param {Object} product - Product object
 * @returns {string} Image URL or placeholder
 */
export const getProductImage = (product) => {
  return product?.mainImage || product?.image || PRODUCT_PLACEHOLDER;
};
