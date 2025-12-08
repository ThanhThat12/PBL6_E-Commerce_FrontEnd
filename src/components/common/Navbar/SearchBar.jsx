import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { 
  saveRecentSearch,
  trackSearch,
} from '../../../services/searchService';

/**
 * SearchBar Component - Thanh tìm kiếm sản phẩm
 * 
 * Features:
 * - Tìm kiếm khi nhấn Enter hoặc click nút tìm kiếm
 * - Tìm kiếm theo tên sản phẩm VÀ tên shop
 * - Voice search (Phase 3)
 * - Không hiển thị dropdown suggestions tự động
 * 
 * @param {function} onSearch - Callback khi submit search (nhận search term)
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Custom classes
 * @param {string} initialValue - Initial search value
 */
const SearchBar = ({ 
  onSearch,
  placeholder = 'Tìm kiếm sản phẩm, shop...',
  className = '',
  initialValue = ''
}) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  
  // State
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Handle form submit (Enter or click button)
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    
    if (term) {
      // Save to recent searches (localStorage)
      saveRecentSearch(term);
      
      // Track search for analytics (fire and forget)
      trackSearch(term, 0);
      
      // Callback or navigate to search results
      if (onSearch) {
        onSearch(term);
      } else {
        navigate(`/products?keyword=${encodeURIComponent(term)}`);
      }
    }
  }, [searchTerm, onSearch, navigate]);

  // Handle clear input
  const handleClear = useCallback(() => {
    setSearchTerm('');
    inputRef.current?.focus();
  }, []);

  return (
    <div className={`relative flex-1 ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          {/* Search icon (left) */}
          <div className="absolute left-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className="
              w-full
              pl-10
              pr-20
              py-2.5
              border 
              border-gray-200
              rounded-lg
              text-sm
              text-gray-900
              placeholder:text-gray-400
              focus:outline-none
              focus:ring-2
              focus:ring-primary-500
              focus:border-primary-500
              transition-all
              bg-white
            "
          />
          
          {/* Clear button (when has text) */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-14 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
          
          {/* Search button */}
          <button
            type="submit"
            className="
              absolute
              right-0
              h-full
              px-4
              bg-primary-500
              text-white
              rounded-r-lg
              hover:bg-primary-600
              transition-colors
              flex
              items-center
              justify-center
            "
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
