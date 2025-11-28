import React, { useState, useEffect } from 'react';
import { X, Ticket, Tag, DollarSign, ShoppingCart, Package, Calendar } from 'lucide-react';
import { createVoucher } from '../../../services/adminVoucherService';
import Toast from '../common/Toast';
import './AddVoucherModal.css';

const AddVoucherModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountAmount: '',
    discountType: 'PERCENTAGE',
    minOrderValue: '',
    quantity: '',
    startDate: '',
    endDate: ''
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

    // Code validation - uppercase + numbers only, max 10 characters
    if (!formData.code.trim()) {
      newErrors.code = 'Voucher code is required';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Code must be maximum 10 characters';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters and numbers';
    }

    // Description validation - optional (can be empty)

    // Discount amount validation - must be >= 0 (integer)
    if (!formData.discountAmount && formData.discountAmount !== 0) {
      newErrors.discountAmount = 'Discount amount is required';
    } else if (parseInt(formData.discountAmount) < 0) {
      newErrors.discountAmount = 'Discount amount must be at least 0';
    } else if (!Number.isInteger(Number(formData.discountAmount))) {
      newErrors.discountAmount = 'Discount amount must be a whole number';
    }

    // Min order value validation - must be >= 0 (integer)
    if (formData.minOrderValue && parseInt(formData.minOrderValue) < 0) {
      newErrors.minOrderValue = 'Minimum order value must be at least 0';
    } else if (formData.minOrderValue && !Number.isInteger(Number(formData.minOrderValue))) {
      newErrors.minOrderValue = 'Minimum order value must be a whole number';
    }

    // Quantity validation
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
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
      
      // Prepare create DTO
      const voucherData = {
        code: formData.code.toUpperCase(), // Ensure uppercase
        description: formData.description.trim() || null, // Có thể null
        discountAmount: parseInt(formData.discountAmount),
        minOrderValue: formData.minOrderValue ? parseInt(formData.minOrderValue) : 0,
        quantity: parseInt(formData.quantity),
        startDate: formData.startDate,
        endDate: formData.endDate
      };
      
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
          onSubmit(formData.code);
        }
        onClose();
      }, 1000);
      
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
            {/* Voucher Code */}
            <div className="admin-voucher-form-group">
              <label className="admin-voucher-form-label">
                <Tag size={18} />
                Voucher Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`admin-voucher-form-input ${errors.code ? 'error' : ''}`}
                style={{ textTransform: 'uppercase' }}
                maxLength={10}
                placeholder="e.g. SALE2024"
              />
              {errors.code && <span className="admin-voucher-error-text">{errors.code}</span>}
            </div>

            {/* Description */}
            <div className="admin-voucher-form-group">
              <label className="admin-voucher-form-label">
                <Ticket size={18} />
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`admin-voucher-form-textarea ${errors.description ? 'error' : ''}`}
                rows="3"
                placeholder="Enter voucher description..."
              />
              {errors.description && <span className="admin-voucher-error-text">{errors.description}</span>}
            </div>

            {/* Discount Type and Amount */}
            <div className="admin-voucher-form-row">

              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <DollarSign size={18} />
                  Discount Amount (VND) *
                </label>
                <input
                  type="number"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleChange}
                  className={`admin-voucher-form-input ${errors.discountAmount ? 'error' : ''}`}
                  min="0"
                  step="1"
                  placeholder="0"
                />
                {errors.discountAmount && <span className="admin-voucher-error-text">{errors.discountAmount}</span>}
              </div>

              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <ShoppingCart size={18} />
                  Min Order Value (VND)
                </label>
                <input
                  type="number"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleChange}
                  className={`admin-voucher-form-input ${errors.minOrderValue ? 'error' : ''}`}
                  min="0"
                  step="1"
                  placeholder="0"
                />
                {errors.minOrderValue && <span className="admin-voucher-error-text">{errors.minOrderValue}</span>}
              </div>
            </div>

            {/*Quantity */}
            <div className="admin-voucher-form-row">
              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <Package size={18} />
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`admin-voucher-form-input ${errors.quantity ? 'error' : ''}`}
                  min="1"
                />
                {errors.quantity && <span className="admin-voucher-error-text">{errors.quantity}</span>}
              </div>
            </div>

            {/* Start Date and End Date */}
            <div className="admin-voucher-form-row">
              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <Calendar size={18} />
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`admin-voucher-form-input ${errors.startDate ? 'error' : ''}`}
                />
                {errors.startDate && <span className="admin-voucher-error-text">{errors.startDate}</span>}
              </div>

              <div className="admin-voucher-form-group">
                <label className="admin-voucher-form-label">
                  <Calendar size={18} />
                  End Date *
                </label>
                <input
                  type="date"
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
