import React, { useState, useEffect } from 'react';
import { X, Layers, FileText, Save, XCircle } from 'lucide-react';
import './CategoryModal.css';

const CategoryModal = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || '📦'
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

  // Common emoji icons for categories
  const iconOptions = [
    '📱', '💻', '⌚', '🎧', '📷', '🎮', // Electronics
    '👕', '👔', '👗', '👠', '👜', '🕶️', // Fashion
    '🪑', '🛋️', '🛏️', '🚪', '🪟', '💡', // Furniture
    '⚽', '🏀', '🎾', '🏈', '🏐', '🎱', // Sports
    '📚', '📖', '📝', '✏️', '🖊️', '📓', // Books/Stationery
    '🍔', '🍕', '🍜', '☕', '🍰', '🍎', // Food
    '🎨', '🎭', '🎪', '🎬', '🎤', '🎸', // Arts/Entertainment
    '🏥', '💊', '🩺', '💉', '🧴', '💄', // Health/Beauty
    '🏠', '🔧', '🔨', '🪛', '⚙️', '🔩', // Home/Tools
    '🎁', '🎀', '🎈', '🎉', '🎊', '🎃', // Gifts/Party
    '🚗', '🚕', '🚙', '🏍️', '🚲', '🛴', // Vehicles
    '🌱', '🌿', '🌳', '🌻', '🌺', '🌹', // Garden/Plants
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', // Pets
    '👶', '🍼', '🧸', '🎠', '🪀', '🧩', // Baby/Kids
    '📦', '🎯', '⭐', '💎', '🏆', '🎪'  // General/Other
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.icon) {
      newErrors.icon = 'Please select an icon';
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
      <div className="modal-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="category-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-avatar">
              <Layers size={28} />
            </div>
            <div>
              <h2 className="modal-title">
                {category ? 'Edit Category' : 'Add New Category'}
              </h2>
              <p className="modal-subtitle">
                {category ? 'Update category information' : 'Create a new product category'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close (ESC)">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Category Name */}
          <div className="form-group">
            <label className="form-label">
              Category Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="e.g., Electronics, Fashion, Furniture"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              className={`form-textarea ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe what products belong to this category"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="3"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {/* Icon Selection */}
          <div className="form-group">
            <label className="form-label">
              Category Icon <span className="required">*</span>
            </label>
            <div className="icon-grid">
              {iconOptions.map((icon, index) => (
                <button
                  key={index}
                  type="button"
                  className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                  onClick={() => handleInputChange('icon', icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
            {errors.icon && <span className="error-message">{errors.icon}</span>}
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              <XCircle size={18} />
              Cancel
            </button>
            <button type="submit" className="btn-save">
              <Save size={18} />
              {category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CategoryModal;
