import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * SearchBar Component - Thanh tìm kiếm sản phẩm
 * 
 * @param {function} onSearch - Callback khi submit search (nhận search term)
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Custom classes
 */
const SearchBar = ({ 
  onSearch,
  placeholder = 'Tìm kiếm sản phẩm thể thao...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex-1 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="
            w-full
            pl-4 
            pr-12
            py-2.5
            border 
            border-border
            rounded-lg
            text-sm
            text-text-primary
            placeholder:text-text-tertiary
            focus:outline-none
            focus:ring-2
            focus:ring-primary-500
            focus:border-primary-500
            transition-all
            bg-white
          "
        />
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
  );
};

export default SearchBar;
