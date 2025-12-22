import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

import RatingInput from './RatingInput';
import ImageUploader from './ImageUploader';
import reviewService from '../../services/reviewService';

/**
 * WriteReviewModal Component
 * Modal for creating/editing reviews with image upload
 * 
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close callback
 * @param {string} productId - Product ID (if product object not provided)
 * @param {object} product - Product being reviewed {id, name, mainImage, variant}
 * @param {function} onSuccess - Success callback after review is submitted
 * @param {object} editReview - Existing review to edit (optional)
 * @param {boolean} requireImages - Whether images are required (default: false)
 */
const WriteReviewModal = ({
  isOpen,
  onClose,
  productId,
  product,
  onSuccess,
  editReview = null,
  requireImages = false
}) => {
  // Resolve product ID
  const resolvedProductId = productId || product?.id;
  
  const [rating, setRating] = useState(editReview?.rating || 0);
  const [comment, setComment] = useState(editReview?.comment || '');
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const MIN_COMMENT_LENGTH = 10;
  const MAX_COMMENT_LENGTH = 1000;
  const DRAFT_KEY = `review_draft_product_${resolvedProductId}`;

  // Calculate days remaining for review deadline
  const [daysRemaining, setDaysRemaining] = useState(null);
  
  useEffect(() => {
    if (isOpen && product?.completedDate) {
      const completed = new Date(product.completedDate);
      const now = new Date();
      const daysPassed = Math.floor((now - completed) / (1000 * 60 * 60 * 24));
      const remaining = Math.max(0, 30 - daysPassed);
      setDaysRemaining(remaining);
    }
  }, [isOpen, product]);

  // Load draft on mount
  useEffect(() => {
    if (isOpen && !editReview) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          // Ask user if they want to continue
          if (parsed.rating || parsed.comment) {
            const shouldContinue = window.confirm('Bạn có muốn tiếp tục đánh giá trước đó?');
            if (shouldContinue) {
              setRating(parsed.rating || 0);
              setComment(parsed.comment || '');
            } else {
              localStorage.removeItem(DRAFT_KEY);
            }
          }
        } catch (e) {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    }
  }, [isOpen, editReview, DRAFT_KEY]);

  // Initialize images from edit review
  useEffect(() => {
    if (editReview?.images && editReview.images.length > 0) {
      const existingImages = editReview.images.map((url, index) => ({
        id: `existing_${index}`,
        url: typeof url === 'string' ? url : url.url,
        publicId: typeof url === 'string' ? null : url.publicId,
        status: 'success',
        progress: 100
      }));
      setImages(existingImages);
    }
  }, [editReview]);

  // Auto-save draft
  useEffect(() => {
    if (!isOpen || editReview) return;

    const timeoutId = setTimeout(() => {
      if (rating || comment) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ rating, comment }));
        setHasUnsavedChanges(true);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [rating, comment, isOpen, editReview, DRAFT_KEY]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasUnsavedChanges]);

  const handleClose = () => {
    if (hasUnsavedChanges && (rating || comment || images.length > 0)) {
      setShowConfirmClose(true);
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setRating(0);
    setComment('');
    setImages([]);
    setErrors({});
    setHasUnsavedChanges(false);
    setShowConfirmClose(false);
    localStorage.removeItem(DRAFT_KEY);
    onClose();
  };

  const handleUpload = async (files) => {
    try {
      const result = await reviewService.uploadTempImages(files);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!rating) {
      newErrors.rating = 'Vui lòng chọn số sao đánh giá';
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < MIN_COMMENT_LENGTH) {
      newErrors.comment = `Bình luận phải có ít nhất ${MIN_COMMENT_LENGTH} ký tự`;
    }

    // Check if any images are still uploading
    const uploadingImages = images.filter(img => img.status === 'uploading');
    if (uploadingImages.length > 0) {
      newErrors.images = 'Vui lòng đợi ảnh tải lên hoàn tất';
    }

    // Check if images are required
    const successImages = images.filter(img => img.status === 'success' && img.url);
    if (requireImages && successImages.length === 0) {
      newErrors.images = 'Vui lòng tải lên ít nhất 1 hình ảnh cho đánh giá';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      // Scroll to first error
      if (errors.rating) {
        document.getElementById('rating-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (errors.comment) {
        document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setSubmitting(true);
    try {
      // Collect image URLs from successfully uploaded images
      const imageUrls = images
        .filter(img => img.status === 'success' && img.url)
        .map(img => img.url);

      const payload = {
        rating,
        comment: comment.trim(),
        images: imageUrls
      };

      if (editReview) {
        await reviewService.updateReview(editReview.id, payload);
        toast.success('Cập nhật đánh giá thành công!');
      } else {
        await reviewService.postReview(resolvedProductId, payload);
        toast.success('Cảm ơn bạn đã đánh giá!');
      }

      // Clear draft
      localStorage.removeItem(DRAFT_KEY);
      
      // Reset and close
      resetAndClose();
      
      // Trigger success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Submit review error:', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(message);
      
      // Handle specific errors
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const commentLength = comment.length;
  const isCommentWarning = commentLength >= MAX_COMMENT_LENGTH - 50;
  const isCommentError = commentLength >= MAX_COMMENT_LENGTH;

  return (
    <>
      {/* Main Modal */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div
          className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slideUp max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">
                {editReview ? 'Sửa đánh giá' : 'Đánh giá sản phẩm'}
              </h2>
              
              {/* Deadline Countdown */}
              {daysRemaining !== null && !editReview && (
                <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-orange-700 font-medium">
                      ⏰ Thời hạn đánh giá
                    </span>
                    <span className={`text-xs font-bold ${
                      daysRemaining <= 7 ? 'text-red-600' : 'text-orange-800'
                    }`}>
                      Còn {daysRemaining} ngày
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-orange-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${
                        daysRemaining <= 7 ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${(daysRemaining / 30) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-orange-600 mt-1">
                    Sau {daysRemaining} ngày, bạn sẽ không thể đánh giá nữa
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-2"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Product Info Card */}
            {product && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
                <img
                  src={product.mainImage || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  {product.variant && (
                    <p className="text-sm text-gray-500">
                      Phân loại: {product.variant}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Rating Section */}
            <div id="rating-section" className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chất lượng sản phẩm <span className="text-red-500">*</span>
              </label>
              <RatingInput
                value={rating}
                onChange={setRating}
                size="lg"
                showLabel
              />
              {errors.rating && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-shake">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.rating}
                </p>
              )}
            </div>

            {/* Comment Section */}
            <div id="comment-section" className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét của bạn <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                      setComment(e.target.value);
                      setHasUnsavedChanges(true);
                    }
                  }}
                  placeholder={`Hãy chia sẻ cảm nhận của bạn về sản phẩm (tối thiểu ${MIN_COMMENT_LENGTH} ký tự)`}
                  className={`w-full px-4 py-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.comment ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={5}
                />
                {/* Character count badge */}
                <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${
                  commentLength < MIN_COMMENT_LENGTH 
                    ? 'bg-red-100 text-red-700'
                    : isCommentError
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {commentLength}/{MAX_COMMENT_LENGTH}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                {errors.comment ? (
                  <p className="text-xs text-red-600 flex items-center gap-1 animate-shake">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.comment}
                  </p>
                ) : commentLength < MIN_COMMENT_LENGTH ? (
                  <p className="text-xs text-gray-500">
                    Còn thiếu {MIN_COMMENT_LENGTH - commentLength} ký tự nữa
                  </p>
                ) : (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <FiCheck className="w-3 h-3" />
                    Đủ độ dài yêu cầu
                  </p>
                )}
                
                {/* Progress bar for minimum length */}
                {commentLength < MIN_COMMENT_LENGTH && !errors.comment && (
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-primary-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((commentLength / MIN_COMMENT_LENGTH) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Thêm hình ảnh (tùy chọn)
              </label>
              <ImageUploader
                images={images}
                onChange={setImages}
                onUpload={handleUpload}
                maxImages={5}
                maxSizeMB={5}
                disabled={submitting}
              />
              {errors.images && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.images}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={submitting || images.some(img => img.status === 'uploading')}
              className={`w-full py-3 rounded-lg text-white font-medium transition-all ${
                submitting || images.some(img => img.status === 'uploading')
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang gửi...
                </span>
              ) : editReview ? (
                'Cập nhật đánh giá'
              ) : (
                'Gửi đánh giá'
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Bằng việc gửi đánh giá, bạn đồng ý với điều khoản sử dụng của chúng tôi
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Close Modal */}
      {showConfirmClose && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowConfirmClose(false)}
        >
          <div
            className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hủy đánh giá?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc muốn hủy? Thông tin chưa được lưu sẽ bị mất.
            </p>
            <div className="flex gap-3">
              <button
                onClick={resetAndClose}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Hủy đánh giá
              </button>
              <button
                onClick={() => setShowConfirmClose(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Tiếp tục viết
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WriteReviewModal;
