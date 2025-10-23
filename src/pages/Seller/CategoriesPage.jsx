// src/pages/Seller/CategoriesPage.js
import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Button, Tabs, Input, Dropdown, Space } from 'antd';
import { 
  PlusOutlined, 
  MoreOutlined, 
  SearchOutlined, 
  FilterOutlined,
  EllipsisOutlined 
} from '@ant-design/icons';
import { Sidebar, Header, CategoryCard, CategoryTable } from '../../components/Seller';
import categoryService from '../../services/categoryService';
import './CategoriesPage.css';

const { Content } = Layout;
const { TabPane } = Tabs;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts('all');
  }, []);

  const fetchCategories = async () => {
    const data = await categoryService.getCategories();
    setCategories(data);
  };

  const fetchProducts = async (filter) => {
    setLoading(true);
    const data = await categoryService.getProducts(filter);
    
    // Filter products based on tab
    let filteredData = data;
    if (filter === 'featured') {
      filteredData = data.filter(p => p.featured);
    } else if (filter === 'on-sale') {
      filteredData = data.filter(p => p.onSale);
    } else if (filter === 'out-of-stock') {
      filteredData = data.filter(p => p.outOfStock);
    }
    
    setProducts(filteredData);
    setLoading(false);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    fetchProducts(key);
  };

  const moreActionsMenu = {
    items: [
      { key: '1', label: 'Export' },
      { key: '2', label: 'Import' },
      { key: '3', label: 'Bulk Actions' },
    ],
  };

  return (
    <Layout className="categories-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>
      
      <Layout>
        <Header />
        <Content className="categories-content">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Categories</h1>
            <div className="header-actions">
              
              
            </div>
          </div>

          {/* Discover Section */}
          <div className="discover-section">
            <div className="section-header">
              <h2>Discover</h2>
            </div>
            <Row gutter={[16, 16]} className="categories-grid">
              {categories.map((category) => (
                <Col key={category.id} xs={24} sm={12} md={8} lg={6}>
                  <CategoryCard category={category} />
                </Col>
              ))}
            </Row>
          </div>

          {/* Products Section */}
          <div className="products-section">
            {/* Tabs and Search */}
            <div className="products-header">
              <Tabs 
                activeKey={activeTab} 
                onChange={handleTabChange}
                className="product-tabs"
              >
                <TabPane 
                  tab={`All Product (${categories.reduce((sum, cat) => sum + cat.productCount, 0)})`} 
                  key="all" 
                />
                <TabPane tab="Featured Products" key="featured" />
                <TabPane tab="On Sale" key="on-sale" />
                <TabPane tab="Out of Stock" key="out-of-stock" />
              </Tabs>
              
              <Space className="products-actions">
                <Input
                  placeholder="Search your product"
                  prefix={<SearchOutlined />}
                  className="search-input"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Button icon={<FilterOutlined />} />
                <Button icon={<PlusOutlined />} />
                <Button icon={<EllipsisOutlined />} />
              </Space>
            </div>

            {/* Products Table */}
            <CategoryTable categories={products} loading={loading} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CategoriesPage;
