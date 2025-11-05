import axiosInstance from '../utils/axiosConfig';

const customerService = {

   async getAllTopBuyers() {
    try {
      console.log('📊 Fetching all top buyers from shop');
      const response = await axiosInstance.get('/seller/top-buyers');
      
      console.log('✅ All top buyers response:', response.data);
      
      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        // Transform data để hiển thị trong bảng với 5 cột
        const transformedData = response.data.data.map((buyer, index) => ({
          key: buyer.userId, // Antd Table cần key
          id: buyer.userId,
          no: index + 1, // STT tự động
          username: buyer.username,
          email: buyer.email,
          totalAmount: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(buyer.totalAmount),
          totalOrder: buyer.totalCompletedOrders,
          // Raw values để sort
          rawAmount: buyer.totalAmount,
          rawOrders: buyer.totalCompletedOrders
        }));
        
        console.log('🔄 Transformed buyers data:', transformedData);
        return transformedData;
      }
      
      console.warn('Unexpected API response format for all buyers:', response.data);
      return [];
    } catch (error) {
      console.error('❌ Error fetching all top buyers:', error);
      return [];
    }
  },
  
  async getCustomers() {
    try {
      const response = await axiosInstance.get('/users');
      // API trả về { status, error, message, data }
      // Danh sách users nằm trong response.data.data
      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      console.warn('Unexpected API response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  },

  async getTopBuyers(limit = 5) {
    try {
      console.log(`📊 Fetching top ${limit} buyers`);
      const response = await axiosInstance.get(`/seller/top-buyers/limit/${limit}`);
      
      console.log('✅ Top buyers response:', response.data);
      
      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        // Transform data để phù hợp với format hiện tại của TopSpendersCard
        const transformedData = response.data.data.map((buyer, index) => ({
          id: buyer.userId,
          name: buyer.username,
          avatar: '👤', // Default avatar
          spent: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(buyer.totalAmount),
          orders: buyer.totalCompletedOrders,
          email: buyer.email
        }));
        
        console.log('🔄 Transformed top buyers data:', transformedData);
        return transformedData;
      }
      
      console.warn('Unexpected API response format for top buyers:', response.data);
      return [];
    } catch (error) {
      console.error('❌ Error fetching top buyers:', error);
      // Fallback to mock data nếu API lỗi
      return [
        { id: 1, name: 'Không có dữ liệu', avatar: '👤', spent: '0 ₫', orders: 0 },
      ];
    }
  },

  async getCustomerStats() {
    try {
      // Lấy top buyers từ API thực tế
      const topSpenders = await this.getTopBuyers(5);
      
      return {
        totalCustomers: 2548,
        activeCustomers: 1895,
        newThisMonth: 156,
        averageOrderValue: '$1,845',
        topSpenders: topSpenders, // Sử dụng dữ liệu từ API
        customerGrowth: [
          { month: 'Jan', value: 320 },
          { month: 'Feb', value: 280 },
          { month: 'Mar', value: 350 },
          { month: 'Apr', value: 420 },
          { month: 'May', value: 380 },
          { month: 'Jun', value: 450 },
        ],
        customerSegments: [
          { name: 'VIP Customers', count: 245, percentage: 9.6, color: '#FFD700' },
          { name: 'Regular Customers', count: 1650, percentage: 64.8, color: '#10b981' },
          { name: 'New Customers', count: 453, percentage: 17.8, color: '#3b82f6' },
          { name: 'Inactive', count: 200, percentage: 7.8, color: '#ef4444' },
        ],
      };
    } catch (error) {
      console.error('❌ Error fetching customer stats:', error);
      // Fallback to mock data
      return {
        totalCustomers: 2548,
        activeCustomers: 1895,
        newThisMonth: 156,
        averageOrderValue: '$1,845',
        topSpenders: [
          { id: 1, name: 'Không có dữ liệu', avatar: '👤', spent: '0 ₫', orders: 0 },
        ],
        customerGrowth: [],
        customerSegments: [],
      };
    }
  },
};

export default customerService;
