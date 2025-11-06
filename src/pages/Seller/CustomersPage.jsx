// src/pages/Seller/CustomersPage.js
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Input, Button, Select, Space, Dropdown } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  DownloadOutlined,
  PlusOutlined,
  MoreOutlined 
} from '@ant-design/icons';
import { 
  Sidebar, 
  Header, 
  CustomerStatsCard, 
  CustomerTable, 
  TopSpendersCard, 
  CustomerSegmentCard 
} from '../../components/Seller';
import customerService from '../../services/customerService';
import './CustomersPage.css';

const { Content } = Layout;
const { Option } = Select;

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching customers data...');
      
      // Thay đổi: lấy tất cả top buyers thay vì getCustomers
      const [buyersData, statsData] = await Promise.all([
        customerService.getAllTopBuyers(), // Sử dụng API mới
        customerService.getCustomerStats(),
      ]);
      console.log('✅ Buyers data loaded:', { buyersData, statsData });
      
      setCustomers(Array.isArray(buyersData) ? buyersData : []);
      setStats(statsData);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setCustomers([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật filter để phù hợp với dữ liệu buyers
  const filteredCustomers = Array.isArray(customers) ? customers.filter(customer => {
    const matchSearch = (customer.username && customer.username.toLowerCase().includes(searchText.toLowerCase())) ||
                       (customer.email && customer.email.toLowerCase().includes(searchText.toLowerCase()));
    // Bỏ filterStatus vì buyers không có trạng thái active/inactive
    return matchSearch;
  }) : [];

  const moreActionsMenu = {
    items: [
      { key: '1', label: 'Export to CSV', icon: <DownloadOutlined /> },
      { key: '2', label: 'Export to Excel', icon: <DownloadOutlined /> },
      { key: '3', label: 'Send Bulk Email' },
      { key: '4', label: 'Import Customers' },
    ],
  };

  return (
    <Layout className="customers-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>
      
      <Layout>
        <Header />
        <Content className="customers-content">
          {/* Page Header - giữ nguyên */}
          <div className="page-header">
            <h1 className="page-title">Customers Management</h1>
            
          </div>

          {/* Stats Cards - giữ nguyên
          <Row gutter={[24, 24]} className="stats-section">
            <Col xs={24} sm={12} lg={6}>
              <CustomerStatsCard
                title="Total Customers"
                value={stats?.totalCustomers.toLocaleString()}
                change={12.5}
                icon="users"
                color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <CustomerStatsCard
                title="Active Customers"
                value={stats?.activeCustomers.toLocaleString()}
                change={8.3}
                icon="active"
                color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <CustomerStatsCard
                title="New This Month"
                value={stats?.newThisMonth.toLocaleString()}
                change={15.7}
                icon="new"
                color="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <CustomerStatsCard
                title="Avg Order Value"
                value={stats?.averageOrderValue}
                change={-3.2}
                icon="revenue"
                color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              />
            </Col>
          </Row> */}

          {/* Top Spenders & Customer Segments - GIỮ NGUYÊN */}
          <Row gutter={[24, 24]} className="insights-section">
            <Col xs={24} lg={12}>
              <TopSpendersCard topSpenders={stats?.topSpenders} />
            </Col>
            <Col xs={24} lg={12}>
              <CustomerSegmentCard segments={stats?.customerSegments} />
            </Col>
          </Row>

          {/* Customers Table - CẬP NHẬT */}
          <div className="table-section">
            <div className="table-header">
              <h2 className="table-title">All Top Buyers ({filteredCustomers.length})</h2>
              <Space className="table-actions">
                <Input
                  placeholder="Search buyers..."
                  prefix={<SearchOutlined />}
                  className="search-input"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
                {/* Bỏ Status Filter vì buyers không có status */}
                <Button icon={<FilterOutlined />}>Filters</Button>
                <Button icon={<DownloadOutlined />}>Export</Button>
              </Space>
            </div>
            
            {/* Sử dụng BuyersTable thay vì CustomerTable */}
            <CustomerTable customers={filteredCustomers} loading={loading} isBuyerMode={true} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export { CustomersPage };