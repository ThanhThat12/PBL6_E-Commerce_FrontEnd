import React, { useState } from 'react';
import { Search, Filter, Package, TrendingUp, AlertTriangle, ShoppingCart, Plus, Upload, Eye, Trash2 } from 'lucide-react';
import './ProductsTable.css';
import ProductDetailModal from './ProductDetailModal';

const ProductsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Stats data cho products
  const statsData = [
    { 
      title: 'Total Products', 
      value: '1,847', 
      icon: <Package size={24} />, 
      color: 'blue',
      description: 'Products in inventory',
      change: '+12.3%',
      changeType: 'positive'
    },
    { 
      title: 'Active Products', 
      value: '1,642', 
      icon: <ShoppingCart size={24} />, 
      color: 'green',
      description: 'Currently available',
      change: '+8.7%',
      changeType: 'positive'
    },
    { 
      title: 'Low Stock', 
      value: '24', 
      icon: <AlertTriangle size={24} />, 
      color: 'orange',
      description: 'Need restocking',
      change: '+15.2%',
      changeType: 'negative'
    },
    { 
      title: 'Top Selling', 
      value: '156', 
      icon: <TrendingUp size={24} />, 
      color: 'purple',
      description: 'Best performers',
      change: '+22.1%',
      changeType: 'positive'
    }
  ];
   
  // Mock data cho products
  const productsData = [
    { 
      id: 'PRD001', 
      name: 'iPhone 15 Pro Max', 
      shopName: 'Apple Store Official',
      sku: 'IP15PM001',
      category: 'Electronics',
      description: 'The latest iPhone with A17 Pro chip, titanium design, and advanced camera system.',
      price: 1199.00,
      stock: 45,
      status: 'Active',
      sales: 2847,
      rating: 4.8,
      image: 'https://via.placeholder.com/50x50',
      dateAdded: '2024-01-15'
    },
    { 
      id: 'PRD002', 
      name: 'MacBook Pro M3', 
      shopName: 'Apple Store Official',
      sku: 'MBP24001',
      category: 'Electronics',
      description: 'Powerful laptop with M3 chip, stunning Liquid Retina XDR display, and all-day battery life.',
      price: 2499.00,
      stock: 12,
      status: 'Active',
      sales: 1596,
      rating: 4.9,
      image: 'https://via.placeholder.com/50x50',
      dateAdded: '2024-02-20'
    },
    { 
      id: 'PRD003', 
      name: 'Nike Air Max', 
      shopName: 'Nike Official Store',
      sku: 'NAM2024',
      category: 'Fashion',
      description: 'Classic Nike sneakers with Air cushioning technology for superior comfort.',
      price: 159.99,
      stock: 0,
      status: 'Out of Stock',
      sales: 834,
      rating: 4.5,
      image: 'https://via.placeholder.com/50x50',
      dateAdded: '2024-03-10'
    },
    { 
      id: 'PRD004', 
      name: 'Coffee Table Oak', 
      shopName: 'Furniture World',
      sku: 'CTO2024',
      category: 'Furniture',
      description: 'Modern oak coffee table with minimalist design, perfect for any living room.',
      price: 349.00,
      stock: 8,
      status: 'Inactive',
      sales: 245,
      rating: 4.3,
      image: 'https://via.placeholder.com/50x50',
      dateAdded: '2024-04-05'
    },
    { 
      id: 'PRD005', 
      name: 'Samsung Galaxy S24', 
      shopName: 'Samsung Official',
      sku: 'SGS24001',
      category: 'Electronics',
      description: 'Latest Samsung flagship with AI-powered camera, stunning display, and 5G connectivity.',
      price: 899.00,
      stock: 67,
      status: 'Active',
      sales: 1923,
      rating: 4.6,
      image: 'https://via.placeholder.com/50x50',
      dateAdded: '2024-05-12'
    }
  ];

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      case 'Out of Stock': return 'status-out-of-stock';
      default: return 'status-default';
    }
  };

  const getCategoryClass = (category) => {
    switch(category) {
      case 'Electronics': return 'category-electronics';
      case 'Fashion': return 'category-fashion';
      case 'Furniture': return 'category-furniture';
      case 'Sports': return 'category-sports';
      default: return 'category-default';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star-filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star-half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star-empty">★</span>);
    }
    
    return stars;
  };

  const handleProductAction = {
    onView: (product) => {
      setSelectedProduct(product);
      setShowDetailModal(true);
    },
    onDelete: (product) => {
      console.log('Delete product:', product);
      if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
        alert(`${product.name} has been deleted`);
      }
    }
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    console.log('Updating product:', productId, updatedData);
    // TODO: Call API to update product
    // For now, just simulate success
    return Promise.resolve();
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  };

  const categories = ['All', 'Accessories', 'Bags', 'Clothing', 'Fitness Equipment', 'Shoes', 'Sports Equipment'];
  const statuses = ['All', 'Active', 'Inactive', 'Out of Stock'];

  return (
    <div>
      {/* Header Section */}
      <div className="products-header">
        <div className="products-title-section">
          <h1 className="products-title">Products Management</h1>
        </div>
        
        {/* Actions */}
        <div className="products-actions">
          <div className="search-filter-group">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="import-btn">
              <Upload size={18} />
              Import
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

    
        
      {/* Filters Section */}
      <div className="filters-wrapper">
        <div className="filter-card">
          <label className="filter-label">Categories</label>
          <select 
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category === 'All' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-card">
          <label className="filter-label">Status</label>
          <select 
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statuses.map(status => (
              <option key={status} value={status === 'All' ? '' : status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Sales</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsData.map((product, index) => (
              <tr key={index} className="table-row">
                <td className="product-info">
                  <div className="product-details">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-image"
                    />
                    <div className="product-text">
                      <div className="product-name">{product.name}</div>
                      <div className="product-sku">SKU: {product.sku}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`category-badge ${getCategoryClass(product.category)}`}>
                    {product.category}
                  </span>
                </td>
                <td className="product-price">
                  ${product.price.toFixed(2)}
                </td>
                <td className="product-stock">
                  <span className={`stock-badge ${product.stock <= 10 ? 'low-stock' : ''}`}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(product.status)}`}>
                    <span className="status-dot">●</span>
                    {product.status}
                  </span>
                </td>
                <td className="product-sales">
                  {product.sales.toLocaleString()}
                </td>
                <td className="product-rating">
                  <div className="rating-stars">
                    {renderStars(product.rating)}
                  </div>
                  <span className="rating-value">{product.rating}</span>
                </td>
                <td className="action-cell">
                  <div className="customer-actions product-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={(e) => { e.stopPropagation(); handleProductAction.onView(product); }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleProductAction.onDelete(product); }}
                      title="Delete Product"
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

      {/* Product Detail Modal */}
      {showDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onUpdate={handleUpdateProduct}
        />
      )}
    </div>
  );
};

export default ProductsTable;