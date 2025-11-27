import api from '../api';

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

      const response = await api.get(`/products/my-products?${params.toString()}`);

      console.log('✅ My shop products response:', response.data);

      // Support both response shapes:
      // 1) Wrapped: { status: 200, data: { content: [...], page: {...} } }
      // 2) Raw:   { content: [...], page: {...} }
      let payload = response.data;
      if (payload && payload.status === 200 && payload.data) {
        payload = payload.data;
      }

      // API shape: { content: [...], page: { size, number, totalElements, totalPages } }
      const content = (payload && (payload.content || payload.items)) || [];
      const pageInfo = (payload && (payload.page || payload)) || {};

      console.log('📊 Pagination info:', {
        totalElements: pageInfo.totalElements,
        totalPages: pageInfo.totalPages,
        currentPage: (pageInfo.number || 0) + 1,
        size: pageInfo.size || content.length,
        contentLength: content.length,
      });

      const mappedProducts = content.map(product => {
        // derive SKU: prefer top-level sku, otherwise first variant sku
        const derivedSku = product.sku || (product.variants && product.variants.length > 0 ? product.variants[0].sku : undefined) || '';
        const mainImage = product.mainImage || product.image || (product.images && product.images[0] && product.images[0].imageUrl) || null;
        const computedStock = (product.stock != null)
          ? product.stock
          : (product.variants ? product.variants.reduce((s, v) => s + (v.stock || 0), 0) : 0);
        const computedPrice = (product.price != null) ? product.price : product.basePrice;

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          sku: derivedSku,
          mainImage,
          basePrice: product.basePrice,
          isActive: product.isActive,
          category: product.category,
          categoryName: product.categoryName || (product.category && product.category.name),
          shopName: product.shopName,
          variants: product.variants || [],
          images: product.images || [],
          stock: computedStock,
          price: computedPrice,
          image: product.image || product.mainImage,
          createdAt: product.createdAt || null,
        };
      });

      return {
        products: mappedProducts,
        total: pageInfo.totalElements || content.length,
        totalPages: pageInfo.totalPages || 1,
        page: (pageInfo.number || 0) + 1,
        limit: pageInfo.size || content.length || 10,
        hasNext: typeof pageInfo.number === 'number' ? (pageInfo.number < ((pageInfo.totalPages || 1) - 1)) : false,
        hasPrev: typeof pageInfo.number === 'number' ? (pageInfo.number > 0) : false,
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
      const response = await api.get(`/products/${productId}`);

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
      console.log('🔑 Axios headers:', api.defaults.headers);

      const response = await api.delete(`/products/${productId}`);

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

  // Cập nhật sản phẩm (using ProductUpdateDTO)
  async updateProduct(productId, productData) {
    try {
      const response = await api.put(`/products/${productId}`, productData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
