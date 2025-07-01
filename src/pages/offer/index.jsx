import React from "react";
import { HeadTitle } from "@/components/HeadTitle";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import OfferView from "@/views/OfferView";

const index = () => {
  return (
    <div>
      <HeadTitle title={"Offer"}/>
      <BreadCrumb />
      <OfferView />
    </div>
  );
};

export default index;
