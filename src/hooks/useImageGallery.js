import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for managing image gallery operations
 * Handles gallery state, reordering, deletion, variant filtering, and optimistic updates
 * 
 * @param {Object} options - Configuration options
 * @param {Array} options.initialImages - Initial gallery images
 * @param {Function} options.onReorder - Callback when images are reordered
 * @param {Function} options.onDelete - Callback when image is deleted
 * @param {Function} options.onSetMain - Callback when main image is set
 * @param {boolean} options.enableOptimisticUpdates - Enable optimistic UI updates (default: true)
 * @returns {Object} Gallery state and control methods
 */
const useImageGallery = (options = {}) => {
  const {
    initialImages = [],
    onReorder,
    onDelete,
    onSetMain,
    enableOptimisticUpdates = true,
  } = options;

  // Gallery state
  const [images, setImages] = useState(initialImages);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [mainImageId, setMainImageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track optimistic operations for rollback
  const previousStateRef = useRef(null);

  // Update images when initialImages changes
  useEffect(() => {
    setImages(initialImages);
    
    // Set main image if not already set
    if (!mainImageId && initialImages.length > 0) {
      const mainImg = initialImages.find((img) => img.isMain);
      if (mainImg) {
        setMainImageId(mainImg.id);
      }
    }
  }, [initialImages, mainImageId]);

  /**
   * Save current state for potential rollback
   */
  const saveState = useCallback(() => {
    previousStateRef.current = {
      images: [...images],
      mainImageId,
    };
  }, [images, mainImageId]);

  /**
   * Rollback to previous state
   */
  const rollback = useCallback(() => {
    if (previousStateRef.current) {
      setImages(previousStateRef.current.images);
      setMainImageId(previousStateRef.current.mainImageId);
      previousStateRef.current = null;
    }
  }, []);

  /**
   * Reorder images in gallery
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Destination index
   * @returns {Promise<boolean>} Success status
   */
  const reorderImages = useCallback(
    async (fromIndex, toIndex) => {
      if (fromIndex === toIndex) {
        return true;
      }

      try {
        // Save current state for rollback
        if (enableOptimisticUpdates) {
          saveState();
        }

        // Optimistic update
        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);

        // Update display order
        const imagesWithOrder = newImages.map((img, index) => ({
          ...img,
          displayOrder: index,
        }));

        setImages(imagesWithOrder);

        // Call API
        if (onReorder) {
          setLoading(true);
          setError(null);

          const imageIds = imagesWithOrder.map((img) => img.id);
          await onReorder(imageIds);

          setLoading(false);
          return true;
        }

        return true;
      } catch (err) {
        console.error('Failed to reorder images:', err);
        setError(err.message || 'Failed to reorder images');
        setLoading(false);

        // Rollback on error
        if (enableOptimisticUpdates) {
          rollback();
        }

        return false;
      }
    },
    [images, onReorder, enableOptimisticUpdates, saveState, rollback]
  );

  /**
   * Delete image from gallery
   * @param {string} imageId - ID of image to delete
   * @returns {Promise<boolean>} Success status
   */
  const deleteImage = useCallback(
    async (imageId) => {
      try {
        // Save current state for rollback
        if (enableOptimisticUpdates) {
          saveState();
        }

        // Optimistic update
        const newImages = images.filter((img) => img.id !== imageId);
        setImages(newImages);

        // If deleted image was main image, set new main image
        if (mainImageId === imageId && newImages.length > 0) {
          const newMainId = newImages[0].id;
          setMainImageId(newMainId);

          // Call set main API if needed
          if (onSetMain) {
            await onSetMain(newMainId);
          }
        }

        // Call delete API
        if (onDelete) {
          setLoading(true);
          setError(null);

          await onDelete(imageId);

          setLoading(false);
          return true;
        }

        return true;
      } catch (err) {
        console.error('Failed to delete image:', err);
        setError(err.message || 'Failed to delete image');
        setLoading(false);

        // Rollback on error
        if (enableOptimisticUpdates) {
          rollback();
        }

        return false;
      }
    },
    [images, mainImageId, onDelete, onSetMain, enableOptimisticUpdates, saveState, rollback]
  );

  /**
   * Set image as main/primary image
   * @param {string} imageId - ID of image to set as main
   * @returns {Promise<boolean>} Success status
   */
  const setMainImage = useCallback(
    async (imageId) => {
      try {
        // Save current state for rollback
        if (enableOptimisticUpdates) {
          saveState();
        }

        // Optimistic update
        setMainImageId(imageId);

        // Update images to mark new main image
        const newImages = images.map((img) => ({
          ...img,
          isMain: img.id === imageId,
        }));
        setImages(newImages);

        // Call API
        if (onSetMain) {
          setLoading(true);
          setError(null);

          await onSetMain(imageId);

          setLoading(false);
          return true;
        }

        return true;
      } catch (err) {
        console.error('Failed to set main image:', err);
        setError(err.message || 'Failed to set main image');
        setLoading(false);

        // Rollback on error
        if (enableOptimisticUpdates) {
          rollback();
        }

        return false;
      }
    },
    [images, onSetMain, enableOptimisticUpdates, saveState, rollback]
  );

  /**
   * Associate image with variant
   * @param {string} imageId - ID of image
   * @param {string} variantId - ID of variant to associate with
   * @returns {Promise<boolean>} Success status
   */
  const associateVariant = useCallback(
    async (imageId, variantId) => {
      try {
        // Save current state for rollback
        if (enableOptimisticUpdates) {
          saveState();
        }

        // Optimistic update
        const newImages = images.map((img) =>
          img.id === imageId ? { ...img, variantId } : img
        );
        setImages(newImages);

        // Call API if callback provided
        // Note: This would typically be handled by ProductImageManager
        // onAssociateVariant(imageId, variantId)

        return true;
      } catch (err) {
        console.error('Failed to associate variant:', err);
        setError(err.message || 'Failed to associate variant');

        // Rollback on error
        if (enableOptimisticUpdates) {
          rollback();
        }

        return false;
      }
    },
    [images, enableOptimisticUpdates, saveState, rollback]
  );

  /**
   * Filter images by selected variant
   * @param {string} variantId - ID of variant to filter by
   */
  const filterByVariant = useCallback((variantId) => {
    setSelectedVariantId(variantId);
  }, []);

  /**
   * Get images for specific variant (or all if no variant selected)
   * @param {string} variantId - Optional variant ID
   * @returns {Array} Filtered images
   */
  const getImagesByVariant = useCallback(
    (variantId = selectedVariantId) => {
      if (!variantId) {
        return images;
      }

      const variantImages = images.filter((img) => img.variantId === variantId);

      // Fallback to main product images if no variant-specific images
      if (variantImages.length === 0) {
        return images.filter((img) => !img.variantId);
      }

      return variantImages;
    },
    [images, selectedVariantId]
  );

  /**
   * Add new images to gallery
   * @param {Array} newImages - Images to add
   */
  const addImages = useCallback((newImages) => {
    setImages((prev) => {
      const nextOrder = prev.length;
      const imagesWithOrder = newImages.map((img, index) => ({
        ...img,
        displayOrder: nextOrder + index,
      }));
      return [...prev, ...imagesWithOrder];
    });
  }, []);

  /**
   * Clear gallery error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset gallery to initial state
   */
  const reset = useCallback(() => {
    setImages(initialImages);
    setSelectedVariantId(null);
    setError(null);
    setLoading(false);
    previousStateRef.current = null;

    // Reset main image
    const mainImg = initialImages.find((img) => img.isMain);
    setMainImageId(mainImg?.id || null);
  }, [initialImages]);

  return {
    // State
    images: getImagesByVariant(),
    allImages: images,
    selectedVariantId,
    mainImageId,
    loading,
    error,

    // Methods
    reorderImages,
    deleteImage,
    setMainImage,
    associateVariant,
    filterByVariant,
    getImagesByVariant,
    addImages,
    clearError,
    reset,

    // Computed
    hasImages: images.length > 0,
    imageCount: images.length,
    variantImageCount: getImagesByVariant().length,
    hasVariantImages: selectedVariantId ? getImagesByVariant().length > 0 : false,
  };
};

export default useImageGallery;
