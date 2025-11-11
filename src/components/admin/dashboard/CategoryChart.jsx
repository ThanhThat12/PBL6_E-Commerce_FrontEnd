import React from "react";

const CategoryChart = ({ data }) => {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let cumulativePercentage = 0;
  
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Sales by Category</h3>
      </div>
      <div className="chart-container">
        <div className="donut-chart-container">
          <svg className="donut-chart" viewBox="0 0 120 120">
            <circle 
              cx="60" 
              cy="60" 
              r="40" 
              fill="none" 
              stroke="#f3f4f6" 
              strokeWidth="20"
            />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage * 2.51} 251.2`;
              const strokeDashoffset = -cumulativePercentage * 2.51;
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="60"
                  cy="60"
                  r="40"
                  fill="none"
                  stroke={colors[index]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 60 60)"
                />
              );
            })}
          </svg>
          <div className="donut-center">
            <span className="donut-total">${total}k</span>
            <span className="donut-label">Total Sales</span>
          </div>
        </div>
        <div className="donut-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: colors[index] }}
              ></div>
              <span className="legend-text">{item.name}</span>
              <span className="legend-value">${item.value}k</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;