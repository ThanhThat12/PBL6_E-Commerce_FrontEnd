import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';

import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import reviewService from '../../services/reviewService';
import {
  ReviewCard,
  ReviewStats,
  ReviewFilters,
  ReviewImageModal,
  ReviewEmptyState
} from '../../components/seller/Reviews';

/**
 * ReviewsPage - Seller reviews management
 * Sử dụng các component con để tránh re-render không cần thiết
 */
const ReviewsPage = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({ replied: [], unreplied: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reviewService.getShopReviews();
      if (response && response.data) {
        setReviews(response.data);
      }
    } catch {
      toast.error('Không thể tải danh sách đánh giá');
      setReviews({ replied: [], unreplied: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filterByRating = useCallback((reviewsList) => {
    if (ratingFilter === 'all') return reviewsList;
    
    return reviewsList.filter(review => {
      if (ratingFilter === '1-2') return review.rating >= 1 && review.rating <= 2;
      if (ratingFilter === '3-4') return review.rating >= 3 && review.rating <= 4;
      if (ratingFilter === '5') return review.rating === 5;
      return true;
    });
  }, [ratingFilter]);

  const filteredReviews = useMemo(() => {
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
  }, [activeTab, reviews, filterByRating]);

  const getCountByRating = useCallback((ratingRange) => {
    const allReviews = [...reviews.replied, ...reviews.unreplied];
    
    if (ratingRange === 'all') return allReviews.length;
    
    return allReviews.filter(review => {
      if (ratingRange === '1-2') return review.rating >= 1 && review.rating <= 2;
      if (ratingRange === '3-4') return review.rating >= 3 && review.rating <= 4;
      if (ratingRange === '5') return review.rating === 5;
      return true;
    }).length;
  }, [reviews]);

  const openImageModal = useCallback((images, index) => {
    setSelectedImage(images);
    setCurrentImageIndex(index);
  }, []);

  const closeImageModal = useCallback(() => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  }, []);

  const handleImageNavigate = useCallback((newIndex) => {
    setCurrentImageIndex(newIndex);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Đang tải danh sách đánh giá..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
          <p className="text-gray-600">Xem và phản hồi đánh giá từ khách hàng</p>
        </div>
        <Button onClick={loadReviews} variant="outline">
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <ReviewStats 
        repliedCount={reviews.replied.length} 
        unrepliedCount={reviews.unreplied.length} 
      />

      {/* Filters */}
      <ReviewFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        repliedCount={reviews.replied.length}
        unrepliedCount={reviews.unreplied.length}
        getCountByRating={getCountByRating}
      />

      {/* Review List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review}
              onOpenImageModal={openImageModal}
              onReplySuccess={loadReviews}
            />
          ))
        ) : (
          <ReviewEmptyState 
            activeTab={activeTab} 
            ratingFilter={ratingFilter} 
          />
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ReviewImageModal
          images={selectedImage}
          currentIndex={currentImageIndex}
          onClose={closeImageModal}
          onNavigate={handleImageNavigate}
        />
      )}
    </div>
  );
};

export default ReviewsPage;