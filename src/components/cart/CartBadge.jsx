// src/components/cart/CartBadge.jsx
import React from 'react';
import useCart from '../../hooks/useCart';

/**
 * CartBadge
 * Shows cart item count in badge
 * Used in Navbar/Header
 */
const CartBadge = () => {
  const { cartCount } = useCart();

  if (!cartCount || cartCount === 0) {
    return null;
  }

  return (
    <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {cartCount > 99 ? '99+' : cartCount}
    </span>
  );
};

export default CartBadge;
