import React from 'react';
import { Table, Tag, Button, Space, Avatar, Dropdown } from 'antd';
import { 
  MoreOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined 
} from '@ant-design/icons';
import './CustomerTable.css';

export const CustomerTable = ({ customers, loading, isBuyerMode = false }) => {
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

  // Columns cho Buyer Mode (5 cột như yêu cầu)
  const buyerColumns = [
    {
      title: 'No.',
      key: 'no',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: '#6b7280' }}>{index + 1}</span>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 200,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: '500' }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250,
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: '#10b981' }} />
          <span className="customer-email">{email}</span>
        </Space>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      sorter: (a, b) => a.rawAmount - b.rawAmount,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <span style={{ fontWeight: '600', color: '#1890ff' }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'Total Orders',
      dataIndex: 'totalOrder',
      key: 'totalOrder',
      width: 120,
      sorter: (a, b) => a.rawOrders - b.rawOrders,
      render: (orders) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShoppingOutlined style={{ color: '#fa8c16' }} />
          <Tag color={orders >= 5 ? 'green' : orders >= 2 ? 'orange' : 'blue'}>
            {orders} đơn
          </Tag>
        </div>
      ),
    },
  ];

  // Columns cho Customer Mode (cũ)
  const customerColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      render: (id) => <span style={{ fontWeight: 600, color: '#6b7280' }}>#{id}</span>,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 200,
      render: (text, record) => (
        <div className="customer-info">
          <Avatar size={40} className="customer-avatar">
            {text ? text.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <div className="customer-details">
            <div className="customer-name">{text}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250,
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: '#10b981' }} />
          <span className="customer-email">{email}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'activated',
      key: 'activated',
      width: 120,
      align: 'center',
      render: (activated) => (
        <Tag color={activated ? 'green' : 'red'}>
          {activated ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Dropdown menu={{ items: actionItems }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Chọn columns dựa vào mode
  const columns = isBuyerMode ? buyerColumns : customerColumns;

  return (
    <div className="customer-table-container">
      <Table
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey={isBuyerMode ? "key" : "id"}
        scroll={{ x: 800 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ${isBuyerMode ? 'buyers' : 'customers'}`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        className="customer-table"
      />
    </div>
  );
};

// Giữ nguyên BuyersTable để backup
export const BuyersTable = ({ buyers, loading, title = "Top Buyers" }) => {
  const columns = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 200,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: '500' }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250,
      render: (text) => (
        <span style={{ color: '#666' }}>{text}</span>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      sorter: (a, b) => a.rawAmount - b.rawAmount,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <span style={{ fontWeight: '600', color: '#1890ff' }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'Total Orders',
      dataIndex: 'totalOrder',
      key: 'totalOrder',
      width: 120,
      sorter: (a, b) => a.rawOrders - b.rawOrders,
      render: (orders) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShoppingOutlined style={{ color: '#fa8c16' }} />
          <Tag color={orders >= 5 ? 'green' : orders >= 2 ? 'orange' : 'blue'}>
            {orders} đơn
          </Tag>
        </div>
      ),
    },
  ];

  return (
    <div>
      {title && (
        <div style={{ 
          marginBottom: '16px', 
          fontSize: '18px', 
          fontWeight: '600',
          color: '#262626',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <UserOutlined />
          {title} ({buyers?.length || 0} customers)
        </div>
      )}
      <Table
        columns={columns}
        dataSource={buyers}
        loading={loading}
        rowKey="key"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="buyers-table"
        scroll={{ x: 800 }}
      />
    </div>
  );
};
