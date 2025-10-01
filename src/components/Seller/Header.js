// src/components/Seller/Header.js
import React from 'react';
import { BellOutlined } from '@ant-design/icons';
import './Header.css'; // CSS cho header

const Header = ({ user = { name: 'User', avatar: '/default-avatar.jpg' } }) => (
  <div className="header">
    <div className="header-left">
      <span className="current-page">Dashboard</span> {/* Dynamic dựa trên route, tạm hardcode */}
      <input type="text" placeholder="Search data, users, reports" className="search-bar" />
    </div>
    <div className="header-right">
      <BellOutlined className="icon" />
      <img src={user.avatar || '/default-avatar.jpg'} alt={user.name} className="avatar" />
      <span className="user-name">{user.name}</span>
      <div className="dropdown-icon">▼</div>
    </div>
  </div>
);

export { Header };