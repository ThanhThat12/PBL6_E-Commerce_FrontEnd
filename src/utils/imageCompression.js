/**
 * Image Compression Utilities
 * Provides client-side image compression before upload
 */

import imageCompression from 'browser-image-compression';

// Default compression options
const DEFAULT_OPTIONS = {
  maxSizeMB: 2, // Max file size in MB
  maxWidthOrHeight: 1920, // Max width or height in pixels
  useWebWorker: true, // Use web worker for better performance
  fileType: 'image/jpeg', // Output file type
  initialQuality: 0.8, // Initial quality (0-1)
};

/**
 * Compresses an image file to reduce size
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = async (file, options = {}) => {
  try {
    // Skip compression if file is already small enough
    const maxBytes = (options.maxSizeMB || DEFAULT_OPTIONS.maxSizeMB) * 1024 * 1024;
    if (file.size <= maxBytes) {
      return file;
    }

    const compressionOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const compressedFile = await imageCompression(file, compressionOptions);

    console.log(
      `Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(
        compressedFile.size /
        1024 /
        1024
      ).toFixed(2)}MB`
    );

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
};

/**
 * Compresses multiple image files
 * @param {File[]} files - Array of image files to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} Array of compressed image files
 */
export const compressImages = async (files, options = {}) => {
  try {
    const compressionPromises = files.map((file) => compressImage(file, options));
    return await Promise.all(compressionPromises);
  } catch (error) {
    console.error('Batch image compression failed:', error);
    // Return original files if compression fails
    return files;
  }
};

/**
 * Compresses an image with specific dimension constraints
 * @param {File} file - Image file to compress
 * @param {Object} dimensions - Target dimensions {width, height}
 * @returns {Promise<File>} Compressed and resized image file
 */
export const compressImageWithDimensions = async (file, dimensions) => {
  const options = {
    ...DEFAULT_OPTIONS,
    maxWidthOrHeight: Math.max(dimensions.width || 0, dimensions.height || 0),
  };

  return compressImage(file, options);
};

/**
 * Gets compression info without actually compressing
 * @param {File} file - Image file to analyze
 * @returns {Promise<Object>} Compression analysis info
 */
export const getCompressionInfo = async (file) => {
  try {
    const originalSizeMB = file.size / 1024 / 1024;
    const targetSizeMB = DEFAULT_OPTIONS.maxSizeMB;

    const needsCompression = originalSizeMB > targetSizeMB;
    const estimatedSizeMB = needsCompression ? targetSizeMB : originalSizeMB;
    const estimatedReduction = needsCompression
      ? ((originalSizeMB - estimatedSizeMB) / originalSizeMB) * 100
      : 0;

    return {
      originalSize: originalSizeMB.toFixed(2) + 'MB',
      estimatedSize: estimatedSizeMB.toFixed(2) + 'MB',
      needsCompression,
      estimatedReduction: estimatedReduction.toFixed(0) + '%',
    };
  } catch (error) {
    console.error('Failed to get compression info:', error);
    return null;
  }
};
