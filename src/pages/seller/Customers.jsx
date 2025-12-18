import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Tag, message } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { getTopBuyers } from '../../services/seller/customerService';

const { Search } = Input;

/**
 * Customers Page
 * Display customer list and insights
 */
const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, keyword]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Backend only supports top buyers endpoint, not paginated customer list
      const response = await getTopBuyers();
      
      // Filter by keyword if provided
      let filteredCustomers = response || [];
      if (keyword) {
        filteredCustomers = filteredCustomers.filter(customer => 
          customer.username?.toLowerCase().includes(keyword.toLowerCase()) ||
          customer.email?.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      
      setCustomers(filteredCustomers);
      setPagination({
        ...pagination,
        total: filteredCustomers.length,
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      message.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 80,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Tổng đơn hàng',
      dataIndex: 'totalCompletedOrders',
      key: 'totalCompletedOrders',
      sorter: (a, b) => a.totalCompletedOrders - b.totalCompletedOrders,
      render: (count) => (
        <Tag color="blue">{count} đơn</Tag>
      ),
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount || 0),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Khách hàng</h1>

      {/* Search */}
      <Card className="mb-4">
        <Search
          placeholder="Tìm kiếm khách hàng theo tên, email, số điện thoại..."
          allowClear
          enterButton
          size="large"
          onSearch={(value) => {
            setKeyword(value);
            setPagination({ ...pagination, current: 1 });
          }}
          prefix={<SearchOutlined />}
          style={{ maxWidth: 500 }}
        />
      </Card>

      {/* Customers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="userId"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khách hàng`,
          }}
          onChange={(newPagination, filters, sorter) => {
            setPagination({
              current: newPagination.current,
              pageSize: newPagination.pageSize,
              total: pagination.total,
            });
          }}
        />
      </Card>
    </div>
  );
};

export default Customers;
