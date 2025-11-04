// Toast.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'top-right',
  showProgress = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [duration, onClose]);

  const positions = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  const types = {
    success: {
      bg: 'bg-accent-green-50 border-accent-green-500',
      text: 'text-accent-green-800',
      icon: (
        <svg className="w-5 h-5 text-accent-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      progressBar: 'bg-accent-green-500',
    },
    error: {
      bg: 'bg-accent-red-50 border-accent-red-500',
      text: 'text-accent-red-800',
      icon: (
        <svg className="w-5 h-5 text-accent-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      progressBar: 'bg-accent-red-500',
    },
    warning: {
      bg: 'bg-orange-50 border-warning',
      text: 'text-orange-800',
      icon: (
        <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      progressBar: 'bg-warning',
    },
    info: {
      bg: 'bg-primary-50 border-primary-500',
      text: 'text-primary-800',
      icon: (
        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      progressBar: 'bg-primary-500',
    },
  };

  const currentType = types[type];

  return (
    <div
      className={`fixed ${positions[position]} z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className={`min-w-[300px] max-w-md rounded-lg border-l-4 ${currentType.bg} shadow-strong overflow-hidden`}>
        <div className="p-4 flex items-start gap-3">
          <div className="flex-shrink-0">{currentType.icon}</div>
          <p className={`flex-1 text-sm font-medium ${currentType.text}`}>{message}</p>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className={`flex-shrink-0 ${currentType.text} hover:opacity-70 transition-opacity`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {showProgress && duration > 0 && (
          <div className="h-1 bg-black/10">
            <div
              className={`h-full transition-all duration-100 ease-linear ${currentType.progressBar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  position: PropTypes.oneOf(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']),
  showProgress: PropTypes.bool,
};

