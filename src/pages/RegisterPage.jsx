import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import RegisterForm from '../components/auth/RegisterForm';
import { ROUTES } from '../utils/constants';

/**
 * Register Page Component
 * Full page layout for user registration
 */
const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4">
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

          {/* Back to Home */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors no-underline"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Side - Info */}
          <div className="hidden lg:block space-y-6 animate-slideIn">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                Tạo tài khoản mới
              </h1>
              <p className="text-lg text-gray-600">
                Đăng ký để tận hưởng trải nghiệm mua sắm tuyệt vời với nhiều ưu đãi hấp dẫn
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 pt-4">
              <BenefitItem
                icon="🎁"
                title="Ưu đãi độc quyền"
                description="Nhận ngay voucher 100K cho đơn hàng đầu tiên"
              />
              <BenefitItem
                icon="⚡"
                title="Thanh toán nhanh"
                description="Lưu thông tin thanh toán để checkout nhanh chóng"
              />
              <BenefitItem
                icon="📦"
                title="Theo dõi đơn hàng"
                description="Cập nhật trạng thái đơn hàng realtime"
              />
              <BenefitItem
                icon="💝"
                title="Tích điểm thưởng"
                description="Mỗi đơn hàng được tích điểm đổi quà"
              />
            </div>

            {/* Security */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔒</div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">
                    An toàn & Bảo mật
                  </h3>
                  <p className="text-sm text-green-700">
                    Thông tin của bạn được mã hóa và bảo mật tuyệt đối theo tiêu chuẩn quốc tế
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="lg:col-span-2 animate-scaleIn">
            {/* Mobile Title */}
            <div className="lg:hidden text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Đăng ký tài khoản
              </h2>
              <p className="text-gray-600">
                Hoàn tất 3 bước đơn giản để bắt đầu
              </p>
            </div>

            {/* Registration Form */}
            <RegisterForm />

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-8">
              Đã có tài khoản?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="text-primary-600 hover:text-primary-800 font-semibold transition-colors no-underline"
              >
                Đăng nhập ngay
              </Link>
            </p>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700 no-underline">
                Điều khoản dịch vụ
              </Link>{' '}
              và{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700 no-underline">
                Chính sách bảo mật
              </Link>{' '}
              của chúng tôi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Benefit Item Component
 */
const BenefitItem = ({ icon, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="text-2xl flex-shrink-0">{icon}</div>
    <div>
      <h3 className="font-semibold text-gray-900 mb-0.5">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

export default RegisterPage;
