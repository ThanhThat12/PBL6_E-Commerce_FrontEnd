import api from './api';

/**
 * Home Page Service
 * Handles API calls for homepage data
 */

/**
 * Transform backend voucher data to component format
 */
const transformVoucher = (voucher) => {
  if (!voucher) {
    console.warn('transformVoucher received null/undefined voucher');
    return null;
  }
  
  // Tính số lượng còn lại
  const remainingQuantity = (voucher.usageLimit || 0) - (voucher.usedCount || 0);
  
  const transformed = {
    id: voucher.id,
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discountType, // PERCENTAGE, FIXED_AMOUNT
    discountValue: voucher.discountValue,
    minOrderValue: voucher.minOrderValue,
    maxDiscountAmount: voucher.maxDiscountAmount,
    startDate: voucher.startDate,
    endDate: voucher.endDate,
    usageLimit: voucher.usageLimit,
    usedCount: voucher.usedCount || 0,
    remainingQuantity: remainingQuantity,
    status: voucher.status,
    // Keep original data
    ...voucher
  };
  
  console.log('🏟️ Transformed voucher:', voucher.code, '| Remaining:', remainingQuantity, '| End:', voucher.endDate);
  return transformed;
};

/**
 * Transform backend product data to component format
 */
const transformProduct = (product) => {
  if (!product) {
    console.warn('transformProduct received null/undefined product');
    return null;
  }
  
  // Tính giá variant thấp nhất nếu có variants
  let lowestPrice = product.basePrice || 0;
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants.map(v => v.price).filter(p => p > 0);
    if (prices.length > 0) {
      lowestPrice = Math.min(...prices);
    }
  }
  
  const transformed = {
    id: product.id,
    name: product.name,
    slug: product.name?.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
    image: product.mainImage || '/placeholder-product.jpg',
    basePrice: product.basePrice || 0,
    price: lowestPrice, // Giá hiển thị = giá thấp nhất
    originalPrice: lowestPrice < (product.basePrice || 0) ? product.basePrice : null,
    rating: product.rating || 0, // ✅ Dùng rating thật từ backend
    reviewCount: product.reviewCount || 0, // ✅ Dùng reviewCount thật từ backend
    soldCount: product.soldCount || 0, // ✅ Dùng soldCount thật từ backend
    brand: product.shop?.name || 'SportZone',
    inStock: product.variants?.some(v => v.stock > 0) ?? true,
    badge: product.badge || null,
    variants: product.variants || [],
    // Keep original data
    ...product
  };
  
  console.log('🔄 Transformed product:', product.name, '| Sold:', transformed.soldCount, '| Rating:', transformed.rating, '| Price:', lowestPrice);
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
    // Updated to use new best-selling endpoint based on soldCount
    const response = await api.get('products/best-selling', {
      params: {
        page: 0,
        size: limit
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
/**
 * Get platform vouchers (issued by admin)
 * @param {number} size - Số voucher mỗi trang
 * @param {number} page - Số trang (bắt đầu từ 0)
 * @returns {Promise<Object>} - { content: Array, totalPages: number, totalElements: number }
 */
export const getPlatformVouchers = async (size = 8, page = 0) => {
  try {
    const response = await api.get('vouchers/platform', {
      params: {
        page: page,
        size: size
      }
    });
    console.log('🎟️ getPlatformVouchers raw response:', response);
    
    // Backend returns: { status: 200, data: { content: [...], page: {...} } }
    const responseData = response?.data || {};
    const vouchers = responseData.content || [];
    const pageInfo = responseData.page || {};
    
    console.log('🎟️ Raw vouchers count:', vouchers.length);
    console.log('🎟️ Page info:', pageInfo);
    
    const transformed = vouchers.map(transformVoucher).filter(v => v !== null);
    console.log('🎟️ Transformed vouchers count:', transformed.length);
    
    return {
      content: transformed,
      totalPages: pageInfo.totalPages || 1,
      totalElements: pageInfo.totalElements || transformed.length,
      currentPage: page
    };
  } catch (error) {
    console.error('Error fetching platform vouchers:', error);
    return {
      content: [],
      totalPages: 1,
      totalElements: 0,
      currentPage: 0
    };
  }
};

/**
 * Get featured shops
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const getFeaturedShops = async (limit = 6) => {
  try {
    const response = await api.get('public/shops/featured', {
      params: {
        page: 0,
        size: limit
      }
    });
    console.log('🏪 getFeaturedShops raw response:', response);
    
    const shops = response?.data?.content || [];
    console.log('🏪 getFeaturedShops shops:', shops);
    
    return shops;
  } catch (error) {
    console.error('Error fetching featured shops:', error);
    return [];
  }
};

/**
 * Get top-rated products
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const getTopRatedProducts = async (limit = 10) => {
  try {
    const response = await api.get('products/top-rated', {
      params: {
        page: 0,
        size: limit
      }
    });
    console.log('⭐ getTopRatedProducts raw response:', response);
    
    const products = response?.data?.content || [];
    const transformed = products.map(transformProduct).filter(p => p !== null);
    console.log('⭐ getTopRatedProducts transformed:', transformed);
    
    return transformed;
  } catch (error) {
    console.error('Error fetching top-rated products:', error);
    return [];
  }
};