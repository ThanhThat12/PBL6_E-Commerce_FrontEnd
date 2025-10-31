// src/services/cartService.js
// Service for shopping cart API calls

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get current user's cart
 * @returns {Promise<CartDTO>} Cart with items
 */
export const getCart = async () => {
  const response = await api.get(API_ENDPOINTS.CART.GET);
  return response.data; // CartDTO
};

/**
 * Add product variant to cart
 * @param {number} variantId - Product variant ID (sent as productId to backend)
 * @param {number} quantity - Quantity to add
 * @returns {Promise<CartDTO>} Updated cart
 */
export const addToCart = async (variantId, quantity = 1) => {
  const response = await api.post(API_ENDPOINTS.CART.ADD_ITEM, {
    productId: variantId, // Backend expects 'productId' but it's actually variantId
    quantity,
  });
  return response.data; // CartDTO
};

/**
 * Update cart item quantity
 * @param {number} itemId - Cart item ID
 * @param {number} quantity - New quantity (1-100)
 * @returns {Promise<CartDTO>} Updated cart
 */
export const updateCartItemQuantity = async (itemId, quantity) => {
  const response = await api.put(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), {
    quantity,
  });
  return response.data; // CartDTO
};

/**
 * Remove item from cart
 * @param {number} itemId - Cart item ID
 * @returns {Promise<CartDTO>} Updated cart
 */
export const removeCartItem = async (itemId) => {
  const response = await api.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemId));
  return response.data; // CartDTO
};

/**
 * Clear entire cart
 * @returns {Promise} Success response
 */
export const clearCart = async () => {
  const response = await api.delete(API_ENDPOINTS.CART.CLEAR);
  return response;
};

/**
 * Get cart items count
 * @returns {Promise<number>} Number of items in cart
 */
export const getCartCount = async () => {
  try {
    const cart = await getCart();
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

// Legacy support
export const fetchCart = getCart;
export const updateCartQuantity = updateCartItemQuantity;
export const removeFromCart = removeCartItem;
