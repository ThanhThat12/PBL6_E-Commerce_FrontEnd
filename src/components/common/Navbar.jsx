import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { useNotificationContext } from "../../context/NotificationContext";
import { 
  Bars3Icon
} from '@heroicons/react/24/outline';

// Import các component con
import SearchBar from './Navbar/SearchBar';
import CartButton from './Navbar/CartButton';
import NotificationButton from './Navbar/NotificationButton';
import UserMenu from './Navbar/UserMenu';
import MobileMenu from './Navbar/MobileMenu';

/**
 * NavbarNew Component - Navigation bar chính mới được redesign
 * Sử dụng color pattern từ Tailwind config và tích hợp với backend
 */

// Menu items - Dẫn đến sections trong homepage hoặc pages thực tế
const menuItems = [
  { label: "Trang chủ", href: "/", badge: null },
  { label: "Hot Deals", href: "/#vouchers", badge: "HOT" },
  { label: "Sản phẩm", href: "/products", badge: null },
  { label: "Danh mục", href: "/#categories", badge: null },
  { label: "Bán chạy", href: "/#best-selling", badge: null },
  { label: "Đánh giá cao", href: "/#top-rated", badge: null },
];

export default function NavbarNew({ isHomePage = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Sử dụng AuthContext
  const { cartCount } = useCart(); // Sử dụng CartContext
  const { 
    notifications, 
    markAsRead, 
    clearAll,
    unreadCount,
    chatUnreadCount
  } = useNotificationContext(); // Sử dụng NotificationContext

  console.log('Navbar - Notifications:', notifications.length, 'Total unread:', unreadCount, 'Chat unread:', chatUnreadCount);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 20);

      if (isHomePage) {
        const isScrollingDown = currentY > lastScrollYRef.current;
        const isPastThreshold = currentY > 120;

        if (isScrollingDown && isPastThreshold) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
      } else {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  // Handlers
  const handleSearch = (searchTerm) => {
    // TODO: Implement search logic hoặc navigate to search page
    console.log('Searching for:', searchTerm);
    // Example: navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleNavClick = (e, href) => {
    // Check if it's a hash link (starts with /#)
    if (href.startsWith('/#')) {
      const hash = href.substring(2); // Remove '/#' to get section id
      const element = document.getElementById(hash);
      
      // If we're already on homepage and element exists, smooth scroll
      if (location.pathname === '/' && element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL hash without triggering navigation
        window.history.pushState(null, '', href);
      }
      // Otherwise, let Link handle navigation to homepage with hash
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  return (
    <header className={`
      ${isHomePage ? 'sticky' : 'relative'}
      top-0 
      z-40 
      bg-white
      transition-all 
      duration-300
      transform
      ${isScrolled ? 'shadow-strong' : 'shadow-soft border-b border-border'}
      ${isHomePage && isHidden ? '-translate-y-full' : 'translate-y-0'}
    `}>
      {/* Top Bar */}
      <div className="bg-gradient-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-2.5 gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0 no-underline">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-soft group-hover:shadow-medium transition-shadow">
                <span className="text-primary-600 font-bold text-lg">S</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold text-lg drop-shadow-md">SportZone</span>
                <p className="text-primary-100 text-[11px]">Thể thao chuyên nghiệp</p>
              </div>
            </Link>
            
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 mx-4 max-w-lg">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            <div className="flex items-center gap-1.5 lg:gap-2.5">
              {/* Cart Button */}
              <CartButton itemCount={cartCount} />
              
              {/* Notification Button - Only show when logged in */}
              {user && (
                <NotificationButton 
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onClearAll={clearAll}
                />
              )}
              
              {/* User Menu */}
              <UserMenu user={user} onLogout={handleLogout} />
                            
              {/* Seller Channel - Show for logged-in users */}
              {/* SELLER goes to dashboard, BUYER goes to registration */}
              {user && (
                <Link
                  to={user?.roleId === 1 || user?.role === 'SELLER' ? "/seller/dashboard" : "/seller/register"}
                  className="
                    hidden
                    md:flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    rounded-lg
                    bg-secondary-500
                    text-white
                    text-sm
                    font-semibold
                    shadow-colored-secondary
                    hover:bg-secondary-600
                    transition-colors
                    group
                    no-underline
                  "
                  aria-label={user?.roleId === 1 || user?.role === 'SELLER' ? "Kênh người bán" : "Đăng ký bán hàng"}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4M5 11h14l-1.5 9h-11L5 11z" />
                  </svg>
                  <span className="hidden lg:inline">
                    {user?.roleId === 1 || user?.role === 'SELLER' ? "Kênh người bán" : "Bán hàng cùng SportZone"}
                  </span>
                </Link>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="
                  lg:hidden
                  p-2
                  rounded-lg
                  hover:bg-primary-600
                  transition-colors
                "
                aria-label="Mở menu"
              >
                <Bars3Icon className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Mobile */}
      <div className="md:hidden bg-background-secondary border-b border-border">
        <div className="container mx-auto px-4 py-1.5">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      
      <nav className="hidden lg:block bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center">
            <ul className="flex items-center gap-1">
              {menuItems.map((item, index) => (
                <li key={index} className="flex items-center">
                  <Link
                    to={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="
                      relative
                      flex
                      items-center
                      gap-1.5
                      px-3
                      py-2.5
                      text-sm
                      font-semibold
                      text-text-primary
                      hover:text-primary-600
                      no-underline
                      rounded-md
                      hover:bg-primary-50
                      transition-all
                      duration-200
                      whitespace-nowrap
                      group
                      leading-tight
                    "
                  >
                    <span className="relative z-10 leading-none">{item.label}</span>
                    {item.badge && (
                      <span className="
                        relative
                        z-10
                        inline-flex
                        items-center
                        justify-center
                        px-1.5
                        py-0.5
                        min-w-[28px]
                        h-4
                        text-[10px]
                        font-bold
                        bg-secondary-500
                        text-white
                        rounded-full
                        animate-pulse
                        leading-none
                      ">
                        {item.badge}
                      </span>
                    )}
                    {/* Hover underline effect */}
                    <span className="absolute bottom-1.5 left-0 right-0 h-0.5 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        menuItems={menuItems}
        cartItemCount={cartCount}
      />
    </header>
  );
}
