import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Card, Row, Col, message, Spin } from 'antd';
import { UploadOutlined, CameraOutlined } from '@ant-design/icons';
import { getShopProfile, updateShopProfile } from '../../services/seller/shopService';
import api from '../../services/api';

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
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchShopProfile();
    fetchMyProducts();
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

  const fetchMyProducts = async () => {
    try {
      // API may return a ResponseDTO { status, error, message, data: { content: [...] } }
      // or directly a page object depending on api wrapper; handle both shapes.
      const res = await api.get('products/my-products');
      const payload = res?.data || res || {};
      const content = payload?.content || payload?.data?.content || payload;
      const list = Array.isArray(content) ? content : (content?.content || content?.data || []);
      setProducts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching my products:', error);
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
    <div className="space-y-8">
      {/* Shop Header with banner + logo */}
      <div className="relative rounded-lg overflow-hidden shadow-md">
        <div
          className="w-full h-48 bg-gray-200"
          style={{
            backgroundImage: `url(${shopData?.banner || '/placeholder.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="absolute left-6 bottom-4 flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
            <img
              src={shopData?.logo || '/placeholder.png'}
              alt="Shop logo"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />
          </div>
          <div className="text-white drop-shadow-md">
            <h1 className="text-2xl font-bold leading-tight">{shopData?.name || 'Cửa hàng của tôi'}</h1>
            {shopData?.description && (
              <p className="text-sm opacity-90 mt-1 max-w-lg">{shopData.description}</p>
            )}
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Shop Stats */}
        <Col xs={24} lg={8}>
          <Card className="shadow-sm" bodyStyle={{ padding: 16 }}>
            <h3 className="text-lg font-semibold mb-4">Thống kê cửa hàng</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đánh giá</span>
                <span className="font-semibold">{shopData?.rating || 0} ⭐</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Người theo dõi</span>
                <span className="font-semibold">{shopData?.followers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sản phẩm</span>
                <span className="font-semibold">{shopData?.productCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tỷ lệ phản hồi</span>
                <span className="font-semibold">{shopData?.responseRate || 0}%</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Shop Profile Form */}
        <Col xs={24} lg={16}>
          <Card className="shadow-sm" bodyStyle={{ padding: 18 }}>
            <h3 className="text-lg font-semibold mb-4">Thông tin cửa hàng</h3>
            <Form form={form} layout="vertical" onFinish={onFinish}>
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
                  <Form.Item label="Số điện thoại" name="phone">
                    <Input placeholder="0123456789" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Mô tả cửa hàng" name="description">
                    <TextArea rows={4} placeholder="Giới thiệu về cửa hàng của bạn..." />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Địa chỉ" name="address">
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
                      <div className="mt-2">
                        <img
                          src={shopData.logo}
                          alt="Current logo"
                          className="w-24 h-24 object-cover rounded-full border"
                        />
                      </div>
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
                        className="mt-2 w-full h-28 object-cover rounded"
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <div className="text-right mt-2">
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật thông tin
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Products list */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
          <div className="text-sm text-gray-500">Tổng: {products?.length || 0} sản phẩm</div>
        </div>

        <Row gutter={[16, 16]}>
          {products && products.length > 0 ? (
            products.map((p) => (
              <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
                <Card hoverable className="overflow-hidden" bodyStyle={{ padding: 12 }}>
                  <div className="relative">
                    {p.image || p.mainImage ? (
                      <img
                        alt={p.name}
                        src={p.image || p.mainImage}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-md" />
                    )}
                    <div className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded ${p.isActive ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
                      {p.isActive ? 'Hoạt động' : 'Chờ duyệt'}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="font-semibold mb-1 truncate">{p.name}</div>
                    <div className="text-sm text-gray-500 mb-2">{p.categoryName || p.category?.name}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">{p.price?.toLocaleString?.() ? p.price.toLocaleString() + ' đ' : (p.basePrice ? p.basePrice.toLocaleString() + ' đ' : '')}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <div className="text-gray-500">Không có sản phẩm nào.</div>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default MyShop;
