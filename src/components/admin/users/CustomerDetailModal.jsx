import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, Package, Edit2, Save, XCircle, Key } from 'lucide-react';
import './CustomerDetailModal.css';
import { resetUserPassword, updateUser } from '../../../services/adminService';
import Toast from '../common/Toast';

const CustomerDetailModal = ({ customer, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: customer?.username || '',
    email: customer?.email || '',
    phoneNumber: customer?.phoneNumber || '',
    activated: customer?.activated !== undefined ? customer.activated : true
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Add ESC key listener
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (isEditing) {
          // If editing, cancel edit mode
          handleEditToggle();
        } else {
          // If not editing, close modal
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isEditing, onClose]);

  if (!customer) return null;

  // Helper function to format full address
  const formatFullAddress = () => {
    const addressParts = [];
    
    // Add label if exists
    if (customer.primaryAddressLabel) {
      addressParts.push(`[${customer.primaryAddressLabel}]`);
    }
    
    // Add full address
    if (customer.primaryAddressFullAddress) {
      addressParts.push(customer.primaryAddressFullAddress);
    }
    
    // Add ward, district, province
    const locationParts = [
      customer.primaryAddressWard,
      customer.primaryAddressDistrict,
      customer.primaryAddressProvince
    ].filter(Boolean);
    
    if (locationParts.length > 0) {
      addressParts.push(locationParts.join(', '));
    }
    
    // Add contact phone if exists
    if (customer.primaryAddressContactPhone) {
      addressParts.push(`☎️ ${customer.primaryAddressContactPhone}`);
    }
    
    return addressParts.length > 0 ? addressParts.join(' | ') : 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'admin-customer-detail-status-active';
      case 'Inactive': return 'admin-customer-detail-status-inactive';
      default: return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate phone (optional)
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = 'Invalid phone format';
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset form data
      setFormData({
        username: customer.username || '',
        email: customer.email || '',
        phoneNumber: customer.phoneNumber || '',
        activated: customer.activated !== undefined ? customer.activated : true
      });
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 [CustomerDetailModal] Updating customer ID:', customer.id);
      console.log('💾 [CustomerDetailModal] Form data:', formData);
      
      // Prepare update data for API
      const updateData = {
        username: formData.username?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phoneNumber?.trim() || null,
        activated: formData.activated
      };
      
      // Call API to update customer
      const response = await updateUser(customer.id, updateData);
      
      console.log('✅ [CustomerDetailModal] Customer updated successfully:', response);
      
      // Exit edit mode
      setIsEditing(false);
      
      // Show success toast
      setToast({
        show: true,
        message: 'Customer information updated successfully!',
        type: 'success'
      });
      
      // Call parent onUpdate to refresh data (table + stats + modal detail)
      if (onUpdate) {
        await onUpdate({ id: customer.id, ...formData });
      }
    } catch (error) {
      console.error('❌ [CustomerDetailModal] Error updating customer:', error);
      
      // Show error toast
      setToast({
        show: true,
        message: error.message || 'Failed to update customer information. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      console.log('🔑 Resetting password for customer ID:', customer.id);
      const response = await resetUserPassword(customer.id);
      
      // Show success toast with the new password
      const newPassword = response.data || 'Customer123@';
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
      <div className="admin-customer-detail-modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="admin-customer-detail-modal">
        {/* Header */}
        <div className="admin-customer-detail-modal-header">
          <div className="admin-customer-detail-modal-header-content">
            <div className="admin-customer-detail-modal-avatar">
              <User size={32} />
            </div>
            <div>
              <h2 className="admin-customer-detail-modal-title">{customer.username || 'N/A'}</h2>
              <p className="admin-customer-detail-modal-subtitle">User ID: #{customer.id}</p>
            </div>
          </div>
          <div className="admin-customer-detail-modal-header-actions">
            {!isEditing ? (
              <button className="admin-customer-detail-btn-edit" onClick={handleEditToggle} title="Edit Customer">
                <Edit2 size={18} />
                Edit
              </button>
            ) : (
              <>
                <button className="admin-customer-detail-btn-cancel" onClick={handleEditToggle} title="Cancel (ESC)">
                  <XCircle size={18} />
                  Cancel
                </button>
                <button 
                  className="admin-customer-detail-btn-save" 
                  onClick={handleSave}
                  disabled={isSaving}
                  title="Save Changes"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button className="admin-customer-detail-modal-close-btn" onClick={onClose} title="Close (ESC)">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="admin-customer-detail-modal-body">
          {/* Status Badge */}
          <div className="admin-customer-detail-section">
            <div className="admin-customer-detail-row">
              <span className="admin-customer-detail-label">Status</span>
              {isEditing ? (
                <div className="admin-customer-detail-status-select-wrapper">
                  <select
                    className="admin-customer-detail-status-select"
                    value={formData.activated}
                    onChange={(e) => handleInputChange('activated', e.target.value === 'true')}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              ) : (
                <span className={`admin-customer-detail-status-badge ${customer.activated ? 'admin-customer-detail-status-active' : 'admin-customer-detail-status-inactive'}`}>
                  <span className="admin-customer-detail-status-dot">●</span>
                  {customer.activated ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
          </div>

          {/* Contact Information - Editable */}
          <div className="admin-customer-detail-section">
            <h3 className="admin-customer-detail-section-title">Contact Information</h3>
            
            {/* Username */}
            <div className="admin-customer-detail-row">
              <div className="admin-customer-detail-icon">
                <User size={18} />
              </div>
              <div className="admin-customer-detail-content">
                <span className="admin-customer-detail-label">Username</span>
                {isEditing ? (
                  <div className="admin-customer-detail-input-wrapper">
                    <input
                      type="text"
                      className={`admin-customer-detail-input ${errors.username ? 'admin-customer-detail-input-error' : ''}`}
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Enter username"
                    />
                    {errors.username && <span className="admin-customer-detail-error-message">{errors.username}</span>}
                  </div>
                ) : (
                  <span className="admin-customer-detail-value">{customer.username || 'N/A'}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="admin-customer-detail-row">
              <div className="admin-customer-detail-icon">
                <Mail size={18} />
              </div>
              <div className="admin-customer-detail-content">
                <span className="admin-customer-detail-label">Email</span>
                {isEditing ? (
                  <div className="admin-customer-detail-input-wrapper">
                    <input
                      type="email"
                      className={`admin-customer-detail-input ${errors.email ? 'admin-customer-detail-input-error' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                    {errors.email && <span className="admin-customer-detail-error-message">{errors.email}</span>}
                  </div>
                ) : (
                  <span className="admin-customer-detail-value">{customer.email || 'N/A'}</span>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="admin-customer-detail-row">
              <div className="admin-customer-detail-icon">
                <Phone size={18} />
              </div>
              <div className="admin-customer-detail-content">
                <span className="admin-customer-detail-label">Phone</span>
                {isEditing ? (
                  <div className="admin-customer-detail-input-wrapper">
                    <input
                      type="tel"
                      className={`admin-customer-detail-input ${errors.phoneNumber ? 'admin-customer-detail-input-error' : ''}`}
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Enter phone number"
                    />
                    {errors.phoneNumber && <span className="admin-customer-detail-error-message">{errors.phoneNumber}</span>}
                  </div>
                ) : (
                  <span className="admin-customer-detail-value">{customer.phoneNumber || 'N/A'}</span>
                )}
              </div>
            </div>

          </div>

          {/* Address Section */}
          <div className="admin-customer-detail-section">
            <h3 className="admin-customer-detail-section-title">
              <MapPin size={18} />
              Address
            </h3>
            
            <div className="admin-customer-detail-row">
              <div className="admin-customer-detail-icon">
                <MapPin size={18} />
              </div>
              <div className="admin-customer-detail-content">
                <span className="admin-customer-detail-label">Primary Address</span>
                <span className="admin-customer-detail-value admin-customer-detail-address-text">
                  {formatFullAddress()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Statistics */}
          <div className="admin-customer-detail-section">
            <h3 className="admin-customer-detail-section-title">
              <ShoppingBag size={18} />
              Order Statistics
            </h3>
            
            <div className="admin-customer-detail-stats-grid">
              <div className="admin-customer-detail-stat-box">
                <div className="admin-customer-detail-stat-icon-box admin-customer-detail-stat-blue">
                  <ShoppingBag size={20} />
                </div>
                <div className="admin-customer-detail-stat-info">
                  <span className="admin-customer-detail-stat-label">Total Orders</span>
                  <span className="admin-customer-detail-stat-value">{customer.totalOrders || 0}</span>
                </div>
              </div>

              <div className="admin-customer-detail-stat-box">
                <div className="admin-customer-detail-stat-icon-box admin-customer-detail-stat-green">
                  <DollarSign size={20} />
                </div>
                <div className="admin-customer-detail-stat-info">
                  <span className="admin-customer-detail-stat-label">Total Spent</span>
                  <span className="admin-customer-detail-stat-value">
                    ${customer.totalSpent != null ? customer.totalSpent.toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>

              {/* <div className="admin-customer-detail-stat-box">
                <div className="admin-customer-detail-stat-icon-box admin-customer-detail-stat-purple">
                  <Package size={20} />
                </div>
                <div className="admin-customer-detail-stat-info">
                  <span className="admin-customer-detail-stat-label">Cart Items</span>
                  <span className="admin-customer-detail-stat-value">{customer.cartItemsCount || 0}</span>
                </div>
              </div> */}
            </div>
          </div>

          {/* Account Information */}
          <div className="admin-customer-detail-section">
            <h3 className="admin-customer-detail-section-title">
              <User size={18} />
              Account Information
            </h3>
            
            <div className="admin-customer-detail-row">
              <div className="admin-customer-detail-icon">
                <Calendar size={18} />
              </div>
              <div className="admin-customer-detail-content">
                <span className="admin-customer-detail-label">Registered At</span>
                <span className="admin-customer-detail-value">{formatDate(customer.registeredAt || customer.createdAt)}</span>
              </div>
            </div>

            {customer.lastOrderDate && (
              <div className="admin-customer-detail-row">
                <div className="admin-customer-detail-icon">
                  <ShoppingBag size={18} />
                </div>
                <div className="admin-customer-detail-content">
                  <span className="admin-customer-detail-label">Last Order Date</span>
                  <span className="admin-customer-detail-value">{formatDate(customer.lastOrderDate)}</span>
                </div>
              </div>
            )}

            <div className="admin-customer-detail-row">
              <div className="admin-customer-detail-icon">
                <User size={18} />
              </div>
              <div className="admin-customer-detail-content">
                <span className="admin-customer-detail-label">Role</span>
                <span className="admin-customer-detail-value">{customer.role || 'BUYER'}</span>
              </div>
            </div>
          </div>

          {/* Reset Password Section */}
          <div className="admin-customer-detail-section admin-customer-detail-reset-section">
            <button 
              className="admin-customer-detail-btn-reset-password"
              onClick={handleResetPassword}
              type="button"
            >
              <Key size={18} />
              Reset Password
            </button>
          </div>
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

export default CustomerDetailModal;
