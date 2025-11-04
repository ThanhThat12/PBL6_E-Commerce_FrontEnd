import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Package, DollarSign, Calendar, FileText, Store, Edit2, Save, XCircle } from 'lucide-react';
import './SellerDetailModal.css';

const SellerDetailModal = ({ seller, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    owner: seller?.owner || '',
    shopName: seller?.name || '',
    email: seller?.email || '',
    phone: seller?.phone || '',
    address: seller?.address || '',
    shopDescription: seller?.shopDescription || '',
    status: seller?.status || 'Pending'
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
    switch(status) {
      case 'Verified': return 'status-verified';
      case 'Pending': return 'status-pending';
      case 'Suspended': return 'status-suspended';
      default: return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate owner name
    if (!formData.owner.trim()) {
      newErrors.owner = 'Owner name is required';
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
        shopName: seller.name || '',
        email: seller.email || '',
        phone: seller.phone || '',
        address: seller.address || '',
        shopDescription: seller.shopDescription || '',
        status: seller.status || 'Pending'
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
      // Call API to update seller
      await onUpdate(seller.id, formData);
      
      setIsEditing(false);
      alert('Seller information updated successfully!');
    } catch (error) {
      console.error('Error updating seller:', error);
      alert('Failed to update seller information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="seller-detail-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-avatar">
              <Store size={32} />
            </div>
            <div>
              <h2 className="modal-title">{seller.name}</h2>
              <p className="modal-subtitle">Seller ID: {seller.id}</p>
            </div>
          </div>
          <div className="modal-header-actions">
            {!isEditing ? (
              <button className="btn-edit" onClick={handleEditToggle} title="Edit Seller">
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
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              ) : (
                <span className={`status-badge ${getStatusClass(seller.status)}`}>
                  <span className="status-dot">●</span>
                  {seller.status}
                </span>
              )}
            </div>
          </div>

          {/* Shop Information */}
          <div className="detail-section">
            <h3 className="section-title">Shop Information</h3>
            
            {/* Shop Name */}
            <div className="detail-row">
              <div className="detail-icon">
                <Store size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Shop Name</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className={`detail-input ${errors.shopName ? 'input-error' : ''}`}
                      value={formData.shopName}
                      onChange={(e) => handleInputChange('shopName', e.target.value)}
                      placeholder="Enter shop name"
                    />
                    {errors.shopName && <span className="error-message">{errors.shopName}</span>}
                  </div>
                ) : (
                  <span className="detail-value">{seller.name}</span>
                )}
              </div>
            </div>

            {/* Owner Name */}
            <div className="detail-row">
              <div className="detail-icon">
                <User size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Owner Name</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className={`detail-input ${errors.owner ? 'input-error' : ''}`}
                      value={formData.owner}
                      onChange={(e) => handleInputChange('owner', e.target.value)}
                      placeholder="Enter owner name"
                    />
                    {errors.owner && <span className="error-message">{errors.owner}</span>}
                  </div>
                ) : (
                  <span className="detail-value">{seller.owner || 'Not provided'}</span>
                )}
              </div>
            </div>

            {/* Shop Description */}
            <div className="detail-row">
              <div className="detail-icon">
                <FileText size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Shop Description</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <textarea
                      className="detail-textarea"
                      value={formData.shopDescription}
                      onChange={(e) => handleInputChange('shopDescription', e.target.value)}
                      placeholder="Enter shop description"
                      rows="3"
                    />
                  </div>
                ) : (
                  <span className="detail-value">{seller.shopDescription || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="detail-section">
            <h3 className="section-title">Contact Information</h3>
            
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
                  <span className="detail-value">{seller.email || 'Not provided'}</span>
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
                      className={`detail-input ${errors.phone ? 'input-error' : ''}`}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                ) : (
                  <span className="detail-value">{seller.phone}</span>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="detail-row">
              <div className="detail-icon">
                <MapPin size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Address</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <textarea
                      className="detail-textarea"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter address (optional)"
                      rows="2"
                    />
                  </div>
                ) : (
                  <span className="detail-value">{seller.address || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Performance Statistics */}
          <div className="detail-section">
            <h3 className="section-title">Performance Statistics</h3>
            
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-icon-box stat-blue">
                  <Package size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Products</span>
                  <span className="stat-value">{seller.products}</span>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon-box stat-green">
                  <DollarSign size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Revenue</span>
                  <span className="stat-value">${seller.totalSales?.toFixed(2)}</span>
                </div>
              </div>
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
                <span className="detail-label">Member Since</span>
                <span className="detail-value">{formatDate(seller.joinDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerDetailModal;
