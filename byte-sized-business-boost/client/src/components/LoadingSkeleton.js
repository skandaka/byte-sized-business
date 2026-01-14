/**
 * Loading Skeleton Component
 * Professional loading placeholders that show content structure
 */

import React from 'react';

// Keyframe animation for shimmer effect
const shimmerStyle = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

const SkeletonBox = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)', mb = '0.5rem' }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      marginBottom: mb,
      background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%)',
      backgroundSize: '2000px 100%',
      animation: 'shimmer 2s infinite linear',
    }}
  />
);

export function BusinessCardSkeleton() {
  return (
    <div className="card" style={{ height: '100%' }}>
      {/* Image skeleton */}
      <SkeletonBox width="100%" height="200px" mb="1rem" />

      {/* Title and category */}
      <div className="flex justify-between items-start mb-2">
        <SkeletonBox width="60%" height="24px" />
        <SkeletonBox width="25%" height="24px" />
      </div>

      {/* Description */}
      <SkeletonBox width="100%" height="16px" mb="0.25rem" />
      <SkeletonBox width="80%" height="16px" mb="1rem" />

      {/* Rating */}
      <div className="flex items-center gap-1 mb-2">
        <SkeletonBox width="100px" height="20px" />
        <SkeletonBox width="80px" height="20px" />
      </div>
    </div>
  );
}

export function DealCardSkeleton() {
  return (
    <div className="card p-3">
      {/* Title */}
      <SkeletonBox width="70%" height="24px" mb="1rem" />

      {/* Business name */}
      <SkeletonBox width="50%" height="16px" mb="1rem" />

      {/* Description */}
      <SkeletonBox width="100%" height="16px" mb="0.25rem" />
      <SkeletonBox width="90%" height="16px" mb="1rem" />

      {/* Timer box */}
      <SkeletonBox width="100%" height="80px" mb="1rem" />

      {/* Button */}
      <SkeletonBox width="100%" height="40px" />
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="card p-3 mb-3">
      <div className="flex justify-between items-start mb-2">
        <SkeletonBox width="30%" height="20px" />
        <SkeletonBox width="100px" height="20px" />
      </div>
      <SkeletonBox width="100%" height="16px" mb="0.25rem" />
      <SkeletonBox width="85%" height="16px" mb="0.25rem" />
      <SkeletonBox width="60%" height="16px" />
    </div>
  );
}

export function ListSkeleton({ count = 3, type = 'business' }) {
  const SkeletonComponent = type === 'business' ? BusinessCardSkeleton :
                           type === 'deal' ? DealCardSkeleton :
                           ReviewSkeleton;

  return (
    <>
      <style>{shimmerStyle}</style>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonComponent key={index} />
        ))}
      </div>
    </>
  );
}

export default SkeletonBox;
