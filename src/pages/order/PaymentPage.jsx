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

  // Group checkout items by shop
  const itemsByShop = useMemo(() => {
    const grouped = {};
    checkoutItems.forEach(item => {
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
  }, [checkoutItems]);

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

  // Handle place order - tách đơn theo shop
  const handlePlaceOrder = async () => {
    console.log('🔍 Starting order placement...');
    
    // Validation
    if (!shippingAddress) {
      toast.error('Vui lòng chọn hoặc nhập địa chỉ giao hàng');
      return;
    }
    
    if (!shippingAddress.toName || !shippingAddress.toPhone || !shippingAddress.toAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    setIsProcessing(true);

    try {
      // Nhóm sản phẩm theo shop
      const grouped = {};
      checkoutItems.forEach(item => {
        const shopId = item.shopId || 'unknown';
        if (!grouped[shopId]) grouped[shopId] = [];
        grouped[shopId].push(item);
      });
      
      const shopGroups = Object.entries(grouped);
      console.log(`📦 Creating ${shopGroups.length} orders for ${shopGroups.length} shops`);
      
      // Tính tổng tiền toàn bộ đơn hàng
      const grandTotal = finalTotal;
      
      // Lưu danh sách order đã tạo
      const createdOrders = [];
      let hasError = false;
      
      // Tạo order cho từng shop
      for (let i = 0; i < shopGroups.length; i++) {
        const [shopId, items] = shopGroups[i];
        const shopName = items[0]?.shopName || `Shop ${shopId}`;
        
        console.log(`\n📍 Creating order ${i + 1}/${shopGroups.length} for ${shopName}`);
        
        // Tính subtotal cho shop này
        const shopSubtotal = items.reduce((sum, item) => {
          const price = parseFloat(item.unitPrice || item.price) || 0;
          const quantity = parseInt(item.quantity) || 0;
          return sum + price * quantity;
        }, 0);
        
        // Phân bổ shipping fee và voucher theo tỷ lệ subtotal
        const shopShippingFee = subtotal > 0 ? Math.round((shopSubtotal / subtotal) * shippingFee) : 0;
        const shopVoucherDiscount = subtotal > 0 ? Math.round((shopSubtotal / subtotal) * voucherDiscount) : 0;
        const shopTotal = shopSubtotal + shopShippingFee - shopVoucherDiscount;
        
        console.log(`💰 Shop ${shopName}: subtotal=${shopSubtotal}, shipping=${shopShippingFee}, voucher=${shopVoucherDiscount}, total=${shopTotal}`);
        
        // Chuẩn bị items cho order
        const orderItems = items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }));
        
        // Chuẩn bị order data
        const orderData = {
          items: orderItems,
          receiverName: shippingAddress.toName,
          receiverPhone: shippingAddress.toPhone,
          receiverAddress: shippingAddress.toAddress,
          toDistrictId: shippingAddress.toDistrictId ? shippingAddress.toDistrictId.toString() : '',
          toWardCode: shippingAddress.toWardCode ? shippingAddress.toWardCode.toString() : '',
          province: shippingAddress.province || '',
          district: shippingAddress.district || '',
          ward: shippingAddress.ward || '',
          weightGrams: weightGrams,
          codAmount: paymentMethod === 'COD' ? Math.round(shopTotal) : 0,
          shippingFee: shopShippingFee,
          voucherCode: appliedVoucher?.code || null,
          voucherDiscount: shopVoucherDiscount,
          notes: orderNotes,
          method: paymentMethod
        };

        console.log(`📤 Sending order data for ${shopName}:`, orderData);

        try {
          const response = await api.post(API_ENDPOINTS.ORDER.CREATE, orderData);
          
          console.log(`✅ Response for ${shopName}:`, response);
          
          const isOk = response && (response.status === 200 || response.status === 201) && !response.error;
          
          if (isOk && response.data?.orderId) {
            const orderId = response.data.orderId;
            console.log(`✅ Order created successfully for ${shopName}: Order ID = ${orderId}`);
            
            createdOrders.push({
              orderId,
              shopId,
              shopName,
              total: shopTotal,
              items: orderItems
            });
          } else {
            console.error(`❌ Failed to create order for ${shopName}:`, response);
            hasError = true;
            toast.error(`Lỗi đặt hàng cho ${shopName}: ${response?.message || 'Không xác định'}`);
          }
        } catch (error) {
          console.error(`❌ Error creating order for ${shopName}:`, error);
          hasError = true;
          
          let errorMsg = error?.response?.data?.message || error?.message || 'Không xác định';
          toast.error(`Lỗi đặt hàng cho ${shopName}: ${errorMsg}`);
        }
      }

      console.log(`\n📊 Summary: Created ${createdOrders.length}/${shopGroups.length} orders`);
      console.log('Created orders:', createdOrders);

      // Nếu có lỗi và không tạo được order nào
      if (createdOrders.length === 0) {
        toast.error('Không thể tạo đơn hàng. Vui lòng thử lại!');
        setIsProcessing(false);
        return;
      }

      // Clear checkout items và shipping address
      sessionStorage.removeItem('checkoutItems');
      removeItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS);

      // Xử lý theo phương thức thanh toán
      if (paymentMethod === 'MOMO') {
        console.log('💳 Processing MoMo payment for multiple orders...');
        
        // Lấy order đầu tiên để tạo payment (hoặc có thể tạo 1 payment cho tất cả)
        const firstOrder = createdOrders[0];
        const momoOrderId = Number(firstOrder.orderId);
        
        // Tính tổng tiền của tất cả đơn hàng đã tạo thành công
        const totalAmount = createdOrders.reduce((sum, order) => sum + order.total, 0);
        
        console.log(`💰 Total amount for MoMo payment: ${totalAmount}`);
        
        const momoPayload = {
          orderId: momoOrderId,
          amount: Math.round(totalAmount),
          orderInfo: `Thanh toán ${createdOrders.length} đơn hàng`,
          returnUrl: `${window.location.origin}/payment-result`,
          notifyUrl: `${window.location.origin}/api/payment/momo/callback`
        };

        console.log('📤 MoMo payload:', momoPayload);

        try {
          const momoResponse = await api.post('payment/momo/create', momoPayload);
          
          if (momoResponse.data?.payUrl) {
            toast.success('Đang chuyển đến trang thanh toán MoMo...');
            
            // Lưu danh sách orderIds để xử lý sau
            sessionStorage.setItem('pendingMomoOrderIds', JSON.stringify(createdOrders.map(o => o.orderId)));
            console.log('💾 Saved pending MoMo order IDs:', createdOrders.map(o => o.orderId));
            
            // Chuyển hướng đến trang thanh toán MoMo
            window.location.href = momoResponse.data.payUrl;
            return;
          } else {
            console.error('❌ No payUrl in MoMo response');
            toast.error('Không thể tạo link thanh toán MoMo. Đơn hàng đã được tạo, bạn có thể thanh toán sau.');
            await refreshCartAndNavigate('/orders');
          }
        } catch (momoError) {
          console.error('❌ MoMo payment error:', momoError);
          toast.error('Lỗi tạo thanh toán MoMo. Đơn hàng đã được tạo, bạn có thể thanh toán sau.');
          await refreshCartAndNavigate('/orders');
        }
      } else if (paymentMethod === 'SPORTYPAY') {
        console.log('💳 Processing SportyPay payment for multiple orders...');
        
        // Tính tổng tiền của tất cả đơn hàng
        const totalAmount = createdOrders.reduce((sum, order) => sum + order.total, 0);
        
        try {
          const walletResponse = await api.post('/wallet/withdraw', {
            amount: Math.round(totalAmount),
            description: `Thanh toán ${createdOrders.length} đơn hàng qua SportyPay`
          });

          console.log('💸 Wallet response:', walletResponse);

          if (walletResponse.status === 200) {
            toast.success('Thanh toán bằng ví SportyPay thành công!');
            
            // Update tất cả order status sau khi thanh toán thành công
            for (const order of createdOrders) {
              try {
                await api.post(`/orders/${order.orderId}/update-after-payment`, {});
                console.log(`✅ Order ${order.orderId} updated after wallet payment`);
              } catch (updateError) {
                console.error(`⚠️ Error updating order ${order.orderId}:`, updateError);
              }
            }
            
            console.log('✅ Cart will be cleared by backend for purchased items');
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
      } else {
        // COD - Đơn hàng đã được tạo, chuyển đến trang đơn hàng
        console.log('✅ COD orders created successfully');
        
        if (hasError) {
          toast.warning(`Đã tạo ${createdOrders.length}/${shopGroups.length} đơn hàng thành công. Một số đơn hàng không thể tạo.`);
        } else {
          toast.success(`Đặt hàng thành công ${createdOrders.length} đơn hàng!`);
        }
        
        console.log('✅ Cart will be cleared by backend for purchased items (COD)');
        await refreshCartAndNavigate('/orders');
      }
      
    } catch (error) {
      console.error('❌ Error placing orders:', error);
      toast.error('Lỗi đặt hàng. Vui lòng thử lại!');
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

              {/* Products by Shop */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Sản phẩm</h2>
                </div>
                
                {!checkoutItems || checkoutItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-lg font-medium">Không có sản phẩm được chọn</p>
                  </div>
                ) : (
                  itemsByShop.map((shopGroup, index) => (
                    <div key={shopGroup.shopId} className={index > 0 ? 'border-t-4 border-gray-100' : ''}>
                      {/* Shop Header */}
                      <div className="px-6 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-sm">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-900 text-base">{shopGroup.shopName}</span>
                        <button className="ml-auto flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Chat ngay
                        </button>
                      </div>

                      {/* Table Header */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                        <div className="col-span-6">Sản phẩm</div>
                        <div className="col-span-2 text-center">Đơn giá</div>
                        <div className="col-span-2 text-center">Số lượng</div>
                        <div className="col-span-2 text-right">Thành tiền</div>
                      </div>

                      {/* Shop Items */}
                      <div className="divide-y divide-gray-100">
                        {shopGroup.items.map((item) => {
                          const safeItem = {
                            ...item,
                            price: Number(item.price || item.unitPrice || 0),
                            unitPrice: Number(item.unitPrice || item.price || 0),
                            quantity: Number(item.quantity || 1),
                            subTotal: Number(item.quantity || 1) * Number(item.price || item.unitPrice || 0)
                          };
                          return (
                            <div key={item.id || item.productId} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                              <div className="grid grid-cols-12 gap-4 items-center">
                                {/* Product Info - Col 6 */}
                                <div className="col-span-12 md:col-span-6 flex gap-4">
                                  <div className="relative flex-shrink-0">
                                    <img 
                                      src={safeItem.productImage || '/placeholder.png'} 
                                      alt={safeItem.productName}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1.5">{safeItem.productName}</h3>
                                    {(safeItem.variantAttributes && safeItem.variantAttributes.length > 0) || safeItem.sku ? (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {safeItem.variantAttributes && safeItem.variantAttributes.length > 0 ? (
                                          safeItem.variantAttributes.map((attr, idx) => (
                                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                              {attr.name}
                                            </span>
                                          ))
                                        ) : (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                            {safeItem.sku}
                                          </span>
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>

                                {/* Price - Col 2 */}
                                <div className="col-span-4 md:col-span-2 text-left md:text-center">
                                  <div className="text-sm md:text-base font-medium text-gray-900">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeItem.unitPrice)}
                                  </div>
                                </div>

                                {/* Quantity - Col 2 */}
                                <div className="col-span-4 md:col-span-2 text-center">
                                  <span className="text-sm md:text-base text-gray-700">x{safeItem.quantity}</span>
                                </div>

                                {/* Subtotal - Col 2 */}
                                <div className="col-span-4 md:col-span-2 text-right">
                                  <div className="text-sm md:text-base font-semibold text-red-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeItem.subTotal)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Shop Summary */}
                      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          {/* Left: Message */}
                          <div className="flex items-center gap-3 flex-1">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Lời nhắn:</label>
                            <input 
                              type="text" 
                              placeholder="Lưu ý cho Người bán..." 
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          
                          {/* Right: Shipping Info */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Phương thức vận chuyển:</span>
                              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium text-xs">
                                🚚 Nhanh
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Phí vận chuyển:</span>
                              <span className="font-semibold text-gray-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                  shippingFee / itemsByShop.length
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
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
