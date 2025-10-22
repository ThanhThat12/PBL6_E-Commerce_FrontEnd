// src/services/productService.js
// Service for product-related API calls

import api from './api';

/**
 * Transform backend product data to component format
 */
const transformProduct = (product) => {
  if (!product) return null;
  
  return {
    id: product.id,
    name: product.name,
    slug: product.name?.toLowerCase().replace(/\s+/g, '-'),
    image: product.mainImage || '/placeholder-product.jpg',
    price: product.basePrice || 0,
    originalPrice: product.basePrice ? product.basePrice * 1.2 : null,
    rating: 4.5,
    reviewCount: Math.floor(Math.random() * 200) + 50,
    brand: product.shop?.name || 'SportZone',
    inStock: product.variants?.some(v => v.stock > 0) ?? true,
    badge: null,
    ...product
  };
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
 * @param {number} size - Items per page
 * @returns {Promise} Product list with pagination
 */
export const getProducts = async (page = 0, size = 1) => {
  try {
    const response = await api.get('/api/products', {
      params: { page, size }
    });
    console.log('📦 getProducts response:', response);
    
    // Response structure: {code: 200, data: {content: [...], totalPages, ...}, message: ""}
    const products = response?.data?.content || [];
    const transformed = products.map(transformProduct).filter(p => p !== null);
    
    return {
      code: response?.code || 200,
      data: {
        content: transformed,
        totalPages: response?.data?.totalPages || 1
      },
      message: response?.message || ''
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { code: 500, data: { content: [], totalPages: 0 }, message: error.message };
  }
};

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @returns {Promise} Product details
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    console.log('📦 getProductById response:', response);
    
    const product = response?.data;
    const transformed = transformProduct(product);
    
    return {
      code: response?.code || 200,
      data: transformed,
      message: response?.message || ''
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { code: 500, data: null, message: error.message };
  }
};

/**
 * Search products by keyword
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number
 * @param {number} size - Items per page
 * @returns {Promise} Search results
 */
export const searchProducts = async (keyword, page = 0, size = 20) => {
  try {
    const response = await api.get('/api/products/search', {
      params: { keyword, page, size }
    });
    console.log('📦 searchProducts response:', response);
    
    const products = response?.data?.content || [];
    const transformed = products.map(transformProduct).filter(p => p !== null);
    
    return {
      code: response?.code || 200,
      data: {
        content: transformed,
        totalPages: response?.data?.totalPages || 1
      },
      message: response?.message || ''
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return { code: 500, data: { content: [], totalPages: 0 }, message: error.message };
  }
};

/**
 * Get products by category
 * @param {number} categoryId - Category ID
 * @param {number} page - Page number
 * @param {number} size - Items per page
 * @returns {Promise} Products in category
 */
export const getProductsByCategory = async (categoryId, page = 0, size = 20) => {
  try {
    const response = await api.get(`/api/categories/${categoryId}/products`, {
      params: { page, size }
    });
    console.log('📦 getProductsByCategory response:', response);
    
    const products = response?.data?.content || [];
    const transformed = products.map(transformProduct).filter(p => p !== null);
    
    return {
      code: response?.code || 200,
      data: {
        content: transformed,
        totalPages: response?.data?.totalPages || 1
      },
      message: response?.message || ''
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return { code: 500, data: { content: [], totalPages: 0 }, message: error.message };
  }
};

/**
 * Get all categories
 * @returns {Promise} Categories list
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    console.log('📦 getCategories response:', response);
    
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

// Legacy support
export const fetchAllProducts = getProducts;
