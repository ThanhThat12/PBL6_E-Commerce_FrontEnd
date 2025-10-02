// src/components/Seller/Header.js
import React, { useState, useEffect } from 'react';
import { BellOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../../services/userService';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin user từ localStorage khi component mount
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu dropdown cho avatar
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/seller/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => navigate('/seller/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <div className="header">
      <div className="header-left">
        <span className="current-page">Dashboard</span>
        <input type="text" placeholder="Search data, users, reports" className="search-bar" />
      </div>
      <div className="header-right">
        <BellOutlined className="icon notification-icon" />
        
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div className="user-info">
            <Avatar 
              size={40}
              src={user?.avatar || user?.profilePicture}
              icon={!user?.avatar && !user?.profilePicture ? <UserOutlined /> : null}
              className="avatar"
            />
            <span className="user-name">{user?.name || user?.username || 'User'}</span>
            <div className="dropdown-icon">▼</div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export { Header };