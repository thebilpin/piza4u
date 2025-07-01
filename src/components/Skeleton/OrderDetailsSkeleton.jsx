import React from 'react';
import { Skeleton } from "@heroui/react";
import { Card, CardHeader, CardBody } from "@heroui/react";

// Skeleton for Order Header
const OrderHeaderSkeleton = () => (
  <Card className="rounded">
    <CardHeader className="flex justify-between items-center">
      <div className="w-full space-y-2">
        <Skeleton className="h-8 w-1/2 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
    </CardHeader>
  </Card>
);

// Skeleton for Order Items
const OrderItemsSkeleton = () => (
  <Card className="rounded">
    <CardHeader>
      <Skeleton className="h-6 w-1/4 rounded" />
    </CardHeader>
    <CardBody>
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div key={item} className="flex gap-4 border-b border-t border-gray-200 py-4">
            <Skeleton className="w-24 h-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/2 rounded" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-1/4 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
                <Skeleton className="h-4 w-1/4 rounded" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded" />
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

// Skeleton for Rider Information
const RiderInformationSkeleton = () => (
  <Card className="rounded">
    <CardHeader>
      <Skeleton className="h-6 w-1/4 rounded" />
    </CardHeader>
    <CardBody>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-6 w-48 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded" />
        </div>
      </div>
    </CardBody>
  </Card>
);

// Skeleton for Delivery Details
const DeliveryDetailsSkeleton = () => (
  <Card className="rounded">
    <CardHeader>
      <Skeleton className="h-6 w-1/4 rounded" />
    </CardHeader>
    <CardBody>
      <div className="p-4 rounded-lg space-y-3">
        <Skeleton className="h-12 w-full rounded" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
      </div>
    </CardBody>
  </Card>
);

// Skeleton for Payment Summary
const PaymentSummarySkeleton = () => (
  <Card className="rounded">
    <CardHeader>
      <Skeleton className="h-6 w-1/4 rounded" />
    </CardHeader>
    <CardBody>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex justify-between">
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-4 w-1/4 rounded" />
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

// Main Skeleton Component
const OrderDetailsSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Column */}
      <div className="w-full lg:w-2/3 space-y-6">
        <OrderHeaderSkeleton />
        <OrderItemsSkeleton />
        <RiderInformationSkeleton />
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/3 space-y-6">
        <DeliveryDetailsSkeleton />
        <PaymentSummarySkeleton />
      </div>
    </div>
  );
};

export default OrderDetailsSkeleton;