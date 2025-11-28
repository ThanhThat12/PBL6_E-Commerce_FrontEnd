import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import './CategoryActions.css';

const CategoryActions = ({ category, onEdit, onDelete }) => {
  const handleAction = (action, event) => {
    event.stopPropagation();
    
    switch(action) {
      case 'edit':
        onEdit && onEdit(category);
        break;
      case 'delete':
        onDelete && onDelete(category);
        break;
      default:
        break;
    }
  };

  return (
    <div className="customer-actions admin-actions">
      <button 
        className="action-btn view-btn"
        onClick={(e) => handleAction('edit', e)}
        title="Edit Category"
      >
        <Edit2 size={16} />
      </button>
      <button 
        className="action-btn delete-btn"
        onClick={(e) => handleAction('delete', e)}
        title="Delete Category"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default CategoryActions;
