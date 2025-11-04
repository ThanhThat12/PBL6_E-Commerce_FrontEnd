import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Lock, User, CheckCircle, ArrowRight } from 'lucide-react';
import { loginAdmin } from '../../../services/adminAuthService';
import './LoginAdmin.css';

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error khi user bắt đầu nhập
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // ✅ GỌI API LOGIN THẬT
      console.log('🔑 Submitting login form...');
      const result = await loginAdmin(formData.username, formData.password);
      
      if (result.success) {
        // Đăng nhập thành công
        console.log('✅ Login successful, redirecting to dashboard...');
        
        // Redirect về dashboard
        navigate('/admin/dashboard');
      } else {
        // Đăng nhập thất bại
        console.error('❌ Login failed:', result.message);
        setError(result.message || 'Đăng nhập thất bại');
      }
      
    } catch (err) {
      console.error('❌ Unexpected error during login:', err);
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    alert('Chức năng quên mật khẩu sẽ được cập nhật sau');
  };

  return (
    <div className="admin-login-container">
      {/* Left Side - Branding */}
      <div className="admin-login-brand">
        <div className="brand-content">
          <div className="brand-icon">
            <Shield size={48} />
          </div>
          <h1 className="brand-title">Admin Panel</h1>
          <p className="brand-subtitle">Secure Admin Access</p>
          
          <div className="brand-features">
            <div className="feature-item">
              <CheckCircle size={20} />
              <span>Secure Authentication</span>
            </div>
            <div className="feature-item">
              <CheckCircle size={20} />
              <span>Role-based Access</span>
            </div>
            <div className="feature-item">
              <CheckCircle size={20} />
              <span>Real-time Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="admin-login-form-container">
        <div className="admin-login-form-wrapper">
          <div className="form-header">
            <div className="form-icon">
              <Shield size={32} />
            </div>
            <h2 className="form-title">Welcome Back</h2>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form">
            {/* Username Input */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  className="form-input"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Shield size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
