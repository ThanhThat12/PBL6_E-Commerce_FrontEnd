import React, { useState, useEffect } from "react";

const menuItems = [
  { label: "Hot Deals", href: "#" },
  { label: "Home", href: "/" },
  { label: "About", href: "#" },
  { label: "Shop", href: "#" },
  { label: "Mega Menu", href: "#" },
  { label: "Vendors", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Pages", href: "#" },
  { label: "Contact", href: "#" },
];

const categories = [
  { label: "Fruits & Vegetables", href: "#", icon: "eco" },
  { label: "Dairy & Eggs", href: "#", icon: "egg" },
  { label: "Beverages", href: "#", icon: "local_cafe" },
  { label: "Snacks", href: "#", icon: "restaurant" },
  { label: "Bakery", href: "#", icon: "bakery_dining" },
  { label: "Frozen Foods", href: "#", icon: "ac_unit" },
];

export default function NestMartNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hideBottomNav, setHideBottomNav] = useState(false);
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

  // Stop propagation to prevent closing dropdowns when clicking inside
  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  return (
    <header className={`sticky top-0 z-40 border-b bg-[#E1F5FE] shadow-sm transition-all ${isScrolled ? "shadow-md" : ""}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 border-b border-[#B3E5FC] bg-gradient-to-r from-[#1E88E5] via-[#42A5F5] to-[#90CAF9]">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#B3E5FC" />
            <path fill="#1E88E5" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7.16 16l.94-2h7.45a2 2 0 0 0 1.9-1.37l3.24-8.1A1 1 0 0 0 19.6 3H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 5 15a2 2 0 0 0 2.16 1ZM6.16 5h12.31l-2.76 6.9a1 1 0 0 1-.95.67H8.53l-2.37-4.27Z"/>
          </svg>
          <span className="drop-shadow hidden sm:inline">Nest Mart & Grocery</span>
          <span className="drop-shadow sm:hidden">Nest Mart</span>
        </a>
        
        {/* Search Bar (hidden on mobile) */}
        <form className="hidden md:flex flex-1 mx-6 max-w-xl relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="flex-1 border border-[#90CAF9] rounded-l-md px-4 py-2 focus:outline-none bg-[#E1F5FE] text-[#1E88E5]"
          />
          <button
            type="submit"
            className="bg-[#1E88E5] text-white px-5 rounded-r-md font-semibold hover:bg-[#42A5F5] transition-colors"
          >
            <span className="hidden sm:inline">Search</span>
            <span className="material-icons sm:hidden">search</span>
          </button>
        </form>
        
        {/* Right Links */}
        <div className="flex items-center gap-2 md:gap-4">
          <a 
            href="#" 
            className="hidden md:flex items-center gap-1 text-[#E1F5FE] hover:text-[#B3E5FC] transition-colors px-2 py-1 rounded-full hover:bg-[#1E88E5]/20"
          >
            <span className="material-icons text-sm md:text-base">storefront</span>
            <span className="hidden lg:inline text-sm whitespace-nowrap">Become Vendor</span>
          </a>
          
          <a 
            href="#" 
            className="flex items-center gap-1 text-[#E1F5FE] hover:text-[#B3E5FC] transition-colors px-2 py-1 rounded-full hover:bg-[#1E88E5]/20"
          >
            <span className="material-icons text-sm md:text-base">compare_arrows</span>
            <span className="hidden lg:inline text-sm">Compare</span>
          </a>
          
          <a 
            href="#" 
            className="flex items-center gap-1 text-[#E1F5FE] hover:text-[#B3E5FC] transition-colors px-2 py-1 rounded-full hover:bg-[#1E88E5]/20"
          >
            <span className="material-icons text-sm md:text-base">favorite_border</span>
            <span className="hidden lg:inline text-sm">Wishlist</span>
          </a>
          
          <a 
            href="#" 
            className="flex items-center gap-1 text-[#E1F5FE] hover:text-[#B3E5FC] transition-colors px-2 py-1 rounded-full hover:bg-[#1E88E5]/20"
            aria-label="Cart"
          >
            <span className="material-icons text-sm md:text-base">shopping_cart</span>
            <span className="hidden lg:inline text-sm">Cart</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-[#E1F5FE] text-[#1E88E5] rounded-full">3</span>
          </a>
          
          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAccountOpen((v) => !v);
              }}
              className="flex items-center gap-1 text-[#E1F5FE] hover:text-[#B3E5FC] transition-colors focus:outline-none px-2 py-1 rounded-full hover:bg-[#1E88E5]/20"
            >
              <span className="material-icons text-sm md:text-base">person</span>
              <span className="hidden lg:inline text-sm">Account</span>
              <span className="material-icons text-xs">{accountOpen ? 'expand_less' : 'expand_more'}</span>
            </button>
            
            {accountOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white border border-[#B3E5FC] rounded-md shadow-lg z-50"
                onClick={handleDropdownClick}
              >
              
                <div className="py-2 px-3 border-b border-[#B3E5FC] bg-[#E1F5FE]/50">
                  <p className="text-sm font-medium text-[#1E88E5]">Welcome to Nest Mart</p>
                </div>
                <a href="/login" className="flex items-center gap-2 px-4 py-2 hover:bg-[#E1F5FE] text-[#1E88E5]">
                  <span className="material-icons text-sm">login</span>
                  <span>Sign In</span>
                </a>
                <a href="/register" className="flex items-center gap-2 px-4 py-2 hover:bg-[#E1F5FE] text-[#1E88E5]">
                  <span className="material-icons text-sm">person_add</span>
                  <span>Register</span>
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-[#E1F5FE] text-[#1E88E5]">
                  <span className="material-icons text-sm">account_circle</span>
                  <span>My Account</span>
                </a>
                <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-[#E1F5FE] text-[#1E88E5]">
                  <span className="material-icons text-sm">shopping_bag</span>
                  <span>Orders</span>
                </a>
              </div>
            )}
          </div>
          
          {/* Hamburger for mobile */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="material-icons text-2xl text-[#E1F5FE] hover:text-[#B3E5FC] transition-colors">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>
      
      {/* Bottom Menu */}
<nav className={`hidden lg:flex items-center justify-between px-8 py-2 bg-[#B3E5FC] transition-all ${isScrolled ? "py-1" : ""} ${
  hideBottomNav 
    ? "max-h-0 overflow-hidden opacity-0 py-0 pointer-events-none" 
    : "max-h-20 opacity-100"
}`}>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCategoriesOpen((v) => !v);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E88E5] text-white rounded hover:bg-[#42A5F5] transition-colors"
          >
            <span className="material-icons">menu</span>
            <span>Browse All Categories</span>
            <span className="material-icons text-xs">{categoriesOpen ? 'expand_less' : 'expand_more'}</span>
          </button>
          
          {categoriesOpen && (
            <div 
              className="absolute left-0 mt-2 w-64 bg-white border border-[#B3E5FC] rounded shadow-lg z-20"
              onClick={handleDropdownClick}
            >
              {categories.map((category) => (
                <a 
                  key={category.label}
                  href={category.href} 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#E1F5FE] transition-colors text-[#1E88E5] border-b border-[#E1F5FE] last:border-0"
                >
                  <span className="material-icons text-[#42A5F5]">{category.icon}</span>
                  <span>{category.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
        
        <ul className="flex items-center gap-4 lg:gap-6 ml-6 flex-wrap">
          {menuItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={`text-[#1E88E5] hover:text-[#42A5F5] px-2 py-1 rounded transition-colors whitespace-nowrap ${item.href === '/home' ? 'font-medium' : ''}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        
        <div className="flex items-center gap-2 text-[#1E88E5] font-semibold">
          <span className="material-icons animate-pulse">support_agent</span>
          <span>1900888123</span>
        </div>
      </nav>
      
      {/* Tablet Menu */}
<nav className={`hidden md:flex lg:hidden items-center justify-between px-4 py-2 bg-[#B3E5FC] transition-all ${isScrolled ? "py-1" : ""} ${
  hideBottomNav 
    ? "max-h-0 overflow-hidden opacity-0 py-0 pointer-events-none" 
    : "max-h-20 opacity-100"
}`}>
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E88E5] text-white rounded hover:bg-[#42A5F5] transition-colors"
        >
          <span className="material-icons">menu</span>
          <span>Browse Categories</span>
        </button>
        
        <div className="flex items-center gap-2 text-[#1E88E5] font-semibold">
          <span className="material-icons animate-pulse">support_agent</span>
          <span>1900888123</span>
        </div>
      </nav>
      
      {/* Mobile Search Bar - Shows below header on mobile */}
<div className={`md:hidden px-4 py-2 bg-[#B3E5FC] transition-all ${
  hideBottomNav 
    ? "max-h-0 overflow-hidden opacity-0 py-0 pointer-events-none" 
    : "max-h-20 opacity-100"
}`}>
        <form className="flex w-full">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 border border-r-0 border-[#90CAF9] rounded-l-md px-3 py-2 focus:outline-none bg-white text-[#1E88E5] text-sm"
          />
          <button
            type="submit"
            className="bg-[#1E88E5] text-white px-3 rounded-r-md hover:bg-[#42A5F5] transition-colors"
          >
            <span className="material-icons">search</span>
          </button>
        </form>
      </div>
      
      {/* Mobile/Tablet Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex">
          {/* Slide-in sidebar with animation */}
          <div 
            className="w-80 max-w-[80vw] bg-[#E1F5FE] h-full overflow-y-auto animate-slide-in" 
            style={{animationDuration: '0.3s'}}
          >
            <div className="sticky top-0 z-10 bg-[#1E88E5] text-white p-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 font-bold">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="12" fill="#B3E5FC" />
                  <path fill="#1E88E5" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7.16 16l.94-2h7.45a2 2 0 0 0 1.9-1.37l3.24-8.1A1 1 0 0 0 19.6 3H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 5 15a2 2 0 0 0 2.16 1ZM6.16 5h12.31l-2.76 6.9a1 1 0 0 1-.95.67H8.53l-2.37-4.27Z"/>
                </svg>
                Nest Mart
              </a>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-1 hover:bg-[#42A5F5] rounded-full transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="p-4">
              {/* Menu Categories Section */}
              <div className="mb-6">
                <h3 className="font-medium text-[#1E88E5] mb-3 flex items-center gap-2">
                  <span className="material-icons">category</span>
                  Categories
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <a 
                      key={category.label}
                      href={category.href} 
                      className="flex items-center gap-2 p-2 rounded bg-white hover:bg-[#B3E5FC]/50 text-[#1E88E5] text-sm transition-colors"
                    >
                      <span className="material-icons text-[#42A5F5] text-sm">{category.icon}</span>
                      <span>{category.label}</span>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Main Menu Navigation */}
              <div className="mb-6">
                <h3 className="font-medium text-[#1E88E5] mb-3 flex items-center gap-2">
                  <span className="material-icons">menu</span>
                  Menu
                </h3>
                <div className="flex flex-col gap-1">
                  {menuItems.map((item) => (
                    <a 
                      key={item.label}
                      href={item.href} 
                      className="flex items-center justify-between p-2 rounded hover:bg-[#B3E5FC] text-[#1E88E5] transition-colors"
                    >
                      <span>{item.label}</span>
                      <span className="material-icons text-xs">chevron_right</span>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Quick Links */}
              <div className="mb-6">
                <h3 className="font-medium text-[#1E88E5] mb-3 flex items-center gap-2">
                  <span className="material-icons">bolt</span>
                  Quick Links
                </h3>
                <div className="flex flex-col gap-1">
                  <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-[#B3E5FC] text-[#1E88E5] transition-colors">
                    <span className="material-icons">storefront</span>
                    Become Vendor
                  </a>
                  <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-[#B3E5FC] text-[#1E88E5] transition-colors">
                    <span className="material-icons">compare_arrows</span>
                    Compare Products
                  </a>
                  <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-[#B3E5FC] text-[#1E88E5] transition-colors">
                    <span className="material-icons">favorite_border</span>
                    My Wishlist
                  </a>
                  <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-[#B3E5FC] text-[#1E88E5] transition-colors">
                    <span className="material-icons">shopping_cart</span>
                    My Cart <span className="ml-auto bg-[#42A5F5] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                  </a>
                </div>
              </div>
              
              {/* Account Section */}
              <div className="mb-6">
                <h3 className="font-medium text-[#1E88E5] mb-3 flex items-center gap-2">
                  <span className="material-icons">account_circle</span>
                  My Account
                </h3>
                <div className="flex flex-col gap-1">
                  <a href="/login" className="flex items-center gap-2 p-2 rounded hover:bg-[#B3E5FC] text-[#1E88E5] transition-colors">
                    <span className="material-icons">login</span>
                    Sign In
                  </a>
                  <a href="/register" className="flex items-center gap-2 p-2 rounded hover:bg-[#B3E5FC] text-[#1E88E5] transition-colors">
                    <span className="material-icons">person_add</span>
                    Register
                  </a>
                  <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-[#B3E5FC] text-[#1E88E5] transition-colors">
                    <span className="material-icons">shopping_bag</span>
                    Orders
                  </a>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="mt-auto pt-4 border-t border-[#B3E5FC]">
                <div className="flex items-center gap-2 text-[#1E88E5] font-medium mb-2">
                  <span className="material-icons animate-pulse">support_agent</span>
                  <span>1900888123</span>
                </div>
                <p className="text-sm text-[#1E88E5]/80">Customer Support 24/7</p>
              </div>
            </div>
          </div>
          
          {/* Backdrop to close sidebar */}
          <div 
            className="flex-1" 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
          />
        </div>
      )}

    </header>
  );
}