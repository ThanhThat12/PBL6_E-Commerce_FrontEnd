import React from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

/**
 * Order Status Badge Colors
 */
const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-300',
  SHIPPING: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300'
};

/**
 * Order Status Labels (Vietnamese)
 */
const statusLabels = {
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy'
};

/**
 * OrderCard Component
 * Display order summary with first product and expandable details
 */


const OrderCard = ({ order, onCancelSuccess }) => {
  const navigate = useNavigate();

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get first product from order items
  const firstProduct = order.items && order.items.length > 0 ? order.items[0] : null;
  const totalItems = order.items ? order.items.length : 0;

  const handleViewDetail = () => {
    navigate(`/orders/${order.id}`);
  };

  // Hủy đơn hàng (chỉ cho phép khi trạng thái PENDING)
  const handleCancelOrder = async () => {
    if (order.status !== 'PENDING') {
      toast.error('Chỉ có thể hủy đơn khi đang chờ xác nhận!');
      return;
    }
    try {
      await api.post(`/orders/${order.id}/cancel`, 'Tôi muốn hủy đơn', {
        headers: { 'Content-Type': 'text/plain' }
      });
      toast.success('Đã hủy đơn hàng thành công!');
      if (onCancelSuccess) onCancelSuccess();
    } catch (err) {
      toast.error('Hủy đơn thất bại!');
    }
  };

  // Xác nhận đã nhận hàng (chỉ cho phép khi trạng thái SHIPPING)
  const handleConfirmReceived = async () => {
    if (order.status !== 'SHIPPING') {
      toast.error('Chỉ có thể xác nhận khi đơn hàng đang giao!');
      return;
    }
    try {
      await api.post(`/orders/${order.id}/confirm-received`);
      toast.success('Đã xác nhận nhận hàng thành công!');
      if (onCancelSuccess) onCancelSuccess();
    } catch (err) {
      toast.error('Xác nhận thất bại!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Order Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-semibold text-gray-900">{order.shopName || 'Shop'}</span>
        </div>
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status] || statusColors.PENDING}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      {/* First Product Display */}
      {firstProduct && (
        <div 
          className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleViewDetail}
        >
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="relative flex-shrink-0">
              <img 
                src={firstProduct.mainImage || firstProduct.productMainImage || firstProduct.productImage || firstProduct.image || '/placeholder.png'} 
                alt={firstProduct.productName}
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
              {totalItems > 1 && (
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                  +{totalItems - 1}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-1">
                {firstProduct.productName}
              </h3>
              {firstProduct.variantName && (
                <p className="text-sm text-gray-500 mb-2">
                  Phân loại: {firstProduct.variantName}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">x{firstProduct.quantity}</span>
                <span className="text-base font-semibold text-gray-900">
                  {formatPrice(firstProduct.price * firstProduct.quantity)}
                </span>
              </div>
            </div>

            {/* Arrow Icon */}
            <div className="flex items-center">
              <svg 
                className="w-6 h-6 text-gray-400"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">Đơn hàng #{order.id}</span>
          <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
        </div>
        
        {/* Refund Status */}
        {order.refundStatus && (
          <div className="mb-3">
            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300">
              Hoàn tiền: {order.refundStatus === 'REQUESTED' ? 'Đang chờ duyệt' : order.refundStatus === 'APPROVED' ? 'Đã duyệt' : order.refundStatus === 'REJECTED' ? 'Từ chối' : order.refundStatus === 'COMPLETED' ? 'Đã hoàn thành' : order.refundStatus}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">Tổng thanh toán:</span>
          <span className="text-lg font-bold text-red-600">
            {formatPrice(order.totalAmount)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {order.status === 'PENDING' && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancelOrder}
            >
              Hủy đơn
            </Button>
          )}
          {order.status === 'SHIPPING' && (
            <Button
              variant="success"
              className="flex-1"
              onClick={handleConfirmReceived}
            >
              Đã nhận hàng
            </Button>
          )}
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {/* TODO: Implement contact shop */}}
          >
            Liên hệ Shop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
