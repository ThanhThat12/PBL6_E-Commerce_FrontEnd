import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import './VoucherFilters.css';

const VoucherFilters = ({ onSearch, onFilter, searchTerm, setSearchTerm }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter && onFilter(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { status: '' };
    setFilters(emptyFilters);
    onFilter && onFilter(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(f => f).length;

  return (
    <div className="admin-voucher-filters">
      <div className="admin-voucher-filters-main">
        <div className="admin-voucher-search-container">
          <Search className="admin-voucher-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search vouchers..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch && onSearch(e.target.value);
            }}
            className="admin-voucher-search-input"
          />
        </div>

        <button
          className={`admin-voucher-filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filter
          {activeFiltersCount > 0 && (
            <span className="admin-voucher-filter-count">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="admin-voucher-filters-panel">
          <div className="admin-voucher-filters-header">
            <h3>Filter Vouchers</h3>
            <button className="admin-voucher-clear-filters" onClick={clearFilters}>
              <X size={16} />
              Clear All
            </button>
          </div>

          <div className="admin-voucher-filters-grid">
            <div className="admin-voucher-filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="admin-voucher-filter-select"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherFilters;
