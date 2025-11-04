// src/hooks/useCart.js
import { useContext } from 'react';
import CartContext from '../context/CartContext';
import useCartStore from '../store/cartStore';

/**
 * Hook for accessing cart state and methods
 * Can be used with Context API or direct Zustand store
 * @returns {Object} Cart state and methods
 */
export default function useCart() {
  // Always call Zustand store first (unconditional)
  const cartStore = useCartStore();

  // Then try to get context
  const contextValue = useContext(CartContext);

  // Use context if available, otherwise use store directly
  const cartState = contextValue || cartStore;

  return {
    // State
    cart: cartState.cart,
    cartCount: cartState.cartCount,
    loading: cartState.loading,
    error: cartState.error,

    // Computed
    cartItems: cartState.cart?.items || [],
    totalItems: cartState.cart?.totalItems || 0,
    totalAmount: cartState.cart?.totalAmount || 0,
    isEmpty: !cartState.cart?.items || cartState.cart.items.length === 0,

    // Methods
    fetchCart: cartState.fetchCart,
    addToCart: cartState.addToCart,
    updateQuantity: cartState.updateQuantity,
    removeFromCart: cartState.removeFromCart,
    clearCart: cartState.clearCart,
    getCartCount: cartState.getCartCount,
    clearError: cartState.clearError,
    resetCart: cartState.resetCart
  };
}
