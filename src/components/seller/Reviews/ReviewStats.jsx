import React from 'react';
import { FiMessageCircle, FiCheck, FiClock } from 'react-icons/fi';

/**
 * ReviewStats - Component hiển thị thống kê đánh giá
 */
const ReviewStats = ({ repliedCount, unrepliedCount }) => {
  const totalCount = repliedCount + unrepliedCount;

  const stats = [
    {
      label: 'Tổng đánh giá',
      value: totalCount,
      icon: FiMessageCircle,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Đã phản hồi',
      value: repliedCount,
      icon: FiCheck,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Chưa phản hồi',
      value: unrepliedCount,
      icon: FiClock,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(ReviewStats);
