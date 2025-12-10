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
  bgColor = 'bg-gradient-to-br from-blue-500 to-blue-600' 
}) => {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }[trendType];

  const trendIcon = {
    up: '📈',
    down: '📉',
    neutral: '➡️',
  }[trendType];

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-gray-500 text-sm mb-2 font-medium">{title}</p>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trendColor} font-medium flex items-center gap-1`}>
              <span>{trendIcon}</span>
              {trend}
            </p>
          )}
        </div>
        <div className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center text-white text-2xl shadow-lg transform hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
