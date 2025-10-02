import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber,
  Switch,
  message,
  Statistic,
  Row,
  Col,
  Dropdown,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined,
  MoreOutlined,
  GiftOutlined,
  UserOutlined,
  DollarOutlined,
  PercentageOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { Sidebar, Header } from '../../components/Seller';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../services/couponService';
import './CouponPage.css';
import dayjs from 'dayjs';

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CouponPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsed: 0,
    totalRevenue: 0,
    totalDiscount: 0
  });

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getCoupons();
      setCoupons(data);
      calculateStats(data);
    } catch (error) {
      message.error('Không thể tải danh sách coupon');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (coupons) => {
    const now = new Date();
    const activeCoupons = coupons.filter(c => 
      c.isActive && 
      new Date(c.startDate) <= now && 
      new Date(c.endDate) >= now
    );
    
    const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const totalRevenue = coupons.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
    const totalDiscount = coupons.reduce((sum, c) => sum + (c.totalDiscount || 0), 0);

    setStats({
      totalCoupons: coupons.length,
      activeCoupons: activeCoupons.length,
      totalUsed,
      totalRevenue,
      totalDiscount
    });
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    form.setFieldsValue({
      ...coupon,
      dateRange: [dayjs(coupon.startDate), dayjs(coupon.endDate)],
      applicableCategories: coupon.applicableCategories || []
    });
    setModalVisible(true);
  };

  const handleDeleteCoupon = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa mã coupon này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteCoupon(id);
          message.success('Xóa coupon thành công');
          fetchCoupons();
        } catch (error) {
          message.error('Xóa coupon thất bại');
        }
      }
    });
  };

  const handleDuplicateCoupon = (coupon) => {
    setEditingCoupon(null);
    form.setFieldsValue({
      ...coupon,
      code: `${coupon.code}_COPY`,
      dateRange: [dayjs(), dayjs().add(30, 'day')]
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const couponData = {
        ...values,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
      };
      delete couponData.dateRange;

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData);
        message.success('Cập nhật coupon thành công');
      } else {
        await createCoupon(couponData);
        message.success('Tạo coupon thành công');
      }

      setModalVisible(false);
      form.resetFields();
      fetchCoupons();
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Đã copy mã coupon');
  };

  const columns = [
    {
      title: 'Mã Coupon',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code) => (
        <Space>
          <Tag color="blue" className="coupon-code-tag">
            <GiftOutlined /> {code}
          </Tag>
          <Tooltip title="Copy">
            <Button 
              type="text" 
              size="small" 
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(code)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discountType',
      key: 'discountType',
      width: 120,
      render: (type, record) => (
        <Tag color={type === 'PERCENTAGE' ? 'green' : 'orange'}>
          {type === 'PERCENTAGE' ? (
            <><PercentageOutlined /> {record.discountValue}%</>
          ) : (
            <><DollarOutlined /> ${record.discountValue}</>
          )}
        </Tag>
      ),
    },
    {
      title: 'Danh mục áp dụng',
      dataIndex: 'applicableCategories',
      key: 'applicableCategories',
      width: 180,
      render: (categories) => (
        <Space wrap>
          {categories && categories.length > 0 ? (
            categories.slice(0, 2).map((cat, idx) => (
              <Tag key={idx}>{cat}</Tag>
            ))
          ) : (
            <Tag color="purple">Tất cả</Tag>
          )}
          {categories && categories.length > 2 && (
            <Tag>+{categories.length - 2}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Thời gian',
      key: 'dateRange',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <small>Bắt đầu: {dayjs(record.startDate).format('DD/MM/YYYY')}</small>
          <small>Kết thúc: {dayjs(record.endDate).format('DD/MM/YYYY')}</small>
        </Space>
      ),
    },
    {
      title: 'Giới hạn',
      key: 'limits',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <small>Tối đa: {record.maxUses || '∞'} lần</small>
          <small>Đã dùng: {record.usedCount || 0} lần</small>
        </Space>
      ),
    },
    {
      title: 'Thống kê',
      key: 'stats',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <small>👥 {record.usersCount || 0} người dùng</small>
          <small>💰 Doanh thu: ${record.totalRevenue || 0}</small>
          <small>🎁 Giảm giá: ${record.totalDiscount || 0}</small>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const now = new Date();
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);
        
        let status = 'default';
        let text = 'Chưa bắt đầu';
        let icon = <CalendarOutlined />;
        
        if (!record.isActive) {
          status = 'error';
          text = 'Vô hiệu hóa';
          icon = <CloseCircleOutlined />;
        } else if (startDate > now) {
          status = 'warning';
          text = 'Sắp diễn ra';
          icon = <CalendarOutlined />;
        } else if (endDate < now) {
          status = 'default';
          text = 'Đã hết hạn';
          icon = <CloseCircleOutlined />;
        } else if (record.maxUses && record.usedCount >= record.maxUses) {
          status = 'default';
          text = 'Hết lượt';
          icon = <CloseCircleOutlined />;
        } else {
          status = 'success';
          text = 'Đang hoạt động';
          icon = <CheckCircleOutlined />;
        }
        
        return <Tag color={status} icon={icon}>{text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => {
        const menuItems = [
          {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <EditOutlined />,
            onClick: () => handleEditCoupon(record)
          },
          {
            key: 'duplicate',
            label: 'Nhân bản',
            icon: <CopyOutlined />,
            onClick: () => handleDuplicateCoupon(record)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            label: 'Xóa',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDeleteCoupon(record.id)
          }
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Layout className="coupon-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>
      
      <Layout>
        <Header />
        <Content className="coupon-content">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Quản lý Coupon Code</h1>
              <p className="page-description">Tạo và quản lý các mã giảm giá cho khách hàng</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              onClick={handleCreateCoupon}
            >
              Tạo Coupon Mới
            </Button>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[24, 24]} className="stats-row">
            <Col  xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng Coupon"
                  value={stats.totalCoupons}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col  xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Đang Hoạt Động"
                  value={stats.activeCoupons}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Lượt Sử Dụng"
                  value={stats.totalUsed}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col  xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng Doanh Thu"
                  value={stats.totalRevenue}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#cf1322' }}
                />
                <div className="stat-subtitle">
                  <small>Giảm giá: ${stats.totalDiscount.toFixed(2)}</small>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Coupons Table */}
          <Card className="table-card">
            <Table
              columns={columns}
              dataSource={coupons}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1500 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} coupon`
              }}
            />
          </Card>

          {/* Create/Edit Modal */}
          <Modal
            title={editingCoupon ? 'Chỉnh sửa Coupon' : 'Tạo Coupon Mới'}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              form.resetFields();
            }}
            footer={null}
            width={700}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                discountType: 'PERCENTAGE',
                isActive: true,
                minOrderValue: 0,
                maxDiscountAmount: null,
                maxUses: null,
                maxUsesPerUser: 1,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="code"
                    label="Mã Coupon"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mã coupon' },
                      { pattern: /^[A-Z0-9_-]+$/, message: 'Chỉ cho phép chữ in hoa, số, gạch ngang và gạch dưới' }
                    ]}
                  >
                    <Input placeholder="VD: SUMMER2024" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="discountType"
                    label="Loại giảm giá"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Option value="PERCENTAGE">Phần trăm (%)</Option>
                      <Option value="FIXED_AMOUNT">Số tiền cố định ($)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="discountValue"
                    label="Giá trị giảm"
                    rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="VD: 10"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxDiscountAmount"
                    label="Giảm tối đa (cho % )"
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="VD: 50"
                      prefix="$"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <Input.TextArea rows={3} placeholder="Mô tả chi tiết về coupon" />
              </Form.Item>

              <Form.Item
                name="applicableCategories"
                label="Danh mục áp dụng"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn danh mục (để trống = tất cả)"
                  allowClear
                >
                  <Option value="Shoes">Shoes</Option>
                  <Option value="Bags">Bags</Option>
                  <Option value="Sport Equipment">Sport Equipment</Option>
                  <Option value="Fitness Equipment">Fitness Equipment</Option>
                  <Option value="Clothing">Clothing</Option>
                  <Option value="Accessories">Accessories</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dateRange"
                label="Thời gian hiệu lực"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
              >
                <RangePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="minOrderValue"
                    label="Giá trị đơn hàng tối thiểu"
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="0 = không giới hạn"
                      prefix="$"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxUses"
                    label="Số lượt sử dụng tối đa"
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="Không giới hạn"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="maxUsesPerUser"
                    label="Số lần dùng/người"
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="1"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="isActive"
                    label="Trạng thái"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item className="form-actions">
                <Space>
                  <Button onClick={() => setModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingCoupon ? 'Cập nhật' : 'Tạo Coupon'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CouponPage;
