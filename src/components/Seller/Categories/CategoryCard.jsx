import React from 'react';
import { Card } from 'antd';
import './CategoryCard.css';

export const CategoryCard = ({ category }) => {
  return (
    <Card className="category-card" hoverable>
      <div className="category-icon">{category.icon}</div>
      <div className="category-name">{category.name}</div>
    </Card>
  );
};
