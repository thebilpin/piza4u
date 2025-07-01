"use client";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { HeadTitle } from "@/components/HeadTitle";
import Categories from "@/views/categories";
import dynamic from "next/dynamic";
import React from "react";

const Index = () => {
  return (
    <>
      <HeadTitle title={"Categories"} />
      <BreadCrumb />
      <Categories />
    </>
  );
};

export default Index;
