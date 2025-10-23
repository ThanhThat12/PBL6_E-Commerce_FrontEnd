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

  return (
    <div className="customer-table-container">
      <Table
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey="id"
        scroll={{ x: 800 }}
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
