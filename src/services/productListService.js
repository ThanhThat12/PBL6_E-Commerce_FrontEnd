import axiosInstance from '../utils/axiosConfig';

const productListService = {
  // Lấy tất cả sản phẩm của shop
  async getMyShopProducts(filters = {}) {
    try {
      console.log('🛍️ Fetching my shop products with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page - 1);
      if (filters.size) params.append('size', filters.size || 10);
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.sortBy) params.append('sortBy', filters.sortBy || 'id');
      if (filters.sortDir) params.append('sortDir', filters.sortDir || 'desc');

      const response = await axiosInstance.get(`/products/my-shop/all?${params.toString()}`);
      
      console.log('✅ My shop products response:', response.data);

      if (response.data.status === 200 && response.data.data) {
        const pageData = response.data.data;
      
     console.log('📊 Pagination info:', {
          totalElements: pageData.totalElements,
          totalPages: pageData.totalPages,  
          currentPage: pageData.number + 1,
          size: pageData.size,
          contentLength: pageData.content?.length
        });
        
        const mappedProducts = pageData.content.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          mainImage: product.mainImage,
          basePrice: product.basePrice,
          isActive: product.isActive,
          category: product.category,
          categoryName: product.categoryName,
          shopName: product.shopName,
          variants: product.variants || [],
          images: product.images || [],
          stock: product.stock,
          price: product.price,
          image: product.image,
        }));
        return {
          products: mappedProducts,
          total: pageData.totalElements, // ✅ Tổng số từ backend pagination
          totalPages: pageData.totalPages,
          page: (pageData.number || 0) + 1, // Convert về 1-based
          limit: pageData.size || 10,
          hasNext: !pageData.last,
          hasPrev: !pageData.first,
        };
      }
      
      return {
        products: [],
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
    } catch (error) {
      console.error('❌ Error fetching my shop products:', error);
      throw error;
    }
  },

    // Lấy thống kê sản phẩm (approved/pending count)
  async getProductStats() {
    try {
      console.log('📊 Fetching product stats...');
      
      // Gọi 2 API song song để lấy count
      const [approvedResult, pendingResult] = await Promise.all([
        this.getMyShopProducts({ page: 1, size: 1, isActive: true }),
        this.getMyShopProducts({ page: 1, size: 1, isActive: false })
      ]);
      
      const stats = {
        approved: approvedResult.total,
        pending: pendingResult.total,
        total: approvedResult.total + pendingResult.total
      };
      
      console.log('✅ Product stats:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Error fetching product stats:', error);
      return {
        approved: 0,
        pending: 0,
        total: 0
      };
    }
  },

  // Lấy chi tiết sản phẩm
  async getProductDetail(productId) {
    try {
      const response = await axiosInstance.get(`/products/${productId}`);
      
      if (response.data.status === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Không thể lấy thông tin sản phẩm');
    } catch (error) {
      console.error('❌ Error fetching product detail:', error);
      throw error;
    }
  },

 // Xóa sản phẩm
async deleteProduct(productId) {
  try {
    console.log(`🗑️ Deleting product ID: ${productId}`);
    console.log('🔗 API URL:', `/products/${productId}`);
    console.log('🔑 Axios headers:', axiosInstance.defaults.headers);
    
    const response = await axiosInstance.delete(`/products/${productId}`);
    
    console.log('✅ Delete response received');
    console.log('📊 Response status:', response.status);
    console.log('📦 Response data:', response.data);
    console.log('📋 Response headers:', response.headers);
    
    if (response.status === 200) {
      if (response.data && response.data.status === 200) {
        console.log('✅ Delete successful with 200 + data.status=200');
        return response.data;
      }
      console.log('✅ Delete successful with 200 (no data.status)');
      return { message: 'Xóa sản phẩm thành công' };
    } else if (response.status === 204) {
      console.log('✅ Delete successful with 204 No Content');
      return { message: 'Xóa sản phẩm thành công' };
    }
    
    console.error('❌ Unexpected response status:', response.status);
    throw new Error('Phản hồi không hợp lệ từ server');
    
  } catch (error) {
    console.error('❌ Delete error caught:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    if (error.response) {
      console.error('❌ Error response status:', error.response.status);
      console.error('❌ Error response data:', error.response.data);
      console.error('❌ Error response headers:', error.response.headers);
      
      const status = error.response.status;
      const errorData = error.response.data;
      
      switch (status) {
        case 400:
          throw new Error(errorData?.message || 'Yêu cầu không hợp lệ');
        case 401:
          throw new Error('Bạn cần đăng nhập để thực hiện thao tác này');
        case 403:
          throw new Error('Bạn không có quyền xóa sản phẩm này');
        case 404:
          throw new Error('Sản phẩm không tồn tại hoặc đã được xóa');
        case 409:
          throw new Error('Không thể xóa sản phẩm vì có ràng buộc dữ liệu');
        case 500:
          throw new Error('Lỗi máy chủ, vui lòng thử lại sau');
        default:
          throw new Error(errorData?.message || `Lỗi ${status}: Không thể xóa sản phẩm`);
      }
    } else if (error.request) {
      console.error('❌ Network error - no response received');
      console.error('❌ Request details:', error.request);
      throw new Error('Không thể kết nối đến máy chủ');
    } else {
      console.error('❌ Other error:', error.message);
      throw new Error(error.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    }
  }
},

  // Cập nhật sản phẩm
  async updateProduct(productId, productData) {
    try {
      const response = await axiosInstance.put(`/products/${productId}`, productData);
      
      if (response.data.status === 200) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Không thể cập nhật sản phẩm');
    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  },
};

export default productListService;