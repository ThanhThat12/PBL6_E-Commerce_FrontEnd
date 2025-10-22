import React, { useState } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';

/**
 * ProductFilter Component
 * Sidebar filter for products with categories, price range
 * 
 * @param {Array} categories - Available categories
 * @param {Object} filters - Current filter state
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

  const priceRanges = [
    { label: 'Under 100,000₫', min: 0, max: 100000 },
    { label: '100,000₫ - 300,000₫', min: 100000, max: 300000 },
    { label: '300,000₫ - 500,000₫', min: 300000, max: 500000 },
    { label: 'Above 500,000₫', min: 500000, max: Infinity }
  ];

  const handleCategoryChange = (categoryId) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handlePriceRangeChange = (range) => {
    const isSameRange = filters.priceMin === range.min && filters.priceMax === range.max;
    
    if (isSameRange) {
      // Remove price filter
      const newFilters = { ...filters };
      delete newFilters.priceMin;
      delete newFilters.priceMax;
      onFilterChange(newFilters);
    } else {
      // Set price filter
      onFilterChange({ 
        ...filters, 
        priceMin: range.min, 
        priceMax: range.max 
      });
    }
  };

  const hasActiveFilters = 
    (filters.categories && filters.categories.length > 0) ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <FiX className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="w-full flex items-center justify-between mb-3"
        >
          <h4 className="font-semibold text-gray-900">Category</h4>
          <FiChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform ${
              categoryOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {categoryOpen && (
          <div className="space-y-2">
            {categories.map((category) => {
              const isChecked = filters.categories?.includes(category.id);
              return (
                <label
                  key={category.id}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryChange(category.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
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
      <div>
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between mb-3"
        >
          <h4 className="font-semibold text-gray-900">Price Range</h4>
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
                filters.priceMin === range.min && filters.priceMax === range.max;
              
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

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h5 className="text-sm font-semibold text-gray-900 mb-2">
            Active Filters
          </h5>
          <div className="flex flex-wrap gap-2">
            {filters.categories?.map((catId) => {
              const category = categories.find(c => c.id === catId);
              return (
                <span
                  key={catId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                >
                  {category?.name}
                  <button
                    onClick={() => handleCategoryChange(catId)}
                    className="hover:text-primary-900"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            {filters.priceMin !== undefined && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                Price filter
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
