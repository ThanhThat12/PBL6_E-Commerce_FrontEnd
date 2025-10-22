// src/components/cart/CartSummary.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import Button from '../common/Button';

/**
 * CartSummary
 * Shows cart totals and checkout button
 */
const CartSummary = () => {
  const { totalItems, totalAmount, isEmpty } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (isEmpty) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center">
        <p className="text-neutral-600 mb-4">Giỏ hàng của bạn trống</p>
        <Link
          to="/products"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 sticky top-4">
      <h2 className="text-xl font-bold text-neutral-900 mb-4">
        Tóm tắt đơn hàng
      </h2>

      <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
        <div className="flex justify-between">
          <span className="text-neutral-600">Số lượng:</span>
          <span className="font-medium">{totalItems} sản phẩm</span>
        </div>

        <div className="flex justify-between text-lg font-bold">
          <span className="text-neutral-900">Tổng cộng:</span>
          <span className="text-primary-600">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => (window.location.href = '/checkout')}
        >
          Thanh toán
        </Button>

        <Link
          to="/products"
          className="block w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold py-2 px-4 rounded-lg text-center transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>

      <p className="text-xs text-neutral-500 text-center mt-4">
        Phí vận chuyển sẽ được tính tại thanh toán
      </p>
    </div>
  );
};

export default CartSummary;
