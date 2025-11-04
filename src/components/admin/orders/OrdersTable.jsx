import React, { useState } from 'react';
import { Search, X, Package, DollarSign, Clock, TrendingUp, ChevronLeft, ChevronRight, Filter, Eye, Printer, Trash2 } from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';
import './OrdersTable.css';

const OrdersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock data for orders
  const ordersData = [
    {
      idOrder: 1,
      orderNumber: 'ORD-2024-001',
      customer: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      },
      shopName: 'Tech Paradise Store',
      orderDate: '2024-10-16',
      status: 'Processing',
      total: 299.99,
      items: 3,
      paymentMethod: 'COD',
      shippingAddress: '123 Main St, City, State 12345'
    },
    {
      idOrder: 2,
      orderNumber: 'ORD-2024-002',
      customer: {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+1 (555) 234-5678',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
      },
      shopName: 'Fashion Hub',
      orderDate: '2024-10-15',
      status: 'Shipped',
      total: 149.50,
      items: 2,
      paymentMethod: 'Momo',
      shippingAddress: '456 Oak Ave, City, State 67890'
    },
    {
      idOrder: 3,
      orderNumber: 'ORD-2024-003',
      customer: {
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        phone: '+1 (555) 345-6789',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      },
      shopName: 'Home Essentials',
      orderDate: '2024-10-15',
      status: 'Delivered',
      total: 89.99,
      items: 1,
      paymentMethod: 'COD',
      shippingAddress: '789 Pine St, City, State 54321'
    },
    {
      idOrder: 4,
      orderNumber: 'ORD-2024-004',
      customer: {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '+1 (555) 456-7890',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
      },
      shopName: 'Beauty & Care',
      orderDate: '2024-10-14',
      status: 'Pending',
      total: 459.99,
      items: 5,
      paymentMethod: 'Momo',
      shippingAddress: '321 Elm St, City, State 98765'
    },
    {
      idOrder: 5,
      orderNumber: 'ORD-2024-005',
      customer: {
        name: 'David Brown',
        email: 'david.brown@email.com',
        phone: '+1 (555) 567-8901',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
      },
      shopName: 'Sports World',
      orderDate: '2024-10-14',
      status: 'Cancelled',
      total: 199.99,
      items: 2,
      paymentMethod: 'COD',
      shippingAddress: '654 Maple Ave, City, State 13579'
    }
  ];

  // Stats calculations
  const totalOrders = ordersData.length;
  const pendingOrders = ordersData.filter(order => order.status === 'Pending').length;
  const completedOrders = ordersData.filter(order => order.status === 'Delivered').length;
  const totalRevenue = ordersData
    .filter(order => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + order.total, 0);

  // Filter and search logic
  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = order.idOrder.toString().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'customer') {
      aValue = a.customer.name;
      bValue = b.customer.name;
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = sortedOrders.slice(startIndex, endIndex);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handlePrint = (order) => {
    console.log('Print order:', order);
    // TODO: Implement print functionality
  };

  const handleDelete = (order) => {
    if (window.confirm(`Are you sure you want to delete order #${order.idOrder}?`)) {
      console.log('Delete order:', order);
      // TODO: Implement delete functionality
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  };

  // Stats data configuration
  const statsData = [
    { 
      title: 'Total Orders', 
      value: totalOrders.toLocaleString(), 
      icon: <Package size={24} />, 
      color: 'blue',
      description: 'All orders received',
      change: '+12.5%',
      changeType: 'positive'
    },
    { 
      title: 'Pending Orders', 
      value: pendingOrders, 
      icon: <Clock size={24} />, 
      color: 'orange',
      description: 'Awaiting processing',
      change: '+3.2%',
      changeType: 'positive'
    },
    { 
      title: 'Completed Orders', 
      value: completedOrders, 
      icon: <TrendingUp size={24} />, 
      color: 'green',
      description: 'Successfully delivered',
      change: '+18.7%',
      changeType: 'positive'
    },
    { 
      title: 'Total Revenue', 
      value: `$${totalRevenue.toLocaleString()}`, 
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
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-container">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="items-per-page">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('idOrder')}>
                Order ID
                {sortField === 'idOrder' && (
                  <span className={`sort-indicator ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('customer')}>
                Customer
                {sortField === 'customer' && (
                  <span className={`sort-indicator ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('orderDate')}>
                Order Date
                {sortField === 'orderDate' && (
                  <span className={`sort-indicator ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('status')}>
                Status
                {sortField === 'status' && (
                  <span className={`sort-indicator ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('items')}>
                Items
                {sortField === 'items' && (
                  <span className={`sort-indicator ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('total')}>
                Total
                {sortField === 'total' && (
                  <span className={`sort-indicator ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('paymentMethod')}>
                Payment
                {sortField === 'paymentMethod' && (
                  <span className={`sort-indicator ${sortDirection}`}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <tr key={order.idOrder}>
                <td>
                  <div className="order-number">
                    {order.idOrder}
                  </div>
                </td>
                <td>
                  <div className="customer-info">
                    <img 
                      src={order.customer.avatar} 
                      alt={order.customer.name}
                      className="customer-avatar"
                    />
                    <div className="customer-details">
                      <div className="customer-name">{order.customer.name}</div>
                      <div className="customer-email">{order.customer.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="order-date">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="items-count">
                    {order.items} item{order.items > 1 ? 's' : ''}
                  </div>
                </td>
                <td>
                  <div className="order-total">
                    ${order.total.toFixed(2)}
                  </div>
                </td>
                <td>
                  <div className="payment-method">
                    {order.paymentMethod}
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
                    <button 
                      className="action-btn print-btn"
                      title="Print Order"
                      onClick={() => handlePrint(order)}
                    >
                      <Printer size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      title="Delete Order"
                      onClick={() => handleDelete(order)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          <button className="pagination-nav">
            <span>← Previous</span>
          </button>
        </div>
        
        <div className="pagination-numbers">
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">4</button>
          <button className="page-btn">5</button>
          <span className="pagination-dots">...</span>
          <button className="page-btn">24</button>
        </div>
        
        <div className="pagination-info">
          <button className="pagination-nav">
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