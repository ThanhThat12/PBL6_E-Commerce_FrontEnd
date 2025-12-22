import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { STORAGE_KEYS } from '../../utils/constants';
import { getProductById } from '../../services/productService';
import { DEFAULT_PRODUCT_IMAGE, handleImageError } from '../../utils/imageDefaults';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import PaymentMethodSelector from '../../components/order/PaymentMethodSelector';
import ShippingAddressForm from '../../components/order/ShippingAddressForm';
import VoucherSelector from '../../components/order/VoucherSelector';
// CartItemCard removed - using inline display
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { removeItem } from '../../utils/storage';
import useOrderNotification from '../../hooks/useOrderNotification';

/**
 * PaymentPage Component
 * Complete payment page with shipping address, payment method selection, and order summary
 */
const PaymentPage = () => {
  console.log('🔄 PaymentPage Render');
  const navigate = useNavigate();
  const { cartItems: _cartItems, loading: cartLoading, fetchCart } = useCart(); // eslint-disable-line no-unused-vars

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingAddress, setShippingAddress] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [weightGrams] = useState(500);
  const [ghnServices, setGhnServices] = useState({}); // Available services by shop
  const [selectedServices, setSelectedServices] = useState({}); // Selected service for each shop
  const [shopShippingFees, setShopShippingFees] = useState({}); // Shipping fees by shop
  const [_appliedVoucher, setAppliedVoucher] = useState(null); // eslint-disable-line no-unused-vars
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [detectedShopId, setDetectedShopId] = useState(null);
  const [fetchedAddressId, setFetchedAddressId] = useState(null); // Track which addressId was used for fetching
  const [walletBalance, setWalletBalance] = useState(0); // Wallet balance for SportyPay

  // Get shopId from checkoutItems (assuming all items are from the same shop)
  const shopId = useMemo(() => {
    // Use detected shopId if available
    if (detectedShopId) return detectedShopId;

    if (!checkoutItems || checkoutItems.length === 0) return null;
    // Try to get shopId from first item
    const firstItem = checkoutItems[0];

    // Priority order: direct shopId > product.shopId > shop.id > sellerId
    const id = firstItem?.shopId ||
      firstItem?.product?.shopId ||
      firstItem?.product?.shop?.id ||
      firstItem?.shop?.id ||
      firstItem?.sellerId ||
      null;

    return id;
  }, [checkoutItems, detectedShopId]);

  // Fetch shopId from product API if not available in cart
  const fetchShopIdFromProduct = async (productId) => {
    try {
      const response = await getProductById(productId);
      const shopId = response?.data?.shopId || response?.shopId;
      if (shopId) {
        setDetectedShopId(shopId);
      }
    } catch {
      // Silently handle error
    }
  };
  // Removed stompClient state, handled by hook

  // WebSocket order notification using custom hook
  useOrderNotification(
    JSON.parse(localStorage.getItem('user') || '{}').id,
    (notification) => {
      if (notification.paymentStatus === 'SUCCESS') {
        toast.success(`✅ ${notification.message || 'Thanh toán thành công!'}`);
        setTimeout(() => {
          navigate(`/order-history/${notification.orderId}`);
        }, 2000);
      } else {
        toast.error(`❌ ${notification.message || 'Thanh toán thất bại'}`);
      }
    }
  );

  // Load selected items from sessionStorage
  useEffect(() => {
    const storedItems = sessionStorage.getItem('checkoutItems');
    // load stored checkout items

    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        setCheckoutItems(items);

        // If no shopId found in cart items, fetch from product API
        const firstItem = items[0];
        const hasShopId = firstItem?.shopId ||
          firstItem?.product?.shopId ||
          firstItem?.shop?.id;

        if (!hasShopId && firstItem?.productId) {
          fetchShopIdFromProduct(firstItem.productId);
        }
      } catch {
        toast.error('Lỗi tải thông tin đơn hàng');
        navigate('/cart');
      }
    } else {
      // If no selected items, redirect to cart
      toast.error('Vui lòng chọn sản phẩm để thanh toán');
      navigate('/cart');
    }
  }, [navigate]);

  // Fetch cart on mount
  useEffect(() => {
    // Fetch cart on mount
    if (fetchCart) {
      fetchCart().then((result) => {
        // cart fetched
      }).catch((error) => {
        console.error('❌ Cart fetch error:', error);
      });
    }
  }, [fetchCart]);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await api.get('/wallet/balance');
        console.log('💰 Full API response:', response);
        console.log('💰 Response data:', response.data);
        
        if (response.data && response.data.data) {
          // Structure: { status, data: { balance, userId, username } }
          const balance = response.data.data.balance || 0;
          console.log('💰 Extracted balance:', balance);
          console.log('💰 Balance type:', typeof balance);
          setWalletBalance(Number(balance));
          console.log('💰 Wallet balance set to:', Number(balance));
        } else if (response.data && typeof response.data.balance === 'number') {
          // Alternative structure: { balance, userId, username }
          const balance = response.data.balance || 0;
          console.log('💰 Extracted balance (alt structure):', balance);
          setWalletBalance(Number(balance));
          console.log('💰 Wallet balance set to:', Number(balance));
        } else {
          console.warn('⚠️ Invalid response structure:', response.data);
          setWalletBalance(0);
        }
      } catch (error) {
        console.error('❌ Error fetching wallet balance:', error);
        // Don't show error toast, just log it
        setWalletBalance(0);
      }
    };

    fetchWalletBalance();
  }, []);

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
  const handleAddressChange = useCallback((addressData) => {
    setShippingAddress(addressData);
    // Reset services and fees when address changes to force recalculation
    setSelectedServices({});
    setShopShippingFees({});
    setGhnServices({});
  }, []); // No dependencies - just update state

  // Fetch GHN services when address changes
  useEffect(() => {
    const addressId = shippingAddress?.addressId || shippingAddress?.id;
    const hasRequiredData = shippingAddress && addressId && itemsByShop.length > 0;
    
    // Skip if already fetching or no required data
    if (!hasRequiredData || loadingServices) return;
    
    const loadServices = async () => {
      console.log('[GHN Services] shippingAddress:', shippingAddress);
      console.log('[GHN Services] extracted addressId:', addressId);
      setLoadingServices(true);
      // GHN service fetch: run only when all required data present
      if (shippingAddress && addressId && itemsByShop.length > 0) {
        // Fetch GHN services for each shop
        for (const shop of itemsByShop) {
          try {
            const cartItemIds = shop.items.map(item => item.cartItemId || item.id).filter(Boolean);
            const requestData = {
              shopId: parseInt(shop.shopId),
              addressId: parseInt(addressId),
              cartItemIds: cartItemIds
            };
            // silent request data for GHN
            const response = await api.post('/checkout/available-services', requestData);

            // Backend returns ResponseDTO with structure: { code, message, data: [...] }
            // Axios interceptor unwraps response.data, so we get: { code, message, data: [...] }
            let servicesArray = [];
            
            // Response structure from backend: data is Array<{ services: [...], totalWeight, ... }>
            if (response && response.data && Array.isArray(response.data)) {
              const firstShopData = response.data[0];
              if (firstShopData && firstShopData.services && Array.isArray(firstShopData.services)) {
                servicesArray = firstShopData.services;
              }
            }

            if (servicesArray.length > 0) {
              setGhnServices(prev => ({
                ...prev,
                [shop.shopId]: servicesArray
              }));
              // Fetched GHN services
              if (!selectedServices[shop.shopId]) {
                const firstService = servicesArray[0];
                // Auto-select first service
                await handleServiceSelect(shop.shopId, firstService);
              }
            }
          } catch (error) {
            toast.error(`Không thể tải dịch vụ vận chuyển cho ${shop.shopName}`);
          }
        }
      } else {
        // required conditions not met - nothing to fetch
      }
      // GHN service fetch finished
      setLoadingServices(false);
    };
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddress?.addressId, itemsByShop.length]); // Only re-run when addressId or number of shops changes

  // Handle service selection for a shop
  const handleServiceSelect = async (shopId, service) => {
    // Validate service has required fields
    if (!service || !service.service_id || !service.service_type_id) {
      toast.error('Dịch vụ vận chuyển không hợp lệ');
      return;
    }

    setSelectedServices(prev => ({
      ...prev,
      [shopId]: service
    }));

    // Calculate shipping fee for this service
    const addrIdForFee = shippingAddress?.addressId || shippingAddress?.id;
    if (shippingAddress && addrIdForFee) {
      const shopGroup = itemsByShop.find(s => s.shopId === shopId);
      if (shopGroup) {
        const cartItemIds = shopGroup.items.map(item => item.cartItemId || item.id).filter(Boolean);
        const fee = await calculateShippingFeeForService(
          shopId,
          addrIdForFee,
          service.service_id,
          service.service_type_id,
          cartItemIds
        );

        // If fee is 0 (error), the error message is already shown to user
        // User should try another service or address

        // Update shipping fee for this shop
        setShopShippingFees(prev => ({
          ...prev,
          [shopId]: fee
        }));
      }
    }
  };

  // Calculate total shipping fee from all shops
  const shippingFee = useMemo(() => {
    return Object.values(shopShippingFees).reduce((sum, fee) => sum + fee, 0);
  }, [shopShippingFees]);

  // Helper function to refresh cart and navigate
  const refreshCartAndNavigate = async (path) => {
    try {
      await fetchCart();
    } catch (error) {
      console.error('Error refreshing cart:', error);
      // Still navigate even if fetch failed
    }
    navigate(path);
  };

  // Handle voucher apply
  const handleVoucherApply = useCallback((voucher) => {
    // Apply voucher without noisy logs
    setAppliedVoucher(voucher);

    if (voucher) {
      // Nếu là voucher miễn phí ship
      if (voucher.type === 'SHIPPING') {
        setVoucherDiscount(prev => Math.min(voucher.discount, shippingFee));
      } else {
        setVoucherDiscount(voucher.discount);
      }
    } else {
      setVoucherDiscount(0);
    }
  }, [shippingFee]); // Depends on shippingFee for SHIPPING voucher calculation

  // Calculate totals - sử dụng useMemo để tự động tính lại khi checkoutItems thay đổi
  const { subtotal, total: _total, finalTotal } = useMemo(() => { // eslint-disable-line no-unused-vars

    if (!checkoutItems || checkoutItems.length === 0) {
      return { subtotal: 0, shipping: shippingFee, total: shippingFee, finalTotal: shippingFee - voucherDiscount };
    }

    const subtotal = checkoutItems.reduce((sum, item) => {
      // Kiểm tra cả unitPrice và price
      const price = parseFloat(item.unitPrice || item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      const itemTotal = price * quantity;

      // quiet: don't log every item in production

      return sum + itemTotal;
    }, 0);

    const total = subtotal + shippingFee;
    const finalTotal = total - voucherDiscount;

    // totals computed

    return { subtotal, shipping: shippingFee, total, finalTotal };
  }, [checkoutItems, shippingFee, voucherDiscount]);

  // Prepare order items from selected checkout items
  // eslint-disable-next-line no-unused-vars
  const _prepareOrderItems = () => {
    if (!checkoutItems || checkoutItems.length === 0) return [];

    return checkoutItems.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity
    }));
  };
  // Calculate shipping fee for selected service
  const calculateShippingFeeForService = async (shopId, addressId, serviceId, serviceTypeId, cartItemIds) => {
    try {
      const payload = {
        shopId: parseInt(shopId),
        addressId: parseInt(addressId),
        serviceId: parseInt(serviceId),
        serviceTypeId: parseInt(serviceTypeId),
        cartItemIds: cartItemIds.map(id => parseInt(id))
      };
      const response = await api.post('/checkout/calculate-fee', payload);

      // Backend returns ResponseDTO: { code, message, data: <GHN fee response> }
      // Axios interceptor unwraps to: { code, message, data: <GHN fee response> }
      // GHN fee response structure: { code, message, data: { total, service_fee, ... } }
      let shippingFee = 0;

      if (response && response.data) {
        // response.data is GHN response object
        const ghnResponse = response.data;
        
        if (ghnResponse.data && ghnResponse.data.total !== undefined) {
          // GHN structure: { code, message, data: { total, ... } }
          shippingFee = ghnResponse.data.total;
        } else if (ghnResponse.total !== undefined) {
          // Fallback: direct total field
          shippingFee = ghnResponse.total;
        }
      }

      // shippingFee determined
      return shippingFee;
    } catch (error) {
      console.error(`❌ Error calculating shipping fee for shop ${shopId}:`, error);

      // Extract detailed error message from backend
      let errorMessage = 'Không thể tính phí vận chuyển';

      if (error.response?.data) {
        const errorData = error.response.data;

        // Backend returns: { code, message, type, data }
        if (errorData.type === 'GHN_ROUTE_NOT_FOUND') {
          errorMessage = '⚠️ Dịch vụ này không hỗ trợ tuyến đường của bạn. Vui lòng chọn dịch vụ khác trong danh sách bên dưới.';
        } else if (errorData.message && errorData.message.includes('route not found')) {
          errorMessage = '⚠️ GHN không hỗ trợ vận chuyển đến địa chỉ này cho dịch vụ đã chọn. Vui lòng chọn dịch vụ khác hoặc địa chỉ khác.';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        console.error('[Fee Calc] Error details:', errorData);
      }

      toast.warning(errorMessage, {
        autoClose: 5000,
        position: 'top-center'
      });

      // Return 0 so user can try another service
      return 0;
    }
  };

  // Handle place order - NEW GHN 3-step flow
  const handlePlaceOrder = async () => {

    // Validation
    if (!shippingAddress) {
      toast.error('Vui lòng chọn hoặc nhập địa chỉ giao hàng');
      return;
    }

    if (!shippingAddress.toName || !shippingAddress.toPhone || !shippingAddress.toAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    // Nhóm sản phẩm theo shop
    const grouped = {};
    checkoutItems.forEach(item => {
      const shopId = item.shopId || 'unknown';
      if (!grouped[shopId]) grouped[shopId] = [];
      grouped[shopId].push(item);
    });

    const shopGroups = Object.entries(grouped);

    // Validate service selection for each shop
    for (const [shopId, items] of shopGroups) {
      if (!selectedServices[shopId]) {
        const shopName = items[0]?.shopName || `Shop ${shopId}`;
        toast.error(`Vui lòng chọn dịch vụ vận chuyển cho ${shopName}`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Creating orders for shops

      // Lưu danh sách order đã tạo
      const createdOrders = [];
      let hasError = false;

      // Tạo order cho từng shop using NEW checkout/confirm endpoint
      for (let i = 0; i < shopGroups.length; i++) {
        const [shopId, items] = shopGroups[i];
        const shopName = items[0]?.shopName || `Shop ${shopId}`;
        const selectedService = selectedServices[shopId];

        // creating order i+1

        // Get cart item IDs
        const cartItemIds = items.map(item => item.cartItemId || item.id).filter(Boolean);

        // Prepare checkout confirm request - ONLY send fields required by backend DTO
        const confirmData = {
          shopId: parseInt(shopId),
          addressId: parseInt(shippingAddress?.addressId || shippingAddress?.id),
          serviceId: parseInt(selectedService.service_id),
          serviceTypeId: parseInt(selectedService.service_type_id),
          cartItemIds: cartItemIds.map(id => parseInt(id)),
          paymentMethod: paymentMethod,
          note: orderNotes || ''
          // Backend DTO ONLY expects these 7 fields - remove all receiver* fields
        };

        try {
          const response = await api.post('/checkout/confirm', confirmData);

          if (response.data?.orderId) {
            const { orderId, totalAmount, status } = response.data;

            createdOrders.push({
              orderId,
              shopId,
              shopName,
              totalAmount,
              status
            });
          } else {
            hasError = true;
            toast.error(`Lỗi đặt hàng cho ${shopName}: ${response?.message || 'Không xác định'}`);
          }
        } catch (error) {
          hasError = true;

          let errorMsg = error?.response?.data?.message || error?.message || 'Không xác định';
          toast.error(`Lỗi đặt hàng cho ${shopName}: ${errorMsg}`);
        }
      }

      // summary created orders

      // Nếu có lỗi và không tạo được order nào
      if (createdOrders.length === 0) {
        toast.error('Không thể tạo đơn hàng. Vui lòng thử lại!');
        setIsProcessing(false);
        return;
      }
      // final summary

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
        // processing MoMo payment...

        // Lấy order đầu tiên để tạo payment
        const firstOrder = createdOrders[0];
        const momoOrderId = Number(firstOrder.orderId);

        // Tính tổng tiền của tất cả đơn hàng đã tạo thành công
        const totalAmount = createdOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // total amount for payment - computed

        const momoPayload = {
          orderId: momoOrderId,
          amount: Math.round(totalAmount),
          orderInfo: `Thanh toán ${createdOrders.length} đơn hàng`,
          returnUrl: `${window.location.origin}/payment-result`,
          notifyUrl: `${window.location.origin}/api/payment/momo/callback`
        };

        // MoMo payload prepared

        try {
          const momoResponse = await api.post('payment/momo/create', momoPayload);

          if (momoResponse.data?.payUrl) {
            toast.success('Đang chuyển đến trang thanh toán MoMo...');

            // Lưu danh sách orderIds để xử lý sau
            sessionStorage.setItem('pendingMomoOrderIds', JSON.stringify(createdOrders.map(o => o.orderId)));
            // saved pending MoMo order IDs

            // Chuyển hướng đến trang thanh toán MoMo
            window.location.href = momoResponse.data.payUrl;
            return;
          } else {
            toast.error('Không thể tạo link thanh toán MoMo. Đơn hàng đã được tạo, bạn có thể thanh toán sau.');
            await refreshCartAndNavigate('/orders');
          }
        } catch {
          toast.error('Lỗi tạo thanh toán MoMo. Đơn hàng đã được tạo, bạn có thể thanh toán sau.');
          await refreshCartAndNavigate('/orders');
        }
      } else if (paymentMethod === 'SPORTYPAY') {
        // Tính tổng tiền của tất cả đơn hàng
        const totalAmount = createdOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        try {
          const walletResponse = await api.post('/wallet/withdraw', {
            amount: Math.round(totalAmount),
            description: `Thanh toán ${createdOrders.length} đơn hàng qua SportyPay`
          });

          if (walletResponse.status === 200) {
            toast.success('Thanh toán bằng ví SportyPay thành công!');

            // Update tất cả order status sau khi thanh toán thành công
            for (const order of createdOrders) {
              try {
                await api.post(`/orders/${order.orderId}/update-after-payment`, {});
              } catch {
                // Silent error for order update
              }
            }

            await refreshCartAndNavigate('/orders');
          } else {
            toast.error('Không thể thanh toán đơn hàng. Vui lòng kiểm tra số dư ví.');
          }
        } catch {
          toast.error('Lỗi thanh toán bằng ví SportyPay');
          await refreshCartAndNavigate('/orders');
        }
      } else {
        // COD - Đơn hàng đã được tạo, chuyển đến trang đơn hàng
        if (hasError) {
          toast.warning(`Đã tạo ${createdOrders.length}/${shopGroups.length} đơn hàng thành công. Một số đơn hàng không thể tạo.`);
        } else {
          toast.success(`Đặt hàng thành công ${createdOrders.length} đơn hàng!`);
        }

        await refreshCartAndNavigate('/orders');
      }

    } catch {
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
                                      src={safeItem.mainImage || safeItem.productMainImage || safeItem.productImage || DEFAULT_PRODUCT_IMAGE}
                                      alt={safeItem.productName}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                                      onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
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
                        <div className="flex flex-col gap-4">
                          {/* Message Input */}
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Lời nhắn:</label>
                            <input
                              type="text"
                              placeholder="Lưu ý cho Người bán..."
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>

                          {/* GHN Service Selection */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                            <div className="flex items-center gap-2 text-sm flex-1">
                              <span className="text-gray-600 whitespace-nowrap">Phương thức vận chuyển:</span>
                              {ghnServices[shopGroup.shopId] && ghnServices[shopGroup.shopId].length > 0 ? (
                                <select
                                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  value={selectedServices[shopGroup.shopId]?.service_id || ''}
                                  onChange={(e) => {
                                    const service = ghnServices[shopGroup.shopId].find(s => s.service_id === parseInt(e.target.value));
                                    if (service) handleServiceSelect(shopGroup.shopId, service);
                                  }}
                                >
                                  <option value="">Chọn dịch vụ vận chuyển</option>
                                  {ghnServices[shopGroup.shopId].map((service, idx) => (
                                    <option
                                      key={service.service_id ? `${service.service_id}-${shopGroup.shopId}` : `${shopGroup.shopId}-${idx}`}
                                      value={service.service_id}
                                    >
                                      {service.short_name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full font-medium text-xs">
                                  {shippingAddress ? 'Đang tải...' : 'Vui lòng chọn địa chỉ giao hàng'}
                                </span>
                              )}
                            </div>
                            {selectedServices[shopGroup.shopId] && shopShippingFees[shopGroup.shopId] !== undefined && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600">Phí vận chuyển:</span>
                                <span className="font-semibold text-gray-900">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shopShippingFees[shopGroup.shopId])}
                                </span>
                              </div>
                            )}
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
                  shopId={shopId}
                  cartItems={checkoutItems}
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
                  walletBalance={walletBalance}
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
