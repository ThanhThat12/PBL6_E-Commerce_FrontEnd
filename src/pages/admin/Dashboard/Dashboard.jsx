import React, { useState } from "react";
import Layout from "../../../components/admin/layout/Layout";
import DashboardHeader from "../../../components/admin/dashboard/DashboardHeader";
import StatsCards from "../../../components/admin/dashboard/StatsCards";
import SalesChart from "../../../components/admin/dashboard/SalesChart";
import CategoryChart from "../../../components/admin/dashboard/CategoryChart";
import TopProductsTable from "../../../components/admin/dashboard/TopProductsTable";
import RecentOrdersTable from "../../../components/admin/dashboard/RecentOrdersTable";
import ActivityFeed from "../../../components/admin/dashboard/ActivityFeed";
import "./Dashboard.css";

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState("thisWeek");

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

  const categoryData = [
    { name: "Electronics", value: 145 },
    { name: "Fashion", value: 98 },
    { name: "Home & Garden", value: 67 },
    { name: "Sports", value: 45 }
  ];

  const topProducts = [
    {
      name: "iPhone 15 Pro Max",
      sku: "IP15PM001",
      category: "Electronics",
      sales: 2847,
      revenue: "2,847,000",
      status: "Active",
      image: "https://via.placeholder.com/48x48"
    },
    {
      name: "MacBook Pro M3",
      sku: "MBP24001", 
      category: "Electronics",
      sales: 1596,
      revenue: "3,592,800",
      status: "Active",
      image: "https://via.placeholder.com/48x48"
    },
    {
      name: "AirPods Pro Gen 2",
      sku: "APP2024",
      category: "Electronics", 
      sales: 3456,
      revenue: "863,400",
      status: "Active",
      image: "https://via.placeholder.com/48x48"
    }
  ];

  const recentOrders = [
    {
      id: "ORD2024001",
      customer: {
        name: "Alexander Chen",
        email: "alexander.chen@email.com",
        avatar: "https://via.placeholder.com/40x40"
      },
      date: "2024-10-13",
      amount: "2,459.99",
      status: "Completed"
    },
    {
      id: "ORD2024002", 
      customer: {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        avatar: "https://via.placeholder.com/40x40"
      },
      date: "2024-10-13",
      amount: "1,299.00",
      status: "Processing"
    },
    {
      id: "ORD2024003",
      customer: {
        name: "Michael Rodriguez", 
        email: "michael.r@email.com",
        avatar: "https://via.placeholder.com/40x40"
      },
      date: "2024-10-12",
      amount: "3,847.50",
      status: "Shipped"
    }
  ];

  const activities = [
    {
      text: "New high-value order received from Alexander Chen",
      time: "2 minutes ago",
      type: "order"
    },
    {
      text: "iPhone 15 Pro Max inventory restocked",
      time: "15 minutes ago", 
      type: "product"
    },
    {
      text: "Premium customer Sarah Johnson registered",
      time: "45 minutes ago",
      type: "user"
    },
    {
      text: "Payment of $3,847.50 processed successfully",
      time: "1 hour ago",
      type: "payment"
    }
  ];

  const handleExport = () => {
    console.log('Exporting dashboard data...');
  };

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
        <StatsCards stats={statsData} />

        {/* Analytics Charts Section */}
        <div className="charts-container">
          <SalesChart data={salesData} />
          <CategoryChart data={categoryData} />
        </div>

        {/* Top Selling Products - Full Width Row */}
        <div className="table-section">
          <TopProductsTable products={topProducts} />
        </div>

        {/* Recent Orders - Full Width Row */}
        <div className="table-section">
          <RecentOrdersTable orders={recentOrders} />
        </div>

        {/* Real-time Activity Stream */}
        <ActivityFeed activities={activities} />
      </div>
    </Layout>
  );
};

export default DashboardPage;