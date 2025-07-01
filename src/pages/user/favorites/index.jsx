import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import React from "react";
import UserLayout from "../UserLayout";
import Favorites from "@/views/Favorites";
import useRequireLogin from "@/components/IsLogged/IsLogged";
import { HeadTitle } from "@/components/HeadTitle";

const Index = () => {
  const isLogged = useRequireLogin();

  if (!isLogged) return null;

  return (
    <div>
      <HeadTitle title={"Favorites"} />
      <BreadCrumb />

      <UserLayout>
        <Favorites />
      </UserLayout>
    </div>
  );
};

export default Index;
