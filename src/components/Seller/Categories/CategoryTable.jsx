import React from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Table, Button, Space, Tag, Tooltip } from 'antd';
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
    // ✅ Sửa cột Stock để hiển thị thông tin variants
{
  title: 'Stock',
  dataIndex: 'stock',
  key: 'stock',
  width: 120,
  render: (stock, record) => {
    // ✅ Tạo tooltip content với chi tiết từng variant
    const tooltipContent = () => {
      if (!record.variants || record.variants.length === 0) {
        return <div>Sản phẩm không có biến thể</div>;
      }
      
      return (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Chi tiết tồn kho:
          </div>
          {record.variants.map((variant, index) => (
            <div key={variant.id || index} style={{ marginBottom: '4px' }}>
              <span style={{ fontWeight: '500' }}>{variant.sku}:</span> {variant.stock || 0}
            </div>
          ))}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '4px', marginTop: '4px', fontWeight: 'bold' }}>
            Tổng: {stock}
          </div>
        </div>
      );
    };
    
    return (
      <Tooltip title={tooltipContent()} placement="left">
        <div style={{ cursor: 'pointer' }}>
          {/* ✅ Hiển thị tổng stock */}
          <Tag color={stock > 0 ? 'green' : 'red'} style={{ marginBottom: '4px' }}>
            {stock > 0 ? `${stock} sản phẩm` : 'Hết hàng'}
          </Tag>
          
          {/* ✅ Hiển thị số variants nếu có */}
          {record.variantCount > 0 && (
            <div style={{ fontSize: '11px', color: '#666' }}>
              {record.variantCount} biến thể
            </div>
          )}
        </div>
      </Tooltip>
    );
  },
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
