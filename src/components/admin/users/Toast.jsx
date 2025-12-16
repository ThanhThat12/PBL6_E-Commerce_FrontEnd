import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`toast-container ${type}`}>
      <div className="toast-icon">
        {type === 'success' ? (
          <CheckCircle size={24} />
        ) : (
          <XCircle size={24} />
        )}
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close-btn" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
