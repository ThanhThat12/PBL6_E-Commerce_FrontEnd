import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiX, FiCheck, FiThumbsUp, FiFlag } from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * ReviewCard Component
 * Display individual review with seller reply capability
 * 
 * @param {object} review - Review data
 * @param {boolean} canReply - Whether seller can reply
 * @param {function} onReply - Reply callback
 * @param {boolean} isCurrentUser - Whether this is the current user's review
 * @param {boolean} isLoggedIn - Whether user is logged in
 * @param {function} onLike - Like toggle callback
 * @param {function} onReport - Report callback
 */
const ReviewCard = ({
  review,
  canReply = false,
  onReply,
  isCurrentUser = false,
  isLoggedIn = false,
  onLike,
  onReport
}) => {
  const [showImages, setShowImages] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [liking, setLiking] = useState(false);

  const REPORT_TYPES = [
    { value: 'SPAM', label: 'Spam / Quảng cáo' },
    { value: 'INAPPROPRIATE', label: 'Nội dung không phù hợp' },
    { value: 'FAKE', label: 'Đánh giá giả mạo' },
    { value: 'OFFENSIVE', label: 'Ngôn ngữ xúc phạm' },
    { value: 'OTHER', label: 'Lý do khác' }
  ];

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    setSubmittingReply(true);
    try {
      await onReply(review.id, { sellerResponse: replyText });
      setShowReplyForm(false);
      setReplyText('');
    } catch (error) {
      toast.error(error.message || 'Không thể gửi phản hồi');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLikeClick = async () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thích đánh giá');
      return;
    }
    if (!onLike) return;
    
    setLiking(true);
    try {
      await onLike(review.id);
    } catch (error) {
      toast.error(error.message || 'Không thể thực hiện');
    } finally {
      setLiking(false);
    }
  };

  const handleReportClick = () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để báo cáo');
      return;
    }
    if (isCurrentUser) {
      toast.error('Bạn không thể báo cáo đánh giá của chính mình');
      return;
    }
    setShowReportModal(true);
  };

  const handleReportSubmit = async () => {
    if (!reportType) {
      toast.error('Vui lòng chọn loại vi phạm');
      return;
    }
    if (!reportReason || reportReason.length < 10) {
      toast.error('Vui lòng nhập lý do chi tiết (ít nhất 10 ký tự)');
      return;
    }
    if (!onReport) return;

    setSubmittingReport(true);
    try {
      await onReport(review.id, { reportType, reason: reportReason });
      setShowReportModal(false);
      setReportType('');
      setReportReason('');
      toast.success('Báo cáo đã được gửi');
    } catch (error) {
      toast.error(error.message || 'Không thể gửi báo cáo');
    } finally {
      setSubmittingReport(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const images = review.images || [];
  const hasMoreImages = images.length > 3;
  const displayedImages = showImages ? images : images.slice(0, 3);

  return (
    <div className={`bg-white rounded-lg border ${isCurrentUser ? 'border-primary-200 bg-primary-50/30' : 'border-gray-200'} p-4 transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {review.userAvatarUrl ? (
              <img 
                src={review.userAvatarUrl} 
                alt={review.userFullName || review.userName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-semibold">
                {(review.userFullName || review.userName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {review.userFullName || review.userName || 'Người dùng'}
              </span>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <FiCheck className="w-3 h-3" />
                  Đã mua hàng
                </span>
              )}
              {isCurrentUser && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                  Của bạn
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {renderStars(review.rating)}
              <span className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Like & Report buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLikeClick}
            disabled={liking}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors ${
              review.isLikedByCurrentUser
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${liking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiThumbsUp className={`w-4 h-4 ${review.isLikedByCurrentUser ? 'fill-current' : ''}`} />
            <span>{review.likesCount || 0}</span>
          </button>
          
          {!isCurrentUser && (
            <button
              onClick={handleReportClick}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Báo cáo đánh giá này"
            >
              <FiFlag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {review.comment}
        </p>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div className="mb-3">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {displayedImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setLightboxIndex(index)}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
              >
                <img
                  src={typeof img === 'string' ? img : img.url}
                  alt={`Review ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          
          {hasMoreImages && (
            <button
              onClick={() => setShowImages(!showImages)}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              {showImages ? (
                <>
                  <FiChevronUp className="w-4 h-4" />
                  Thu gọn
                </>
              ) : (
                <>
                  <FiChevronDown className="w-4 h-4" />
                  Xem thêm {images.length - 3} ảnh
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Seller Response */}
      {review.sellerResponse && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-primary-700">Phản hồi từ người bán</span>
            {review.sellerResponseDate && (
              <span className="text-xs text-gray-500">
                {new Date(review.sellerResponseDate).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">{review.sellerResponse}</p>
        </div>
      )}

      {/* Reply Form (for sellers) */}
      {canReply && !review.sellerResponse && (
        <div className="mt-3">
          {!showReplyForm ? (
            <button
              onClick={() => setShowReplyForm(true)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Phản hồi đánh giá này
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết phản hồi cho khách hàng..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReplySubmit}
                  disabled={submittingReply}
                  className="px-4 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                </button>
                <button
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                  className="px-4 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxIndex >= 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(-1)}
        >
          <button
            onClick={() => setLightboxIndex(-1)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
          
          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
                }}
                className="absolute left-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <FiChevronDown className="w-6 h-6 text-white transform rotate-90" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev + 1) % images.length);
                }}
                className="absolute right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <FiChevronDown className="w-6 h-6 text-white transform -rotate-90" />
              </button>
            </>
          )}
          
          <img
            src={typeof images[lightboxIndex] === 'string' ? images[lightboxIndex] : images[lightboxIndex]?.url}
            alt={`Review ${lightboxIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Báo cáo đánh giá</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại vi phạm <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {REPORT_TYPES.map((type) => (
                    <label 
                      key={type.value}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        reportType === type.value 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportType"
                        value={type.value}
                        checked={reportType === type.value}
                        onChange={(e) => setReportType(e.target.value)}
                        className="sr-only"
                      />
                      <span className={`text-sm ${reportType === type.value ? 'text-primary-700 font-medium' : 'text-gray-700'}`}>
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Vui lòng mô tả chi tiết lý do báo cáo (ít nhất 10 ký tự)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">{reportReason.length}/500 ký tự</p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReportSubmit}
                  disabled={submittingReport || !reportType || reportReason.length < 10}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReviewCard;
