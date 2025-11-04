import React from 'react';

/**
 * Loading Component
 * Display loading spinner with optional text
 * 
 * @param {string} text - Loading text
 * @param {string} size - Spinner size (sm, md, lg, xl)
 * @param {boolean} fullScreen - Show as full screen overlay
 * @param {string} className - Additional CSS classes
 */
const Loading = ({
  text = 'Đang tải...',
  size = 'md',
  fullScreen = false,
  className = '',
}) => {
  // Size mapping
  const sizeStyles = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const spinner = (
    <div
      className={`
        ${sizeStyles[size]}
        border-primary-200 border-t-primary-600
        rounded-full animate-spin
      `}
      role="status"
      aria-label="Loading"
    />
  );

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {spinner}
      {text && (
        <p className={`${textSizeStyles[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Inline spinner (for buttons, etc.)
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-3',
  };

  return (
    <div
      className={`
        ${sizeStyles[size]}
        border-current border-t-transparent
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Loading;
