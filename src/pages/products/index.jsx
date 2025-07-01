"use client";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { HeadTitle } from "@/components/HeadTitle";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";

const Products = dynamic(() => import("../../views/Products"), {
  ssr: false,
});

const ProductsPage = () => {
  const router = useRouter();

  const getInitialFilterValue = (filterKey) => {
    const value = router.query[filterKey];
    // console.log(`Query value for ${filterKey}:`, value);
    return value ? Number(value) : undefined;
  };

  return (
    <div>
      <HeadTitle title={"Products"} />
      <BreadCrumb />
      <Products
        initialCategoryId={getInitialFilterValue("categoryId")}
        initialCategoryName={router.query.categoryName}
      />
    </div>
  );
};

export default ProductsPage;
