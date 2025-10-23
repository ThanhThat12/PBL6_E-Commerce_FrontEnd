// 📁 src/components/admin/layout/Header.jsx
import React, { useState } from "react";
import { Bell, Search, Settings, LogOut, User } from "lucide-react";

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="flex items-center justify-between bg-white shadow-sm border-b border-gray-200 px-6 h-16">
      {/* --- Left: Title --- */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-green-600">
          DEALPORT
        </h1>
      </div>

      {/* --- Middle: Enhanced Search Bar --- */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search data, users, or reports"
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:bg-white focus:outline-none transition-all"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* --- Right: Icons + Profile --- */}
      <div className="flex items-center gap-4">
        {/* Search Icon */}
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <Search size={20} />
        </button>

        {/* Notification Bell */}
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <Bell size={20} />
        </button>

        {/* Settings */}
        <button className="p-2 text-gray-600 hover:text-gray-800">
          <Settings size={20} />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2"
          >
            <img
              src="https://via.placeholder.com/32"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <User size={16} />
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Settings size={16} />
                Settings
              </button>
              <hr className="my-2 border-gray-100" />
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
