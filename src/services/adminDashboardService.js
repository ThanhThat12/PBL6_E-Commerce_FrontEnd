import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const ADMIN_DASHBOARD_BASE_URL = `${API_BASE_URL}admin/dashboard`;

const getAuthHeader = () => {
  const token = localStorage.getItem('adminToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const adminDashboardService = {
  // 1. Get Dashboard Statistics
  getDashboardStats: async () => {
    try {
      const response = await axios.get(`${ADMIN_DASHBOARD_BASE_URL}/stats`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // 2. Get Sales by Category
  getSalesByCategory: async () => {
    try {
      const response = await axios.get(`${ADMIN_DASHBOARD_BASE_URL}/sales-by-category`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      throw error;
    }
  },

  // 3. Get Top Selling Products
  getTopSellingProducts: async (limit = 10) => {
    try {
      const response = await axios.get(`${ADMIN_DASHBOARD_BASE_URL}/top-products`, {
        ...getAuthHeader(),
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      throw error;
    }
  },

  // 4. Get Recent Orders
  getRecentOrders: async (limit = 10) => {
    try {
      const response = await axios.get(`${ADMIN_DASHBOARD_BASE_URL}/recent-orders`, {
        ...getAuthHeader(),
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  },

  // 5. Get Revenue Chart Data
  getRevenueChart: async (months = 12) => {
    try {
      const response = await axios.get(`${ADMIN_DASHBOARD_BASE_URL}/revenue-chart`, {
        ...getAuthHeader(),
        params: { months }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue chart:', error);
      throw error;
    }
  },

  // 6. Get Recent Activities
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await axios.get(`${ADMIN_DASHBOARD_BASE_URL}/recent-activities`, {
        ...getAuthHeader(),
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }
};

export default adminDashboardService;
