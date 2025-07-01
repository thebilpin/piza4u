import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { HeadTitle } from "@/components/HeadTitle";
import FeatureProducts from "@/views/FeatureProducts";

const Index = () => {
  


  return (
    <div>

      <HeadTitle title={"Feature Products"}/>
      <BreadCrumb />
      
      <FeatureProducts  />
    </div>
  );
};

export default Index;
