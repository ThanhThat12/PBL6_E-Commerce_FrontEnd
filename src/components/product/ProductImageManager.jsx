import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import ImageUpload from '../common/ImageUpload';
import ImageGallery from '../common/ImageGallery';
import useImageUpload from '../../hooks/useImageUpload';
import useImageGallery from '../../hooks/useImageGallery';
import ImageUploadService from '../../services/ImageUploadService';

/**
 * ProductImageManager Component
 * Manages product main image and gallery images with upload, reorder, and delete functionality
 */
const ProductImageManager = ({
  productId,
  mainImage,
  galleryImages = [],
  onMainImageChange,
  onGalleryChange,
  readonly = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [newMainImage, setNewMainImage] = useState(null);

  // Main image upload hook
  const mainImageUpload = useImageUpload({
    maxConcurrent: 1,
    onSuccess: (results) => {
      if (results.length > 0 && results[0].url) {
        if (mainImage) {
          setNewMainImage(results[0].url);
          setShowReplaceConfirm(true);
        } else {
          handleMainImageUpdate(results[0].url);
        }
      }
    },
    onError: (error) => {
      console.error('Main image upload failed:', error);
    },
  });

  // Gallery upload hook
  const galleryUpload = useImageUpload({
    maxConcurrent: 3,
    onSuccess: (results) => {
      const uploadedImages = results
        .filter((r) => r.status === 'completed' && r.url)
        .map((r, index) => ({
          id: `gallery-${Date.now()}-${index}`,
          url: r.url,
          displayOrder: galleryImages.length + index,
        }));

      if (uploadedImages.length > 0 && onGalleryChange) {
        onGalleryChange((prev) => [...(prev || []), ...uploadedImages]);
      }
    },
    onError: (error) => {
      console.error('Gallery upload failed:', error);
    },
  });

  // Gallery manager hook
  const galleryManager = useImageGallery({
    initialImages: galleryImages,
    onReorder: async (imageIds) => {
      if (!productId) return;
      try {
        await ImageUploadService.reorderGallery(productId, imageIds);
        if (onGalleryChange) {
          const reorderedImages = imageIds.map((id, index) => {
            const img = galleryImages.find((g) => g.id === id);
            return { ...img, displayOrder: index };
          });
          onGalleryChange(reorderedImages);
        }
      } catch (error) {
        console.error('Failed to reorder gallery:', error);
        throw error;
      }
    },
    onDelete: async (imageId) => {
      if (!productId) return;
      try {
        await ImageUploadService.deleteGalleryImage(productId, imageId);
        if (onGalleryChange) {
          onGalleryChange((prev) => prev.filter((img) => img.id !== imageId));
        }
      } catch (error) {
        console.error('Failed to delete image:', error);
        throw error;
      }
    },
    enableOptimisticUpdates: true,
  });

  useEffect(() => {
    if (JSON.stringify(galleryImages) !== JSON.stringify(galleryManager.allImages)) {
      galleryManager.reset();
    }
  }, [galleryImages]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle main image file selection
   */
  const handleMainImageFiles = useCallback(
    (files) => {
      const result = mainImageUpload.addFiles(files);

      if (result.added.length > 0) {
        const firstFile = result.added[0];
        if (firstFile.preview && onMainImageChange) {
          onMainImageChange(firstFile.preview);
        }

        if (productId && !mainImage) {
          mainImageUpload.uploadFiles(async (file, options) => {
            return await ImageUploadService.uploadProductMain(productId, file, options);
          });
        }
      }
    },
    [productId, mainImage, mainImageUpload, onMainImageChange]
  );

  /**
   * Handle gallery image file selection
   */
  const handleGalleryFiles = useCallback(
    (files) => {
      const result = galleryUpload.addFiles(files);

      if (result.added.length > 0) {
        const newImages = result.added.map((fileObj, index) => ({
          id: `preview-${Date.now()}-${index}`,
          url: fileObj.preview,
          isMain: false,
          file: fileObj.file,
        }));

        if (onGalleryChange) {
          onGalleryChange((prevGallery) => {
            const updated = [...(prevGallery || []), ...newImages];
            return updated.map((img, idx) => ({ ...img, displayOrder: idx }));
          });
        }

        if (productId) {
          galleryUpload.uploadFiles(async (file, options) => {
            return await ImageUploadService.uploadProductGallery(productId, [file], options);
          });
        }
      }
    },
    [productId, galleryUpload, onGalleryChange]
  );

  /**
   * Handle main image update
   */
  const handleMainImageUpdate = useCallback(
    (imageUrl) => {
      if (onMainImageChange) {
        onMainImageChange(imageUrl);
      }
      mainImageUpload.clearAll();
    },
    [onMainImageChange, mainImageUpload]
  );

  /**
   * Handle remove gallery file
   */
  const handleRemoveGalleryFile = useCallback((fileId) => {
    galleryUpload.removeFile(fileId);

    if (onGalleryChange) {
      onGalleryChange((prev) =>
        prev.filter(img => !img.id.includes(fileId) && img.id !== fileId)
      );
    }
  }, [galleryUpload, onGalleryChange]);

  /**
   * Confirm and replace main image
   */
  const confirmReplaceMainImage = useCallback(() => {
    if (newMainImage) {
      handleMainImageUpdate(newMainImage);
      setNewMainImage(null);
    }
    setShowReplaceConfirm(false);
  }, [newMainImage, handleMainImageUpdate]);

  /**
   * Cancel main image replacement
   */
  const cancelReplaceMainImage = useCallback(() => {
    setNewMainImage(null);
    setShowReplaceConfirm(false);
    mainImageUpload.clearAll();
  }, [mainImageUpload]);

  /**
   * Handle delete image with confirmation
   */
  const handleDeleteImage = useCallback((imageId) => {
    console.log('🗑️ handleDeleteImage called with imageId:', imageId);
    console.log('📋 Current galleryImages:', galleryImages);

    // For preview images (blob URLs), delete immediately without confirmation
    const imageToDelete = galleryImages.find(img => img.id === imageId);
    console.log('🔍 Found image to delete:', imageToDelete);

    if (imageToDelete && imageToDelete.url && imageToDelete.url.startsWith('blob:')) {
      console.log('✅ Deleting preview image immediately');
      // It's a preview image, delete immediately
      if (onGalleryChange) {
        onGalleryChange((prev) => {
          const updated = prev.filter(img => img.id !== imageId);
          console.log('📸 Updated gallery after delete:', updated);
          return updated;
        });
      }
      // Also remove from upload hook if it exists
      const matchingFile = galleryUpload.files.find(f => f.preview === imageToDelete.url);
      console.log('🔗 Matching file in upload hook:', matchingFile);
      if (matchingFile) {
        galleryUpload.removeFile(matchingFile.id);
      }
    } else {
      console.log('⏸️ Showing confirmation for uploaded image');
      // It's an uploaded image, show confirmation
      setImageToDelete(imageId);
      setShowDeleteConfirm(true);
    }
  }, [galleryImages, onGalleryChange, galleryUpload]);

  /**
   * Confirm image deletion
   */
  const confirmDeleteImage = useCallback(async () => {
    if (imageToDelete) {
      await galleryManager.deleteImage(imageToDelete);
      setImageToDelete(null);
    }
    setShowDeleteConfirm(false);
  }, [imageToDelete, galleryManager]);

  /**
   * Cancel image deletion
   */
  const cancelDeleteImage = useCallback(() => {
    setImageToDelete(null);
    setShowDeleteConfirm(false);
  }, []);

  /**
   * Handle remove main image
   */
  const handleRemoveMainImage = useCallback(async () => {
    if (productId && mainImage && !mainImage.startsWith('blob:')) {
      try {
        await ImageUploadService.deleteProductMain(productId);
      } catch (error) {
        console.error('Failed to remove main image from server:', error);
      }
    }

    handleMainImageUpdate(null);
    mainImageUpload.clearAll();
  }, [productId, mainImage, handleMainImageUpdate, mainImageUpload]);

  return (
    <div className="product-image-manager">
      {/* Main Image Section */}
      <div className="main-image-section mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Main Product Image *
        </h3>

        {mainImage ? (
          <div className="main-image-preview">
            <div className="relative inline-block">
              <img
                src={mainImage}
                alt="Main product"
                className="w-64 h-64 object-cover rounded-lg border-2 border-gray-300"
              />
              {!readonly && (
                <button
                  type="button"
                  onClick={handleRemoveMainImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove main image"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <ImageUpload
            onFilesAdded={handleMainImageFiles}
            files={mainImageUpload.files}
            progress={mainImageUpload.progress}
            errors={mainImageUpload.errors}
            onRemoveFile={mainImageUpload.removeFile}
            onRetryUpload={(fileId) =>
              mainImageUpload.retryUpload(fileId, async (file, options) => {
                return await ImageUploadService.uploadProductMain(productId, file, options);
              })
            }
            multiple={false}
            maxFiles={1}
            disabled={readonly || mainImageUpload.uploading}
            label=""
            helpText="Upload main product image (required)"
          />
        )}

        <p className="text-sm text-gray-500 mt-2">
          This is the primary image shown in product listings and search results.
        </p>
      </div>

      {/* Gallery Section */}
      <div className="gallery-section">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Gallery (Optional)
        </h3>

        {!readonly && (
          <div className="mb-4">
            <ImageUpload
              onFilesAdded={handleGalleryFiles}
              files={galleryUpload.files}
              progress={galleryUpload.progress}
              errors={galleryUpload.errors}
              onRemoveFile={handleRemoveGalleryFile}
              onRetryUpload={(fileId) =>
                galleryUpload.retryUpload(fileId, async (file, options) => {
                  return await ImageUploadService.uploadProductGallery(productId, file, options);
                })
              }
              multiple
              maxFiles={10}
              disabled={readonly || galleryUpload.uploading || galleryImages.length >= 10}
              label=""
              helpText="Upload additional product images (up to 10 total)"
            />
          </div>
        )}

        {/* ImageGallery temporarily disabled - using ImageUpload preview instead */}
        {/* {galleryImages.length > 0 && (
          <ImageGallery
            images={galleryImages}
            onReorder={(fromIndex, toIndex) =>
              galleryManager.reorderImages(fromIndex, toIndex)
            }
            onDelete={handleDeleteImage}
            readonly={readonly}
            enableLightbox
            enableLazyLoad={false}
          />
        )} */}

        {galleryImages.length === 0 && (
          <p className="text-sm text-gray-500">
            No gallery images yet. Upload images to showcase your product from different angles.
          </p>
        )}
      </div>

      {/* Replace Main Image Confirmation Dialog */}
      {showReplaceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Replace Main Image?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to replace the current main image? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelReplaceMainImage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReplaceMainImage}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
              >
                Replace Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Image Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Image?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDeleteImage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteImage}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProductImageManager.propTypes = {
  productId: PropTypes.string,
  mainImage: PropTypes.string,
  galleryImages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      displayOrder: PropTypes.number,
    })
  ),
  onMainImageChange: PropTypes.func,
  onGalleryChange: PropTypes.func,
  readonly: PropTypes.bool,
};

export default ProductImageManager;
