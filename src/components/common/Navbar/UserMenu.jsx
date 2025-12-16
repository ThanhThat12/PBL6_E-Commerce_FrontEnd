import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCircleIcon, 
  ChevronDownIcon,
  UserIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

/**
 * UserMenu Component - Dropdown menu người dùng với authentication
 * 
 * @param {object} user - User data từ context/backend { username, email, avatar }
 * @param {function} onLogout - Callback khi logout
 * @param {string} className - Custom classes
 */
const UserMenu = ({ 
  user = null,
  onLogout,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    
    // Call parent logout handler (AuthContext will handle clearing storage)
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex 
          items-center 
          gap-2 
          px-3 
          py-2 
          rounded-lg
          text-white
          hover:bg-primary-600
          transition-colors
          group
        "
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user?.avatarUrl || user?.avatar ? (
          <img 
            src={user.avatarUrl || user.avatar} 
            alt={user.username || user.fullName || 'User'}
            className="w-6 h-6 rounded-full object-cover border-2 border-white"
          />
        ) : (
          <UserCircleIcon className="w-6 h-6 group-hover:text-primary-100 transition-colors" />
        )}
        <span className="hidden lg:inline text-sm font-medium group-hover:text-primary-100 transition-colors">
          {user?.fullName || user?.username || user?.email?.split('@')[0] || 'Tài khoản'}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform group-hover:text-primary-100 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute 
          right-0 
          mt-2 
          w-64
          bg-white 
          border 
          border-border
          rounded-lg 
          shadow-strong
          z-50
          overflow-hidden
        ">
          {/* Header */}
          {user ? (
            <div className="px-4 py-3 bg-gradient-primary border-b border-border">
              <p className="text-sm font-semibold text-white">
                Xin chào, {user.fullName || user.username || user.email?.split('@')[0] || 'Bạn'}!
              </p>
              {user.email && (
                <p className="text-xs text-primary-100 truncate">
                  {user.email}
                </p>
              )}
            </div>
          ) : (
            <div className="px-4 py-3 bg-background-secondary border-b border-border">
              <p className="text-sm font-medium text-text-primary">
                Chào mừng đến SportZone
              </p>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="
                    flex 
                    items-center 
                    gap-3 
                    px-4 
                    py-2.5
                    hover:bg-primary-50
                    text-text-primary
                    hover:text-primary-600
                    transition-colors
                  "
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Tài khoản của tôi</span>
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="
                    flex 
                    items-center 
                    gap-3 
                    px-4 
                    py-2.5
                    hover:bg-primary-50
                    text-text-primary
                    hover:text-primary-600
                    transition-colors
                  "
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Đơn hàng của tôi</span>
                </Link>

                <div className="border-t border-border my-2" />

                <button
                  onClick={handleLogout}
                  className="
                    w-full
                    flex 
                    items-center 
                    gap-3 
                    px-4 
                    py-2.5
                    hover:bg-accent-red-50
                    text-text-primary
                    hover:text-error
                    transition-colors
                  "
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="
                    flex 
                    items-center 
                    gap-3 
                    px-4 
                    py-2.5
                    hover:bg-primary-50
                    text-text-primary
                    hover:text-primary-600
                    transition-colors
                  "
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Đăng nhập</span>
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="
                    flex 
                    items-center 
                    gap-3 
                    px-4 
                    py-2.5
                    hover:bg-primary-50
                    text-text-primary
                    hover:text-primary-600
                    transition-colors
                  "
                >
                  <UserPlusIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Đăng ký</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
