const dashboardService = {
  async getDashboard() {
    // sau này sẽ gọi API backend
    return {
      totalSales: 350,
      totalRevenue: 12000,
      totalCustomers: 250,
      chart: [
        { day: "Sun", value: 50 },
        { day: "Mon", value: 20 },
        { day: "Tue", value: 15 },
        { day: "Wed", value: 25 },
        { day: "Thu", value: 30 },
        { day: "Fri", value: 40 },
        { day: "Sat", value: 18 },
      ],
      topProducts: [
        { id: 1, name: "Áo sơ mi", sold: 120, trend: [10, 15, 20, 25] },
        { id: 2, name: "Giày thể thao", sold: 90, trend: [8, 12, 18, 22] },
        { id: 3, name: "Balo", sold: 75, trend: [5, 10, 15, 18] },
        { id: 4, name: "Quần jean", sold: 68, trend: [7, 11, 14, 16] },
        { id: 5, name: "Túi xách", sold: 55, trend: [6, 9, 12, 14] },
      ],
      transactions: [
        { key: 1, no: 1, customerId: '#4544', orderDate: '01 Oct | 11:29 am', status: 'Paid', amount: '$64' },
        { key: 2, no: 2, customerId: '#5412', orderDate: '01 Oct | 11:29 am', status: 'Pending', amount: '$257' },
        { key: 3, no: 3, customerId: '#6622', orderDate: '01 Oct | 11:29 am', status: 'Paid', amount: '$156' },
        { key: 4, no: 4, customerId: '#8662', orderDate: '01 Oct | 11:29 am', status: 'Paid', amount: '$265' },
        { key: 5, no: 5, customerId: '#8662', orderDate: '01 Oct | 11:29 am', status: 'Paid', amount: '$265' },
      ],
      bestSellingProducts: [
        { key: 1, name: 'Apple iPhone 13', icon: '📱', totalOrder: 104, status: 'Stock', price: '$999.00' },
        { key: 2, name: 'Nike Air Jordan', icon: '👟', totalOrder: 56, status: 'Stock out', price: '$999.00' },
        { key: 3, name: 'T-shirt', icon: '👕', totalOrder: 266, status: 'Stock', price: '$999.00' },
        { key: 4, name: 'Cross Bag', icon: '👜', totalOrder: 500, status: 'Stock', price: '$999.00' },
      ],
      salesByCountry: [
        { id: 1, name: 'US', flag: '🇺🇸', sales: '30k', percentage: 85, change: 29.8 },
        { id: 2, name: 'Brazil', flag: '🇧🇷', sales: '30k', percentage: 65, change: -19.8 },
        { id: 3, name: 'Australia', flag: '🇦🇺', sales: '25k', percentage: 75, change: 35.8 },
      ],
      usersData: [12, 19, 15, 25, 22, 30, 28, 35, 32, 38, 42, 45, 40, 48, 44, 50, 47, 52, 49, 55],
      addProductCategories: [
        { id: 1, name: 'Electronic', icon: '💻' },
        { id: 2, name: 'Fashion', icon: '👔' },
        { id: 3, name: 'Home', icon: '🏠' },
      ],
      addProductItems: [
        { id: 1, name: 'Smart Fitness Tracker', icon: '⌚', price: '$38.99', buttonText: '$2 Add' },
        { id: 2, name: 'Leather Wallet', icon: '👛', price: '$12.99', buttonText: '$2 Add' },
        { id: 3, name: 'Electric Usb Warmer', icon: '🔌', price: '$34.99', buttonText: '$2 Add' },
      ],
    };
  },
};

export default dashboardService;
