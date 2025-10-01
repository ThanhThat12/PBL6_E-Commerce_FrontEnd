import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import colorPattern from "../../../styles/colorPattern";

const menuItems = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Shop", href: "#", icon: "store" },
  { label: "Categories", href: "#", icon: "category" },
  { label: "Deals", href: "#", icon: "local_fire_department" },
  { label: "About", href: "#", icon: "info" },
  { label: "Contact", href: "#", icon: "contact_support" },
];

const sportCategories = [
  { label: "Fitness Equipment", href: "#", icon: "fitness_center" },
  { label: "Team Sports", href: "#", icon: "sports_soccer" },
  { label: "Outdoor Adventures", href: "#", icon: "landscape" },
  { label: "Water Sports", href: "#", icon: "pool" },
  { label: "Winter Sports", href: "#", icon: "downhill_skiing" },
  { label: "Athletic Wear", href: "#", icon: "checkroom" },
];

export default function SportZoneNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hideBottomNav, setHideBottomNav] = useState(false);
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setAccountOpen(false);
      setCategoriesOpen(false);
    };

    if (accountOpen || categoriesOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [accountOpen, categoriesOpen]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      setHideBottomNav(window.scrollY > 150);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Stop propagation to prevent closing dropdowns
  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  return (
    <header className={`sticky top-0 z-40 border-b shadow-sm transition-all duration-300 ${
      isScrolled ? "shadow-lg" : ""
    }`} style={{ 
      backgroundColor: colorPattern.background,
      borderColor: colorPattern.border 
    }}>
      
      {/* Top Bar */}
      <div className="px-4 lg:px-8 py-3 border-b transition-all duration-300" style={{
        background: `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.primaryLight} 50%, ${colorPattern.secondary} 100%)`,
        borderColor: colorPattern.borderLight
      }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" style={{
                background: `linear-gradient(45deg, ${colorPattern.secondary}, ${colorPattern.gold})`
              }}>
                <span className="material-icons text-white font-bold">sports</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse" style={{
                backgroundColor: colorPattern.accent
              }}></div>
            </div>
            <div className="text-white">
              <div className="font-bold text-xl tracking-tight drop-shadow-sm hidden sm:block">
                SportZone
              </div>
              <div className="text-xs opacity-90 hidden lg:block">
                Your Athletic Advantage
              </div>
            </div>
          </Link>
          
          {/* Search Bar */}
          <form className="hidden md:flex flex-1 mx-8 max-w-2xl relative group">
            <div className="relative flex-1">
              <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search for sports equipment, gear, apparel..."
                className="w-full pl-10 pr-4 py-3 rounded-l-lg border-0 focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                style={{
                  backgroundColor: colorPattern.background,
                  color: colorPattern.text,
                  focusRingColor: colorPattern.accent
                }}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-r-lg font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
              style={{
                backgroundColor: colorPattern.secondary,
                ':hover': { backgroundColor: colorPattern.secondaryDark }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.secondaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = colorPattern.secondary}
            >
              <span className="hidden sm:inline">Search</span>
              <span className="material-icons sm:hidden">search</span>
            </button>
          </form>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            
            {/* Wishlist */}
            <Link 
              to="/wishlist"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10 group"
            >
              <div className="relative">
                <span className="material-icons group-hover:scale-110 transition-transform">favorite_border</span>
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white" style={{
                  backgroundColor: colorPattern.accent
                }}>2</span>
              </div>
              <span className="hidden lg:inline text-sm font-medium">Wishlist</span>
            </Link>
            
            {/* Cart */}
            <Link 
              to="/cart"
              className="flex items-center gap-2 px-3 py-2 rounded-full text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10 group"
            >
              <div className="relative">
                <span className="material-icons group-hover:scale-110 transition-transform">shopping_cart</span>
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold animate-pulse" style={{
                  backgroundColor: colorPattern.secondary,
                  color: colorPattern.textWhite
                }}>3</span>
              </div>
              <span className="hidden lg:inline text-sm font-medium">Cart</span>
            </Link>
            
            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAccountOpen(!accountOpen);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <span className="material-icons">account_circle</span>
                <span className="hidden lg:inline text-sm font-medium">Account</span>
                <span className={`material-icons text-sm transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              
              {accountOpen && (
                <div 
                  className="absolute right-0 mt-3 w-64 rounded-xl shadow-2xl border backdrop-blur-sm z-50 animate-in slide-in-from-top-2 duration-200"
                  style={{
                    backgroundColor: colorPattern.background,
                    borderColor: colorPattern.border
                  }}
                  onClick={handleDropdownClick}
                >
                  {/* Header */}
                  <div className="p-4 border-b" style={{
                    background: `linear-gradient(135deg, ${colorPattern.primary}10, ${colorPattern.secondary}10)`,
                    borderColor: colorPattern.borderLight
                  }}>
                    <p className="font-semibold" style={{ color: colorPattern.primary }}>
                      Welcome to SportZone
                    </p>
                    <p className="text-xs" style={{ color: colorPattern.textLight }}>
                      Your athletic journey starts here
                    </p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-2">
                    <Link 
                      to="/login" 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                      style={{ color: colorPattern.text }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span className="material-icons" style={{ color: colorPattern.primary }}>login</span>
                      <span className="font-medium">Sign In</span>
                    </Link>
                    
                    <Link 
                      to="/register" 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                      style={{ color: colorPattern.text }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span className="material-icons" style={{ color: colorPattern.secondary }}>person_add</span>
                      <span className="font-medium">Register</span>
                    </Link>
                    
                    <div className="h-px my-2" style={{ backgroundColor: colorPattern.borderLight }}></div>
                    
                    <a 
                      href="#" 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                      style={{ color: colorPattern.text }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span className="material-icons" style={{ color: colorPattern.accent }}>account_circle</span>
                      <span className="font-medium">My Profile</span>
                    </a>
                    
                    <a 
                      href="#" 
                      className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                      style={{ color: colorPattern.text }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span className="material-icons" style={{ color: colorPattern.gold }}>shopping_bag</span>
                      <span className="font-medium">My Orders</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-full text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className="material-icons text-2xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <nav className={`hidden lg:flex items-center justify-between px-8 py-3 transition-all duration-300 ${
        isScrolled ? "py-2" : ""
      } ${
        hideBottomNav 
          ? "max-h-0 overflow-hidden opacity-0 py-0 pointer-events-none" 
          : "max-h-20 opacity-100"
      }`} style={{ backgroundColor: colorPattern.backgroundGray }}>
        
        <div className="flex items-center max-w-7xl mx-auto w-full">
          
          {/* Categories Dropdown */}
          <div className="relative mr-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCategoriesOpen(!categoriesOpen);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ backgroundColor: colorPattern.primary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.primaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = colorPattern.primary}
            >
              <span className="material-icons">category</span>
              <span>Browse Sports</span>
              <span className={`material-icons text-sm transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            
            {categoriesOpen && (
              <div 
                className="absolute left-0 mt-2 w-80 rounded-xl shadow-2xl border backdrop-blur-sm z-30 animate-in slide-in-from-top-2 duration-200"
                style={{
                  backgroundColor: colorPattern.background,
                  borderColor: colorPattern.border
                }}
                onClick={handleDropdownClick}
              >
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {sportCategories.map((category, index) => (
                      <a 
                        key={category.label}
                        href={category.href} 
                        className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:shadow-md group"
                        style={{ 
                          color: colorPattern.text,
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = colorPattern.backgroundGray;
                          e.target.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.transform = 'translateX(0px)';
                        }}
                      >
                        <span className="material-icons text-lg group-hover:scale-110 transition-transform" style={{
                          color: [colorPattern.primary, colorPattern.secondary, colorPattern.accent, colorPattern.gold][index % 4]
                        }}>
                          {category.icon}
                        </span>
                        <span className="font-medium text-sm">{category.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Main Navigation */}
          <ul className="flex items-center gap-8 flex-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                {item.href === "/" ? (
                  <Link
                    to={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 ${
                      location.pathname === item.href ? 'shadow-md' : ''
                    }`}
                    style={{
                      color: location.pathname === item.href ? colorPattern.textWhite : colorPattern.text,
                      backgroundColor: location.pathname === item.href ? colorPattern.secondary : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (location.pathname !== item.href) {
                        e.target.style.backgroundColor = colorPattern.backgroundGray;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== item.href) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span className="material-icons text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                    style={{ color: colorPattern.text }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <span className="material-icons text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
          
          {/* Support Contact */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{
            backgroundColor: colorPattern.backgroundGray,
            color: colorPattern.primary
          }}>
            <span className="material-icons animate-pulse" style={{ color: colorPattern.secondary }}>
              support_agent
            </span>
            <div className="text-right">
              <div className="font-bold text-sm">1900 888 123</div>
              <div className="text-xs" style={{ color: colorPattern.textLight }}>24/7 Support</div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Search Bar */}
      <div className={`md:hidden px-4 py-3 transition-all duration-300 ${
        hideBottomNav 
          ? "max-h-0 overflow-hidden opacity-0 py-0 pointer-events-none" 
          : "max-h-20 opacity-100"
      }`} style={{ backgroundColor: colorPattern.backgroundGray }}>
        <form className="flex w-full gap-2">
          <div className="relative flex-1">
            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search sports equipment..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm"
              style={{
                backgroundColor: colorPattern.background,
                borderColor: colorPattern.border,
                color: colorPattern.text
              }}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
            style={{ backgroundColor: colorPattern.secondary }}
          >
            <span className="material-icons">search</span>
          </button>
        </form>
      </div>
      
      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          <div 
            className="absolute left-0 top-0 h-full w-80 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-300"
            style={{ backgroundColor: colorPattern.background }}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{
              background: `linear-gradient(135deg, ${colorPattern.primary}, ${colorPattern.primaryLight})`,
              borderColor: colorPattern.border
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                    background: `linear-gradient(45deg, ${colorPattern.secondary}, ${colorPattern.gold})`
                  }}>
                    <span className="material-icons text-white">sports</span>
                  </div>
                  <div className="text-white">
                    <div className="font-bold text-lg">SportZone</div>
                    <div className="text-xs opacity-90">Mobile Menu</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              
              {/* Sport Categories */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: colorPattern.primary }}>
                  <span className="material-icons">sports</span>
                  Sport Categories
                </h3>
                <div className="space-y-1">
                  {sportCategories.map((category, index) => (
                    <a 
                      key={category.label}
                      href={category.href} 
                      className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                      style={{ color: colorPattern.text }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span className="material-icons" style={{
                        color: [colorPattern.primary, colorPattern.secondary, colorPattern.accent, colorPattern.gold][index % 4]
                      }}>
                        {category.icon}
                      </span>
                      <span className="font-medium">{category.label}</span>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Main Menu */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: colorPattern.primary }}>
                  <span className="material-icons">menu</span>
                  Navigation
                </h3>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    item.href === "/" ? (
                      <Link 
                        key={item.label}
                        to={item.href} 
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                          location.pathname === item.href ? 'font-bold' : ''
                        }`}
                        style={{
                          color: location.pathname === item.href ? colorPattern.secondary : colorPattern.text,
                          backgroundColor: location.pathname === item.href ? colorPattern.backgroundGray : 'transparent'
                        }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="material-icons">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <a 
                        key={item.label}
                        href={item.href} 
                        className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                        style={{ color: colorPattern.text }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <span className="material-icons">{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    )
                  ))}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: colorPattern.primary }}>
                  <span className="material-icons">bolt</span>
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  <Link 
                    to="/wishlist" 
                    className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                    style={{ color: colorPattern.text }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="material-icons" style={{ color: colorPattern.accent }}>favorite_border</span>
                    <span>My Wishlist</span>
                    <span className="ml-auto px-2 py-1 rounded-full text-xs text-white" style={{
                      backgroundColor: colorPattern.accent
                    }}>2</span>
                  </Link>
                  
                  <Link 
                    to="/cart" 
                    className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                    style={{ color: colorPattern.text }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="material-icons" style={{ color: colorPattern.secondary }}>shopping_cart</span>
                    <span>Shopping Cart</span>
                    <span className="ml-auto px-2 py-1 rounded-full text-xs text-white animate-pulse" style={{
                      backgroundColor: colorPattern.secondary
                    }}>3</span>
                  </Link>
                </div>
              </div>
              
              {/* Account Section */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: colorPattern.primary }}>
                  <span className="material-icons">account_circle</span>
                  My Account
                </h3>
                <div className="space-y-1">
                  <Link 
                    to="/login" 
                    className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                    style={{ color: colorPattern.text }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="material-icons" style={{ color: colorPattern.primary }}>login</span>
                    <span>Sign In</span>
                  </Link>
                  
                  <Link 
                    to="/register" 
                    className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                    style={{ color: colorPattern.text }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = colorPattern.backgroundGray}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="material-icons" style={{ color: colorPattern.secondary }}>person_add</span>
                    <span>Register</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t" style={{ borderColor: colorPattern.border }}>
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{
                backgroundColor: colorPattern.backgroundGray
              }}>
                <span className="material-icons animate-pulse" style={{ color: colorPattern.secondary }}>
                  support_agent
                </span>
                <div>
                  <div className="font-bold" style={{ color: colorPattern.primary }}>24/7 Support</div>
                  <div className="text-sm" style={{ color: colorPattern.textLight }}>1900 888 123</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}