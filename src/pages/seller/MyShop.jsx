import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Card, Row, Col, message, Spin, Tag, Divider, Select } from 'antd';
import { 
  UploadOutlined, CameraOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  CloseCircleOutlined, ShopOutlined, UserOutlined,
  EnvironmentOutlined, PhoneOutlined, MailOutlined, StarOutlined,
  EditOutlined, ApiOutlined, KeyOutlined
} from '@ant-design/icons';
import { getShopDetail, updateShopProfile } from '../../services/seller/shopService';
import { useAddressMaster } from '../../hooks/useAddressMaster';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Default images from environment
const DEFAULT_LOGO = process.env.REACT_APP_DEFAULT_LOGO || 'https://res.cloudinary.com/dejjhkhl1/image/upload/v1764911991/xwz5cpybxo1g1_sppbqi.png';
const DEFAULT_BANNER = process.env.REACT_APP_DEFAULT_BANNER || 'https://res.cloudinary.com/dejjhkhl1/image/upload/v1764912579/images_qs3s47.jpg';

/**
 * My Shop Page - Seller's Shop Management
 * Features:
 * - Display full shop info from ShopDetailDTO
 * - Update shop profile with image upload
 * - Show KYC verification info (ID card images)
 * - GHN integration settings (ghnShopId, ghnToken)
 * - Shop status alerts (PENDING/REJECTED/ACTIVE)
 */
const MyShop = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [shopData, setShopData] = useState(null);
  
  // Image upload states
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [newLogoUrl, setNewLogoUrl] = useState(null);
  const [newLogoPublicId, setNewLogoPublicId] = useState(null);
  const [newBannerUrl, setNewBannerUrl] = useState(null);
  const [newBannerPublicId, setNewBannerPublicId] = useState(null);

  // Use address master hook
  const {
    provinces,
    districts,
    wards,
    loading: loadingProvinces,
    loadingDistricts,
    loadingWards,
    selectProvince,
    selectDistrict,
    selectedProvinceId,
    selectedDistrictId,
  } = useAddressMaster();

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Fetch shop detail
  const fetchShopProfile = async () => {
    try {
      setFetching(true);
      const data = await getShopDetail();
      console.log('Shop data received:', data);
      setShopData(data);
      
      // Set form values
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        shopPhone: data.shopPhone,
        shopEmail: data.shopEmail,
        address: data.address,
        ghnShopId: data.ghnShopId,
        ghnToken: data.ghnToken,
      });
    } catch (error) {
      console.error('Error fetching shop profile:', error);
      message.error('Không thể tải thông tin cửa hàng');
    } finally {
      setFetching(false);
    }
  };

  // Initial load - only run once
  useEffect(() => {
    fetchShopProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize address when shopData and provinces are loaded
  useEffect(() => {
    if (shopData?.provinceId && provinces.length > 0 && !selectedProvinceId) {
      selectProvince(shopData.provinceId);
      form.setFieldsValue({ provinceId: shopData.provinceId });
    }
  }, [shopData, provinces, selectedProvinceId, selectProvince, form]);

  // Initialize district when districts are loaded
  useEffect(() => {
    if (shopData?.districtId && districts.length > 0 && selectedProvinceId && !selectedDistrictId) {
      selectDistrict(shopData.districtId);
      form.setFieldsValue({ districtId: shopData.districtId });
    }
  }, [shopData, districts, selectedProvinceId, selectedDistrictId, selectDistrict, form]);

  // Initialize ward when wards are loaded
  useEffect(() => {
    if (shopData?.wardCode && wards.length > 0 && selectedDistrictId) {
      form.setFieldsValue({ wardCode: shopData.wardCode });
    }
  }, [shopData, wards, selectedDistrictId, form]);

  // Handle province change
  const handleProvinceChange = (value) => {
    form.setFieldsValue({ districtId: undefined, wardCode: undefined });
    selectProvince(value);
  };

  // Handle district change
  const handleDistrictChange = (value) => {
    form.setFieldsValue({ wardCode: undefined });
    selectDistrict(value);
  };

  // Upload image to Cloudinary
  const uploadImage = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', type === 'logo' ? 'shop-logos' : 'shop-banners');

    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://localhost:8081/api/'}images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.data || result;
  };

  // Handle logo upload
  const handleLogoUpload = async (info) => {
    const file = info.file;
    if (!file) return;

    if (!file.type?.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh tối đa 5MB');
      return;
    }

    setLogoUploading(true);
    try {
      const result = await uploadImage(file, 'logo');
      setNewLogoUrl(result.url || result.imageUrl);
      setNewLogoPublicId(result.publicId);
      message.success('Tải logo thành công');
    } catch (error) {
      console.error('Logo upload error:', error);
      message.error('Tải logo thất bại');
    } finally {
      setLogoUploading(false);
    }
  };

  // Handle banner upload
  const handleBannerUpload = async (info) => {
    const file = info.file;
    if (!file) return;

    if (!file.type?.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error('Kích thước ảnh tối đa 10MB');
      return;
    }

    setBannerUploading(true);
    try {
      const result = await uploadImage(file, 'banner');
      setNewBannerUrl(result.url || result.imageUrl);
      setNewBannerPublicId(result.publicId);
      message.success('Tải banner thành công');
    } catch (error) {
      console.error('Banner upload error:', error);
      message.error('Tải banner thất bại');
    } finally {
      setBannerUploading(false);
    }
  };

  // Handle form submit
  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Build update data (JSON)
      const updateData = {
        name: values.name,
        description: values.description || '',
        shopPhone: values.shopPhone || '',
        shopEmail: values.shopEmail || '',
        address: values.address || '',
        provinceId: values.provinceId ? parseInt(values.provinceId) : null,
        districtId: values.districtId ? parseInt(values.districtId) : null,
        wardCode: values.wardCode || '',
        ghnShopId: values.ghnShopId || '',
        ghnToken: values.ghnToken || '',
      };

      // Add new logo if uploaded
      if (newLogoUrl) {
        updateData.logoUrl = newLogoUrl;
        updateData.logoPublicId = newLogoPublicId;
      }

      // Add new banner if uploaded
      if (newBannerUrl) {
        updateData.bannerUrl = newBannerUrl;
        updateData.bannerPublicId = newBannerPublicId;
      }

      await updateShopProfile(updateData);
      message.success('Cập nhật thông tin cửa hàng thành công!');
      
      // Reset new image states
      setNewLogoUrl(null);
      setNewLogoPublicId(null);
      setNewBannerUrl(null);
      setNewBannerPublicId(null);
      
      // Refresh shop data
      fetchShopProfile();
    } catch (error) {
      console.error('Error updating shop profile:', error);
      message.error(error?.message || 'Không thể cập nhật thông tin cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  // Get current logo URL
  const getCurrentLogo = () => {
    if (newLogoUrl) return newLogoUrl;
    if (shopData?.logoUrl) return shopData.logoUrl;
    return DEFAULT_LOGO;
  };

  // Get current banner URL
  const getCurrentBanner = () => {
    if (newBannerUrl) return newBannerUrl;
    if (shopData?.bannerUrl) return shopData.bannerUrl;
    return DEFAULT_BANNER;
  };

  // Get status tag
  const getStatusTag = () => {
    switch (shopData?.status) {
      case 'ACTIVE':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Đang hoạt động</Tag>;
      case 'PENDING':
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ xét duyệt</Tag>;
      case 'REJECTED':
        return <Tag color="error" icon={<CloseCircleOutlined />}>Bị từ chối</Tag>;
      default:
        return <Tag>{shopData?.status}</Tag>;
    }
  };

  // Build full address
  const getFullAddress = () => {
    const parts = [];
    if (shopData?.address) parts.push(shopData.address);
    if (shopData?.wardName) parts.push(shopData.wardName);
    if (shopData?.districtName) parts.push(shopData.districtName);
    if (shopData?.provinceName) parts.push(shopData.provinceName);
    return parts.length > 0 ? parts.join(', ') : 'Chưa cập nhật';
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" tip="Đang tải thông tin cửa hàng..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Alerts */}
      {shopData?.status === 'PENDING' && (
        <Card className="shadow-sm border-l-4 border-l-yellow-400 bg-yellow-50" bodyStyle={{ padding: 16 }}>
          <div className="flex items-start gap-3">
            <ClockCircleOutlined className="text-yellow-600 text-xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800">Đơn đăng ký đang chờ xét duyệt</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Cửa hàng của bạn đang chờ admin xét duyệt KYC. Vui lòng chờ kết quả trong vòng 24-48h.
              </p>
              {shopData?.submittedAt && (
                <p className="text-xs text-yellow-600 mt-2">
                  Gửi lúc: {formatDate(shopData.submittedAt)}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {shopData?.status === 'REJECTED' && (
        <Card className="shadow-sm border-l-4 border-l-red-400 bg-red-50" bodyStyle={{ padding: 16 }}>
          <div className="flex items-start gap-3">
            <CloseCircleOutlined className="text-red-600 text-xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800">Đơn đăng ký bị từ chối</h3>
              <p className="text-sm text-red-700 mt-1">
                <strong>Lý do:</strong> {shopData?.rejectionReason || 'Không được cung cấp'}
              </p>
              {shopData?.reviewedAt && (
                <p className="text-xs text-red-600 mt-2">
                  Từ chối lúc: {formatDate(shopData.reviewedAt)}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {shopData?.status === 'ACTIVE' && (
        <Card className="shadow-sm border-l-4 border-l-green-400 bg-green-50" bodyStyle={{ padding: 16 }}>
          <div className="flex items-start gap-3">
            <CheckCircleOutlined className="text-green-600 text-xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-green-800">Cửa hàng đã được xác thực ✓</h3>
              <p className="text-sm text-green-700 mt-1">
                Cửa hàng của bạn đang hoạt động bình thường và có thể bán hàng.
              </p>
              {shopData?.reviewedAt && (
                <p className="text-xs text-green-600 mt-2">
                  Phê duyệt lúc: {formatDate(shopData.reviewedAt)}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Shop Header with Banner & Logo */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <div
          className="w-full h-56 bg-gray-200 bg-cover bg-center"
          style={{ backgroundImage: `url(${getCurrentBanner()})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="absolute left-6 bottom-4 flex items-end gap-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-xl overflow-hidden border-4 border-white shadow-xl bg-white">
              <img
                src={getCurrentLogo()}
                alt="Shop logo"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = DEFAULT_LOGO; }}
              />
            </div>
          </div>
          <div className="text-white pb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold drop-shadow-lg">{shopData?.name || 'Cửa hàng của tôi'}</h1>
              {getStatusTag()}
            </div>
            {shopData?.description && (
              <p className="text-sm opacity-90 mt-1 max-w-md line-clamp-2 drop-shadow">{shopData.description}</p>
            )}
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <StarOutlined className="text-yellow-500" />
            <span className="font-bold text-gray-800">{shopData?.rating?.toFixed(1) || '5.0'}</span>
            <span className="text-gray-500 text-sm">({shopData?.reviewCount || 0} đánh giá)</span>
          </div>
        </div>
      </div>

      {/* Shop Info */}
      <Row gutter={[24, 24]}>
                {/* Left Column - Shop Info Display */}
                <Col xs={24} lg={8}>
                  {/* Quick Stats */}
                  <Card className="shadow-sm mb-4" title={<span><StarOutlined className="mr-2" />Thống kê</span>}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Đánh giá trung bình</span>
                        <span className="font-bold text-lg">{shopData?.rating?.toFixed(1) || '5.0'} ⭐</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Số đánh giá</span>
                        <span className="font-semibold">{shopData?.reviewCount || 0}</span>
                      </div>
                      <Divider className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Thanh toán COD</span>
                        {shopData?.acceptCod ? (
                          <Tag color="green">Đã kích hoạt</Tag>
                        ) : (
                          <Tag>Chưa kích hoạt</Tag>
                        )}
                      </div>
                      {shopData?.codFeePercentage > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Phí COD</span>
                          <span className="font-semibold">{shopData.codFeePercentage}%</span>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Contact Info */}
                  <Card className="shadow-sm mb-4" title={<span><PhoneOutlined className="mr-2" />Liên hệ</span>}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <PhoneOutlined className="text-gray-400" />
                        <span>{shopData?.shopPhone || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MailOutlined className="text-gray-400" />
                        <span className="break-all">{shopData?.shopEmail || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <EnvironmentOutlined className="text-gray-400 mt-1" />
                        <span>{getFullAddress()}</span>
                      </div>
                    </div>
                  </Card>

                  {/* GHN Info */}
                  <Card className="shadow-sm mb-4" title={<span><ApiOutlined className="mr-2" />Thông tin GHN</span>}>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-500 text-sm">GHN Shop ID:</span>
                        <p className="font-semibold">{shopData?.ghnShopId || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm">GHN Token:</span>
                        <p className="font-mono text-xs break-all">{shopData?.ghnToken ? '••••••••' + shopData.ghnToken.slice(-8) : 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Owner Info */}
                  <Card className="shadow-sm" title={<span><UserOutlined className="mr-2" />Chủ cửa hàng</span>}>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500">Tên đăng nhập:</span>
                        <p className="font-semibold">{shopData?.ownerUsername || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Họ tên:</span>
                        <p className="font-semibold">{shopData?.ownerFullName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-semibold break-all">{shopData?.ownerEmail || 'N/A'}</p>
                      </div>
                      {shopData?.ownerPhone && (
                        <div>
                          <span className="text-gray-500">Điện thoại:</span>
                          <p className="font-semibold">{shopData.ownerPhone}</p>
                        </div>
                      )}
                      {shopData?.ownerCreatedAt && (
                        <div>
                          <span className="text-gray-500">Tham gia từ:</span>
                          <p className="font-semibold">{format(new Date(shopData.ownerCreatedAt), 'dd/MM/yyyy')}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>

                {/* Right Column - Edit Form */}
                <Col xs={24} lg={16}>
                  <Card 
                    className="shadow-sm" 
                    title={<span><EditOutlined className="mr-2" />Chỉnh sửa thông tin</span>}
                  >
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                      {/* Images Upload */}
                      <Row gutter={16} className="mb-6">
                        <Col xs={24} md={8}>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700 mb-2">Logo cửa hàng</p>
                            <div className="relative inline-block">
                              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
                                <img
                                  src={getCurrentLogo()}
                                  alt="Logo"
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = DEFAULT_LOGO; }}
                                />
                              </div>
                              <Upload
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleLogoUpload}
                                accept="image/*"
                                disabled={logoUploading || shopData?.status !== 'ACTIVE'}
                              >
                                <Button 
                                  icon={logoUploading ? <Spin size="small" /> : <CameraOutlined />}
                                  className="absolute bottom-1 right-1"
                                  size="small"
                                  shape="circle"
                                  disabled={logoUploading || shopData?.status !== 'ACTIVE'}
                                />
                              </Upload>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Tối đa 5MB</p>
                          </div>
                        </Col>
                        <Col xs={24} md={16}>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Banner cửa hàng</p>
                            <div className="relative">
                              <div className="w-full h-32 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
                                <img
                                  src={getCurrentBanner()}
                                  alt="Banner"
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = DEFAULT_BANNER; }}
                                />
                              </div>
                              <Upload
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleBannerUpload}
                                accept="image/*"
                                disabled={bannerUploading || shopData?.status !== 'ACTIVE'}
                              >
                                <Button 
                                  icon={bannerUploading ? <Spin size="small" /> : <UploadOutlined />}
                                  className="absolute bottom-2 right-2"
                                  disabled={bannerUploading || shopData?.status !== 'ACTIVE'}
                                >
                                  Đổi banner
                                </Button>
                              </Upload>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Kích thước khuyến nghị: 1200x400px, tối đa 10MB</p>
                          </div>
                        </Col>
                      </Row>

                      <Divider />

                      {/* Basic Info */}
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Tên cửa hàng"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
                          >
                            <Input 
                              prefix={<ShopOutlined className="text-gray-400" />} 
                              placeholder="Tên cửa hàng của bạn" 
                              disabled={shopData?.status !== 'ACTIVE'}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Số điện thoại"
                            name="shopPhone"
                            rules={[
                              { pattern: /^0[0-9]{9,10}$/, message: 'Số điện thoại không hợp lệ' }
                            ]}
                          >
                            <Input 
                              prefix={<PhoneOutlined className="text-gray-400" />} 
                              placeholder="0901234567" 
                              disabled={shopData?.status !== 'ACTIVE'}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Email"
                            name="shopEmail"
                            rules={[
                              { type: 'email', message: 'Email không hợp lệ' }
                            ]}
                          >
                            <Input 
                              prefix={<MailOutlined className="text-gray-400" />} 
                              placeholder="shop@example.com" 
                              disabled={shopData?.status !== 'ACTIVE'}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Địa chỉ chi tiết" name="address">
                            <Input 
                              prefix={<EnvironmentOutlined className="text-gray-400" />} 
                              placeholder="Số nhà, tên đường..." 
                              disabled={shopData?.status !== 'ACTIVE'}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24}>
                          <Form.Item label="Mô tả cửa hàng" name="description">
                            <Input.TextArea 
                              rows={3} 
                              placeholder="Giới thiệu về cửa hàng của bạn..." 
                              showCount 
                              maxLength={500}
                              disabled={shopData?.status !== 'ACTIVE'}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Address Selection */}
                      <Divider>Khu vực lấy hàng</Divider>
                      <Row gutter={16}>
                        <Col xs={24} md={8}>
                          <Form.Item label="Tỉnh/Thành phố" name="provinceId">
                            <Select
                              placeholder="Chọn Tỉnh/TP"
                              loading={loadingProvinces}
                              onChange={handleProvinceChange}
                              disabled={shopData?.status !== 'ACTIVE'}
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {provinces.map(p => (
                                <Select.Option key={p.id} value={p.id}>
                                  {p.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item label="Quận/Huyện" name="districtId">
                            <Select
                              placeholder="Chọn Quận/Huyện"
                              loading={loadingDistricts}
                              onChange={handleDistrictChange}
                              disabled={!selectedProvinceId || shopData?.status !== 'ACTIVE'}
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {districts.map(d => (
                                <Select.Option key={d.id} value={d.id}>
                                  {d.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item label="Phường/Xã" name="wardCode">
                            <Select
                              placeholder="Chọn Phường/Xã"
                              loading={loadingWards}
                              disabled={!selectedDistrictId || shopData?.status !== 'ACTIVE'}
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {wards.map(w => (
                                <Select.Option key={w.id} value={w.id}>
                                  {w.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* GHN Settings */}
                      <Divider>Cấu hình GHN (Giao Hàng Nhanh)</Divider>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item 
                            label="GHN Shop ID" 
                            name="ghnShopId"
                            tooltip="ID Shop trên hệ thống GHN. Lấy từ trang quản lý GHN."
                          >
                            <Input 
                              prefix={<ApiOutlined className="text-gray-400" />} 
                              placeholder="Nhập GHN Shop ID" 
                              disabled={shopData?.status !== 'ACTIVE'}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item 
                            label="GHN Token" 
                            name="ghnToken"
                            tooltip="Token API từ GHN để tích hợp vận chuyển."
                          >
                            <Input.Password 
                              prefix={<KeyOutlined className="text-gray-400" />} 
                              placeholder="Nhập GHN Token" 
                              disabled={shopData?.status !== 'ACTIVE'}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <div className="flex justify-end mt-4">
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          loading={loading}
                          disabled={shopData?.status !== 'ACTIVE'}
                          size="large"
                          icon={<CheckCircleOutlined />}
                        >
                          Lưu thay đổi
                        </Button>
                      </div>

                      {shopData?.status !== 'ACTIVE' && (
                        <p className="text-center text-sm text-gray-500 mt-4">
                          Bạn chỉ có thể chỉnh sửa thông tin khi cửa hàng đã được xác thực.
                        </p>
                      )}
                    </Form>
                  </Card>
                </Col>
              </Row>
    </div>
  );
};

export default MyShop;
