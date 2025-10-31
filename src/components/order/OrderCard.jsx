import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

/**
 * Order Status Badge Colors
 */
const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300'
};

/**
 * Order Status Labels (Vietnamese)
 */
const statusLabels = {
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy'
};

/**
 * OrderCard Component
 * Display order summary in list view
 */
const OrderCard = ({ order }) => {
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

  const handleViewDetail = () => {
    navigate(`/orders/${order.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Đơn hàng #{order.id}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status] || statusColors.PENDING}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      {/* Order Info */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Phương thức thanh toán:</span>
          <span className="font-medium text-gray-900">
            {order.method === 'COD' ? 'Thanh toán khi nhận hàng' : order.method}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tổng tiền:</span>
          <span className="font-bold text-lg text-blue-600">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
        <Button
          onClick={handleViewDetail}
          variant="primary"
          className="flex-1"
        >
          Xem chi tiết
        </Button>
        
        {order.status === 'PENDING' && (
          <Button
            variant="outline"
            className="flex-1"
          >
            Hủy đơn
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
