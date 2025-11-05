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
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  const fetchCategories = async () => {
    const data = await categoryService.getCategories();
    setCategories(data);
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching all products:', error);
    }
    setLoading(false);
  };

  const fetchProductsByCategory = async (categoryId, categoryName) => {
    setLoading(true);
    try {
      console.log(`🔄 Loading products for category: ${categoryName} (ID: ${categoryId})`);
      const data = await categoryService.getProductsByCategory(categoryId);
      setProducts(data);
      setSelectedCategory({ id: categoryId, name: categoryName });
      setActiveTab('category');
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
    }
    setLoading(false);
  };

  const fetchProducts = async (filter) => {
    if (filter === 'all') {
      setSelectedCategory(null);
      await fetchAllProducts();
      return;
    }

    setLoading(true);
    try {
      const allData = await categoryService.getAllProducts();
      
      // Filter products based on tab
      let filteredData = allData;
      if (filter === 'featured') {
        filteredData = allData.filter(p => p.featured);
      } else if (filter === 'on-sale') {
        filteredData = allData.filter(p => p.onSale);
      } else if (filter === 'out-of-stock') {
        filteredData = allData.filter(p => p.stock === 0 || !p.isActive);
      }
      
      setProducts(filteredData);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error fetching filtered products:', error);
    }
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
                  <CategoryCard 
                    category={category} 
                    onClick={() => fetchProductsByCategory(category.id, category.name)}
                    isSelected={selectedCategory?.id === category.id}
                  />
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
                  tab={`All Product (${products.length})`} 
                  key="all" 
                />
                <TabPane tab="Featured Products" key="featured" />
                <TabPane tab="On Sale" key="on-sale" />
                <TabPane tab="Out of Stock" key="out-of-stock" />
                {selectedCategory && (
                  <TabPane 
                    tab={`${selectedCategory.name} (${products.length})`} 
                    key="category" 
                  />
                )}
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
            <CategoryTable 
              categories={products} 
              loading={loading} 
              title={selectedCategory ? `Products in ${selectedCategory.name}` : `Products (${products.length} items)`}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CategoriesPage;
