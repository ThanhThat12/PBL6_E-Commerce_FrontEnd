import React, { useState } from 'react';
import { Eye, Trash2, Edit, MoreVertical, Mail, Phone } from 'lucide-react';
import './CustomerActions.css';

const CustomerActions = ({ customer, onView, onEdit, onDelete, onContact }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleAction = (action, event) => {
    event.stopPropagation();
    setShowMenu(false);
    
    switch(action) {
      case 'view':
        onView && onView(customer);
        break;
      case 'edit':
        onEdit && onEdit(customer);
        break;
      case 'delete':
        onDelete && onDelete(customer);
        break;
      case 'email':
        onContact && onContact(customer, 'email');
        break;
      case 'phone':
        onContact && onContact(customer, 'phone');
        break;
    }
  };

  return (
    <div className="customer-actions">
      <div className="action-buttons-simple">
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

      {/* More actions menu (for future expansion) */}
      <div className="action-menu-container">
        <button 
          className="action-btn more-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <>
            <div 
              className="action-menu-overlay"
              onClick={() => setShowMenu(false)}
            />
            <div className="action-menu">
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('view', e)}
              >
                <Eye size={16} />
                View Details
              </button>
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('edit', e)}
              >
                <Edit size={16} />
                Edit Customer
              </button>
              <hr className="action-menu-divider" />
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('email', e)}
              >
                <Mail size={16} />
                Send Email
              </button>
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('phone', e)}
              >
                <Phone size={16} />
                Call Customer
              </button>
              <hr className="action-menu-divider" />
              <button 
                className="action-menu-item danger"
                onClick={(e) => handleAction('delete', e)}
              >
                <Trash2 size={16} />
                Delete Customer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerActions;