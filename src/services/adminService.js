// src/services/adminService.js
// Service for admin user management API calls

import api from './api';

/**
 * Get admin users list
 * @returns {Promise} List of admin users
 */
export const getAdminUsers = async () => {
  const response = await api.get('/admin/users/admin');
  return response.data;
};

/**
 * Get seller users list
 * @returns {Promise} List of seller users
 */
export const getSellerUsers = async () => {
  const response = await api.get('/admin/users/sellers');
  return response.data;
};

/**
 * Get customer users list
 * @returns {Promise} List of customer users
 */
export const getCustomerUsers = async () => {
  const response = await api.get('/admin/users/customers');
  return response.data;
};

/**
 * Get user details by ID
 * @param {number} userId - User ID
 * @returns {Promise} User details
 */
export const getUserDetail = async (userId) => {
  const response = await api.get(`/admin/users/detail/${userId}`);
  return response.data;
};

/**
 * Update user role
 * @param {number} userId - User ID
 * @param {string} role - New role (ADMIN, SELLER, BUYER)
 * @returns {Promise} Success message
 */
export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Update user status (activate/deactivate)
 * @param {number} userId - User ID
 * @param {boolean} activated - Activation status
 * @returns {Promise} Success message
 */
export const updateUserStatus = async (userId, activated) => {
  const response = await api.patch(`/admin/users/${userId}/status`, { activated });
  return response.data;
};

/**
 * Delete user
 * @param {number} userId - User ID
 * @returns {Promise} Success message
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};
