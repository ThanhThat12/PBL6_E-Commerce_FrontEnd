import React from 'react';
import { Card } from 'antd';
import './CategoryCard.css';

export const CategoryCard = ({ category, onClick, isSelected }) => {
  return (
    <Card 
      className={`category-card ${isSelected ? 'selected' : ''}`} 
      hoverable 
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="category-icon">{category.icon}</div>
      <div className="category-name">{category.name}</div>
    </Card>
  );
};
