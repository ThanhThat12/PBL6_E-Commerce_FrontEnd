import { useState, useCallback, useRef } from 'react';
import { validateImageFile } from '../utils/imageValidation';
import { compressImage } from '../utils/imageCompression';

/**
 * Custom hook for managing image upload operations
 * Handles upload queue, progress tracking, errors, and retry logic
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.maxConcurrent - Maximum concurrent uploads (default: 3)
 * @param {Function} options.onSuccess - Callback when all uploads succeed
 * @param {Function} options.onError - Callback when upload fails
 * @returns {Object} Upload state and control methods
 */
const useImageUpload = (options = {}) => {
  const {
    maxConcurrent = 3,
    onSuccess,
    onError,
  } = options;

  // Upload queue state
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [completed, setCompleted] = useState({});

  // Refs for managing concurrent uploads
  const uploadQueueRef = useRef([]);
  const activeUploadsRef = useRef(0);
  const abortControllersRef = useRef({});

  /**
   * Add files to upload queue with validation
   * @param {FileList|File[]} newFiles - Files to add
   * @returns {Object} Result with added/rejected files
   */
  const addFiles = useCallback((newFiles) => {
    const filesArray = Array.from(newFiles);
    const results = {
      added: [],
      rejected: [],
    };

    // Process files synchronously for now (validation will be sync)
    filesArray.forEach((file) => {
      // Simple sync validation - just check type and size
      const errors = [];

      // Check file type
      if (!file.type || !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        errors.push('Invalid file type. Only JPG, PNG, and WEBP images are allowed.');
      }

      // Check file size (5MB)
      const maxSize = 5242880; // 5MB
      if (file.size > maxSize) {
        errors.push(`File size exceeds ${(maxSize / (1024 * 1024)).toFixed(1)}MB limit.`);
      }

      const isValid = errors.length === 0;

      if (isValid) {
        const fileId = `${file.name}-${Date.now()}-${Math.random()}`;
        const fileWithId = {
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: URL.createObjectURL(file),
          status: 'pending',
        };

        results.added.push(fileWithId);
        setFiles((prev) => [...prev, fileWithId]);
        setProgress((prev) => ({ ...prev, [fileId]: 0 }));
      } else {
        results.rejected.push({
          file,
          errors: errors,
        });

        // Set error for rejected file
        const fileId = `${file.name}-${Date.now()}`;
        const errorMessage = errors.join(', ');
        setErrors((prev) => ({
          ...prev,
          [fileId]: errorMessage,
        }));
      }
    });

    return results;
  }, []);

  /**
   * Remove file from upload queue
   * @param {string} fileId - ID of file to remove
   */
  const removeFile = useCallback((fileId) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });

    setProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fileId];
      return newErrors;
    });

    setCompleted((prev) => {
      const newCompleted = { ...prev };
      delete newCompleted[fileId];
      return newCompleted;
    });

    // Cancel upload if in progress
    if (abortControllersRef.current[fileId]) {
      abortControllersRef.current[fileId].abort();
      delete abortControllersRef.current[fileId];
    }
  }, []);

  /**
   * Process next file in upload queue
   */
  const processNextUpload = useCallback(async () => {
    if (uploadQueueRef.current.length === 0 || activeUploadsRef.current >= maxConcurrent) {
      // Check if all uploads are complete
      if (activeUploadsRef.current === 0 && uploadQueueRef.current.length === 0) {
        setUploading(false);
      }
      return;
    }

    const { fileData, uploadFn, fileId } = uploadQueueRef.current.shift();
    activeUploadsRef.current += 1;

    try {
      // Compress image if needed (files > 2MB)
      let fileToUpload = fileData.file;
      if (fileToUpload.size > 2 * 1024 * 1024) {
        try {
          fileToUpload = await compressImage(fileToUpload, {
            maxSizeMB: 2,
            maxWidthOrHeight: 2048,
          });
        } catch (compressionError) {
          console.warn('Image compression failed, uploading original:', compressionError);
        }
      }

      // Create abort controller for this upload
      const abortController = new AbortController();
      abortControllersRef.current[fileId] = abortController;

      // Upload with progress tracking
      const result = await uploadFn(fileToUpload, {
        onProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress((prev) => ({
            ...prev,
            [fileId]: percentCompleted,
          }));
        },
        signal: abortController.signal,
      });

      // Mark as completed
      setCompleted((prev) => ({ ...prev, [fileId]: result }));
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: 'completed', url: result.url } : f
        )
      );

      // Clean up abort controller
      delete abortControllersRef.current[fileId];

    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        // Upload was cancelled
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'cancelled' } : f
          )
        );
      } else {
        // Upload failed
        const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
        setErrors((prev) => ({ ...prev, [fileId]: errorMessage }));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'error', error: errorMessage } : f
          )
        );

        if (onError) {
          onError(error, fileData);
        }
      }

      // Clean up abort controller
      delete abortControllersRef.current[fileId];
    } finally {
      activeUploadsRef.current -= 1;

      // Process next upload in queue
      processNextUpload();
    }
  }, [maxConcurrent, onError]);

  /**
   * Upload files with specified upload function
   * @param {Function} uploadFn - Function to upload a single file
   * @returns {Promise<Object>} Upload results
   */
  const uploadFiles = useCallback(
    async (uploadFn) => {
      if (files.length === 0) {
        return { success: true, results: [] };
      }

      setUploading(true);
      setErrors({});
      setCompleted({});

      // Add all pending files to upload queue
      const pendingFiles = files.filter((f) => f.status === 'pending');
      uploadQueueRef.current = pendingFiles.map((fileData) => ({
        fileData,
        uploadFn,
        fileId: fileData.id,
      }));

      // Start concurrent uploads
      const concurrentPromises = [];
      for (let i = 0; i < Math.min(maxConcurrent, uploadQueueRef.current.length); i++) {
        concurrentPromises.push(processNextUpload());
      }

      // Wait for all uploads to complete
      await Promise.all(concurrentPromises);

      // Check results
      const hasErrors = Object.keys(errors).length > 0;
      const results = files.map((f) => ({
        id: f.id,
        name: f.name,
        status: f.status,
        url: f.url,
        error: errors[f.id],
      }));

      if (!hasErrors && onSuccess) {
        onSuccess(results);
      }

      return {
        success: !hasErrors,
        results,
      };
    },
    [files, maxConcurrent, processNextUpload, onSuccess, errors]
  );

  /**
   * Cancel specific upload
   * @param {string} fileId - ID of file to cancel
   */
  const cancelUpload = useCallback((fileId) => {
    if (abortControllersRef.current[fileId]) {
      abortControllersRef.current[fileId].abort();
      delete abortControllersRef.current[fileId];

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: 'cancelled' } : f
        )
      );
    }
  }, []);

  /**
   * Retry failed upload
   * @param {string} fileId - ID of file to retry
   * @param {Function} uploadFn - Upload function to use
   */
  const retryUpload = useCallback(
    async (fileId, uploadFn) => {
      const fileData = files.find((f) => f.id === fileId);
      if (!fileData || fileData.status !== 'error') {
        return;
      }

      // Clear error
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fileId];
        return newErrors;
      });

      // Reset file status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: 'pending', error: undefined } : f
        )
      );

      // Add to upload queue
      uploadQueueRef.current.push({ fileData, uploadFn, fileId });

      if (!uploading) {
        setUploading(true);
        await processNextUpload();
      }
    },
    [files, uploading, processNextUpload]
  );

  /**
   * Clear all files from queue
   */
  const clearAll = useCallback(() => {
    // Revoke all object URLs
    files.forEach((f) => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });

    // Cancel all active uploads
    Object.values(abortControllersRef.current).forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current = {};

    // Reset state
    setFiles([]);
    setProgress({});
    setErrors({});
    setCompleted({});
    setUploading(false);
    uploadQueueRef.current = [];
    activeUploadsRef.current = 0;
  }, [files]);

  return {
    // State
    files,
    uploading,
    progress,
    errors,
    completed,

    // Methods
    addFiles,
    removeFile,
    uploadFiles,
    cancelUpload,
    retryUpload,
    clearAll,

    // Computed
    hasErrors: Object.keys(errors).length > 0,
    isComplete: files.length > 0 && files.every((f) => f.status === 'completed'),
    pendingCount: files.filter((f) => f.status === 'pending').length,
    completedCount: files.filter((f) => f.status === 'completed').length,
    errorCount: files.filter((f) => f.status === 'error').length,
  };
};

export default useImageUpload;
