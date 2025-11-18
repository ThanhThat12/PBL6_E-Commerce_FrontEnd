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
   * @param {object} payload - { rating, comment, images? }
   */
  postReview: async (productId, payload) => {
    try {
      // If payload contains File objects in `images`, send as FormData
      const hasFiles = payload && Array.isArray(payload.images) && payload.images.some(f => typeof File !== 'undefined' ? f instanceof File : (f && f.raw instanceof File));
      let res;
      if (hasFiles) {
        const formData = new FormData();
        formData.append('rating', payload.rating);
        if (payload.comment) formData.append('comment', payload.comment);
        // Append files
        payload.images.forEach((file, idx) => {
          // some upload components wrap file in { originFileObj } or { raw }
          const f = file.originFileObj || file.raw || file;
          formData.append('images', f);
        });

        res = await api.post(`${BASE}/${productId}/reviews`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post(`${BASE}/${productId}/reviews`, payload);
      }
      return res;
    } catch (err) {
      console.error('Error posting review:', err);
      throw err;
    }
  }
,

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
