import React from 'react';
import { Card, Row, Col, DatePicker, Select, Button, Space, Input } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './OrderFilters.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderFilters = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = React.useState({
    dateRange: null,
    orderStatus: 'all',
    searchQuery: '',
  });

  const handleDateRangeChange = (dates) => {
    const newFilters = {
      ...filters,
      dateRange: dates,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleOrderStatusChange = (value) => {
    const newFilters = {
      ...filters,
      orderStatus: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e) => {
    const newFilters = {
      ...filters,
      searchQuery: e.target.value,
    };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: null,
      orderStatus: 'all',
      searchQuery: '',
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <Card className="order-filters-card">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="filter-item">
            <label className="filter-label">Khoảng thời gian:</label>
            <RangePicker
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: '100%' }}
            />
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="filter-item">
            <label className="filter-label">Trạng thái đơn hàng:</label>
            <Select
              value={filters.orderStatus}
              onChange={handleOrderStatusChange}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="Pending">Chờ xử lý</Option>
              <Option value="Processing">Đang xử lý</Option>
              <Option value="Completed">Hoàn thành</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="filter-item">
            <label className="filter-label">Tìm kiếm:</label>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="ID đơn hàng, User ID..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                onPressEnter={handleSearch}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Tìm
              </Button>
            </Space.Compact>
          </div>
        </Col>

        <Col xs={24}>
          <div className="filter-actions">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default OrderFilters;
