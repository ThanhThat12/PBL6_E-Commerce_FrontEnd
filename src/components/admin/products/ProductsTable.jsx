import React, { useState } from 'react';
import { Search, Filter, Package, TrendingUp, AlertTriangle, ShoppingCart, Plus, Upload } from 'lucide-react';
import ProductActions from './ProductActions';
import './ProductsTable.css';

const ProductsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
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
      sku: 'IP15PM001',
      category: 'Electronics',
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
      sku: 'MBP24001',
      category: 'Electronics',
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
      sku: 'NAM2024',
      category: 'Fashion',
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
      sku: 'CTO2024',
      category: 'Furniture',
      price: 349.00,
      stock: 8,
      status: 'Low Stock',
      sales: 245,
      rating: 4.3,
      image: 'https://via.placeholder.com/50x50',
      dateAdded: '2024-04-05'
    },
    { 
      id: 'PRD005', 
      name: 'Samsung Galaxy S24', 
      sku: 'SGS24001',
      category: 'Electronics',
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
      case 'Out of Stock': return 'status-out-of-stock';
      case 'Low Stock': return 'status-low-stock';
      case 'Inactive': return 'status-inactive';
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
      console.log('View product:', product);
    },
    onEdit: (product) => {
      console.log('Edit product:', product);
    },
    onDuplicate: (product) => {
      console.log('Duplicate product:', product);
    },
    onDelete: (product) => {
      console.log('Delete product:', product);
      if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
        // Delete logic here
      }
    },
    onUpdateStock: (product) => {
      console.log('Update stock for product:', product);
    }
  };

  const categories = ['All', 'Accessories', 'Bags', 'Clothing', 'Fitness Equipment', 'Shoes', 'Sports Equipment'];
  const statuses = ['All', 'Active', 'Inactive', 'Out of Stock'];

  return (
    <div>
      {/* Header Section */}
      <div className="products-header">
        <div className="products-title-section">
          <h1 className="products-title">Products Management</h1>
          <p className="products-subtitle">Manage your product catalog and inventory</p>
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
                  <ProductActions 
                    product={product}
                    onView={handleProductAction.onView}
                    onEdit={handleProductAction.onEdit}
                    onDuplicate={handleProductAction.onDuplicate}
                    onDelete={handleProductAction.onDelete}
                    onUpdateStock={handleProductAction.onUpdateStock}
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
          <span>Showing 1 to 5 of {productsData.length} results</span>
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

export default ProductsTable;