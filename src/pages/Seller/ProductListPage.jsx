import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Modal, 
  message, 
  Input, 
  Select,
  Image,
  Tooltip,
  Pagination
} from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  ExclamationCircleOutlined

} from '@ant-design/icons';
import { Sidebar, Header } from '../../components/Seller';
import EditProductForm from '../../components/Seller/Products/EditProductForm';
import productListService from '../../services/productListService';
import './ProductListPage.css';

const { Content } = Layout;
const { Option } = Select;

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
 const [editingProduct, setEditingProduct] = useState(null);
 const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);


  // Stats
  const [stats, setStats] = useState({
    approved: 0,
    pending: 0,
    total: 0
  });


  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchText, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await productListService.getMyShopProducts({
        page: currentPage,
        size: pageSize,
        search: searchText,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'approved'
      });
      
      setProducts(result.products);
      setTotal(result.total);
       setTotalPages(result.totalPages || Math.ceil(result.total / pageSize));
      setHasNext(result.hasNext || currentPage < Math.ceil(result.total / pageSize));
      setHasPrev(result.hasPrev || currentPage > 1);
      
     console.log('📄 Fetched products:', {
        productsCount: result.products.length,
        totalFromAPI: result.total,
        currentPage: result.page,
        totalPages: result.totalPages
     });
    
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    message.error('Không thể tải danh sách sản phẩm');
  } finally {
    setLoading(false);
  }
  };


   // ✅ Handlers cho Next/Previous
  const handlePrevious = () => {
    if (hasPrev && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

   const handleNext = () => {
    if (hasNext && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset về trang đầu khi thay đổi page size
  };

  const fetchStats = async () => {
  setLoading(true);
    try {
      const result = await productListService.getMyShopProducts({
        page: currentPage,
        size: pageSize,
        search: searchText,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'approved'
      });
      
      setProducts(result.products);
      setTotal(result.total); // ✅ Tổng số từ backend pagination
      
      console.log('📄 Fetched products:', {
        productsCount: result.products.length,
        totalFromAPI: result.total,
        currentPage: result.page,
        totalPages: result.totalPages
      });
      
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };
  // Handle actions
  const handleViewDetail = async (product) => {
    try {
      const productDetail = await productListService.getProductDetail(product.id);
      setSelectedProduct(productDetail);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('❌ Error viewing product detail:', error);
      message.error('Không thể lấy thông tin chi tiết sản phẩm');
    }
  };

  const handleEdit = async (product) => {
    try {
      const productDetail = await productListService.getProductDetail(product.id);
      setEditingProduct(productDetail);
      setEditModalVisible(true);
    } catch (error) {
      console.error('❌ Error loading product for edit:', error);
      message.error('Không thể lấy thông tin sản phẩm để chỉnh sửa');
    }
  };

 const handleDelete = (product) => {
  console.log('🎯 Delete button clicked for product:', product);
  
  // ✅ Test với alert trước để đảm bảo function chạy
  const userConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`);
  
  if (userConfirmed) {
    console.log('✅ User confirmed delete for product:', product.id);
    
    const deleteProduct = async () => {
      const hideLoading = message.loading('Đang xóa sản phẩm...', 0);
      
      try {
        console.log('🗑️ Starting delete process for product:', product.id);
        
        const result = await productListService.deleteProduct(product.id);
        console.log('✅ Delete result:', result);
        
        hideLoading();
        message.success('Xóa sản phẩm thành công!');
        
        console.log('🔄 Refreshing products and stats...');
        await Promise.all([
          fetchProducts(),
          fetchStats()
        ]);
        console.log('✅ Data refreshed');
        
      } catch (error) {
        console.error('❌ Error in delete handler:', error);
        hideLoading();
        message.error(error.message || 'Không thể xóa sản phẩm');
      }
    };
    
    deleteProduct();
  } else {
    console.log('❌ User cancelled delete');
  }
};


  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setEditingProduct(null);
    fetchProducts();
  };

  // Table columns
  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'mainImage',
      key: 'mainImage',
      width: 80,
      render: (image, record) => (
        <Image
          width={50}
          height={50}
          src={image || record.image || 'https://via.placeholder.com/50'}
          alt={record.name}
          style={{ borderRadius: '4px', objectFit: 'cover' }}
          fallback="https://via.placeholder.com/50"
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ID: {record.id} | {record.categoryName}
          </div>
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 120,
      sorter: (a, b) => a.basePrice - b.basePrice,
      render: (price) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(price)}
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      sorter: (a, b) => a.stock - b.stock,
      render: (stock) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock > 0 ? `${stock} sản phẩm` : 'Hết hàng'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      filters: [
        { text: 'Đã duyệt', value: true },
        { text: 'Chờ duyệt', value: false },
      ],
      render: (isActive) => (
        <Tag 
          icon={isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          color={isActive ? 'success' : 'warning'}
        >
          {isActive ? 'Đã duyệt' : 'Chờ duyệt'}
        </Tag>
      ),
    },
    {
      title: 'Biến thể',
      dataIndex: 'variants',
      key: 'variants',
      width: 100,
      render: (variants) => (
        <Tag color="blue">
          {variants?.length || 0} biến thể
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              danger
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="product-list-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>

      <Layout>
        <Header />
        <Content className="product-list-content">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Quản lý sản phẩm</h1>
            
          </div>

          {/* Stats Cards */}
          <div className="stats-section">
            <Card className="stat-card approved">
              <div className="stat-content">
                <div className="stat-icon">
                  <CheckCircleOutlined />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{stats.approved}</div>
                  <div className="stat-label">Sản phẩm đã duyệt</div>
                </div>
              </div>
            </Card>

            <Card className="stat-card pending">
              <div className="stat-content">
                <div className="stat-icon">
                  <ClockCircleOutlined />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{stats.pending}</div>
                  <div className="stat-label">Sản phẩm chờ duyệt</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="filter-section">
            <Space size="middle" wrap>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              <Select
                placeholder="Lọc theo trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200 }}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="approved">Đã duyệt</Option>
                <Option value="pending">Chờ duyệt</Option>
              </Select>
            </Space>
          </Card>

          {/* Products Table */}
          <Card className="table-section">
            <Table
              columns={columns}
              dataSource={products}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1200 }}
              size="middle"
            />

            {/* ✅ Custom Next/Previous Pagination */}
            <div className="pagination-section">
              <div className="pagination-controls">
                {/* Left side: Page info */}
                <div className="pagination-info">
                  <span className="page-info-text">
                    Trang {currentPage} / {totalPages} 
                    {total > 0 && (
                      <span className="total-info">
                        ({((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} của {total} sản phẩm)
                      </span>
                    )}
                  </span>
                </div>

                 {/* Center: Navigation buttons */}
                <div className="pagination-nav">
                  <Button
                    onClick={handlePrevious}
                    disabled={!hasPrev || loading}
                    icon={<span>←</span>}
                    className="nav-button prev-button"
                  >
                    Trang trước
                  </Button>
                  
                  <div className="current-page-indicator">
                    <Input
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (page && page > 0 && page <= totalPages) {
                          setCurrentPage(page);
                        }
                      }}
                      onPressEnter={(e) => {
                        const page = parseInt(e.target.value);
                        if (page && page > 0 && page <= totalPages) {
                          setCurrentPage(page);
                        }
                      }}
                      className="page-input"
                      size="small"
                    />
                    <span className="page-separator">của {totalPages}</span>
                  </div>

                <Button
                    onClick={handleNext}
                    disabled={!hasNext || loading}
                    className="nav-button next-button"
                  >
                    Trang sau
                    <span>→</span>
                  </Button>
                </div>

                {/* Right side: Page size selector */}
                <div className="pagination-size">
                  <span className="size-label">Hiển thị:</span>
                  <Select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    size="small"
                    className="size-selector"
                  >
                    <Option value={10}>10 / trang</Option>
                    <Option value={20}>20 / trang</Option>
                    <Option value={50}>50 / trang</Option>
                    <Option value={100}>100 / trang</Option>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Product Detail Modal */}
          <Modal
            title="Chi tiết sản phẩm"
            open={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false);
              setSelectedProduct(null);
            }}
            footer={null}
            width={1000}
          >
            {selectedProduct && (
              <div className="product-detail-content">
                {/* Product detail content here */}
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <Image
                      width="100%"
                      src={selectedProduct.mainImage || 'https://via.placeholder.com/300'}
                      alt={selectedProduct.name}
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <h2>{selectedProduct.name}</h2>
                    <p><strong>Mô tả:</strong> {selectedProduct.description}</p>
                    <p><strong>Danh mục:</strong> {selectedProduct.categoryName}</p>
                    <p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.basePrice)}</p>
                    <p><strong>Tồn kho:</strong> {selectedProduct.stock}</p>
                    <p><strong>Trạng thái:</strong> 
                      <Tag color={selectedProduct.isActive ? 'success' : 'warning'}>
                        {selectedProduct.isActive ? 'Đã duyệt' : 'Chờ duyệt'}
                      </Tag>
                    </p>
                    
                    {/* Variants */}
                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <h4>Biến thể:</h4>
                        {selectedProduct.variants.map((variant) => (
                          <div key={variant.id} style={{ 
                            padding: '10px', 
                            border: '1px solid #d9d9d9', 
                            borderRadius: '4px', 
                            marginBottom: '8px' 
                          }}>
                            <p><strong>SKU:</strong> {variant.sku}</p>
                            <p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}</p>
                            <p><strong>Tồn kho:</strong> {variant.stock}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* Edit Product Modal */}
          <EditProductForm
            product={editingProduct}
            visible={editModalVisible}
            onCancel={() => {
              setEditModalVisible(false);
              setEditingProduct(null);
            }}
            onSuccess={handleEditSuccess}
          />

         
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProductListPage;