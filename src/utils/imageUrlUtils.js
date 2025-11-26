/**
 * Image URL Transformation Utilities
 * Provides functions for generating Cloudinary transformation URLs
 */

/**
 * Generates a thumbnail URL from a Cloudinary image URL
 * @param {string} imageUrl - Original Cloudinary image URL
 * @param {number} width - Thumbnail width (default: 150)
 * @param {number} height - Thumbnail height (default: 150)
 * @param {string} crop - Crop mode (default: 'fill')
 * @returns {string} Thumbnail URL with Cloudinary transformations
 */
export const generateThumbnailUrl = (imageUrl, width = 150, height = 150, crop = 'fill') => {
  if (!imageUrl) return '';

  // Check if it's a Cloudinary URL
  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  // Insert transformation parameters before /upload/
  const transformation = `c_${crop},w_${width},h_${height},q_auto,f_auto`;
  return imageUrl.replace('/upload/', `/upload/${transformation}/`);
};

/**
 * Generates a responsive srcset string for an image
 * @param {string} imageUrl - Original Cloudinary image URL
 * @param {number[]} widths - Array of widths for responsive images (default: [320, 640, 1024, 1920])
 * @returns {string} srcset string for img element
 */
export const generateResponsiveSrcset = (imageUrl, widths = [320, 640, 1024, 1920]) => {
  if (!imageUrl) return '';

  // Check if it's a Cloudinary URL
  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  return widths
    .map((width) => {
      const transformation = `c_scale,w_${width},q_auto,f_auto`;
      const transformedUrl = imageUrl.replace('/upload/', `/upload/${transformation}/`);
      return `${transformedUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * Applies quality optimization to a Cloudinary URL
 * @param {string} imageUrl - Original Cloudinary image URL
 * @param {string} quality - Quality setting (default: 'auto')
 * @returns {string} URL with quality optimization
 */
export const optimizeImageQuality = (imageUrl, quality = 'auto') => {
  if (!imageUrl) return '';

  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const transformation = `q_${quality},f_auto`;
  return imageUrl.replace('/upload/', `/upload/${transformation}/`);
};

/**
 * Applies blur effect for lazy loading placeholder
 * @param {string} imageUrl - Original Cloudinary image URL
 * @param {number} blur - Blur intensity (default: 1000)
 * @returns {string} URL with blur transformation
 */
export const generateBlurPlaceholder = (imageUrl, blur = 1000) => {
  if (!imageUrl) return '';

  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const transformation = `e_blur:${blur},q_auto:low,f_auto`;
  return imageUrl.replace('/upload/', `/upload/${transformation}/`);
};

/**
 * Crops image to specific dimensions
 * @param {string} imageUrl - Original Cloudinary image URL
 * @param {Object} dimensions - {width, height, crop, gravity}
 * @returns {string} URL with crop transformation
 */
export const cropImage = (imageUrl, { width, height, crop = 'fill', gravity = 'auto' }) => {
  if (!imageUrl) return '';

  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const transformation = `c_${crop},w_${width},h_${height},g_${gravity},q_auto,f_auto`;
  return imageUrl.replace('/upload/', `/upload/${transformation}/`);
};

/**
 * Generates a circular cropped image (for avatars)
 * @param {string} imageUrl - Original Cloudinary image URL
 * @param {number} size - Diameter of the circle (default: 200)
 * @returns {string} URL with circular crop transformation
 */
export const generateCircularCrop = (imageUrl, size = 200) => {
  if (!imageUrl) return '';

  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const transformation = `c_fill,w_${size},h_${size},g_face,r_max,q_auto,f_auto`;
  return imageUrl.replace('/upload/', `/upload/${transformation}/`);
};

/**
 * Extracts the public ID from a Cloudinary URL
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {string} Public ID of the image
 */
export const extractPublicId = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return '';
  }

  try {
    // Extract everything after /upload/ and before file extension
    const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    return match ? match[1] : '';
  } catch (error) {
    console.error('Failed to extract public ID:', error);
    return '';
  }
};

/**
 * Checks if a URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} True if URL is from Cloudinary
 */
export const isCloudinaryUrl = (url) => {
  return typeof url === 'string' && url.includes('cloudinary.com');
};

/**
 * Gets the original (untransformed) Cloudinary URL
 * @param {string} imageUrl - Possibly transformed Cloudinary URL
 * @returns {string} Original URL without transformations
 */
export const getOriginalUrl = (imageUrl) => {
  if (!imageUrl || !isCloudinaryUrl(imageUrl)) {
    return imageUrl;
  }

  // Remove transformation parameters
  return imageUrl.replace(/\/upload\/[^/]+\//, '/upload/');
};
