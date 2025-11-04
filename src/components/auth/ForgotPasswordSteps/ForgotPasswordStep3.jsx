import React, { useState } from 'react';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Input from '../../common/Input';
import Button from '../../common/Button';
import Alert from '../../common/Alert';
import { 
  validatePassword, 
  validateConfirmPassword,
  getPasswordStrength 
} from '../../../utils/validation';
import { resetPassword } from '../../../services/authService';
import { ROUTES } from '../../../utils/constants';

/**
 * Step 3: Reset Password
 * User creates new password
 */
const ForgotPasswordStep3 = ({ contact, contactType, otp, onBack }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: '',
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
    if (name === 'newPassword') {
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
      case 'newPassword':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.newPassword, value);
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

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;

    const confirmPasswordError = validateConfirmPassword(
      formData.newPassword,
      formData.confirmPassword
    );
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    setTouched({
      newPassword: true,
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
      const response = await resetPassword({
        contact,
        otp,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmPassword,
      });

      console.log('[ForgotPasswordStep3] resetPassword response:', response);

      if (response.status === 200 || response.status === 'success') {
        setAlert({
          type: 'success',
          message: 'Đặt lại mật khẩu thành công!',
          description: 'Bạn có thể đăng nhập với mật khẩu mới. Đang chuyển hướng...',
        });

        // Redirect to login page
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 2000);
      } else {
        setAlert({
          type: 'error',
          message: 'Đặt lại mật khẩu thất bại',
          description: response.message || 'Vui lòng thử lại',
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Đã xảy ra lỗi',
        description: err.message || 'Không thể đặt lại mật khẩu',
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
          Tạo mật khẩu mới
        </h2>
        <p className="text-gray-600">
          Nhập mật khẩu mới cho tài khoản của bạn
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
        {/* New Password */}
        <div>
          <Input
            type="password"
            name="newPassword"
            label="Mật khẩu mới"
            placeholder="••••••••"
            value={formData.newPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.newPassword ? errors.newPassword : ''}
            icon={FiLock}
            required
            disabled={loading}
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          {formData.newPassword && passwordStrength && (
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
          label="Xác nhận mật khẩu mới"
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
          Đặt lại mật khẩu
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

      {/* Security Info */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              Bảo mật tài khoản
            </h3>
            <p className="text-sm text-green-700">
              Sau khi đặt lại mật khẩu, bạn nên đăng xuất khỏi tất cả thiết bị và đăng nhập lại để đảm bảo an toàn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordStep3;
