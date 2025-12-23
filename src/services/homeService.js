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
  
  // Default placeholder image nếu không có mainImage
  const defaultImage = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop';
  
  const transformed = {
    id: product.id,
    name: product.name,
    slug: product.name?.toLowerCase().replace(/\s+/g, '-'), // Generate slug from name
    image: product.mainImage || defaultImage, // Use default if no image
    price: product.basePrice || 0, // Always use basePrice
    originalPrice: null, // No fake discount
    rating: product.rating || 0, // Use actual rating from backend
    reviewCount: product.reviewCount || 0, // Use actual review count from backend
    brand: product.shop?.name || 'SportZone',
    inStock: product.variants?.some(v => v.stock > 0) ?? true,
    badge: product.badge || null,
    // Keep original data
    ...product
  };
  
  console.log('🔄 Transformed product:', product.name, '→', transformed);
  return transformed;
};

/**
 * Transform backend category data to component format
 */
const categoryMap = {
  'Accessories': {
    icon: '🎾',
    image: 'https://store.garagecabinets.com/cdn/shop/products/sports_equipment_kit_800x.jpeg?v=1595014160'
  },
  'Clothing': {
    icon: '👕',
    image: 'https://cdn.merchize.com/wp-content/uploads/2022/07/sportwear-apparel.jpg'
  },
  'Shoes': {
    icon: '👟',
    image: 'https://hips.hearstapps.com/hmg-prod/images/running-shoes-005-68419d3f4376f.jpg?crop=0.8888888888888888xw:1xh;center,top&resize=1200:*'
  },
  'Bags': {
    icon: '🎒',
    image: 'https://cdn.thewirecutter.com/wp-content/media/2023/12/gym-bag-2048px-0004.jpg?auto=webp&quality=75&width=1024'
  },
  'Fitness Equipment': {
    icon: '🏋️‍♂️',
    image: 'https://www.usnews.com/object/image/0000018b-72bc-d15f-a3db-fffea06d0000/gettyimages-1342504672.jpg?update-time=1698437080300&size=responsive640'
  },
  'Sports Equipment': {
    icon: '⚽',
    image: 'https://images.ctfassets.net/mjtsjk88qv6a/149a0sCGMonK2HUsfabVDS/9d9f71a74cb87ce3f6f5e0c7dd18c96a/how-to-clean-and-disinfect-sports-equipment.jpg?fm=webp&w=3840&q=75'
  }
};

const DEFAULT_META = {
  icon: '🏅',
  image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop'
};

const transformCategory = (category) => {
  if (!category) {
    console.warn('transformCategory received null/undefined category');
    return null;
  }

  // 🔥 map trực tiếp theo giá trị DB
  const key = category.name?.trim();
  const meta = categoryMap[key] || DEFAULT_META;

  const transformed = {
    // lấy toàn bộ dữ liệu backend trước
    ...category,

    // chuẩn hóa dữ liệu FE
    id: category.id,
    name: category.name,
    slug: category.name
      ?.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/&/g, ''),

    productCount:
      category.productCount ?? Math.floor(Math.random() * 150) + 20,

    // 🔒 HARDCODE HIỂN THỊ
    icon: meta.icon,
    image: meta.image
  };

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
 * Get platform vouchers from Public API
 * @param {number} limit 
 * @returns {Promise<Array>}
 */
export const getPlatformVouchers = async (limit = 8) => {
  try {
    const response = await api.get('public/vouchers', {
      params: {
        page: 0,
        size: limit
      }
    });
    console.log('🎟️  getPlatformVouchers raw response:', response);
    
    // Response structure: { status, data: { vouchers: [...], currentPage, totalPages, ... }, message }
    const vouchers = response?.data?.vouchers || [];
    console.log('🎟️  getPlatformVouchers vouchers array:', vouchers);
    
    return vouchers;
  } catch (error) {
    console.error('Error fetching platform vouchers:', error);
    return [];
  }
};

/**
 * Get top-rated products from Public API (min 4 stars)
 * @param {number} limit 
 * @returns {Promise<Array>}
 */
export const getTopRatedProducts = async (limit = 8) => {
  try {
    const response = await api.get('public/products/top-rated', {
      params: {
        page: 0,
        size: limit,
        minRating: 4.0 // Filter products with at least 4 stars
      }
    });
    console.log('🌟 getTopRatedProducts raw response:', response);
    
    // Response structure: { status, data: { products: [...], currentPage, totalPages, ... }, message }
    const products = response?.data?.products || [];
    const transformed = products.map(p => transformProduct({...p, badge: 'star'})).filter(p => p !== null);
    
    console.log('🌟 getTopRatedProducts transformed:', transformed);
    return transformed;
  } catch (error) {
    console.error('Error fetching top-rated products:', error);
    return [];
  }
};

/**
 * Get best selling products from Public API
 * @param {number} limit 
 * @returns {Promise<Array>}
 */
export const getBestSellingProducts = async (limit = 8) => {
  try {
    const response = await api.get('public/products/best-selling', {
      params: {
        page: 0,
        size: limit
      }
    });
    console.log('📦 getBestSellingProducts raw response:', response);
    
    // Response structure: { status, data: { products: [...], currentPage, totalPages, ... }, message }
    const products = response?.data?.products || [];
    const transformed = products.map(p => transformProduct({...p, badge: 'hot'})).filter(p => p !== null);
    
    console.log('📦 getBestSellingProducts transformed:', transformed);
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
