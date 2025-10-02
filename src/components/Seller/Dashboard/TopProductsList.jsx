import React from 'react';
import { Card, List, Avatar } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import './TopProductsList.css';

export const TopProductsList = ({ products }) => {
  return (
    <Card className="top-products-card" title={
      <div className="top-products-header">
        <TrophyOutlined style={{ color: '#FFD700', fontSize: '20px' }} />
        <span>Top Selling Products</span>
      </div>
    }>
      <List
        dataSource={products || []}
        renderItem={(item, index) => (
          <List.Item className="product-item">
            <div className="product-rank">#{index + 1}</div>
            <div className="product-info">
              <div className="product-name">{item.name}</div>
              <div className="product-sales">{item.sold} sold</div>
            </div>
            <div className="product-chart">
              <div className="mini-chart">
                {/* Mini sparkline chart - optional */}
                <svg width="60" height="30" viewBox="0 0 60 30">
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    points={`0,${30 - (item.trend?.[0] || 0)}, 20,${30 - (item.trend?.[1] || 0)}, 40,${30 - (item.trend?.[2] || 0)}, 60,${30 - (item.trend?.[3] || 0)}`}
                  />
                </svg>
              </div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};
