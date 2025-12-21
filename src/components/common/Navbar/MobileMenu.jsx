import React from 'react';
import { 
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  PhoneIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

/**
 * MobileMenu Component - Sidebar menu cho mobile/tablet
 * 
 * @param {boolean} isOpen - Trạng thái mở/đóng
 * @param {function} onClose - Callback khi đóng menu
 * @param {object} user - User data từ context
 * @param {array} categories - Danh sách categories
 * @param {array} menuItems - Danh sách menu items
 * @param {number} cartItemCount - Số lượng sản phẩm trong giỏ
 * @param {object} registrationStatus - Registration status for seller channel
 */
const MobileMenu = ({ 
  isOpen,
  onClose,
  user = null,
  categories = [],
  menuItems = [],
  cartItemCount = 0,
  registrationStatus = null
}) => {
  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className="
        absolute 
        left-0 
        top-0 
        bottom-0
        w-80 
        max-w-[85vw]
        bg-white
        shadow-strong
        overflow-y-auto
        animate-slide-in
      ">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-primary px-4 py-4 flex items-center justify-between">
          <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">S</span>
            </div>
            <span className="text-white font-bold text-lg">SportZone</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
            aria-label="Đóng menu"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* User Section */}
        <div className="border-b border-border">
          {user ? (
            <div className="px-4 py-4 bg-background-secondary">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-8 h-8 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-text-primary">{user.username}</p>
                  {user.email && (
                    <p className="text-xs text-text-tertiary truncate">{user.email}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/login"
                onClick={handleLinkClick}
                className="
                  block
                  w-full
                  px-4
                  py-2.5
                  bg-primary-500
                  text-white
                  text-center
                  rounded-lg
                  font-semibold
                  hover:bg-primary-600
                  transition-colors
                "
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={handleLinkClick}
                className="
                  block
                  w-full
                  px-4
                  py-2.5
                  border-2
                  border-primary-500
                  text-primary-600
                  text-center
                  rounded-lg
                  font-semibold
                  hover:bg-primary-50
                  transition-colors
                "
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b border-border">
          <div className="grid grid-cols-3 gap-2">
            <Link
              to="/cart"
              onClick={handleLinkClick}
              className="
                relative
                flex
                flex-col
                items-center
                justify-center
                py-3
                bg-background-secondary
                rounded-lg
                hover:bg-primary-50
                transition-colors
              "
            >
              <ShoppingBagIcon className="w-6 h-6 text-primary-600 mb-1" />
              <span className="text-xs font-medium text-text-primary">Giỏ hàng</span>
              {cartItemCount > 0 && (
                <span className="
                  absolute 
                  top-2 
                  right-2 
                  w-5 
                  h-5 
                  bg-secondary-500 
                  text-white 
                  text-xs 
                  font-bold 
                  rounded-full 
                  flex 
                  items-center 
                  justify-center
                ">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            <Link
              to={user ? "/orders" : "/login"}
              onClick={handleLinkClick}
              className="
                flex
                flex-col
                items-center
                justify-center
                py-3
                bg-background-secondary
                rounded-lg
                hover:bg-primary-50
                transition-colors
              "
            >
              <ShoppingBagIcon className="w-6 h-6 text-secondary-500 mb-1" />
              <span className="text-xs font-medium text-text-primary">Đơn hàng</span>
            </Link>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="px-4 py-4 border-b border-border">
            <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary mb-3 uppercase tracking-wide">
              <Squares2X2Icon className="w-5 h-5 text-primary-600" />
              Danh mục sản phẩm
            </h3>
            <div className="space-y-1">
              {categories.map((category, index) => (
                <Link
                  key={category.id || index}
                  to={`/category/${category.slug || category.id}`}
                  onClick={handleLinkClick}
                  className="
                    flex
                    items-center
                    justify-between
                    px-3
                    py-2.5
                    rounded-lg
                    hover:bg-primary-50
                    transition-colors
                    group
                  "
                >
                  <span className="text-sm text-text-primary group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </span>
                  <svg 
                    className="w-4 h-4 text-text-tertiary group-hover:text-primary-600 group-hover:translate-x-1 transition-all" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Menu */}
        {menuItems.length > 0 && (
          <div className="px-4 py-4 border-b border-border">
            <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary mb-3 uppercase tracking-wide">
              <HomeIcon className="w-5 h-5 text-primary-600" />
              Menu chính
            </h3>
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  onClick={handleLinkClick}
                  className="
                    flex
                    items-center
                    justify-between
                    px-3
                    py-2.5
                    rounded-lg
                    hover:bg-primary-50
                    transition-colors
                    group
                  "
                >
                  <span className="text-sm text-text-primary group-hover:text-primary-600 transition-colors">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-secondary-500 text-white text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
                {/* Seller Channel Button - Clean version */}
                {user && (
                  <Link
                    to={user?.roleId === 1 || user?.role === 'SELLER' || user?.role === 'ADMIN' ? '/seller/dashboard' : '/seller/register'}
                    onClick={handleLinkClick}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary-500 hover:bg-secondary-600 transition-colors group mt-2"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4M5 11h14l-1.5 9h-11L5 11z" />
                      </svg>
                      {user?.roleId === 1 || user?.role === 'SELLER' || user?.role === 'ADMIN' ? 'Kênh người bán' : 'Bán hàng cùng SportZone'}
                    </span>
                  </Link>
                )}
            </div>
          </div>
        )}

        {/* Footer - Contact */}
        <div className="px-4 py-4">
          <div className="bg-gradient-primary rounded-lg p-4 text-center">
            <PhoneIcon className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white font-bold text-lg mb-1">1900 888 123</p>
            <p className="text-primary-100 text-xs">Hỗ trợ 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
