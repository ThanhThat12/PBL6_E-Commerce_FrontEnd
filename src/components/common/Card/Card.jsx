// Card.jsx
import React from 'react';
import PropTypes from 'prop-types';

export const Card = ({
  children,
  title,
  subtitle,
  header,
  footer,
  image,
  imageAlt = '',
  hoverable = false,
  bordered = true,
  shadow = 'soft',
  padding = 'md',
  className = '',
  onClick,
}) => {
  const shadows = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const borderClass = bordered ? 'border border-border-light' : '';
  const hoverClass = hoverable ? 'hover:shadow-medium hover:-translate-y-1 cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`bg-white rounded-lg ${borderClass} ${shadows[shadow]} ${hoverClass} ${clickableClass} transition-all duration-200 overflow-hidden ${className}`}
      onClick={onClick}
    >
      {/* Image */}
      {image && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={image} 
            alt={imageAlt} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Custom Header */}
      {header && <div className="border-b border-border-light">{header}</div>}

      {/* Content */}
      <div className={paddings[padding]}>
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-border-light px-4 py-3 bg-background-secondary">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  header: PropTypes.node,
  footer: PropTypes.node,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  hoverable: PropTypes.bool,
  bordered: PropTypes.bool,
  shadow: PropTypes.oneOf(['none', 'soft', 'medium', 'strong']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

