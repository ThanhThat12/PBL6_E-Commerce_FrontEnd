import React, { useState, useEffect } from 'react';
import { X, Ticket, Tag, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { createVoucher } from '../../../services/adminVoucherService';
import Toast from '../common/Toast';
import './AddVoucherModal.css';

const AddVoucherModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'FIXED_AMOUNT',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderValue: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    applicableType: 'ALL'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = 'Voucher code is required';
    } else if (formData.code.length < 3 || formData.code.length > 50) {
      newErrors.code = 'Code must be between 3 and 50 characters';
    }

    // Description validation - required, max 500 chars
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    // Discount value validation
    if (!formData.discountValue) {
      newErrors.discountValue = 'Discount value is required';
    } else if (parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    } else if (formData.discountType === 'PERCENTAGE' && parseFloat(formData.discountValue) > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100';
    }

    // Max discount amount - required for PERCENTAGE
    if (formData.discountType === 'PERCENTAGE') {
      if (!formData.maxDiscountAmount) {
        newErrors.maxDiscountAmount = 'Max discount amount is required for percentage type';
      } else if (parseFloat(formData.maxDiscountAmount) <= 0) {
        newErrors.maxDiscountAmount = 'Max discount amount must be greater than 0';
      }
    }

    // Min order value validation
    if (!formData.minOrderValue) {
      newErrors.minOrderValue = 'Minimum order value is required';
    } else if (parseFloat(formData.minOrderValue) < 0) {
      newErrors.minOrderValue = 'Minimum order value cannot be negative';
    }

    // Usage limit validation
    if (!formData.usageLimit) {
      newErrors.usageLimit = 'Usage limit is required';
    } else if (parseInt(formData.usageLimit) < 1) {
      newErrors.usageLimit = 'Usage limit must be at least 1';
    }

    // Start date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    // End date validation
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('➕ [AddVoucherModal] Creating voucher with data:', formData);
      
      // Prepare create DTO matching AdminVoucherCreateDTO
      // Status will be auto-calculated by backend based on dates
      const voucherData = {
        code: formData.code.toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maxDiscountAmount: formData.discountType === 'PERCENTAGE' ? parseFloat(formData.maxDiscountAmount) : null,
        minOrderValue: parseFloat(formData.minOrderValue),
        usageLimit: parseInt(formData.usageLimit),
        startDate: formData.startDate,
        endDate: formData.endDate,
        applicableType: formData.applicableType
      };
      
      console.log('📤 [AddVoucherModal] Sending voucher data:', voucherData);
      
      // Call API to create voucher
      const response = await createVoucher(voucherData);
      console.log('✅ [AddVoucherModal] Create response:', response);
      
      setToast({
        show: true,
        message: `Voucher ${formData.code} created successfully!`,
        type: 'success'
      });
      
      // Wait a bit to show toast before closing
      setTimeout(() => {
        // Notify parent to refresh data
        if (onSubmit) {
          onSubmit(response.data);
        }
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('❌ [AddVoucherModal] Error creating voucher:', error);
      
      setToast({
        show: true,
        message: error.message || 'Failed to create voucher. Please try again.',
        type: 'error'
      });
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-voucher-modal-overlay" onClick={onClose}>
      <div className="admin-voucher-add-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-voucher-add-header">
          <div className="admin-voucher-header-content">
            <div className="admin-voucher-header-icon">
              <Ticket size={28} />
            </div>
            <div className="admin-voucher-header-text">
              <h2>Add New Voucher</h2>
              <p>Create a new discount voucher</p>
            </div>
          </div>
          <button className="admin-voucher-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="admin-voucher-add-form" onSubmit={handleSubmit}>
          <div className="admin-voucher-form-content">
            {/* Row 1: Code (full width) */}
            <div className="admin-voucher-form-group">
              <label className="admin-voucher-form-label">
                <Tag size={16} />
                Voucher Code 
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`admin-voucher-form-input ${errors.code ? 'error' : ''}`}
                maxLength={50}
              />
              {errors.code && <span className="admin-voucher-error-text">{errors.code}</span>}
            </div>

            {/* Row 2: Description (full width) */}
            <div className="admin-voucher-form-group">
              <label className="admin-voucher-form-label">
                <Ticket size={16} />
                Description 
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`admin-voucher-form-textarea ${errors.description ? 'error' : ''}`}
                rows={3}
                maxLength={500}
              />
              {errors.description && <span className="admin-voucher-error-text">{errors.description}</span>}
            </div>

            {/* Row 3: Discount Type & Applicable Type */}
            <div className="admin-voucher-form-row">
              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <DollarSign size={16} />
                  Discount Type 
                </label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="admin-voucher-form-select"
                >
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                  <option value="PERCENTAGE">Percentage</option>
                </select>
              </div>

              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <Tag size={16} />
                  Applicable Type 
                </label>
                <div className="admin-voucher-form-input" style={{ 
                  backgroundColor: '#ffffffff', 
                  color: '  #027d00ff',
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                   fontWeight: 'bold'
                }}>
                  All Customers
                </div>
              </div>
            </div>

            {/* Row 4: Discount Value & Max Discount (conditional) */}
            <div className="admin-voucher-form-row">
              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <DollarSign size={16} />
                  {formData.discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount'} 
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  className={`admin-voucher-form-input ${errors.discountValue ? 'error' : ''}`}
                  min="0"
                  step={formData.discountType === 'PERCENTAGE' ? '0.01' : '1'}
                />
                {errors.discountValue && <span className="admin-voucher-error-text">{errors.discountValue}</span>}
              </div>

              {formData.discountType === 'PERCENTAGE' && (
                <div className="admin-voucher-form-group">
                  <label className="admin-voucher-form-label">
                    <DollarSign size={16} />
                    Max Discount Amount 
                  </label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleChange}
                    className={`admin-voucher-form-input ${errors.maxDiscountAmount ? 'error' : ''}`}
                    min="0"
                    step="1"
                  />
                  {errors.maxDiscountAmount && <span className="admin-voucher-error-text">{errors.maxDiscountAmount}</span>}
                </div>
              )}

              {formData.discountType === 'FIXED_AMOUNT' && (
                <div className="admin-voucher-form-group">
                  {/* Empty placeholder to maintain grid layout */}
                </div>
              )}
            </div>

            {/* Row 5: Min Order Value & Usage Limit */}
            <div className="admin-voucher-form-row">
              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <ShoppingCart size={16} />
                  Minimum Order Value 
                </label>
                <input
                  type="number"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleChange}
                  className={`admin-voucher-form-input ${errors.minOrderValue ? 'error' : ''}`}
        
                  min="0"
                  step="1"
                />
                {errors.minOrderValue && <span className="admin-voucher-error-text">{errors.minOrderValue}</span>}
              </div>

              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <Ticket size={16} />
                  Usage Limit 
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  className={`admin-voucher-form-input ${errors.usageLimit ? 'error' : ''}`}
         
                  min="1"
                  step="1"
                />
                {errors.usageLimit && <span className="admin-voucher-error-text">{errors.usageLimit}</span>}
              </div>
            </div>

            {/* Row 6: Start Date & End Date */}
            <div className="admin-voucher-form-row">
              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <Calendar size={16} />
                  Start Date 
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`admin-voucher-form-input ${errors.startDate ? 'error' : ''}`}
                />
                {errors.startDate && <span className="admin-voucher-error-text">{errors.startDate}</span>}
              </div>

              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <Calendar size={16} />
                  End Date 
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`admin-voucher-form-input ${errors.endDate ? 'error' : ''}`}
                />
                {errors.endDate && <span className="admin-voucher-error-text">{errors.endDate}</span>}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="admin-voucher-add-footer">
            <button 
              type="button" 
              className="admin-voucher-cancel-btn" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-voucher-submit-btn"
              disabled={isSubmitting}
            >
              <Ticket size={18} />
              {isSubmitting ? 'Creating...' : 'Create Voucher'}
            </button>
          </div>
        </form>

        {/* Toast Notification */}
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      </div>
    </div>
  );
};

export default AddVoucherModal;
