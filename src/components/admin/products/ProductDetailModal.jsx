import React, { useEffect, useState } from 'react';
import { X, Package, Edit2, Box, ShoppingBag, Star, MessageSquare, Calendar, Ruler, Weight, Trash2 } from 'lucide-react';
import { getProductDetail, deleteProduct } from '../../../services/adminProductService';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import Toast from '../common/Toast';
import './ProductDetailModal.css';

const ProductDetailModal = ({ product, onClose, onUpdate }) => {
  const [productDetail, setProductDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch product detail
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!product?.productId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await getProductDetail(product.productId);
        
        if (response.statusCode === 200 || response.status === 200) {
          setProductDetail(response.data);
          setEditedStatus(response.data.isActive);
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [product]);

  // Add ESC key listener
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Cancel edit - reset status
      setEditedStatus(productDetail?.isActive);
    }
  };

  const handleSaveStatus = () => {
    // TODO: Call update API when available
    console.log('Update product status to:', editedStatus);
    setIsEditing(false);
    // onUpdate?.(); // Refresh data after update
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProduct(productDetail.id);
      
      setToast({
        show: true,
        message: `Product "${productDetail.name}" has been deleted successfully`,
        type: 'success'
      });
      
      // Wait a bit for toast to show before closing
      setTimeout(() => {
        onUpdate?.(); // Refresh the product list
        onClose(); // Close the modal
      }, 1000);
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete product';
      
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!product) return null;

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="product-detail-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-avatar">
              <Package size={32} />
            </div>
            <div>
              <h2 className="modal-title">Product Details</h2>
              <p className="modal-subtitle">{productDetail?.name || 'Loading...'}</p>
            </div>
          </div>
          <div className="modal-header-actions">
            {!loading && !error && (
              <button 
                className="modal-delete-btn" 
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                title="Delete Product"
              >
                <Trash2 size={18} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose} title="Close (ESC)">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading && (
            <div className="detail-loading">
              <div className="spinner"></div>
              <p>Loading product details...</p>
            </div>
          )}

          {error && (
            <div className="detail-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && productDetail && (
            <div className="product-detail-content">
              {/* Main Image & Basic Info */}
              <div className="detail-section">
                <div className="detail-grid">
                  <div className="detail-image-container">
                    {productDetail.mainImage ? (
                      <img 
                        src={productDetail.mainImage} 
                        alt={productDetail.name}
                        className="detail-main-image"
                      />
                    ) : (
                      <div className="detail-no-image">
                        <Package size={64} />
                        <p>No Image</p>
                      </div>
                    )}
                  </div>

                  <div className="detail-basic-info">
                    <div className="info-row">
                      <label>Product ID:</label>
                      <span>#{productDetail.id}</span>
                    </div>
                    <div className="info-row">
                      <label>Name:</label>
                      <span className="info-highlight">{productDetail.name}</span>
                    </div>
                    <div className="info-row">
                      <label>Category:</label>
                      <span>{productDetail.category?.name || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <label>Shop:</label>
                      <span>{productDetail.shop?.name || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <label>Base Price:</label>
                      <span className="price-highlight">{formatCurrency(productDetail.basePrice)}</span>
                    </div>
                    <div className="info-row">
                      <label>Status:</label>
                      <div className="status-edit-container">
                        {isEditing ? (
                          <select 
                            value={editedStatus}
                            onChange={(e) => setEditedStatus(e.target.value === 'true')}
                            className="status-select"
                          >
                            <option value="true">Active</option>
                            <option value="false">Pending</option>
                          </select>
                        ) : (
                          <span className={`status-badge ${productDetail.isActive ? 'status-active' : 'status-pending'}`}>
                            {productDetail.isActive ? 'Active' : 'Pending'}
                          </span>
                        )}
                        <button 
                          className="status-edit-btn" 
                          onClick={handleEditToggle}
                          title={isEditing ? 'Cancel' : 'Edit Status'}
                        >
                          <Edit2 size={16} />
                          {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {productDetail.description && (
                <div className="detail-section">
                  <h3 className="section-title">Description</h3>
                  <p className="product-description">{productDetail.description}</p>
                </div>
              )}

              {/* Statistics */}
              <div className="detail-section">
                <h3 className="section-title">Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dbeafe' }}>
                      <Box size={24} color="#2563eb" />
                    </div>
                    <div className="stat-info">
                      <p className="stat-label">Total Stock</p>
                      <p className="stat-value">{productDetail.totalStock || 0}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dcfce7' }}>
                      <ShoppingBag size={24} color="#16a34a" />
                    </div>
                    <div className="stat-info">
                      <p className="stat-label">Total Sold</p>
                      <p className="stat-value">{productDetail.totalSold || 0}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef3c7' }}>
                      <Star size={24} color="#f59e0b" />
                    </div>
                    <div className="stat-info">
                      <p className="stat-label">Average Rating</p>
                      <p className="stat-value">{productDetail.averageRating?.toFixed(1) || '0.0'}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fce7f3' }}>
                      <MessageSquare size={24} color="#ec4899" />
                    </div>
                    <div className="stat-info">
                      <p className="stat-label">Reviews</p>
                      <p className="stat-value">{productDetail.reviewCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="detail-section">
                <h3 className="section-title">Shipping Information</h3>
                <div className="shipping-grid">
                  <div className="shipping-item">
                    <Weight size={20} />
                    <div>
                      <p className="shipping-label">Weight</p>
                      <p className="shipping-value">{productDetail.weightGrams || 0} grams</p>
                    </div>
                  </div>
                  <div className="shipping-item">
                    <Ruler size={20} />
                    <div>
                      <p className="shipping-label">Package Dimensions</p>
                      <p className="shipping-value">
                        {productDetail.dimensions?.lengthCm || 0} × {productDetail.dimensions?.widthCm || 0} × {productDetail.dimensions?.heightCm || 0} cm
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variants */}
              {productDetail.variants && productDetail.variants.length > 0 && (
                <div className="detail-section">
                  <h3 className="section-title">Product Variants ({productDetail.variants.length})</h3>
                  <div className="variants-table-container">
                    <table className="variants-table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Attributes</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productDetail.variants.map((variant) => (
                          <tr key={variant.id}>
                            <td>
                              <span className="variant-sku">{variant.sku}</span>
                            </td>
                            <td>
                              <div className="variant-attributes">
                                {variant.attributes?.map((attr, idx) => (
                                  <span key={idx} className="attribute-tag">
                                    {attr.name}: {attr.value}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="price-cell">{formatCurrency(variant.price)}</td>
                            <td>
                              <span className={`stock-badge ${variant.stock > 50 ? 'stock-high' : variant.stock > 10 ? 'stock-medium' : 'stock-low'}`}>
                                {variant.stock}
                              </span>
                            </td>
                            <td>{variant.sold || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="detail-section">
                <h3 className="section-title">Timestamps</h3>
                <div className="timestamp-grid">
                  <div className="timestamp-item">
                    <Calendar size={18} />
                    <div>
                      <p className="timestamp-label">Created At</p>
                      <p className="timestamp-value">{formatDate(productDetail.createdAt)}</p>
                    </div>
                  </div>
                  <div className="timestamp-item">
                    <Calendar size={18} />
                    <div>
                      <p className="timestamp-label">Updated At</p>
                      <p className="timestamp-value">{formatDate(productDetail.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save button when editing */}
              {isEditing && (
                <div className="detail-actions">
                  <button className="btn-save" onClick={handleSaveStatus}>
                    Save Changes
                  </button>
                  <button className="btn-cancel" onClick={handleEditToggle}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        userName={productDetail?.name || 'this product'}
        userType="product"
        deletionDetails={[
          `Product ID: #${productDetail?.id || 'N/A'}`,
          `Category: ${productDetail?.category?.name || 'N/A'}`,
          `Base Price: ${productDetail?.basePrice ? formatCurrency(productDetail.basePrice) : 'N/A'}`,
          `Total Stock: ${productDetail?.totalStock || 0}`,
          `All variants and associated data`
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
    </>
  );
};

export default ProductDetailModal;
