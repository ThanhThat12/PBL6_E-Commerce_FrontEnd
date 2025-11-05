import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { changePassword } from '../../services/userService';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * ChangePasswordModal
 * Modal for changing user password
 */
const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setShowPasswords({
      old: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Mật khẩu hiện tại không được để trống';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải từ 6 ký tự trở lên';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword({
        currentPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response && (response.statusCode === 200 || response.statusCode === 201)) {
        toast.success('Đổi mật khẩu thành công');
        handleClose();
      } else {
        toast.error(response?.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Đã xảy ra lỗi';
      
      // Handle specific error cases
      if (errorMessage.includes('hiện tại') || errorMessage.includes('đúng')) {
        setErrors({ oldPassword: 'Mật khẩu hiện tại không đúng' });
        toast.error('Mật khẩu hiện tại không đúng');
      } else if (errorMessage.includes('khớp') || errorMessage.includes('match')) {
        setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
        toast.error('Mật khẩu xác nhận không khớp');
      } else {
        toast.error(errorMessage);
      }
      
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiLock className="inline mr-2" />
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    errors.oldPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter current password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('old')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPasswords.old ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.oldPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiLock className="inline mr-2" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password (min 6 characters)"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPasswords.new ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiLock className="inline mr-2" />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Re-enter new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPasswords.confirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium mb-1">Password Requirements:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• At least 6 characters long</li>
                <li>• New password must match confirmation</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loading size="sm" />
                    <span>Changing...</span>
                  </div>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
