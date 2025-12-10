import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiStar, FiMessageCircle, FiUser, FiPackage, FiClock, FiCheck, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import reviewService from '../../services/reviewService';

/**
 * ReviewCard Component - Extracted outside to prevent re-creation on each render
 */
const ReviewCard = ({ review, replyState, handleToggleReply, handleReplyChange, submitReply, formatDate, renderStars, openImageModal }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
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

    <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded">
      <FiPackage className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-700">
        <span className="font-medium">{review.productName}</span>
        {review.orderId && (
          <span className="text-gray-500"> • Đơn hàng #{review.orderId}</span>
        )}
      </span>
    </div>

    <div className="mb-4">
      <p className="text-gray-800 mb-3">{review.comment}</p>
      
      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {review.images.map((image, index) => (
            <img 
              key={index}
              src={image} 
              alt={`Review ${index + 1}`}
              className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => openImageModal(review.images, index)}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ))}
        </div>
      )}
    </div>

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
      <div className="border-t pt-4">
        {!replyState[review.id]?.open ? (
          <Button
            onClick={() => handleToggleReply(review.id, true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <FiMessageCircle className="w-4 h-4 mr-2" />
            Phản hồi đánh giá
          </Button>
        ) : (
          <div className="space-y-3">
            <textarea
              value={replyState[review.id]?.text || ''}
              onChange={(e) => handleReplyChange(review.id, e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 text-sm"
              rows={3}
              placeholder="Viết phản hồi cho khách hàng..."
            />
            <div className="flex gap-2">
              <Button
                onClick={() => submitReply(review.id)}
                disabled={replyState[review.id]?.loading}
                size="sm"
                className="flex-1"
              >
                {replyState[review.id]?.loading ? 'Đang gửi...' : 'Gửi phản hồi'}
              </Button>
              <Button
                onClick={() => handleToggleReply(review.id, false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

/**
 * ReviewsPage - Seller reviews management
 */
const ReviewsPage = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({ replied: [], unreplied: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all'); // all, 1-2, 3-4, 5
  const [replyState, setReplyState] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getShopReviews();
      console.log('Reviews response:', response);
      if (response && response.data) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Không thể tải danh sách đánh giá');
      setReviews({ replied: [], unreplied: [] });
    } finally {
      setLoading(false);
    }
  };

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

  const handleToggleReply = (reviewId, open = true) => {
    setReplyState(prev => ({ 
      ...prev, 
      [reviewId]: { 
        ...(prev[reviewId] || {}), 
        open, 
        text: prev[reviewId]?.text || '' 
      } 
    }));
  };

  const handleReplyChange = (reviewId, text) => {
    setReplyState(prev => ({ 
      ...prev, 
      [reviewId]: { 
        ...(prev[reviewId] || {}), 
        text 
      } 
    }));
  };

  const submitReply = async (reviewId) => {
    const state = replyState[reviewId] || {};
    const text = (state.text || '').trim();
    
    if (!text) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      setReplyState(prev => ({ 
        ...prev, 
        [reviewId]: { 
          ...(prev[reviewId] || {}), 
          loading: true 
        } 
      }));

      const payload = { sellerResponse: text };
      await reviewService.replyReview(reviewId, payload);
      
      toast.success('Đã gửi phản hồi thành công');
      
      await loadReviews();
      
      setReplyState(prev => ({ 
        ...prev, 
        [reviewId]: { 
          ...(prev[reviewId] || {}), 
          open: false, 
          loading: false, 
          text: '' 
        } 
      }));
    } catch (error) {
      console.error('Reply error:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi phản hồi');
      setReplyState(prev => ({ 
        ...prev, 
        [reviewId]: { 
          ...(prev[reviewId] || {}), 
          loading: false 
        } 
      }));
    }
  };

  const filterByRating = (reviewsList) => {
    if (ratingFilter === 'all') return reviewsList;
    
    return reviewsList.filter(review => {
      if (ratingFilter === '1-2') return review.rating >= 1 && review.rating <= 2;
      if (ratingFilter === '3-4') return review.rating >= 3 && review.rating <= 4;
      if (ratingFilter === '5') return review.rating === 5;
      return true;
    });
  };

  const getFilteredReviews = () => {
    let allReviews = [];
    
    switch (activeTab) {
      case 'replied':
        allReviews = reviews.replied;
        break;
      case 'unreplied':
        allReviews = reviews.unreplied;
        break;
      default:
        allReviews = [...reviews.replied, ...reviews.unreplied];
    }
    
    return filterByRating(allReviews);
  };

  const getCountByRating = (ratingRange) => {
    const allReviews = [...reviews.replied, ...reviews.unreplied];
    
    if (ratingRange === 'all') return allReviews.length;
    
    return allReviews.filter(review => {
      if (ratingRange === '1-2') return review.rating >= 1 && review.rating <= 2;
      if (ratingRange === '3-4') return review.rating >= 3 && review.rating <= 4;
      if (ratingRange === '5') return review.rating === 5;
      return true;
    }).length;
  };

  const openImageModal = (images, index) => {
    setSelectedImage(images);
    setCurrentImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const navigateImage = (direction) => {
    if (!selectedImage) return;
    
    const newIndex = currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < selectedImage.length) {
      setCurrentImageIndex(newIndex);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Đang tải danh sách đánh giá..." />
      </div>
    );
  }

  const filteredReviews = getFilteredReviews();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
          <p className="text-gray-600">Xem và phản hồi đánh giá từ khách hàng</p>
        </div>
        <Button onClick={loadReviews} variant="outline">
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiMessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.replied.length + reviews.unreplied.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã phản hồi</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.replied.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chưa phản hồi</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.unreplied.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for reply status */}
      <div className="bg-white border-b">
        <div className="flex space-x-8">
          {[
            { key: 'all', label: 'Tất cả', count: reviews.replied.length + reviews.unreplied.length },
            { key: 'unreplied', label: 'Chưa phản hồi', count: reviews.unreplied.length },
            { key: 'replied', label: 'Đã phản hồi', count: reviews.replied.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Lọc theo đánh giá:</span>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: '5', label: '5 sao' },
              { key: '3-4', label: '3-4 sao' },
              { key: '1-2', label: '1-2 sao' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setRatingFilter(filter.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  ratingFilter === filter.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({getCountByRating(filter.key)})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review}
              replyState={replyState}
              handleToggleReply={handleToggleReply}
              handleReplyChange={handleReplyChange}
              submitReply={submitReply}
              formatDate={formatDate}
              renderStars={renderStars}
              openImageModal={openImageModal}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FiMessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có đánh giá nào
            </h3>
            <p className="text-gray-600">
              {activeTab === 'unreplied' 
                ? 'Tất cả đánh giá đều đã được phản hồi'
                : activeTab === 'replied'
                ? 'Chưa có đánh giá nào được phản hồi'
                : ratingFilter !== 'all'
                ? `Không có đánh giá nào trong khoảng ${ratingFilter === '5' ? '5 sao' : ratingFilter === '3-4' ? '3-4 sao' : '1-2 sao'}`
                : 'Shop chưa nhận được đánh giá nào từ khách hàng'
              }
            </p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-700" />
            </button>
            
            {selectedImage.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage(-1)}
                  disabled={currentImageIndex === 0}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => navigateImage(1)}
                  disabled={currentImageIndex === selectedImage.length - 1}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}
            
            <img
              src={selectedImage[currentImageIndex]}
              alt={`Review image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src = '/placeholder-image.png'; // Fallback image
              }}
            />
            
            {selectedImage.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {selectedImage.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;