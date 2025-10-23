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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await shopService.getShopProducts();
      setProducts(response.products);
      setFilteredProducts(response.products);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    setLoading(true);
    
    setTimeout(() => {
      let filtered = [...products];

      // Filter by category
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(p => 
          p.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }

      // Filter by stock
      if (filters.inStock) {
        filtered = filtered.filter(p => p.inStock);
      }

      // Filter by price range
      if (filters.priceRange) {
        filtered = filtered.filter(p => {
          const finalPrice = p.discount 
            ? p.price * (1 - p.discount / 100)
            : p.price;
          return finalPrice >= filters.priceRange[0] && 
                 finalPrice <= filters.priceRange[1];
        });
      }

      // Sort
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'popular':
          filtered.sort((a, b) => b.sold - a.sold);
          break;
        case 'newest':
          filtered.sort((a, b) => b.id - a.id);
          break;
        case 'oldest':
          filtered.sort((a, b) => a.id - b.id);
          break;
        default:
          break;
      }

      setFilteredProducts(filtered);
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setFilteredProducts(products);
  };

  const handleShopUpdate = () => {
    // Refresh shop data sau khi cập nhật
    fetchShopData();
  };

  // Handler cho xem chi tiết sản phẩm
  const handleViewDetail = async (product) => {
    try {
      console.log('🔍 Viewing product detail:', product);
      // Lấy chi tiết đầy đủ từ API
      const productDetail = await shopService.getProductDetail(product.id);
      setSelectedProduct(productDetail);
      setProductDetailVisible(true);
    } catch (error) {
      console.error('❌ Error viewing product detail:', error);
      message.error('Không thể lấy thông tin chi tiết sản phẩm');
    }
  };

  // Handler cho chỉnh sửa sản phẩm
  const handleEdit = async (product) => {
    try {
      console.log('✏️ Editing product:', product);
      // Lấy chi tiết đầy đủ của sản phẩm để edit
      const productDetail = await shopService.getProductDetail(product.id);
      setEditingProduct(productDetail);
      setEditProductVisible(true);
    } catch (error) {
      console.error('❌ Error loading product for edit:', error);
      message.error('Không thể lấy thông tin sản phẩm để chỉnh sửa');
    }
  };

  // Handler cho xóa sản phẩm
  const handleDelete = (product) => {
    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await shopService.deleteProduct(product.id);
          message.success('Xóa sản phẩm thành công');
          // Refresh danh sách sản phẩm
          fetchProducts();
        } catch (error) {
          console.error('❌ Error deleting product:', error);
          message.error('Không thể xóa sản phẩm');
        }
      },
    });
  };

  // Đóng modal chi tiết sản phẩm
  const handleCloseDetail = () => {
    setProductDetailVisible(false);
    setSelectedProduct(null);
  };

  // Đóng modal chỉnh sửa sản phẩm
  const handleCloseEdit = () => {
    setEditProductVisible(false);
    setEditingProduct(null);
  };

  // Xử lý khi cập nhật sản phẩm thành công
  const handleEditSuccess = (updatedProduct) => {
    console.log('✅ Product updated successfully:', updatedProduct);
    // Refresh danh sách sản phẩm
    fetchProducts();
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
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Modal hiển thị chi tiết sản phẩm */}
          <Modal
            title="Chi tiết sản phẩm"
            open={productDetailVisible}
            onCancel={handleCloseDetail}
            footer={null}
            width={800}
            className="product-detail-modal"
          >
            {selectedProduct && (
              <div className="product-detail-content">
                <div style={{ display: 'flex', gap: '20px' }}>
                  {/* Hình ảnh sản phẩm */}
                  <div style={{ flex: 1 }}>
                    <img
                      src={selectedProduct.mainImage || selectedProduct.image || 'https://via.placeholder.com/300'}
                      alt={selectedProduct.name}
                      style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }}
                    />
                    
                    {/* Danh sách hình ảnh phụ */}
                    {selectedProduct.images && selectedProduct.images.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <h4>Hình ảnh khác:</h4>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {selectedProduct.images.map((img, index) => (
                            <img
                              key={index}
                              src={img.imageUrl}
                              alt={`${selectedProduct.name} - ${img.color}`}
                              style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'cover', 
                                borderRadius: '4px',
                                border: '1px solid #d9d9d9'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div style={{ flex: 2 }}>
                    <h2>{selectedProduct.name}</h2>
                    <p><strong>Mô tả:</strong> {selectedProduct.description}</p>
                    <p><strong>Danh mục:</strong> {selectedProduct.categoryName}</p>
                    <p><strong>Shop:</strong> {selectedProduct.shopName}</p>
                    <p><strong>Giá cơ bản:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.basePrice)}</p>
                    <p><strong>Tồn kho:</strong> {selectedProduct.stock}</p>
                    <p><strong>Trạng thái:</strong> {selectedProduct.isActive ? 'Hoạt động' : 'Không hoạt động'}</p>

                    {/* Hiển thị variants */}
                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <h4>Phiên bản sản phẩm:</h4>
                        {selectedProduct.variants.map((variant, index) => (
                          <div key={variant.id} style={{ 
                            padding: '10px', 
                            border: '1px solid #d9d9d9', 
                            borderRadius: '4px', 
                            marginBottom: '10px' 
                          }}>
                            <p><strong>SKU:</strong> {variant.sku}</p>
                            <p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}</p>
                            <p><strong>Tồn kho:</strong> {variant.stock}</p>
                            <div><strong>Thuộc tính:</strong></div>
                            {variant.variantValues?.map((value, valueIndex) => (
                              <span key={value.id} style={{ marginRight: '10px' }}>
                                {value.productAttribute.name}: {value.value}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* Modal chỉnh sửa sản phẩm */}
          <EditProductForm
            product={editingProduct}
            visible={editProductVisible}
            onCancel={handleCloseEdit}
            onSuccess={handleEditSuccess}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MyShopPage;
