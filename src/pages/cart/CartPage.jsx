import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiShoppingBag } from 'react-icons/fi';

import ProfileLayout from '../../components/layout/ProfileLayout';
import useCart from '../../hooks/useCart';
import useCartStore from '../../store/cartStore';
import usePendingOrderCleanup from '../../hooks/usePendingOrderCleanup';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import { CartItemCard, CartSummary } from '../../components/cart';

/**
 * CartPage
 * Shopping cart with item management and checkout (with sidebar layout)
 */
const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, loading, isEmpty, clearCart } = useCart();
  const selectedItems = useCartStore((state) => state.selectedItems);
  const selectAllItems = useCartStore((state) => state.selectAllItems);
  const deselectAllItems = useCartStore((state) => state.deselectAllItems);
  const [showClearModal, setShowClearModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Cleanup pending MoMo orders when user returns to cart
  usePendingOrderCleanup();

  // Auto-select all items when cart loads for the first time
  useEffect(() => {
    if (!hasInitialized && cartItems && cartItems.length > 0 && selectedItems.length === 0) {
      console.log('🎯 Auto-selecting all items on first load');
      selectAllItems();
      setHasInitialized(true);
    }
  }, [cartItems, selectedItems.length, selectAllItems, hasInitialized]);

  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };
  const handleClearCart = async () => {
    try {
      const result = await clearCart();
      if (result.success) {
        setShowClearModal(false);
        toast.success(result.message || 'Giỏ hàng đã được làm trống');
      } else {
        toast.error(result.error || 'Lỗi làm trống giỏ hàng');
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      toast.error('Lỗi làm trống giỏ hàng');
    }
  };

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" text="Đang tải giỏ hàng..." />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Giỏ hàng</h1>
        <p className="text-neutral-600 mt-1">
          {isEmpty ? 'Giỏ hàng của bạn trống' : `${cartItems.length} sản phẩm trong giỏ`}
        </p>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-neutral-100 mb-6">
            <FiShoppingBag className="w-12 h-12 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Giỏ hàng của bạn trống
          </h2>
          <p className="text-neutral-600 mb-8">
            Hãy thêm sản phẩm để bắt đầu mua sắm
          </p>
          <Button
            onClick={() => navigate('/products')}
            variant="primary"
            size="lg"
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header with Select All and Clear Cart */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleSelectAll}
                  className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 cursor-pointer"
                  aria-label="Chọn tất cả sản phẩm"
                />
                <h2 className="text-xl font-bold text-neutral-900">
                  Chọn tất cả ({cartItems.length})
                </h2>
              </div>
              <button
                onClick={() => setShowClearModal(true)}
                className="text-sm text-error-600 hover:text-error-700 font-medium"
              >
                Xóa tất cả
              </button>
            </div>

            {/* Items List */}
            {cartItems.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Xóa giỏ hàng"
      >
        <p className="text-neutral-600 mb-6">
          Bạn chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => setShowClearModal(false)}
            variant="outline"
          >
            Hủy
          </Button>
          <Button
            onClick={handleClearCart}
            variant="danger"
          >
            Xóa giỏ hàng
          </Button>
        </div>
      </Modal>
    </ProfileLayout>
  );
};

export default CartPage;
