import React, { useState, useEffect, useRef } from 'react';
import { 
  Squares2X2Icon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

/**
 * CategoryMenu Component - Dropdown menu danh mục sản phẩm
 * Dữ liệu categories sẽ được fetch từ backend
 * 
 * @param {array} categories - Danh sách categories từ backend [{ id, name, slug, icon }]
 * @param {boolean} loading - Trạng thái loading
 * @param {string} className - Custom classes
 */
const CategoryMenu = ({ 
  categories = [],
  loading = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Icon mapping cho các category (fallback nếu backend không có icon)
  const getCategoryIcon = (category) => {
    if (category.icon) {
      return category.icon;
    }
    
    // Fallback icons dựa trên tên category
    const iconMap = {
      'bóng đá': '⚽',
      'bóng rổ': '🏀',
      'tennis': '🎾',
      'cầu lông': '🏸',
      'bơi lội': '🏊',
      'chạy bộ': '🏃',
      'gym': '💪',
      'yoga': '🧘',
      'đạp xe': '🚴',
      'default': '🏅'
    };

    const categoryName = category.name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryName.includes(key)) {
        return icon;
      }
    }
    return iconMap.default;
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex 
          items-center 
          gap-2 
          px-4 
          py-2.5
          bg-white
          text-primary-600
          border
          border-primary-200
          rounded-lg
          hover:bg-primary-50
          hover:border-primary-300
          transition-all
          shadow-soft
          font-semibold
          text-sm
        "
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Squares2X2Icon className="w-5 h-5" />
        <span>Danh mục sản phẩm</span>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute 
          left-0 
          mt-2 
          w-72
          bg-white 
          border 
          border-border
          rounded-lg 
          shadow-strong
          z-50
          max-h-[480px]
          overflow-y-auto
        ">
          {loading ? (
            /* Skeleton Loading */
            <div className="py-2">
              {[...Array(5)].map((_, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            /* Empty State */
            <div className="py-8 px-4 text-center">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Squares2X2Icon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Chưa có danh mục</p>
              <p className="text-xs text-gray-500">Các danh mục sẽ được cập nhật sớm</p>
            </div>
          ) : (
            <div className="py-2">
              {categories.map((category, index) => (
                <Link
                  key={category.id || index}
                  to={`/category/${category.slug || category.id}`}
                  onClick={() => setIsOpen(false)}
                  className="
                    flex 
                    items-center 
                    gap-3 
                    px-4 
                    py-3
                    hover:bg-primary-50
                    border-b
                    border-border
                    last:border-0
                    transition-colors
                    group
                  "
                >
                  {/* Icon */}
                  <span className="
                    text-2xl 
                    w-10 
                    h-10 
                    flex 
                    items-center 
                    justify-center 
                    bg-primary-50
                    rounded-lg
                    group-hover:bg-primary-100
                    transition-colors
                  ">
                    {getCategoryIcon(category)}
                  </span>
                  
                  {/* Category Name */}
                  <div className="flex-1">
                    <span className="
                      text-sm 
                      font-medium 
                      text-text-primary
                      group-hover:text-primary-600
                      transition-colors
                    ">
                      {category.name}
                    </span>
                    {category.productCount !== undefined && (
                      <p className="text-xs text-text-tertiary">
                        {category.productCount} sản phẩm
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg 
                    className="w-4 h-4 text-text-tertiary group-hover:text-primary-600 group-hover:translate-x-1 transition-all" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}

              {/* View All Categories */}
              <Link
                to="/categories"
                onClick={() => setIsOpen(false)}
                className="
                  block
                  mt-2
                  mx-2
                  px-4 
                  py-2.5
                  text-center
                  bg-primary-500
                  text-white
                  rounded-lg
                  hover:bg-primary-600
                  transition-colors
                  font-semibold
                  text-sm
                "
              >
                Xem tất cả danh mục
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryMenu;
