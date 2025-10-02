import React from 'react';
import { Card } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  UserAddOutlined, 
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined 
} from '@ant-design/icons';
import './CustomerStatsCard.css';

export const CustomerStatsCard = ({ title, value, change, icon, color }) => {
  const isPositive = change >= 0;
  
  const getIcon = () => {
    switch (icon) {
      case 'users': return <UserOutlined />;
      case 'active': return <TeamOutlined />;
      case 'new': return <UserAddOutlined />;
      case 'revenue': return <DollarOutlined />;
      default: return <UserOutlined />;
    }
  };

  return (
    <Card className="customer-stats-card">
      <div className="stats-content">
        <div className="stats-icon" style={{ background: color }}>
          {getIcon()}
        </div>
        <div className="stats-info">
          <div className="stats-title">{title}</div>
          <div className="stats-value">{value}</div>
          <div className={`stats-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span>{Math.abs(change)}% vs last month</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
