// src/hooks/useImageUpload.js

import { useState } from 'react';
import { 
  uploadAvatar, 
  uploadProductImage, 
  uploadReviewImage,
  uploadReviewImages,
  validateImageFile,
  deleteImage 
} from '../services/cloudinaryService';

/**
 * Custom hook for image upload with Cloudinary
 * 
 * @param {string} uploadType - Type of upload: 'avatar' | 'product' | 'review'
 * @returns {object} Upload state and functions
 */
const useImageUpload = (uploadType = 'review') => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Upload single image
   */
  const uploadSingleImage = async (file, productId = null) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate file
      validateImageFile(file);

      // Choose upload function based on type
      let url;
      switch (uploadType) {
        case 'avatar':
          url = await uploadAvatar(file);
          break;
        case 'product':
          url = await uploadProductImage(file, productId);
          break;
        case 'review':
          url = await uploadReviewImage(file);
          break;
        default:
          throw new Error('Invalid upload type');
      }

      setUploadProgress(100);
      setUploadedUrls([url]);
      
      return url;

    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  /**
   * Upload multiple images (for reviews)
   */
  const uploadMultipleImages = async (files) => {
    if (uploadType !== 'review') {
      throw new Error('Multiple upload only supported for reviews');
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate all files
      files.forEach(file => validateImageFile(file));

      // Upload
      const urls = await uploadReviewImages(files);
      
      setUploadProgress(100);
      setUploadedUrls(urls);
      
      return urls;

    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  /**
   * Delete uploaded image
   */
  const deleteUploadedImage = async (imageUrl) => {
    try {
      const success = await deleteImage(imageUrl);
      
      if (success) {
        setUploadedUrls(prev => prev.filter(url => url !== imageUrl));
      }
      
      return success;
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Delete failed');
      return false;
    }
  };

  /**
   * Clear all uploaded images
   */
  const clearUploads = () => {
    setUploadedUrls([]);
    setError(null);
    setUploadProgress(0);
  };

  /**
   * Reset hook state
   */
  const reset = () => {
    setUploading(false);
    setUploadProgress(0);
    setUploadedUrls([]);
    setError(null);
  };

  return {
    uploading,
    uploadProgress,
    uploadedUrls,
    error,
    uploadSingleImage,
    uploadMultipleImages,
    deleteUploadedImage,
    clearUploads,
    reset,
  };
};

export default useImageUpload;
