const API_BASE_URL = 'http://localhost:8081/api';

// Icon mapping cho categories (tự động match theo tên category từ API)
const categoryIcons = {
  'Shoes': '👟',
  'Bags': '👜',
  'Sport Equipment': '⚽',
  'Fitness Equipment': '💪',
  'Clothing': '👔',
  'Accessories': '⌚',
  'Electronics': '💻',
  'Fashion': '👗',
  'Home & Kitchen': '🏠',
  'Sports & Outdoors': '🏃',
  'Toys & Games': '🎮',
  'Health & Fitness': '🏋️',
  'Books': '📚',
  'default': '📦'
};

const categoryService = {
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const result = await response.json();
      
      // API trả về: { status: 200, message: "...", data: [{id: 1, name: "Shoes"}, ...] }
      const categories = result.data || result;
      
      return categories.map(category => ({
        id: category.id,
        name: category.name,
        icon: categoryIcons[category.name] || categoryIcons['default'],
        productCount: 0, // API không có productCount, set = 0 hoặc gọi API khác để lấy
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to fake data if API fails
      return [
        { id: 1, name: 'Electronics', icon: '💻', productCount: 148 },
        { id: 2, name: 'Fashion', icon: '👔', productCount: 256 },
        { id: 3, name: 'Accessories', icon: '⌚', productCount: 189 },
        { id: 4, name: 'Home & Kitchen', icon: '🏠', productCount: 143 },
        { id: 5, name: 'Sports & Outdoors', icon: '⚽', productCount: 95 },
        { id: 6, name: 'Toys & Games', icon: '🎮', productCount: 127 },
        { id: 7, name: 'Health & Fitness', icon: '💪', productCount: 86 },
        { id: 8, name: 'Books', icon: '📚', productCount: 234 },
      ];
    }
  },

  async getProducts(filter = 'all') {
    try {
      // Gọi API products với filter
      const url = `${API_BASE_URL}/products${filter !== 'all' ? `?filter=${filter}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      // Map API response to frontend format
      // Điều chỉnh mapping này theo cấu trúc response thực tế của bạn
      return data.map(product => ({
        id: product.id,
        name: product.name || product.productName,
        image: product.image || product.imageUrl || '📦',
        createdDate: product.createdDate || product.createdAt || new Date().toLocaleDateString(),
        order: product.orderCount || product.totalOrders || 0,
        featured: product.featured || product.isFeatured || false,
        onSale: product.onSale || product.isOnSale || false,
        outOfStock: product.outOfStock || product.stock === 0 || false,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to fake data if API fails
      return [
        {
          id: 1,
          name: 'Wireless Bluetooth Headphones',
          image: '🎧',
          createdDate: '01-01-2025',
          order: 25,
          featured: true,
          onSale: false,
          outOfStock: false,
        },
        {
          id: 2,
          name: "Men's T-Shirt",
          image: '👕',
          createdDate: '01-01-2025',
          order: 20,
          featured: false,
          onSale: true,
          outOfStock: false,
        },
        {
          id: 3,
          name: "Men's Leather Wallet",
          image: '👛',
          createdDate: '01-01-2025',
          order: 35,
          featured: false,
          onSale: false,
          outOfStock: false,
        },
        {
          id: 4,
          name: 'Memory Foam Pillow',
          image: '🛏️',
          createdDate: '01-01-2025',
          order: 40,
          featured: true,
          onSale: false,
          outOfStock: false,
        },
        {
          id: 5,
          name: 'Coffee Maker',
          image: '☕',
          createdDate: '01-01-2025',
          order: 45,
          featured: false,
          onSale: false,
          outOfStock: false,
        },
        {
          id: 6,
          name: 'Casual Baseball Cap',
          image: '🧢',
          createdDate: '01-01-2025',
          order: 55,
          featured: false,
          onSale: true,
          outOfStock: false,
        },
        {
          id: 7,
          name: 'Full HD Webcam',
          image: '📷',
          createdDate: '01-01-2025',
          order: 20,
          featured: false,
          onSale: false,
          outOfStock: false,
        },
        {
          id: 8,
          name: 'Smart LED Color Bulb',
          image: '💡',
          createdDate: '01-01-2025',
          order: 16,
          featured: false,
          onSale: false,
          outOfStock: false,
        },
        {
          id: 9,
          name: "Men's T-Shirt",
          image: '👕',
          createdDate: '01-01-2025',
          order: 10,
          featured: false,
          onSale: false,
          outOfStock: true,
        },
        {
          id: 10,
          name: "Men's Leather Wallet",
          image: '👛',
          createdDate: '01-01-2025',
          order: 35,
          featured: false,
          onSale: false,
          outOfStock: false,
        },
      ];
    }
  },
};

export default categoryService;
