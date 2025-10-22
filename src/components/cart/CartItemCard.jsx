// src/components/cart/CartItemCard.jsx
import React, { useState } from 'react';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useCart from '../../hooks/useCart';
import Button from '../common/Button';

/**
 * CartItemCard
 * Displays a single cart item with quantity controls
 */
const CartItemCard = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(true);
    try {
      const result = await updateQuantity(item.productVariantId, newQuantity);
      if (!result.success) {
        toast.error(result.error || 'Lỗi cập nhật số lượng');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Lỗi cập nhật số lượng');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      const result = await removeFromCart(item.productVariantId);
      if (!result.success) {
        toast.error(result.error || 'Lỗi xóa sản phẩm');
      } else {
        toast.success('Xóa sản phẩm thành công');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Lỗi xóa sản phẩm');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 flex gap-4 hover:shadow-medium transition-shadow">
      {/* Product Image */}
      <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-neutral-100">
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            No Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-neutral-900 truncate">
          {item.productName}
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          SKU: {item.productSku}
        </p>
        <p className="text-sm text-primary-600 font-medium mt-2">
          {formatPrice(item.price)} / sản phẩm
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
            className="p-1 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <FiMinus size={16} />
          </button>
          <span className="w-8 text-center font-medium">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={updating || item.quantity >= item.stock}
            className="p-1 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <FiPlus size={16} />
          </button>
        </div>

        {item.quantity >= item.stock && (
          <p className="text-xs text-warning-600">Tối đa kho: {item.stock}</p>
        )}
      </div>

      {/* Subtotal & Remove */}
      <div className="flex flex-col items-end justify-between">
        <p className="font-semibold text-lg text-neutral-900">
          {formatPrice(item.subtotal)}
        </p>
        <button
          onClick={handleRemove}
          disabled={updating}
          className="p-2 hover:bg-error-50 text-error-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Xóa sản phẩm"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
