import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import './Confirm.css';

const Confirm = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "OK",
  cancelText = "Cancel",
  type = "info" // info, warning, danger
}) => {
  // Handle ESC key press to close modal and ENTER key to confirm
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
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="confirm-modal-header">
          <div className={`confirm-modal-icon-container ${type}`}>
            <AlertCircle className="confirm-modal-icon" size={28} />
          </div>
          <button className="confirm-modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="confirm-modal-body">
          <h2 className="confirm-modal-title">{title}</h2>
          <p className="confirm-modal-message">{message}</p>
        </div>

        {/* Footer */}
        <div className="confirm-modal-footer">
          <button 
            className="confirm-modal-btn confirm-modal-cancel-btn" 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-modal-btn confirm-modal-confirm-btn ${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
