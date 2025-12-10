import React from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * ReviewImageModal - Modal xem ảnh đánh giá
 */
const ReviewImageModal = ({ 
  images, 
  currentIndex, 
  onClose, 
  onNavigate 
}) => {
  if (!images || images.length === 0) return null;

  const handleNavigate = (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      onNavigate(newIndex);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" 
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-full p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
        >
          <FiX className="w-5 h-5 text-gray-700" />
        </button>
        
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => handleNavigate(-1)}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            >
              <FiChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => handleNavigate(1)}
              disabled={currentIndex === images.length - 1}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            >
              <FiChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
        
        {/* Image */}
        <img
          src={images[currentIndex]}
          alt={`Product review ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
          onError={(e) => {
            e.target.src = '/placeholder-image.png';
          }}
        />
        
        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewImageModal;
