import React from 'react';
import { Card, List, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './AddNewProduct.css';

export const AddNewProduct = ({ categories, products }) => {
  return (
    <div className="add-product-section">
      {/* Categories */}
      <Card 
        title="Add New Product" 
        className="add-product-card"
        extra={<Button type="link" icon={<PlusOutlined />}>Add New</Button>}
      >
        <div className="section-label">Categories</div>
        <List
          dataSource={categories}
          renderItem={(item) => (
            <List.Item className="category-item">
              <div className="category-content">
                <span className="category-icon">{item.icon}</span>
                <span className="category-name">{item.name}</span>
              </div>
              <span className="arrow">›</span>
            </List.Item>
          )}
        />
        
        <div className="see-more">
          <Button type="link">See more</Button>
        </div>

        {/* Products */}
        <div className="section-label" style={{ marginTop: '24px' }}>Product</div>
        <List
          dataSource={products}
          renderItem={(item) => (
            <List.Item className="product-item">
              <div className="product-content">
                <span className="product-icon">{item.icon}</span>
                <div className="product-info">
                  <div className="product-name">{item.name}</div>
                  <div className="product-price">{item.price}</div>
                </div>
              </div>
              <Button type="primary" className="add-btn" size="small">
                {item.buttonText}
              </Button>
            </List.Item>
          )}
        />
        
        <div className="see-more">
          <Button type="link">See more</Button>
        </div>
      </Card>
    </div>
  );
};
