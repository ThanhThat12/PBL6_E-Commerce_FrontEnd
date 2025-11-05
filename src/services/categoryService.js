import axiosInstance from '../utils/axiosConfig';

// Icon mapping cho categories (tự động match theo tên category từ API)
const categoryIcons = {
  'Cycling Accessories': '�',
  'Bags': '👜',
  'Football Accessories': '⚽',
  'Fitness Equipment': '💪',
  'Swimming Equipment': '🏊',
  'Basketball Gear': '🏀',
  'Tennis Equipment': '🎾',
  'Fashion': '👗',
  'Home & Kitchen': '🏠',
  'Running Gear': '🏃',
  'Yoga & Fitness': '🧘',
  'Gym Accessories': '🏋️',
  'Outdoor & Hiking': '🥾',
  'default': '📦'
};

const categoryService = {
  async getCategories() {
    try {
      console.log('📊 Fetching seller categories');
      const response = await axiosInstance.get('/categories/seller/my-categories');
      
      console.log('✅ Categories response:', response.data);
      
      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        // Transform data từ API
        return response.data.data.map(category => ({
          id: category.id,
          name: category.name,
          icon: categoryIcons[category.name] || categoryIcons['default'],
          productCount: 0, // Sẽ được cập nhật khi load products
        }));
      }
      
      console.warn('Unexpected API response format for categories:', response.data);
      return [];
    } catch (error) {
      console.error('❌ Error fetching seller categories:', error);
      // Fallback to empty array if API fails
      return [];
    }
  },

  async getProductsByCategory(categoryId) {
    try {
      console.log(`📦 Fetching products for category ID: ${categoryId}`);
      const response = await axiosInstance.get(`/categories/seller/my-products/${categoryId}`);
      
      console.log('✅ Products response:', response.data);
      
      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        // Transform data từ API để phù hợp với CategoryTable
        const transformedData = response.data.data.map(product => {
          console.log('🔄 Transforming product:', product); // Debug log
          return {
            id: product.id,
            name: product.name || 'Tên không có',
            // image: product.mainImage || product.image || '📦',
            // createdDate: new Date(product.createdAt || Date.now()).toLocaleDateString('vi-VN'),
            order: product.stock || 0,
            category: product.category,
            categoryName: product.categoryName || product.category?.name,
            price: new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.basePrice || product.price || 0),
            isActive: product.isActive !== undefined ? product.isActive : true,
            stock: product.stock || 0,
            variants: product.variants || []
          };
        });
        console.log('✅ Transformed products:', transformedData);
        return transformedData;
      }
      
      console.warn('Unexpected API response format for category products:', response.data);
      return [];
    } catch (error) {
      console.error(`❌ Error fetching products for category ${categoryId}:`, error);
      return [];
    }
  },

  async getAllProducts() {
    try {
      // Lấy tất cả categories trước
      const categories = await this.getCategories();
      
      // Lấy products từ tất cả categories
      const allProductsPromises = categories.map(category => 
        this.getProductsByCategory(category.id)
      );
      
      const allProductsArrays = await Promise.all(allProductsPromises);
      
      // Flatten array và return
      return allProductsArrays.flat();
    } catch (error) {
      console.error('❌ Error fetching all products:', error);
      return [];
    }
  },

  // Backward compatibility - deprecated, use getProductsByCategory instead
  async getProducts(categoryId = null) {
    if (categoryId && categoryId !== 'all') {
      return this.getProductsByCategory(categoryId);
    }
    return this.getAllProducts();
  },
};

export default categoryService;
