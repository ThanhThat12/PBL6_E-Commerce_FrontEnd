import React, { useState, useEffect } from 'react';
import { X, Layers, FileText, Save, XCircle } from 'lucide-react';
import './CategoryModal.css';

const CategoryModal = ({ category, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    name: category?.name || ''
  });
  const [errors, setErrors] = useState({});

  // ESC key listener
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (value) => {
    setFormData({ name: value });
    // Clear error when user types
    if (errors.name) {
      setErrors({});
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  return (
    <>
      {/* Overlay */}
      <div className="admin-category-modal-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="admin-category-modal">
        {/* Header */}
        <div className="admin-category-modal-header">
          <div className="admin-category-modal-header-content">
            <div className="admin-category-modal-avatar">
              <Layers size={28} />
            </div>
            <div>
              <h2 className="admin-category-modal-title">
                {category ? 'Edit Category' : 'Add New Category'}
              </h2>
              <p className="admin-category-modal-subtitle">
                {category ? 'Update category information' : 'Create a new product category'}
              </p>
            </div>
          </div>
          <button className="admin-category-modal-close-btn" onClick={onClose} title="Close (ESC)">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="admin-category-modal-body">
          {/* Category Name */}
          <div className="admin-category-form-group">
            <label className="admin-category-form-label">
              Category Name <span className="admin-category-required">*</span>
            </label>
            <input
              type="text"
              className={`admin-category-form-input ${errors.name ? 'admin-category-input-error' : ''}`}
              placeholder="e.g., Electronics, Fashion, Furniture"
              value={formData.name}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            {errors.name && <span className="admin-category-error-message">{errors.name}</span>}
          </div>

          {/* Footer Actions */}
          <div className="admin-category-modal-footer">
            <button 
              type="button" 
              className="admin-category-btn-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              <XCircle size={18} />
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-category-btn-save"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CategoryModal;
