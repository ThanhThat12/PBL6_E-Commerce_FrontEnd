import React from 'react';
import { Card, Row, Col, Tag, Button, Space, Empty } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import './ProductGrid.css';

const ProductGrid = ({ 
  products, 
  loading, 
  onViewDetail, 
  onEdit, 
  onDelete 
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (!loading && (!products || products.length === 0)) {
    return (
      <Card className="product-grid-card">
        <Empty
          description="Không có sản phẩm nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card className="product-grid-card" loading={loading}>
      <div className="grid-header">
        <h2 className="grid-title">Danh sách sản phẩm</h2>
        <div className="grid-info">
          Hiển thị {products?.length || 0} sản phẩm
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {products?.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={6} key={product.id}>
            <Card
              className="product-card"
              hoverable
              cover={
                <div className="product-image-wrapper">
                  <img
                    alt={product.name}
                    src={product.image || 'https://via.placeholder.com/300'}
                    className="product-image"
                  />
                  {product.discount && (
                    <Tag color="red" className="discount-tag">
                      -{product.discount}%
                    </Tag>
                  )}
                  {!product.inStock && (
                    <div className="out-of-stock-overlay">
                      <Tag color="default">Hết hàng</Tag>
                    </div>
                  )}
                </div>
              }
            >
              <div className="product-info">
                <h3 className="product-name" title={product.name}>
                  {product.name}
                </h3>
                
                <div className="product-category">
                  <Tag color="blue">{product.category}</Tag>
                </div>

                <div className="product-pricing">
                  {product.discount ? (
                    <>
                      <span className="product-price-discounted">
                        {formatPrice(product.price * (1 - product.discount / 100))}
                      </span>
                      <span className="product-price-original">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="product-price">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                <div className="product-stats">
                  <span>Đã bán: {product.sold || 0}</span>
                  <span>Tồn kho: {product.stock || 0}</span>
                </div>

                <div className="product-actions">
                  <Space size="small">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      size="small"
                      className="action-icon-btn view-btn"
                      title="Xem chi tiết"
                      onClick={() => onViewDetail && onViewDetail(product)}
                    />
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      className="action-icon-btn edit-btn"
                      title="Chỉnh sửa"
                      onClick={() => onEdit && onEdit(product)}
                    />
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      className="action-icon-btn delete-btn"
                      title="Xóa"
                      onClick={() => onDelete && onDelete(product)}
                    />
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default ProductGrid;
