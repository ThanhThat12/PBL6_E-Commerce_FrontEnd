import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, message } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { StatCard, RevenueChart, RecentOrdersTable } from '../../components/seller/Dashboard';
import { getDashboardStats, getRevenueStats, getRecentOrders } from '../../services/seller/dashboardService';

/**
 * Seller Dashboard Page
 * Overview statistics, charts, recent orders
 */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsData, revenueData, ordersData] = await Promise.all([
        getDashboardStats(),
        getRevenueStats('month'),
        getRecentOrders(5),
      ]);

      setStats(statsData);
      setRevenueData(revenueData);
      setRecentOrders(ordersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<DollarOutlined />}
            title="Tổng doanh thu"
            value={new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(stats?.totalRevenue || 0)}
            trend="+12% từ tháng trước"
            trendType="up"
            bgColor="bg-green-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<ShoppingCartOutlined />}
            title="Tổng đơn hàng"
            value={stats?.totalOrders || 0}
            trend="+8% từ tháng trước"
            trendType="up"
            bgColor="bg-blue-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<ShoppingOutlined />}
            title="Tổng sản phẩm"
            value={stats?.totalProducts || 0}
            trend="+3 sản phẩm mới"
            trendType="neutral"
            bgColor="bg-purple-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon={<UserOutlined />}
            title="Khách hàng"
            value={stats?.totalCustomers || 0}
            trend="+5% từ tháng trước"
            trendType="up"
            bgColor="bg-orange-500"
          />
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <RevenueChart data={revenueData} title="Biểu đồ doanh thu tháng này" />
        </Col>
        <Col xs={24} lg={8}>
          <RecentOrdersTable orders={recentOrders} loading={false} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
