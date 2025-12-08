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
  // Đã bỏ location vì không dùng đến
  // Đã bỏ prevPathRef vì không dùng đến
  // Theo dõi đường dẫn tiếp theo khi unmount CartPage
  React.useEffect(() => {
    let nextPath = null;
    const handlePush = (e) => {
      if (e.state && e.state.usr && e.state.usr.pathname) {
        nextPath = e.state.usr.pathname;
      } else if (e.target && e.target.location) {
        nextPath = e.target.location.pathname;
      }
    };
    window.addEventListener('popstate', handlePush);
    window.addEventListener('pushstate', handlePush);
    return () => {
      // Nếu rời khỏi cart sang trang khác không phải payment thì clear
      const finalPath = nextPath || window.location.pathname;
      if (finalPath !== '/payment') {
        deselectAllItems();
      }
      window.removeEventListener('popstate', handlePush);
      window.removeEventListener('pushstate', handlePush);
    };
  }, [deselectAllItems]);
  const [showClearModal, setShowClearModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Cleanup pending MoMo orders when user returns to cart
  usePendingOrderCleanup();

  // Auto-select item when coming from "Mua ngay" button
  useEffect(() => {
    if (!hasInitialized && cartItems && cartItems.length > 0) {
      setHasInitialized(true);
      
      // Check if we need to auto-select an item (from "Mua ngay")
      const autoSelectFlag = sessionStorage.getItem('autoSelectVariantId');
      
      if (autoSelectFlag) {
        // Select the newest cart item (last item added - highest ID)
        const newestItem = cartItems.reduce((max, item) => 
          (item.id > max.id) ? item : max
        , cartItems[0]);
        
        if (newestItem && !selectedItems.includes(newestItem.id)) {
          useCartStore.getState().toggleItemSelection(newestItem.id);
          // Clean up flag after selection
          setTimeout(() => {
            sessionStorage.removeItem('autoSelectVariantId');
          }, 100);
        } else {
          sessionStorage.removeItem('autoSelectVariantId');
        }
      }
    }
  }, [cartItems, hasInitialized, selectedItems]);

  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  // Group cart items by shop
  const itemsByShop = React.useMemo(() => {
    const grouped = {};
    cartItems.forEach(item => {
      const shopId = item.shopId || 'unknown';
      const shopName = item.shopName || 'Shop không xác định';
      if (!grouped[shopId]) {
        grouped[shopId] = {
          shopId,
          shopName,
          items: []
        };
      }
      grouped[shopId].items.push(item);
    });
    return Object.values(grouped);
  }, [cartItems]);

  // Check if all items in a shop are selected
  const isShopAllSelected = (shopItems) => {
    return shopItems.every(item => selectedItems.includes(item.id));
  };

  // Toggle select all items in a shop
  const handleToggleShopSelect = (shopItems) => {
    const allSelected = isShopAllSelected(shopItems);
    if (allSelected) {
      // Deselect all items in this shop
      shopItems.forEach(item => {
        if (selectedItems.includes(item.id)) {
          useCartStore.getState().toggleItemSelection(item.id);
        }
      });
    } else {
      // Select all items in this shop
      shopItems.forEach(item => {
        if (!selectedItems.includes(item.id)) {
          useCartStore.getState().toggleItemSelection(item.id);
        }
      });
    }
  };

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

            {/* Items List - Grouped by Shop */}
            {itemsByShop.map((shopGroup) => (
              <div key={shopGroup.shopId} className="bg-white rounded-lg shadow-md mb-4">
                {/* Shop Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isShopAllSelected(shopGroup.items)}
                    onChange={() => handleToggleShopSelect(shopGroup.items)}
                    className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 cursor-pointer"
                    aria-label={`Chọn tất cả sản phẩm của ${shopGroup.shopName}`}
                  />
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 flex-1">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {shopGroup.shopName}
                  </h3>
                </div>
                
                {/* Shop Items */}
                <div className="divide-y divide-gray-100">
                  {shopGroup.items.map((item) => (
                    <CartItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
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
