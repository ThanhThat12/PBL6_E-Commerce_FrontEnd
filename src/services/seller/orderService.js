import api from '../api';

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
      
      const res = await api.get(url);

      console.log('✅ Orders response:', res);

      if (res.status === 200) {
        const orders = res.data || [];
        
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

        // Map dữ liệu từ backend về format frontend (include legacy keys used by UI)
        const processedOrders = orders.map(order => ({
          id: order.id,
          orderCode: order.id,
          createdAt: order.createdAt || order.created_at,
          method: order.paymentMethod || order.method || 'Unknown',
          paymentMethod: order.paymentMethod || order.method || 'Unknown',
          paymentStatus: order.paymentStatus || 'UNPAID',
          // keep backend status code so Select can use it (e.g., 'PENDING', 'COMPLETED')
          status: order.status,
          // friendly label if needed elsewhere
          statusLabel: mapStatus(order.status),
          totalAmount: order.totalAmount || order.total_amount || 0,
          userId: order.userId || order.user_id,
          customerName: order.customerName || order.customer_name || (order.userId ? `User ${order.userId}` : 'Unknown'),
          phone: order.customerPhone || order.customer_phone || '',
          shippingAddress: order.shippingAddress || order.shipping_address || '',
          itemCount: (order.items || order.orderItems || []).length || 0,
          items: order.items || order.orderItems || [],
          notes: order.notes || '',
          discount: order.discount || 0,
          shippingFee: order.shippingFee || order.shipping_fee || 0,
        }));
        
        console.log('📦 Processed orders:', processedOrders);
        
        return {
          orders: processedOrders,
          total: res.total || processedOrders.length,
          page: res.page || 1,
          limit: res.limit || 20,
          message: res.message || 'Lấy danh sách đơn hàng thành công'
        };
      }
      
      throw new Error(res?.message || 'Không thể lấy danh sách đơn hàng');
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
      
      const res = await api.get(`/seller/orders/${orderId}`);

      console.log('✅ Order detail response:', res);

      if (res.status === 200 && res.data) {
        const order = res.data;

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

        // Prefer receiver fields if present (backend uses receiverName/Phone/Address)
        const customerName = order.receiverName || order.customerName || order.customer_name || (order.userId ? `User ${order.userId}` : 'Unknown');
        const phone = order.receiverPhone || order.customerPhone || order.customer_phone || '';
        const shippingAddress = order.receiverAddress || order.shippingAddress || order.shipping_address || '';

        // Normalize items for frontend
        const items = (order.items || order.orderItems || []).map(i => ({
          id: i.id,
          productId: i.productId || i.product_id,
          variantId: i.variantId || i.variant_id,
          variantName: i.variantName || i.variant_name || i.name || '',
          price: i.price || i.unitPrice || 0,
          quantity: i.quantity || i.qty || 0,
          subtotal: i.subtotal || (i.price && i.quantity ? i.price * i.quantity : 0),
          productName: i.productName || i.product_name || i.name || '',
          productImage: i.productImage || i.product_image || i.image || '',
        }));

        return {
          id: order.id,
          orderCode: order.id,
          createdAt: order.createdAt || order.created_at,
          updatedAt: order.updatedAt || order.updated_at,
          shopId: order.shopId || order.shop_id,
          method: order.method || order.paymentMethod || 'Unknown',
          status: order.status,
          statusLabel: mapStatus(order.status),
          totalAmount: order.totalAmount || order.total_amount || 0,
          userId: order.userId || order.user_id,
          customerName,
          phone,
          customerEmail: order.customerEmail || order.customer_email || '',
          shippingAddress,
          items,
          notes: order.notes || '',
          discount: order.discount || 0,
          shippingFee: order.shippingFee || order.shipping_fee || 0,
          trackingNumber: order.trackingNumber || order.tracking_number || '',
          estimatedDelivery: order.estimatedDelivery || order.estimated_delivery || '',
        };
      }
      
      throw new Error(res?.message || 'Không thể lấy chi tiết đơn hàng');
    } catch (error) {
      console.error('❌ Error fetching order detail:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, newStatus, notes = '') {
    try {
      console.log('🔄 Updating order status:', { orderId, newStatus, notes });
      
      // Helper: if caller passed an already-valid backend code, use it;
      // otherwise map friendly labels to backend codes.
      const mapStatusToBackend = (frontendStatusOrCode) => {
        const backendCodes = ['CANCELLED', 'COMPLETED', 'PENDING', 'PROCESS', 'PROCESSING'];
        if (!frontendStatusOrCode) return frontendStatusOrCode;
        // If already a backend code, return as-is
        if (backendCodes.includes(frontendStatusOrCode)) return frontendStatusOrCode;

        const statusMap = {
          'Pending': 'PENDING',
          'Processing': 'PROCESS',
          'Processing...': 'PROCESS',
          'Shipping': 'PROCESS',
          'Completed': 'COMPLETED',
          'Cancelled': 'CANCELLED'
        };
        return statusMap[frontendStatusOrCode] || frontendStatusOrCode;
      };
      
      const response = await api.put(`/seller/orders/${orderId}/status`, {
        status: mapStatusToBackend(newStatus),
        notes: notes
      });
      
      console.log('✅ Update order status response:', response);

      if (response.status === 200) {
        return {
          success: true,
          message: response.message || 'Cập nhật trạng thái đơn hàng thành công',
          data: response.data
        };
      }
      
      throw new Error(response?.message || 'Không thể cập nhật trạng thái đơn hàng');
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  },

  // Lấy thống kê đơn hàng
  async getOrderStatistics(period = 'month') {
    try {
      console.log('📊 Fetching order statistics for period:', period);
      
      const res = await api.get(`/seller/orders/statistics?period=${period}`);

      console.log('✅ Order statistics response:', res);

      if (res.status === 200 && res.data) {
        return res.data;
      }

      throw new Error(res?.message || 'Không thể lấy thống kê đơn hàng');
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
      
      const res = await api.get(`/seller/orders/search?q=${encodeURIComponent(searchTerm)}`);

      console.log('✅ Search orders response:', res);

      if (res.status === 200) {
        const orders = res.data || [];
        
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
          orderCode: order.id,
          createdAt: order.createdAt || order.created_at,
          method: order.paymentMethod || order.method || 'Unknown',
          status: order.status,
          statusLabel: mapStatus(order.status),
          totalAmount: order.totalAmount || order.total_amount || 0,
          userId: order.userId || order.user_id,
          customerName: order.customerName || order.customer_name || (order.userId ? `User ${order.userId}` : 'Unknown'),
          phone: order.customerPhone || order.customer_phone || '',
          shippingAddress: order.shippingAddress || order.shipping_address || '',
          itemCount: (order.items || order.orderItems || []).length || 0,
        }));
        
        return {
          orders: processedOrders,
          total: processedOrders.length,
          message: res.message || 'Tìm kiếm thành công'
        };
      }
      
      throw new Error(res?.message || 'Không thể tìm kiếm đơn hàng');
    } catch (error) {
      console.error('❌ Error searching orders:', error);
      throw error;
    }
  }
};

export default orderService;

// Backwards-compatible named exports for existing components
export const getOrders = async (filters) => {
  // Return in the legacy shape expected by existing components: { content: [], totalElements, page, limit }
  const res = await orderService.getOrders(filters);
  return {
    content: res.orders || [],
    totalElements: res.total || (res.orders ? res.orders.length : 0),
    page: res.page || 1,
    limit: res.limit || 20,
    message: res.message || ''
  };
};
export const updateOrderStatus = (orderId, status) => orderService.updateOrderStatus(orderId, status);
export const getOrderDetail = (orderId) => orderService.getOrderDetail(orderId);

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPING: 'SHIPPING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

// Action APIs for seller order management
export const confirmOrder = async (orderId) => {
  try {
    const response = await api.patch(`/seller/orders/${orderId}/confirm`);
    return response.data;
  } catch (error) {
    console.error('Error confirming order:', error);
    throw error;
  }
};

export const shipOrder = async (orderId) => {
  try {
    const response = await api.patch(`/seller/orders/${orderId}/ship`);
    return response.data;
  } catch (error) {
    console.error('Error shipping order:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await api.patch(`/seller/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Refund management APIs
export const getRefundRequests = async () => {
  try {
    const response = await api.get('/refund/requests');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    throw error;
  }
};

export const reviewRefund = async (refundId, approve, rejectReason = '') => {
  try {
    const response = await api.post(`/refund/review/${refundId}`, null, {
      params: { approve, rejectReason }
    });
    return response.data;
  } catch (error) {
    console.error('Error reviewing refund:', error);
    throw error;
  }
};

export const confirmReceipt = async (refundId) => {
  try {
    const response = await api.post(`/refund/confirm-receipt/${refundId}`);
    return response.data;
  } catch (error) {
    console.error('Error confirming receipt:', error);
    throw error;
  }
};
