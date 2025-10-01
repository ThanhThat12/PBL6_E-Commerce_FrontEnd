// src/components/Seller/SellerLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './SellerLayout.css'; // CSS cho layout

const SellerLayout = ({ user }) => {  // user từ context, ví dụ { name: 'Dealport Designer', avatar: 'path/to/avatar.jpg' }
  return (
    <div className="seller-layout">
      <Sidebar />
      <div className="main-content">
        <Header user={user} />
        <div className="content-area">
          <Outlet />  {/* Nội dung thay đổi: Dashboard hoặc Customers */}
        </div>
      </div>
    </div>
  );
};

export { SellerLayout };