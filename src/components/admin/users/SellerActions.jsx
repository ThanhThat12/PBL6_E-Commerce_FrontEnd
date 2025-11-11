import React, { useState } from 'react';
import { Eye, Trash2, CheckCircle, XCircle, MoreVertical, Mail, Phone, Edit } from 'lucide-react';
import './SellerActions.css';

const SellerActions = ({ seller, onView, onApprove, onSuspend, onDelete, onContact }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleAction = (action, event) => {
    event.stopPropagation();
    setShowMenu(false);
    
    switch(action) {
      case 'view':
        onView && onView(seller);
        break;
      case 'approve':
        onApprove && onApprove(seller);
        break;
      case 'suspend':
        onSuspend && onSuspend(seller);
        break;
      case 'delete':
        onDelete && onDelete(seller);
        break;
      case 'email':
        onContact && onContact(seller, 'email');
        break;
      case 'phone':
        onContact && onContact(seller, 'phone');
        break;
      case 'edit':
        console.log('Edit seller:', seller);
        break;
    }
  };

  const getActionButtons = () => {
    const buttons = [];
    
    // Always show View button
    buttons.push(
      <button 
        key="view"
        className="action-btn view-btn"
        onClick={(e) => handleAction('view', e)}
        title="View Details"
      >
        <Eye size={14} />
      </button>
    );

    // Show Approve button only for Pending sellers
    if (seller.status === 'Pending') {
      buttons.push(
        <button 
          key="approve"
          className="action-btn approve-btn"
          onClick={(e) => handleAction('approve', e)}
          title="Approve Seller"
        >
          <CheckCircle size={14} />
        </button>
      );
    }

    // Show Suspend button only for Verified sellers
    if (seller.status === 'Verified') {
      buttons.push(
        <button 
          key="suspend"
          className="action-btn suspend-btn"
          onClick={(e) => handleAction('suspend', e)}
          title="Suspend Seller"
        >
          <XCircle size={14} />
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="seller-actions">
      <div className="action-buttons-simple">
        {getActionButtons()}
      </div>

      {/* More actions menu */}
      <div className="action-menu-container">
        <button 
          className="action-btn more-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          title="More Actions"
        >
          <MoreVertical size={14} />
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
                View Profile
              </button>
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('edit', e)}
              >
                <Edit size={16} />
                Edit Seller
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
                Call Seller
              </button>
              <hr className="action-menu-divider" />
              
              {seller.status === 'Pending' && (
                <button 
                  className="action-menu-item success"
                  onClick={(e) => handleAction('approve', e)}
                >
                  <CheckCircle size={16} />
                  Approve Seller
                </button>
              )}
              
              {seller.status === 'Verified' && (
                <button 
                  className="action-menu-item warning"
                  onClick={(e) => handleAction('suspend', e)}
                >
                  <XCircle size={16} />
                  Suspend Seller
                </button>
              )}
              
              {(seller.status === 'Pending' || seller.status === 'Verified') && (
                <hr className="action-menu-divider" />
              )}
              
              <button 
                className="action-menu-item danger"
                onClick={(e) => handleAction('delete', e)}
              >
                <Trash2 size={16} />
                Delete Seller
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SellerActions;