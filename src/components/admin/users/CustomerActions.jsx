import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import './CustomerActions.css';

const CustomerActions = ({ customer, onView, onDelete }) => {
  const handleAction = (action, event) => {
    event.stopPropagation();
    
    switch(action) {
      case 'view':
        onView && onView(customer);
        break;
      case 'delete':
        onDelete && onDelete(customer);
        break;
      default:
        break;
    }
  };

  return (
    <div className="customer-actions">
      <button 
        className="action-btn view-btn"
        onClick={(e) => handleAction('view', e)}
        title="View Details"
      >
        <Eye size={16} />
      </button>
      <button 
        className="action-btn delete-btn"
        onClick={(e) => handleAction('delete', e)}
        title="Delete Customer"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default CustomerActions;