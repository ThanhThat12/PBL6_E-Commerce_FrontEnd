import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Tag, message } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { getCustomers } from '../../services/seller/customerService';

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
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        keyword: keyword || undefined,
      };

      const response = await getCustomers(params);
      
      setCustomers(response.content || []);
      setPagination({
        ...pagination,
        total: response.totalElements || 0,
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
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 60,
      render: (avatar, record) => (
        avatar ? (
          <img 
            src={avatar} 
            alt={record.name} 
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <UserOutlined className="text-gray-500" />
          </div>
        )
      ),
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Tổng đơn hàng',
      dataIndex: 'orderCount',
      key: 'orderCount',
      sorter: (a, b) => a.orderCount - b.orderCount,
      render: (count) => (
        <Tag color="blue">{count} đơn</Tag>
      ),
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      render: (amount) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount),
    },
    {
      title: 'Loại khách',
      dataIndex: 'customerType',
      key: 'customerType',
      render: (type) => {
        const typeConfig = {
          VIP: { color: 'gold', text: 'VIP' },
          REGULAR: { color: 'blue', text: 'Thường xuyên' },
          NEW: { color: 'green', text: 'Mới' },
        };
        const config = typeConfig[type] || typeConfig.NEW;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
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
          rowKey="id"
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
