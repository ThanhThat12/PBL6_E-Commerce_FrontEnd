import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  TruckOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import './OrderStats.css';

const OrderStats = ({ statistics }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const statsData = [
    {
      title: 'Tổng đơn hàng',
      value: statistics?.totalOrders || 0,
      icon: <ShoppingCartOutlined />,
      color: '#1890ff',
      bgColor: '#e6f7ff',
    },
    {
      title: 'Chờ xử lý',
      value: statistics?.pendingOrders || 0,
      icon: <ClockCircleOutlined />,
      color: '#faad14',
      bgColor: '#fffbe6',
    },
    {
      title: 'Đang xử lý',
      value: statistics?.processingOrders || 0,
      icon: <SyncOutlined />,
      color: '#13c2c2',
      bgColor: '#e6fffb',
    },
    {
      title: 'Hoàn thành',
      value: statistics?.completedOrders || 0,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      bgColor: '#f6ffed',
    },
    {
      title: 'Đã hủy',
      value: statistics?.cancelledOrders || 0,
      icon: <CloseCircleOutlined />,
      color: '#ff4d4f',
      bgColor: '#fff2f0',
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(statistics?.totalRevenue || 0),
      color: '#52c41a',
      bgColor: '#f6ffed',
      prefix: '',
    },
  ];

  return (
    <div className="order-stats">
      <Row gutter={[16, 16]}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={4} key={index}>
            <Card className="stat-card" bordered={false}>
              <div className="stat-content">
                <div
                  className="stat-icon"
                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  valueStyle={{ color: stat.color, fontSize: '20px' }}
                  prefix={stat.prefix}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default OrderStats;
