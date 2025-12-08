import React from 'react';
import { FiStar, FiMessageCircle, FiUser, FiPackage, FiCheck } from 'react-icons/fi';
import ReviewReplyForm from './ReviewReplyForm';

/**
 * ReviewCard - Component hiển thị một đánh giá
 * Tách riêng để tránh re-render không cần thiết
 */
const ReviewCard = ({ 
  review, 
  onOpenImageModal,
  onReplySuccess 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header: User info + Rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {review.userAvatarUrl ? (
              <img 
                src={review.userAvatarUrl} 
                alt={review.userFullName || review.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <FiUser className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {review.userFullName || review.userName}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {renderStars(review.rating)}
          {review.verifiedPurchase && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              <FiCheck className="w-3 h-3" />
              Đã mua hàng
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded">
        <FiPackage className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">
          <span className="font-medium">{review.productName}</span>
          {review.orderId && (
            <span className="text-gray-500"> • Đơn hàng #{review.orderId}</span>
          )}
        </span>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <p className="text-gray-800 mb-3">{review.comment}</p>
        
        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {review.images.map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt={`Review ${index + 1}`}
                className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onOpenImageModal(review.images, index)}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Seller Response or Reply Form */}
      {review.sellerResponse ? (
        <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
          <div className="flex items-center gap-2 mb-1">
            <FiMessageCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Phản hồi của bạn</span>
            <span className="text-xs text-blue-600">
              {formatDate(review.sellerResponseDate)}
            </span>
          </div>
          <p className="text-blue-800 text-sm">{review.sellerResponse}</p>
        </div>
      ) : (
        <ReviewReplyForm 
          reviewId={review.id} 
          onReplySuccess={onReplySuccess}
        />
      )}
    </div>
  );
};

export default React.memo(ReviewCard);
