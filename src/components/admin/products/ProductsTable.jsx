import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, TrendingUp, AlertTriangle, ShoppingCart, Plus, Upload, Eye, Trash2 } from 'lucide-react';
import './ProductsTable.css';
import ProductDetailModal from './ProductDetailModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import Toast from '../common/Toast';
import { getProductsWithPaging, getProductStats, getProductsByCategory, getProductsByStatus, deleteProduct, searchProducts } from '../../../services/adminProductService';
import { getAllCategories } from '../../../services/categoryService';

const ProductsTable = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalProductsSold: 0
  });
  const [categories, setCategories] = useState([]);
  
  // Fetch products, stats and categories from API
  useEffect(() => {
    fetchProducts(currentPage);
    fetchStats();
    fetchCategories();
  }, [currentPage, selectedCategory, selectedStatus]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
      fetchProducts(0); // Reset to first page when searching
      setCurrentPage(0);
    } else {
      // When search is cleared, fetch products normally
      fetchProducts(currentPage);
    }
  }, [debouncedSearchTerm]);

  const fetchCategories = async () => {
    try {
      console.log('📋 [ProductsTable] Fetching categories...');
      const response = await getAllCategories();
      
      console.log('📋 [ProductsTable] Categories response:', response);
      
      if (response.status === 200 && response.data) {
        setCategories(response.data);
        console.log('✅ [ProductsTable] Categories loaded:', response.data.length, 'categories:', response.data);
      } else {
        console.warn('⚠️ [ProductsTable] Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('❌ [ProductsTable] Error fetching categories:', error);
      console.error('❌ [ProductsTable] Error details:', error.response?.data);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 [ProductsTable] Fetching product stats...');
      const response = await getProductStats();
      
      if (response.status === 200 && response.data) {
        setStats(response.data);
        console.log('✅ [ProductsTable] Stats loaded:', response.data);
      }
    } catch (error) {
      console.error('❌ [ProductsTable] Error fetching stats:', error);
    }
  };

  const fetchProducts = async (page) => {
    setLoading(true);
    try {
      console.log('📡 [ProductsTable] Fetching products page:', page);
      let response;

      // Priority: Search > Category > Status > All
      if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
        response = await searchProducts(debouncedSearchTerm.trim(), page, 10);
      } else if (selectedCategory && selectedCategory !== '') {
        response = await getProductsByCategory(selectedCategory, page, 10);
      } else if (selectedStatus && selectedStatus !== '') {
        response = await getProductsByStatus(selectedStatus, page, 10);
      } else {
        response = await getProductsWithPaging(page, 10);
      }
      
      if (response.status === 200 && response.data) {
        const pageData = response.data;
        const paginationInfo = pageData.page || {};
        
        setProducts(pageData.content || []);
        setPagination({
          totalElements: paginationInfo.totalElements || 0,
          totalPages: paginationInfo.totalPages || 0,
          size: paginationInfo.size || 10,
          number: paginationInfo.number || 0
        });
        
        console.log('✅ [ProductsTable] Products loaded:', pageData.content?.length, 'Total pages:', paginationInfo.totalPages);
      }
    } catch (error) {
      console.error('❌ [ProductsTable] Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedStatus(''); // Clear status filter
    setSearchTerm(''); // Clear search term
    setCurrentPage(0); // Reset to first page
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setSelectedCategory(''); // Clear category filter
    setSearchTerm(''); // Clear search term
    setCurrentPage(0); // Reset to first page
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0); // Reset to first page
  };
  
  // Stats data from API
  const statsData = [
    { 
      title: 'Total Products', 
      value: stats.totalProducts?.toLocaleString() || '0', 
      icon: <Package size={24} />, 
      color: 'blue',
      description: 'Products in inventory'
    },
    { 
      title: 'Active Products', 
      value: stats.activeProducts?.toLocaleString() || '0', 
      icon: <ShoppingCart size={24} />, 
      color: 'green',
      description: 'Currently available'
    },
    { 
      title: 'Pending Products', 
      value: stats.pendingProducts?.toLocaleString() || '0', 
      icon: <AlertTriangle size={24} />, 
      color: 'orange',
      description: 'Awaiting approval'
    },
    { 
      title: 'Total Products Sold', 
      value: stats.totalProductsSold?.toLocaleString() || '0', 
      icon: <TrendingUp size={24} />, 
      color: 'purple',
      description: 'All time sales'
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
      image: null, // TODO: Load from API
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
      image: null, // TODO: Load from API
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
      status: 'Pending',
      sales: 834,
      rating: 4.5,
      image: null, // TODO: Load from API
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
      status: 'Pending',
      sales: 245,
      rating: 4.3,
      image: null, // TODO: Load from API
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
      image: null, // TODO: Load from API
      dateAdded: '2024-05-12'
    }
  ];

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Pending': return 'status-pending';
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
      setProductToDelete(product);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      console.log('🗑️ [ProductsTable] Deleting product:', productToDelete.productId);
      const response = await deleteProduct(productToDelete.productId);
      
      if (response.status === 200) {
        console.log('✅ [ProductsTable] Product deleted successfully');
        setToast({
          show: true,
          message: `Product "${productToDelete.productName}" has been deleted successfully`,
          type: 'success'
        });
        
        // Refresh product list
        fetchProducts(currentPage);
        fetchStats();
      }
    } catch (error) {
      console.error('❌ [ProductsTable] Error deleting product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete product. Product may exist in cart items.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
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

  const statuses = ['All', 'Active', 'Pending'];

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
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={handleClearSearch}
                  title="Clear search"
                >
                  ×
                </button>
              )}
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
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-card">
          <label className="filter-label">Status</label>
          <select 
            className="filter-select"
            value={selectedStatus}
            onChange={handleStatusChange}
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
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No products found
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Sold</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.productId || index} className="table-row">
                  <td className="product-info">
                    <div className="product-details">
                      <img 
                        src={product.mainImage || 'https://via.placeholder.com/50'} 
                        alt={product.productName}
                        className="product-image"
                      />
                      <div className="product-text">
                        <div className="product-name">{product.productName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="product-category">
                    {product.categoryName}
                  </td>
                  <td className="product-price">
                    ${product.basePrice?.toFixed(2)}
                  </td>
                  <td className="product-stock">
                    <span className={`stock-badge ${product.totalStock <= 10 ? 'low-stock' : ''}`}>
                      {product.totalStock}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(product.status)}`}>
                      <span className="status-dot">●</span>
                      {product.status}
                    </span>
                  </td>
                  <td className="product-sales">
                    {product.sales?.toLocaleString()}
                  </td>
                  <td className="product-rating">
                    <div className="rating-stars">
                      {renderStars(product.rating || 0)}
                    </div>
                    <span className="rating-value">{product.rating?.toFixed(1) || '0.0'}</span>
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
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          <button 
            className="pagination-nav"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <span>← Previous</span>
          </button>
        </div>
        
        <div className="pagination-numbers">
          {[...Array(pagination.totalPages)].map((_, index) => (
            <button
              key={index}
              className={`page-btn ${currentPage === index ? 'active' : ''}`}
              onClick={() => handlePageChange(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        
        <div className="pagination-info">
          <button 
            className="pagination-nav"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages - 1}
          >
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        userName={productToDelete?.productName}
        userType="product"
        deletionDetails={[
          `Category: ${productToDelete?.categoryName || 'N/A'}`,
          `Price: $${productToDelete?.basePrice?.toFixed(2) || '0.00'}`,
          `Stock: ${productToDelete?.totalStock || 0}`,
          `Status: ${productToDelete?.status || 'N/A'}`
        ]}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
      />
    </div>
  );
};

export default ProductsTable;