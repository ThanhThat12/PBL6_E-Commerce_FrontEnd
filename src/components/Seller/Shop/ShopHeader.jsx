import React, { useState } from 'react';
import { Card, Button, Space, Tag, Row, Col, Descriptions, Modal, Form, Input, Select, message } from 'antd';
import {
  EditOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import shopService from '../../../services/shopService';
import './ShopHeader.css';

const { TextArea } = Input;
const { Option } = Select;

const ShopHeader = ({ shopData, onUpdate }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusTag = (status) => {
    // Backend trả về ACTIVE, INACTIVE, SUSPENDED (uppercase)
    const normalizedStatus = status?.toUpperCase();
    
    const statusConfig = {
      ACTIVE: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đang hoạt động' },
      INACTIVE: { color: 'orange', icon: <ExclamationCircleOutlined />, text: 'Tạm ngưng' },
      SUSPENDED: { color: 'red', icon: <CloseCircleOutlined />, text: 'Bị đình chỉ' },
    };
    const config = statusConfig[normalizedStatus] || statusConfig.ACTIVE;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const handleEditClick = () => {
    form.setFieldsValue({
      name: shopData?.name,
      address: shopData?.address,
      description: shopData?.description,
      status: shopData?.status?.toUpperCase() || 'ACTIVE', // Chuyển sang uppercase
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateShop = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const response = await shopService.updateShopInfo(values);
      
      if (response.success) {
        message.success('Cập nhật thông tin shop thành công');
        setIsEditModalVisible(false);
        
        // Gọi callback để refresh data
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('Vui lòng kiểm tra lại thông tin');
      } else {
        message.error('Không thể cập nhật thông tin shop');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="shop-header-card">
        <Row gutter={[24, 24]}>
          {/* Shop Icon & Name */}
          <Col xs={24} md={8}>
            <div className="shop-info-section">
              <div className="shop-icon-wrapper">
                <ShopOutlined className="shop-icon" />
              </div>
              <div className="shop-basic-info">
                <h1 className="shop-name">{shopData?.name || 'Chưa có tên shop'}</h1>
                <div className="shop-status-row">
                  {getStatusTag(shopData?.status)}
                </div>
              </div>
            </div>
          </Col>

          {/* Shop Details */}
          <Col xs={24} md={12}>
            <Descriptions column={1} size="small" className="shop-descriptions">
              <Descriptions.Item 
                label={<span><EnvironmentOutlined /> Địa chỉ</span>}
              >
                {shopData?.address || 'Chưa cập nhật địa chỉ'}
              </Descriptions.Item>
              <Descriptions.Item 
                label={<span><CalendarOutlined /> Ngày tạo</span>}
              >
                {formatDateTime(shopData?.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                <div className="shop-description-text">
                  {shopData?.description || 'Chưa có mô tả'}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Col>

          {/* Action Button */}
          <Col xs={24} md={4}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              block
              size="large"
              onClick={handleEditClick}
              className="edit-shop-btn"
            >
              Chỉnh sửa Shop
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Modal cập nhật thông tin shop */}
      <Modal
        title="Cập nhật thông tin Shop"
        open={isEditModalVisible}
        onOk={handleUpdateShop}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Tên Shop"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên shop' },
              { min: 3, message: 'Tên shop phải có ít nhất 3 ký tự' },
              { max: 100, message: 'Tên shop không được quá 100 ký tự' },
            ]}
          >
            <Input 
              placeholder="Nhập tên shop" 
              prefix={<ShopOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ' },
              { min: 10, message: 'Địa chỉ phải có ít nhất 10 ký tự' },
            ]}
          >
            <Input 
              placeholder="Nhập địa chỉ shop" 
              prefix={<EnvironmentOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả Shop"
            name="description"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { min: 20, message: 'Mô tả phải có ít nhất 20 ký tự' },
              { max: 500, message: 'Mô tả không được quá 500 ký tự' },
            ]}
          >
            <TextArea 
              rows={4}
              placeholder="Nhập mô tả về shop của bạn"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái shop">
              <Option value="ACTIVE">
                <CheckCircleOutlined style={{ color: 'green' }} /> Đang hoạt động
              </Option>
              <Option value="INACTIVE">
                <ExclamationCircleOutlined style={{ color: 'orange' }} /> Tạm ngưng
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ShopHeader;
