import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Card, Row, Col, message, Spin } from 'antd';
import { UploadOutlined, CameraOutlined } from '@ant-design/icons';
import { getShopProfile, updateShopProfile } from '../../services/seller/shopService';

const { TextArea } = Input;

/**
 * My Shop Page
 * Shop profile management
 */
const MyShop = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [shopData, setShopData] = useState(null);

  useEffect(() => {
    fetchShopProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchShopProfile = async () => {
    try {
      setFetching(true);
      const data = await getShopProfile();
      setShopData(data);
      
      // Set form values
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        phone: data.phone,
        address: data.address,
      });
    } catch (error) {
      console.error('Error fetching shop profile:', error);
      message.error('Không thể tải thông tin cửa hàng');
    } finally {
      setFetching(false);
    }
  };

  const handleLogoUpload = (info) => {
    const { fileList } = info;
    if (fileList.length > 0) {
      setLogoFile(fileList[fileList.length - 1]);
    } else {
      setLogoFile(null);
    }
  };

  const handleBannerUpload = (info) => {
    const { fileList } = info;
    if (fileList.length > 0) {
      setBannerFile(fileList[fileList.length - 1]);
    } else {
      setBannerFile(null);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('phone', values.phone || '');
      formData.append('address', values.address || '');

      if (logoFile?.originFileObj) {
        formData.append('logo', logoFile.originFileObj);
      }

      if (bannerFile?.originFileObj) {
        formData.append('banner', bannerFile.originFileObj);
      }

      await updateShopProfile(formData);
      message.success('Cập nhật thông tin cửa hàng thành công');
      fetchShopProfile();
    } catch (error) {
      console.error('Error updating shop profile:', error);
      message.error('Không thể cập nhật thông tin cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cửa hàng của tôi</h1>

      <Row gutter={[16, 16]}>
        {/* Shop Stats */}
        <Col xs={24} lg={8}>
          <Card title="Thống kê cửa hàng">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đánh giá:</span>
                <span className="font-semibold">{shopData?.rating || 0} ⭐</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Người theo dõi:</span>
                <span className="font-semibold">{shopData?.followers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sản phẩm:</span>
                <span className="font-semibold">{shopData?.productCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tỷ lệ phản hồi:</span>
                <span className="font-semibold">{shopData?.responseRate || 0}%</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Shop Profile Form */}
        <Col xs={24} lg={16}>
          <Card title="Thông tin cửa hàng">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tên cửa hàng"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
                  >
                    <Input placeholder="SportZone Shop" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                  >
                    <Input placeholder="0123456789" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="Mô tả cửa hàng"
                    name="description"
                  >
                    <TextArea rows={4} placeholder="Giới thiệu về cửa hàng của bạn..." />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="Địa chỉ"
                    name="address"
                  >
                    <Input placeholder="123 Đường ABC, Quận XYZ, TP.HCM" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Logo cửa hàng">
                    <Upload
                      listType="picture-card"
                      fileList={logoFile ? [logoFile] : []}
                      onChange={handleLogoUpload}
                      beforeUpload={() => false}
                      maxCount={1}
                      accept="image/*"
                    >
                      {!logoFile && (
                        <div>
                          <CameraOutlined />
                          <div style={{ marginTop: 8 }}>Logo</div>
                        </div>
                      )}
                    </Upload>
                    {shopData?.logo && !logoFile && (
                      <img 
                        src={shopData.logo} 
                        alt="Current logo" 
                        className="mt-2 w-20 h-20 object-cover rounded"
                      />
                    )}
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Banner cửa hàng">
                    <Upload
                      listType="picture-card"
                      fileList={bannerFile ? [bannerFile] : []}
                      onChange={handleBannerUpload}
                      beforeUpload={() => false}
                      maxCount={1}
                      accept="image/*"
                    >
                      {!bannerFile && (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Banner</div>
                        </div>
                      )}
                    </Upload>
                    {shopData?.banner && !bannerFile && (
                      <img 
                        src={shopData.banner} 
                        alt="Current banner" 
                        className="mt-2 w-full h-20 object-cover rounded"
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <div className="text-right">
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật thông tin
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MyShop;
