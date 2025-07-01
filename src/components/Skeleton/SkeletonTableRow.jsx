import React from "react";
import { Skeleton } from "@heroui/react";

const SkeletonTableRow = ({ columns }) => {
  return (
    <tr>
      {columns.map((_, index) => (
        <td key={index}>
          <Skeleton className="h-6 rounded-lg" />
        </td>
      ))}
    </tr>
  );
};

export default SkeletonTableRow;
