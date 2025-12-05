import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import ShippingAddressForm from '../../components/order/ShippingAddressForm';
import OrderSummaryCard from '../../components/order/OrderSummaryCard';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { toast } from 'react-hot-toast';

/**
 * CheckoutPage Component
 * Page for order checkout
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading: cartLoading, fetchCart } = useCart();
  const { createOrder, createMultiShopOrders, loading: orderLoading } = useOrder();
  
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderNotes, setOrderNotes] = useState('');
  const [weightGrams] = useState(500);
  const [shippingFee] = useState(0); // Default to free shipping
  const [checkoutItems, setCheckoutItems] = useState([]);

  // Load selected items from sessionStorage
  useEffect(() => {
    const storedItems = sessionStorage.getItem('checkoutItems');
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        setCheckoutItems(items);
      } catch (error) {
        console.error('Error parsing checkout items:', error);
        toast.error('Lỗi tải thông tin đơn hàng');
        navigate('/cart');
      }
    } else {
      // If no selected items, redirect to cart
      toast.error('Vui lòng chọn sản phẩm để thanh toán');
      navigate('/cart');
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch cart on mount
    if (!cart) {
      fetchCart();
    }
  }, [cart, fetchCart]);

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
  const itemsByShop = React.useMemo(() => {
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

  // Handle address change
  const handleAddressChange = (addressData) => {
    setShippingAddress(addressData);
  };

  // Prepare order items from selected checkout items
  const prepareOrderItems = () => {
    if (!checkoutItems || checkoutItems.length === 0) return [];
    
    return checkoutItems.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.unitPrice
    }));
  };

  // Check if items are from multiple shops
  const isMultiShopOrder = () => {
    if (!checkoutItems || checkoutItems.length === 0) return false;
    const shopIds = new Set(checkoutItems.map(item => item.shopId).filter(Boolean));
    return shopIds.size > 1;
  };

  // Calculate total from selected items
  const calculateTotal = () => {
    if (!checkoutItems || checkoutItems.length === 0) return 0;
    const subtotal = checkoutItems.reduce((sum, item) => sum + item.subTotal, 0);
    return subtotal + shippingFee;
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    // Validate shipping address
    if (!shippingAddress) {
      toast.error('Vui lòng chọn hoặc nhập địa chỉ giao hàng');
      return;
    }

    // Validate required fields
    if (!shippingAddress.toName || !shippingAddress.toPhone || !shippingAddress.toAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    try {
      const orderData = {
        userId: user?.id,
        items: prepareOrderItems(),
        receiverName: shippingAddress.toName,
        receiverPhone: shippingAddress.toPhone,
        receiverAddress: shippingAddress.toAddress,
        province: shippingAddress.province,
        district: shippingAddress.district,
        ward: shippingAddress.ward,
        toDistrictId: shippingAddress.toDistrictId,
        toWardCode: shippingAddress.toWardCode,
        weightGrams: weightGrams,
        shippingFee: shippingFee,
        voucherDiscount: 0,
        codAmount: paymentMethod === 'COD' ? calculateTotal() : 0,
        notes: orderNotes,
        method: paymentMethod
      };

      // Check if multi-shop order
      const multiShop = isMultiShopOrder();
      
      let result;
      if (multiShop) {
        // Call multi-shop API
        console.log('🏪 Multi-shop order detected, creating separate orders...');
        result = await createMultiShopOrders(orderData);
        
        if (result && result.orderIds && result.orderIds.length > 0) {
          // Clear checkout items from sessionStorage
          sessionStorage.removeItem('checkoutItems');
          
          // Navigate to first order detail
          toast.success(`Đã tạo ${result.orderIds.length} đơn hàng từ ${result.orderIds.length} shop khác nhau`);
          navigate('/orders', {
            state: { fromCheckout: true, multiShop: true }
          });
        }
      } else {
        // Call single order API
        console.log('🏪 Single shop order, creating one order...');
        result = await createOrder(orderData);
        
        if (result && result.id) {
          // Clear checkout items from sessionStorage
          sessionStorage.removeItem('checkoutItems');
          
          // Navigate to order detail
          navigate(`/orders/${result.id}`, {
            state: { fromCheckout: true }
          });
        }
      }
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  if (cartLoading || checkoutItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Thanh toán
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products by Shop */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Sản phẩm</h2>
              </div>
              
              {itemsByShop.map((shopGroup, index) => (
                <div key={shopGroup.shopId} className={index > 0 ? 'border-t border-gray-200' : ''}>
                  {/* Shop Header */}
                  <div className="px-6 py-3 bg-gray-50 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium text-gray-900">{shopGroup.shopName}</span>
                    <button className="ml-auto text-sm text-primary-600 hover:text-primary-700">Chat ngay</button>
                  </div>

                  {/* Shop Items */}
                  <div className="divide-y divide-gray-100">
                    {shopGroup.items.map((item) => (
                      <div key={item.id} className="px-6 py-4">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <img 
                            src={item.mainImage || item.productMainImage || item.productImage || '/placeholder.png'} 
                            alt={item.productName}
                            className="w-20 h-20 object-cover rounded border border-gray-200"
                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                          />
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.variantAttributes && item.variantAttributes.length > 0
                                ? item.variantAttributes.map(attr => attr.name).join(', ')
                                : item.sku || ''}
                            </p>
                            <div className="mt-2 flex items-center gap-4">
                              <span className="text-sm text-gray-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                              </span>
                              <span className="text-sm text-gray-500">x{item.quantity}</span>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shop Summary */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Lời nhắn:</span>
                          <input 
                            type="text" 
                            placeholder="Lưu ý cho Người bán..." 
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-64"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Phương thức vận chuyển:</span>
                          <span className="ml-2 font-medium text-gray-900">Nhanh</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Phí vận chuyển:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                              shippingFee / itemsByShop.length
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <ShippingAddressForm
              onAddressChange={handleAddressChange}
            />

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Phương thức thanh toán
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-900 font-medium">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK"
                    disabled
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-900 font-medium">
                    Chuyển khoản ngân hàng (Sắp có)
                  </span>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ghi chú đơn hàng (tùy chọn)
              </h2>
              
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {/* Shipping Address Summary */}
              {shippingAddress && (
                <div className="mb-4 p-4 bg-white rounded-lg shadow border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Địa chỉ giao hàng</h3>
                  <div className="mb-1 font-medium text-gray-800">{shippingAddress.contactName || shippingAddress.toName}</div>
                  <div className="mb-1 text-gray-700">{shippingAddress.toAddress}</div>
                  <div className="mb-1 text-gray-700">{shippingAddress.toPhone}</div>
                </div>
              )}
              <OrderSummaryCard
                items={checkoutItems.map(item => ({
                  name: item.productName,
                  variant: item.variantAttributes,
                  quantity: item.quantity,
                  price: item.unitPrice
                }))}
                shippingFee={shippingFee}
                totalAmount={calculateTotal()}
              />

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                variant="primary"
                className="w-full mt-4"
                disabled={orderLoading || !shippingAddress}
              >
                {orderLoading ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc tiến hành đặt hàng, bạn đồng ý với{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Điều khoản dịch vụ
                </a>{' '}
                của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CheckoutPage;
