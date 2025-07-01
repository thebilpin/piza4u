import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Chip,
  CardHeader,
  CardBody,
  Avatar,
  Tabs,
  Tab,
} from "@heroui/react";
import { getUserData } from "@/events/getters";
import {
  setPaymentSettings,
  setError,
  setUserData,
} from "@/store/reducers/paymentSettingsSlice";
import { toast } from "sonner";
import WalletTransactions from "@/components/Transactions/WalletTrasactions";
import WalletWithdrawTransaction from "@/components/Transactions/WithdrawTransactions";
import WithDrawModal from "@/components/Modals/WithDrawModal";
import dynamic from "next/dynamic";

//  icons

import {
  RiWallet3Line,
  RiBankCardLine,
  RiArrowUpLine,
  RiCloseCircleFill,
  RiCheckFill,
  RiCollapseHorizontalLine,
  RiCurrencyLine,
} from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { updateWalletBalance } from "@/events/actions";
import { formatPrice } from "@/helpers/functionHelper";

const WalletRechargeModal = dynamic(
  () => import("@/components/Modals/WalletRechargeModal"),
  {
    ssr: false,
  }
);

const WalletView = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.paymentSettings?.userData);
  const { t } = useTranslation();

  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    updateWalletBalance();
  }, []);

  const prefillData = useSelector((state) => state.authentication.userData);

  const imageFromRedux = useSelector(
    (state) => state.authentication.userData.image
  );

  return (
    <div className="min-h-screen p-0">
      <div className="max-w-full mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-lg">
            <CardHeader className="flex justify-between items-center p-5">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <RiWallet3Line className="text-primary" size={28} />
                {t("wallet_management")}
              </h1>
            </CardHeader>
            <div className="grid md:grid-cols-2 gap-4 p-5">
              <Card
                isPressable
                className="p-4 bg-wallet-recharge border border-wallet-recharge/50 hover:shadow-lg transition-all duration-300 rounded-xl group"
                onPress={() => setIsRechargeModalOpen(true)}
              >
                <CardBody className="flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-wallet-recharge-text">
                        {t("recharge_wallet")}
                      </h3>
                      <p className="text-wallet-recharge-text/70 text-xs mt-1">
                        {t("add_funds")}
                      </p>
                    </div>
                    <div className="bg-wallet-recharge-icon/10 rounded-full p-2 transition-all group-hover:bg-wallet-recharge-icon/20">
                      <RiBankCardLine
                        className="text-wallet-recharge-icon"
                        size={24}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-wallet-recharge-text/50">
                      {t("quick_recharge")}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-wallet-recharge-icon opacity-70 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </CardBody>
              </Card>

              <Card
                isPressable
                className="p-4 bg-wallet-withdraw border border-wallet-withdraw/50 hover:shadow-lg transition-all duration-300 rounded-xl group"
                onPress={() => setIsOpen(true)}
              >
                <CardBody className="flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-wallet-withdraw-text">
                        {t("withdraw_funds")}
                      </h3>
                      <p className="text-wallet-withdraw-text/70 text-xs mt-1">
                        {t("transfer_money_out")}
                      </p>
                    </div>
                    <div className="bg-wallet-withdraw-icon/10 rounded-full p-2 transition-all group-hover:bg-wallet-withdraw-icon/20">
                      <RiArrowUpLine
                        className="text-wallet-withdraw-icon"
                        size={24}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-wallet-withdraw-text/50">
                      {t("quick_withdraw")}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-wallet-withdraw-icon opacity-70 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Card>

          <Card className="rounded-lg relative overflow-hidden">
            {/* Waving Lines Background */}
            <div className="absolute top-0 left-0 w-full h-20 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 400 100"
                className="w-full h-full text-gray-300"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 50 C50 10, 150 90, 200 50 C250 10, 350 90, 400 50"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  fill="none"
                />
                <path
                  d="M0 70 C50 30, 150 110, 200 70 C250 30, 350 110, 400 70"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  fill="none"
                />
                <path
                  d="M0 90 C50 50, 150 130, 200 90 C250 50, 350 130, 400 90"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  fill="none"
                />
              </svg>
            </div>

            <CardHeader className="relative flex flex-col items-center p-5 z-10">
              <div className="w-16 h-16 mb-3">
                <Avatar
                  src={imageFromRedux} 
                  size="md"
                  className="w-16 h-16 text-medium"
                />
              </div>

              <h2 className="text-lg font-bold mb-1">{user?.email}</h2>
              <p className="text-sm">
                +{user?.country_code} {user?.mobile}
              </p>
            </CardHeader>

            <CardBody className="relative p-5 z-10">
              <div className="flex justify-between mb-3">
                <span className="text-md">{t("current_balance")}</span>
                <span className="font-bold text-primary-600 text-base">
                  {user?.balance ? formatPrice(Number(user.balance)) : "0.00"}
                </span>
              </div>
              {/* Account Status */}
              {/* <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {t("account_status")}
                </span>
                
                <Chip
                  color={user?.active === "1" ? "success" : "danger"}
                  variant="flat"
                  size="sm"
                >
                  {user?.active === "1" ? (
                    <div className="flex items-center gap-1">
                      <RiCheckFill size={14} /> {t("active")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <RiCloseCircleFill size={14} /> {t("inactive")}
                    </div>
                  )}
                </Chip>
              </div> */}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6 max-w-full mx-auto relative">
        <Card className="rounded relative">
          {/* SVG Background */}
          <div className="absolute top-[-10px] left-0  w-full h-20 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 400 100"
              className="w-full h-full text-gray-300"
              preserveAspectRatio="none"
            >
              <path
                d="M0 50 C50 10, 150 90, 200 50 C250 10, 350 90, 400 50"
                stroke="currentColor"
                strokeWidth="0.8"
                fill="none"
              />
              <path
                d="M0 70 C50 30, 150 110, 200 70 C250 30, 350 110, 400 70"
                stroke="currentColor"
                strokeWidth="0.8"
                fill="none"
              />
              <path
                d="M0 90 C50 50, 150 130, 200 90 C250 50, 350 130, 400 90"
                stroke="currentColor"
                strokeWidth="0.8"
                fill="none"
              />
            </svg>
          </div>

          <Tabs
            aria-label="Wallet Activity Tabs"
            variant="solid"
            color="default"
            onSelectionChange={(key) => setActiveTab(key)}
            selectedKey={activeTab}
            className="p-6 flex justify-center relative z-10"
          >
            <Tab
              className="font-semibold"
              key="transactions"
              title={
                <div className="flex items-center space-x-2">
                  <RiCollapseHorizontalLine />
                  <span>{t("wallet_transactions")}</span>
                </div>
              }
            >
              {activeTab === "transactions" && <WalletTransactions />}
            </Tab>
            <Tab
              className="font-semibold"
              key="withdrawals"
              title={
                <div className="flex items-center space-x-2">
                  <RiCurrencyLine />
                  <span>{t("withdraw_transactions")}</span>
                </div>
              }
            >
              {activeTab === "withdrawals" && <WalletWithdrawTransaction />}
            </Tab>
          </Tabs>
        </Card>
      </div>

      <WalletRechargeModal
        isOpen={isRechargeModalOpen}
        onOpenChange={setIsRechargeModalOpen}
      />

      <WithDrawModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
};

export default WalletView;
