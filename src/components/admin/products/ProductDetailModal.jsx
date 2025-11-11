import React, { useState, useEffect } from 'react';
import { X, Package, Store, Tag, DollarSign, Box, TrendingUp, Calendar, FileText, Edit2, Save, XCircle, Layers, Star } from 'lucide-react';
import './ProductDetailModal.css';

const ProductDetailModal = ({ product, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    productName: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    status: product?.status || 'Active'
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

  if (!product) return null;

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
      case 'Out of Stock': return 'status-out-of-stock';
      default: return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate product name
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    // Validate SKU
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    // Validate category
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    // Validate price
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    // Validate stock
    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
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
        productName: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        status: product.status || 'Active'
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
      // Call API to update product
      await onUpdate(product.id, formData);
      
      setIsEditing(false);
      alert('Product information updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="product-detail-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-avatar">
              <Package size={32} />
            </div>
            <div>
              <h2 className="modal-title">{product.name}</h2>
              <p className="modal-subtitle">Product ID: {product.id}</p>
            </div>
          </div>
          <div className="modal-header-actions">
            {!isEditing ? (
              <button className="btn-edit" onClick={handleEditToggle} title="Edit Product">
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              ) : (
                <span className={`status-badge ${getStatusClass(product.status)}`}>
                  <span className="status-dot">●</span>
                  {product.status}
                </span>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="detail-section">
            <h3 className="section-title">Product Information</h3>
            
            {/* Shop Name */}
            <div className="detail-row">
              <div className="detail-icon">
                <Store size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Shop Name</span>
                <span className="detail-value">{product.shopName || 'N/A'}</span>
              </div>
            </div>

            {/* Product Name */}
            <div className="detail-row">
              <div className="detail-icon">
                <Package size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Product Name</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className={`detail-input ${errors.productName ? 'input-error' : ''}`}
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      placeholder="Enter product name"
                    />
                    {errors.productName && <span className="error-message">{errors.productName}</span>}
                  </div>
                ) : (
                  <span className="detail-value">{product.name}</span>
                )}
              </div>
            </div>

            {/* SKU */}
            <div className="detail-row">
              <div className="detail-icon">
                <Tag size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">SKU</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className={`detail-input ${errors.sku ? 'input-error' : ''}`}
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Enter SKU"
                    />
                    {errors.sku && <span className="error-message">{errors.sku}</span>}
                  </div>
                ) : (
                  <span className="detail-value">{product.sku}</span>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="detail-row">
              <div className="detail-icon">
                <Layers size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Category</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className={`detail-input ${errors.category ? 'input-error' : ''}`}
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="Enter category"
                    />
                    {errors.category && <span className="error-message">{errors.category}</span>}
                  </div>
                ) : (
                  <span className="detail-value">{product.category}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="detail-row">
              <div className="detail-icon">
                <FileText size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Description</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <textarea
                      className="detail-textarea"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter product description"
                      rows="3"
                    />
                  </div>
                ) : (
                  <span className="detail-value">{product.description || 'No description provided'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="detail-section">
            <h3 className="section-title">Pricing & Inventory</h3>
            
            {/* Price */}
            <div className="detail-row">
              <div className="detail-icon">
                <DollarSign size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Price</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      type="number"
                      className={`detail-input ${errors.price ? 'input-error' : ''}`}
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="Enter price"
                      step="0.01"
                      min="0"
                    />
                    {errors.price && <span className="error-message">{errors.price}</span>}
                  </div>
                ) : (
                  <span className="detail-value">${product.price?.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="detail-row">
              <div className="detail-icon">
                <Box size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Stock</span>
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      type="number"
                      className={`detail-input ${errors.stock ? 'input-error' : ''}`}
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                      placeholder="Enter stock quantity"
                      min="0"
                    />
                    {errors.stock && <span className="error-message">{errors.stock}</span>}
                  </div>
                ) : (
                  <span className="detail-value">{product.stock} units</span>
                )}
              </div>
            </div>
          </div>

          {/* Performance Statistics */}
          <div className="detail-section">
            <h3 className="section-title">Performance Statistics</h3>
            
            <div className="stats-grid stats-grid-three">
              <div className="stat-box">
                <div className="stat-icon-box stat-blue">
                  <TrendingUp size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Sales</span>
                  <span className="stat-value">{product.sales?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon-box stat-green">
                  <DollarSign size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Revenue</span>
                  <span className="stat-value">${((product.sales || 0) * (product.price || 0)).toFixed(2)}</span>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-icon-box stat-yellow">
                  <Star size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Rating</span>
                  <span className="stat-value">
                    {product.rating?.toFixed(1) || '0.0'}
                    <span className="rating-stars">★★★★★</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product History */}
          <div className="detail-section">
            <h3 className="section-title">Product History</h3>
            
            <div className="detail-row">
              <div className="detail-icon">
                <Calendar size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Created Date</span>
                <span className="detail-value">{formatDate(product.dateAdded)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailModal;
