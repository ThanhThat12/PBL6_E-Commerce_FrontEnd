import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Space, Popconfirm, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import productListService from '../../services/seller/productListService';
import { toggleProductStatus } from '../../services/seller/productService';
import { generatePlaceholder } from '../../utils/placeholderImage';

const { Search } = Input;
const { Option } = Select;

/**
 * Product List Page
 * Display all products with filters and actions
 */
const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        size: pagination.pageSize,
        search: filters.keyword || undefined,
        // map status to isActive boolean when possible
        isActive: filters.status === 'ACTIVE' ? true : (filters.status === 'INACTIVE' ? false : undefined),
      };

      const response = await productListService.getMyShopProducts(params);
      setProducts(response.products || []);
      setPagination({
        ...pagination,
        total: response.total || 0,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await productListService.deleteProduct(productId);
      message.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Không thể xóa sản phẩm');
    }
  };

  const handleStatusChange = async (productId) => {
    try {
      await toggleProductStatus(productId);
      message.success('Cập nhật trạng thái thành công');
      fetchProducts();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  const handleEdit = (productId) => {
    navigate(`/seller/products/edit/${productId}`);
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'mainImage',
      key: 'mainImage',
      width: 80,
      render: (image, record) => (
        <img
          src={image || generatePlaceholder('No Image', 50, 50, 'f3f4f6', '9ca3af')}
          alt={record.name || 'Product'}
          className="w-12 h-12 object-cover rounded"
          onError={(e) => {
            e.target.src = generatePlaceholder('Error', 50, 50, 'fee2e2', 'dc2626');
          }}
        />
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      render: (_, record) => (
        // try to show top-level sku or first variant sku
        <div className="text-sm text-gray-700">{record.sku || record.variants?.[0]?.sku || '-'}</div>
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.description ? record.description.substring(0, 80) + (record.description.length > 80 ? '...' : '') : ''}</div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Giá',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price, record) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(record.price || price || 0),
    },
    {
      title: 'Kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <span className={stock > 0 ? 'text-green-600' : 'text-red-600'}>
          {stock}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive, record) => (
        <Button
          size="small"
          type={isActive ? 'primary' : 'default'}
          onClick={() => handleStatusChange(record.id)}
        >
          {isActive ? 'Hoạt động' : 'Tạm ngưng'}
        </Button>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record.id)}
            title="Chỉnh sửa"
          />
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
            title="Xem chi tiết"
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Danh sách sản phẩm</h1>
        <Link to="/seller/products/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <Space size="middle" wrap>
          <Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => {
              setFilters({ ...filters, keyword: value });
              setPagination({ ...pagination, current: 1 });
            }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => {
              setFilters({ ...filters, status: value });
              setPagination({ ...pagination, current: 1 });
            }}
          >
            <Option value="ACTIVE">Hoạt động</Option>
            <Option value="INACTIVE">Tạm ngưng</Option>
            <Option value="OUT_OF_STOCK">Hết hàng</Option>
          </Select>
        </Space>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current,
              pageSize: newPagination.pageSize,
              total: pagination.total,
            });
          }}
        />
      </div>

      {/* Product Detail Modal */}
      <Modal
        title="Chi tiết sản phẩm"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            setDetailModalVisible(false);
            handleEdit(selectedProduct?.id);
          }}>
            Chỉnh sửa
          </Button>,
        ]}
        width={800}
      >
        {selectedProduct && (
          <div className="space-y-4">
            {/* Product Image */}
            {selectedProduct.mainImage && (
              <div className="text-center">
                <img
                  src={selectedProduct.mainImage}
                  alt={selectedProduct.name}
                  className="max-w-full h-auto max-h-64 object-contain mx-auto rounded-lg"
                />
              </div>
            )}

            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Tên sản phẩm:</strong>
                <p>{selectedProduct.name}</p>
              </div>
              <div>
                <strong>Danh mục:</strong>
                <p>{selectedProduct.categoryName || 'N/A'}</p>
              </div>
              <div>
                <strong>Giá:</strong>
                <p>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price || selectedProduct.basePrice || 0)}</p>
              </div>
              <div>
                <strong>Kho hàng:</strong>
                <p className={selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {selectedProduct.stock}
                </p>
              </div>
              <div>
                <strong>SKU:</strong>
                <p>{selectedProduct.sku || selectedProduct.variants?.[0]?.sku || '-'}</p>
              </div>
              <div>
                <strong>Trạng thái:</strong>
                <p>
                  <Tag color={selectedProduct.isActive ? 'green' : 'orange'}>
                    {selectedProduct.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                  </Tag>
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedProduct.description && (
              <div>
                <strong>Mô tả:</strong>
                <p className="mt-2 text-gray-600">{selectedProduct.description}</p>
              </div>
            )}

            {/* Variants */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div>
                <strong>Biến thể:</strong>
                <div className="mt-2 space-y-2">
                  {selectedProduct.variants.map((variant, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">{variant.sku}</span>
                      <span className="ml-4">Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}</span>
                      <span className="ml-4">Kho: {variant.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Images */}
            {selectedProduct.galleryImages && selectedProduct.galleryImages.length > 0 && (
              <div>
                <strong>Ảnh sản phẩm:</strong>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {selectedProduct.galleryImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={typeof img === 'string' ? img : img.url}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;
