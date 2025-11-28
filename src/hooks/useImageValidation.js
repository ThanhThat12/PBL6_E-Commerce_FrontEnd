/**
 * useImageValidation Hook
 * Provides image validation functions with error handling
 */

import { useState, useCallback } from 'react';
import {
  validateFileType,
  validateFileSize,
  validateDimensions,
  validateImageFile,
  validateImageFiles,
  ALLOWED_IMAGE_FORMATS,
  MAX_FILE_SIZE,
} from '../utils/imageValidation';

/**
 * Custom hook for image validation
 * @param {Object} options - Validation options {maxSize, dimensions, maxCount}
 * @returns {Object} Validation methods and state
 */
const useImageValidation = (options = {}) => {
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validates a single file
   * @param {File} file - File to validate
   * @returns {Promise<{valid: boolean, errors: string[]}>}
   */
  const validateFile = useCallback(
    async (file) => {
      setIsValidating(true);
      setValidationErrors([]);

      try {
        const result = await validateImageFile(file, options);
        
        if (!result.valid) {
          setValidationErrors(result.errors);
        }
        
        setIsValidating(false);
        return result;
      } catch (error) {
        const errorMessage = error.message || 'Validation failed';
        setValidationErrors([errorMessage]);
        setIsValidating(false);
        return { valid: false, errors: [errorMessage] };
      }
    },
    [options]
  );

  /**
   * Validates multiple files
   * @param {File[]} files - Files to validate
   * @returns {Promise<{valid: boolean, errors: string[], validFiles: File[]}>}
   */
  const validateFiles = useCallback(
    async (files) => {
      setIsValidating(true);
      setValidationErrors([]);

      try {
        const result = await validateImageFiles(files, options);
        
        if (!result.valid) {
          setValidationErrors(result.errors);
        }
        
        setIsValidating(false);
        return result;
      } catch (error) {
        const errorMessage = error.message || 'Validation failed';
        setValidationErrors([errorMessage]);
        setIsValidating(false);
        return { valid: false, errors: [errorMessage], validFiles: [] };
      }
    },
    [options]
  );

  /**
   * Checks if file format is valid
   * @param {File} file - File to check
   * @returns {boolean}
   */
  const isValidFormat = useCallback((file) => {
    return validateFileType(file);
  }, []);

  /**
   * Checks if file size is valid
   * @param {File} file - File to check
   * @param {number} maxSize - Optional max size (defaults to MAX_FILE_SIZE)
   * @returns {boolean}
   */
  const isValidSize = useCallback(
    (file, maxSize) => {
      return validateFileSize(file, maxSize || options.maxSize || MAX_FILE_SIZE);
    },
    [options.maxSize]
  );

  /**
   * Checks if dimensions are valid
   * @param {File} file - File to check
   * @returns {Promise<{valid: boolean, error?: string, dimensions: {width, height}}>}
   */
  const isValidDimensions = useCallback(
    async (file) => {
      setIsValidating(true);
      
      try {
        const result = await validateDimensions(file, options.dimensions);
        setIsValidating(false);
        return result;
      } catch (error) {
        setIsValidating(false);
        return {
          valid: false,
          error: error.message || 'Failed to validate dimensions',
          dimensions: { width: 0, height: 0 },
        };
      }
    },
    [options.dimensions]
  );

  /**
   * Clears validation errors
   */
  const clearErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  /**
   * Gets human-readable format list
   * @returns {string}
   */
  const getAllowedFormatsText = useCallback(() => {
    return ALLOWED_IMAGE_FORMATS.map((format) => format.split('/')[1].toUpperCase()).join(', ');
  }, []);

  /**
   * Gets human-readable size limit
   * @param {number} maxSize - Max size in bytes
   * @returns {string}
   */
  const getMaxSizeText = useCallback((maxSize) => {
    const sizeMB = ((maxSize || options.maxSize || MAX_FILE_SIZE) / (1024 * 1024)).toFixed(1);
    return `${sizeMB}MB`;
  }, [options.maxSize]);

  return {
    // Validation methods
    validateFile,
    validateFiles,
    isValidFormat,
    isValidSize,
    isValidDimensions,
    
    // State
    validationErrors,
    isValidating,
    
    // Helpers
    clearErrors,
    getAllowedFormatsText,
    getMaxSizeText,
    
    // Constants
    allowedFormats: ALLOWED_IMAGE_FORMATS,
    maxFileSize: options.maxSize || MAX_FILE_SIZE,
  };
};

export default useImageValidation;
