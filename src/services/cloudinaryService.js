// src/services/cloudinaryService.js

import api from './api';

/**
 * Cloudinary Upload Service
 * 
 * Provides functions to upload images to Cloudinary via backend API
 */

const BASE_URL = '/upload';

/**
 * Upload avatar image
 * 
 * @param {File} file - Image file
 * @returns {Promise<string>} Image URL
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`${BASE_URL}/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};

/**
 * Upload product image
 * 
 * @param {File} file - Image file
 * @param {number} productId - Product ID (optional)
 * @returns {Promise<string>} Image URL
 */
export const uploadProductImage = async (file, productId = 0) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('productId', productId);

  const response = await api.post(`${BASE_URL}/product`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};

/**
 * Upload single review image
 * 
 * @param {File} file - Image file
 * @returns {Promise<string>} Image URL
 */
export const uploadReviewImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`${BASE_URL}/review`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};

/**
 * Upload multiple review images
 * 
 * @param {File[]} files - Array of image files (max 5)
 * @returns {Promise<string[]>} Array of image URLs
 */
export const uploadReviewImages = async (files) => {
  if (!files || files.length === 0) {
    throw new Error('No files selected');
  }

  if (files.length > 5) {
    throw new Error('Maximum 5 images allowed');
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post(`${BASE_URL}/reviews`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.urls;
};

/**
 * Delete image by URL
 * 
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<boolean>} Success status
 */
export const deleteImage = async (imageUrl) => {
  const response = await api.delete(`${BASE_URL}/image`, {
    data: { imageUrl },
  });

  return response.data.success;
};

/**
 * Validate image file
 * 
 * @param {File} file - File to validate
 * @throws {Error} If validation fails
 */
export const validateImageFile = (file) => {
  // Check if file exists
  if (!file) {
    throw new Error('File không được để trống');
  }

  // Check file size (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Kích thước file không được vượt quá 5MB');
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Chỉ chấp nhận file ảnh định dạng: JPEG, PNG, GIF, WEBP');
  }

  return true;
};

/**
 * Compress image before upload (optional)
 * 
 * @param {File} file - Image file
 * @param {number} maxWidth - Max width
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<Blob>} Compressed image blob
 */
export const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = (error) => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = (error) => {
      reject(new Error('Failed to read file'));
    };
  });
};

export default {
  uploadAvatar,
  uploadProductImage,
  uploadReviewImage,
  uploadReviewImages,
  deleteImage,
  validateImageFile,
  compressImage,
};
