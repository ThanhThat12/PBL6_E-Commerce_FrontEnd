import React from 'react';
import { Card, Progress } from 'antd';
import './CustomerSegmentCard.css';

export const CustomerSegmentCard = ({ segments }) => {
  return (
    <Card className="segment-card" title="Customer Segments">
      <div className="segment-list">
        {segments?.map((segment, index) => (
          <div key={index} className="segment-item">
            <div className="segment-header">
              <div className="segment-info">
                <div 
                  className="segment-dot" 
                  style={{ background: segment.color }}
                ></div>
                <span className="segment-name">{segment.name}</span>
              </div>
              <div className="segment-stats">
                <span className="segment-count">{segment.count}</span>
                <span className="segment-percentage">{segment.percentage}%</span>
              </div>
            </div>
            <Progress 
              percent={segment.percentage} 
              strokeColor={segment.color}
              showInfo={false}
              strokeWidth={8}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
