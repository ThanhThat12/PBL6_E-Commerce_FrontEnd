import React from 'react';

/**
 * Button Component
 * Reusable button with multiple variants and sizes
 * 
 * @param {ReactNode} children - Button content
 * @param {string} variant - Button style (primary, secondary, outline, ghost, danger)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Is disabled
 * @param {boolean} fullWidth - Full width button
 * @param {ReactNode} icon - Icon component
 * @param {string} iconPosition - Icon position (left, right)
 * @param {function} onClick - Click handler
 * @param {string} type - Button type (button, submit, reset)
 * @param {string} className - Additional CSS classes
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-300 ease-in-out outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:ring-4 active:scale-[0.98]
  `;

  // Variant styles
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600 text-white
      hover:from-primary-600 hover:to-primary-700
      shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/60
      focus:ring-primary-200
    `,
    secondary: `
      bg-gradient-to-r from-secondary-500 to-secondary-600 text-white
      hover:from-secondary-600 hover:to-secondary-700
      shadow-lg shadow-secondary-500/50 hover:shadow-xl hover:shadow-secondary-500/60
      focus:ring-secondary-200
    `,
    outline: `
      border-2 border-primary-500 text-primary-600 bg-transparent
      hover:bg-primary-50 hover:border-primary-600
      focus:ring-primary-200
    `,
    ghost: `
      text-primary-600 bg-transparent
      hover:bg-primary-50
      focus:ring-primary-200
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 text-white
      hover:from-red-600 hover:to-red-700
      shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60
      focus:ring-red-200
    `,
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';

  // Combine styles
  const buttonStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyle}
    ${className}
  `;

  // Loading spinner
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonStyles}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && <LoadingSpinner />}

      {/* Left Icon */}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}

      {/* Button Text */}
      {children}

      {/* Right Icon */}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
    </button>
  );
};

export default Button;
