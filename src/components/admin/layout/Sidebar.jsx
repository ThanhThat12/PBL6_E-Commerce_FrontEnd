// 📁 src/components/admin/layout/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Package,
  ChevronDown,
  ChevronUp,
  User,
  UserCheck,
  Shield,
  Menu,
  LayoutGrid,
  CreditCard,
  X,
  MessageSquare,
  Wallet,
  BadgeCheck,
  ArrowLeft,
  Globe 
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ onToggle }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // 👉 trạng thái thu gọn sidebar
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user from localStorage
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    console.log('📍 [Sidebar] Loading adminUser from localStorage:', adminUser);
    if (adminUser) {
      try {
        const parsedUser = JSON.parse(adminUser);
        setUser(parsedUser);
        console.log('✅ [Sidebar] Admin user loaded:', parsedUser);
      } catch (error) {
        console.error('❌ [Sidebar] Error parsing adminUser:', error);
      }
    } else {
      console.warn('⚠️ [Sidebar] No adminUser found in localStorage');
    }
  }, []);

  const handleLogout = () => {
    // Clear admin authentication
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Also clear regular auth data in case it exists
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('[Sidebar] Logout - cleared all auth data');
    // Redirect to login page
    navigate('/login');
  };

  // Thông báo cho Layout khi sidebar thay đổi trạng thái
  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed);
    }
  }, [isCollapsed, onToggle]);

  const handleDropdown = (menuName) => (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('🔸 [Sidebar] Toggle dropdown:', menuName);
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const handleNavigation = (path) => (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('🔹 [Sidebar] Navigating to:', path);
    console.log('🔹 [Sidebar] Current location:', location.pathname);
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  const isDropdownActive = (dropdown) =>
    dropdown && dropdown.some((item) => isActive(item.path));

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/admin/dashboard" },
    {
      name: "Users",
      icon: <Users size={20} />,
      dropdown: [
        { name: "Customers", icon: <User size={16} />, path: "/admin/users/customers" },
        { name: "Sellers", icon: <UserCheck size={16} />, path: "/admin/users/sellers" },
        { name: "Seller Approval", icon: <BadgeCheck size={20} />, path: "/admin/seller-registrations" },

      ],
    },
    { name: "Products", icon: <ShoppingBag size={20} />, path: "/admin/products" },
    { name: "Categories", icon: <LayoutGrid size={20} />, path: "/admin/categories" },
    { name: "Orders", icon: <Package size={20} />, path: "/admin/orders" },
    { name: "Vouchers", icon: <CreditCard size={20} />, path: "/admin/vouchers" },
    { name: "Wallet", icon: <Wallet size={20} />, path: "/admin/wallet" },
    { name: "Chat", icon: <MessageSquare size={20} />, path: "/admin/chat" },
    { name: "My Profile", icon: <User size={20} />, path: "/admin/myprofile" },
    { name: "Back to Site", icon: <Globe size={20} />, path: "/" },
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? "admin-sidebar-collapsed" : ""}`}>    
      {/* === HEADER === */}
      <div className="admin-sidebar-header">
        <div className="flex items-center justify-between w-full">
          {!isCollapsed && <span className="admin-sidebar-menu-text">Main Menu</span>}
          <button
            className="admin-sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu size={22} /> : <X size={22} />}
          </button>
        </div>
      </div>

      {/* === NAVIGATION === */}
      <nav className="admin-sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.dropdown ? (
              <button
                onClick={handleDropdown(item.name)}
                className={`admin-sidebar-link ${
                  isDropdownActive(item.dropdown) ? "active" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed &&
                  (openDropdown === item.name ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  ))}
              </button>
            ) : (
              <button
                onClick={handleNavigation(item.path)}
                className={`admin-sidebar-link ${isActive(item.path) ? "active" : ""}`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
              </button>
            )}

            {/* === DROPDOWN SLIDE === */}
            {!isCollapsed && item.dropdown && (
              <div
                className={`admin-dropdown-slide ${
                  openDropdown === item.name ? "open" : ""
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {item.dropdown.map((sub, subIndex) => (
                  <Link
                    key={subIndex}
                    to={sub.path}
                    className={`admin-dropdown-item ${
                      isActive(sub.path) ? "active" : ""
                    }`}
                    onClick={(_e) => {
                      console.log('🔹 [Sidebar] Link clicked:', sub.path);
                      console.log('🔹 [Sidebar] Current location:', location.pathname);
                    }}
                  >
                    <span className="admin-dropdown-item-icon">{sub.icon}</span>
                    <span className="admin-dropdown-item-text">{sub.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* === FOOTER === */}
      {!isCollapsed && (
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{user?.username || 'Admin'}</span>
              <span className="admin-user-email">{user?.role || 'ADMIN'}</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
