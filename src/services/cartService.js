// src/services/cartService.js
// Service for shopping cart API calls

import api from './api';

/**
 * Get current user's cart
 * @returns {Promise} Cart with items
 */
export const getCart = async () => {
  const response = await api.get('api/cart');
  return response.data;
};

/**
 * Add product to cart
 * @param {number} productVariantId - Product variant ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise} Success message
 */
export const addToCart = async (productVariantId, quantity = 1) => {
  const response = await api.post('api/cart', {
    productVariantId,
    quantity
  });
  return response.data;
};

/**
 * Update cart item quantity
 * @param {number} variantId - Product variant ID
 * @param {number} quantity - New quantity
 * @returns {Promise} Success message
 */
export const updateCartQuantity = async (variantId, quantity) => {
  const response = await api.put(`api/cart/${variantId}`, { quantity });
  return response.data;
};

/**
 * Remove item from cart
 * @param {number} variantId - Product variant ID
 * @returns {Promise} Success message
 */
export const removeFromCart = async (variantId) => {
  const response = await api.delete(`api/cart/${variantId}`);
  return response.data;
};

/**
 * Clear entire cart
 * @returns {Promise} Success message
 */
export const clearCart = async () => {
  const response = await api.delete('api/cart/clear');
  return response.data;
};

/**
 * Get cart items count
 * @returns {Promise} Number of items
 */
export const getCartCount = async () => {
  const response = await api.get('api/cart/count');
  return response.data;
};

// Legacy support
export const fetchCart = getCart;
