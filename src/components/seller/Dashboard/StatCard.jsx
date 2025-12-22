import React from 'react';
import { Card } from 'antd';

/**
 * StatCard Component
 * Display a statistic with icon, title, value, and optional trend
 * 
 * @param {object} props
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.trend - Trend text (e.g., "+12% from last month")
 * @param {string} props.trendType - "up" | "down" | "neutral"
 * @param {string} props.bgColor - Background color class
 */
const StatCard = ({ 
  icon, 
  title, 
  value, 
  trend, 
  trendType = 'neutral',
  bgColor = 'bg-blue-500' 
}) => {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }[trendType];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {trend && (
            <p className={`text-xs mt-1 ${trendColor}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
