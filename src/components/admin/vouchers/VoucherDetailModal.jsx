import React, { useState, useEffect } from 'react';
import { X, Tags, Calendar, Package, DollarSign, Store, Edit2, Save, XCircle, Hash, Percent, AlertCircle } from 'lucide-react';
import Toast from '../common/Toast';
import { getVoucherDetail, updateVoucher } from '../../../services/adminVoucherService';
import './VoucherDetailModal.css';

const VoucherDetailModal = ({ voucher, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voucherDetail, setVoucherDetail] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'FIXED_AMOUNT',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderValue: '',
    usageLimit: '',
    usedCount: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch voucher detail from API
  useEffect(() => {
    const fetchVoucherDetail = async () => {
      if (!voucher?.id) {
        console.error('❌ [VoucherDetailModal] No voucher ID provided');
        setToast({
          show: true,
          message: 'Invalid voucher. Missing ID.',
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('🔍 [VoucherDetailModal] Fetching detail for voucher ID:', voucher.id);
        
        const response = await getVoucherDetail(voucher.id);
        
        if (response.status === 200 && response.data) {
          console.log('✅ [VoucherDetailModal] Voucher detail loaded:', response.data);
          setVoucherDetail(response.data);
          
          // Initialize form data
          setFormData({
            code: response.data.code || '',
            description: response.data.description || '',
            discountType: response.data.discountType || 'FIXED_AMOUNT',
            discountValue: response.data.discountValue || '',
            maxDiscountAmount: response.data.maxDiscountAmount || '',
            minOrderValue: response.data.minOrderValue || '',
            usageLimit: response.data.usageLimit || '',
            usedCount: response.data.usedCount || 0,
            isActive: response.data.isActive ?? true,
            startDate: response.data.startDate ? formatDateTimeForInput(response.data.startDate) : '',
            endDate: response.data.endDate ? formatDateTimeForInput(response.data.endDate) : ''
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('❌ [VoucherDetailModal] Error fetching voucher detail:', error);
        setToast({
          show: true,
          message: 'Failed to load voucher details. Please try again.',
          type: 'error'
        });
        setLoading(false);
      }
    };

    fetchVoucherDetail();
  }, [voucher]);

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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    // Convert ISO string to datetime-local format (YYYY-MM-DDThh:mm)
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDiscount = (detail) => {
    if (!detail) return 'N/A';
    if (detail.discountType === 'PERCENTAGE') {
      return `${detail.discountValue}%`;
    }
    return formatCurrency(detail.discountValue);
  };

  const getStatusClass = (status) => {
    if (status === 'active') {
      return 'admin-voucher-status-active';
    } else {
      return 'admin-voucher-status-inactive';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Voucher code is required';
    } else if (formData.code.length > 20) {
      newErrors.code = 'Code must be maximum 20 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    }

    if (formData.discountType === 'PERCENTAGE') {
      if (parseFloat(formData.discountValue) > 100) {
        newErrors.discountValue = 'Percentage cannot exceed 100%';
      }
      if (!formData.maxDiscountAmount || parseFloat(formData.maxDiscountAmount) <= 0) {
        newErrors.maxDiscountAmount = 'Max discount amount is required for percentage type';
      }
    }

    if (formData.minOrderValue && parseFloat(formData.minOrderValue) < 0) {
      newErrors.minOrderValue = 'Minimum order value cannot be negative';
    }

    if (!formData.usageLimit || parseInt(formData.usageLimit) <= 0) {
      newErrors.usageLimit = 'Usage limit must be greater than 0';
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
    if (isEditing && voucherDetail) {
      // Reset form to original data
      setFormData({
        code: voucherDetail.code || '',
        description: voucherDetail.description || '',
        discountType: voucherDetail.discountType || 'FIXED_AMOUNT',
        discountValue: voucherDetail.discountValue || '',
        maxDiscountAmount: voucherDetail.maxDiscountAmount || '',
        minOrderValue: voucherDetail.minOrderValue || '',
        usageLimit: voucherDetail.usageLimit || '',
        usedCount: voucherDetail.usedCount || 0,
        isActive: voucherDetail.isActive ?? true,
        startDate: voucherDetail.startDate ? formatDateTimeForInput(voucherDetail.startDate) : '',
        endDate: voucherDetail.endDate ? formatDateTimeForInput(voucherDetail.endDate) : ''
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
      console.log('💾 [VoucherDetailModal] Updating voucher ID:', voucherDetail.id);
      console.log('💾 [VoucherDetailModal] Form data:', formData);
      
      // Prepare update DTO matching backend expectations
      const updateData = {
        code: formData.code.trim(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        usageLimit: parseInt(formData.usageLimit),
        usedCount: parseInt(formData.usedCount),
        isActive: formData.isActive,
        startDate: formData.startDate, // datetime-local format
        endDate: formData.endDate
      };
      
      console.log('📤 [VoucherDetailModal] Sending update data:', updateData);
      
      // Call API to update voucher (commented out for now as per requirements)
      // const response = await updateVoucher(voucherDetail.id, updateData);
      // console.log('✅ [VoucherDetailModal] Update response:', response);
      
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
              <h2 className="admin-voucher-modal-title">{loading ? 'Loading...' : voucherDetail?.code}</h2>
              <h3 className="admin-voucher-modal-subtitle">Voucher ID: {voucher.id}</h3>
            </div>
          </div>
          <div className="admin-voucher-modal-header-actions">
            {!loading && !isEditing ? (
              <button className="admin-voucher-btn-edit" onClick={handleEditToggle} title="Edit Voucher">
                <Edit2 size={18} />
                Edit
              </button>
            ) : !loading && isEditing ? (
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
            ) : null}
            <button className="admin-voucher-modal-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="admin-voucher-modal-body">
          {loading ? (
            <div className="admin-voucher-loading-state">
              <div className="admin-voucher-loading-spinner"></div>
              <p>Loading voucher details...</p>
            </div>
          ) : !voucherDetail ? (
            <div className="admin-voucher-error-state">
              <AlertCircle size={48} />
              <p>Failed to load voucher details</p>
            </div>
          ) : (
            <>
              {/* Basic Information */}
              <div className="admin-voucher-detail-section">
                <h4 className="admin-voucher-section-title">
                  <Hash size={18} />
                  Basic Information
                </h4>
                <div className="admin-voucher-detail-grid">
                  <div className="admin-voucher-detail-item">
                    <span className="admin-voucher-detail-label">Code *</span>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => handleInputChange('code', e.target.value)}
                          className={`admin-voucher-edit-input ${errors.code ? 'error' : ''}`}
                          placeholder="e.g., SUMMER2024"
                        />
                        {errors.code && <span className="admin-voucher-error-text">{errors.code}</span>}
                      </div>
                    ) : (
                      <span className="admin-voucher-detail-value admin-voucher-code-highlight">{voucherDetail.code}</span>
                    )}
                  </div>

                  <div className="admin-voucher-detail-item">
                    <span className="admin-voucher-detail-label">Status *</span>
                    {isEditing ? (
                      <select
                        value={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                        className="admin-voucher-edit-select"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      <span className={`admin-voucher-status-badge ${getStatusClass(voucherDetail.status)}`}>
                        {voucherDetail.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
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
                      <span className="admin-voucher-detail-value">{voucherDetail.description}</span>
                    )}
                  </div>

                  {voucherDetail.shopName && (
                    <div className="admin-voucher-detail-item admin-voucher-full-width">
                      <span className="admin-voucher-detail-label">
                        <Store size={16} />
                        Shop Name
                      </span>
                      <span className="admin-voucher-detail-value">{voucherDetail.shopName}</span>
                    </div>
                  )}

                  <div className="admin-voucher-detail-item">
                    <span className="admin-voucher-detail-label">Created At</span>
                    <span className="admin-voucher-detail-value">{formatDateTime(voucherDetail.createdAt)}</span>
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
                    <span className="admin-voucher-detail-label">Discount Type *</span>
                    {isEditing ? (
                      <select
                        value={formData.discountType}
                        onChange={(e) => handleInputChange('discountType', e.target.value)}
                        className="admin-voucher-edit-select"
                      >
                        <option value="FIXED_AMOUNT">Fixed Amount</option>
                        <option value="PERCENTAGE">Percentage</option>
                      </select>
                    ) : (
                      <span className="admin-voucher-detail-value">
                        {voucherDetail.discountType === 'PERCENTAGE' ? (
                          <span className="admin-voucher-type-badge"><Percent size={14} /> Percentage</span>
                        ) : (
                          <span className="admin-voucher-type-badge"><DollarSign size={14} /> Fixed Amount</span>
                        )}
                      </span>
                    )}
                  </div>
                  
                  <div className="admin-voucher-detail-item">
                    <span className="admin-voucher-detail-label">
                      Discount Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : '(VND)'}
                    </span>
                    {isEditing ? (
                      <div>
                        <input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) => handleInputChange('discountValue', e.target.value)}
                          className={`admin-voucher-edit-input ${errors.discountValue ? 'error' : ''}`}
                          placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g., 15' : 'e.g., 50000'}
                          min="0"
                          step={formData.discountType === 'PERCENTAGE' ? '0.1' : '1000'}
                        />
                        {errors.discountValue && <span className="admin-voucher-error-text">{errors.discountValue}</span>}
                      </div>
                    ) : (
                      <span className="admin-voucher-detail-value admin-voucher-highlight">
                        {formatDiscount(voucherDetail)}
                      </span>
                    )}
                  </div>

                  {(isEditing && formData.discountType === 'PERCENTAGE') || (!isEditing && voucherDetail.discountType === 'PERCENTAGE') ? (
                    <div className="admin-voucher-detail-item">
                      <span className="admin-voucher-detail-label">Max Discount Amount (VND) *</span>
                      {isEditing ? (
                        <div>
                          <input
                            type="number"
                            value={formData.maxDiscountAmount}
                            onChange={(e) => handleInputChange('maxDiscountAmount', e.target.value)}
                            className={`admin-voucher-edit-input ${errors.maxDiscountAmount ? 'error' : ''}`}
                            placeholder="e.g., 100000"
                            min="0"
                            step="1000"
                          />
                          {errors.maxDiscountAmount && <span className="admin-voucher-error-text">{errors.maxDiscountAmount}</span>}
                        </div>
                      ) : (
                        <span className="admin-voucher-detail-value">{formatCurrency(voucherDetail.maxDiscountAmount)}</span>
                      )}
                    </div>
                  ) : null}
                  
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
                      <span className="admin-voucher-detail-value">{formatCurrency(voucherDetail.minOrderValue)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Information */}
              <div className="admin-voucher-detail-section">
                <h4 className="admin-voucher-section-title">
                  <Package size={18} />
                  Usage Information
                </h4>
                <div className="admin-voucher-detail-grid">
                  <div className="admin-voucher-detail-item">
                    <span className="admin-voucher-detail-label">Usage Limit *</span>
                    {isEditing ? (
                      <div>
                        <input
                          type="number"
                          value={formData.usageLimit}
                          onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                          className={`admin-voucher-edit-input ${errors.usageLimit ? 'error' : ''}`}
                          placeholder="e.g., 100"
                          min="1"
                        />
                        {errors.usageLimit && <span className="admin-voucher-error-text">{errors.usageLimit}</span>}
                      </div>
                    ) : (
                      <span className="admin-voucher-detail-value">{voucherDetail.usageLimit}</span>
                    )}
                  </div>
                  
                  <div className="admin-voucher-detail-item">
                    <span className="admin-voucher-detail-label">Used Count</span>
                    <span className="admin-voucher-detail-value admin-voucher-used-highlight">
                      {voucherDetail.usedCount} / {voucherDetail.usageLimit}
                    </span>
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
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className={`admin-voucher-edit-input ${errors.startDate ? 'error' : ''}`}
                        />
                        {errors.startDate && <span className="admin-voucher-error-text">{errors.startDate}</span>}
                      </div>
                    ) : (
                      <span className="admin-voucher-detail-value">{formatDateTime(voucherDetail.startDate)}</span>
                    )}
                  </div>
                  
                  <div className="admin-voucher-detail-item">
                    <span className="admin-voucher-detail-label">End Date *</span>
                    {isEditing ? (
                      <div>
                        <input
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          className={`admin-voucher-edit-input ${errors.endDate ? 'error' : ''}`}
                        />
                        {errors.endDate && <span className="admin-voucher-error-text">{errors.endDate}</span>}
                      </div>
                    ) : (
                      <span className="admin-voucher-detail-value">{formatDateTime(voucherDetail.endDate)}</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && !isEditing && (
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
