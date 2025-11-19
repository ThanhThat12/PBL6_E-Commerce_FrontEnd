import React, { useEffect, useState } from "react";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

export default function RefundApprovalList() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orderService.getRefundRequests();
      setRefunds(data);
    } catch (err) {
      setError("Không thể tải danh sách yêu cầu hoàn tiền");
      toast.error("Không thể tải danh sách yêu cầu");
    }
    setLoading(false);
  };

  const handleApprove = async (refundId) => {
    if (!window.confirm("Xác nhận chấp nhận yêu cầu trả hàng này? Khách hàng sẽ được hướng dẫn gửi hàng về.")) return;
    
    setActionLoading(refundId);
    try {
      await orderService.approveRefund(refundId);
      toast.success("Đã chấp nhận yêu cầu trả hàng. Khách hàng sẽ nhận được hướng dẫn.");
      await fetchRefunds();
    } catch (err) {
      toast.error("Chấp nhận yêu cầu thất bại");
    }
    setActionLoading(null);
  };
  
  const handleConfirmReceipt = async (refundId) => {
    if (!window.confirm("Xác nhận đã nhận hàng trả về và hoàn tiền cho khách?")) return;
    
    setActionLoading(refundId);
    try {
      await orderService.confirmRefundReceipt(refundId);
      toast.success("Đã hoàn tiền thành công");
      await fetchRefunds();
    } catch (err) {
      toast.error("Xác nhận thất bại");
    }
    setActionLoading(null);
  };

  const handleRejectClick = (refund) => {
    setSelectedRefund(refund);
    setShowRejectModal(true);
    setRejectReason("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setActionLoading(selectedRefund.id);
    try {
      await orderService.rejectRefund(selectedRefund.id, rejectReason);
      toast.success("Đã từ chối yêu cầu trả hàng");
      setShowRejectModal(false);
      await fetchRefunds();
    } catch (err) {
      toast.error("Từ chối hoàn tiền thất bại");
    }
    setActionLoading(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { text: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      REQUESTED: { text: 'Chờ duyệt', class: 'bg-blue-100 text-blue-800 border-blue-300' },
      APPROVED: { text: 'Đã duyệt', class: 'bg-green-100 text-green-800 border-green-300' },
      REJECTED: { text: 'Đã từ chối', class: 'bg-red-100 text-red-800 border-red-300' },
      COMPLETED: { text: 'Hoàn thành', class: 'bg-gray-100 text-gray-800 border-gray-300' },
    };

    const config = statusConfig[status] || { text: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {refunds.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Không có yêu cầu nào</h3>
          <p className="text-gray-500">Chưa có yêu cầu trả hàng/hoàn tiền từ khách hàng</p>
        </div>
      ) : (
        refunds.map((refund) => (
          <div key={refund.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Yêu cầu #{refund.id} - Đơn hàng #{refund.order?.id}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(refund.createdAt)}
                </p>
              </div>
              {getStatusBadge(refund.status)}
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Product Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin sản phẩm</h4>
                  {refund.orderItem && (
                    <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={refund.orderItem.productImage || '/placeholder.png'}
                        alt={refund.orderItem.productName}
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{refund.orderItem.productName}</p>
                        {refund.orderItem.variantName && (
                          <p className="text-xs text-gray-500 mt-1">Phân loại: {refund.orderItem.variantName}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-600">SL: {refund.quantity || refund.orderItem.quantity}</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(refund.amount || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Return Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin trả hàng</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền hoàn:</span>
                      <span className="font-semibold text-red-600">{formatPrice(refund.amount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phương thức:</span>
                      <span className="font-medium text-gray-900">{refund.returnMethod || 'N/A'}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-gray-600 mb-1">Lý do:</p>
                      <p className="text-gray-900 bg-yellow-50 p-2 rounded text-sm">{refund.reason || 'Không có lý do'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              {refund.imageUrls && refund.imageUrls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Hình ảnh đính kèm</h4>
                  <div className="flex gap-2 flex-wrap">
                    {refund.imageUrls.map((url, index) => (
                      <img 
                        key={index}
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-75"
                        onClick={() => window.open(url, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {(refund.status === 'REQUESTED' || refund.status === 'PENDING') && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => handleRejectClick(refund)}
                  disabled={actionLoading === refund.id}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => handleApprove(refund.id)}
                  disabled={actionLoading === refund.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading === refund.id && (
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  Chấp nhận
                </button>
              </div>
            )}
            
            {/* Action for APPROVED_WAITING_RETURN status */}
            {refund.status === 'APPROVED_WAITING_RETURN' && (
              <div className="px-6 py-4 bg-blue-50 border-t border-blue-200 flex gap-3 justify-between items-center">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Chờ khách trả hàng về</span>
                </p>
                <button
                  onClick={() => handleConfirmReceipt(refund.id)}
                  disabled={actionLoading === refund.id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading === refund.id && (
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  Xác nhận đã nhận hàng
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Từ chối yêu cầu trả hàng</h3>
            <p className="text-sm text-gray-600 mb-4">
              Vui lòng nhập lý do từ chối để gửi cho khách hàng:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="4"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
