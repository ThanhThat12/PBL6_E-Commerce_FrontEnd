// src/components/cart/CartSummary.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import useCartStore from '../../store/cartStore';
import Button from '../common/Button';

/**
 * CartSummary
 * Shows cart totals and checkout button (based on selected items)
 */
const CartSummary = () => {
  const { isEmpty } = useCart();
  const selectedItems = useCartStore((state) => state.selectedItems);
  const getSelectedTotal = useCartStore((state) => state.getSelectedTotal);
  const getSelectedItems = useCartStore((state) => state.getSelectedItems);

  const selectedTotal = getSelectedTotal();
  const selectedItemsData = getSelectedItems();
  const hasSelectedItems = selectedItems.length > 0;

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
        Tổng đơn hàng
      </h2>

      {!hasSelectedItems ? (
        <div className="text-center py-4">
          <p className="text-neutral-500 text-sm">
            Vui lòng chọn sản phẩm để thanh toán
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-neutral-600">
                Sản phẩm đã chọn:
              </span>
              <span className="font-medium">{selectedItems.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-600">Tạm tính:</span>
              <span className="font-medium">{formatPrice(selectedTotal)}</span>
            </div>

            <div className="flex justify-between text-sm text-neutral-600">
              <span>Phí vận chuyển:</span>
              <span>Tính sau</span>
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-neutral-900">Tổng cộng:</span>
              <span className="text-red-600">
                {formatPrice(selectedTotal)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                // Store selected items in sessionStorage for checkout page
                sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItemsData));
                window.location.href = '/payment';
              }}
            >
              Tiến hành thanh toán ({selectedItems.length})
            </Button>

            <Link
              to="/products"
              className="block w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold py-2 px-4 rounded-lg text-center transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>

          <p className="text-xs text-neutral-500 text-center mt-4">
            * Phí vận chuyển sẽ được tính tại bước thanh toán
          </p>
        </>
      )}
    </div>
  );
};

export default CartSummary;
