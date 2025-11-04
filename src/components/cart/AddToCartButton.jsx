// src/components/cart/AddToCartButton.jsx
import React, { useState } from 'react';
import { FiShoppingCart, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useCart from '../../hooks/useCart';
import Button from '../common/Button';

/**
 * AddToCartButton
 * Button to add product to cart
 * Used in ProductCard and ProductDetailPage
 */
const AddToCartButton = ({
  productVariantId,
  quantity = 1,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
  showIcon = true,
  children = 'Thêm vào giỏ'
}) => {
  const { addToCart, loading: cartLoading } = useCart();
  const [localLoading, setLocalLoading] = useState(false);

  const isLoading = localLoading || cartLoading;

  const handleAddToCart = async () => {
    if (!productVariantId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }

    if (quantity < 1) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    setLocalLoading(true);
    try {
      const result = await addToCart(productVariantId, quantity);
      if (result.success) {
        toast.success(result.message || 'Thêm vào giỏ hàng thành công!');
      } else {
        toast.error(result.error || 'Không thể thêm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Lỗi thêm vào giỏ hàng');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isLoading}
      onClick={handleAddToCart}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading ? (
          <FiLoader className="animate-spin" size={20} />
        ) : showIcon ? (
          <FiShoppingCart size={20} />
        ) : null}
        <span>{children}</span>
      </div>
    </Button>
  );
};

export default AddToCartButton;
