import React, { useState, useEffect } from 'react';
import { Layout, Card, Select, message, Spin } from 'antd';
import { CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import { Sidebar, Header } from '../../components/Seller';
import RevenueChart from '../../components/Seller/Statistical/RevenueChart';
import StatisticalSummary from '../../components/Seller/Statistical/StatisticalSummary';
import statisticalService from '../../services/statisticalService';
import './StatisticalPage.css';

const { Content } = Layout;
const { Option } = Select;

const StatisticalPage = () => {
  const currentYear = new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách năm khi component mount
  useEffect(() => {
    fetchAvailableYears();
  }, []);

  // Fetch dữ liệu khi năm thay đổi
  useEffect(() => {
    if (selectedYear) {
      fetchRevenueData(selectedYear);
    }
  }, [selectedYear]);

  const fetchAvailableYears = async () => {
    try {
      const years = await statisticalService.getAvailableYears();
      setAvailableYears(years);
      
      // Nếu năm hiện tại không có trong danh sách, thêm vào
      const finalYears = years.includes(currentYear) ? years : [currentYear, ...years];
      setAvailableYears(finalYears);
      
      // Nếu chưa có năm được chọn, chọn năm đầu tiên trong danh sách
      if (!selectedYear && finalYears.length > 0) {
        setSelectedYear(finalYears[0]);
      }
    } catch (error) {
      console.error('❌ Error fetching available years:', error);
      message.error('Không thể tải danh sách năm');
      
      // Fallback: sử dụng năm hiện tại
      const fallbackYears = [currentYear, currentYear - 1, currentYear - 2];
      setAvailableYears(fallbackYears);
      if (!selectedYear) {
        setSelectedYear(currentYear);
      }
    }
  };

  const fetchRevenueData = async (year) => {
    setLoading(true);
    try {
      console.log('📊 Fetching revenue data for year:', year);
      const data = await statisticalService.getRevenueByYear(year);
      console.log('✅ Revenue data received:', data);
      setRevenueData(data);
    } catch (error) {
      console.error('❌ Error fetching revenue data:', error);
      message.error(`Không thể tải dữ liệu thống kê cho năm ${year}`);
      
      // Set empty data để tránh crash UI
      setRevenueData({
        year: year,
        monthlyRevenue: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          revenue: 0,
          orders: 0
        })),
        summary: {
          totalRevenue: 0,
          totalOrders: 0,
          averageRevenue: 0,
          highestMonth: { month: 1, revenue: 0, orders: 0 },
          lowestMonth: { month: 1, revenue: 0, orders: 0 },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  return (
    <Layout className="statistical-page-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>

      <Layout>
        <Header />
        <Content className="statistical-page-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-title-section">
              <BarChartOutlined className="page-icon" />
              <h1 className="page-title">Thống kê doanh thu</h1>
            </div>
            <div className="year-selector-section">
              <CalendarOutlined className="calendar-icon" />
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                className="year-selector"
                placeholder="Chọn năm"
                size="large"
              >
                {availableYears.map((year) => (
                  <Option key={year} value={year}>
                    Năm {year}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
          ) : (
            <>
              {/* Summary Statistics */}
              {revenueData && (
                <StatisticalSummary
                  summary={revenueData.summary}
                  year={selectedYear}
                />
              )}

              {/* Revenue Chart */}
              <Card
                className="chart-card"
                title={
                  <div className="chart-card-title">
                    <BarChartOutlined />
                    <span>Biểu đồ doanh thu theo tháng - Năm {selectedYear}</span>
                  </div>
                }
              >
                {revenueData && (
                  <RevenueChart
                    data={revenueData.monthlyRevenue}
                    year={selectedYear}
                  />
                )}
              </Card>

              {/* Monthly Details Table */}
              {revenueData && (
                <Card className="details-card" title="Chi tiết theo tháng">
                  <div className="monthly-details-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Tháng</th>
                          <th>Doanh thu</th>
                          <th>Đơn hàng</th>
                          <th>Trung bình/đơn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.monthlyRevenue.map((item) => (
                          <tr key={item.month} className={item.revenue === 0 ? 'empty-month' : ''}>
                            <td className="month-cell">Tháng {item.month}</td>
                            <td className="revenue-cell">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(item.revenue)}
                            </td>
                            <td className="orders-cell">{item.orders} đơn</td>
                            <td className="average-cell">
                              {item.orders > 0
                                ? new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                  }).format(item.revenue / item.orders)
                                : '0 ₫'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="total-row">
                          <td className="total-label">Tổng cộng</td>
                          <td className="total-revenue">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(revenueData.summary.totalRevenue)}
                          </td>
                          <td className="total-orders">
                            {revenueData.summary.totalOrders} đơn
                          </td>
                          <td className="total-average">
                            {revenueData.summary.totalOrders > 0
                              ? new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(
                                  revenueData.summary.totalRevenue /
                                    revenueData.summary.totalOrders
                                )
                              : '0 ₫'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StatisticalPage;
