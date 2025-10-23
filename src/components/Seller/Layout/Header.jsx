// src/components/Seller/Header.js
import React, { useState, useEffect } from 'react';
import { BellOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../../services/userService';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Kiểm tra xem có token không
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Lấy thông tin user từ localStorage trước
      const localUser = getCurrentUser();
      if (localUser) {
        setUser(localUser);
      }

      // Sau đó fetch thông tin mới nhất từ API
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } catch (apiError) {
        // Nếu API lỗi, vẫn dùng data từ localStorage
        console.log('Using cached user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Nếu có lỗi nghiêm trọng, redirect về login
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hàm để lấy tên hiển thị
  const getDisplayName = () => {
    if (!user) return 'User';
    
    // Ưu tiên: firstName + lastName > username > email
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.username) {
      return user.username;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  // Hàm để lấy avatar
  const getAvatar = () => {
    return user?.avatar || user?.profilePicture || null;
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
        
        {loading ? (
          <div className="user-info">
            <Avatar size={40} icon={<UserOutlined />} />
            <span className="user-name">Loading...</span>
          </div>
        ) : (
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <div className="user-info">
              <Avatar 
                size={40}
                src={getAvatar()}
                icon={!getAvatar() ? <UserOutlined /> : null}
                className="avatar"
              />
              <span className="user-name">{getDisplayName()}</span>
              {user?.role && (
                <span className="user-role" style={{ fontSize: '12px', color: '#888', marginLeft: '5px' }}>
                  (Seller)
                </span>
              )}
              <div className="dropdown-icon">▼</div>
            </div>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export { Header };