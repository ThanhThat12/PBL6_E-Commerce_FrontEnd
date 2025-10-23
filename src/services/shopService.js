import axiosInstance from '../utils/axiosConfig';

const shopService = {
  // Lấy thông tin shop của seller
  async getShopInfo() {
    // Gọi API: GET /api/seller/shop
    try {
      console.log('🏪 Fetching shop info...');
      const response = await axiosInstance.get('/seller/shop');
      
      console.log('✅ Shop info response:', response.data);
      
      if (response.data.status === 200 && response.data.data) {
        // Chuyển đổi data từ backend sang format frontend
        const shopData = {
          id: response.data.data.id,
          name: response.data.data.name,
          address: response.data.data.address,
          description: response.data.data.description,
          status: response.data.data.status, // ACTIVE, INACTIVE, SUSPENDED
          created_at: response.data.data.createdAt,
        };
        
        console.log('🏪 Processed shop data:', shopData);
        return shopData;
      }
      
      throw new Error(response.data.message || 'Không thể lấy thông tin shop');
    } catch (error) {
      console.error('❌ Error fetching shop info:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Cập nhật thông tin shop
  async updateShopInfo(shopData) {
    // Gọi API: PUT /api/seller/shop
    try {
      console.log('🔄 Updating shop info:', shopData);
      
      const response = await axiosInstance.put('/seller/shop', {
        name: shopData.name,
        address: shopData.address,
        description: shopData.description,
        status: shopData.status, // Frontend gửi ACTIVE/INACTIVE
      });

      console.log('✅ Update shop response:', response.data);
      
      if (response.data.status === 200) {
        return {
          success: true,
          message: response.data.message || 'Cập nhật thông tin shop thành công',
          data: response.data.data,
        };
      }
      
      throw new Error(response.data.message || 'Không thể cập nhật thông tin shop');
    } catch (error) {
      console.error('❌ Error updating shop info:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Lấy danh sách sản phẩm của shop theo shop_id
  async getShopProducts(shopId, filters = {}) {
    try {
      console.log('🛍️ Fetching shop products with filters:', filters);
      
      // Tạo query parameters
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page - 1); // Backend dùng 0-based indexing
      if (filters.size) params.append('size', filters.size);
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      
      const response = await axiosInstance.get(`/products/manage?${params.toString()}`);
      
      console.log('✅ Shop products response:', response.data);
      
      if (response.data.status === 200 && response.data.data) {
        const { content, totalElements, totalPages, number, size } = response.data.data;
        
        // Map data từ backend sang frontend format (compatible với ProductGrid hiện tại)
        const products = content.map(product => ({
          id: product.id,
          name: product.name,
          category: product.categoryName,
          price: product.basePrice,
          discount: 0, // Backend chưa có discount, tạm set 0
          image: product.mainImage || product.image,
          inStock: product.isActive && product.stock > 0,
          sold: 0, // Backend chưa có sold count, tạm set 0
          stock: product.stock,
          // Thêm các field khác để tương thích
          description: product.description,
          basePrice: product.basePrice,
          isActive: product.isActive,
          categoryId: product.category?.id,
          shopName: product.shopName,
          variants: product.variants || [],
          images: product.images || [],
        }));
        
        console.log('🛍️ Processed products:', products);
        
        return {
          products,
          total: totalElements,
          page: number + 1, // Convert to 1-based
          limit: size,
        };
      }
      
      throw new Error(response.data.message || 'Không thể lấy danh sách sản phẩm');
    } catch (error) {
      console.error('❌ Error fetching shop products:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Xử lý trường hợp không có sản phẩm
      if (error.response?.status === 200 && 
          error.response?.data?.status === 200 &&
          error.response?.data?.data?.content && 
          Array.isArray(error.response.data.data.content) && 
          error.response.data.data.content.length === 0) {
        console.log('🛍️ No products found, returning empty array');
        return {
          products: [],
          total: 0,
          page: 1,
          limit: 10,
        };
      }
      
      throw error;
    }
  },

  // Lấy chi tiết sản phẩm theo ID
  async getProductDetail(productId) {
    try {
      console.log(`🔍 Fetching product detail for ID: ${productId}`);
      
      const response = await axiosInstance.get(`/products/${productId}`);
      
      console.log('✅ Product detail response:', response.data);
      
      if (response.data.status === 200 && response.data.data) {
        const productData = response.data.data;
        
        // Map data từ backend sang frontend format
        const product = {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          mainImage: productData.mainImage,
          basePrice: productData.basePrice,
          price: productData.price,
          isActive: productData.isActive,
          stock: productData.stock,
          image: productData.image,
          categoryName: productData.categoryName,
          shopName: productData.shopName,
          category: productData.category,
          variants: productData.variants || [],
          images: productData.images || [],
          condition: productData.condition,
        };
        
        console.log('🔍 Processed product detail:', product);
        return product;
      }
      
      throw new Error(response.data.message || 'Không thể lấy thông tin sản phẩm');
    } catch (error) {
      console.error('❌ Error fetching product detail:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Xóa sản phẩm theo ID
  async deleteProduct(productId) {
    try {
      console.log(`🗑️ Deleting product ID: ${productId}`);
      
      const response = await axiosInstance.delete(`/products/${productId}`);
      
      console.log('✅ Delete product response:', response.data);
      
      if (response.data.status === 200) {
        return {
          success: true,
          message: response.data.message || 'Xóa sản phẩm thành công',
        };
      }
      
      throw new Error(response.data.message || 'Không thể xóa sản phẩm');
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

  // Cập nhật sản phẩm
  async updateProduct(productId, productData) {
    try {
      console.log(`🔄 Updating product ID: ${productId}`, productData);
      
      const response = await axiosInstance.put(`/products/${productId}`, {
        categoryId: productData.categoryId,
        shopId: productData.shopId,
        name: productData.name,
        description: productData.description,
        basePrice: productData.basePrice,
        isActive: productData.isActive,
        mainImage: productData.mainImage,
        variants: productData.variants,
        imageUrls: productData.imageUrls,
      });

      console.log('✅ Update product response:', response.data);
      
      if (response.data.status === 200) {
        return {
          success: true,
          message: response.data.message || 'Cập nhật sản phẩm thành công',
          data: response.data.data,
        };
      }
      
      throw new Error(response.data.message || 'Không thể cập nhật sản phẩm');
    } catch (error) {
      console.error('❌ Error updating product:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  },

};

export default shopService;
