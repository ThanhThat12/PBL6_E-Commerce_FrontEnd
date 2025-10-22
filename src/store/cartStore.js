// src/store/cartStore.js
// Cart state management using Zustand
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as cartService from '../services/cartService';

const useCartStore = create(
  devtools(
    (set, get) => ({
      // State
      cart: null,
      cartCount: 0,
      loading: false,
      error: null,

      // Actions
      /**
       * Fetch current user's cart
       */
      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const response = await cartService.getCart();
          const cartData = response.data || response;
          set({
            cart: cartData,
            cartCount: cartData?.totalItems || 0,
            loading: false,
            error: null
          });
          return { success: true, data: cartData };
        } catch (error) {
          const errorMsg =
            error.response?.data?.error ||
            error.message ||
            'Lỗi tải giỏ hàng';
          set({
            error: errorMsg,
            loading: false
          });
          return { success: false, error: errorMsg };
        }
      },

      /**
       * Add product to cart
       * @param {number} productVariantId - Product variant ID
       * @param {number} quantity - Quantity to add
       */
      addToCart: async (productVariantId, quantity = 1) => {
        set({ loading: true, error: null });
        try {
          const response = await cartService.addToCart(
            productVariantId,
            quantity
          );
          // Refresh cart after adding
          await get().fetchCart();
          set({ loading: false, error: null });
          return {
            success: true,
            message: response.message || 'Thêm vào giỏ hàng thành công'
          };
        } catch (error) {
          const errorMsg =
            error.response?.data?.error ||
            error.message ||
            'Không thể thêm vào giỏ hàng';
          set({
            error: errorMsg,
            loading: false
          });
          return { success: false, error: errorMsg };
        }
      },

      /**
       * Update item quantity in cart
       * @param {number} productVariantId - Product variant ID
       * @param {number} quantity - New quantity
       */
      updateQuantity: async (productVariantId, quantity) => {
        if (quantity <= 0) {
          set({ error: 'Số lượng phải lớn hơn 0' });
          return { success: false, error: 'Số lượng phải lớn hơn 0' };
        }

        set({ loading: true, error: null });
        try {
          const response = await cartService.updateCartQuantity(
            productVariantId,
            quantity
          );
          // Refresh cart after updating
          await get().fetchCart();
          set({ loading: false, error: null });
          return {
            success: true,
            message: response.message || 'Cập nhật thành công'
          };
        } catch (error) {
          const errorMsg =
            error.response?.data?.error ||
            error.message ||
            'Không thể cập nhật giỏ hàng';
          set({
            error: errorMsg,
            loading: false
          });
          return { success: false, error: errorMsg };
        }
      },

      /**
       * Remove item from cart
       * @param {number} productVariantId - Product variant ID
       */
      removeFromCart: async (productVariantId) => {
        set({ loading: true, error: null });
        try {
          const response = await cartService.removeFromCart(productVariantId);
          // Refresh cart after removing
          await get().fetchCart();
          set({ loading: false, error: null });
          return {
            success: true,
            message: response.message || 'Xóa khỏi giỏ hàng thành công'
          };
        } catch (error) {
          const errorMsg =
            error.response?.data?.error ||
            error.message ||
            'Không thể xóa sản phẩm';
          set({
            error: errorMsg,
            loading: false
          });
          return { success: false, error: errorMsg };
        }
      },

      /**
       * Clear entire cart
       */
      clearCart: async () => {
        set({ loading: true, error: null });
        try {
          const response = await cartService.clearCart();
          set({
            cart: { items: [], totalItems: 0, totalAmount: 0 },
            cartCount: 0,
            loading: false,
            error: null
          });
          return {
            success: true,
            message: response.message || 'Giỏ hàng đã được làm trống'
          };
        } catch (error) {
          const errorMsg =
            error.response?.data?.error ||
            error.message ||
            'Không thể làm trống giỏ hàng';
          set({
            error: errorMsg,
            loading: false
          });
          return { success: false, error: errorMsg };
        }
      },

      /**
       * Get cart items count
       */
      getCartCount: async () => {
        try {
          const response = await cartService.getCartCount();
          const count = response.data || response;
          set({ cartCount: count || 0 });
          return count || 0;
        } catch (error) {
          console.error('Error getting cart count:', error);
          return 0;
        }
      },

      /**
       * Clear error message
       */
      clearError: () => set({ error: null }),

      /**
       * Reset cart state
       */
      resetCart: () =>
        set({
          cart: null,
          cartCount: 0,
          loading: false,
          error: null
        })
    }),
    { name: 'cartStore' }
  )
);

export default useCartStore;
