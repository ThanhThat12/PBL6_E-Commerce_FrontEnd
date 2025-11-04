import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock, UserCheck } from 'lucide-react';
import './AddCustomerModal.css';

const AddCustomerModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'buyer'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-customer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="add-customer-header">
          <div className="header-content">
            <div className="header-icon">
              <User size={28} />
            </div>
            <div className="header-text">
              <h2>Add New Customer</h2>
              <p>Create a new customer account</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="add-customer-form">
          <div className="form-content">
            {/* Username Field */}
            <div className="form-group">
              <label className="form-label">
                <User size={18} />
                <span>Username</span>
                <span className="required">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className={`form-input ${errors.username ? 'error' : ''}`}
              />
              {errors.username && (
                <span className="error-message">{errors.username}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                <span>Password</span>
                <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                <span>Email</span>
                <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Phone Field */}
            <div className="form-group">
              <label className="form-label">
                <Phone size={18} />
                <span>Phone Number</span>
                <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={`form-input ${errors.phone ? 'error' : ''}`}
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>

            {/* Role Field (Read-only) */}
            <div className="form-group">
              <label className="form-label">
                <UserCheck size={18} />
                <span>Role</span>
              </label>
              <div className="role-display">
                <span className="role-badge">Buyer</span>
                <span className="role-info">Default role for customers</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="add-customer-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <User size={18} />
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;
