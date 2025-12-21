import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, message, Spin, Alert } from 'antd';
import { SaveOutlined, EnvironmentOutlined, EditOutlined } from '@ant-design/icons';
import { useAddressMaster } from '../../hooks/useAddressMaster';
import * as userService from '../../services/userService';

/**
 * ShopAddressTab
 * Tab quản lý địa chỉ STORE cho seller trong kênh người bán
 * - CHỈ cho phép CHỈNH SỬA (edit) địa chỉ STORE
 * - KHÔNG cho phép thêm mới hay xóa
 */
const ShopAddressTab = ({ shopData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [shopAddress, setShopAddress] = useState(null);
  const [fetchingAddress, setFetchingAddress] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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

  // Load STORE addresses
  useEffect(() => {
    loadShopAddress();
  }, []);

  const loadShopAddress = async () => {
    try {
      setFetchingAddress(true);
      console.log('Loading STORE addresses...');
      const response = await userService.getAddresses();
      console.log('loadAddresses response:', response);
      
      if (response.status === 200 && Array.isArray(response.data)) {
        // Only show STORE addresses
        const storeAddress = response.data.find(addr => addr.typeAddress === 'STORE');
        console.log('Found STORE address:', storeAddress);
        
        if (storeAddress) {
          setShopAddress(storeAddress);
          // Set form values
          form.setFieldsValue({
            contactName: storeAddress.contactName || storeAddress.label,
            contactPhone: storeAddress.contactPhone,
            fullAddress: storeAddress.fullAddress,
            provinceId: storeAddress.provinceId,
            districtId: storeAddress.districtId,
            wardCode: storeAddress.wardCode,
          });

          // Initialize address dropdowns
          if (storeAddress.provinceId && provinces.length > 0) {
            selectProvince(storeAddress.provinceId);
          }
        } else {
          message.info('Chưa có địa chỉ cửa hàng. Địa chỉ được tạo tự động khi đăng ký seller.');
        }
      }
    } catch (error) {
      console.error('Failed to load shop address:', error);
      message.error('Không thể tải địa chỉ cửa hàng');
    } finally {
      setFetchingAddress(false);
    }
  };

  // Initialize district when province and data are loaded
  useEffect(() => {
    if (shopAddress?.districtId && districts.length > 0 && !selectedDistrictId) {
      selectDistrict(shopAddress.districtId);
    }
  }, [shopAddress, districts, selectedDistrictId, selectDistrict]);

  const handleProvinceChange = (value) => {
    form.setFieldsValue({
      districtId: null,
      wardCode: null,
    });
    selectProvince(value);
  };

  const handleDistrictChange = (value) => {
    form.setFieldsValue({
      wardCode: null,
    });
    selectDistrict(value);
  };

  const onFinish = async (values) => {
    if (!shopAddress?.id) {
      message.error('Không tìm thấy địa chỉ cửa hàng để cập nhật');
      return;
    }

    try {
      setLoading(true);

      // Find selected names
      const selectedProvince = provinces.find(p => p.id === values.provinceId);
      const selectedDistrict = districts.find(d => d.id === values.districtId);
      const selectedWard = wards.find(w => w.id === values.wardCode);

      const addressData = {
        label: 'Store',
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        fullAddress: values.fullAddress,
        provinceId: values.provinceId,
        districtId: values.districtId,
        wardCode: values.wardCode,
        provinceName: selectedProvince?.name || '',
        districtName: selectedDistrict?.name || '',
        wardName: selectedWard?.name || '',
        primaryAddress: shopAddress.primaryAddress || false,
        typeAddress: 'STORE'
      };

      console.log('Updating STORE address:', addressData);
      const response = await userService.updateAddress(shopAddress.id, addressData);
      console.log('Update STORE address response:', response);
      
      if (response && response.status === 200) {
        message.success('Cập nhật địa chỉ cửa hàng thành công');
        setIsEditing(false);
        await loadShopAddress();
      } else {
        // If response exists but status is not 200
        const errorMsg = response?.message || response?.data?.message || 'Cập nhật địa chỉ thất bại';
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('Failed to update address:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Cập nhật địa chỉ thất bại';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingAddress) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large" tip="Đang tải địa chỉ cửa hàng..." />
      </div>
    );
  }

  if (!shopAddress) {
    return (
      <Card>
        <div className="text-center py-12">
          <EnvironmentOutlined className="text-6xl text-gray-300 mb-4" />
          <p className="text-gray-600 mb-2">Chưa có địa chỉ cửa hàng</p>
          <p className="text-sm text-gray-500">
            Địa chỉ cửa hàng được tạo tự động khi bạn đăng ký làm seller
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Địa Chỉ Cửa Hàng</h2>
        <p className="text-sm text-gray-600 mt-1">
          Địa chỉ cửa hàng của bạn (chỉ có thể chỉnh sửa, không thể thêm mới hay xóa)
        </p>
      </div>

      {/* Information Alert */}
      <Alert
        message="Lưu ý quan trọng"
        description={
          <ul className="text-sm space-y-1 mt-2">
            <li>• Địa chỉ cửa hàng chỉ có thể <strong>chỉnh sửa</strong>, không thể xóa hoặc thêm mới</li>
            <li>• Địa chỉ này được sử dụng cho việc giao hàng và tính phí ship từ GHN</li>
            <li>• Vui lòng đảm bảo thông tin địa chỉ chính xác để tránh sai sót khi giao hàng</li>
          </ul>
        }
        type="warning"
        showIcon
        className="mb-6"
      />

      {/* Address Display/Edit Form */}
      {!isEditing ? (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Contact Info */}
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-semibold text-lg text-gray-900">
                  {shopAddress.contactName || shopAddress.label}
                </h3>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{shopAddress.contactPhone}</span>
                <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                  Cửa hàng
                </span>
              </div>

              {/* Address */}
              <div className="text-gray-700 mb-4">
                <p className="font-medium">{shopAddress.fullAddress}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {[shopAddress.wardName, shopAddress.districtName, shopAddress.provinceName]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>

              {/* Edit Button */}
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                disabled={shopData?.status !== 'ACTIVE'}
              >
                Chỉnh sửa địa chỉ
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            disabled={shopData?.status !== 'ACTIVE'}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tên liên hệ"
                  name="contactName"
                  rules={[{ required: true, message: 'Vui lòng nhập tên liên hệ' }]}
                >
                  <Input placeholder="Tên người liên hệ" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="contactPhone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                  ]}
                >
                  <Input placeholder="Số điện thoại liên hệ" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Địa chỉ chi tiết"
              name="fullAddress"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
            >
              <Input placeholder="Số nhà, tên đường..." />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Tỉnh/Thành phố"
                  name="provinceId"
                  rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                >
                  <Select
                    placeholder="Chọn Tỉnh/TP"
                    loading={loadingProvinces}
                    onChange={handleProvinceChange}
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
                <Form.Item
                  label="Quận/Huyện"
                  name="districtId"
                  rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
                >
                  <Select
                    placeholder="Chọn Quận/Huyện"
                    loading={loadingDistricts}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceId}
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
                <Form.Item
                  label="Phường/Xã"
                  name="wardCode"
                  rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}
                >
                  <Select
                    placeholder="Chọn Phường/Xã"
                    loading={loadingWards}
                    disabled={!selectedDistrictId}
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

            <div className="flex gap-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Lưu thay đổi
              </Button>
              <Button onClick={() => {
                setIsEditing(false);
                form.setFieldsValue({
                  contactName: shopAddress.contactName || shopAddress.label,
                  contactPhone: shopAddress.contactPhone,
                  fullAddress: shopAddress.fullAddress,
                  provinceId: shopAddress.provinceId,
                  districtId: shopAddress.districtId,
                  wardCode: shopAddress.wardCode,
                });
              }}>
                Hủy
              </Button>
            </div>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default ShopAddressTab;
