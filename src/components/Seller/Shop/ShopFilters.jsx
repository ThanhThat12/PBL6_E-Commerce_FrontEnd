import React, { useState } from 'react';
import { Card, Select, Slider, Button, Space, Input, Checkbox, Collapse, Row, Col } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import './ShopFilters.css';

const { Option } = Select;
const { Panel } = Collapse;

const ShopFilters = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 10000000],
    sortBy: 'newest',
    inStock: false,
    searchQuery: '',
  });

  const categories = [
    { value: 'all', label: 'Tất cả danh mục' },
    { value: 'shoes', label: 'Giày dép' },
    { value: 'clothing', label: 'Quần áo' },
    { value: 'bags', label: 'Túi xách' },
    { value: 'accessories', label: 'Phụ kiện' },
    { value: 'sport-equipment', label: 'Dụng cụ thể thao' },
    { value: 'fitness', label: 'Fitness' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'price-asc', label: 'Giá: Thấp đến cao' },
    { value: 'price-desc', label: 'Giá: Cao đến thấp' },
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'best-selling', label: 'Bán chạy nhất' },
  ];

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: 'all',
      priceRange: [0, 10000000],
      sortBy: 'newest',
      inStock: false,
      searchQuery: '',
    };
    setFilters(resetFilters);
    onReset();
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <Card className="shop-filters-card">
      <div className="filters-header">
        <div className="filters-title">
          <FilterOutlined />
          <span>Bộ lọc sản phẩm</span>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          size="small"
        >
          Đặt lại
        </Button>
      </div>

      <div className="filters-content">
        {/* Search */}
        <div className="filter-section">
          <label className="filter-label">Tìm kiếm sản phẩm</label>
          <Input
            placeholder="Nhập tên sản phẩm..."
            prefix={<SearchOutlined />}
            value={filters.searchQuery}
            onChange={(e) => handleFilterUpdate('searchQuery', e.target.value)}
            size="large"
            className="search-input"
          />
        </div>

        {/* Quick Filters Row */}
        <Row gutter={[16, 16]} className="quick-filters">
          <Col xs={24} sm={12} md={8}>
            <div className="filter-section">
              <label className="filter-label">Danh mục</label>
              <Select
                value={filters.category}
                onChange={(value) => handleFilterUpdate('category', value)}
                style={{ width: '100%' }}
                size="large"
              >
                {categories.map((cat) => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div className="filter-section">
              <label className="filter-label">Sắp xếp</label>
              <Select
                value={filters.sortBy}
                onChange={(value) => handleFilterUpdate('sortBy', value)}
                style={{ width: '100%' }}
                size="large"
              >
                {sortOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div className="filter-section">
              <label className="filter-label">Trạng thái</label>
              <Checkbox
                checked={filters.inStock}
                onChange={(e) => handleFilterUpdate('inStock', e.target.checked)}
                className="stock-checkbox"
              >
                Chỉ hiển thị có sẵn
              </Checkbox>
            </div>
          </Col>
        </Row>

        {/* Advanced Filters */}
        <Collapse ghost className="advanced-filters">
          <Panel header="Bộ lọc nâng cao" key="1">
            <div className="filter-section">
              <label className="filter-label">
                Khoảng giá: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </label>
              <Slider
                range
                min={0}
                max={10000000}
                step={100000}
                value={filters.priceRange}
                onChange={(value) => handleFilterUpdate('priceRange', value)}
                tooltip={{
                  formatter: (value) => formatPrice(value),
                }}
              />
            </div>
          </Panel>
        </Collapse>
      </div>
    </Card>
  );
};

export default ShopFilters;
