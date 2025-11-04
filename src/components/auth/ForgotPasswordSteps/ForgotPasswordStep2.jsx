import React, { useState, useEffect } from 'react';
import { FiShield, FiRefreshCw } from 'react-icons/fi';
import OTPInput from '../../common/OTPInput';
import Button from '../../common/Button';
import Alert from '../../common/Alert';
import { validateOTP } from '../../../utils/validation';
import { formatCountdown, maskEmail, maskPhoneNumber } from '../../../utils/formatters';
import { verifyForgotPasswordOTP, sendForgotPasswordOTP } from '../../../services/authService';
import { OTP_CONFIG } from '../../../utils/constants';

/**
 * Step 2: Verify OTP for Password Reset
 * User enters OTP code received via email/SMS
 */
const ForgotPasswordStep2 = ({ contact, contactType, onNext, onBack }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  // Start initial cooldown
  useEffect(() => {
    setResendCooldown(OTP_CONFIG.RESEND_COOLDOWN);
  }, []);

  /**
   * Handle OTP change
   */
  const handleOTPChange = (value) => {
    setOtp(value);
    if (error) setError('');
    if (alert) setAlert(null);
  };

  /**
   * Handle OTP complete (auto-submit)
   */
  const handleOTPComplete = async (value) => {
    await verifyOTPCode(value);
  };

  /**
   * Verify OTP code
   */
  const verifyOTPCode = async (otpValue = otp) => {
    // Validate OTP
    const validationError = validateOTP(otpValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await verifyForgotPasswordOTP(contact, otpValue);

      console.log('[ForgotPasswordStep2] verifyForgotPasswordOTP response:', response);

      if (response.status === 200 || response.status === 'success') {
        setAlert({
          type: 'success',
          message: 'Xác thực thành công!',
          description: 'Vui lòng tạo mật khẩu mới',
        });

        // Wait for user to see success
        setTimeout(() => {
          onNext({ contact, contactType, otp: otpValue });
        }, 1500);
      } else {
        setError(response.message || 'Mã OTP không chính xác');
        setAlert({
          type: 'error',
          message: 'Xác thực thất bại',
          description: response.message || 'Mã OTP không chính xác hoặc đã hết hạn',
        });
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi xác thực');
      setAlert({
        type: 'error',
        message: 'Đã xảy ra lỗi',
        description: err.message || 'Không thể xác thực mã OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResendOTP = async () => {
    if (!canResend || loading) return;

    setLoading(true);
    setAlert(null);
    setError('');

    try {
      const response = await sendForgotPasswordOTP(contact);

      console.log('[ForgotPasswordStep2] sendForgotPasswordOTP response:', response);

      if (response.status === 200 || response.status === 'success') {
        setAlert({
          type: 'success',
          message: 'Đã gửi lại mã OTP!',
          description: `Vui lòng kiểm tra ${contactType === 'email' ? 'email' : 'tin nhắn'} của bạn`,
        });

        // Reset cooldown
        setResendCooldown(OTP_CONFIG.RESEND_COOLDOWN);
        setCanResend(false);
        setOtp('');
      } else {
        setAlert({
          type: 'error',
          message: 'Không thể gửi lại OTP',
          description: response.message || 'Vui lòng thử lại sau',
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: 'Đã xảy ra lỗi',
        description: err.message || 'Không thể gửi lại mã OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle manual submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    verifyOTPCode();
  };

  // Mask contact for display
  const maskedContact = contactType === 'email' 
    ? maskEmail(contact) 
    : maskPhoneNumber(contact);

  return (
    <div className="w-full max-w-md mx-auto animate-slideIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <FiShield className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nhập mã OTP
        </h2>
        <p className="text-gray-600">
          Mã xác thực đã được gửi đến
        </p>
        <p className="text-primary-600 font-semibold mt-1">
          {maskedContact}
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

      {/* OTP Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <OTPInput
          length={OTP_CONFIG.LENGTH}
          onChange={handleOTPChange}
          onComplete={handleOTPComplete}
          disabled={loading}
          error={error}
        />

        {/* Resend OTP */}
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className="w-4 h-4" />
              Gửi lại mã OTP
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Gửi lại mã sau{' '}
              <span className="font-semibold text-primary-600">
                {formatCountdown(resendCooldown)}
              </span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading || otp.length !== OTP_CONFIG.LENGTH}
        >
          Xác thực
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

      {/* Info */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Lưu ý:</strong> Mã OTP có hiệu lực trong {OTP_CONFIG.EXPIRY_TIME / 60} phút. Vui lòng nhập mã trước khi hết hạn.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordStep2;
