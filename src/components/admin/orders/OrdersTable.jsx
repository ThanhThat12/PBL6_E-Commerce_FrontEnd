import React, { useState } from 'react';
import { Search, X, Package, DollarSign, Clock, TrendingUp, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import OrderActions from './OrderActions';
import './OrdersTable.css';

const OrdersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock data for orders
  const ordersData = [
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      customer: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      },
      orderDate: '2024-10-16',
      status: 'Processing',
      total: 299.99,
      items: 3,
      paymentMethod: 'Credit Card',
      shippingAddress: '123 Main St, City, State 12345'
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      customer: {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
      },
      orderDate: '2024-10-15',
      status: 'Shipped',
      total: 149.50,
      items: 2,
      paymentMethod: 'PayPal',
      shippingAddress: '456 Oak Ave, City, State 67890'
    },
    {
      id: 3,
      orderNumber: 'ORD-2024-003',
      customer: {
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      },
      orderDate: '2024-10-15',
      status: 'Delivered',
      total: 89.99,
      items: 1,
      paymentMethod: 'Credit Card',
      shippingAddress: '789 Pine St, City, State 54321'
    },
    {
      id: 4,
      orderNumber: 'ORD-2024-004',
      customer: {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
      },
      orderDate: '2024-10-14',
      status: 'Pending',
      total: 459.99,
      items: 5,
      paymentMethod: 'Bank Transfer',
      shippingAddress: '321 Elm St, City, State 98765'
    },
    {
      id: 5,
      orderNumber: 'ORD-2024-005',
      customer: {
        name: 'David Brown',
        email: 'david.brown@email.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
      },
      orderDate: '2024-10-14',
      status: 'Cancelled',
      total: 199.99,
      items: 2,
      paymentMethod: 'Credit Card',
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
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Orders Management</h1>
        <p>Monitor and manage all customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-orders">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalOrders.toLocaleString()}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending-orders">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{pendingOrders}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed-orders">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{completedOrders}</div>
            <div className="stat-label">Completed Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">${totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
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
              <th onClick={() => handleSort('orderNumber')}>
                Order Number
                {sortField === 'orderNumber' && (
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
              <tr key={order.id}>
                <td>
                  <div className="order-number">
                    {order.orderNumber}
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
                  <OrderActions order={order} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing {startIndex + 1} to {Math.min(endIndex, sortedOrders.length)} of {sortedOrders.length} results
        </div>
        
        <div className="pagination-controls">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          {[...Array(Math.min(5, totalPages))].map((_, index) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = index + 1;
            } else if (currentPage <= 3) {
              pageNum = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + index;
            } else {
              pageNum = currentPage - 2 + index;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;