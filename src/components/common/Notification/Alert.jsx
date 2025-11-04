// Alert.jsx
export const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  action,
  className = '',
}) => {
  const types = {
    success: {
      bg: 'bg-accent-green-50 border-accent-green-200',
      titleColor: 'text-accent-green-800',
      textColor: 'text-accent-green-700',
      icon: (
        <svg className="w-5 h-5 text-accent-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-accent-red-50 border-accent-red-200',
      titleColor: 'text-accent-red-800',
      textColor: 'text-accent-red-700',
      icon: (
        <svg className="w-5 h-5 text-accent-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-orange-50 border-orange-200',
      titleColor: 'text-orange-800',
      textColor: 'text-orange-700',
      icon: (
        <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-primary-50 border-primary-200',
      titleColor: 'text-primary-800',
      textColor: 'text-primary-700',
      icon: (
        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const currentType = types[type];

  return (
    <div className={`rounded-lg border ${currentType.bg} p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{currentType.icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold ${currentType.titleColor} mb-1`}>
              {title}
            </h3>
          )}
          {message && (
            <p className={`text-sm ${currentType.textColor}`}>{message}</p>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${currentType.textColor} hover:opacity-70 transition-opacity`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  action: PropTypes.node,
  className: PropTypes.string,
};