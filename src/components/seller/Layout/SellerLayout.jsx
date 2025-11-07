import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * SellerLayout Component
 * Main layout wrapper for all seller pages
 * Contains sidebar navigation and header
 */
const SellerLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - fixed left */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
