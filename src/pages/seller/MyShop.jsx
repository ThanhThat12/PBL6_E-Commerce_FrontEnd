import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Card, Row, Col, message, Spin, Modal } from 'antd';
import { UploadOutlined, CameraOutlined, EditOutlined } from '@ant-design/icons';
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
  const [editModalVisible, setEditModalVisible] = useState(false);

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
      setEditModalVisible(false);
      setLogoFile(null);
      setBannerFile(null);
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
    <div className="space-y-6">
      {/* Modern Shop Header with gradient banner + floating logo */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        {/* Banner with gradient overlay */}
        <div className="relative h-64">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/80 to-pink-500/70"
            style={{
              backgroundImage: `url(${shopData?.banner || '/placeholder.png'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            }}
          />
          
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        </div>

        {/* Shop info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8">
          <div className="flex items-end gap-6">
            {/* Floating logo */}
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white transform hover:scale-105 transition-transform">
              <img
                src={shopData?.logo || '/placeholder.png'}
                alt="Shop logo"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
            </div>
            
            {/* Shop name & description */}
            <div className="flex-1 text-white pb-2">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                {shopData?.name || 'Cửa hàng của tôi'}
                <span className="text-2xl">🏪</span>
              </h1>
              {shopData?.description && (
                <p className="text-lg text-white/90 max-w-2xl">{shopData.description}</p>
              )}
              
              {/* Quick stats badges */}
              <div className="flex gap-4 mt-4">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">⭐ {shopData?.rating || 0} Đánh giá</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">👥 {shopData?.followers || 0} Người theo dõi</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">📦 {shopData?.productCount || 0} Sản phẩm</span>
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="large"
              onClick={() => setEditModalVisible(true)}
              className="bg-white/20 backdrop-blur-sm border-white/40 hover:bg-white/30 text-white shadow-lg"
            >
              Chỉnh sửa thông tin
            </Button>
          </div>
        </div>
      </div>

      {/* Products Section - Full Width */}
      <div className="mt-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                <span>📦</span>
                Danh sách sản phẩm
              </h2>
              <p className="text-blue-100">Quản lý tất cả sản phẩm của cửa hàng</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="text-lg font-bold">Tổng: {products?.length || 0} sản phẩm</span>
            </div>
          </div>
        </div>

        <Row gutter={[20, 20]}>
          {products && products.length > 0 ? (
            products.map((p) => (
              <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable 
                  className="overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" 
                  bodyStyle={{ padding: 0 }}
                >
                  <div className="relative group">
                    {p.image || p.mainImage ? (
                      <img
                        alt={p.name}
                        src={p.image || p.mainImage}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-4xl">🖼️</span>
                      </div>
                    )}
                    
                    {/* Status badge with gradient */}
                    <div className={`absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ${
                      p.isActive 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                        : 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                    }`}>
                      {p.isActive ? '✓ Hoạt động' : '⏳ Chờ duyệt'}
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  <div className="p-4">
                    <div className="font-bold text-base mb-2 truncate text-gray-900">{p.name}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                        {p.categoryName || p.category?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {p.price?.toLocaleString?.() ? p.price.toLocaleString() + ' đ' : (p.basePrice ? p.basePrice.toLocaleString() + ' đ' : '0 đ')}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                        <span className="text-sm">→</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg">Chưa có sản phẩm nào.</p>
                <p className="text-gray-400 text-sm mt-2">Hãy thêm sản phẩm đầu tiên của bạn!</p>
              </div>
            </Col>
          )}
        </Row>
      </div>

      {/* Edit Shop Info Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-xl">
            <span>✏️</span>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chỉnh sửa thông tin cửa hàng
            </span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setLogoFile(null);
          setBannerFile(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish} className="mt-6">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="font-medium text-gray-700">Tên cửa hàng</span>}
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
              >
                <Input 
                  placeholder="SportZone Shop" 
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-medium text-gray-700">Số điện thoại</span>} name="phone">
                <Input 
                  placeholder="0123456789" 
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label={<span className="font-medium text-gray-700">Mô tả cửa hàng</span>} name="description">
                <TextArea 
                  rows={4} 
                  placeholder="Giới thiệu về cửa hàng của bạn..." 
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label={<span className="font-medium text-gray-700">Địa chỉ</span>} name="address">
                <Input 
                  placeholder="123 Đường ABC, Quận XYZ, TP.HCM" 
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-medium text-gray-700">Logo cửa hàng</span>}>
                <Upload
                  listType="picture-card"
                  fileList={logoFile ? [logoFile] : []}
                  onChange={handleLogoUpload}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  className="rounded-lg"
                >
                  {!logoFile && (
                    <div className="flex flex-col items-center">
                      <CameraOutlined className="text-2xl mb-2 text-blue-500" />
                      <div className="text-sm text-gray-600">Upload Logo</div>
                    </div>
                  )}
                </Upload>
                {shopData?.logo && !logoFile && (
                  <div className="mt-3">
                    <img
                      src={shopData.logo}
                      alt="Current logo"
                      className="w-28 h-28 object-cover rounded-2xl border-2 border-blue-100 shadow-md"
                    />
                  </div>
                )}
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label={<span className="font-medium text-gray-700">Banner cửa hàng</span>}>
                <Upload
                  listType="picture-card"
                  fileList={bannerFile ? [bannerFile] : []}
                  onChange={handleBannerUpload}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  className="rounded-lg"
                >
                  {!bannerFile && (
                    <div className="flex flex-col items-center">
                      <UploadOutlined className="text-2xl mb-2 text-purple-500" />
                      <div className="text-sm text-gray-600">Upload Banner</div>
                    </div>
                  )}
                </Upload>
                {shopData?.banner && !bannerFile && (
                  <img
                    src={shopData.banner}
                    alt="Current banner"
                    className="mt-3 w-full h-32 object-cover rounded-xl shadow-md"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6">
            <Button 
              size="large"
              onClick={() => {
                setEditModalVisible(false);
                setLogoFile(null);
                setBannerFile(null);
                form.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-lg shadow-lg hover:shadow-xl transition-all px-8"
            >
              💾 Cập nhật thông tin
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MyShop;
