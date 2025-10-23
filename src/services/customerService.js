const API_BASE_URL = 'http://localhost:8081/api';

const customerService = {
  async getCustomers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const result = await response.json();
      // API trả về { status, error, message, data }
      // Danh sách users nằm trong result.data
      if (result.status === 200 && Array.isArray(result.data)) {
        return result.data;
      }
      console.warn('Unexpected API response format:', result);
      return [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  },

  async getCustomerStats() {
    return {
      totalCustomers: 2548,
      activeCustomers: 1895,
      newThisMonth: 156,
      averageOrderValue: '$1,845',
      topSpenders: [
        { id: 1, name: 'Phạm Thị D', avatar: '👤', spent: '$3,120.00', orders: 52 },
        { id: 2, name: 'Bùi Thị H', avatar: '👤', spent: '$2,580.00', orders: 42 },
        { id: 3, name: 'Nguyễn Văn A', avatar: '👤', spent: '$2,450.00', orders: 45 },
        { id: 4, name: 'Vũ Thị F', avatar: '👤', spent: '$2,100.00', orders: 38 },
        { id: 5, name: 'Trần Thị B', avatar: '👤', spent: '$1,890.00', orders: 32 },
      ],
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
  },
};

export default customerService;
