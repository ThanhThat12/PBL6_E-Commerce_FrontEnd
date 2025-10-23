import React, { useState, useEffect } from 'react';
import { Layout, Card, Modal, Select, message } from 'antd';
import { Sidebar, Header } from '../../components/Seller';
import OrderTable from '../../components/Seller/Orders/OrderTable';
import OrderFilters from '../../components/Seller/Orders/OrderFilters';
import OrderStats from '../../components/Seller/Orders/OrderStats';
import orderService from '../../services/orderService';
import dayjs from 'dayjs';
import './OrdersPage.css';

const { Content } = Layout;
const { Option } = Select;

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      console.log('📦 Fetched orders data:', data);
      setOrders(data.orders);
      setFilteredOrders(data.orders);
      
      // Tính toán statistics từ dữ liệu orders
      updateStatistics(data.orders);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      message.error('Không thể tải dữ liệu đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    let filtered = [...orders];

    // Lọc theo khoảng thời gian
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter((order) => {
        const orderDate = dayjs(order.created_at);
        return orderDate.isAfter(startDate.startOf('day')) && 
               orderDate.isBefore(endDate.endOf('day'));
      });
    }

    // Lọc theo trạng thái đơn hàng
    if (filters.orderStatus && filters.orderStatus !== 'all') {
      filtered = filtered.filter(
        (order) => order.status === filters.orderStatus
      );
    }

    // Tìm kiếm theo ID đơn hàng hoặc User ID
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const searchLower = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchLower) ||
          order.user_id.toString().includes(searchLower)
      );
    }

    setFilteredOrders(filtered);

    // Cập nhật thống kê dựa trên kết quả lọc
    updateStatistics(filtered);
  };

  const updateStatistics = (filteredData) => {
    const stats = {
      totalOrders: filteredData.length,
      pendingOrders: filteredData.filter((o) => o.status === 'Pending').length,
      processingOrders: filteredData.filter((o) => o.status === 'Processing').length,
      shippingOrders: filteredData.filter((o) => o.status === 'Shipping').length,
      completedOrders: filteredData.filter((o) => o.status === 'Completed').length,
      cancelledOrders: filteredData.filter((o) => o.status === 'Cancelled').length,
      totalRevenue: filteredData
        .filter((order) => order.status === 'Completed') // Chỉ tính doanh thu từ đơn hàng hoàn thành
        .reduce((sum, order) => sum + (order.total_amount || 0), 0),
    };
    
    console.log('📊 Updated statistics:', stats);
    console.log('📊 Sample orders for debugging:', filteredData.slice(0, 3));
    
    setStatistics(stats);
  };

  const handleReset = () => {
    setFilteredOrders(orders);
    updateStatistics(orders);
  };

  const handleStatusChange = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusModalVisible(true);
  };

  const handleStatusUpdate = async () => {
    try {
      await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      message.success('Cập nhật trạng thái đơn hàng thành công');
      
      // Cập nhật lại danh sách đơn hàng
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      updateStatistics(updatedOrders);
      
      setStatusModalVisible(false);
      setSelectedOrder(null);
    } catch (error) {
      message.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  return (
    <Layout className="orders-page-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>

      <Layout>
        <Header />
        <Content className="orders-page-content">
          <div className="page-header">
            <h1 className="page-title">Quản lý đơn hàng</h1>
          </div>

          <OrderStats statistics={statistics} />

          <OrderFilters onFilterChange={handleFilterChange} onReset={handleReset} />

          <Card className="orders-table-card" loading={loading}>
            <OrderTable
              orders={filteredOrders}
              onStatusChange={handleStatusChange}
            />
          </Card>
        </Content>
      </Layout>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={statusModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setStatusModalVisible(false);
          setSelectedOrder(null);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <div className="status-update-modal">
          <p>
            <strong>ID đơn hàng:</strong> #{selectedOrder?.id}
          </p>
          <p>
            <strong>Trạng thái hiện tại:</strong>{' '}
            {selectedOrder?.status === 'Pending' && 'Chờ xử lý'}
            {selectedOrder?.status === 'Processing' && 'Đang xử lý'}
            {selectedOrder?.status === 'Shipping' && 'Đang giao'}
            {selectedOrder?.status === 'Completed' && 'Hoàn thành'}
            {selectedOrder?.status === 'Cancelled' && 'Đã hủy'}
          </p>
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              <strong>Chọn trạng thái mới:</strong>
            </label>
            <Select
              value={newStatus}
              onChange={setNewStatus}
              style={{ width: '100%' }}
            >
              <Option value="Pending">Chờ xử lý</Option>
              <Option value="Processing">Đang xử lý</Option>
              <Option value="Shipping">Đang giao</Option>
              <Option value="Completed">Hoàn thành</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default OrdersPage;
