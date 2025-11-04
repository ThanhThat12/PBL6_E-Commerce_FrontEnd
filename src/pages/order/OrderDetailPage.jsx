import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import OrderTimeline from '../../components/order/OrderTimeline';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

/**
 * OrderDetailPage Component
 * Display detailed information about an order
 */
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentOrder, loading, fetchOrderDetail, cancelOrder } = useOrder();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const fromCheckout = location.state?.fromCheckout;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail(parseInt(orderId));
    }
  }, [orderId, fetchOrderDetail]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(currentOrder.id);
      setShowCancelConfirm(false);
      // Refresh order detail
      await fetchOrderDetail(parseInt(orderId));
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const handleBackClick = () => {
    if (fromCheckout) {
      navigate('/');
    } else {
      navigate('/orders');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy đơn hàng</h2>
            <Button onClick={() => navigate('/orders')} className="mt-4">
              Quay lại danh sách đơn hàng
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  console.log('===[DEBUG] currentOrder:', currentOrder);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>{fromCheckout ? 'Về trang chủ' : 'Quay lại'}</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chi tiết đơn hàng #{currentOrder.id}
              </h1>
              <p className="text-gray-600 mt-2">
                Đặt hàng lúc: {formatDate(currentOrder.createdAt)}
              </p>
            </div>

            {currentOrder.status === 'PENDING' && (
              <Button
                onClick={() => setShowCancelConfirm(true)}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                Hủy đơn hàng
              </Button>
            )}
          </div>
        </div>

        {/* Success Message for new orders */}
        {fromCheckout && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">
                  Đặt hàng thành công!
                </h3>
                <p className="text-green-700 mt-1">
                  Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Timeline & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <OrderTimeline
              status={currentOrder.status}
              createdAt={currentOrder.createdAt}
              updatedAt={currentOrder.updatedAt}
            />

                        {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin giao hàng
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Người nhận:</span>
                  <span className="font-medium text-gray-900">
                    {currentOrder.receiverName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="font-medium text-gray-900">
                    {currentOrder.receiverPhone || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Địa chỉ:</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs">
                    {currentOrder.receiverAddress || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Sản phẩm đã đặt
              </h2>
              <div className="space-y-4">
                {currentOrder.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <img
                      src={item.image || '/placeholder.png'}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      {item.variantAttributes && (
                        <p className="text-sm text-gray-600 mt-1">{item.variantAttributes}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          Số lượng: {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium text-gray-900">
                    {currentOrder.method === 'COD' ? 'COD' : currentOrder.method}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="font-medium text-gray-900">
                    {currentOrder.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-300">
                <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(currentOrder.totalAmount)}
                </span>
              </div>

              {/* Support Button */}
              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={() => toast.info('Tính năng hỗ trợ đang được phát triển')}
              >
                Liên hệ hỗ trợ
              </Button>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Xác nhận hủy đơn hàng
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn hủy đơn hàng #{currentOrder.id}? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleCancelOrder}
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Xác nhận hủy
                </Button>
                <Button
                  onClick={() => setShowCancelConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OrderDetailPage;
