import React from 'react';

/**
 * OrderSummaryCard Component
 * Display order summary for checkout
 */
const OrderSummaryCard = ({ items = [], shippingFee = 0, totalAmount = 0 }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Thông tin đơn hàng
      </h2>

      {/* Order Items */}
      <div className="space-y-3 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              {item.variant && (
                <p className="text-xs text-gray-500 mt-1">{item.variant}</p>
              )}
              <p className="text-xs text-gray-600 mt-1">
                SL: {item.quantity}
              </p>
            </div>
            <div className="text-right ml-4">
              <p className="text-sm font-medium text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Calculations */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Phí vận chuyển:</span>
          <span className="text-gray-900 font-medium">
            {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
          </span>
        </div>

        <div className="flex justify-between pt-3 border-t border-gray-300">
          <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(totalAmount || (subtotal + shippingFee))}
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          * Giá đã bao gồm VAT (nếu có)
        </p>
      </div>
    </div>
  );
};

export default OrderSummaryCard;
