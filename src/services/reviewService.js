import api from './api';

/**
 * Review Service
 * Endpoints for product reviews and image uploads
 * 
 * Review Policy:
 * - Thời hạn đánh giá: 30 ngày kể từ khi đơn hàng COMPLETED
 * - Thời hạn chỉnh sửa: 1 lần duy nhất trong vòng 30 ngày từ ngày gửi đánh giá
 * - Không thể xóa đánh giá
 */
const BASE = 'products';

const reviewService = {
  /**
   * Check review eligibility for a product
   * GET /api/products/{productId}/review-eligibility
   * @param {number|string} productId
   * @returns {Promise<{canReview, hasReviewed, hasPurchased, daysRemainingToReview, canEditReview, ...}>}
   */
  checkEligibility: async (productId) => {
    try {
      const res = await api.get(`${BASE}/${productId}/review-eligibility`);
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error checking review eligibility:', err);
      throw err;
    }
  },

  /**
   * Get reviews for a product
   * GET /api/products/{productId}/reviews
   * @param {number|string} productId
   * @param {object} params - optional query params { page, size, rating, sortBy }
   */
  getReviews: async (productId, params = {}) => {
    try {
      const res = await api.get(`${BASE}/${productId}/reviews`, { params });
      if (!res) return { content: [], page: {} };
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error fetching reviews:', err);
      throw err;
    }
  },

  /**
   * Get rating summary for a product
   * GET /api/products/{productId}/rating-summary
   * @param {number|string} productId
   * @returns {Promise<{average, totalReviews, starCounts}>}
   */
  getRatingSummary: async (productId) => {
    try {
      const res = await api.get(`${BASE}/${productId}/rating-summary`);
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error fetching rating summary:', err);
      throw err;
    }
  },

  /**
   * Post a review for a product (from Order page only)
   * POST /api/products/{productId}/reviews
   * @param {number|string} productId
   * @param {object} payload - { rating, comment, images } where images is array of URLs
   */
  postReview: async (productId, payload) => {
    try {
      const res = await api.post(`${BASE}/${productId}/reviews`, payload);
      return res;
    } catch (err) {
      console.error('Error posting review:', err);
      throw err;
    }
  },

  /**
   * Update a review (within edit window)
   * PUT /api/reviews/{reviewId}
   * @param {number|string} reviewId
   * @param {object} payload - { rating, comment, images }
   */
  updateReview: async (reviewId, payload) => {
    try {
      const res = await api.put(`reviews/${reviewId}`, payload);
      return res;
    } catch (err) {
      console.error('Error updating review:', err);
      throw err;
    }
  },

  /**
   * Delete a review
   * DELETE /api/reviews/{reviewId}
   * @param {number|string} reviewId
   */
  deleteReview: async (reviewId) => {
    try {
      const res = await api.delete(`reviews/${reviewId}`);
      return res;
    } catch (err) {
      console.error('Error deleting review:', err);
      throw err;
    }
  },

  /**
   * Upload temporary review images (before creating review)
   * POST /api/reviews/images/upload
   * @param {File[]} files - Array of image files
   * @param {function} onProgress - Progress callback (optional)
   * @returns {Promise<Array<{url, publicId, width, height, size}>>}
   */
  uploadTempImages: async (files, onProgress = null) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        };
      }

      const res = await api.post('reviews/images/upload', formData, config);
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error uploading review images:', err);
      throw err;
    }
  },

  /**
   * Get my reviews (current user)
   * GET /api/my-reviews
   * @param {object} params - { page, size }
   */
  getMyReviews: async (params = {}) => {
    try {
      const res = await api.get('my-reviews', { params });
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error fetching my reviews:', err);
      throw err;
    }
  },

  /**
   * Get all reviews for current seller's shop (grouped)
   * GET /api/my-shop/reviews/all
   * @returns {Promise<{replied: [], unreplied: []}>}
   */
  getShopReviews: async () => {
    try {
      const res = await api.get('my-shop/reviews/all');
      return res;
    } catch (err) {
      console.error('Error fetching shop reviews:', err);
      throw err;
    }
  },

  /**
   * Seller reply to a review
   * POST /api/reviews/{reviewId}/reply
   * @param {number|string} reviewId
   * @param {object} payload - { sellerResponse }
   */
  replyReview: async (reviewId, payload) => {
    try {
      const res = await api.post(`reviews/${reviewId}/reply`, payload);
      return res;
    } catch (err) {
      console.error('Error replying to review:', err);
      throw err;
    }
  },

  // ==================== LIKE METHODS ====================

  /**
   * Toggle like/unlike a review
   * POST /api/reviews/{reviewId}/like
   * @param {number|string} reviewId
   * @returns {Promise<{reviewId, liked, likesCount}>}
   */
  toggleLike: async (reviewId) => {
    try {
      const res = await api.post(`reviews/${reviewId}/like`);
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error toggling review like:', err);
      throw err;
    }
  },

  /**
   * Get like status of a review
   * GET /api/reviews/{reviewId}/like
   * @param {number|string} reviewId
   * @returns {Promise<{reviewId, liked, likesCount}>}
   */
  getLikeStatus: async (reviewId) => {
    try {
      const res = await api.get(`reviews/${reviewId}/like`);
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error getting like status:', err);
      throw err;
    }
  },

  // ==================== REPORT METHODS ====================

  /**
   * Report a review
   * POST /api/reviews/{reviewId}/report
   * @param {number|string} reviewId
   * @param {object} payload - { reportType: "SPAM|INAPPROPRIATE|FAKE|OFFENSIVE|OTHER", reason: "..." }
   * @returns {Promise<ReviewReportDTO>}
   */
  reportReview: async (reviewId, payload) => {
    try {
      const res = await api.post(`reviews/${reviewId}/report`, payload);
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error reporting review:', err);
      throw err;
    }
  },

  // ==================== ADMIN REPORT METHODS ====================

  /**
   * Get review reports (Admin only)
   * GET /api/admin/reviews/reports
   * @param {object} params - { status, page, size }
   * @returns {Promise<Page<ReviewReportDTO>>}
   */
  getReports: async (params = {}) => {
    try {
      const res = await api.get('admin/reviews/reports', { params });
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error fetching reports:', err);
      throw err;
    }
  },

  /**
   * Update report status (Admin only)
   * PUT /api/admin/reviews/reports/{reportId}
   * @param {number|string} reportId
   * @param {object} params - { status: "PENDING|REVIEWED|RESOLVED|DISMISSED", adminNote }
   */
  updateReportStatus: async (reportId, params) => {
    try {
      const res = await api.put(`admin/reviews/reports/${reportId}`, null, { params });
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error updating report status:', err);
      throw err;
    }
  },

  /**
   * Get report counts by status (Admin only)
   * GET /api/admin/reviews/reports/counts
   * @returns {Promise<{PENDING, REVIEWED, RESOLVED, DISMISSED}>}
   */
  getReportCounts: async () => {
    try {
      const res = await api.get('admin/reviews/reports/counts');
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error fetching report counts:', err);
      throw err;
    }
  }
};

export default reviewService;
