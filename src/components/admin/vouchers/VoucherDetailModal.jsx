import React, { useState, useEffect } from 'react';
import { X, Tags, Calendar, Package, DollarSign, Store, Edit2, Save, XCircle, Hash } from 'lucide-react';
import Toast from '../common/Toast';
import { updateVoucher } from '../../../services/adminVoucherService';
import './VoucherDetailModal.css';

const VoucherDetailModal = ({ voucher, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: voucher?.code || '',
    description: voucher?.description || '',
    discountAmount: voucher?.discountAmount || '',
    minOrderValue: voucher?.minOrderValue || '',
    quantity: voucher?.quantity || '',
    startDate: voucher?.startDate || '',
    endDate: voucher?.endDate || '',
    status: voucher?.status || 'ACTIVE'
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Add ESC key listener
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (isEditing) {
          handleEditToggle();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isEditing, onClose]);

  if (!voucher) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDiscount = () => {
    if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountAmount}%`;
    }
    return formatCurrency(voucher.discountAmount);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'admin-voucher-status-active';
      case 'EXPIRED':
        return 'admin-voucher-status-expired';
      case 'INACTIVE':
        return 'admin-voucher-status-inactive';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Voucher code is required';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Code must be maximum 10 characters';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters and numbers';
    }

    // Description is optional

    if (!formData.discountAmount && formData.discountAmount !== 0) {
      newErrors.discountAmount = 'Discount amount is required';
    } else if (parseInt(formData.discountAmount) < 0) {
      newErrors.discountAmount = 'Discount amount must be at least 0';
    } else if (!Number.isInteger(Number(formData.discountAmount))) {
      newErrors.discountAmount = 'Discount amount must be a whole number';
    }

    if (formData.minOrderValue && parseInt(formData.minOrderValue) < 0) {
      newErrors.minOrderValue = 'Minimum order value must be at least 0';
    } else if (formData.minOrderValue && !Number.isInteger(Number(formData.minOrderValue))) {
      newErrors.minOrderValue = 'Minimum order value must be a whole number';
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
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
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({
        code: voucher.code || '',
        description: voucher.description || '',
        discountAmount: voucher.discountAmount || '',
        minOrderValue: voucher.minOrderValue || '',
        quantity: voucher.quantity || '',
        startDate: voucher.startDate || '',
        endDate: voucher.endDate || '',
        status: voucher.status || 'ACTIVE'
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
      console.log('💾 [VoucherDetailModal] Updating voucher ID:', voucher.id);
      console.log('💾 [VoucherDetailModal] Form data:', formData);
      
      // Prepare update DTO
      const updateData = {
        code: formData.code.toUpperCase(), // Ensure uppercase
        description: formData.description?.trim() || null, // Có thể null
        discountAmount: parseInt(formData.discountAmount),
        minOrderValue: formData.minOrderValue ? parseInt(formData.minOrderValue) : 0,
        quantity: parseInt(formData.quantity),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status
      };
      
      // Call API to update voucher
      const response = await updateVoucher(voucher.id, updateData);
      console.log('✅ [VoucherDetailModal] Update response:', response);
      
      setIsEditing(false);
      
      setToast({
        show: true,
        message: 'Voucher information updated successfully!',
        type: 'success'
      });
      
      // Notify parent to refresh data
      if (onUpdate) {
        onUpdate();
      }
      
      setIsSaving(false);
      
    } catch (error) {
      console.error('❌ [VoucherDetailModal] Error updating voucher:', error);
      
      setToast({
        show: true,
        message: error.message || 'Failed to update voucher information. Please try again.',
        type: 'error'
      });
      
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-voucher-modal-overlay" onClick={onClose}>
      <div className="admin-voucher-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-voucher-modal-header">
          <div className="admin-voucher-modal-header-content">
            <div className="admin-voucher-modal-avatar">
              <Tags size={32} />
            </div>
            <div>
              <h2 className="admin-voucher-modal-title">{voucher.code}</h2>
              <p className="admin-voucher-modal-subtitle">Voucher ID: #{voucher.id}</p>
            </div>
          </div>
          <div className="admin-voucher-modal-header-actions">
            {!isEditing ? (
              <button className="admin-voucher-btn-edit" onClick={handleEditToggle} title="Edit Voucher">
                <Edit2 size={18} />
                Edit
              </button>
            ) : (
              <>
                <button className="admin-voucher-btn-cancel" onClick={handleEditToggle} title="Cancel (ESC)">
                  <XCircle size={18} />
                  Cancel
                </button>
                <button 
                  className="admin-voucher-btn-save" 
                  onClick={handleSave}
                  disabled={isSaving}
                  title="Save Changes"
                >
                  {isSaving ? (
                    <>
                      <div className="admin-voucher-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save
                    </>
                  )}
                </button>
              </>
            )}
            <button className="admin-voucher-modal-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="admin-voucher-modal-body">
          {/* Basic Information */}
          <div className="admin-voucher-detail-section">
            <h4 className="admin-voucher-section-title">
              <Hash size={18} />
              Basic Information
            </h4>
            <div className="admin-voucher-detail-grid">
              <div className="admin-voucher-detail-item">
                <span className="admin-voucher-detail-label">ID</span>
                <span className="admin-voucher-detail-value">#{voucher.id}</span>
              </div>
              
              <div className="admin-voucher-detail-item">
                <span className="admin-voucher-detail-label">Code *</span>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      className={`admin-voucher-edit-input ${errors.code ? 'error' : ''}`}
                      placeholder="e.g., SUMMER2024"
                    />
                    {errors.code && <span className="admin-voucher-error-text">{errors.code}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value admin-voucher-code-highlight">{voucher.code}</span>
                )}
              </div>

              <div className="admin-voucher-detail-item admin-voucher-full-width">
                <span className="admin-voucher-detail-label">Description *</span>
                {isEditing ? (
                  <div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={`admin-voucher-edit-textarea ${errors.description ? 'error' : ''}`}
                      placeholder="Enter voucher description..."
                      rows="3"
                    />
                    {errors.description && <span className="admin-voucher-error-text">{errors.description}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value">{voucher.description}</span>
                )}
              </div>

              {voucher.shopName && (
                <div className="admin-voucher-detail-item">
                  <span className="admin-voucher-detail-label">
                    <Store size={16} />
                    Shop Name
                  </span>
                  <span className="admin-voucher-detail-value">{voucher.shopName}</span>
                </div>
              )}

              <div className="admin-voucher-detail-item">
                <span className="admin-voucher-detail-label">Status *</span>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="admin-voucher-edit-select"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                ) : (
                  <span className={`admin-voucher-status-badge ${getStatusClass(voucher.status)}`}>
                    {voucher.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Discount Information */}
          <div className="admin-voucher-detail-section">
            <h4 className="admin-voucher-section-title">
              <DollarSign size={18} />
              Discount Information
            </h4>
            <div className="admin-voucher-detail-grid">
              <div className="admin-voucher-detail-item">
                <span className="admin-voucher-detail-label">Discount Amount (VND) *</span>
                {isEditing ? (
                  <div>
                    <input
                      type="number"
                      value={formData.discountAmount}
                      onChange={(e) => handleInputChange('discountAmount', e.target.value)}
                      className={`admin-voucher-edit-input ${errors.discountAmount ? 'error' : ''}`}
                      placeholder="e.g., 50000"
                      min="0"
                      step="1000"
                    />
                    {errors.discountAmount && <span className="admin-voucher-error-text">{errors.discountAmount}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value admin-voucher-highlight">{formatCurrency(voucher.discountAmount)}</span>
                )}
              </div>
              
              <div className="admin-voucher-detail-item">
                <span className="admin-voucher-detail-label">Min Order Value (VND) *</span>
                {isEditing ? (
                  <div>
                    <input
                      type="number"
                      value={formData.minOrderValue}
                      onChange={(e) => handleInputChange('minOrderValue', e.target.value)}
                      className={`admin-voucher-edit-input ${errors.minOrderValue ? 'error' : ''}`}
                      placeholder="e.g., 100000"
                      min="0"
                      step="1000"
                    />
                    {errors.minOrderValue && <span className="admin-voucher-error-text">{errors.minOrderValue}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value">{formatCurrency(voucher.minOrderValue)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Information */}
          <div className="admin-voucher-detail-section">
            <h4 className="admin-voucher-section-title">
              <Package size={18} />
              Quantity Information
            </h4>
            <div className="admin-voucher-detail-grid">
              <div className="admin-voucher-detail-item">
                <span className="admin-voucher-detail-label">Total Quantity *</span>
                {isEditing ? (
                  <div>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className={`admin-voucher-edit-input ${errors.quantity ? 'error' : ''}`}
                      placeholder="e.g., 100"
                      min="1"
                    />
                    {errors.quantity && <span className="admin-voucher-error-text">{errors.quantity}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value">{voucher.quantity}</span>
                )}
              </div>
              
              <div className="admin-voucher-detail-item">
                <span className="admin-voucher-detail-label">Used</span>
                <span className="admin-voucher-detail-value">{voucher.usedCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="admin-voucher-detail-section">
            <h4 className="admin-voucher-section-title">
              <Calendar size={18} />
              Validity Period
            </h4>
            <div className="admin-voucher-detail-grid">
              <div className="admin-voucher-detail-item">
                <span className="admin-voucher-detail-label">Start Date *</span>
                {isEditing ? (
                  <div>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={`admin-voucher-edit-input ${errors.startDate ? 'error' : ''}`}
                    />
                    {errors.startDate && <span className="admin-voucher-error-text">{errors.startDate}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value">{formatDate(voucher.startDate)}</span>
                )}
              </div>
              
              <div className="admin-voucher-detail-item">
                <span className="admin-voucher-detail-label">End Date *</span>
                {isEditing ? (
                  <div>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={`admin-voucher-edit-input ${errors.endDate ? 'error' : ''}`}
                    />
                    {errors.endDate && <span className="admin-voucher-error-text">{errors.endDate}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value">{formatDate(voucher.endDate)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!isEditing && (
          <div className="admin-voucher-modal-footer">
            <button className="admin-voucher-modal-btn admin-voucher-close-btn-footer" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
      />
    </div>
  );
};

export default VoucherDetailModal;
