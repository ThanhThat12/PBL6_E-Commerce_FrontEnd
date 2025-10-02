import React from 'react';
import { Table, Tag, Button, Space, Avatar, Dropdown } from 'antd';
import { 
  MoreOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined 
} from '@ant-design/icons';
import './CustomerTable.css';

export const CustomerTable = ({ customers, loading }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'blocked': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'blocked': return 'Blocked';
      default: return status;
    }
  };

  const actionItems = [
    { key: '1', label: 'View Details', icon: <EyeOutlined /> },
    { key: '2', label: 'Edit Customer', icon: <EditOutlined /> },
    { key: '3', label: 'Send Email', icon: <MailOutlined /> },
    { key: '4', label: 'Delete', icon: <DeleteOutlined />, danger: true },
  ];

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 250,
      render: (text, record) => (
        <div className="customer-info">
          <Avatar size={40} className="customer-avatar">
            {record.avatar}
          </Avatar>
          <div className="customer-details">
            <div className="customer-name">{text}</div>
            <div className="customer-email">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone) => (
        <Space>
          <PhoneOutlined style={{ color: '#10b981' }} />
          <span>{phone}</span>
        </Space>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: 'Total Orders',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      width: 120,
      align: 'center',
      render: (orders) => <span className="orders-count">{orders}</span>,
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 130,
      align: 'right',
      render: (spent) => <span className="amount-spent">{spent}</span>,
    },
    {
      title: 'Loyalty Points',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      width: 130,
      align: 'center',
      render: (points) => (
        <span className="loyalty-points">
          ⭐ {points.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Registered',
      dataIndex: 'registered',
      key: 'registered',
      width: 120,
    },
    {
      title: 'Last Order',
      dataIndex: 'lastOrder',
      key: 'lastOrder',
      width: 120,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown menu={{ items: actionItems }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="customer-table-container">
      <Table
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1400 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        className="customer-table"
      />
    </div>
  );
};
