import React from "react";
import UserLayout from "../UserLayout";
import useRequireLogin from "@/components/IsLogged/IsLogged";
import { HeadTitle } from "@/components/HeadTitle";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import MyOrders from "@/views/MyOrders";

const Index = () => {
  const isLogged = useRequireLogin();

  if (!isLogged) return null;

  return (
    <div>
      <HeadTitle title={"My Orders"} />
      <BreadCrumb />
      <UserLayout>
        <MyOrders />
      </UserLayout>
    </div>
  );
};

export default Index;
