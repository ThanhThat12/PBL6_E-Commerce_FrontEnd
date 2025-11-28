import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import './VoucherActions.css';

const VoucherActions = ({ voucher, onView, onDelete }) => {
  const handleAction = (action, event) => {
    event.stopPropagation();
    
    switch(action) {
      case 'view':
        onView && onView(voucher);
        break;
      case 'delete':
        onDelete && onDelete(voucher);
        break;
      default:
        break;
    }
  };

  return (
    <div className="admin-voucher-actions">
      <button 
        className="admin-voucher-action-btn admin-voucher-view-btn"
        onClick={(e) => handleAction('view', e)}
        title="View Details"
      >
        <Eye size={16} />
      </button>
      <button 
        className="admin-voucher-action-btn admin-voucher-delete-btn"
        onClick={(e) => handleAction('delete', e)}
        title="Delete Voucher"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default VoucherActions;
