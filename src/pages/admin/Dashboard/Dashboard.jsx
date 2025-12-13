import React, { useState, useEffect } from "react";
import Layout from "../../../components/admin/layout/Layout";
import DashboardHeader from "../../../components/admin/dashboard/DashboardHeader";
import StatsCards from "../../../components/admin/dashboard/StatsCards";
import SalesChart from "../../../components/admin/dashboard/SalesChart";
import CategoryChart from "../../../components/admin/dashboard/CategoryChart";
import TopProductsTable from "../../../components/admin/dashboard/TopProductsTable";
import RecentOrdersTable from "../../../components/admin/dashboard/RecentOrdersTable";
import ActivityFeed from "../../../components/admin/dashboard/ActivityFeed";
import adminDashboardService from "../../../services/adminDashboardService";
import "./Dashboard.css";

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState("thisWeek");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    categories: [],
    topProducts: [],
    recentOrders: [],
    revenueChart: []
  });

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [stats, categories, topProducts, recentOrders, revenueChart] = await Promise.all([
          adminDashboardService.getDashboardStats(),
          adminDashboardService.getSalesByCategory(),
          adminDashboardService.getTopSellingProducts(10),
          adminDashboardService.getRecentOrders(10),
          adminDashboardService.getRevenueChart(12)
        ]);

        setDashboardData({
          stats,
          categories,
          topProducts,
          recentOrders,
          revenueChart
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format stats data for StatsCards component
  const formatStatsData = () => {
    if (!dashboardData.stats) return [];

    return [
      {
        value: `${dashboardData.stats.totalRevenue?.toLocaleString('vi-VN')}đ`,
        label: "Tổng Doanh Thu",
        change: `${dashboardData.stats.revenueGrowth > 0 ? '+' : ''}${dashboardData.stats.revenueGrowth}%`,
        color: "#3B82F6",
        icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      },
      {
        value: dashboardData.stats.totalOrders?.toString() || "0",
        label: "Tổng Đơn Hàng",
        change: `${dashboardData.stats.ordersGrowth > 0 ? '+' : ''}${dashboardData.stats.ordersGrowth}%`,
        color: "#10B981",
        icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      },
      {
        value: dashboardData.stats.activeCustomers?.toString() || "0",
        label: "Khách Hàng Hoạt Động",
        change: `${dashboardData.stats.customersGrowth > 0 ? '+' : ''}${dashboardData.stats.customersGrowth}%`,
        color: "#F59E0B",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      },
      {
        value: `${dashboardData.stats.conversionRate}%`,
        label: "Tỷ Lệ Chuyển Đổi",
        change: `${dashboardData.stats.conversionGrowth > 0 ? '+' : ''}${dashboardData.stats.conversionGrowth}%`,
        color: "#EF4444",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      }
    ];
  };

  // Format category data for CategoryChart component
  const formatCategoryData = () => {
    return dashboardData.categories.map(cat => ({
      name: cat.categoryName,
      value: Math.round(cat.totalSales / 1000), // Convert to K
      orderCount: cat.orderCount
    }));
  };

  // Format top products data for TopProductsTable component
  const formatTopProducts = () => {
    return dashboardData.topProducts.map(product => ({
      name: product.productName,
      sku: `PRD${product.productId}`,
      category: product.categoryName,
      sales: product.quantitySold,
      revenue: product.totalRevenue?.toLocaleString('vi-VN'),
      status: product.status,
      image: product.mainImage
    }));
  };

  // Format recent orders data for RecentOrdersTable component
  const formatRecentOrders = () => {
    return dashboardData.recentOrders.map(order => ({
      id: order.id,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        avatar: null
      },
      date: new Date(order.orderDate).toLocaleDateString('vi-VN'),
      amount: order.totalAmount?.toLocaleString('vi-VN'),
      status: translateStatus(order.status)
    }));
  };

  // Translate order status to Vietnamese
  const translateStatus = (status) => {
    const statusMap = {
      'PENDING': 'Chờ xử lý',
      'PROCESSING': 'Đang xử lý',
      'SHIPPING': 'Đang giao',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  // Format sales data for SalesChart - using revenue chart data from API
  const formatSalesData = () => {
    if (!dashboardData.revenueChart || dashboardData.revenueChart.length === 0) {
      return [];
    }
    
    return dashboardData.revenueChart.map(item => ({
      label: item.period,
      revenue: item.revenue,
      orderCount: item.orderCount
    }));
  };

  const statsData = [
    {
      value: "$2,847,532",
      label: "Total Revenue",
      change: "+24.7% from last month",
      color: "#3B82F6",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      value: "14,358",
      label: "Total Orders",
      change: "+32.1% from last month",
      color: "#10B981",
      icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    },
    {
      value: "8,924",
      label: "Active Customers",
      change: "+18.6% from last month",
      color: "#F59E0B",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    },
    {
      value: "94.2%",
      label: "Conversion Rate", 
      change: "+3.2% from last month",
      color: "#EF4444",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    }
  ];

  const salesData = [
    { month: "Jan", sales: 185 },
    { month: "Feb", sales: 240 },
    { month: "Mar", sales: 195 },
    { month: "Apr", sales: 320 },
    { month: "May", sales: 285 },
    { month: "Jun", sales: 410 },
    { month: "Jul", sales: 375 },
    { month: "Aug", sales: 465 }
  ];

  const activities = [
    {
      text: "Đơn hàng mới từ khách hàng",
      time: "2 phút trước",
      type: "order"
    },
    {
      text: "Sản phẩm được cập nhật kho",
      time: "15 phút trước", 
      type: "product"
    },
    {
      text: "Khách hàng mới đăng ký",
      time: "45 phút trước",
      type: "user"
    },
    {
      text: "Thanh toán được xử lý thành công",
      time: "1 giờ trước",
      type: "payment"
    }
  ];
  
  const handleExport = () => {
    // Export functionality placeholder
  };

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div>Đang tải dữ liệu...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-main">
        {/* Premium Dashboard Header */}
        <DashboardHeader 
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onExport={handleExport}
        />

        {/* Key Performance Metrics */}
        <StatsCards stats={formatStatsData()} />

        {/* Analytics Charts Section */}
        <div className="charts-container">
          <SalesChart data={formatSalesData()} />
          <CategoryChart data={formatCategoryData()} />
        </div>

        {/* Top Selling Products - Full Width Row */}
        <div className="table-section">
          <TopProductsTable products={formatTopProducts()} />
        </div>

        {/* Recent Orders - Full Width Row */}
        <div className="table-section">
          <RecentOrdersTable orders={formatRecentOrders()} />
        </div>

        {/* Real-time Activity Stream */}
        <ActivityFeed activities={activities} />
      </div>
    </Layout>
  );
};

export default DashboardPage;