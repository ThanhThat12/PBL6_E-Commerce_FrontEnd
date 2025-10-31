import React, { useState } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';

/**
 * ProductFilter Component
 * Sidebar filter for products with categories, price range, rating
 * 
 * @param {Array} categories - Available categories
 * @param {Object} filters - Current filter state {categoryId, priceMin, priceMax, minRating}
 * @param {Function} onFilterChange - Filter change handler
 * @param {Function} onClearFilters - Clear all filters
 */
const ProductFilter = ({ 
  categories = [], 
  filters = {}, 
  onFilterChange,
  onClearFilters 
}) => {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(true);

  const priceRanges = [
    { label: 'Dưới 100.000₫', min: 0, max: 100000 },
    { label: '100.000₫ - 500.000₫', min: 100000, max: 500000 },
    { label: '500.000₫ - 1.000.000₫', min: 500000, max: 1000000 },
    { label: '1.000.000₫ - 5.000.000₫', min: 1000000, max: 5000000 },
    { label: 'Trên 5.000.000₫', min: 5000000, max: Infinity }
  ];

  const ratingOptions = [
    { label: '5 sao', value: 5 },
    { label: '4 sao trở lên', value: 4 },
    { label: '3 sao trở lên', value: 3 },
  ];

  const handleCategoryChange = (categoryId) => {
    const newFilters = { ...filters };
    if (filters.categoryId === categoryId) {
      delete newFilters.categoryId;
    } else {
      newFilters.categoryId = categoryId;
    }
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (range) => {
    const isSameRange = filters.priceMin === range.min && filters.priceMax === range.max;
    
    const newFilters = { ...filters };
    if (isSameRange) {
      // Remove price filter
      delete newFilters.priceMin;
      delete newFilters.priceMax;
    } else {
      // Set price filter
      newFilters.priceMin = range.min;
      newFilters.priceMax = range.max === Infinity ? undefined : range.max;
    }
    onFilterChange(newFilters);
  };

  const handleRatingChange = (rating) => {
    const newFilters = { ...filters };
    if (filters.minRating === rating) {
      delete newFilters.minRating;
    } else {
      newFilters.minRating = rating;
    }
    onFilterChange(newFilters);
  };

  const hasActiveFilters = 
    filters.categoryId !== null && filters.categoryId !== undefined ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.minRating !== undefined;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <FiX className="w-4 h-4" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="w-full flex items-center justify-between mb-3"
        >
          <h4 className="font-semibold text-gray-900">Danh mục</h4>
          <FiChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform ${
              categoryOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {categoryOpen && (
          <div className="space-y-2">
            {categories.map((category) => {
              const isChecked = filters.categoryId === category.id;
              return (
                <label
                  key={category.id}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={isChecked}
                    onChange={() => handleCategoryChange(category.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                    {category.name}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between mb-3"
        >
          <h4 className="font-semibold text-gray-900">Khoảng giá</h4>
          <FiChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform ${
              priceOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {priceOpen && (
          <div className="space-y-2">
            {priceRanges.map((range, index) => {
              const isChecked = 
                filters.priceMin === range.min && 
                (range.max === Infinity ? filters.priceMax === undefined : filters.priceMax === range.max);
              
              return (
                <label
                  key={index}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={isChecked}
                    onChange={() => handlePriceRangeChange(range)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                    {range.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <button
          onClick={() => setRatingOpen(!ratingOpen)}
          className="w-full flex items-center justify-between mb-3"
        >
          <h4 className="font-semibold text-gray-900">Đánh giá</h4>
          <FiChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform ${
              ratingOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {ratingOpen && (
          <div className="space-y-2">
            {ratingOptions.map((option) => {
              const isChecked = filters.minRating === option.value;
              
              return (
                <label
                  key={option.value}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={isChecked}
                    onChange={() => handleRatingChange(option.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 flex items-center gap-1">
                    {option.label}
                    <span className="text-yellow-500">★</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h5 className="text-sm font-semibold text-gray-900 mb-2">
            Bộ lọc đang áp dụng
          </h5>
          <div className="flex flex-wrap gap-2">
            {filters.categoryId && categories.find(c => c.id === filters.categoryId) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                {categories.find(c => c.id === filters.categoryId)?.name}
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters.categoryId;
                    onFilterChange(newFilters);
                  }}
                  className="hover:text-primary-900"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.priceMin !== undefined && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                Khoảng giá
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters.priceMin;
                    delete newFilters.priceMax;
                    onFilterChange(newFilters);
                  }}
                  className="hover:text-primary-900"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.minRating && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                {filters.minRating} sao trở lên
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters.minRating;
                    onFilterChange(newFilters);
                  }}
                  className="hover:text-primary-900"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
