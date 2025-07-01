"use client";
import { Image, Skeleton } from "@heroui/react";
import React, { useEffect, useState } from "react";
import api, { get_categories } from "../interceptor/routes";
import { getBranchId } from "../events/getters";
import CategoryCards from "@/components/Cards/CategoryCards";

const Categories = () => {
  const [result, setResult] = useState([]);
  const limit = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formData = new FormData();
        formData.append("branch_id", getBranchId());
        formData.append("limit", limit);
        formData.append("offset", 0);

        const response = await api.post("/get_categories", formData);
        const data = response.data.data;
        setResult(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {!result.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
          {Array.from({ length: limit }).map((_, index) => (
            <div
              key={index}
              className="p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-center h-28 w-28 md:h-44 md:w-44 overflow-hidden rounded-lg bg-gray-100">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
              <div className="mt-2">
                <Skeleton className="w-3/4 h-6 mx-auto rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-2">
          {result.map((item, index) => (
            <CategoryCards
              key={index}
              image={item.image}
              title={item.name}
              count={item.count}
              slug={item.slug}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Categories;
