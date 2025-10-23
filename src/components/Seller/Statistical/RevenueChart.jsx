import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import './RevenueChart.css';

const RevenueChart = ({ data, year }) => {
  // Màu sắc cho các cột
  const COLORS = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d',
    '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16',
    '#52c41a', '#1890ff', '#722ed1', '#faad14'
  ];

  // Format tiền VND
  const formatCurrency = (value) => {
    if (value === 0) return '0';
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title">Tháng {data.month}/{year}</p>
          <p className="tooltip-revenue">
            <span className="tooltip-label">Doanh thu:</span>
            <span className="tooltip-value">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(data.revenue)}
            </span>
          </p>
          <p className="tooltip-orders">
            <span className="tooltip-label">Đơn hàng:</span>
            <span className="tooltip-value">{data.orders} đơn</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Tên tháng cho trục X
  const getMonthName = (monthNumber) => {
    return `T${monthNumber}`;
  };

  // Chuẩn bị data cho chart
  const chartData = data.map((item) => ({
    ...item,
    monthName: getMonthName(item.month),
  }));

  return (
    <div className="revenue-chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="monthName"
            tick={{ fill: '#595959', fontSize: 14 }}
            axisLine={{ stroke: '#d9d9d9' }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: '#595959', fontSize: 14 }}
            axisLine={{ stroke: '#d9d9d9' }}
            label={{
              value: 'Doanh thu (VNĐ)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#595959', fontSize: 14, fontWeight: 600 },
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(24, 144, 255, 0.1)' }} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={() => 'Doanh thu'}
          />
          <Bar
            dataKey="revenue"
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.revenue > 0 ? COLORS[index % COLORS.length] : '#d9d9d9'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
