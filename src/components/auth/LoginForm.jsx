import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiFacebook } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GoogleLogin } from '@react-oauth/google';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { ROUTES, GOOGLE_CLIENT_ID, FACEBOOK_APP_ID } from '../../utils/constants';
import { AUTH_ERROR_CODES } from '../../utils/authErrorHandler';
import { loadFacebookSdk, facebookLogin } from '../../utils/facebook';
import useAuth from '../../hooks/useAuth';

/**
 * LoginForm Component
 * Handles user login with email/password or Google OAuth
 */
const LoginForm = () => {
  const { login, loginWithGoogle, loginWithFacebook, error: authError, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (alert) setAlert(null);
    if (authError) clearError();
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    // Bỏ validation, backend sẽ handle
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setAlert(null);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Đăng nhập thành công!',
          description: 'Đang chuyển hướng...',
        });
        
        // Check user role and redirect accordingly
        const userRole = result.data?.user?.role;
        console.log('[LoginForm] Login result:', result);
        console.log('[LoginForm] User role:', userRole);
        
        setTimeout(() => {
          if (userRole === 'ADMIN') {
            console.log('[LoginForm] Redirecting to admin dashboard');
            window.location.href = '/admin/dashboard';
          } else {
            console.log('[LoginForm] Redirecting to home');
            window.location.href = ROUTES.HOME;
          }
        }, 1000);
      } else {
        // Handle specific error codes
        let errorMessage = result.message || 'Vui lòng kiểm tra lại thông tin đăng nhập';
        
        // Provide helpful hints based on error code
        if (result.errorCode === AUTH_ERROR_CODES.INVALID_CREDENTIALS) {
          errorMessage = result.message;
        } else if (result.errorCode === AUTH_ERROR_CODES.USER_NOT_ACTIVATED) {
          errorMessage = result.message;
        }
        
        setAlert({
          type: 'error',
          message: 'Đăng nhập thất bại',
          description: errorMessage,
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Đã xảy ra lỗi',
        description: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth success
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setAlert(null);
    
    try {
      console.log('[LoginForm] Google credential response:', credentialResponse);
      const result = await loginWithGoogle(credentialResponse.credential);
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Đăng nhập Google thành công!',
          description: 'Đang chuyển hướng...',
        });
        
        // Check user role and redirect accordingly
        const userRole = result.data?.user?.role;
        console.log('[LoginForm] Google login result:', result);
        console.log('[LoginForm] Google login - User role:', userRole);
        
        setTimeout(() => {
          if (userRole === 'ADMIN') {
            console.log('[LoginForm] Redirecting to admin dashboard');
            window.location.href = '/admin/dashboard';
          } else {
            console.log('[LoginForm] Redirecting to home');
            window.location.href = ROUTES.HOME;
          }
        }, 1000);
      } else {
        setAlert({
          type: 'error',
          message: 'Đăng nhập Google thất bại',
          description: result.message,
        });
      }
    } catch (error) {
      console.error('[LoginForm] Google login error:', error);
      setAlert({
        type: 'error',
        message: 'Đã xảy ra lỗi',
        description: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth error
   */
  const handleGoogleError = () => {
    setAlert({
      type: 'error',
      message: 'Đăng nhập Google thất bại',
      description: 'Vui lòng thử lại hoặc sử dụng phương thức đăng nhập khác',
    });
  };

  /**
   * Trigger Facebook SDK login flow, get access token and call backend
   */
  const handleFacebookButton = async () => {
    // Check if Facebook App ID is configured
    if (!FACEBOOK_APP_ID || FACEBOOK_APP_ID === 'YOUR_FACEBOOK_APP_ID_HERE') {
      setAlert({ 
        type: 'error', 
        message: 'Facebook OAuth chưa được cấu hình',
        description: 'Vui lòng thêm REACT_APP_FACEBOOK_APP_ID vào file .env'
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      console.log('[LoginForm] Loading Facebook SDK...');
      const FB = await loadFacebookSdk(FACEBOOK_APP_ID);
      
      console.log('[LoginForm] Requesting Facebook login...');
      const auth = await facebookLogin(FB, { scope: 'public_profile,email' });

      console.log('[LoginForm] Facebook auth response:', auth);
      
      if (!auth || !auth.accessToken) {
        throw new Error('No access token returned from Facebook');
      }

      console.log('[LoginForm] Sending access token to backend...');
      // Send accessToken to backend
      const result = await loginWithFacebook(auth.accessToken);

      console.log('[LoginForm] Backend response:', result);

      if (result.success) {
        setAlert({ type: 'success', message: 'Đăng nhập Facebook thành công', description: 'Đang chuyển hướng...' });
        
        // Check user role and redirect accordingly
        const userRole = result.data?.user?.role;
        console.log('[LoginForm] Facebook login result:', result);
        console.log('[LoginForm] Facebook login - User role:', userRole);
        
        setTimeout(() => {
          if (userRole === 'ADMIN') {
            console.log('[LoginForm] Redirecting to admin dashboard');
            window.location.href = '/admin/dashboard';
          } else {
            console.log('[LoginForm] Redirecting to home');
            window.location.href = ROUTES.HOME;
          }
        }, 900);
      } else {
        setAlert({ type: 'error', message: 'Đăng nhập Facebook thất bại', description: result.message });
      }
    } catch (err) {
      console.error('[LoginForm] Facebook login error:', err);
      
      // Handle specific error cases
      let errorMessage = 'Vui lòng thử lại';
      if (err.status === 'not_authorized') {
        errorMessage = 'Bạn đã từ chối quyền truy cập';
      } else if (err.status === 'unknown') {
        errorMessage = 'Người dùng đã đóng cửa sổ đăng nhập';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setAlert({ 
        type: 'error', 
        message: 'Đăng nhập Facebook thất bại', 
        description: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          description={alert.description}
          onClose={() => setAlert(null)}
          autoClose={alert.type === 'success' ? 2000 : 0}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Input */}
        <Input
          type="text"
          name="username"
          label="Username"
          placeholder="Nhập username của bạn"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          icon={FiMail}
          autoComplete="username"
          disabled={loading}
        />

        {/* Password Input */}
        <Input
          type="password"
          name="password"
          label="Mật khẩu"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={FiLock}
          autoComplete="current-password"
          disabled={loading}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-200 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
          </label>

          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors no-underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Đăng nhập
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Hoặc tiếp tục với</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        {/* Google Login */}
        {GOOGLE_CLIENT_ID ? (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              locale="vi"
            />
          </div>
        ) : (
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon={FcGoogle}
            onClick={() => setAlert({
              type: 'error',
              message: 'Google OAuth chưa được cấu hình',
              description: 'Vui lòng liên hệ quản trị viên',
            })}
          >
            Đăng nhập với Google
          </Button>
        )}

        {/* Facebook Login */}
        <div>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleFacebookButton}
            disabled={loading}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <FiFacebook className="w-5 h-5 mr-2" />
            Đăng nhập với Facebook
          </Button>
        </div>
      </div>

      {/* Register Link */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="text-primary-600 hover:text-primary-800 font-semibold transition-colors no-underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
