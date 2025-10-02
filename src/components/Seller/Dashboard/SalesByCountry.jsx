import React from 'react';
import { Card, Progress } from 'antd';
import './SalesByCountry.css';

export const SalesByCountry = ({ countries }) => {
  return (
    <Card title="Sales by Country" className="sales-country-card">
      <div className="country-list">
        {countries?.map((country) => (
          <div key={country.id} className="country-item">
            <div className="country-info">
              <span className="country-flag">{country.flag}</span>
              <div className="country-details">
                <div className="country-name">{country.name}</div>
                <div className="country-sales">{country.sales}</div>
              </div>
            </div>
            <div className="country-progress">
              <Progress 
                percent={country.percentage} 
                strokeColor="#667eea"
                showInfo={false}
                size="small"
              />
            </div>
            <div className={`country-change ${country.change > 0 ? 'positive' : 'negative'}`}>
              {country.change > 0 ? '▲' : '▼'} {Math.abs(country.change)}%
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
