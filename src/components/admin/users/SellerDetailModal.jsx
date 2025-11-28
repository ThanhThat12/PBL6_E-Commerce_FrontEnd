import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Package, DollarSign, Calendar, FileText, Store, Edit2, Save, XCircle, Key } from 'lucide-react';
import './SellerDetailModal.css';
import { resetUserPassword, updateSeller } from '../../../services/adminService';
import Toast from '../common/Toast';

const SellerDetailModal = ({ seller, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    owner: seller?.owner || '',
    username: seller?.username || '',
    shopName: seller?.name || '',
    email: seller?.email || '',
    phone: seller?.phone || '',
    address: seller?.address || '',
    shopDescription: seller?.shopDescription || '',
    status: seller?.status || 'PENDING'
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Sync formData when seller prop changes (after API update)
  useEffect(() => {
    if (seller) {
      setFormData({
        owner: seller.owner || '',
        username: seller.username || '',
        shopName: seller.name || '',
        email: seller.email || '',
        phone: seller.phone || '',
        address: seller.address || '',
        shopDescription: seller.shopDescription || '',
        status: seller.status || 'PENDING'
      });
    }
  }, [seller]);

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

  if (!seller) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'ACTIVE': return 'admin-seller-detail-status-verified';
      case 'PENDING': return 'admin-seller-detail-status-pending';
      case 'INACTIVE': return 'admin-seller-detail-status-suspended';
      default: return '';
    }
  };

  const getStatusDisplay = (status) => {
    // Convert ACTIVE -> Active, PENDING -> Pending, INACTIVE -> Inactive
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate owner name
    if (!formData.owner.trim()) {
      newErrors.owner = 'Owner name is required';
    }

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    // Validate shop name
    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
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
        owner: seller.owner || '',
        username: seller.username || '',
        shopName: seller.name || '',
        email: seller.email || '',
        phone: seller.phone || '',
        address: seller.address || '',
        shopDescription: seller.shopDescription || '',
        status: seller.status || 'PENDING'
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
      // Prepare update data for API
      const updateData = {
        username: formData.username?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        fullName: formData.owner?.trim() || null,
        shopStatus: formData.status?.toUpperCase() || null,
        shopName: formData.shopName?.trim() || null,
        shopDescription: formData.shopDescription?.trim() || null
      };
      
      console.log('💾 Saving seller data:', updateData);
      
      // Call API to update seller
      const response = await updateSeller(seller.id, updateData);
      
      if (response.status === 200) {
        console.log('✅ Seller updated successfully');
        
        // Exit edit mode
        setIsEditing(false);
        
        // Show success toast
        setToast({
          show: true,
          message: 'Seller information updated successfully!',
          type: 'success'
        });
        
        // Call onUpdate callback to refresh parent data (table + stats)
        if (onUpdate) {
          await onUpdate(seller.id, formData);
        }
      }
    } catch (error) {
      console.error('❌ Error updating seller:', error);
      
      // Show error toast
      setToast({
        show: true,
        message: error.message || 'Failed to update seller information. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      console.log('🔑 Resetting password for seller ID:', seller.id);
      const response = await resetUserPassword(seller.id);
      
      // Show success toast with the new password
      const newPassword = response.data || 'Seller123@';
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
      <div className="admin-seller-detail-modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="admin-seller-detail-modal">
        {/* Header */}
        <div className="admin-seller-detail-modal-header">
          <div className="admin-seller-detail-modal-header-content">
            <div className="admin-seller-detail-modal-avatar">
              <Store size={32} />
            </div>
            <div>
              <h2 className="admin-seller-detail-modal-title">{seller.name}</h2>
              <p className="admin-seller-detail-modal-subtitle">USER ID: {seller.id}</p>
            </div>
          </div>
          <div className="admin-seller-detail-modal-header-actions">
            {!isEditing ? (
              <button className="admin-seller-detail-btn-edit" onClick={handleEditToggle} title="Edit Seller">
                <Edit2 size={18} />
                Edit
              </button>
            ) : (
              <>
                <button className="admin-seller-detail-btn-cancel" onClick={handleEditToggle} title="Cancel (ESC)">
                  <XCircle size={18} />
                  Cancel
                </button>
                <button 
                  className="admin-seller-detail-btn-save" 
                  onClick={handleSave}
                  disabled={isSaving}
                  title="Save Changes"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button className="admin-seller-detail-modal-close-btn" onClick={onClose} title="Close (ESC)">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="admin-seller-detail-modal-body">
          {/* Status Badge */}
          <div className="admin-seller-detail-section">
            <div className="admin-seller-detail-row">
              <span className="admin-seller-detail-label">Status</span>
              {isEditing ? (
                <div className="admin-seller-detail-status-select-wrapper">
                  <select
                    className="admin-seller-detail-status-select"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              ) : (
                <span className={`admin-seller-detail-status-badge ${getStatusClass(seller.status)}`}>
                  <span className="admin-seller-detail-status-dot">●</span>
                  {getStatusDisplay(seller.status)}
                </span>
              )}
            </div>
          </div>

          {/* Shop Information */}
          <div className="admin-seller-detail-section">
            <h3 className="admin-seller-detail-section-title">Shop Information</h3>
            
            {/* Shop Name */}
            <div className="admin-seller-detail-row">
              <div className="admin-seller-detail-icon">
                <Store size={18} />
              </div>
              <div className="admin-seller-detail-content">
                <span className="admin-seller-detail-label">Shop Name</span>
                {isEditing ? (
                  <div className="admin-seller-detail-input-wrapper">
                    <input
                      type="text"
                      className={`admin-seller-detail-input ${errors.shopName ? 'admin-seller-detail-input-error' : ''}`}
                      value={formData.shopName}
                      onChange={(e) => handleInputChange('shopName', e.target.value)}
                      placeholder="Enter shop name"
                    />
                    {errors.shopName && <span className="admin-seller-detail-error-message">{errors.shopName}</span>}
                  </div>
                ) : (
                  <span className="admin-seller-detail-value">{seller.name}</span>
                )}
              </div>
            </div>

            {/* Owner Name */}
            <div className="admin-seller-detail-row">
              <div className="admin-seller-detail-icon">
                <User size={18} />
              </div>
              <div className="admin-seller-detail-content">
                <span className="admin-seller-detail-label">Owner Name</span>
                {isEditing ? (
                  <div className="admin-seller-detail-input-wrapper">
                    <input
                      type="text"
                      className={`admin-seller-detail-input ${errors.owner ? 'admin-seller-detail-input-error' : ''}`}
                      value={formData.owner}
                      onChange={(e) => handleInputChange('owner', e.target.value)}
                      placeholder="Enter owner name"
                    />
                    {errors.owner && <span className="admin-seller-detail-error-message">{errors.owner}</span>}
                  </div>
                ) : (
                  <span className="admin-seller-detail-value">{seller.owner || 'Not provided'}</span>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="admin-seller-detail-row">
              <div className="admin-seller-detail-icon">
                <User size={18} />
              </div>
              <div className="admin-seller-detail-content">
                <span className="admin-seller-detail-label">Username</span>
                {isEditing ? (
                  <div className="admin-seller-detail-input-wrapper">
                    <input
                      type="text"
                      className={`admin-seller-detail-input ${errors.username ? 'admin-seller-detail-input-error' : ''}`}
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Enter username"
                    />
                    {errors.username && <span className="admin-seller-detail-error-message">{errors.username}</span>}
                  </div>
                ) : (
                  <span className="admin-seller-detail-value">{seller.username || 'Not provided'}</span>
                )}
              </div>
            </div>

            {/* Shop Description */}
            <div className="admin-seller-detail-row">
              <div className="admin-seller-detail-icon">
                <FileText size={18} />
              </div>
              <div className="admin-seller-detail-content">
                <span className="admin-seller-detail-label">Shop Description</span>
                {isEditing ? (
                  <div className="admin-seller-detail-input-wrapper">
                    <textarea
                      className="admin-seller-detail-textarea"
                      value={formData.shopDescription}
                      onChange={(e) => handleInputChange('shopDescription', e.target.value)}
                      placeholder="Enter shop description"
                      rows="3"
                    />
                  </div>
                ) : (
                  <span className="admin-seller-detail-value">{seller.shopDescription || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="admin-seller-detail-section">
            <h3 className="admin-seller-detail-section-title">Contact Information</h3>
            
            {/* Email */}
            <div className="admin-seller-detail-row">
              <div className="admin-seller-detail-icon">
                <Mail size={18} />
              </div>
              <div className="admin-seller-detail-content">
                <span className="admin-seller-detail-label">Email</span>
                {isEditing ? (
                  <div className="admin-seller-detail-input-wrapper">
                    <input
                      type="email"
                      className={`admin-seller-detail-input ${errors.email ? 'admin-seller-detail-input-error' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                    {errors.email && <span className="admin-seller-detail-error-message">{errors.email}</span>}
                  </div>
                ) : (
                  <span className="admin-seller-detail-value">{seller.email || 'Not provided'}</span>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="admin-seller-detail-row">
              <div className="admin-seller-detail-icon">
                <Phone size={18} />
              </div>
              <div className="admin-seller-detail-content">
                <span className="admin-seller-detail-label">Phone</span>
                {isEditing ? (
                  <div className="admin-seller-detail-input-wrapper">
                    <input
                      type="tel"
                      className={`admin-seller-detail-input ${errors.phone ? 'admin-seller-detail-input-error' : ''}`}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && <span className="admin-seller-detail-error-message">{errors.phone}</span>}
                  </div>
                ) : (
                  <span className="admin-seller-detail-value">{seller.phone}</span>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="admin-seller-detail-row">
              <div className="admin-seller-detail-icon">
                <MapPin size={18} />
              </div>
              <div className="admin-seller-detail-content">
                <span className="admin-seller-detail-label">Address</span>
                <span className="admin-seller-detail-value">{seller.address || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Performance Statistics */}
          <div className="admin-seller-detail-section">
            <h3 className="admin-seller-detail-section-title">Performance Statistics</h3>
            
            <div className="admin-seller-detail-stats-grid">
              <div className="admin-seller-detail-stat-box">
                <div className="admin-seller-detail-stat-icon-box admin-seller-detail-stat-blue">
                  <Package size={20} />
                </div>
                <div className="admin-seller-detail-stat-info">
                  <span className="admin-seller-detail-stat-label">Total Products</span>
                  <span className="admin-seller-detail-stat-value">{seller.products}</span>
                </div>
              </div>

              <div className="admin-seller-detail-stat-box">
                <div className="admin-seller-detail-stat-icon-box admin-seller-detail-stat-green">
                  <DollarSign size={20} />
                </div>
                <div className="admin-seller-detail-stat-info">
                  <span className="admin-seller-detail-stat-label">Total Revenue</span>
                  <span className="admin-seller-detail-stat-value">${seller.totalSales?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="admin-seller-detail-section">
            <h3 className="admin-seller-detail-section-title">Account Information</h3>
            
            <div className="admin-seller-detail-row">
              <div className="admin-seller-detail-icon">
                <Calendar size={18} />
              </div>
              <div className="admin-seller-detail-content">
                <span className="admin-seller-detail-label">Member Since</span>
                <span className="admin-seller-detail-value">{formatDate(seller.joinDate)}</span>
              </div>
            </div>
          </div>

          {/* Reset Password Section */}
          <div className="admin-seller-detail-section admin-seller-detail-reset-section">
            <button 
              className="admin-seller-detail-btn-reset-password"
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

export default SellerDetailModal;
