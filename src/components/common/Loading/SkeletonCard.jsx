// SkeletonCard.jsx - Bonus component for common use case
export const SkeletonCard = () => (
  <div className="border border-border-light rounded-lg p-4 space-y-4">
    <Skeleton variant="rectangular" height="12rem" />
    <div className="space-y-2">
      <Skeleton width="60%" height="1.5rem" />
      <Skeleton width="100%" height="1rem" count={2} />
      <div className="flex gap-2 mt-4">
        <Skeleton width="5rem" height="2.5rem" variant="rectangular" />
        <Skeleton width="5rem" height="2.5rem" variant="rectangular" />
      </div>
    </div>
  </div>
);