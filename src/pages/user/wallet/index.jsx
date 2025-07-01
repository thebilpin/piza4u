import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import WalletView from "@/views/WalletView";
import React from "react";
import UserLayout from "../UserLayout";
import useRequireLogin from "@/components/IsLogged/IsLogged";
import { HeadTitle } from "@/components/HeadTitle";

const Index = () => {
  const isLogged = useRequireLogin();

  if (!isLogged) return null;

  return (
    <div>
      <HeadTitle title={"Wallet"} />
      <BreadCrumb />
      <UserLayout>
        <WalletView />
      </UserLayout>
    </div>
  );
};

export default Index;
