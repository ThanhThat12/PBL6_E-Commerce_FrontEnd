import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({
  trigger,
  children,
  items = [],
  position = 'bottom-left',
  className = '',
  menuClassName = '',
  closeOnClick = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const positions = {
    'top-left': 'bottom-full right-0 mb-2',
    'top-right': 'bottom-full left-0 mb-2',
    'bottom-left': 'top-full right-0 mt-2',
    'bottom-right': 'top-full left-0 mt-2',
    left: 'right-full top-0 mr-2',
    right: 'left-full top-0 ml-2',
  };

  const handleItemClick = (item) => {
    if (item.onClick) item.onClick();
    if (closeOnClick) setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${positions[position]} z-50 min-w-[12rem] bg-white border border-border-light rounded-lg shadow-strong py-1 ${menuClassName}`}
        >
          {/* Custom Children (optional) */}
          {children}

          {/* Menu Items */}
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-1 border-t border-border-light"
                />
              );
            }

            if (item.label) {
              return (
                <div
                  key={`label-${index}`}
                  className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider"
                >
                  {item.label}
                </div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  children: PropTypes.node,
  items: PropTypes.array,
  position: PropTypes.string,
  className: PropTypes.string,
  menuClassName: PropTypes.string,
  closeOnClick: PropTypes.bool,
};

export default Dropdown;
