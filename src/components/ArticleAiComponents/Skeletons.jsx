import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const SidebarSkeleton = () => {
  return (
    <div className="space-y-4 px-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton circle width={32} height={32} />
          <div className="flex-1">
            <Skeleton width="80%" height={16} />
            <Skeleton width="40%" height={10} style={{ marginTop: "4px" }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChatAreaSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* AI Message Skeleton */}
      <div className="flex gap-4">
        <Skeleton circle width={40} height={40} />
        <div className="flex-1">
          <Skeleton count={3} width="90%" />
        </div>
      </div>

      {/* User Message Skeleton */}
      <div className="flex flex-row-reverse gap-4">
        <Skeleton circle width={40} height={40} />
        <div className="flex-1 flex flex-col items-end">
          <Skeleton width="60%" height={40} borderRadius={12} />
        </div>
      </div>

      {/* Another AI Message Skeleton */}
      <div className="flex gap-4">
        <Skeleton circle width={40} height={40} />
        <div className="flex-1">
          <Skeleton count={5} width="95%" />
        </div>
      </div>
    </div>
  );
};
