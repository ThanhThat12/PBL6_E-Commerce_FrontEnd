import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import voucherService from '../../services/seller/voucherService';
import { getProducts } from '../../services/seller/productService';
import { getTopBuyers } from '../../services/seller/statisticalService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

/**
 * VoucherManagement - Seller voucher management page
 */
const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadVouchers();
    loadProducts();
    loadTopBuyers();
  }, []);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const response = await voucherService.getAllVouchers();
      const data = response?.data || response || [];
      setVouchers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      message.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      const data = response?.data?.content || response?.content || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadTopBuyers = async () => {
    try {
      const response = await getTopBuyers({ limit: 10 });
      const data = response?.data || response || [];
      setTopBuyers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading top buyers:', error);
    }
  };

  const handleCreateVoucher = async (values) => {
    try {
      const voucherData = {
        code: values.code,
        description: values.description,
        discountType: values.discountType,
        discountValue: values.discountValue,
        minOrderValue: values.minOrderValue || 0,
        maxDiscountAmount: values.maxDiscountAmount || null,
        startDate: values.dateRange[0].format('YYYY-MM-DDTHH:mm:ss'),
        endDate: values.dateRange[1].format('YYYY-MM-DDTHH:mm:ss'),
        usageLimit: values.usageLimit || 0,
        applicableType: values.applicableType,
        productIds: values.productIds || [],
        userIds: values.userIds || [],
        topBuyersCount: values.topBuyersCount || null
      };

      await voucherService.createVoucher(voucherData);
      message.success('Tạo voucher thành công!');
      setShowCreateModal(false);
      form.resetFields();
      loadVouchers();
    } catch (error) {
      console.error('Error creating voucher:', error);
      message.error(error.response?.data?.message || 'Không thể tạo voucher');
    }
  };

  const handleDeactivate = async (voucherId) => {
    try {
      await voucherService.deactivateVoucher(voucherId);
      message.success('Đã vô hiệu hóa voucher');
      loadVouchers();
    } catch (error) {
      console.error('Error deactivating voucher:', error);
      message.error('Không thể vô hiệu hóa voucher');
    }
  };

  const columns = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      render: (code, record) => (
        <div>
          <div className="font-semibold text-blue-600">{code}</div>
          <div className="text-xs text-gray-500">{record.description}</div>
        </div>
      )
    },
    {
      title: 'Loại Giảm Giá',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type, record) => (
        <div>
          {type === 'PERCENTAGE' ? (
            <Tag color="green">{record.discountValue}%</Tag>
          ) : (
            <Tag color="blue">{record.discountValue.toLocaleString('vi-VN')}₫</Tag>
          )}
          {record.maxDiscountAmount && (
            <div className="text-xs text-gray-500 mt-1">
              Tối đa: {record.maxDiscountAmount.toLocaleString('vi-VN')}₫
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Điều Kiện',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (value) => (
        <div className="text-sm">
          Đơn tối thiểu: <span className="font-semibold">{value.toLocaleString('vi-VN')}₫</span>
        </div>
      )
    },
    {
      title: 'Áp Dụng',
      dataIndex: 'applicableType',
      key: 'applicableType',
      render: (type, record) => {
        const typeMap = {
          'ALL': 'Tất cả',
          'SPECIFIC_PRODUCTS': `${record.productIds?.length || 0} sản phẩm`,
          'SPECIFIC_USERS': `${record.userIds?.length || 0} người dùng`,
          'TOP_BUYERS': `Top ${record.topBuyersCount || 0} khách hàng`
        };
        return <Tag color="purple">{typeMap[type]}</Tag>;
      }
    },
    {
      title: 'Thời Gian',
      key: 'time',
      render: (_, record) => (
        <div className="text-xs">
          <div>Từ: {dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}</div>
          <div>Đến: {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}</div>
        </div>
      )
    },
    {
      title: 'Sử Dụng',
      key: 'usage',
      render: (_, record) => (
        <div className="text-sm">
          <span className="font-semibold">{record.usedCount}</span> / {record.usageLimit}
        </div>
      )
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Đã hủy'}
        </Tag>
      )
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          
          {record.isActive && (
            <Popconfirm
              title="Bạn có chắc muốn vô hiệu hóa voucher này?"
              onConfirm={() => handleDeactivate(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                Vô hiệu hóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Voucher</h1>
          <p className="text-gray-600">Tạo và quản lý mã giảm giá cho shop</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowCreateModal(true)}
        >
          Tạo Voucher
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={vouchers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} voucher`
          }}
        />
      </Card>

      {/* Create Voucher Modal */}
      <Modal
        title="Tạo Voucher Mới"
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
        okText="Tạo Voucher"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateVoucher}
        >
          <Form.Item
            label="Mã Voucher"
            name="code"
            rules={[
              { required: true, message: 'Vui lòng nhập mã voucher' },
              { pattern: /^[A-Z0-9]+$/, message: 'Chỉ sử dụng chữ in hoa và số' }
            ]}
          >
            <Input placeholder="VD: NEWYEAR2024" maxLength={50} />
          </Form.Item>

          <Form.Item
            label="Mô Tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={2} placeholder="Mô tả về voucher" />
          </Form.Item>

          <Form.Item
            label="Loại Giảm Giá"
            name="discountType"
            rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
          >
            <Select placeholder="Chọn loại giảm giá">
              <Option value="PERCENTAGE">Giảm theo phần trăm (%)</Option>
              <Option value="FIXED_AMOUNT">Giảm giá cố định (₫)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá Trị Giảm"
            name="discountValue"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="VD: 20 (cho 20%) hoặc 50000 (cho 50k)"
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.discountType !== currentValues.discountType
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('discountType') === 'PERCENTAGE' ? (
                <Form.Item
                  label="Giảm Tối Đa (₫)"
                  name="maxDiscountAmount"
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="VD: 50000 (giảm tối đa 50k)"
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            label="Giá Trị Đơn Tối Thiểu (₫)"
            name="minOrderValue"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị đơn tối thiểu' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="VD: 100000"
            />
          </Form.Item>

          <Form.Item
            label="Thời Gian Hiệu Lực"
            name="dateRange"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <RangePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Giới Hạn Sử Dụng"
            name="usageLimit"
            rules={[{ required: true, message: 'Vui lòng nhập giới hạn sử dụng' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="VD: 100"
            />
          </Form.Item>

          <Form.Item
            label="Loại Áp Dụng"
            name="applicableType"
            rules={[{ required: true, message: 'Vui lòng chọn loại áp dụng' }]}
          >
            <Select placeholder="Chọn đối tượng áp dụng">
              <Option value="ALL">Tất cả người dùng</Option>
              <Option value="SPECIFIC_PRODUCTS">Sản phẩm cụ thể</Option>
              <Option value="SPECIFIC_USERS">Người dùng cụ thể</Option>
              <Option value="TOP_BUYERS">Top khách hàng mua nhiều</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.applicableType !== currentValues.applicableType
            }
          >
            {({ getFieldValue }) => {
              const applicableType = getFieldValue('applicableType');
              
              if (applicableType === 'SPECIFIC_PRODUCTS') {
                return (
                  <Form.Item
                    label="Chọn Sản Phẩm"
                    name="productIds"
                    rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn các sản phẩm áp dụng"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {products.map(product => (
                        <Option key={product.id} value={product.id}>
                          {product.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              
              if (applicableType === 'SPECIFIC_USERS') {
                return (
                  <Form.Item
                    label="Chọn Người Dùng"
                    name="userIds"
                    rules={[{ required: true, message: 'Vui lòng chọn người dùng' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn các người dùng áp dụng"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {topBuyers.map(buyer => (
                        <Option key={buyer.userId} value={buyer.userId}>
                          {buyer.username} ({buyer.email})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }
              
              if (applicableType === 'TOP_BUYERS') {
                return (
                  <Form.Item
                    label="Số Lượng Top Khách Hàng"
                    name="topBuyersCount"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="VD: 5 (top 5 khách hàng)"
                    />
                  </Form.Item>
                );
              }
              
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VoucherManagement;