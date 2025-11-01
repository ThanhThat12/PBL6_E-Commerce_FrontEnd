import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import { getCategories } from "../../services/homeService";
import { 
  Bars3Icon,
  HeartIcon,
  ArrowsRightLeftIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

// Import các component con
import SearchBar from './Navbar/SearchBar';
import CartButton from './Navbar/CartButton';
import UserMenu from './Navbar/UserMenu';
import CategoryMenu from './Navbar/CategoryMenu';
import MobileMenu from './Navbar/MobileMenu';

/**
 * NavbarNew Component - Navigation bar chính mới được redesign
 * Sử dụng color pattern từ Tailwind config và tích hợp với backend
 */

// Menu items - Có thể fetch từ backend
const menuItems = [
  { label: "Trang chủ", href: "/", badge: null },
  { label: "Hot Deals", href: "/deals", badge: "HOT" },
  { label: "Sản phẩm", href: "/products", badge: null },
  { label: "Thương hiệu", href: "/brands", badge: null },
  { label: "Tin tức", href: "/blog", badge: null },
  { label: "Liên hệ", href: "/contact", badge: null },
];

export default function NavbarNew({ isHomePage = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  const { user, logout } = useAuth(); // Sử dụng AuthContext
  const { cartCount } = useCart(); // Sử dụng CartContext

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch categories từ backend
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handlers
  const handleSearch = (searchTerm) => {
    // TODO: Implement search logic hoặc navigate to search page
    console.log('Searching for:', searchTerm);
    // Example: navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
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
      ${isScrolled ? 'shadow-strong' : 'shadow-soft border-b border-border'}
    `}>
      {/* Top Bar */}
      <div className="bg-gradient-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0 no-underline">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-soft group-hover:shadow-medium transition-shadow">
                <span className="text-primary-600 font-bold text-xl">S</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold text-xl drop-shadow-md">SportZone</span>
                <p className="text-primary-100 text-xs">Thể thao chuyên nghiệp</p>
              </div>
            </Link>
            
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 mx-6 max-w-xl">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Wishlist - Hidden on small mobile */}
              <Link
                to="/wishlist"
                className="
                  hidden
                  sm:flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  rounded-lg
                  hover:bg-primary-600
                  transition-colors
                  group
                  no-underline
                "
                aria-label="Danh sách yêu thích"
              >
                <HeartIcon className="w-6 h-6 text-white group-hover:text-primary-100 transition-colors" />
                <span className="hidden lg:inline text-sm font-medium text-white group-hover:text-primary-100 transition-colors">
                  Yêu thích
                </span>
              </Link>

              {/* Compare - Hidden on mobile */}
              <Link
                to="/compare"
                className="
                  hidden
                  md:flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  rounded-lg
                  hover:bg-primary-600
                  transition-colors
                  group
                  no-underline
                "
                aria-label="So sánh sản phẩm"
              >
                <ArrowsRightLeftIcon className="w-6 h-6 text-white group-hover:text-primary-100 transition-colors" />
                <span className="hidden lg:inline text-sm font-medium text-white group-hover:text-primary-100 transition-colors">
                  So sánh
                </span>
              </Link>
              
              {/* Cart Button */}
              <CartButton itemCount={cartCount} />
              
              {/* User Menu */}
              <UserMenu user={user} onLogout={handleLogout} />
                            
              {/* Become Vendor - Nút nổi bật */}
              <Link
                to="/become-vendor"
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
                  font-semibold
                  shadow-colored-secondary
                  hover:bg-secondary-600
                  transition-colors
                  group
                "
                aria-label="Kênh người bán"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4M5 11h14l-1.5 9h-11L5 11z" />
                </svg>
                <span className="hidden lg:inline">Kênh người bán</span>
              </Link>
              
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
        <div className="container mx-auto px-4 py-2">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      
      {/* Bottom Menu - Desktop */}
      <nav className="hidden lg:block bg-white border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Category Menu */}
            <CategoryMenu 
              categories={categories}
              loading={categoriesLoading}
            />
            
            {/* Main Menu */}
            <ul className="flex items-center gap-1 xl:gap-2 flex-1 justify-center">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    className="
                      relative
                      flex
                      items-center
                      gap-1
                      px-3
                      py-2
                      text-sm
                      font-medium
                      text-text-primary
                      hover:text-primary-600
                      no-underline
                      rounded-lg
                      hover:bg-primary-50
                      transition-colors
                      whitespace-nowrap
                    "
                  >
                    {item.label}
                    {item.badge && (
                      <span className="
                        px-1.5
                        py-0.5
                        text-xs
                        font-bold
                        bg-secondary-500
                        text-white
                        rounded
                        animate-pulse
                      ">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Support Hotline */}
            <div className="flex items-center gap-2 text-primary-600 font-bold border-l-2 border-primary-200 pl-4">
              <PhoneIcon className="w-5 h-5 animate-pulse" />
              <div className="hidden xl:block">
                <p className="text-xs text-text-tertiary font-normal">Hỗ trợ 24/7</p>
                <p className="text-sm">1900 888 123</p>
              </div>
              <span className="xl:hidden text-sm">1900 888 123</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        categories={categories}
        menuItems={menuItems}
        cartItemCount={cartCount}
      />
    </header>
  );
}
