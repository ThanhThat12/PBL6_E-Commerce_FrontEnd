import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Button, Spin, message, Radio } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  getRevenueStats, 
  getSalesStats, 
  exportReport,
  getShopAnalytics,
  getTopBuyers,
  getCompletedOrdersMonthly,
  getCancelledOrdersMonthly,
  getTopSellingProducts,
} from '../../services/seller/statisticalService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                     'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

/**
 * Statistical Page
 * Analytics and reports
 */
const Statistical = () => {
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [analyticsYear, setAnalyticsYear] = useState(dayjs().year());
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [groupBy, setGroupBy] = useState('day');
  
  // Order statistics
  const [orderStatsLoading, setOrderStatsLoading] = useState(false);
  const [orderStatsYear, setOrderStatsYear] = useState(dayjs().year());
  const [orderStatsType, setOrderStatsType] = useState('completed'); // 'completed' or 'cancelled'
  const [monthlyOrderStats, setMonthlyOrderStats] = useState([]);

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, groupBy]);

  useEffect(() => {
    fetchShopAnalytics(analyticsYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsYear]);

  useEffect(() => {
    fetchTopBuyers();
    fetchTopSellingProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOrderStats(orderStatsYear, orderStatsType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderStatsYear, orderStatsType]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD'),
        groupBy: groupBy,
      };

      const [revenue, sales] = await Promise.all([
        getRevenueStats(params),
        getSalesStats(params),
      ]);

      setRevenueData(revenue || []);
      setSalesData(sales || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      message.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopBuyers = async () => {
    try {
      const res = await getTopBuyers({ limit: 5 });
      const payload = res?.data || res || [];
      const list = Array.isArray(payload) ? payload : (payload?.data || payload);
      setTopBuyers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching top buyers:', error);
    }
  };

  const fetchTopSellingProducts = async () => {
    try {
      const res = await getTopSellingProducts();
      const payload = res?.data || res || [];
      const list = Array.isArray(payload) ? payload : (payload?.data || payload);
      setTopProducts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      message.error('Không thể tải danh sách sản phẩm bán chạy');
    }
  };

  const fetchShopAnalytics = async (year) => {
    try {
      setAnalyticsLoading(true);
      const res = await getShopAnalytics(year);
      const payload = res?.data || res || {};
      const monthly = payload?.monthlyRevenue || payload?.data?.monthlyRevenue || payload;
      const months = Array.isArray(monthly) ? monthly.slice() : [];
      months.sort((a, b) => (a.month || 0) - (b.month || 0));
      setMonthlyRevenue(months);
    } catch (error) {
      console.error('Error fetching shop analytics:', error);
      message.error('Không thể tải dữ liệu thống kê theo năm');
      setMonthlyRevenue([]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchOrderStats = async (year, type) => {
    try {
      setOrderStatsLoading(true);
      
      let res;
      if (type === 'completed') {
        res = await getCompletedOrdersMonthly();
      } else {
        res = await getCancelledOrdersMonthly();
      }
      
      const payload = res?.data || res || [];
      const data = Array.isArray(payload) ? payload : (payload?.data || []);
      
      // Filter by year and transform data
      const filteredData = data.filter(item => item.year === year);
      
      // Create array for all 12 months with 0 counts
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthData = filteredData.find(d => d.month === i + 1);
        return {
          month: i + 1,
          monthName: MONTH_NAMES[i],
          orderCount: monthData ? monthData.orderCount : 0,
        };
      });
      
      setMonthlyOrderStats(monthlyData);
    } catch (error) {
      console.error('Error fetching order stats:', error);
      message.error('Không thể tải dữ liệu đơn hàng');
      setMonthlyOrderStats([]);
    } finally {
      setOrderStatsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD'),
        type: 'revenue',
      };

      const blob = await exportReport(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${Date.now()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      message.success('Xuất báo cáo thành công');
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error('Không thể xuất báo cáo');
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Thống kê</h1>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          Xuất báo cáo
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={16} align="middle">
          <Col xs={24} md={12}>
            <div className="mb-2 md:mb-0">
              <span className="mr-2">Khoảng thời gian:</span>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                format="DD/MM/YYYY"
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div>
              <span className="mr-2">Nhóm theo:</span>
              <Select
                value={groupBy}
                onChange={setGroupBy}
                style={{ width: 150 }}
              >
                <Option value="day">Ngày</Option>
                <Option value="week">Tuần</Option>
                <Option value="month">Tháng</Option>
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Revenue and Order Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title={`Doanh thu theo tháng (${analyticsYear})`} extra={
            <div className="flex items-center gap-2">
              <Select
                value={analyticsYear}
                onChange={(val) => setAnalyticsYear(val)}
                style={{ width: 120 }}
              >
                {Array.from({ length: 6 }).map((_, idx) => {
                  const y = dayjs().year() - idx;
                  return (
                    <Select.Option key={y} value={y}>{y}</Select.Option>
                  );
                })}
              </Select>
            </div>
          }>
            {analyticsLoading ? (
              <div className="flex items-center justify-center" style={{ height: 300 }}>
                <Spin />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis />
                  <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Order Statistics Chart */}
        <Col xs={24} lg={12}>
          <Card 
            title={`Biểu đồ đơn hàng ${orderStatsType === 'completed' ? 'hoàn thành' : 'bị hủy'} (${orderStatsYear})`}
            extra={
              <div className="flex items-center gap-2">
                <Select
                  value={orderStatsYear}
                  onChange={(val) => setOrderStatsYear(val)}
                  style={{ width: 120 }}
                >
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const y = dayjs().year() - idx;
                    return (
                      <Select.Option key={y} value={y}>{y}</Select.Option>
                    );
                  })}
                </Select>
              </div>
            }
          >
            <div className="mb-4">
              <Radio.Group 
                value={orderStatsType} 
                onChange={(e) => setOrderStatsType(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="completed">Đơn hoàn thành</Radio.Button>
                <Radio.Button value="cancelled">Đơn bị hủy</Radio.Button>
              </Radio.Group>
            </div>
            
            {orderStatsLoading ? (
              <div className="flex items-center justify-center" style={{ height: 300 }}>
                <Spin />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyOrderStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="orderCount" 
                    fill={orderStatsType === 'completed' ? '#10b981' : '#ef4444'} 
                    name={orderStatsType === 'completed' ? 'Đơn hoàn thành' : 'Đơn bị hủy'}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Top Products and Buyers */}
      <Row gutter={[16, 16]}> 
        <Col xs={24} lg={12}>
          <Card title="Top 5 sản phẩm bán chạy">
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div 
                    key={product.productId} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      
                      {product.mainImage && (
                        <img 
                          src={product.mainImage} 
                          alt={product.productName}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      <div>
                        <div className="font-medium text-gray-900">{product.productName}</div>
                        <div className="text-sm text-gray-500">
                          Đã bán: <span className="font-semibold text-blue-600">{product.totalQuantitySold}</span> sản phẩm
                        </div>
                        <div className="text-xs text-gray-400">
                          {product.totalOrders} đơn hàng
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu sản phẩm bán chạy
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Top 5 người mua (Buyers)">
            {topBuyers.length > 0 ? (
              <div className="space-y-3">
                {topBuyers.map((buyer, index) => (
                  <div key={buyer.userId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{index + 1}</div>
                      <div>
                        <div className="font-medium text-gray-900">{buyer.username}</div>
                        <div className="text-sm text-gray-500">{buyer.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(buyer.totalAmount)}</div>
                      <div className="text-sm text-gray-500">{buyer.totalCompletedOrders} đơn</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu người mua
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistical;
