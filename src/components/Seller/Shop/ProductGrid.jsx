import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Tag, 
  Button, 
  Tooltip, 
  Image, 
  Typography, 
  Space
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ShoppingOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Empty } from 'antd';
import './ProductGrid.css';

const { Text, Title } = Typography;

const ProductGrid = ({ products, loading, onViewDetail, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  // ✅ ProductCard tối giản - chỉ hiển thị tên, giá, hình ảnh
  const ProductCard = ({ product }) => {
    return (
      <Card
        className="product-card"
        cover={
          <div className="product-image-container">
            <Image
              src={product.image}
              alt={product.name}
              className="product-image"
              fallback="https://via.placeholder.com/200"
              preview={false}
            />
            
          </div>
        }
        actions={[
          
           ]}
        hoverable
      >
        <div className="product-info">
          {/* ✅ Tên sản phẩm */}
          <Title level={5} className="product-name" ellipsis={{ rows: 2 }}>
            {product.name}
          </Title>
          
          {/* ✅ SKU nếu là variant */}
          {product.isVariant && product.sku && (
            <Text className="product-sku" type="secondary">
              {product.sku}
            </Text>
          )}
          
          {/* ✅ Giá */}
          <div className="product-pricing">
            <Text className="product-price">
              {formatPrice(product.price)}
            </Text>
            </div>
          
          {/* ✅ Kho hàng */}
          <div className="product-stats">
            <span>Kho: {product.stock}</span>
          </div>
        </div>
      </Card>
    );
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
        <h2 className="grid-title">Sản phẩm của shop</h2>
        <div className="grid-info">
          {products?.length || 0} sản phẩm
        </div>
      </div>
      <Row gutter={[16, 16]}>
        {products?.map((product) => (
          <Col xs={12} sm={8} md={6} lg={4} xl={4} key={product.id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </Card>
  );
};
export default ProductGrid;
