import React, { useState, useEffect } from 'react';
import { Layout, message, Modal } from 'antd';
import { Sidebar, Header } from '../../components/Seller';
import ShopHeader from '../../components/Seller/Shop/ShopHeader';
import ShopFilters from '../../components/Seller/Shop/ShopFilters';
import ProductGrid from '../../components/Seller/Shop/ProductGrid';
import EditProductForm from '../../components/Seller/Products/EditProductForm';
import shopService from '../../services/shopService';
import './MyShopPage.css';

const { Content } = Layout;

const MyShopPage = () => {
  const [shopData, setShopData] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailVisible, setProductDetailVisible] = useState(false);
  const [editProductVisible, setEditProductVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Fetch shop data và products khi component mount
  useEffect(() => {
    fetchShopData();
    fetchProducts();
  }, []);

  const fetchShopData = async () => {
    try {
      const data = await shopService.getShopInfo();
      setShopData(data);
    } catch (error) {
      message.error('Không thể tải thông tin shop');
    }
  };

  // ✅ Đơn giản hóa fetchProducts - service đã flatten rồi
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await shopService.getApprovedProducts({
        page: 1,
        size: 100,
        search: '',
        sortBy: 'id',
        sortDir: 'desc'
      });
      
      console.log('📦 Fetched products:', response);
      
      setProducts(response.products);
      setFilteredProducts(response.products);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };
  

  
  // ✅ Cập nhật filter để work với flattened products
  const handleFilterChange = (filters) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = [...products];

      // Chỉ filter theo search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(query) ||
          (p.sku && p.sku.toLowerCase().includes(query))
        );
      }

      // Filter theo stock
      if (filters.inStock) {
        filtered = filtered.filter(p => p.stock > 0);
      }

      // Sort đơn giản
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-desc':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'name-asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
          default:
          break;
      }

      setFilteredProducts(filtered);
      setLoading(false);
    }, 300); // Giảm delay
  };

  const handleReset = () => {
    setFilteredProducts(products);
  };
   const handleShopUpdate = () => {
    fetchShopData();
  };

  


  return (
    <Layout className="my-shop-page-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>

      <Layout>
        <Header />
        <Content className="my-shop-page-content">
          <ShopHeader shopData={shopData} onUpdate={handleShopUpdate} />
          <ShopFilters 
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />

          <ProductGrid 
            products={filteredProducts}
            loading={loading}
            
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MyShopPage;
