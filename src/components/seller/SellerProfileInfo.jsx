import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiShield, FiEdit2, FiFileText, FiSave, FiX } from 'react-icons/fi';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { getShopDetail, updateShopProfile } from '../../services/seller/shopService';

/**
 * SellerProfileInfo
 * Component hiển thị và chỉnh sửa thông tin cá nhân của seller (từ shop profile)
 * - id_card_name (readonly - lấy từ CMND đã verify)
 * - id_card_number (readonly - không cho sửa)
 * - shop_email (editable)
 * - shop_phone (editable)
 */
const SellerProfileInfo = () => {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopEmail: '',
    shopPhone: ''
  });
  const [errors, setErrors] = useState({});

  // Load shop profile
  useEffect(() => {
    loadShopProfile();
  }, []);

  const loadShopProfile = async () => {
    setLoading(true);
    try {
      const data = await getShopDetail();
      console.log('Shop profile loaded:', data);
      console.log('idCardNumber:', data.idCardNumber);
      console.log('id_card_number:', data.id_card_number);
      console.log('All fields:', Object.keys(data));
      setShopData(data);
      setFormData({
        shopEmail: data.shopEmail || '',
        shopPhone: data.shopPhone || ''
      });
    } catch (error) {
      console.error('Failed to load shop profile:', error);
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (formData.shopEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.shopEmail)) {
      newErrors.shopEmail = 'Email không hợp lệ';
    }

    // Validate phone
    if (formData.shopPhone && !/^0[0-9]{9,10}$/.test(formData.shopPhone)) {
      newErrors.shopPhone = 'Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10-11 số)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original data
    setFormData({
      shopEmail: shopData.shopEmail || '',
      shopPhone: shopData.shopPhone || ''
    });
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Only send updated fields
      const updateData = {
        shopEmail: formData.shopEmail,
        shopPhone: formData.shopPhone
      };

      await updateShopProfile(updateData);
      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);
      
      // Reload shop data
      await loadShopProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      const message = error.response?.data?.message || error.message || 'Không thể cập nhật thông tin';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Đang tải thông tin..." />
      </div>
    );
  }

  if (!shopData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy thông tin cửa hàng</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thông Tin Cá Nhân</h2>
          <p className="text-sm text-gray-600 mt-1">Quản lý thông tin liên hệ của cửa hàng</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={handleEdit}
            variant="primary"
            className="flex items-center gap-2"
            disabled={shopData?.status !== 'ACTIVE'}
          >
            <FiEdit2 className="w-4 h-4" />
            Chỉnh Sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex items-center gap-2"
              disabled={saving}
            >
              <FiX className="w-4 h-4" />
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              className="flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loading size="sm" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Lưu
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Status Warning */}
      {shopData?.status !== 'ACTIVE' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Cửa hàng chưa được kích hoạt. Bạn cần hoàn tất xác minh KYC để có thể chỉnh sửa thông tin.
          </p>
        </div>
      )}

      {/* Profile Information */}
      <div className="space-y-6">
        {/* ID Card Name - Readonly */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <FiUser className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Tên chủ cửa hàng (theo CMND/CCCD)</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-gray-900">
                {shopData?.idCardName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
              </p>
              <FiShield className="text-green-500" title="Đã xác thực" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Thông tin này được lấy từ CMND/CCCD đã xác minh, không thể thay đổi</p>
          </div>
        </div>

        {/* Shop Email - Editable */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FiMail className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Email cửa hàng</p>
            {isEditing ? (
              <div>
                <input
                  type="email"
                  name="shopEmail"
                  value={formData.shopEmail}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.shopEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="shop@example.com"
                />
                {errors.shopEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.shopEmail}</p>
                )}
              </div>
            ) : (
              <p className="text-lg font-semibold text-gray-900">
                {shopData?.shopEmail || <span className="text-gray-400 italic">Chưa cập nhật</span>}
              </p>
            )}
          </div>
        </div>

        {/* Shop Phone - Editable */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <FiPhone className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Số điện thoại cửa hàng</p>
            {isEditing ? (
              <div>
                <input
                  type="tel"
                  name="shopPhone"
                  value={formData.shopPhone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.shopPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0901234567"
                />
                {errors.shopPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.shopPhone}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ Số điện thoại này sẽ tự động đồng bộ với địa chỉ cửa hàng để GHN liên hệ
                </p>
              </div>
            ) : (
              <p className="text-lg font-semibold text-gray-900">
                {shopData?.shopPhone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Lưu ý:</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Tên chủ cửa hàng được xác thực bởi hệ thống, không thể thay đổi</li>
          <li>Email và số điện thoại có thể cập nhật để liên hệ với khách hàng</li>
          <li>Số điện thoại sẽ được sử dụng làm số liên hệ khi giao hàng qua GHN</li>
        </ul>
      </div>
    </div>
  );
};

export default SellerProfileInfo;
