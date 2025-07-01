import React from 'react';
import { 
  Card, 
  Skeleton, 
  Divider 
} from "@heroui/react";

const UserOrderCardSkeleton = () => {
  return (
    <Card className="w-full shadow-lg border border-default-200 rounded">
      <div className="p-4">
        {/* Header Section Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Order ID and Status Skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Skeleton className="w-24 h-6 rounded" />
                <Skeleton className="w-16 h-6 rounded" />
              </div>
              <Skeleton className="w-24 h-8 rounded" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="hidden sm:flex gap-2">
              <Skeleton className="w-24 h-8 rounded" />
              <Skeleton className="w-24 h-8 rounded" />
              <Skeleton className="w-24 h-8 rounded" />
            </div>

            {/* Mobile Dropdown Skeleton */}
            <div className="sm:hidden w-full">
              <Skeleton className="w-full h-10 rounded" />
            </div>
          </div>

          {/* Download Invoice Skeleton */}
          <div className="flex items-center">
            <Skeleton className="w-32 h-6 rounded" />
          </div>
        </div>

        <Divider className="my-4" />

        {/* Order Items Skeleton */}
        <div className="flex flex-col gap-2">
          {[1, 2].map((_, index) => (
            <Skeleton key={index} className="w-full h-6 rounded mb-2" />
          ))}
        </div>

        <Divider className="my-4" />

        {/* Order Details Skeleton */}
        <div className="flex flex-wrap gap-6">
          {['Order date', 'Payment method', 'Total'].map((label, index) => (
            <div key={index} className="flex items-center text-md gap-2">
              <Skeleton className="w-32 h-6 rounded" />
            </div>
          ))}
        </div>

        {/* Delivery Status Card Skeleton */}
        <Card className="mt-4 rounded !border-none bg-gray-300">
          <Skeleton className="w-full h-12 rounded" />
        </Card>
      </div>
    </Card>
  );
};

export default UserOrderCardSkeleton;