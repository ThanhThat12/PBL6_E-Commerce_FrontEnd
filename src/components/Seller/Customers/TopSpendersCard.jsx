import React from 'react';
import { Card, List, Avatar, Button } from 'antd';
import { TrophyOutlined, ShoppingOutlined } from '@ant-design/icons';
import './TopSpendersCard.css';

export const TopSpendersCard = ({ topSpenders }) => {
  return (
    <Card 
      className="top-spenders-card"
      title={
        <div className="card-title">
          <TrophyOutlined style={{ color: '#FFD700', fontSize: '18px' }} />
          <span>Top Spenders</span>
        </div>
      }
      extra={<Button type="link">View All</Button>}
    >
      <List
        dataSource={topSpenders}
        renderItem={(customer, index) => (
          <List.Item className="spender-item">
            <div className="spender-rank">#{index + 1}</div>
            <Avatar size={44} className="spender-avatar">
              {customer.avatar}
            </Avatar>
            <div className="spender-info">
              <div className="spender-name">{customer.name}</div>
              <div className="spender-orders">
                <ShoppingOutlined style={{ fontSize: '12px' }} />
                <span>{customer.orders} orders</span>
              </div>
            </div>
            <div className="spender-amount">{customer.spent}</div>
          </List.Item>
        )}
      />
    </Card>
  );
};
