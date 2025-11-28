import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  BarChartOutlined,
  UserOutlined,
  GiftOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';

const menuItems = [
  {
    key: '/seller/dashboard',
    icon: <DashboardOutlined />,
    label: <Link to="/seller/dashboard">Dashboard</Link>,
  },
  {
    key: '/seller/products',
    icon: <ShoppingOutlined />,
    label: 'Sản phẩm',
    children: [
      {
        key: '/seller/products/list',
        label: <Link to="/seller/products/list">Danh sách</Link>,
      },
      {
        key: '/seller/products/add',
        label: <Link to="/seller/products/add">Thêm sản phẩm</Link>,
      },
    ],
  },
  {
    key: '/seller/orders',
    icon: <ShoppingCartOutlined />,
    label: <Link to="/seller/orders">Đơn hàng</Link>,
  },
  {
    key: '/seller/my-shop',
    icon: <ShopOutlined />,
    label: <Link to="/seller/my-shop">Cửa hàng của tôi</Link>,
  },
  {
    key: '/seller/statistical',
    icon: <BarChartOutlined />,
    label: <Link to="/seller/statistical">Thống kê</Link>,
  },
  {
    key: '/seller/customers',
    icon: <UserOutlined />,
    label: <Link to="/seller/customers">Khách hàng</Link>,
  },
  {
    key: '/seller/vouchers',
    icon: <GiftOutlined />,
    label: <Link to="/seller/vouchers">Voucher</Link>,
  },
  {
    key: '/seller/reviews',
    icon: <UserOutlined />,
    label: <Link to="/seller/reviews">Đánh giá</Link>,
  },
  {
    key: '/seller/refunds',
    icon: <ShoppingCartOutlined />,
    label: <Link to="/seller/refunds">Hoàn tiền</Link>,
  },
];

/**
 * Seller Sidebar Component
 * Navigation menu for seller module
 */
const Sidebar = () => {
  const location = useLocation();

  // Get active menu keys based on current path
  const getSelectedKeys = () => {
    return [location.pathname];
  };

  const getOpenKeys = () => {
    // Auto-expand "Sản phẩm" menu if on products pages
    if (location.pathname.startsWith('/seller/products')) {
      return ['/seller/products'];
    }
    return [];
  };

  return (
    <div className="h-full bg-white border-r">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b">
        <Link to="/seller/dashboard" className="text-2xl font-bold text-blue-600">
          Tubao Seller
        </Link>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        className="border-0"
        style={{ height: 'calc(100% - 64px)', overflowY: 'auto' }}
      />
    </div>
  );
};

export default Sidebar;
