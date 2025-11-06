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
    
    console.log('✅ Raw API Products response:', response.data);
    
    if (response.data.status === 200 && Array.isArray(response.data.data)) {
      const transformedData = response.data.data.map((product, productIndex) => {
        console.log(`🔄 Processing product ${productIndex + 1}:`, product);

        // ✅ Tính tổng stock từ variants
        let totalStock = 0;
        let variantDetails = [];

        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          // Có variants - tính tổng stock
          product.variants.forEach((variant, variantIndex) => {
            const variantStock = parseInt(variant.stock) || 0;
            totalStock += variantStock;
            variantDetails.push({
              sku: variant.sku,
              stock: variantStock,
              price: variant.price
            });
          });
          
          console.log(`  📊 Stock calculation for ${product.name}:`, {
            variantCount: product.variants.length,
            variantDetails,
            totalCalculated: totalStock,
            originalProductStock: product.stock
          });
        } else {
          // Không có variants - lấy stock từ product level
          totalStock = parseInt(product.stock) || 0;
          console.log(`  📦 No variants for ${product.name}, using product stock: ${totalStock}`);
        }
        
        const transformedProduct = {
          id: product.id,
          name: product.name || 'Tên không có',
          categoryName: product.categoryName || product.category?.name,
          price: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(product.basePrice || product.price || 0),
          isActive: product.isActive !== undefined ? product.isActive : true,
          
          // ✅ Stock data từ variants
          stock: totalStock, // Tổng stock từ tất cả variants
          variants: product.variants || [],
          variantCount: product.variants ? product.variants.length : 0,
          
          // ✅ Thêm raw data để debug
          rawStock: product.stock,
          rawVariants: product.variants
        };

        console.log(`  ✅ Transformed product "${product.name}":`, {
          stock: transformedProduct.stock,
          variantCount: transformedProduct.variantCount,
          variants: transformedProduct.variants
        });
        
        return transformedProduct;
      });
      
      console.log('🎯 Final transformed data:', transformedData);
      return transformedData;
    }
    
    console.warn('Unexpected API response format:', response.data);
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
