import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ImageLightbox from '../ImageLightbox/ImageLightbox';

/**
 * ImageGallery Component
 * Displays gallery with drag-drop reordering, delete buttons, lightbox integration
 * Supports lazy loading and variant filtering
 * 
 * @param {Object} props - Component props
 * @param {Array} props.images - Gallery images
 * @param {Function} props.onReorder - Callback when images are reordered
 * @param {Function} props.onDelete - Callback when image is deleted
 * @param {Function} props.onSetMain - Callback to set main image
 * @param {string} props.mainImageId - ID of current main image
 * @param {boolean} props.readonly - Disable editing (no drag, no delete)
 * @param {boolean} props.enableLightbox - Enable lightbox on click
 * @param {boolean} props.enableLazyLoad - Enable lazy loading for images
 * @param {string} props.layout - Layout style: 'grid' or 'carousel'
 */
const ImageGallery = ({
  images = [],
  onReorder,
  onDelete,
  onSetMain,
  mainImageId,
  readonly = false,
  enableLightbox = true,
  enableLazyLoad = true,
  layout = 'grid',
}) => {
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Intersection observer for lazy loading
  const observerRef = useRef(null);
  const imageRefsRef = useRef({});

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoad) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              observerRef.current.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableLazyLoad]);

  // Observe image elements for lazy loading
  const setImageRef = useCallback(
    (element, imageId) => {
      if (element && enableLazyLoad && observerRef.current) {
        imageRefsRef.current[imageId] = element;
        observerRef.current.observe(element);
      }
    },
    [enableLazyLoad]
  );

  // Handle drag start
  const handleDragStart = useCallback((e, index) => {
    if (readonly) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  }, [readonly]);

  // Handle drag over
  const handleDragOver = useCallback((e, index) => {
    if (readonly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [readonly, draggedIndex]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    if (readonly) return;
    setDragOverIndex(null);
  }, [readonly]);

  // Handle drop
  const handleDrop = useCallback(
    (e, toIndex) => {
      if (readonly) return;
      e.preventDefault();

      if (draggedIndex !== null && draggedIndex !== toIndex) {
        if (onReorder) {
          onReorder(draggedIndex, toIndex);
        }
      }

      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [readonly, draggedIndex, onReorder]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Open lightbox
  const openLightbox = useCallback((index) => {
    if (!enableLightbox) return;
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, [enableLightbox]);

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Handle delete image
  const handleDelete = useCallback(
    (e, imageId) => {
      e.stopPropagation();

      if (onDelete) {
        onDelete(imageId);
      }
    },
    [onDelete]
  );

  // Handle set as main image
  const handleSetMain = useCallback(
    (e, imageId) => {
      e.stopPropagation();

      if (onSetMain) {
        onSetMain(imageId);
      }
    },
    [onSetMain]
  );

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm text-gray-500">No images in gallery</p>
      </div>
    );
  }

  const galleryClassName = layout === 'grid'
    ? 'w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
    : 'w-full flex gap-4 overflow-x-auto pb-4';

  return (
    <>
      <div className={galleryClassName}>
        {images.map((image, index) => {
          const isMain = mainImageId === image.id;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          const itemClassName = `group relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition-all duration-200 hover:shadow-lg ${!readonly ? 'hover:scale-105' : ''
            } ${isMain ? 'ring-2 ring-primary-500 ring-offset-2' : ''} ${isDragging ? 'opacity-50 scale-95' : ''
            } ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`;

          return (
            <div
              key={image.id}
              className={itemClassName}
              style={{ aspectRatio: '1 / 1' }}
              draggable={!readonly}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => openLightbox(index)}
            >
              {/* Image */}
              <div className="relative w-full h-full">
                {enableLazyLoad ? (
                  <img
                    ref={(el) => setImageRef(el, image.id)}
                    data-src={image.url}
                    src={image.thumbnail || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E'}
                    alt={image.alt || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <img
                    src={image.url}
                    alt={image.alt || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Main badge */}
                {isMain && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-primary-600 text-white text-xs font-medium shadow-md">
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Main
                  </div>
                )}

                {/* Drag handle */}
                {!readonly && (
                  <div className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 text-gray-600 cursor-move shadow-md opacity-0 group-hover:opacity-100 transition-opacity" title="Drag to reorder">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </div>
                )}

                {/* Hover overlay with actions */}
                {!readonly && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      {/* Set as main button */}
                      {!isMain && onSetMain && (
                        <button
                          type="button"
                          onClick={(e) => handleSetMain(e, image.id)}
                          className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
                          title="Set as main image"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      )}

                      {/* Delete button */}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, image.id)}
                          className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
                          title="Delete image"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Image index */}
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium">
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {enableLightbox && (
        <ImageLightbox
          images={images.map((img) => ({
            src: img.url,
            alt: img.alt || '',
          }))}
          isOpen={lightboxOpen}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
          enableZoom
          enableDownload
        />
      )}
    </>
  );
};

ImageGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      thumbnail: PropTypes.string,
      alt: PropTypes.string,
      displayOrder: PropTypes.number,
      isMain: PropTypes.bool,
      variantId: PropTypes.string,
    })
  ),
  onReorder: PropTypes.func,
  onDelete: PropTypes.func,
  onSetMain: PropTypes.func,
  mainImageId: PropTypes.string,
  readonly: PropTypes.bool,
  enableLightbox: PropTypes.bool,
  enableLazyLoad: PropTypes.bool,
  layout: PropTypes.oneOf(['grid', 'carousel']),
};

export default ImageGallery;
