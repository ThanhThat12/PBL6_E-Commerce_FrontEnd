import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import productListService from '../../services/seller/productListService';
import { updateProductStatus } from '../../services/seller/productService';

const { Search } = Input;
const { Option } = Select;

/**
 * Product List Page
 * Display all products with filters and actions
 */
const ProductList = () => {
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

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await updateProductStatus(productId, newStatus);
      message.success('Cập nhật trạng thái thành công');
      fetchProducts();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'mainImage',
      key: 'mainImage',
      width: 80,
      render: (image) => (
        <img 
          src={image || 'https://via.placeholder.com/50'} 
          alt="Product" 
          className="w-12 h-12 object-cover rounded"
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
        <Select
          value={isActive ? 'ACTIVE' : 'INACTIVE'}
          style={{ width: 130 }}
          onChange={(value) => handleStatusChange(record.id, value)}
          size="small"
        >
          <Option value="ACTIVE">
            <Tag color="green">Hoạt động</Tag>
          </Option>
          <Option value="INACTIVE">
            <Tag color="orange">Tạm ngưng</Tag>
          </Option>
          <Option value="OUT_OF_STOCK">
            <Tag color="red">Hết hàng</Tag>
          </Option>
        </Select>
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
            onClick={() => {/* TODO: Navigate to edit page */}}
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
    </div>
  );
};

export default ProductList;
