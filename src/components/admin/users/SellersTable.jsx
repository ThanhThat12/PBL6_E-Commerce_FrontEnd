import React, { useState } from 'react';
import { Search, TrendingUp, Users, CheckCircle, Clock, XCircle, Eye, Trash2 } from 'lucide-react';
import SellerDetailModal from './SellerDetailModal';
import './SellersTable.css';

const SellersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Mock data cho sellers
  const sellersData = [
    { 
      id: 'SEL001', 
      name: 'TechStore Inc.', 
      email: 'contact@techstore.com', 
      phone: '+1234567890', 
      status: 'Verified', 
      joinDate: '2024-01-10', 
      products: 150, 
      sales: '45,230',
      totalSales: 45230.50, 
      rating: 4.8, 
      avatar: null, // TODO: Load from API
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
      sales: '23,890',
      totalSales: 23890.75, 
      rating: 4.5, 
      avatar: null, // TODO: Load from API
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
      sales: '67,450',
      totalSales: 67450.25, 
      rating: 4.9, 
      avatar: null, // TODO: Load from API
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
      sales: '12,340',
      totalSales: 12340.00, 
      rating: 3.2, 
      avatar: null, // TODO: Load from API
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
      avatar: null, // TODO: Load from API
      category: 'Books'
    }
  ];

  // Stats data
  const statsData = [
    { 
      title: 'Total Sellers', 
      value: '456', 
      icon: <Users size={24} />, 
      color: 'indigo',
    },
    { 
      title: 'Verified', 
      value: '342', 
      icon: <CheckCircle size={24} />, 
      color: 'green',
    },
    { 
      title: 'Pending', 
      value: '89', 
      icon: <Clock size={24} />, 
      color: 'yellow',
    },
    { 
      title: 'Suspended', 
      value: '25', 
      icon: <XCircle size={24} />, 
      color: 'red',
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

  const handleViewDetails = (seller) => {
    setSelectedSeller(seller);
    setShowModal(true);
  };

  const handleDelete = (seller) => {
    console.log('Delete seller:', seller);
    if (window.confirm(`Are you sure you want to delete ${seller.name}?`)) {
      alert(`${seller.name} has been deleted`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSeller(null);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="sellers-header">
        <div className="sellers-title-section">
          <h1 className="sellers-title">Sellers Management</h1>
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
              <th>Products</th>
              <th>Revenue</th>
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
                      className="seller-avatar"
                    />
                    <div className="seller-details">
                      <div className="seller-name">{seller.name}</div>
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
                <td className="seller-products">
                  <span className="products-count">{seller.products}</span>
                </td>
                <td className="seller-revenue">
                  <span className="revenue-amount">{seller.sales}</span>
                </td>

                <td className="action-cell">
                  <div className="customer-actions seller-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={(e) => { e.stopPropagation(); handleViewDetails(seller); }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDelete(seller); }}
                      title="Delete Seller"
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

      {/* Seller Detail Modal */}
      {showModal && (
        <SellerDetailModal 
          seller={selectedSeller}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SellersTable;