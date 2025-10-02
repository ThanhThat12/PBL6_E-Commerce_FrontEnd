import React from 'react';
import { Card, Table, Button, Tag } from 'antd';
import './BestSellingProducts.css';

export const BestSellingProducts = ({ products }) => {
  const columns = [
    {
      title: 'PRODUCT',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="product-cell">
          <div className="product-icon">{record.icon}</div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'TOTAL ORDER',
      dataIndex: 'totalOrder',
      key: 'totalOrder',
      align: 'center',
      width: 120,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status) => (
        <Tag color={status === 'Stock' ? 'green' : 'red'}>
          {status === 'Stock' ? '● Stock' : '● Stock out'}
        </Tag>
      ),
    },
    {
      title: 'PRICE',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 100,
    },
  ];

  return (
    <Card 
      title="Best selling product" 
      className="best-selling-card"
      extra={<Button type="primary" className="filter-btn">Filter</Button>}
    >
      <Table
        columns={columns}
        dataSource={products}
        pagination={false}
        size="small"
        className="best-selling-table"
      />
      <div className="table-footer">
        <Button type="link">Details</Button>
      </div>
    </Card>
  );
};
