import React, { useState } from 'react';
import { Eye, Edit, Copy, Trash2, Package, MoreVertical, TrendingUp, AlertTriangle } from 'lucide-react';
import './ProductActions.css';

const ProductActions = ({ product, onView, onEdit, onDuplicate, onDelete, onUpdateStock }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleAction = (action, event) => {
    event.stopPropagation();
    setShowMenu(false);
    
    switch(action) {
      case 'view':
        onView && onView(product);
        break;
      case 'edit':
        onEdit && onEdit(product);
        break;
      case 'duplicate':
        onDuplicate && onDuplicate(product);
        break;
      case 'delete':
        onDelete && onDelete(product);
        break;
      case 'updateStock':
        onUpdateStock && onUpdateStock(product);
        break;
      case 'analytics':
        console.log('View analytics for product:', product);
        break;
      // case 'promote':
      //   console.log('Promote product:', product);
      //   break;
      default:
        console.log('Unknown action:', action);
        break;
    }
  };

  const getActionButtons = () => {
    const buttons = [];
    
    // Luôn hiển thị nút Xem
    buttons.push(
      <button 
        key="view"
        className="action-btn view-btn"
        onClick={(e) => handleAction('view', e)}
        title="View Product"
      >
        <Eye size={14} />
      </button>
    );

    // Luôn hiển thị nút Chỉnh sửa
    buttons.push(
      <button 
        key="edit"
        className="action-btn edit-btn"
        onClick={(e) => handleAction('edit', e)}
        title="Edit Product"
      >
        <Edit size={14} />
      </button>
    );

    // Hiển thị nút Cập nhật hàng tồn kho cho các mặt hàng sắp hết hàng hoặc hết hàng
    if (product.stock <= 10 || product.status === 'Out of Stock') {
      buttons.push(
        <button 
          key="updateStock"
          className="action-btn stock-btn"
          onClick={(e) => handleAction('updateStock', e)}
          title="Update Stock"
        >
          <Package size={14} />
        </button>
      );
    }

    return buttons;
  };

  const canDelete = product.status !== 'Active' || product.sales === 0;

  return (
    <div className="product-actions">
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
                View Details
              </button>
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('edit', e)}
              >
                <Edit size={16} />
                Edit Product
              </button>
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('duplicate', e)}
              >
                <Copy size={16} />
                Duplicate Product
              </button>
              <hr className="action-menu-divider" />
              
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('updateStock', e)}
              >
                <Package size={16} />
                Update Stock
              </button>
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('analytics', e)}
              >
                <TrendingUp size={16} />
                View Analytics
              </button>
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('promote', e)}
              >
                <AlertTriangle size={16} />
                Promote Product
              </button>
              
              {canDelete && (
                <>
                  <hr className="action-menu-divider" />
                  <button 
                    className="action-menu-item danger"
                    onClick={(e) => handleAction('delete', e)}
                  >
                    <Trash2 size={16} />
                    Delete Product
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductActions;