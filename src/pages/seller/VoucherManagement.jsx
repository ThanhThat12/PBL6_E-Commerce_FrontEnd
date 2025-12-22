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

      const response = await voucherService.createVoucher(voucherData);
      const createdCode = response?.data?.code || voucherData.code;
      message.success(`Tạo voucher "${createdCode}" thành công!`);
      setShowCreateModal(false);
      form.resetFields();
      loadVouchers();
    } catch (error) {
      console.error('Error creating voucher:', error);
      
      // Handle validation errors with detailed messages
      if (error?.response?.data) {
        const data = error.response.data;
        
        // Case 1: Backend returns simple message (PRIORITY)
        if (data.message) {
          message.error(data.message, 5);
          return;
        }
        
        // Case 2: Backend returns structured validation errors
        if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
          const errorMessages = [];
          
          // Map field names to Vietnamese labels
          const fieldLabels = {
            'code': 'Mã voucher',
            'description': 'Mô tả',
            'discountType': 'Loại giảm giá',
            'discountValue': 'Giá trị giảm',
            'minOrderValue': 'Giá trị đơn tối thiểu',
            'maxDiscountAmount': 'Giảm tối đa',
            'startDate': 'Ngày bắt đầu',
            'endDate': 'Ngày kết thúc',
            'usageLimit': 'Giới hạn sử dụng',
            'applicableType': 'Loại áp dụng',
            'productIds': 'Sản phẩm',
            'userIds': 'Người dùng',
            'topBuyersCount': 'Số lượng top khách hàng'
          };

          Object.entries(data.errors).forEach(([field, messages]) => {
            const label = fieldLabels[field] || field;
            const msgs = Array.isArray(messages) ? messages : [messages];
            msgs.forEach(msg => {
              errorMessages.push(`${label}: ${msg}`);
            });
          });

          if (errorMessages.length > 0) {
            // Show first error as main message
            message.error(errorMessages[0], 5);
            
            // Show additional errors if any
            if (errorMessages.length > 1) {
              setTimeout(() => {
                errorMessages.slice(1, 3).forEach((msg, index) => {
                  setTimeout(() => message.warning(msg, 4), index * 600);
                });
              }, 600);
            }
            return;
          }
        }
        
        // Case 3: Backend returns array of error messages
        if (Array.isArray(data.errors)) {
          const errorMessages = data.errors.filter(msg => msg);
          if (errorMessages.length > 0) {
            message.error(errorMessages[0], 5);
            if (errorMessages.length > 1) {
              setTimeout(() => {
                errorMessages.slice(1, 3).forEach((msg, index) => {
                  setTimeout(() => message.warning(msg, 4), index * 600);
                });
              }, 600);
            }
            return;
          }
        }
        
        // Case 4: Backend returns error field
        if (data.error && typeof data.error === 'string') {
          message.error(data.error, 5);
          return;
        }
      }
      
      // Case 5: Network or other errors
      if (error?.response?.status === 400) {
        message.error('❌ Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các thông tin đã nhập.', 5);
      } else if (error?.response?.status === 409) {
        message.error('❌ Mã voucher đã tồn tại. Vui lòng sử dụng mã khác.', 5);
      } else if (error?.response?.status === 401 || error?.response?.status === 403) {
        message.error('❌ Bạn không có quyền thực hiện thao tác này.', 5);
      } else if (error?.message) {
        message.error(`❌ Lỗi: ${error.message}`, 5);
      } else {
        message.error('❌ Không thể tạo voucher. Vui lòng thử lại sau.', 5);
      }
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
  dataIndex: 'status',
  key: 'status',
  render: (status) => {
    if (!status) {
      return <Tag color="default">Không xác định</Tag>;
    }
    switch (status) {
      case 'ACTIVE':
        return <Tag color="green">Đang diễn ra</Tag>;
      case 'EXPIRED':
        return <Tag color="red">Đã hết hạn</Tag>;
      case 'UPCOMING':
        return <Tag color="orange">Sắp diễn ra</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  }
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <span>🎁</span>
              Quản Lý Voucher
            </h1>
            <p className="text-purple-100">Tạo và quản lý mã giảm giá cho shop</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
            size="large"
            className="bg-white text-purple-600 hover:bg-purple-50 border-0 shadow-lg hover:shadow-xl transition-all"
          >
            Tạo Voucher
          </Button>
        </div>
      </div>

      <Card className="shadow-lg rounded-xl border-0">
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
              { required: true, message: '⚠️ Vui lòng nhập mã voucher' },
              { 
                pattern: /^[A-Z0-9]+$/, 
                message: '⚠️ Mã voucher chỉ được chứa chữ in hoa (A-Z) và số (0-9)' 
              },
              {
                min: 3,
                message: '⚠️ Mã voucher phải có ít nhất 3 ký tự'
              },
              {
                max: 50,
                message: '⚠️ Mã voucher không được vượt quá 50 ký tự'
              }
            ]}
          >
            <Input 
              placeholder="VD: NEWYEAR2024" 
              maxLength={50}
              style={{ textTransform: 'uppercase' }}
            />
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
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.discountType !== currentValues.discountType
            }
          >
            {({ getFieldValue }) => {
              const discountType = getFieldValue('discountType');
              const isPercentage = discountType === 'PERCENTAGE';
              
              return (
                <Form.Item
                  label="Giá Trị Giảm"
                  name="discountValue"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá trị giảm' },
                    { 
                      type: 'number', 
                      min: 0.01, 
                      message: 'Giá trị phải lớn hơn 0' 
                    },
                    isPercentage ? {
                      type: 'number',
                      max: 100,
                      message: '⚠️ Giá trị giảm giá phần trăm không được vượt quá 100%'
                    } : null
                  ].filter(Boolean)}
                >
                  <InputNumber
                    min={0.01}
                    max={isPercentage ? 100 : undefined}
                    style={{ width: '100%' }}
                    placeholder={isPercentage ? "VD: 20 (cho 20%)" : "VD: 50000 (cho 50k)"}
                    addonAfter={isPercentage ? '%' : '₫'}
                  />
                </Form.Item>
              );
            }}
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
            rules={[
              { required: true, message: '⚠️ Vui lòng nhập giá trị đơn tối thiểu' },
              { type: 'number', min: 0, message: '⚠️ Giá trị phải lớn hơn hoặc bằng 0' }
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="VD: 100000"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
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
            rules={[
              { required: true, message: '⚠️ Vui lòng nhập giới hạn sử dụng' },
              { type: 'number', min: 1, message: '⚠️ Giới hạn sử dụng phải lớn hơn 0' }
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="VD: 100"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
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