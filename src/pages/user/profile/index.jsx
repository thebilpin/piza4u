import React from "react";
import UserLayout from "../UserLayout";

import useRequireLogin from "@/components/IsLogged/IsLogged";
import { HeadTitle } from "@/components/HeadTitle";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import ProfileView from "@/views/ProfileView";

const Index = () => {
  const isLogged = useRequireLogin();

  if (!isLogged) return null;

  return (
    <div>
      <HeadTitle title={"Profile"} />
      <BreadCrumb />
      <UserLayout>
        <ProfileView />
      </UserLayout>
    </div>
  );
};

export default Index;
