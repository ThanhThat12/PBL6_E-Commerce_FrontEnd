import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ClockIcon, 
  FireIcon,
  XMarkIcon,
  TagIcon,
  BuildingStorefrontIcon,
  TrashIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { getProductImage } from '../../../utils/placeholderImage';

/**
 * SearchSuggestions Component - Dropdown suggestions for search
 * 
 * @param {Object} suggestions - Suggestion data from API
 * @param {Array} recentSearches - User's recent searches from localStorage
 * @param {Array} serverHistory - User's search history from server (authenticated)
 * @param {boolean} isAuthenticated - Whether user is logged in
 * @param {boolean} showRecent - Whether to show recent/trending (when query is empty)
 * @param {function} onSelectQuery - Callback when user selects a query suggestion
 * @param {function} onSelectProduct - Callback when user selects a product
 * @param {function} onSelectCategory - Callback when user selects a category
 * @param {function} onRemoveRecent - Callback to remove a recent search
 * @param {function} onClearRecent - Callback to clear all recent searches
 * @param {function} onRemoveServerHistory - Callback to remove a server history item
 * @param {function} onClearServerHistory - Callback to clear all server history
 * @param {boolean} isLoading - Whether suggestions are loading
 */
const SearchSuggestions = ({
  suggestions = {},
  recentSearches = [],
  serverHistory = [],
  isAuthenticated = false,
  showRecent = false,
  onSelectQuery,
  onSelectProduct,
  onSelectCategory,
  onRemoveRecent,
  onClearRecent,
  onRemoveServerHistory,
  onClearServerHistory,
  isLoading = false
}) => {
  const navigate = useNavigate();
  
  const {
    queries = [],
    products = [],
    categories = [],
    trending = [],
    didYouMean
  } = suggestions;

  // Combine recent searches: server history (if authenticated) + local recent
  const combinedRecent = isAuthenticated 
    ? [...new Set([...serverHistory, ...recentSearches])].slice(0, 10)
    : recentSearches;

  const hasContent = queries.length > 0 || products.length > 0 || categories.length > 0 || 
                     trending.length > 0 || combinedRecent.length > 0 || didYouMean;

  if (!hasContent && !isLoading) {
    return null;
  }

  // Handle product click - navigate to product detail
  const handleProductClick = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    navigate(`/product/${product.id}`);
  };

  // Handle category click - navigate to product list with category filter
  const handleCategoryClick = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    navigate(`/products?categoryId=${category.id}`);
  };

  // Format price to VND
  const formatPrice = (price) => {
    if (!price) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-y-auto">
      
      {/* Loading state */}
      {isLoading && (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-sm">Đang tìm kiếm...</p>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Did you mean (typo correction) */}
          {didYouMean && (
            <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100">
              <button
                onClick={() => onSelectQuery && onSelectQuery(didYouMean)}
                className="text-sm text-yellow-800 hover:text-yellow-900"
              >
                Ý bạn là: <span className="font-semibold text-primary-600">{didYouMean}</span>?
              </button>
            </div>
          )}

          {/* Recent searches (when no query) */}
          {showRecent && combinedRecent.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  {isAuthenticated ? (
                    <>
                      <CloudIcon className="w-4 h-4" />
                      Lịch sử tìm kiếm
                    </>
                  ) : (
                    <>
                      <ClockIcon className="w-4 h-4" />
                      Tìm kiếm gần đây
                    </>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {isAuthenticated && onClearServerHistory && (
                    <button
                      onClick={onClearServerHistory}
                      className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                      title="Xóa lịch sử đồng bộ"
                    >
                      <TrashIcon className="w-3 h-3" />
                      Xóa tất cả
                    </button>
                  )}
                  {!isAuthenticated && onClearRecent && (
                    <button
                      onClick={onClearRecent}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {combinedRecent.slice(0, 5).map((query, index) => {
                  const isServerItem = isAuthenticated && serverHistory.includes(query);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between group"
                    >
                      <button
                        onClick={() => onSelectQuery && onSelectQuery(query)}
                        className="flex-1 text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
                      >
                        {isServerItem ? (
                          <CloudIcon className="w-4 h-4 text-blue-400" />
                        ) : (
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                        )}
                        {query}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isServerItem && onRemoveServerHistory) {
                            onRemoveServerHistory(query);
                          } else if (onRemoveRecent) {
                            onRemoveRecent(query);
                          }
                        }}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trending searches */}
          {trending.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
                <FireIcon className="w-4 h-4 text-orange-500" />
                Tìm kiếm phổ biến
              </span>
              <div className="flex flex-wrap gap-2">
                {trending.slice(0, 6).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectQuery && onSelectQuery(item.query)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-full text-sm text-gray-700 transition-colors flex items-center gap-1"
                  >
                    {index < 3 && <FireIcon className="w-3 h-3 text-orange-500" />}
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Query suggestions */}
          {queries.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
                <MagnifyingGlassIcon className="w-4 h-4" />
                Gợi ý tìm kiếm
              </span>
              <div className="space-y-1">
                {queries.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectQuery && onSelectQuery(item.text)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                    <span 
                      dangerouslySetInnerHTML={{ __html: item.highlightedText || item.text }}
                      className="[&>b]:text-primary-600 [&>b]:font-semibold"
                    />
                    {item.estimatedCount && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {item.estimatedCount} kết quả
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category suggestions */}
          {categories.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
                <TagIcon className="w-4 h-4" />
                Danh mục
              </span>
              <div className="space-y-1">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-50 text-sm text-gray-700 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-gray-400" />
                      <span 
                        dangerouslySetInnerHTML={{ __html: category.highlightedName || category.name }}
                        className="[&>b]:text-primary-600 [&>b]:font-semibold"
                      />
                    </span>
                    <span className="text-xs text-gray-400">
                      {category.productCount} sản phẩm
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product suggestions (mini cards) */}
          {products.length > 0 && (
            <div className="p-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-2">
                <BuildingStorefrontIcon className="w-4 h-4" />
                Sản phẩm gợi ý
              </span>
              <div className="space-y-2">
                {products.map((product, index) => (
                  <button
                    key={index}
                    onClick={() => handleProductClick(product)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* Product image */}
                    <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <img
                        src={getProductImage({ mainImage: product.image })}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = getProductImage({});
                        }}
                      />
                    </div>
                    
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm font-medium text-gray-900 truncate [&>b]:text-primary-600 [&>b]:font-semibold"
                        dangerouslySetInnerHTML={{ __html: product.highlightedName || product.name }}
                      />
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-semibold text-red-600">
                          {formatPrice(product.price)}
                        </span>
                        {product.rating > 0 && (
                          <span className="text-xs text-gray-500 flex items-center gap-0.5">
                            <span className="text-yellow-500">★</span>
                            {product.rating?.toFixed(1)}
                          </span>
                        )}
                        {product.soldCount > 0 && (
                          <span className="text-xs text-gray-400">
                            Đã bán {product.soldCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchSuggestions;
