/**
 * Seller Registration Service
 * API calls for buyer to apply as seller & admin to approve/reject
 * 
 * Buyer Endpoints:
 * - POST /api/seller/register - Submit registration
 * - GET /api/seller/registration/status - Check registration status
 * - DELETE /api/seller/registration - Cancel rejected application
 * - PUT /api/seller/registration - Update rejected application
 * - GET /api/seller/registration/can-submit - Check if can submit
 * 
 * Admin Endpoints:
 * - GET /api/admin/seller-registrations/pending - List pending applications
 * - GET /api/admin/seller-registrations/search - Search applications
 * - GET /api/admin/seller-registrations/pending/count - Get pending count
 * - GET /api/admin/seller-registrations/{shopId} - Get application detail
 * - POST /api/admin/seller-registrations/approve - Approve application
 * - POST /api/admin/seller-registrations/reject - Reject application
 */
import api from './api';

// ==================== BUYER APIs ====================

/**
 * Submit seller registration application
 * @param {object} data - Registration data with KYC
 * @returns {Promise<object>} SellerRegistrationResponseDTO
 */
export const submitSellerRegistration = async (data) => {
  try {
    const response = await api.post('/seller/register', data);
    return response;
  } catch (error) {
    console.error('Error submitting seller registration:', error);
    throw error;
  }
};

/**
 * Get current registration status
 * @returns {Promise<object>} RegistrationStatusDTO
 */
export const getRegistrationStatus = async () => {
  try {
    const response = await api.get('/seller/registration/status');
    return response;
  } catch (error) {
    console.error('Error getting registration status:', error);
    throw error;
  }
};

/**
 * Cancel rejected application (to allow resubmission)
 * @returns {Promise<object>} { success: boolean, message: string }
 */
export const cancelRejectedApplication = async () => {
  try {
    const response = await api.delete('/seller/registration');
    return response;
  } catch (error) {
    console.error('Error canceling rejected application:', error);
    throw error;
  }
};

/**
 * Check if user can submit new registration
 * @returns {Promise<object>} { canSubmit: boolean, message: string }
 */
export const canSubmitRegistration = async () => {
  try {
    const response = await api.get('/seller/registration/can-submit');
    return response;
  } catch (error) {
    console.error('Error checking registration eligibility:', error);
    throw error;
  }
};

/**
 * Check if shop name is available (real-time validation)
 * @param {string} name - Shop name to check
 * @param {boolean} excludeMyShop - Exclude current user's shop (for editing mode)
 * @returns {Promise<object>} { available: boolean, message: string }
 */
export const checkShopName = async (name, excludeMyShop = false) => {
  try {
    const response = await api.get('/seller/registration/check-name', {
      params: { name, excludeMyShop }
    });
    return response;
  } catch (error) {
    console.error('Error checking shop name:', error);
    throw error;
  }
};

/**
 * Check if CCCD is available (real-time validation)
 * @param {string} cccd - CCCD number to check
 * @param {boolean} excludeMyShop - Exclude current user's shop (for editing mode)
 * @returns {Promise<object>} { available: boolean, message: string }
 */
export const checkCCCD = async (cccd, excludeMyShop = false) => {
  try {
    const response = await api.get('/seller/registration/check-cccd', {
      params: { cccd, excludeMyShop }
    });
    return response;
  } catch (error) {
    console.error('Error checking CCCD:', error);
    throw error;
  }
};

/**
 * Update rejected registration application
 * @param {object} data - Updated registration data with KYC
 * @returns {Promise<object>} SellerRegistrationResponseDTO
 */
export const updateRejectedApplication = async (data) => {
  try {
    const response = await api.put('/seller/registration', data);
    return response;
  } catch (error) {
    console.error('Error updating rejected application:', error);
    throw error;
  }
};

// ==================== ADMIN APIs ====================

/**
 * Get list of pending seller applications
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @returns {Promise<object>} Page of PendingApplicationDTO
 */
export const getPendingApplications = async (page = 0, size = 10) => {
  try {
    const response = await api.get('/admin/seller-registrations/pending', {
      params: { page, size }
    });
    return response;
  } catch (error) {
    console.error('Error getting pending applications:', error);
    throw error;
  }
};

/**
 * Search pending applications
 * @param {object} params - Search params { keyword, page, size, status }
 * @returns {Promise<object>} Page of PendingApplicationDTO
 */
export const searchPendingApplications = async (params = {}) => {
  try {
    const { keyword = '', page = 0, size = 10, status } = params;
    
    // If no keyword, use the pending endpoint (no search)
    // Backend search requires keyword param
    if (!keyword || keyword.trim() === '') {
      // Use getPendingApplications endpoint for listing
      const response = await api.get('/admin/seller-registrations/pending', {
        params: { page, size }
      });
      return response;
    }
    
    // Otherwise use search endpoint
    const response = await api.get('/admin/seller-registrations/search', {
      params: { keyword: keyword.trim(), page, size }
    });
    return response;
  } catch (error) {
    console.error('Error searching pending applications:', error);
    throw error;
  }
};

/**
 * Get count of pending applications (for badge)
 * @returns {Promise<object>} { count: number }
 */
export const getPendingCount = async () => {
  try {
    const response = await api.get('/admin/seller-registrations/pending/count');
    return response;
  } catch (error) {
    console.error('Error getting pending count:', error);
    throw error;
  }
};

/**
 * Get single application detail
 * @param {number} shopId - Shop ID
 * @returns {Promise<object>} PendingApplicationDTO
 */
export const getApplicationDetail = async (shopId) => {
  try {
    const response = await api.get(`/admin/seller-registrations/${shopId}`);
    return response;
  } catch (error) {
    console.error('Error getting application detail:', error);
    throw error;
  }
};

/**
 * Approve seller registration
 * @param {number} shopId - Shop ID to approve
 * @param {string} note - Optional note
 * @returns {Promise<object>} SellerRegistrationResponseDTO
 */
export const approveRegistration = async (shopId, note = '') => {
  try {
    const response = await api.post('/admin/seller-registrations/approve', {
      shopId,
      note
    });
    return response;
  } catch (error) {
    console.error('Error approving registration:', error);
    throw error;
  }
};

/**
 * Reject seller registration
 * @param {number} shopId - Shop ID to reject
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<object>} SellerRegistrationResponseDTO
 */
export const rejectRegistration = async (shopId, rejectionReason) => {
  try {
    const response = await api.post('/admin/seller-registrations/reject', {
      shopId,
      rejectionReason
    });
    return response;
  } catch (error) {
    console.error('Error rejecting registration:', error);
    throw error;
  }
};

export default {
  // Buyer APIs
  submitSellerRegistration,
  getRegistrationStatus,
  cancelRejectedApplication,
  updateRejectedApplication,
  canSubmitRegistration,
  checkShopName,
  checkCCCD,
  // Admin APIs
  getPendingApplications,
  searchPendingApplications,
  getPendingCount,
  getApplicationDetail,
  approveRegistration,
  rejectRegistration,
};
