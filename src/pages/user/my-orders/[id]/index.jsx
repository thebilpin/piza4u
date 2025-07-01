import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import UserLayout from "../../UserLayout";
import useRequireLogin from "@/components/IsLogged/IsLogged";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import OrderDetails from "@/views/OrderDetails";

const Index = () => {
  const [id, setID] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (router.query.id && router.query.id != 0) {
      setID(router.query.id);
    }
  }, [router.query.id]);

  const isLogged = useRequireLogin();

  if (!isLogged) return null;

  return (
    <div>
      <BreadCrumb/>
      <UserLayout>
        {id != 0 && <OrderDetails queryConstants={{ id: id }} />}
      </UserLayout>
    </div>
  );
};

export default Index;
