import React from 'react';

/**
 * FormGroup Component - Container cho form field với label, input và error message
 * 
 * @param {string} label - Nhãn của field
 * @param {string} name - Name attribute
 * @param {boolean} required - Field bắt buộc
 * @param {string} error - Error message
 * @param {React.ReactNode} children - Input element
 * @param {string} helperText - Text hướng dẫn
 * @param {string} className - Custom classes
 */
const FormGroup = ({ 
  label,
  name,
  required = false,
  error,
  children,
  helperText,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-semibold text-text-primary mb-2"
        >
          {label}
          {required && (
            <span className="text-error ml-1" aria-label="required">*</span>
          )}
        </label>
      )}

      {/* Input/Children */}
      <div className="relative">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              id: name,
              name: name,
              'aria-invalid': error ? 'true' : 'false',
              'aria-describedby': error ? `${name}-error` : helperText ? `${name}-helper` : undefined,
              className: `${child.props.className || ''} ${
                error 
                  ? 'border-error focus:ring-error focus:border-error' 
                  : 'border-border focus:ring-primary-500 focus:border-primary-500'
              }`
            });
          }
          return child;
        })}
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p 
          id={`${name}-helper`}
          className="mt-1.5 text-xs text-text-tertiary"
        >
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p 
          id={`${name}-error`}
          className="mt-1.5 text-xs text-error flex items-center"
          role="alert"
        >
          <svg 
            className="w-4 h-4 mr-1" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormGroup;
