import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Delete",
  userName,
  userType = "user",
  deletionDetails = []
}) => {
  // Handle ESC key press to close modal and ENTER key to confirm delete
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        onClose();
      } else if (event.key === 'Enter' || event.keyCode === 13) {
        handleConfirm();
      }
    };

    if (isOpen) {
      // Add event listener when modal is open
      document.addEventListener('keydown', handleKeyPress);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="delete-modal-header">
          <div className="delete-modal-icon-container">
            <AlertTriangle className="delete-modal-warning-icon" size={32} />
          </div>
          <button className="delete-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="delete-modal-body">
          <h2 className="delete-modal-title">{title}</h2>
          
          <p className="delete-modal-message">
            Are you sure you want to delete <strong>{userType}</strong>:
          </p>
          
          <div className="delete-modal-user-name">
            "{userName}"
          </div>

          {deletionDetails && deletionDetails.length > 0 && (
            <>
              <p className="delete-modal-warning">
                This will permanently delete:
              </p>
              <ul className="delete-modal-details-list">
                {deletionDetails.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </>
          )}

          <div className="delete-modal-caution">
            <AlertTriangle size={16} />
            <span>This action cannot be undone!</span>
          </div>
        </div>

        {/* Footer */}
        <div className="delete-modal-footer">
          <button 
            className="delete-modal-btn delete-modal-cancel-btn" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="delete-modal-btn delete-modal-confirm-btn" 
            onClick={handleConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;