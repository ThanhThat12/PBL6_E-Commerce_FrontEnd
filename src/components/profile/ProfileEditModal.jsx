import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiUser, FiPhone } from 'react-icons/fi';
import { updateProfile } from '../../services/userService';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * ProfileEditModal
 * Modal for editing user profile information
 * 
 * Editable fields:
 * - fullName (required)
 * - phoneNumber (optional, Vietnamese format)
 */
const ProfileEditModal = ({ isOpen, onClose, currentProfile, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens or profile changes
  useEffect(() => {
    if (currentProfile) {
      setFormData({
        fullName: currentProfile.fullName || '',
        phoneNumber: currentProfile.phoneNumber || '',
      });
      setErrors({});
    }
  }, [currentProfile, isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName || formData.fullName.trim().length === 0) {
      newErrors.fullName = 'Họ tên không được để trống';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Họ tên phải từ 2 ký tự trở lên';
    } else if (formData.fullName.length > 100) {
      newErrors.fullName = 'Họ tên không được vượt quá 100 ký tự';
    }

    // Phone number validation (Vietnamese format: 0xxxxxxxxx or +84xxxxxxxxx)
    if (formData.phoneNumber && formData.phoneNumber.trim().length > 0) {
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Số điện thoại không hợp lệ. Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx';
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Only send required fields
      const updateData = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim() || '',
      };

      const response = await updateProfile(updateData);
      
      if (response && response.statusCode === 200) {
        toast.success('Cập nhật thông tin thành công');
        onSuccess(response.data);
        onClose();
      } else {
        toast.error(response?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.error || 'Đã xảy ra lỗi khi cập nhật';
      toast.error(errorMessage);
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiUser className="inline mr-2" />
                Họ và tên *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập họ và tên"
                disabled={loading}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiPhone className="inline mr-2" />
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0xxxxxxxxx"
                disabled={loading}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loading size="sm" />}
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
