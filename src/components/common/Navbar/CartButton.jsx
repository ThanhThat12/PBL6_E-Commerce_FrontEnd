import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Badge from '../Badge/Badge';

/**
 * CartButton Component - Nút giỏ hàng với badge số lượng
 * 
 * @param {number} itemCount - Số lượng sản phẩm trong giỏ (từ backend/context)
 * @param {function} onClick - Callback khi click
 * @param {string} href - Link đến trang giỏ hàng
 * @param {string} className - Custom classes
 */
const CartButton = ({ 
  itemCount = 0,
  onClick,
  href = '/cart',
  className = ''
}) => {
  const content = (
    <div className="relative flex items-center gap-2 group">
      <div className="relative">
        <ShoppingCartIcon className="w-6 h-6 text-white group-hover:text-primary-100 transition-colors" />
        {itemCount > 0 && (
          <span className="
            absolute 
            -top-2 
            -right-2 
            min-w-[20px] 
            h-5 
            px-1.5
            flex 
            items-center 
            justify-center
            bg-secondary-500
            text-white 
            text-xs 
            font-bold
            rounded-full
            shadow-colored-secondary
            animate-pulse
          ">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>
      <span className="hidden lg:inline text-sm font-medium text-white group-hover:text-primary-100 transition-colors">
        Giỏ hàng
      </span>
    </div>
  );

  const buttonClasses = `
    px-3 
    py-2 
    rounded-lg
    hover:bg-primary-600
    transition-colors
    ${className}
  `;

  if (onClick) {
    return (
      <button onClick={onClick} className={buttonClasses} aria-label={`Giỏ hàng (${itemCount} sản phẩm)`}>
        {content}
      </button>
    );
  }

  return (
    <Link to={href} className={buttonClasses} aria-label={`Giỏ hàng (${itemCount} sản phẩm)`}>
      {content}
    </Link>
  );
};

export default CartButton;
