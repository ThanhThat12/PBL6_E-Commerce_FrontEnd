// 📁 src/components/admin/layout/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  BarChart2,
  FileText,
  Package,
  ChevronDown,
  ChevronUp,
  User,
  UserCheck,
  Shield,
  Menu,
  X
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ onToggle }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // 👉 trạng thái thu gọn sidebar
  const navigate = useNavigate();
  const location = useLocation();

  // Thông báo cho Layout khi sidebar thay đổi trạng thái
  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed);
    }
  }, [isCollapsed, onToggle]);

  const handleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const handleNavigation = (path) => {
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
        { name: "Admins", icon: <Shield size={16} />, path: "/admin/users/admins" },
      ],
    },
    { name: "Products", icon: <ShoppingBag size={20} />, path: "/admin/products" },
    { name: "Orders", icon: <Package size={20} />, path: "/admin/orders" },
    { name: "Analytics", icon: <BarChart2 size={20} />, path: "/admin/analytics" },
    { name: "Reports", icon: <FileText size={20} />, path: "/admin/reports" },
    { name: "My Profile", icon: <User size={20} />, path: "/admin/settings" },
    { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* === HEADER === */}
      <div className="sidebar-header">
        <div className="flex items-center justify-between w-full">
          {!isCollapsed && <span className="sidebar-menu-text">Main Menu</span>}
          <button
            className="toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu size={22} /> : <X size={22} />}
          </button>
        </div>
      </div>

      {/* === NAVIGATION === */}
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.dropdown ? (
              <button
                onClick={() => handleDropdown(item.name)}
                className={`sidebar-link ${
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
                onClick={() => handleNavigation(item.path)}
                className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
              </button>
            )}

            {/* === DROPDOWN SLIDE === */}
            {!isCollapsed && (
              <div
                className={`dropdown-slide ${
                  openDropdown === item.name ? "open" : ""
                }`}
              >
                {item.dropdown &&
                  item.dropdown.map((sub, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={() => handleNavigation(sub.path)}
                      className={`dropdown-item ${
                        isActive(sub.path) ? "active" : ""
                      }`}
                    >
                      {sub.icon}
                      <span>{sub.name}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* === FOOTER === */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="user-info">
            <img
              src="https://via.placeholder.com/32"
              alt="User"
              className="user-avatar"
            />
            <div className="user-details">
              <span className="user-name">Dealport</span>
              <span className="user-email">Marketing Designer</span>
            </div>
          </div>
          <button className="logout-btn">
            <LogOut size={20} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
