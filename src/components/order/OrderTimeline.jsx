import React from 'react';
import { CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/solid';

/**
 * Order Timeline Component
 * Display order status progression
 */
const OrderTimeline = ({ status, createdAt, updatedAt }) => {
  const steps = [
    {
      name: 'Đã đặt hàng',
      status: 'PENDING',
      icon: ClockIcon,
      color: 'blue'
    },
    {
      name: 'Đang xử lý',
      status: 'PROCESSING',
      icon: TruckIcon,
      color: 'yellow'
    },
    {
      name: 'Hoàn thành',
      status: 'COMPLETED',
      icon: CheckCircleIcon,
      color: 'green'
    }
  ];

  // Map status to step index
  const statusIndex = {
    'PENDING': 0,
    'PROCESSING': 1,
    'COMPLETED': 2,
    'CANCELLED': -1
  };

  const currentIndex = statusIndex[status] || 0;
  const isCancelled = status === 'CANCELLED';

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

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <XCircleIcon className="h-10 w-10 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Đơn hàng đã bị hủy</h3>
            <p className="text-sm text-red-700 mt-1">
              Hủy lúc: {formatDate(updatedAt)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Trạng thái đơn hàng</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200">
          <div 
            className="bg-blue-500 transition-all duration-500"
            style={{ 
              height: `${(currentIndex / (steps.length - 1)) * 100}%`,
              width: '100%'
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.status} className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
                  relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}
                  ${isCurrent ? 'ring-4 ring-blue-100' : ''}
                  transition-all duration-300
                `}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h4 className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.name}
                  </h4>
                  {isCurrent && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(updatedAt || createdAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timestamps */}
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Thời gian đặt hàng:</span>
          <span className="text-gray-900">{formatDate(createdAt)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cập nhật lần cuối:</span>
          <span className="text-gray-900">{formatDate(updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
