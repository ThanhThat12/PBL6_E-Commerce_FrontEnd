import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';

/**
 * PaymentResultPage Component
 * Hiển thị kết quả thanh toán từ MoMo
 */
const PaymentResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Lấy các params từ MoMo callback
        const orderId = searchParams.get('orderId');
        const resultCode = searchParams.get('resultCode');
        const message = searchParams.get('message');
        const requestId = searchParams.get('requestId');
        const amount = searchParams.get('amount');

        console.log('💳 Payment callback params:', {
          orderId,
          resultCode,
          message,
          requestId,
          amount
        });

        // Nếu không có params từ MoMo, kiểm tra sessionStorage có pending order không
        if (!orderId || !resultCode) {
          const pendingOrderId = sessionStorage.getItem('pendingMomoOrderId');
          
          if (pendingOrderId) {
            console.log('⚠️ No MoMo callback params, but found pending order:', pendingOrderId);
            console.log('🗑️ Deleting pending order...');
            
            try {
              await api.delete(`/api/orders/${pendingOrderId}`);
              console.log('✅ Pending order deleted successfully');
              sessionStorage.removeItem('pendingMomoOrderId');
              toast.warning('Đơn hàng chưa thanh toán đã bị hủy');
            } catch (deleteError) {
              console.error('❌ Error deleting pending order:', deleteError);
              sessionStorage.removeItem('pendingMomoOrderId');
            }
          }
          
          toast.error('Thông tin thanh toán không hợp lệ');
          setPaymentStatus('error');
          setLoading(false);
          return;
        }

        // Verify payment với backend
        const response = await api.post('/api/payment/momo/verify', {
          orderId,
          resultCode,
          requestId,
          amount,
          message
        });

        console.log('✅ Payment verification response:', response.data);

        if (resultCode === '0') {
          // Thanh toán thành công
          setPaymentStatus('success');
          setOrderInfo({
            orderId,
            amount,
            message: 'Thanh toán thành công'
          });
          
          // Xóa cart sau khi thanh toán MoMo thành công
          console.log('🗑️ Clearing cart after successful MoMo payment');
          try {
            await clearCart();
            console.log('✅ Cart cleared successfully');
          } catch (clearError) {
            console.error('❌ Error clearing cart:', clearError);
            // Không hiển thị lỗi cho user vì thanh toán đã thành công
          }
          
          // Xóa pending order ID khỏi sessionStorage
          sessionStorage.removeItem('pendingMomoOrderId');
          console.log('✅ Removed pending MoMo order ID from session');
          
          toast.success('Thanh toán thành công!');
        } else {
          // Thanh toán thất bại - XÓA ORDER
          setPaymentStatus('failed');
          setOrderInfo({
            orderId,
            amount,
            message: message || 'Thanh toán thất bại'
          });
          
          console.log('❌ Payment failed, deleting order:', orderId);
          
          // Xóa order đã tạo
          try {
            await api.delete(`/api/orders/${orderId}`);
            console.log('✅ Order deleted successfully');
            toast.warning('Đơn hàng đã bị hủy do thanh toán thất bại');
          } catch (deleteError) {
            console.error('❌ Error deleting order:', deleteError);
            // Vẫn hiển thị thông báo thất bại cho user
          }
          
          // Xóa pending order ID khỏi sessionStorage
          sessionStorage.removeItem('pendingMomoOrderId');
          
          toast.error('Thanh toán thất bại: ' + message);
        }

      } catch (error) {
        console.error('❌ Error verifying payment:', error);
        toast.error('Lỗi xác thực thanh toán');
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, clearCart]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="lg" text="Đang xác thực thanh toán..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Success Status */}
            {paymentStatus === 'success' && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Thanh toán thành công!
                </h1>
                
                <p className="text-gray-600 mb-6">
                  Đơn hàng của bạn đã được thanh toán thành công qua MoMo
                </p>

                {orderInfo && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã đơn hàng:</span>
                        <span className="font-medium text-gray-900">#{orderInfo.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số tiền:</span>
                        <span className="font-medium text-gray-900">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(orderInfo.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className="font-medium text-green-600">Đã thanh toán</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/orders')}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    Xem đơn hàng
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/products')}
                    variant="outline"
                    size="lg"
                    fullWidth
                  >
                    Tiếp tục mua sắm
                  </Button>
                </div>
              </div>
            )}

            {/* Failed Status */}
            {paymentStatus === 'failed' && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Thanh toán thất bại
                </h1>
                
                <p className="text-gray-600 mb-6">
                  {orderInfo?.message || 'Đã có lỗi xảy ra trong quá trình thanh toán'}
                </p>

                {orderInfo && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã đơn hàng:</span>
                        <span className="font-medium text-gray-900">#{orderInfo.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className="font-medium text-red-600">Chưa thanh toán</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/orders')}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    Xem đơn hàng và thử lại
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/cart')}
                    variant="outline"
                    size="lg"
                    fullWidth
                  >
                    Quay lại giỏ hàng
                  </Button>
                </div>
              </div>
            )}

            {/* Error Status */}
            {paymentStatus === 'error' && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Lỗi xác thực thanh toán
                </h1>
                
                <p className="text-gray-600 mb-6">
                  Không thể xác thực thông tin thanh toán. Vui lòng liên hệ hỗ trợ.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/orders')}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    Xem đơn hàng
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    size="lg"
                    fullWidth
                  >
                    Về trang chủ
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentResultPage;
