import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

/**
 * Alert Component
 * Display success, error, warning, or info messages
 * 
 * @param {string} type - Alert type (success, error, warning, info)
 * @param {string} message - Alert message
 * @param {string} description - Optional description
 * @param {boolean} closable - Show close button
 * @param {function} onClose - Close handler
 * @param {number} autoClose - Auto close after milliseconds (0 = no auto close)
 * @param {string} className - Additional CSS classes
 */
const Alert = ({
  type = 'info',
  message,
  description,
  closable = true,
  onClose,
  autoClose = 0,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);

  // Auto close
  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Wait for animation
    }
  };

  if (!visible) return null;

  // Icon mapping
  const icons = {
    success: FiCheckCircle,
    error: FiXCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
  };

  // Style mapping
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-500',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500',
    },
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <div
      className={`
        ${style.bg} ${style.border} ${style.text}
        border rounded-lg p-4 mb-4
        animate-slideIn
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.icon}`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Message */}
          <p className="font-semibold text-sm">{message}</p>

          {/* Description */}
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
        </div>

        {/* Close Button */}
        {closable && (
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 p-1 rounded-lg transition-colors
              hover:bg-black/10
              ${style.text}
            `}
            aria-label="Close alert"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
