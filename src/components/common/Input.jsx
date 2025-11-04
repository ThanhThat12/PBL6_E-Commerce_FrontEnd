import React, { useState, forwardRef } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

/**
 * Input Component
 * Reusable input field with validation, icons, and password toggle
 * 
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} label - Input label
 * @param {string} name - Input name
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {function} onBlur - Blur handler
 * @param {string} error - Error message
 * @param {string} placeholder - Placeholder text
 * @param {ReactNode} icon - Left icon
 * @param {boolean} required - Is required field
 * @param {boolean} disabled - Is disabled
 * @param {string} className - Additional CSS classes
 */
const Input = forwardRef(({
  type = 'text',
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  icon: Icon,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full py-2.5 rounded-lg border transition-all duration-200
            ${Icon ? 'pl-12 pr-4' : 'pl-4 pr-4'}
            ${isPassword && !Icon ? 'pr-12' : isPassword && Icon ? 'pr-12' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
              : isFocused
                ? 'border-primary-500 ring-2 ring-primary-200'
                : 'border-gray-300 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
            }
            ${disabled 
              ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
              : 'bg-white text-gray-900'
            }
            outline-none
          `}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? (
              <FiEyeOff className="w-5 h-5" />
            ) : (
              <FiEye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-sm" role="alert">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
