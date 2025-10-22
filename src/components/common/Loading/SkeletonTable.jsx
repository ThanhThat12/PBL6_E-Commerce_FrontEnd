// SkeletonTable.jsx - Bonus for table loading
export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: columns }, (_, j) => (
          <Skeleton key={j} width="100%" height="3rem" />
        ))}
      </div>
    ))}
  </div>
);