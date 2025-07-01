import AddressView from "@/views/AddressView";
import React from "react";
import UserLayout from "../UserLayout";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import useRequireLogin from "@/components/IsLogged/IsLogged";
import { HeadTitle } from "@/components/HeadTitle";

const Index = () => {
  const isLogged = useRequireLogin();

  if (!isLogged) return null;

  return (
    <div>
      <HeadTitle title={"Addresses"} />

      <BreadCrumb />
      <UserLayout>
        <AddressView />
      </UserLayout>
    </div>
  );
};

export default Index;
