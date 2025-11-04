import React from 'react';
import { ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

/**
 * FormError Component - Hiển thị error message với styling nhất quán
 * 
 * @param {string|array} errors - Error message hoặc array của errors
 * @param {string} variant - Kiểu hiển thị: 'inline', 'banner', 'list'
 * @param {boolean} dismissible - Có thể đóng được không
 * @param {function} onDismiss - Callback khi đóng
 * @param {string} className - Custom classes
 */
const FormError = ({ 
  errors,
  variant = 'inline',
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const errorArray = Array.isArray(errors) ? errors : [errors];

  // Inline variant - Compact error
  if (variant === 'inline') {
    return (
      <div className={`flex items-start text-error text-sm mt-1 ${className}`}>
        <ExclamationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
        <span>{errorArray[0]}</span>
      </div>
    );
  }

  // Banner variant - Prominent error banner
  if (variant === 'banner') {
    return (
      <div className={`
        bg-accent-red-50 
        border border-accent-red-200 
        rounded-lg 
        p-4 
        mb-4
        ${className}
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <XCircleIcon className="w-5 h-5 text-error" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-error mb-1">
              {errorArray.length === 1 ? 'Có lỗi xảy ra' : `Có ${errorArray.length} lỗi`}
            </h3>
            {errorArray.length === 1 ? (
              <p className="text-sm text-error">{errorArray[0]}</p>
            ) : (
              <ul className="list-disc list-inside text-sm text-error space-y-1">
                {errorArray.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="
                ml-3 
                flex-shrink-0 
                text-error 
                hover:text-accent-red-700
                transition-colors
              "
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  // List variant - Error list
  if (variant === 'list') {
    return (
      <div className={`
        bg-accent-red-50 
        border-l-4 
        border-error 
        p-4 
        mb-4
        ${className}
      `}>
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="w-5 h-5 text-error" />
          </div>
          <div className="ml-3 flex-1">
            {errorArray.length === 1 ? (
              <p className="text-sm text-error font-medium">{errorArray[0]}</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-error mb-2">
                  Vui lòng kiểm tra các lỗi sau:
                </p>
                <ul className="list-disc list-inside text-sm text-error space-y-1">
                  {errorArray.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="
                ml-3 
                flex-shrink-0 
                text-error 
                hover:text-accent-red-700
                transition-colors
              "
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default FormError;
