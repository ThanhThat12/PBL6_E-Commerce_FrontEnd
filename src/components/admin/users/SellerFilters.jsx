import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import './SellerFilters.css';

const SellerFilters = ({ onSearch, onFilter, searchTerm, setSearchTerm }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    products: '',
    sales: '',
    category: ''
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Suspended', label: 'Suspended' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Fashion', label: 'Fashion' },
    { value: 'Home & Garden', label: 'Home & Garden' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Books', label: 'Books' }
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
    const emptyFilters = { status: '', rating: '', products: '', sales: '', category: '' };
    setFilters(emptyFilters);
    onFilter && onFilter(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(f => f).length;

  return (
    <div className="seller-filters">
      <div className="filters-main">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search sellers..."
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
          <Filter size={20} />
          Filter
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
            <h3>Filter Sellers</h3>
            <button className="clear-filters" onClick={clearFilters}>
              <X size={16} />
              Clear All
            </button>
          </div>
          
          <div className="filters-grid">
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

            <div className="filter-group">
              <label>Min Products</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={filters.products}
                onChange={(e) => handleFilterChange('products', e.target.value)}
                className="filter-input"
                min="0"
              />
            </div>

            <div className="filter-group">
              <label>Min Sales ($)</label>
              <input
                type="number"
                placeholder="e.g. 10000"
                value={filters.sales}
                onChange={(e) => handleFilterChange('sales', e.target.value)}
                className="filter-input"
                min="0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerFilters;