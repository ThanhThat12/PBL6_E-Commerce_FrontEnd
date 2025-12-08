import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import './ProductFilters.css';

const ProductFilters = ({ onSearch, onFilter, searchTerm, setSearchTerm }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priceRange: '',
    stockLevel: '',
    rating: ''
  });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Accessories', label: 'Accessories' },
    { value: 'Bags', label: 'Bags' },
    { value: 'Clothing', label: 'Clothing' },
    { value: 'Fitness Equipment', label: 'Fitness Equipment' },
    { value: 'Shoes', label: 'Shoes' },
    { value: 'Sports Equipment', label: 'Sports Equipment' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Out of Stock', label: 'Out of Stock' }
  ];

  const priceRangeOptions = [
    { value: '', label: 'All Prices' },
    { value: '0-50', label: '$0 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-500', label: '$100 - $500' },
    { value: '500-1000', label: '$500 - $1000' },
    { value: '1000+', label: '$1000+' }
  ];

  const stockLevelOptions = [
    { value: '', label: 'All Stock Levels' },
    { value: 'high', label: 'High Stock (50+)' },
    { value: 'medium', label: 'Medium Stock (11-49)' },
    { value: 'low', label: 'Low Stock (1-10)' },
    { value: 'out', label: 'Out of Stock (0)' }
  ];

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars' },
    { value: '3.5', label: '3.5+ Stars' },
    { value: '3.0', label: '3.0+ Stars' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter && onFilter(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { 
      category: '', 
      status: '', 
      priceRange: '', 
      stockLevel: '', 
      rating: '' 
    };
    setFilters(emptyFilters);
    onFilter && onFilter(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(f => f).length;

  return (
    <div className="product-filters">
      <div className="filters-main">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch && onSearch(e.target.value);
            }}
            className="search-input"
          />
        </div>
        
        <button 
          className={`filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={20} />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <span className="filter-count">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filter Products</h3>
            <button className="clear-filters" onClick={clearFilters}>
              <X size={16} />
              Clear All Filters
            </button>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="filter-select"
              >
                {priceRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Stock Level</label>
              <select
                value={filters.stockLevel}
                onChange={(e) => handleFilterChange('stockLevel', e.target.value)}
                className="filter-select"
              >
                {stockLevelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Minimum Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="filter-select"
              >
                {ratingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-summary">
            <div className="active-filters">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <span key={key} className="active-filter-tag">
                    {label}: {value}
                    <button 
                      onClick={() => handleFilterChange(key, '')}
                      className="remove-filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;