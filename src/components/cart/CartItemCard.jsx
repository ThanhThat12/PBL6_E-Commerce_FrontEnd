// src/components/cart/CartItemCard.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useCart from '../../hooks/useCart';
import useCartStore from '../../store/cartStore';

/**
 * CartItemCard
 * Displays a single cart item with quantity controls and selection checkbox
 * @param {Object} item - Cart item from CartDTO
 */
const CartItemCard = ({ item }) => {
  const location = useLocation();
  const { updateQuantity, removeFromCart } = useCart();
  const selectedItems = useCartStore((state) => state.selectedItems);
  const toggleItemSelection = useCartStore((state) => state.toggleItemSelection);
  const [updating, setUpdating] = useState(false);

  const isSelected = selectedItems.includes(item.id);

  /**
   * Handle quantity change with validation
   */
  const handleQuantityChange = async (newQuantity) => {
    // Validate min/max
    if (newQuantity < 1) {
      toast.error('Số lượng phải ít nhất là 1');
      return;
    }

    if (newQuantity > 100) {
      toast.error('Số lượng không được vượt quá 100');
      return;
    }

    // Check against stock
    if (newQuantity > item.stockAvailable) {
      toast.error(`Chỉ còn ${item.stockAvailable} sản phẩm trong kho`);
      return;
    }

    setUpdating(true);
    try {
      const result = await updateQuantity(item.id, newQuantity);
      if (!result.success) {
        toast.error(result.error || 'Lỗi cập nhật số lượng');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error.response?.data?.message || 'Lỗi cập nhật số lượng');
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Handle remove item from cart
   */
  const handleRemove = async () => {
    setUpdating(true);
    try {
      const result = await removeFromCart(item.id);
      if (!result.success) {
        toast.error(result.error || 'Lỗi xóa sản phẩm');
      } else {
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.response?.data?.message || 'Lỗi xóa sản phẩm');
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Format price to VND
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  /**
   * Check if stock is low (< 10)
   */
  const isLowStock = item.stockAvailable < 10;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 flex gap-4 hover:shadow-medium transition-shadow">
      {/* Checkbox for selection - chỉ hiển thị ở trang /cart */}
      {location.pathname === '/cart' && (
        <div className="flex items-start pt-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleItemSelection(item.id)}
            className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 cursor-pointer"
            aria-label="Chọn sản phẩm để thanh toán"
          />
        </div>
      )}

      {/* Product Image - Clickable */}
      <Link 
        to={`/products/${item.productId}`}
        className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-neutral-100 hover:opacity-80 transition-opacity"
      >
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
            No Image
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        {/* Product Name - Clickable */}
        <Link 
          to={`/products/${item.productId}`}
          className="font-semibold text-neutral-900 mb-1 hover:text-primary-600 transition-colors inline-block"
        >
          {item.productName}
        </Link>

        {/* Variant Attributes */}
        {item.variantAttributes && item.variantAttributes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1 mb-2">
            {item.variantAttributes.map((attr, idx) => (
              <span
                key={idx}
                className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded"
              >
                {attr.name}
              </span>
            ))}
          </div>
        )}

        {/* SKU */}
        <p className="text-xs text-neutral-500 mt-1">
          SKU: {item.sku}
        </p>

        {/* Stock Warning */}
        {isLowStock && (
          <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
            <FiAlertCircle size={14} />
            <span>Chỉ còn {item.stockAvailable} sản phẩm</span>
          </div>
        )}

        {/* Unit Price */}
        <p className="text-sm text-red-600 font-semibold mt-2">
          {formatPrice(item.unitPrice)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-2 min-w-[120px]">
        <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
            className="p-1 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            aria-label="Giảm số lượng"
          >
            <FiMinus size={16} />
          </button>
          <span className="w-12 text-center font-medium">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={updating || item.quantity >= item.stockAvailable}
            className="p-1 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            aria-label="Tăng số lượng"
          >
            <FiPlus size={16} />
          </button>
        </div>

        {/* Subtotal */}
        <p className="font-bold text-lg text-neutral-900 mt-2">
          {formatPrice(item.subTotal)}
        </p>

        {/* Remove Button - chỉ hiển thị ở trang /cart */}
        {location.pathname === '/cart' && (
          <button
            onClick={handleRemove}
            disabled={updating}
            className="mt-2 p-2 hover:bg-error-50 text-error-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Xóa sản phẩm"
            aria-label="Xóa sản phẩm khỏi giỏ hàng"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CartItemCard;
