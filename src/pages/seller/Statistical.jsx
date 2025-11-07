import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Button, Spin, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  getRevenueStats, 
  getSalesStats, 
  getTopProducts,
  exportReport 
} from '../../services/seller/statisticalService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Statistical Page
 * Analytics and reports
 */
const Statistical = () => {
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, groupBy]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD'),
        groupBy: groupBy,
      };

      const [revenue, sales, products] = await Promise.all([
        getRevenueStats(params),
        getSalesStats(params),
        getTopProducts({ ...params, limit: 5 }),
      ]);

      setRevenueData(revenue || []);
      setSalesData(sales || []);
      setTopProducts(products || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      message.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
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

      {/* Revenue Chart */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Biểu đồ doanh thu">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Sales Chart */}
        <Col xs={24} lg={12}>
          <Card title="Biểu đồ đơn hàng">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="sales" 
                  fill="#10b981" 
                  name="Số đơn hàng"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top Products */}
      <Card title="Top 5 sản phẩm bán chạy">
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    Đã bán: {product.soldCount} | 
                    Doanh thu: {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.revenue)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Statistical;
