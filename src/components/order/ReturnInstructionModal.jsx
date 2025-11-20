import React from 'react';
import { XMarkIcon, TruckIcon, MapPinIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

/**
 * ReturnInstructionModal Component
 * Displays return shipping instructions for buyer
 */
const ReturnInstructionModal = ({ isOpen, onClose, refund }) => {
  if (!isOpen || !refund) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDeadlineDate = () => {
    if (!refund.updatedAt) return 'N/A';
    const date = new Date(refund.updatedAt);
    date.setDate(date.getDate() + 3); // Add 3 days
    return formatDate(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <TruckIcon className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Hướng dẫn trả hàng</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Yêu cầu đã được chấp nhận!</h4>
                <p className="text-sm text-green-700">
                  Shop đã chấp nhận yêu cầu trả hàng của bạn. Vui lòng gửi hàng về theo hướng dẫn bên dưới.
                </p>
              </div>
            </div>
          </div>

          {/* Return Info */}
          <div className="space-y-4">
            {/* Order/Return Code */}
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Mã đơn hàng / Mã Return</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                  #{refund.orderId}
                </code>
                <span className="text-sm text-gray-500">(Ghi rõ trên bưu kiện)</span>
              </div>
            </div>

            {/* Shop Address */}
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPinIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Địa chỉ gửi hàng</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-900 font-medium leading-relaxed">
                  {refund.shopAddress || 'Đang cập nhật...'}
                </p>
              </div>
            </div>

            {/* Deadline */}
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Thời hạn gửi hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-semibold">Trước ngày: {getDeadlineDate()}</span>
                <span className="text-sm text-gray-500">(3 ngày kể từ khi được duyệt)</span>
              </div>
              <p className="text-sm text-red-600 mt-2 font-medium">
                ⚠️ Vui lòng gửi hàng trong vòng 3 ngày, nếu quá hạn yêu cầu trả hàng sẽ tự động hủy.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lưu ý quan trọng
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Đóng gói hàng cẩn thận, đảm bảo sản phẩm nguyên vẹn như ban đầu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Ghi rõ <strong>mã đơn hàng #{refund.orderId}</strong> bên ngoài bưu kiện</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Gửi hàng qua đơn vị vận chuyển uy tín (GHN, GHTK, VNPost,...)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Lưu lại mã vận đơn để tra cứu trạng thái gửi hàng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span>Sau khi gửi hàng, cập nhật trạng thái "Đã gửi hàng" trong đơn hàng của bạn</span>
              </li>
            </ul>
          </div>

          {/* Refund Info */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Thông tin hoàn tiền</h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền hoàn:</span>
                <span className="font-semibold text-green-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refund.amount || 0)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Tiền sẽ được hoàn vào tài khoản của bạn sau khi Shop xác nhận đã nhận được hàng trả về và kiểm tra hàng đạt yêu cầu.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnInstructionModal;
