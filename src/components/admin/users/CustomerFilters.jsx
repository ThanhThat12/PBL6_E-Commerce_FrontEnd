import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import './CustomerFilters.css';

const CustomerFilters = ({ onSearch, onFilter, searchTerm, setSearchTerm }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    orderCount: '',
    totalSpend: ''
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { status: '', orderCount: '', totalSpend: '' };
    setFilters(emptyFilters);
    onFilter(emptyFilters);
  };

  return (
    <div className="customer-filters">
      <div className="filters-main">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button 
          className={`filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filter
          {Object.values(filters).some(f => f) && (
            <span className="filter-count">
              {Object.values(filters).filter(f => f).length}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filter Customers</h3>
            <button className="clear-filters" onClick={clearFilters}>
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
              <label>Min Order Count</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={filters.orderCount}
                onChange={(e) => handleFilterChange('orderCount', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Min Total Spend</label>
              <input
                type="number"
                placeholder="e.g. 1000"
                value={filters.totalSpend}
                onChange={(e) => handleFilterChange('totalSpend', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFilters;