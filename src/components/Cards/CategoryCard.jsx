import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";

const CategoryCard = ({ category }) => {
  const router = useRouter();

  return (
    <div
      className="flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-105"
      onClick={() => router.push(`/categories/${category.slug}`)}
      aria-label={`View category: ${category.name}`}
    >
      {/* Image Container */}
      <div className="relative w-16 h-16 sm:w-24 sm:h-24 p-3 sm:p-4 bg-gray-100 rounded-full shadow-sm">
        <Image
          src={category.image}
          alt={category.name}
          layout="fill"
          objectFit="contain"
          className="rounded-full"
        />
      </div>

      {/* Category Name */}
      <p className="font-medium mt-2 sm:mt-3 text-sm sm:text-md truncate max-w-[150px] overflow-hidden" title={category.name}>
        {category.name}
      </p>
    </div>
  );
};

export default CategoryCard;
