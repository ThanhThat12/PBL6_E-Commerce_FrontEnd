import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Key, RotateCcw, Save, XCircle } from 'lucide-react';
import './AdminEditModal.css';
import { resetUserPassword, updateUser } from '../../../services/adminService';
import Toast from '../common/Toast';

const AdminEditModal = ({ admin, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.phone || '',
    status: admin?.status || 'Active',
    role: admin?.role || 'Admin'
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Add ESC key listener
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  if (!admin) return null;

  const validateForm = () => {
    const newErrors = {};
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate phone
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone format';
    }

    // Validate password if changing
    if (showPasswordSection) {
      if (!passwordData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }

      if (!passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password';
      } else if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 [AdminEditModal] Updating admin ID:', admin.id);
      console.log('💾 [AdminEditModal] Form data:', formData);
      
      // Prepare update data for API
      const updateData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        activated: formData.status === 'Active'
      };
      
      // Note: Password change is handled by resetUserPassword API, not update API
      if (showPasswordSection) {
        console.warn('⚠️ [AdminEditModal] Password change through update API is not supported. Use Reset Password instead.');
      }
      
      // Call API to update admin
      const response = await updateUser(admin.id, updateData);
      
      console.log('✅ [AdminEditModal] Admin updated successfully:', response);
      
      // Show success toast
      setToast({
        show: true,
        message: 'Admin information updated successfully!',
        type: 'success'
      });
      
      // Call parent onUpdate with updated admin data
      if (onUpdate && response.data) {
        // Merge updated data with existing admin to preserve all fields
        const updatedAdmin = {
          ...admin,
          ...response.data,
          name: response.data.username || admin.name,
          status: response.data.activated ? 'Active' : 'Inactive'
        };
        await onUpdate(updatedAdmin);
      }
    } catch (error) {
      console.error('❌ [AdminEditModal] Error updating admin:', error);
      
      // Show error toast
      setToast({
        show: true,
        message: error.message || 'Failed to update admin information. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      console.log('🔑 Resetting password for admin ID:', admin.id);
      const response = await resetUserPassword(admin.id);
      
      // Show success toast with the new password
      const newPassword = response.data || 'Admin123@';
      setToast({
        show: true,
        message: `Password reset successfully! New password: ${newPassword}`,
        type: 'success'
      });
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      setToast({
        show: true,
        message: error.message || 'Failed to reset password. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="admin-edit-modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="admin-edit-modal">
        {/* Header */}
        <div className="admin-edit-modal-header">
          <div className="admin-edit-modal-header-content">
            <div className="admin-edit-modal-avatar">
              <Shield size={32} />
            </div>
            <div>
              <h2 className="admin-edit-modal-title">Edit Administrator</h2>
              <p className="admin-edit-modal-subtitle">ID: {admin.id}</p>
            </div>
          </div>
          <button className="admin-edit-modal-close-btn" onClick={onClose} title="Close (ESC)">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-edit-modal-body">
          {/* Basic Information */}
          <div className="admin-edit-form-section">
            <h3 className="admin-edit-section-title">Basic Information</h3>
            
            {/* Username */}
            <div className="admin-edit-form-group">
              <label className="admin-edit-form-label">
                <User size={18} />
                Username
              </label>
              <input
                type="text"
                className={`admin-edit-form-input ${errors.username ? 'admin-edit-input-error' : ''}`}
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
              />
              {errors.username && <span className="admin-edit-error-message">{errors.username}</span>}
            </div>

            {/* Email */}
            <div className="admin-edit-form-group">
              <label className="admin-edit-form-label">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                className={`admin-edit-form-input ${errors.email ? 'admin-edit-input-error' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
              {errors.email && <span className="admin-edit-error-message">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className="admin-edit-form-group">
              <label className="admin-edit-form-label">
                <Phone size={18} />
                Phone
              </label>
              <input
                type="tel"
                className={`admin-edit-form-input ${errors.phone ? 'admin-edit-input-error' : ''}`}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
              {errors.phone && <span className="admin-edit-error-message">{errors.phone}</span>}
            </div>
          </div>

          {/* Role & Status */}
          <div className="admin-edit-form-section">
            <h3 className="admin-edit-section-title">Status</h3>
            
            <div className="admin-edit-form-row">
              {/* Status */}
              <div className="admin-edit-form-group">
                <select
                  className="admin-edit-form-select"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="admin-edit-form-section">
            <div className="admin-edit-section-header">
              <h3 className="admin-edit-section-title">Password Management</h3>
              <button 
                className="admin-edit-btn-reset-password"
                onClick={handleResetPassword}
                type="button"
              >
                <RotateCcw size={16} />
                Reset Password
              </button>
            </div>

            <button
              className="admin-edit-btn-toggle-password"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              type="button"
            >
              <Key size={18} />
              {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
            </button>

            {showPasswordSection && (
              <div className="admin-edit-password-fields">
                {/* New Password */}
                <div className="admin-edit-form-group">
                  <label className="admin-edit-form-label">
                    <Key size={18} />
                    New Password
                  </label>
                  <input
                    type="password"
                    className={`admin-edit-form-input ${errors.newPassword ? 'admin-edit-input-error' : ''}`}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                  />
                  {errors.newPassword && <span className="admin-edit-error-message">{errors.newPassword}</span>}
                </div>

                {/* Confirm Password */}
                <div className="admin-edit-form-group">
                  <label className="admin-edit-form-label">
                    <Key size={18} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className={`admin-edit-form-input ${errors.confirmPassword ? 'admin-edit-input-error' : ''}`}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && <span className="admin-edit-error-message">{errors.confirmPassword}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="admin-edit-modal-footer">
          <button className="admin-edit-btn-cancel" onClick={onClose}>
            <XCircle size={18} />
            Cancel
          </button>
          <button 
            className="admin-edit-btn-save" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={5000}
      />
    </>
  );
};

export default AdminEditModal;
