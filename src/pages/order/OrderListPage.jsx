import React, { useEffect, useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import ProfileLayout from '../../components/layout/ProfileLayout';
import OrderCard from '../../components/order/OrderCard';
import Loading from '../../components/common/Loading';

/**
 * OrderListPage Component
 * Display list of user's orders with status filters (with sidebar layout)
 */
const OrderListPage = () => {
  const { orders, loading, fetchOrders, filterOrdersByStatus } = useOrder();
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Status tabs
  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'PROCESSING', label: 'Đang xử lý' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy' }
  ];

  // Handle tab change
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    
    if (tab === 'ALL') {
      await fetchOrders();
    } else {
      await filterOrdersByStatus(tab);
    }
  };

  // Filter orders by active tab
  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  return (
    <ProfileLayout>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Đơn hàng của tôi
        </h1>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`
                px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors
                ${activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'}
              `}
            >
              {tab.label}
              {tab.key === 'ALL' && orders.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                  {orders.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loading />
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              {activeTab === 'ALL' ? 'Chưa có đơn hàng nào' : `Không có đơn hàng ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}`}
            </h3>
            <p className="mt-2 text-gray-600">
              {activeTab === 'ALL' 
                ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!'
                : 'Thử chọn tab khác để xem đơn hàng'}
            </p>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default OrderListPage;
