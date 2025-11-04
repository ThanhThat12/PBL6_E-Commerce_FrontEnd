import React, { useState, useMemo } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import Table from './Table';

/**
 * DataTable Component - Advanced table với sorting, filtering, pagination
 * 
 * @param {array} columns - Cấu hình cột [{ key, label, sortable, filterable, render }]
 * @param {array} data - Dữ liệu hiển thị
 * @param {boolean} searchable - Hiển thị search box
 * @param {boolean} pagination - Hiển thị pagination
 * @param {number} itemsPerPage - Số items mỗi trang
 * @param {string} searchPlaceholder - Placeholder cho search
 * @param {function} onRowClick - Callback khi click vào row
 * @param {string} className - Custom classes
 */
const DataTable = ({ 
  columns = [],
  data = [],
  searchable = true,
  pagination = true,
  itemsPerPage = 10,
  searchPlaceholder = 'Tìm kiếm...',
  onRowClick,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);

  // Handle sorting
  const handleSort = (key) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  // Filter data by search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(row => {
      return columns.some(column => {
        const value = row[column.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  // Update columns with sort indicator
  const enhancedColumns = columns.map(column => ({
    ...column,
    label: (
      <div 
        className={`flex items-center gap-2 ${column.sortable ? 'cursor-pointer select-none' : ''}`}
        onClick={() => column.sortable && handleSort(column.key)}
      >
        <span>{column.label}</span>
        {column.sortable && (
          <span className="inline-flex flex-col">
            {sortConfig.key === column.key && sortConfig.direction === 'asc' ? (
              <ChevronUpIcon className="w-4 h-4 text-primary-500" />
            ) : sortConfig.key === column.key && sortConfig.direction === 'desc' ? (
              <ChevronDownIcon className="w-4 h-4 text-primary-500" />
            ) : (
              <div className="w-4 h-4 text-neutral-400 flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            )}
          </span>
        )}
      </div>
    )
  }));

  return (
    <div className={className}>
      {/* Search Bar */}
      {searchable && (
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-text-tertiary" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              placeholder={searchPlaceholder}
              className="
                block 
                w-full 
                pl-10 
                pr-3 
                py-2.5
                border 
                border-border 
                rounded-lg
                text-sm
                focus:ring-2 
                focus:ring-primary-500 
                focus:border-primary-500
                transition-colors
              "
            />
          </div>
          
          {/* Info */}
          <div className="text-sm text-text-tertiary">
            Hiển thị <span className="font-semibold text-text-primary">{paginatedData.length}</span> / <span className="font-semibold text-text-primary">{sortedData.length}</span> kết quả
          </div>
        </div>
      )}

      {/* Table */}
      <Table
        columns={enhancedColumns}
        data={paginatedData}
        striped
        hoverable
        bordered
        onRowClick={onRowClick}
      />

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          {/* Page Info */}
          <div className="text-sm text-text-tertiary">
            Trang <span className="font-semibold text-text-primary">{currentPage}</span> / <span className="font-semibold text-text-primary">{totalPages}</span>
          </div>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="
                px-3 
                py-2 
                border 
                border-border 
                rounded-lg
                text-sm
                font-medium
                text-text-primary
                hover:bg-background-secondary
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition-colors
              "
            >
              Trước
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`
                      w-10 
                      h-10 
                      rounded-lg
                      text-sm
                      font-medium
                      transition-colors
                      ${currentPage === pageNum
                        ? 'bg-primary-500 text-white shadow-colored-primary'
                        : 'text-text-primary hover:bg-background-secondary border border-border'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="
                px-3 
                py-2 
                border 
                border-border 
                rounded-lg
                text-sm
                font-medium
                text-text-primary
                hover:bg-background-secondary
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition-colors
              "
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
