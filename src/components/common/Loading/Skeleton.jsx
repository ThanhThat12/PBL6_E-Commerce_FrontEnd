// Skeleton.jsx
export const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  variant = 'text',
  className = '',
  count = 1,
  circle = false,
}) => {
  const variants = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  const skeletonClass = circle ? 'rounded-full' : variants[variant];

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`animate-pulse bg-neutral-200 ${skeletonClass} ${className}`}
      style={{ 
        width: circle ? height : width, 
        height,
        marginBottom: count > 1 ? '0.5rem' : 0 
      }}
    />
  ));

  return count > 1 ? <div>{skeletons}</div> : skeletons[0];
};

Skeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  variant: PropTypes.oneOf(['text', 'rectangular', 'circular']),
  className: PropTypes.string,
  count: PropTypes.number,
  circle: PropTypes.bool,
};