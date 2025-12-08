// src/services/productService.js
// Service for product-related API calls

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';
import toast from 'react-hot-toast';

/**
 * Transform backend product data to component format
 */
// eslint-disable-next-line no-unused-vars
const transformProduct = (product) => {
  if (!product) return null;

  // Log to debug image issues
  if (!product.mainImage) {
    console.warn('⚠️ Product missing mainImage:', {
      id: product.id,
      name: product.name,
      rawProduct: product
    });
  }

  // Don't spread product first - build clean object
  const transformed = {
    id: product.id,
    name: product.name,
    description: product.description,
    slug: product.name?.toLowerCase().replace(/\s+/g, '-'),
    mainImage: product.mainImage || null, // Keep null if missing
    image: product.mainImage || null, // Backwards compatibility
    basePrice: product.basePrice || 0,
    price: product.basePrice || 0, // Backwards compatibility
    originalPrice: product.basePrice ? product.basePrice * 1.2 : null,
    rating: 4.5,
    reviewCount: Math.floor(Math.random() * 200) + 50,
    brand: product.shop?.name || product.shopName || 'SportZone',
    shopName: product.shopName,
    isActive: product.isActive,
    inStock: product.variants?.some(v => v.stock > 0) ?? true,
    badge: null,
    category: product.category,
    variants: product.variants,
    images: product.images
  };

  return transformed;
};

/**
 * Transform backend category data to component format
 */
const transformCategory = (category) => {
  if (!category) return null;

  const iconMap = {
    'Bóng Đá': '⚽',
    'Bóng Rổ': '🏀',
    'Tennis': '🎾',
    'Chạy Bộ': '🏃',
    'Gym & Fitness': '💪',
    'Bơi Lội': '🏊',
    'Yoga': '🧘',
    'Cầu Lông': '🏸',
    'Bóng Chuyền': '🏐',
    'Phụ Kiện': '🎒'
  };

  return {
    id: category.id,
    name: category.name,
    slug: category.name?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, ''),
    image: category.imageUrl || `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop`,
    productCount: category.productCount || Math.floor(Math.random() * 150) + 20,
    icon: iconMap[category.name] || '🏅',
    ...category
  };
};

/**
 * Get paginated products list (public)
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Items per page (1-100, default 12)
 * @returns {Promise} Product list with pagination
 */
export const getProducts = async (page = 0, size = 12) => {
  // Validate pagination parameters
  if (page < 0) page = 0;
  if (size < 1 || size > 100) size = 12;

  try {
    const response = await api.get(API_ENDPOINTS.PRODUCT.GET_ALL, {
      params: { page, size }
    });

    // api interceptor returns response.data, which is ResponseDTO
    // ResponseDTO structure: { status, error, message, data: Page<ProductDTO> }
    return response; // Return full ResponseDTO
  } catch (error) {
    if (error.response?.status === 400 && error.response.data?.message?.includes('Page')) {
      toast.error('Trang không hợp lệ');
      return getProducts(0, 12); // Fallback to first page
    }
    throw error;
  }
};

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @returns {Promise} Product details with variants
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(API_ENDPOINTS.PRODUCT.GET_BY_ID(id));
    return response; // Return full ResponseDTO
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    throw error;
  }
};

/**
 * Search products with filters
 * @param {Object} filters - Search filters
 * @returns {Promise} Search results
 */
export const searchProducts = async (filters = {}) => {
  try {
    const response = await api.get(API_ENDPOINTS.PRODUCT.SEARCH, {
      params: {
        name: filters.keyword,
        categoryId: filters.categoryId,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
        page: filters.page || 0,
        size: filters.size || 12,
      }
    });

    return response; // Return full ResponseDTO
  } catch (error) {
    throw error;
  }
};

/**
 * Get products by category
 * @param {number} categoryId - Category ID
 * @param {number} page - Page number
 * @param {number} size - Items per page
 * @returns {Promise} Products in category
 */
export const getProductsByCategory = async (categoryId, page = 0, size = 12) => {
  try {
    const response = await api.get(API_ENDPOINTS.PRODUCT.BY_CATEGORY(categoryId), {
      params: { page, size }
    });

    return response; // Return full ResponseDTO
  } catch (error) {
    throw error;
  }
};

/**
 * Get all categories
 * @returns {Promise} Categories list
 */
export const getCategories = async () => {
  try {
    const response = await api.get('categories');

    const categories = response?.data || [];
    const transformed = categories.map(transformCategory).filter(c => c !== null);

    return {
      code: response?.code || 200,
      data: transformed,
      message: response?.message || ''
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { code: 500, data: [], message: error.message };
  }
};

/**
 * Get category by ID
 * @param {number} id - Category ID
 * @returns {Promise} Category details
 */
export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// Admin/Seller APIs (require authentication)

/**
 * Create new product (ADMIN/SELLER)
 * @param {Object} productData - Product data
 * @returns {Promise} Created product
 */
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

/**
 * Update product (ADMIN/SELLER)
 * @param {number} id - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise} Updated product
 */
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

/**
 * Delete product (ADMIN/SELLER)
 * @param {number} id - Product ID
 * @returns {Promise} Delete confirmation
 */
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

/**
 * Create category (ADMIN)
 * @param {Object} categoryData - Category data
 * @returns {Promise} Created category
 */
export const createCategory = async (categoryData) => {
  const response = await api.post('/categories/addCategory', categoryData);
  return response.data;
};

/**
 * Get all product images (main, gallery, variant-specific)
 * PUBLIC endpoint - no authentication required
 * 
 * Returns ProductImagesResponse with:
 * - mainImage: string (URL)
 * - galleryImages: Array<{id, url, displayOrder}>
 * - primaryAttribute: {id, name, values: string[]} | null
 * - variantImages: Map<attributeValue, {id, attributeValue, imageUrl, publicId}>
 * 
 * @param {number} productId - Product ID
 * @returns {Promise} Product images data
 */
export const getProductImages = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/images`);
    // api interceptor returns response.data which is ResponseDTO
    // ResponseDTO.data contains ProductImagesResponse
    return response; // Return full response for consistent handling
  } catch (error) {
    throw error;
  }
};

// Legacy support
export const fetchAllProducts = getProducts;
