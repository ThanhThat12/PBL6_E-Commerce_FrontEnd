import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './ProductTable.css';

export const ProductTable = ({ products, loading }) => {
  const columns = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div className="product-image">{record.image}</div>
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 150,
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 100,
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            className="action-btn"
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            className="action-btn delete-btn"
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={products}
      loading={loading}
      rowKey="id"
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      }}
      className="product-table"
    />
  );
};
