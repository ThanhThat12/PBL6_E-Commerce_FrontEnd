// src/components/Seller/Sidebar.js
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MenuOutlined, ShoppingCartOutlined, UserOutlined, TagOutlined, CreditCardOutlined, BarChartOutlined, PlusOutlined, FileTextOutlined, StarOutlined, SettingOutlined, UsergroupAddOutlined, SafetyOutlined, ShopOutlined } from '@ant-design/icons';
import './Sidebar.css'; // CSS cho sidebar

const menuItems = [
  { path: '/seller/dashboard', icon: <MenuOutlined />, label: 'Dashboard' },
  { path: '/seller/orders', icon: <ShoppingCartOutlined />, label: 'Order Management' },
  { path: '/seller/customers', icon: <UserOutlined />, label: 'Customers' },
  { path: '/seller/coupons', icon: <TagOutlined />, label: 'Coupon Code' },
  { path: '/seller/categories', icon: <TagOutlined />, label: 'Categories' },
  { path: '/seller/transactions', icon: <CreditCardOutlined />, label: 'Transaction' },
  { path: '/seller/statisticals', icon: <BarChartOutlined />, label: 'statistical' },
  { path: '/seller/add-products', icon: <PlusOutlined />, label: 'Add Products' },
  { path: '/seller/product-list', icon: <FileTextOutlined />, label: 'Product List' },
  { path: '/seller/product-reviews', icon: <StarOutlined />, label: 'Product Reviews' },
  { path: '/seller/admin', icon: <SettingOutlined />, label: 'Admin' },
  { path: '/seller/admin-role', icon: <UsergroupAddOutlined />, label: 'Admin Role' },
  { path: '/seller/control', icon: <SafetyOutlined />, label: 'Control Authority' },
   { path: '/seller/my-shop', icon: <ShopOutlined />, label: 'My Shop' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="logo">Tubao</div>
      <nav className="menu">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}>
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>
      <div className="your-shop">Your Shop</div>
    </div>
  );
};

export { Sidebar };