import api from './api';

/**
 * Home Page Service
 * Handles API calls for homepage data
 */

/**
 * Transform backend product data to component format
 */
const transformProduct = (product) => {
  if (!product) {
    console.warn('transformProduct received null/undefined product');
    return null;
  }
  
  const transformed = {
    id: product.id,
    name: product.name,
    slug: product.name?.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
    image: product.mainImage || '/placeholder-product.jpg',
    price: product.basePrice || 0,
    originalPrice: product.basePrice ? product.basePrice * 1.2 : null, // Fake discount for demo
    rating: product.rating || 0, // Use actual rating from backend
    reviewCount: product.reviewCount || 0, // Use actual review count from backend
    brand: product.shop?.name || 'SportZone',
    inStock: product.variants?.some(v => v.stock > 0) ?? true,
    badge: product.badge || (Math.random() > 0.7 ? 'hot' : null), // Use provided badge or random
    // Keep original data
    ...product
  };
  
  console.log('🔄 Transformed product:', product.name, '→', transformed);
  return transformed;
};

/**
 * Transform backend category data to component format
 */
const transformCategory = (category) => {
  if (!category) {
    console.warn('transformCategory received null/undefined category');
    return null;
  }
  
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

  const transformed = {
    id: category.id,
    name: category.name,
    slug: category.name?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, ''),
    image: category.imageUrl || `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop`, // Default sports image
    productCount: category.productCount || Math.floor(Math.random() * 150) + 20, // Use real or random count
    icon: iconMap[category.name] || '🏅',
    // Keep original data
    ...category
  };
  
  console.log('🔄 Transformed category:', category.name, '→', transformed);
  return transformed;
};

/**
 * Get featured/flash sale products
 * @param {number} limit - Number of products to fetch
 * @returns {Promise<Array>}
 */
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const response = await api.get('products', {
      params: {
        page: 0,
        size: limit,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      }
    });
    console.log('📦 getFeaturedProducts raw response:', response);
    
    // Response structure: {code: 200, data: {content: [...], totalPages, ...}, message: ""}
    const products = response?.data?.content || [];
    console.log('📦 getFeaturedProducts products array:', products);
    
    const transformed = products.map(transformProduct).filter(p => p !== null);
    console.log('📦 getFeaturedProducts transformed:', transformed);
    
    return transformed;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return []; // Return empty array on error
  }
};

/**
 * Get all active products with pagination (for homepage "Tất Cả Sản Phẩm" section)
 * @param {number} page - 0-indexed page
 * @param {number} size - page size
 * @returns {Promise<{items: Array, page: number, totalPages: number, totalElements: number, pageSize: number}>}
 */
export const getAllProductsPage = async (page = 0, size = 20) => {
  try {
    const response = await api.get('products', {
      params: {
        page,
        size,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      }
    });

    // ResponseDTO structure (theo backend):
    // {
    //   status,
    //   error,
    //   message,
    //   data: {
    //     content: [...],
    //     page: { size, number, totalElements, totalPages }
    //   }
    // }
    const data = response?.data;
    const products = data?.content || [];
    const pageInfo = data?.page || {};

    const transformed = products.map(transformProduct).filter(p => p !== null);

    return {
      items: transformed,
      page: pageInfo.number ?? page,
      totalPages: pageInfo.totalPages ?? 0,
      totalElements: pageInfo.totalElements ?? transformed.length,
      pageSize: pageInfo.size ?? size,
    };
  } catch (error) {
    console.error('Error fetching paginated products for homepage:', error);
    return {
      items: [],
      page,
      totalPages: 0,
      totalElements: 0,
      pageSize: size,
    };
  }
};

/**
 * Get all categories with product count
 * @returns {Promise<Array>}
 */
export const getCategories = async () => {
  try {
    const response = await api.get('categories');
    console.log('📦 getCategories raw response:', response);
    
    // Response structure: {code: 200, data: [...], message: ""}
    const categories = response?.data || [];
    console.log('📦 getCategories array:', categories);
    
    const transformed = categories.map(transformCategory).filter(c => c !== null);
    console.log('📦 getCategories transformed:', transformed);
    
    return transformed;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // Return empty array on error
  }
};

/**
 * Get best selling products
 * @param {number} limit 
 * @returns {Promise<Array>}
 */
export const getBestSellingProducts = async (limit = 8) => {
  try {
    // TODO: Replace with actual best-selling endpoint when available
    const response = await api.get('products', {
      params: {
        page: 0,
        size: limit,
        sortBy: 'basePrice',
        sortDirection: 'DESC'
      }
    });
    console.log('📦 getBestSellingProducts raw response:', response);
    
    const products = response?.data?.content || [];
    const transformed = products.map(p => transformProduct({...p, badge: 'sale'})).filter(p => p !== null);
    
    return transformed;
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    return [];
  }
};

/**
 * Get new arrival products
 * @param {number} limit 
 * @returns {Promise<Array>}
 */
export const getNewArrivals = async (limit = 8) => {
  try {
    const response = await api.get('products', {
      params: {
        page: 0,
        size: limit,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      }
    });
    console.log('📦 getNewArrivals raw response:', response);
    
    const products = response?.data?.content || [];
    const transformed = products.map(p => transformProduct({...p, badge: 'new'})).filter(p => p !== null);
    
    return transformed;
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
};

/**
 * Get products by category
 * @param {number} categoryId 
 * @param {number} limit 
 * @returns {Promise<Array>}
 */
export const getProductsByCategory = async (categoryId, limit = 4) => {
  try {
    const response = await api.get(`categories/${categoryId}/products`, {
      params: {
        page: 0,
        size: limit
      }
    });
    console.log(`📦 getProductsByCategory(${categoryId}) raw response:`, response);
    
    const products = response?.data?.content || [];
    const transformed = products.map(transformProduct).filter(p => p !== null);
    
    return transformed;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
};
