import React, { useState } from 'react';
import { Eye, Edit, Shield, UserX, UserCheck, Trash2, MoreVertical, Mail, Phone, Settings, Lock } from 'lucide-react';
import './AdminActions.css';

const AdminActions = ({ admin, onView, onEdit, onChangeRole, onToggleStatus, onDelete, onContact }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleAction = (action, event) => {
    event.stopPropagation();
    setShowMenu(false);
    
    switch(action) {
      case 'view':
        onView && onView(admin);
        break;
      case 'edit':
        onEdit && onEdit(admin);
        break;
      case 'changeRole':
        onChangeRole && onChangeRole(admin);
        break;
      case 'toggleStatus':
        onToggleStatus && onToggleStatus(admin);
        break;
      case 'delete':
        onDelete && onDelete(admin);
        break;
      case 'email':
        onContact && onContact(admin, 'email');
        break;
      case 'phone':
        onContact && onContact(admin, 'phone');
        break;
      case 'resetPassword':
        console.log('Reset password for admin:', admin);
        break;
      case 'viewPermissions':
        console.log('View permissions for admin:', admin);
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
        title="View Profile"
      >
        <Eye size={14} />
      </button>
    );

    // Always show Edit button
    buttons.push(
      <button 
        key="edit"
        className="action-btn edit-btn"
        onClick={(e) => handleAction('edit', e)}
        title="Edit Admin"
      >
        <Edit size={14} />
      </button>
    );

    // Show Toggle Status button
    if (admin.status === 'Active') {
      buttons.push(
        <button 
          key="deactivate"
          className="action-btn deactivate-btn"
          onClick={(e) => handleAction('toggleStatus', e)}
          title="Deactivate Admin"
        >
          <UserX size={14} />
        </button>
      );
    } else {
      buttons.push(
        <button 
          key="activate"
          className="action-btn activate-btn"
          onClick={(e) => handleAction('toggleStatus', e)}
          title="Activate Admin"
        >
          <UserCheck size={14} />
        </button>
      );
    }

    return buttons;
  };

  const canDelete = admin.role !== 'Super Admin'; // Prevent deleting super admins
  const canChangeRole = admin.role !== 'Super Admin'; // Prevent changing super admin role

  return (
    <div className="admin-actions">
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
                Edit Admin
              </button>
              <hr className="action-menu-divider" />
              
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('viewPermissions', e)}
              >
                <Shield size={16} />
                View Permissions
              </button>
              
              {canChangeRole && (
                <button 
                  className="action-menu-item"
                  onClick={(e) => handleAction('changeRole', e)}
                >
                  <Settings size={16} />
                  Change Role
                </button>
              )}
              
              <button 
                className="action-menu-item"
                onClick={(e) => handleAction('resetPassword', e)}
              >
                <Lock size={16} />
                Reset Password
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
                Call Admin
              </button>
              
              <hr className="action-menu-divider" />
              
              <button 
                className={`action-menu-item ${admin.status === 'Active' ? 'warning' : 'success'}`}
                onClick={(e) => handleAction('toggleStatus', e)}
              >
                {admin.status === 'Active' ? (
                  <>
                    <UserX size={16} />
                    Deactivate Admin
                  </>
                ) : (
                  <>
                    <UserCheck size={16} />
                    Activate Admin
                  </>
                )}
              </button>
              
              {canDelete && (
                <>
                  <hr className="action-menu-divider" />
                  <button 
                    className="action-menu-item danger"
                    onClick={(e) => handleAction('delete', e)}
                  >
                    <Trash2 size={16} />
                    Delete Admin
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

export default AdminActions;