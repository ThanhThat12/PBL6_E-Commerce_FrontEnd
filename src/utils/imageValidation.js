/**
 * Image Validation Utilities
 * Provides functions for validating image files before upload
 */

// Allowed image formats
export const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Max file size (5MB)
export const MAX_FILE_SIZE = parseInt(process.env.REACT_APP_MAX_IMAGE_SIZE) || 5242880; // 5MB in bytes

// Image dimension constraints
export const IMAGE_DIMENSIONS = {
  avatar: {
    width: parseInt(process.env.REACT_APP_AVATAR_SIZE) || 400,
    height: parseInt(process.env.REACT_APP_AVATAR_SIZE) || 400,
  },
  shopLogo: {
    width: parseInt(process.env.REACT_APP_SHOP_LOGO_SIZE) || 400,
    height: parseInt(process.env.REACT_APP_SHOP_LOGO_SIZE) || 400,
  },
  shopBanner: {
    width: parseInt(process.env.REACT_APP_SHOP_BANNER_WIDTH) || 1200,
    height: parseInt(process.env.REACT_APP_SHOP_BANNER_HEIGHT) || 400,
  },
  productImage: {
    minWidth: parseInt(process.env.REACT_APP_PRODUCT_IMAGE_MIN_WIDTH) || 500,
    minHeight: parseInt(process.env.REACT_APP_PRODUCT_IMAGE_MIN_HEIGHT) || 500,
  },
};

/**
 * Validates if file type is an allowed image format
 * @param {File} file - File to validate
 * @returns {boolean} True if file type is allowed
 */
export const validateFileType = (file) => {
  if (!file || !file.type) {
    return false;
  }
  return ALLOWED_IMAGE_FORMATS.includes(file.type);
};

/**
 * Validates if file size is within the allowed limit
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum file size in bytes (optional, defaults to MAX_FILE_SIZE)
 * @returns {boolean} True if file size is within limit
 */
export const validateFileSize = (file, maxSize = MAX_FILE_SIZE) => {
  if (!file || !file.size) {
    return false;
  }
  return file.size <= maxSize;
};

/**
 * Gets image dimensions from a file
 * @param {File} file - Image file to get dimensions from
 * @returns {Promise<{width: number, height: number}>} Promise resolving to image dimensions
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !validateFileType(file)) {
      reject(new Error('Invalid file type'));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
};

/**
 * Validates image dimensions against minimum requirements
 * @param {File} file - Image file to validate
 * @param {Object} constraints - Dimension constraints {minWidth, minHeight, width, height}
 * @returns {Promise<{valid: boolean, error?: string, dimensions: {width, height}}>}
 */
export const validateDimensions = async (file, constraints = {}) => {
  try {
    const dimensions = await getImageDimensions(file);

    // Check exact dimensions if specified
    if (constraints.width && constraints.height) {
      if (dimensions.width !== constraints.width || dimensions.height !== constraints.height) {
        return {
          valid: false,
          error: `Image must be exactly ${constraints.width}x${constraints.height}px`,
          dimensions,
        };
      }
    }

    // Check minimum dimensions
    if (constraints.minWidth && dimensions.width < constraints.minWidth) {
      return {
        valid: false,
        error: `Image width must be at least ${constraints.minWidth}px`,
        dimensions,
      };
    }

    if (constraints.minHeight && dimensions.height < constraints.minHeight) {
      return {
        valid: false,
        error: `Image height must be at least ${constraints.minHeight}px`,
        dimensions,
      };
    }

    return {
      valid: true,
      dimensions,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message || 'Failed to validate image dimensions',
      dimensions: { width: 0, height: 0 },
    };
  }
};

/**
 * Validates an image file against all constraints
 * @param {File} file - Image file to validate
 * @param {Object} options - Validation options {maxSize, dimensions}
 * @returns {Promise<{valid: boolean, errors: string[]}>}
 */
export const validateImageFile = async (file, options = {}) => {
  const errors = [];

  // Validate file type
  if (!validateFileType(file)) {
    errors.push('Invalid file type. Only JPG, PNG, and WEBP images are allowed.');
  }

  // Validate file size
  const maxSize = options.maxSize || MAX_FILE_SIZE;
  if (!validateFileSize(file, maxSize)) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File size exceeds ${maxSizeMB}MB limit.`);
  }

  // Validate dimensions if constraints provided
  if (options.dimensions && errors.length === 0) {
    const dimensionResult = await validateDimensions(file, options.dimensions);
    if (!dimensionResult.valid) {
      errors.push(dimensionResult.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates multiple image files
 * @param {File[]} files - Array of image files to validate
 * @param {Object} options - Validation options {maxSize, dimensions, maxCount}
 * @returns {Promise<{valid: boolean, errors: string[], validFiles: File[]}>}
 */
export const validateImageFiles = async (files, options = {}) => {
  const errors = [];
  const validFiles = [];

  // Check max count
  if (options.maxCount && files.length > options.maxCount) {
    errors.push(`Maximum ${options.maxCount} images allowed.`);
    return { valid: false, errors, validFiles };
  }

  // Validate each file
  for (const file of files) {
    const result = await validateImageFile(file, options);
    if (result.valid) {
      validFiles.push(file);
    } else {
      errors.push(`${file.name}: ${result.errors.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    validFiles,
  };
};
