import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Search Service - Handles search suggestions, trending, and history
 */

/**
 * Get search suggestions for autocomplete
 * @param {string} query - Search query (can be partial)
 * @param {number} limit - Max number of suggestions per type
 * @returns {Promise<Object>} Suggestions with queries, products, categories
 */
export const getSuggestions = async (query = '', limit = 5) => {
  try {
    const response = await api.get(API_ENDPOINTS.SEARCH.SUGGESTIONS, {
      params: { q: query, limit }
    });
    return response.data || {
      queries: [],
      products: [],
      categories: [],
      trending: [],
      didYouMean: null
    };
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return {
      queries: [],
      products: [],
      categories: [],
      trending: [],
      didYouMean: null
    };
  }
};

/**
 * Get trending/popular searches
 * @param {number} limit - Max number of trending searches
 * @returns {Promise<Object>} Trending searches list
 */
export const getTrendingSearches = async (limit = 10) => {
  try {
    const response = await api.get(API_ENDPOINTS.SEARCH.TRENDING, {
      params: { limit }
    });
    return response.data || { trending: [] };
  } catch (error) {
    console.error('Error fetching trending searches:', error);
    return { trending: [] };
  }
};

/**
 * Track a search query for analytics
 * @param {string} query - Search query
 * @param {number} resultCount - Number of results found
 */
export const trackSearch = async (query, resultCount = 0) => {
  try {
    await api.post(API_ENDPOINTS.SEARCH.TRACK, null, {
      params: { q: query, resultCount }
    });
  } catch (error) {
    // Silently fail - tracking is not critical
    console.warn('Error tracking search:', error);
  }
};

/**
 * Track when user clicks a product from search results
 * @param {string} query - Search query
 * @param {number} productId - Clicked product ID
 */
export const trackSearchClick = async (query, productId) => {
  try {
    await api.post(API_ENDPOINTS.SEARCH.TRACK_CLICK, null, {
      params: { q: query, productId }
    });
  } catch (error) {
    // Silently fail - tracking is not critical
    console.warn('Error tracking click:', error);
  }
};

/**
 * Get user's search history (requires authentication)
 * @param {number} limit - Max number of history items
 * @returns {Promise<Array>} Search history list
 */
export const getSearchHistory = async (limit = 10) => {
  try {
    const response = await api.get(API_ENDPOINTS.SEARCH.HISTORY, {
      params: { limit }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
};

/**
 * Clear all user search history (requires authentication)
 * @returns {Promise<boolean>} Success status
 */
export const clearSearchHistory = async () => {
  try {
    await api.delete(API_ENDPOINTS.SEARCH.HISTORY);
    return true;
  } catch (error) {
    console.error('Error clearing search history:', error);
    return false;
  }
};

/**
 * Delete a specific search from history (requires authentication)
 * @param {string} query - Search query to remove
 * @returns {Promise<boolean>} Success status
 */
export const deleteFromHistory = async (query) => {
  try {
    await api.delete(`${API_ENDPOINTS.SEARCH.HISTORY}/${encodeURIComponent(query)}`);
    return true;
  } catch (error) {
    console.error('Error deleting from history:', error);
    return false;
  }
};

/**
 * Get faceted search filters with product counts
 * @param {Object} params - Filter parameters
 * @returns {Promise<Object>} Faceted filters with counts
 */
export const getFacetedFilters = async (params = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.SEARCH.FACETS, {
      params: {
        keyword: params.keyword,
        categoryId: params.categoryId,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minRating: params.minRating
      }
    });
    return response.data || {
      totalCount: 0,
      categories: [],
      priceRanges: [],
      ratings: [],
      brands: []
    };
  } catch (error) {
    console.error('Error fetching faceted filters:', error);
    return {
      totalCount: 0,
      categories: [],
      priceRanges: [],
      ratings: [],
      brands: []
    };
  }
};

/**
 * Search for shops by name
 * @param {string} keyword - Search keyword
 * @param {number} limit - Max number of shops to return
 * @returns {Promise<Array>} Matching shops list
 */
export const searchShops = async (keyword, limit = 10) => {
  try {
    const response = await api.get(API_ENDPOINTS.SEARCH.SHOPS, {
      params: { keyword, limit }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error searching shops:', error);
    return [];
  }
};

// ========== LOCAL STORAGE HELPERS ==========

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;

/**
 * Get recent searches from localStorage
 * @returns {Array<string>} Recent search queries
 */
export const getRecentSearches = () => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Save a search to recent searches (localStorage)
 * @param {string} query - Search query to save
 */
export const saveRecentSearch = (query) => {
  if (!query || query.trim().length === 0) return;
  
  try {
    const searches = getRecentSearches();
    const normalizedQuery = query.trim();
    
    // Remove if already exists (will be added to top)
    const filtered = searches.filter(s => s.toLowerCase() !== normalizedQuery.toLowerCase());
    
    // Add to beginning
    filtered.unshift(normalizedQuery);
    
    // Keep only last N searches
    const trimmed = filtered.slice(0, MAX_RECENT_SEARCHES);
    
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Error saving recent search:', error);
  }
};

/**
 * Remove a search from recent searches
 * @param {string} query - Search query to remove
 */
export const removeRecentSearch = (query) => {
  try {
    const searches = getRecentSearches();
    const filtered = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Error removing recent search:', error);
  }
};

/**
 * Clear all recent searches
 */
export const clearRecentSearches = () => {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.warn('Error clearing recent searches:', error);
  }
};

export default {
  getSuggestions,
  getTrendingSearches,
  trackSearch,
  trackSearchClick,
  getSearchHistory,
  clearSearchHistory,
  deleteFromHistory,
  getFacetedFilters,
  searchShops,
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearRecentSearches
};
