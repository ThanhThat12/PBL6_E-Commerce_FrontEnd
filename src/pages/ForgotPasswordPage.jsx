import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { ROUTES } from '../utils/constants';

/**
 * Forgot Password Page Component
 * Full page layout for password reset
 */
const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors no-underline"
          >
            <FiShoppingBag className="w-8 h-8" />
            <span className="text-2xl font-bold hidden sm:inline">SportZone</span>
          </Link>

          {/* Back to Login */}
          <Link
            to={ROUTES.LOGIN}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors no-underline"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Side - Info */}
          <div className="hidden lg:block space-y-6 animate-slideIn">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                Đặt lại mật khẩu
              </h1>
              <p className="text-lg text-gray-600">
                Thực hiện 3 bước đơn giản để khôi phục quyền truy cập tài khoản của bạn
              </p>
            </div>

            {/* Steps Info */}
            <div className="space-y-4 pt-4">
              <StepInfo
                number="1"
                title="Nhập thông tin liên hệ"
                description="Cung cấp email hoặc số điện thoại đã đăng ký"
                icon="📧"
              />
              <StepInfo
                number="2"
                title="Xác thực mã OTP"
                description="Nhập mã xác thực được gửi đến thiết bị của bạn"
                icon="🔐"
              />
              <StepInfo
                number="3"
                title="Tạo mật khẩu mới"
                description="Đặt mật khẩu mới an toàn cho tài khoản"
                icon="✅"
              />
            </div>

            {/* Help */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Cần hỗ trợ?
                  </h3>
                  <p className="text-sm text-blue-700 mb-2">
                    Nếu bạn gặp vấn đề khi đặt lại mật khẩu, vui lòng liên hệ:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>📞 Hotline: 1900-xxxx</li>
                    <li>✉️ Email: support@sportshop.com</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">
                    Lưu ý bảo mật
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Không chia sẻ mã OTP với bất kỳ ai</li>
                    <li>• Sử dụng mật khẩu mạnh và độc nhất</li>
                    <li>• Thay đổi mật khẩu định kỳ</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:col-span-2 animate-scaleIn">
            {/* Mobile Title */}
            <div className="lg:hidden text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Quên mật khẩu?
              </h2>
              <p className="text-gray-600">
                Làm theo 3 bước để khôi phục tài khoản
              </p>
            </div>

            {/* Forgot Password Form */}
            <ForgotPasswordForm />

            {/* Footer Links */}
            <div className="text-center mt-8 space-y-3">
              <p className="text-sm text-gray-600">
                Nhớ lại mật khẩu?{' '}
                <Link
                  to={ROUTES.LOGIN}
                  className="text-primary-600 hover:text-primary-800 font-semibold transition-colors no-underline"
                >
                  Đăng nhập ngay
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link
                  to={ROUTES.REGISTER}
                  className="text-primary-600 hover:text-primary-800 font-semibold transition-colors no-underline"
                >
                  Đăng ký miễn phí
                </Link>
              </p>
            </div>

            {/* Security Note (Mobile) */}
            <div className="lg:hidden mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                <strong>Lưu ý:</strong> Không chia sẻ mã OTP với bất kỳ ai
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Step Info Component
 */
const StepInfo = ({ number, title, description, icon }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-700">
        {number}
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

export default ForgotPasswordPage;
