import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, message, Tabs, Spin, Input, DatePicker, Card, Badge, Avatar } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, SendOutlined, SearchOutlined, ExportOutlined, CarOutlined } from '@ant-design/icons';
import { 
  getOrders, 
  getOrderDetail,
  confirmOrder,
  shipOrder,
  cancelOrder,
  ORDER_STATUS, 
  STATUS_LABELS 
} from '../../services/seller/orderService';

const { confirm } = Modal;
const { RangePicker } = DatePicker;

/**
 * Orders Page
 * Display and manage all orders
 */
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        status: activeTab !== 'ALL' ? activeTab : undefined,
      };

      const response = await getOrders(params);
      
      setOrders(response.content || []);
      setPagination({
        ...pagination,
        total: response.totalElements || 0,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await confirmOrder(orderId);
      message.success('Đã xác nhận đơn hàng');
      fetchOrders();
    } catch (error) {
      console.error('Error confirming order:', error);
      message.error('Không thể xác nhận đơn hàng');
    }
  };

  const handleShipOrder = async (orderId) => {
    try {
      await shipOrder(orderId);
      message.success('Đã giao hàng cho đơn vị vận chuyển');
      fetchOrders();
    } catch (error) {
      console.error('Error shipping order:', error);
      message.error('Không thể cập nhật trạng thái giao hàng');
    }
  };

  const handleCancelOrder = (orderId) => {
    confirm({
      title: 'Xác nhận hủy đơn hàng',
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      okText: 'Hủy đơn',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          await cancelOrder(orderId);
          message.success('Đã hủy đơn hàng');
          fetchOrders();
        } catch (error) {
          console.error('Error cancelling order:', error);
          message.error('Không thể hủy đơn hàng');
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'orange',
      PROCESSING: 'blue',
      SHIPPING: 'cyan',
      COMPLETED: 'green',
      CANCELLED: 'red',
    };
    return colorMap[status] || 'default';
  };

  const renderActionButtons = (record) => {
    const { status, id } = record;

    // Chờ xác nhận: Xác nhận đơn, Hủy đơn
    if (status === ORDER_STATUS.PENDING) {
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleConfirmOrder(id)}
            block
          >
            Xác nhận đơn
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => handleCancelOrder(id)}
            block
          >
            Hủy đơn
          </Button>
        </Space>
      );
    }

    // Đang xử lý: Đã đóng gói/Giao cho ship (không cho hủy)
    if (status === ORDER_STATUS.PROCESSING) {
      return (
        <Button
          type="primary"
          size="small"
          icon={<SendOutlined />}
          onClick={() => handleShipOrder(id)}
          block
        >
          Sắp xếp giao hàng
        </Button>
      );
    }

    // Đang giao: Không có action, buyer xác nhận hoặc tự động sau 1 ngày
    if (status === ORDER_STATUS.SHIPPING) {
      return (
        <Tag color="cyan">
          Đợi khách xác nhận
        </Tag>
      );
    }

    // Hoàn thành / Đã hủy: Không có action
    return null;
  };

  const getCountdown = (record) => {
    if (record.status === ORDER_STATUS.PENDING || record.status === ORDER_STATUS.PROCESSING) {
      const createdDate = new Date(record.createdAt);
      const deadline = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      const hoursLeft = Math.floor((deadline - now) / (1000 * 60 * 60));
      
      if (hoursLeft > 0) {
        return (
          <Tag color="orange">
            Giao hàng trong {hoursLeft} giờ
          </Tag>
        );
      }
    }
    return null;
  };

  const getShippingProvider = (record) => {
    // Mock shipping provider - in real app, get from shipment data
    const providers = ['J&T Express', 'Shopee Express', 'GHN Express', 'Viettel Post'];
    return providers[Math.floor(Math.random() * providers.length)];
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      width: 350,
      render: (items, record) => (
        <div>
          <div className="flex items-start mb-2">
            <Avatar src={record.customerAvatar} size="small" className="mr-2" />
            <span className="text-xs text-gray-500">Mã đơn: #{record.orderCode}</span>
          </div>
          {items && items.length > 0 ? (
            <div className="space-y-2">
              {items.slice(0, 2).map((item, index) => (
                <div key={index} className="flex items-center">
                  <img 
                    src={item.mainImage || item.productImage || 'https://via.placeholder.com/50'} 
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded mr-3"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.productName}</div>
                    <div className="text-xs text-gray-500">x{item.quantity}</div>
                  </div>
                </div>
              ))}
              {items.length > 2 && (
                <div className="text-xs text-blue-500">+{items.length - 2} sản phẩm khác</div>
              )}
            </div>
          ) : (
            <span className="text-gray-400">Không có sản phẩm</span>
          )}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount, record) => (
        <div>
          <div className="font-semibold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(amount)}
          </div>
          <div className="text-xs text-gray-500">
            {record.paymentMethod === 'COD' ? 'Thanh toán COD' : 'Đã thanh toán'}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {STATUS_LABELS[status] || status}
          </Tag>
          {getCountdown(record)}
        </div>
      ),
    },
    {
      title: 'Đơn vị vận chuyển',
      key: 'shipping',
      width: 150,
      render: (_, record) => (
        <div>
          {record.status !== ORDER_STATUS.PENDING && record.status !== ORDER_STATUS.CANCELLED ? (
            <div className="flex items-center">
              <CarOutlined className="mr-2 text-blue-500" />
              <span className="text-sm">{getShippingProvider(record)}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Chưa giao</span>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {renderActionButtons(record)}
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={async () => {
              try {
                setDetailLoading(true);
                const detail = await getOrderDetail(record.id);
                setSelectedOrder(detail);
                setDetailModalVisible(true);
              } catch (err) {
                console.error('Error fetching order detail:', err);
                message.error('Không thể tải chi tiết đơn hàng');
              } finally {
                setDetailLoading(false);
              }
            }}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  // eslint-disable-next-line no-unused-vars
  const getOrderCount = (status) => {
    if (!orders) return 0;
    if (status === 'ALL') return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  const getToShipCount = () => {
    return orders.filter(o => 
      o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.PROCESSING
    ).length;
  };

  const getPendingCount = () => {
    return orders.filter(o => o.status === ORDER_STATUS.PENDING).length;
  };

  const tabItems = [
    { key: 'ALL', label: 'Tất cả' },
    { 
      key: 'PENDING', 
      label: (
        <Badge count={getPendingCount()} offset={[10, 0]}>
          Chờ xác nhận
        </Badge>
      )
    },
    { 
      key: 'TO_SHIP', 
      label: (
        <Badge count={getToShipCount()} offset={[10, 0]}>
          Chờ giao hàng
        </Badge>
      )
    },
    { key: 'SHIPPING', label: 'Đang giao' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'CANCELLED', label: 'Đã hủy' },
  ];

  const filterOrders = () => {
    let filtered = orders;

    // Filter by main tab
    if (activeTab === 'TO_SHIP') {
      filtered = filtered.filter(o => 
        o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.PROCESSING
      );
    } else if (activeTab !== 'ALL') {
      filtered = filtered.filter(o => o.status === activeTab);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(o => 
        o.orderCode?.toLowerCase().includes(searchText.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  };

  return (
    <div className="p-6">
      {/* Main Tabs */}
      <Card className="mb-4">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPagination({ ...pagination, current: 1 });
          }}
          items={tabItems}
          size="large"
        />
      </Card>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex justify-between items-center">
          <Space size="middle">
            <Input
              placeholder="Tìm kiếm đơn hàng"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <RangePicker
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              value={dateRange}
              onChange={setDateRange}
              format="YYYY/MM/DD"
            />
          </Space>
          
          <Space>
            <Button icon={<ExportOutlined />}>
              Xuất Excel
            </Button>
            {activeTab === 'TO_SHIP' && (
              <Button type="primary" icon={<CarOutlined />} danger>
                Giao hàng loạt
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="mb-4">
          <span className="text-lg font-semibold">{filterOrders().length} Đơn hàng</span>
        </div>
        <Table
          columns={columns}
          dataSource={filterOrders()}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          onChange={(newPagination) => {
            setPagination({
              current: newPagination.current,
              pageSize: newPagination.pageSize,
              total: pagination.total,
            });
          }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.orderCode}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {detailLoading ? (
          <div className="flex justify-center py-8"><Spin /></div>
        ) : selectedOrder ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
              <p>Tên: {selectedOrder.customerName}</p>
              <p>Địa chỉ: {selectedOrder.shippingAddress}</p>
              <p>Số điện thoại: {selectedOrder.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chi tiết đơn hàng</h3>
              <p>Tổng tiền: {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(selectedOrder.totalAmount)}</p>
              <p>Trạng thái: <Tag color={getStatusColor(selectedOrder.status)}>
                {STATUS_LABELS[selectedOrder.status]}
              </Tag></p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Sản phẩm</h3>
              <ul>
                {selectedOrder.items?.map(item => (
                  <li key={item.id} className="mb-2">
                    <div className="flex items-center">
                      {(item.mainImage || item.productImage) && (
                        <img src={item.mainImage || item.productImage} alt={item.productName} className="w-12 h-12 object-cover mr-3" onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-500">{item.variantName} × {item.quantity} — {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Orders;
