import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './CategoryTable.css';

export const CategoryTable = ({ categories, loading, title = "Products" }) => {
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
      render: (text, record) => {
        console.log('🔍 Product data:', { text, record }); // Debug log
        return (
          <Space>
            {/* <div className="product-image">
              {record.image && record.image.startsWith('http') ? (
                <img 
                  src={record.image} 
                  alt={text || 'Product'} 
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                />
              ) : null}
              <span style={{ display: record.image && record.image.startsWith('http') ? 'none' : 'block' }}>
                📦
              </span>
            </div> */}
            <div>
              <div style={{ fontWeight: '500' }}>
                {text || record.name || 'Tên sản phẩm không có'}
              </div>
              {record.categoryName && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {record.categoryName}
                </div>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => (
        <span style={{ fontWeight: '600', color: '#1890ff' }}>
          {price}
        </span>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock > 0 ? stock : 'Hết hàng'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    // {
    //   title: 'Created Date',
    //   dataIndex: 'createdDate',
    //   key: 'createdDate',
    //   width: 120,
    // },
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
            title="Edit Product"
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            className="action-btn delete-btn"
            title="Delete Product"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {title && (
        <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
          {title} ({categories?.length || 0} items)
        </div>
      )}
      <Table
        columns={columns}
        dataSource={categories}
        loading={loading}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="product-table"
      />
    </div>
  );
};
