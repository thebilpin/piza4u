import React from "react";
import UserLayout from "../UserLayout";
import useRequireLogin from "@/components/IsLogged/IsLogged";
import { HeadTitle } from "@/components/HeadTitle";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import Refer from "@/views/Refer";

const Index = () => {
  const isLogged = useRequireLogin();

  if (!isLogged) return null;

  return (
    <div>
      <HeadTitle title={"Refer"} />
      <BreadCrumb />
      <UserLayout>
        <Refer />
      </UserLayout>
    </div>
  );
};

export default Index;
