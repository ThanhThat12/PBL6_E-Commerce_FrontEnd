import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, Package, Edit2, Save, XCircle } from 'lucide-react';
import './CustomerDetailModal.css';

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
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
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
      // Call API to update customer
      await onUpdate(customer.id, formData);
      
      setIsEditing(false);
      alert('Customer information updated successfully!');
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="customer-detail-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-avatar">
              <User size={32} />
            </div>
            <div>
              <h2 className="modal-title">{customer.username || 'N/A'}</h2>
              <p className="modal-subtitle">Customer ID: #{customer.id}</p>
            </div>
          </div>
          <div className="modal-header-actions">
            {!isEditing ? (
              <button className="btn-edit" onClick={handleEditToggle} title="Edit Customer">
                <Edit2 size={18} />
                Edit
              </button>
            ) : (
              <>
                <button className="btn-cancel" onClick={handleEditToggle} title="Cancel (ESC)">
                  <XCircle size={18} />
                  Cancel
                </button>
                <button 
                  className="btn-save" 
                  onClick={handleSave}
                  disabled={isSaving}
                  title="Save Changes"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button className="modal-close-btn" onClick={onClose} title="Close (ESC)">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status Badge */}
          <div className="detail-section">
            <div className="detail-row">
              <span className="detail-label">Status</span>
              {isEditing ? (
                <div className="status-select-wrapper">
                  <select
                    className="status-select"
                    value={formData.activated}
                    onChange={(e) => handleInputChange('activated', e.target.value === 'true')}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              ) : (
                <span className={`status-badge ${customer.activated ? 'status-active' : 'status-inactive'}`}>
                  <span className="status-dot">●</span>
                  {customer.activated ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
          </div>

          {/* Contact Information - Editable */}
          <div className="detail-section">
            <h3 className="section-title">Contact Information</h3>
            
            {/* Username */}
            <div className="detail-row">
              <div className="detail-icon">
                <User size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Username</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className={`detail-input ${errors.username ? 'input-error' : ''}`}
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Enter username"
                    />
                    {errors.username && <span className="error-message">{errors.username}</span>}
                  </div>
                ) : (
                  <span className="detail-value">{customer.username || 'N/A'}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="detail-row">
              <div className="detail-icon">
                <Mail size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Email</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      type="email"
                      className={`detail-input ${errors.email ? 'input-error' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                ) : (
                  <span className="detail-value">{customer.email || 'N/A'}</span>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="detail-row">
              <div className="detail-icon">
                <Phone size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Phone</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      type="tel"
                      className={`detail-input ${errors.phoneNumber ? 'input-error' : ''}`}
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Enter phone number"
                    />
                    {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                  </div>
                ) : (
                  <span className="detail-value">{customer.phoneNumber || 'N/A'}</span>
                )}
              </div>
            </div>

            {/* Primary Address */}
            {(customer.primaryAddressFullAddress || customer.primaryAddressLabel) && (
              <div className="detail-row">
                <div className="detail-icon">
                  <MapPin size={18} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Primary Address</span>
                  <div className="address-info">
                    {customer.primaryAddressLabel && (
                      <div className="address-label" style={{ fontWeight: 600, color: '#667eea', marginBottom: '4px' }}>
                        {customer.primaryAddressLabel}
                      </div>
                    )}
                    {customer.primaryAddressFullAddress && (
                      <div className="address-line" style={{ marginBottom: '4px' }}>
                        {customer.primaryAddressFullAddress}
                      </div>
                    )}
                    {(customer.primaryAddressWard || customer.primaryAddressDistrict || customer.primaryAddressProvince) && (
                      <div className="address-line" style={{ color: '#64748b', marginBottom: '4px' }}>
                        {[customer.primaryAddressWard, customer.primaryAddressDistrict, customer.primaryAddressProvince]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                    {customer.primaryAddressContactPhone && (
                      <div className="address-phone" style={{ display: 'flex', alignItems: 'center', color: '#475569', fontSize: '14px' }}>
                        <Phone size={14} style={{ marginRight: '6px' }} />
                        {customer.primaryAddressContactPhone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Statistics */}
          <div className="detail-section">
            <h3 className="section-title">Order Statistics</h3>
            
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-icon-box stat-blue">
                  <ShoppingBag size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Orders</span>
                  <span className="stat-value">{customer.totalOrders || 0}</span>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon-box stat-green">
                  <DollarSign size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Spent</span>
                  <span className="stat-value">${customer.totalSpent ? customer.totalSpent.toFixed(2) : '0.00'}</span>
                </div>
              </div>

              {customer.cartItemsCount !== undefined && (
                <div className="stat-box">
                  <div className="stat-icon-box stat-purple">
                    <Package size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Cart Items</span>
                    <span className="stat-value">{customer.cartItemsCount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="detail-section">
            <h3 className="section-title">Account Information</h3>
            
            <div className="detail-row">
              <div className="detail-icon">
                <Calendar size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Created At</span>
                <span className="detail-value">{formatDate(customer.createdAt)}</span>
              </div>
            </div>

            {customer.lastOrderDate && (
              <div className="detail-row">
                <div className="detail-icon">
                  <Package size={18} />
                </div>
                <div className="detail-content">
                  <span className="detail-label">Last Order Date</span>
                  <span className="detail-value">{formatDate(customer.lastOrderDate)}</span>
                </div>
              </div>
            )}

            <div className="detail-row">
              <div className="detail-icon">
                <User size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Role</span>
                <span className="detail-value">{customer.role || 'BUYER'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDetailModal;
