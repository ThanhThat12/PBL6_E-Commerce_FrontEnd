import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, message, Tabs, Spin, Input, DatePicker, Card, Badge, Avatar } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, SendOutlined, SearchOutlined, ExportOutlined, CarOutlined } from '@ant-design/icons';
import { 
  getOrders, 
  getOrderDetail,
  confirmOrder,
  shipOrder,
  cancelOrder,
  getRefundRequests,
  reviewRefund,
  confirmReceipt,
  ORDER_STATUS, 
  STATUS_LABELS 
} from '../../services/seller/orderService';

const { RangePicker } = DatePicker;

/**
 * Orders Page
 * Display and manage all orders
 */
const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [refundRequests, setRefundRequests] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
    fetchRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const fetchRefunds = async () => {
    try {
      const refunds = await getRefundRequests();
      setRefundRequests(refunds);
    } catch (error) {
      console.error('Error fetching refund requests:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        // Không filter status ở đây, luôn lấy tất cả
      };
      const response = await getOrders(params);
      setAllOrders(response.content || []);
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

  useEffect(() => {
    // Mỗi lần đổi tab, filter lại từ allOrders
    let filtered = allOrders;
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
    setOrders(filtered);
  }, [activeTab, allOrders, searchText]);

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

  const handleApproveRefund = async (refundId) => {
    try {
      await reviewRefund(refundId, true);
      message.success('Đã chấp nhận yêu cầu trả hàng - Chờ khách gửi hàng về');
      fetchRefunds();
      fetchOrders();
    } catch (error) {
      console.error('Error approving refund:', error);
      message.error('Không thể chấp nhận yêu cầu');
    }
  };

  const handleRejectRefund = (refundId) => {
    Modal.confirm({
      title: 'Từ chối yêu cầu trả hàng',
      content: (
        <div>
          <p className="mb-2">Vui lòng nhập lý do từ chối:</p>
          <Input.TextArea 
            id="rejectReason"
            rows={3} 
            placeholder="Lý do từ chối..."
          />
        </div>
      ),
      okText: 'Từ chối',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        const reason = document.getElementById('rejectReason')?.value || 'Không đạt yêu cầu';
        try {
          await reviewRefund(refundId, false, reason);
          message.success('Đã từ chối yêu cầu trả hàng');
          fetchRefunds();
          fetchOrders();
        } catch (error) {
          console.error('Error rejecting refund:', error);
          message.error('Không thể từ chối yêu cầu');
        }
      }
    });
  };

  const handleConfirmReceipt = (refundId) => {
    Modal.confirm({
      title: 'Xác nhận đã nhận hàng trả về',
      content: 'Xác nhận hàng đã nhận và kiểm tra OK? Hệ thống sẽ tự động hoàn tiền cho khách.',
      okText: 'Đã nhận hàng',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await confirmReceipt(refundId);
          message.success('Đã xác nhận nhận hàng - Hoàn tiền thành công');
          fetchRefunds();
          fetchOrders();
        } catch (error) {
          console.error('Error confirming receipt:', error);
          message.error('Không thể xác nhận nhận hàng');
        }
      }
    });
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

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }
    
    try {
      await cancelOrder(orderId);
      message.success('Đã hủy đơn hàng');
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      message.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
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

    // Đang xử lý: Giao cho ship hoặc Hủy đơn
    if (status === ORDER_STATUS.PROCESSING) {
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={() => handleShipOrder(id)}
            block
          >
            Giao hàng
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

    // Đang giao: Không có action
    if (status === ORDER_STATUS.SHIPPING) {
      return (
        <Button
          type="default"
          size="small"
          disabled
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

  const getOrderCount = (status) => {
    if (!allOrders) return 0;
    if (status === 'ALL') return allOrders.length;
    if (status === 'TO_SHIP') {
      return allOrders.filter(o =>
        o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.PROCESSING
      ).length;
    }
    return allOrders.filter(o => o.status === status).length;
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
    { key: 'ALL', label: (
      <span className="tab-label">
        Tất cả
        <Badge count={getOrderCount('ALL')} offset={[6, 0]} />
      </span>
    ) },
    { key: 'PENDING', label: (
      <span className="tab-label">
        Chờ xác nhận
        <Badge count={getOrderCount(ORDER_STATUS.PENDING)} offset={[6, 0]} />
      </span>
    ) },
    { key: 'TO_SHIP', label: (
      <span className="tab-label">
        Chờ giao hàng
        <Badge count={getOrderCount('TO_SHIP')} offset={[6, 0]} />
      </span>
    ) },
    { key: 'SHIPPING', label: (
      <span className="tab-label">
        Đang giao
        <Badge count={getOrderCount(ORDER_STATUS.SHIPPING)} offset={[6, 0]} />
      </span>
    ) },
    { key: 'COMPLETED', label: (
      <span className="tab-label">
        Hoàn thành
        <Badge count={getOrderCount(ORDER_STATUS.COMPLETED)} offset={[6, 0]} />
      </span>
    ) },
    { key: 'CANCELLED', label: (
      <span className="tab-label">
        Đã hủy
        <Badge count={getOrderCount(ORDER_STATUS.CANCELLED)} offset={[6, 0]} />
      </span>
    ) },
  ];

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
          <span className="text-lg font-semibold">{orders.length} Đơn hàng</span>
        </div>
        <Table
          columns={columns}
          dataSource={orders}
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
                {selectedOrder.items?.map(item => {
                  // Find refund request for this item
                  const itemRefund = refundRequests.find(r => 
                    r.refundItems?.some(ri => ri.orderItemId === item.id)
                  );
                  
                  return (
                    <li key={item.id} className="mb-3 p-3 border rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center flex-1">
                          {item.productImage && (
                            <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover mr-3" />
                          )}
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-500">
                              {item.variantName} × {item.quantity} — {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}
                            </div>
                          </div>
                        </div>
                        {itemRefund && (
                          <div className="ml-3">
                            {itemRefund.status === 'REQUESTED' && (
                              <Space direction="vertical" size="small">
                                <Tag color="orange">Yêu cầu trả hàng</Tag>
                                <Space size="small">
                                  <Button 
                                    type="primary" 
                                    size="small"
                                    onClick={() => handleApproveRefund(itemRefund.id)}
                                  >
                                    Chấp nhận
                                  </Button>
                                  <Button 
                                    danger 
                                    size="small"
                                    onClick={() => handleRejectRefund(itemRefund.id)}
                                  >
                                    Từ chối
                                  </Button>
                                </Space>
                              </Space>
                            )}
                            {itemRefund.status === 'APPROVED' && (
                              <Space direction="vertical" size="small">
                                <Tag color="blue">Chờ khách gửi hàng</Tag>
                                <Button 
                                  type="primary" 
                                  size="small"
                                  onClick={() => handleConfirmReceipt(itemRefund.id)}
                                >
                                  Đã nhận hàng
                                </Button>
                              </Space>
                            )}
                            {itemRefund.status === 'COMPLETED' && (
                              <Tag color="green">Đã hoàn tiền</Tag>
                            )}
                            {itemRefund.status === 'REJECTED' && (
                              <Tag color="red">Đã từ chối</Tag>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Orders;
