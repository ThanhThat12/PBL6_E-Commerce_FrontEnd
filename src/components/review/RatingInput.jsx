import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

/**
 * RatingInput Component
 * Interactive star rating selector with hover feedback
 * 
 * @param {number} value - Current rating value (1-5)
 * @param {function} onChange - Callback when rating changes
 * @param {boolean} disabled - Disable interaction
 * @param {string} size - Star size (sm, md, lg)
 * @param {boolean} showLabel - Show feedback text
 */
const RatingInput = ({ 
  value = 0, 
  onChange, 
  disabled = false, 
  size = 'md',
  showLabel = true 
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const labels = {
    1: 'Không hài lòng',
    2: 'Bình thường', 
    3: 'Hài lòng',
    4: 'Rất hài lòng',
    5: 'Tuyệt vời'
  };

  const sizeStyles = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const containerStyles = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  };

  const handleClick = (rating) => {
    if (!disabled && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!disabled) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex flex-col items-start">
      <div 
        className={`flex items-center ${containerStyles[size]}`}
        onMouseLeave={handleMouseLeave}
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          const isFilled = rating <= displayValue;
          
          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              disabled={disabled}
              className={`
                ${sizeStyles[size]} 
                transition-all duration-150 ease-out
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1
                rounded-sm
                ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                ${isFilled ? 'text-yellow-400' : 'text-gray-300'}
                ${!disabled && 'hover:scale-110'}
              `}
              role="radio"
              aria-checked={value === rating}
              aria-label={`${rating} sao - ${labels[rating]}`}
            >
              <FiStar 
                className={`w-full h-full transition-colors ${isFilled ? 'fill-current' : ''}`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && displayValue > 0 && (
        <span 
          className={`
            mt-2 text-sm font-medium transition-all duration-200
            ${displayValue >= 4 ? 'text-green-600' : displayValue >= 3 ? 'text-yellow-600' : 'text-orange-600'}
          `}
        >
          {labels[displayValue]}
        </span>
      )}
    </div>
  );
};

export default RatingInput;
