import React, { useState } from 'react';
import { Eye, Edit, Printer, Truck, CheckCircle, XCircle, MoreHorizontal, Package, CreditCard } from 'lucide-react';
import './OrderActions.css';

const OrderActions = ({ order }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleView = () => {
    console.log('View order:', order.orderNumber);
    setShowDropdown(false);
  };

  const handleEdit = () => {
    console.log('Edit order:', order.orderNumber);
    setShowDropdown(false);
  };

  const handlePrint = () => {
    console.log('Print order:', order.orderNumber);
    setShowDropdown(false);
  };

  const handleUpdateStatus = (status) => {
    console.log('Update status to:', status, 'for order:', order.orderNumber);
    setShowDropdown(false);
  };

  const handleRefund = () => {
    console.log('Process refund for order:', order.orderNumber);
    setShowDropdown(false);
  };

  const getStatusActions = () => {
    const actions = [];
    
    switch (order.status) {
      case 'Pending':
        actions.push(
          <button
            key="process"
            className="action-item process"
            onClick={() => handleUpdateStatus('Processing')}
          >
            <Package size={16} />
            Process Order
          </button>
        );
        break;
      case 'Processing':
        actions.push(
          <button
            key="ship"
            className="action-item ship"
            onClick={() => handleUpdateStatus('Shipped')}
          >
            <Truck size={16} />
            Mark as Shipped
          </button>
        );
        break;
      case 'Shipped':
        actions.push(
          <button
            key="deliver"
            className="action-item deliver"
            onClick={() => handleUpdateStatus('Delivered')}
          >
            <CheckCircle size={16} />
            Mark as Delivered
          </button>
        );
        break;
      case 'Delivered':
        actions.push(
          <button
            key="refund"
            className="action-item refund"
            onClick={handleRefund}
          >
            <CreditCard size={16} />
            Process Refund
          </button>
        );
        break;
      default:
        break;
    }
    
    return actions;
  };

  return (
    <div className="order-actions">
      <div className="quick-actions">
        <button 
          className="action-btn view-btn"
          onClick={handleView}
          title="View Order Details"
        >
          <Eye size={16} />
        </button>
        
        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
          <button 
            className="action-btn edit-btn"
            onClick={handleEdit}
            title="Edit Order"
          >
            <Edit size={16} />
          </button>
        )}
        
        <button 
          className="action-btn print-btn"
          onClick={handlePrint}
          title="Print Order"
        >
          <Printer size={16} />
        </button>
      </div>

      <div className="dropdown-container">
        <button 
          className="action-btn more-btn"
          onClick={() => setShowDropdown(!showDropdown)}
          title="More Actions"
        >
          <MoreHorizontal size={16} />
        </button>

        {showDropdown && (
          <div className="actions-dropdown">
            <div className="dropdown-header">
              <span>Order Actions</span>
            </div>
            
            <div className="dropdown-content">
              {getStatusActions()}
              
              <div className="dropdown-divider" />
              
              <button
                className="action-item view-full"
                onClick={handleView}
              >
                <Eye size={16} />
                View Full Details
              </button>
              
              {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                <>
                  <button
                    className="action-item cancel"
                    onClick={() => handleUpdateStatus('Cancelled')}
                  >
                    <XCircle size={16} />
                    Cancel Order
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {showDropdown && (
        <div 
          className="dropdown-overlay"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default OrderActions;