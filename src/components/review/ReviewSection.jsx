import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit3, FiFilter, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';

import ReviewCard from './ReviewCard';
import WriteReviewModal from './WriteReviewModal';
import Loading from '../common/Loading';
import reviewService from '../../services/reviewService';
import useAuth from '../../hooks/useAuth';

/**
 * ReviewSection Component
 * Container for displaying and managing product reviews
 * 
 * @param {string} productId - Product ID (alternative to product.id)
 * @param {object} product - Product data {id, name, mainImage, shop}
 * @param {boolean} isAuthenticated - User authentication status (from parent)
 * @param {object} user - Current user object (from parent)
 * @param {function} hasRole - Role check function (from parent)
 * @param {function} isProductOwner - Function to check if current user owns this product
 * @param {boolean} viewOnly - If true, only show reviews (no write/edit buttons). Default: true for product detail page
 */
const ReviewSection = ({ 
  productId, 
  product, 
  isAuthenticated: isAuthenticatedProp, 
  user: userProp,
  hasRole: _hasRoleProp,
  isProductOwner,
  viewOnly = true  // Default to view-only mode (reviews written from order page)
}) => {
  // Use props if provided, otherwise fall back to useAuth hook
  const auth = useAuth();
  const user = userProp || auth.user;
  const isAuthenticated = isAuthenticatedProp !== undefined ? isAuthenticatedProp : auth.isAuthenticated;
  
  // Determine if user can reply (is seller/owner of this product)
  const canReply = typeof isProductOwner === 'function' ? isProductOwner() : false;
  
  // Use productId prop or product.id
  const resolvedProductId = productId || product?.id;
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filterRating, setFilterRating] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const PAGE_SIZE = 10;

  // Rating distribution for filter badges
  const [ratingStats, setRatingStats] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0, average: 0
  });

  const loadReviews = useCallback(async (pageNum = 0, rating = null, sort = 'newest') => {
    if (!resolvedProductId) return;

    setLoading(true);
    try {
      const params = {
        page: pageNum,
        size: PAGE_SIZE,
        sortBy: sort
      };
      if (rating) {
        params.rating = rating;
      }

      const res = await reviewService.getReviews(resolvedProductId, params);

      let reviewsData = [];
      let pageData = {};

      if (res?.content) {
        reviewsData = res.content;
        pageData = res.page || {};
      } else if (res?.data?.content) {
        reviewsData = res.data.content;
        pageData = res.data.page || {};
      } else if (Array.isArray(res)) {
        reviewsData = res;
      }

      setReviews(reviewsData);
      setTotalPages(pageData.totalPages || 1);
      setTotalElements(pageData.totalElements || reviewsData.length);

      // Find current user's review
      if (isAuthenticated && user) {
        const found = reviewsData.find(r => r.userId === user.id);
        setUserReview(found || null);
      }

      // Calculate rating stats (simplified - ideally from API)
      if (pageNum === 0 && !rating) {
        const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0, average: 0 };
        reviewsData.forEach(r => {
          if (r.rating >= 1 && r.rating <= 5) {
            stats[r.rating]++;
          }
        });
        stats.total = reviewsData.length;
        if (stats.total > 0) {
          stats.average = (
            (5 * stats[5] + 4 * stats[4] + 3 * stats[3] + 2 * stats[2] + 1 * stats[1]) /
            stats.total
          ).toFixed(1);
        }
        setRatingStats(stats);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  }, [resolvedProductId, isAuthenticated, user]);

  useEffect(() => {
    loadReviews(page, filterRating, sortBy);
  }, [loadReviews, page, filterRating, sortBy]);

  const handleFilterChange = (rating) => {
    setFilterRating(rating);
    setPage(0);
    setShowFilterDropdown(false);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(0);
  };

  const handleReply = async (reviewId, payload) => {
    await reviewService.replyReview(reviewId, payload);
    // Reload reviews to show new reply
    loadReviews(page, filterRating, sortBy);
    toast.success('Đã gửi phản hồi');
  };

  const handleLike = async (reviewId) => {
    try {
      const res = await reviewService.toggleLike(reviewId);
      // Update the review in state with new like info
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                likesCount: res.likesCount, 
                isLikedByCurrentUser: res.liked 
              }
            : review
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  const handleReport = async (reviewId, payload) => {
    try {
      await reviewService.reportReview(reviewId, payload);
      // No need to update UI - just show success message
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowWriteModal(true);
  };

  const handleWriteSuccess = () => {
    loadReviews(0, filterRating, sortBy);
    setPage(0);
    setEditingReview(null);
  };

  const canWriteReview = () => {
    // In view-only mode, no one can write reviews from this page
    if (viewOnly) return false;
    if (!isAuthenticated) return false;
    // User can write if they haven't reviewed yet
    return !userReview;
  };

  const canEditReview = () => {
    // In view-only mode, no one can edit reviews from this page
    if (viewOnly) return false;
    if (!userReview) return false;
    
    const daysSinceCreation = (new Date() - new Date(userReview.createdAt)) / (1000 * 60 * 60 * 24);
    const hasBeenEdited = userReview.updatedAt && 
      new Date(userReview.updatedAt).getTime() !== new Date(userReview.createdAt).getTime();
    
    return daysSinceCreation <= 30 && !hasBeenEdited;
  };

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'highest', label: 'Điểm cao nhất' },
    { value: 'lowest', label: 'Điểm thấp nhất' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
            {ratingStats.total > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-yellow-500">{ratingStats.average}</span>
                <span className="text-yellow-400 text-lg">★</span>
                <span className="text-sm text-gray-500">({totalElements} đánh giá)</span>
              </div>
            )}
            {/* Info message for view-only mode */}
            {viewOnly && (
              <p className="text-xs text-gray-500 mt-1">
                Đánh giá sản phẩm tại mục Đơn hàng sau khi nhận hàng
              </p>
            )}
          </div>

          {/* Write Review Button - Only shown when not in viewOnly mode */}
          {canWriteReview() && (
            <button
              onClick={() => setShowWriteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <FiEdit3 className="w-4 h-4" />
              Viết đánh giá
            </button>
          )}

          {canEditReview() && (
            <button
              onClick={() => setShowWriteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              <FiEdit3 className="w-4 h-4" />
              Sửa đánh giá
            </button>
          )}
        </div>
      </div>

      {/* Rating Filter & Sort */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* Rating Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleFilterChange(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterRating === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleFilterChange(rating)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                  filterRating === rating
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {rating}★
                {ratingStats[rating] > 0 && (
                  <span className="text-xs opacity-75">({ratingStats[rating]})</span>
                )}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="w-4 h-4" />
              {sortOptions.find(o => o.value === sortBy)?.label}
              <FiChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showFilterDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilterDropdown(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleSortChange(option.value);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                        sortBy === option.value ? 'text-primary-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="py-8">
            <Loading size="md" text="Đang tải đánh giá..." />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiEdit3 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">
              {filterRating 
                ? `Chưa có đánh giá ${filterRating} sao`
                : 'Chưa có đánh giá nào cho sản phẩm này'
              }
            </p>
            {viewOnly && !filterRating && (
              <p className="text-sm text-gray-500 mt-2">
                Bạn có thể đánh giá sản phẩm sau khi đơn hàng hoàn thành tại trang <span className="text-primary-600 font-medium">Đơn hàng của tôi</span>
              </p>
            )}
            {canWriteReview() && !filterRating && (
              <button
                onClick={() => setShowWriteModal(true)}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Viết đánh giá đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                canReply={canReply}
                onReply={handleReply}
                isCurrentUser={isAuthenticated && user?.id === review.userId}
                isLoggedIn={isAuthenticated}
                onLike={handleLike}
                onReport={handleReport}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={showWriteModal}
        onClose={() => {
          setShowWriteModal(false);
          setEditingReview(null);
        }}
        productId={resolvedProductId}
        product={product}
        onSuccess={handleWriteSuccess}
        editReview={editingReview}
      />
    </div>
  );
};

export default ReviewSection;
