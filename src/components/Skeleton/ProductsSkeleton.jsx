import React from "react";
import { Skeleton, Card, CardHeader, CardBody, CardFooter } from "@heroui/react";

const ProductsSkeleton = ({ count = 12, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Card 
          key={index} 
          isHoverable 
          className="max-w-sm shadow-md transition-shadow rounded-lg"
        >
          <CardHeader className="p-0 relative">
            <Skeleton className="w-full h-52 md:h-60 rounded-t-lg" />
          </CardHeader>
          <CardBody className="p-4 text-center">
            <Skeleton className="w-3/4 h-6 mx-auto mb-3 rounded" />
            <Skeleton className="w-1/2 h-5 mx-auto mb-2 rounded" />
            <Skeleton className="w-1/3 h-4 mx-auto rounded" />
          </CardBody>
          <CardFooter className="p-4 flex justify-center">
            <Skeleton className="w-24 h-10 rounded-lg" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ProductsSkeleton;