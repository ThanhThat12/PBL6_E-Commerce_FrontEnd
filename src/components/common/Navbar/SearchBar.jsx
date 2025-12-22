import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { 
  saveRecentSearch,
  trackSearch,
  getSuggestions,
  getTrendingSearches,
  getRecentSearches,
  removeRecentSearch,
  clearRecentSearches,
  getSearchHistory,
  deleteFromHistory,
  clearSearchHistory,
  trackSearchClick,
} from '../../../services/searchService';
import { useAuth } from '../../../hooks/useAuth';
import SearchSuggestions from './SearchSuggestions';

/**
 * SearchBar Component - Thanh tìm kiếm sản phẩm với real-time suggestions
 * 
 * Features:
 * - Real-time search suggestions với debouncing
 * - Hiển thị products (name, image, price, shop name)
 * - Hiển thị shops (name, logoUrl, productCount)
 * - Hiển thị categories
 * - Recent searches và trending searches
 * - Tìm kiếm khi nhấn Enter hoặc click nút tìm kiếm
 * 
 * @param {function} onSearch - Callback khi submit search (nhận search term)
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Custom classes
 * @param {string} initialValue - Initial search value
 */
const SearchBar = ({ 
  onSearch,
  placeholder = 'Tìm kiếm sản phẩm, shop...',
  className = '',
  initialValue = ''
}) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const { isAuthenticated } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [serverHistory, setServerHistory] = useState([]);
  const [trending, setTrending] = useState([]);

  // Load initial data (recent searches, trending)
  useEffect(() => {
    loadInitialData();
  }, [isAuthenticated]);

  // Load recent searches and trending
  const loadInitialData = async () => {
    // Load local recent searches
    const localRecent = getRecentSearches();
    setRecentSearches(localRecent);

    // Load trending searches
    const trendingData = await getTrendingSearches(10);
    setTrending(trendingData.trending || []);

    // Load server history if authenticated
    if (isAuthenticated) {
      const history = await getSearchHistory(10);
      setServerHistory(history);
    }
  };

  // Fetch suggestions from API with debounce
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setSuggestions({});
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    
    try {
      const data = await getSuggestions(query, 5);
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions({});
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e) => {
    const query = e.target.value;
    setSearchTerm(query);
    setShowSuggestions(true);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search (250ms)
    debounceTimerRef.current = setTimeout(() => {
      if (query.trim().length > 0) {
        fetchSuggestions(query);
      } else {
        // Show recent/trending when query is empty
        setSuggestions({});
        setIsLoadingSuggestions(false);
      }
    }, 250);
  }, [fetchSuggestions]);

  // Handle input focus - show suggestions dropdown
  const handleFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle selecting a query suggestion
  const handleSelectQuery = useCallback((query) => {
    setSearchTerm(query);
    setShowSuggestions(false);
    
    // Save to recent searches
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
    
    // Track search
    trackSearch(query, 0);
    
    // Navigate or callback
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/products?keyword=${encodeURIComponent(query)}`);
    }
  }, [onSearch, navigate]);

  // Handle selecting a product suggestion
  const handleSelectProduct = useCallback((product) => {
    setShowSuggestions(false);
    
    // Track click
    if (searchTerm) {
      trackSearchClick(searchTerm, product.id);
    }
    
    // Navigate is handled by SearchSuggestions component
  }, [searchTerm]);

  // Handle selecting a category suggestion
  const handleSelectCategory = useCallback((category) => {
    setShowSuggestions(false);
    // Navigate is handled by SearchSuggestions component
  }, []);

  // Handle removing a recent search
  const handleRemoveRecent = useCallback((query) => {
    removeRecentSearch(query);
    setRecentSearches(getRecentSearches());
  }, []);

  // Handle clearing all recent searches
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Handle removing from server history
  const handleRemoveServerHistory = useCallback(async (query) => {
    const success = await deleteFromHistory(query);
    if (success) {
      const history = await getSearchHistory(10);
      setServerHistory(history);
    }
  }, []);

  // Handle clearing all server history
  const handleClearServerHistory = useCallback(async () => {
    const success = await clearSearchHistory();
    if (success) {
      setServerHistory([]);
    }
  }, []);

  // Handle form submit (Enter or click button)
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    
    if (term) {
      // Save to recent searches (localStorage)
      saveRecentSearch(term);
      setRecentSearches(getRecentSearches());
      
      // Track search for analytics (fire and forget)
      trackSearch(term, 0);
      
      // Close suggestions
      setShowSuggestions(false);
      
      // Callback or navigate to search results
      if (onSearch) {
        onSearch(term);
      } else {
        navigate(`/products?keyword=${encodeURIComponent(term)}`);
      }
    }
  }, [searchTerm, onSearch, navigate]);

  // Handle clear input
  const handleClear = useCallback(() => {
    setSearchTerm('');
    setSuggestions({});
    setShowSuggestions(true);
    inputRef.current?.focus();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Determine if we should show recent/trending (when query is empty)
  const showRecent = searchTerm.trim().length === 0;

  return (
    <div className={`relative flex-1 ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          {/* Search icon (left) */}
          <div className="absolute left-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            autoComplete="off"
            className="
              w-full
              pl-10
              pr-20
              py-2.5
              border 
              border-gray-200
              rounded-lg
              text-sm
              text-gray-900
              placeholder:text-gray-400
              focus:outline-none
              focus:ring-2
              focus:ring-primary-500
              focus:border-primary-500
              transition-all
              bg-white
            "
          />
          
          {/* Clear button (when has text) */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-14 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          )}
          
          {/* Search button */}
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

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div ref={dropdownRef}>
          <SearchSuggestions
            suggestions={{
              ...suggestions,
              trending: trending
            }}
            recentSearches={recentSearches}
            serverHistory={serverHistory}
            isAuthenticated={isAuthenticated}
            showRecent={showRecent}
            onSelectQuery={handleSelectQuery}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={handleSelectCategory}
            onRemoveRecent={handleRemoveRecent}
            onClearRecent={handleClearRecent}
            onRemoveServerHistory={handleRemoveServerHistory}
            onClearServerHistory={handleClearServerHistory}
            isLoading={isLoadingSuggestions}
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
