import React, { useState } from 'react';
import { Search, Filter, Users, UserCheck, Star, Package, TrendingUp, ShoppingBag, Receipt } from 'lucide-react';
import CustomerActions from './CustomerActions';
import './CustomersTable.css';

const CustomersTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats data cho customers
  const statsData = [
    { 
      title: 'Total Customers', 
      value: '2,847', 
      icon: <Users size={24} />, 
      color: 'blue',
      description: 'Registered customers',
      change: '+12.5%',
      changeType: 'positive'
    },
    { 
      title: 'Active Customers', 
      value: '1,942', 
      icon: <UserCheck size={24} />, 
      color: 'green',
      description: 'Active this month',
      change: '+8.2%',
      changeType: 'positive'
    },
    { 
      title: 'Total order', 
      value: '156', 
      icon: <ShoppingBag size={24} />, 
      color: 'yellow',
      description: 'Tổng đơn hàng đã giao thành công',
      change: '+15.1%',
      changeType: 'positive'
    },
    { 
      title: 'Total Revenue', 
      value: '$284.50', 
      icon: <Receipt size={24} />, 
      color: 'purple',
      description: 'Average per order',
      change: '+5.8%',
      changeType: 'positive'
    }
  ];
  
  // Mock data dựa theo ảnh
  const customersData = [
    { id: '#CUST001', name: 'John Doe', phone: '+1234567890', orderCount: 25, totalSpend: 3450.00, status: 'Active' },
    { id: '#CUST001', name: 'John Doe', phone: '+1234567890', orderCount: 25, totalSpend: 3450.00, status: 'Active' },
    { id: '#CUST001', name: 'John Doe', phone: '+1234567890', orderCount: 25, totalSpend: 3450.00, status: 'Active' },
    { id: '#CUST001', name: 'John Doe', phone: '+1234567890', orderCount: 25, totalSpend: 3450.00, status: 'Active' },
    { id: '#CUST001', name: 'Jane Smith', phone: '+1234567890', orderCount: 5, totalSpend: 250.00, status: 'Inactive' },
    { id: '#CUST001', name: 'Emily Davis', phone: '+1234567890', orderCount: 30, totalSpend: 4600.00, status: 'VIP' },
    { id: '#CUST001', name: 'Jane Smith', phone: '+1234567890', orderCount: 5, totalSpend: 250.00, status: 'Inactive' },
    { id: '#CUST001', name: 'John Doe', phone: '+1234567890', orderCount: 25, totalSpend: 3450.00, status: 'Active' },
    { id: '#CUST001', name: 'Emily Davis', phone: '+1234567890', orderCount: 30, totalSpend: 4600.00, status: 'VIP' },
    { id: '#CUST001', name: 'Jane Smith', phone: '+1234567890', orderCount: 5, totalSpend: 250.00, status: 'Inactive' },
  ];

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'VIP': return 'status-vip';
      default: return '';
    }
  };

  const getStatusDot = (status) => {
    switch(status) {
      case 'Active': return '●';
      case 'Inactive': return '●';
      case 'VIP': return '●';
      default: return '●';
    }
  };

  const handleCustomerAction = {
    onView: (customer) => {
      console.log('View customer:', customer);
      // Implement view logic
    },
    onEdit: (customer) => {
      console.log('Edit customer:', customer);
      // Implement edit logic
    },
    onDelete: (customer) => {
      console.log('Delete customer:', customer);
      // Implement delete logic
      if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
        // Delete logic here
      }
    },
    onContact: (customer, type) => {
      console.log(`Contact customer ${customer.name} via ${type}`);
      // Implement contact logic
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="customers-header">
        <h1 className="customers-title">Customers</h1>
        
        {/* Search and Filter */}
        <div className="customers-actions">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button className="filter-btn">
            <Filter size={20} />
            Filter
          </button>
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
              <p className="stat-description">{stat.description}</p>
              <div className="stat-change">
                <span className={`change-indicator ${stat.changeType}`}>
                  {stat.change}
                </span>
                <span className="change-period">vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer Id</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Order Count</th>
              <th>Total Spend</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customersData.map((customer, index) => (
              <tr key={index} className="table-row">
                <td className="customer-id">{customer.id}</td>
                <td className="customer-name">{customer.name}</td>
                <td className="customer-phone">{customer.phone}</td>
                <td className="order-count">{customer.orderCount}</td>
                <td className="total-spend">{customer.totalSpend.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(customer.status)}`}>
                    <span className="status-dot">{getStatusDot(customer.status)}</span>
                    {customer.status}
                  </span>
                </td>
                <td className="action-cell">
                  <CustomerActions 
                    customer={customer}
                    onView={handleCustomerAction.onView}
                    onEdit={handleCustomerAction.onEdit}
                    onDelete={handleCustomerAction.onDelete}
                    onContact={handleCustomerAction.onContact}
                  />
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
    </div>
  );
};

export default CustomersTable;