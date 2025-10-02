import React from 'react';
import { Card, Table, Button, Tag } from 'antd';
import './TransactionTable.css';

export const TransactionTable = ({ transactions }) => {
  const columns = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: 60,
    },
    {
      title: 'Id Customer',
      dataIndex: 'customerId',
      key: 'customerId',
      width: 120,
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'Paid' ? 'green' : 'orange'}>
          {status === 'Paid' ? '● Paid' : '● Pending'}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      align: 'right',
    },
  ];

  return (
    <Card 
      title="Transaction" 
      className="transaction-card"
      extra={<Button type="primary" className="filter-btn">Filter</Button>}
    >
      <Table
        columns={columns}
        dataSource={transactions}
        pagination={false}
        size="small"
        className="transaction-table"
      />
      <div className="table-footer">
        <Button type="link">Details</Button>
      </div>
    </Card>
  );
};
