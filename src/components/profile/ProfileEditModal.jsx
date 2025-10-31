import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { updateProfile } from '../../services/userService';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * ProfileEditModal
 * Modal for editing user profile information
 */
const ProfileEditModal = ({ isOpen, onClose, currentProfile, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens or profile changes
  useEffect(() => {
    if (currentProfile) {
      setFormData({
        username: currentProfile.username || '',
        email: currentProfile.email || '',
        phoneNumber: currentProfile.phoneNumber || '',
        fullName: currentProfile.fullName || '',
      });
    }
  }, [currentProfile]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (formData.username && formData.username.length > 50) {
      newErrors.username = 'Username must not exceed 50 characters';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phoneNumber && formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits';
    }
    if (formData.phoneNumber && formData.phoneNumber.length > 15) {
      newErrors.phoneNumber = 'Phone number must not exceed 15 digits';
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
      // Only send fields that have values
      const updateData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key].trim() !== '') {
          updateData[key] = formData[key].trim();
        }
      });

      const response = await updateProfile(updateData);
      
      if (response.statusCode === 200) {
        toast.success('Profile updated successfully');
        onSuccess(response.data);
        onClose();
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(errorMessage);
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
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
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
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiUser className="inline mr-2" />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter username"
                disabled={loading}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiMail className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiPhone className="inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
                disabled={loading}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiUser className="inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
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
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
