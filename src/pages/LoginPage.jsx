import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import LoginForm from '../components/auth/LoginForm';
import { ROUTES } from '../utils/constants';

/**
 * Login Page Component
 * Full page layout for user login
 */
const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 animate-slideIn">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-3 text-primary-600 hover:text-primary-700 transition-colors no-underline">
            <FiShoppingBag className="w-12 h-12" />
            <span className="text-4xl font-bold">SportZone</span>
          </Link>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
              Chào mừng trở lại!
            </h1>
            <p className="text-xl text-gray-600">
              Đăng nhập để tiếp tục mua sắm các sản phẩm thể thao chất lượng cao
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 pt-6">
            <FeatureItem
              icon="🎯"
              title="Sản phẩm chính hãng"
              description="100% hàng chính hãng từ các thương hiệu uy tín"
            />
            <FeatureItem
              icon="🚚"
              title="Giao hàng nhanh"
              description="Giao hàng toàn quốc, thanh toán khi nhận hàng"
            />
            <FeatureItem
              icon="💯"
              title="Bảo hành chính hãng"
              description="Bảo hành toàn diện theo chính sách nhà sản xuất"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full animate-scaleIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8">
              <Link to={ROUTES.HOME} className="flex items-center justify-center gap-2 text-primary-600 no-underline">
                <FiShoppingBag className="w-8 h-8" />
                <span className="text-2xl font-bold">SportZone</span>
              </Link>
            </div>

            {/* Form Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Đăng nhập
              </h2>
              <p className="text-gray-600">
                Nhập thông tin để truy cập tài khoản của bạn
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Back to Home (Mobile) */}
            <div className="lg:hidden mt-8 text-center">
              <Link
                to={ROUTES.HOME}
                className="text-sm text-gray-500 hover:text-primary-600 transition-colors no-underline"
              >
                ← Quay lại trang chủ
              </Link>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700 no-underline">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-700 no-underline">
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Feature Item Component
 */
const FeatureItem = ({ icon, title, description }) => (
  <div className="flex items-start gap-4">
    <div className="text-3xl flex-shrink-0">{icon}</div>
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

export default LoginPage;
