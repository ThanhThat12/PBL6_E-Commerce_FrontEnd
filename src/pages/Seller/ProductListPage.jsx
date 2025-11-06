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
  Pagination,
  notification
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
import { Row, Col } from "antd";
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
  
  // Delete confirmation modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);


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

  // ✅ Thay đổi handleDelete để dùng state modal
  const handleDelete = (product) => {
    console.log('🗑️ handleDelete called with product:', product);
    setProductToDelete(product);
    setDeleteModalVisible(true);
  };

  // ✅ Sửa handleDeleteConfirm để dùng message thay vì notification
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      console.log('🗑️ Starting delete process for product:', productToDelete.id);
      
      setDeleteModalVisible(false); // Đóng modal trước
      
      // ✅ Hiện loading message
      const hide = message.loading(`Đang xóa ${productToDelete.name}...`, 0);
      
      // ✅ Gọi API thực tế
      const result = await productListService.deleteProduct(productToDelete.id);
      console.log('✅ Delete result:', result);
      
      // ✅ Ẩn loading và hiện success
      hide();
      message.success(`Đã xóa sản phẩm "${productToDelete.name}" thành công!`);

      console.log('🔄 Refreshing products and stats...');
      // Refresh lại danh sách và stats
      await Promise.all([
        fetchProducts(),
        fetchStats()
      ]);
      console.log('✅ Data refreshed');
      
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      message.error(`Không thể xóa sản phẩm "${productToDelete.name}". Vui lòng thử lại!`);
    } finally {
      setProductToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setProductToDelete(null);
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

            {/* ✅ Simple Pagination */}
            <div className="pagination-section">
  <div className="pagination-wrapper">
    <div className="pagination-left">
      <span className="pagination-info">
        Hiển thị {products.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} - {Math.min(currentPage * pageSize, total)} của {total} sản phẩm
      </span>
    </div>
    
    <div className="pagination-center">
      <Pagination
        current={currentPage}
        total={total}
        pageSize={pageSize}
        onChange={(page) => setCurrentPage(page)}
        onShowSizeChange={(current, size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        showSizeChanger
        showQuickJumper
        showTotal={(total, range) => 
          `${range[0]}-${range[1]} của ${total} items`
        }
        pageSizeOptions={['10', '20', '50', '100']}
        size="default"
        className="custom-pagination"
      />
    </div>
    
    <div className="pagination-right">
      <span className="pagination-pages">
        Trang {currentPage} / {Math.ceil(total / pageSize)}
      </span>
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
  width={1200} // ✅ Tăng width để có chỗ cho nhiều hình ảnh
>
  {selectedProduct && (
    <div className="product-detail-content">
      <Row gutter={24}>
        {/* ✅ Cột hình ảnh */}
        <Col xs={24} md={10}>
          <div className="product-images">
            {/* Hình ảnh chính */}
            <div className="main-image" style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Hình ảnh chính:</h4>
              <Image
                width="100%"
                height={250}
                src={selectedProduct.mainImage || selectedProduct.image || 'https://via.placeholder.com/300'}
                alt={selectedProduct.name}
                style={{ borderRadius: '8px', objectFit: 'cover' }}
                fallback="https://via.placeholder.com/300"
              />
            </div>

            {/* ✅ Hình ảnh theo biến thể */}
            {selectedProduct.images && selectedProduct.images.length > 0 && (
              <div className="variant-images">
                <h4 style={{ marginBottom: '12px' }}>
                  Hình ảnh theo biến thể ({selectedProduct.images.length}):
                </h4>
                <Row gutter={[8, 8]}>
                  {selectedProduct.images.map((image, index) => (
                    <Col xs={12} sm={8} key={image.id || index}>
                      <div className="variant-image-item">
                        <Image
                          width="100%"
                          height={100}
                          src={image.imageUrl}
                          alt={`${selectedProduct.name} - ${image.color || `Ảnh ${index + 1}`}`}
                          style={{ 
                            borderRadius: '6px', 
                            objectFit: 'cover',
                            border: '2px solid #f0f0f0'
                          }}
                          fallback="https://via.placeholder.com/100"
                        />
                        {/* ✅ Label màu sắc */}
                        {image.color && (
                          <div style={{ 
                            textAlign: 'center', 
                            marginTop: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#666'
                          }}>
                            {image.color}
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* ✅ Thông báo nếu không có ảnh phụ */}
            {(!selectedProduct.images || selectedProduct.images.length === 0) && (
              <div style={{ 
                textAlign: 'center', 
                color: '#999', 
                fontSize: '14px',
                padding: '20px',
                border: '1px dashed #d9d9d9',
                borderRadius: '6px',
                backgroundColor: '#fafafa'
              }}>
                📷 Chưa có hình ảnh phụ theo biến thể
              </div>
            )}
          </div>
        </Col>

        {/* ✅ Cột thông tin */}
        <Col xs={24} md={14}>
          <div className="product-info">
            <h2 style={{ marginBottom: '16px', color: '#262626' }}>
              {selectedProduct.name}
            </h2>
            
            {/* Thông tin cơ bản */}
            <div className="basic-info" style={{ marginBottom: '24px' }}>
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <div className="info-item">
                    <span className="info-label">Danh mục:</span>
                    <Tag color="blue">{selectedProduct.categoryName}</Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <span className="info-label">Trạng thái:</span>
                    <Tag 
                      icon={selectedProduct.isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                      color={selectedProduct.isActive ? 'success' : 'warning'}
                    >
                      {selectedProduct.isActive ? 'Đã duyệt' : 'Chờ duyệt'}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <span className="info-label">Giá cơ bản:</span>
                    <span className="info-value price">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(selectedProduct.basePrice)}
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="info-item">
                    <span className="info-label">Tổng tồn kho:</span>
                    <span className="info-value">
                      {selectedProduct.stock || 0} sản phẩm
                    </span>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Mô tả */}
            <div className="description" style={{ marginBottom: '24px' }}>
              <h4>Mô tả sản phẩm:</h4>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '6px',
                minHeight: '60px'
              }}>
                {selectedProduct.description || 'Chưa có mô tả'}
              </div>
            </div>

            {/* ✅ Danh sách biến thể với mapping hình ảnh */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div className="variants-section">
                <h4 style={{ marginBottom: '16px' }}>
                  Biến thể sản phẩm ({selectedProduct.variants.length}):
                </h4>
                <div className="variants-list">
                  {selectedProduct.variants.map((variant, index) => {
                    // ✅ Tìm hình ảnh tương ứng với variant
                    const getVariantColor = () => {
                      if (variant.variantValues) {
                        const colorAttr = variant.variantValues.find(attr => 
                          attr.productAttribute?.name?.toLowerCase().includes('color')
                        );
                        return colorAttr?.value;
                      }
                      return null;
                    };

                    const variantColor = getVariantColor();
                    const matchingImage = selectedProduct.images?.find(img => 
                      img.color?.toLowerCase() === variantColor?.toLowerCase()
                    );

                    return (
                      <Card 
                        key={variant.id || index} 
                        size="small" 
                        style={{ marginBottom: '12px' }}
                        className="variant-card"
                      >
                        <Row gutter={16} align="middle">
                          {/* ✅ Thumbnail hình ảnh variant */}
                          <Col span={4}>
                            {matchingImage ? (
                              <Image
                                width={50}
                                height={50}
                                src={matchingImage.imageUrl}
                                alt={`${variant.sku} - ${variantColor}`}
                                style={{ 
                                  borderRadius: '4px', 
                                  objectFit: 'cover',
                                  border: '1px solid #d9d9d9'
                                }}
                                fallback="https://via.placeholder.com/50"
                              />
                            ) : (
                              <div style={{
                                width: '50px',
                                height: '50px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                color: '#999'
                              }}>
                                No Image
                              </div>
                            )}
                          </Col>

                          {/* ✅ Thông tin variant */}
                          <Col span={20}>
                            <Row gutter={16}>
                              <Col span={6}>
                                <div className="variant-info-item">
                                  <div className="variant-label">SKU:</div>
                                  <div className="variant-value">{variant.sku}</div>
                                </div>
                              </Col>
                              <Col span={6}>
                                <div className="variant-info-item">
                                  <div className="variant-label">Giá bán:</div>
                                  <div className="variant-value price">
                                    {new Intl.NumberFormat('vi-VN', { 
                                      style: 'currency', 
                                      currency: 'VND' 
                                    }).format(variant.price)}
                                  </div>
                                </div>
                              </Col>
                              <Col span={6}>
                                <div className="variant-info-item">
                                  <div className="variant-label">Tồn kho:</div>
                                  <div className="variant-value">{variant.stock}</div>
                                </div>
                              </Col>
                              <Col span={6}>
                                <div className="variant-info-item">
                                  <div className="variant-label">Thuộc tính:</div>
                                  <div className="variant-attributes">
                                    {variant.variantValues?.map((attr, idx) => (
                                      <Tag key={idx} size="small" color="blue">
                                        {attr.productAttribute?.name}: {attr.value}
                                      </Tag>
                                    )) || <span style={{ color: '#999' }}>N/A</span>}
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ✅ Thông báo nếu không có biến thể */}
            {(!selectedProduct.variants || selectedProduct.variants.length === 0) && (
              <div style={{ 
                textAlign: 'center', 
                color: '#999', 
                fontSize: '14px',
                padding: '20px',
                border: '1px dashed #d9d9d9',
                borderRadius: '6px',
                backgroundColor: '#fafafa'
              }}>
                🏷️ Sản phẩm chưa có biến thể
              </div>
            )}
          </div>
        </Col>
      </Row>
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

          {/* Delete Confirmation Modal */}
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                Xác nhận xóa sản phẩm
              </div>
            }
            open={deleteModalVisible}
            onOk={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            centered
            maskClosable={false}
            width={500}
            style={{ zIndex: 10000 }}
          >
            <p style={{ fontSize: '16px', marginBottom: '16px' }}>
              Bạn có chắc chắn muốn xóa sản phẩm <strong>"{productToDelete?.name}"</strong> không?
            </p>
            <p style={{ color: '#ff4d4f', fontSize: '14px' }}>
              ⚠️ Hành động này không thể hoàn tác!
            </p>
          </Modal>

         
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProductListPage;