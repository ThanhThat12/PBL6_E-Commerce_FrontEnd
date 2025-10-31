import React, { useState } from 'react';
import { FiMail, FiPhone } from 'react-icons/fi';
import Input from '../../common/Input';
import Button from '../../common/Button';
import Alert from '../../common/Alert';
import { validateContact, detectContactType } from '../../../utils/validation';
import { checkContact } from '../../../services/authService';
import { handleAuthError, AUTH_ERROR_CODES } from '../../../utils/authErrorHandler';

/**
 * Step 1: Check Contact (Email or Phone)
 * User enters email or phone number to receive OTP
 */
const Step1Contact = ({ onNext, initialContact = '' }) => {
  const [contact, setContact] = useState(initialContact);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const contactType = detectContactType(contact);
  const Icon = contactType === 'email' ? FiMail : FiPhone;

  /**
   * Handle contact change
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setContact(value);
    
    if (error) setError('');
    if (alert) setAlert(null);
  };

  /**
   * Validate and submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate contact
    const validationError = validateContact(contact);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await checkContact(contact);

      if (response.status === 200 || response.status === 'success') {
        setAlert({
          type: 'success',
          message: 'Mã OTP đã được gửi!',
          description: `Vui lòng kiểm tra ${contactType === 'email' ? 'email' : 'tin nhắn'} của bạn`,
        });

        // Wait a moment for user to see success message
        setTimeout(() => {
          onNext({ contact, contactType });
        }, 1500);
      } else {
        setAlert({
          type: 'error',
          message: 'Không thể gửi OTP',
          description: response.message || 'Vui lòng thử lại sau',
        });
      }
    } catch (err) {
      const errorInfo = handleAuthError(err);
      
      // Provide specific error messages
      let errorDescription = errorInfo.message;
      if (errorInfo.errorCode === AUTH_ERROR_CODES.DUPLICATE_EMAIL) {
        errorDescription = errorInfo.message + '. Vui lòng đăng nhập hoặc sử dụng email khác.';
      } else if (errorInfo.errorCode === AUTH_ERROR_CODES.DUPLICATE_PHONE) {
        errorDescription = errorInfo.message + '. Vui lòng đăng nhập hoặc sử dụng số điện thoại khác.';
      }
      
      setAlert({
        type: 'error',
        message: 'Đã xảy ra lỗi',
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Icon className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Xác thực liên hệ
        </h2>
        <p className="text-gray-600">
          Nhập email hoặc số điện thoại để nhận mã OTP
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="text"
          name="contact"
          label={contactType === 'email' ? 'Email' : contactType === 'phone' ? 'Số điện thoại' : 'Email hoặc Số điện thoại'}
          placeholder={contactType === 'email' ? 'example@email.com' : contactType === 'phone' ? '0123456789' : 'Email hoặc số điện thoại'}
          value={contact}
          onChange={handleChange}
          error={error}
          icon={Icon}
          required
          disabled={loading}
          autoComplete="off"
        />

        {/* Contact Type Hint */}
        {contact && contactType && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
            <Icon className="w-4 h-4" />
            <span>
              {contactType === 'email' 
                ? 'Mã OTP sẽ được gửi qua email' 
                : 'Mã OTP sẽ được gửi qua SMS'}
            </span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading || !contact}
        >
          Gửi mã OTP
        </Button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Mã OTP có hiệu lực trong 5 phút. Nếu không nhận được mã, bạn có thể yêu cầu gửi lại ở bước tiếp theo.
        </p>
      </div>
    </div>
  );
};

export default Step1Contact;
