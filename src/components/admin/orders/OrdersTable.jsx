import React, { useState, useEffect } from 'react';
import { Search, X, Package, DollarSign, Clock, TrendingUp, ChevronLeft, ChevronRight, Filter, Eye, Printer, Trash2 } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';
import { getAdminOrders, getAdminOrderStats, getAdminOrdersByStatus, searchAdminOrders } from '../../../services/adminOrderService';
import './OrdersTable.css';

const OrdersTable = () => {
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for API
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });

  // Debounced search - wait 500ms after user stops typing
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchOrders();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Fetch orders when page or status changes (no debounce needed)
  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching order stats...');
      const response = await getAdminOrderStats();
      
      if (response.status === 200 && response.data && response.data.data) {
        console.log('✅ Stats loaded:', response.data.data);
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`📡 Fetching orders - page: ${currentPage}, size: 10, status: ${statusFilter || 'ALL'}, search: "${searchTerm}"`);
      
      let response;
      
      // Priority: 1. Search, 2. Status filter, 3. All orders
      if (searchTerm && searchTerm.trim() !== '') {
        // Use search API
        response = await searchAdminOrders(searchTerm.trim(), currentPage, 10);
      } else if (statusFilter) {
        // Use status filter API
        response = await getAdminOrdersByStatus(statusFilter, currentPage, 10);
      } else {
        // Get all orders
        response = await getAdminOrders(currentPage, 10);
      }
      
      console.log('📦 API Response:', response);
      
      if (response.status === 200 && response.data && response.data.data) {
        const { content, page } = response.data.data;
        
        console.log('✅ Orders loaded:', content?.length || 0);
        console.log('📄 Pagination:', page);
        
        setOrders(content || []);
        setPagination({
          totalPages: page?.totalPages || 0,
          totalElements: page?.totalElements || 0,
          size: page?.size || 10,
          number: page?.number || 0
        });
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get payment status badge
  const getPaymentBadge = (payment) => {
    const badges = {
      'PAID': 'status-delivered',
      'UNPAID': 'status-pending',
      'FAILED': 'status-cancelled'
    };
    return badges[payment] || 'status-pending';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'status-pending',
      'PROCESSING': 'status-processing',
      'SHIPPING': 'status-shipping',
      'COMPLETED': 'status-delivered',
      'CANCELLED': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
  };

  // Handle view details
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  // Handle delete
  const handleDelete = (order) => {
    if (window.confirm(`Are you sure you want to delete order #${order.orderId}?`)) {
      console.log('Delete order:', order);
      // TODO: Implement delete functionality
    }
  };

  // Stats data configuration
  const statsData = [
    { 
      title: 'Total Orders', 
      value: stats.totalOrders.toLocaleString(), 
      icon: <Package size={24} />, 
      color: 'blue',
      description: 'All orders received',
      change: '+12.5%',
      changeType: 'positive'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: <Clock size={24} />, 
      color: 'orange',
      description: 'Awaiting processing',
      change: '+3.2%',
      changeType: 'positive'
    },
    { 
      title: 'Completed Orders', 
      value: stats.completedOrders, 
      icon: <TrendingUp size={24} />, 
      color: 'green',
      description: 'Successfully delivered',
      change: '+18.7%',
      changeType: 'positive'
    },
    { 
      title: 'Total Revenue', 
      value: formatCurrency(stats.totalRevenue), 
      icon: <DollarSign size={24} />, 
      color: 'purple',
      description: 'Revenue generated',
      change: '+25.3%',
      changeType: 'positive'
    }
  ];

  return (
    <div>
      {/* Header Section */}
      <div className="orders-header">
        <div className="orders-title-section">
          <h1 className="orders-title">Orders Management</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.title}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="orders-controls">
        <div className="search-container">
          <Search className="admin-order-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by ID, name, phone, date (DD/MM/YYYY), address..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="admin-order-search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={handleClearSearch}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <div className="order-filter-container"> 
          <select 
            className="order-status-filter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPING">Shipping</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>


      {/* Orders Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchOrders}>Try Again</button>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <div className="order-number">
                        #{order.orderId}
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-details">
                          <div className="customer-name">{order.customerName}</div>
                          <div className="customer-email">{order.receiverPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="order-date">
                        {formatDate(order.orderDate)}
                      </div>
                    </td>
                    <td>
                      <div className="order-total">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getPaymentBadge(order.payment)}`}>
                        {order.payment}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="location-text">
                        {order.location || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="customer-actions order-actions">
                        <button 
                          className="action-btn view-btn"
                          title="View Details"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye size={16} />
                        </button>
                        {/* <button 
                          className="action-btn delete-btn"
                          title="Delete Order"
                          onClick={() => handleDelete(order)}
                        >
                          <Trash2 size={16} />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <Package size={48} />
                    <h3>No orders found</h3>
                    <p>There are no orders to display</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="admin-order-pagination-container">
        <div className="admin-order-pagination-info">
          <button 
            className="admin-order-pagination-nav"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
          >
            <span>← Previous</span>
          </button>
        </div>
        
        <div className="admin-order-pagination-numbers">
          {pagination.totalPages > 0 ? (
            [...Array(pagination.totalPages)].map((_, index) => (
              <button
                key={index}
                className={`admin-order-page-btn ${currentPage === index ? 'active' : ''}`}
                onClick={() => handlePageChange(index)}
                disabled={loading}
              >
                {index + 1}
              </button>
            ))
          ) : (
            <button className="admin-order-page-btn active" disabled>
              1
            </button>
          )}
        </div>
        
        <div className="admin-order-pagination-info">
          <button 
            className="admin-order-pagination-nav"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages - 1 || loading}
          >
            <span>Next →</span>
          </button>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrdersTable;