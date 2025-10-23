import React from "react";

const SalesChart = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.sales));
  
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Sales Overview</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#3B82F6' }}></div>
            <span>Sales</span>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <div className="bar-chart">
          {data.map((item, index) => (
            <div key={index} className="bar-item">
              <div 
                className="bar"
                style={{ 
                  height: `${(item.sales / maxValue) * 100}%`,
                  backgroundColor: '#3B82F6'
                }}
              >
                <div className="bar-tooltip">
                  {item.month}: ${item.sales}k
                </div>
              </div>
              <span className="bar-label">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesChart;