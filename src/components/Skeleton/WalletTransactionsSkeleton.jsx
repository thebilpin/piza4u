import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton } from "@heroui/react";
import { useTranslation } from "react-i18next";

const WalletTransactionsSkeleton = ({ rows = 10, columns = 5 }) => {

  return (
    <Table
      bordered
      aria-label="Loading Table"
      classNames="rounded"
      
    >
      <TableHeader>
        {Array.from({ length: columns }).map((_, index) => (
          <TableColumn key={`header-${index}`}>
            <Skeleton className="h-6 w-1/2 rounded-lg" />
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={`row-${rowIndex}`}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                <Skeleton className="h-6 w-3/4 rounded-lg" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default WalletTransactionsSkeleton;
