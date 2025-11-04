import React, { useState } from 'react';
import { FiUser, FiLock, FiCheckCircle } from 'react-icons/fi';
import Input from '../../common/Input';
import Button from '../../common/Button';
import Alert from '../../common/Alert';
import { 
  validateUsername, 
  validatePassword, 
  validateConfirmPassword,
  getPasswordStrength 
} from '../../../utils/validation';
import { handleAuthError, AUTH_ERROR_CODES } from '../../../utils/authErrorHandler';
import useAuth from '../../../hooks/useAuth';

/**
 * Step 3: Complete Registration
 * User creates username and password
 */
const Step3Complete = ({ contact, contactType, otp, onBack }) => {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }

    if (alert) setAlert(null);
  };

  /**
   * Handle input blur
   */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on blur
    validateField(name, formData[name]);
  };

  /**
   * Validate single field
   */
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
      default:
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    return !error;
  };

  /**
   * Validate entire form
   */
  const validateForm = () => {
    const newErrors = {};

    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    setTouched({
      username: true,
      password: true,
      confirmPassword: true,
    });

    return Object.keys(newErrors).length === 0;
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
      const result = await register({
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        contact,
      });

      console.log('📦 register response:', result);

      // Check for success (AuthContext returns { success: true/false })
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Đăng ký thành công!',
          description: 'Chào mừng bạn đến với SportZone. Đang chuyển hướng...',
        });

        // Redirect will be handled by AuthContext after auto-login
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setAlert({
          type: 'error',
          message: 'Đăng ký thất bại',
          description: result.message || 'Vui lòng thử lại',
        });
      }
    } catch (err) {
      console.error('❌ register error:', err);
      const errorInfo = handleAuthError(err);
      
      let errorDescription = errorInfo.message;
      if (errorInfo.errorCode === AUTH_ERROR_CODES.OTP_NOT_VERIFIED) {
        errorDescription = 'Phiên xác thực đã hết hạn. Vui lòng bắt đầu lại quy trình đăng ký.';
      } else if (errorInfo.errorCode === AUTH_ERROR_CODES.PASSWORD_MISMATCH) {
        errorDescription = 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.';
      }
      
      setAlert({
        type: 'error',
        message: 'Đăng ký thất bại',
        description: errorDescription,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-slideIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Hoàn tất đăng ký
        </h2>
        <p className="text-gray-600">
          Tạo tên đăng nhập và mật khẩu cho tài khoản của bạn
        </p>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          description={alert.description}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <Input
          type="text"
          name="username"
          label="Tên đăng nhập"
          placeholder="username"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.username ? errors.username : ''}
          icon={FiUser}
          required
          disabled={loading}
          autoComplete="username"
        />

        {/* Password */}
        <div>
          <Input
            type="password"
            name="password"
            label="Mật khẩu"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ''}
            icon={FiLock}
            required
            disabled={loading}
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          {formData.password && passwordStrength && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
                <span className={`text-xs font-semibold ${
                  passwordStrength.strength === 'weak' ? 'text-red-600' :
                  passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {passwordStrength.message}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    passwordStrength.strength === 'weak' ? 'bg-red-500' :
                    passwordStrength.strength === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${passwordStrength.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          type="password"
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword ? errors.confirmPassword : ''}
          icon={FiLock}
          required
          disabled={loading}
          autoComplete="new-password"
        />

        {/* Password Requirements */}
        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p className="font-semibold mb-2">Yêu cầu mật khẩu:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Ít nhất 8 ký tự</li>
            <li>Bao gồm chữ hoa (A-Z)</li>
            <li>Bao gồm chữ thường (a-z)</li>
            <li>Bao gồm số (0-9)</li>
            <li>Bao gồm ký tự đặc biệt (@$!%*?&#)</li>
          </ul>
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
          Hoàn tất đăng ký
        </Button>

        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          size="md"
          fullWidth
          onClick={onBack}
          disabled={loading}
        >
          ← Quay lại
        </Button>
      </form>
    </div>
  );
};

export default Step3Complete;
