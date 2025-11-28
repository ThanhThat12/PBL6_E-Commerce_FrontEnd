import api from './api';

/**
 * Review Service
 * Endpoints: GET /products/{id}/reviews
 *            POST /products/{id}/reviews
 */
const BASE = 'products';

const reviewService = {
  /**
   * Get reviews for a product
   * @param {number|string} productId
   * @param {object} params - optional query params { page, size }
   */
  getReviews: async (productId, params = {}) => {
    try {
      const res = await api.get(`${BASE}/${productId}/reviews`, { params });
      // api returns response.data (ResponseDTO). Normalize to { content, page }
      if (!res) return { content: [], page: {} };
      if (res.data) return res.data;
      return res;
    } catch (err) {
      console.error('Error fetching reviews:', err);
      throw err;
    }
  },

  /**
   * Post a review for a product
   * @param {number|string} productId
   * @param {object} payload - { rating, comment, images? } where images is array of URLs
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
   * Update a review
   * @param {number|string} reviewId
   * @param {object} payload - { rating, comment, images? } where images is array of URLs
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
   * Get all reviews for current seller's shop
   * GET /my-shop/reviews/all
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
   * POST /reviews/{reviewId}/reply
   */
  replyReview: async (reviewId, payload) => {
    try {
      const res = await api.post(`reviews/${reviewId}/reply`, payload);
      return res;
    } catch (err) {
      console.error('Error replying to review:', err);
      throw err;
    }
  }
};

export default reviewService;
