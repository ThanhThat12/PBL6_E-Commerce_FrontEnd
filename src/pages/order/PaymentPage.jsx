import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../utils/constants';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import PaymentMethodSelector from '../../components/order/PaymentMethodSelector';
import ShippingAddressForm from '../../components/order/ShippingAddressForm';
import VoucherSelector from '../../components/order/VoucherSelector';
import ShippingFeeCalculator from '../../components/order/ShippingFeeCalculator';
import CartItemCard from '../../components/cart/CartItemCard';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { removeItem } from '../../utils/storage';

/**
 * PaymentPage Component
 * Complete payment page with shipping address, payment method selection, and order summary
 */
const PaymentPage = () => {
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, fetchCart } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingAddress, setShippingAddress] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [weightGrams] = useState(500);
  const [shippingFee, setShippingFee] = useState(0);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [checkoutItems, setCheckoutItems] = useState([]);

  // Load selected items from sessionStorage
  useEffect(() => {
    const storedItems = sessionStorage.getItem('checkoutItems');
    console.log('📦 Stored checkout items:', storedItems);
    
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        console.log('✅ Parsed checkout items:', items);
        setCheckoutItems(items);
      } catch (error) {
        console.error('❌ Error parsing checkout items:', error);
        toast.error('Lỗi tải thông tin đơn hàng');
        navigate('/cart');
      }
    } else {
      // If no selected items, redirect to cart
      console.warn('⚠️ No checkout items found in sessionStorage');
      toast.error('Vui lòng chọn sản phẩm để thanh toán');
      navigate('/cart');
    }
  }, [navigate]);

  // Fetch cart on mount
  useEffect(() => {
    console.log('📱 Fetching cart...');
    if (fetchCart) {
      fetchCart().then((result) => {
        console.log('✅ Cart fetch result:', result);
      }).catch((error) => {
        console.error('❌ Cart fetch error:', error);
      });
    }
  }, [fetchCart]);

  // Redirect if no checkout items
  useEffect(() => {
    if (!cartLoading && checkoutItems.length === 0) {
      const storedItems = sessionStorage.getItem('checkoutItems');
      if (!storedItems) {
        toast.error('Vui lòng chọn sản phẩm để thanh toán');
        navigate('/cart');
      }
    }
  }, [checkoutItems, cartLoading, navigate]);

  // Handle shipping address change
  const handleAddressChange = (addressData) => {
    console.log('📬 Address changed:', addressData);
    setShippingAddress(addressData);
  };

  // Helper function to refresh cart and navigate
  const refreshCartAndNavigate = async (path) => {
    try {
      console.log('🔄 Refreshing cart before navigation...');
      await fetchCart();
      console.log('✅ Cart refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing cart:', error);
      // Vẫn navigate ngay cả khi có lỗi
    }
    navigate(path);
  };

  // Handle shipping fee calculated
  const handleShippingFeeCalculated = (fee, info) => {
    console.log('💰 Shipping fee calculated:', fee, info);
    setShippingFee(fee);
  };

  // Handle voucher apply
  const handleVoucherApply = (voucher) => {
    console.log('🎫 Voucher applied:', voucher);
    setAppliedVoucher(voucher);
    
    if (voucher) {
      // Nếu là voucher miễn phí ship
      if (voucher.type === 'SHIPPING') {
        setVoucherDiscount(Math.min(voucher.discount, shippingFee));
      } else {
        setVoucherDiscount(voucher.discount);
      }
    } else {
      setVoucherDiscount(0);
    }
  };

  // Calculate totals - sử dụng useMemo để tự động tính lại khi checkoutItems thay đổi
  const { subtotal, total, finalTotal } = useMemo(() => {
    console.log('🧮 Calculating totals with checkoutItems:', checkoutItems);
    console.log('🧮 Current shippingFee:', shippingFee);
    console.log('🧮 Current voucherDiscount:', voucherDiscount);
    
    if (!checkoutItems || checkoutItems.length === 0) {
      console.log('⚠️ No checkout items, returning 0');
      return { subtotal: 0, shipping: shippingFee, total: shippingFee, finalTotal: shippingFee - voucherDiscount };
    }
    
    const subtotal = checkoutItems.reduce((sum, item) => {
      // Kiểm tra cả unitPrice và price
      const price = parseFloat(item.unitPrice || item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      const itemTotal = price * quantity;
      
      console.log(`  Item: ${item.productName || item.name}, price: ${price}, qty: ${quantity}, total: ${itemTotal}`);
      
      return sum + itemTotal;
    }, 0);
    
    const total = subtotal + shippingFee;
    const finalTotal = total - voucherDiscount;
    
    console.log(`✅ Subtotal: ${subtotal}, Shipping: ${shippingFee}, Voucher: ${voucherDiscount}, Total: ${total}, Final: ${finalTotal}`);
    
    return { subtotal, shipping: shippingFee, total, finalTotal };
  }, [checkoutItems, shippingFee, voucherDiscount]);

  // Prepare order items from selected checkout items
  const prepareOrderItems = () => {
    if (!checkoutItems || checkoutItems.length === 0) return [];
    
    return checkoutItems.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity
    }));
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    console.log('🔍 Validating shipping address:', shippingAddress);
    
    // Validation
    if (!shippingAddress) {
      toast.error('Vui lòng chọn hoặc nhập địa chỉ giao hàng');
      return;
    }

    console.log('✓ Checking fields:', {
      toName: shippingAddress.toName,
      toPhone: shippingAddress.toPhone,
      toAddress: shippingAddress.toAddress
    });

    if (!shippingAddress.toName || !shippingAddress.toPhone || !shippingAddress.toAddress) {
      console.log('❌ Missing fields!');
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    console.log('✅ Validation passed!');
    setIsProcessing(true);

    try {
      // Prepare order items
      const items = prepareOrderItems();
      
      console.log('📦 Prepared items:', items);
      
      // Convert IDs to numbers if needed
      const toDistrictId = shippingAddress.toDistrictId ? 
        shippingAddress.toDistrictId.toString() : '';
      const toWardCode = shippingAddress.toWardCode ? 
        shippingAddress.toWardCode.toString() : '';
      
      const orderData = {
        items: items,
        receiverName: shippingAddress.toName,
        receiverPhone: shippingAddress.toPhone,
        receiverAddress: shippingAddress.toAddress,
        toDistrictId: toDistrictId,
        toWardCode: toWardCode,
        province: shippingAddress.province || '',
        district: shippingAddress.district || '',
        ward: shippingAddress.ward || '',
        weightGrams: weightGrams,
        codAmount: paymentMethod === 'COD' ? Math.round(finalTotal) : 0,
        shippingFee: shippingFee,
        voucherCode: appliedVoucher?.code || null,
        voucherDiscount: voucherDiscount,
        notes: orderNotes,
        method: paymentMethod // Thêm trường method để backend nhận được phương thức thanh toán
      };

      console.log('📦 Sending order data:', JSON.stringify(orderData, null, 2));

      // Call API to create order using constants
      // API sẽ tự lấy userId từ JWT token
      const response = await api.post(API_ENDPOINTS.ORDER.CREATE, orderData);
      // NOTE: api interceptor returns ResponseDTO { status, error, message, data }
      console.log('✅ Order response DTO:', response);
      console.log('🔍 Response structure:', {
        status: response.status,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        orderId: response.data?.orderId,
        fullData: response.data
      });
      
      const isOk = response && (response.status === 200 || response.status === 201) && !response.error;
      if (isOk) {
        // Lấy orderId từ response.data
        const orderId = response.data?.orderId;
        
        console.log('🎯 Order created successfully!');
        console.log('🔍 OrderId value:', orderId);
        console.log('🔍 OrderId type:', typeof orderId);
        console.log('💳 Current payment method:', paymentMethod);
        
        // Kiểm tra orderId hợp lệ
        if (!orderId) {
          console.error('❌ OrderId is null or undefined!');
          toast.error('Lỗi: Không nhận được mã đơn hàng từ server');
          await refreshCartAndNavigate('/orders');
          return;
        }
        
        if (isNaN(Number(orderId))) {
          console.error('❌ OrderId is not a valid number:', orderId);
          toast.error('Lỗi: Mã đơn hàng không hợp lệ');
          await refreshCartAndNavigate('/orders');
          return;
        }
        
        // Clear checkout items from sessionStorage
        sessionStorage.removeItem('checkoutItems');
        
        // Nếu chọn MoMo, tạo link thanh toán và chuyển hướng
        if (paymentMethod === 'MOMO') {
          console.log('💳 Processing MoMo payment...');
          
          // Convert orderId to number
          const momoOrderId = Number(orderId);
          console.log('🔢 Converted orderId to number:', momoOrderId);
          console.log('🔢 Is valid number?', !isNaN(momoOrderId));
          console.log('🔢 Original orderId:', orderId);
          console.log('🔢 Original orderId type:', typeof orderId);

          const momoPayload = {
            orderId: momoOrderId,
            amount: Math.round(finalTotal),
            orderInfo: `Thanh toán đơn hàng #${momoOrderId}`,
            returnUrl: `${window.location.origin}/payment-result`,
            notifyUrl: `${window.location.origin}/api/payment/momo/callback`
          };

          console.log('📤 MoMo payload BEFORE stringify:', momoPayload);
          console.log('🔍 Payload.orderId:', momoPayload.orderId);
          console.log('🔍 Payload.orderId type:', typeof momoPayload.orderId);
          console.log('🔍 Payload.orderId === momoOrderId?', momoPayload.orderId === momoOrderId);
          console.log('📤 MoMo payload JSON:', JSON.stringify(momoPayload, null, 2));

          // Verify payload one more time before sending
          console.log('🚨 FINAL CHECK BEFORE API CALL:');
          console.log('  - orderId:', momoPayload.orderId, 'type:', typeof momoPayload.orderId);
          console.log('  - amount:', momoPayload.amount, 'type:', typeof momoPayload.amount);
          console.log('  - orderInfo:', momoPayload.orderInfo);
          
          try {
            console.log('📡 Calling API: payment/momo/create');
            console.log('📡 With payload:', momoPayload);
            
            const momoResponse = await api.post('payment/momo/create', momoPayload);
            
            console.log('✅ MoMo payment response:', momoResponse);
            console.log('✅ MoMo response data:', momoResponse.data);
            console.log('✅ MoMo response status:', momoResponse.status);
            
            if (momoResponse.data?.payUrl) {
              toast.success('Đang chuyển đến trang thanh toán MoMo...');
              // Clear persisted shipping address after order is created
              removeItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS);
              
              // LƯU Ý: KHÔNG xóa cart ở đây cho MoMo
              // Cart sẽ được xóa sau khi thanh toán MoMo thành công (trong PaymentResultPage)
              console.log('⚠️ Cart will be cleared after MoMo payment success');
              
              // Lưu orderId vào sessionStorage để xóa nếu thanh toán thất bại
              sessionStorage.setItem('pendingMomoOrderId', orderId);
              console.log('💾 Saved pending MoMo order ID:', orderId);
              
              // Chuyển hướng đến trang thanh toán MoMo
              window.location.href = momoResponse.data.payUrl;
              return;
            } else {
              console.error('❌ No payUrl in MoMo response');
              toast.error('Không thể tạo link thanh toán MoMo');
              await refreshCartAndNavigate('/orders');
            }
          } catch (momoError) {
            console.error('❌ MoMo payment error:', momoError);
            console.error('❌ MoMo error response:', momoError.response);
            console.error('❌ MoMo error data:', momoError.response?.data);
            console.error('❌ MoMo error message:', momoError.message);
            console.error('❌ MoMo error status:', momoError.response?.status);
            
            // Hiển thị thông báo lỗi chi tiết
            let errorMsg = 'Lỗi tạo thanh toán MoMo. Đơn hàng đã được tạo, bạn có thể thanh toán sau.';
            if (momoError.response?.data?.message) {
              errorMsg = `Lỗi MoMo: ${momoError.response.data.message}`;
            } else if (momoError.message) {
              errorMsg = `Lỗi MoMo: ${momoError.message}`;
            }
            
            toast.error(errorMsg);
            await refreshCartAndNavigate('/orders');
          }
        } else if (paymentMethod === 'SPORTYPAY') {
          try {
            // Gọi API trừ tiền trong ví
            console.log('Gửi lên /wallet/withdraw:', {
              amount: Math.round(finalTotal),
              description: `Thanh toán đơn hàng #${orderId} qua SportyPay`
            });
            const walletResponse = await api.post('/wallet/withdraw', {
              amount: Math.round(finalTotal),
              description: `Thanh toán đơn hàng #${orderId} qua SportyPay`
            });

            console.log('💸 walletResponse:', walletResponse);
            // Đúng response của backend là status: 200, message: 'Withdrawal successful'
            // => Cần kiểm tra status === 200 (số), không phải 'SUCCESS' (string)
            if (walletResponse.status === 200) {
              toast.success('Thanh toán bằng ví SportyPay thành công!');
              
              // Update order status to CONFIRMED after successful payment
              try {
                await api.post(`/orders/${orderId}/update-after-payment`, {});
                console.log('✅ Order updated after wallet payment');
              } catch (updateError) {
                console.error('⚠️ Error updating order after payment:', updateError);
                // Vẫn tiếp tục mặc dù có lỗi update
              }
              
              // KHÔNG xóa cart ở đây - backend sẽ tự động xóa các sản phẩm đã thanh toán
              // await clearCart();
              console.log('✅ Cart will be cleared by backend for purchased items only');
              
              removeItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS);
              await refreshCartAndNavigate('/orders');
            } else {
              toast.error(walletResponse.message || 'Thanh toán bằng ví thất bại!');
              await refreshCartAndNavigate('/orders');
            }
          } catch (walletError) {
            console.error('❌ SportyPay error:', walletError);
            toast.error('Lỗi thanh toán bằng ví SportyPay');
            await refreshCartAndNavigate('/orders');
          }
          return;
        } else {
          // COD - KHÔNG xóa cart ở đây, backend sẽ tự động xóa các sản phẩm đã thanh toán
          // await clearCart();
          console.log('✅ Cart will be cleared by backend for purchased items only (COD)');
          
          // COD - chuyển đến trang đơn hàng
          toast.success(response.message || 'Đặt hàng thành công!');
          // Clear persisted shipping address
          removeItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS);
          await refreshCartAndNavigate('/orders');
        }
      } else {
        // Show server message if present
        toast.error(response?.message || 'Lỗi đặt hàng');
      }
      
    } catch (error) {
      console.error('❌ Error placing order:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      
      // Hiển thị chi tiết lỗi
      let errorMessage = 'Lỗi đặt hàng. Vui lòng thử lại!';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data) {
        // Nếu có nhiều lỗi validation
        if (typeof error.response.data === 'object') {
          const errors = Object.values(error.response.data).join(', ');
          errorMessage = errors || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('❌ Final error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="lg" text="Đang tải thông tin đơn hàng..." />
        </div>
        <Footer />
      </div>
    );
  }

  // Debug: Check cart data
  console.log('🛒 Cart Items:', cartItems);
  console.log('📊 Subtotal:', subtotal);
  console.log('� Shipping Fee:', shippingFee);
  console.log('🎫 Voucher Discount:', voucherDiscount);
  console.log('�💰 Total:', total);
  console.log('💳 Final Total:', finalTotal);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
            <p className="text-gray-600 mt-2">Hoàn tất thông tin để đặt hàng</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Shipping Address Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Địa chỉ giao hàng
                </h2>
                <ShippingAddressForm 
                  onAddressChange={handleAddressChange}
                  initialAddress={shippingAddress}
                />
              </div>

              {/* Order Items Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Chi tiết đơn hàng
                </h2>
                
                {!checkoutItems || checkoutItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Không có sản phẩm được chọn</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {checkoutItems.map((item) => {
                      // Đảm bảo price, unitPrice, quantity là số
                      const safeItem = {
                        ...item,
                        price: Number(item.price || item.unitPrice || 0),
                        unitPrice: Number(item.unitPrice || item.price || 0),
                        quantity: Number(item.quantity || 1),
                        subTotal: Number(item.quantity || 1) * Number(item.price || item.unitPrice || 0)
                      };
                      return <CartItemCard key={item.id || item.productId} item={safeItem} />;
                    })}
                  </div>
                )}
              </div>

              {/* Voucher Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Mã giảm giá
                </h2>
                <VoucherSelector 
                  onVoucherApply={handleVoucherApply}
                  subtotal={subtotal}
                />
              </div>

              {/* Payment Method Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Phương thức thanh toán
                </h2>
                <PaymentMethodSelector 
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                />
              </div>

              {/* Order Notes Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Ghi chú đơn hàng (tùy chọn)
                </h2>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Nhập ghi chú cho cửa hàng hoặc shipper..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Tóm tắt đơn hàng
                  </h2>

                  {/* Shipping Address Summary */}
                  {shippingAddress && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        📍 Địa chỉ giao hàng:
                      </h3>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p className="font-medium text-gray-900">{shippingAddress.toName}</p>
                        <p>{shippingAddress.toPhone}</p>
                        <p>{shippingAddress.toAddress}</p>
                      </div>
                    </div>
                  )}

                  {/* Summary Items */}
                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-medium text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(subtotal)}
                      </span>
                    </div>

                    {/* Shipping Fee with Calculator */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-medium text-gray-900">
                          {shippingFee === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(shippingFee)}
                        </span>
                      </div>
                      <ShippingFeeCalculator
                        shippingAddress={shippingAddress}
                        weightGrams={weightGrams}
                        onFeeCalculated={handleShippingFeeCalculated}
                      />
                    </div>

                    {/* Voucher Discount */}
                    {voucherDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Giảm giá:</span>
                        <span className="font-medium text-green-600">
                          - {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(voucherDiscount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between mb-6">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(finalTotal)}
                    </span>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    loading={isProcessing}
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="mb-3"
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                  </Button>

                  {/* Continue Shopping Button */}
                  <Button
                    onClick={() => navigate('/products')}
                    variant="outline"
                    size="lg"
                    fullWidth
                  >
                    Tiếp tục mua sắm
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-50 rounded-lg p-4 text-sm">
                  <p className="text-blue-900 font-medium mb-2">💡 Lưu ý:</p>
                  <ul className="text-blue-800 space-y-1 text-xs">
                    <li>• Kiểm tra kỹ địa chỉ giao hàng</li>
                    <li>• Phí vận chuyển có thể thay đổi tùy khu vực</li>
                    <li>• Lưu giữ mã đơn hàng để theo dõi</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentPage;
