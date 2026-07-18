import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DashboardSkeleton = () => {
  return (
    <div className="bg-gray-100 min-h-screen px-4 pt-6 pb-24 sm:px-32 lg:px-34 font-sans">
      {/* Top Bar / Header */}
      <div className="flex items-start justify-between mb-12">
        {/* Centered Header Content */}
        <div className="flex-1 text-center">
          <h1 className="mb-4">
            <Skeleton width="40%" height={48} />
          </h1>
          <p className="mb-8 max-w-3xl mx-auto">
            <Skeleton count={1} height={30} />
          </p>
          <div className="mx-auto">
            <Skeleton width={200} height={50} borderRadius={8} />
          </div>
        </div>

        {/* Right side - UserProfile Skeleton */}
        <div className="flex justify-center md:justify-end ml-4">
          <Skeleton circle width={40} height={40} />
        </div>
      </div>

      {/* Database Summary Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8 border border-gray-200">
        <h2 className="mb-6">
          <Skeleton width={300} height={32} />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-300 transition-all duration-300"
            >
              <div>
                {/* Icon Skeleton */}
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton width={40} height={40} className="mt-3" />
                  <div>
                    <Skeleton width="100%" height={32} className="mb-1" />
                    <Skeleton width="60%" height={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Three Column Layout / Filterable Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
            {/* List Header Skeleton */}
            <div className="bg-gray-100 p-4 sm:p-5 md:p-7 rounded-t-xl mb-4">
              <div className="mb-4">
                <Skeleton width="60%" height={24} className="mb-2" />
                <Skeleton width="40%" height={16} />
              </div>
              <div className="flex gap-2">
                <Skeleton width={80} height={36} borderRadius={6} />
                <Skeleton width={80} height={36} borderRadius={6} />
              </div>
            </div>
            
            {/* List Body Skeleton */}
            <div className="space-y-4 py-3 px-4 sm:px-6 md:px-8 flex-grow">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="grid grid-cols-2 gap-16">
                  <Skeleton width="100%" height={8} borderRadius={4} />
                  <Skeleton width="100%" height={8} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DashboardSkeleton;
