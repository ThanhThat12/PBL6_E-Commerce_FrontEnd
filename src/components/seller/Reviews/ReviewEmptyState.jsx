import React from 'react';
import { FiMessageCircle } from 'react-icons/fi';

/**
 * ReviewEmptyState - Component hiển thị khi không có đánh giá
 */
const ReviewEmptyState = ({ activeTab, ratingFilter }) => {
  const getMessage = () => {
    if (activeTab === 'unreplied') {
      return 'Tất cả đánh giá đều đã được phản hồi';
    }
    if (activeTab === 'replied') {
      return 'Chưa có đánh giá nào được phản hồi';
    }
    if (ratingFilter !== 'all') {
      const filterLabels = {
        '5': '5 sao',
        '3-4': '3-4 sao',
        '1-2': '1-2 sao'
      };
      return `Không có đánh giá nào trong khoảng ${filterLabels[ratingFilter] || ratingFilter}`;
    }
    return 'Shop chưa nhận được đánh giá nào từ khách hàng';
  };

  return (
    <div className="text-center py-12 bg-white rounded-lg border">
      <FiMessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Chưa có đánh giá nào
      </h3>
      <p className="text-gray-600">{getMessage()}</p>
    </div>
  );
};

export default ReviewEmptyState;
