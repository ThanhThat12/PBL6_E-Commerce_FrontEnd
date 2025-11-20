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
  selectedItems: [], // Không khôi phục từ localStorage nữa

      // Actions
      /**
       * Fetch current user's cart
       */
      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const cartData = await cartService.getCart();
          
          // Calculate cart count from items
          const totalItems = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          
          set({
            cart: cartData,
            cartCount: totalItems,
            loading: false,
            error: null
          });
          return { success: true, data: cartData };
        } catch (error) {
          // Don't show error for 401 (user not logged in)
          if (error.response?.status === 401) {
            set({
              cart: null,
              cartCount: 0,
              loading: false,
              error: null
            });
            return { success: false, error: null };
          }
          
          const errorMsg =
            error.response?.data?.message ||
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
       * Add product variant to cart
       * @param {number} variantId - Product variant ID
       * @param {number} quantity - Quantity to add (1-100)
       */
      addToCart: async (variantId, quantity = 1) => {
        // Validate quantity
        if (quantity < 1 || quantity > 100) {
          const errorMsg = 'Số lượng phải từ 1 đến 100';
          set({ error: errorMsg });
          return { success: false, error: errorMsg };
        }

        set({ loading: true, error: null });
        try {
          await cartService.addToCart(variantId, quantity);
          
          // Refresh cart after adding
          await get().fetchCart();
          set({ loading: false, error: null });
          return {
            success: true,
            message: 'Đã thêm sản phẩm vào giỏ hàng'
          };
        } catch (error) {
          const errorMsg =
            error.response?.data?.message ||
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
       * Update cart item quantity
       * @param {number} itemId - Cart item ID
       * @param {number} quantity - New quantity (1-100)
       */
      updateQuantity: async (itemId, quantity) => {
        // Validate quantity
        if (quantity < 1 || quantity > 100) {
          const errorMsg = 'Số lượng phải từ 1 đến 100';
          set({ error: errorMsg });
          return { success: false, error: errorMsg };
        }

        set({ loading: true, error: null });
        try {
          await cartService.updateCartItemQuantity(itemId, quantity);
          
          // Refresh cart after updating
          await get().fetchCart();
          set({ loading: false, error: null });
          return {
            success: true,
            message: 'Đã cập nhật số lượng'
          };
        } catch (error) {
          const errorMsg =
            error.response?.data?.message ||
            error.message ||
            'Không thể cập nhật số lượng';
          set({
            error: errorMsg,
            loading: false
          });
          return { success: false, error: errorMsg };
        }
      },

      /**
       * Remove item from cart
       * @param {number} itemId - Cart item ID
       */
      removeFromCart: async (itemId) => {
        set({ loading: true, error: null });
        try {
          await cartService.removeCartItem(itemId);
          
          // Refresh cart after removing
          await get().fetchCart();
          set({ loading: false, error: null });
          return {
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng'
          };
        } catch (error) {
          const errorMsg =
            error.response?.data?.message ||
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
          await cartService.clearCart();
          set({
            cart: { items: [], totalAmount: 0 },
            cartCount: 0,
            loading: false,
            error: null
          });
          return {
            success: true,
            message: 'Đã xóa toàn bộ giỏ hàng'
          };
        } catch (error) {
          const errorMsg =
            error.response?.data?.message ||
            error.message ||
            'Không thể xóa giỏ hàng';
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
          const count = await cartService.getCartCount();
          set({ cartCount: count });
          return count;
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
          error: null,
          selectedItems: []
        }),

      /**
       * Toggle item selection for checkout
       * @param {number} itemId - Cart item ID
       */
      toggleItemSelection: (itemId) => {
        const { selectedItems } = get();
        // Ensure itemId is a number for consistent comparison
        const normalizedItemId = typeof itemId === 'string' ? parseInt(itemId, 10) : itemId;
        
        console.log('� Toggle item:', normalizedItemId, 'Current selected:', selectedItems);
        
        const isSelected = selectedItems.includes(normalizedItemId);
        console.log('📌 Is selected?', isSelected);
        
        const newSelectedItems = isSelected
          ? selectedItems.filter(id => id !== normalizedItemId)
          : [...selectedItems, normalizedItemId];
        
        console.log('✅ New selected items:', newSelectedItems);
  set({ selectedItems: newSelectedItems });
  set({ selectedItems: newSelectedItems });
      },

      /**
       * Select all items
       */
      selectAllItems: () => {
        const { cart } = get();
        const allItemIds = cart?.items?.map(item => item.id) || [];
  set({ selectedItems: allItemIds });
  set({ selectedItems: allItemIds });
      },

      /**
       * Deselect all items
       */
      deselectAllItems: () => {
  set({ selectedItems: [] });
  set({ selectedItems: [] });
      },

      /**
       * Get selected items data
       */
      getSelectedItems: () => {
        const { cart, selectedItems } = get();
        return cart?.items?.filter(item => selectedItems.includes(item.id)) || [];
      },

      /**
       * Get total amount of selected items
       */
      getSelectedTotal: () => {
        const selectedItems = get().getSelectedItems();
        return selectedItems.reduce((sum, item) => sum + item.subTotal, 0);
      }
    }),
    { name: 'cartStore' }
  )
);

export default useCartStore;
