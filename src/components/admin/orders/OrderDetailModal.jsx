import React, { useEffect, useState } from 'react';
import { X, Package, User, MapPin, CreditCard, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { getAdminOrderDetail } from '../../../services/adminOrderService';
import './OrderDetailModal.css';

const OrderDetailModal = ({ order, onClose }) => {
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch order detail when modal opens
  useEffect(() => {
    if (order && order.orderId) {
      fetchOrderDetail(order.orderId);
    }
  }, [order]);

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

  const fetchOrderDetail = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching order detail for ID:', orderId);
      const response = await getAdminOrderDetail(orderId);
      
      if (response.status === 200 && response.data && response.data.data) {
        console.log('✅ Order detail loaded:', response.data.data);
        setOrderDetail(response.data.data);
      }
    } catch (err) {
      console.error('❌ Error fetching order detail:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency VND
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'status-pending',
      'PROCESSING': 'status-processing',
      'SHIPPING': 'status-shipping',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled',
      'PAID': 'status-paid',
      'UNPAID': 'status-unpaid',
      'FAILED': 'status-failed'
    };
    return statusClasses[status] || 'status-default';
  };

  if (!order) return null;

  return (
    <>
      {/* Overlay */}
      <div className="admin-order-detail-modal-overlay" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="admin-order-detail-modal">
        {/* Header */}
        <div className="admin-order-detail-modal-header">
          <div className="admin-order-detail-modal-title-section">
            <Package size={24} className="admin-order-detail-header-icon" />
            <div>
              <h2 className="admin-order-detail-modal-title">Order Details</h2>
              <p className="admin-order-detail-modal-subtitle">Order #{order.orderId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="admin-order-detail-close-btn"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-order-detail-modal-body">
          {loading ? (
            <div className="admin-order-detail-loading">
              <div className="loading-spinner"></div>
              <p>Loading order details...</p>
            </div>
          ) : error ? (
            <div className="admin-order-detail-error">
              <p>{error}</p>
              <button onClick={() => fetchOrderDetail(order.orderId)}>Try Again</button>
            </div>
          ) : orderDetail ? (
            <>
              {/* General Information */}
              <div className="order-detail-section">
                <h3 className="section-title">
                  <Calendar size={20} />
                  General Information
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Order ID:</label>
                    <span>#{orderDetail.orderId}</span>
                  </div>
                  <div className="info-item">
                    <label>Created At:</label>
                    <span>{formatDateTime(orderDetail.createdAt)}</span>
                  </div>
                  <div className="info-item">
                    <label>Updated At:</label>
                    <span>{formatDateTime(orderDetail.updatedAt)}</span>
                  </div>
                  <div className="info-item">
                    <label>Order Status:</label>
                    <span className={`status-badge ${getStatusBadge(orderDetail.orderStatus)}`}>
                      {orderDetail.orderStatus}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Payment Status:</label>
                    <span className={`status-badge ${getStatusBadge(orderDetail.paymentStatus)}`}>
                      {orderDetail.paymentStatus}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Paid At:</label>
                    <span>{formatDateTime(orderDetail.paidAt)}</span>
                  </div>
                  <div className="info-item">
                    <label>Payment Method:</label>
                    <span className="payment-method">{orderDetail.paymentMethod}</span>
                  </div>
                  <div className="info-item">
                    <label>Shop Name:</label>
                    <span>{orderDetail.shopName}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="order-detail-section">
                <h3 className="section-title">
                  <User size={20} />
                  Customer Information
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Customer Name:</label>
                    <span>{orderDetail.customerName}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{orderDetail.customerEmail}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{orderDetail.customerPhone}</span>
                  </div>
                </div>
              </div>

              {/* Receiver & Shipping Information */}
              <div className="order-detail-section">
                <h3 className="section-title">
                  <MapPin size={20} />
                  Receiver & Shipping Information
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Receiver Name:</label>
                    <span>{orderDetail.receiverName}</span>
                  </div>
                  <div className="info-item">
                    <label>Receiver Phone:</label>
                    <span>{orderDetail.receiverPhone}</span>
                  </div>
                  <div className="info-item full-width">
                    <label>Address:</label>
                    <span>{orderDetail.receiverAddress}</span>
                  </div>
                  <div className="info-item">
                    <label>Shipping Fee:</label>
                    <span className="amount">{formatCurrency(orderDetail.shippingFee)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="order-detail-section">
                <h3 className="section-title">
                  <ShoppingBag size={20} />
                  Order Items
                </h3>
                <div className="items-table-container">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Variant</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetail.items && orderDetail.items.map((item) => (
                        <tr key={item.itemId}>
                          <td>
                            <div className="product-info">
                              {item.productImage && (
                                <img 
                                  src={item.productImage} 
                                  alt={item.productName}
                                  className="product-image"
                                />
                              )}
                              <span>{item.productName}</span>
                            </div>
                          </td>
                          <td>{item.variantName || 'N/A'}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="amount">{formatCurrency(item.price)}</td>
                          <td className="amount">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="order-detail-section">
                <h3 className="section-title">
                  <DollarSign size={20} />
                  Payment Summary
                </h3>
                <div className="payment-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span className="amount">{formatCurrency(orderDetail.subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Discount:</span>
                    <span className="amount discount">-{formatCurrency(orderDetail.discount)}</span>
                  </div>
                  {orderDetail.voucherCode && (
                    <div className="summary-row">
                      <span>Voucher Code:</span>
                      <span className="voucher-code">{orderDetail.voucherCode}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Shipping Fee:</span>
                    <span className="amount">{formatCurrency(orderDetail.shippingFee)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount:</span>
                    <span className="amount">{formatCurrency(orderDetail.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="admin-order-detail-empty-state">
              <Package size={64} className="admin-order-detail-empty-icon" />
              <h3>No Order Data</h3>
              <p>Order details not available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetailModal;