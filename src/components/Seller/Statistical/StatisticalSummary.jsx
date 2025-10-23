import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import './StatisticalSummary.css';

const StatisticalSummary = ({ summary, year }) => {
  if (!summary) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getMonthName = (month) => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return monthNames[month - 1];
  };

  return (
    <div className="statistical-summary">
      <Row gutter={[16, 16]}>
        {/* Tổng doanh thu */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card total-revenue">
            <Statistic
              title={`Tổng doanh thu ${year}`}
              value={summary.totalRevenue}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 700 }}
            />
          </Card>
        </Col>

        {/* Tổng đơn hàng */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card total-orders">
            <Statistic
              title={`Tổng đơn hàng ${year}`}
              value={summary.totalOrders}
              suffix="đơn"
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 700 }}
            />
          </Card>
        </Col>

        {/* Doanh thu trung bình */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card average-revenue">
            <Statistic
              title="Trung bình/tháng"
              value={summary.averageRevenue}
              formatter={(value) => formatCurrency(value)}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: 700 }}
            />
          </Card>
        </Col>

        {/* Tháng cao nhất */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="summary-card highest-month">
            <div className="stat-content">
              <div className="stat-icon">
                <TrophyOutlined />
              </div>
              <div className="stat-details">
                <div className="stat-title">Tháng cao nhất</div>
                <div className="stat-month">{getMonthName(summary.highestMonth.month)}</div>
                <div className="stat-value">{formatCurrency(summary.highestMonth.revenue)}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Thông tin bổ sung */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} md={12}>
          <Card className="info-card highest-info">
            <div className="info-header">
              <RiseOutlined className="info-icon up" />
              <span className="info-title">Tháng doanh thu cao nhất</span>
            </div>
            <div className="info-content">
              <div className="info-month">{getMonthName(summary.highestMonth.month)} {year}</div>
              <div className="info-revenue">{formatCurrency(summary.highestMonth.revenue)}</div>
              <div className="info-orders">{summary.highestMonth.orders} đơn hàng</div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card className="info-card lowest-info">
            <div className="info-header">
              <FallOutlined className="info-icon down" />
              <span className="info-title">Tháng doanh thu thấp nhất</span>
            </div>
            <div className="info-content">
              <div className="info-month">{getMonthName(summary.lowestMonth.month)} {year}</div>
              <div className="info-revenue">{formatCurrency(summary.lowestMonth.revenue)}</div>
              <div className="info-orders">{summary.lowestMonth.orders} đơn hàng</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticalSummary;
