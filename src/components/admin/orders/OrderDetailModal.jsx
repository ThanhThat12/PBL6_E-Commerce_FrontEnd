import React, { useEffect } from 'react';
import { X, Package, User, Mail, Phone, Store, ShoppingCart, DollarSign, Calendar, MapPin, CreditCard } from 'lucide-react';
import './OrderDetailModal.css';

const OrderDetailModal = ({ order, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!order) return null;

  const getStatusClass = (status) => {
    const statusClasses = {
      'PENDING': 'status-pending',
      'PROCESSING': 'status-processing',
      'SHIPPING': 'status-shipping',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="order-modal-header">
          <div className="header-content">
            <div className="header-icon">
              <Package size={28} />
            </div>
            <div className="header-text">
              <h2>Order Details</h2>
              <p>Order ID: #{order.idOrder}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="order-modal-content">
          {/* Order Information Grid */}
          <div className="order-info-grid">
            {/* Order ID */}
            <div className="info-item">
              <div className="info-label">
                <Package size={18} />
                <span>Order ID</span>
              </div>
              <div className="info-value">#{order.idOrder}</div>
            </div>

            {/* Customer Name */}
            <div className="info-item">
              <div className="info-label">
                <User size={18} />
                <span>Customer Name</span>
              </div>
              <div className="info-value">{order.customer.name}</div>
            </div>

            {/* Email */}
            <div className="info-item">
              <div className="info-label">
                <Mail size={18} />
                <span>Email</span>
              </div>
              <div className="info-value">{order.customer.email}</div>
            </div>

            {/* Phone */}
            <div className="info-item">
              <div className="info-label">
                <Phone size={18} />
                <span>Phone</span>
              </div>
              <div className="info-value">{order.customer.phone || 'N/A'}</div>
            </div>

            {/* Shop Name */}
            <div className="info-item">
              <div className="info-label">
                <Store size={18} />
                <span>Shop Name</span>
              </div>
              <div className="info-value">{order.shopName || 'N/A'}</div>
            </div>

            {/* Total Items */}
            <div className="info-item">
              <div className="info-label">
                <ShoppingCart size={18} />
                <span>Total Items</span>
              </div>
              <div className="info-value">{order.items} item{order.items > 1 ? 's' : ''}</div>
            </div>

            {/* Total Amount */}
            <div className="info-item">
              <div className="info-label">
                <DollarSign size={18} />
                <span>Total Amount</span>
              </div>
              <div className="info-value amount">${order.total.toFixed(2)}</div>
            </div>

            {/* Status */}
            <div className="info-item">
              <div className="info-label">
                <Package size={18} />
                <span>Status</span>
              </div>
              <div className="info-value">
                <span className={`status-badge ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="info-item">
              <div className="info-label">
                <CreditCard size={18} />
                <span>Payment Method</span>
              </div>
              <div className="info-value">{order.paymentMethod}</div>
            </div>

            {/* Order Date */}
            <div className="info-item">
              <div className="info-label">
                <Calendar size={18} />
                <span>Order Date</span>
              </div>
              <div className="info-value">
                {new Date(order.orderDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="address-section">
            <div className="address-header">
              <MapPin size={20} />
              <h3>Shipping Address</h3>
            </div>
            <div className="address-content">
              {order.shippingAddress}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="order-modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
