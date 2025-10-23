import axiosInstance from '../utils/axiosConfig';

const orderService = {
  // Lấy danh sách đơn hàng của seller
  async getOrders(filters = {}) {
    try {
      console.log('📦 Fetching orders with filters:', filters);
      
      // Tạo query parameters từ filters
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      const url = queryString ? `/seller/orders?${queryString}` : '/seller/orders';
      
      console.log('📦 API URL:', url);
      
      const response = await axiosInstance.get(url);
      
      console.log('✅ Orders response:', response.data);
      
      if (response.data.status === 200) {
        const orders = response.data.data || [];
        
        // Helper function để map status từ backend sang frontend
        const mapStatus = (backendStatus) => {
          const statusMap = {
            'PENDING': 'Pending',
            'PROCESSING': 'Processing', 
            'SHIPPING': 'Shipping',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled'
          };
          return statusMap[backendStatus] || backendStatus;
        };

        // Map dữ liệu từ backend về format frontend
        const processedOrders = orders.map(order => ({
          id: order.id,
          created_at: order.createdAt || order.created_at,
          method: order.paymentMethod || order.method || 'Unknown',
          status: mapStatus(order.status),
          total_amount: order.totalAmount || order.total_amount || 0,
          user_id: order.userId || order.user_id,
          customer_name: order.customerName || order.customer_name || 'Unknown',
          customer_phone: order.customerPhone || order.customer_phone || '',
          shipping_address: order.shippingAddress || order.shipping_address || '',
          items: order.items || order.orderItems || [],
          notes: order.notes || '',
          discount: order.discount || 0,
          shipping_fee: order.shippingFee || order.shipping_fee || 0,
        }));
        
        console.log('📦 Processed orders:', processedOrders);
        
        return {
          orders: processedOrders,
          total: response.data.total || processedOrders.length,
          page: response.data.page || 1,
          limit: response.data.limit || 20,
          message: response.data.message || 'Lấy danh sách đơn hàng thành công'
        };
      }
      
      throw new Error(response.data.message || 'Không thể lấy danh sách đơn hàng');
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Xử lý trường hợp database chưa có order nào (trả về empty array)
      if (error.response?.status === 200 && 
          error.response?.data?.status === 200 &&
          error.response?.data?.data && 
          Array.isArray(error.response.data.data) && 
          error.response.data.data.length === 0) {
        console.log('📦 No orders found, returning empty array');
        return {
          orders: [],
          total: 0,
          page: 1,
          limit: 20,
          message: error.response.data.message || 'Chưa có đơn hàng nào'
        };
      }
      
      // Nếu response thành công nhưng không có lỗi network
      if (!error.response && error.request) {
        console.log('📦 No response received, may be network issue');
        throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.');
      }
      
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng
  async getOrderDetail(orderId) {
    try {
      console.log('📦 Fetching order detail for ID:', orderId);
      
      const response = await axiosInstance.get(`/seller/orders/${orderId}`);
      
      console.log('✅ Order detail response:', response.data);
      
      if (response.data.status === 200 && response.data.data) {
        const order = response.data.data;
        
        // Helper function để map status từ backend sang frontend
        const mapStatus = (backendStatus) => {
          const statusMap = {
            'PENDING': 'Pending',
            'PROCESSING': 'Processing', 
            'SHIPPING': 'Shipping',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled'
          };
          return statusMap[backendStatus] || backendStatus;
        };
        
        return {
          id: order.id,
          created_at: order.createdAt || order.created_at,
          method: order.paymentMethod || order.method || 'Unknown',
          status: mapStatus(order.status),
          total_amount: order.totalAmount || order.total_amount || 0,
          user_id: order.userId || order.user_id,
          customer_name: order.customerName || order.customer_name || 'Unknown',
          customer_phone: order.customerPhone || order.customer_phone || '',
          customer_email: order.customerEmail || order.customer_email || '',
          shipping_address: order.shippingAddress || order.shipping_address || '',
          items: order.items || order.orderItems || [],
          notes: order.notes || '',
          discount: order.discount || 0,
          shipping_fee: order.shippingFee || order.shipping_fee || 0,
          tracking_number: order.trackingNumber || order.tracking_number || '',
          estimated_delivery: order.estimatedDelivery || order.estimated_delivery || '',
        };
      }
      
      throw new Error(response.data.message || 'Không thể lấy chi tiết đơn hàng');
    } catch (error) {
      console.error('❌ Error fetching order detail:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, newStatus, notes = '') {
    try {
      console.log('🔄 Updating order status:', { orderId, newStatus, notes });
      
      // Helper function để map status từ frontend sang backend
      const mapStatusToBackend = (frontendStatus) => {
        const statusMap = {
          'Pending': 'PENDING',
          'Processing': 'PROCESSING', 
          'Shipping': 'SHIPPING',
          'Completed': 'COMPLETED',
          'Cancelled': 'CANCELLED'
        };
        return statusMap[frontendStatus] || frontendStatus;
      };
      
      const response = await axiosInstance.put(`/seller/orders/${orderId}/status`, {
        status: mapStatusToBackend(newStatus),
        notes: notes
      });
      
      console.log('✅ Update order status response:', response.data);
      
      if (response.data.status === 200) {
        return {
          success: true,
          message: response.data.message || 'Cập nhật trạng thái đơn hàng thành công',
          data: response.data.data
        };
      }
      
      throw new Error(response.data.message || 'Không thể cập nhật trạng thái đơn hàng');
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  },

  // Lấy thống kê đơn hàng
  async getOrderStatistics(period = 'month') {
    try {
      console.log('📊 Fetching order statistics for period:', period);
      
      const response = await axiosInstance.get(`/seller/orders/statistics?period=${period}`);
      
      console.log('✅ Order statistics response:', response.data);
      
      if (response.data.status === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Không thể lấy thống kê đơn hàng');
    } catch (error) {
      console.error('❌ Error fetching order statistics:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Fallback data nếu API chưa có
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0
      };
    }
  },

  // Tìm kiếm đơn hàng
  async searchOrders(searchTerm) {
    try {
      console.log('🔍 Searching orders with term:', searchTerm);
      
      const response = await axiosInstance.get(`/seller/orders/search?q=${encodeURIComponent(searchTerm)}`);
      
      console.log('✅ Search orders response:', response.data);
      
      if (response.data.status === 200) {
        const orders = response.data.data || [];
        
        // Helper function để map status từ backend sang frontend
        const mapStatus = (backendStatus) => {
          const statusMap = {
            'PENDING': 'Pending',
            'PROCESSING': 'Processing', 
            'SHIPPING': 'Shipping',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled'
          };
          return statusMap[backendStatus] || backendStatus;
        };
        
        const processedOrders = orders.map(order => ({
          id: order.id,
          created_at: order.createdAt || order.created_at,
          method: order.paymentMethod || order.method || 'Unknown',
          status: mapStatus(order.status),
          total_amount: order.totalAmount || order.total_amount || 0,
          user_id: order.userId || order.user_id,
          customer_name: order.customerName || order.customer_name || 'Unknown',
          customer_phone: order.customerPhone || order.customer_phone || '',
          shipping_address: order.shippingAddress || order.shipping_address || '',
        }));
        
        return {
          orders: processedOrders,
          total: processedOrders.length,
          message: response.data.message || 'Tìm kiếm thành công'
        };
      }
      
      throw new Error(response.data.message || 'Không thể tìm kiếm đơn hàng');
    } catch (error) {
      console.error('❌ Error searching orders:', error);
      throw error;
    }
  }
};

export default orderService;
