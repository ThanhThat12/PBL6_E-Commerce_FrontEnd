import React, { useState } from 'react';
import { Search, Filter, TrendingUp, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import SellerActions from './SellerActions';
import './SellersTable.css';

const SellersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data cho sellers dựa trên ảnh và file Sellers.jsx
  const sellersData = [
    { 
      id: 'SEL001', 
      name: 'TechStore Inc.', 
      email: 'contact@techstore.com', 
      phone: '+1234567890', 
      status: 'Verified', 
      joinDate: '2024-01-10', 
      products: 150, 
      sales: '45,230.50',
      totalSales: 45230.50, 
      rating: 4.8, 
      avatar: 'https://via.placeholder.com/40',
      category: 'Electronics'
    },
    { 
      id: 'SEL002', 
      name: 'Fashion Hub', 
      email: 'info@fashionhub.com', 
      phone: '+1234567891', 
      status: 'Pending', 
      joinDate: '2024-02-15', 
      products: 85, 
      sales: '23,890.75',
      totalSales: 23890.75, 
      rating: 4.5, 
      avatar: 'https://via.placeholder.com/40',
      category: 'Fashion'
    },
    { 
      id: 'SEL003', 
      name: 'Home & Garden Co.', 
      email: 'sales@homegardenco.com', 
      phone: '+1234567892', 
      status: 'Verified', 
      joinDate: '2024-01-25', 
      products: 200, 
      sales: '67,450.25',
      totalSales: 67450.25, 
      rating: 4.9, 
      avatar: 'https://via.placeholder.com/40',
      category: 'Home & Garden'
    },
    { 
      id: 'SEL004', 
      name: 'Sports World', 
      email: 'hello@sportsworld.com', 
      phone: '+1234567893', 
      status: 'Suspended', 
      joinDate: '2024-03-05', 
      products: 45, 
      sales: '12,340.00',
      totalSales: 12340.00, 
      rating: 3.2, 
      avatar: 'https://via.placeholder.com/40',
      category: 'Sports'
    },
    { 
      id: 'SEL005', 
      name: 'Book Paradise', 
      email: 'contact@bookparadise.com', 
      phone: '+1234567894', 
      status: 'Verified', 
      joinDate: '2024-02-28', 
      products: 300, 
      sales: '89,650.80',
      totalSales: 89650.80, 
      rating: 4.7, 
      avatar: 'https://via.placeholder.com/40',
      category: 'Books'
    }
  ];

  // Stats data dựa trên ảnh
  const statsData = [
    { 
      title: 'Total Sellers', 
      value: '456', 
      icon: <Users size={24} />, 
      color: 'indigo',
      description: 'Active marketplace sellers'
    },
    { 
      title: 'Verified', 
      value: '342', 
      icon: <CheckCircle size={24} />, 
      color: 'green',
      description: 'Verified seller accounts'
    },
    { 
      title: 'Pending', 
      value: '89', 
      icon: <Clock size={24} />, 
      color: 'yellow',
      description: 'Awaiting verification'
    },
    { 
      title: 'Suspended', 
      value: '25', 
      icon: <XCircle size={24} />, 
      color: 'red',
      description: 'Suspended accounts'
    }
  ];

  const getStatusClass = (status) => {
    switch(status) {
      case 'Verified': return 'status-verified';
      case 'Pending': return 'status-pending';
      case 'Suspended': return 'status-suspended';
      default: return 'status-default';
    }
  };

  const getStatusDot = (status) => {
    return '●';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star-filled">★</span>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star-half">★</span>
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star-empty">★</span>
      );
    }
    
    return stars;
  };

  const handleSellerAction = {
    onView: (seller) => {
      console.log('View seller:', seller);
    },
    onApprove: (seller) => {
      console.log('Approve seller:', seller);
      if (window.confirm(`Approve ${seller.name}?`)) {
        // Approve logic here
      }
    },
    onSuspend: (seller) => {
      console.log('Suspend seller:', seller);
      if (window.confirm(`Suspend ${seller.name}?`)) {
        // Suspend logic here
      }
    },
    onDelete: (seller) => {
      console.log('Delete seller:', seller);
      if (window.confirm(`Are you sure you want to delete ${seller.name}?`)) {
        // Delete logic here
      }
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="sellers-header">
        <div className="sellers-title-section">
          <h1 className="sellers-title">Sellers Management</h1>
          <p className="sellers-subtitle">Manage seller accounts and monitor their performance</p>
        </div>
        
        {/* Actions */}
        <div className="sellers-actions">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="action-buttons">
            <button className="approve-btn">
              <CheckCircle size={18} />
              Approve Pending
            </button>
            <button className="export-btn">
              <TrendingUp size={18} />
              Export Report
            </button>
          </div>
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
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="sellers-table-container">
        <table className="sellers-table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Performance</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellersData.map((seller, index) => (
              <tr key={index} className="table-row">
                <td className="seller-info">
                  <div className="seller-avatar-container">
                    <img 
                      src={seller.avatar} 
                      alt={seller.name}
                      className="seller-avatar"
                    />
                    <div className="seller-details">
                      <div className="seller-name">{seller.name}</div>
                      <div className="seller-join-date">Since: {seller.joinDate}</div>
                    </div>
                  </div>
                </td>
                <td className="seller-contact">
                  <div className="contact-email">{seller.email}</div>
                  <div className="contact-phone">{seller.phone}</div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(seller.status)}`}>
                    <span className="status-dot">{getStatusDot(seller.status)}</span>
                    {seller.status}
                  </span>
                </td>
                <td className="seller-performance">
                  <div className="performance-products">{seller.products} Products</div>
                  <div className="performance-sales">${seller.sales} Sales</div>
                </td>
                <td className="seller-rating">
                  <div className="rating-stars">
                    {renderStars(seller.rating)}
                  </div>
                  <span className="rating-value">{seller.rating}</span>
                </td>
                <td className="action-cell">
                  <SellerActions 
                    seller={seller}
                    onView={handleSellerAction.onView}
                    onApprove={handleSellerAction.onApprove}
                    onSuspend={handleSellerAction.onSuspend}
                    onDelete={handleSellerAction.onDelete}
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
          <span>Showing 1 to 5 of {sellersData.length} results</span>
        </div>
        
        <div className="pagination-controls">
          <button className="pagination-btn">Previous</button>
          <div className="pagination-numbers">
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="pagination-dots">...</span>
            <button className="page-btn">10</button>
          </div>
          <button className="pagination-btn">Next</button>
        </div>
      </div>
    </div>
  );
};

export default SellersTable;