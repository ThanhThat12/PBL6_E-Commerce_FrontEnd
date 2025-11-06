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

  // ✅ Lấy sản phẩm đã duyệt của shop
  async getApprovedProducts(filters = {}) {
    try {
      console.log('🏪 Fetching approved shop products with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page - 1); // Convert to 0-based
      if (filters.size) params.append('size', filters.size || 10);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy || 'id');
      if (filters.sortDir) params.append('sortDir', filters.sortDir || 'desc');

      const response = await axiosInstance.get(`/products/my-shop/approved?${params.toString()}`);
      
      console.log('✅ Approved products response:', response.data);
      
      if (response.data.status === 200 && response.data.data) {
        const { content, page } = response.data.data;
        

        const flattenedProducts = [];
        
        content.forEach(product => {
          if (product.variants && product.variants.length > 0) {
            // Tạo card riêng cho mỗi variant
            product.variants.forEach(variant => {
              // Tìm ảnh cho variant
              const variantImage = getVariantImage(variant, product.images, product.mainImage || product.image);
              
              // Tạo tên variant
              const variantName = createVariantName(product.name, variant);
              
              flattenedProducts.push({
                id: `${product.id}-${variant.id}`,
                originalProductId: product.id,
                variantId: variant.id,
                name: variantName,
                price: variant.price,
                image: variantImage,
                stock: variant.stock || 0,
                sku: variant.sku,
                isVariant: true
              });
            });
          } else {
            // Sản phẩm không có variant
            flattenedProducts.push({
              id: product.id,
              originalProductId: product.id,
              variantId: null,
              name: product.name,
              price: product.basePrice || product.price,
              image: product.mainImage || product.image,
              stock: product.stock || 0,
              sku: null,
              isVariant: false
            });
          }
        });

        console.log('🏪 Flattened products:', flattenedProducts);
        
        return {
          products: flattenedProducts,
          total: flattenedProducts.length, // Tổng số products + variants
          totalPages: 1, // Hiển thị tất cả trong 1 trang
          currentPage: 1,
          pageSize: flattenedProducts.length,
        };
      }
      
      return {
        products: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
      };
    } catch (error) {
      console.error('❌ Error fetching approved products:', error);
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

// ✅ Helper functions để tối ưu xử lý
function getVariantImage(variant, productImages, mainImage) {
  if (!productImages || productImages.length === 0) {
    return mainImage || 'https://via.placeholder.com/200';
  }
  
  // Tìm color attribute
  const colorValue = variant.variantValues?.find(val => 
    val.productAttribute.name.toLowerCase().includes('color')
  )?.value;
  
  if (colorValue) {
    const matchingImage = productImages.find(img => 
      img.color?.toLowerCase() === colorValue.toLowerCase()
    );
    if (matchingImage) return matchingImage.imageUrl;
  }
  
  return mainImage || 'https://via.placeholder.com/200';
}

function createVariantName(productName, variant) {
  if (!variant.variantValues || variant.variantValues.length === 0) {
    return `${productName} - ${variant.sku}`;
  }
  
  const attributes = variant.variantValues
    .map(val => val.value)
    .join(', ');
    
  return `${productName} - ${attributes}`;
}

export default shopService;
