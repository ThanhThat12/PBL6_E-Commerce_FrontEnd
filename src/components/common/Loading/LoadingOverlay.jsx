// LoadingOverlay.jsx
export const LoadingOverlay = ({ 
  isLoading, 
  message = 'Đang tải...', 
  blur = true,
  children 
}) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      <div className={blur ? 'blur-sm pointer-events-none' : 'pointer-events-none opacity-50'}>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-50">
        <Spinner size="lg" />
        {message && (
          <p className="mt-4 text-text-secondary font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

LoadingOverlay.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  message: PropTypes.string,
  blur: PropTypes.bool,
  children: PropTypes.node,
};