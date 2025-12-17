import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReturnInstructionModal from './ReturnInstructionModal';
import { DEFAULT_PRODUCT_IMAGE, handleImageError } from '../../utils/imageDefaults';

/**
 * ReturnItemCard Component
 * Hiển thị thông tin refund request
 */
const ReturnItemCard = ({ refund, onUpdate }) => {
  const navigate = useNavigate();
  const [showInstruction, setShowInstruction] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      REQUESTED: {
        label: 'Chờ duyệt',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      },
      PENDING: {
        label: 'Chờ duyệt',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      },
      APPROVED: {
        label: 'Đã duyệt - Chờ trả hàng',
        className: 'bg-blue-100 text-blue-800 border-blue-300'
      },
      COMPLETED: {
        label: '✓ Đã hoàn tiền',
        className: 'bg-green-100 text-green-800 border-green-300'
      },
      REJECTED: {
        label: '✗ Từ chối',
        className: 'bg-red-100 text-red-800 border-red-300'
      }
    };

    const config = statusConfig[status] || statusConfig.REQUESTED;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const orderItem = refund.orderItem || {};
  const imageUrls = refund.imageUrls || [];

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
          {/* Header với Order ID và ngày */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Đơn hàng</p>
              <button
                onClick={() => navigate(`/orders/${refund.orderId}`)}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                #{refund.orderId}
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Ngày yêu cầu</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(refund.createdAt)}</p>
            </div>
          </div>

          {/* Product Info */}
          {orderItem.productName && (
            <div className="flex gap-4 mb-4">
              <img
                src={orderItem.mainImage || orderItem.productImage || DEFAULT_PRODUCT_IMAGE}
                alt={orderItem.productName}
                className="w-24 h-24 object-cover rounded-lg"
                onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{orderItem.productName}</h3>
                {orderItem.variantName && (
                  <p className="text-sm text-gray-600 mb-2">Phân loại: {orderItem.variantName}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">Số lượng: <span className="font-semibold text-gray-900">{orderItem.quantity}</span></span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">Đơn giá: <span className="font-semibold text-gray-900">{formatPrice(orderItem.price)}</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Refund Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Số tiền hoàn:</p>
                <p className="font-bold text-red-600 text-lg">{formatPrice(refund.amount)}</p>
              </div>
              <div>
                <p className="text-gray-600">Phương thức:</p>
                <p className="font-semibold text-gray-900">{refund.returnMethod || 'N/A'}</p>
              </div>
            </div>
            {refund.reason && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-600 text-sm">Lý do:</p>
                <p className="text-gray-900 mt-1">{refund.reason}</p>
              </div>
            )}
          </div>

          {/* Images */}
          {imageUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Hình ảnh đính kèm:</p>
              <div className="flex gap-2 flex-wrap">
                {imageUrls.map((url, index) => (
                  <img 
                    key={index}
                    src={url}
                    alt={`Evidence ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-75"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status and Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
              {getStatusBadge(refund.status)}
            </div>
            
            <div className="flex gap-2">
              {refund.status === 'APPROVED' && (
                <button
                  onClick={() => setShowInstruction(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Hướng dẫn trả hàng
                </button>
              )}
              {refund.status === 'COMPLETED' && (
                <div className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg border border-green-200">
                  ✓ Đã hoàn tiền vào ví
                </div>
              )}
              <button
                onClick={() => navigate(`/orders/${refund.orderId}`)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded-lg transition-colors"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Return Instruction Modal */}
      {showInstruction && (
        <ReturnInstructionModal
          isOpen={showInstruction}
          refund={refund}
          onClose={() => setShowInstruction(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

export default ReturnItemCard;
