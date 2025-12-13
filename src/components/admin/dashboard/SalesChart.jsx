import React from "react";

const SalesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Tổng Quan Doanh Thu</h3>
        </div>
        <div className="chart-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Chưa có dữ liệu</p>
        </div>
      </div>
    );
  }

  // Convert revenue to number if it's string, and find max
  const maxValue = Math.max(...data.map(item => {
    const revenue = typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue;
    return revenue || 0;
  }));
  
  console.log('📊 Chart Data:', data);
  console.log('📊 Max Value:', maxValue);
  
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Tổng Quan Doanh Thu</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#3B82F6' }}></div>
            <span>Doanh Thu</span>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <div className="bar-chart">
          {data.map((item, index) => {
            const revenue = typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue;
            const displayRevenue = revenue || 0;
            const heightPercent = maxValue > 0 ? (displayRevenue / maxValue) * 100 : 0;
            
            // Debug log
            console.log(`Cột ${item.label}: Revenue=${displayRevenue}, Height=${heightPercent}%`);
            
            return (
              <div key={index} className="bar-item">
                <div 
                  className="bar"
                  style={{ 
                    height: heightPercent > 0 ? `${heightPercent}%` : '2px',
                    backgroundColor: displayRevenue > 0 ? '#3B82F6' : '#E2E8F0',
                    opacity: displayRevenue > 0 ? 1 : 0.3,
                    alignSelf: 'flex-end',
                    maxHeight: '100%'
                  }}
                >
                  {displayRevenue > 0 && (
                    <div className="bar-tooltip">
                      {item.label}: {displayRevenue.toLocaleString('vi-VN')}đ
                      <br/>
                      <small>{item.orderCount} đơn hàng</small>
                    </div>
                  )}
                </div>
                <span className="bar-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalesChart;