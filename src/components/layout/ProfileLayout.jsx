import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiUser, FiMapPin, FiPackage, FiShoppingCart, FiLock, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import Navbar from '../common/Navbar';
import Footer from './footer/Footer';

/**
 * ProfileLayout
 * Sidebar layout cho user profile pages (giống Shopee) với Navbar & Footer
 */
const ProfileLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Đăng xuất thất bại');
    }
  };

  const menuItems = [
    {
      icon: FiUser,
      label: 'Tài Khoản Của Tôi',
      path: '/profile',
      exact: true
    },
    {
      icon: FiMapPin,
      label: 'Địa Chỉ',
      path: '/profile/addresses'
    },
    {
      icon: FiPackage,
      label: 'Đơn Mua',
      path: '/orders'
    },
    {
      icon: FiShoppingCart,
      label: 'Giỏ Hàng',
      path: '/cart'
    },
    {
      icon: FiLock,
      label: 'Đổi Mật Khẩu',
      path: '/profile/change-password'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
                {/* User Info Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">Tài khoản của</p>
                      <p className="font-semibold text-gray-900 truncate">
                        {user?.username || user?.email || 'User'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-2">
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
                          isActive
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-600 hover:bg-red-50 mt-2"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span>Đăng Xuất</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <div className="bg-white rounded-lg shadow-md">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>


      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProfileLayout;
