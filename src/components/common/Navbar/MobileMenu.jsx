import React from 'react';
import { 
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

/**
 * MobileMenu Component - Sidebar menu cho mobile/tablet
 * 
 * @param {boolean} isOpen - Trạng thái mở/đóng
 * @param {function} onClose - Callback khi đóng menu
 * @param {object} user - User data từ context
 * @param {array} menuItems - Danh sách menu items
 * @param {number} cartItemCount - Số lượng sản phẩm trong giỏ
 */
const MobileMenu = ({ 
  isOpen,
  onClose,
  user = null,
  menuItems = [],
  cartItemCount = 0
}) => {
  const location = useLocation();
  
  if (!isOpen) return null;

  const handleLinkClick = (e, href) => {
    // Check if it's a hash link (starts with /#)
    if (href && href.startsWith('/#')) {
      const hash = href.substring(2); // Remove '/#' to get section id
      const element = document.getElementById(hash);
      
      // If we're already on homepage and element exists, smooth scroll
      if (location.pathname === '/' && element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', href);
      }
      // Otherwise, let Link handle navigation to homepage with hash
    }
    
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
                  onClick={(e) => handleLinkClick(e, item.href)}
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
                {/* Become Vendor / Seller Channel Button for Mobile Sidebar */}
                {user && (
                  <Link
                    to={user?.roleId === 1 || user?.role === 'SELLER' ? "/seller/dashboard" : "/seller/register"}
                    onClick={handleLinkClick}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary-500 hover:bg-secondary-600 transition-colors group mt-2"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                      {/* Vendor Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 7l2 12h14l2-12M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2" />
                      </svg>
                      {user?.roleId === 1 || user?.role === 'SELLER' ? "Kênh người bán" : "Bán hàng cùng SportZone"}
                    </span>
                  </Link>
                )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MobileMenu;
