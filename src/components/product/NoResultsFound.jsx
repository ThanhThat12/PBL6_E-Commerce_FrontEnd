import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import { getTrendingSearches } from '../../services/searchService';
import Button from '../common/Button';

/**
 * NoResultsFound - Displayed when search returns no results
 * Shows alternative suggestions and trending searches
 */
const NoResultsFound = ({ 
  searchQuery = '',
  onClearFilters,
  suggestions = []
}) => {
  const navigate = useNavigate();
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load trending searches
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const data = await getTrendingSearches(6);
        setTrendingSearches(data.trending || []);
      } catch (error) {
        console.error('Error loading trending:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrending();
  }, []);

  // Handle search click
  const handleSearchClick = (query) => {
    navigate(`/products?keyword=${encodeURIComponent(query)}`);
  };

  // Generate alternative search suggestions
  const getAlternativeSuggestions = () => {
    if (!searchQuery) return [];
    
    const words = searchQuery.split(' ').filter(w => w.length > 2);
    const suggestions = [];
    
    // Suggest each word separately
    words.forEach(word => {
      if (word.length > 2) {
        suggestions.push(word);
      }
    });
    
    // Suggest first 2 words
    if (words.length >= 2) {
      suggestions.push(words.slice(0, 2).join(' '));
    }
    
    return suggestions.slice(0, 3);
  };

  const altSuggestions = getAlternativeSuggestions();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center border-b border-gray-200">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FiSearch className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Không tìm thấy kết quả
        </h3>
        {searchQuery && (
          <p className="text-gray-600 mb-2">
            Không có sản phẩm nào phù hợp với "<span className="font-semibold text-primary-600">{searchQuery}</span>"
          </p>
        )}
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
        </p>
      </div>

      {/* Suggestions Section */}
      <div className="p-6 space-y-6">
        {/* Tips */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            💡 Gợi ý tìm kiếm
          </h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Kiểm tra chính tả hoặc thử viết không dấu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Sử dụng từ khóa chung hơn (ví dụ: "giày" thay vì "giày bóng đá nam size 42")</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>Thử tìm theo danh mục hoặc thương hiệu</span>
            </li>
          </ul>
        </div>

        {/* Alternative suggestions */}
        {altSuggestions.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🔍 Thử tìm kiếm với
            </h4>
            <div className="flex flex-wrap gap-2">
              {altSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchClick(suggestion)}
                  className="px-4 py-2 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-full text-sm font-medium text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending searches */}
        {!isLoading && trendingSearches.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🔥 Tìm kiếm phổ biến
            </h4>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchClick(item.query)}
                  className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                >
                  {index < 3 && <span>🔥</span>}
                  {item.query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular categories */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            📦 Danh mục phổ biến
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { name: 'Giày thể thao', icon: '👟', categoryId: 5 },
              { name: 'Áo bóng đá', icon: '⚽', categoryId: 3 },
              { name: 'Dụng cụ gym', icon: '💪', categoryId: 4 },
              { name: 'Phụ kiện', icon: '🎒', categoryId: 1 },
              { name: 'Vợt', icon: '🎾', categoryId: 6 },
              { name: 'Túi thể thao', icon: '👜', categoryId: 2 },
            ].map((cat, index) => (
              <button
                key={index}
                onClick={() => navigate(`/products?categoryId=${cat.categoryId}`)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors text-left"
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
          <Button 
            onClick={onClearFilters} 
            variant="primary" 
            className="flex-1 py-3 rounded-xl font-semibold"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Xóa bộ lọc & Xem tất cả
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="flex-1 py-3 rounded-xl font-semibold"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoResultsFound;
