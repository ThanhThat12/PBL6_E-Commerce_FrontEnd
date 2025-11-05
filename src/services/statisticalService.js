import axiosInstance from '../utils/axiosConfig';

const statisticalService = {
  // Lấy thống kê doanh thu theo năm
  async getRevenueByYear(year) {
    try {
      console.log('📊 Fetching revenue data for year:', year);
      
      const response = await axiosInstance.get(`/seller/shop/analytics?year=${year}`);
      
      console.log('✅ Revenue analytics response:', response.data);
      
      if (response.data.status === 200 && response.data.data) {
        const data = response.data.data;
        
        // Map dữ liệu từ backend về format frontend
        const monthlyRevenue = data.monthlyRevenue.map(item => ({
          month: item.month,
          revenue: item.revenue || 0,
          orders: item.orderCount || 0
        }));
        
        // Tính toán summary
       const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = monthlyRevenue.reduce((sum, item) => sum + item.orders, 0);
      const averageRevenue = monthlyRevenue.length > 0 ? 
        totalRevenue / 12 : 0;
        // Tìm tháng có doanh thu cao nhất và thấp nhất
        const monthsWithRevenue = monthlyRevenue.filter(item => item.revenue > 0);
        const highestMonth = monthsWithRevenue.length > 0 ? 
          monthsWithRevenue.reduce((max, item) => item.revenue > max.revenue ? item : max) :
          { month: 1, revenue: 0, orders: 0 };
        
        const lowestMonth = monthsWithRevenue.length > 0 ? 
          monthsWithRevenue.reduce((min, item) => item.revenue < min.revenue ? item : min) :
          { month: 1, revenue: 0, orders: 0 };
        
        return {
          year: year,
          monthlyRevenue: monthlyRevenue,
          summary: {
            totalRevenue: totalRevenue,
            totalOrders: totalOrders,
            averageRevenue: averageRevenue,
            highestMonth: highestMonth,
            lowestMonth: lowestMonth,
          },
        };
      }
      
      throw new Error(response.data.message || 'Không thể lấy dữ liệu thống kê');
    } catch (error) {
      console.error('❌ Error fetching revenue data:', error);
      throw error;
    }
  },

  // Lấy danh sách các năm có dữ liệu
  async getAvailableYears() {
    try {
      console.log('📊 Fetching available years');
      
      // Gọi API để lấy danh sách năm có dữ liệu
      const response = await axiosInstance.get('/seller/shop/analytics/years');
      
      console.log('✅ Available years response:', response.data);
      
      if (response.data.status === 200 && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Không thể lấy danh sách năm');
    } catch (error) {
      console.error('❌ Error fetching available years:', error);
      
      // Fallback: trả về các năm gần đây nếu API không có
      const currentYear = new Date().getFullYear();
      return [currentYear, currentYear - 1, currentYear - 2];
    }
  },

  // Lấy thống kê tổng quan
  async getOverallStatistics() {
    try {
      console.log('📊 Fetching overall statistics');
      
      const response = await axiosInstance.get('/seller/shop/analytics/overall');
      
      console.log('✅ Overall statistics response:', response.data);
      
      if (response.data.status === 200 && response.data.data) {
        const data = response.data.data;
        
        return {
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || data.totalCompletedOrders || 0,
          totalProducts: data.totalProducts || 0,
          totalCustomers: data.totalCustomers || 0,
          growthRate: data.growthRate || 0, // % so với năm trước
        };
      }
      
      throw new Error(response.data.message || 'Không thể lấy thống kê tổng quan');
    } catch (error) {
      console.error('❌ Error fetching overall statistics:', error);
      
      // Fallback data nếu API không có
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        growthRate: 0,
      };
    }
  },
};

export default statisticalService;
