import React from "react";
import { Skeleton, Card, CardBody } from "@heroui/react";

const ProductCardSkeleton = () => {
  return (
    <Card
      className="w-[262px] h-[300px] space-y-5 p-4 gap-4"
      radius="lg"
    >
      <Skeleton className="rounded-lg">
        <div className="h-32 w-52 rounded-lg bg-default-300"></div>
      </Skeleton>
      <div className="space-y-3">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-2/5 rounded-lg">
          <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
      <Skeleton className="w-2/5 rounded-lg">
        <div className="h-10 bg-default-300 rounded-lg"></div>
      </Skeleton>
    </Card>
  );
};

export default ProductCardSkeleton;
