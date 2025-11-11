// 📁 src/components/admin/layout/Layout.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Callback để nhận trạng thái từ Sidebar
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Tính toán width và margin động dựa trên trạng thái
  const sidebarWidth = isSidebarCollapsed ? "w-20" : "w-64";
  const contentMargin = isSidebarCollapsed ? "ml-20" : "ml-64";
  const headerLeft = isSidebarCollapsed ? "left-20" : "left-64";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 1. SIDEBAR - Bên trái cố định với transition */}
      <aside className={`${sidebarWidth} fixed left-0 top-0 h-full z-30 transition-all duration-300`}>
        <Sidebar onToggle={handleSidebarToggle} />
      </aside>

      {/* 2. Phần bên phải (Header + Content) với transition */}
      <div className={`flex-1 flex flex-col ${contentMargin} transition-all duration-300`}>
        {/* 2.1 HEADER - Ở trên cố định */}
        <header className={`h-16 fixed top-0 ${headerLeft} right-0 z-20 bg-white shadow-sm border-b border-gray-200 transition-all duration-300`}>
          <Header />
        </header>

        {/* 2.2 CONTENT - Phần còn lại */}
        <main className="flex-1 mt-16 p-6 overflow-y-auto">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
