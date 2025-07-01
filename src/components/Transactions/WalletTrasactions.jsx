import React, { useEffect, useState } from "react";
import { get_transactions } from "@/interceptor/routes";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Chip,
  Skeleton,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import SkeletonTable from "../Skeleton/WalletTransactionsSkeleton";
import WalletTransactionsSkeleton from "../Skeleton/WalletTransactionsSkeleton";

const WalletTransactions = () => {
  const { t } = useTranslation();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Calculate the offset based on the current page
        const offset = (page - 1) * rowsPerPage;

        // Fetch transactions for the current page
        const data = await get_transactions({
          limit: rowsPerPage,
          offset: offset,
          transaction_type: "wallet",
          type: "credit",
        });

        setTransactions(data.data);
        setTotalItems(data.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page]);

  const totalPages = Math.ceil(totalItems / rowsPerPage);

  if (loading) {
    return (
      <div className="wallet-transactions mt-6">
        <WalletTransactionsSkeleton rows={rowsPerPage} columns={5} />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="wallet-transactions p-4">
      <Table
        bordered
        classNames="rounded"
        aria-label="Wallet Transactions Table"
        topContent={
          <h2 className="text-2xl font-semibold mb-4">
            {t("wallet_transactions")}
          </h2>
        }
        bottomContent={
          <div className="flex w-full justify-start mt-4">
            <Pagination
              isCompact
              showControls
              color="primary"
              page={page}
              total={totalPages}
              onChange={(newPage) => setPage(newPage)}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>{t("id")}</TableColumn>
          <TableColumn>{t("message")}</TableColumn>
          <TableColumn>{t("amount")}</TableColumn>
          <TableColumn>{t("status")}</TableColumn>
          <TableColumn>{t("type")}</TableColumn>
          <TableColumn>{t("date")}</TableColumn>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.message}</TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>
                <Chip
                  color={
                    transaction.status === "success" ||
                    transaction.status === "Success"
                      ? "success"
                      : transaction.status === "Pending"
                        ? "warning"
                        : "default"
                  }
                  variant="flat"
                  size="sm"
                >
                  {transaction.status}
                </Chip>
              </TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.date_created}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WalletTransactions;
