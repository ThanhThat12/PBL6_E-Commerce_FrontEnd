import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  HomeOutlined 
} from '@ant-design/icons';
import { Avatar, Dropdown, Badge, Button } from 'antd';
import { useAuth } from '../../../context/AuthContext';

/**
 * Seller Header Component
 * Top navigation bar with user menu
 */
const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get display name from user
  const getDisplayName = () => {
    if (!user) return 'User';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    
    return 'Seller';
  };

  // Get avatar URL
  const getAvatar = () => {
    return user?.avatar || user?.profilePicture || null;
  };

  // User dropdown menu items
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
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left side - back to buyer button */}
      <div className="flex items-center gap-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          <HomeOutlined className="text-lg" />
          <span className="text-sm font-medium">Trở về trang mua hàng</span>
        </Link>
        <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Kênh Người Bán</h1>
      </div>

      {/* Right side - notifications and user menu */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Badge count={0} showZero={false}>
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors cursor-pointer">
            <BellOutlined className="text-xl text-gray-600 hover:text-blue-600" />
          </div>
        </Badge>

        {/* User menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md">
            <Avatar 
              size={32} 
              icon={<UserOutlined />} 
              src={getAvatar()}
            />
            <span className="text-sm font-medium">{getDisplayName()}</span>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
