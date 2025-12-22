import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import Button from '../common/Button';

/**
 * ProductActions Component - Handle product purchase actions
 * Controls add to cart and buy now with ownership restrictions
 */
const ProductActions = ({ 
  canAddToCart, 
  isShopOwner, 
  isAuthenticated, 
  hasRole,
  selectedVariant, 
  product, 
  adding, 
  onAddToCart, 
  onBuyNow 
}) => {
  
  // Generate appropriate tooltip messages
  const getTooltipMessage = () => {
    if (!isAuthenticated) return 'Vui lòng đăng nhập để mua hàng';
    if (hasRole && hasRole('ADMIN')) return 'Admin không thể mua hàng. Vui lòng sử dụng tài khoản buyer.';
    if (isShopOwner) return 'Bạn không thể mua sản phẩm của chính shop bạn';
    if (!selectedVariant) return 'Vui lòng chọn phiên bản sản phẩm';
    if (selectedVariant?.stock === 0) return 'Sản phẩm đã hết hàng';
    if (!product.isActive) return 'Sản phẩm không khả dụng';
    return '';
  };

  const getButtonText = (type) => {
    if (hasRole && hasRole('ADMIN')) {
      return type === 'cart' ? 'Không thể thêm' : 'Không thể mua';
    }
    if (isShopOwner) {
      return type === 'cart' ? 'Sản phẩm của bạn' : 'Không thể mua';
    }
    if (type === 'cart') {
      return adding ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng';
    }
    return 'Mua Ngay';
  };

  const tooltipMessage = getTooltipMessage();

  return (
    <div className="flex gap-3">
      {/* Add to Cart Button */}
      <Button
        onClick={onAddToCart}
        disabled={!canAddToCart || adding}
        variant="outline"
        className={`flex-1 ${
          !canAddToCart
            ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50' 
            : 'border-primary-500 text-primary-600 hover:bg-primary-50'
        }`}
        title={tooltipMessage}
      >
        <FiShoppingCart className="w-5 h-5 mr-2" />
        {getButtonText('cart')}
      </Button>
      
      {/* Buy Now Button */}
      <Button
        onClick={onBuyNow}
        disabled={!canAddToCart || adding}
        variant="primary"
        className={`flex-1 ${
          isShopOwner || (hasRole && hasRole('ADMIN')) ? 'bg-gray-400 cursor-not-allowed' : ''
        }`}
        title={tooltipMessage}
      >
        {getButtonText('buy')}
      </Button>
    </div>
  );
};

export default ProductActions;