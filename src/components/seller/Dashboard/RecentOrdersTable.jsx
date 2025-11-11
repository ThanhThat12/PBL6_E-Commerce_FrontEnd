import React from 'react';
import { Card, Table, Tag } from 'antd';

/**
 * RecentOrdersTable Component
 * Display recent orders in a table
 * 
 * @param {object} props
 * @param {Array} props.orders - Orders data
 * @param {boolean} props.loading - Loading state
 */
const RecentOrdersTable = ({ orders = [], loading = false }) => {
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
      render: (status) => {
        const colorMap = {
          PENDING: 'orange',
          CONFIRMED: 'blue',
          SHIPPING: 'cyan',
          DELIVERED: 'green',
          CANCELLED: 'red',
        };
        const labelMap = {
          PENDING: 'Chờ xác nhận',
          CONFIRMED: 'Đã xác nhận',
          SHIPPING: 'Đang giao',
          DELIVERED: 'Đã giao',
          CANCELLED: 'Đã hủy',
        };
        return <Tag color={colorMap[status]}>{labelMap[status] || status}</Tag>;
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <Card title="Đơn hàng gần đây" className="h-full">
      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default RecentOrdersTable;
