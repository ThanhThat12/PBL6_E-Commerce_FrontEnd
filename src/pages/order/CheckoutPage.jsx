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
  const { createOrder, loading: orderLoading } = useOrder();
  
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
        toName: shippingAddress.toName,
        toPhone: shippingAddress.toPhone,
        toDistrictId: shippingAddress.toDistrictId,
        toWardCode: shippingAddress.toWardCode,
        toAddress: shippingAddress.toAddress,
        weightGrams: weightGrams,
        codAmount: paymentMethod === 'COD' ? calculateTotal() : 0,
        notes: orderNotes,
        method: paymentMethod // Thêm trường method để backend nhận được phương thức thanh toán
      };

      const result = await createOrder(orderData);
      
      if (result) {
        // Clear checkout items from sessionStorage
        sessionStorage.removeItem('checkoutItems');
        
        // Clear cart and navigate to success page
        navigate(`/orders/${result.id}`, {
          state: { fromCheckout: true }
        });
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
