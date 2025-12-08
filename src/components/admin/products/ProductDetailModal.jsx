import React, { useEffect } from 'react';
import { X, Package } from 'lucide-react';
import './ProductDetailModal.css';

const ProductDetailModal = ({ product, onClose, onUpdate: _onUpdate }) => {
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
              <p className="modal-subtitle">View product information</p>
            </div>
          </div>
          <div className="modal-header-actions">
            <button className="modal-close-btn" onClick={onClose} title="Close (ESC)">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center', 
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            Product detail content will be displayed here
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailModal;
