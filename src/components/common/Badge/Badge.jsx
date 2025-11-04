import React from 'react';
import PropTypes from 'prop-types';
// Badge.jsx
export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'md',
  dot = false,
  outline = false,
  className = '',
}) => {
  const variants = {
    primary: outline 
      ? 'bg-primary-50 text-primary-700 border border-primary-500' 
      : 'bg-primary-500 text-white',
    secondary: outline
      ? 'bg-secondary-50 text-secondary-700 border border-secondary-500'
      : 'bg-secondary-500 text-white',
    success: outline
      ? 'bg-green-50 text-accent-green-700 border border-accent-green-500'
      : 'bg-accent-green-500 text-white',
    danger: outline
      ? 'bg-red-50 text-accent-red-700 border border-accent-red-500'
      : 'bg-accent-red-500 text-white',
    warning: outline
      ? 'bg-orange-50 text-orange-700 border border-warning'
      : 'bg-warning text-white',
    info: outline
      ? 'bg-blue-50 text-primary-700 border border-primary-500'
      : 'bg-info text-white',
    dark: outline
      ? 'bg-neutral-50 text-neutral-700 border border-neutral-700'
      : 'bg-neutral-800 text-white',
    light: 'bg-neutral-100 text-neutral-700',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const roundedSizes = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const dotColors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-accent-green-500',
    danger: 'bg-accent-red-500',
    warning: 'bg-warning',
    info: 'bg-info',
    dark: 'bg-neutral-800',
    light: 'bg-neutral-400',
  };

  return (
    <span
      className={`inline-flex items-center font-medium ${variants[variant]} ${sizes[size]} ${roundedSizes[rounded]} ${className}`}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-full mr-1.5 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark', 'light']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'full']),
  dot: PropTypes.bool,
  outline: PropTypes.bool,
  className: PropTypes.string,
};