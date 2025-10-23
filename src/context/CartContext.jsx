// src/context/CartContext.jsx
import React, { createContext, useEffect, useContext } from 'react';
import useCartStore from '../store/cartStore';
import AuthContext from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const {
    cart,
    cartCount,
    loading,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    clearError,
    resetCart
  } = useCartStore();

  // Fetch cart when authenticated; reset when not authenticated
  const { isAuthenticated } = useContext(AuthContext) || {};

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Ensure cart is cleared when user is not authenticated to avoid
      // unauthenticated API calls that may trigger redirects/full reloads
      resetCart();
    }
  }, [fetchCart, isAuthenticated, resetCart]);

  const value = {
    // State
    cart,
    cartCount,
    loading,
    error,

    // Methods
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    clearError,
    resetCart,

    // Computed values
    cartItems: cart?.items || [],
    totalItems: cart?.totalItems || 0,
    totalAmount: cart?.totalAmount || 0,
    isEmpty: !cart?.items || cart.items.length === 0
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export default CartContext;
