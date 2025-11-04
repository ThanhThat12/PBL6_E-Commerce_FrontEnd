import React from "react";

const StatsCards = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stats-card">
          <div className="stats-content">
            <div className="stats-icon" style={{ backgroundColor: stat.color }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
              </svg>
            </div>
            <div className="stats-info">
              <h3 className="stats-value">{stat.value}</h3>
              <p className="stats-label">{stat.label}</p>
              <p className={`stats-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {stat.change}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;