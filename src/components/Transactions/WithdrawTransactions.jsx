import { get_transactions } from "@/interceptor/routes";
import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Skeleton } from "@heroui/react";
import { useTranslation } from "react-i18next";
import WalletTransactionsSkeleton from "../Skeleton/WalletTransactionsSkeleton";

const WalletWithdrawTransaction = () => {
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
        const offset = (page - 1) * rowsPerPage;

        const data = await get_transactions({
          limit: rowsPerPage,
          offset: offset,
          transaction_type: "wallet",
          type: "debit",
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
    return <div className="text-red-500">{`Error: ${error}`}</div>;
  }

  return (
    <div className="wallet-transactions p-4">
      <Table
        bordered
        aria-label="Wallet Transactions Table"
        classNames="rounded"
        topContent={
          <h2 className="text-2xl font-semibold mb-4">
            {t("withdrawal_transactions")}
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
          <TableColumn>{t("type")}</TableColumn>
          <TableColumn>{t("date")}</TableColumn>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.message}</TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.date_created}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WalletWithdrawTransaction;
