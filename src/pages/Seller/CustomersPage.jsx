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
    const [customersData, statsData] = await Promise.all([
      customerService.getCustomers(),
      customerService.getCustomerStats(),
    ]);
    setCustomers(customersData);
    setStats(statsData);
    setLoading(false);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchSearch = customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
                       customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
                       customer.phone.includes(searchText);
    const matchStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchSearch && matchStatus;
  });

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
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Customers Management</h1>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                className="add-customer-btn"
              >
                Add Customer
              </Button>
              <Dropdown menu={moreActionsMenu} trigger={['click']}>
                <Button icon={<MoreOutlined />}>More Actions</Button>
              </Dropdown>
            </Space>
          </div>

          {/* Stats Cards */}
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
          </Row>

          {/* Top Spenders & Customer Segments */}
          <Row gutter={[24, 24]} className="insights-section">
            <Col xs={24} lg={12}>
              <TopSpendersCard topSpenders={stats?.topSpenders} />
            </Col>
            <Col xs={24} lg={12}>
              <CustomerSegmentCard segments={stats?.customerSegments} />
            </Col>
          </Row>

          {/* Customers Table */}
          <div className="table-section">
            <div className="table-header">
              <h2 className="table-title">All Customers ({filteredCustomers.length})</h2>
              <Space className="table-actions">
                <Input
                  placeholder="Search customers..."
                  prefix={<SearchOutlined />}
                  className="search-input"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
                <Select
                  defaultValue="all"
                  style={{ width: 150 }}
                  onChange={(value) => setFilterStatus(value)}
                  className="status-filter"
                >
                  <Option value="all">All Status</Option>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="blocked">Blocked</Option>
                </Select>
                <Button icon={<FilterOutlined />}>Filters</Button>
                <Button icon={<DownloadOutlined />}>Export</Button>
              </Space>
            </div>
            
            <CustomerTable customers={filteredCustomers} loading={loading} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export { CustomersPage };