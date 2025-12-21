import React, { useState, useEffect } from 'react';
import { 
  X, 
  Ticket, 
  Copy, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  Store,
  Edit2, 
  Save, 
  XCircle,
  Tag,
  CheckCircle,
  Clock,
  XOctagon
} from 'lucide-react';
import './VoucherDetailModal.css';
import { getVoucherDetail, updateVoucher } from '../../../services/adminVoucherService';
import Toast from '../common/Toast';

const VoucherDetailModal = ({ voucherId, onClose, onUpdate }) => {
  const [voucher, setVoucher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'FIXED_AMOUNT',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    status: 'ACTIVE',
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch voucher detail khi component mount
  useEffect(() => {
    if (voucherId) {
      fetchVoucherDetail();
    }
  }, [voucherId]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, onClose]);

  const fetchVoucherDetail = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 [VoucherDetailModal] Fetching voucher detail for ID:', voucherId);
      const response = await getVoucherDetail(voucherId);
      
      if (response.status === 200 && response.data) {
        const voucherData = response.data;
        console.log('✅ [VoucherDetailModal] Voucher data received:', voucherData);
        setVoucher(voucherData);
        
        // Initialize form data
        setFormData({
          code: voucherData.code || '',
          description: voucherData.description || '',
          discountType: voucherData.discountType || 'FIXED_AMOUNT',
          discountValue: voucherData.discountValue || 0,
          minOrderValue: voucherData.minOrderValue || 0,
          maxDiscountAmount: voucherData.maxDiscountAmount || 0,
          usageLimit: voucherData.usageLimit || 0,
          status: voucherData.status || 'ACTIVE',
          startDate: formatDateTimeForInput(voucherData.startDate),
          endDate: formatDateTimeForInput(voucherData.endDate)
        });
      }
    } catch (error) {
      console.error('❌ [VoucherDetailModal] Error fetching voucher detail:', error);
      setToast({
        show: true,
        message: 'Unable to load voucher information. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date từ ISO string sang datetime-local input format
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Format date để hiển thị
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Format số tiền VND
  const formatMoney = (amount) => {
    if (amount == null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Copy mã voucher
  const handleCopyCode = () => {
    if (voucher?.code) {
      navigator.clipboard.writeText(voucher.code);
      setToast({
        show: true,
        message: 'Voucher code copied!',
        type: 'success'
      });
    }
  };

  // Get status badge class và icon
  const getStatusConfig = (status) => {
    switch(status?.toUpperCase()) {
      case 'ACTIVE':
        return {
          className: 'admin-voucher-detail-status-active',
          icon: <CheckCircle size={16} />,
          text: 'Active'
        };
      case 'UPCOMING':
        return {
          className: 'admin-voucher-detail-status-upcoming',
          icon: <Clock size={16} />,
          text: 'Upcoming'
        };
      case 'EXPIRED':
        return {
          className: 'admin-voucher-detail-status-expired',
          icon: <XOctagon size={16} />,
          text: 'Expired'
        };
      case 'INACTIVE':
        return {
          className: 'admin-voucher-detail-status-inactive',
          icon: <XCircle size={16} />,
          text: 'Inactive'
        };
      default:
        return {
          className: 'admin-voucher-detail-status-inactive',
          icon: <Clock size={16} />,
          text: status || 'N/A'
        };
    }
  };

  // Get discount type display
  const getDiscountTypeDisplay = (type) => {
    return type === 'FIXED_AMOUNT' ? 'Fixed Amount' : 'Percentage';
  };

  // Get discount value display
  const getDiscountValueDisplay = (type, value) => {
    if (type === 'PERCENTAGE') {
      return `${value}%`;
    }
    return formatMoney(value);
  };

  // Get applicable type display
  const getApplicableTypeDisplay = (type) => {
    switch(type?.toUpperCase()) {
      case 'ALL':
        return 'All';
      case 'SPECIFIC_PRODUCTS':
        return 'Specific Products';
      case 'SPECIFIC_USERS':
        return 'Specific Users';
      case 'TOP_BUYERS':
        return 'Top Buyers';
      default:
        return type || 'N/A';
    }
  };

  // Calculate progress percentage
  const getUsageProgress = () => {
    if (!voucher?.usageLimit || voucher.usageLimit === 0) return 0;
    return Math.min((voucher.usedCount / voucher.usageLimit) * 100, 100);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel - reset form data
      setFormData({
        code: voucher.code || '',
        description: voucher.description || '',
        discountType: voucher.discountType || 'FIXED_AMOUNT',
        discountValue: voucher.discountValue || 0,
        minOrderValue: voucher.minOrderValue || 0,
        maxDiscountAmount: voucher.maxDiscountAmount || 0,
        usageLimit: voucher.usageLimit || 0,
        status: voucher.status || 'ACTIVE',
        startDate: formatDateTimeForInput(voucher.startDate),
        endDate: formatDateTimeForInput(voucher.endDate)
      });
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Voucher code is required';
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    }

    if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100%';
    }

    if (formData.discountType === 'PERCENTAGE') {
      if (!formData.maxDiscountAmount || formData.maxDiscountAmount <= 0) {
        newErrors.maxDiscountAmount = 'Max discount amount is required for percentage type';
      }
    }

    if (!formData.minOrderValue || formData.minOrderValue < 0) {
      newErrors.minOrderValue = 'Invalid minimum order value';
    }

    if (!formData.usageLimit || formData.usageLimit <= 0) {
      newErrors.usageLimit = 'Usage limit must be greater than 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 [VoucherDetailModal] Updating voucher ID:', voucher.id);
      console.log('💾 [VoucherDetailModal] Form data:', formData);
      
      // Prepare update DTO matching AdminVoucherUpdateDTO
      const updateData = {
        code: formData.code.toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maxDiscountAmount: formData.discountType === 'PERCENTAGE' ? parseFloat(formData.maxDiscountAmount) : null,
        minOrderValue: parseFloat(formData.minOrderValue),
        usageLimit: parseInt(formData.usageLimit),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status
      };
      
      console.log('📤 [VoucherDetailModal] Sending update data:', updateData);
      
      // Call API to update voucher
      const response = await updateVoucher(voucher.id, updateData);
      console.log('✅ [VoucherDetailModal] Update response:', response);
      
      // Update local voucher state with response data
      if (response.status === 200 && response.data) {
        setVoucher(response.data);
        
        // Update form data to match response
        setFormData({
          code: response.data.code || '',
          description: response.data.description || '',
          discountType: response.data.discountType || 'FIXED_AMOUNT',
          discountValue: response.data.discountValue || 0,
          minOrderValue: response.data.minOrderValue || 0,
          maxDiscountAmount: response.data.maxDiscountAmount || 0,
          usageLimit: response.data.usageLimit || 0,
          status: response.data.status || 'ACTIVE',
          startDate: formatDateTimeForInput(response.data.startDate),
          endDate: formatDateTimeForInput(response.data.endDate)
        });
      }
      
      setToast({
        show: true,
        message: `Voucher ${formData.code} updated successfully!`,
        type: 'success'
      });
      
      setIsEditing(false);
      
      // Notify parent component to refresh list
      if (onUpdate) {
        onUpdate(response.data);
      }
      
    } catch (error) {
      console.error('❌ [VoucherDetailModal] Error saving voucher:', error);
      setToast({
        show: true,
        message: error.message || 'Error saving voucher. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <div className="admin-voucher-detail-modal-overlay" onClick={onClose} />
        <div className="admin-voucher-detail-modal">
          <div className="admin-voucher-detail-loading">
            <div className="admin-voucher-detail-spinner"></div>
            <p>Loading voucher information...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (!voucher) {
    return (
      <>
        <div className="admin-voucher-detail-modal-overlay" onClick={onClose} />
        <div className="admin-voucher-detail-modal">
          <div className="admin-voucher-detail-error">
            <XOctagon size={48} color="#ef4444" />
            <h3>Voucher not found</h3>
            <p>Voucher ID: {voucherId}</p>
            <button className="admin-voucher-detail-btn-close-error" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </>
    );
  }

  const statusConfig = getStatusConfig(isEditing ? formData.status : voucher.status);
  const usageProgress = getUsageProgress();

  return (
    <>
      {/* Overlay */}
      <div className="admin-voucher-detail-modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="admin-voucher-detail-modal">
        {/* Header */}
        <div className="admin-voucher-detail-modal-header">
          <div className="admin-voucher-detail-modal-header-content">
            <div className="admin-voucher-detail-modal-icon">
              <Ticket size={32} />
            </div>
            <div>
              <div className="admin-voucher-detail-code-section">
                {isEditing ? (
                  <input
                    type="text"
                    className={`admin-voucher-detail-input-code ${errors.code ? 'admin-voucher-detail-input-error' : ''}`}
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="Enter voucher code"
                  />
                ) : (
                  <>
                    <h2 className="admin-voucher-detail-modal-title">{voucher.code}</h2>
                    <button 
                      className="admin-voucher-detail-btn-copy" 
                      onClick={handleCopyCode}
                      title="Copy voucher code"
                    >
                      <Copy size={16} />
                    </button>
                  </>
                )}
              </div>
              {errors.code && <span className="admin-voucher-detail-error-message">{errors.code}</span>}
              <p className="admin-voucher-detail-modal-subtitle">Voucher ID: #{voucher.id}</p>
            </div>
          </div>
          <div className="admin-voucher-detail-modal-header-actions">
            {!isEditing ? (
              <button className="admin-voucher-detail-btn-edit" onClick={handleEditToggle} title="Edit">
                <Edit2 size={18} />
                Edit
              </button>
            ) : (
              <>
                <button className="admin-voucher-detail-btn-cancel" onClick={handleEditToggle} title="Cancel (ESC)">
                  <XCircle size={18} />
                  Cancel
                </button>
                <button 
                  className="admin-voucher-detail-btn-save" 
                  onClick={handleSave}
                  disabled={isSaving}
                  title="Save changes"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button className="admin-voucher-detail-modal-close-btn" onClick={onClose} title="Close (ESC)">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="admin-voucher-detail-modal-body">
          {/* Status Badge */}
          <div className="admin-voucher-detail-section">
            <div className="admin-voucher-detail-row">
              <span className="admin-voucher-detail-label">Status</span>
              {isEditing ? (
                <select
                  className="admin-voucher-detail-status-select"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              ) : (
                <span className={`admin-voucher-detail-status-badge ${statusConfig.className}`}>
                  {statusConfig.icon}
                  {statusConfig.text}
                </span>
              )}
            </div>
          </div>

          {/* Applicable Type */}
          <div className="admin-voucher-detail-section">
            <h3 className="admin-voucher-detail-section-title">
              <Tag size={18} />
              Applicable To
            </h3>
            
            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-icon">
                <Tag size={18} />
              </div>
              <div className="admin-voucher-detail-content">
                <span className="admin-voucher-detail-label">Applicable Type</span>
                <span className="admin-voucher-detail-value admin-voucher-detail-value-highlight">
                  {getApplicableTypeDisplay(voucher.applicableType)}
                </span>
              </div>
            </div>
          </div>

          {/* Shop Information */}
          <div className="admin-voucher-detail-section">
            <h3 className="admin-voucher-detail-section-title">
              <Store size={18} />
              Shop Information
            </h3>
            
            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-icon">
                <Store size={18} />
              </div>
              <div className="admin-voucher-detail-content">
                <span className="admin-voucher-detail-label">Shop Name</span>
                <span className="admin-voucher-detail-value">
                  {voucher.shop?.name || 'Platform Voucher'}
                </span>
              </div>
            </div>

            {voucher.shop?.id && (
              <div className="admin-voucher-detail-row">
                <div className="admin-voucher-detail-icon">
                  <Tag size={18} />
                </div>
                <div className="admin-voucher-detail-content">
                  <span className="admin-voucher-detail-label">Shop ID</span>
                  <span className="admin-voucher-detail-value">#{voucher.shop.id}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="admin-voucher-detail-section">
            <h3 className="admin-voucher-detail-section-title">
              <Ticket size={18} />
              Description
            </h3>
            
            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-content admin-voucher-detail-full-width">
                {isEditing ? (
                  <textarea
                    className="admin-voucher-detail-textarea"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter voucher description"
                    rows="4"
                  />
                ) : (
                  <p className="admin-voucher-detail-description">
                    {voucher.description || 'No description available'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Discount Information */}
          <div className="admin-voucher-detail-section">
            <h3 className="admin-voucher-detail-section-title">
              <DollarSign size={18} />
              Discount Information
            </h3>
            
            {/* Discount Type */}
            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-icon">
                <Tag size={18} />
              </div>
              <div className="admin-voucher-detail-content">
                <span className="admin-voucher-detail-label">Discount Type</span>
                {isEditing ? (
                  <select
                    className="admin-voucher-detail-input"
                    value={formData.discountType}
                    onChange={(e) => handleInputChange('discountType', e.target.value)}
                  >
                    <option value="FIXED_AMOUNT">Fixed Amount</option>
                    <option value="PERCENTAGE">Percentage</option>
                  </select>
                ) : (
                  <span className="admin-voucher-detail-value">
                    {getDiscountTypeDisplay(voucher.discountType)}
                  </span>
                )}
              </div>
            </div>

            {/* Discount Value */}
            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-icon">
                <DollarSign size={18} />
              </div>
              <div className="admin-voucher-detail-content">
                <span className="admin-voucher-detail-label">Discount Value</span>
                {isEditing ? (
                  <div className="admin-voucher-detail-input-wrapper">
                    <input
                      type="number"
                      className={`admin-voucher-detail-input ${errors.discountValue ? 'admin-voucher-detail-input-error' : ''}`}
                      value={formData.discountValue}
                      onChange={(e) => handleInputChange('discountValue', Number(e.target.value))}
                      placeholder={formData.discountType === 'PERCENTAGE' ? 'Enter percentage' : 'Enter amount'}
                      min="0"
                      max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                    />
                    {errors.discountValue && <span className="admin-voucher-detail-error-message">{errors.discountValue}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value admin-voucher-detail-value-highlight">
                    {getDiscountValueDisplay(voucher.discountType, voucher.discountValue)}
                  </span>
                )}
              </div>
            </div>

            {/* Min Order Value */}
            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-icon">
                <ShoppingCart size={18} />
              </div>
              <div className="admin-voucher-detail-content">
                <span className="admin-voucher-detail-label">Minimum Order Value</span>
                {isEditing ? (
                  <div className="admin-voucher-detail-input-wrapper">
                    <input
                      type="number"
                      className={`admin-voucher-detail-input ${errors.minOrderValue ? 'admin-voucher-detail-input-error' : ''}`}
                      value={formData.minOrderValue}
                      onChange={(e) => handleInputChange('minOrderValue', Number(e.target.value))}
                      placeholder="Enter minimum order value"
                      min="0"
                    />
                    {errors.minOrderValue && <span className="admin-voucher-detail-error-message">{errors.minOrderValue}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value">{formatMoney(voucher.minOrderValue)}</span>
                )}
              </div>
            </div>

            {/* Max Discount Amount - Only for PERCENTAGE */}
            {(isEditing ? formData.discountType === 'PERCENTAGE' : voucher.discountType === 'PERCENTAGE') && (
              <div className="admin-voucher-detail-row">
                <div className="admin-voucher-detail-icon">
                  <DollarSign size={18} />
                </div>
                <div className="admin-voucher-detail-content">
                  <span className="admin-voucher-detail-label">Maximum Discount Amount</span>
                  {isEditing ? (
                    <div className="admin-voucher-detail-input-wrapper">
                      <input
                        type="number"
                        className={`admin-voucher-detail-input ${errors.maxDiscountAmount ? 'admin-voucher-detail-input-error' : ''}`}
                        value={formData.maxDiscountAmount}
                        onChange={(e) => handleInputChange('maxDiscountAmount', Number(e.target.value))}
                        placeholder="Enter maximum discount amount"
                        min="0"
                      />
                      {errors.maxDiscountAmount && <span className="admin-voucher-detail-error-message">{errors.maxDiscountAmount}</span>}
                    </div>
                  ) : (
                    <span className="admin-voucher-detail-value">{formatMoney(voucher.maxDiscountAmount)}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Usage Statistics */}
          <div className="admin-voucher-detail-section">
            <h3 className="admin-voucher-detail-section-title">
              <Ticket size={18} />
              Usage Statistics
            </h3>
            
            {/* Usage Limit */}
            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-content admin-voucher-detail-full-width">
                <span className="admin-voucher-detail-label">Usage Limit</span>
                {isEditing ? (
                  <div className="admin-voucher-detail-input-wrapper">
                    <input
                      type="number"
                      className={`admin-voucher-detail-input ${errors.usageLimit ? 'admin-voucher-detail-input-error' : ''}`}
                      value={formData.usageLimit}
                      onChange={(e) => handleInputChange('usageLimit', Number(e.target.value))}
                      placeholder="Enter usage limit"
                      min="1"
                    />
                    {errors.usageLimit && <span className="admin-voucher-detail-error-message">{errors.usageLimit}</span>}
                  </div>
                ) : (
                  <div className="admin-voucher-detail-usage-info">
                    <div className="admin-voucher-detail-usage-stats">
                      <span className="admin-voucher-detail-usage-text">
                        Used: <strong>{voucher.usedCount}</strong> / {voucher.usageLimit}
                      </span>
                      <span className="admin-voucher-detail-usage-text">
                        Remaining: <strong className="admin-voucher-detail-remaining">{voucher.remainingUses}</strong>
                      </span>
                    </div>
                    <div className="admin-voucher-detail-progress-bar">
                      <div 
                        className="admin-voucher-detail-progress-fill"
                        style={{ width: `${usageProgress}%` }}
                      ></div>
                    </div>
                    <span className="admin-voucher-detail-progress-percent">{usageProgress.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="admin-voucher-detail-section">
            <h3 className="admin-voucher-detail-section-title">
              <Calendar size={18} />
              Validity Period
            </h3>
            
            {/* Start Date */}
            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-icon">
                <Calendar size={18} />
              </div>
              <div className="admin-voucher-detail-content">
                <span className="admin-voucher-detail-label">Start Date</span>
                {isEditing ? (
                  <div className="admin-voucher-detail-input-wrapper">
                    <input
                      type="datetime-local"
                      className={`admin-voucher-detail-input ${errors.startDate ? 'admin-voucher-detail-input-error' : ''}`}
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                    {errors.startDate && <span className="admin-voucher-detail-error-message">{errors.startDate}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value">{formatDateTime(voucher.startDate)}</span>
                )}
              </div>
            </div>

            {/* End Date */}
            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-icon">
                <Calendar size={18} />
              </div>
              <div className="admin-voucher-detail-content">
                <span className="admin-voucher-detail-label">End Date</span>
                {isEditing ? (
                  <div className="admin-voucher-detail-input-wrapper">
                    <input
                      type="datetime-local"
                      className={`admin-voucher-detail-input ${errors.endDate ? 'admin-voucher-detail-input-error' : ''}`}
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                    {errors.endDate && <span className="admin-voucher-detail-error-message">{errors.endDate}</span>}
                  </div>
                ) : (
                  <span className="admin-voucher-detail-value">{formatDateTime(voucher.endDate)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="admin-voucher-detail-section">
            <h3 className="admin-voucher-detail-section-title">
              <Clock size={18} />
              Additional Information
            </h3>
            
            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-icon">
                <Calendar size={18} />
              </div>
              <div className="admin-voucher-detail-content">
                <span className="admin-voucher-detail-label">Created At</span>
                <span className="admin-voucher-detail-value">{formatDateTime(voucher.createdAt)}</span>
              </div>
            </div>

            <div className="admin-voucher-detail-row">
              <div className="admin-voucher-detail-icon">
                <Calendar size={18} />
              </div>
              <div className="admin-voucher-detail-content">
                <span className="admin-voucher-detail-label">Last Updated</span>
                <span className="admin-voucher-detail-value">{formatDateTime(voucher.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
      />
    </>
  );
};

export default VoucherDetailModal;
