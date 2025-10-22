// src/context/CartContext.jsx
import React, { createContext, useEffect } from 'react';
import useCartStore from '../store/cartStore';

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

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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
