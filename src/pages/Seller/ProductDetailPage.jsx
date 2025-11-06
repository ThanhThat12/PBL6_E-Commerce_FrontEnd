// src/pages/Seller/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Image, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Divider, 
  Spin,
  message,
  Breadcrumb,
  Tabs
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import Sidebar from '../../components/Seller/Layout/Sidebar';
import Header from '../../components/Seller/Layout/Header';
// import productService from '../../services/productService'; // Sẽ cần API này
import './ProductDetailPage.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      // ✅ Sẽ dùng API chi tiết sản phẩm
      // const response = await productService.getProductDetail(id);
      // setProduct(response.data);
      
      // ✅ Tạm thời dùng mock data để demo
      setTimeout(() => {
        setProduct({
          id: parseInt(id),
          name: "Premium Weightlifting Gloves",
          description: "Professional weightlifting gloves with wrist support. Made from high-quality materials for durability and comfort.",
          mainImage: "https://example.com/images/gloves_main.jpg",
          basePrice: 250000,
          isActive: true,
          category: { id: 1, name: "Gym Accessories" },
          shopName: "SportGear Pro",
          variants: [
            {
              id: 1,
              sku: "GLV-BLACK-M",
              price: 250000,
              stock: 50,
              variantValues: [
                { id: 1, productAttributeId: 1, value: "Black", productAttribute: { id: 1, name: "Color" }},
                { id: 2, productAttributeId: 2, value: "Medium", productAttribute: { id: 2, name: "Size" }}
              ]
            },
            {
              id: 2,
              sku: "GLV-RED-M",
              price: 270000,
              stock: 30,
              variantValues: [
                { id: 3, productAttributeId: 1, value: "Red", productAttribute: { id: 1, name: "Color" }},
                { id: 4, productAttributeId: 2, value: "Medium", productAttribute: { id: 2, name: "Size" }}
              ]
            }
          ],
          images: [
            { id: 1, imageUrl: "https://example.com/images/gloves_black.jpg", color: "Black" },
            { id: 2, imageUrl: "https://example.com/images/gloves_red.jpg", color: "Red" }
          ]
        });
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error fetching product detail:', error);
      message.error('Không thể tải thông tin sản phẩm');
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  const getVariantAttributes = (variant) => {
    if (!variant.variantValues) return {};
    const attrs = {};
    variant.variantValues.forEach(val => {
      attrs[val.productAttribute.name] = val.value;
    });
    return attrs;
  };

  const getVariantImage = (variant) => {
    if (!product.images) return product.mainImage;
    const color = variant.variantValues?.find(val => 
      val.productAttribute.name.toLowerCase().includes('color')
    )?.value;
    
    if (color) {
      const matchingImage = product.images.find(img => 
        img.color?.toLowerCase() === color.toLowerCase()
      );
      if (matchingImage) return matchingImage.imageUrl;
    }
    return product.mainImage;
  };

  const handleEdit = () => {
    navigate(`/seller/products/edit/${id}`);
  };

  const handleDelete = () => {
    // Implement delete logic
    message.info('Chức năng xóa sẽ được thực hiện');
  };

  if (loading) {
    return (
      <Layout className="product-detail-layout">
        <Layout.Sider width={250} theme="light">
          <Sidebar />
        </Layout.Sider>
        <Layout>
          <Header />
          <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin size="large" />
          </Content>
        </Layout>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout className="product-detail-layout">
        <Layout.Sider width={250} theme="light">
          <Sidebar />
        </Layout.Sider>
        <Layout>
          <Header />
          <Content style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Text>Không tìm thấy sản phẩm</Text>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className="product-detail-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>
      
      <Layout>
        <Header />
        <Content className="product-detail-content">
          {/* Breadcrumb */}
          <div className="breadcrumb-section">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Button 
                  type="link" 
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/seller/my-shop')}
                >
                  Quay lại
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Item>My Shop</Breadcrumb.Item>
              <Breadcrumb.Item>Chi tiết sản phẩm</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/* Main Content */}
          <Card className="product-detail-card">
            <Row gutter={[24, 24]}>
              {/* Left: Product Images */}
              <Col xs={24} md={10}>
                <div className="product-images-section">
                  <Image
                    width="100%"
                    height={400}
                    src={product.mainImage || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    style={{ borderRadius: '8px', objectFit: 'cover' }}
                    fallback="https://via.placeholder.com/400"
                  />
                  
                  {product.images && product.images.length > 0 && (
                    <div className="additional-images">
                      <Title level={5}>Hình ảnh khác:</Title>
                      <div className="image-gallery">
                        {product.images.map((img, index) => (
                          <Image
                            key={index}
                            width={80}
                            height={80}
                            src={img.imageUrl}
                            alt={`Image ${index + 1}`}
                            style={{ borderRadius: '4px', objectFit: 'cover' }}
                            fallback="https://via.placeholder.com/80"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Col>

              {/* Right: Product Info */}
              <Col xs={24} md={14}>
                <div className="product-info-section">
                  {/* Header */}
                  <div className="product-header">
                    <Title level={2}>{product.name}</Title>
                    <Space>
                      <Tag 
                        icon={<CheckCircleOutlined />}
                        color="success"
                      >
                        Đã duyệt
                      </Tag>
                      <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                        Chỉnh sửa
                      </Button>
                      <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                        Xóa
                      </Button>
                    </Space>
                  </div>

                  {/* Basic Info */}
                  <div className="basic-info">
                    <div className="info-row">
                      <Text strong>Giá cơ bản:</Text>
                      <Text className="price-text">{formatPrice(product.basePrice)}</Text>
                    </div>
                    <div className="info-row">
                      <Text strong>Danh mục:</Text>
                      <Tag color="blue">{product.category.name}</Tag>
                    </div>
                    <div className="info-row">
                      <Text strong>Shop:</Text>
                      <Text>{product.shopName}</Text>
                    </div>
                  </div>

                  {/* Description */}
                  <Divider />
                  <div className="description-section">
                    <Title level={4}>Mô tả sản phẩm</Title>
                    <Paragraph>{product.description}</Paragraph>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Variants Section */}
            {product.variants && product.variants.length > 0 && (
              <>
                <Divider />
                <div className="variants-section">
                  <Title level={3}>
                    <ShoppingOutlined /> Biến thể sản phẩm ({product.variants.length})
                  </Title>
                  
                  <Row gutter={[16, 16]}>
                    {product.variants.map((variant, index) => {
                      const attributes = getVariantAttributes(variant);
                      const variantImage = getVariantImage(variant);
                      
                      return (
                        <Col xs={24} sm={12} md={8} key={variant.id || index}>
                          <Card className="variant-detail-card" size="small">
                            <div className="variant-detail-content">
                              <div className="variant-image-section">
                                <Image
                                  width={100}
                                  height={100}
                                  src={variantImage}
                                  alt={variant.sku}
                                  style={{ borderRadius: '6px', objectFit: 'cover' }}
                                  fallback="https://via.placeholder.com/100"
                                />
                              </div>
                              
                              <div className="variant-detail-info">
                                <Title level={5}>{variant.sku}</Title>
                                
                                <div className="variant-attributes">
                                  {Object.entries(attributes).map(([key, value]) => (
                                    <div key={key} className="attribute-row">
                                      <Text strong>{key}:</Text>
                                      <Tag>{value}</Tag>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="variant-pricing">
                                  <Text className="variant-price">{formatPrice(variant.price)}</Text>
                                  <Text className={`variant-stock ${variant.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                                    Kho: {variant.stock}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              </>
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProductDetailPage;