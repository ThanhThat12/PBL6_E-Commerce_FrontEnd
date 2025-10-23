import React, { useState } from 'react';
import { Table, Tag, Button, Space, Tooltip, Modal } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import './OrderTable.css';

const OrderTable = ({ orders, onStatusChange }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: 'orange',
      Processing: 'blue',
      Shipping: 'cyan',
      Completed: 'green',
      Cancelled: 'red',
    };
    return statusColors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
      render: (text) => <span className="order-id">#{text}</span>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (dateTime) => formatDateTime(dateTime),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'method',
      key: 'method',
      width: 180,
      render: (method) => <Tag color="blue">{method}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'Pending' && 'Chờ xử lý'}
          {status === 'Processing' && 'Đang xử lý'}
          {status === 'Shipping' && 'Đang giao'}
          {status === 'Completed' && 'Hoàn thành'}
          {status === 'Cancelled' && 'Đã hủy'}
        </Tag>
      ),
      filters: [
        { text: 'Chờ xử lý', value: 'Pending' },
        { text: 'Đang xử lý', value: 'Processing' },
        { text: 'Đang giao', value: 'Shipping' },
        { text: 'Hoàn thành', value: 'Completed' },
        { text: 'Đã hủy', value: 'Cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 150,
      render: (amount) => (
        <span className="order-amount">{formatCurrency(amount)}</span>
      ),
      sorter: (a, b) => a.total_amount - b.total_amount,
    },
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100,
      align: 'center',
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showOrderDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Cập nhật trạng thái">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onStatusChange(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
        }}
        className="order-table"
      />

      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && (
          <div className="order-details">
            <div className="detail-row">
              <span className="detail-label">ID đơn hàng:</span>
              <span className="detail-value">#{selectedOrder.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ngày tạo:</span>
              <span className="detail-value">{formatDateTime(selectedOrder.created_at)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phương thức thanh toán:</span>
              <span className="detail-value">
                <Tag color="blue">{selectedOrder.method}</Tag>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Trạng thái:</span>
              <Tag color={getStatusColor(selectedOrder.status)}>
                {selectedOrder.status === 'Pending' && 'Chờ xử lý'}
                {selectedOrder.status === 'Processing' && 'Đang xử lý'}
                {selectedOrder.status === 'Shipping' && 'Đang giao'}
                {selectedOrder.status === 'Completed' && 'Hoàn thành'}
                {selectedOrder.status === 'Cancelled' && 'Đã hủy'}
              </Tag>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tổng tiền:</span>
              <span className="detail-value order-amount">
                {formatCurrency(selectedOrder.total_amount)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">User ID:</span>
              <span className="detail-value">{selectedOrder.user_id}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default OrderTable;
