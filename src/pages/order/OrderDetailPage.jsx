import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import OrderTimeline from '../../components/order/OrderTimeline';
// RefundRequestForm - moved to separate component
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, ChatBubbleLeftRightIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { WriteReviewModal } from '../../components/review';
import reviewService from '../../services/reviewService';
import chatService from '../../services/chatService';
import { DEFAULT_PRODUCT_IMAGE, handleImageError } from '../../utils/imageDefaults';

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
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Track reviewed products with eligibility info
  const [productEligibility, setProductEligibility] = useState({}); // { productId: eligibilityData }
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  const fromCheckout = location.state?.fromCheckout;

  // Fetch review eligibility for all products in completed order
  const fetchReviewEligibility = useCallback(async (items) => {
    if (!items || items.length === 0) return;
    
    setLoadingEligibility(true);
    const eligibilityMap = {};
    
    try {
      await Promise.all(
        items.map(async (item) => {
          try {
            const data = await reviewService.checkEligibility(item.productId);
            eligibilityMap[item.productId] = data;
          } catch (err) {
            console.error(`Error fetching eligibility for product ${item.productId}:`, err);
            eligibilityMap[item.productId] = { canReview: false, hasReviewed: false, message: 'Không thể kiểm tra' };
          }
        })
      );
      setProductEligibility(eligibilityMap);
    } catch (error) {
      console.error('Error fetching review eligibility:', error);
    } finally {
      setLoadingEligibility(false);
    }
  }, []);

  useEffect(() => {
    // Skip if orderId is not numeric (prevent conflict with /orders/return-item route)
    if (!orderId || orderId === 'undefined') {
      return;
    }
    
    const orderIdNum = parseInt(orderId, 10);
    if (isNaN(orderIdNum)) {
      return; // Silently skip - this means we're on a non-numeric route like /orders/return-item
    }
    
    fetchOrderDetail(orderIdNum);
  }, [orderId, fetchOrderDetail]);

  // Fetch eligibility when order is loaded and COMPLETED
  useEffect(() => {
    if (currentOrder?.status === 'COMPLETED' && currentOrder?.items?.length > 0) {
      fetchReviewEligibility(currentOrder.items);
    }
  }, [currentOrder?.id, currentOrder?.status, fetchReviewEligibility]);

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
      const orderIdNum = parseInt(orderId, 10);
      if (!isNaN(orderIdNum)) {
        await fetchOrderDetail(orderIdNum);
      }
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

  // Calculate review deadline (30 days from order completion)
  const calculateReviewDeadline = (completedDate) => {
    if (!completedDate) return null;
    const completed = new Date(completedDate);
    const now = new Date();
    const daysPassed = Math.floor((now - completed) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 30 - daysPassed);
    return { daysRemaining, expired: daysRemaining === 0 };
  };

  // Review handlers
  const openReviewModal = (item) => {
    setSelectedProduct({
      id: item.productId,
      name: item.productName,
      mainImage: item.image,
      variant: item.variantAttributes,
      completedDate: currentOrder?.updatedAt // Pass completion date for modal
    });
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
  };

  const handleReviewSuccess = () => {
    if (selectedProduct) {
      // Update eligibility to show "hasReviewed"
      setProductEligibility(prev => ({
        ...prev,
        [selectedProduct.id]: { ...prev[selectedProduct.id], hasReviewed: true, canReview: false }
      }));
    }
    closeReviewModal();
    toast.success('Đánh giá sản phẩm thành công!');
  };

  const handleReviewButtonClick = (item) => {
    const eligibility = productEligibility[item.productId];
    
    if (eligibility?.hasReviewed) {
      // Already reviewed - go to product page to see review
      navigate(`/products/${item.productId}#reviews`);
    } else if (eligibility?.canReview) {
      // Can create new review
      openReviewModal(item);
    } else {
      // Cannot review - show message
      toast.error(eligibility?.message || 'Không thể đánh giá sản phẩm này');
    }
  };

  const handleContactShop = async () => {
    try {
      // Get all conversations to check if SHOP conversation exists
      const conversations = await chatService.getMyConversations();
      
      // Find existing SHOP conversation with this shop
      let conversation = conversations.find(
        conv => conv.type === 'SHOP' && conv.shop?.id === currentOrder.shop?.id
      );

      // If no existing conversation, create new SHOP conversation
      if (!conversation) {
        conversation = await chatService.createConversation({
          type: 'SHOP',
          shopId: currentOrder.shop?.id
        });
        console.log('New SHOP conversation created:', conversation);
      } else {
        console.log('Opening existing SHOP conversation:', conversation);
      }

      // Dispatch custom event to open chat window
      // Create order summary with URLs for both buyer and seller
      const buyerUrl = `${window.location.origin}/orders/${currentOrder.id}`;
      const sellerUrl = `${window.location.origin}/seller/orders/${currentOrder.id}`;
      
      const orderSummary = `Xin chao, toi muon hoi ve don hang #${currentOrder.id}

Xem chi tiet don hang:
- Khach hang: ${buyerUrl}
- Nguoi ban: ${sellerUrl}`;

      window.dispatchEvent(
        new CustomEvent('openChat', {
          detail: {
            conversationId: conversation.id,
            conversationType: 'SHOP',
            shopId: currentOrder.shop?.id,
            // Include order link to auto-send ONLY from order detail page
            shouldAutoSend: true,
            autoMessage: orderSummary
          }
        })
      );
    } catch (error) {
      console.error('Error opening chat with shop:', error);
      toast.error('Không thể mở chat với shop');
    }
  };

  // Render review button based on eligibility
  const renderReviewButton = (item) => {
    const eligibility = productEligibility[item.productId];
    
    if (loadingEligibility) {
      return (
        <Button variant="outline" size="sm" disabled>
          <span className="animate-pulse">Đang kiểm tra...</span>
        </Button>
      );
    }
    
    if (eligibility?.hasReviewed) {
      return (
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleReviewButtonClick(item);
          }}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <StarIcon className="h-4 w-4" />
          Xem đánh giá
        </Button>
      );
    }
    
    if (eligibility?.canReview) {
      const deadline = calculateReviewDeadline(currentOrder?.updatedAt);
      const daysLeft = deadline?.daysRemaining || eligibility.daysRemainingToReview || 30;
      const isUrgent = daysLeft <= 7;
      
      return (
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleReviewButtonClick(item);
            }}
            variant="primary"
            size="sm"
            className={`flex items-center gap-1 ${
              isUrgent 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            <StarIcon className="h-4 w-4" />
            Đánh giá sản phẩm
          </Button>
          {daysLeft !== null && (
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs flex items-center gap-1 font-medium ${
                isUrgent ? 'text-red-600' : 'text-orange-600'
              }`}>
                <ClockIcon className="h-3 w-3" />
                ⏰ Còn {daysLeft} ngày
              </span>
              {/* Progress bar */}
              <div className="w-24 bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all ${
                    isUrgent ? 'bg-red-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${(daysLeft / 30) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Cannot review
    return (
      <div className="flex flex-col items-end gap-1">
        <Button variant="outline" size="sm" disabled className="text-gray-400">
          <StarIcon className="h-4 w-4 mr-1" />
          Hết hạn đánh giá
        </Button>
        <span className="text-xs text-gray-400">
          {eligibility?.message || 'Đã quá thời hạn 30 ngày'}
        </span>
      </div>
    );
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
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chi tiết đơn hàng #{currentOrder.id}
            </h1>
            <p className="text-gray-600 mt-2">
              Đặt hàng lúc: {formatDate(currentOrder.createdAt)}
            </p>
            {currentOrder.refundStatus && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300">
                  Hoàn tiền: {currentOrder.refundStatus === 'REQUESTED' ? 'Đang chờ seller duyệt' : currentOrder.refundStatus === 'APPROVED' ? 'Đã duyệt, đang hoàn tiền' : currentOrder.refundStatus === 'REJECTED' ? 'Bị từ chối' : currentOrder.refundStatus === 'COMPLETED' ? 'Đã hoàn thành' : currentOrder.refundStatus}
                </span>
              </div>
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
                    {currentOrder.shipment?.receiverName
                      || currentOrder.receiverName
                      || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="font-medium text-gray-900">
                    {currentOrder.shipment?.receiverPhone
                      || currentOrder.receiverPhone
                      || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Địa chỉ:</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs">
                    {currentOrder.shipment?.receiverAddress
                      || currentOrder.receiverAddress
                      || 'Chưa cập nhật'}
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
                  <div key={index} className="pb-4 border-b border-gray-200 last:border-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="flex gap-4 hover:bg-gray-50 transition cursor-pointer"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <img
                        src={item.mainImage || item.productMainImage || item.image || item.productImage || DEFAULT_PRODUCT_IMAGE}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.productName}
                        </h3>
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
                    </Link>
                    
                    {/* Action Buttons - Only show for COMPLETED orders */}
                    {currentOrder.status === 'COMPLETED' && (
                      <div className="mt-3 flex justify-end gap-2 items-start flex-wrap">
                        {/* Return/Refund Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/orders/return-request?orderId=${currentOrder.id}&itemId=${item.id}`);
                          }}
                          className="flex items-center gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Trả hàng/Hoàn tiền
                        </Button>
                        
                        {/* Review Button with eligibility check */}
                        {renderReviewButton(item)}
                        
                        {/* Contact Shop Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleContactShop();
                          }}
                          className="flex items-center gap-1"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                          Liên hệ Shop
                        </Button>
                      </div>
                    )}
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

              {/* Cancel Order Button - Only for PENDING status */}
              {currentOrder.status === 'PENDING' && (
                <Button
                  onClick={() => setShowCancelConfirm(true)}
                  variant="outline"
                  className="w-full mt-6 border-red-500 text-red-500 hover:bg-red-50"
                >
                  Hủy đơn hàng
                </Button>
              )}

              {/* Support Button */}
              <Button
                variant="outline"
                className="w-full mt-4"
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

        {/* Review Modal - Using WriteReviewModal component */}
        <WriteReviewModal
          isOpen={showReviewModal}
          onClose={closeReviewModal}
          productId={selectedProduct?.id}
          product={selectedProduct}
          onSuccess={handleReviewSuccess}
          requireImages={true}
        />
      </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OrderDetailPage;
