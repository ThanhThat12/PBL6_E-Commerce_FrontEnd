import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Select, Space, Modal, message, Tabs } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { 
  getOrders, 
  updateOrderStatus, 
  ORDER_STATUS, 
  STATUS_LABELS 
} from '../../services/seller/orderService';

const { Option } = Select;

/**
 * Orders Page
 * Display and manage all orders
 */
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        status: activeTab !== 'ALL' ? activeTab : undefined,
      };

      const response = await getOrders(params);
      
      setOrders(response.content || []);
      setPagination({
        ...pagination,
        total: response.totalElements || 0,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      message.success('Cập nhật trạng thái đơn hàng thành công');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'orange',
      CONFIRMED: 'blue',
      PREPARING: 'cyan',
      SHIPPING: 'purple',
      DELIVERED: 'green',
      CANCELLED: 'red',
      RETURNED: 'volcano',
    };
    return colorMap[status] || 'default';
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <span className="font-mono text-blue-600">#{text}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'itemCount',
      key: 'itemCount',
      render: (count) => `${count} sản phẩm`,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 150 }}
          onChange={(value) => handleStatusChange(record.id, value)}
          size="small"
        >
          {Object.keys(ORDER_STATUS).map((key) => (
            <Option key={key} value={ORDER_STATUS[key]}>
              <Tag color={getStatusColor(ORDER_STATUS[key])}>
                {STATUS_LABELS[ORDER_STATUS[key]]}
              </Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedOrder(record);
            setDetailModalVisible(true);
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const tabItems = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: STATUS_LABELS.PENDING },
    { key: 'CONFIRMED', label: STATUS_LABELS.CONFIRMED },
    { key: 'SHIPPING', label: STATUS_LABELS.SHIPPING },
    { key: 'DELIVERED', label: STATUS_LABELS.DELIVERED },
    { key: 'CANCELLED', label: STATUS_LABELS.CANCELLED },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

      {/* Tabs for order status */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPagination({ ...pagination, current: 1 });
          }}
          items={tabItems}
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current,
              pageSize: newPagination.pageSize,
              total: pagination.total,
            });
          }}
        />
      </div>

      {/* Order Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.orderCode}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
              <p>Tên: {selectedOrder.customerName}</p>
              <p>Địa chỉ: {selectedOrder.shippingAddress}</p>
              <p>Số điện thoại: {selectedOrder.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chi tiết đơn hàng</h3>
              <p>Tổng tiền: {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(selectedOrder.totalAmount)}</p>
              <p>Trạng thái: <Tag color={getStatusColor(selectedOrder.status)}>
                {STATUS_LABELS[selectedOrder.status]}
              </Tag></p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
