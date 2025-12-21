/**
 * Image Upload Service
 * Handles all image upload operations to backend API
 * Integrates with Cloudinary backend (feature 002-cloudinary-image-upload)
 */

import axios from 'axios';
import { getAccessToken } from '../utils/storage';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // milliseconds
const RETRY_BACKOFF_MULTIPLIER = 2;

/**
 * Upload error class with enhanced error details
 */
export class UploadError extends Error {
  constructor(message, statusCode, originalError) {
    super(message);
    this.name = 'UploadError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Creates axios config with auth and progress tracking
 */
const createUploadConfig = (onProgress) => {
  const token = getAccessToken();
  
  // Debug auth token
  console.log('🔐 ImageUploadService token check:', {
    tokenExists: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
  });

  return {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
    onUploadProgress: onProgress
      ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
      : undefined,
  };
};

/**
 * Retry logic with exponential backoff
 */
const retryRequest = async (requestFn, retries = MAX_RETRY_ATTEMPTS) => {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (error.response.status !== 408 && error.response.status !== 429) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt === retries - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = RETRY_DELAY * Math.pow(RETRY_BACKOFF_MULTIPLIER, attempt);
      console.log(`Upload attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Handles API error responses
 */
const handleUploadError = (error, context = 'Upload') => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    let message = `${context} failed`;

    switch (status) {
      case 400:
        message = data?.message || 'Invalid file or request';
        break;
      case 401:
        message = 'Unauthorized. Please log in again.';
        break;
      case 403:
        message = 'You do not have permission to perform this action.';
        break;
      case 413:
        message = 'File size exceeds maximum limit (5MB).';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
      default:
        message = data?.message || `${context} failed with status ${status}`;
    }

    throw new UploadError(message, status, error);
  } else if (error.request) {
    // Request made but no response received
    throw new UploadError('Network error. Please check your connection.', 0, error);
  } else {
    // Something else happened
    throw new UploadError(error.message || `${context} failed`, 0, error);
  }
};

/**
 * Image Upload Service - Static methods for all upload operations
 */
class ImageUploadService {
  /**
   * Upload product main image
   * @param {number} productId - Product ID
   * @param {File} file - Image file
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<Object>} Upload result with URL and transformations
   */
  static async uploadProductMain(productId, file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const requestFn = () =>
        axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.PRODUCT.UPLOAD_MAIN_IMAGE(productId)}`,
          formData,
          createUploadConfig(onProgress)
        );

      const response = await retryRequest(requestFn);
      return response.data;
    } catch (error) {
      handleUploadError(error, 'Product main image upload');
    }
  }

  /**
   * Upload product gallery images (batch)
   * @param {number} productId - Product ID
   * @param {File[]} files - Array of image files (max 10)
   * @param {Function} onProgress - Progress callback (percent, fileIndex)
   * @returns {Promise<Object>} Upload result with images array
   */
  static async uploadProductGallery(productId, files, onProgress) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const requestFn = () =>
        axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.PRODUCT.UPLOAD_GALLERY(productId)}`,
          formData,
          createUploadConfig(onProgress)
        );

      const response = await retryRequest(requestFn);
      return response.data;
    } catch (error) {
      handleUploadError(error, 'Product gallery upload');
    }
  }

  /**
   * Reorder product gallery images
   * @param {number} productId - Product ID
   * @param {Array<{imageId: number, displayOrder: number}>} imageOrders - Array of image orders
   * @returns {Promise<Object>} Success message
   */
  static async reorderGallery(productId, imageOrders) {
    try {
      const token = getAccessToken();

      const response = await axios.put(
        `${API_BASE_URL}products/${productId}/images/gallery/reorder`,
        { imageOrders },
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
        }
      );

      return response.data;
    } catch (error) {
      handleUploadError(error, 'Gallery reorder');
    }
  }

  /**
   * Delete product gallery image
   * @param {number} productId - Product ID
   * @param {number} imageId - Image ID to delete
   * @returns {Promise<Object>} Success message
   */
  static async deleteGalleryImage(productId, imageId) {
    try {
      const token = getAccessToken();

      const response = await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT.DELETE_GALLERY_IMAGE(productId, imageId)}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
        }
      );

      return response.data;
    } catch (error) {
      handleUploadError(error, 'Gallery image deletion');
    }
  }

  /**
   * Delete product main image
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Success message
   */
  static async deleteProductMain(productId) {
    try {
      const token = getAccessToken();

      const response = await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT.DELETE_MAIN_IMAGE(productId)}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
        }
      );

      return response.data;
    } catch (error) {
      handleUploadError(error, 'Product main image deletion');
    }
  }

  /**
   * Get all gallery images for a product
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Gallery images array
   */
  static async getGalleryImages(productId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}products/${productId}/images/gallery`
      );

      return response.data;
    } catch (error) {
      handleUploadError(error, 'Get gallery images');
    }
  }

  /**
   * Get all product images (main, gallery, variants)
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} ProductImagesResponse with mainImage, galleryImages, primaryAttribute, variantImages
   */
  static async getProductImages(productId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}products/${productId}/images`
      );

      return response.data;
    } catch (error) {
      handleUploadError(error, 'Get product images');
    }
  }

  /**
   * Upload variant-specific image (single)
   * @param {number} productId - Product ID
   * @param {File} file - Image file
   * @param {string} attributeValue - Attribute value (e.g., "Red", "Blue")
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<Object>} VariantImageResponse with id, attributeValue, imageUrl, publicId
   */
  static async uploadVariantImage(productId, file, attributeValue, onProgress) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const requestFn = () =>
        axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.PRODUCT.UPLOAD_VARIANT_IMAGE(productId, encodeURIComponent(attributeValue))}`,
          formData,
          createUploadConfig(onProgress)
        );

      const response = await retryRequest(requestFn);
      return response.data;
    } catch (error) {
      handleUploadError(error, 'Variant image upload');
    }
  }

  /**
   * Delete variant-specific image
   * @param {number} productId - Product ID
   * @param {string} attributeValue - Attribute value (e.g., "Red", "Blue")
   * @returns {Promise<Object>} Success message
   */
  static async deleteVariantImage(productId, attributeValue) {
    try {
      const token = getAccessToken();

      const response = await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCT.DELETE_VARIANT_IMAGE(productId, attributeValue)}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
        }
      );

      return response.data;
    } catch (error) {
      handleUploadError(error, 'Variant image deletion');
    }
  }

  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<Object>} Upload result with URL
   */
  static async uploadAvatar(file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const requestFn = () =>
        axios.post(
          `${API_BASE_URL}users/me/avatar`,
          formData,
          createUploadConfig(onProgress)
        );

      const response = await retryRequest(requestFn);
      return response.data;
    } catch (error) {
      handleUploadError(error, 'Avatar upload');
    }
  }

  /**
   * Delete user avatar
   * @returns {Promise<Object>} Success message
   */
  static async deleteAvatar() {
    try {
      const token = getAccessToken();

      const response = await axios.delete(
        `${API_BASE_URL}users/me/avatar`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
        }
      );

      return response.data;
    } catch (error) {
      handleUploadError(error, 'Avatar deletion');
    }
  }

  /**
   * Upload shop logo
   * @param {number} shopId - Shop ID
   * @param {File} file - Logo image file
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<Object>} Upload result with URL
   */
  static async uploadShopLogo(shopId, file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const requestFn = () =>
        axios.post(
          `${API_BASE_URL}shops/${shopId}/logo`,
          formData,
          createUploadConfig(onProgress)
        );

      const response = await retryRequest(requestFn);
      return response.data;
    } catch (error) {
      handleUploadError(error, 'Shop logo upload');
    }
  }

  /**
   * Upload shop banner
   * @param {number} shopId - Shop ID
   * @param {File} file - Banner image file
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<Object>} Upload result with URL
   */
  static async uploadShopBanner(shopId, file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('banner', file);

      const requestFn = () =>
        axios.post(
          `${API_BASE_URL}shops/${shopId}/banner`,
          formData,
          createUploadConfig(onProgress)
        );

      const response = await retryRequest(requestFn);
      return response.data;
    } catch (error) {
      handleUploadError(error, 'Shop banner upload');
    }
  }

  /**
   * Upload review images
   * @param {number} reviewId - Review ID
   * @param {File[]} files - Array of image files (max 5)
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<Object>} Upload result with images array
   */
  static async uploadReviewImages(reviewId, files, onProgress) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const requestFn = () =>
        axios.post(
          `${API_BASE_URL}reviews/${reviewId}/images`,
          formData,
          createUploadConfig(onProgress)
        );

      const response = await retryRequest(requestFn);
      return response.data;
    } catch (error) {
      handleUploadError(error, 'Review images upload');
    }
  }

  /**
   * Delete review image
   * @param {number} reviewId - Review ID
   * @param {number} imageIndex - Image index to delete
   * @returns {Promise<Object>} Success message
   */
  static async deleteReviewImage(reviewId, imageIndex) {
    try {
      const token = getAccessToken();

      const response = await axios.delete(
        `${API_BASE_URL}reviews/${reviewId}/images/${imageIndex}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
        }
      );

      return response.data;
    } catch (error) {
      handleUploadError(error, 'Review image deletion');
    }
  }

  /**
   * Get primary attribute information for a product
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Primary attribute info {id, name} or null
   */
  static async getPrimaryAttribute(productId) {
    try {
      const token = getAccessToken();
      
      // Temporary direct URL construction to bypass constants issue
      const endpoint = `products/${productId}/images/primary-attribute`;
      console.log('🔍 DEBUG - Primary attribute endpoint:', endpoint);
      
      const response = await axios.get(
        `${API_BASE_URL}${endpoint}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
          }
        }
      );
      
      console.log('🔍 Primary attribute response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching primary attribute:', error);
      throw error;
    }
  }

  /**
   * Upload variant images in batch with variant value mapping
   * @param {number} productId - Product ID
   * @param {File[]} files - Array of image files
   * @param {Object} variantMappings - Mapping of variant values to file indices, e.g., {"Red": [0, 1], "Blue": [2, 3]}
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<Object>} Upload result with images per variant
   */
  static async uploadVariantImagesBatch(productId, files, variantMappings, onProgress) {
    try {
      const formData = new FormData();

      // Append all image files with key "files"
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Append variant mappings as JSON string
      formData.append('variantMappings', JSON.stringify(variantMappings));

      const requestFn = () =>
        axios.post(
          `${API_BASE_URL}products/${productId}/images/gallery/batch-variants`,
          formData,
          createUploadConfig(onProgress)
        );

      const response = await retryRequest(requestFn);
      return response.data;
    } catch (error) {
      handleUploadError(error, 'Variant images batch upload');
    }
  }

  /**
   * Upload refund request image
   * Uses CommonImageController's upload endpoint with folder=refund
   * @param {FormData} formData - FormData containing the image file
   * @returns {Promise<Object>} Upload response with image URL
   */
  static async uploadRefundImage(formData) {
    try {
      const token = getAccessToken();
      
      console.log('📤 Uploading refund image to /images/upload?folder=refund');
      
      const response = await axios.post(
        `${API_BASE_URL}images/upload?folder=refund`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : undefined,
          }
        }
      );
      
      console.log('✅ Refund image uploaded:', response.data);
      
      // Extract URL from ResponseDTO structure
      const data = response.data?.data || response.data;
      return {
        url: data.url,
        publicId: data.publicId,
        transformations: data.transformations
      };
    } catch (error) {
      console.error('❌ Error uploading refund image:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Không thể tải ảnh lên');
    }
  }
}

export default ImageUploadService;
